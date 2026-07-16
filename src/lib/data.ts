/**
 * Data-fetching layer.
 * All functions are safe to call from Server Components (RSC).
 * Falls back to static seed data when Supabase is not configured or a query
 * fails (see `withSeedFallback`).
 */

import { unstable_cache } from 'next/cache';
import { createServerClient } from './supabase-server';
import type { Project, Service, DesignProject, MaintenanceProject, WorkType, Testimonial, Partner } from './types';
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
    description: 'Разработка ПСД и рабочей документации, сопровождение прохождения государственной экспертизы, авторский надзор.',
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

export function isSupabaseConfigured(): boolean {
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

// ── Testimonials (client letters) ──────────────────────────────
// Real letters addressed to West Capital Construction LLP (the group's
// contracting entity) — text is verbatim, do not rename the company.

const SEED_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    client: 'ТОО «УКИЗ Актобе» · Aktobe Industrial Zone',
    signatory: 'Тулебаев А. Н.', role: 'Директор',
    date_label: '5 января 2020',
    category: 'Содержание · 4,5 км',
    project:
      'Текущее содержание и обслуживание подъездного железнодорожного пути в Индустриальной Зоне Актобе. 6 стрелочных переводов, 4,5 км путей, повышенный путь 140 м, две рампы 140 м, сливо-наливная эстакада для СУГ, 5 водопропускных труб ⌀1 м, 7 переездов.',
    quote:
      'За время сотрудничества текущее содержание и обслуживание подъездных железнодорожных путей ТОО «УКИЗ «Актобе» осуществляется квалифицированными специалистами. Качественно и своевременно устраняются все дефекты. Ответственность и профессионализм работников West Capital Construction LLP позволяют нам быть уверенными в безопасной эксплуатации наших подъездных железнодорожных путей.',
    order_index: 0, published: true, created_at: '',
  },
  {
    id: 2,
    client: 'ТОО «Актюбинская медная компания»',
    signatory: 'Бондаренко Н. С.', role: 'Генеральный директор',
    date_label: null,
    category: 'Перебортовка · 63 км',
    project:
      'Перебортовка старогодней рельсошпальной решётки в объёме 63 км на базе АМК, п. Коктау, Хромтауский район.',
    quote:
      'Со своей стороны хотим отметить высококвалифицированный персонал, который ответственно подошёл к выполнению поставленных задач, и качественно в установленные договором сроки выполнил данные работы. West Capital Construction LLP имеет всю необходимую технику и оборудование для выполнения как демонтажных, так и строительно-монтажных работ.',
    order_index: 1, published: true, created_at: '',
  },
  {
    id: 3,
    client: 'ТОО «Актюбинская медная компания»',
    signatory: 'Бондаренко Н. С.', role: 'Генеральный директор',
    date_label: null,
    category: 'Содержание · 7,2 км + 20 км',
    project:
      'Текущее содержание подъездных путей АМК в Коктау общей протяжённостью 7,2 км, 9 стрелочных переводов, 5 погрузочно-выгрузочных путей. Дочерняя ТОО «КазГеоруд» — соединительный участок ст. Жем — Терминал, 4 пути по 20 км.',
    quote:
      'Техническое обслуживание и текущее содержание такого путевого развития требует большой ответственности и профессионального внимания. Был заключён договор с West Capital Construction LLP, т. к. их специалисты зарекомендовали себя как профессиональные и добросовестные работники.',
    order_index: 2, published: true, created_at: '',
  },
  {
    id: 4,
    client: 'ТОО «Актюбинская медная компания»',
    signatory: 'Бондаренко Н. С.', role: 'Генеральный директор',
    date_label: '21 сентября 2018',
    category: 'Реконструкция · ст. Рудная',
    project:
      'Строительство соединительных путей в рамках реконструкции внутриплощадочных путей по станции Рудная. Соединительный путь № 7, путь № 1С, повышенные пути № 12 и № 13, энергетическая часть.',
    quote:
      'Сотрудники компании оперативно и качественно решали многочисленные вопросы, возникающие в процессе строительства. Все этапы дальнейшего строительства West Capital Construction LLP терпеливо согласовывала с руководством ТОО «АМК», чтобы учесть все наши пожелания. Профессионализм и добросовестность позволяют нам рекомендовать их как надёжную команду для строительных проектов любой сложности.',
    order_index: 3, published: true, created_at: '',
  },
  {
    id: 5,
    client: 'ТОО «Зерде-Керамика Актобе»',
    signatory: 'Тлеукабылов Е. Р.', role: 'Директор',
    date_label: 'Сентябрь 2021',
    category: 'Строительство · 481 м',
    project:
      'Подъездной железнодорожный путь общей протяжённостью 481 м: повышенный путь 126 м, погрузочно-выгрузочная рампа 70 м, круглая ж/б водопропускная труба ⌀1 м, неохраняемый ж/д переезд.',
    quote:
      'Учитывая добросовестность и ответственность работников West Capital Construction LLP, а также серьёзный подход к выполняемой работе, мы уверены в безопасности эксплуатации железнодорожного пути и надеемся на дальнейшее сотрудничество.',
    order_index: 4, published: true, created_at: '',
  },
  {
    id: 6,
    client: 'ТОО «Зерде-Керамика Актобе»',
    signatory: 'Тлеукабылов Е. Р.', role: 'Директор',
    date_label: null,
    category: 'Демонтаж · 6,7 км',
    project:
      'Демонтажные работы на ст. Айтеке Би. Демонтировано 6,7 км пути и 7 стрелочных переводов, выполнена переборка и складирование материалов верхнего строения пути по группам годности.',
    quote:
      'Ваши специалисты справились с выполнением данных работ качественно и в установленные сроки, что подтверждает Вашу ответственность и подготовленность. Учитывая, что Ваша компания работала с нами при строительстве объектов и при обслуживании путей, а теперь и при демонтажных работах, мы выражаем готовность на ещё более плодотворную работу.',
    order_index: 5, published: true, created_at: '',
  },
  {
    id: 7,
    client: 'ТОО «Компания Фаэтон»',
    signatory: 'Русманова В. Ю.', role: 'Директор',
    date_label: '20 октября 2018',
    category: 'Содержание · рампа 70 м',
    project:
      'Техническое обслуживание и текущее содержание подъездного железнодорожного пути. Погрузочно-выгрузочная рампа 70 м, круглая ж/б водопропускная труба ⌀1 м, два неохраняемых переезда с настилом из ж/б плит, кюветы для отвода талых вод.',
    quote:
      'Сотрудники West Capital Construction LLP отличаются ответственностью, добропорядочностью и профессионализмом. Обход, осмотр и исправление дефектов подъездного пути осуществляется качественно и своевременно. Ответственность, добросовестность и профессионализм работников дают нам уверенность в безопасной эксплуатации нашего подъездного железнодорожного пути.',
    order_index: 6, published: true, created_at: '',
  },
  {
    id: 8,
    client: 'ТОО «АлтынНұран»',
    signatory: 'Мурзабеков Ж. Н.', role: 'Директор',
    date_label: 'С сентября 2019',
    category: 'Содержание · 115 м',
    project:
      'Текущее содержание и обслуживание подъездного железнодорожного пути общей протяжённостью 115 м с вагонными железнодорожными весами в г. Актобе.',
    quote:
      'Все работы по текущему содержанию железнодорожного пути и сооружений выполнялись высококвалифицированными специалистами. Учитывая добросовестность и ответственность работников, а также серьёзный подход к выполняемой работе, мы уверены в безопасности эксплуатации железнодорожного пути и надеемся на дальнейшее сотрудничество.',
    order_index: 7, published: true, created_at: '',
  },
  {
    id: 9,
    client: 'ТОО «Синтез Урал»',
    signatory: 'Морозов С. А.', role: 'Директор',
    date_label: 'С ноября 2024',
    category: 'Строительство · 500 м',
    project:
      'Строительство подъездного железнодорожного пути ТОО «Синтез Урал» к объекту по производству смесевых продуктов мощностью 20 тыс. тонн в год. ЗКО, г. Уральск, с. Кардон, ст. Кардон, ст-е 1/1. Общая протяжённость 500 м, сливо-наливная эстакада для СУГ, вагонные весы, лебёдка.',
    quote:
      'Хочется отметить профессионализм и ответственность работников West Capital Construction LLP, а также оперативность решения вопросов, возникавших в ходе строительства. Высокий уровень организационной работы позволил качественно и в срок сдать объект в эксплуатацию.',
    order_index: 8, published: true, created_at: '',
  },
  {
    id: 10,
    client: 'ТОО «Portal KZ»',
    signatory: 'Нышанов М. М.', role: 'Директор',
    date_label: null,
    category: 'Строительство · ст. Никельтау',
    project:
      'Строительство железнодорожного подъездного пути по ст. Никельтау, Актюбинского отделения перевозок АО «НК «КТЖ» — «Грузовые перевозки».',
    quote:
      'Строительство выполнено с чётким соблюдением всех условий договора: работа была выполнена в срок, в соответствии с техническим заданием. Следует отметить также высокий уровень организационной работы. В процессе выполнения рабочей документации между нашими организациями сложилась хорошая практика оперативного взаимодействия.',
    order_index: 9, published: true, created_at: '',
  },
  {
    id: 11,
    client: 'ИП «Жанажанов Б. С.»',
    signatory: 'Жанажанов Б. С.', role: 'Индивидуальный предприниматель',
    date_label: null,
    category: 'Строительство · 200 м',
    project:
      'Строительство железнодорожного подъездного пути на ст. Жинишке, филиал АО «НК «КТЖ» — Актюбинское отделение магистральной сети. Подъездной путь 200 м, вагонные весы, подкрановый путь с козловым краном.',
    quote:
      'Благодаря профессиональному подходу к выполнению своей работы сотрудниками West Capital Construction LLP строительство нашего железнодорожного пути необщего пользования было завершено раньше намеченного срока, при этом качество и надёжность построенного объекта достойны самых высоких оценок.',
    order_index: 10, published: true, created_at: '',
  },
  {
    id: 12,
    client: 'ТОО «Нефтестройсервис ЛТД» · NSS',
    signatory: 'Отаров Р. К.', role: 'Директор',
    date_label: '01 ноября 2022',
    category: 'Строительство · ст. Тендык',
    project:
      'Строительство железнодорожного подъездного пути на базе ТОО «Нефтестройсервис ЛТД» по ст. Тендык, филиала АО «НК «КТЖ» — Атырауское отделение магистральной сети. Атырауская область, Геологский а/о, аул Новокирпичный.',
    quote:
      'Работы были выполнены в соответствии с действующими строительными нормами и правилами, согласно техническому заданию и условиям контракта, с надлежащим качеством и в установленный срок. West Capital Construction LLP проявила себя как высокопрофессиональная компания с наличием квалифицированных кадров.',
    order_index: 11, published: true, created_at: '',
  },
  {
    id: 13,
    client: 'ЧЛ «Ни К. А.»',
    signatory: 'Ни К. А.', role: 'Частный заказчик',
    date_label: null,
    category: 'Строительство · 41 разъезд',
    project:
      'Строительство подъездного железнодорожного пути по станции Актобе-II, филиала АО «НК «КТЖ» — Грузовые перевозки. г. Актобе, район Алматы, 41 разъезд, участок № 547.',
    quote:
      'Компания показала себя как исполнительный подрядчик, выполняющий договорные обязательства с превосходным качеством работ и в установленные сроки. Применяемые компанией современные методы строительства верхнего строения железнодорожного пути и импортные материалы позволяют вести строительство и ремонт объектов с превосходным качеством.',
    order_index: 12, published: true, created_at: '',
  },
  {
    id: 14,
    client: 'ТОО «СП «Сине Мидас Строй»',
    signatory: 'Иманкулова Б. Т.', role: 'Исполнительный директор',
    date_label: null,
    category: 'Демонтаж · 850 м',
    project:
      'Демонтаж подъездного железнодорожного пути на станции Ногайты, филиал «КТЖ» — «Актюбинское отделение магистральной сети» протяжённостью 850 м и повышенного пути 288 м из бетонных блоков.',
    quote:
      'Не можем не отметить высокий профессионализм работников West Capital Construction LLP, а также максимальную ответственность при выполнении поставленных задач. Учитывая то, что работы выполнены в установленные сроки и их качество не оставляет сомнений, надеемся на ещё более тесное сотрудничество.',
    order_index: 13, published: true, created_at: '',
  },
  {
    id: 15,
    client: 'ТОО «ПГС-Тамды»',
    signatory: 'Испанов А. К.', role: 'Директор',
    date_label: null,
    category: 'Строительство · ст. Тамды',
    project:
      'Строительство железнодорожного подъездного пути на базе «ПГС-Тамды» по ст. Тамды, Актюбинского отделения АО «НК «КТЖ». РК, г. Актобе.',
    quote:
      'Профессиональный и ответственный подход к выполнению своей работы сотрудниками West Capital Construction LLP обеспечили строительство нашего железнодорожного пути необщего пользования в стационарный путь «на окно». Все согласования и переговоры с организациями АО «НК «КТЖ» велись своевременно.',
    order_index: 14, published: true, created_at: '',
  },
];

