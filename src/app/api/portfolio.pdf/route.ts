/**
 * GET /api/portfolio.pdf
 *
 * Generates the WAG portfolio PDF on demand from the current site data.
 * Always fresh — content reflects the live Supabase state (with seed
 * fallback). Cached at the edge for 5 minutes to avoid hammering on
 * repeated downloads.
 *
 * Query params:
 *   ?download=1   → forces attachment Content-Disposition (download dialog)
 *   default       → inline (renders in browser PDF viewer)
 */
import { NextRequest } from 'next/server';
import { generatePortfolioPdf } from '@/lib/pdf/generate';

export const runtime = 'nodejs';        // react-pdf needs node fs/path
export const dynamic = 'force-dynamic'; // never statically cache the route handler

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const download = url.searchParams.get('download') === '1';

  try {
    const t0 = Date.now();
    const buffer = await generatePortfolioPdf();
    const ms = Date.now() - t0;

    const disposition = download
      ? 'attachment; filename="WAG-portfolio.pdf"'
      : 'inline; filename="WAG-portfolio.pdf"';

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'X-Render-Time-Ms': String(ms),
      },
    });
  } catch (err) {
    const stack = err instanceof Error ? err.stack : String(err);
    console.error('[portfolio.pdf] generation failed:\n', stack);
    return new Response(
      JSON.stringify({ error: 'PDF generation failed', detail: String(err), stack }, null, 2),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
