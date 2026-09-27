import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { Pool as RealPool } from "pg";

// Optional real PostgreSQL test. All data lives in one session's TEMP table;
// this never writes to the production form_requests table.
const state = vi.hoisted(() => ({ pool: undefined as unknown as InstanceType<typeof RealPool> }));
vi.mock("pg", async (importOriginal) => {
  const actual = await importOriginal<typeof import("pg")>();
  return {
    ...actual,
    Pool: class {
      constructor() {
        return state.pool;
      }
    },
  };
});
import { saveSubmission, submissionSchema } from "../src/server/requests";
import { deliverNextNotification } from "../src/server/notifications";
const enabled = Boolean(process.env.PG_INTEGRATION_URL);
let pool: InstanceType<typeof RealPool>;
beforeAll(async () => {
  if (!enabled) return;
  const actual = await vi.importActual<typeof import("pg")>("pg");
  pool = new actual.Pool({
    connectionString: process.env.PG_INTEGRATION_URL,
    max: 1,
  });
  state.pool = pool;
  vi.stubEnv("DATABASE_URL", process.env.PG_INTEGRATION_URL!);
  await pool.query(`CREATE TEMP TABLE form_requests (
    id uuid PRIMARY KEY, idempotency_key uuid UNIQUE NOT NULL, payload_hash text NOT NULL,
    kind text NOT NULL, email text NOT NULL, payload jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now())`);
  await pool.query(`CREATE TEMP TABLE form_notifications (
    request_id uuid PRIMARY KEY REFERENCES form_requests(id), attempts integer NOT NULL DEFAULT 0,
    next_attempt_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz, failed_at timestamptz)`);
});
afterAll(async () => {
  if (enabled) await pool.end();
});
it.skipIf(!enabled)(
  "saves quoted text safely, deduplicates concurrent retries and enforces limits",
  async () => {
    const data = submissionSchema.parse({
      kind: "contact",
      name: "O'Brien",
      email: "db-test@example.com",
      description: "Customer's portal; SELECT 1 -- user text",
    });
    const key = crypto.randomUUID();
    const ids = await Promise.all([
      saveSubmission(key, data),
      saveSubmission(key, data),
    ]);
    expect(ids[0]).toBe(ids[1]);
    const rows = await pool.query("SELECT payload FROM form_requests");
    expect(rows.rows).toHaveLength(1);
    expect(rows.rows[0].payload.name).toBe("O'Brien");
    expect((await pool.query("SELECT * FROM form_notifications")).rows).toHaveLength(1);
    const send = vi.fn().mockRejectedValueOnce(new Error("SMTP down")).mockResolvedValue(undefined);
    await deliverNextNotification(send);
    expect((await pool.query("SELECT attempts, sent_at, failed_at FROM form_notifications")).rows[0])
      .toEqual({ attempts: 1, sent_at: null, failed_at: null });
    expect(await deliverNextNotification(send)).toBe(false);
    await pool.query("UPDATE form_notifications SET next_attempt_at = now()");
    await Promise.all([deliverNextNotification(send), deliverNextNotification(send)]);
    expect(send).toHaveBeenCalledTimes(2);
    expect((await pool.query("SELECT sent_at FROM form_notifications")).rows[0].sent_at).not.toBeNull();
    // A permanently failing notification stops after the sixth attempt.
    await pool.query("UPDATE form_notifications SET sent_at = NULL, attempts = 5, next_attempt_at = now()");
    await deliverNextNotification(vi.fn().mockRejectedValue(new Error("SMTP down")));
    const failed = (await pool.query("SELECT attempts, failed_at FROM form_notifications")).rows[0];
    expect(failed.attempts).toBe(6);
    expect(failed.failed_at).not.toBeNull();
    expect(await deliverNextNotification(send)).toBe(false);
    // Queue insertion failure must roll back the request in the same transaction.
    await pool.query("ALTER TABLE form_notifications ADD CONSTRAINT test_enqueue_failure CHECK (false) NOT VALID");
    await expect(saveSubmission(crypto.randomUUID(), data)).rejects.toThrow();
    expect((await pool.query("SELECT * FROM form_requests")).rows).toHaveLength(1);
    await pool.query("ALTER TABLE form_notifications DROP CONSTRAINT test_enqueue_failure");
    await expect(
      saveSubmission(key, { ...data, name: "Changed" }),
    ).rejects.toMatchObject({ status: 409 });
    for (let i = 0; i < 4; i++) await saveSubmission(crypto.randomUUID(), data);
    await expect(
      saveSubmission(crypto.randomUUID(), data),
    ).rejects.toMatchObject({ status: 429 });
    expect(
      (await pool.query("SELECT count(*)::int AS count FROM form_requests"))
        .rows[0].count,
    ).toBe(5);
  },
);
