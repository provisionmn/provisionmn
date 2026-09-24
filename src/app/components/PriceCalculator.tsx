"use client";

import { useT } from "../i18n";
import { formatCopy } from "../flow-copy";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuote } from "../quote-context";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  Clock,
  Info,
} from "lucide-react";

const HOURLY_RATE = 88000; // төгрөг / хүн-цаг
const MIN_DESCRIPTION = 20;

// Deterministic thousands separator. `toLocaleString()` reads the runtime
// locale, so the prerendered number and the hydrated one can disagree — this
// groups digits the same way on the server and in the browser.
const group = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const tugrik = (n: number) => `₮${group(n)}`;

type Option = { value: string; label: string; hint?: string };

/** Section wrapper: a numbered step so the form reads as a sequence. */
function Step({
  index,
  title,
  required,
  children,
}: {
  index: number;
  title: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const {
    t: { flow: copy },
  } = useT();
  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-4 flex items-center gap-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-secondary font-mono text-[11px] tabular-nums text-muted-foreground">
          {index}
        </span>
        <span className="text-base font-medium tracking-tight text-foreground">
          {title}
        </span>
        {required ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand">
            {copy.required}{" "}
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
            {copy.optional}{" "}
          </span>
        )}
      </legend>
      {children}
    </fieldset>
  );
}

/**
 * Radio group drawn as cards. Native inputs rather than a custom widget: the
 * browser gives arrow-key roving focus and the correct announcement for free,
 * and the visible card is just the label's styling.
 */
