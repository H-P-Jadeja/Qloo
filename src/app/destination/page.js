'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSteps from '@/components/LoadingSteps';
import TasteChips from '@/components/TasteChips';

export default function Destination() {
  const router = useRouter(); const [picked, setPicked] = useState([]); const [dest, setDest] = useState('Berlin'); const [home, setHome] = useState('Pune');
  const [steps, setSteps] = useState([]); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { setPicked(JSON.parse(sessionStorage.getItem('picked') || '[]')); }, []);
  async function run() {
    setBusy(true); setErr(''); setSteps(['Starting agent']);
    const r = await fetch('/api/agent/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ destination: dest, homeCity: home, entities: picked }) });
    if (!r.ok) { setErr((await r.json()).error || 'Failed'); setBusy(false); return; }
    const rd = r.body.getReader(), dec = new TextDecoder(); let buf = '';
    while (true) {
      const { done, value } = await rd.read(); if (done) break;
      buf += dec.decode(value, { stream: true }); const lines = buf.split('\n'); buf = lines.pop();
      for (const l of lines.filter(Boolean)) { const o = JSON.parse(l);
        if (o.step) setSteps(s => [...s, o.step]); if (o.error) { setErr(o.error); setBusy(false); } if (o.slug) router.push(`/plan/${o.slug}`); }
    }
  }
  return (<main><h1>Where are you moving?</h1><TasteChips items={picked} />
    <div className="card row"><input value={home} onChange={e => setHome(e.target.value)} placeholder="From" /><input value={dest} onChange={e => setDest(e.target.value)} placeholder="To" />
      <button disabled={busy || !picked.length || !dest} onClick={run}>Build my Taste Map</button></div>
    {steps.length > 0 && <LoadingSteps steps={steps} />}{err && <p className="err">{err}</p>}
    {!picked.length && <p>No favorites yet. <a href="/onboarding">Go back</a></p>}</main>);
}
