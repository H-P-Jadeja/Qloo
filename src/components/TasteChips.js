'use client';

export default function TasteChips({ items = [], onRemove = null }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="row" style={{ gap: 8, margin: '8px 0 14px' }}>
      {items.map(p => (
        <span
          key={p.qlooId || p.id || p.name}
          className="chip"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            padding: '5px 12px',
            fontSize: '13px',
            borderRadius: '980px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {p.imageUrl && (
            <img
              src={p.imageUrl}
              alt=""
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          )}
          <span>{p.name}</span>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(p)}
              style={{
                background: 'transparent',
                border: 0,
                color: '#86868b',
                padding: '0 2px',
                cursor: 'pointer',
                fontSize: 14,
                lineHeight: 1,
                boxShadow: 'none',
                transform: 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ff453a')}
              onMouseLeave={e => (e.currentTarget.style.color = '#86868b')}
              title="Remove"
            >
              ✕
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
