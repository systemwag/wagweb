/**
 * Admin session token — HMAC-signed, expiring.
 *
 * Kept dependency-free (no `next/headers`, no `node:crypto`) so it can be
 * safely imported by proxy.ts, which runs in the Proxy runtime where only
 * Web Crypto (`globalThis.crypto`) is available.
 *
 * Token format: `<expiryMs>.<hmacSha256Hex(expiryMs, secret)>`
 * Secret: SESSION_SECRET env var, falling back to ADMIN_PASSWORD. With no
 * secret configured, token creation/verification fails closed.
 */
export const COOKIE_NAME = 'wag_admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours, in seconds

function getSecret(): string {
  return process.env.SESSION_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim() || '';
}

async function hmacHex(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Constant-time string comparison (both inputs are hex of equal length in the happy path). */
export function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Mint a signed session token, or null when no secret is configured (fail closed). */
export async function createSessionToken(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const exp = Date.now() + SESSION_MAX_AGE * 1000;
  return `${exp}.${await hmacHex(String(exp), secret)}`;
}

/** Verify signature and expiry of a session token. */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;

  const dot = token.indexOf('.');
  if (dot <= 0) return false;

  const expStr = token.slice(0, dot);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;

  const expected = await hmacHex(expStr, secret);
  return timingSafeEqualStr(expected, token.slice(dot + 1));
}
