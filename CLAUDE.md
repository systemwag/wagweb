# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# West Arlan Group — Corporate Website

Premium engineering/infrastructure contractor website (Kazakhstan, office in Aktobe).

## Tech Stack

- **Framework:** Next.js 16.x (App Router, TypeScript). Middleware is `src/proxy.ts` (Next 16 "Proxy"), not `middleware.ts`.
- **Styling:** Vanilla CSS Modules (NO Tailwind) — one `.module.css` per component
- **Backend:** Supabase (`src/lib/supabase-server.ts` — anon reads via `createServerClient`, privileged mutations via `createServiceClient`; no browser client — all writes go through API routes). Generated DB types: `src/lib/database.types.ts`.
- **Data:** `src/lib/data.ts` (seed data with Supabase fallback), `src/lib/types.ts`
- **Tests:** Vitest, `environment: node`, picks up `src/**/*.test.ts` (currently all in `src/lib/__tests__/`: admin-schemas, admin-session, rate-limit, geo-places, geo-projection)
- **Fonts:** loaded via `next/font/google` in `layout.tsx` — Space Grotesk (`--font-heading`, latin only), Onest (`--font-body`, latin + cyrillic), Outfit (`--font-display`). Space Grotesk/Outfit have no Cyrillic subset; RU/KZ glyphs fall back to Onest via the CSS font chain. Local TTF/OTF in `public/fonts/` are used by the print brochure and `opengraph-image.tsx` (satori needs raw font files).

## Commands

```bash
npm run dev          # Dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Vitest, all tests
npx vitest run src/lib/__tests__/geo-places.test.ts   # single test file
npx vitest run -t "resolvePlace"                      # tests matching a name

# PDF builds — the dev server must already be running (see "Print engine")
npm run build:pdf            # /portfolio/print → public/portfolio.pdf
npm run build:pdf:en         # /portfolio/print/en → public/portfolio/portfolio-en.pdf
npm run build:pdf:design     # /portfolio/print/design → public/portfolio/portfolio-design.pdf (кейсы влиты в основное портфолио; PDF устарел)
npm run build:pdf:card       # /portfolio/print/card → public/company-card.pdf (тёмная)
npm run build:pdf:card:light # /portfolio/print/card/light → public/company-card-light.pdf (для печати)
npm run build:pdf:memo       # /portfolio/print/memo → public/memo-canton-fair-2026.pdf
node scripts/build-card-emblem.mjs  # public/ЛОГОТИП.svg → public/portfolio/wag-emblem-gold.svg

# One-shot scripts:
node scripts/sql-to-seed.mjs   # Regenerate src/lib/sql-projects.ts from SQL
node scripts/build-kz-geo.mjs  # OSM boundaries → src/lib/geo/kz-geo.generated.ts
# Tilda migration (one-time; do not rerun without reason):
node scrape_tilda.mjs; node sort_tilda.mjs; node upload_project_photos.mjs
```

`scripts/_*.mjs` are ad-hoc Puppeteer screenshot/audit helpers (output in `screenshots_*/`), not part of any pipeline.

## Design System

All tokens live in `src/app/globals.css` `:root`.

- **Background:** `#04060C` (primary), `#070B16` (secondary) — deep dark theme
- **Gold accent:** `#D4A843` / `#F0C85A` — primary brand color
- **Teal accent:** `#00C4A7` — secondary accent
- **Blue accent:** `#4F84FF` — tertiary
- **Glass effects:** `rgba(255,255,255,0.04)` bg, `rgba(255,255,255,0.08)` borders
- **Text:** `#F0F2F8` (primary), `#8892A4` (secondary), `#4A5568` (muted)
- **Max width:** 1280px, spacing scale from 4px to 140px

## Project Structure

