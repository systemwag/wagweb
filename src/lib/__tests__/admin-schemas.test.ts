import { describe, it, expect } from 'vitest';
import {
  ContactSubmissionSchema,
  ProjectSchema,
  MapCoordsSchema,
  parseOr400,
} from '@/lib/admin-schemas';

describe('ContactSubmissionSchema', () => {
  const valid = {
    name: 'Иван',
    email: 'ivan@company.kz',
    phone: '+7 777 123 45 67',
    message: 'Нужна смета по подъездному пути.',
    website: '',
  };

  it('accepts a valid submission', () => {
    expect(ContactSubmissionSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a bad email', () => {
    expect(ContactSubmissionSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects an empty message', () => {
    expect(ContactSubmissionSchema.safeParse({ ...valid, message: '  ' }).success).toBe(false);
  });

  it('accepts a filled honeypot at the schema level (route drops it silently)', () => {
    const r = ContactSubmissionSchema.safeParse({ ...valid, website: 'spam.com' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.website).toBe('spam.com');
  });
});

describe('ProjectSchema', () => {
  it('strips unknown/injected fields', () => {
    const result = ProjectSchema.parse({
      title: 'Путь',
      slug: 'put',
      id: 999,
      created_at: 'hacked',
      is_admin: true,
    } as Record<string, unknown>);
    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('created_at');
    expect(result).not.toHaveProperty('is_admin');
  });

  it('requires title and slug', () => {
    expect(ProjectSchema.safeParse({ title: 'x' }).success).toBe(false);
    expect(ProjectSchema.safeParse({ slug: 'x' }).success).toBe(false);
  });

  it('validates enum status', () => {
    expect(ProjectSchema.safeParse({ title: 'x', slug: 'x', status: 'demolished' }).success).toBe(false);
  });
});

describe('MapCoordsSchema', () => {
  it('accepts coordinate updates', () => {
    expect(MapCoordsSchema.safeParse([{ id: 1, x_map: 512, y_map: 400 }]).success).toBe(true);
  });

  it('rejects non-numeric ids', () => {
    expect(MapCoordsSchema.safeParse([{ id: 'x', x_map: 1, y_map: 2 }]).success).toBe(false);
  });
});

describe('parseOr400', () => {
  it('returns data on success and error string on failure', () => {
    const ok = parseOr400(MapCoordsSchema, []);
    expect('data' in ok).toBe(true);
    const bad = parseOr400(MapCoordsSchema, 'nope');
    expect('error' in bad).toBe(true);
  });
});
