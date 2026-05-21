/**
 * POST /api/admin/rebuild-portfolio
 *
 * Re-runs scripts/build-pdf.mjs to produce a fresh public/portfolio.pdf
 * from the live /portfolio/print page. Locked by a file flag so two
 * admins can't trigger overlapping builds.
 *
 * Auth: requires the wag_admin_session cookie (same as the rest of /admin).
 * The global middleware doesn't catch /api/admin/* routes, so we check
 * the cookie here directly.
 *
 * Response: { ok, sizeBytes, durationMs, mtime } or { ok: false, error }
 */
import { NextRequest } from 'next/server';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, statSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const runtime  = 'nodejs';
export const dynamic  = 'force-dynamic';

const COOKIE_NAME    = 'wag_admin_session';
const SESSION_TOKEN  = 'wag-admin-authenticated';
const OUT_PATH       = join(process.cwd(), 'public', 'portfolio.pdf');
const LOCK_PATH      = join(process.cwd(), '.next', 'cache', 'portfolio-build.lock');
const SCRIPT_PATH    = join(process.cwd(), 'scripts', 'build-pdf.mjs');

function authorized(request: NextRequest): boolean {
  return request.cookies.get(COOKIE_NAME)?.value === SESSION_TOKEN;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return jsonResponse({ ok: false, error: 'unauthorized' }, 401);
  }

  // Cleanup stale lock (>10 min old) — protects against crashed earlier runs.
  if (existsSync(LOCK_PATH)) {
    const age = Date.now() - statSync(LOCK_PATH).mtimeMs;
    if (age > 10 * 60_000) {
      unlinkSync(LOCK_PATH);
    } else {
      return jsonResponse({ ok: false, error: 'build already in progress' }, 409);
    }
  }

  mkdirSync(dirname(LOCK_PATH), { recursive: true });
  writeFileSync(LOCK_PATH, String(Date.now()));

  const t0 = Date.now();
  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(
        process.platform === 'win32' ? 'node.exe' : 'node',
        [SCRIPT_PATH],
        {
          cwd: process.cwd(),
          stdio: 'inherit',
          env: { ...process.env, PRINT_URL: process.env.PRINT_URL ?? 'http://localhost:3000/portfolio/print' },
        },
      );
      proc.on('error', reject);
      proc.on('exit', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`build-pdf.mjs exited with code ${code}`));
      });
    });

    const stat = statSync(OUT_PATH);
    return jsonResponse({
      ok: true,
      sizeBytes: stat.size,
      durationMs: Date.now() - t0,
      mtime: stat.mtime.toISOString(),
    });
  } catch (err) {
    return jsonResponse(
      { ok: false, error: String(err), durationMs: Date.now() - t0 },
      500,
    );
  } finally {
    if (existsSync(LOCK_PATH)) unlinkSync(LOCK_PATH);
  }
}
