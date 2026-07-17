@AGENTS.md

# West Arlan Group — Corporate Website

Premium engineering/railway infrastructure company website (Kazakhstan).

## Tech Stack

- **Framework:** Next.js 16.x (App Router, TypeScript)
- **Styling:** Vanilla CSS Modules (NO Tailwind) — one `.module.css` per component
- **Backend:** Supabase (`src/lib/supabase-server.ts` — anon reads via `createServerClient`, privileged mutations via `createServiceClient`; no browser client — all writes go through API routes)
- **Data:** `src/lib/data.ts` (seed data with Supabase fallback), `src/lib/types.ts`
- **Tests:** Vitest (`npm test`) — unit tests in `src/lib/__tests__/`
- **Fonts:** loaded via `next/font/google` in `layout.tsx` — Space Grotesk (`--font-heading`, latin only), Onest (`--font-body`, latin + cyrillic), Outfit (`--font-display`). Space Grotesk/Outfit have no Cyrillic subset; RU/KZ glyphs fall back to Onest via the CSS font chain. Local TTF/OTF in `public/fonts/` are used by the print brochure and `opengraph-image.tsx` (satori needs raw font files).

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
    layout.tsx      # Root layout (SmoothScroll + HeaderWrapper + {children} + GlobalAnim + Tilt)
    page.tsx        # Homepage (Hero → Stats → About → Geography → Services → Partners → Footer)
    globals.css     # Design tokens + shared button styles
    error.tsx, not-found.tsx, error-pages.module.css  # Root error boundaries
    opengraph-image.tsx  # Generated og:image (dark/gold, NotoSans for Cyrillic)
    about/ services/ projects/ design/ licenses/ contacts/ testimonials/ maintenance/
    portfolio/print # THE brochure source (single engine). PrintBrochure.tsx (shared
                    # layout) + content/{ru,en}.tsx (verbatim copy) + thin page.tsx
                    # wrappers (RU + /en). scripts/build-pdf.mjs renders →
                    # public/portfolio.pdf. See "Print engine".
    effects/        # /effects — visual experiments / scratch page
    admin/          # /admin/* — protected by proxy.ts
      login, projects(+new/[id]), design(+new/[id]), maintenance(+new/[id]),
      map, portfolio, contacts, testimonials, partners
    api/
      contact             # POST — public lead form (Zod, honeypot, rate-limit,
                          #   Telegram notify via src/lib/notify.ts)
      admin/auth          # login/logout (timing-safe, rate-limited, signed cookie)
      admin/upload        # Supabase Storage upload (magic-byte validated)
      admin/projects, admin/design, admin/maintenance   # CRUD (Zod-validated)
      admin/testimonials, admin/partners, admin/contacts # CRUD (Zod-validated)
      admin/update-map-coords  # bulk write x_map/y_map from MapCalibrator
    robots.ts, sitemap.ts
  components/       # Feature components, each in own folder
    Header/, Hero/, Stats/, About/, Services/, Projects/, Partners/, Footer/
    Map/            # Geography + KazakhstanMap + MapPopup
    ContactForm/    # POSTs to /api/contact (NOT direct Supabase)
    HeroCycler/, ServicesHeroAnim/       # ServicesHeroAnim = orchestrator + Motif*.tsx
    ProjectShowcase/
    Admin/          # AdminShell, *Form, *Table (+ ContactsTable, TestimonialsAdmin,
                    # PartnersAdmin), MapCalibrator, MapPicker
    ui/             # GlobalAnim, AnimatedCounter, PdfPreview, SmoothScroll, Tilt, CursorLogo
  lib/              # data.ts (seed↔Supabase), supabase(.ts/-server.ts), types.ts,
                    # admin-session.ts (HMAC cookie), admin-auth.ts (requireAdmin),
                    # admin-schemas.ts (Zod), rate-limit.ts, notify.ts (Telegram),
                    # sql-projects.ts + sql-maintenance.ts (AUTO-GENERATED)
supabase/
  rls-policies.sql  # RLS + таблицы contacts/testimonials/partners + seed inserts.
                    # ⚠️ Must be run once in Supabase SQL editor; admin mutations
                    # use SUPABASE_SERVICE_ROLE_KEY (createServiceClient).
scripts/            # build-pdf.mjs (npm run build:pdf), optimize-pdf.py, sql-to-seed.mjs,
                    # bake-kz-map.mjs + bake-qr-codes.mjs (brochure assets — load-bearing)
