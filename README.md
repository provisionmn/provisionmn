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
npm run lint       # ESLint: алдаа, warning-гүй байх
npm test           # Vitest + Testing Library
npm run test:watch # тестийг өөрчлөлт бүрд ажиллуулах
```

> Build дээр `tsc` алдаа гарвал Next-ийн code-frame renderer крилл үсгэн дээр panic хийж, алдааг харуулахгүйгээр унана. Тэр үед `npx tsc --noEmit`-ийг шууд ажиллуулж жинхэнэ алдааг хараарай.

### Автомат шалгалт

Цэвэр checkout дээр `npm ci`, дараа нь `npm run lint`, `npm test`, `npm run typecheck`, `npm run build` ажиллуулна. GitHub Actions нь lint/test/typecheck амжилттай болсон үед Docker build/push руу орно; production build Dockerfile дотор ажиллана.

`tests/` дэх jsdom тестүүд тооцоолуурын үнэ, нэмэлт функц хасах, тайлбарын урт, calculator → quote prefill болон формын validation-ийг шалгана. Бодит browser layout, network/backend хүргэлтийг шалгахгүй. Тестийн үед зөвхөн Next navigation болон jsdom-д байхгүй хэмжилт/scroll API-г орлуулна.

## Deployment

Хоёр бие даасан суваг байна — Docker image нь Vercel-ийг **орлохгүй**:

**Vercel.** `main`-д push хийхэд автомат production deploy. Branch / PR push → preview deploy.

**GitHub Packages (ghcr.io).** `.github/workflows/docker.yml` нь `main` болон `v*` тэг дээр image build хийж түлхэнэ. Pull request дээр зөвхөн build хийж, push хийхгүй (шалгалт). Нэмэлт secret хэрэггүй — `GITHUB_TOKEN`-оор нэвтэрнэ.

```bash
docker pull ghcr.io/provisionmn/provisionmn:latest
docker run -p 3000:3000 ghcr.io/provisionmn/provisionmn:latest
```

Тэгүүд: `latest` (default branch), branch нэр, `v*` тэг, богино sha.

Image нь `node:22-alpine` дээрх Next standalone output, ~200MB, non-root `nextjs` хэрэглэгчээр ажиллана, `/` дээр healthcheck-тэй.

> `output: "standalone"` нь `DOCKER_BUILD` env-ээр хаалттай бөгөөд зөвхөн Dockerfile түүнийг тавьдаг. Тиймээс локал болон Vercel дээрх `npm run build` урьдын хэвээр ажиллана.

## Notable details

- Брэнд өнгө, лого, фонт нь `logo.png`-оос гаралтай. Палитрын 4 өнгө (`#6D46FF` violet, `#2563EB` blue, `#0B0F1A` ink, `#E6E8EF` mist) `globals.css`-ийн эхэнд `--brand-*` болж нэг удаа тодорхойлогдоно; бусад бүх token эднээс үүсдэг
- `--accent` бол shadcn-ий hover гадаргуу, брэндийн өнгө БИШ — брэндийн тод өнгө нь `--brand` (`text-brand`)
- `--brand` нь өнгөний аяс хадгална, харин утга нь theme-ээс хамаарна: light дээр `#6D46FF` (5.07:1), dark дээр түүний цайвар хувилбар `#A78BFF` (7.09:1) — түүхий violet нь ink дээр 3.62:1 болж AA-д хүрэхгүй
- `--success` нь брэндийн бус, функциональ өнгө (номд ногоон байхгүй ч "live" төлөв, ✓ тэмдэгт шаарддаг) — `text-success` / `bg-success`
- Лого нь `components/Logo.tsx` доторх inline SVG (растер файл байхгүй; `logo.png` бол зөвхөн лавлагаа). Тэмдэг нь **зузаан chevron-ы контур** — round cap/join бүхий stroke-ыг mask-аар хоосолсон: төв шугам `M 16 16 L 58 50 L 16 84`, гадна 32, дотор 21.4. Хоёр өргөнийг хамт өөрчлөх ёстой
- Лого болон түүний градиент theme-ээс хамаардаггүй — violet → blue нь light, dark аль алин дээр уншигдана
- Фонт: UI/body-д **Manrope**, `font-mono`-д **JetBrains Mono** (терминал блок "14 өдөрт" гэх монгол текст агуулдаг, системийн анхдагч mono-д **ө** байхгүй), зөвхөн "Provision" wordmark-д **Sora** — Sora кирилл subset-гүй тул монгол текстэд хэрэглэхгүй (ном Sora-г нэрлэсэн ч гарчигт шилжүүлж болохгүй)
- Фонт солихдоо: **Ө (U+04E8), Ү (U+04AE) нь `cyrillic` биш `cyrillic-ext` дотор**. Мөн `cyrillic-ext` зарласан нь glyph байгаа гэсэн үг биш — Onest, Wix Madefor Text хоёр зарласан мөртлөө Ө/Ү-гүй. Subset жагсаалтад биш, жинхэнэ woff2-ын cmap-д итгэ (CLAUDE.md дээр шалгах script бий)
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
