/**
 * Data-fetching layer.
 * All functions are safe to call from Server Components (RSC).
 * Falls back to static seed data when Supabase is not configured or a query
 * fails (see `withSeedFallback`).
 */

import { unstable_cache } from 'next/cache';
import { createServerClient } from './supabase-server';
import type { Project, Service, DesignProject, MaintenanceProject, WorkType } from './types';
import { SQL_PROJECTS } from './sql-projects';
import { SQL_MAINTENANCE } from './sql-maintenance';

// ── Seed data (used as fallback / initial content) ─────────────
// Real projects sourced from supabase_migration_projects.sql.
// After the maintenance migration, 21 projects move to maintenance_projects
// (ids 3,4,5,6,9,10,11,13,14,17,19,20,24,25,27,28,29,30,33,34,36 in the original
// projects table). Until sql-projects.ts is regenerated post-migration, we
// filter them out from the dev seed so the СМР page stays consistent.
const MAINTENANCE_LEGACY_IDS = new Set([3, 4, 5, 6, 9, 10, 11, 13, 14, 17, 19, 20, 24, 25, 27, 28, 29, 30, 33, 34, 36]);
const SEED_PROJECTS: Project[] = SQL_PROJECTS.filter(p => !MAINTENANCE_LEGACY_IDS.has(p.id));

const SEED_SERVICES: Service[] = [
  {
    id: 1, direction: 'design', order_index: 1, icon: '📐',
    title: 'Инженерно-геодезические изыскания',
    description: 'Топографическая съёмка, разбивочные работы, мониторинг деформаций, создание геодезических сетей.',
    created_at: '',
  },
  {
    id: 2, direction: 'design', order_index: 2, icon: '🗺️',
    title: 'Инженерно-геологические изыскания',
    description: 'Бурение скважин, лабораторные испытания грунтов, оценка сейсмичности, гидрогеологические отчёты.',
    created_at: '',
  },
  {
    id: 3, direction: 'design', order_index: 3, icon: '📋',
    title: 'Проектные работы полного цикла',
    description: 'Разработка ПСД, рабочей документации, BIM-проектирование, прохождение государственной экспертизы.',
    created_at: '',
  },
  {
    id: 9, direction: 'design', order_index: 4, icon: '🧭',
    title: 'Комплексные инженерные изыскания',
    description: 'Разработка геодезических, геологических, экологических, гидрологических и археологических изысканий для обоснования проектных решений.',
    created_at: '',
  },
  {
    id: 10, direction: 'design', order_index: 5, icon: '🏭',
    title: 'Проектирование производственных объектов',
    description: 'Технологическое проектирование объектов производственного назначения: заводы, комбинаты, промышленные комплексы.',
    created_at: '',
  },
  {
    id: 11, direction: 'design', order_index: 6, icon: '🏛️',
    title: 'Проектирование жилых и гражданских объектов',
    description: 'Технологическое проектирование зданий и сооружений жилищно-гражданского назначения с учётом действующих норм и стандартов.',
    created_at: '',
  },
  {
    id: 12, direction: 'design', order_index: 7, icon: '🚆',
    title: 'Проектирование транспортной инфраструктуры',
    description: 'Технологическое проектирование объектов инфраструктуры транспорта, связи и коммуникаций, включая железнодорожные и автодорожные объекты.',
    created_at: '',
  },
  {
    id: 13, direction: 'design', order_index: 8, icon: '⚡',
    title: 'Проектирование инженерных систем и сетей',
    description: 'Разработка проектной документации для инженерных систем: электроснабжение, водоснабжение, теплоснабжение, слаботочные сети.',
    created_at: '',
  },
  {
    id: 14, direction: 'design', order_index: 9, icon: '🔩',
    title: 'Проектирование реконструкции и усиления',
    description: 'Строительное проектирование реконструкции зданий и сооружений, а также усиление несущих конструкций для каждого из направлений деятельности.',
    created_at: '',
  },
  {
    id: 4, direction: 'construction', order_index: 1, icon: '🛤️',
    title: 'Строительство ж/д инфраструктуры',
    description: 'Путевые работы, балластировка, укладка рельсошпальной решётки, строительство станций и разъездов.',
    created_at: '',
  },
  {
    id: 5, direction: 'construction', order_index: 2, icon: '🏗️',
    title: 'Инженерные коммуникации',
    description: 'Водоснабжение, канализация, теплоснабжение, газопроводы, электроснабжение.',
    created_at: '',
  },
  {
    id: 6, direction: 'construction', order_index: 3, icon: '🏢',
    title: 'Промышленное строительство',
    description: 'Производственные здания, склады, депо, технологические сооружения «под ключ».',
    created_at: '',
  },
  {
    id: 7, direction: 'control', order_index: 1, icon: '🔬',
    title: 'Строительный контроль и надзор',
    description: 'Технический надзор заказчика, авторский надзор, входной и операционный контроль качества.',
    created_at: '',
  },
  {
    id: 8, direction: 'control', order_index: 2, icon: '🚚',
    title: 'Поставка материалов и техники',
    description: 'Поставка строительных материалов, специализированной техники и путевого оборудования.',
    created_at: '',
  },
];

