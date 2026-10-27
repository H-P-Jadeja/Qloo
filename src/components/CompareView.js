'use client';
import { useState } from 'react';
import PlanSection from './PlanSection';

export default function CompareView({ slug, plan, evMap, llm: initialLlm }) {
  const [items, setItems] = useState(initialLlm || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generateOrRefresh() {
    if (!slug) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/agent/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate comparison');
      }
      setItems(data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cols">
      <div>
        <h2>Qloo-grounded</h2>
        {plan?.sections?.map(s => (
          <PlanSection key={s.key} section={s} evMap={evMap} />
        ))}
      </div>

      <div>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Plain LLM (no Qloo)</h2>
          {slug && (
            <button
              className="alt"
              disabled={loading}
              onClick={generateOrRefresh}
              style={{ fontSize: 13, padding: '4px 10px' }}
            >
              {loading ? 'Generating...' : items ? '↻ Regenerate' : '✨ Generate Answers'}
            </button>
          )}
        </div>

        {error && <p className="err">{error}</p>}

        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
            <p className="sub" style={{ margin: 0 }}>
              Querying LLM directly without taste graph grounding...
            </p>
          </div>
        )}

        {!loading && items && items.length > 0 && (
          items.map((i, k) => (
            <div className="card" key={k}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <b>{i.name}</b>
                <span className="chip" style={{ background: '#3b2d54', color: '#d8b4fe' }}>
                  unverified hallucination-prone
                </span>
              </div>
              <p style={{ marginTop: 8, color: '#ccc' }}>{i.reason}</p>
            </div>
          ))
        )}

        {!loading && (!items || items.length === 0) && (
          <div className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
            <p className="sub">
              No plain-LLM response recorded yet.
            </p>
            {slug && (
              <button disabled={loading} onClick={generateOrRefresh} style={{ marginTop: 8 }}>
                Generate Plain LLM Answer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
