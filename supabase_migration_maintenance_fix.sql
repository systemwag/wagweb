-- =============================================================================
-- Fix migration: rebalance projects <-> maintenance_projects
--
-- The initial migration matched rows by my seed's IDs which didn't align with
-- the actual IDs in Supabase. This patch moves the 26 misclassified rows to
-- their correct table, preserving slug, description, images, tags, etc.
--
-- 16 rows: projects → maintenance_projects
-- 10 rows: maintenance_projects → projects
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Из projects → maintenance_projects (16 объектов)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO maintenance_projects (
  slug, title, description, client, location, period, work_type,
  image_url, images, status, tags, featured, created_at
)
SELECT
  slug,
  title,
  description,
  -- Извлекаем заказчика regex'ом из title (ТОО/АО/ИП/ЧЛ/СП/УК «...»,
  -- "Управляющая компания ИЗА", "ИП Имя Ф.О.")
  COALESCE(
    (regexp_match(title, '(ТОО|АО|ИП|ЧЛ|ЧП|СП|УК)\s+«[^»]+»'))[0],
    (regexp_match(title, 'Управляющая компания[^—]+'))[0],
    (regexp_match(title, 'ИП\s+[А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.[А-ЯЁ]\.'))[0]
  ),
  location,
  year::text,
  CASE id
    WHEN 16 THEN 'current_maintenance'
    WHEN 18 THEN 'current_maintenance'
    WHEN 22 THEN 'current_maintenance'
    WHEN 23 THEN 'reconstruction'
    WHEN 26 THEN 'capital_repair'
    WHEN 31 THEN 'current_maintenance'
    WHEN 32 THEN 'current_maintenance'
    WHEN 37 THEN 'inspection'
    WHEN 39 THEN 'current_repair'
    WHEN 40 THEN 'current_maintenance'
    WHEN 41 THEN 'inspection'
    WHEN 42 THEN 'current_repair'
    WHEN 45 THEN 'medium_repair'
    WHEN 46 THEN 'current_repair'
    WHEN 48 THEN 'reconstruction'
    WHEN 57 THEN 'reconstruction'
  END,
  image_url, images, status, tags, featured,
  COALESCE(created_at, NOW())
FROM projects
WHERE id IN (16, 18, 22, 23, 26, 31, 32, 37, 39, 40, 41, 42, 45, 46, 48, 57);

DELETE FROM projects
WHERE id IN (16, 18, 22, 23, 26, 31, 32, 37, 39, 40, 41, 42, 45, 46, 48, 57);


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Из maintenance_projects → projects (10 объектов)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO projects (
  slug, title, description, category, location, year, length,
  image_url, images, status, tags, featured, created_at
)
SELECT
  slug,
  title,
  description,
  -- Категория зависит от типа объекта
  CASE id
    WHEN 5  THEN 'Коммуникации'             -- Viridi Navitas водопровод
    WHEN 9  THEN 'Коммуникации'             -- КХ КАНАТ водопровод
    WHEN 13 THEN 'Промышленные объекты'     -- школа
    ELSE        'Железнодорожная инфраструктура'
  END,
  location,
  -- period сейчас = year::text, парсим обратно. Берём первое 4-значное число.
  COALESCE(
    NULLIF((substring(period FROM '\d{4}')), '')::int,
    EXTRACT(YEAR FROM created_at)::int,
    2020
  ),
  NULL, -- length: в maintenance нет, заполнишь через админку при желании
  image_url, images, status, tags, featured,
  COALESCE(created_at, NOW())
FROM maintenance_projects
WHERE id IN (1, 4, 5, 7, 8, 9, 11, 12, 13, 14);

DELETE FROM maintenance_projects
WHERE id IN (1, 4, 5, 7, 8, 9, 11, 12, 13, 14);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Проверочные запросы (опционально — посмотри что получилось)
-- ─────────────────────────────────────────────────────────────────────────────

-- SELECT COUNT(*) AS smr_count          FROM projects;
-- SELECT COUNT(*) AS maintenance_count  FROM maintenance_projects;
-- SELECT id, title FROM maintenance_projects ORDER BY work_type, id;
-- SELECT id, title, category FROM projects ORDER BY category, id;