// ── Helpers ────────────────────────────────────────────────────

function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'
  );
}

type Supabase = ReturnType<typeof createServerClient>;

/**
 * Runs a Supabase query, falling back to `seed` when Supabase is not
 * configured or the query throws. Fallbacks are logged outside production so
 * a real DB failure is distinguishable from "Supabase not configured" (in
 * production it falls back silently, as before).
 */
async function withSeedFallback<T>(
  label: string,
  seed: T,
  query: (supabase: Supabase) => Promise<T>,
): Promise<T> {
  if (!isSupabaseConfigured()) return seed;
  try {
    return await query(createServerClient());
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[data] ${label} fell back to seed:`, e);
    }
    return seed;
  }
}

// ── Projects ───────────────────────────────────────────────────

const _getAllProjects = unstable_cache(
  () => withSeedFallback('projects-all', SEED_PROJECTS, async (supabase) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('year', { ascending: false });
    if (error) throw error;
    return (data as Project[]) ?? [];
  }),
  ['projects-all'],
  { revalidate: 60 }
);

export async function getProjects(category?: string): Promise<Project[]> {
  const all = await _getAllProjects();
  return category ? all.filter((p) => p.category === category) : all;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return withSeedFallback(
    `project:${slug}`,
    SEED_PROJECTS.find((p) => p.slug === slug) ?? null,
    async (supabase) => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data as Project;
    },
  );
}

export async function getProjectSlugs(): Promise<string[]> {
  return withSeedFallback(
    'project-slugs',
    SEED_PROJECTS.map((p) => p.slug),
    async (supabase) => {
      const { data, error } = await supabase.from('projects').select('slug');
      if (error) throw error;
      return (data ?? []).map((r: { slug: string }) => r.slug);
    },
  );
}

// ── Maintenance Projects ───────────────────────────────────────

const SEED_MAINTENANCE: MaintenanceProject[] = SQL_MAINTENANCE;

const _getAllMaintenanceProjects = unstable_cache(
  () => withSeedFallback('maintenance-all', SEED_MAINTENANCE, async (supabase) => {
    const { data, error } = await supabase
      .from('maintenance_projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as MaintenanceProject[]) ?? [];
  }),
  ['maintenance-all'],
  { revalidate: 60 }
);

export async function getMaintenanceProjects(
  workType?: WorkType
): Promise<MaintenanceProject[]> {
  const all = await _getAllMaintenanceProjects();
  return workType ? all.filter((p) => p.work_type === workType) : all;
}

export async function getMaintenanceProjectBySlug(
  slug: string
): Promise<MaintenanceProject | null> {
  return withSeedFallback(
    `maintenance:${slug}`,
    SEED_MAINTENANCE.find((p) => p.slug === slug) ?? null,
    async (supabase) => {
      const { data, error } = await supabase
        .from('maintenance_projects')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data as MaintenanceProject;
    },
  );
}

export async function getMaintenanceSlugs(): Promise<string[]> {
  return withSeedFallback(
    'maintenance-slugs',
    SEED_MAINTENANCE.map((p) => p.slug),
    async (supabase) => {
      const { data, error } = await supabase.from('maintenance_projects').select('slug');
      if (error) throw error;
      return (data ?? []).map((r: { slug: string }) => r.slug);
    },
  );
}

// ── Services ───────────────────────────────────────────────────

export async function getServices(
  direction?: Service['direction']
): Promise<Service[]> {
  const seed = direction
    ? SEED_SERVICES.filter((s) => s.direction === direction)
    : SEED_SERVICES;

  return withSeedFallback('services', seed, async (supabase) => {
    let query = supabase
      .from('services')
      .select('*')
      .order('order_index', { ascending: true });
    if (direction) query = query.eq('direction', direction);

    const { data, error } = await query;
    if (error) throw error;
    return (data as Service[]) ?? [];
  });
}

// ── Featured projects (for homepage) ──────────────────────────

export async function getFeaturedProjects(): Promise<Project[]> {
  const all = await getProjects();
  return all.filter((p) => p.featured).slice(0, 6);
}

// ── Map projects (have coordinates) ───────────────────────────

export async function getMapProjects(): Promise<Project[]> {
  const all = await getProjects();
  return all.filter((p) => p.x_map !== null && p.y_map !== null);
}

// ── Project categories (for filter UI) ────────────────────────

export function getProjectCategories(): string[] {
  return [...new Set(SEED_PROJECTS.map((p) => p.category))];
}

// ── Design Projects ────────────────────────────────────────────

const SEED_DESIGN_PROJECTS: DesignProject[] = [
  {
    id: 1, number: 12, client: 'ТОО «КазГеоруд»',
    works: ['Инженерно-геодезические и инженерно-геологические изыскания', 'Разработка трассы двух ж.д. путей для отстоя вагонов', 'Проектирование постоянных снегозащитных заборов', 'Разработка проектно-сметной документации', 'Разработка проекта организации строительства', 'Защита проектных решений при прохождении гос. экспертизы'],
    category: 'full-cycle', location: 'Актюбинская область', year: null, status: 'completed',
    slug: 'design-1', description: 'Полный цикл проектирования двух железнодорожных путей для отстоя вагонов с изысканиями, ПСД и экспертизой.', featured: true, created_at: '',
  },
  {
    id: 2, number: 51, client: 'ТОО «KTZH-Khorgos Gateway»',
    works: ['Изготовление рабочего проекта', 'Проведение инженерно-геодезических и инженерно-геологических изысканий', 'Разработка проекта организации строительства', 'Сопровождение при прохождении экспертизы в РГП «ГОСЭКСПЕРТИЗА»'],
    category: 'full-cycle', location: null, year: null, status: 'completed',
    slug: 'design-2', description: 'Рабочий проект ж.д. подъездного пути с полным циклом изысканий и прохождением государственной экспертизы.', featured: true, created_at: '',
  },
  {
    id: 3, number: 87, client: 'АО «Уральская сталь»',
    works: ['Проектирование железнодорожных путей общего пользования для комплекса по производству цельнокатаных ж.д. колёс мощностью 360 тыс. шт. в год на территории металлургического комбината АО «Уральская Сталь»'],
    category: 'design', location: 'Новотроицк', year: null, status: 'completed',
    slug: 'design-3', description: 'Проектирование железнодорожных путей для крупнейшего в СНГ комплекса по производству ж.д. колёс.', featured: true, created_at: '',
  },
  {
    id: 4, number: 62, client: 'Актюбинский сталеплавильный завод',
    works: ['Разработка ТЭО путевого железнодорожного развития на территории Актюбинского сталеплавильного завода'],
    category: 'feasibility', location: 'Актобе', year: null, status: 'completed',
    slug: 'design-4', description: 'Технико-экономическое обоснование развития путевого хозяйства для крупного металлургического предприятия.', featured: true, created_at: '',
  },
  {
    id: 5, number: 4, client: 'ИП «Жанажанов Б.С.»',
    works: ['Изготовление рабочего проекта', 'Проведение инженерно-геодезических изысканий', 'Разработка технической возможности примыкания', 'Разработка проектно-сметной документации', 'Сопровождение при прохождении ведомственных экспертиз'],
    category: 'full-cycle', location: null, year: null, status: 'completed',
    slug: 'design-5', description: 'Рабочий проект ж.д. подъездного пути с полным пакетом ПСД и экспертным сопровождением.', featured: false, created_at: '',
  },
];

const _getAllDesignProjects = unstable_cache(
  () => withSeedFallback('design-projects-all', SEED_DESIGN_PROJECTS, async (supabase) => {
    const { data, error } = await supabase
      .from('design_projects')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return (data as DesignProject[]) ?? [];
  }),
  ['design-projects-all'],
  { revalidate: 60 }
);

export async function getDesignProjects(category?: string): Promise<DesignProject[]> {
  const all = await _getAllDesignProjects();
  return category ? all.filter((p) => p.category === category) : all;
}

export async function getDesignProjectById(id: number): Promise<DesignProject | null> {
  return withSeedFallback(
    `design:id:${id}`,
    SEED_DESIGN_PROJECTS.find((p) => p.id === id) ?? null,
    async (supabase) => {
      const { data, error } = await supabase
        .from('design_projects')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as DesignProject;
    },
  );
}

export async function getDesignProjectBySlug(slug: string): Promise<DesignProject | null> {
  return withSeedFallback(
    `design:slug:${slug}`,
    SEED_DESIGN_PROJECTS.find((p) => p.slug === slug) ?? null,
    async (supabase) => {
      const { data, error } = await supabase
        .from('design_projects')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data as DesignProject;
    },
  );
}
