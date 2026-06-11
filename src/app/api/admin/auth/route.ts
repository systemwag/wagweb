import { createHash, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { errorMessage } from '@/lib/admin-auth';
import { COOKIE_NAME, SESSION_MAX_AGE, createSessionToken } from '@/lib/admin-session';
import { rateLimit, clientIp } from '@/lib/rate-limit';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/** Timing-safe password check: compare SHA-256 digests so lengths always match. */
function passwordMatches(candidate: string, actual: string): boolean {
  const a = createHash('sha256').update(candidate, 'utf8').digest();
  const b = createHash('sha256').update(actual, 'utf8').digest();
  return timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  try {
    if (!ADMIN_PASSWORD) {
      // Fail closed: never allow login with an unset/default password.
      return NextResponse.json(
        { ok: false, error: 'Сервер не настроен: ADMIN_PASSWORD не задан' },
        { status: 500 },
      );
    }

    // Brute-force speed bump: 5 attempts per 15 minutes per IP.
    if (!rateLimit(`auth:${clientIp(req)}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { ok: false, error: 'Слишком много попыток. Попробуйте через 15 минут.' },
        { status: 429 },
      );
    }

    const { password } = await req.json();

    if (typeof password !== 'string' || !passwordMatches(password, ADMIN_PASSWORD)) {
      return NextResponse.json({ ok: false, error: 'Неверный пароль' }, { status: 401 });
    }

    const token = await createSessionToken();
    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Сервер не настроен: секрет сессии не задан' },
        { status: 500 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
