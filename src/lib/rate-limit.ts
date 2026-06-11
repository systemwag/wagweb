/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * Per-instance only (resets on restart, not shared across serverless
 * instances) — adequate as a brute-force/spam speed bump for this site's
 * single-instance deployment. Swap for Redis/KV if the site is ever scaled
 * horizontally.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

/** Returns true if the call is allowed, false if the limit is exceeded. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, b] of buckets) if (now > b.resetAt) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

/** Best-effort client IP (behind a proxy/CDN the first XFF hop). */
export function clientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    'unknown'
  );
}
