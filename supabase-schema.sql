-- ============================================================
-- WAG — Supabase Schema
-- Запусти этот файл в Supabase → SQL Editor → New query
-- ============================================================

-- ── 1. Projects ───────────────────────────────────────────────
create table if not exists projects (
  id           bigint primary key generated always as identity,
  slug         text not null unique,
  title        text not null,
  description  text not null,
  category     text not null,
  location     text not null,
  year         int  not null,
  length       text,
  tags         text[],
  image_url    text,
  status       text not null default 'completed'
                 check (status in ('completed','in-progress','planned')),
  x_map        numeric,          -- SVG координата X (0–1024)
  y_map        numeric,          -- SVG координата Y (0–800)
  coords_label text,             -- "51.18° N, 71.45° E"
  featured     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ── 2. Services ───────────────────────────────────────────────
create table if not exists services (
  id          bigint primary key generated always as identity,
  title       text not null,
  description text not null,
  icon        text not null,
  direction   text not null
                check (direction in ('design','construction','control')),
  order_index int  not null default 0,
  created_at  timestamptz not null default now()
);

-- ── 3. Contacts ───────────────────────────────────────────────
create table if not exists contacts (
  id         bigint primary key generated always as identity,
  name       text not null,
  email      text not null,
  phone      text,
  message    text not null,
  created_at timestamptz not null default now()
);

-- ── 4. Row Level Security ─────────────────────────────────────
alter table projects  enable row level security;
alter table services  enable row level security;
alter table contacts  enable row level security;

-- Публичное чтение projects и services
create policy "Public read projects"  on projects  for select using (true);
create policy "Public read services"  on services  for select using (true);

-- Запись в contacts — только INSERT (для формы обратной связи)
create policy "Public insert contacts" on contacts for insert with check (true);

-- ── 5. Seed — Projects ────────────────────────────────────────
insert into projects
  (slug, title, description, category, location, year, length, tags,
   image_url, status, x_map, y_map, coords_label, featured, created_at)
values
  ('rekonstrukciya-almaty-shymkent',
   'Реконструкция ж/д пути Алматы — Шымкент',
   'Капитальный ремонт и модернизация 420 км главного хода. Укладка бесстыкового пути, замена переездов, устройство защитных лесополос.',
   'Железнодорожная инфраструктура', 'Южно-Казахстанская область',
   2023, '420 км', array['Путевые работы','Балластировка','СЦБ'],
   null, 'completed', 720, 620, '42.31° N, 69.59° E', true, '2023-01-01'),

  ('izyskaniya-novaya-magistral',
   'Инженерные изыскания для новой магистрали',
   'Комплексные инженерные изыскания для строительства скоростной магистрали протяжённостью 280 км в Центральном Казахстане.',
   'Инженерные изыскания', 'Карагандинская область',
   2023, '280 км', array['Геодезия','Геология','Гидрология'],
   null, 'in-progress', 580, 390, '49.80° N, 73.10° E', true, '2023-03-01'),

  ('depo-servisnyy-centr-astana',
   'Строительство депо и сервисного центра',
   'Проектирование и строительство современного депо для ТО и ремонта локомотивов с полным инженерным обеспечением.',
   'Промышленные объекты', 'Астана',
   2022, '48 000 м²', array['Строительство','Инженерия','Под ключ'],
   null, 'completed', 600, 330, '51.18° N, 71.45° E', true, '2022-05-01'),

  ('vodosnabzhenie-turkestan',
   'Водоснабжение Туркестанской области',
   'Прокладка магистральных водоводов и строительство насосных станций для обеспечения водой 12 населённых пунктов.',
   'Коммуникации', 'Туркестанская область',
   2022, '85 км', array['Водоснабжение','Насосные станции'],
   null, 'completed', 660, 660, '43.30° N, 68.27° E', false, '2022-08-01'),

  ('razezdy-saryagash',
   'Строительство разъездов ст. Сарыагаш',
   'Увеличение пропускной способности участка за счёт строительства дополнительных путей и модернизации станционных устройств.',
   'Железнодорожная инфраструктура', 'Сарыагаш',
   2021, '3 разъезда', array['Путевые работы','Электрификация'],
   null, 'completed', 690, 640, '41.46° N, 69.17° E', false, '2021-04-01'),

  ('monitoring-deformaciy-aktobe',
   'Мониторинг деформаций ж/д полотна',
   'Внедрение системы непрерывного мониторинга состояния пути с применением современных геодезических технологий.',
   'Геодезия', 'Актюбинская область',
   2021, '160 км', array['Геодезия','BIM','Мониторинг'],
   null, 'completed', 240, 370, '50.28° N, 57.21° E', true, '2021-09-01'),

  ('amk-zhd-puti-aktobe',
   'Ж/д подъездные пути АМК (1-я, 2-я, 3-я очередь)',
   'Генеральный подрядчик строительства и капитального ремонта железнодорожных подъездных путей для Актюбинской медной компании.',
   'Железнодорожная инфраструктура', 'Актобе',
   2020, 'Под ключ', array['Генподряд','Подъездные пути','Капремонт'],
   null, 'completed', 230, 355, '50.17° N, 57.13° E', true, '2020-02-01'),

  ('zerde-keramika-puti',
   'Ж/д пути ТОО «Зерде-Керамика Актобе»',
   'Строительство железнодорожных подъездных путей к производственному объекту в полном соответствии с нормами ж/д строительства РК.',
   'Железнодорожная инфраструктура', 'Актобе',
   2019, 'Подъездной путь', array['Подъездные пути','Промышленность'],
   null, 'completed', 225, 365, '50.14° N, 57.10° E', false, '2019-06-01'),

  ('port-aktau-infrastruktura',
   'Инфраструктура порта Актау',
   'Строительство инженерных сетей и железнодорожных путей на территории морского порта для обеспечения перевалки грузов.',
   'Железнодорожная инфраструктура', 'Актау',
   2022, '12 км', array['Портовая инфраструктура','Путевые работы'],
   null, 'completed', 95, 490, '43.65° N, 51.15° E', false, '2022-01-01'),

  ('astana-nurly-zhol-izyskaniya',
   'Изыскания трассы Астана — Нурлы Жол',
   'Топографическая съёмка и инженерно-геологические изыскания для проектирования нового железнодорожного участка.',
   'Инженерные изыскания', 'Астана',
   2023, '95 км', array['Геодезия','Геология'],
   null, 'in-progress', 610, 320, '51.22° N, 71.60° E', false, '2023-06-01');

-- ── 6. Seed — Services ────────────────────────────────────────
insert into services (title, description, icon, direction, order_index) values
  ('Инженерно-геодезические изыскания',
   'Топографическая съёмка, разбивочные работы, мониторинг деформаций, создание геодезических сетей.',
   '📐', 'design', 1),
  ('Инженерно-геологические изыскания',
   'Бурение скважин, лабораторные испытания грунтов, оценка сейсмичности, гидрогеологические отчёты.',
   '🗺️', 'design', 2),
  ('Проектные работы полного цикла',
   'Разработка ПСД, рабочей документации, BIM-проектирование, прохождение государственной экспертизы.',
   '📋', 'design', 3),
  ('Строительство ж/д инфраструктуры',
   'Путевые работы, балластировка, укладка рельсошпальной решётки, строительство станций и разъездов.',
   '🛤️', 'construction', 1),
  ('Инженерные коммуникации',
   'Водоснабжение, канализация, теплоснабжение, газопроводы, электроснабжение.',
   '🏗️', 'construction', 2),
  ('Промышленное строительство',
   'Производственные здания, склады, депо, технологические сооружения «под ключ».',
   '🏢', 'construction', 3),
  ('Строительный контроль и надзор',
   'Технический надзор заказчика, авторский надзор, входной и операционный контроль качества.',
   '🔬', 'control', 1),
  ('Поставка материалов и техники',
   'Поставка строительных материалов, специализированной техники и путевого оборудования.',
   '🚚', 'control', 2);
