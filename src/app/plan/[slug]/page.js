import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PlanDetailView from '@/components/PlanDetailView';

export const dynamic = 'force-dynamic';

export default async function PlanPage({ params }) {
  const plan = await prisma.plan.findUnique({
    where: { shareSlug: params.slug },
  });
  if (!plan) notFound();

  const evMap = Object.fromEntries((plan.evidenceJson || []).map(e => [e.id, e]));

  return (
    <main>
      <PlanDetailView plan={plan} evMap={evMap} />
    </main>
  );
}
