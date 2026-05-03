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
      sub: "Fullstack, mobile, AI, DevOps, Odoo, UX/UI, RPA — нэг багаар инженерийн бүх давхаргыг хамруулж, production-д хүргэнэ.",
      startBtn: "Төсөл эхлүүлэх",
      workBtn: "Ажлуудыг үзэх",
      termReady: "Ready",
      termAfter: "— launched in",
      termDays: "14 өдөрт",
    },
    services: {
      tag: "// Services",
      title: "Нэг багаар инженерийн бүх давхарга",
      sub: "Идея → архитектур → код → launch → scale. Хэсэгчилсэн vendor хайх шаардлагагүй.",
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
      p1: "Provision.mn нь 2019 онд үүсгэн байгуулагдсан. Бид идеяг production-д хүргэж, scale-д ороход шаардлагатай бүх давхаргыг нэг газраас өгдөг.",
      p2: "Fullstack-аас AI хүртэл, UX-ээс автоматжуулалт хүртэл — хэд хэдэн vendor-тэй ярих шаардлагагүй, нэг engineering team-тэй ажиллана.",
      highlights: [
        "Монголын Odoo implementation partner",
        "Аюулгүй байдалд анхаардаг — ISO 27001 · OWASP зарчмаар хөгжүүлэлт",
        "AWS · Google Cloud · GitHub certified",
        "Open-source contributor community",
      ],
      stats: [
        { number: "60+", label: "Launch хийсэн төсөл" },
        { number: "12", label: "Full-time инженер" },
        { number: "7", label: "Жилийн туршлага" },
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
      sub: "Товч brief илгээгээрэй — 24 цагт буцаж хариулна.",
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
  },

  en: {
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
      sub: "Fullstack, mobile, AI, DevOps, Odoo, UX/UI, RPA — one team covering every engineering layer, shipped to production.",
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
          description:
            "Figma to production code — pixel-perfect handoff.",
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
        tagline: "AI-powered comprehensive ERP for non-bank financial institutions",
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
        { number: "12", label: "Full-time engineers" },
        { number: "7", label: "Years of experience" },
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
      sub: "Send us a brief — we'll reply within 24 hours.",
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
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === "undefined") return "mn";
    const saved = localStorage.getItem("lang");
    return saved === "en" ? "en" : "mn";
  });

  useEffect(() => {
    try {
      localStorage.setItem("lang", lang);
    } catch {
      // ignore
    }
    document.documentElement.lang = lang;
  }, [lang]);

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
