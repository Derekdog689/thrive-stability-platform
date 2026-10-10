import "server-only";

/**
 * Validate the restricted worker connection URL before passing it to a vetted
 * PostgreSQL driver. Never log or return the actual URL.
 *
 * This module does not open connections and cannot activate delivery.
 */
export function validateSupportWorkerDatabaseUrl(raw: string | undefined): string {
  if (!raw) throw new Error("Worker database configuration missing");
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Worker database URL invalid");
  }
  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("Worker database protocol invalid");
  }
  if (url.username !== "thrive_support_notifier" || !url.password) {
    throw new Error("Dedicated worker database role required");
  }
  if (!url.hostname || !url.port || !/^\d+$/.test(url.port)) {
    throw new Error("Worker database host or port missing");
  }
  if (!url.pathname || url.pathname === "/" || url.hash) {
    throw new Error("Worker database path invalid");
  }
  // TLS certificate verification must never be bypassed by URL parameters.
  const ssl = url.searchParams.get("sslmode");
  if (ssl && ssl !== "verify-full") {
    throw new Error("Worker database TLS must verify server identity");
  }
  if (url.searchParams.has("sslcert") || url.searchParams.has("sslkey") ||
      url.searchParams.has("sslrootcert") || url.searchParams.has("options")) {
    throw new Error("Unsupported worker database URL options");
  }
  // TLS configuration must be set in the driver as rejectUnauthorized=true,
  // even when URL contains sslmode=verify-full.
  return raw;
}
