import { createHash, randomUUID } from "node:crypto";
import { Pool } from "pg";
import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().default("");
const amount = z.number().finite().min(0).max(1e12).optional();
export const submissionSchema = z
  .object({
    kind: z.enum(["contact", "quote"]),
    name: z.string().trim().min(1).max(120),
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),
    phone: optionalText(40),
    company: optionalText(200),
    projectType: optionalText(120),
    description: z.string().trim().min(20).max(5000),
    budget: optionalText(80),
    timeline: optionalText(80),
    teamSize: optionalText(80),
    complexity: optionalText(80),
    features: z.array(z.string().max(80)).max(20).optional().default([]),
    // Client estimates are context only, never an authoritative price.
    estimatedPrice: amount,
    estimatedHours: amount,
    estimatedWeeks: amount,
  })
  .superRefine((data, ctx) => {
    if (data.kind === "quote") {
      if (!["website", "mobile", "erp", "custom"].includes(data.projectType))
        ctx.addIssue({
          code: "custom",
          path: ["projectType"],
          message: "Invalid project type",
        });
      if (!/^\+?[\d\s-]{6,}$/.test(data.phone))
        ctx.addIssue({
          code: "custom",
          path: ["phone"],
          message: "Invalid phone",
        });
    }
  });
export type Submission = z.infer<typeof submissionSchema>;
export class SubmissionError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}
let pool: Pool | undefined;
function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("Database unavailable");
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 4,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      statement_timeout: 5000,
    });
    pool.on("error", () => console.error("Database pool connection error"));
  }
  return pool;
}

export async function saveSubmission(key: string, data: Submission) {
  const client = await getPool().connect();
  const payload = JSON.stringify(data);
  const hash = createHash("sha256").update(payload).digest("hex");
  try {
    await client.query("BEGIN");
    // Serialize this small site's intake to keep retry and rate limits atomic,
    // including across processes/restarts. No requests or IPs are kept in memory.
    await client.query("SELECT pg_advisory_xact_lock(641001)");
    const existing = await client.query<{ id: string; payload_hash: string }>(
      "SELECT id, payload_hash FROM form_requests WHERE idempotency_key = $1",
      [key],
    );
    if (existing.rows[0]) {
      if (existing.rows[0].payload_hash !== hash)
        throw new SubmissionError(409, "conflict");
      await client.query("COMMIT");
      return existing.rows[0].id;
    }
    const count = await client.query<{ total: number; sender: number }>(
      `SELECT count(*)::int AS total, count(*) FILTER (WHERE email = $1)::int AS sender
       FROM form_requests WHERE created_at > now() - interval '1 hour'`,
      [data.email],
    );
    if (count.rows[0].total >= 100 || count.rows[0].sender >= 5)
      throw new SubmissionError(429, "rate_limited");
    const id = randomUUID();
    await client.query(
      "INSERT INTO form_requests (id, idempotency_key, payload_hash, kind, email, payload) VALUES ($1, $2, $3, $4, $5, $6::jsonb)",
      [id, key, hash, data.kind, data.email, payload],
    );
    await client.query("COMMIT");
    return id;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
