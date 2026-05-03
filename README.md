# Provision.mn

Marketing site for Provision.mn — Монголын инженерийн студи. Fullstack, mobile, AI, DevOps, Odoo, UX/UI болон процесс автоматжуулалт (RPA).

🌐 **Production:** https://provisionmn.vercel.app

## Stack

- **Vite 6** + **React 18** + **TypeScript**
- **Tailwind v4** (`@tailwindcss/vite`) — CSS custom property theming, dark mode
- **shadcn/ui** (Radix UI + CVA) — UI primitives
- **react-three-fiber** + **drei** — Hero дэх 3D distorted blob scene
- **Lucide React** — иконууд
- **i18n** — Mongolian / English (`src/app/i18n.tsx`, React Context, no router lib)

## Architecture

Single-page site, no router. `src/app/App.tsx` нь `currentView` state-ээр 5 view-ийн хооронд switch хийдэг:

- `main` — landing (Hero / Services / Products / Portfolio / About / Contact)
- `services-detail` — үйлчилгээний дэлгэрэнгүй
- `price-calculator` — үнийн тооцоолуур
- `quote-request` — оффер хүсэх форм
- `crm` — мэдээллийн самбар (in-memory leads)

Хэлийг `LanguageProvider` (`src/app/i18n.tsx`)-аар удирддаг, localStorage-д хадгална.

## Развитие

```bash
npm i              # хамаарал суулгах
npm run dev        # Vite dev server
npm run build      # production build (Vite)
```

> `.npmrc`-д `legacy-peer-deps=true` тавьсан — `@react-three/fiber`-ийн React 19 peer-тэй зөрчлийг тойруулсан.

## Deployment

GitHub `main` branch-ийн push нь Vercel дээр автомат production deploy үүсгэнэ. Branch / PR push → preview deploy.

## Notable details

- Tailwind v4-ийн `@theme inline` -аар theme tokens-ыг CSS custom property-аас map хийдэг
- Base font size 14px (`--font-size`) — px hardcode хийхгүй
- Inter font (Google Fonts) — Cyrillic Extended-аар Mongolian Ө, Ү дэмжсэн
- `figma:asset/<filename>` import-ыг `src/assets/<filename>`-ээс resolve хийх custom Vite plugin (`vite.config.ts`)
- `@/*` → `src/*` path alias
- UI текст Mongolian (Cyrillic) — англиар орчуулахгүй

## License

Internal — Provision.mn өмчийн материал.
