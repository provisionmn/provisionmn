# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm i` — install dependencies
- `npm run dev` — start Vite dev server
- `npm run build` — production build via Vite

There are no test, lint, or typecheck scripts configured.

## Architecture

This is a single-page marketing/CRM site for Provision.mn, originally generated from Figma Make and ported to Vite + React 18 + TypeScript + Tailwind v4.

### View routing

There is **no router** despite `react-router` being a dependency. `src/app/App.tsx` is the only top-level component: it holds a `currentView` state (`'main' | 'services-detail' | 'price-calculator' | 'quote-request' | 'crm'`) and a `switch` statement renders one of five layouts. Navigation happens by calling the `handleShow*` / `handleBackToMain` callbacks passed down as props, each of which also calls `window.scrollTo(0, 0)`.

App-level state also owns `quoteData` (flowing PriceCalculator → QuoteRequest) and `crmLeads` (submitted quotes become CRM leads in memory). There is no persistence layer — refreshing the page discards all leads.

### Component layers (`src/app/components/`)

- **Page sections** (top level): `Header`, `Hero`, `Services`, `ServicesDetail`, `About`, `Portfolio`, `Contact`, `Footer`, `PriceCalculator`, `QuoteRequest`, `Chatbot`, `CRMDashboard`. These are business/layout components and receive their navigation callbacks from `App.tsx`.
- **`ui/`**: shadcn/ui primitives (Radix UI + CVA + Tailwind). Use `cn()` from `ui/utils.ts` for class merging (`clsx` + `tailwind-merge`). Add new primitives here following the existing shadcn conventions.
- **`figma/ImageWithFallback.tsx`**: drop-in `<img>` replacement that swaps in a placeholder SVG on error — use this instead of raw `<img>` for remote images (e.g. Unsplash).

### Styling

Tailwind v4 via the `@tailwindcss/vite` plugin. Theming uses CSS custom properties in `src/styles/globals.css`, mapped to Tailwind color tokens via `@theme inline`. Dark mode is a `.dark` class toggled on `<html>` by `Header.tsx`. Base font size is 14px (`--font-size`) — do not hardcode px sizes. Prefer semantic color utilities (`bg-background`, `text-primary`, `border-border`) over arbitrary values.

Typography: the `@layer base` block in `globals.css` applies default styles to `h1-h4`, `p`, `label`, `button`, `input` **only when no ancestor has a `text-*` class**. Wrapping in a `text-*` utility disables these defaults — relevant when headings look unstyled.

### Figma asset resolution

`vite.config.ts` registers a custom `figmaAssetResolver` plugin: imports starting with `figma:asset/<filename>` resolve to `src/assets/<filename>`. This is how Figma Make-generated code references exported assets; keep the plugin in place when touching Vite config.

### Path aliases

`@/*` → `src/*` (Vite alias). There is no `tsconfig.json` committed; types flow from `@types` packages alone.

### Language

UI copy is in Mongolian (Cyrillic). Preserve existing Mongolian strings when editing — do not translate them to English.

## Notable quirks

- This repo was exported from Figma Make. The original `package.json` had duplicate `"pkg@x.y.z": "npm:pkg@x.y.z"` entries and source files imported with `@version` suffixes (`from "@radix-ui/react-slot@1.1.2"`). Both were cleaned up so `npm install` + `npm run dev` work on plain npm. If reintroducing code from Figma Make, strip `@<version>` from any new import specifiers.
- Vite comment in `vite.config.ts` warns the React and Tailwind plugins are both required "for Make" even if Tailwind appears unused — do not remove either.
- `react` / `react-dom` live in `dependencies` (not `peerDependencies`) so they actually install.
