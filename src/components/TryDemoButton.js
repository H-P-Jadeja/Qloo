'use client';
import { useRouter } from 'next/navigation';

export const DEMO_ENTITIES = [
  { qlooId: 'radiohead', name: 'Radiohead', type: 'music' },
  { qlooId: 'blade_runner', name: 'Blade Runner', type: 'film' },
  { qlooId: 'studio_ghibli', name: 'Studio Ghibli', type: 'film' },
  { qlooId: 'daft_punk', name: 'Daft Punk', type: 'music' },
  { qlooId: 'ramen', name: 'Ramen', type: 'food' },
];

export default function TryDemoButton({
  label = '⚡ Try the Demo (Pune → London)',
  style = {},
  className = 'btn btn-primary',
  targetSlug = 'cnidwx59',
  targetCity = 'London',
}) {
  const router = useRouter();

  function launchDemo() {
    try {
      sessionStorage.setItem('picked', JSON.stringify(DEMO_ENTITIES));
      sessionStorage.setItem('tasteDestination', targetCity);
      sessionStorage.setItem('lastSlug', targetSlug);
      window.dispatchEvent(
        new CustomEvent('tasteDestinationChanged', {
          detail: { destination: targetCity, slug: targetSlug },
        })
      );
    } catch {
      // ignore
    }
    router.push(`/plan/${targetSlug}`);
  }

  return (
    <button
      type="button"
      onClick={launchDemo}
      className={className}
      style={{
        cursor: 'pointer',
        ...style,
      }}
    >
      <span>{label}</span>
      <span>→</span>
    </button>
  );
}

