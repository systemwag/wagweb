-- Ограничения на значения справочных полей.
--
-- До этой миграции CHECK стоял только на projects.status и services.direction.
-- Статусы обслуживания и проектирования, work_type и категории не были
-- защищены ничем: опечатка в админке молча заводила новое значение, которое
-- потом не попадало ни в один фильтр и рендерилось без подписи.
--
-- Наборы значений взяты из src/lib/admin-schemas.ts и src/lib/types.ts,
-- чтобы БД и формы говорили одно и то же.

-- ─── 1. Сначала чиним расхождение, которое уже случилось ───────────────
-- maintenance_projects работает в терминах 'completed' | 'ongoing'
-- (src/lib/types.ts:94, MaintenanceForm.tsx, MaintenanceTable.tsx), но одна
-- запись («Мугалжар Нефтестрой», реконструкция) лежала со статусом
-- 'in-progress' из домена projects. Следствия: в админской таблице у неё не
-- находилась подпись статуса, а сохранение через форму отвалилось бы на
-- Zod-валидации. Приводим к контракту кода.
update maintenance_projects
   set status = 'ongoing'
 where status = 'in-progress';

-- ─── 2. Статусы ────────────────────────────────────────────────────────
alter table maintenance_projects drop constraint if exists maintenance_projects_status_check;
alter table maintenance_projects
  add constraint maintenance_projects_status_check
  check (status in ('completed', 'ongoing'));

alter table design_projects drop constraint if exists design_projects_status_check;
alter table design_projects
  add constraint design_projects_status_check
  check (status in ('completed', 'in-progress'));

-- ─── 3. Вид работ по обслуживанию ──────────────────────────────────────
alter table maintenance_projects drop constraint if exists maintenance_projects_work_type_check;
alter table maintenance_projects
  add constraint maintenance_projects_work_type_check
  check (work_type in (
    'current_maintenance',
    'current_repair',
    'medium_repair',
    'capital_repair',
    'inspection',
    'reconstruction'
  ));

-- ─── 4. Категория проектных работ ──────────────────────────────────────
alter table design_projects drop constraint if exists design_projects_category_check;
alter table design_projects
  add constraint design_projects_category_check
  check (category in ('full-cycle', 'design', 'documentation', 'feasibility'));

-- ─── 5. Категория СМР ──────────────────────────────────────────────────
-- Список — из выпадающего списка в src/components/Admin/ProjectForm.tsx.
-- Значение «Проектирование» пока оставлено в наборе: на нём висит запись
-- keden-servis, по которой ещё нет решения (см. миграцию 20260726055412).
alter table projects drop constraint if exists projects_category_check;
alter table projects
  add constraint projects_category_check
  check (category in (
    'Железнодорожная инфраструктура',
    'Инженерные изыскания',
    'Промышленные объекты',
    'Коммуникации',
    'Геодезия',
    'Проектирование'
  ));
