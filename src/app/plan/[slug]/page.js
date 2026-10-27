import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PlanSection from '@/components/PlanSection';
import ChatBox from '@/components/ChatBox';
export const dynamic = 'force-dynamic';
export default async function PlanPage({ params }) {
  const plan = await prisma.plan.findUnique({ where: { shareSlug: params.slug } }); if (!plan) notFound();
  const r = plan.resultJson, evMap = Object.fromEntries(plan.evidenceJson.map(e => [e.id, e]));
  return (<main><a href="/">← New plan</a><h1>Your Taste Map: {plan.destination}</h1><p className="sub">{r.summary}</p>
    <div className="row"><a href={`/compare/${plan.shareSlug}`}><button className="alt">Compare with plain LLM</button></a><span className="chip">Share: /plan/{plan.shareSlug}</span></div>
    <ChatBox slug={plan.shareSlug} />{r.sections.map(s => <PlanSection key={s.key} section={s} evMap={evMap} />)}</main>);
}
