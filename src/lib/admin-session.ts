/**
 * Admin session cookie constants — single source of truth.
 *
 * Kept dependency-free (no `next/headers`, no server-only imports) so it can
 * be safely imported by proxy.ts, which runs in the Proxy runtime where
 * `next/headers` is unavailable.
 */
export const COOKIE_NAME = 'wag_admin_session';
export const SESSION_TOKEN = 'wag-admin-authenticated';
