import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { verifyTurnstile } from "../src/server/turnstile";
const originalFetch = globalThis.fetch;
beforeEach(() => {
  vi.stubEnv("TURNSTILE_SECRET_KEY", "test-secret");
  vi.stubEnv("APP_ORIGIN", "https://provision.mn");
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.unstubAllEnvs();
});
it("fails closed for missing config/token and oversized tokens without a network call", async () => {
  expect(await verifyTurnstile("")).toBe("invalid");
  expect(await verifyTurnstile("a".repeat(2049))).toBe("invalid");
  vi.stubEnv("TURNSTILE_SECRET_KEY", "");
  expect(await verifyTurnstile("token")).toBe("unavailable");
  expect(fetch).not.toHaveBeenCalled();
});
it.each([
  [false, "provision.mn", "form_request", "invalid"],
  [true, "attacker.example", "form_request", "invalid"],
  [true, "provision.mn", "login", "invalid"],
  [true, "provision.mn", "form_request", "ok"],
])(
  "checks success, hostname and action (%s, %s, %s)",
  async (success, hostname, action, expected) => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success, hostname, action }),
    } as Response);
    expect(await verifyTurnstile("token")).toBe(expected);
    expect(
      JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string),
    ).toEqual({ secret: "test-secret", response: "token" });
  },
);
it("fails closed on Cloudflare timeout or HTTP failure", async () => {
  vi.mocked(fetch).mockRejectedValueOnce(new Error("timeout"));
  expect(await verifyTurnstile("token")).toBe("unavailable");
  vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);
  expect(await verifyTurnstile("token")).toBe("unavailable");
});
