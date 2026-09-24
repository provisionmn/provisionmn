# CLAUDE.md

Repository guidance shared by Claude and Codex.

## Commands

- `npm i` — install dependencies (plain `npm install`; no `.npmrc`, no peer-dep flags needed)
- `npm run dev` — Next dev server (Turbopack)
- `npm run build` — production build; runs `tsc` as part of the build
- `npm run start` — serve the production build locally
- `npm run typecheck` — `tsc --noEmit` on its own
- `npm run lint` — ESLint Next.js Core Web Vitals + TypeScript, zero warnings
- `npm test` — Vitest + Testing Library in jsdom (calculator/quote flow and contact validation)
- `npm run test:watch` — watch tests while developing

Run `npm ci`, `npm run lint`, `npm test`, `npm run typecheck`, and `npm run build` before a PR. CI gates the Docker build/push on lint, tests and typecheck; the Dockerfile runs the production build. Tests use real components/context and mock only Next navigation and missing jsdom geometry APIs. They do not verify browser layout or a real backend submission. Keep tests in `tests/`; keep hydration-related lint exceptions local and explained.

**Known build trap:** when `tsc` reports an error, Next 16's Rust code-frame renderer panics (`end byte index … is not a char boundary`) instead of printing it — the source files are Mongolian, and it slices UTF-8 by byte offset. The build then dies with `SIGABRT` and no usable message. Run `npx tsc --noEmit` directly to see the real errors.

## Deployment

Deployment uses GHCR and the VPS:

- **Vercel Git deployments are disabled** by `vercel.json` (`git.deploymentEnabled: false`, `github.silent: true`). This stops automatic production/preview deployments for commits containing this configuration; it does not delete old deployments or disconnect the installed GitHub app.
- **GHCR** — `.github/workflows/docker.yml` builds a container and pushes it to `ghcr.io/provisionmn/provisionmn` on `main` and on `v*` tags. Pull requests build the image but do not push it. No secrets needed; it authenticates with the built-in `GITHUB_TOKEN`.
- **VPS `provision.mn`** — since 2026-09-15 the apex domain's A record points at `202.131.1.126` (the shared amf.mn host), which serves `ghcr.io/provisionmn/provisionmn` from `deploy/docker-compose.yml`. **Since 2026-09-16 this is automatic**: the `deploy` job in the same workflow SSHes in after the image is pushed and rolls the stack to that commit's `sha-<short>` tag — see *Automatic deploys* below.

```bash
docker pull ghcr.io/provisionmn/provisionmn:latest
docker run -p 3000:3000 ghcr.io/provisionmn/provisionmn:latest
```

The image is Next's standalone output on `node:22-alpine`, running as non-root `nextjs` with a healthcheck on `/`.

**`output: "standalone"` is gated behind the `DOCKER_BUILD` env var** in `next.config.mjs`, and only the Dockerfile sets it. That keeps `npm run build` — locally — producing exactly what it did before. If you ever need standalone output outside Docker, set `DOCKER_BUILD=1`; don't un-gate it.

Two things about the image that are easy to break:

- **`next/font` fetches Google Fonts at build time**, so the builder stage needs network. The payoff is that the running image makes no external font requests — the woff2 files are served from `/_next/static/media/`. Verified: no `fonts.gstatic.com` reference survives into the HTML.
- **`public/` holds only the hero media** (`public/hero/`: the scrub clip, poster and ending frame). The builder stage still runs `mkdir -p public`, which is harmless now that the directory exists, and the runner's `COPY` picks the files up with no Dockerfile change.

### The VPS deploy

`deploy/docker-compose.yml` is the deployed definition; the host keeps a copy of it at `/opt/provision/provisionmn/` (it is not a git checkout — copy the file over when you change it). It publishes **no host port**: the box runs one shared edge Traefik (`/opt/provision/traefik`, owned by the `provision_odoo` repo) that holds :80/:443, the `provision` Docker network and the `letsencrypt` ACME resolver, and this stack attaches to that network and declares ``Host(`provision.mn`)`` on container labels. Everything runs as the unprivileged `provision` user, whose `~/.docker/config.json` carries the GHCR credentials — **the private package requires registry authentication; the host's configured account is `provision`**.

