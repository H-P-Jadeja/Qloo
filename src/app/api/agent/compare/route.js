import { prisma } from '@/lib/prisma';
import { llmOnly } from '@/lib/agent/loop';

export async function POST(req) {
  try {
    const { slug } = await req.json().catch(() => ({}));
    if (!slug) return Response.json({ error: 'Missing slug' }, { status: 400 });

    const plan = await prisma.plan.findUnique({
      where: { shareSlug: slug },
      include: { profile: { include: { entities: true } } }
    });
    if (!plan) return Response.json({ error: 'Plan not found' }, { status: 404 });

    const entities = plan.profile?.entities || [];
    const llmOnlyJson = await llmOnly({ entities, destination: plan.destination });
    if (!llmOnlyJson || !llmOnlyJson.items?.length) {
      return Response.json({ error: 'Failed to generate plain LLM recommendations. Please check LLM_API_KEY and model configuration.' }, { status: 502 });
    }

    await prisma.plan.update({
      where: { id: plan.id },
      data: { llmOnlyJson }
    });

    return Response.json({ ok: true, items: llmOnlyJson.items });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
