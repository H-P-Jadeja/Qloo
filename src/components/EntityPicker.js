'use client';
import { useState } from 'react';
export default function EntityPicker({ domain, onAdd, onError }) {
  const [res, setRes] = useState([]);
  async function search(e) {
    e.preventDefault();
    const r = await fetch(`/api/entities/search?q=${encodeURIComponent(e.target.q.value)}&type=${domain.type}`); const j = await r.json();
    if (j.error) onError(j.error); else setRes(j.results);
  }
  return (<div className="card"><b>{domain.label}</b>
    <form className="row" onSubmit={search}><input name="q" placeholder={`Search ${domain.label.toLowerCase()}`} /><button className="alt">Search</button></form>
    <div className="grid">{res.map(e => <button className="alt" key={e.id} onClick={() => onAdd(domain, e)}>{e.image && <img src={e.image} alt="" width="40" style={{ verticalAlign: 'middle', marginRight: 6 }} />}+ {e.name}</button>)}</div></div>);
}
