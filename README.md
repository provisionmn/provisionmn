# Provision.mn

Marketing site for Provision.mn — Монголын инженерийн студи. Fullstack, mobile, AI, DevOps, Odoo, UX/UI болон процесс автоматжуулалт (RPA).

🌐 **Production:** https://provisionmn.vercel.app

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind v4** (`@tailwindcss/postcss`) — CSS custom property theming, dark mode
- **shadcn/ui** (Radix UI + CVA) — UI primitives
- **react-three-fiber** + **drei** — Hero дэх 3D distorted blob scene
- **Lucide React** — иконууд
- **i18n** — Mongolian / English (`src/app/i18n.tsx`, React Context, no library)

## Architecture

App Router дээрх 4 маршрут, бүгд статикаар prerender хийгддэг:

| Маршрут | Агуулга |
| --- | --- |
| `/` | Landing (Hero / Services / Products / About / Portfolio / Contact + Chatbot) |
| `/services` | Үйлчилгээний дэлгэрэнгүй |
| `/calculator` | Үнийн тооцоолуур |
| `/quote` | Оффер хүсэх форм |

`src/app/layout.tsx` нь `<html>`, provider-ууд болон бүх хуудсанд нийтлэг `Header` + `Footer`-ыг эзэмшинэ. Хуудасны `page.tsx` файлууд нь Server Component — тус бүр өөрийн `metadata` (title, description) экспортолдог тул тэднийг Client Component болгож болохгүй. Иймд навигаци нь section компонент дотор `Link` / `useRouter`-ээр хийгддэг.

Тооцоолуураас формд дамжих өгөгдлийг `src/app/quote-context.tsx` (`useQuote`) зөөнө — санах ойд л байдаг тул `/quote`-г дахин ачаалахад prefill арилж, хоосон форм гарна.

Backend болон хадгалалт байхгүй — форм илгээхэд амжилтын төлөв харуулаад 3 секундын дараа `/` руу буцна.

Хэлийг `LanguageProvider` (`src/app/i18n.tsx`)-аар удирддаг, localStorage-д хадгална. Landing-ийн секцүүд `useT()`-ээр орчуулагддаг; ServicesDetail / PriceCalculator / QuoteRequest / Chatbot нь монгол текстээ шууд агуулсан хэвээр.

## Хөгжүүлэлт

```bash
npm i              # хамаарал суулгах
npm run dev        # Next dev server (Turbopack)
npm run build      # production build (tsc-г дотроо ажиллуулна)
npm run start      # production build-ыг локалд үзэх
npm run typecheck  # зөвхөн tsc --noEmit
```

> Build дээр `tsc` алдаа гарвал Next-ийн code-frame renderer крилл үсгэн дээр panic хийж, алдааг харуулахгүйгээр унана. Тэр үед `npx tsc --noEmit`-ийг шууд ажиллуулж жинхэнэ алдааг хараарай.

## Deployment

GitHub `main` branch-ийн push нь Vercel дээр автомат production deploy үүсгэнэ. Branch / PR push → preview deploy.

## Notable details

- Брэнд өнгө, лого, фонт нь `logo_brand_book.png`-оос гаралтай. Палитрын 7 өнгө `globals.css`-ийн эхэнд `--brand-*` болж нэг удаа тодорхойлогдоно; бусад бүх token эднээс үүсдэг
- `--accent` бол shadcn-ий hover гадаргуу, брэндийн өнгө БИШ — брэндийн тод өнгө нь `--brand` (`text-brand`)
- `--brand` нь theme-ээс хамаарч өөрчлөгддөг: dark дээр Sky Blue (13.9:1), light дээр Vibrant Purple (7.9:1) — номын Royal Blue нь цагаан дээр 4.41:1 болж AA-д хүрэхгүй
- Лого нь `components/Logo.tsx` доторх inline SVG (растер файл байхгүй); dark дээр номын Inverse хувилбар руу автоматаар шилжинэ
- Фонт: UI-д Inter (кирилл дэмжинэ), зөвхөн "Provision" wordmark-д Poppins — **Poppins кирилл subset-гүй** тул монгол текстэд хэрэглэхгүй
- Tailwind v4-ийн `@theme inline` -аар theme tokens-ыг CSS custom property-аас map хийдэг
- Base font size 14px (`--font-size`) — px hardcode хийхгүй
- Dark mode-ыг `layout.tsx` дээр `class="dark"`-аар анхдагчаар асаасан; Header-ийн товч сэлгэнэ (хадгалагдахгүй)
- Hero-гийн 3D scene нь `lazy` + WebGL шалгалт + error boundary-гийн ард — дэмжигдэхгүй browser дээр чимээгүй унтарч, three.js нь эхний bundle-д ордоггүй
- Inter-ийг `next/font`-оор ачаална — `cyrillic` subset нь Ө, Ү-г гаргана
- Prerender хийгддэг тул render дотор `Math.random()` / `Date.now()` / `localStorage` ашиглаж болохгүй (hydration алдаа өгнө)
- `@/*` → `src/*` path alias
- `components/ui/` дотор зөвхөн ашиглаж буй 11 shadcn primitive үлдсэн; шинээр хэрэгтэй бол `npx shadcn@latest add <name>`
- `npm audit`-ийн 3 сэрэмжлүүлэг нь `next`-ийн дотоод `postcss` / `sharp`-аас гардаг — засах гэвэл Next-ийг 9.3.3 болгож буулгана, тиймээс хөндөхгүй

## License

Internal — Provision.mn өмчийн материал.
