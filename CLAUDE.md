@AGENTS.md

# West Arlan Group — Corporate Website

Premium engineering/railway infrastructure company website (Kazakhstan).

## Tech Stack

- **Framework:** Next.js 16.2.2 (App Router, TypeScript)
- **Styling:** Vanilla CSS Modules (NO Tailwind) — one `.module.css` per component
- **Backend:** Supabase (`src/lib/supabase.ts`, `src/lib/supabase-server.ts`)
- **Data:** `src/lib/data.ts` (seed data with Supabase fallback), `src/lib/types.ts`
- **Fonts:** loaded via `next/font/google` in `layout.tsx` — Space Grotesk (`--font-heading`, latin only), Onest (`--font-body`, latin + cyrillic), Outfit (`--font-display`). Space Grotesk/Outfit have no Cyrillic subset; RU/KZ glyphs fall back to Onest via the CSS font chain.

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
  proxy.ts          # Protects /admin/* via wag_admin_session cookie (Next 16: renamed from middleware.ts)
  app/              # Next.js App Router
    layout.tsx      # Root layout (SmoothScroll + HeaderWrapper + {children} + GlobalAnim + Tilt)
    page.tsx        # Homepage (Hero → Stats → About → Geography → Services → Partners → Footer)
    globals.css     # Design tokens + shared button styles
    about/          # /about
    services/       # /services
    projects/       # /projects + /projects/[id]
    design/         # /design + /design/[id] (project-design portfolio)
    licenses/       # /licenses (certificates + license docs)
    portfolio/print # ACTIVE Puppeteer brochure source (RU + /en). scripts/build-pdf.mjs
                    # renders these → public/portfolio.pdf (the Hero download button). See "Print engines".
    contacts/       # /contacts
    testimonials/   # /testimonials
    effects/        # /effects — visual experiments / scratch page
    admin/          # /admin/* — protected by proxy.ts
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

## Print engines

⚠️ There are **TWO live PDF systems**, each wired to a different public button.
This is a known inconsistency — they produce different brochures. Pick one as
canonical before doing brochure work.

**1. Puppeteer (the premium brochure, source of truth for content).**
- Source: `src/app/portfolio/print/page.tsx` (RU) + `print/en/page.tsx` (EN),
  full CSS/gradients. `scripts/build-pdf.mjs` renders them to
  **`public/portfolio.pdf`** (~8 MB, rasterized).
- Consumed by: the **Hero "download" button** (`Hero.tsx` → `/portfolio.pdf`)
  and the admin "Premium (Chromium)" tab.
- Build is manual: `node scripts/build-pdf.mjs` (not an npm script). After
  editing the print pages you MUST rerun it or `public/portfolio.pdf` goes stale.
- ⚠️ RU and EN print pages are ~85% duplicated (~3800 lines total) — extraction
  to a shared layout + locale content files is a pending refactor.

**2. react-pdf (`src/lib/pdf/`, the on-demand "quick" brochure).**
- `GET /api/portfolio.pdf` — fresh PDF, ~2 sec, ~2 MB, cached 5 min at the edge.
  `?download=1` for attachment headers. `@react-pdf/renderer` (NOT Puppeteer).
- Consumed by: the **`/services` page download link** and the admin
  "Quick (react-pdf)" tab.
- Pages: manifest in `src/lib/pdf/Portfolio.tsx`. Copy in `content/ru.ts`.
  Marketing numbers in `data/getPortfolioData.ts`. Tokens in `tokens.ts`,
  primitives in `ui/*`, page blocks in `blocks/*`.

**Shared, load-bearing:** `scripts/bake-kz-map.mjs` (KZ map → PNG) and
`scripts/bake-qr-codes.mjs` (QR → PNG) produce assets under `public/portfolio/`
read by both systems. Don't delete.

**react-pdf gotchas:**
- JPG/PNG only — NOT WebP/AVIF. Local images via `assetBuffer('/path')`
  (`ui/asset.ts`), not string paths.
- Inter ships OTF-only (fontkit can't subset); Roboto lacks Kazakh (Қ, ұ, і).
  Noto Sans is wired up instead.
- `<Text>` ignores literal `\n` — use JSX `{'\n'}` or split-and-rebuild.
- Static `/public` image edits invalidate the asset cache via mtime (`ui/asset.ts`).

## Admin Panel

- Protected by [src/proxy.ts](src/proxy.ts): requires `wag_admin_session=wag-admin-authenticated` cookie. Login sets it via `POST /api/admin/auth` with the `ADMIN_PASSWORD` env var. **Fallback password if env is unset: `wag2025admin` (hardcoded).** Always set `ADMIN_PASSWORD` in production env.
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
- **External images:** Only Supabase Storage (`*.supabase.co`) is allowed in `next.config.ts` remotePatterns. (clearbit/wikimedia/wikipedia were removed 2026-05-29 — unused.)
- **Security headers / canonical URL:** baseline headers (`nosniff`, `SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`, HSTS) set via `headers()` in `next.config.ts` — no CSP yet (inline JSON-LD + next/font + three.js make a strict policy non-trivial). Public origin comes from `src/lib/site.ts` (`SITE_URL`, env `NEXT_PUBLIC_SITE_URL` with `https://west-arlan.kz` fallback) — used by `layout.tsx` metadata, `sitemap.ts`, `robots.ts`.

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