```

## Data Layer

[src/lib/data.ts](src/lib/data.ts) is the single fetch boundary. Every function has the pattern:
`if (!isSupabaseConfigured()) return SEED_*` → `try { supabase query } catch { return SEED_* }`
(see `withSeedFallback`). The site runs without Supabase (seed = dev source of truth). The 48-project seed comes from `src/lib/sql-projects.ts` (**auto-generated** by `scripts/sql-to-seed.mjs` — do not hand-edit).

Entities: projects, maintenance_projects, design_projects, testimonials, partners (DB-backed with seed fallback) + services (seed-only). Contacts (заявки) are write-only via `/api/contact` and read in `/admin/contacts` through the service-role client.

Server fetchers are wrapped in `unstable_cache(..., { revalidate: 60 })`. Mutations from admin API routes must call `revalidatePath()` (all current routes do).

## Print engine

**Single engine: Puppeteer/Chromium.** (react-pdf `src/lib/pdf/` + `/api/portfolio.pdf` were removed 2026-06-11.)

- Shared layout `src/app/portfolio/print/PrintBrochure.tsx` + verbatim locale copy in
  `print/content/{ru,en}.tsx` (typed by `content/types.ts`). `page.tsx` / `en/page.tsx`
  are thin wrappers. 15 page-sections; marketing constants (29/20/87 → 136) live in
  PrintBrochure.
- `npm run build:pdf` (RU) / `npm run build:pdf:en` render via the running dev server →
  **`public/portfolio.pdf`** / `public/portfolio/portfolio-en.pdf` (~8 MB, rasterized).
  After editing print pages you MUST rebuild or the public file goes stale.
- Consumed by: Hero button, /services button, Footer link, /admin/portfolio preview —
  all point to the static `/portfolio.pdf`.
- `scripts/bake-kz-map.mjs` and `scripts/bake-qr-codes.mjs` produce PNGs under
  `public/portfolio/` that the brochure reads. Don't delete.

## Admin Panel & Security

- **Session:** HMAC-signed expiring cookie (`src/lib/admin-session.ts`, Web Crypto — works
  in Proxy runtime). Secret = `SESSION_SECRET` env (falls back to `ADMIN_PASSWORD`).
  No password env → login fails closed (no hardcoded fallback).
- **Gates:** `proxy.ts` matches `/admin/:path*` AND `/api/admin/:path*` (401 JSON for API);
  every route handler ALSO calls `requireAdmin()` (defense in depth).
- **Login:** timing-safe compare, rate-limited 5/15min per IP (`src/lib/rate-limit.ts` —
  in-memory, single-instance).
- **Validation:** all admin CRUD bodies go through Zod (`src/lib/admin-schemas.ts`) —
  unknown fields stripped; DB errors sanitized via `dbErrorMessage()`.
- **Upload:** `/api/admin/upload` → Supabase Storage `project-images` (max 10 MB;
  JPEG/PNG/WebP/AVIF; magic bytes verified, extension from validated MIME).
- **Mutations** use `createServiceClient()` (service role, bypasses RLS); public reads use
  the anon client. RLS policies: `supabase/rls-policies.sql`.
- `/admin/map` uses [MapCalibrator](src/components/Admin/MapCalibrator.tsx) — drag markers,
  bulk-save via `/api/admin/update-map-coords` (`x_map: 0–1024`, `y_map: 0–800`, must match
  [KazakhstanMap.tsx](src/components/Map/KazakhstanMap.tsx)).

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
  HSTS **and CSP** set via `headers()` in `next.config.ts` (CSP allows inline scripts/styles +
  Supabase; `unsafe-eval` dev-only — if a new external origin is added, extend CSP).
  Canonical: `alternates: { canonical: './' }` in layout. Public origin from `src/lib/site.ts`
  (`NEXT_PUBLIC_SITE_URL`, fallback `https://west-arlan.kz`).
- **Env vars:** documented in `.env.example`.

## Public Folder Structure

```
public/
  images/        # Section background images (WebP) used in CSS url()
  partners/      # Partner company logos (PNG/JPG) — referenced by partners table/seed
  portfolio/     # Brochure assets (kz-map.png, qr-*.png, previews) + portfolio-en.pdf
  portfolio.pdf  # RU brochure (built from /portfolio/print)
  licenses/      # license scans, ISO 9001 certs, original PDFs
  fonts/         # Local TTF/OTF (noto/onest/inter/roboto/mono) — print + og-image
```
(Source PNG originals moved out of `public/` to `z:\WAG\_site-originals` — 100 MB, never deploy.)

## Commands

```bash
npm run dev          # Dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Vitest (src/lib/__tests__)
npm run build:pdf    # /portfolio/print → public/portfolio.pdf (dev server must run)
npm run build:pdf:en # EN brochure → public/portfolio/portfolio-en.pdf

# One-shot scripts:
node scripts/sql-to-seed.mjs   # Regenerate src/lib/sql-projects.ts from SQL
# Tilda migration (one-time; do not rerun without reason):
node scrape_tilda.mjs; node sort_tilda.mjs; node upload_project_photos.mjs
```

## Important Notes

- Always match the dark/gold premium aesthetic
- WAG triangle logo (`assets/logotriangle.svg`, viewBox `0 0 719.49 635.66`) used in Header and Hero with 3D Y-axis spin
- Homepage testimonial slider in `Partners.tsx` (`TESTIMONIAL_SNIPPETS`) is deliberately
  static curated copy; the letters on /testimonials are DB-backed
- Real testimonial letters cite «West Capital Construction LLP» — never auto-rename
- Hero/brochure marketing numbers (136 = 49 СМР + 87 ПД, 16 лет) are invented copy — adjustable
