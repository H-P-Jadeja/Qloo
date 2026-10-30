'use client';
import { useState, useEffect } from 'react';

const TASTE_INSIGHTS = [
  '⚡ Grounded picks: Every recommendation is returned by Qloo’s taste graph, not guessed by the AI.',
  '🎧 Cross-Domain Affinity: Your music and cinema favorites directly inform which dining spots and neighborhoods match your lifestyle.',
  '📍 Map Pins: Places with Qloo location data are plotted on the map, with one-click Google Maps links.',
  '🌐 Subculture Mapping: Translating your local neighborhood vibe into its true cultural counterpart in your destination.',
  '⚖️ Taste vs popularity: Comparing Qloo’s taste-matched venues with what a plain LLM suggests.',
];

export default function LoadingSteps({ steps = [], destination = '', entities = [] }) {
  const [insightIndex, setInsightIndex] = useState(0);

  // Rotate helpful intelligence insights every 3.5s while waiting
  useEffect(() => {
    const timer = setInterval(() => {
      setInsightIndex(prev => (prev + 1) % TASTE_INSIGHTS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  if (!steps || steps.length === 0) return null;

  const currentStep = steps[steps.length - 1] || '';
  const previousSteps = steps.slice(0, steps.length - 1);

  // Check if current step is a question
  const isQuestion = currentStep.includes('Asking Qloo:');

  return (
    <div
      className="card"
      style={{
        marginTop: 28,
        background: 'linear-gradient(180deg, #18191d 0%, #111215 100%)',
        border: '1px solid rgba(41, 151, 255, 0.35)',
        borderRadius: 24,
        padding: '28px',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Header Row */}
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="row" style={{ gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(0, 113, 227, 0.15)',
              border: '1px solid #0071e3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            <span style={{ display: 'inline-block', animation: 'spin 2.5s linear infinite' }}>✨</span>
          </div>
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>
              Querying Qloo Cultural AI
            </h4>
            <p className="sub" style={{ fontSize: 12, margin: 0 }}>
              Translating personal taste graph into {destination ? `${destination}'s local scene` : 'destination'}
            </p>
          </div>
        </div>

        <div className="row" style={{ gap: 8 }}>
          {destination && (
            <span className="chip" style={{ fontSize: 11, background: 'rgba(255, 255, 255, 0.08)' }}>
              📍 {destination}
            </span>
          )}
          <span className="chip chip-map" style={{ fontSize: 11 }}>
            Query {steps.length}
          </span>
        </div>
      </div>

      {/* Active Inquiry Spotlight Box */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(41, 151, 255, 0.25)',
          borderRadius: 16,
          padding: '20px',
          marginBottom: 20,
          position: 'relative',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="row" style={{ gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#2997ff',
                display: 'inline-block',
                boxShadow: '0 0 10px #2997ff',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#2997ff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isQuestion ? 'Active Qloo Inquiry' : 'Current Agent Step'}
            </span>
          </div>
          <span className="sub" style={{ fontSize: 11 }}>
            In flight...
          </span>
        </div>

        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#ffffff',
            lineHeight: 1.5,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {currentStep}
        </div>
      </div>

      {/* Completed Queries History (Timeline) */}
      {previousSteps.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#86868b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Resolved Inquiries ({previousSteps.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
            {previousSteps.map((s, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  color: '#a1a1a6',
                  padding: '6px 10px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <span
                  style={{
                    color: '#30d158',
                    fontSize: 12,
                    fontWeight: 700,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'rgba(48, 209, 88, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  ✓
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Live Taste Intelligence Fact */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 16 }}>💡</span>
        <p
          className="sub"
          style={{
            fontSize: 12,
            margin: 0,
            color: '#86868b',
            lineHeight: 1.4,
            transition: 'opacity 0.3s ease',
          }}
        >
          {TASTE_INSIGHTS[insightIndex]}
        </p>
      </div>
    </div>
  );
}
