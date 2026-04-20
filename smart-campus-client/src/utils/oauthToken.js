/**
 * Read JWT from OAuth redirect. Primary: ?token= on /oauth-success (Spring encodes + as %2B).
 * Fallback: #token= (legacy) if present.
 */
export function parseOAuthTokenFromWindow() {
  const { hash, search } = window.location;

  const q = new URLSearchParams(search);
  const fromQuery = q.get('token');
  if (fromQuery) return normalizeJwtFromUrl(fromQuery);

  if (hash && hash.length > 1) {
    const params = new URLSearchParams(hash.slice(1));
    const t = params.get('token');
    if (t) return normalizeJwtFromUrl(t);
  }

  return null;
}

/** Fix rare case where '+' was decoded as space in query strings. */
export function normalizeJwtFromUrl(t) {
  if (!t) return null;
  if (t.includes('.') && t.includes(' ') && !t.includes('+')) {
    return t.replace(/ /g, '+');
  }
  return t;
}
