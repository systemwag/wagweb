import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createSessionToken,
  verifySessionToken,
  timingSafeEqualStr,
  SESSION_MAX_AGE,
} from '@/lib/admin-session';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.SESSION_SECRET = 'test-secret';
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.useRealTimers();
});

describe('admin session token', () => {
  it('round-trips a freshly minted token', async () => {
    const token = await createSessionToken();
    expect(token).toBeTruthy();
    expect(await verifySessionToken(token)).toBe(true);
  });

  it('rejects a tampered signature', async () => {
    const token = (await createSessionToken())!;
    const [exp, sig] = token.split('.');
    const flipped = sig.slice(0, -1) + (sig.endsWith('0') ? '1' : '0');
    expect(await verifySessionToken(`${exp}.${flipped}`)).toBe(false);
  });

  it('rejects a tampered expiry', async () => {
    const token = (await createSessionToken())!;
    const [exp, sig] = token.split('.');
    expect(await verifySessionToken(`${Number(exp) + 9999999}.${sig}`)).toBe(false);
  });

  it('rejects an expired token', async () => {
    vi.useFakeTimers();
    const token = await createSessionToken();
    vi.advanceTimersByTime((SESSION_MAX_AGE + 60) * 1000);
    expect(await verifySessionToken(token)).toBe(false);
  });

  it('fails closed without a configured secret', async () => {
    delete process.env.SESSION_SECRET;
    delete process.env.ADMIN_PASSWORD;
    expect(await createSessionToken()).toBeNull();
    expect(await verifySessionToken('123.abc')).toBe(false);
  });

  it('rejects the legacy static cookie value', async () => {
    expect(await verifySessionToken('wag-admin-authenticated')).toBe(false);
  });

  it('rejects garbage inputs', async () => {
    expect(await verifySessionToken(undefined)).toBe(false);
    expect(await verifySessionToken('')).toBe(false);
    expect(await verifySessionToken('no-dot-here')).toBe(false);
    expect(await verifySessionToken('.justasig')).toBe(false);
  });
});

describe('timingSafeEqualStr', () => {
  it('compares correctly', () => {
    expect(timingSafeEqualStr('abc', 'abc')).toBe(true);
    expect(timingSafeEqualStr('abc', 'abd')).toBe(false);
    expect(timingSafeEqualStr('abc', 'ab')).toBe(false);
  });
});
