import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COOKIE_NAME, SESSION_TOKEN } from '@/lib/admin-session';

export { COOKIE_NAME, SESSION_TOKEN };

/** True if the current request carries a valid admin session cookie. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === SESSION_TOKEN;
}

/**
 * Guard for `/api/admin/*` route handlers. Returns a 401 response if the
 * caller is not authenticated, or `null` if the request may proceed.
 *
 * NOTE: proxy.ts only matches page routes under `/admin`. API routes under
 * `/api/admin` are NOT covered by the proxy matcher, so every mutating
 * handler must call this guard itself.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null;
  return NextResponse.json({ ok: false, error: 'Не авторизовано' }, { status: 401 });
}

/** Safe error message — avoids leaking stack traces / non-Error internals. */
export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Внутренняя ошибка';
}
