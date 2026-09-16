"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuote } from "../quote-context";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Copy,
  Loader2,
  RefreshCw,
  Shield,
  SlidersHorizontal,
} from "lucide-react";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Mongolian numbers are 8 digits; accept spaces, dashes and a +976 prefix.
const PHONE = /^\+?[\d\s-]{6,}$/;
const MIN_DESCRIPTION = 20;

const group = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const projectTypeOptions = [
  { value: "Вэб сайт", label: "Вэб сайт хөгжүүлэлт" },
  { value: "Мобайл апп", label: "Мобайл апп хөгжүүлэлт" },
  { value: "Odoo ERP", label: "Odoo ERP систем" },
  { value: "Захиалгат шийдэл", label: "Захиалгат шийдэл" },
];

const budgetOptions = [
  { value: "500000-1000000", label: "₮500,000 – ₮1,000,000" },
  { value: "1000000-2000000", label: "₮1,000,000 – ₮2,000,000" },
  { value: "2000000-5000000", label: "₮2,000,000 – ₮5,000,000" },
  { value: "5000000+", label: "₮5,000,000-с дээш" },
  { value: "discuss", label: "Ярилцаж тохирно" },
];

const timelineOptions = [
  { value: "urgent", label: "Яаралтай (1–2 долоо хоног)" },
  { value: "normal", label: "Стандарт (2–4 долоо хоног)" },
  { value: "flexible", label: "Уян хатан (4–8 долоо хоног)" },
  { value: "long", label: "Урт хугацаа (8+ долоо хоног)" },
];

type Field =
  | "name"
  | "email"
  | "phone"
  | "projectType"
  | "description"
  | "captcha";

interface QuoteFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  projectType: string;
  description: string;
  budget: string;
  timeline: string;
  estimatedPrice: number;
  // The calculator/chatbot prefill can carry extra fields (complexity,
  // features, estimatedHours…) that are spread in verbatim.
  [key: string]: any;
}

function makeCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  // Addition only. A multiplication captcha filters out humans in a hurry
  // as effectively as it filters out bots, and this form guards nothing but
  // an inbox.
  return { question: `${a} + ${b}`, answer: String(a + b) };
}

