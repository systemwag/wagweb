-- ============================================================
-- WAG Projects — targeted fixes
-- Применяется поверх supabase_migration_projects.sql
-- ============================================================

-- 1. Добавить колонки дат (если ещё не применена миграция)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS date_start TEXT DEFAULT NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS date_end   TEXT DEFAULT NULL;

-- ============================================================
-- 2. Исправить слаг и локацию: Синтез Урал (ст. Кардон, а не Молость)
-- ============================================================
UPDATE projects
SET
  slug     = 'sintez-ural-kardon',
  location = 'ст. Кардон, ЗКО'
WHERE slug = 'sintez-ural-molost';

-- ============================================================
-- 3. Исправить слаг и локацию: Portal KZ (ст. Никельтау, а не Новоалексеевка)
-- ============================================================
UPDATE projects
SET
  slug     = 'portal-kz-nikeltau',
  location = 'ст. Никельтау, Актюбинская обл.'
WHERE slug = 'portal-kz-novoalekseevka';

-- ============================================================
-- 4. Проверка — после применения оба старых слага должны вернуть 0 строк
-- ============================================================
SELECT slug, title, location
FROM projects
WHERE slug IN ('sintez-ural-molost', 'portal-kz-novoalekseevka');
-- Ожидаемый результат: (0 rows)
