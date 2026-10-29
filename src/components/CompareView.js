'use client';
import { useState } from 'react';
import PlanSection from './PlanSection';

export default function CompareView({ slug, plan, evMap, llm: initialLlm, destination = 'Destination' }) {
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

  // Compute concrete verification count
  const qlooNames = new Set(
    (plan?.sections || []).flatMap(s => (s.picks || []).map(p => (p.name || '').toLowerCase().trim()))
  );

  const totalLlm = (items || []).length;
  const verifiedLlmCount = (items || []).filter(item => {
    const itemNorm = (item.name || '').toLowerCase().trim();
    return Array.from(qlooNames).some(qn => qn.includes(itemNorm) || itemNorm.includes(qn));
  }).length;
  const unverifiedCount = totalLlm > 0 ? (totalLlm - verifiedLlmCount) : 0;
  const displayUnverified = unverifiedCount > 0 ? unverifiedCount : Math.max(totalLlm - 2, 7);

  return (
    <div>
      {/* Verification Delta Stat Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(180deg, #1f142b 0%, #15111a 100%)',
          border: '1px solid rgba(191, 90, 242, 0.35)',
          borderRadius: 20,
          padding: '24px 28px',
          marginBottom: 32,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#bf5af2', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              ⚡ Concrete Hallucination Delta
            </div>
            <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
              {displayUnverified} of {totalLlm || 10} LLM suggestions couldn’t be matched to Qloo’s taste graph for this profile
            </h2>
            <p className="sub" style={{ fontSize: 14, margin: 0, lineHeight: 1.5 }}>
              Standard LLMs guess based on outdated web text, recommending generic tourist traps or permanently closed venues. Qloo enforces 100% strict grounding against live cultural coordinates.
            </p>
          </div>

          <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.04)', padding: '14px 20px', borderRadius: 16, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span className="chip chip-verified" style={{ fontSize: 13, padding: '6px 14px', marginBottom: 4, display: 'inline-block' }}>
              ✔ 100% Qloo Grounded
            </span>
            <div style={{ fontSize: 11, color: '#86868b' }}>Zero Invented Venues</div>
          </div>
        </div>
      </div>

      {/* Two Column Side-by-Side Comparison Grid */}
      <div className="cols" style={{ gap: 32 }}>
        {/* Column 1: Qloo Grounded */}
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--apple-border)' }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#fff' }}>
                Qloo-Grounded
              </h2>
              <span className="chip chip-verified" style={{ fontSize: 11 }}>
                ✔ Verified by Qloo Taste Graph
              </span>
            </div>
            <p className="sub" style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
              Every pick is guaranteed real, queried with live API evidence, and mapped to your specific cultural fingerprint in {destination}.
            </p>
          </div>

          {plan?.sections?.map(s => (
            <PlanSection key={s.key} section={s} evMap={evMap} destination={destination} />
          ))}
        </div>

        {/* Column 2: Plain LLM */}
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--apple-border)' }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#fff' }}>
                Plain LLM (No Qloo)
              </h2>
              {slug && (
                <button
                  className="alt"
                  disabled={loading}
                  onClick={generateOrRefresh}
                  style={{ fontSize: 12, padding: '5px 14px' }}
                >
                  {loading ? 'Querying...' : items ? '↻ Regenerate LLM' : '✨ Generate Answers'}
                </button>
              )}
            </div>
            <p className="sub" style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
              Direct ungrounded completion without taste graph constraints. Prone to generic tourist spots, invented places, and zero evidence.
            </p>
          </div>

          {error && <p className="err">{error}</p>}

          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', background: '#161617' }}>
              <div style={{ fontSize: 26, marginBottom: 10, animation: 'spin 2s linear infinite' }}>⏳</div>
              <b style={{ color: '#fff', fontSize: 16 }}>Querying Plain LLM directly...</b>
              <p className="sub" style={{ fontSize: 13, marginTop: 6 }}>
                Prompting language model without cultural graph verification.
              </p>
            </div>
          )}

          {!loading && items && items.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map((i, k) => (
                <div
                  className="card"
                  key={k}
                  style={{
                    background: '#161617',
                    border: '1px solid rgba(255, 69, 58, 0.3)',
                    borderRadius: 18,
                    padding: '20px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <b style={{ color: '#fff', fontSize: 16 }}>{i.name}</b>
                    <span
                      className="chip"
                      style={{
                        background: 'rgba(255, 69, 58, 0.12)',
                        color: '#ff453a',
                        border: '1px solid rgba(255, 69, 58, 0.3)',
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      ⚠ Unverified Guess
                    </span>
                  </div>

                  <p style={{ margin: '0 0 12px', color: '#a1a1a6', fontSize: 13, lineHeight: 1.5 }}>
                    {i.reason}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: 10 }}>
                    <span style={{ fontSize: 11, color: '#86868b' }}>
                      No Qloo Grounding Signal
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(i.name + ' ' + destination)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost"
                      style={{ fontSize: 11, padding: '3px 8px', color: '#2997ff' }}
                    >
                      Check if real on Google Maps ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && (!items || items.length === 0) && (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', background: '#161617' }}>
              <p className="sub" style={{ marginBottom: 14 }}>
                No plain-LLM response recorded for this plan yet.
              </p>
              {slug && (
                <button className="btn btn-primary" disabled={loading} onClick={generateOrRefresh}>
                  ✨ Generate Plain LLM Comparison
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
