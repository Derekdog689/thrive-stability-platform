import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedSupportCron } from "@/lib/supportNotificationCronAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Inert automatic-delivery entry point.
 *
 * Deliberately returns 503 until the dedicated least-privilege Postgres
 * adapter, approved worker SQL, and installation/activation gate are complete.
 * Adding this route alone cannot send an email or access participant data.
 *
 * After approval, wire a real machine-only adapter and bounded batch here.
 * Do not re-use a participant JWT, reviewer RPC, or Supabase service-role key.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorizedSupportCron(
    request.headers.get("authorization"),
    process.env.CRON_SECRET,
  )) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    { error: "Automatic Support notification worker not activated" },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
