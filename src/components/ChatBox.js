'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const QUICK_PROMPTS = [
  'Quieter spots',
  'Cheaper & street food',
  'Cozy cafes to work',
  'Live indie music',
  'Artistic & scenic views',
];

export default function ChatBox({ slug }) {
  const router = useRouter();
  const [msg, setMsg] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(e) {
    if (e) e.preventDefault();
    if (!msg.trim() || busy) return;

    setBusy(true);
    setNote(`Asking Qloo: "Finding verified spots matching '${msg}'..."`);
    try {
      const r = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, message: msg }),
      });
      const j = await r.json();
      if (j.ok) {
        setNote(`✨ Successfully updated ${j.section} with verified picks matching "${msg}"!`);
        setMsg('');
        router.refresh();
      } else {
        setNote(`⚠️ ${j.error || 'Failed to update'}`);
      }
    } catch (err) {
      setNote(`⚠️ ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  function applyQuick(text) {
    setMsg(text);
  }

  return (
    <div className="card" style={{ marginBottom: 32, background: 'linear-gradient(180deg, #18191d 0%, #131417 100%)' }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="row" style={{ gap: 8 }}>
          <span style={{ fontSize: 18 }}>✨</span>
          <b style={{ fontSize: 15, color: '#fff' }}>Taste Concierge Refinement</b>
        </div>
        <span className="sub" style={{ fontSize: 12 }}>
          {busy ? 'Querying Qloo...' : note || 'Ask the AI to adjust your plan'}
        </span>
      </div>

      <form onSubmit={send} className="row" style={{ gap: 10, width: '100%' }}>
        <input
          style={{ flex: 1, minWidth: 200 }}
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder='E.g., "give me something quieter", "more underground techno", "cheaper eats"'
        />
        <button
          type="submit"
          disabled={busy || msg.trim().length < 2}
          style={{ minWidth: 100 }}
        >
          {busy ? 'Refining...' : 'Refine'}
        </button>
      </form>

      {/* Quick Prompt Pills */}
      <div className="row" style={{ gap: 8, marginTop: 12 }}>
        <span className="sub" style={{ fontSize: 12 }}>Try:</span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            className="alt"
            style={{ fontSize: 11, padding: '3px 10px' }}
            onClick={() => applyQuick(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
