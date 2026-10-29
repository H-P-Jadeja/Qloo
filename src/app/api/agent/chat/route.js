export const dynamic = 'force-dynamic';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { chat, llmEnabled } from '@/lib/llm';
import { searchTags } from '@/lib/qloo/tags';
import { getRecommendations } from '@/lib/qloo/insights';
import { SECTIONS } from '@/lib/qloo/types';
const Body = z.object({ slug: z.string(), message: z.string().min(2).max(200) });

export async function POST(req) {
  const p = Body.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return Response.json({ error: 'Invalid input' }, { status: 400 });
  const plan = await prisma.plan.findUnique({ where: { shareSlug: p.data.slug }, include: { profile: { include: { entities: true } } } });
  if (!plan) return Response.json({ error: 'Plan not found' }, { status: 404 });
  try {
    // 1) turn the request into Qloo tag keywords + a target section
    let ask = { tags: [p.data.message], section: 'eat' };
    if (llmEnabled()) {
      try { const m = await chat([{ role: 'system', content: 'Convert the user request into Qloo taste tag keywords. Reply ONLY JSON {"tags":["quiet","cheap"],"section":"eat|listen|shop|watch|hood"}' }, { role: 'user', content: p.data.message }]);
        ask = JSON.parse(m.content.replace(/```json|```/g, '').trim()); } catch {}
    }
    const sec = SECTIONS.find(s => s.key === ask.section) || SECTIONS[0];
    // 2) resolve tags, 3) re-query Qloo with them as extra signals
    const tags = (await Promise.all((ask.tags || []).slice(0, 3).map(t => searchTags(t)))).map(r => r[0]).filter(Boolean);
    const args = { entityIds: plan.profile.entities.map(e => e.qlooId), tagIds: tags.map(t => t.id), entityType: sec.type, location: plan.destination };
    const out = await getRecommendations(args);
    if (!out.results.length) return Response.json({ error: 'Qloo returned nothing for that. Try different wording.' }, { status: 404 });
    const ev = [...plan.evidenceJson, { id: `e${plan.evidenceJson.length + 1}`, tool: 'get_recommendations', args, request: out.request, count: out.results.length, refinedBy: tags.map(t => t.name) }];
    const evId = ev[ev.length - 1].id;
    const picks = out.results.map(r => ({ qlooId: r.id, name: r.name, image: r.image, tags: r.tags, evidenceId: evId, reason: `Refined for "${p.data.message}" (Qloo tags: ${tags.map(t => t.name).join(', ') || 'none matched'}).` }));
    const res = plan.resultJson, i = res.sections.findIndex(s => s.key === sec.key);
    if (i >= 0) res.sections[i].picks = picks; else res.sections.push({ key: sec.key, title: sec.title, picks });
    await prisma.plan.update({ where: { id: plan.id }, data: { resultJson: res, evidenceJson: ev } });
    return Response.json({ ok: true, section: sec.title });
  } catch (e) { return Response.json({ error: e.message }, { status: 502 }); }
}