```
src/
  proxy.ts          # Gate for /admin/* AND /api/admin/* — verifies HMAC-signed
                    # wag_admin_session cookie (see src/lib/admin-session.ts)
  app/              # Next.js App Router
    layout.tsx      # Root layout: SmoothScroll + HeaderWrapper + {children} + GlobalAnim
                    # + Tilt + CursorLogo; org JSON-LD
    template.tsx    # Wraps every route in .page-transition-wrapper (see Important Notes)
    page.tsx        # Homepage (Hero → Stats → About → Geography → Services → Partners → Footer)
    globals.css     # Design tokens + shared button styles
    error.tsx, not-found.tsx, error-pages.module.css  # Root error boundaries
    opengraph-image.tsx  # Generated og:image (dark/gold, NotoSans for Cyrillic)
    about/ services/ projects/ design/ maintenance/ licenses/ contacts/ testimonials/
    privacy/ terms/
    kz/             # Казахоязычная посадочная страница
    zakazchikam/    # «Заказчикам» — реквизиты/лицензии для тендерной квалификации
                    # (данные из src/lib/company-facts.ts)
    news/           # /news + /news/[slug] — новости компании. Контент в
                    # src/lib/news.ts (локальный модуль, НЕ Supabase), фото в
                    # public/news/<slug>/*.webp. Лайтбокс — NewsGallery.tsx,
                    # видео — VideoEmbed.tsx (фасад YouTube: локальный постер,
                    # iframe только по клику; домен прописан в CSP)
    portfolio/print # All print documents (single engine). See "Print engine".
    map-lab/        # noindex отладочная страница GeoMap (заметки по точности мест)
    effects/        # /effects — visual experiments (3d/, plotter/)
    construction-3d/, construction-3d-claude/  # 3D-презентации (эксперименты)
    admin/          # /admin/* — protected by proxy.ts
      login, projects(+new/[id]), design(+new/[id]), maintenance(+new/[id]),
      map (GeoDiagnostics), portfolio, contacts, testimonials, partners
    api/
      contact             # POST — public lead form (Zod, honeypot, rate-limit,
                          #   Telegram notify via src/lib/notify.ts)
      admin/auth          # login/logout (timing-safe, rate-limited, signed cookie)
      admin/upload        # Supabase Storage upload (magic-byte validated)
      admin/{projects,design,maintenance,testimonials,partners,contacts}  # CRUD (Zod)
    robots.ts, sitemap.ts
  components/       # Feature components, each in own folder. Non-obvious ones:
    Map/            # Geography.tsx — секция главной, обёртка над GeoMap.
                    # Geography3D.tsx — только для /effects/3d, ещё на старых x_map/y_map
    GeoMap/         # Карта географии работ (СМР + содержание + ПД) — см. «Geography map»
    ContactForm/    # POSTs to /api/contact (NOT direct Supabase)
    ServicesHeroAnim/  # orchestrator + Motif*.tsx
    Admin/          # AdminShell, *Form, *Table, GeoDiagnostics, LocationField, GeoPointPicker
  lib/
    data.ts         # seed↔Supabase fetch boundary (see "Data Layer")
    news.ts         # новости — локально
    company-facts.ts  # Подтверждённые сканами факты: БИН, адрес, телефон, лицензии,
                    # год основания, yearsOnMarket(). Единственный источник для них.
    site.ts         # SITE_URL (canonical origin)
    admin-session.ts (HMAC cookie), admin-auth.ts (requireAdmin),
    admin-schemas.ts (Zod), rate-limit.ts, notify.ts (Telegram)
    sql-projects.ts, sql-maintenance.ts  # AUTO-GENERATED seed
    geo/            # see "Geography map"
supabase/
  config.toml       # проект слинкован через Supabase CLI (ref crmfrphqgxglumezbgae)
  migrations/       # ⚠️ Единственный способ менять схему и справочные данные.
                    # `supabase db push` ходит прямо в прод и НЕ требует Docker
                    # (Docker нужен только для db pull/db dump — их не используем).
                    # Ad-hoc SQL — через Management API /database/query.
  rls-policies.sql  # Исторический дамп RLS + таблицы contacts/testimonials/partners.
                    # Уже выполнен; RLS включён на всех таблицах. Публичные
                    # политики оставляют ТОЛЬКО чтение — записи идут
                    # service-role'ом (createServiceClient).
scripts/            # build-pdf.mjs + optimize-pdf.py (PDF), sql-to-seed.mjs,
                    # build-kz-geo.mjs, bake-qr-codes.mjs (QR брошюры — load-bearing)
```

Root-level `supabase-schema.sql` / `supabase_migration_*.sql` / `fix_*.sql` are historical one-offs — new schema changes go only into `supabase/migrations/`. `SYNC_PLAN.md` is an early plan and partly outdated; `BUGS.md` is the live bug list (verified against code 2026-07-26).

## Data Layer

