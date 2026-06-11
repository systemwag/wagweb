import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME, verifySessionToken } from '@/lib/admin-session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
  // /api/admin/auth must stay open — it's the login endpoint itself.
  const isAdminApi = pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/auth');

  if (isAdminPage || isAdminApi) {
    const valid = await verifySessionToken(request.cookies.get(COOKIE_NAME)?.value);

    if (!valid) {
      if (isAdminApi) {
        return NextResponse.json({ ok: false, error: 'Не авторизовано' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Route handlers under /api/admin re-check the session via requireAdmin()
  // (defense in depth) — but the proxy is the first gate for both surfaces.
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
