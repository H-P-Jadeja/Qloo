'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import InteractiveMap from './InteractiveMap';
import PlanSection from './PlanSection';
import ChatBox from './ChatBox';

export default function PlanDetailView({ plan, evMap }) {
  const [focusedId, setFocusedId] = useState(null);
  const [copied, setCopied] = useState(false);

  const r = plan.resultJson || {};
  const sections = r.sections || [];
  const tasteDna = r.tasteDna || [];

  // Broadcast current destination to update header dynamically
  useEffect(() => {
    if (plan?.destination) {
      try {
        sessionStorage.setItem('tasteDestination', plan.destination);
        sessionStorage.setItem('lastSlug', plan.shareSlug);
        window.dispatchEvent(
          new CustomEvent('tasteDestinationChanged', {
            detail: { destination: plan.destination, slug: plan.shareSlug },
          })
        );
      } catch {
        // ignore
      }
    }
  }, [plan?.destination, plan?.shareSlug]);

  // Extract all places from sections for the interactive map
  const places = [];
  sections.forEach(sec => {
    (sec.picks || []).forEach(p => {
      // Prioritize eat, hood, or items that are physical venues
      if (sec.key === 'eat' || sec.key === 'hood' || p.location || p.address) {
        places.push({
          ...p,
          sectionKey: sec.key,
          sectionTitle: sec.title,
        });
      }
    });
  });

  function handleSelectPlace(place) {
    const id = place.qlooId || place.id;
    setFocusedId(id);
    const element = document.getElementById(`pick-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function handleFocusMap(place) {
    const id = place.qlooId || place.id;
    setFocusedId(id);
    const mapElem = document.getElementById('map-section') || document.querySelector('.map-container-card');
    if (mapElem) {
      mapElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function scrollToMap() {
    const mapElem = document.getElementById('map-section') || document.querySelector('.map-container-card');
    if (mapElem) {
      mapElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function copyLink() {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => fallbackCopy(url));
      } else {
        fallbackCopy(url);
      }
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
    document.body.removeChild(ta);
  }

  return (
    <div>
      {/* Top Breadcrumb & Actions */}
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
        <Link href="/" className="btn-ghost" style={{ fontSize: 13, padding: '4px 8px' }}>
          ← Start new taste plan
        </Link>
        <span className="chip" style={{ fontSize: 11, background: 'rgba(0, 113, 227, 0.1)', color: '#2997ff', border: '1px solid rgba(41, 151, 255, 0.3)' }}>
          Grounded with Qloo Taste Graph API
        </span>
      </div>

      {/* Hero Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <span className="chip chip-verified">
            ✔ Verified Relocation Map
          </span>
          <span className="sub" style={{ fontSize: 13 }}>
            Slug: {plan.shareSlug}
          </span>
        </div>

        <h1 className="hero-title" style={{ fontSize: 'clamp(32px, 5vw, 54px)', marginBottom: 8 }}>
          Your Taste Map: {plan.destination}
        </h1>
        <p className="hero-sub" style={{ fontSize: 16, marginBottom: 16, maxWidth: 800 }}>
          {r.summary || `Personalized taste guide to ${plan.destination}, grounded in your real-world affinities.`}
        </p>

        {/* Core Technical Rule UI Claim */}
        <div
          style={{
            background: 'rgba(0, 113, 227, 0.08)',
            border: '1px solid rgba(0, 113, 227, 0.28)',
            borderRadius: '14px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: 20 }}>🛡️</span>
          <span style={{ fontSize: 14, color: '#e0e0e0', lineHeight: 1.45 }}>
            <strong style={{ color: '#2997ff' }}>Strict Grounding Guarantee:</strong> Every pick below was returned by Qloo. The AI only writes the explanation.
          </span>
        </div>

        {/* Action Toolbar */}
        <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <Link
            href={`/compare/${plan.shareSlug}`}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(90deg, #9b51e0 0%, #0071e3 100%)',
              border: 'none',
              padding: '10px 20px',
              fontSize: 14,
              boxShadow: '0 4px 16px rgba(155, 81, 224, 0.4)',
            }}
          >
            <span>⚖️ Same user, same city: LLM guesses vs Qloo knows →</span>
          </Link>

          <button type="button" className="alt" onClick={scrollToMap}>
            <span>🗺️ View on Map ({places.length} venues)</span>
          </button>

          <button type="button" className="alt" onClick={copyLink}>
            {copied ? '✔ Link Copied!' : '🔗 Share Taste Map'}
          </button>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plan.destination)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
            style={{ fontSize: 13 }}
          >
            Open {plan.destination} in Google Maps ↗
          </a>
        </div>
      </div>

      {/* Your Taste DNA (From Qloo Taste Profile) */}
      {tasteDna && tasteDna.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: 32,
            background: 'linear-gradient(180deg, #18191d 0%, #121316 100%)',
            border: '1px solid rgba(41, 151, 255, 0.25)',
            borderRadius: 20,
            padding: '22px 26px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="row" style={{ gap: 8 }}>
              <span style={{ fontSize: 18 }}>🧬</span>
              <b style={{ color: '#fff', fontSize: 16 }}>Your Taste DNA</b>
            </div>
            <span className="chip chip-verified" style={{ fontSize: 10 }}>
              Qloo Taste Profile Signal
            </span>
          </div>

          <p className="sub" style={{ fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
            Qloo cross-referenced your input favorites across its taste graph to identify these core aesthetic and cultural affinity markers:
          </p>

          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            {tasteDna.map((tag, idx) => (
              <span
                key={idx}
                className="chip"
                style={{
                  background: 'rgba(0, 113, 227, 0.12)',
                  color: '#2997ff',
                  border: '1px solid rgba(41, 151, 255, 0.3)',
                  fontSize: 12,
                  padding: '4px 12px',
                  fontWeight: 500,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Taste Refinement Concierge */}
      <ChatBox slug={plan.shareSlug} />

      {/* 1. Categorized Selected Places & Recommendations */}
      <div>
        {sections.length > 0 ? (
          sections.map(s => (
            <PlanSection
              key={s.key}
              section={s}
              evMap={evMap}
              destination={plan.destination}
              onFocusMap={handleFocusMap}
              focusedId={focusedId}
            />
          ))
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', background: '#161617' }}>
            <p className="sub" style={{ fontSize: 15 }}>
              Qloo has no strong matches here yet for this specific profile. Try adding more varied cultural favorites.
            </p>
          </div>
        )}
      </div>

      {/* 2. Interactive Google Map Virtual Section (Moved to Bottom of Selected Places) */}
      <section id="map-section" style={{ marginTop: 56, marginBottom: 40 }}>
        <div className="row" style={{ alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div className="row" style={{ gap: 8, marginBottom: 6 }}>
              <span className="chip chip-map">📍 Virtual Map View</span>
              <span className="sub" style={{ fontSize: 13 }}>{places.length} Locations Plotted</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
              Interactive Google Map & Venue Locator
            </h2>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plan.destination)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
            style={{ fontSize: 13 }}
          >
            Full {plan.destination} Google Maps ↗
          </a>
        </div>

        <p className="sub" style={{ marginBottom: 20 }}>
          Explore all {places.length} Qloo-verified cultural places across {plan.destination}.
          Click any pin or venue card to inspect recommendations, view grounding signals, or launch live turn-by-turn Google Maps navigation.
        </p>

        <InteractiveMap
          destination={plan.destination}
          places={places}
          activePlaceId={focusedId}
          onSelectPlace={handleSelectPlace}
        />
      </section>
    </div>
  );
}