[src/lib/data.ts](src/lib/data.ts) is the single fetch boundary. Every function has the pattern:
`if (!isSupabaseConfigured()) return SEED_*` → `try { supabase query } catch { return SEED_* }`
(see `withSeedFallback`). The site runs without Supabase (seed = dev source of truth). The 48-project seed comes from `src/lib/sql-projects.ts` (**auto-generated** by `scripts/sql-to-seed.mjs` — do not hand-edit).

Новости — исключение: `src/lib/news.ts` держит их прямо в коде (выпусков мало,
меняются редко), админки у раздела нет. Интерфейс `getNewsItems()/getNewsItem()`
специально такой же формы, чтобы при необходимости подменить его на фетчеры.

Entities: projects, maintenance_projects, design_projects, testimonials, partners, services — all DB-backed with seed fallback (`services` has 14 rows and `getServices()` reads them). Contacts (заявки) are write-only via `/api/contact` and read in `/admin/contacts` through the service-role client.

⚠️ Seed drift: `SEED_PROJECTS` = `SQL_PROJECTS` (48) minus `MAINTENANCE_LEGACY_IDS` (21) = 27 rows, while the DB holds 32. The seed is a third source of truth and is stale — regenerate before relying on it.

Server fetchers are wrapped in `unstable_cache(..., { revalidate: 60 })`. Mutations from admin API routes must call `revalidatePath()` (all current routes do).

Headline counts are computed, not hard-coded: the homepage sums `projects + maintenance + design` lengths into `registryTotal`; PrintBrochure uses `rows.length || <fallback>` (32/20/100); years = `yearsOnMarket()` from `FOUNDED_YEAR = 2010`.

## Geography map

One map implementation is rendered on `/` (Map/Geography), `/projects`, `/map-lab` and in the print brochure. Pipeline in `src/lib/geo/`:

1. `places.ts` — gazetteer of real lat/lon places + `resolvePlace(location)`, which matches a row's free-text `location` field. Rows with `lat/lon` set (admin click-to-pin, migration `20260726150000_add_geo_override`) take priority over the text match.
2. `works.ts` — `buildGeoIndex(projects, maintenance, design)` turns all three work types into hubs (`KIND_META` holds per-kind label/color).
3. `projection.ts` — Albers conic `project()/unproject()` using constants from `kz-geo.generated.ts` (OSM boundaries, 2022 regions; regenerate with `scripts/build-kz-geo.mjs`, never hand-edit). `regions.ts` does point-in-region.
4. `layout.ts` — hub radii, overlap relaxation and label placement. Kept outside the component so `GeoMap.tsx` and `PrintBrochure.tsx` lay out identically.

A new project lands on the map automatically if its `location` text resolves; otherwise add a `PLACES` entry (and a case in `geo-places.test.ts`). `/admin/map` (GeoDiagnostics) lists rows whose address didn't resolve. Legacy `projects.x_map/y_map` pixel columns still exist but only `Geography3D`/`getMapProjects()` on `/effects/3d` read them.

## Print engine

**Single engine: Puppeteer/Chromium** via `scripts/build-pdf.mjs`. (react-pdf `src/lib/pdf/` + `/api/portfolio.pdf` were removed 2026-06-11.)

- Main brochure (38 pages, redesigned 2026-10-19): shared layout
  `src/app/portfolio/print/PrintBrochure.tsx` (+ `CaseSheet.tsx`, `PztmShowcase.tsx`; styles
  `print.module.css` + `case.module.css`) and verbatim locale copy in `print/content/{ru,en}.tsx` +
  `cases-{ru,en}.tsx` (typed by `content/types.ts`); the few strings the layout adds itself are in
  `print/copy.ts`. `page.tsx` / `en/page.tsx` are thin wrappers. RU content edits must be mirrored
  in EN. Type scale = 7 tokens `--t-*` in `.book`; `--gold`/`--teal` follow the page tone; colour
  code gold = design, teal = construction, blue = maintenance. Case sheets: drawings toned to the
  sheet by `print/img/route.ts` (`blueprint` on dark, `paper` on light; background = page colour, no
  frame or plate) sharing the free height (no holes/overflow); satellite insets keep their colours
  (`photoMask` — measured on all drawings, re-check after adding new ones). Header seal shows the
  status only; the GE number stays in the stage line. Cases renumbered without gaps. Directions
  spread (`DirectionPage`): registry count as headline, services with icons, stage timeline.
  Testimonials: four letters in full + a QR card to `/testimonials`. Partner logos go through the
  same route (`tone=mono-light`). Owner rejected (2026-10-19/20): contents page, section dividers,
  site-photo spread, framed drawing plates, the list of the remaining letters.
