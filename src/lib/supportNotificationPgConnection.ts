import "server-only";
import pg from "pg";
import { validateSupportWorkerDatabaseUrl } from "./supportNotificationDatabaseConfig";
import { asMachineWorkerSqlClient } from "./supportNotificationPostgresAdapter";

/** Open a single bounded, verified-TLS database connection as the worker role. */
export async function withSupportWorkerDatabase<T>(
  run: (sql: ReturnType<typeof asMachineWorkerSqlClient>) => Promise<T>,
): Promise<T> {
  const url = validateSupportWorkerDatabaseUrl(process.env.THRIVE_SUPPORT_WORKER_DATABASE_URL);
  const client = new pg.Client({
    connectionString: url,
    ssl: { rejectUnauthorized: true },
    connectionTimeoutMillis: 7000,
    query_timeout: 12000,
    statement_timeout: 12000,
    application_name: "thrive_support_notifier",
  });
  try {
    await client.connect();
    const identity = await client.query<{ session_user: string }>("select session_user");
    if (identity.rows.length !== 1 || identity.rows[0].session_user !== "thrive_support_notifier") {
      throw new Error("Unexpected worker database identity");
    }
    return await run(asMachineWorkerSqlClient(client));
  } finally {
    await client.end().catch(() => undefined);
  }
}
