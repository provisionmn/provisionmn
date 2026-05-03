import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { useT } from "../i18n";

export function Contact() {
  const { t } = useT();

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

  return (
    <section
      id="contact"
      className="relative py-24 md:py-32 border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">
            {t.contact.tag}
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
            {t.contact.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t.contact.sub}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <form className="lg:col-span-3 rounded-2xl border border-border bg-card/50 backdrop-blur p-6 md:p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-mono text-muted-foreground">
                  {t.contact.name}
                </label>
                <Input placeholder={t.contact.namePlaceholder} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-mono text-muted-foreground">
                  {t.contact.email}
                </label>
                <Input type="email" placeholder="you@company.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-mono text-muted-foreground">
                {t.contact.phone}
              </label>
              <Input placeholder="+976 ..." />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-mono text-muted-foreground">
                {t.contact.projectType}
              </label>
              <select
                className="w-full h-10 px-3 rounded-md border border-border bg-input-background text-foreground text-sm"
                defaultValue={t.contact.projectTypes[0]}
              >
                {t.contact.projectTypes.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-mono text-muted-foreground">
                {t.contact.brief}
              </label>
              <Textarea
                placeholder={t.contact.briefPlaceholder}
                rows={6}
              />
            </div>

            <Button className="w-full h-11">{t.contact.submit}</Button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            {contactInfo.map((info) => {
              const Icon = info.icon;
              const content = (
                <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card/50 backdrop-blur hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
                    <Icon className="h-4 w-4 text-primary" />
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
