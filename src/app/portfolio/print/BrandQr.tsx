import QRCode from 'qrcode';
import { WAG_TRIANGLE, WAG_TRIANGLE_W, WAG_TRIANGLE_H } from './wagTriangle';

/* ─────────────────────────────────────────────────────────────────
   Branded QR for the print pages: dark rounded modules on the cream
   brochure card, gold WAG triangle in the centre — the same drawing as
   scripts/build-brand-qr.mjs (light · rounded · gold), but built inline,
   so in the PDF it is vector outlines, not an image.
   Error correction H (~30 % recoverable) covers the logo cut-out (~6 % of
   the modules) many times over; finders, timing and format areas stay
   untouched. Keep URLs short (e.g. youtu.be/<id> without ?si=): fewer
   modules → bigger modules at the same print size → easier to scan.
   ───────────────────────────────────────────────────────────────── */

const QUIET = 3;          // quiet zone in modules, inside the card
const LOGO_SHARE = 0.24;  // side of the logo cut-out, share of the code side
const BG = '#F8EFE0';     // cream card, as the registry QR codes on page 10
const FG = '#04060C';

/** Rounded rect as path data; r = 0 gives a plain square. */
function rr(x: number, y: number, w: number, h: number, r: number) {
  if (!r) return `M${x},${y}h${w}v${h}h${-w}z`;
  return `M${x + r},${y}h${w - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}`
    + `a${r},${r} 0 0 1 ${-r},${r}h${-(w - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}`
    + `v${-(h - 2 * r)}a${r},${r} 0 0 1 ${r},${-r}z`;
}

export default function BrandQr({
  url,
  gradientId,
  className,
}: {
  url: string;
  /* Unique per page: SVG gradient ids are document-global. */
  gradientId: string;
  className?: string;
}) {
  const { modules } = QRCode.create(url, { errorCorrectionLevel: 'H' });
  const n = modules.size;

  // Finder patterns (7×7) are drawn separately, rounded.
  const finders = [[0, 0], [0, n - 7], [n - 7, 0]];
  const inFinder = (r: number, c: number) =>
    finders.some(([fr, fc]) => r >= fr && r < fr + 7 && c >= fc && c < fc + 7);

  // Centred logo cut-out on whole modules (same parity as n).
  let cut = Math.round(n * LOGO_SHARE);
  if (cut % 2 !== n % 2) cut += 1;
  const from = (n - cut) / 2;
  const inCut = (r: number, c: number) => r >= from && r < from + cut && c >= from && c < from + cut;

  let data = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (modules.get(r, c) && !inFinder(r, c) && !inCut(r, c)) data += rr(QUIET + c, QUIET + r, 1, 1, 0.3);
    }
  }
  // Ring + core in one even-odd path: outer filled, inner hollow, core filled.
  const finderPath = finders
    .map(([fr, fc]) => {
      const x = QUIET + fc, y = QUIET + fr;
      return rr(x, y, 7, 7, 2) + rr(x + 1, y + 1, 5, 5, 1.4) + rr(x + 2, y + 2, 3, 3, 0.9);
    })
    .join('');

  const side = n + QUIET * 2;
  const logoW = cut * 0.82;
  const logoH = logoW * (WAG_TRIANGLE_H / WAG_TRIANGLE_W);

  return (
    <svg viewBox={`0 0 ${side} ${side}`} className={className} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`QR: ${url}`}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4A843" />
          <stop offset="50%" stopColor="#F0C85A" />
          <stop offset="100%" stopColor="#C49A30" />
        </linearGradient>
      </defs>
      <rect width={side} height={side} rx={1.2} fill={BG} />
      <path d={data} fill={FG} />
      <path d={finderPath} fill={FG} fillRule="evenodd" />
      <g transform={`translate(${side / 2 - logoW / 2} ${side / 2 - logoH / 2}) scale(${logoW / WAG_TRIANGLE_W})`}>
        <path d={WAG_TRIANGLE} fill={`url(#${gradientId})`} />
      </g>
    </svg>
  );
}
