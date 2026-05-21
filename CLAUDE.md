@AGENTS.md

# West Arlan Group — Corporate Website

Premium engineering/railway infrastructure company website (Kazakhstan).

## Tech Stack

- **Framework:** Next.js 16.2.2 (App Router, TypeScript)
- **Styling:** Vanilla CSS Modules (NO Tailwind) — one `.module.css` per component
- **Backend:** Supabase (`src/lib/supabase.ts`, `src/lib/supabase-server.ts`)
- **Data:** `src/lib/data.ts` (seed data with Supabase fallback), `src/lib/types.ts`
- **Fonts:** Outfit (headings) + Inter (body) via Google Fonts CDN

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
  middleware.ts     # Protects /admin/* via wag_admin_session cookie
  app/              # Next.js App Router
    layout.tsx      # Root layout (SmoothScroll + GlobalVerticalBg + Header + GlobalAnim)
    page.tsx        # Homepage (Hero → Stats → About → Geography → Services → Partners → Footer)
    globals.css     # Design tokens + shared button styles
    about/          # /about
    services/       # /services
    projects/       # /projects + /projects/[id]
    design/         # /design + /design/[id] (project-design portfolio)
    licenses/       # /licenses (certificates + license docs)
    portfolio/print # LEGACY: /portfolio/print + /portfolio/print/en — Puppeteer-rendered PDF source.
                    # Kept untouched as reference. New print engine is src/lib/pdf/ (see below).
    contacts/       # /contacts
    testimonials/   # /testimonials
    effects/        # /effects — visual experiments / scratch page
    admin/          # /admin/* — protected by middleware.ts
      login, projects, projects/new, projects/[id]
      design, design/new, design/[id], map
      portfolio       # /admin/portfolio — live PDF preview + download (uses /api/portfolio.pdf)
    api/
      admin/auth          # cookie login/logout
      admin/upload        # Supabase Storage upload (bucket: project-images)
      admin/projects      # CRUD for projects table
      admin/design        # CRUD for design_projects table
      admin/update-map-coords  # bulk write x_map/y_map from MapCalibrator
      debug-env           # env check
      portfolio.pdf       # GET → fresh PDF brochure on demand (~2s, ~2MB)
    robots.ts, sitemap.ts
  components/       # Feature components, each in own folder
    Header/, Hero/, Stats/, About/, Services/, Projects/, Partners/, Footer/
    Map/            # Geography + KazakhstanMap + MapPopup
    ContactForm/
    AboutHeroAnim/, ServicesHeroAnim/    # Section-specific engineering anims
    ProjectShowcase/                     # Detail-page showcase stage
    Admin/          # AdminShell, ProjectForm, ProjectsTable, DesignProjectForm,
                    # DesignProjectsTable, MapCalibrator, MapPicker
    ui/             # GlobalVerticalBg(+Multi), GlobalAnim, HeroBlueprintBg,
                    # AnimatedCounter, MagneticCursor, PdfPreview, SmoothScroll
  lib/              # data.ts (seed↔Supabase), supabase(.ts/-server.ts),
                    # sql-projects.ts (AUTO-GENERATED), types.ts
    pdf/            # PRINT ENGINE — see "Print engine" section below
      tokens.ts, fonts.ts, Portfolio.tsx, generate.ts
      content/{ru.ts, types.ts}    # all copy, one file per locale
      data/getPortfolioData.ts     # fetches projects + computes stats
      ui/{Page,Typography,Cards,Icons,WagMark,asset}.tsx
      blocks/{Cover,About,Scale,Map,Iso,License,Direction,QR,Testimonials,Partners,Contacts}.tsx
