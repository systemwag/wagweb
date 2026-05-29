import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, SESSION_TOKEN, errorMessage } from '@/lib/admin-auth';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const MAX_AGE = 60 * 60 * 24; // 24 hours

export async function POST(req: Request) {
  try {
    if (!ADMIN_PASSWORD) {
      // Fail closed: never allow login with an unset/default password.
      return NextResponse.json(
        { ok: false, error: 'Сервер не настроен: ADMIN_PASSWORD не задан' },
        { status: 500 },
      );
    }

    const { password } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'Неверный пароль' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, SESSION_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: MAX_AGE,
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
