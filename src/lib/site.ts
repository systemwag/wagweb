/**
 * Canonical public site origin. Override per-environment with
 * NEXT_PUBLIC_SITE_URL (e.g. a preview deploy); falls back to production.
 * No trailing slash.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://westarlangroup.kz'
).replace(/\/$/, '');