scripts/            # One-shot: build-pdf.mjs, optimize-pdf.py, sql-to-seed.mjs
```

## Data Layer

[src/lib/data.ts](src/lib/data.ts) is the single fetch boundary. Every function has the pattern:
`if (!isSupabaseConfigured()) return SEED_*` → `try { supabase query } catch { return SEED_* }`.
This means the site runs without Supabase (seed data is the source of truth in dev). The 48-project seed comes from `src/lib/sql-projects.ts`, which is **auto-generated** by `scripts/sql-to-seed.mjs` — do not hand-edit it.

Server fetchers (`getProjects`, `getDesignProjects`) are wrapped in `unstable_cache(..., { revalidate: 60 })`. Mutations from admin API routes must call `revalidatePath()` to invalidate (see `update-map-coords` for the pattern).

## Print Engine

`src/lib/pdf/` is a **block-based PDF generator** that reads the same data
as the website (`getProjects()` etc.) and outputs an A4 portrait brochure.

- **Output route:** `GET /api/portfolio.pdf` — fresh PDF, ~2 sec, ~2 MB,
  cached 5 min at the edge. Add `?download=1` for attachment headers.
- **Admin UI:** `/admin/portfolio` shows live preview in iframe + download
  button + data freshness panel.
- **Stack:** `@react-pdf/renderer` (NOT Puppeteer). Inter alias → Noto
  Sans TTF (cyrillic + Kazakh). KZ map pre-baked to PNG via
  `scripts/bake-kz-map.mjs`.
- **Adding/reordering pages:** edit `src/lib/pdf/Portfolio.tsx` — it's a
  manifest of `<Block ... />` calls.
- **Editing copy:** `src/lib/pdf/content/ru.ts` — single file with all
  Russian text. Marketing numbers (49, 87, 16, 136, 94%) live in
  `data/getPortfolioData.ts`.
- **Editing visuals:** design tokens in `tokens.ts`, primitives in `ui/*`,
  page-type components in `blocks/*`.

**Gotchas:**
- react-pdf supports JPG/PNG only — NOT WebP/AVIF. Local images must be
  passed via `assetBuffer('/relative/path')` (in `ui/asset.ts`), not as
  string paths.
- Inter font ships only as OTF; fontkit can't subset it. Roboto lacks
  Kazakh Cyrillic (Қ, ұ, і). Use Noto Sans — already wired up.
- `<Text>` doesn't process literal `\n` in template strings. Use JSX
  `{'\n'}` or split-and-rebuild (`BigBadge` does this).
- After editing a static image in `/public`, the asset cache invalidates
  on next request via mtime check (see `ui/asset.ts`).

**Legacy:** `src/app/portfolio/print/` (Puppeteer-rendered) is kept for
reference but unused. The new engine fully replaces it.

## Admin Panel

- Protected by [src/middleware.ts](src/middleware.ts): requires `wag_admin_session=wag-admin-authenticated` cookie. Login sets it via `POST /api/admin/auth` with the `ADMIN_PASSWORD` env var. **Fallback password if env is unset: `wag2025admin` (hardcoded).** Always set `ADMIN_PASSWORD` in production env.
- Image upload goes through `/api/admin/upload` to Supabase Storage bucket `project-images` (max 10 MB; JPEG/PNG/WebP/AVIF).
- `/admin/map` uses [MapCalibrator](src/components/Admin/MapCalibrator.tsx) — drag markers on the SVG, bulk-save via `/api/admin/update-map-coords`. Coordinate system: `x_map: 0–1024`, `y_map: 0–800` (must match [KazakhstanMap.tsx](src/components/Map/KazakhstanMap.tsx)).

## Code Conventions

- **Language:** UI text in Russian, code identifiers in English
- **Components:** Default exports, one component per file
- **Client components:** Only add `'use client'` when needed (event handlers, hooks, browser APIs)
- **CSS:** Use CSS Modules (`.module.css`), never inline styles. Follow existing token names from globals.css
- **Animations:** CSS `@keyframes` preferred. SVG animations for engineering visuals
- **Buttons:** Animated conic-gradient border (teal-to-gold beam), transparent fill, white text — defined in globals.css
- **Section backgrounds:** Background images live in `public/images/` and are referenced as `/images/filename.webp` in CSS. All section bg images use a dark gradient overlay on top.
- **External images:** Configured in `next.config.ts` remotePatterns (clearbit, wikimedia, wikipedia)

## Public Folder Structure

```
public/
  images/        # Section background images (WebP) used in CSS url()
                 #   1.webp – 9.webp, stats-bg.webp,
                 #   Gemini_Generated_Image_*.webp (AI-generated)
  partners/      # Partner company logos (PNG/JPG) used in Partners marquee
  portfolio/     # Project portfolio images (Tilda-scraped pageXX_imgY.png) +
                 # portfolio-en.pdf
  portfolio.pdf  # RU brochure (built from /portfolio/print)
  licenses/      # license-pd.jpg, license-smr.jpg, ISO 9001 certs,
                 # экологический сертификат, original PDFs
  _originals/    # Original source PNGs — do not reference in code
```

## Commands

```bash
npm run dev    # Start dev server (port 3000)
npm run build  # Production build
npm run lint   # ESLint

# One-shot scripts (no npm script wired):
node scripts/sql-to-seed.mjs           # Regenerate src/lib/sql-projects.ts from SQL
node scripts/build-pdf.mjs             # Render /portfolio/print → public/portfolio.pdf
                                       #   (requires dev server running)
OUT_PDF=public/portfolio/portfolio-en.pdf PRINT_URL=http://localhost:3000/portfolio/print/en \
  node scripts/build-pdf.mjs           # English brochure
# Tilda migration (one-time; do not rerun without reason):
node scrape_tilda.mjs                  # → ./tilda-images/
node sort_tilda.mjs                    # → ./tilda-sorted/{photos,letters,...}/
node upload_project_photos.mjs         # → Supabase Storage + projects.images[]
```

## Important Notes

- Always match the dark/gold premium aesthetic
- Engineering grid (`GlobalVerticalBg`) fades out after ~1400px via SVG mask
- WAG triangle logo (`assets/logotriangle.svg`, viewBox `0 0 719.49 635.66`) used in Header and Hero with 3D Y-axis spin
- Hero has two stacked engineering animation panels (waveform + terrain) on the right side
- Compass component in Hero has labels positioned to the right of the compass dial
