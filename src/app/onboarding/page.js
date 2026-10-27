'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DOMAINS } from '@/lib/qloo/types';
import EntityPicker from '@/components/EntityPicker';
import TasteChips from '@/components/TasteChips';
const DEMO = { music: ['Arijit Singh', 'Coldplay'], film: ['Interstellar', 'Dil Chahta Hai'], food: ['Starbucks'], brand: ['Nike'], book: ['The Alchemist'] };

export default function Onboarding() {
  const router = useRouter(); const [picked, setPicked] = useState([]); const [err, setErr] = useState(''); const [msg, setMsg] = useState('');
  const add = (d, e) => setPicked(p => p.length >= 25 || p.find(x => x.qlooId === e.id) ? p : [...p, { qlooId: e.id, name: e.name, type: d.key, imageUrl: e.image }]);
  async function demo() {
    setMsg('Resolving demo favorites via Qloo...'); setErr('');
    for (const d of DOMAINS) for (const n of DEMO[d.key] || []) {
      const j = await (await fetch(`/api/entities/search?q=${encodeURIComponent(n)}&type=${d.type}`)).json();
      if (j.error) { setErr(j.error); break; } if (j.results?.[0]) add(d, j.results[0]);
    } setMsg('');
  }
  function next() { sessionStorage.setItem('picked', JSON.stringify(picked)); router.push('/destination'); }
  return (<main><h1>What do you love?</h1><p className="sub">Search and confirm up to 5 per category.</p>
    <button className="alt" onClick={demo}>Use demo profile</button> {msg}
    {DOMAINS.map(d => <div key={d.key}><EntityPicker domain={d} onAdd={add} onError={setErr} /><TasteChips items={picked.filter(p => p.type === d.key)} onRemove={p => setPicked(x => x.filter(y => y !== p))} /></div>)}
    {err && <p className="err">{err}</p>}
    <p><button disabled={!picked.length} onClick={next}>Next: choose city ({picked.length})</button></p></main>);
}
