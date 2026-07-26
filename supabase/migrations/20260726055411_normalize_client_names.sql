-- Нормализация написания заказчиков и станций.
-- Источник истины — кейс-листы печатной брошюры (src/app/portfolio/print/content/cases-ru.tsx),
-- правленные вручную и пересобранные 23.07.2026 (коммит 067c58b).
-- Все правки идемпотентны: повторный прогон ничего не меняет.

-- 1. «Нефтестройсервис ЛПД» → «ЛТД».
--    Брошюра, кейс 08: «ТОО «Нефтестройсервис ЛТД» (NSS)». То же написание
--    в design_projects #44. В projects была опечатка (id 44, 49).
update projects
   set title       = replace(title,       'Нефтестройсервис ЛПД', 'Нефтестройсервис ЛТД'),
       description = replace(description, 'Нефтестройсервис ЛПД', 'Нефтестройсервис ЛТД')
 where title like '%Нефтестройсервис ЛПД%'
    or description like '%Нефтестройсервис ЛПД%';

-- 2. Станция Тендык (не «Тендик»).
--    Брошюра, кейс 08: «примыкание по ст. Тендык АО «НК «КТЖ».
update projects
   set location    = replace(location,    'Тендик', 'Тендык'),
       description = replace(description, 'Тендик', 'Тендык')
 where location like '%Тендик%'
    or description like '%Тендик%';

-- 3. ИП «Жанажанов Б.С.» — написание из design_projects (две записи).
--    В projects id 66 стояло «Жаназханов».
update projects
   set title       = replace(title,       'Жаназханов', 'Жанажанов'),
       description = replace(description, 'Жаназханов', 'Жанажанов')
 where title like '%Жаназханов%'
    or description like '%Жаназханов%';

-- 4. «ТОО «КазГеоРуд»» → «ТОО «КазГеоруд»».
--    Брошюра, кейс 15: «ТОО «КазГеоруд» · месторождение Лиманное».
--    В design_projects клиент был записан двумя способами (#12 и #88).
update design_projects
   set client = 'ТОО «КазГеоруд»'
 where client = 'ТОО «КазГеоРуд»';

-- 5. «АО «Уральская сталь»» → «АО «Уральская Сталь»».
--    Брошюра, кейс 04, и projects (id 54, 55) — с заглавной «С».
update design_projects
   set client = 'АО «Уральская Сталь»'
 where client = 'АО «Уральская сталь»';

-- 6. Станция Кемпирсай (не «Киммерсой»).
--    Брошюра, кейс 07: пути АМК примыкают «к ст. Кемпирсай» общей сети.
--    Станции «Киммерсой» не существует — опечатка в maintenance_projects id 10.
update maintenance_projects
   set title       = replace(title,       'Киммерсой', 'Кемпирсай'),
       description = replace(description, 'Киммерсой', 'Кемпирсай')
 where title like '%Киммерсой%'
    or description like '%Киммерсой%';
