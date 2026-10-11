import "server-only";
import type { WorkerSqlClient } from "./supportNotificationMachineOutbox";

/**
 * Driver-neutral restricted Postgres connection adapter.
 *
 * The actual PostgreSQL pool must be built using a vetted driver and a
 * dedicated machine-role connection URL. This layer intentionally neither
 * reads env vars nor creates credentials; it closes the gap between a
 * parameterized Postgres query API and the outbox worker contract.
 */
export type ParameterizedPostgresConnection = {
  query<T extends Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
};

export function asMachineWorkerSqlClient(
  connection: ParameterizedPostgresConnection,
): WorkerSqlClient {
  return {
    async query<T extends Record<string, unknown>>(
      sql: string,
      params: readonly unknown[] = [],
    ) {
      // Only two exact worker RPC statements are admitted. No caller-selected
      // table names or arbitrary SQL from the notification worker.
      const claim =
        "select job_id, event_kind, claim_token from public.thrive_worker_claim_support_notification()";
      const finish =
        "select public.thrive_worker_finish_support_notification($1::uuid,$2::uuid,$3::boolean,$4::text) as finished";
      if (sql !== claim && sql !== finish) {
        throw new Error("Unsupported notification worker query");
      }
      if ((sql === claim && params.length !== 0) ||
          (sql === finish && params.length !== 4)) {
        throw new Error("Unexpected notification query arguments");
      }
      return connection.query<T>(sql, params);
    },
  };
}
