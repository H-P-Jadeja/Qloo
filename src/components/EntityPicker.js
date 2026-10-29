'use client';
import { useState } from 'react';

const DOMAIN_ICONS = {
  music: '🎧',
  film: '🎬',
  food: '🍽️',
  brand: '🏷️',
  book: '📚',
};

export default function EntityPicker({ domain, onAdd, onError }) {
  const [query, setQuery] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [res, setRes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const icon = DOMAIN_ICONS[domain.key] || '✨';

  async function search(e) {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setLastQuery(query.trim());
    try {
      const r = await fetch(
        `/api/entities/search?q=${encodeURIComponent(query)}&type=${domain.type}`
      );
      const j = await r.json();
      if (j.error) {
        onError(j.error);
      } else {
        setRes(j.results || []);
      }
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(item) {
    onAdd(domain, item);
    // remove from results list once added
    setRes(prev => prev.filter(x => x.id !== item.id));
  }

  return (
    <div className="card" style={{ marginBottom: 18, background: '#161617' }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <div className="row" style={{ gap: 8 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <b style={{ fontSize: 16, color: '#fff' }}>{domain.label}</b>
        </div>
        <span className="sub" style={{ fontSize: 12 }}>
          Search & add your favorites
        </span>
      </div>

      <form onSubmit={search} className="row" style={{ gap: 10, width: '100%', marginBottom: 10 }}>
        <input
          style={{ flex: 1 }}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`Search ${domain.label.toLowerCase()} (e.g., Radiohead, Interstellar, Blue Bottle)`}
        />
        <button type="submit" className="alt" disabled={loading || !query.trim()}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Results grid */}
      {res.length > 0 && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', marginTop: 12 }}>
          {res.map(item => (
            <button
              type="button"
              className="alt"
              key={item.id}
              onClick={() => handleSelect(item)}
              style={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt=""
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    objectFit: 'cover',
                    marginRight: 8,
                    flexShrink: 0,
                  }}
                />
              )}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                + {item.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Empty Search Result State */}
      {hasSearched && !loading && res.length === 0 && (
        <p className="sub" style={{ fontSize: 13, marginTop: 10, color: '#86868b' }}>
          No matching {domain.label.toLowerCase()} found in Qloo’s graph for "{lastQuery}". Try a different spelling or name.
        </p>
      )}
    </div>
  );
}
