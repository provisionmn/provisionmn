import { verifyTurnstile } from "../../../server/turnstile";
import { z } from "zod";
import {
  saveSubmission,
  submissionSchema,
  SubmissionError,
} from "../../../server/requests";

export const runtime = "nodejs";
const MAX_BYTES = 16 * 1024;
const respond = (body: object, status: number) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(status === 429 ? { "Retry-After": "3600" } : {}),
    },
  });

export async function POST(request: Request) {
  const expectedOrigin = process.env.APP_ORIGIN || "https://provision.mn";
  if (request.headers.get("origin") !== expectedOrigin)
    return respond({ error: "forbidden" }, 403);
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    return respond({ error: "invalid_content_type" }, 415);
  const key = request.headers.get("idempotency-key");
  if (!z.uuid().safeParse(key).success)
    return respond({ error: "invalid_request" }, 400);
  let input: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return respond({ error: "invalid_request" }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        return respond({ error: "too_large" }, 413);
      }
      chunks.push(value);
    }
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return respond({ error: "invalid_request" }, 400);
  }
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) return respond({ error: "invalid_request" }, 400);
  const token =
    typeof input === "object" && input !== null && "captchaToken" in input
      ? input.captchaToken
      : undefined;
  const verification = await verifyTurnstile(token);
  if (verification !== "ok")
    return respond(
      { error: verification === "invalid" ? "captcha_failed" : "unavailable" },
      verification === "invalid" ? 403 : 503,
    );
  try {
    const id = await saveSubmission(key!, parsed.data);
    return respond({ id }, 201);
  } catch (error) {
    if (error instanceof SubmissionError)
      return respond({ error: error.code }, error.status);
    // Never return or log connection strings, SQL errors or submitted personal data.
    console.error("Form request could not be saved");
    return respond({ error: "unavailable" }, 503);
  }
}