Releasing is automatic on `main` (below). By hand it is one command; the site is prerendered and stateless, so there is nothing to migrate or back up:

```bash
ssh provision@202.131.1.126
cd /opt/provision/provisionmn && docker compose pull && docker compose up -d
```

### Automatic deploys

The `deploy` job in `.github/workflows/docker.yml` runs after `build` on `main`
pushes (and on `workflow_dispatch` from `main`). It does not `docker compose`
anything itself — it SSHes in and runs one word:

```
ssh provision@202.131.1.126 "deploy sha-<short-sha>"
```

**That key cannot run anything else.** `deploy/deploy.sh` is installed on the
host as `/opt/provision/provisionmn/deploy.sh` and wired in as a forced
command:

```
restrict,command="/opt/provision/provisionmn/deploy.sh" ssh-ed25519 AAAA… github-actions-deploy
```

so the request lands in `SSH_ORIGINAL_COMMAND` and the script accepts exactly
`check` (print `docker compose ps`, change nothing) or `deploy [<tag>]`, with
the tag regex-checked before it reaches `IMAGE_TAG`. A leaked `VPS_SSH_KEY`
buys an attacker a redeploy of our own image, not a shell. Four consequences
worth knowing:

- **The repo copy is not the live copy.** `deploy/deploy.sh` is the source of
  truth for humans; nothing syncs it. Change it → `scp` it to the host, same as
  `docker-compose.yml`. This is deliberate: if CI could rewrite the forced
  command, the forced command would not be a boundary.
- **Deploys pin `sha-<short>`, not `latest`.** So a run says which commit it
  shipped even if two land together. The container's `IMAGE_TAG` is set for
  that one `up -d`; a later manual `docker compose up -d` falls back to
  `latest`, which may have advanced to a different digest. Use an explicit SHA tag for a reproducible release.
- **Green means healthy, not "the command exited 0".** The script waits up to
  90s for the container's `HEALTHCHECK` to report `healthy` and dumps 50 lines
  of logs if it doesn't; the job then curls `https://provision.mn/` from the
  runner, which is the only part that exercises Traefik and the certificate.
- **The host's public key is pinned in the workflow** (`VPS_HOST_KEY`), not
  discovered with `ssh-keyscan`. Rebuild the box and that line needs updating.

`workflow_dispatch` takes a `deploy_check` boolean that sends `check` instead
of `deploy` — this leaves the VPS stack unchanged, but the preceding build job still publishes an image because the event is not a pull request. The only secret involved is `VPS_SSH_KEY` (the private half of the
key above).

DNS resolution checked on 2026-09-22 returned `202.131.1.126` for `provision.mn` and no address for `www.provision.mn`, so the compose file deliberately routes the apex only — adding a `www` router before the record exists just makes Traefik retry a doomed ACME order. Note also that Traefik does not re-attempt a failed ACME order on its own: if a certificate is missing after a DNS change, `docker compose up -d --force-recreate traefik` in the Odoo stack is what re-triggers it.

The root layout sets `metadataBase` to the production domain `https://provision.mn`.

## Architecture

GA4 is optional: root layout mounts `@next/third-parties/google` only in production with a valid `NEXT_PUBLIC_GA_MEASUREMENT_ID` (`G-…`). The ID is embedded at build time; Docker/Actions passes the repository variable as a build argument, omitted on PR builds. Use GA4 enhanced measurement history tracking for App Router page views; do not add a second manual page-view listener. Do not send form values or treat simulated form success as a lead. Setup and verification: README → Google Analytics 4.

Marketing site for Provision.mn, originally generated from Figma Make, ported to Vite, then migrated to **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4**.

There is **no backend or request persistence**; the language preference is stored locally. The forms make no API requests; `scrub/useScrubHero.ts` does call `fetch` to load the hero video. There are no application API credentials or database settings. Build/deployment settings include `DOCKER_BUILD` and the deployment workflow variables. `QuoteRequest` and `Contact` both fake a submit and then render a success card — the data goes nowhere. Contact waits 1.2 seconds and offers a retry/reset button. QuoteRequest waits 1.4 seconds, creates a browser-local `REQ-${Date.now()}` reference, and offers *home* or *new request*. Neither form automatically redirects or confirms backend delivery.

### Routes

