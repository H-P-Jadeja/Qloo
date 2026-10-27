export default function EvidenceDrawer({ ev }) {
  if (!ev) return null;
  return <details><summary>Evidence: Qloo {ev.tool} {ev.refinedBy ? `(+${ev.refinedBy.join(', ')})` : ''}</summary><pre>{JSON.stringify(ev.request || ev.args, null, 1)}</pre></details>;
}
