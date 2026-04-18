# Совместный план разработки WAG Webpage (Sync Plan)

## 📌 Роли и ответственность
- **Claude:** Архитектура Next.js (App Router), структура компонентов (`.tsx`), роутинг, подключение к `Supabase`, логика данных, SEO-оптимизация и базовая разметка.
- **Antigravity:** Визуальная часть (премиальный UI/UX), чистый CSS/SCSS (или модули), дизайн-токены, эффекты (микро-анимации, глассморфизм) и *генерация высококачественных изображений/рендеров* для сайта.

---

## 📝 Статус задач (Правило: после выполнения шага обновляем этот файл!)

### Фаза 1: Подготовка
- [x] Инициализация проекта Next.js.
- [x] Настройка подключения к Supabase — browser-клиент готов (`src/lib/supabase.ts`).
- [x] Разработка базовой структуры папок и роутов (Claude).
- [ ] Создание глобального файла стилей (дизайн-токены, цвета, шрифты) (Antigravity).
  > ⚠️ Примечание: `globals.css` уже содержит базовые токены. Antigravity может расширить/переписать под свой дизайн.

### Фаза 2: Каркас и Логика (Работа Claude)
- [x] Разметка Главной страницы: Hero, Stats, About, Services, Projects, Partners (Claude).
- [x] Layout (Header, Footer, навигация) — базовая разметка готова (Claude).
- [x] Supabase server-client (`src/lib/supabase-server.ts`) + типы (`src/lib/types.ts`) + data-fetching (`src/lib/data.ts`) с fallback на seed-данные (Claude).
- [x] Страница `/about` — миссия, ценности, команда, лицензии, партнёры (Claude).
- [x] Страница `/services` — 3 направления с сервисами из БД/seed (Claude).
- [x] Страница `/projects` — список с фильтром по категориям (Claude).
- [x] Страница `/projects/[id]` — детальная карточка с generateStaticParams (Claude).
- [x] Страница `/contacts` — ContactForm с Supabase insert (Claude).
- [x] SEO: generateMetadata на всех страницах, JSON-LD Organization, sitemap.ts, robots.ts (Claude).
- [x] Header переведён на `<Link>` + `usePathname` для активных ссылок (Claude).

### Фаза 3: Премиальный Визуал и Анимации (Работа Antigravity)
> ✅ Antigravity может приступать к стилизации компонентов из Фазы 2 по мере их готовности.
> Каждый компонент имеет свой `ComponentName.module.css` файл рядом с `.tsx`.

- [ ] Генерация крутых строительных рендеров и фотографий для заполнения сайта (Antigravity).
- [ ] Стилизация Главной страницы, добавление плавных скролл-анимаций (Antigravity).
- [ ] Стилизация страниц: `/about`, `/services`, `/projects`, `/contacts` (Antigravity).
- [ ] Финальная полировка и настройка Responsive дизайна (Antigravity).

---

## 🗂️ Структура компонентов (для Antigravity)

```
src/
├── app/
│   ├── layout.tsx              ← глобальный layout
│   ├── page.tsx                ← главная страница
│   ├── globals.css             ← базовые токены (расширяй!)
│   ├── about/page.tsx
│   ├── services/page.tsx
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── contacts/page.tsx
├── components/
│   ├── Header/                 ✅ готово
│   ├── Footer/                 ✅ готово
│   ├── Hero/                   ✅ готово
│   ├── Stats/                  ✅ готово
│   ├── About/                  ✅ готово
│   ├── Services/               ✅ готово
│   ├── Projects/               ✅ готово
│   ├── Partners/               ✅ готово
│   ├── ContactForm/            🔧 в разработке
│   └── ui/                     🔧 переиспользуемые примитивы
└── lib/
    ├── supabase.ts             ✅ browser-клиент
    ├── supabase-server.ts      🔧 server-клиент
    ├── types.ts                🔧 все типы
    └── data.ts                 🔧 data-fetching функции
```

## 🗄️ Supabase: Схема таблиц (для справки)

```sql
-- Проекты
projects (id, title, description, category, location, year, image_url, slug, created_at)

-- Услуги
services (id, title, description, icon, direction, order_index, created_at)

-- Заявки с формы
contacts (id, name, email, phone, message, created_at)
```
