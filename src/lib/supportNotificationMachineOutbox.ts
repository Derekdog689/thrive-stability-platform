import "server-only";
import type { OutboxAdapter, NotificationJob } from "./supportNotificationDelivery";
import type { SupportNotificationKind } from "./supportNotificationEmail";

/**
 * Machine-only queue adapter with an injected SQL transport.
 * Does not create a database connection or grant database permissions.
 *
 * Contract: the SQL functions are installed only after separate approval and
 * enforce SESSION_USER = thrive_support_notifier and approved workspace scope.
 * The driver must connect as the dedicated role, never a service-role key.
 */
export type WorkerSqlClient = {
  query<T extends Record<string, unknown>>(
    sql: string,
    params?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

type ClaimRow = { job_id: string; event_kind: string; claim_token: string };
type FinishRow = { finished: boolean };

function isUuid(input: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input);
}

function kind(value: string): SupportNotificationKind {
  if (value !== "request_created" && value !== "participant_replied") {
    throw new Error("Invalid queued event kind");
  }
  return value;
}

export function createMachineNotificationOutbox(sql: WorkerSqlClient): OutboxAdapter {
  const claims = new Map<string, string>();
  return {
    async claimNext(): Promise<NotificationJob | null> {
      const result = await sql.query<ClaimRow>(
        "select job_id, event_kind, claim_token from public.thrive_worker_claim_support_notification()",
      );
      if (!result.rows.length) return null;
      if (result.rows.length !== 1) throw new Error("Unexpected worker claim count");
      const row = result.rows[0];
      if (!isUuid(row.job_id) || !isUuid(row.claim_token)) {
        throw new Error("Invalid worker claim identifiers");
      }
      const eventKind = kind(row.event_kind);
      claims.set(row.job_id, row.claim_token);
      return { id: row.job_id, eventKind, attempts: 0 };
    },
    async markSent(id) {
      const token = claims.get(id);
      if (!token) throw new Error("Missing worker claim");
      const result = await sql.query<FinishRow>(
        "select public.thrive_worker_finish_support_notification($1::uuid,$2::uuid,$3::boolean,$4::text) as finished",
        [id, token, true, null],
      );
      if (result.rows.length !== 1 || result.rows[0].finished !== true) {
        throw new Error("Worker delivery acknowledgment rejected");
      }
      claims.delete(id);
    },
    async markFailed(id, category) {
      const token = claims.get(id);
      if (!token) throw new Error("Missing worker claim");
      const result = await sql.query<FinishRow>(
        "select public.thrive_worker_finish_support_notification($1::uuid,$2::uuid,$3::boolean,$4::text) as finished",
        [id, token, false, category],
      );
      if (result.rows.length !== 1 || result.rows[0].finished !== true) {
        throw new Error("Worker failure acknowledgment rejected");
      }
      claims.delete(id);
    },
  };
}