`src/app/` is the App Router directory. Four page routes, all statically prerendered:

| Route | Page file | Renders |
| --- | --- | --- |
| `/` | `page.tsx` | Hero, Marquee, Services, Products, Process, Portfolio, About, Faq, Contact + Chatbot |
| `/services` | `services/page.tsx` | `ServicesDetail` |
| `/calculator` | `calculator/page.tsx` | `PriceCalculator` |
| `/quote` | `quote/page.tsx` | `QuoteRequest` |

`layout.tsx` owns `<html>`/`<body>`, the providers, and the `Header` + `Footer` that every route shares — pages render only their own content.

**Page files are Server Components and must stay that way**: the three subpages export `metadata`; the home page inherits the root layout metadata. Next does not allow a metadata export in a Client Component. That is why navigation lives inside the section components (`Link` / `useRouter`) instead of being passed down as callbacks — a server page cannot hand a function to a client child.

Within `/`, `Header` and `Hero` still navigate by `scrollIntoView` on section ids (`#home`, `#services`, `#products`, `#portfolio`, `#about`, `#contact`) — those ids live on the section components, so renaming one breaks the nav silently. Off the landing page, `Header` routes to `/#<id>` instead.

### Server vs client components

Everything that calls `useT()` is a Client Component, because the dictionary arrives through React context — this includes the translated landing sections. The calculator, quote form and chatbot are client components for their own state and events. `ServicesDetail` is also a Client Component so its copy follows the language context; route page files remain Server Components.

Files under `components/ui/` carry no directive; they inherit client-ness from whoever imports them.

### Cross-route state

`quote-context.tsx` (`QuoteProvider` / `useQuote`) carries the calculator result to the quote form — it replaced the `quoteData` prop that `App.tsx` used to thread through:

- `PriceCalculator` → `setQuote(data)` then `router.push("/quote")`
- `Chatbot` → same, straight from the chat flow
- `QuoteRequest` → reads `quote` for its form prefill; its back button returns to `/calculator` when a quote is present and `/` otherwise

It is in-memory by design: reloading `/quote` drops the prefill and renders a blank form, matching the old refresh behaviour.

### Internationalization

`src/app/i18n.tsx` is a self-contained i18n layer (no library). `LanguageProvider` wraps the tree in `layout.tsx`; components call `useT()` and get `{ t, lang, setLang, toggleLang }`.

- `t` is the **whole nested dictionary object**, not a lookup function: `t.nav.services`, `t.services.items[0].features`. Types derive from the `mn` dict (`type Dict = (typeof dicts)["mn"]`), so **any key added to `mn` must be added to `en` or the build breaks**; the two trees must stay structurally identical, arrays included.
- **`lang` must initialise to `"mn"`, never to `localStorage`.** The server always prerenders Mongolian; reading storage during render desyncs the first client render and triggers a hydration error. The stored preference is applied in an effect after mount, and only then written back.
- **i18n covers landing and all four flows.** `flow-copy.ts` holds matching typed Mongolian/English dictionaries for ServicesDetail, PriceCalculator, QuoteRequest and Chatbot, included as `t.flow`. Use language-independent option IDs for quote prefill and chatbot decisions. Render validation and bot messages in the current language without changing user-entered text.

### Hydration rules

Prerendering makes render-time nondeterminism a hard error rather than a curiosity. `Math.random()` / `Date.now()` must not run during render — `QuoteRequest`'s captcha generates in a `useEffect` for exactly this reason. The same applies to `localStorage` (see i18n above). `<html>` carries `suppressHydrationWarning` because `Header` and `LanguageProvider` both mutate its attributes after mount.

### Language of UI copy

UI copy is Mongolian (Cyrillic). Preserve the Mongolian dictionary alongside its English translation, and prefer native Mongolian over Russian loanwords when writing new copy.

### Component layers (`src/app/components/`)

