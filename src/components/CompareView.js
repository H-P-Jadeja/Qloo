import PlanSection from './PlanSection';
export default function CompareView({ plan, evMap, llm }) {
  return (<div className="cols"><div><h2>Qloo-grounded</h2>{plan.sections.map(s => <PlanSection key={s.key} section={s} evMap={evMap} />)}</div>
    <div><h2>Plain LLM (no Qloo)</h2>{llm ? llm.map((i, k) => <div className="card" key={k}><b>{i.name}</b> <span className="chip">unverified</span><p>{i.reason}</p></div>) : <p className="sub">Set LLM_API_KEY to see the plain-LLM answer.</p>}</div></div>);
}
