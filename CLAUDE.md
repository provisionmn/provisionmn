# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm i` — install dependencies (plain `npm install`; no `.npmrc`, no peer-dep flags needed)
- `npm run dev` — Next dev server (Turbopack)
- `npm run build` — production build; runs `tsc` as part of the build
- `npm run start` — serve the production build locally
- `npm run typecheck` — `tsc --noEmit` on its own

There are no tests and no lint config. `npm run build` and `npm run typecheck` are the only automated verification.

**Known build trap:** when `tsc` reports an error, Next 16's Rust code-frame renderer panics (`end byte index … is not a char boundary`) instead of printing it — the source files are Mongolian, and it slices UTF-8 by byte offset. The build then dies with `SIGABRT` and no usable message. Run `npx tsc --noEmit` directly to see the real errors.

Deployment: pushing to `main` triggers a production deploy on Vercel; branch/PR pushes get preview deploys.

## Architecture

Marketing site for Provision.mn, originally generated from Figma Make, ported to Vite, then migrated to **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4**.

There is **no backend and no persistence**. Nothing in `src/` calls `fetch`, and there are no env vars. `QuoteRequest` fakes a 2s submit, shows a success card, and returns to `/` after 3s — the data goes nowhere.

### Routes

`src/app/` is the App Router directory. Four routes, all statically prerendered:

| Route | Page file | Renders |
| --- | --- | --- |
| `/` | `page.tsx` | Hero, Services, Products, About, Portfolio, Contact + Chatbot |
| `/services` | `services/page.tsx` | `ServicesDetail` |
| `/calculator` | `calculator/page.tsx` | `PriceCalculator` |
| `/quote` | `quote/page.tsx` | `QuoteRequest` |

`layout.tsx` owns `<html>`/`<body>`, the providers, and the `Header` + `Footer` that every route shares — pages render only their own content.

**Page files are Server Components and must stay that way**: each one exports `metadata`, which Next ignores in a Client Component. That is why navigation lives inside the section components (`Link` / `useRouter`) instead of being passed down as callbacks — a server page cannot hand a function to a client child.

Within `/`, `Header` and `Hero` still navigate by `scrollIntoView` on section ids (`#home`, `#services`, `#products`, `#portfolio`, `#about`, `#contact`) — those ids live on the section components, so renaming one breaks the nav silently. Off the landing page, `Header` routes to `/#<id>` instead.

### Server vs client components

Everything that calls `useT()` is a Client Component, because the dictionary arrives through React context — that is every page section. `ServicesDetail` is the one section with no directive: it has no hooks and no handlers, so it stays server-rendered. Don't add `"use client"` to it without a reason.

Files under `components/ui/` carry no directive; they inherit client-ness from whoever imports them.

### Cross-route state

`quote-context.tsx` (`QuoteProvider` / `useQuote`) carries the calculator result to the quote form — it replaced the `quoteData` prop that `App.tsx` used to thread through:

- `PriceCalculator` → `setQuote(data)` then `router.push("/quote")`
- `Chatbot` → same, straight from the chat flow
- `QuoteRequest` → reads `quote` for its form prefill; its back button returns to `/calculator` when a quote is present and `/` otherwise

It is in-memory by design: reloading `/quote` drops the prefill and renders a blank form, matching the old refresh behaviour.

### Internationalization

`src/app/i18n.tsx` is a self-contained i18n layer (~600 lines, no library). `LanguageProvider` wraps the tree in `layout.tsx`; components call `useT()` and get `{ t, lang, setLang, toggleLang }`.

- `t` is the **whole nested dictionary object**, not a lookup function: `t.nav.services`, `t.services.items[0].features`. Types derive from the `mn` dict (`type Dict = (typeof dicts)["mn"]`), so **any key added to `mn` must be added to `en` or the build breaks**; the two trees must stay structurally identical, arrays included.
- **`lang` must initialise to `"mn"`, never to `localStorage`.** The server always prerenders Mongolian; reading storage during render desyncs the first client render and triggers a hydration error. The stored preference is applied in an effect after mount, and only then written back.
- **i18n coverage is partial.** Only the landing sections are translated (`Header`, `Hero`, `Services`, `Products`, `About`, `Portfolio`, `Contact`, `Footer`). `ServicesDetail`, `PriceCalculator`, `QuoteRequest`, and `Chatbot` hold hardcoded Mongolian strings. When touching those four, either keep strings inline as-is or move the whole component into the dict — do not half-migrate.

### Hydration rules

