import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createGoogleSmtpTransport } from "@/lib/supportNotificationSmtp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Candidate: Supabase Database Webhook receiver for auth.users INSERT and
// public.support_requests INSERT. Do not configure either live webhook until
// production approval and protected environment values are installed.
// No service-role credentials, participant content, or email addresses in alerts.
const allowed = new Map([
  ["auth.users", { subject: "New THRIVE account awaiting onboarding", body: "Someone created a THRIVE account. Review onboarding and activation in THRIVE Admin.", path: "/admin/supported-people" }],
  ["public.support_requests", { subject: "New THRIVE Support ticket", body: "A new Support ticket was submitted. Review it in THRIVE Admin.", path: "/admin/support" }],
]);

function isAuthorized(header: string | null, token: string | undefined): boolean {
  if (!token || token.length < 32 || !header?.startsWith("Bearer ")) return false;
  const provided = header.slice(7);
  if (provided.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(token));
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request.headers.get("authorization"), process.env.THRIVE_ADMIN_ALERT_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (process.env.THRIVE_ADMIN_ALERT_ENABLED !== "true") {
    return NextResponse.json({ error: "Admin alerts disabled" }, { status: 503 });
  }
  if (Number(request.headers.get("content-length") || 0) > 16384) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  let event: unknown;
  try { event = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (!event || typeof event !== "object") {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }
  const payload = event as Record<string, unknown>;
  const schema = payload.schema;
  const table = payload.table;
  const type = payload.type;
  const record = payload.record;
  const key = String(schema) + "." + String(table);
  const template = allowed.get(key);
  if (type !== "INSERT" || !template || !record || typeof record !== "object" ||
      typeof (record as Record<string, unknown>).id !== "string") {
    return NextResponse.json({ error: "Unsupported event" }, { status: 400 });
  }
  const user = process.env.THRIVE_SUPPORT_SMTP_USER;
  const password = process.env.THRIVE_SUPPORT_SMTP_APP_PASSWORD;
  const sender = process.env.THRIVE_SUPPORT_EMAIL_FROM;
  const recipient = process.env.THRIVE_SUPPORT_EMAIL_TO;
  const origin = process.env.THRIVE_SUPPORT_ORIGIN;
  if (!user || !password || !sender || !recipient || !origin) {
    return NextResponse.json({ error: "Mail not configured" }, { status: 503 });
  }
  let url: URL;
  try {
    url = new URL(origin);
    if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash ||
        url.username || url.password) throw new Error("Bad origin");
  } catch {
    return NextResponse.json({ error: "Invalid origin" }, { status: 503 });
  }
  try {
    await createGoogleSmtpTransport({ host: "smtp.gmail.com", port: 465, username: user, appPassword: password })
      .send({ from: sender, to: recipient, subject: template.subject,
        text: template.body + "\n\n" + new URL(template.path, url).toString() +
          "\n\nSign in with authorized Admin access to review. No participant details are included." });
    return NextResponse.json({ delivered: true });
  } catch {
    return NextResponse.json({ error: "Mail unavailable" }, { status: 503 });
  }
}
