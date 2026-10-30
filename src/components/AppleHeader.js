'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AppleHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [destination, setDestination] = useState(null);
  const [activeSlug, setActiveSlug] = useState(null);
  const [showLockedModal, setShowLockedModal] = useState(null);

  useEffect(() => {
    // 1. Check if user is currently viewing a plan or compare page with a slug
    const planMatch = pathname.match(/^\/(?:plan|compare)\/([^/]+)/);
    if (planMatch && planMatch[1]) {
      const slug = planMatch[1];
      setActiveSlug(slug);
      try {
        sessionStorage.setItem('lastSlug', slug);
      } catch {
        // ignore
      }
    }

    // 2. Read from sessionStorage if previously generated/saved
    try {
      const savedDest = sessionStorage.getItem('tasteDestination');
      const savedSlug = sessionStorage.getItem('lastSlug');
      if (savedDest) setDestination(savedDest);
      if (savedSlug) setActiveSlug(savedSlug);
    } catch {
      // ignore
    }

    // 3. Listen for dynamic updates when the user types/picks a destination or generates a plan
    const handleDestUpdate = (e) => {
      if (e.detail?.destination) {
        setDestination(e.detail.destination);
      }
      if (e.detail?.slug) {
        setActiveSlug(e.detail.slug);
      }
    };

    window.addEventListener('tasteDestinationChanged', handleDestUpdate);
    return () => window.removeEventListener('tasteDestinationChanged', handleDestUpdate);
  }, [pathname]);

  function launchQuickDemo() {
    try {
      sessionStorage.setItem('picked', JSON.stringify([
        { qlooId: 'radiohead', name: 'Radiohead', type: 'music' },
        { qlooId: 'blade_runner', name: 'Blade Runner', type: 'film' },
        { qlooId: 'studio_ghibli', name: 'Studio Ghibli', type: 'film' },
        { qlooId: 'daft_punk', name: 'Daft Punk', type: 'music' },
        { qlooId: 'ramen', name: 'Ramen', type: 'food' },
      ]));
      sessionStorage.setItem('tasteDestination', 'London');
      sessionStorage.setItem('lastSlug', 'mbl4rya2');
      setActiveSlug('mbl4rya2');
      setDestination('London');
      window.dispatchEvent(
        new CustomEvent('tasteDestinationChanged', {
          detail: { destination: 'London', slug: 'mbl4rya2' },
        })
      );
    } catch {
      // ignore
    }
    router.push('/plan/mbl4rya2');
  }

  function handleLockedClick(featureName) {
    setShowLockedModal(featureName);
  }

  // If destination is known, show "${destination} Map", otherwise just "Map"
  const mapLinkText = destination ? `${destination} Map` : 'Map';

  return (
    <>
      <header className="apple-nav">
        <div className="apple-nav-inner">
          <Link href="/" className="apple-nav-logo">
            {/* Custom Modern TasteTransplant Logo */}
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="tt-logo-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#00d2ff" />
                  <stop offset="45%" stopColor="#0071e3" />
                  <stop offset="100%" stopColor="#9b51e0" />
                </linearGradient>
              </defs>
              {/* Outer Compass / Taste Orbital Ring */}
              <circle cx="16" cy="16" r="14" stroke="url(#tt-logo-grad)" strokeWidth="2" strokeDasharray="4 2" opacity="0.9" />
              {/* Inner Cultural Anchor & Pin Geometry */}
              <path
                d="M16 5C11.03 5 7 9.03 7 14C7 19.2 14.1 26.6 15.35 27.88C15.71 28.25 16.29 28.25 16.65 27.88C17.9 26.6 25 19.2 25 14C25 9.03 20.97 5 16 5ZM16 17.5C14.07 17.5 12.5 15.93 12.5 14C12.5 12.07 14.07 10.5 16 10.5C17.93 10.5 19.5 12.07 19.5 14C19.5 15.93 17.93 17.5 16 17.5Z"
                fill="url(#tt-logo-grad)"
              />
              {/* Center Core Node */}
              <circle cx="16" cy="14" r="2.2" fill="#ffffff" />
            </svg>
            <span style={{ fontWeight: 700, letterSpacing: '-0.02em', marginLeft: 2 }}>TasteTransplant</span>
          </Link>

          <nav>
            <ul className="apple-nav-links">
              <li>
                <Link href="/" className={pathname === '/' ? 'active' : ''}>
                  Overview
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className={pathname === '/onboarding' ? 'active' : ''}>
                  Build Taste Map
                </Link>
              </li>
              <li>
                <Link href="/destination" className={pathname === '/destination' ? 'active' : ''}>
                  Destinations
                </Link>
              </li>

              {/* Map Link: Only accessible once a plan has been generated */}
              <li>
                {activeSlug ? (
                  <Link
                    href={`/plan/${activeSlug}`}
                    className={pathname.startsWith('/plan') ? 'active' : ''}
                  >
                    {mapLinkText}
                  </Link>
                ) : (
                  <Link
                    href="/plan/mbl4rya2"
                    title="View demo plan — or generate your own"
                    style={{ color: '#86868b', opacity: 0.7 }}
                    onClick={launchQuickDemo}
                  >
                    {mapLinkText}
                  </Link>
                )}
              </li>

              {/* Compare LLM Link: Only accessible once a plan has been generated */}
              <li>
                {activeSlug ? (
                  <Link
                    href={`/compare/${activeSlug}`}
                    className={pathname.startsWith('/compare') ? 'active' : ''}
                  >
                    Compare LLM
                  </Link>
                ) : (
                  <Link
                    href="/compare/mbl4rya2"
                    title="View demo LLM comparison — or generate your own"
                    style={{ color: '#86868b', opacity: 0.7 }}
                    onClick={launchQuickDemo}
                  >
                    Compare LLM
                  </Link>
                )}
              </li>
            </ul>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={launchQuickDemo}
              className="apple-nav-action"
              style={{
                background: 'linear-gradient(90deg, #9b51e0 0%, #0071e3 100%)',
                border: 'none',
                padding: '4px 12px',
                fontSize: 12,
                cursor: 'pointer',
              }}
              title="Launch the instant Pune → London demonstration plan"
            >
              ⚡ Demo
            </button>
            <Link href="/onboarding" className="apple-nav-action" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Locked Feature Guidance Modal */}
      {showLockedModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
          onClick={() => setShowLockedModal(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: 440,
              width: '100%',
              background: '#1c1c1e',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 24,
              padding: 32,
              textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                marginBottom: 16,
              }}
            >
              🔒
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
              {showLockedModal} is Locked
            </h3>

            <p className="sub" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              To view the interactive map and LLM comparison, you need to first build your taste profile and generate your personalized relocation plan, or try the instant demo.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: 15,
                  background: 'linear-gradient(90deg, #9b51e0 0%, #0071e3 100%)',
                  border: 'none',
                }}
                onClick={() => {
                  setShowLockedModal(null);
                  launchQuickDemo();
                }}
              >
                ⚡ Launch Instant Demo (Pune → Berlin)
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', padding: '12px 20px', fontSize: 15 }}
                onClick={() => {
                  setShowLockedModal(null);
                  router.push('/onboarding');
                }}
              >
                Build Custom Profile (Step 1) →
              </button>

              <button
                type="button"
                className="btn-ghost"
                style={{ width: '100%', fontSize: 13, color: '#86868b' }}
                onClick={() => setShowLockedModal(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
