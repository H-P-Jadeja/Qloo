'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TryDemoButton from '@/components/TryDemoButton';

export default function PlanIndexPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const savedSlug = sessionStorage.getItem('lastSlug');
      if (savedSlug) {
        router.replace(`/plan/${savedSlug}`);
        return;
      }
    } catch {
      // ignore
    }
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <main style={{ padding: '80px 20px', textAlign: 'center' }}>
        <p className="sub">Checking your taste plan...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '80px 20px 120px', textAlign: 'center', maxWidth: 540, margin: '0 auto' }}>
      <div
        className="card"
        style={{
          background: 'linear-gradient(180deg, #18191d 0%, #121316 100%)',
          borderRadius: 24,
          padding: 40,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 30,
            marginBottom: 20,
          }}
        >
          🔒
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
          Taste Map is Locked
        </h1>

        <p className="sub" style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
          You cannot access the interactive map and cultural recommendations until you generate a taste relocation plan.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TryDemoButton
            label="⚡ Try the Demo (Pune → Berlin)"
            style={{ width: '100%', padding: '12px 24px', fontSize: 15 }}
          />
          <Link href="/onboarding" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: 15 }}>
            Build Your Taste Profile (Step 1) →
          </Link>
          <Link href="/" className="btn-ghost" style={{ fontSize: 13, color: '#86868b' }}>
            ← Return to Overview
          </Link>
        </div>
      </div>
    </main>
  );
}

