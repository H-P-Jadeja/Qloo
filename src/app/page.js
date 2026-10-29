import Link from 'next/link';
import TryDemoButton from '@/components/TryDemoButton';

export default function Home() {
  return (
    <main style={{ paddingBottom: 100 }}>
      {/* Apple Hero Section: One Sentence Problem + One Click Action */}
      <section style={{ textAlign: 'center', padding: '64px 0 50px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
          <span className="chip" style={{ background: 'rgba(0, 113, 227, 0.12)', color: '#2997ff', border: '1px solid rgba(41, 151, 255, 0.3)', padding: '5px 14px' }}>
            ✨ Powered by Qloo Cultural Taste Graph AI
          </span>
        </div>

        <h1 className="hero-title" style={{ fontSize: 'clamp(36px, 6vw, 64px)', marginBottom: 14 }}>
          Moved cities? Keep your taste.
        </h1>

        <p className="hero-sub" style={{ margin: '0 auto 32px', fontSize: 'clamp(16px, 2.5vw, 20px)', maxWidth: 720, lineHeight: 1.5 }}>
          TasteTransplant finds the places in your new city that match what you love, using Qloo’s taste graph.
        </p>

        {/* Hero Actions: Prominent Try the Demo Button + Custom Build Button */}
        <div className="row" style={{ justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <TryDemoButton
            label="⚡ Try the Demo (Pune → Berlin)"
            style={{
              padding: '14px 32px',
              fontSize: 16,
              background: 'linear-gradient(90deg, #0071e3 0%, #00d2ff 100%)',
              border: 'none',
              boxShadow: '0 6px 24px rgba(0, 113, 227, 0.45)',
            }}
          />

          <Link href="/onboarding" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: 16 }}>
            <span>Build Your Taste Map</span>
            <span>&gt;</span>
          </Link>
        </div>
      </section>

      {/* Hero Feature Banner: Compare Page Differentiator */}
      <section style={{ marginBottom: 60 }}>
        <div
          className="card"
          style={{
            background: 'linear-gradient(180deg, #1d1628 0%, #121017 100%)',
            border: '1px solid rgba(191, 90, 242, 0.35)',
            borderRadius: 24,
            padding: '28px 32px',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.7)',
          }}
        >
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ maxWidth: 660 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span className="chip" style={{ background: 'rgba(191, 90, 242, 0.15)', color: '#bf5af2', border: '1px solid rgba(191, 90, 242, 0.3)', fontSize: 11 }}>
                  ⚖️ The Core Differentiator
                </span>
                <span className="chip chip-verified" style={{ fontSize: 11 }}>
                  Qloo-grounded picks
                </span>
              </div>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 700, margin: '4px 0 8px', letterSpacing: '-0.02em', color: '#fff' }}>
                Same user, same city: LLM guesses vs Qloo knows.
              </h2>
              <p className="sub" style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                Plain LLMs recommend from general popularity and echo your inputs back as place names. See the side-by-side benchmark: the LLM matched names, not taste — Qloo matched your cultural signals.
              </p>
            </div>

            <div>
              <Link
                href="/compare/4tpk4dgk"
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(90deg, #9b51e0 0%, #bf5af2 100%)',
                  border: 'none',
                  padding: '12px 24px',
                  fontSize: 15,
                  boxShadow: '0 4px 20px rgba(191, 90, 242, 0.4)',
                }}
              >
                <span>View Live Benchmark (Berlin)</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Guided Journey Section */}
      <section style={{ marginBottom: 70 }}>
        <div
          className="card"
          style={{
            background: 'linear-gradient(180deg, #18191d 0%, #101114 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 28,
            padding: '36px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 32px' }}>
            <span className="chip" style={{ marginBottom: 10, background: 'rgba(255, 255, 255, 0.08)', color: '#fff' }}>
              How It Works
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: '6px 0', letterSpacing: '-0.02em' }}>
              From Taste Profile to Local Grounding
            </h2>
            <p className="sub" style={{ fontSize: 14 }}>
              Follow three simple steps or launch the one-click demo to see Qloo in action.
            </p>
          </div>

          {/* 3 Steps Bento Grid */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
            {/* Step 1 */}
            <div className="card" style={{ background: '#1c1c1f', padding: '24px', borderRadius: 18, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>🎨</span>
                <span className="chip" style={{ fontSize: 11, background: '#0071e3', color: '#fff' }}>Step 1</span>
              </div>
              <h3 style={{ color: '#fff', fontSize: 17, marginBottom: 8, fontWeight: 600 }}>1. Curate Taste Fingerprint</h3>
              <p className="sub" style={{ fontSize: 13, lineHeight: 1.5 }}>
                Select your favorite music artists, films, restaurants, and cultural icons that define who you are.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ background: '#1c1c1f', padding: '24px', borderRadius: 18, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>✈️</span>
                <span className="chip" style={{ fontSize: 11, background: '#0071e3', color: '#fff' }}>Step 2</span>
              </div>
              <h3 style={{ color: '#fff', fontSize: 17, marginBottom: 8, fontWeight: 600 }}>2. Choose Destination</h3>
              <p className="sub" style={{ fontSize: 13, lineHeight: 1.5 }}>
                Pick where you are moving. Our Qloo agent cross-references taste affinities into that city’s local scene.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ background: '#1c1c1f', padding: '24px', borderRadius: 18, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>🔓</span>
                <span className="chip chip-verified" style={{ fontSize: 11 }}>Step 3</span>
              </div>
              <h3 style={{ color: '#fff', fontSize: 17, marginBottom: 8, fontWeight: 600 }}>3. Ground & Explore</h3>
              <p className="sub" style={{ fontSize: 13, lineHeight: 1.5 }}>
                Generating unlocks your verified Google Map pins, Taste DNA tags, AI concierge, and LLM comparison.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Apple Bento Grid Features: Engineered for Taste Fidelity */}
      <section style={{ marginBottom: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 10 }}>
            Engineered for Cultural Fidelity.
          </h2>
          <p className="sub" style={{ fontSize: 17, maxWidth: 640, margin: '0 auto' }}>
            Why simple prompts fail, and how grounded taste intelligence changes relocation.
          </p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {/* Card 1 */}
          <div className="card" style={{ padding: 28, borderRadius: 22 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🛡️</div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>Strict Grounding Guarantee</h3>
            <p className="sub">
              Every pick is returned directly by Qloo’s API. A plain LLM recommends from general popularity and can’t prove why a place matches you. TasteTransplant enforces strict grounding: the AI only writes the explanation.
            </p>
          </div>

          {/* Card 2 */}
          <div className="card" style={{ padding: 28, borderRadius: 22 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🌐</div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>Cross-Domain Intelligence</h3>
            <p className="sub">
              Love Radiohead and Blade Runner? Qloo maps non-geographic affinities (music, cinema, fashion)
              into spatial cultural equivalents across Berlin, Tokyo, or Toronto.
            </p>
          </div>

          {/* Card 3 */}
          <div className="card" style={{ padding: 28, borderRadius: 22 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗺️</div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>Interactive Map & Google Navigation</h3>
            <p className="sub">
              Every recommended venue is plotted on an interactive map. Tap any pin for instant Google Maps directions, neighborhood highlights, and turn-by-turn navigation.
            </p>
          </div>

          {/* Card 4 */}
          <div className="card" style={{ padding: 28, borderRadius: 22 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>Transparent API Evidence</h3>
            <p className="sub">
              Inspect the exact Qloo endpoint, signals, and filters behind every single recommendation. Full transparency with zero hidden black-box logic.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ textAlign: 'center', padding: '60px 20px', background: 'radial-gradient(ellipse at center, rgba(0, 113, 227, 0.15) 0%, rgba(0,0,0,0) 70%)' }}>
        <h2 style={{ fontSize: 40, fontWeight: 700, marginBottom: 14 }}>
          Never feel like a stranger again.
        </h2>
        <p className="sub" style={{ fontSize: 18, marginBottom: 28 }}>
          Build your personalized city Taste Map in under two minutes or launch the demo now.
        </p>
        <div className="row" style={{ justifyContent: 'center', gap: 14 }}>
          <TryDemoButton
            label="⚡ Try the Demo (Pune → Berlin)"
            style={{ padding: '14px 34px', fontSize: 16 }}
          />
          <Link href="/onboarding" className="btn btn-secondary" style={{ padding: '14px 30px', fontSize: 16 }}>
            Build My Taste Map
          </Link>
        </div>
      </section>
    </main>
  );
}
