-- Добивка пустых полей.
--
-- До миграции:
--   maintenance_projects.client — NULL у всех 20 записей (заказчик был только в title);
--   design_projects.year / .location — NULL у всех 87 записей.
--
-- Заполняем ТОЛЬКО то, что подтверждается источником: заказчик выводится из
-- собственного title записи, год и локация — из кейс-листов брошюры (шифры
-- рабочих проектов и адреса объектов). Ничего не додумываем: строки без
-- документального подтверждения остаются пустыми.

-- ─── 1. maintenance_projects.client ────────────────────────────────────
-- Заказчик у каждой записи явно назван в её же заголовке.

update maintenance_projects set client = 'ТОО «Стройтех»'                      where slug = 'stroytekh-soderzhanie-2017';
update maintenance_projects set client = 'ТОО «Компания Фаэтон»'               where slug = 'faeton-soderzhanie-679';
update maintenance_projects set client = 'ТОО «Зерде Керамика Актобе»'         where slug = 'zerde-keramika-soderzhanie';
update maintenance_projects set client = 'ТОО «Актюбинская Медная компания»'   where slug = 'amk-povyshenie-put-12';
update maintenance_projects set client = 'ТОО «ORAL MUNAI»'                    where slug = 'oral-munai-soderzhanie';
update maintenance_projects set client = 'ТОО «ОралтехНефтехим»'               where slug = 'oraltekh-neftehim-soderzhanie';
update maintenance_projects set client = 'ТОО «Алтын Нуран»'                   where slug = 'altyn-nuran-soderzhanie';
update maintenance_projects set client = 'ТОО «Зерде Керамика Актобе»'         where slug = 'uk-iza-soderzhanie-zerde';
update maintenance_projects set client = 'ТОО «Ramazan Elevator»'              where slug = 'ramazan-elevator-defektaciya';
update maintenance_projects set client = 'ТОО «Новая АЗС»'                     where slug = 'novaya-azs-remont-puti';
update maintenance_projects set client = 'ТОО «AltynEx Company»'               where slug = 'altynex-sredniy-remont-zhem';
update maintenance_projects set client = 'ИП Искаков С.С.'                     where slug = 'iskakov-vodoprovod-aktobe';
update maintenance_projects set client = 'ТОО «Biolabs»'                       where slug = 'biolabs-rekonstrukciya-biryshtr';
update maintenance_projects set client = 'Управляющая компания ИЗА'            where slug = 'uk-iza-tekushiy-remont';
update maintenance_projects set client = 'Управляющая компания ИЗА'            where slug = 'uk-iza-osmotr-defektaciya';
update maintenance_projects set client = 'ТОО «Стройтех»'                      where slug = 'stroytekh-kapremont-put-9';
update maintenance_projects set client = 'ТОО «Мугалжар Нефтестрой»'           where slug = 'mugalzhar-neftestroy-biryshtr';
update maintenance_projects set client = 'ТОО «Агран»'                         where slug = 'agran-soderzhanie-puti';
update maintenance_projects set client = 'АО «Оптово-Розничное Предприятие»'   where slug = 'optovo-roznichnoe-soderzhanie';
update maintenance_projects set client = 'ТОО «Актюбинская Медная компания»'   where slug = 'amk-perebortovka-63km';

-- ─── 2. design_projects.year / .location ───────────────────────────────
-- Год берётся из шифра рабочего проекта, локация — из кейс-листа брошюры.

-- #44 · ТОО «Нефтестройсервис ЛТД» — кейс 08, шифры 13/04-2022-ПЖ и -КЖ, май 2022.
update design_projects
   set year = 2022,
       location = 'Атырауская обл., г. Атырау, аул Новокирпичный · ст. Тендык'
 where slug = 'design-44';

-- #47 · ТОО «СП «Сине Мидас Строй» — кейс 12, шифры 01/03-2022-ПЖ · КЖ · ЭС · СС.
update design_projects
   set year = 2022,
       location = 'Атырауская обл., село Исатай · ст. Исатай'
 where slug = 'design-47';

-- #35 · ТОО «СП «Сине Мидас Строй» — инструкция и техпаспорт по тому же объекту.
update design_projects
   set location = 'Атырауская обл., село Исатай · ст. Исатай'
 where slug = 'design-35';

-- #51 · ТОО «KTZH-Khorgos Gateway» — кейс 06, шифр 16/08-2021-ПЖ.
update design_projects
   set year = 2021,
       location = 'СЭЗ «Хоргос — Восточные ворота», Алматинская обл.'
 where slug = 'design-51';

-- #60 · ТОО «АРБЗ» — кейс 13, шифр 4-05/22-ПЖ, октябрь 2022.
update design_projects
   set year = 2022,
       location = 'г. Актобе · территория завода АРБЗ'
 where slug = 'design-60';

-- #3 · Завод «Светотехника-W» — кейс 05, шифр 05/06-2021-ПЖ.
update design_projects
   set year = 2021,
       location = 'г. Актобе, индустриальная зона · ст. Жинишке'
 where slug = 'design-3';

-- #87 · АО «Уральская Сталь» — кейс 04. Год не подтверждён источником, ставим
-- только локацию.
update design_projects
   set location = 'г. Новотроицк, Оренбургская обл., Российская Федерация'
 where slug = 'design-87';

-- #88 · ТОО «КазГеоруд» — кейс 15, шифр 30/04-2021-ПСДАД.
update design_projects
   set year = 2021,
       location = 'Актюбинская обл. · пос. Коктау — м-е Лиманное'
 where slug = 'design-88';

-- #45 · ТОО «Зерде Керамика Актобе» — инструкция и техпаспорт, ст. Жинишке.
update design_projects
   set location = 'г. Актобе, индустриальная зона · ст. Жинишке'
 where slug = 'design-45';

-- #63 · АО «НК «СПК-Актобе» — инструкция и техпаспорт, ст. Жинишке.
update design_projects
   set location = 'г. Актобе, индустриальная зона · ст. Жинишке'
 where slug = 'design-63';