Prerendering makes render-time nondeterminism a hard error rather than a curiosity. `Math.random()` / `Date.now()` must not run during render — `QuoteRequest`'s captcha generates in a `useEffect` for exactly this reason. The same applies to `localStorage` (see i18n above). `<html>` carries `suppressHydrationWarning` because `Header` and `LanguageProvider` both mutate its attributes after mount.

### Language of UI copy

UI copy is Mongolian (Cyrillic). Preserve existing Mongolian strings when editing — do not translate them to English, and prefer native Mongolian over Russian loanwords when writing new copy.

### Component layers (`src/app/components/`)

- **Page sections** (top level): `Header`, `Hero`, `HeroScene`, `Services`, `ServicesDetail`, `Products`, `About`, `Portfolio`, `Contact`, `Footer`, `PriceCalculator`, `QuoteRequest`, `Chatbot`.
- **`ui/`**: shadcn/ui primitives (Radix UI + CVA + Tailwind). Use `cn()` from `ui/utils.ts` for class merging. Pruned to the 11 the site actually renders — `alert`, `badge`, `button`, `card`, `checkbox`, `input`, `label`, `scroll-area`, `select`, `textarea`, `utils.ts`. The other 37 shadcn primitives were deleted along with the dependencies that only they used. To bring one back: `npx shadcn@latest add <name>`, then install its Radix package.
- **`figma/ImageWithFallback.tsx`**: drop-in `<img>` replacement that swaps in a placeholder SVG on error — used for the Unsplash shots in `Portfolio`. The site does not use `next/image` anywhere.

### 3D Hero scene

`HeroScene.tsx` (react-three-fiber + drei distorted-blob) sits behind three guards in `Hero.tsx`: `React.lazy` (keeps three.js out of the entry chunk), a `hasWebGL()` check run in an effect (so the prerendered HTML never contains a canvas), and a `SceneBoundary` error boundary that renders `null` on failure. Keep all three. The WebGL check doubles as the SSR guard — `sceneEnabled` starts `false`, so the lazy import is never reached during prerender.

Verified after the migration: three.js stays in its own chunk and is absent from the landing page's initial JS.

### Brand system

`logo_brand_book.png` at the repo root is the source of truth (Provision Solutions INC LLC). The seven palette colours from its section 05 are declared once at the top of `globals.css` as `--brand-*` and everything else derives from them:

| Book name | Hex | Role in the UI |
| --- | --- | --- |
| Deep Navy | `#0A0A1F` | dark `--background`, `themeColor` |
| Vibrant Purple | `#7B1FA2` | `--primary`, light-theme `--brand`, 3D blob |
| True Royal Blue | `#1976D2` | light `--logo-block`, gradient stop, charts |
| Aura Gray | `#E0E0E0` | borders (at 12% alpha), switch track |
| Linen White | `#FAFAFA` | `--foreground` on dark, light `--background` |
| Sky Blue | `#BBDEFB` | dark-theme `--brand`, wireframe, dark logo block |
| Emerald Green | `#A5D6A7` | `--success`, status dots, terminal ✓ |

Three things about this mapping are deliberate and easy to undo by accident:

- **`--accent` is not the brand accent.** It is shadcn's subtle hover surface (ghost buttons, select rows). The bright brand colour is `--brand`, exposed as `text-brand` / `bg-brand`. Painting a saturated colour into `--accent` makes every hover state flash.
- **`--brand` changes hue by theme, on purpose.** Sky Blue on dark (13.9:1); Vibrant Purple on light (7.9:1). The book's own True Royal Blue on Linen White only reaches 4.41:1, under AA for the small uppercase labels this drives — section 07 of the book sets its accent word in purple on white, so light follows that.
- **The logo gradient is theme-aware** via `--logo-from` / `--logo-to` / `--logo-block`. The book's Full Color mark ends on Deep Navy, which *is* the dark background, so dark surfaces get the Inverse (light) mark instead. `LogoMark` also takes explicit `mono` / `invert` variants.

`text-gradient-brand` and the hero backdrop glow are likewise per-theme (`--gradient-from/to`, `--hero-glow`) — raw Vibrant Purple is only 2.3:1 on Deep Navy and unreadable as headline text, so dark uses a 55% tint of it into white.

The 3D hero scene is lit for Deep Navy; its wrapper carries `opacity-30 dark:opacity-100` so it doesn't swamp the light theme.

