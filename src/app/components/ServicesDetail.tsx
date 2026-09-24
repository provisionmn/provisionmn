"use client";

import { useT } from "../i18n";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Settings,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface DetailService {
  icon: LucideIcon;
  short: string;
  title: string;
  description: string;
  points: string[];
  stackLabel: string;
  stack: string[];
  duration: string;
  price: string;
}

// Kept in step with the landing page's About stats — the two surfaces used to
// quote different figures for the same company.

/** Mono chip used for stack / module tags, matching the landing sections. */
const chip =
  "rounded-md border-border bg-secondary/40 px-2 py-1 font-mono text-xs font-normal text-muted-foreground";

export function ServicesDetail() {
  const {
    t: { flow: copy },
  } = useT();
  const services: DetailService[] = [
    {
      icon: Code2,
      short: "Web · Frontend · API",
      title: copy.webDevelopment,
      description: copy.modernFastAndReliableWebsitesAndWeb,
      points: [
        copy.responsiveDesign,
        copy.seoOptimization,
        copy.cmsSystem,
        copy.eCommercePlatform,
      ],
      stackLabel: copy.technologies,
      stack: ["React", "Next.js", "Vue.js", "Laravel"],
      duration: copy.twoToEightWeeks,
      price: copy.from500000,
    },
    {
      icon: Smartphone,
      short: "iOS · Android · Cross-platform",
      title: copy.mobileDevelopment,
      description: copy.iosAndAndroidAppsWithANative,
      points: [
        copy.nativeDevelopment,
        "Cross-platform",
        copy.uiUxDesign,
        copy.appStoreApproval,
      ],
      stackLabel: copy.technologies,
      stack: ["React Native", "Flutter", "Swift", "Kotlin"],
      duration: copy.fourToTwelveWeeks,
      price: copy.from800000,
    },
    {
      icon: Settings,
      short: copy.erpCustomModules,
      title: copy.odooErpSystem,
      description: copy.anIntegratedBusinessManagementSystemAdaptedTo,
      points: [
        copy.financialManagement,
        copy.inventoryManagement,
        copy.crmSystem,
        copy.humanResourcesManagement,
      ],
      stackLabel: copy.modules,
      stack: [copy.sales, copy.purchasing, copy.warehouse, copy.humanResources],
      duration: copy.sixToSixteenWeeks,
      price: copy.from1200000,
    },
  ];
  const process: { step: string; title: string; description: string }[] = [
    {
      step: "01",
      title: copy.discovery,
      description: copy.weStudyYourBusinessNeedsAndDefine,
    },
    {
      step: "02",
      title: copy.planning,
      description: copy.weDesignTheTechnicalSolutionVisualsAnd,
    },
    {
      step: "03",
      title: copy.design,
      description: copy.weCreateUiUxDesignsTailoredTo,
    },
    {
      step: "04",
      title: copy.development,
      description: copy.weBuildYourSystemUsingModernTechnologies,
    },
    {
      step: "05",
      title: copy.testing,
      description: copy.weThoroughlyTestEveryFeatureOfThe,
    },
    {
      step: "06",
      title: copy.launch,
      description: copy.weLaunchTheSystemAndProvideOngoing,
    },
  ];
  const stats: { number: string; label: string }[] = [
    { number: "60+", label: copy.projectsLaunched },
    { number: "6", label: copy.fullTimeDevelopers },
    { number: "10+", label: copy.yearsOfExperience },
    { number: "24/7", label: copy.supportService },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 bg-grid mask-radial-fade opacity-60"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse at center, var(--hero-glow) 0%, transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 md:pb-20 md:pt-24 lg:px-8">
          <Button asChild variant="ghost" size="sm" className="-ml-3 mb-10">
            <Link href="/">
              <ArrowLeft className="mr-1 h-4 w-4" />
              {copy.home}{" "}
            </Link>
          </Button>

          <div className="max-w-3xl">
            <div className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-brand">
              {"// Services"}
            </div>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-balance md:text-6xl">
              {copy.fromIdeaToProduction}{" "}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground text-pretty md:text-xl">
              {copy.digitalServicesForYourBusinessWithClear}{" "}
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-16 md:space-y-24">
            {services.map((service, i) => {
              const Icon = service.icon;
              // Alternating sides: the meta rail crosses the page each row so
              // three services don't read as three identical columns.
              const flip = i % 2 === 1;

              return (
                <article
                  key={service.title}
                  className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-16"
                >
                  <div
                    className={`lg:col-span-7 ${flip ? "lg:order-2 lg:col-start-6" : ""}`}
                  >
                    <div className="mb-6 flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="font-mono text-xs uppercase tracking-[0.15em] text-brand">
                        {service.short}
                      </div>
                    </div>

                    <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                      {service.title}
                    </h2>
                    <p className="mt-4 max-w-xl text-lg text-muted-foreground text-pretty">
                      {service.description}
                    </p>

                    <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {service.points.map((point) => (
                        <li key={point} className="flex items-start gap-3">
                          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-brand" />
                          <span className="text-sm text-foreground/90">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className={`lg:col-span-5 ${flip ? "lg:order-1 lg:col-start-1 lg:row-start-1" : ""}`}
                  >
                    <div className="rounded-2xl border border-border bg-card/50 p-6 backdrop-blur md:p-8">
                      <div className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        {service.stackLabel}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {service.stack.map((s) => (
                          <Badge key={s} variant="outline" className={chip}>
                            {s}
                          </Badge>
                        ))}
                      </div>

                      <dl className="mt-6 border-t border-border pt-6">
                        <div className="flex items-baseline justify-between gap-4">
                          <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            {copy.timeline}{" "}
                          </dt>
                          <dd className="text-sm tabular-nums text-foreground">
                            {service.duration}
                          </dd>
                        </div>
                        <div className="mt-4 flex items-baseline justify-between gap-4">
                          <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            {copy.startingPrice}{" "}
                          </dt>
                          <dd className="text-xl font-semibold tabular-nums tracking-tight text-brand">
                            {service.price}
                          </dd>
                        </div>
                      </dl>

                      <Button asChild className="mt-6 w-full">
                        <Link href="/calculator">
                          {copy.getAnEstimate}{" "}
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-border py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-brand">
                {"// Process"}
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                {copy.howWeWork}{" "}
              </h2>
              <p className="mt-4 text-muted-foreground text-pretty">
                {copy.sixStepsToDeliverYourProjectEach}{" "}
              </p>
            </div>

            {/* A numbered rail rather than six centred cards — the steps are
                sequential, so they read down a line instead of across a grid. */}
            <ol className="lg:col-span-8 lg:border-l lg:border-border">
              {process.map((item) => (
                <li
                  key={item.step}
                  className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-border py-6 first:border-t-0 lg:border-t-0 lg:py-7 lg:pl-10 lg:first:pt-0"
                >
                  <div className="font-mono text-sm tabular-nums text-brand">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-1 max-w-lg text-sm text-muted-foreground text-pretty">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-b border-border py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <div className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-brand">
                {"// Why us"}
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                {copy.whyChooseUs}{" "}
              </h2>
              <p className="mt-4 text-muted-foreground text-pretty">
                {copy.aTeamThatDeliversWorkingSystemsQuickly}{" "}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-x-8 gap-y-10 md:col-span-7">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <div className="text-4xl font-semibold tabular-nums tracking-tight md:text-5xl">
                      {stat.number}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 p-8 backdrop-blur md:p-14">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              aria-hidden
              style={{
                background:
                  "radial-gradient(circle at 85% 0%, rgba(109,70,255,0.28), transparent 55%), radial-gradient(circle at 15% 100%, rgba(37,99,235,0.16), transparent 55%)",
              }}
            />
            <div className="relative max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                {copy.letSTalkAboutYourProject}{" "}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-pretty">
                {copy.inOurFirstMeetingWeWillClarify}{" "}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-6 text-base">
                  <Link href="/#contact">
                    {copy.getAFreeConsultation}{" "}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 text-base"
                >
                  <Link href="/#portfolio">{copy.viewPortfolio}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
