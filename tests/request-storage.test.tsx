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