`components/Logo.tsx` holds the mark as inline SVG (geometry traced from the book's flat Mono variant) plus the wordmark; `app/icon.svg` is the favicon built from the same paths. There are no raster logo assets.

### Styling

Tailwind v4 — **no `tailwind.config.js`**; configuration lives in CSS, and the build goes through PostCSS (`@tailwindcss/postcss` in `postcss.config.mjs`), not the Vite plugin. `src/styles/index.css` is the entry, imported once from `layout.tsx`, and defines the import order:

1. `tailwindcss` with `source(none)` + an explicit `@source '../../src/**/*.{js,ts,jsx,tsx}'` glob — new source directories outside `src/` will not get their classes scanned.
2. `tw-animate-css`
3. `globals.css` — the whole theme: `:root`, `.dark`, and the `@theme inline` token mapping, at a 14px base.

(There used to be a `default_theme.css` holding the Figma Make default palette, imported first and then shadowed entirely by `globals.css`. All 76 of its custom properties were redeclared downstream, so it was deleted.)

Theming is CSS custom properties mapped to Tailwind tokens via `@theme inline`. Prefer semantic utilities (`bg-background`, `text-primary`, `border-border`) over arbitrary values. Base font size is 14px (`--font-size`) — do not hardcode px sizes. Project-specific utilities live in `globals.css`'s `@layer utilities`: `bg-grid`, `bg-dots`, `text-gradient-brand`, `mask-radial-fade`, `mask-fade-bottom`.

Fonts are declared in `src/app/fonts.ts` and shared by `layout.tsx` and `Logo.tsx`:

- **Inter** — all UI and body copy, subsets `latin` + `cyrillic` + `cyrillic-ext`. The Cyrillic subsets are what render Ө and Ү, so don't drop them or swap in a font without that coverage. Exposed as `--font-inter`, consumed by the `body` rule in `globals.css`. The brand book's typography panel (section 06) gives a Bold/SemiBold/Medium/Regular ladder but never names a family; Inter matches the specimen and maps onto that ladder at 700/600/500/400, so it stayed.
- **Poppins 600** — the "Provision" wordmark only, matching the geometric logotype. **Poppins has no Cyrillic subset**, so it must never touch Mongolian copy; keep it scoped to the Latin wordmark in `Logo.tsx`.

Dark mode is a `.dark` class set on `<html>` in `layout.tsx`. `Header.tsx` toggles it by writing that class directly — the choice is **not** persisted, unlike language, so reloads return to dark. `next-themes` is installed but only referenced inside `ui/sonner.tsx`; it does not drive the app's theme.

Typography: the second `@layer base` block in `globals.css` styles `h1`-`h4`, `p`, `label`, `button`, `input` **only when no ancestor has a `text-*` class**. Wrapping in a `text-*` utility disables these defaults — that's usually the explanation when headings look unstyled.

### Path aliases

`@/*` → `src/*`, declared in `tsconfig.json` and resolved by Next. Nothing imports through it yet; components use relative paths.

## Notable quirks

- This repo was exported from Figma Make. The original `package.json` had duplicate `"pkg@x.y.z": "npm:pkg@x.y.z"` entries and source files imported with `@version` suffixes (`from "@radix-ui/react-slot@1.1.2"`). Both were cleaned up. If reintroducing code from Figma Make, strip `@<version>` from any new import specifiers.
- The Vite migration left a `figmaAssetResolver` plugin mapping `figma:asset/<filename>` → `src/assets/<filename>`. It died with `vite.config.ts`; nothing imported through it and `src/assets/` never existed. Re-importing Figma Make code that uses `figma:asset/` specifiers means adding a Turbopack `resolveAlias` in `next.config.mjs`.
- `package.json` was pruned from 60 dependencies to 15 + 7 dev. Everything declared is now reachable from the four routes, so treat an unused-looking dependency as a bug rather than Figma-export residue. The `@mui/*`, `react-dnd`, `react-slick`, `recharts`, `react-router`, `next-themes`, `motion`, `sonner` and `react-hook-form` leftovers are all gone; `react-router` in particular was never a routing option here — routing is the App Router.
- Two dependencies look unused to a naive import scan but are load-bearing: `react-dom` (Next requires it at runtime; nothing imports it directly since `main.tsx` was deleted) and `tw-animate-css` (imported from `styles/index.css`, not from TypeScript).
- `npm audit` reports 3 high-severity advisories in `postcss` and `sharp`. Both are transitive dependencies of `next` itself; `npm audit fix --force` "resolves" them by downgrading to `next@9.3.3`. Leave them alone.
