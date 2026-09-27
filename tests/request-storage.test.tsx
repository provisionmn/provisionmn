import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Pool as RealPool, PoolClient } from "pg";

// Only replace pool construction: all queries and transactions use real PostgreSQL.
const state = vi.hoisted(() => ({ pool: undefined as unknown as RealPool }));
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

const connectionString = process.env.PG_INTEGRATION_URL;
if (process.env.CI === "true" && !connectionString) {
  throw new Error("CI requires PG_INTEGRATION_URL; PostgreSQL tests must not be skipped");
}

// A dedicated database AND a unique schema keep runs isolated across connections.
// No public fallback: a missing test table must fail rather than use another schema.
const schema = `request_storage_${randomUUID().replaceAll("-", "")}`;
let pool: RealPool;
let admin: RealPool;
const data = submissionSchema.parse({
  kind: "contact",
  name: "O'Brien",
  email: "db-test@example.com",
  description: "Customer's portal; SELECT 1 -- user text",
});

async function counts() {
  const result = await pool.query(`SELECT
    (SELECT count(*)::int FROM form_requests) AS requests,
    (SELECT count(*)::int FROM form_notifications) AS notifications`);
  return result.rows[0];
}

// Hold intake's advisory lock until every contender is waiting in a different
// backend. Promise.all alone can pass even when a max:1 pool serializes the work.
async function contend(tasks: (() => Promise<string>)[]) {
  const blocker = await admin.connect();
  let pending: Promise<PromiseSettledResult<string>[]> | undefined;
  try {
    await blocker.query("BEGIN");
    await blocker.query("SELECT pg_advisory_xact_lock(641001)");
    pending = Promise.allSettled(tasks.map((task) => task()));
    await vi.waitFor(async () => {
      const result = await admin.query(
        `SELECT count(DISTINCT l.pid)::int AS waiting
         FROM pg_locks l JOIN pg_stat_activity a ON a.pid = l.pid
         WHERE a.application_name = $1 AND l.locktype = 'advisory'
           AND l.classid = 0 AND l.objid = 641001 AND NOT l.granted`,
        [schema],
      );
      expect(result.rows[0].waiting).toBe(tasks.length);
    }, { timeout: 3000, interval: 20 });
  } finally {
    await blocker.query("ROLLBACK");
    blocker.release();
    // Drain all operations even when the concurrency assertion fails.
    if (pending) await pending;
  }
  return (await pending)!;
}

function expectOutcomes(results: PromiseSettledResult<string>[], accepted: number, status: number) {
  expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(accepted);
  const rejected = results.filter((result) => result.status === "rejected");
  expect(rejected).toHaveLength(results.length - accepted);
  for (const result of rejected) expect(result.reason).toMatchObject({ status });
}