- **Page sections** (top level): `Header`, `Hero`, `Marquee`, `Services`, `ServicesDetail`, `Products`, `Process`, `Portfolio`, `About`, `Faq`, `Contact`, `Footer`, `PriceCalculator`, `QuoteRequest`, `Chatbot`.
- **`scrub/useScrubHero.ts`**: the scroll-video engine behind `Hero` (see *Scroll-scrubbed hero* below).
- **`Process`** has a press-and-hold "lock the scope" interaction. A rAF loop writes a single `--p` (0..1) on the section root, and everything visual (dot row, drawn line, lit steps, button fill) is CSS derived from `--p`. Letting go early drains it back; completing it reveals the calculator CTA. Reduced motion gets the finished state, live in both directions.
- **`ui/`**: shadcn/ui primitives (Radix UI + CVA + Tailwind). Use `cn()` from `ui/utils.ts` for class merging. Contains six primitives and one class-merging helper — `badge`, `button`, `checkbox`, `input`, `select`, `textarea`, `utils.ts`. (`alert`, `card`, `label` and `scroll-area` went when the calculator, quote form and chatbot were rebuilt on plain markup; `@radix-ui/react-label` and `@radix-ui/react-scroll-area` went with them.) The other 37 shadcn primitives were deleted along with the dependencies that only they used. To bring one back: `npx shadcn@latest add <name>`, then install its Radix package.
- **`figma/ImageWithFallback.tsx`**: drop-in `<img>` replacement that swaps in a placeholder SVG on error — used for the Unsplash shots in `Portfolio`. The site does not use `next/image` anywhere.

### Scroll-scrubbed hero

The 3D blob (`HeroScene.tsx`, three.js, react-three-fiber, drei) is gone. `Hero.tsx` is now a 400vh section whose sticky stage plays a generated 6-second clip (`public/hero/hero-scrub.mp4`: violet and blue sparks drifting down and settling into a row of light) scrubbed by scroll, with three caption bands over it.

- **Engine: `components/scrub/useScrubHero.ts`.** The video is fetched as a streamed Blob, not set as `src`, so seeking works on hosts without HTTP Range support. The poster loads first, then the blob, behind a progress ring and a 20s no-progress watchdog. Displayed progress eases toward scroll progress in a dt-normalised rAF loop that stops when converged or off-screen. Seeks are gated: never write `currentTime` while one is in flight, and reset on `error` so the gate can't deadlock. Nothing runs during render.
- **The five static-hero gates live in two places and must stay character-for-character identical:** `STATIC_HERO_GATES` in the hook and the `@media` list above `.static-hero` in `globals.css`. Phones, portrait tablets, coarse-pointer portrait, landscape phones and reduced motion get `.static-hero` (the ending frame, `hero-ending.jpg`) and never download the video or poster. The decision is live on every gate's `change` event, not made once at load.
- **Bands write only on change.** `applyFrame` sets each band's `opacity` and `--k` (0..1 assembly) directly on the DOM, delta-gated. Every entrance is CSS off `--k`, transform and opacity only. A band below 0.5 opacity gets `inert` so its links leave the tab order.
- **Legibility is measured, not eyeballed.** Each band has a per-band scrim (`--scrim-a`, `SCRIM_ALPHA` in `Hero.tsx`) tuned so the lightest pixel of that band's busiest frame, under the scrim, still gives brand mist ≥ 3.5:1. If the clip is replaced, re-run that audit before shipping.
- **Re-encoding the clip:** `ffmpeg -i raw.mp4 -c:v libx264 -crf 20 -preset slow -g 8 -keyint_min 8 -pix_fmt yuv420p -movflags +faststart -an public/hero/hero-scrub.mp4`. The short keyframe interval (`-g 8`) is what makes scrubbing smooth. Then re-extract the poster (first frame) and the ending frame, and update `VIDEO_BYTES`.
- **The hero stays dark in both themes**, because it is footage. Its text is brand mist on ink regardless of `.dark`.
- The section pulls itself 72px up (`margin-top: -72px`) to sit under the sticky header pill. Change it if the header height changes.

The jsdom tests do not validate video playback or layout. Verify the scrub in a real browser on a working preview or local server, especially Chrome at the top and bottom of the hero, where choppiness shows first.

### Brand system

`logo.png` at the repo root is the source of truth (Provision Solutions). It supersedes an earlier `logo_brand_book.png` with a completely different mark, palette and typeface — if you find anything referencing Deep Navy, Vibrant Purple, Sky Blue or a "block" logo element, it is left over from that book and is wrong.

The palette is **four colours**, declared once at the top of `globals.css` as `--brand-*`; everything else derives from them:

