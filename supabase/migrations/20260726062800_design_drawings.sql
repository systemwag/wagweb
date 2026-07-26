-- Чертежи проектов на сайте.
--
-- В public/portfolio/design/ лежат 50 PNG/JPG (41 МБ), запечённых для печатной
-- брошюры и до сих пор использовавшихся только ей. Раздел /design при этом был
-- полностью без визуала: у design_projects не было колонки под изображения.
--
-- Заводим images text[] и привязываем чертежи к тем записям, для которых в
-- брошюре есть кейс-лист (src/app/portfolio/print/content/cases-ru.tsx).
-- Соответствие «запись → чертежи» взято оттуда же, порядок — как на развороте:
-- сначала главный план, затем профиль/узлы, затем annex-листы.

alter table design_projects add column if not exists images text[] not null default '{}';

comment on column design_projects.images is
  'Чертежи проекта. Локальные пути в public/portfolio/design/ (запекаются для брошюры) либо URL Supabase Storage.';

update design_projects set images = v.imgs
  from (values
    -- Кейс 02.1 · QazCement, внешний подъездной путь
    ('design-93', array[
      '/portfolio/design/drawing-qc-access.png',
      '/portfolio/design/drawing-qc-access-profile.png']),
    -- Кейс 02.1 (приложение) · внешнее электроснабжение 24 МВт
    ('design-94', array[
      '/portfolio/design/drawing-power24.png',
      '/portfolio/design/drawing-qazcement.png']),
    -- Кейс 02.2 · QazCement, внутризаводское путевое развитие
    ('design-95', array[
      '/portfolio/design/drawing-qc-internal.png',
      '/portfolio/design/drawing-qc-internal-upor.png']),
    -- Кейс 02.3 · станция Кенжалы
    ('design-96', array[
      '/portfolio/design/drawing-qc-station.png',
      '/portfolio/design/drawing-kenzhaly-signal.png',
      '/portfolio/design/drawing-kenzhaly-full.png']),
    -- Кейс 03 · Aktobe Steklo, внешняя инфраструктура
    ('design-97', array[
      '/portfolio/design/drawing-asteklo-power.png',
      '/portfolio/design/drawing-asteklo-rail.png',
      '/portfolio/design/drawing-asteklo-road.png',
      '/portfolio/design/drawing-asteklo-oru.png',
      '/portfolio/design/drawing-gas.jpg',
      '/portfolio/design/drawing-gas-high.png',
      '/portfolio/design/drawing-gas-medium.png',
      '/portfolio/design/drawing-sewage.png',
      '/portfolio/design/drawing-sewage-grav.png',
      '/portfolio/design/drawing-sewage-crossing.png']),
    -- Кейс 04 · Уральская Сталь, станция «Колесопрокатная»
    ('design-98', array[
      '/portfolio/design/drawing-ural-station.png',
      '/portfolio/design/drawing-ural-lighting.png',
      '/portfolio/design/drawing-ural-04kv.png',
      '/portfolio/design/drawing-ural-post.png']),
    -- Кейс 05 · резиденты индустриальной зоны (ст. Жинишке)
    ('design-99',  array['/portfolio/design/drawing-spk-rail.png']),
    ('design-100', array['/portfolio/design/drawing-zerde-plan.png']),
    ('design-101', array['/portfolio/design/drawing-faeton-rail-1.png']),
    ('design-3',   array['/portfolio/design/drawing-svet-rail.png']),
    -- Кейс 06 · Сухой порт «Хоргос»
    ('design-51', array[
      '/portfolio/design/drawing-horgos-rail-1.png',
      '/portfolio/design/drawing-horgos-rail-2.png',
      '/portfolio/design/drawing-horgos-tor-site.png',
      '/portfolio/design/drawing-horgos-apparel.png',
      '/portfolio/design/drawing-horgos-04kv.png']),
    -- Кейс 07 · АМК, пути отстоя и ст. Рудная
    ('design-102', array[
      '/portfolio/design/drawing-amk-rail-2.png',
      '/portfolio/design/drawing-amk-rail-1.png']),
    -- Кейс 08 · Нефтестройсервис ЛТД, ст. Тендык
    ('design-44', array[
      '/portfolio/design/drawing-nss-rail-plan.png',
      '/portfolio/design/drawing-nss-elevated-track.png']),
    -- Кейс 09 · Синтез Урал, ст. Кардон
    ('design-103', array[
      '/portfolio/design/drawing-sintez-plan.png',
      '/portfolio/design/drawing-sintez-culvert.png']),
    -- Кейс 12 · Сине Мидас Строй, ст. Исатай
    ('design-47', array[
      '/portfolio/design/drawing-midas-plan-1.png',
      '/portfolio/design/drawing-midas-plan-2.png']),
    -- Кейс 13 · АРБЗ, холодный склад
    ('design-60', array['/portfolio/design/drawing-arbz-plan.png']),
    -- Кейс 15 · КазГеоруд, автодорога Коктау — Лиманное
    ('design-88', array[
      '/portfolio/design/drawing-kazgeorud-road.png',
      '/portfolio/design/drawing-kazgeorud-road-profile.png',
      '/portfolio/design/drawing-kazgeorud-bridge.png',
      '/portfolio/design/drawing-kazgeorud-bridge-pier.png']),
    -- Кейс 16 · КСГК, автодорога Коспан и мост через Биже
    ('design-104', array[
      '/portfolio/design/drawing-ksgk-road.png',
      '/portfolio/design/drawing-ksgk-road-profile.png',
      '/portfolio/design/drawing-ksgk-bridge.png',
      '/portfolio/design/drawing-ksgk-bridge-pier.png']),
    -- Кейс 17 · Coca-Cola, схема подключения к сетям ИТО
    ('design-105', array['/portfolio/design/drawing-cola-ito.png'])
  ) as v(slug, imgs)
 where design_projects.slug = v.slug;

-- Контроль: 19 записей с чертежами, суммарно 50 файлов — ровно столько,
-- сколько лежит в public/portfolio/design/.
do $$
declare
  n_rows int;
  n_imgs int;
begin
  select count(*), coalesce(sum(array_length(images, 1)), 0)
    into n_rows, n_imgs
    from design_projects
   where array_length(images, 1) > 0;

  if n_rows <> 19 then
    raise exception 'Ожидалось 19 записей с чертежами, получено %', n_rows;
  end if;
  if n_imgs <> 50 then
    raise exception 'Ожидалось 50 привязанных чертежей, получено %', n_imgs;
  end if;
end $$;
