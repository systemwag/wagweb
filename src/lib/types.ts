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
