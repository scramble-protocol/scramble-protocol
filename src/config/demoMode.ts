/**
 * Demo mode detection — returns true if ?demo=true URL param
 * or VITE_DEMO_MODE=true env var is set.
 * Synchronous and deterministic per page load.
 */
export function isDemoMode(): boolean {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'true') {
      return true;
    }
  }

  return import.meta.env.VITE_DEMO_MODE === 'true';
}
