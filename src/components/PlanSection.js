'use client';
import PickCard from './PickCard';

const SECTION_ICONS = {
  eat: '🍽️',
  listen: '🎧',
  shop: '🛍️',
  watch: '🎬',
  hood: '🏘️',
};

export default function PlanSection({ section, evMap, destination = '', onFocusMap = null, focusedId = null }) {
  const icon = SECTION_ICONS[section?.key] || '✨';

  if (!section?.picks?.length) {
    return (
      <section style={{ marginBottom: 36 }}>
        <div className="row" style={{ alignItems: 'baseline', marginBottom: 12 }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: '#86868b' }}>
            {icon} {section?.title || 'Section'}
          </h3>
          <span className="sub" style={{ fontSize: 12 }}>0 recommendations</span>
        </div>
        <div className="card" style={{ padding: '20px 24px', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: 16 }}>
          <p className="sub" style={{ margin: 0, fontSize: 13 }}>
            Qloo has no strong matches here yet for this specific taste profile in {destination || 'this city'}. Try adjusting your affinities with the concierge above.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ marginBottom: 40 }}>
      <div className="row" style={{ alignItems: 'baseline', marginBottom: 16 }}>
        <h3 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {icon} {section.title}
        </h3>
        <span className="sub" style={{ fontSize: 13 }}>
          {section.picks.length} recommendations
        </span>
      </div>

      <div className="grid">
        {section.picks.map(p => (
          <PickCard
            key={p.qlooId}
            pick={p}
            ev={evMap[p.evidenceId]}
            destination={destination}
            onFocusMap={onFocusMap}
            isFocused={focusedId === p.qlooId}
          />
        ))}
      </div>
    </section>
  );
}
