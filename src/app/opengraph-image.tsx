import { ImageResponse } from "next/og";

export const alt = "Provision Solutions — engineering studio, Ulaanbaatar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Latin-only by design: this renders through satori with its built-in font,
 * which has no Cyrillic. Setting Mongolian copy here would fall back
 * glyph-by-glyph, so the card carries the brand name and the stack instead —
 * both of which are Latin on the site too.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          backgroundColor: "#0B0F1A",
          backgroundImage:
            "radial-gradient(ellipse 900px 500px at 50% -10%, rgba(109,70,255,0.30), transparent)",
          color: "#E6E8EF",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 6,
            color: "#A78BFF",
          }}
        >
          PROVISION.MN
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              width: 96,
              height: 5,
              borderRadius: 3,
              marginBottom: 36,
              backgroundImage: "linear-gradient(90deg, #6D46FF, #2563EB)",
            }}
          />
          <div style={{ display: "flex", fontSize: 82, lineHeight: 1.05 }}>
            Every engineering layer,
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 82,
              lineHeight: 1.05,
              color: "#A78BFF",
            }}
          >
            one team.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#9AA3B8",
          }}
        >
          Fullstack · Mobile · AI · DevOps · Odoo · UX/UI · RPA
        </div>
      </div>
    ),
    size,
  );
}
