import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createGoogleSmtpTransport } from "@/lib/supportNotificationSmtp";
import { deliverOneSupportNotification, type OutboxAdapter } from "@/lib/supportNotificationDelivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Candidate only: reviewer-triggered delivery. No cron/scheduler and no
 * anonymous dispatch. RLS + reviewer-gated RPC are the authority for jobs.
 * Must not be deployed until proposed RPC/outbox schema is reviewed/installed.
 */
export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";
  if (!/^Bearer [A-Za-z0-9._~-]+$/.test(authorization)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const password = process.env.THRIVE_SUPPORT_SMTP_APP_PASSWORD;
  const username = process.env.THRIVE_SUPPORT_SMTP_USER;
  const sender = process.env.THRIVE_SUPPORT_EMAIL_FROM;
  const recipient = process.env.THRIVE_SUPPORT_EMAIL_TO;
  const origin = process.env.THRIVE_SUPPORT_ORIGIN;
  if (!url || !anon || !password || !username || !sender || !recipient || !origin) {
    return NextResponse.json({ error: "Delivery is not configured" }, { status: 503 });
  }

  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: auth, error: authError } = await supabase.auth.getUser(authorization.slice(7));
  if (authError || !auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // No service-role or bypass token. The RPC checks is_support_reviewer
  // for the workspace of the claimed outbox item.
  const outbox: OutboxAdapter = {
    async claimNext() {
      const { data, error } = await supabase.rpc("thrive_claim_support_notification");
      if (error) throw new Error("Claim failed");
      const claimed = Array.isArray(data) ? data[0] : undefined;
      return claimed
        ? { id: claimed.job_id, eventKind: claimed.event_kind, attempts: 0 }
        : null;
    },
    async markSent(id) {
      const token = claimTokens.get(id);
      if (!token) throw new Error("Missing delivery claim");
      const { data, error } = await supabase.rpc("thrive_finish_support_notification", {
        p_job_id: id, p_claim_token: token, p_delivered: true, p_error: null,
      });
      if (error || data !== true) throw new Error("Delivery acknowledgment failed");
    },
    async markFailed(id, category) {
      const token = claimTokens.get(id);
      if (!token) throw new Error("Missing delivery claim");
      const { data, error } = await supabase.rpc("thrive_finish_support_notification", {
        p_job_id: id, p_claim_token: token, p_delivered: false, p_error: category,
      });
      if (error || data !== true) throw new Error("Failure acknowledgment failed");
    },
  };

  const claimTokens = new Map<string, string>();
  const originalClaim = outbox.claimNext;
  outbox.claimNext = async () => {
    const { data, error } = await supabase.rpc("thrive_claim_support_notification");
    if (error) throw new Error("Claim failed");
    const claimed = Array.isArray(data) ? data[0] : undefined;
    if (!claimed) return null;
    claimTokens.set(claimed.job_id, claimed.claim_token);
    return { id: claimed.job_id, eventKind: claimed.event_kind, attempts: 0 };
  };
  void originalClaim;

  try {
    const transport = createGoogleSmtpTransport({
      host: "smtp.gmail.com",
      port: 465,
      username,
      appPassword: password,
    });
    const outcome = await deliverOneSupportNotification(outbox, transport, {
      origin, sender, recipient,
    });
    return NextResponse.json({ outcome }, { status: 200 });
  } catch {
    // Do not leak provider details, credentials or participant records.
    return NextResponse.json({ error: "Notification delivery unavailable" }, { status: 503 });
  }
}
