import { sora } from "../fonts";

/**
 * Provision Solutions logo mark.
 *
 * The mark is the *contour* of a thick chevron — the book's "icon concept"
 * panel reads it as ">" (forward / progress) plus "<" (solution / structure).
 * It is not an outlined polygon: the two edges of each arm are parallel, so
 * the shape is a round-capped, round-joined chevron stroke with its middle
 * knocked out. Geometry below was traced off the book artwork and fits it to
 * within a pixel.
 *
 *   arm centreline   M 16 16 L 58 50 L 16 84   (arms at 39° from horizontal)
 *   arm width        26.7   →  outer edge 32, inner edge 21.4
 *   contour weight   5.3    →  (32 - 21.4) / 2
 *
 * Those two stroke widths are what the mask below trades on: paint the fat
 * chevron white, punch the thin one back out in black, and the difference is
 * the ring. Doing it as a mask rather than two stacked strokes keeps the mark
 * transparent in the middle, so it sits on any surface — the book uses it on
 * white, on a dark tile, on a violet circle and on light grey.
 *
 * `variant` maps to the book's logo variations:
 *   full   — violet → blue gradient (default; used on every background there)
 *   mono   — single currentColor
 *   invert — solid light mark, for busy or photographic backgrounds
 *
 * `form` is the optical size, and it is not a style choice:
 *
 *   outline — the contour above. The ribbon is 5.3 units of a 74-wide box,
 *             i.e. 0.85px once the mark is 16px tall. Below ~28px it stops
 *             being a mark and becomes a grey smudge — the counter closes
 *             first, then the two edges merge.
 *   solid   — the same centreline, same caps and joins, drawn once at the
 *             arm width the contour is built from (26.7 = the mean of the
 *             32 outer and 21.4 inner edges). No knockout, so nothing thin
 *             is left to lose. Legible down to 16px.
 *
 * So: `solid` for favicons and anything under ~28px, `outline` everywhere
 * else. Both are the same chevron on the same centreline, which is why they
 * can stand in for each other at all.
 */
export function LogoMark({
  className,
  variant = "full",
  form = "outline",
  title,
}: {
  className?: string;
  variant?: "full" | "mono" | "invert";
  form?: "outline" | "solid";
  title?: string;
}) {
  // Unique per variant *and* form so two marks on one page can't collide.
  const uid = `pv-${variant}-${form}`;
  const chevron = "M 16 16 L 58 50 L 16 84";

  const paint =
    variant === "full"
      ? `url(#${uid}-grad)`
      : variant === "invert"
        ? "var(--brand-mist)"
        : "currentColor";

  // Violet at the top of the mark falling to blue at the bottom, matching the
  // book artwork. Unlike the previous mark this does not flip per theme — it
  // is legible on light and dark alike.
  const gradient = variant === "full" && (
    <linearGradient id={`${uid}-grad`} x1="0.15" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stopColor="var(--brand-violet)" />
      <stop offset="100%" stopColor="var(--brand-blue)" />
    </linearGradient>
  );

  return (
    <svg
      viewBox="0 0 74 100"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {form === "solid" ? (
        <>
          <defs>{gradient}</defs>
          <path
            d={chevron}
            fill="none"
            stroke={paint}
            strokeWidth="26.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <defs>
            {gradient}
            <mask id={`${uid}-mask`}>
              <path
                d={chevron}
                fill="none"
                stroke="#fff"
                strokeWidth="32"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={chevron}
                fill="none"
                stroke="#000"
                strokeWidth="21.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </mask>
          </defs>

          <rect
            width="74"
            height="100"
            fill={paint}
            mask={`url(#${uid}-mask)`}
          />
        </>
      )}
    </svg>
  );
}

/**
 * Full lockup: mark + wordmark. Mirrors the book's primary horizontal lockup,
 * sized for UI chrome.
 *
 * `showTagline` adds the letterspaced SOLUTIONS line beneath the wordmark —
 * the book's stacked lockup. It is off by default because at header size the
 * tagline sets below ~7px and turns to mud.
 */
export function Logo({
  className,
  showWordmark = true,
  showTagline = false,
}: {
  className?: string;
  showWordmark?: boolean;
  showTagline?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark className="h-8 w-auto" title="Provision Solutions" />
      {showWordmark && (
        <span className="inline-flex flex-col justify-center">
          <span
            className={`${sora.className} text-[1.15rem] font-semibold tracking-tight leading-none`}
          >
            Provision
          </span>
          {showTagline && (
            <span
              className={`${sora.className} mt-1 text-[0.5rem] font-semibold uppercase leading-none tracking-[0.42em] text-brand`}
            >
              Solutions
            </span>
          )}
        </span>
      )}
    </span>
  );
}
