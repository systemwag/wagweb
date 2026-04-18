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
  app/              # Next.js App Router pages (layout.tsx, page.tsx, globals.css)
  components/       # Feature components, each in own folder
    Header/         # Sticky glassmorphism nav + WAG logo spinner
    Hero/           # Full-screen hero + engineering animation panels
    Stats/          # Animated counter cards
    About/          # Mission + values + licenses + KZ map
    Services/       # Service direction cards + grid
    Projects/       # Project cards with metadata
    Partners/       # Partner logos (external images) + CTA
    Footer/         # Contact bar + columns + bottom bar
    ContactForm/    # Contact form component
    Map/            # Map component
    Admin/          # Admin panel
    ui/             # Shared UI: GlobalVerticalBg (grid overlay)
  lib/              # Data layer, Supabase clients, types
```

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
                 #   stats-bg.webp, 2.webp, 7.webp, 1.webp
                 #   Gemini_Generated_Image_*.webp (AI-generated backgrounds)
  partners/      # Partner company logos (PNG/JPG) used in Partners marquee
  portfolio/     # Project portfolio images
  licenses/      # License document images
  _originals/    # Original source images (PNG) — do not reference in code
```

## Commands

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # ESLint
```

## Important Notes

- Always match the dark/gold premium aesthetic
- Engineering grid (`GlobalVerticalBg`) fades out after ~1400px via SVG mask
- WAG triangle logo (`assets/logotriangle.svg`, viewBox `0 0 719.49 635.66`) used in Header and Hero with 3D Y-axis spin
- Hero has two stacked engineering animation panels (waveform + terrain) on the right side
- Compass component in Hero has labels positioned to the right of the compass dial
