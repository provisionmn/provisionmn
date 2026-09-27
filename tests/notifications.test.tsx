import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  query: vi.fn(), release: vi.fn(), sendMail: vi.fn(), close: vi.fn(), createTransport: vi.fn(),
}));
vi.mock("../src/server/requests", () => ({
  getPool: () => ({ connect: async () => ({ query: mocks.query, release: mocks.release }) }),
}));
vi.mock("nodemailer", () => ({ default: { createTransport: mocks.createTransport } }));
import { deliverNextNotification, mailConfig, notificationMessage, sendNotification } from "../src/server/notifications";
import type { Submission } from "../src/server/requests";

const id = "a13bd758-91c2-4db6-adc5-0e6de1575745";
const data: Submission = {
  kind: "quote", name: "<b>Customer</b>", email: "customer@example.com", phone: "99112233",
  company: "Example", projectType: "website", description: "Project details with <script>text</script>",
  budget: "", timeline: "", teamSize: "", complexity: "", features: ["payments"], estimatedPrice: 0,
};
beforeEach(() => {
  mocks.query.mockReset();
  mocks.query.mockImplementation(async (sql: string) => ({
    rows: sql.includes("SELECT n.request_id") ? [{ request_id: id, attempts: 0, payload: data }] : [],
  }));
  mocks.createTransport.mockReturnValue({ sendMail: mocks.sendMail, close: mocks.close });
  mocks.sendMail.mockResolvedValue({ accepted: ["owner@example.com"], rejected: [] });
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubEnv("SMTP_USER", "sender@gmail.com");
  vi.stubEnv("SMTP_PASSWORD", "abcd efgh ijkl mnop");
  vi.stubEnv("MAIL_TO", "owner@example.com");
});
afterEach(() => vi.unstubAllEnvs());

it("uses TLS Gmail SMTP, fixed recipient/from and customer Reply-To with plain text", async () => {
  await sendNotification(id, data);
  expect(mocks.createTransport).toHaveBeenCalledWith(expect.objectContaining({
    host: "smtp.gmail.com", port: 465, secure: true,
    auth: { user: "sender@gmail.com", pass: "abcdefghijklmnop" },
  }));
  const message = mocks.sendMail.mock.calls[0][0];
  expect(message).toMatchObject({
    to: "owner@example.com", from: { address: "sender@gmail.com" },
    replyTo: { address: data.email }, messageId: `<form-${id}@provision.mn>`,
    disableFileAccess: true, disableUrlAccess: true,
  });
  expect(message.html).toBeUndefined();
  expect(message.text).toContain(data.description);
  expect(message.text).toContain("Тооцоолсон үнэ (₮): 0");
  expect(message.subject).toContain("Үнийн саналын хүсэлт");
  expect(notificationMessage(id, { ...data, kind: "contact" }, mailConfig()).subject).toContain("Холбоо барих хүсэлт");
  expect(mocks.close).toHaveBeenCalled();
});
it("rejects missing configuration before connecting to SMTP", async () => {
  vi.stubEnv("SMTP_PASSWORD", "");
  await expect(sendNotification(id, data)).rejects.toThrow();
  expect(mocks.sendMail).not.toHaveBeenCalled();
});
it("treats a rejected recipient as a delivery failure", async () => {
  mocks.sendMail.mockResolvedValue({ accepted: [], rejected: ["owner@example.com"] });
  await expect(sendNotification(id, data)).rejects.toThrow("Mail rejected");
  expect(mocks.close).toHaveBeenCalled();
});
it("marks success only after sending, commits and releases the row lock", async () => {
  const send = vi.fn(async () => {
    expect(mocks.query.mock.calls.some(([sql]) => sql.includes("SET attempts"))).toBe(false);
  });
  expect(await deliverNextNotification(send)).toBe(true);
  expect(send).toHaveBeenCalledWith(id, data);
  expect(mocks.query).toHaveBeenCalledWith(expect.stringContaining("SKIP LOCKED"));
  expect(mocks.query).toHaveBeenCalledWith(expect.stringContaining("sent_at = now()"), [id]);
  expect(mocks.query).toHaveBeenLastCalledWith("COMMIT");
  expect(mocks.release).toHaveBeenCalled();
});
it.each([[0, 60], [1, 300], [4, 43200], [5, 43200]])("schedules retry after attempt %i without exposing SMTP errors", async (attempts, delay) => {
  mocks.query.mockImplementation(async (sql: string) => ({
    rows: sql.includes("SELECT n.request_id") ? [{ request_id: id, attempts, payload: data }] : [],
  }));
  await deliverNextNotification(vi.fn().mockRejectedValue(new Error("secret credentials")));
  expect(mocks.query).toHaveBeenCalledWith(expect.stringContaining("failed_at = CASE WHEN attempts >= 5"), [id, delay]);
  expect(console.error).toHaveBeenCalledWith("Form notification delivery failed", id);
  expect(mocks.query).toHaveBeenLastCalledWith("COMMIT");
});
it("does not send when no unsent due notification is available", async () => {
  mocks.query.mockResolvedValue({ rows: [] });
  const send = vi.fn();
  expect(await deliverNextNotification(send)).toBe(false);
  expect(send).not.toHaveBeenCalled();
});
it("rolls back and releases the connection on database failure", async () => {
  mocks.query.mockRejectedValueOnce(new Error("DB unavailable"));
  const send = vi.fn();
  await expect(deliverNextNotification(send)).rejects.toThrow("DB unavailable");
  expect(send).not.toHaveBeenCalled();
  expect(mocks.query).toHaveBeenLastCalledWith("ROLLBACK");
  expect(mocks.release).toHaveBeenCalled();
});
