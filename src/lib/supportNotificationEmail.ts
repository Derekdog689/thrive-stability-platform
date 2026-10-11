/**
 * Server-only Support notification email content. Does not send email.
 * Do not import into a client component.
 * No participant names, text, amounts, medical information or account facts
 * are permitted in email notifications. The Admin inbox is the source of truth.
 */
import "server-only";

export type SupportNotificationKind = "request_created" | "participant_replied";

const titles: Record<SupportNotificationKind, string> = {
  request_created: "New THRIVE Support request",
  participant_replied: "THRIVE Support reply received",
};

export function buildSupportNotificationEmail(
  kind: SupportNotificationKind,
  options: { origin: string },
): { subject: string; text: string } {
  const origin = new URL(options.origin);
  if (origin.protocol !== "https:" || origin.username || origin.password ||
      origin.search || origin.hash || origin.pathname !== "/") {
    throw new Error("A secure canonical THRIVE origin is required.");
  }

  // Deliberately omit any participant identifiers or request IDs from email.
  // The recipient must sign in and pass existing Admin authorization.
  const adminUrl = new URL("/admin/support", origin).toString();
  return {
    subject: titles[kind],
    text: [
      kind === "request_created"
        ? "A new Support request has been received in THRIVE."
        : "A participant replied to an existing THRIVE Support request.",
      "",
      "Sign in to your authorized THRIVE Admin workspace to review:",
      adminUrl,
      "",
      "This notification contains no participant details. Do not reply to this email.",
    ].join("\n"),
  };
}
