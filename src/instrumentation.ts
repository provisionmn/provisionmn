export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.MAIL_ENABLED === "true") {
    const { startNotificationWorker } = await import("./server/notifications");
    startNotificationWorker();
  }
}
