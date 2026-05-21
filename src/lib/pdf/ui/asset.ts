/**
 * Read a static asset from /public synchronously and return a Buffer.
 *
 * @react-pdf/renderer's <Image src> accepts strings (URLs / file paths)
 * but in the Next.js + Turbopack runtime the relative-path form fails
 * silently — the page renders with a blank Image element. Reading the
 * file as a Buffer at component eval time always works.
 *
 * Used by blocks that embed local images: Map (KZ baked PNG), ISO
 * (cert images), License (scans), Partners (logos).
 */
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const cache = new Map<string, { mtime: number; buf: Buffer }>();

/**
 * Cache keyed on file mtime, so editing/replacing the source file is
 * picked up on the next request without a server restart.
 */
export function assetBuffer(relPath: string): Buffer {
  const abs = path.resolve(process.cwd(), 'public' + (relPath.startsWith('/') ? relPath : '/' + relPath));
  const mtime = statSync(abs).mtimeMs;
  const cached = cache.get(relPath);
  if (cached && cached.mtime === mtime) return cached.buf;
  const buf = readFileSync(abs);
  cache.set(relPath, { mtime, buf });
  return buf;
}