export function QuoteRequest() {
  const router = useRouter();
  const uid = useId();
  const { quote: initialData, clearQuote } = useQuote();

  const initialForm: QuoteFormData = {
    name: "",
    email: "",
    phone: "",
    company: "",
    projectType: initialData?.projectType || "",
    description: initialData?.description || "",
    budget: "",
    timeline: initialData?.timeline || "",
    estimatedPrice: initialData?.estimatedPrice || 0,
    ...initialData,
  };

  const [formData, setFormData] = useState<QuoteFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [captcha, setCaptcha] = useState({ question: "", answer: "" });
  const [captchaInput, setCaptchaInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [copied, setCopied] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  // Arriving from the calculator means there is something to go back to;
  // a direct visit to /quote returns to the landing page instead.
  const backHref = initialData ? "/calculator" : "/";

  // Must be client-only: the question is randomised, so generating it during
  // render makes the server and client markup disagree (hydration mismatch).
  useEffect(() => {
    setCaptcha(makeCaptcha());
  }, []);

  // Move focus to the confirmation once it replaces the form, otherwise a
  // keyboard or screen-reader user is left on a button that no longer exists.
  useEffect(() => {
    if (requestId) successRef.current?.focus();
  }, [requestId]);

  const validate = (values: QuoteFormData, captchaValue: string) => {
    const next: Partial<Record<Field, string>> = {};
    if (!values.name.trim()) next.name = "Нэрээ бичнэ үү.";
    if (!EMAIL.test(values.email.trim()))
      next.email = "Хүчинтэй имэйл хаяг оруулна уу.";
    if (!PHONE.test(values.phone.trim()))
      next.phone = "Холбогдох утасны дугаараа оруулна уу.";
    if (!values.projectType) next.projectType = "Төслийн төрлөө сонгоно уу.";
    if (values.description.trim().length < MIN_DESCRIPTION)
      next.description = `Төслөө дор хаяж ${MIN_DESCRIPTION} тэмдэгтээр тайлбарлана уу.`;
    if (captchaValue.trim() !== captcha.answer)
      next.captcha = "Хариу таарахгүй байна.";
    return next;
  };

  const setField = (field: keyof QuoteFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear a message once it stops applying, but never introduce a new one
    // mid-typing: fields the user has not reached yet stay unmarked.
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field as Field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(formData, captchaInput);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = Object.keys(found)[0];
      const el = document.getElementById(`${uid}-${first}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus({ preventScroll: true });
      return;
    }

    setIsSubmitting(true);
    // No backend: the request is only acknowledged in the UI. Swap this for a
    // real POST when an endpoint exists.
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setRequestId(`REQ-${Date.now()}`);
    setIsSubmitting(false);
  };

  const startOver = () => {
    clearQuote();
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      projectType: "",
      description: "",
      budget: "",
      timeline: "",
      estimatedPrice: 0,
    });
    setErrors({});
    setCaptcha(makeCaptcha());
    setCaptchaInput("");
    setRequestId("");
    setCopied(false);
    window.scrollTo({ top: 0 });
  };

  const copyRequestId = async () => {
    try {
      await navigator.clipboard.writeText(requestId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is unavailable over plain http or when permission is
      // refused; the id is selectable text either way.
    }
  };

  const error = (field: Field) =>
    errors[field] ? (
      <p
        id={`${uid}-${field}-error`}
        role="alert"
        className="mt-2 text-xs text-destructive"
      >
        {errors[field]}
      </p>
    ) : null;

  const fieldProps = (field: Field) => ({
    id: `${uid}-${field}`,
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${uid}-${field}-error` : undefined,
  });

  const labelClass = "mb-2 block font-mono text-xs text-muted-foreground";
  const required = (
    <span aria-hidden className="text-brand">
      {" *"}
    </span>
  );

  if (requestId) {
    return (
      // No auto-redirect: the confirmation carries a reference number, and
      // yanking the page away three seconds later takes it with them.
      <div
        ref={successRef}
        tabIndex={-1}
        className="mx-auto max-w-2xl rounded-2xl border border-border bg-card/70 p-8 elev-1 outline-none md:p-12"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-success/30 bg-success/10">
          <CheckCircle strokeWidth={1.5} className="h-6 w-6 text-success" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-display text-foreground">
          Хүсэлт хүлээн авлаа
        </h1>
        <p className="mt-3 text-muted-foreground">
          Бид 24 цагийн дотор{" "}
          <span className="text-foreground">{formData.email}</span> хаяг руу
          дэлгэрэнгүй үнийн санал илгээнэ.
        </p>

        <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-border bg-background/60 px-4 py-3">
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Хүсэлтийн дугаар
            </div>
            <div className="mt-0.5 truncate font-mono text-sm text-foreground">
              {requestId}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyRequestId}
            className="shrink-0"
          >
            {copied ? (
              <>
                <Check strokeWidth={1.5} className="h-4 w-4 text-success" />
                Хуулсан
              </>
            ) : (
              <>
                <Copy strokeWidth={1.5} className="h-4 w-4" />
                Хуулах
              </>
            )}
          </Button>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            className="h-11 flex-1"
            onClick={() => {
              clearQuote();
              router.push("/");
            }}
          >
            Нүүр хуудас руу
          </Button>
          <Button
            variant="outline"
            className="h-11 flex-1"
            onClick={startOver}
          >
            Шинэ хүсэлт үүсгэх
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 rounded-full font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft strokeWidth={1.5} className="h-3.5 w-3.5" />
        {initialData ? "Тооцоолуур руу буцах" : "Нүүр хуудас"}
      </Link>

      <header className="mt-6">
        <h1 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-[1.08] tracking-display text-foreground">
          Үнийн санал хүсэх
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Дэлгэрэнгүй бичих тусам үнийн санал нь бодит болно. Бид 24 цагийн
          дотор хариу өгнө.
        </p>
      </header>

      {/* The estimate the user arrived with, restated so the form does not
          look like it forgot. */}
      {formData.estimatedPrice > 0 ? (
        <div className="mt-8 rounded-2xl border border-primary/25 bg-primary/[0.06] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-brand">
                <SlidersHorizontal strokeWidth={1.5} className="h-3 w-3" />
                Тооцоолуураас
              </div>
              <div className="mt-1.5 text-xl font-semibold tabular-nums text-foreground">
                ₮{group(formData.estimatedPrice)}
                {formData.estimatedHours ? (
                  <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                    {formData.estimatedHours} хүн-цаг
                  </span>
                ) : null}
              </div>
            </div>
            <Link
              href="/calculator"
              className="font-mono text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Тооцоог засах
            </Link>
          </div>
        </div>
      ) : null}

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-8 space-y-6 rounded-2xl border border-border bg-card/70 p-6 elev-1 md:p-8"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-name`} className={labelClass}>
              Овог нэр{required}
            </label>
            <Input
              {...fieldProps("name")}
              value={formData.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Батболд Ганбат"
              autoComplete="name"
            />
            {error("name")}
          </div>
          <div>
            <label htmlFor={`${uid}-email`} className={labelClass}>
              Имэйл хаяг{required}
            </label>
            <Input
              {...fieldProps("email")}
              type="email"
              inputMode="email"
              value={formData.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="you@company.mn"
              autoComplete="email"
            />
            {error("email")}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-phone`} className={labelClass}>
              Утасны дугаар{required}
            </label>
            <Input
              {...fieldProps("phone")}
              type="tel"
              inputMode="tel"
              value={formData.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="+976 9911-2233"
              autoComplete="tel"
            />
            {error("phone")}
          </div>
          <div>
            <label htmlFor={`${uid}-company`} className={labelClass}>
              Компанийн нэр{" "}
              <span className="text-muted-foreground/60">(сонголт)</span>
            </label>
            <Input
              id={`${uid}-company`}
              value={formData.company}
              onChange={(e) => setField("company", e.target.value)}
              placeholder="Компани ХХК"
              autoComplete="organization"
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${uid}-projectType`} className={labelClass}>
            Төслийн төрөл{required}
          </label>
          <Select
            value={formData.projectType}
            onValueChange={(value) => setField("projectType", value)}
          >
            {/* The trigger carries the id so the label points at something
                focusable — `required` on a Radix Select does nothing, which
                is why this form validates in JS instead. */}
            <SelectTrigger {...fieldProps("projectType")} className="w-full">
              <SelectValue placeholder="Төслийн төрлийг сонгоно уу" />
            </SelectTrigger>
            <SelectContent>
              {projectTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error("projectType")}
        </div>

        <div>
          <label htmlFor={`${uid}-description`} className={labelClass}>
            Төслийн дэлгэрэнгүй тайлбар{required}
          </label>
          <Textarea
            {...fieldProps("description")}
            value={formData.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Юу шийдэх гэж байгаа, хэн ашиглах, аль системүүдтэй холбогдох вэ?"
            rows={5}
          />
          {errors.description ? (
            error("description")
          ) : (
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              {formData.description.trim().length}/{MIN_DESCRIPTION} тэмдэгт
            </p>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-budget`} className={labelClass}>
              Төсөв{" "}
              <span className="text-muted-foreground/60">(сонголт)</span>
            </label>
            <Select
              value={formData.budget}
              onValueChange={(value) => setField("budget", value)}
            >
              <SelectTrigger id={`${uid}-budget`} className="w-full">
                <SelectValue placeholder="Төсвийн хэмжээ" />
              </SelectTrigger>
              <SelectContent>
                {budgetOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor={`${uid}-timeline`} className={labelClass}>
              Хугацаа{" "}
              <span className="text-muted-foreground/60">(сонголт)</span>
            </label>
            <Select
              value={formData.timeline}
              onValueChange={(value) => setField("timeline", value)}
            >
              <SelectTrigger id={`${uid}-timeline`} className="w-full">
                <SelectValue placeholder="Хүссэн хугацаа" />
              </SelectTrigger>
              <SelectContent>
                {timelineOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/50 p-4">
          <label
            htmlFor={`${uid}-captcha`}
            className="mb-3 flex items-center gap-2 font-mono text-xs text-muted-foreground"
          >
            <Shield strokeWidth={1.5} className="h-3.5 w-3.5" />
            Робот эсэхийг шалгах{required}
          </label>
          <div className="flex items-center gap-2">
            <div
              aria-hidden={captcha.question === ""}
              className="flex h-9 min-w-[92px] items-center justify-center rounded-md border border-border bg-card px-3 font-mono text-sm tabular-nums text-foreground"
            >
              {captcha.question ? `${captcha.question} = ?` : "…"}
            </div>
            <Input
              {...fieldProps("captcha")}
              inputMode="numeric"
              // `type="number"` adds spinners and swallows arrow keys for a
              // field that is two digits at most.
              value={captchaInput}
              onChange={(e) => {
                setCaptchaInput(e.target.value);
                if (errors.captcha)
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.captcha;
                    return next;
                  });
              }}
              placeholder="Хариу"
              autoComplete="off"
              className="w-24"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setCaptcha(makeCaptcha());
                setCaptchaInput("");
              }}
              aria-label="Өөр асуулт авах"
            >
              <RefreshCw strokeWidth={1.5} className="h-4 w-4" />
            </Button>
          </div>
          {error("captcha")}
        </div>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row-reverse">
          {/* Enabled unconditionally: submitting is how the user finds out
              what is missing, and every problem is reported in place. */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 sm:flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Илгээж байна…
              </>
            ) : (
              "Хүсэлт илгээх"
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11 sm:flex-1"
            onClick={() => router.push(backHref)}
          >
            Буцах
          </Button>
        </div>
      </form>
    </div>
  );
}
