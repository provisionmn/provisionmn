/**
 * Infinite tech marquee. Server component on purpose — no hooks, no handlers,
 * and the strings are proper nouns that are identical in both languages, so
 * it never needs the dictionary.
 *
 * The track holds exactly two identical lists and translates -50%, which is
 * one whole list, so the seam lands on itself. Building it as one list with
 * duplicated children instead would drift by a gap width per cycle.
 */
const stack: string[] = [
  "TypeScript",
  "Next.js",
  "React Native",
  "Python",
  "Django",
  "PostgreSQL",
  "Kubernetes",
  "Terraform",
  "AWS",
  "Odoo 17",
  "Claude API",
  "Docker",
  "Power Automate",
  "pgvector",
];

function Row({ hidden }: { hidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-14 pr-14"
      aria-hidden={hidden || undefined}
    >
      {stack.map((item) => (
        <span
          key={item}
          className="whitespace-nowrap font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground/70"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <section className="relative border-y border-border py-7">
      <div className="marquee-track mask-fade-x overflow-hidden">
        <div className="animate-marquee flex w-max">
          <Row />
          <Row hidden />
        </div>
      </div>
    </section>
  );
}
