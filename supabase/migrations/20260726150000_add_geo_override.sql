-- Ручная точка на карте для разовых объектов.
--
-- Основной способ попасть на карту — текстовый `location`, который разбирается
-- справочником мест (src/lib/geo/places.ts). Эти колонки — страховка: если
-- объект стоит там, где компания больше работать не будет, заводить его в
-- справочник смысла нет — админ просто ставит точку кликом по карте.
-- Заполненные lat/lon имеют приоритет над разбором адреса.
--
-- NB: это НЕ замена старым projects.x_map/y_map — те хранят пиксели старого
-- обведённого контура и живут, пока на главной старая карта.

alter table public.projects
  add column if not exists lat double precision,
  add column if not exists lon double precision;

alter table public.maintenance_projects
  add column if not exists lat double precision,
  add column if not exists lon double precision;

alter table public.design_projects
  add column if not exists lat double precision,
  add column if not exists lon double precision;

-- Защита от опечатки в координатах: за пределами этого прямоугольника точка
-- всё равно не попадёт в кадр карты, лучше отбить на записи.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'projects_geo_range') then
    alter table public.projects add constraint projects_geo_range
      check ((lat is null and lon is null)
          or (lat between 35 and 60 and lon between 40 and 95));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'maintenance_projects_geo_range') then
    alter table public.maintenance_projects add constraint maintenance_projects_geo_range
      check ((lat is null and lon is null)
          or (lat between 35 and 60 and lon between 40 and 95));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'design_projects_geo_range') then
    alter table public.design_projects add constraint design_projects_geo_range
      check ((lat is null and lon is null)
          or (lat between 35 and 60 and lon between 40 and 95));
  end if;
end $$;

comment on column public.projects.lat is
  'Ручная точка на карте (широта). Пусто — координата берётся из справочника по location.';
comment on column public.projects.lon is
  'Ручная точка на карте (долгота). Пусто — координата берётся из справочника по location.';
