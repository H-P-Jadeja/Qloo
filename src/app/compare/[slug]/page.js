import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CompareView from '@/components/CompareView';
export const dynamic = 'force-dynamic';
export default async function Compare({ params }) {
  const plan = await prisma.plan.findUnique({ where: { shareSlug: params.slug } }); if (!plan) notFound();
  return (<main><a href={`/plan/${plan.shareSlug}`}>← Back to plan</a><h1>LLM-only vs Qloo: {plan.destination}</h1>
    <CompareView plan={plan.resultJson} llm={plan.llmOnlyJson?.items} evMap={Object.fromEntries(plan.evidenceJson.map(e => [e.id, e]))} /></main>);
}
