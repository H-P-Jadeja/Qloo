'use client';
import EvidenceDrawer from './EvidenceDrawer';

// Noisy tags that add no value to the user
const JUNK_TAG_RE = /^(restroom|urination|morning|midday|standard|borough|religious|paid.?breakfast|room.?service|mild.?cool|cool weather|mild cool weather|rating|overall|generic|average|basic|ordinary|toilet)$/i;

function cleanTags(tags = []) {
  return (tags || []).filter(t => {
    const s = typeof t === 'string' ? t : (t?.name || t || '');
    return s && !JUNK_TAG_RE.test(s.trim());
  });
}

export default function PickCard({ pick, ev, destination = '', onFocusMap = null, isFocused = false }) {
  const isPlace = !!(pick.location || pick.address || pick.neighborhood || (pick.qlooId && pick.qlooId.length > 5));
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    pick.name + ' ' + (typeof pick.address === 'string' ? pick.address : typeof pick.address === 'object' && pick.address ? [pick.address.city, pick.address.country].filter(Boolean).join(', ') : destination || '')
  )}`;

  return (
    <div
      id={`pick-${pick.qlooId}`}
      className={`card pick ${isFocused ? 'active-highlight' : ''}`}
    >
      {pick.image && (
        <div className="pick-image-wrap">
          <img src={pick.image} alt={pick.name} loading="lazy" />
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              display: 'flex',
              gap: 6,
              zIndex: 2,
            }}
          >
            <span className="chip chip-verified">
              ✔ Qloo-verified
            </span>
          </div>
        </div>
      )}

      <div className="pick-body">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h4 className="pick-title">{pick.name}</h4>
            {!pick.image && (
              <span className="chip chip-verified" style={{ marginBottom: 8 }}>
                ✔ Qloo-verified
              </span>
            )}
          </div>
        </div>

        {/* Why this matches you */}
        <div style={{ margin: '8px 0 10px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#2997ff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
            Why this matches you:
          </div>
          <p className="pick-reason" style={{ margin: 0 }}>
            {pick.reason}
          </p>
        </div>

        {pick.tags && pick.tags.length > 0 && (() => {
          const displayTags = cleanTags(pick.tags).slice(0, 4);
          return displayTags.length > 0 ? (
            <div className="row" style={{ gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {displayTags.map((tag, idx) => (
                <span key={idx} className="chip" style={{ fontSize: 11, padding: '2px 8px' }}>
                  #{typeof tag === 'string' ? tag : tag?.name || tag}
                </span>
              ))}
            </div>
          ) : null;
        })()}

        <div className="pick-actions" style={{ flexWrap: 'wrap', gap: 8 }}>
          {onFocusMap && isPlace && (
            <button
              type="button"
              className="alt"
              onClick={() => onFocusMap(pick)}
              style={{
                background: isFocused ? '#0071e3' : 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
              }}
            >
              📍 Pin on Map
            </button>
          )}

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="btn alt"
          >
            🗺️ Google Maps ↗
          </a>

          {/* Qloo Evidence Button & Drawer */}
          <EvidenceDrawer ev={ev} />
        </div>
      </div>
    </div>
  );
}
