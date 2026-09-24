"use client";

import { mnFlow, enFlow } from "./flow-copy";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Language = "mn" | "en";

const dicts = {
  mn: {
    flow: mnFlow,
    intake: {
      saved: "Таны хүсэлт хадгалагдлаа. Бид таны оруулсан холбоо барих мэдээллээр холбогдоно.",
      failed: "Хүсэлтийг хадгалсныг баталгаажуулж чадсангүй. Мэдээллээ шалгаад дахин илгээнэ үү.",
      limited: "Хэт олон хүсэлт ирсэн байна. Нэг цагийн дараа дахин оролдоно уу.",
    },
    nav: {
      services: "Үйлчилгээ",
      products: "Бүтээгдэхүүн",
      portfolio: "Портфолио",
      about: "Бидний тухай",
      contact: "Холбоо",
      cta: "Холбогдох",
    },
    hero: {
      badge: "Шинэ төсөл хүлээн авч байна · Улаанбаатар",
      headline1: "Таны бүтээгдэхүүнийг",
      headline2: "бодитой барьж байгуулна",
      sub: "Fullstack, mobile, AI, DevOps, Odoo, UX/UI, RPA. Нэг багаар инженерийн бүх давхаргыг хамруулж, production-д хүргэнэ.",
      startBtn: "Төсөл эхлүүлэх",
      workBtn: "Ажлуудыг үзэх",
      termReady: "Ready",
      termAfter: "— launched in",
      termDays: "14 өдөрт",
    },
    services: {
      tag: "// Services",
      title: "Нэг багаар инженерийн бүх давхарга",
      sub: "Санаа → архитектур → код → launch → scale. Хэсэгчилсэн vendor хайх шаардлагагүй.",
      detailBtn: "Үйлчилгээ дэлгэрэнгүй",
      items: [
        {
          title: "Fullstack хөгжүүлэлт",
          short: "Next.js · Django · Node · Postgres",
          description:
            "API-аас frontend-д хүртэл — type-safe, scale-д бэлэн инженерийн stack.",
          features: [
            "TypeScript monorepo",
            "REST · GraphQL · tRPC",
            "Realtime · WebSocket",
            "Observability",
          ],
        },
        {
          title: "AI & LLM",
          short: "RAG · Агент · Fine-tune",
          description:
            "LLM-ийг production-д ажиллуулна — chat, search, copilot, автомат агент.",
          features: ["RAG pipeline", "Vector DB", "Evals · guardrails"],
        },
        {
          title: "Mobile App",
          short: "React Native · iOS · Android",
          description:
            "Native-тэй эн зэрэгцэх UX, offline-first архитектур, OTA update.",
          features: ["Expo · EAS", "Native modules", "Push · deep link"],
        },
        {
          title: "Server & DevOps",
          short: "Kubernetes · Terraform · CI/CD",
          description:
            "Cloud архитектураас production-д хүртэл — uptime, scale, cost.",
          features: ["IaC (Terraform)", "K8s · ECS", "Observability", "CI/CD"],
        },
        {
          title: "Odoo ERP",
          short: "Custom модуль · Implementation",
          description:
            "Монгол стандартад нийцүүлсэн Odoo хэрэгжүүлэлт болон custom модуль.",
          features: [
            "Custom addons",
            "Payroll · HR · Inventory",
            "Odoo upgrade",
            "API integration",
          ],
        },
        {
          title: "UX / UI дизайн",
          short: "Design system · Prototype",
          description:
            "Figma дизайнаас production code-д хүртэл — pixel-perfect handoff.",
          features: ["Design system", "Prototype", "Usability"],
        },
        {
          title: "Процесс автоматжуулалт",
          short: "Power Automate · RPA · Workflow",
          description:
            "Давтагдах оффисын ажлуудыг автоматжуулна — тайлан тулгалт, баримт дамжуулалт, мэдэгдэл, батлах урсгал. Нягтлан, HR, санхүүгийн цаг хэмнэнэ.",
          features: [
            "Power Automate · Desktop flows",
            "Office 365 · SharePoint",
            "Excel · SQL · Email",
            "Approval workflow",
          ],
        },
      ],
    },
    products: {
      tag: "// Products",
      title: "Үйлдвэрлэлд ажиллаж буй SaaS бүтээгдэхүүнүүд",
      sub: "Odoo-ын суурин дээр AI нэгтгэсэн, салбарт тохирсон цогц платформууд.",
      flagship: "Flagship product",
      featured: {
        tagline: "ББСБ-д зориулсан хиймэл оюунтай цогц ERP",
        description:
          "Зээлийн урсгал, кредит оноо, эрсдэл үнэлгээ, AML/KYC, хугацаа хэтэрсэн зээлийн удирдлага — Odoo ERP суурьтай custom модуль болон Claude / OpenAI LLM-ийг бодит шийдвэр гаргалтад нэгтгэсэн. ББСБ-ын санхүүгийн зохицуулалтын хороо (СЗХ)-ны стандартад бүрэн нийцдэг.",
        features: [
          "Зээлдэгчийн автомат KYC шалгалт",
          "AI кредит оноо + risk scoring",
          "AML мониторинг + SAR report",
          "Хугацаа хэтэрсэн зээл эрт илрүүлэх",
          "Санхүү · НД · татварын нэгтгэл",
          "Хэрэглэгчийн чат-bot зөвлөх агент",
          "СЗХ тайлан автомат үүсгэх",
          "Multi-currency зээлийн бүтээгдэхүүн",
        ],
      },
      items: [
        {
          tagline:
            "Агуулахын ухаалаг систем — AI-аар нөөц хэзээ дуусахыг урьдчилан таамаглана",
          description:
            "Агуулахын нөөцийн бодит цагийн хяналт, AI-аар нөөц дуусах хугацааг урьдчилан таамаглах, автомат нөхөн захиалга, RFID/barcode/QR дэмжлэгтэй.",
          features: [
            "Real-time нөөцийн хяналт",
            "AI нөөц дуусах таамаглал",
            "Low-stock автомат анхааруулга",
            "RFID · Barcode · QR",
            "Multi-warehouse",
            "Автомат нөхөн захиалга",
          ],
        },
        {
          tagline: "Multi-branch retail POS + AI demand forecast",
          description:
            "Олон салбарын бараа материал, борлуулалтын урьдчилсан таамаглал AI-аар, offline-first mobile POS.",
          features: [
            "Салбар бүрийн inventory",
            "AI demand forecast",
            "Mobile POS (offline-first)",
            "Barcode · QR · E-barimt",
            "Omni-channel (онлайн + оффлайн)",
          ],
        },
      ],
    },
    about: {
      tag: "// About",
      title1: "Startup-ийн хурд,",
      title2: "том багийн инженерийн стандарт",
      p1: "Provision.mn нь 2019 онд үүсгэн байгуулагдсан. Бид санааг production-д хүргэж, scale-д ороход шаардлагатай бүх давхаргыг нэг газраас өгдөг.",
      p2: "Fullstack-аас AI хүртэл, UX-ээс автоматжуулалт хүртэл — хэд хэдэн vendor-тэй ярих шаардлагагүй, нэг engineering team-тэй ажиллана.",
      highlights: [
        "Монголын Odoo implementation partner",
        "Аюулгүй байдалд анхаардаг — ISO 27001 · OWASP зарчмаар хөгжүүлэлт",
        "AWS · Google Cloud · GitHub certified",
        "Open-source contributor community",
      ],
      stats: [
        { number: "60+", label: "Launch хийсэн төсөл" },
        { number: "6", label: "Full-time хөгжүүлэгч" },
        { number: "10+", label: "Жилийн туршлага" },
        { number: "99.9%", label: "Uptime target" },
      ],
    },
    portfolio: {
      tag: "// Work",
      title: "Production-д ажиллаж буй сонгомол төслүүд",
      sub: "AI-аас RPA хүртэл — олон салбарт хэрэгжүүлсэн инженерийн ажлууд.",
      projects: [
        {
          title: "AI баримт судлах агент",
          description:
            "Хууль, тендер, гэрээний баримтыг LLM + RAG-аар задлан шинжилдэг enterprise агент.",
          category: "AI / LLM",
        },
        {
          title: "Realtime e-commerce платформ",
          description:
            "Multi-channel inventory, realtime order, edge cached storefront.",
          category: "Fullstack",
        },
        {
          title: "Хүргэлтийн мобайл апп",
          description:
            "Жолооч болон харилцагч аппууд, live tracking, offline-first cache.",
          category: "Mobile",
        },
        {
          title: "K8s platform migration",
          description:
            "Legacy VM → Kubernetes шилжүүлэлт, CI/CD, infra cost 40% хэмнэлт.",
          category: "DevOps",
        },
        {
          title: "Үйлдвэрийн Odoo ERP",
          description:
            "Custom модуль — цалин, татвар, импорт, баркод, production planning.",
          category: "Odoo",
        },
        {
          title: "ЭМД тайлан тулгалт",
          description:
            "Эрүүл мэндийн даатгалын тайланг цалингийн журнал, банкны гүйлгээтэй Power Automate-аар автомат тулгана — зөрүүтэй мөрийг Excel тайлангаар гаргана.",
          category: "RPA",
        },
        {
          title: "Бараа материалын тулгалт",
          description:
            "Физик тооллого, нягтлан бодох бүртгэл, ERP нөөцийг автомат тулгаж — зөрүү, алдагдал, илүүдэл нөөцийн тайлан өдөр бүр үүсгэнэ.",
          category: "RPA",
        },
        {
          title: "Кассын гүйлгээ тулгалт",
          description:
            "Банкны выписка, POS, кассын дэвтрийн гүйлгээг өдөр бүр автомат тулгана — тохироогүй гүйлгээг шууд мэдэгдэл болгож илгээнэ.",
          category: "RPA",
        },
      ],
    },
    contact: {
      tag: "// Contact",
      title: "Төслийн тухай ярилцъя",
      sub: "Төслийнхөө тухай товч бичиж, холбоо барих мэдээллээ үлдээгээрэй.",
      name: "Нэр",
      namePlaceholder: "Таны нэр",
      email: "И-мэйл",
      phone: "Утас",
      projectType: "Төслийн төрөл",
      brief: "Brief",
      briefPlaceholder:
        "Юу хийх гэж байгаа, хэзээ launch хиймээр байгаа, ямар технологи шаардлагатай...",
      submit: "Илгээх",
      projectTypes: [
        "Fullstack вэб",
        "Mobile app",
        "AI / LLM",
        "DevOps · Infrastructure",
        "Odoo ERP",
        "UX / UI дизайн",
        "Процесс автоматжуулалт · RPA",
        "Техникийн зөвлөгөө",
      ],
      sending: "Илгээж байна…",
      successTitle: "Хүсэлт хүлээн авлаа",
      successBody: "Таны хүсэлт хадгалагдлаа. Холбоо барих хаяг: {email}.",
      successAgain: "Дахин илгээх",
      optional: "заавал биш",
      errors: {
        name: "Нэрээ бичнэ үү",
        email: "И-мэйл хаяг буруу байна",
        brief: "Дор хаяж 20 тэмдэгт бичнэ үү",
      },
      info: {
        email: "Email",
        phone: "Утас",
        office: "Оффис",
        hours: "Ажиллах цаг",
        officeValue: "БЗД, 1-р хороо, Улаанбаатар",
        hoursValue: "Да–Ба · 09:00–18:00",
      },
    },
    footer: {
      tagline:
        "Fullstack, mobile, AI, DevOps, Odoo, UX/UI, RPA — нэг багаар инженерийн бүх давхаргыг.",
      services: "Үйлчилгээ",
      company: "Компани",
      companyLinks: ["Бидний тухай", "Портфолио", "Блог", "Ажлын байр"],
      serviceLinks: [
        "Fullstack хөгжүүлэлт",
        "Mobile App",
        "AI & LLM",
        "Server & DevOps",
        "Odoo ERP",
        "UX / UI дизайн",
        "Процесс автоматжуулалт",
      ],
      rights: "© {year} Provision.mn · Built in Улаанбаатар",
      terms: "Үйлчилгээний нөхцөл",
      privacy: "Нууцлалын бодлого",
    },
    journey: {
      band1: "Олон гүйцэтгэгч. Хэн ч хариуцдаггүй.",
      band2: "Бүгдийг нэг баг хийж, бүрэн хариуцна.",
      loading: "Видео ачаалж байна",
    },
    process: {
      tag: "// Process",
      title: "Эхнээс нь тодорхой. Дуустал нь хариуцна.",
      steps: [
        {
          title: "Танилцах уулзалт",
          body: "Нэг уулзалтаар зорилго, хугацаа, шаардлагатай холболтуудыг тодорхойлно.",
        },
        {
          title: "Бичгээр тохирсон хүрээ",
          body: "Юу хийх, юу өөрчлөлтөд тооцогдох нь эхнээсээ цаасан дээр.",
        },
        {
          title: "Үе шаттай хүргэлт",
          body: "Үе шат бүр ажиллаж буй хувилбараар дуусна. Төлбөр ч үе шатаараа.",
        },
        {
          title: "Ашиглалт ба дэмжлэг",
          body: "Ашиглалтад гаргаад хяналт, шинэчлэлийг нь хариуцна. Код таны репозиторид.",
        },
      ],
      hold: "Барьж байгаад хүрээгээ түгжих",
      locked: "Хүрээ түгжигдлээ",
    },
    faq: {
      tag: "// FAQ",
      title: "Асуух зүйл байна уу?",
      cta: "Үнээ тооцоолох",
      items: [
        {
          q: "Жижиг өөрчлөлт бүрт шинэ үнэ гарах уу?",
          a: "Үгүй. Хамрах хүрээг эхэнд бичгээр тохирч, юу өөрчлөлтөд тооцогдохыг тэнд заана. Бидний алдааг үнэгүй засна.",
        },
        {
          q: "Төсөл дундаа гацвал яах вэ?",
          a: "Төлбөр үе шаттай. Үе шат бүр ажиллаж буй хувилбараар дуусдаг тул явц нүдэнд харагдана.",
        },
        {
          q: "Код хэнийх вэ?",
          a: "Та. Код эхний өдрөөс таны репозиторид хадгалагдана.",
        },
        {
          q: "e-barimt, QPay, банктай холбож чадах уу?",
          a: "Тийм. Эхний уулзалтаар аль холболт хэрэгтэйг тодорхойлж, хамрах хүрээнд бичнэ.",
        },
        {
          q: "Жижиг компанид үнэтэй биш үү?",
          a: "Үнийн тооцоолуураар хэдхэн алхамд ойролцоо үнээ харна. Дараа нь тогтмол үнийн санал өгнө.",
        },
      ],
    },
    a11y: {
      skip: "Үндсэн агуулга руу шилжих",
    },
    notFound: {
      tag: "// 404",
      title: "Ийм хуудас олдсонгүй",
      body: "Хаяг буруу бичигдсэн эсвэл хуудас зөөгдсөн байж болзошгүй. Доорхоос үргэлжлүүлээрэй.",
      home: "Нүүр хуудас",
      services: "Үйлчилгээ үзэх",
    },
  },

  en: {
    flow: enFlow,
    intake: {
      saved: "Your request has been saved. We will follow up using the contact details you provided.",
      failed: "We could not confirm your request was saved. Check your details and try again.",
      limited: "Too many requests. Please try again in one hour.",
    },
    nav: {
      services: "Services",
      products: "Products",
      portfolio: "Portfolio",
      about: "About",
      contact: "Contact",
      cta: "Get in touch",
    },
    hero: {
      badge: "Taking on new projects · Ulaanbaatar",
      headline1: "We build",
      headline2: "your product for real",
      sub: "Fullstack, mobile, AI, DevOps, Odoo, UX/UI, RPA. One team covering every engineering layer, shipped to production.",
      startBtn: "Start a project",
      workBtn: "View our work",
      termReady: "Ready",
      termAfter: "— launched in",
      termDays: "14 days",
    },
    services: {
      tag: "// Services",
      title: "Every engineering layer, one team",
      sub: "Idea → architecture → code → launch → scale. No chasing multiple vendors.",
      detailBtn: "Service details",
      items: [
        {
          title: "Fullstack development",
          short: "Next.js · Django · Node · Postgres",
          description:
            "From API to frontend — type-safe, production-ready engineering stack.",
          features: [
            "TypeScript monorepo",
            "REST · GraphQL · tRPC",
            "Realtime · WebSocket",
            "Observability",
          ],
        },
        {
          title: "AI & LLM",
          short: "RAG · Agents · Fine-tune",
          description:
            "Ship LLMs to production — chat, search, copilots, autonomous agents.",
          features: ["RAG pipeline", "Vector DB", "Evals · guardrails"],
        },
        {
          title: "Mobile App",
          short: "React Native · iOS · Android",
          description:
            "Native-quality UX, offline-first architecture, OTA updates.",
          features: ["Expo · EAS", "Native modules", "Push · deep link"],
        },
        {
          title: "Server & DevOps",
          short: "Kubernetes · Terraform · CI/CD",
          description:
            "Cloud architecture to production — uptime, scale, cost.",
          features: ["IaC (Terraform)", "K8s · ECS", "Observability", "CI/CD"],
        },
        {
          title: "Odoo ERP",
          short: "Custom modules · Implementation",
          description:
            "Odoo implementation tailored to local standards with custom modules.",
          features: [
            "Custom addons",
            "Payroll · HR · Inventory",
            "Odoo upgrade",
            "API integration",
          ],
        },
        {
          title: "UX / UI design",
          short: "Design system · Prototype",
          description: "Figma to production code — pixel-perfect handoff.",
          features: ["Design system", "Prototype", "Usability"],
        },
        {
          title: "Process automation",
          short: "Power Automate · RPA · Workflows",
          description:
            "Automate repetitive back-office work — report reconciliation, document routing, notifications, approvals. Give finance, HR and ops their time back.",
          features: [
            "Power Automate · Desktop flows",
            "Office 365 · SharePoint",
            "Excel · SQL · email",
            "Approval workflows",
          ],
        },
      ],
    },
    products: {
      tag: "// Products",
      title: "SaaS products running in production",
      sub: "Industry-specific platforms built on Odoo with AI baked in.",
      flagship: "Flagship product",
      featured: {
        tagline:
          "AI-powered comprehensive ERP for non-bank financial institutions",
        description:
          "Loan flow, credit scoring, risk assessment, AML/KYC, delinquency management — custom Odoo ERP modules integrated with Claude / OpenAI LLMs for real decision intelligence. Fully compliant with Mongolia's Financial Regulatory Commission (FRC) standards.",
        features: [
          "Automated borrower KYC",
          "AI credit scoring + risk",
          "AML monitoring + SAR reports",
          "Early delinquency detection",
          "Finance · social insurance · tax integration",
          "Customer chatbot advisor agent",
          "Automated FRC reports",
          "Multi-currency loan products",
        ],
      },
      items: [
        {
          tagline:
            "Smart warehouse system — AI predicts when your stock runs out",
          description:
            "Real-time warehouse stock monitoring, AI-powered stockout forecasting, automated reordering, with RFID/barcode/QR support.",
          features: [
            "Real-time stock tracking",
            "AI stockout forecasting",
            "Low-stock auto alerts",
            "RFID · Barcode · QR",
            "Multi-warehouse",
            "Automated reordering",
          ],
        },
        {
          tagline: "Multi-branch retail POS + AI demand forecast",
          description:
            "Inventory across branches, AI sales forecasting, offline-first mobile POS.",
          features: [
            "Per-branch inventory",
            "AI demand forecast",
            "Mobile POS (offline-first)",
            "Barcode · QR · e-receipt",
            "Omni-channel (online + offline)",
          ],
        },
      ],
    },
    about: {
      tag: "// About",
      title1: "Startup speed,",
      title2: "big-team engineering standards",
      p1: "Provision.mn was founded in 2019. We take ideas to production and cover every layer you need to scale — from one place.",
      p2: "Fullstack to AI, UX to automation — no juggling vendors. One engineering team.",
      highlights: [
        "Mongolia Odoo implementation partner",
        "Security-conscious engineering — ISO 27001 · OWASP principles",
        "AWS · Google Cloud · GitHub certified",
        "Active open-source contributors",
      ],
      stats: [
        { number: "60+", label: "Shipped projects" },
        { number: "6", label: "Full-time developers" },
        { number: "10+", label: "Years of experience" },
        { number: "99.9%", label: "Uptime target" },
      ],
    },
    portfolio: {
      tag: "// Work",
      title: "Selected projects running in production",
      sub: "From AI to RPA — engineering work across many industries.",
      projects: [
        {
          title: "AI document analysis agent",
          description:
            "Enterprise agent parsing legal, tender, and contract docs via LLM + RAG.",
          category: "AI / LLM",
        },
        {
          title: "Realtime e-commerce platform",
          description:
            "Multi-channel inventory, realtime orders, edge-cached storefront.",
          category: "Fullstack",
        },
        {
          title: "Delivery mobile app",
          description:
            "Driver and customer apps, live tracking, offline-first cache.",
          category: "Mobile",
        },
        {
          title: "K8s platform migration",
          description:
            "Legacy VM → Kubernetes migration, CI/CD, 40% infra cost reduction.",
          category: "DevOps",
        },
        {
          title: "Manufacturing Odoo ERP",
          description:
            "Custom modules — payroll, tax, imports, barcode, production planning.",
          category: "Odoo",
        },
        {
          title: "Social insurance reconciliation",
          description:
            "Power Automate flow reconciles social-insurance returns against payroll and bank transactions — flags mismatches into an Excel report.",
          category: "RPA",
        },
        {
          title: "Inventory reconciliation",
          description:
            "Auto-reconciles physical counts, accounting records and ERP stock — daily variance, shrinkage and overstock reports.",
          category: "RPA",
        },
        {
          title: "Cash transaction reconciliation",
          description:
            "Daily reconciliation of bank statements, POS and cash-journal entries — unmatched items trigger instant notifications.",
          category: "RPA",
        },
      ],
    },
    contact: {
      tag: "// Contact",
      title: "Let's talk about your project",
      sub: "Tell us about your project and leave your contact details.",
      name: "Name",
      namePlaceholder: "Your name",
      email: "Email",
      phone: "Phone",
      projectType: "Project type",
      brief: "Brief",
      briefPlaceholder:
        "What you're building, timeline, tech stack requirements...",
      submit: "Send",
      projectTypes: [
        "Fullstack web",
        "Mobile app",
        "AI / LLM",
        "DevOps · Infrastructure",
        "Odoo ERP",
        "UX / UI design",
        "Process automation · RPA",
        "Technical consulting",
      ],
      sending: "Sending…",
      successTitle: "Brief received",
      successBody: "Your request has been saved. Contact email: {email}.",
      successAgain: "Send another",
      optional: "optional",
      errors: {
        name: "Enter your name",
        email: "That email address isn't valid",
        brief: "Write at least 20 characters",
      },
      info: {
        email: "Email",
        phone: "Phone",
        office: "Office",
        hours: "Hours",
        officeValue: "Bayanzurkh, 1st khoroo, Ulaanbaatar",
        hoursValue: "Mon–Fri · 09:00–18:00",
      },
    },
    footer: {
      tagline:
        "Fullstack, mobile, AI, DevOps, Odoo, UX/UI, RPA — one team across every engineering layer.",
      services: "Services",
      company: "Company",
      companyLinks: ["About us", "Portfolio", "Blog", "Careers"],
      serviceLinks: [
        "Fullstack development",
        "Mobile App",
        "AI & LLM",
        "Server & DevOps",
        "Odoo ERP",
        "UX / UI design",
        "Process automation",
      ],
      rights: "© {year} Provision.mn · Built in Ulaanbaatar",
      terms: "Terms of service",
      privacy: "Privacy policy",
    },
    journey: {
      band1: "Many vendors. Nobody takes responsibility.",
      band2: "One team builds it all, and owns it all.",
      loading: "Loading video",
    },
    process: {
      tag: "// Process",
      title: "Clear from day one. Owned until launch.",
      steps: [
        {
          title: "Discovery call",
          body: "One call to pin down the goal, the timeline and the integrations you need.",
        },
        {
          title: "Scope in writing",
          body: "What we build, and what counts as a change, on paper before work starts.",
        },
        {
          title: "Milestone delivery",
          body: "Every milestone ends in a working build. You pay milestone by milestone.",
        },
        {
          title: "Launch and support",
          body: "We launch it, then keep it monitored and updated. The code lives in your repository.",
        },
      ],
      hold: "Hold to lock the scope",
      locked: "Scope locked",
    },
    faq: {
      tag: "// FAQ",
      title: "Before you ask",
      cta: "Estimate your price",
      items: [
        {
          q: "Will every small change become a new quote?",
          a: "No. We agree the scope in writing first, and it spells out what counts as a change. Our bugs we fix for free.",
        },
        {
          q: "What if the project stalls halfway?",
          a: "Payment is by milestone, and every milestone ends in a working build, so you always see real progress.",
        },
        {
          q: "Who owns the code?",
          a: "You do. It sits in your own repository from the first day.",
        },
        {
          q: "Can you connect e-barimt, QPay and banks?",
          a: "Yes. We list the integrations you need in the first call and write them into the scope.",
        },
        {
          q: "Is this too expensive for a small business?",
          a: "The price calculator shows a ballpark in a few steps. After that you get a fixed quote.",
        },
      ],
    },
    a11y: {
      skip: "Skip to main content",
    },
    notFound: {
      tag: "// 404",
      title: "We couldn't find that page",
      body: "The address may be mistyped, or the page has moved. Pick up from here.",
      home: "Home",
      services: "See services",
    },
  },
};

type Dict = (typeof dicts)["mn"];

interface Ctx {
  lang: Language;
  setLang: (l: Language) => void;
  toggleLang: () => void;
  t: Dict;
}

const Context = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Must start at the server-rendered default ("mn") so the first client render
  // matches the HTML. The stored preference is applied in an effect below,
  // after hydration — reading localStorage during render would desync them.
  const [lang, setLang] = useState<Language>("mn");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      // Read storage after mount so the first render matches server Mongolian.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === "en") setLang("en");
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("lang", lang);
    } catch {
      // ignore
    }
    document.documentElement.lang = lang;
  }, [lang, hydrated]);

  const toggleLang = () => setLang((v) => (v === "mn" ? "en" : "mn"));

  return (
    <Context.Provider value={{ lang, setLang, toggleLang, t: dicts[lang] }}>
      {children}
    </Context.Provider>
  );
}

export function useT() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useT must be used within LanguageProvider");
  return ctx;
}
