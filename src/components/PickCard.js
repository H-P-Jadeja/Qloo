import EvidenceDrawer from './EvidenceDrawer';
export default function PickCard({ pick, ev }) {
  return (<div className="card pick">{pick.image && <img src={pick.image} alt="" />}
    <b>{pick.name}</b> <span className="chip">✔ Qloo-verified</span><p>{pick.reason}</p><EvidenceDrawer ev={ev} /></div>);
}
