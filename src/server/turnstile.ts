export async function verifyTurnstile(
  token: unknown,
): Promise<"ok" | "invalid" | "unavailable"> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return "unavailable";
  if (typeof token !== "string" || token.length === 0 || token.length > 2048)
    return "invalid";
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, response: token }),
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!response.ok) return "unavailable";
    const result = await response.json();
    const hostname = new URL(process.env.APP_ORIGIN || "https://provision.mn")
      .hostname;
    return result.success === true &&
      result.hostname === hostname &&
      result.action === "form_request"
      ? "ok"
      : "invalid";
  } catch {
    return "unavailable";
  }
}
