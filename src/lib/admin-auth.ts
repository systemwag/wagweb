import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COOKIE_NAME, verifySessionToken } from '@/lib/admin-session';

export { COOKIE_NAME };

/** True if the current request carries a valid (signed, unexpired) admin session cookie. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

/**
 * Guard for `/api/admin/*` route handlers. Returns a 401 response if the
 * caller is not authenticated, or `null` if the request may proceed.
 *
 * proxy.ts also matches /api/admin/:path* — this guard is defense in depth
 * in case a route is ever excluded from the matcher.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null;
  return NextResponse.json({ ok: false, error: 'Не авторизовано' }, { status: 401 });
}

/** Safe error message — avoids leaking stack traces / non-Error internals. */
export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Внутренняя ошибка';
}

/**
 * Sanitize a Supabase/PostgREST error for client responses: known constraint
 * violations get a human message, everything else a generic one. The raw
 * message is logged server-side instead of being returned.
 */
export function dbErrorMessage(error: { code?: string; message: string }): string {
  console.error('[admin] db error:', error.code, error.message);
  switch (error.code) {
    case '23505':
      return 'Запись с таким значением уже существует (дубликат)';
    case '23502':
      return 'Не заполнено обязательное поле';
    case '42P01':
      return 'Таблица не найдена — выполните SQL-миграцию';
    default:
      return 'Ошибка базы данных';
  }
}
