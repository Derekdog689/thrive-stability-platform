import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedSupportCron } from "@/lib/supportNotificationCronAuth";
import { withSupportWorkerDatabase } from "@/lib/supportNotificationPgConnection";
import { processMachineSupportNotifications } from "@/lib/supportNotificationMachineWorker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAuthorizedSupportCron(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Explicit fail-closed switch. Do not enable before SQL, worker identity,
  // SMTP alias, and scheduler have each passed their separate approval gates.
  if (process.env.THRIVE_SUPPORT_NOTIFICATION_ENABLED !== "true") {
    return NextResponse.json({ error: "Notification worker not activated" }, { status: 503 });
  }
  const cfg = {
    smtpUser: process.env.THRIVE_SUPPORT_SMTP_USER,
    smtpPassword: process.env.THRIVE_SUPPORT_SMTP_APP_PASSWORD,
    sender: process.env.THRIVE_SUPPORT_EMAIL_FROM,
    recipient: process.env.THRIVE_SUPPORT_EMAIL_TO,
    origin: process.env.THRIVE_SUPPORT_ORIGIN,
  };
  if (!cfg.smtpUser || !cfg.smtpPassword || !cfg.sender || !cfg.recipient || !cfg.origin) {
    return NextResponse.json({ error: "Notification configuration missing" }, { status: 503 });
  }
  try {
    const result = await withSupportWorkerDatabase((sql) =>
      processMachineSupportNotifications(sql, {
        smtpUser: cfg.smtpUser!,
        smtpPassword: cfg.smtpPassword!,
        sender: cfg.sender!,
        recipient: cfg.recipient!,
        origin: cfg.origin!,
      }),
    );
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Notification worker unavailable" }, { status: 503 });
  }
}