- Other print documents under `portfolio/print/`: `design/` (design brochure — outdated, its cases
  were merged into the main one; keeps the pre-redesign stylesheet `design/brochure.module.css`), `card/` + `card/light/`
  (company card — `card/content.ts` is verbatim from the scanned card, don't "improve" it), `memo/`
  (Canton Fair 2026 memorandum).
- **Output is a vector PDF** (text stays text: searchable, sharp at any zoom). Rasterizing every
  page to a 300 dpi JPEG was dropped 2026-10-19: it made a 25 MB file with no text that was also
  the slowest to open (each page = 33 MB of pixels to decode). Now RU/EN ≈ 13 MB.
- `build-pdf.mjs` env: `PRINT_URL` (default `http://localhost:3000/portfolio/print`), `OUT_PDF`
  (relative or absolute; default `public/portfolio.pdf`), `PDF_TITLE`, `PAGE` (one page for review →
  `versions/v<PAGE>_preview.pdf`), `PDF_DPI` (300), `PDF_JPEG_Q` (90), `PDF_MAX_MB` (20),
  `ALLOW_SEED=1`, `PDF_OUTLINE=1` (on in `build:pdf(:en)`: bookmarks; build-pdf rewrites their
  titles from the headings' innerText because Chromium drops spaces at line wraps). Two passes:
  measure where each `<img>` lands, then reload in a fresh browser context (a plain reload keeps
  pass-1 bitmaps of cacheable images) serving every image
  resized (sharp) to its placed size at 300 dpi — Chromium otherwise embeds source resolution
  (drawings were 400–1776 dpi, 42 of 45 MB). Then `scripts/optimize-pdf.py` (Python + `pymupdf`)
  packs the file and **rejects** it; the public file is replaced only if every check passes:
  Type3 fonts, system fallback fonts (Arial/Segoe…), soft masks, page count ≠ `data-pages`,
  size budget, clipped text, failed requests, and brochure counts ≠ Supabase row counts
  (`data-db-counts` — catches a silent seed fallback).
- Print CSS rules that keep it fast (enforced by those checks): static TTF only — `@font-face`
  WagOnest/WagGrotesk/WagOutfit/WagNoto/WagSymbols in `print.module.css` (next/font variable
  fonts become Type3), every stack ends in Onest + Noto (Space Grotesk/Outfit have no Cyrillic,
  Onest has no Kazakh/₸; without them text fell back to Arial); no blurred `box-shadow`, no alpha
  gradients over flat backgrounds (pre-mix with `color-mix`) — both become soft masks. Only the
  map's outlined labels (SVG `stroke`) may be Type3. Never use PyMuPDF `rewrite_images()` on
  Chromium PDFs — it breaks image patterns.
- After editing print pages you MUST rebuild or the public file goes stale. Hero button, /services
  button, Footer link and /admin/portfolio preview all point to the static `/portfolio.pdf`.
- Branded QR (gold WAG triangle in the centre) = `print/BrandQr.tsx`: built inline from `qrcode`
  as vector paths, error correction H, same look as `scripts/build-brand-qr.mjs`. Used for the two
  ПЗТМ construction videos (`PztmShowcase.tsx`, `PZTM_VIDEOS`), the testimonials card and the site
  link on the contacts page; the cards are links in the PDF. Keep URLs short (`youtu.be/<id>`, no
  `?si=`). Verify scans with ZXing (`zxing-cpp`), not OpenCV — OpenCV can't read rounded finder
  patterns at all.
- `scripts/bake-qr-codes.mjs` produces QR PNGs under `public/portfolio/` that the brochure reads.
  Don't delete. Карта разворота «масштаб» рисуется вектором из `src/lib/geo`.

## Admin Panel & Security

- **Session:** HMAC-signed expiring cookie (`src/lib/admin-session.ts`, Web Crypto — works
  in Proxy runtime). Secret = `SESSION_SECRET` env (falls back to `ADMIN_PASSWORD`).
  No password env → login fails closed (no hardcoded fallback).
- **Gates:** `proxy.ts` matches `/admin/:path*` AND `/api/admin/:path*` (401 JSON for API;
  `/admin/login` and `/api/admin/auth` stay open); every route handler ALSO calls
  `requireAdmin()` (defense in depth).
- **Login:** timing-safe compare, rate-limited 5/15min per IP (`src/lib/rate-limit.ts` —
  in-memory, single-instance).
- **Validation:** all admin CRUD bodies go through Zod (`src/lib/admin-schemas.ts`) —
  unknown fields stripped; DB errors sanitized via `dbErrorMessage()`.
- **Upload:** `/api/admin/upload` → Supabase Storage `project-images` (max 10 MB;
  JPEG/PNG/WebP/AVIF; magic bytes verified, extension from validated MIME).
- **Mutations** use `createServiceClient()` (service role, bypasses RLS); public reads use
  the anon client.

## Lead pipeline

ContactForm → `POST /api/contact` (Zod + honeypot `website` field + 5/hour/IP rate limit)
→ insert into `contacts` (service role) → Telegram notification (`src/lib/notify.ts`,
needs `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`, silent no-op without them) →
viewed/processed in `/admin/contacts`.

## Code Conventions

- **Language:** UI text in Russian, code identifiers in English
- **Components:** Default exports, one component per file
- **Client components:** Only add `'use client'` when needed (event handlers, hooks, browser APIs)
- **CSS:** Use CSS Modules (`.module.css`), never inline styles. Follow existing token names from globals.css
- **Images:** public-site galleries/cards use `next/image` (`fill` + `sizes`, parents are
  `position: relative`). Print brochure and admin previews use plain `<img>` deliberately.
- **Animations:** CSS `@keyframes` preferred. SVG animations for engineering visuals
- **Buttons:** Animated conic-gradient border (teal-to-gold beam), transparent fill, white text — defined in globals.css
- **Section backgrounds:** Background images live in `public/images/` and are referenced as `/images/filename.webp` in CSS. All section bg images use a dark gradient overlay on top.
- **External images:** Only Supabase Storage (`*.supabase.co`) in `next.config.ts` remotePatterns.
- **Security headers / canonical:** nosniff, SAMEORIGIN, Referrer-Policy, Permissions-Policy,
  HSTS **and CSP** set via `headers()` in `next.config.ts` (CSP allows inline scripts/styles,
  Supabase и YouTube — `frame-src youtube-nocookie.com` + `img-src i.ytimg.com` для видео
  в новостях; `unsafe-eval` dev-only — if a new external origin is added, extend CSP).
  Canonical: `alternates: { canonical: './' }` in layout. Public origin from `src/lib/site.ts`
  (`NEXT_PUBLIC_SITE_URL`, fallback `https://www.westarlangroup.kz` — the host 308-redirects
  the apex to www, so www is canonical).
- **Env vars:** documented in `.env.example`.

## Public Folder Structure

```
public/
  images/        # Section background images (WebP) used in CSS url()
  partners/      # Partner company logos (PNG/JPG) — referenced by partners table/seed
  news/          # Фото новостей по папкам-слагам (WebP ≤1600px; оригиналы —
                 #   в z:\WAG\_site-originals, в репозиторий не кладём)
  portfolio/     # Brochure assets (qr-*.png, pztm/, design/, emblems) + portfolio-en.pdf
  portfolio.pdf  # RU brochure (built from /portfolio/print)
  licenses/      # license scans, ISO 9001 certs, original PDFs
  fonts/         # Local TTF/OTF (noto/onest/inter/roboto/mono, print/) — print + og-image
```
(Source PNG originals moved out of `public/` to `z:\WAG\_site-originals` — 100 MB, never deploy.)

## Important Notes

- Always match the dark/gold premium aesthetic
- WAG triangle logo (`assets/logotriangle.svg`, viewBox `0 0 719.49 635.66`) used in Header and Hero with 3D Y-axis spin
- Company facts (БИН, лицензии, адрес, телефон, год основания) come only from `src/lib/company-facts.ts`,
  which is verified against the scans in `public/licenses/`. Don't invent certifications, counts or dates in copy.
- `.page-transition-wrapper` (template.tsx) has `will-change: opacity, transform`, which makes it the
  containing block for `position: fixed` descendants. Fullscreen overlays (lightboxes, modals) must render
  through a portal to `document.body` — see `news/[slug]/NewsGallery.tsx`.
- Homepage testimonial slider in `Partners.tsx` (`TESTIMONIAL_SNIPPETS`) is deliberately
  static curated copy; the letters on /testimonials are DB-backed
- Real testimonial letters cite «West Capital Construction LLP» — never auto-rename
