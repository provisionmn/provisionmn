import nodemailer from "nodemailer";
import { z } from "zod";
import { getPool, type Submission } from "./requests";

const configSchema = z.object({
  user: z.email(),
  password: z.string().min(1),
  recipient: z.email(),
});

export function mailConfig() {
  return configSchema.parse({
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD?.replace(/\s/g, ""),
    recipient: process.env.MAIL_TO,
  });
}

type MailConfig = ReturnType<typeof mailConfig>;
type Notification = { request_id: string; attempts: number; payload: Submission };

export function notificationMessage(id: string, data: Submission, config: MailConfig) {
  const fields: [string, unknown][] = [
    ["Хүсэлтийн дугаар", id],
    ["Нэр", data.name],
    ["Имэйл", data.email],
    ["Утас", data.phone],
    ["Байгууллага", data.company],
    ["Төслийн төрөл", data.projectType],
    ["Төсөв", data.budget],
    ["Хугацаа", data.timeline],
    ["Багийн хэмжээ", data.teamSize],
    ["Төвөгшил", data.complexity],
    ["Нэмэлт боломжууд", data.features.join(", ")],
    ["Тооцоолсон үнэ (₮)", data.estimatedPrice],
    ["Тооцоолсон цаг", data.estimatedHours],
    ["Тооцоолсон долоо хоног", data.estimatedWeeks],
  ];
  return {
    from: { name: "Provision.mn", address: config.user },
    to: config.recipient,
    replyTo: { address: data.email },
    // Stable across retries; SMTP cannot guarantee exactly-once delivery.
    messageId: `<form-${id}@provision.mn>`,
    subject: `Provision.mn — ${data.kind === "quote" ? "Үнийн саналын хүсэлт" : "Холбоо барих хүсэлт"} #${id}`,
    text: fields
      .filter(([, value]) => value !== "" && value !== undefined)
      .map(([label, value]) => `${label}: ${value}`)
      .join("\n") + `\n\nТөслийн тайлбар:\n${data.description}\n\nТооцоолуурын дүн нь урьдчилсан тооцоо бөгөөд албан ёсны үнийн санал биш.`,
    disableFileAccess: true,
    disableUrlAccess: true,
  };
}

export async function sendNotification(id: string, data: Submission) {
  const config = mailConfig();
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: config.user, pass: config.password },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    logger: false,
    debug: false,
  });
  try {
    const result = await transport.sendMail(notificationMessage(id, data, config));
    if (!result.accepted.length || result.rejected.length) throw new Error("Mail rejected");
  } finally {
    transport.close();
  }
}

// Six attempts, with increasing delay. Failed jobs remain available for operators.
const retrySeconds = [60, 300, 1800, 7200, 43200];
export async function deliverNextNotification(send = sendNotification) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await client.query<Notification>(
      `SELECT n.request_id, n.attempts, r.payload
       FROM form_notifications n JOIN form_requests r ON r.id = n.request_id
       WHERE n.sent_at IS NULL AND n.failed_at IS NULL AND n.next_attempt_at <= now()
       ORDER BY n.next_attempt_at, n.request_id
       LIMIT 1 FOR UPDATE OF n SKIP LOCKED`,
    );
    const job = result.rows[0];
    if (!job) {
      await client.query("COMMIT");
      return false;
    }
    // Hold only the notification row lock, never the intake advisory lock.
    // A restart releases this lock and makes the durable job available again.
    let sent = false;
    try {
      await send(job.request_id, job.payload);
      sent = true;
    } catch {
      console.error("Form notification delivery failed", job.request_id);
    }
    if (sent) {
      await client.query(
        "UPDATE form_notifications SET attempts = attempts + 1, sent_at = now() WHERE request_id = $1",
        [job.request_id],
      );
    } else {
      await client.query(
        `UPDATE form_notifications SET attempts = attempts + 1,
         failed_at = CASE WHEN attempts >= 5 THEN now() ELSE NULL END,
         next_attempt_at = now() + $2 * interval '1 second' WHERE request_id = $1`,
        [job.request_id, retrySeconds[Math.min(job.attempts, retrySeconds.length - 1)]],
      );
    }
    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

const workerGlobal = globalThis as typeof globalThis & { notificationWorkerStarted?: boolean };
export function startNotificationWorker() {
  if (workerGlobal.notificationWorkerStarted) return;
  try {
    mailConfig();
  } catch {
    // Keep intake available; pending notifications survive until config is fixed.
    console.error("Form notification worker disabled: invalid SMTP configuration");
    return;
  }
  workerGlobal.notificationWorkerStarted = true;
  const tick = async () => {
    try {
      for (let count = 0; count < 5; count++) {
        if (!(await deliverNextNotification())) break;
      }
    } catch {
      console.error("Form notification worker database error");
    } finally {
      // Schedule after completion so slow SMTP cannot overlap the next tick.
      setTimeout(() => void tick(), 10000).unref();
    }
  };
  void tick();
}
