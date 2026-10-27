export default function LoadingSteps({ steps }) {
  return <div className="card">{steps.map((s, i) => <div key={i}>{i === steps.length - 1 ? '⏳' : '✔'} {s}</div>)}</div>;
}
