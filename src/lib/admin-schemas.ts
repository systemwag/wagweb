import { z } from 'zod';

/**
 * Zod schemas for admin CRUD payloads.
 *
 * Zod strips unknown keys by default, so parsed output contains only the
 * columns listed here — `id`, `created_at` and arbitrary injected fields are
 * silently discarded. DB-level NOT NULL constraints remain the final guard
 * for missing columns (surfaced via dbErrorMessage as code 23502).
 */

const nullableStr = z.string().max(2000).nullable().optional();
const imageList = z.array(z.string().max(2000)).max(100).nullable().optional();
const tagList = z.array(z.string().max(200)).max(50).nullable().optional();
const mapCoord = z.number().min(-2000).max(3000).nullable().optional();

export const ProjectSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
  category: z.string().max(200).optional(),
  location: z.string().max(500).optional(),
  year: z.number().int().min(1950).max(2100).optional(),
  image_url: nullableStr,
  images: imageList,
  slug: z.string().min(1).max(200),
  tags: tagList,
  length: nullableStr,
  status: z.enum(['completed', 'in-progress', 'planned']).optional(),
  x_map: mapCoord,
  y_map: mapCoord,
  coords_label: nullableStr,
  featured: z.boolean().optional(),
});
export const ProjectUpdateSchema = ProjectSchema.partial();

export const DesignProjectSchema = z.object({
  number: z.number().int().min(0).max(100000).optional(),
  client: z.string().max(500).optional(),
  works: z.array(z.string().max(1000)).max(100).optional(),
  category: z.enum(['full-cycle', 'design', 'documentation', 'feasibility']).optional(),
  location: nullableStr,
  year: z.number().int().min(1950).max(2100).nullable().optional(),
  status: z.enum(['completed', 'in-progress']).optional(),
  slug: z.string().min(1).max(200),
  description: z.string().max(10000).nullable().optional(),
  featured: z.boolean().optional(),
});
export const DesignProjectUpdateSchema = DesignProjectSchema.partial();

export const MaintenanceProjectSchema = z.object({
  slug: z.string().min(1).max(200),
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
  client: nullableStr,
  location: z.string().max(500).optional(),
  period: z.string().max(200).optional(),
  work_type: z.enum([
    'current_maintenance',
    'current_repair',
    'medium_repair',
    'capital_repair',
    'inspection',
    'reconstruction',
  ]).optional(),
  image_url: nullableStr,
  images: imageList,
  status: z.enum(['completed', 'ongoing']).optional(),
  tags: tagList,
  featured: z.boolean().optional(),
});
export const MaintenanceProjectUpdateSchema = MaintenanceProjectSchema.partial();

export const MapCoordsSchema = z
  .array(
    z.object({
      id: z.number().int().positive(),
      x_map: z.number().min(-2000).max(3000).nullable(),
      y_map: z.number().min(-2000).max(3000).nullable(),
    }),
  )
  .max(500);

export const TestimonialSchema = z.object({
  client: z.string().min(1).max(500),
  signatory: z.string().max(300).optional(),
  role: z.string().max(300).optional(),
  date_label: z.string().max(200).nullable().optional(),
  category: z.string().max(300).optional(),
  project: z.string().max(5000).optional(),
  quote: z.string().min(1).max(10000),
  order_index: z.number().int().min(0).max(10000).optional(),
  published: z.boolean().optional(),
});
export const TestimonialUpdateSchema = TestimonialSchema.partial();

export const PartnerSchema = z.object({
  name: z.string().min(1).max(300),
  logo_url: z.string().min(1).max(2000),
  order_index: z.number().int().min(0).max(10000).optional(),
  published: z.boolean().optional(),
});
export const PartnerUpdateSchema = PartnerSchema.partial();

export const ContactSubmissionSchema = z.object({
  name: z.string().trim().min(1, 'Укажите имя').max(300),
  email: z.string().trim().email('Некорректный email').max(320),
  phone: z.string().trim().max(50).optional().or(z.literal('')),
  message: z.string().trim().min(1, 'Введите сообщение').max(5000),
  // Honeypot — accepted by the schema so bots get a normal-looking response;
  // the route silently drops submissions where it is non-empty.
  website: z.string().max(500).optional(),
});

/** Parse helper: returns parsed data or a ready 400-style error string. */
export function parseOr400<T>(schema: z.ZodType<T>, input: unknown): { data: T } | { error: string } {
  const result = schema.safeParse(input);
  if (result.success) return { data: result.data };
  const first = result.error.issues[0];
  return { error: `Некорректные данные: ${first?.path.join('.') || 'тело запроса'} — ${first?.message || 'ошибка валидации'}` };
}