describe.skipIf(!connectionString)("PostgreSQL request storage and outbox", () => {
  beforeAll(async () => {
    if (new URL(connectionString!).pathname !== "/provisionmn_test") {
      throw new Error("PG_INTEGRATION_URL must use the disposable provisionmn_test database");
    }
    const actual = await vi.importActual<typeof import("pg")>("pg");
    const config = {
      connectionString,
      options: `-c search_path=${schema}`,
      connectionTimeoutMillis: 5000,
      statement_timeout: 5000,
    };
    admin = new actual.Pool({ ...config, max: 2 });
    pool = new actual.Pool({ ...config, max: 4, application_name: schema });
    state.pool = pool;
    vi.stubEnv("DATABASE_URL", connectionString!);
    await admin.query(`CREATE SCHEMA "${schema}"`);
    const client = await admin.connect();
    try {
      // Exercise the real schema, indexes and constraints, not a test-only copy.
      for (const migration of ["001_form_requests.sql", "002_form_notifications.sql"]) {
        await client.query(await readFile(`deploy/migrations/${migration}`, "utf8"));
      }
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE form_notifications, form_requests");
  });

  afterAll(async () => {
    try {
      await pool?.end();
      await admin?.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    } finally {
      await admin?.end();
      vi.unstubAllEnvs();
    }
  });

  it("uses four distinct sessions with the same isolated schema", async () => {
    const clients: PoolClient[] = [];
    try {
      for (let i = 0; i < 4; i++) clients.push(await pool.connect());
      const results = await Promise.all(clients.map((client) => client.query(
        "SELECT pg_backend_pid() AS pid, current_schema() AS schema, current_schemas(false) AS schemas",
      )));
      expect(new Set(results.map((result) => result.rows[0].pid)).size).toBe(4);
      for (const result of results) {
        expect(result.rows[0]).toMatchObject({ schema, schemas: `{${schema}}` });
      }
    } finally {
      clients.forEach((client) => client.release());
    }
  }, 15000);

  it("deduplicates simultaneous retries and commits quoted payload with one notification", async () => {
    const key = randomUUID();
    const results = await contend(Array.from({ length: 4 }, () => () => saveSubmission(key, data)));
    expect(results.every((result) => result.status === "fulfilled")).toBe(true);
    const ids = results.map((result) => result.status === "fulfilled" ? result.value : undefined);
    expect(new Set(ids).size).toBe(1);
    expect(await counts()).toEqual({ requests: 1, notifications: 1 });
    const rows = await pool.query(`SELECT r.id, r.payload, n.request_id
      FROM form_requests r JOIN form_notifications n ON n.request_id = r.id`);
    expect(rows.rows).toEqual([{ id: ids[0], payload: data, request_id: ids[0] }]);
  });

  it("accepts one payload and rejects simultaneous conflicting payloads for the same key", async () => {
    const key = randomUUID();
    const payloads = Array.from({ length: 4 }, (_, index) => ({ ...data, name: `Contender ${index}` }));
    const results = await contend(payloads.map((payload) => () => saveSubmission(key, payload)));
    expectOutcomes(results, 1, 409);
    const winner = results.findIndex((result) => result.status === "fulfilled");
    const row = (await pool.query("SELECT payload FROM form_requests")).rows[0];
    expect(row.payload).toEqual(payloads[winner]);
    expect(await counts()).toEqual({ requests: 1, notifications: 1 });
    await expect(saveSubmission(key, payloads[winner])).resolves.toBe(
      (results[winner] as PromiseFulfilledResult<string>).value,
    );
  });

  it("enforces the per-sender limit across simultaneous transactions without rejecting retries", async () => {
    const key = randomUUID();
    const original = await saveSubmission(key, data);
    for (let i = 0; i < 2; i++) await saveSubmission(randomUUID(), data);
    const results = await contend(Array.from({ length: 4 }, () => () => saveSubmission(randomUUID(), data)));
    expectOutcomes(results, 2, 429);
    expect(await counts()).toEqual({ requests: 5, notifications: 5 });
    await expect(saveSubmission(key, data)).resolves.toBe(original);
    await expect(saveSubmission(key, { ...data, name: "Changed" })).rejects.toMatchObject({ status: 409 });
    await expect(saveSubmission(randomUUID(), { ...data, email: "another@example.com" })).resolves.toEqual(expect.any(String));
  });

  it("enforces the global limit across simultaneous requests from different senders", async () => {
    await pool.query(`WITH seeded AS (
      INSERT INTO form_requests (id, idempotency_key, payload_hash, kind, email, payload)
      SELECT gen_random_uuid(), gen_random_uuid(), 'seed', 'contact',
             'seed-' || n || '@example.com', $1::jsonb
      FROM generate_series(1, 99) n RETURNING id
    ) INSERT INTO form_notifications (request_id) SELECT id FROM seeded`, [JSON.stringify(data)]);
    const results = await contend(Array.from({ length: 4 }, (_, index) => () =>
      saveSubmission(randomUUID(), { ...data, email: `global-${index}@example.com` })));
    expectOutcomes(results, 1, 429);
    expect(await counts()).toEqual({ requests: 100, notifications: 100 });
  });

  it("keeps the request invisible to other sessions until the outbox insert can commit", async () => {
    const blocker = await admin.connect();
    let pending: Promise<PromiseSettledResult<string>[]> | undefined;
    try {
      await blocker.query("BEGIN");
      // SHARE blocks INSERT but permits the observer's SELECT on the outbox.
      await blocker.query("LOCK TABLE form_notifications IN SHARE MODE");
      const pid = (await blocker.query("SELECT pg_backend_pid() AS pid")).rows[0].pid;
      pending = Promise.allSettled([saveSubmission(randomUUID(), data)]);
      await vi.waitFor(async () => {
        const waiting = await admin.query(`SELECT pid FROM pg_stat_activity
          WHERE application_name = $1 AND $2::int = ANY(pg_blocking_pids(pid))`, [schema, pid]);
        expect(waiting.rows).toHaveLength(1);
      }, { timeout: 3000, interval: 20 });
      expect(await counts()).toEqual({ requests: 0, notifications: 0 });
    } finally {
      await blocker.query("ROLLBACK");
      blocker.release();
      if (pending) await pending;
    }
    expect(await pending).toEqual([{ status: "fulfilled", value: expect.any(String) }]);
    expect(await counts()).toEqual({ requests: 1, notifications: 1 });
  });

  it("rolls back the request when enqueue fails and permits retrying the same key", async () => {
    const key = randomUUID();
    await pool.query("ALTER TABLE form_notifications ADD CONSTRAINT test_enqueue_failure CHECK (false)");
    try {
      await expect(saveSubmission(key, data)).rejects.toMatchObject({ code: "23514" });
      expect(await counts()).toEqual({ requests: 0, notifications: 0 });
    } finally {
      await pool.query("ALTER TABLE form_notifications DROP CONSTRAINT test_enqueue_failure");
    }
    await saveSubmission(key, data);
    expect(await counts()).toEqual({ requests: 1, notifications: 1 });
  });

  it("skips a locked notification while another worker delivers a different row", async () => {
    const ids = [await saveSubmission(randomUUID(), data), await saveSubmission(randomUUID(), data)];
    let releaseSend!: () => void;
    const held = new Promise<void>((resolve) => { releaseSend = resolve; });
    const firstSend = vi.fn<(id: string) => Promise<void>>(() => held);
    const firstDelivery = deliverNextNotification(firstSend);
    // Attach a rejection handler immediately; still assert the result below.
    const drained = Promise.allSettled([firstDelivery]);
    const secondSend = vi.fn().mockResolvedValue(undefined);
    try {
      await vi.waitFor(() => expect(firstSend).toHaveBeenCalledTimes(1), { timeout: 3000 });
      // These must complete BEFORE releasing the first worker's row lock.
      expect(await deliverNextNotification(secondSend)).toBe(true);
      expect(await deliverNextNotification(secondSend)).toBe(false);
      expect(secondSend).toHaveBeenCalledTimes(1);
      const sentIds = [firstSend.mock.calls[0][0], secondSend.mock.calls[0][0]];
      expect(new Set(sentIds)).toEqual(new Set(ids));
      expect((await pool.query("SELECT * FROM form_notifications WHERE sent_at IS NOT NULL")).rows).toHaveLength(1);
    } finally {
      releaseSend();
      await drained;
    }
    expect(await firstDelivery).toBe(true);
    expect((await pool.query("SELECT attempts, sent_at FROM form_notifications")).rows)
      .toEqual([expect.objectContaining({ attempts: 1, sent_at: expect.any(Date) }),
        expect.objectContaining({ attempts: 1, sent_at: expect.any(Date) })]);
    expect(await deliverNextNotification(secondSend)).toBe(false);
  }, 15000);

  it("persists retry backoff, succeeds after a retry, and stops after six failures", async () => {
    await saveSubmission(randomUUID(), data);
    const send = vi.fn().mockRejectedValueOnce(new Error("SMTP down")).mockResolvedValue(undefined);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await deliverNextNotification(send)).toBe(true);
    const retry = (await pool.query(`SELECT attempts, sent_at, failed_at,
      next_attempt_at > now() AS delayed FROM form_notifications`)).rows[0];
    expect(retry).toEqual({ attempts: 1, sent_at: null, failed_at: null, delayed: true });
    expect(await deliverNextNotification(send)).toBe(false);
    expect(send).toHaveBeenCalledTimes(1);
    await pool.query("UPDATE form_notifications SET next_attempt_at = now()");
    expect(await deliverNextNotification(send)).toBe(true);
    expect((await pool.query("SELECT attempts, sent_at, failed_at FROM form_notifications")).rows[0])
      .toEqual({ attempts: 2, sent_at: expect.any(Date), failed_at: null });

    await saveSubmission(randomUUID(), { ...data, email: "failure@example.com" });
    const fail = vi.fn().mockRejectedValue(new Error("SMTP down"));
    for (let attempt = 1; attempt <= 6; attempt++) {
      expect(await deliverNextNotification(fail)).toBe(true);
      const row = (await pool.query(`SELECT attempts, sent_at, failed_at,
        next_attempt_at > now() AS delayed FROM form_notifications WHERE sent_at IS NULL`)).rows[0];
      expect(row).toEqual({ attempts: attempt, sent_at: null,
        failed_at: attempt === 6 ? expect.any(Date) : null, delayed: true });
      expect(await deliverNextNotification(fail)).toBe(false);
      await pool.query("UPDATE form_notifications SET next_attempt_at = now() WHERE sent_at IS NULL");
    }
    expect(await deliverNextNotification(fail)).toBe(false);
    expect(fail).toHaveBeenCalledTimes(6);
    expect(log).toHaveBeenCalledTimes(7);
    expect(await counts()).toEqual({ requests: 2, notifications: 2 });
  });
});
