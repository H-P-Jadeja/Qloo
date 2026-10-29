import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { runAgent, llmOnly } from '@/lib/agent/loop';
export const maxDuration = 60;
const hits = new Map(); // naive per-IP limit: 5 runs / 10 min
const Body = z.object({
  destination: z.string().min(2).max(80),
  homeCity: z.string().max(80).optional(),
  entities: z.array(z.object({
    qlooId: z.string(),
    name: z.string(),
    type: z.string(),
    imageUrl: z.string().nullable().optional(),
  })).min(1).max(30),
});

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || 'local', now = Date.now();
  const isLocal = ip === 'local' || ip === '::1' || ip === '127.0.0.1';
  const recent = (hits.get(ip) || []).filter(t => now - t < 600000);
  if (!isLocal && recent.length >= 5) return Response.json({ error: 'Rate limit: try again in a few minutes.' }, { status: 429 });
  hits.set(ip, [...recent, now]);

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: 'Invalid input' }, { status: 400 });

  const { destination, homeCity, entities } = parsed.data, enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(c) {
      const send = o => c.enqueue(enc.encode(JSON.stringify(o) + '\n'));
      try {
        const sampleNames = entities.slice(0, 3).map(e => e.name).join(', ') + (entities.length > 3 ? ` (+${entities.length - 3} more)` : '');
        send({ step: `🧬 Mapping cultural fingerprint: analyzing affinities for ${sampleNames}...` });

        const [{ plan, evidence }, llmOnlyJson] = await Promise.all([
          runAgent({ entities, destination, onStep: s => send({ step: s }) }),
          llmOnly({ entities, destination }),
        ]);

        send({ step: `📍 Plotting places on the map for ${destination}...` });
        send({ step: `✨ Assembling your grounded Taste Map for ${destination}...` });

        const slug = Math.random().toString(36).slice(2, 10);
        await prisma.plan.create({
          data: {
            shareSlug: slug,
            destination,
            resultJson: plan,
            evidenceJson: evidence,
            llmOnlyJson: llmOnlyJson ?? undefined,
            profile: {
              create: {
                homeCity,
                entities: { create: entities },
              },
            },
          },
        });
        send({ slug });
      } catch (e) {
        console.error(e.message);
        send({ error: e.message });
      }
      c.close();
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson' } });
}
