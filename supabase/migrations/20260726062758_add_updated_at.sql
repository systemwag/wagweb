-- updated_at на таблицах контента.
--
-- Раньше был только created_at, поэтому по записи нельзя было понять, когда
-- её последний раз правили — ни в админке, ни при разборе расхождений с
-- брошюрой. Триггер проставляет метку автоматически, включая правки через
-- service-role и через SQL-редактор.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'projects',
    'maintenance_projects',
    'design_projects',
    'testimonials',
    'partners',
    'services'
  ]
  loop
    execute format(
      'alter table public.%I add column if not exists updated_at timestamptz not null default now()', t);

    -- Для уже существующих строк осмысленного времени правки нет —
    -- выравниваем по created_at, чтобы метка не врала «правили сегодня».
    execute format(
      'update public.%I set updated_at = created_at where updated_at <> created_at', t);

    execute format('drop trigger if exists %I on public.%I', t || '_set_updated_at', t);
    execute format(
      'create trigger %I before update on public.%I
         for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t);
  end loop;
end $$;
