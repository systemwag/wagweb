/**
 * Canonical public site origin. Override per-environment with
 * NEXT_PUBLIC_SITE_URL (e.g. a preview deploy); falls back to production.
 * No trailing slash.
 *
 * ВАЖНО: хостинг 308-редиректит апекс westarlangroup.kz → www.
 * Канонический хост = www; если менять направление редиректа на хостинге,
 * синхронно поменять и здесь (и NEXT_PUBLIC_SITE_URL в проде, если задан).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://www.westarlangroup.kz'
).replace(/\/$/, '');
