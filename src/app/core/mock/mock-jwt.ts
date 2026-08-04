import { User } from '../models/user.model';

function base64UrlEncode(value: string): string {
  const base64 = btoa(unescape(encodeURIComponent(value)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Produces a real-shaped (header.payload.signature) but UNSIGNED token —
 * enough to exercise expiry/claims handling in the frontend. The signature
 * segment is a placeholder; a genuine HMAC/RSA-signed JWT must come from the
 * .NET API's `/auth/login` endpoint in production.
 */
export function createMockJwt(user: User, ttlMinutes = 480): { token: string; expiresAt: string } {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + ttlMinutes * 60;

  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    sub: user.id,
    unique_name: user.username,
    email: user.email,
    role: user.roles,
    iat: now,
    exp
  };

  const token = [
    base64UrlEncode(JSON.stringify(header)),
    base64UrlEncode(JSON.stringify(payload)),
    base64UrlEncode(`mock-signature-${user.id}-${now}`)
  ].join('.');

  return { token, expiresAt: new Date(exp * 1000).toISOString() };
}
