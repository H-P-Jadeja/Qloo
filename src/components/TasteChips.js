export default function TasteChips({ items, onRemove }) {
  return <div className="row">{items.map(p => <span className="chip" key={p.qlooId}>{p.name} {onRemove && <a onClick={() => onRemove(p)} style={{ cursor: 'pointer' }}>✕</a>}</span>)}</div>;
}