function CardRadios({
  name,
  options,
  value,
  onChange,
  columns = 2,
  invalid,
  describedBy,
}: {
  name: string;
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
  columns?: 2 | 4;
  invalid?: boolean;
  describedBy?: string;
}) {
  return (
    <div
      className={`grid gap-2 ${
        columns === 2 ? "sm:grid-cols-2" : "grid-cols-2 lg:grid-cols-4"
      }`}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={`group relative flex cursor-pointer flex-col justify-center rounded-xl border bg-card/60 px-4 py-3 transition-[border-color,background-color,box-shadow] duration-[160ms] ease-out-strong has-[:checked]:border-primary has-[:checked]:bg-primary/[0.07] has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50 hover:border-primary/40 ${
            invalid ? "border-destructive/60" : "border-border"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            aria-describedby={describedBy}
            className="sr-only"
          />
          <span className="text-sm font-medium text-foreground">
            {option.label}
          </span>
          {option.hint ? (
            <span className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              {option.hint}
            </span>
          ) : null}
        </label>
      ))}
    </div>
  );
}

export function PriceCalculator() {
  const {
    t: { flow: copy },
  } = useT();
  const projectTypes = [
    {
      value: "website",
      label: copy.website,
      hint: copy.companySitesLandingPagesPortals,
      baseHours: 40,
    },
    {
      value: "mobile",
      label: copy.mobileApp,
      hint: "iOS, Android, cross-platform",
      baseHours: 80,
    },
    {
      value: "erp",
      label: "Odoo ERP",
      hint: copy.implementationConfigurationModules,
      baseHours: 120,
    },
    {
      value: "custom",
      label: copy.customSolution,
      hint: copy.internalSystemsIntegrations,
      baseHours: 60,
    },
  ] as const;
  const complexityLevels = [
    {
      value: "simple",
      label: copy.simple,
      hint: copy.templatesAFewScreens,
      multiplier: 1,
    },
    {
      value: "medium",
      label: copy.medium,
      hint: copy.customDesignAndBusinessLogic,
      multiplier: 1.5,
    },
    {
      value: "complex",
      label: copy.complex,
      hint: copy.multipleRolesDeepIntegrations,
      multiplier: 2.5,
    },
    {
      value: "enterprise",
      label: copy.enterprise,
      hint: copy.scaleAuditSla,
      multiplier: 4,
    },
  ] as const;
  const additionalFeatures = [
    { id: "responsive", label: copy.responsiveDesign, hours: 10 },
    { id: "cms", label: copy.contentManagementCms, hours: 20 },
    { id: "ecommerce", label: copy.eCommerce, hours: 30 },
    { id: "api", label: copy.apiIntegration, hours: 15 },
    { id: "auth", label: copy.userAccessManagement, hours: 20 },
    { id: "admin", label: copy.adminPanel, hours: 25 },
    { id: "multilang", label: copy.multilingualSupport, hours: 15 },
    { id: "analytics", label: copy.analyticsAndReporting, hours: 10 },
  ] as const;
  const timelines = [
    { value: "urgent", label: copy.urgent, hint: copy.oneToTwoWeeks },
    { value: "normal", label: copy.standard, hint: copy.twoToFourWeeks },
    { value: "flexible", label: copy.flexible, hint: copy.fourToEightWeeks },
    { value: "long", label: copy.longTerm, hint: copy.eightPlusWeeks },
  ] as const;
  const teamSizes = [
    { value: "1", label: copy.onePerson },
    { value: "2-3", label: copy.twoToThreePeople },
    { value: "4-6", label: copy.fourToSixPeople },
    { value: "6+", label: copy.sixPlusPeople },
  ] as const;

  const router = useRouter();
  const { setQuote } = useQuote();
  const uid = useId();

  const [projectType, setProjectType] = useState("");
  const [complexity, setComplexity] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [timeline, setTimeline] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [description, setDescription] = useState("");
  // Nothing is marked wrong until the user has actually tried to continue —
  // pre-emptive red on an untouched form is noise, not guidance.
  const [attempted, setAttempted] = useState(false);

  const selectedProject = projectTypes.find((p) => p.value === projectType);
  const selectedComplexity = complexityLevels.find(
    (c) => c.value === complexity,
  );

  const estimate = (() => {
    if (!selectedProject || !selectedComplexity) return null;
    const baseHours = selectedProject.baseHours * selectedComplexity.multiplier;
    const featureRows = features
      .map((id) => additionalFeatures.find((f) => f.id === id))
      .filter((f): f is (typeof additionalFeatures)[number] => Boolean(f));
    const featureHours = featureRows.reduce((sum, f) => sum + f.hours, 0);
    const hours = Math.round(baseHours + featureHours);
    return {
      baseHours,
      featureRows,
      hours,
      price: hours * HOURLY_RATE,
      weeks: Math.ceil(hours / 40),
    };
  })();

  // The submit button stays enabled and tells the user what is outstanding.
  // A disabled button with no explanation is a dead end: the form looks
  // finished and the only feedback is that nothing happens.
  const missing = [
    !projectType && { field: "type", label: copy.projectType },
    !complexity && { field: "complexity", label: copy.complexity },
    description.trim().length < MIN_DESCRIPTION && {
      field: "description",
      label: copy.description,
    },
  ].filter((m): m is { field: string; label: string } => Boolean(m));

  const toggleFeature = (id: string, checked: boolean) => {
    setFeatures((prev) =>
      checked ? [...prev, id] : prev.filter((f) => f !== id),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (missing.length > 0 || !estimate) {
      const target = missing[0]
        ? document.getElementById(`${uid}-${missing[0].field}`)
        : null;
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      // Focus the first control inside the group, not the wrapper.
      const focusable = target?.querySelector<HTMLElement>(
        "input, textarea, button",
      );
      focusable?.focus({ preventScroll: true });
      return;
    }

    setQuote({
      projectType: selectedProject?.value,
      complexity: selectedComplexity?.value,
      features: estimate.featureRows.map((f) => f.id),
      timeline,
      teamSize,
      description,
      estimatedPrice: estimate.price,
      estimatedHours: estimate.hours,
      createdAt: new Date().toISOString(),
    });
    router.push("/quote");
  };

  const descriptionShort =
    attempted && description.trim().length < MIN_DESCRIPTION;

  const summaryRows = estimate
    ? [
        {
          label: formatCopy(copy.valueBase, selectedProject?.label),
          value: formatCopy(copy.valueHours, selectedProject?.baseHours),
        },
        {
          label: `${selectedComplexity?.label} · ×${selectedComplexity?.multiplier}`,
          value: formatCopy(copy.valueHours, estimate.baseHours),
        },
        ...estimate.featureRows.map((f) => ({
          label: f.label,
          value: formatCopy(copy.valueHours100, f.hours),
        })),
      ]
    : [];

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft strokeWidth={1.5} className="h-3.5 w-3.5" />
        {copy.home}{" "}
      </Link>

      <header className="mt-6 max-w-2xl">
        <h1 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-[1.08] tracking-display text-foreground">
          {copy.projectCostCalculator}{" "}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {copy.fillInThreeFieldsForAnEstimate} {tugrik(HOURLY_RATE)}
          {copy.perPersonHour}{" "}
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-5 lg:gap-12">
        <div className="space-y-12 lg:col-span-3">
          <div id={`${uid}-type`} className="scroll-mt-28">
            <Step index={1} title={copy.projectTypeLabel} required>
              <CardRadios
                name={`${uid}-project-type`}
                options={projectTypes.map((p) => ({
                  value: p.value,
                  label: p.label,
                  hint: formatCopy(copy.valueValueHours, p.hint, p.baseHours),
                }))}
                value={projectType}
                onChange={setProjectType}
                invalid={attempted && !projectType}
              />
            </Step>
          </div>

          <div id={`${uid}-complexity`} className="scroll-mt-28">
            <Step index={2} title={copy.complexity106} required>
              <CardRadios
                name={`${uid}-complexity`}
                options={complexityLevels.map((c) => ({
                  value: c.value,
                  label: c.label,
                  hint: `${c.hint} · ×${c.multiplier}`,
                }))}
                value={complexity}
                onChange={setComplexity}
                invalid={attempted && !complexity}
              />
            </Step>
          </div>

          <Step index={3} title={copy.additionalFeatures}>
            {/* The whole row is the label, so the hit target is the card
                rather than the 16px box — this list is mostly used on a
                phone. */}
            <div className="grid gap-2 sm:grid-cols-2">
              {additionalFeatures.map((feature) => {
                const checked = features.includes(feature.id);
                return (
                  <label
                    key={feature.id}
                    htmlFor={`${uid}-${feature.id}`}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-card/60 px-4 py-3 transition-[border-color,background-color] duration-[160ms] ease-out-strong hover:border-primary/40 ${
                      checked
                        ? "border-primary bg-primary/[0.07]"
                        : "border-border"
                    }`}
                  >
                    <Checkbox
                      id={`${uid}-${feature.id}`}
                      checked={checked}
                      onCheckedChange={(value) =>
                        toggleFeature(feature.id, value === true)
                      }
                    />
                    <span className="min-w-0 flex-1 text-sm text-foreground">
                      {feature.label}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                      +{feature.hours}
                      {copy.h}{" "}
                    </span>
                  </label>
                );
              })}
            </div>
          </Step>

          <Step index={4} title={copy.preferredTimeline}>
            <CardRadios
              name={`${uid}-timeline`}
              options={timelines}
              value={timeline}
              onChange={setTimeline}
            />
          </Step>

          <Step index={5} title={copy.teamSize}>
            <CardRadios
              name={`${uid}-team`}
              options={teamSizes}
              value={teamSize}
              onChange={setTeamSize}
              columns={4}
            />
          </Step>

          <div id={`${uid}-description`} className="scroll-mt-28">
            <Step index={6} title={copy.projectDescription} required>
              <Textarea
                id={`${uid}-description-input`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={copy.whatProblemAreYouSolvingWhoWill}
                rows={5}
                aria-invalid={descriptionShort}
                aria-describedby={`${uid}-description-help`}
              />
              <p
                id={`${uid}-description-help`}
                className={`mt-2 font-mono text-[11px] ${
                  descriptionShort
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {descriptionShort
                  ? formatCopy(
                      copy.pleaseEnterAtLeastValueCharactersCurrently,
                      MIN_DESCRIPTION,
                      description.trim().length,
                    )
                  : formatCopy(
                      copy.valueValueCharacters,
                      description.trim().length,
                      MIN_DESCRIPTION,
                    )}
              </p>
            </Step>
          </div>
        </div>

        {/* Summary. Sticky on desktop so the number is never scrolled away
            while the inputs that move it are being changed. */}
        <aside className="lg:col-span-2">
          <div className="lg:sticky lg:top-28">
            <div className="rounded-2xl border border-border bg-card/70 p-6 elev-1">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {copy.preliminaryEstimate}{" "}
              </div>

              <div aria-live="polite" aria-atomic="true">
                {estimate ? (
                  <>
                    <div className="mt-4 font-display text-4xl font-semibold tracking-display tabular-nums text-foreground">
                      {tugrik(estimate.price)}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border bg-background/60 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          <Clock strokeWidth={1.5} className="h-3 w-3" />
                          {copy.personHours}{" "}
                        </div>
                        <div className="mt-1 text-lg tabular-nums text-foreground">
                          {group(estimate.hours)}
                        </div>
                      </div>
                      <div className="rounded-xl border border-border bg-background/60 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          <CalendarRange
                            strokeWidth={1.5}
                            className="h-3 w-3"
                          />
                          {copy.timeline}{" "}
                        </div>
                        <div className="mt-1 text-lg tabular-nums text-foreground">
                          ~{estimate.weeks} {copy.weeks}{" "}
                        </div>
                      </div>
                    </div>

                    {/* Where the number came from. A total with no breakdown
                        reads as a guess. */}
                    <dl className="mt-5 space-y-1.5 border-t border-border pt-4">
                      {summaryRows.map((row) => (
                        <div
                          key={row.label}
                          className="flex items-baseline justify-between gap-3 text-xs"
                        >
                          <dt className="min-w-0 truncate text-muted-foreground">
                            {row.label}
                          </dt>
                          <dd className="shrink-0 font-mono tabular-nums text-foreground/80">
                            {row.value}
                          </dd>
                        </div>
                      ))}
                      <div className="flex items-baseline justify-between gap-3 border-t border-border pt-2 text-xs">
                        <dt className="text-muted-foreground">
                          {group(estimate.hours)} {copy.hours}{" "}
                          {tugrik(HOURLY_RATE)}
                        </dt>
                        <dd className="shrink-0 font-mono tabular-nums text-foreground">
                          {tugrik(estimate.price)}
                        </dd>
                      </div>
                    </dl>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {copy.selectAProjectTypeAndComplexityTo}{" "}
                  </p>
                )}
              </div>

              <p className="mt-5 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
                <Info
                  strokeWidth={1.5}
                  className="mt-px h-3.5 w-3.5 shrink-0"
                />
                {copy.thisIsAnIndicativeEstimateTheFinal}{" "}
              </p>

              {/* Below `lg` the sticky bar owns the call to action, so this
                  one would be a second submit button stacked on the first. */}
              <div className="hidden lg:block">
                <Button type="submit" className="mt-6 h-11 w-full">
                  {copy.requestAQuote}{" "}
                  <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
                </Button>

                {attempted && missing.length > 0 ? (
                  <p role="alert" className="mt-3 text-xs text-destructive">
                    {copy.missing} {missing.map((m) => m.label).join(", ")}.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile: the summary panel sits below the whole form, so the running
          total rides along the bottom of the viewport instead. Sticky rather
          than fixed — it releases at the end of the form instead of sitting
          on top of the footer for the rest of the page. */}
      <div className="sticky bottom-0 z-30 -mx-4 mt-10 border-t border-border bg-background/85 px-4 backdrop-blur-xl lg:hidden">
        {attempted && missing.length > 0 ? (
          <p role="alert" className="pt-2.5 text-xs text-destructive">
            {copy.missing} {missing.map((m) => m.label).join(", ")}.
          </p>
        ) : null}
        <div className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {copy.preliminaryEstimate}{" "}
            </div>
            <div className="truncate text-lg font-semibold tabular-nums text-foreground">
              {estimate ? tugrik(estimate.price) : "—"}
            </div>
          </div>
          <Button type="submit" className="h-11 shrink-0 px-5">
            {copy.continue} <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
