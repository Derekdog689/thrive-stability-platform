import "server-only";
import { timingSafeEqual } from "node:crypto";

/**
 * Verify Vercel Cron's private Authorization header without touching the queue.
 * No request body, query string, participant token or alternate auth route.
 * No production route is wired to this helper yet.
 */
export function isAuthorizedSupportCron(
  authorization: string | null,
  configuredSecret: string | undefined,
): boolean {
  if (!configuredSecret || configuredSecret.length < 32) return false;
  if (!authorization?.startsWith("Bearer ")) return false;
  const candidate = authorization.slice(7);
  const a = Buffer.from(candidate, "utf8");
  const b = Buffer.from(configuredSecret, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
