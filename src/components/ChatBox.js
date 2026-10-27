'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function ChatBox({ slug }) {
  const router = useRouter(); const [msg, setMsg] = useState(''); const [note, setNote] = useState(''); const [busy, setBusy] = useState(false);
  async function send(e) {
    e.preventDefault(); setBusy(true); setNote('Re-querying Qloo...');
    const r = await fetch('/api/agent/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, message: msg }) }); const j = await r.json();
    setBusy(false); if (j.ok) { setNote(`Updated: ${j.section}`); setMsg(''); router.refresh(); } else setNote(j.error);
  }
  return <form className="card row" onSubmit={send}><input style={{ flex: 1 }} value={msg} onChange={e => setMsg(e.target.value)} placeholder='Refine: "something quieter", "cheaper", "more indie"' /><button disabled={busy || msg.length < 2}>Refine</button><span className="sub">{note}</span></form>;
}
