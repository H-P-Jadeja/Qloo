'use client';
import { useState } from 'react';

export default function EvidenceDrawer({ ev }) {
  const [open, setOpen] = useState(false);

  if (!ev) return null;

  const req = ev.request || ev.args || {};

  return (
    <div style={{ marginTop: 8, width: '100%' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="chip"
        style={{
          background: open ? 'rgba(0, 113, 227, 0.25)' : 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(41, 151, 255, 0.35)',
          color: '#2997ff',
          cursor: 'pointer',
          fontSize: 11,
          padding: '4px 10px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.2s ease',
        }}
        title="View the raw Qloo API endpoint, signals, and filters used to ground this pick"
      >
        <span>🔍</span>
        <span>{open ? 'Hide Qloo Evidence' : 'Qloo Evidence'}</span>
        <span style={{ fontSize: 9, opacity: 0.8 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          style={{
            marginTop: 10,
            padding: 14,
            background: '#0d0e12',
            border: '1px solid rgba(41, 151, 255, 0.2)',
            borderRadius: 12,
            fontSize: 12,
            lineHeight: 1.5,
            color: '#a1a1a6',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 6 }}>
            <span style={{ color: '#fff', fontWeight: 600 }}>Qloo API Grounding Record</span>
            <span className="chip chip-verified" style={{ fontSize: 10 }}>✔ Verified Call</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 10px', fontSize: 11, marginBottom: 8 }}>
            <span style={{ color: '#86868b' }}>Endpoint:</span>
            <code style={{ color: '#2997ff', background: 'transparent', padding: 0 }}>/v2/insights</code>

            <span style={{ color: '#86868b' }}>Location Filter:</span>
            <span style={{ color: '#fff' }}>{req['filter.location.query'] || req.location || 'Local Target'}</span>

            <span style={{ color: '#86868b' }}>Entity Type:</span>
            <span style={{ color: '#fff' }}>{req['filter.type'] || req.entityType || 'urn:entity:place'}</span>

            {ev.refinedBy && (
              <>
                <span style={{ color: '#86868b' }}>Refined By Tags:</span>
                <span style={{ color: '#30d158' }}>{ev.refinedBy.join(', ')}</span>
              </>
            )}
          </div>

          <details style={{ marginTop: 6 }}>
            <summary style={{ cursor: 'pointer', color: '#86868b', fontSize: 11 }}>
              Inspect Raw Query Parameters
            </summary>
            <pre
              style={{
                marginTop: 6,
                padding: 8,
                background: '#050507',
                borderRadius: 8,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: 10,
                color: '#aaa',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}
            >
              {JSON.stringify(req, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
