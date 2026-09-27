import { createHash, randomUUID } from "node:crypto";
import { Pool } from "pg";
import type { Submission } from "../shared/submission";
export { submissionSchema, type Submission } from "../shared/submission";

export class SubmissionError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}
let pool: Pool | undefined;
export function getPool() {
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
    // Commit the notification with the request; SMTP never delays the response.
    await client.query(
      "INSERT INTO form_notifications (request_id) VALUES ($1)",
      [id],
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
