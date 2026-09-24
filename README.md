# Provision.mn

Marketing site for Provision.mn — Монголын инженерийн студи. Fullstack, mobile, AI, DevOps, Odoo, UX/UI болон процесс автоматжуулалт (RPA).

🌐 **Production:** https://provision.mn (VPS + Traefik)

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind v4** (`@tailwindcss/postcss`) — CSS custom property theming, dark mode
- **shadcn/ui** (Radix UI + CVA) — UI primitives
- **Scroll-video hero** — scroll-оор удирдах MP4; гар утас болон reduced-motion үед статик зураг
- **Lucide React** — иконууд
- **i18n** — Mongolian / English (`src/app/i18n.tsx`, React Context, no library)

## Architecture

App Router дээрх 4 маршрут, бүгд статикаар prerender хийгддэг:

| Маршрут | Агуулга |
| --- | --- |
| `/` | Landing (Hero / Marquee / Services / Products / Process / Portfolio / About / FAQ / Contact + Chatbot) |
| `/services` | Үйлчилгээний дэлгэрэнгүй |
| `/calculator` | Үнийн тооцоолуур |
| `/quote` | Үнийн санал хүсэх форм |

`src/app/layout.tsx` нь `<html>`, provider-ууд болон бүх хуудсанд нийтлэг `Header` + `Footer`-ыг эзэмшинэ. Хуудасны `page.tsx` файлууд нь Server Component. Дэд хуудсууд өөрийн `metadata` экспортолдог; нүүр хуудас `layout.tsx`-ийн metadata-г өвлөнө. Metadata экспортолдог файлыг Client Component болгож болохгүй. Иймд навигаци нь section компонент дотор `Link` / `useRouter`-ээр хийгддэг.

Тооцоолуураас формд дамжих өгөгдлийг `src/app/quote-context.tsx` (`useQuote`) зөөнө — санах ойд л байдаг тул `/quote`-г дахин ачаалахад prefill арилж, хоосон форм гарна.

Backend болон хүсэлтийн хадгалалт байхгүй. Contact 1.2 секунд, QuoteRequest 1.4 секунд хүлээгээд зөвхөн дэлгэц дээр амжилтын төлөв харуулдаг; мэдээлэл сервер, имэйл рүү илгээгдэхгүй. QuoteRequest-ийн `REQ-…` дугаар browser-т үүсдэг. Автоматаар өөр хуудас руу шилжихгүй: хэрэглэгч нүүр хуудас руу буцах эсвэл шинэ хүсэлт эхлүүлэх үйлдлийг сонгоно; Contact дээр дахин илгээх товч байна.

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

## Google Analytics 4

Бүх маршрут root layout дахь `@next/third-parties/google`-ийн `GoogleAnalytics` ашиглана. Скрипт hydration-ийн дараа ачаална. `NEXT_PUBLIC_GA_MEASUREMENT_ID` хоосон/буруу эсвэл `npm run dev` үед Analytics ачаалахгүй.

1. GA4 → Admin → Data streams → Web хэсгээс `https://provision.mn` stream-ийн **Measurement ID** (`G-…`)-г авна.
2. VPS build-д: GitHub repository → Settings → Secrets and variables → Actions → **Variables** дотор `NEXT_PUBLIC_GA_MEASUREMENT_ID` нэмнэ. Энэ нь public ID; secret биш. Workflow Docker build argument-аар дамжуулна. PR build-д ID дамжуулахгүй.
3. Локал production build-д `.env.example`-ийг `.env.local` руу хуулж ID-г бөглөнө. Vercel ашиглавал зөвхөн Production environment-д энэ хувьсагчийг тохируулна; Preview-д хоосон үлдээнэ.
4. ID нь **build үед** HTML-д ордог: өөрчилсний дараа шинэ build/deploy шаардлагатай. Контейнерийн runtime env-г өөрчлөх нь хангалтгүй.
5. GA4 Web stream → Enhanced measurement → Page views → Advanced settings дахь **Page changes based on browser history events**-ийг асаана. App Router шилжилтийг үүгээр хэмжинэ; давхар custom `page_view` илгээхгүй.
6. Deploy-ийн дараа Analytics Realtime/DebugView дээр нүүр → `/services` → `/calculator` → `/quote`, browser back/forward шилжилтийг шалгана. Initial load болон шилжилт бүр нэг `page_view` үүсэх ёстой. Зар хаагч хэмжилтийг зогсоож болно.

Формууд одоогоор backend-гүй тул form interactions хэмжилтийг GA4 дээр унтрааж, амжилттай lead гэж тооцохгүй. Код формын утга, имэйл, утас болон тайлбарыг custom event-р илгээхгүй.

