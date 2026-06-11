import { describe, it, expect, afterEach, vi } from 'vitest';
import { rateLimit, clientIp } from '@/lib/rate-limit';

afterEach(() => {
  vi.useRealTimers();
});

describe('rateLimit', () => {
  it('allows up to the limit, then blocks', () => {
    const key = `t1-${Math.random()}`;
    for (let i = 0; i < 5; i++) expect(rateLimit(key, 5, 60_000)).toBe(true);
    expect(rateLimit(key, 5, 60_000)).toBe(false);
  });

  it('resets after the window elapses', () => {
    vi.useFakeTimers();
    const key = `t2-${Math.random()}`;
    for (let i = 0; i < 5; i++) rateLimit(key, 5, 60_000);
    expect(rateLimit(key, 5, 60_000)).toBe(false);
    vi.advanceTimersByTime(61_000);
    expect(rateLimit(key, 5, 60_000)).toBe(true);
  });

  it('tracks keys independently', () => {
    const a = `t3a-${Math.random()}`;
    const b = `t3b-${Math.random()}`;
    expect(rateLimit(a, 1, 60_000)).toBe(true);
    expect(rateLimit(a, 1, 60_000)).toBe(false);
    expect(rateLimit(b, 1, 60_000)).toBe(true);
  });
});

describe('clientIp', () => {
  it('takes the first x-forwarded-for hop', () => {
    const req = new Request('http://x', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(clientIp(req)).toBe('1.2.3.4');
  });

  it('falls back to unknown', () => {
    expect(clientIp(new Request('http://x'))).toBe('unknown');
  });
});
