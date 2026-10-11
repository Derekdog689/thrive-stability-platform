import "server-only";
import {
  deliverOneSupportNotification,
  type DeliverySettings,
  type MailTransport,
  type OutboxAdapter,
} from "./supportNotificationDelivery";

/**
 * Bounded automatic-worker execution loop.
 * Must only be called AFTER private scheduler authentication and with an
 * independently scoped machine database adapter. No participant/browser path.
 * A failure halts processing so a failed SMTP delivery cannot cause a rapid
 * retry loop in the same invocation.
 */
export async function runSupportNotificationBatch(
  outbox: OutboxAdapter,
  transport: MailTransport,
  settings: DeliverySettings,
  limit = 3,
): Promise<{ sent: number; failed: number; idle: boolean }> {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 5) {
    throw new Error("Invalid notification batch size");
  }
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < limit; i += 1) {
    const result = await deliverOneSupportNotification(outbox, transport, settings);
    if (result === "idle") return { sent, failed, idle: true };
    if (result === "sent") sent += 1;
    if (result === "failed") {
      failed += 1;
      break;
    }
  }
  return { sent, failed, idle: false };
}