| Name | Hex | Role in the UI |
| --- | --- | --- |
| Violet | `#6D46FF` | `--primary`, light `--brand`, logo gradient start, the hero clip's glow |
| Blue | `#2563EB` | logo gradient end, headline gradient stop, charts |
| Ink | `#0B0F1A` | dark `--background`, light `--foreground`, `themeColor` |
| Mist | `#E6E8EF` | dark `--foreground`, light `--secondary`/`--muted`, borders at 12% |

Four things about this mapping are deliberate and easy to undo by accident:

- **`--accent` is not the brand accent.** It is shadcn's subtle hover surface (ghost buttons, select rows). The bright brand colour is `--brand`, exposed as `text-brand` / `bg-brand`. Painting a saturated colour into `--accent` makes every hover state flash.
- **`--brand` keeps its hue across themes but not its value.** Raw `#6D46FF` is 5.07:1 on light (fine) but only 3.62:1 on `#0B0F1A` — under AA for the small uppercase labels it drives — so dark uses `#A78BFF`, a tint of the same violet, at 7.09:1. Same for `text-gradient-brand` (`--gradient-from/to`): both palette values are too dark to set text in on ink, so dark tints each toward white (`#A78BFF` → `#7BA7F5`).
- **`--success` is not a brand colour.** The book has no green, but "live" pills and the terminal ✓ marks need one to read as status rather than decoration. It is functional, lives outside the `--brand-*` block, and is exposed as `text-success` / `bg-success` — deliberately *not* under the `brand-` namespace.
- **The logo gradient is theme-independent.** Violet → blue reads on light and dark alike, and the book itself puts that exact mark on white, on an ink tile, on a violet circle and on light grey. This is a simplification over the old book, whose mark ended on the dark background colour and had to be flipped per theme. `LogoMark` still takes `mono` / `invert` variants for one-colour and photographic contexts.

The scroll-video hero and its static fallback keep their own dark presentation in both themes. The old three.js scene and its opacity wrapper are no longer present.

`components/Logo.tsx` holds the mark as inline SVG and `app/icon.svg` is the favicon built from the same numbers. There are no raster logo assets — `logo.png` is reference art, not a build input.

**The mark has two optical sizes, and the choice is not cosmetic.** `LogoMark` takes `form`:

| `form` | Geometry | Use |
| --- | --- | --- |
| `outline` (default) | the contour: 32 outer minus 21.4 inner | ≥28px — the lockup, the header, the footer |
| `solid` | one stroke at 26.7, same centreline and caps | <28px — `icon.svg`, any tiny chrome |

The contour's ribbon is 5.3 units of a 74-wide box, i.e. **0.85px once the mark is 16px tall**. Below ~28px the counter closes, the two edges merge, and the mark renders as a grey smudge — which is exactly what browsers were drawing in the tab, because `icon.svg` is rasterised at 16 and 32. The solid form is the same chevron with nothing thin left to lose: 26.7 is the mean of the two contour edges, i.e. the arm width the outline is built from, so the two forms share a silhouette and can stand in for each other.

`icon.svg`'s placement is arithmetic, not eyeballing. The solid mark's ink spans x 2.70..71.20, y 2.70..97.20 of its box; at scale 0.82 that is 56.2 × 77.5 in the 120 tile. Its centre of mass is **3.58 units left of its bounding-box centre** — the arms carry the weight and the point carries none — so the glyph sits half that distance right of box centre. Box-centred reads left-heavy; mass-centred overshoots. (The old tile was neither: `translate(23 10)` left margins of 23/37.8 and 10/30, visibly up and to the left.)

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

