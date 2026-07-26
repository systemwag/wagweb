-- Закрытие публичной записи в projects + чистка дублей политик чтения.
--
-- ПРОБЛЕМА. На таблице projects висели три политики записи, названные
-- «Admin …», но выданные роли PUBLIC с безусловным true:
--
--   Admin insert projects   INSERT  PUBLIC  WITH CHECK (true)
--   Admin update projects   UPDATE  PUBLIC  USING (true)
--   Admin delete projects   DELETE  PUBLIC  USING (true)
--
-- Политика без явного TO применяется ко ВСЕМ ролям, включая anon. Анонимный
-- ключ публикуется в клиентском бандле (NEXT_PUBLIC_SUPABASE_ANON_KEY), то
-- есть любой посетитель сайта мог вставлять, изменять и удалять записи
-- реестра СМР. Слово «Admin» в имени политики ничего не ограничивает.
--
-- ПОЧЕМУ УДАЛЕНИЕ БЕЗОПАСНО. Все мутации проходят через API-роуты
-- (src/app/api/admin/*), которые используют createServiceClient() — service
-- role обходит RLS полностью. В src/lib/data.ts (анонимный клиент) нет ни
-- одного вызова insert/update/delete/upsert. Ни один рабочий путь записи
-- на эти политики не опирается.
--
-- Остальные таблицы контента и так имеют только политики чтения — приводим
-- projects к тому же виду.

drop policy if exists "Admin insert projects" on projects;
drop policy if exists "Admin update projects" on projects;
drop policy if exists "Admin delete projects" on projects;

-- Дубли политик чтения: одно и то же правило заведено дважды, отличаясь
-- только регистром первой буквы. Оставляем по одной на таблицу.
drop policy if exists "Public read projects" on projects;
drop policy if exists "Public read maintenance_projects" on maintenance_projects;

-- Контроль: после миграции у projects должна остаться ровно одна политика
-- (public read projects, SELECT), у maintenance_projects — одна
-- (public read maintenance_projects, SELECT).
do $$
declare
  n_write int;
  n_proj  int;
  n_maint int;
begin
  select count(*) into n_write
    from pg_policy
   where polrelid = 'projects'::regclass and polcmd <> 'r';
  select count(*) into n_proj
    from pg_policy where polrelid = 'projects'::regclass;
  select count(*) into n_maint
    from pg_policy where polrelid = 'maintenance_projects'::regclass;

  if n_write <> 0 then
    raise exception 'На projects остались политики записи: %', n_write;
  end if;
  if n_proj <> 1 then
    raise exception 'Ожидалась 1 политика на projects, найдено %', n_proj;
  end if;
  if n_maint <> 1 then
    raise exception 'Ожидалась 1 политика на maintenance_projects, найдено %', n_maint;
  end if;
end $$;
