import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CompareView from '@/components/CompareView';
import { llmOnly } from '@/lib/agent/loop';

export const dynamic = 'force-dynamic';

export default async function Compare({ params }) {
  const plan = await prisma.plan.findUnique({
    where: { shareSlug: params.slug },
    include: { profile: { include: { entities: true } } }
  });
  if (!plan) notFound();

  let llmOnlyJson = plan.llmOnlyJson;
  if (!llmOnlyJson || !llmOnlyJson.items?.length) {
    const entities = plan.profile?.entities || [];
    try {
      const generated = await llmOnly({ entities, destination: plan.destination });
      if (generated && generated.items?.length) {
        llmOnlyJson = generated;
        await prisma.plan.update({
          where: { id: plan.id },
          data: { llmOnlyJson: generated }
        });
      }
    } catch (e) {
      console.error('Failed on-demand llmOnly in compare page:', e.message);
    }
  }

  const evMap = Object.fromEntries((plan.evidenceJson || []).map(e => [e.id, e]));

  return (
    <main>
      <a href={`/plan/${plan.shareSlug}`}>← Back to plan</a>
      <h1>LLM-only vs Qloo: {plan.destination}</h1>
      <CompareView
        slug={plan.shareSlug}
        plan={plan.resultJson}
        llm={llmOnlyJson?.items}
        evMap={evMap}
      />
    </main>
  );
}