Лавлах: [Next.js Google Analytics](https://nextjs.org/docs/app/guides/third-party-libraries#google-analytics), [GA4 SPA measurement](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications).

## Deployment

Гурван хэсэгтэй:

**VPS / provision.mn.** `main`-ийн quality → Docker build/push амжилттай болсны дараа Actions нь `deploy sha-<short>` командыг SSH-ээр ажиллуулна. `deploy/deploy.sh` контейнер healthy болсныг шалгаж, workflow гаднаас HTTPS 200 хариу шалгана. `v*` тэг нь image нийтэлнэ, VPS deploy эхлүүлэхгүй.

`deploy/docker-compose.yml` нь shared `provision` network, Traefik router ашиглана; host port нээхгүй. VPS дээрх compose болон deploy script-ийн хуулбарыг CI шинэчилдэггүй. `VPS_SSH_KEY` нь зөвхөн `check` болон `deploy [<tag>]` ажиллуулах forced-command түлхүүр. Дэлгэрэнгүй ажиллагааг [CLAUDE.md](CLAUDE.md#deployment)-ээс үзнэ үү.

**Vercel.** GitHub integration нь `main` дээр production, branch/PR дээр preview deploy оролддог. `provision.mn`-ийн production traffic VPS рүү очно. Vercel-ийн шалгалт болон VPS deploy-ийн үр дүн тусдаа.

**GitHub Packages (ghcr.io).** `.github/workflows/docker.yml` нь `main` болон `v*` тэг дээр image build хийж түлхэнэ. Pull request дээр зөвхөн build хийж, push хийхгүй (шалгалт). Registry publish нь `GITHUB_TOKEN` ашиглана; VPS deploy нь тусдаа `VPS_SSH_KEY` шаарддаг. Private image татахын өмнө тухайн хэрэглэгч GHCR-д нэвтэрсэн байна.

```bash
docker pull ghcr.io/provisionmn/provisionmn:latest
docker run -p 3000:3000 ghcr.io/provisionmn/provisionmn:latest
```

Тэгүүд: `latest` (default branch), branch нэр, `v*` тэг, богино sha.

Image нь `node:22-alpine` дээрх Next standalone output, non-root `nextjs` хэрэглэгчээр ажиллана, `/` дээр healthcheck-тэй.

> `output: "standalone"` нь `DOCKER_BUILD` env-ээр хаалттай бөгөөд зөвхөн Dockerfile түүнийг тавьдаг. Тиймээс локал болон Vercel дээрх `npm run build` урьдын хэвээр ажиллана.

## Notable details

- Брэнд өнгө, лого, фонт нь `logo.png`-оос гаралтай. Палитрын 4 өнгө (`#6D46FF` violet, `#2563EB` blue, `#0B0F1A` ink, `#E6E8EF` mist) `globals.css`-ийн эхэнд `--brand-*` болж нэг удаа тодорхойлогдоно; бусад бүх token эднээс үүсдэг
- `--accent` бол shadcn-ий hover гадаргуу, брэндийн өнгө БИШ — брэндийн тод өнгө нь `--brand` (`text-brand`)
- `--brand` нь өнгөний аяс хадгална, харин утга нь theme-ээс хамаарна: light дээр `#6D46FF` (5.07:1), dark дээр түүний цайвар хувилбар `#A78BFF` (7.09:1) — түүхий violet нь ink дээр 3.62:1 болж AA-д хүрэхгүй
- `--success` нь брэндийн бус, функциональ өнгө (номд ногоон байхгүй ч "live" төлөв, ✓ тэмдэгт шаарддаг) — `text-success` / `bg-success`
- Лого нь `components/Logo.tsx` доторх inline SVG (растер файл байхгүй; `logo.png` бол зөвхөн лавлагаа). Тэмдэг нь **зузаан chevron-ы контур** — round cap/join бүхий stroke-ыг mask-аар хоосолсон: төв шугам `M 16 16 L 58 50 L 16 84`, гадна 32, дотор 21.4. Хоёр өргөнийг хамт өөрчлөх ёстой
- Лого болон түүний градиент theme-ээс хамаардаггүй — violet → blue нь light, dark аль алин дээр уншигдана
- Фонт: гарчиг, hero caption-д **Geologica**, UI/body-д **Manrope**, `font-mono`-д **JetBrains Mono** (mono шошго, тоон мэдээлэлд), зөвхөн "Provision" wordmark-д **Sora** — Sora кирилл subset-гүй тул монгол текстэд хэрэглэхгүй (ном Sora-г нэрлэсэн ч гарчигт шилжүүлж болохгүй)
- Фонт солихдоо: Монгол үсгийн preload-д `cyrillic-ext` subset-ийг зарлана; subset нэр дангаараа Ө/Ү glyph байгаа эсэхийг батлахгүй. Subset жагсаалтад биш, жинхэнэ woff2-ын cmap-д итгэ (CLAUDE.md дээр шалгах script бий)
- Tailwind v4-ийн `@theme inline` -аар theme tokens-ыг CSS custom property-аас map хийдэг
- Base font size 14px (`--font-size`) — px hardcode хийхгүй
- Dark mode-ыг `layout.tsx` дээр `class="dark"`-аар анхдагчаар асаасан; Header-ийн товч сэлгэнэ (хадгалагдахгүй)
- Hero-ийн `scrub/useScrubHero.ts` нь `/hero/hero-scrub.mp4`-ийг fetch хийж Blob болгон scroll-той синхрончилно. Статик горимд `hero-ending.jpg`, видео алдаатай үед poster ашиглана. Фонтууд `next/font`-оор build үед татагдаж, сайтаас өөрөөс нь үйлчлэгдэнэ.
- Prerender хийгддэг тул render дотор `Math.random()` / `Date.now()` / `localStorage` ашиглаж болохгүй (hydration алдаа өгнө)
- `@/*` → `src/*` path alias
- `components/ui/` дотор `badge`, `button`, `checkbox`, `input`, `select`, `textarea` гэсэн 6 primitive, `utils.ts` helper бий; шинээр хэрэгтэй бол `npx shadcn@latest add <name>`
- Dependency-ийн аюулгүй байдлыг `npm audit`-аар тухайн lockfile дээр дахин шалгана. Advisory болон санал болгосон засвар өөрчлөгддөг тул хуучин тоо, downgrade зөвлөгөөг дагахгүй; upgrade хийхдээ өөрчлөлтийг хянаж, бүх шалгалтыг ажиллуулна.

## License

Internal — Provision.mn өмчийн материал.
