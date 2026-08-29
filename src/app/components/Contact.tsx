"use client";

import { useId, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Check,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { useT } from "../i18n";

type Field = "name" | "email" | "brief";
type Status = "idle" | "sending" | "sent";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  projectType: "",
  brief: "",
};

export function Contact() {
  const { t } = useT();
  const id = useId();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>("idle");

  const contactInfo: {
    icon: LucideIcon;
    label: string;
    value: string;
    href?: string;
  }[] = [
    {
      icon: Mail,
      label: t.contact.info.email,
      value: "hello@provision.mn",
      href: "mailto:hello@provision.mn",
    },
    {
      icon: Phone,
      label: t.contact.info.phone,
      value: "+976 7777-7777",
      href: "tel:+97677777777",
    },
    {
      icon: MapPin,
      label: t.contact.info.office,
      value: t.contact.info.officeValue,
    },
    {
      icon: Clock,
      label: t.contact.info.hours,
      value: t.contact.info.hoursValue,
    },
  ];

  const validate = (values: typeof emptyForm) => {
    const next: Partial<Record<Field, string>> = {};
    if (!values.name.trim()) next.name = t.contact.errors.name;
    if (!EMAIL.test(values.email.trim())) next.email = t.contact.errors.email;
    if (values.brief.trim().length < 20) next.brief = t.contact.errors.brief;
    return next;
  };

  const setField = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Only clear a message once it stops applying; re-validating the whole
    // form on every keystroke would flag fields the user hasn't reached yet.
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field as Field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(`${id}-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setStatus("sending");
    // No backend — the brief is acknowledged in the UI only, matching the
    // quote form. Swap this for a real POST when an endpoint exists.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setStatus("sent");
  };

  const fieldError = (field: Field) =>
    errors[field] ? (
      <p
        id={`${id}-${field}-error`}
        role="alert"
        className="text-xs text-destructive"
      >
        {errors[field]}
      </p>
    ) : null;

  const inputProps = (field: Field) => ({
    id: `${id}-${field}`,
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${id}-${field}-error` : undefined,
  });

  const labelClass = "block text-sm font-mono text-muted-foreground";

  return (
    <section
      id="contact"
      className="relative scroll-mt-24 py-32 md:py-48"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/*
          The closing CTA is an ink slab in both themes, so it carries the
          `dark` class and every token inside it resolves to the dark palette.
          That matters for more than the background: `--brand` is #6D46FF on
          light, which is 3.62:1 on ink and fails AA for the small uppercase
          label — scoping the class swaps it for the #A78BFF tint at 7.09:1
          without hardcoding either value here.
        */}
        <div className="dark relative mb-20 overflow-hidden rounded-3xl border border-border bg-background px-6 py-16 text-center elev-3 md:px-16 md:py-24">
          <div
            className="pointer-events-none absolute inset-0 bg-mesh"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-grain" aria-hidden />
          <div className="relative">
            <div className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-brand">
              {t.contact.tag}
            </div>
            <h2 className="mx-auto max-w-4xl font-display text-[clamp(2.1rem,5.2vw,3.9rem)] font-semibold leading-[1.05] tracking-display text-foreground">
              {t.contact.title}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              {t.contact.sub}
            </p>
            <a
              href="mailto:hello@provision.mn"
              className="mt-10 inline-flex items-center gap-3 rounded-full border border-border bg-card px-7 py-3.5 font-mono text-sm text-foreground transition-colors hover:border-primary/50"
            >
              <Mail strokeWidth={1.5} className="h-4 w-4 text-brand" />
              hello@provision.mn
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {status === "sent" ? (
            <div className="lg:col-span-3 rounded-2xl border border-border bg-card/70 p-6 md:p-8 elev-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-success/30 bg-success/10">
                <Check className="h-5 w-5 text-success" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight">
                {t.contact.successTitle}
              </h3>
              <p className="mt-3 text-muted-foreground">
                {t.contact.successBody.replace("{email}", form.email)}
              </p>
              <Button
                variant="outline"
                className="mt-8"
                onClick={() => {
                  setForm(emptyForm);
                  setStatus("idle");
                }}
              >
                {t.contact.successAgain}
              </Button>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={handleSubmit}
              className="lg:col-span-3 rounded-2xl border border-border bg-card/70 p-6 md:p-8 space-y-5 elev-1"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor={`${id}-name`} className={labelClass}>
                    {t.contact.name}
                  </label>
                  <Input
                    {...inputProps("name")}
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder={t.contact.namePlaceholder}
                    autoComplete="name"
                  />
                  {fieldError("name")}
                </div>
                <div className="space-y-2">
                  <label htmlFor={`${id}-email`} className={labelClass}>
                    {t.contact.email}
                  </label>
                  <Input
                    {...inputProps("email")}
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                  {fieldError("email")}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor={`${id}-phone`} className={labelClass}>
                  {t.contact.phone}{" "}
                  <span className="text-muted-foreground/60">
                    ({t.contact.optional})
                  </span>
                </label>
                <Input
                  id={`${id}-phone`}
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="+976 ..."
                  autoComplete="tel"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor={`${id}-type`} className={labelClass}>
                  {t.contact.projectType}
                </label>
                {/* Native select, styled to match Input — the Radix Select in
                    ui/ is only worth its bundle on the long calculator forms. */}
                <select
                  id={`${id}-type`}
                  value={form.projectType || t.contact.projectTypes[0]}
                  onChange={(e) => setField("projectType", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-input-background px-3 text-sm text-foreground outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  {t.contact.projectTypes.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor={`${id}-brief`} className={labelClass}>
                  {t.contact.brief}
                </label>
                <Textarea
                  {...inputProps("brief")}
                  value={form.brief}
                  onChange={(e) => setField("brief", e.target.value)}
                  placeholder={t.contact.briefPlaceholder}
                  rows={6}
                />
                {fieldError("brief")}
              </div>

              <Button
                type="submit"
                disabled={status === "sending"}
                className="w-full h-11"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t.contact.sending}
                  </>
                ) : (
                  t.contact.submit
                )}
              </Button>
            </form>
          )}

          <div className="lg:col-span-2 space-y-3">
            {contactInfo.map((info) => {
              const Icon = info.icon;
              const content = (
                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card/70 p-5 transition-[transform,border-color,box-shadow] duration-300 ease-out-strong hover:-translate-y-0.5 hover:border-primary/40 hover:elev-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
                    <Icon strokeWidth={1.5} className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      {info.label}
                    </div>
                    <div className="text-foreground">{info.value}</div>
                  </div>
                </div>
              );
              return info.href ? (
                <a key={info.label} href={info.href} className="block">
                  {content}
                </a>
              ) : (
                <div key={info.label}>{content}</div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
