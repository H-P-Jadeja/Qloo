'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSteps from '@/components/LoadingSteps';
import TasteChips from '@/components/TasteChips';

const POPULAR_DESTINATIONS = [
  'Berlin',
  'Toronto',
  'Tokyo',
  'London',
  'New York',
  'Paris',
  'Mumbai',
];

export default function Destination() {
  const router = useRouter();
  const [picked, setPicked] = useState([]);
  const [dest, setDest] = useState('');
  const [home, setHome] = useState('');
  const [steps, setSteps] = useState([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem('picked') || '[]');
      setPicked(stored);
      const savedDest = sessionStorage.getItem('tasteDestination');
      if (savedDest) setDest(savedDest);
    } catch {
      setPicked([]);
    }
  }, []);

  function updateDestination(city) {
    setDest(city);
    if (typeof window !== 'undefined') {
      if (city.trim()) {
        sessionStorage.setItem('tasteDestination', city.trim());
        window.dispatchEvent(
          new CustomEvent('tasteDestinationChanged', {
            detail: { destination: city.trim() },
          })
        );
      }
    }
  }

  async function run() {
    if (!dest || !picked.length || busy) return;
    setBusy(true);
    setErr('');
    setSteps([`✨ Initializing Qloo Taste Graph agent for ${dest}...`]);

    try {
      const r = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: dest, homeCity: home, entities: picked }),
      });

      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setErr(j.error || 'Failed to generate plan');
        setBusy(false);
        return;
      }

      const rd = r.body.getReader();
      const dec = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await rd.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();

        for (const l of lines.filter(Boolean)) {
          try {
            const o = JSON.parse(l);
            if (o.step) setSteps(s => [...s, o.step]);
            if (o.error) {
              setErr(o.error);
              setBusy(false);
            }
            if (o.slug) {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('tasteDestination', dest);
                sessionStorage.setItem('lastSlug', o.slug);
                window.dispatchEvent(
                  new CustomEvent('tasteDestinationChanged', {
                    detail: { destination: dest, slug: o.slug },
                  })
                );
              }
              router.push(`/plan/${o.slug}`);
            }
          } catch {
            // ignore partial json
          }
        }
      }
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  }

  return (
    <main style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link href="/onboarding" className="btn-ghost" style={{ fontSize: 13, padding: '4px 8px', marginBottom: 12 }}>
          ← Back to cultural fingerprint
        </Link>
        <h1 className="hero-title" style={{ fontSize: 'clamp(32px, 5vw, 52px)', marginBottom: 12 }}>
          Where are you moving?
        </h1>
        <p className="hero-sub" style={{ fontSize: 16, marginBottom: 20 }}>
          Specify your current city and target destination. Qloo will ground your taste profile in the cultural fabric of your new home.
        </p>

        {/* Selected taste preview */}
        {picked.length > 0 ? (
          <div>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="sub" style={{ fontSize: 13 }}>
                Your {picked.length} selected taste anchors:
              </span>
              <Link href="/onboarding" className="btn-ghost" style={{ fontSize: 12 }}>
                Edit favorites
              </Link>
            </div>
            <TasteChips items={picked} />
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 24, textAlign: 'center', padding: 24 }}>
            <p className="sub">No cultural favorites selected yet.</p>
            <Link href="/onboarding" className="btn btn-primary" style={{ marginTop: 10 }}>
              Pick Favorites First
            </Link>
          </div>
        )}
      </div>

      {/* Relocation Form Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(180deg, #18191d 0%, #131417 100%)',
          padding: 28,
          borderRadius: 22,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#86868b', marginBottom: 8, fontWeight: 500 }}>
              🏠 Departing From (Optional)
            </label>
            <input
              style={{ width: '100%' }}
              value={home}
              onChange={e => setHome(e.target.value)}
              placeholder="E.g., Pune, San Francisco, London"
              disabled={busy}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#86868b', marginBottom: 8, fontWeight: 500 }}>
              📍 Moving To (Destination City)
            </label>
            <input
              style={{ width: '100%' }}
              value={dest}
              onChange={e => updateDestination(e.target.value)}
              placeholder="E.g., Mumbai, Berlin, Tokyo"
              disabled={busy}
            />
          </div>
        </div>

        {/* Popular Cities Pills */}
        <div style={{ marginBottom: 24 }}>
          <span style={{ fontSize: 12, color: '#86868b', marginRight: 10 }}>Popular Destinations:</span>
          <div className="row" style={{ gap: 6, display: 'inline-flex', marginTop: 6 }}>
            {POPULAR_DESTINATIONS.map(city => (
              <button
                key={city}
                type="button"
                className={dest.toLowerCase() === city.toLowerCase() ? 'btn-primary' : 'alt'}
                style={{ fontSize: 12, padding: '4px 12px' }}
                onClick={() => updateDestination(city)}
                disabled={busy}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ width: '100%', padding: '14px 24px', fontSize: 16 }}
          disabled={busy || !picked.length || !dest.trim()}
          onClick={run}
        >
          {busy ? 'Agent is Translating Your Taste...' : `Generate Taste Map for ${dest || 'City'} →`}
        </button>
      </div>

      {/* Progress & Error */}
      {steps.length > 0 && <LoadingSteps steps={steps} destination={dest} entities={picked} />}
      {err && (
        <div className="card" style={{ marginTop: 20, background: 'rgba(255, 69, 58, 0.1)', border: '1px solid rgba(255, 69, 58, 0.3)', padding: 18, borderRadius: 14, textAlign: 'center' }}>
          <p className="err" style={{ margin: '0 0 12px' }}>⚠️ {err}</p>
          <button type="button" className="btn btn-primary" onClick={run} style={{ background: '#ff453a', border: 'none', padding: '10px 24px' }}>
            ↻ Retry Generation
          </button>
        </div>
      )}
    </main>
  );
}
