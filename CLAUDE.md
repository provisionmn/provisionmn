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

`logo.png` at the repo root is the source of truth (Provision Solutions). It supersedes an earlier `logo_brand_book.png` with a completely different mark, palette and typeface — if you find anything referencing Deep Navy, Vibrant Purple, Sky Blue or a "block" logo element, it is left over from that book and is wrong.

The palette is **four colours**, declared once at the top of `globals.css` as `--brand-*`; everything else derives from them:

| Name | Hex | Role in the UI |
| --- | --- | --- |
| Violet | `#6D46FF` | `--primary`, light `--brand`, logo gradient start, 3D blob |
| Blue | `#2563EB` | logo gradient end, headline gradient stop, charts |
| Ink | `#0B0F1A` | dark `--background`, light `--foreground`, `themeColor` |
| Mist | `#E6E8EF` | dark `--foreground`, light `--secondary`/`--muted`, borders at 12% |

Four things about this mapping are deliberate and easy to undo by accident:

- **`--accent` is not the brand accent.** It is shadcn's subtle hover surface (ghost buttons, select rows). The bright brand colour is `--brand`, exposed as `text-brand` / `bg-brand`. Painting a saturated colour into `--accent` makes every hover state flash.
- **`--brand` keeps its hue across themes but not its value.** Raw `#6D46FF` is 5.07:1 on light (fine) but only 3.62:1 on `#0B0F1A` — under AA for the small uppercase labels it drives — so dark uses `#A78BFF`, a tint of the same violet, at 7.09:1. Same for `text-gradient-brand` (`--gradient-from/to`): both palette values are too dark to set text in on ink, so dark tints each toward white (`#A78BFF` → `#7BA7F5`).
- **`--success` is not a brand colour.** The book has no green, but "live" pills and the terminal ✓ marks need one to read as status rather than decoration. It is functional, lives outside the `--brand-*` block, and is exposed as `text-success` / `bg-success` — deliberately *not* under the `brand-` namespace.
- **The logo gradient is theme-independent.** Violet → blue reads on light and dark alike, and the book itself puts that exact mark on white, on an ink tile, on a violet circle and on light grey. This is a simplification over the old book, whose mark ended on the dark background colour and had to be flipped per theme. `LogoMark` still takes `mono` / `invert` variants for one-colour and photographic contexts.

The hero backdrop glow stays per-theme (`--hero-glow`) — violet needs real weight on ink but swamps light. The 3D hero scene is lit for the dark background; its wrapper carries `opacity-30 dark:opacity-100` for the same reason.

`components/Logo.tsx` holds the mark as inline SVG and `app/icon.svg` is the favicon built from the same numbers. There are no raster logo assets — `logo.png` is reference art, not a build input.

**The mark is the contour of a thick chevron, not an outlined polygon.** That distinction is the whole geometry: the two edges of each arm are parallel, so it is a round-capped, round-joined chevron stroke with its middle knocked out, done as a mask (fat white stroke minus thin black stroke). Everything derives from five numbers, fitted to the artwork to within a pixel:

```
centreline   M 16 16 L 58 50 L 16 84   in viewBox 0 0 74 100   (arms at 39°)
outer edge   stroke-width 32           inner edge  stroke-width 21.4
```

Those widths are what produce the ~5.3-unit contour. Changing one without the other changes the arm thickness rather than the line weight. The mark exactly fills its viewBox on all four sides, so the viewBox doubles as the bounding box.

### Styling

Tailwind v4 — **no `tailwind.config.js`**; configuration lives in CSS, and the build goes through PostCSS (`@tailwindcss/postcss` in `postcss.config.mjs`), not the Vite plugin. `src/styles/index.css` is the entry, imported once from `layout.tsx`, and defines the import order:

1. `tailwindcss` with `source(none)` + an explicit `@source '../../src/**/*.{js,ts,jsx,tsx}'` glob — new source directories outside `src/` will not get their classes scanned.
2. `tw-animate-css`
3. `globals.css` — the whole theme: `:root`, `.dark`, and the `@theme inline` token mapping, at a 14px base.

(There used to be a `default_theme.css` holding the Figma Make default palette, imported first and then shadowed entirely by `globals.css`. All 76 of its custom properties were redeclared downstream, so it was deleted.)

Theming is CSS custom properties mapped to Tailwind tokens via `@theme inline`. Prefer semantic utilities (`bg-background`, `text-primary`, `border-border`) over arbitrary values. Base font size is 14px (`--font-size`) — do not hardcode px sizes. Project-specific utilities live in `globals.css`'s `@layer utilities`: `bg-grid`, `bg-dots`, `text-gradient-brand`, `mask-radial-fade`, `mask-fade-bottom`.

Fonts are declared in `src/app/fonts.ts` and shared by `layout.tsx` and `Logo.tsx`:

- **Manrope** — all UI and body copy, subsets `latin` + `cyrillic` + `cyrillic-ext`. Exposed as `--font-manrope`, consumed by the `body` rule in `globals.css` and by `--font-sans`. Chosen to sit with the Sora wordmark while drawing its Cyrillic as part of the family. The brand book names Sora as *the* typeface, but Sora has no Cyrillic — so Manrope carries every heading and paragraph and Sora is confined to the wordmark. Do not "fix" this by moving headings to Sora.
- **JetBrains Mono** — `--font-mono`, i.e. every `font-mono` utility: the Hero terminal, eyebrow labels, code. Not a cosmetic choice — the terminal block sets Mongolian ("14 өдөрт") and the default system mono stack (Consolas, Liberation Mono, …) has no ө, so that one letter used to fall out to another family mid-line.

**Choosing a font for this repo — two traps, both already hit here:**

1. **Ө (U+04E8) and Ү (U+04AE) are in `cyrillic-ext`, not `cyrillic`.** Requesting only the `cyrillic` subset silently drops them.
2. **Advertising `cyrillic-ext` does not mean the family draws them.** Onest and Wix Madefor Text both declare the subset and ship neither letter — their cyrillic-ext slice is ~10 codepoints of punctuation. Jost has no `cyrillic-ext` at all.

So never swap a family on the strength of its subset list. Verify against the real font binary:

```bash
# after a build, check what the shipped woff2 files actually contain
python3 - <<'EOF'
import glob
from fontTools.ttLib import TTFont
NEED = {0x04E8:'Ө', 0x04E9:'ө', 0x04AE:'Ү', 0x04AF:'ү'}
for p in glob.glob('.next/static/media/*.woff2'):
    f = TTFont(p, lazy=True); cps = set()
    for t in f['cmap'].tables: cps |= set(t.cmap.keys())
    got = set(NEED) & cps
    if got: print(f['name'].getDebugName(1), ''.join(NEED[c] for c in sorted(got)))
EOF
```
- **Sora 600** — the "Provision" wordmark only. Sora is the family the brand book names, and **it ships `latin` + `latin-ext` with no Cyrillic subset**, so it can never carry Mongolian copy: a Cyrillic string set in Sora falls back to Inter glyph-by-glyph, which reads as a rendering bug rather than a font choice. Keep it scoped to the Latin wordmark in `Logo.tsx`. This is the same constraint the previous wordmark font (Poppins) had, and it is why the book naming Sora does *not* mean Sora becomes the heading font.

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
