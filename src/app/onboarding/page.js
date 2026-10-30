'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DOMAINS } from '@/lib/qloo/types';
import EntityPicker from '@/components/EntityPicker';
import TasteChips from '@/components/TasteChips';

const DEMO = {
  music: ['Arijit Singh', 'Coldplay'],
  film: ['Interstellar', 'Dil Chahta Hai'],
  food: ['Starbucks'],
  brand: ['Nike'],
  book: ['The Alchemist'],
};

export default function Onboarding() {
  const router = useRouter();
  const [picked, setPicked] = useState([]);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [loadingDemo, setLoadingDemo] = useState(false);

  const add = (d, e) =>
    setPicked(p =>
      p.length >= 25 || p.find(x => x.qlooId === e.id)
        ? p
        : [...p, { qlooId: e.id, name: e.name, type: d.key, imageUrl: e.image }]
    );

  async function demo() {
    setLoadingDemo(true);
    setMsg('Resolving Pune → London sample affinities from Qloo taste graph...');
    setErr('');
    try {
      const queries = [
        { name: 'Radiohead', domain: DOMAINS[0] },
        { name: 'Blade Runner', domain: DOMAINS[1] },
        { name: 'Ramen', domain: DOMAINS[2] },
        { name: 'Nike', domain: DOMAINS[3] },
        { name: 'The Alchemist', domain: DOMAINS[4] },
      ];
      const results = await Promise.all(
        queries.map(async q => {
          try {
            const res = await fetch(`/api/entities/search?q=${encodeURIComponent(q.name)}&type=${q.domain.type}`);
            const j = await res.json();
            if (j.results?.[0]) {
              return { qlooId: j.results[0].id, name: j.results[0].name, type: q.domain.key, imageUrl: j.results[0].image };
            }
          } catch { }
          return null;
        })
      );
      const valid = results.filter(Boolean);
      if (valid.length > 0) {
        setPicked(valid);
      } else {
        setPicked([
          { qlooId: 'radiohead', name: 'Radiohead', type: 'music' },
          { qlooId: 'blade_runner', name: 'Blade Runner', type: 'film' },
          { qlooId: 'ramen', name: 'Ramen', type: 'food' },
          { qlooId: 'nike', name: 'Nike', type: 'brand' },
          { qlooId: 'the_alchemist', name: 'The Alchemist', type: 'book' },
        ]);
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setMsg('');
      setLoadingDemo(false);
    }
  }

  function next() {
    sessionStorage.setItem('picked', JSON.stringify(picked));
    router.push('/destination');
  }

  return (
    <main style={{ paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <span className="chip" style={{ marginBottom: 12, background: 'rgba(0, 113, 227, 0.1)', color: '#2997ff', border: '1px solid rgba(41, 151, 255, 0.25)' }}>
          Step 1 of 2: Cultural Fingerprint
        </span>
        <h1 className="hero-title" style={{ fontSize: 'clamp(32px, 5vw, 52px)', marginBottom: 12 }}>
          What moves you?
        </h1>
        <p className="hero-sub" style={{ fontSize: 16, marginBottom: 24, maxWidth: 700 }}>
          Search and pick your go-to artists, directors, restaurants, and brands.
          Qloo connects these dots to find your scene anywhere in the world.
        </p>

        <div className="row" style={{ gap: 12 }}>
          <button
            type="button"
            className="alt"
            onClick={demo}
            disabled={loadingDemo}
          >
            {loadingDemo ? '⚡ Loading demo...' : '⚡ Use Sample Profile'}
          </button>

          <span className="chip chip-verified">
            ✨ {picked.length} Favorites Selected
          </span>

          {msg && <span className="sub" style={{ fontSize: 13 }}>{msg}</span>}
        </div>
      </div>

      {err && <p className="err">{err}</p>}

      {/* Domain Pickers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {DOMAINS.map(d => {
          const domainItems = picked.filter(p => p.type === d.key);
          return (
            <div key={d.key}>
              <EntityPicker domain={d} onAdd={add} onError={setErr} />
              <TasteChips
                items={domainItems}
                onRemove={p => setPicked(x => x.filter(y => y.qlooId !== p.qlooId))}
              />
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(10, 10, 12, 0.85)',
          backdropFilter: 'saturate(180%) blur(20px)',
          borderTop: '1px solid var(--apple-border)',
          padding: '16px 20px',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <b style={{ color: '#fff', fontSize: 15 }}>
              {picked.length} item{picked.length === 1 ? '' : 's'} added
            </b>
            <p className="sub" style={{ fontSize: 12, margin: 0 }}>
              {picked.length === 0 ? 'Pick at least 1 favorite to continue' : 'Ready to map your destination'}
            </p>
          </div>

          <button
            className="btn-primary"
            disabled={!picked.length}
            onClick={next}
            style={{ padding: '12px 28px', fontSize: 15 }}
          >
            Continue to Destination →
          </button>
        </div>
      </div>
    </main>
  );
}
