-- =============================================================================
-- Migration: maintenance_projects table
-- West Arlan Group — Maintenance & Current Repair
--
-- Создаёт таблицу maintenance_projects и переносит туда 21 проект из projects,
-- который относится к обслуживанию / текущему / капитальному / среднему ремонту,
-- осмотру и реконструкции. После INSERT проекты удаляются из projects.
--
-- Маппинг work_type:
--   capital_repair       — Капитальный ремонт (id 3, 14)
--   current_maintenance  — Текущее содержание / Содержание (4, 5, 6, 10, 13, 19, 20, 24, 28)
--   current_repair       — Текущий ремонт / Ремонт (9, 27, 30, 34)
--   medium_repair        — Средний ремонт (33)
--   inspection           — Осмотр и дефектация (25, 29)
--   reconstruction       — Реконструкция / Перебортовка / Укрепление (11, 17, 36)
-- =============================================================================

-- ── 1. Создание таблицы ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS maintenance_projects (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  client      TEXT,
  location    TEXT,
  period      TEXT,
  work_type   TEXT NOT NULL DEFAULT 'current_maintenance',
  image_url   TEXT,
  images      TEXT[],
  status      TEXT NOT NULL DEFAULT 'completed',
  tags        TEXT[],
  featured    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS maintenance_projects_slug_idx       ON maintenance_projects(slug);
CREATE INDEX IF NOT EXISTS maintenance_projects_work_type_idx  ON maintenance_projects(work_type);
CREATE INDEX IF NOT EXISTS maintenance_projects_status_idx     ON maintenance_projects(status);

-- ── 2. Перенос данных из projects ───────────────────────────────────────────
-- client извлекается regex'ом из title (форматы: ТОО/АО/ИП/ЧЛ/СП/УК «...»,
-- "Управляющая компания «...»", "ИП Фамилия И.О.")

INSERT INTO maintenance_projects (
  slug, title, description, client, location, period, work_type,
  image_url, images, status, tags, featured, created_at
)
SELECT
  slug,
  title,
  description,
  COALESCE(
    (regexp_match(title, '(ТОО|АО|ИП|ЧЛ|СП|УК)\s+«[^»]+»'))[0],
    (regexp_match(title, 'Управляющая компания\s+«[^»]+»\s+Актобе'))[0],
    (regexp_match(title, 'ИП\s+[А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.[А-ЯЁ]\.'))[0]
  ) AS client,
  location,
  year::text AS period,
  CASE
    WHEN id IN (3, 14)              THEN 'capital_repair'
    WHEN id IN (11, 17, 36)         THEN 'reconstruction'
    WHEN id = 33                    THEN 'medium_repair'
    WHEN id IN (25, 29)             THEN 'inspection'
    WHEN id IN (9, 27, 30, 34)      THEN 'current_repair'
    ELSE                                 'current_maintenance'
  END AS work_type,
  image_url,
  images,
  status,
  tags,
  featured,
  COALESCE(created_at, NOW())
FROM projects
WHERE id IN (3, 4, 5, 6, 9, 10, 11, 13, 14, 17, 19, 20, 24, 25, 27, 28, 29, 30, 33, 34, 36);

-- ── 3. Удаление перенесённых проектов из projects ──────────────────────────
DELETE FROM projects
WHERE id IN (3, 4, 5, 6, 9, 10, 11, 13, 14, 17, 19, 20, 24, 25, 27, 28, 29, 30, 33, 34, 36);

-- ── 4. Row Level Security (зеркалит политику projects) ─────────────────────
-- Без этого анонимный клиент (anon key) не сможет читать таблицу.
ALTER TABLE maintenance_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read maintenance_projects"
  ON maintenance_projects FOR SELECT USING (true);