- **Manrope** — all UI and body copy, subsets `latin` + `cyrillic` + `cyrillic-ext`. Exposed as `--font-manrope`, consumed by the `body` rule in `globals.css` and by `--font-sans`. Chosen to sit with the Sora wordmark while drawing its Cyrillic as part of the family. The brand book names Sora as *the* typeface, but Sora has no Cyrillic — so Manrope carries every paragraph, label and button and Sora is confined to the wordmark. Do not "fix" this by moving headings to Sora.
- **Geologica 500–700**: the display face. Drives `--font-display`, i.e. the `font-display` utility on h1/h2 and the hero captions. It replaced Geist, which only reaches `cyrillic-ext` through a workaround (Next's metadata doesn't list the subset for Geist, so Ө/Ү were never preloaded). Geologica lists `latin` + `cyrillic` + `cyrillic-ext` in next/font and its binary has all four letters (178 Cyrillic glyphs). The shortlist it beat (Commissioner, IBM Plex Sans, Source Serif 4) all pass the same check; Unbounded, Sofia Sans, Jura, Wix Madefor Display, Instrument Sans and Bricolage Grotesque do not. `--tracking-display: -0.035em` was tuned for Geist; loosen it if Geologica headings look cramped.
- **JetBrains Mono** — `--font-mono`, i.e. every `font-mono` utility: eyebrow labels, figures and code-style text. Keep Mongolian glyph coverage when replacing it; the historical terminal design exposed missing ө glyphs in fallback monospace fonts.

**Choosing a font for this repo — two traps, both already hit here:**

1. **Declare `cyrillic-ext` alongside `cyrillic` for the Mongolian fonts.** In `next/font/google`, subsets select preloads; omitting one does not by itself prove that its font file or glyphs are absent. Inspect the generated CSS and font binary when diagnosing Ө/Ү.
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
- **Sora 600** — the "Provision" wordmark only. Sora is the family the brand book names, and **it ships `latin` + `latin-ext` with no Cyrillic subset**, so it can never carry Mongolian copy: a Cyrillic string set in Sora uses a fallback glyph-by-glyph, which reads as a rendering bug rather than a font choice. Keep it scoped to the Latin wordmark in `Logo.tsx`. This is the same constraint the previous wordmark font (Poppins) had, and it is why the book naming Sora does *not* mean Sora becomes the heading font.

Dark mode is a `.dark` class set on `<html>` in `layout.tsx`. `Header.tsx` toggles it by writing that class directly — the choice is **not** persisted, unlike language, so reloads return to dark. `next-themes` and Sonner are not installed; the Header owns theme switching.

Typography: the second `@layer base` block in `globals.css` styles `h1`-`h4`, `p`, `label`, `button`, `input` **only when no ancestor has a `text-*` class**. Wrapping in a `text-*` utility disables these defaults — that's usually the explanation when headings look unstyled.

### Path aliases

`@/*` → `src/*`, declared in `tsconfig.json` and resolved by Next. Nothing imports through it yet; components use relative paths.

## Notable quirks

- This repo was exported from Figma Make. The original `package.json` had duplicate `"pkg@x.y.z": "npm:pkg@x.y.z"` entries and source files imported with `@version` suffixes (`from "@radix-ui/react-slot@1.1.2"`). Both were cleaned up. If reintroducing code from Figma Make, strip `@<version>` from any new import specifiers.
- The Vite migration left a `figmaAssetResolver` plugin mapping `figma:asset/<filename>` → `src/assets/<filename>`. It died with `vite.config.ts`; nothing imported through it and `src/assets/` never existed. Re-importing Figma Make code that uses `figma:asset/` specifiers means adding a Turbopack `resolveAlias` in `next.config.mjs`.
- `package.json` is the current dependency inventory: the app uses Next/React, three Radix packages, Lucide, CVA and class-merging helpers. Build and test dependencies include Tailwind/PostCSS, TypeScript, ESLint, Vitest, Testing Library and jsdom. The `@mui/*`, `react-dnd`, `react-slick`, `recharts`, `react-router`, `next-themes`, `motion`, `sonner` and `react-hook-form` leftovers are all gone; `react-router` in particular was never a routing option here — routing is the App Router.
- Two dependencies look unused to a naive import scan but are load-bearing: `react-dom` (Next requires it at runtime; nothing imports it directly since `main.tsx` was deleted) and `tw-animate-css` (imported from `styles/index.css`, not from TypeScript).
- `npm audit` findings and suggested fixes change over time. Run it against the current lockfile, inspect direct/transitive dependency paths, and review the proposed upgrade before applying it. Do not reuse the obsolete Next 9 downgrade advice. On 2026-09-22, this branch's audit reported Next (critical), nested PostCSS (high), and sharp (high); the tool offered fixes without a major downgrade. This is a dated audit snapshot, not a permanent exception to updates.
