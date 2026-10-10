import "server-only";
import { createMachineNotificationOutbox, type WorkerSqlClient } from "./supportNotificationMachineOutbox";
import { createGoogleSmtpTransport } from "./supportNotificationSmtp";
import { runSupportNotificationBatch } from "./supportNotificationBatch";

/**
 * Machine worker composition. Database connection is supplied by a separate,
 * approved least-privilege PostgreSQL adapter. This function cannot access
 * Supabase or credentials unless its caller explicitly provides them.
 *
 * Never call with the Supabase service role or a participant session.
 */
export async function processMachineSupportNotifications(
  sql: WorkerSqlClient,
  settings: {
    smtpUser: string;
    smtpPassword: string;
    sender: string;
    recipient: string;
    origin: string;
  },
): Promise<{ sent: number; failed: number; idle: boolean }> {
  if (!settings.smtpUser || !settings.smtpPassword) {
    throw new Error("Notification worker SMTP configuration missing");
  }
  const outbox = createMachineNotificationOutbox(sql);
  const transport = createGoogleSmtpTransport({
    host: "smtp.gmail.com",
    port: 465,
    username: settings.smtpUser,
    appPassword: settings.smtpPassword,
  });
  return runSupportNotificationBatch(outbox, transport, {
    origin: settings.origin,
    sender: settings.sender,
    recipient: settings.recipient,
  }, 3);
}
