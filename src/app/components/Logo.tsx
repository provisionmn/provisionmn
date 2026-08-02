import { poppins } from "../fonts";

/**
 * Provision Solutions logo mark — brand book section 01 / 03.
 *
 * The mark is a broken "P": a top arm that sweeps into the bowl, a detached
 * lower stem, and the small block that section 02 calls out as the
 * "building block that creates value". Geometry traced from the flat Mono
 * variant so the three pieces keep their published proportions.
 *
 * `variant` maps to the book's logo-mark variations:
 *   full   — Vibrant Purple to Deep Navy gradient (default, section 03)
 *   mono   — single currentColor, for tight or one-colour contexts
 *   invert — light mark for dark surfaces (the book's Inverse lockup)
 */
export function LogoMark({
  className,
  variant = "full",
  title,
}: {
  className?: string;
  variant?: "full" | "mono" | "invert";
  title?: string;
}) {
  // Unique per variant so two marks on one page can't collide on gradient ids.
  const gid = `pv-mark-${variant}`;

  const fill =
    variant === "full"
      ? `url(#${gid})`
      : variant === "invert"
        ? "var(--brand-white)"
        : "currentColor";

  const blockFill =
    variant === "full"
      ? "var(--logo-block)"
      : variant === "invert"
        ? "var(--brand-sky)"
        : "currentColor";

  return (
    <svg
      viewBox="0 0 84 100"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {variant === "full" && (
        <defs>
          {/* Stops come from CSS vars so the mark follows the theme: Full
              Color on light surfaces, Inverse on dark. */}
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--logo-from)" />
            <stop offset="100%" stopColor="var(--logo-to)" />
          </linearGradient>
        </defs>
      )}

      {/* Top arm sweeping into the bowl, drawn as one round-capped stroke */}
      <path
        d="M 10 10 H 52 A 21 21 0 1 1 52 52 H 45"
        fill="none"
        stroke={fill}
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Detached lower stem */}
      <path
        d="M 11 53 V 88"
        fill="none"
        stroke={fill}
        strokeWidth="20"
        strokeLinecap="round"
      />
      {/* The block */}
      <rect x="37" y="72" width="26" height="26" rx="7" fill={blockFill} />
    </svg>
  );
}

/**
 * Full lockup: mark + wordmark. Mirrors the book's "Compact" horizontal
 * lockup (section 04) — the one sized for UI chrome rather than print.
 */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark className="h-8 w-auto" title="Provision Solutions" />
      {showWordmark && (
        <span
          className={`${poppins.className} text-[1.05rem] font-semibold tracking-tight leading-none`}
        >
          Provision
        </span>
      )}
    </span>
  );
}
