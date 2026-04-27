/**
 * Data-fetching layer.
 * All functions are safe to call from Server Components (RSC).
 * Falls back to static seed data when Supabase is not configured.
 */

import { unstable_cache } from 'next/cache';
import { createServerClient } from './supabase-server';
import type { Project, Service, DesignProject } from './types';
import { SQL_PROJECTS } from './sql-projects';

// ── Seed data (used as fallback / initial content) ─────────────
// Real 48 projects sourced from supabase_migration_projects.sql
const SEED_PROJECTS: Project[] = SQL_PROJECTS;

// Legacy stub (kept disabled, was 10 placeholder projects)
const _LEGACY_SEED_PROJECTS: Project[] = [
  {
    id: 1,
    slug: 'rekonstrukciya-almaty-shymkent',
    title: 'Реконструкция ж/д пути Алматы — Шымкент',
    description: 'Капитальный ремонт и модернизация 420 км главного хода. Укладка бесстыкового пути, замена переездов, устройство защитных лесополос.',
    category: 'Железнодорожная инфраструктура',
    location: 'Южно-Казахстанская область',
    year: 2023, length: '420 км',
    tags: ['Путевые работы', 'Балластировка', 'СЦБ'],
    image_url: '/Gemini_Generated_Image_ddlu49ddlu49ddlu.webp', images: null, status: 'completed', featured: true,
    x_map: 599, y_map: 504, coords_label: '42.31° N, 69.59° E',
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 2,
    slug: 'izyskaniya-novaya-magistral',
    title: 'Инженерные изыскания для новой магистрали',
    description: 'Комплексные инженерные изыскания для строительства скоростной магистрали протяжённостью 280 км в Центральном Казахстане.',
    category: 'Инженерные изыскания',
    location: 'Карагандинская область',
    year: 2023, length: '280 км',
    tags: ['Геодезия', 'Геология', 'Гидрология'],
    image_url: '/Gemini_Generated_Image_m0dhtzm0dhtzm0dh.webp', images: null, status: 'in-progress', featured: true,
    x_map: 561, y_map: 335, coords_label: '49.80° N, 73.10° E',
    created_at: '2023-03-01T00:00:00Z',
  },
  {
    id: 3,
    slug: 'depo-servisnyy-centr-astana',
    title: 'Строительство депо и сервисного центра',
    description: 'Проектирование и строительство современного депо для ТО и ремонта локомотивов с полным инженерным обеспечением.',
    category: 'Промышленные объекты',
    location: 'Астана',
    year: 2022, length: '48 000 м²',
    tags: ['Строительство', 'Инженерия', 'Под ключ'],
    image_url: '/Gemini_Generated_Image_nlvoxnlvoxnlvoxn.webp', images: null, status: 'completed', featured: true,
    x_map: 606, y_map: 260, coords_label: '51.18° N, 71.45° E',
    created_at: '2022-05-01T00:00:00Z',
  },
  {
    id: 4,
    slug: 'vodosnabzhenie-turkestan',
    title: 'Водоснабжение Туркестанской области',
    description: 'Прокладка магистральных водоводов и строительство насосных станций для обеспечения водой 12 населённых пунктов.',
    category: 'Коммуникации',
    location: 'Туркестанская область',
    year: 2022, length: '85 км',
    tags: ['Водоснабжение', 'Насосные станции'],
    image_url: null, images: null, status: 'completed', featured: false,
    x_map: 514, y_map: 585, coords_label: '43.30° N, 68.27° E',
    created_at: '2022-08-01T00:00:00Z',
  },
  {
    id: 5,
    slug: 'razezdy-saryagash',
    title: 'Строительство разъездов ст. Сарыагаш',
    description: 'Увеличение пропускной способности участка за счёт строительства дополнительных путей и модернизации станционных устройств.',
    category: 'Железнодорожная инфраструктура',
    location: 'Сарыагаш',
    year: 2021, length: '3 разъезда',
    tags: ['Путевые работы', 'Электрификация'],
    image_url: null, images: null, status: 'completed', featured: false,
    x_map: 556, y_map: 556, coords_label: '41.46° N, 69.17° E',
    created_at: '2021-04-01T00:00:00Z',
  },
  {
    id: 6,
    slug: 'monitoring-deformaciy-aktobe',
    title: 'Мониторинг деформаций ж/д полотна',
    description: 'Внедрение системы непрерывного мониторинга состояния пути с применением современных геодезических технологий.',
    category: 'Геодезия',
    location: 'Актюбинская область',
    year: 2021, length: '160 км',
    tags: ['Геодезия', 'BIM', 'Мониторинг'],
    image_url: '/Gemini_Generated_Image_ruq4dwruq4dwruq4.webp', images: null, status: 'completed', featured: true,
    x_map: 231, y_map: 316, coords_label: '50.28° N, 57.21° E',
    created_at: '2021-09-01T00:00:00Z',
  },
  {
    id: 7,
    slug: 'amk-zhd-puti-aktobe',
    title: 'Ж/д подъездные пути АМК (1-я, 2-я, 3-я очередь)',
    description: 'Генеральный подрядчик строительства и капитального ремонта железнодорожных подъездных путей для Актюбинской медной компании.',
    category: 'Железнодорожная инфраструктура',
    location: 'Актобе',
    year: 2020, length: 'Под ключ',
    tags: ['Генподряд', 'Подъездные пути', 'Капремонт'],
    image_url: null, images: null, status: 'completed', featured: true,
    x_map: 259, y_map: 307, coords_label: '50.17° N, 57.13° E',
    created_at: '2020-02-01T00:00:00Z',
  },
  {
    id: 8,
    slug: 'zerde-keramika-puti',
    title: 'Ж/д пути ТОО «Зерде-Керамика Актобе»',
    description: 'Строительство железнодорожных подъездных путей к производственному объекту в полном соответствии с нормами ж/д строительства РК.',
    category: 'Железнодорожная инфраструктура',
    location: 'Актобе',
    year: 2019, length: 'Подъездной путь',
    tags: ['Подъездные пути', 'Промышленность'],
    image_url: null, images: null, status: 'completed', featured: false,
    x_map: 239, y_map: 292, coords_label: '50.14° N, 57.10° E',
    created_at: '2019-06-01T00:00:00Z',
  },
  {
    id: 9,
    slug: 'port-aktau-infrastruktura',
    title: 'Инфраструктура порта Актау',
    description: 'Строительство инженерных сетей и железнодорожных путей на территории морского порта для обеспечения перевалки грузов.',
    category: 'Железнодорожная инфраструктура',
    location: 'Актау',
    year: 2022, length: '12 км',
    tags: ['Портовая инфраструктура', 'Путевые работы'],
    image_url: null, images: null, status: 'completed', featured: false,
    x_map: 82, y_map: 512, coords_label: '43.65° N, 51.15° E',
    created_at: '2022-01-01T00:00:00Z',
  },
  {
    id: 10,
    slug: 'astana-nurly-zhol-izyskaniya',
    title: 'Изыскания трассы Астана — Нурлы Жол',
    description: 'Топографическая съёмка и инженерно-геологические изыскания для проектирования нового железнодорожного участка.',
    category: 'Инженерные изыскания',
    location: 'Астана',
    year: 2023, length: '95 км',
    tags: ['Геодезия', 'Геология'],
    image_url: null, images: null, status: 'in-progress', featured: false,
    x_map: 575, y_map: 287, coords_label: '51.22° N, 71.60° E',
    created_at: '2023-06-01T00:00:00Z',
  },
];

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