const _getAllTestimonials = unstable_cache(
  () => withSeedFallback('testimonials-all', SEED_TESTIMONIALS, async (supabase) => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('order_index', { ascending: true })
      .order('id', { ascending: true });
    if (error) throw error;
    return (data as Testimonial[]) ?? [];
  }),
  ['testimonials-all'],
  { revalidate: 60 }
);

export async function getTestimonials(): Promise<Testimonial[]> {
  // Published filter applied client-side so seed and DB behave the same.
  const all = await _getAllTestimonials();
  return all.filter((t) => t.published);
}

// ── Partners (logo marquee) ────────────────────────────────────
// Logo files live in /public/partners; logo_url is the URL-encoded path.

const SEED_PARTNER_FILES: { file: string; name: string }[] = [
  { file: '9.png',          name: 'Қазақстан Темір Жолы' },
  { file: '1.png',          name: 'Русская Медная Компания' },
  { file: '5554453.png',    name: 'Урал Синтез' },
  { file: '645b7c47-e4a5-4c84-b1ef-17bd24e7e09d.jpg', name: 'Группа Синтез' },
  { file: '4.png',          name: 'Shubarkol Premium' },
  { file: '7.png',          name: 'Altynex' },
  { file: 'metprom-logo-rus-Photoroom.png',             name: 'Метпром' },
  { file: '1637e7d5-4f7c-42f8-a84d-5aeef15cf0a6.jpg',  name: 'Тенізшевройл' },
  { file: '20bd4962-9777-4243-9b6d-e953b080c142.jpg',  name: 'Khorgos Gateway' },
  { file: 'QB_-01_1__.png', name: 'Qazaq Bitum' },
  { file: '5.png',          name: 'NSS' },
  { file: '3.png',          name: 'Синe Мидас Строй' },
  { file: '6.png',          name: 'Актобе Стекло' },
  { file: 'Снимок экрана 2025-06-21 162017-Photoroom.png', name: 'СПК «Актобе»' },
  { file: '7a29c2e4-bc43-4817-8212-f7e985ee9929.jpg',  name: 'СПС Энерго' },
  { file: '2.png',          name: 'Зерде Керамика' },
];

const SEED_PARTNERS: Partner[] = SEED_PARTNER_FILES.map((p, i) => ({
  id: i + 1,
  name: p.name,
  logo_url: `/partners/${p.file.split('/').map(encodeURIComponent).join('/')}`,
  order_index: i,
  published: true,
  created_at: '',
}));

const _getAllPartners = unstable_cache(
  () => withSeedFallback('partners-all', SEED_PARTNERS, async (supabase) => {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('order_index', { ascending: true })
      .order('id', { ascending: true });
    if (error) throw error;
    return (data as Partner[]) ?? [];
  }),
  ['partners-all'],
  { revalidate: 60 }
);

export async function getPartners(): Promise<Partner[]> {
  // Published filter applied client-side so seed and DB behave the same.
  const all = await _getAllPartners();
  return all.filter((p) => p.published);
}

// ── Design Projects (fetchers) ────────────────────────────────

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
