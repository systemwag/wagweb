# West Arlan Group · Brand Library

Автономная библиотека фирменного стиля для работы в **Adobe Illustrator / InDesign**
(и любых других редакторах). Всё в векторе, всё готово к `File → Place…`.
Папку можно копировать целиком дизайнеру — сайт и код для работы не нужны.

## Быстрый старт (10 минут)

1. **Шрифты** — установить все TTF из `03-fonts/` (выделить → ПКМ → Install).
2. **InDesign** — запустить `scripts/setup-indesign.jsx`
   (File → Scripts → Other Script…): создаст документ A4 с полями, 28 свотчей
   и 8 стилей абзацев. Сохранить как `.indt` — это стартовый шаблон.
3. **Illustrator** — запустить `scripts/setup-illustrator.jsx`: добавит 2 группы
   свотчей + 5 фирменных градиентов.
4. Либо без скриптов: панель Swatches → **Load/Import Swatches…** →
   `02-colors/wag-print.ase` (и/или `wag-web.ase`).
5. Открыть `08-templates/example-kp.pdf` — образец того, как всё сочетается.

## Структура

```
01-logos/            Треугольный знак ×4 (градиент/золото/белый/чёрный),
                     wordmark ×4 (тёмный фон/светлый фон/чёрный/белый),
                     wag-logo-full-color.svg (полная версия из Тильды),
                     clearspace-guide.svg (охранное поле и мин. размеры)
                     + pdf/ (вектор для типографий) + png/ (512/1024/2048 px)
02-colors/           wag-web.ase · wag-print.ase · wag-print-cmyk.ase
                     palette-web.svg / palette-print.svg — квадраты под ПИПЕТКУ
                     palette-sheet.pdf (3 стр., вектор) · gradients.svg · COLORS.md
03-fonts/            Space Grotesk · Onest · Outfit (статические TTF, OFL)
                     FONTS.md — роли и ⚠️ правило кириллицы
04-icons/            14 иконок: контакты, отрасли, сервисы (currentColor)
05-graphics/         Карта Казахстана ×3 стиля · 4 инженерных мотива
                     (чертёж/кран/экскаватор/грузовик) · QR-коды в векторе
06-photos-partners/  16 логотипов партнёров + PHOTO-RULES.md (оверлеи фото)
07-styles/           STYLE-GUIDE.md — типографика в pt, сетки, линии,
                     печатные спеки (FOGRA39, вылеты, мин. кегли)
08-templates/        Спеки: КП, визитка, бланк, инфолист
                     + example-kp.pdf и example-business-card.pdf (образцы)
09-content/          requisites.md (реквизиты, руководство) ·
                     boilerplate-ru/en.md (готовые тексты, блок цифр)
scripts/             setup-indesign.jsx · setup-illustrator.jsx
```

## Ключевые правила (краткая версия)

- **Две палитры:** Print (крем/золото `#C9941F`) — для полиграфии;
  Web (тёмная/золото `#D4A843`) — для экрана. Не смешивать золото палитр.
- **Кириллица:** у Space Grotesk и Outfit её НЕТ. Русские заголовки — Onest
  (это фирменная замена). Латиница и цифры — Space Grotesk / Outfit.
- **Золото — дефицит:** один решающий золотой акцент на страницу.
- **Цифры компании** (136 / 49 / 87 / 16 лет) — маркетинговый реестр,
  канон в `09-content/boilerplate-ru.md`; при изменении сайта обновить там.
- Полные правила: `07-styles/STYLE-GUIDE.md` и `02-colors/COLORS.md`.

## Как это пересобрать (для разработчика)

Генерируемые ассеты (ASE, палитра-листы, PDF/PNG логотипов, QR):
`node scripts/build-brand-library.mjs` (из корня репозитория).
Образцы КП/визитки: `node scripts/build-brand-templates.mjs`.
Мотивы/карта извлечены из React-компонентов сайта — при изменении дизайна
сайта повторить экспорт (см. git-историю: export-motifs).

*Собрано 2026-07-16 из действующего сайта westarlangroup.kz и брошюры /portfolio/print.*
