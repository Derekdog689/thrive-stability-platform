import "server-only";
import { buildSupportNotificationEmail, type SupportNotificationKind } from "./supportNotificationEmail";

/**
 * Candidate server worker core. Deliberately not attached to a route, trigger,
 * scheduler, or production secret. Outbox adapter must atomically claim rows.
 * No service-role or elevated database client is created here.
 */
export type NotificationJob = {
  id: string;
  eventKind: SupportNotificationKind;
  attempts: number;
};

export type OutboxAdapter = {
  claimNext(): Promise<NotificationJob | null>;
  markSent(id: string): Promise<void>;
  markFailed(id: string, category: "transport" | "configuration"): Promise<void>;
};

export type MailTransport = {
  send(message: { from: string; to: string; subject: string; text: string }): Promise<void>;
};

export type DeliverySettings = {
  origin: string;
  sender: string;
  recipient: string;
};

function validateMailbox(value: string): string {
  // Settings are server-managed, never supplied by participants.
  const email = value.trim();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ||
      email.includes("\r") || email.includes("\n")) {
    throw new Error("Invalid server email configuration");
  }
  return email;
}

export async function deliverOneSupportNotification(
  outbox: OutboxAdapter,
  transport: MailTransport,
  settings: DeliverySettings,
): Promise<"idle" | "sent" | "failed"> {
  // Validate BEFORE claiming, so configuration errors do not strand rows.
  const from = validateMailbox(settings.sender);
  const to = validateMailbox(settings.recipient);
  // Validate the canonical origin before claiming a queued event.
  // A missing or unsafe origin must not strand a claimed job.
  buildSupportNotificationEmail("request_created", { origin: settings.origin });
  const bodyOrigin = settings.origin;
  const job = await outbox.claimNext();
  if (!job) return "idle";

  try {
    const { subject, text } = buildSupportNotificationEmail(job.eventKind, { origin: bodyOrigin });
    await transport.send({ from, to, subject, text });
  } catch (error) {
    // The transport failed before accepting this delivery.
    const category = error instanceof TypeError ? "configuration" : "transport";
    await outbox.markFailed(job.id, category);
    return "failed";
  }

  // SMTP accepted the message. If database confirmation fails, propagate the
  // failure for operator reconciliation instead of mislabeling it as an SMTP
  // failure and causing an automatic duplicate resend.
  await outbox.markSent(job.id);
  return "sent";
}
