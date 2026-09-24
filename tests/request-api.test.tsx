import { beforeEach, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/requests/route";
import {
  saveSubmission,
  submissionSchema,
  SubmissionError,
} from "../src/server/requests";

vi.mock("../src/server/requests", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../src/server/requests")>();
  return { ...original, saveSubmission: vi.fn() };
});
const valid = {
  kind: "contact",
  name: "Test",
  email: "test@example.com",
  description: "A new order management website",
};
const id = "a13bd758-91c2-4db6-adc5-0e6de1575745";
function request(body: unknown = valid, origin = "https://provision.mn") {
  return new Request("https://provision.mn/api/requests", {
    method: "POST",
    headers: {
      origin,
      "content-type": "application/json",
      "idempotency-key": id,
    },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.mocked(saveSubmission).mockReset();
  vi.stubEnv("APP_ORIGIN", "https://provision.mn");
});
it("persists only validated fields and returns the database reference", async () => {
  vi.mocked(saveSubmission).mockResolvedValue(id);
  const response = await POST(request({ ...valid, password: "not stored" }));
  expect(response.status).toBe(201);
  expect(await response.json()).toEqual({ id });
  expect(vi.mocked(saveSubmission).mock.calls[0][1]).not.toHaveProperty(
    "password",
  );
});
it.each([
  { ...valid, email: "invalid" },
  { ...valid, description: "short" },
  { ...valid, kind: "quote", projectType: "invalid", phone: "12345678" },
  { ...valid, features: Array(21).fill("feature") },
  { ...valid, estimatedPrice: -1 },
])("rejects invalid payloads before accessing the database", async (body) => {
  expect((await POST(request(body))).status).toBe(400);
  expect(saveSubmission).not.toHaveBeenCalled();
});
it("rejects cross-origin, malformed and oversized requests", async () => {
  expect((await POST(request(valid, "https://other.example"))).status).toBe(
    403,
  );
  expect(
    (await POST(request({ ...valid, description: "a".repeat(17000) }))).status,
  ).toBe(413);
  const malformed = request();
  malformed.headers.delete("idempotency-key");
  expect((await POST(malformed)).status).toBe(400);
  expect(saveSubmission).not.toHaveBeenCalled();
});
it("returns retryable failure without leaking database details", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(saveSubmission).mockRejectedValue(
    new Error("private connection string"),
  );
  const response = await POST(request());
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ error: "unavailable" });
});
it("returns rate limit and idempotency conflicts", async () => {
  vi.mocked(saveSubmission).mockRejectedValue(
    new SubmissionError(429, "rate_limited"),
  );
  const response = await POST(request());
  expect(response.status).toBe(429);
  expect(response.headers.get("retry-after")).toBe("3600");
  vi.mocked(saveSubmission).mockRejectedValue(
    new SubmissionError(409, "conflict"),
  );
  expect((await POST(request())).status).toBe(409);
});
it("normalizes input and requires a phone for quotes", () => {
  expect(
    submissionSchema.parse({
      ...valid,
      name: " Test ",
      email: "TEST@example.com",
    }),
  ).toMatchObject({ name: "Test", email: "test@example.com" });
  expect(
    submissionSchema.safeParse({
      ...valid,
      kind: "quote",
      projectType: "website",
    }).success,
  ).toBe(false);
});
