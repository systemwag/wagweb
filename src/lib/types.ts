// ============================================================
// WAG — Shared TypeScript Types
// ============================================================

export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  year: number;
  image_url: string | null;
  images: string[] | null;  // Supabase Storage URLs
  slug: string;
  tags: string[] | null;
  length: string | null;
  // Map fields
  status: 'completed' | 'in-progress' | 'planned';
  x_map: number | null;   // SVG coordinate 0–1024
  y_map: number | null;   // SVG coordinate 0–800
  coords_label: string | null; // e.g. "51.18° N, 71.44° E"
  // Homepage feature flag
  featured: boolean;
  created_at: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  direction: 'design' | 'construction' | 'control';
  order_index: number;
  created_at: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface ContactRecord extends ContactSubmission {
  id: number;
  created_at: string;
}

export type ProjectCategory =
  | 'Железнодорожная инфраструктура'
  | 'Инженерные изыскания'
  | 'Промышленные объекты'
  | 'Коммуникации'
  | 'Геодезия'
  | 'Проектирование';

export interface NavLink {
  label: string;
  href: string;
}

export type DesignCategory = 'full-cycle' | 'design' | 'documentation' | 'feasibility';

// ── Maintenance & Current Repair ─────────────────────────────────

export type WorkType =
  | 'current_maintenance'   // Текущее содержание
  | 'current_repair'        // Текущий ремонт / Ремонт
  | 'medium_repair'         // Средний ремонт
  | 'capital_repair'        // Капитальный ремонт
  | 'inspection'            // Осмотр и дефектация
  | 'reconstruction';       // Реконструкция / Перебортовка / Укрепление

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  current_maintenance: 'Текущее содержание',
  current_repair:      'Текущий ремонт',
  medium_repair:       'Средний ремонт',
  capital_repair:      'Капитальный ремонт',
  inspection:          'Осмотр и дефектация',
  reconstruction:      'Реконструкция',
};

export interface MaintenanceProject {
  id:          number;
  slug:        string;
  title:       string;
  description: string;
  client:      string | null;
  location:    string;
  period:      string;         // free text: "2020" or "2018-2020" or "с 2020 по настоящее время"
  work_type:   WorkType;
  image_url:   string | null;
  images:      string[] | null;
  status:      'completed' | 'ongoing';
  tags:        string[] | null;
  featured:    boolean;
  created_at:  string;
}

export interface Testimonial {
  id: number;
  client: string;
  signatory: string;
  role: string;
  date_label: string | null;
  category: string;
  project: string;
  quote: string;
  order_index: number;
  published: boolean;
  created_at: string;
}

export interface Partner {
  id: number;
  name: string;
  logo_url: string;
  order_index: number;
  published: boolean;
  created_at: string;
}

export interface DesignProject {
  id: number;
  number: number;
  client: string;
  works: string[];
  category: DesignCategory;
  location: string | null;
  year: number | null;
  status: 'completed' | 'in-progress';
  slug: string;
  description: string | null;
  featured: boolean;
  created_at: string;
}
