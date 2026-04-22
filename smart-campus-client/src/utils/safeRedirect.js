/**
 * Returns an in-app path safe to use after login, or null.
 * Rejects open redirects and external URLs.
 */
export function getSafeRedirectPath(candidate) {
  if (candidate == null || typeof candidate !== 'string') return null;
  const t = candidate.trim();
  if (!t.startsWith('/') || t.startsWith('//')) return null;
  if (/^(https?:|\/\/|javascript:)/i.test(t)) return null;
  if (t.includes('@')) return null;
  return t;
}