// ── Helper to check if Supabase is configured ──────────────────
function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'
  );
}

// ── Projects ───────────────────────────────────────────────────

const _getAllProjects = unstable_cache(
  async (): Promise<Project[]> => {
    if (!isSupabaseConfigured()) return SEED_PROJECTS;

    try {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      return (data as Project[]) ?? [];
    } catch {
      return SEED_PROJECTS;
    }
  },
  ['projects-all'],
  { revalidate: 60 }
);

export async function getProjects(category?: string): Promise<Project[]> {
  const all = await _getAllProjects();
  return category ? all.filter((p) => p.category === category) : all;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!isSupabaseConfigured()) {
    return SEED_PROJECTS.find((p) => p.slug === slug) ?? null;
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data as Project;
  } catch {
    return SEED_PROJECTS.find((p) => p.slug === slug) ?? null;
  }
}

export async function getProjectSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return SEED_PROJECTS.map((p) => p.slug);
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from('projects').select('slug');
    if (error) throw error;
    return (data ?? []).map((r: { slug: string }) => r.slug);
  } catch {
    return SEED_PROJECTS.map((p) => p.slug);
  }
}

// ── Services ───────────────────────────────────────────────────

export async function getServices(
  direction?: Service['direction']
): Promise<Service[]> {
  if (!isSupabaseConfigured()) {
    return direction
      ? SEED_SERVICES.filter((s) => s.direction === direction)
      : SEED_SERVICES;
  }

  try {
    const supabase = createServerClient();
    let query = supabase
      .from('services')
      .select('*')
      .order('order_index', { ascending: true });

    if (direction) {
      query = query.eq('direction', direction);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as Service[]) ?? [];
  } catch {
    return direction
      ? SEED_SERVICES.filter((s) => s.direction === direction)
      : SEED_SERVICES;
  }
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
  async (): Promise<DesignProject[]> => {
    if (!isSupabaseConfigured()) return SEED_DESIGN_PROJECTS;

    try {
      const supabase = createServerClient();
      const { data, error } = await supabase
        .from('design_projects')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      return (data as DesignProject[]) ?? [];
    } catch {
      return SEED_DESIGN_PROJECTS;
    }
  },
  ['design-projects-all'],
  { revalidate: 60 }
);

export async function getDesignProjects(category?: string): Promise<DesignProject[]> {
  const all = await _getAllDesignProjects();
  return category ? all.filter((p) => p.category === category) : all;
}

export async function getDesignProjectById(id: number): Promise<DesignProject | null> {
  if (!isSupabaseConfigured()) {
    return SEED_DESIGN_PROJECTS.find((p) => p.id === id) ?? null;
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('design_projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as DesignProject;
  } catch {
    return SEED_DESIGN_PROJECTS.find((p) => p.id === id) ?? null;
  }
}

export async function getDesignProjectBySlug(slug: string): Promise<DesignProject | null> {
  if (!isSupabaseConfigured()) {
    return SEED_DESIGN_PROJECTS.find((p) => p.slug === slug) ?? null;
  }

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('design_projects')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data as DesignProject;
  } catch {
    return SEED_DESIGN_PROJECTS.find((p) => p.slug === slug) ?? null;
  }
}
