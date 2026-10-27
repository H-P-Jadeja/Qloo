import PickCard from './PickCard';
export default function PlanSection({ section, evMap }) {
  if (!section.picks.length) return null;
  return <section><h3>{section.title}</h3><div className="grid">{section.picks.map(p => <PickCard key={p.qlooId} pick={p} ev={evMap[p.evidenceId]} />)}</div></section>;
}
