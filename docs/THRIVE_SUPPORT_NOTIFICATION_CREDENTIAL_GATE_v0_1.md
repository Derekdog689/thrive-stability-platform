# Support notifications v0.1 | credentials and delivery readiness

## Decision
Use the existing Google Workspace mailbox `derek@dssenterprisesusa.llc` as the authenticated SMTP user and, only after a successful send-as test, `thrive@dssenterprisesusa.llc` as the From alias. The recipient is `derek@dssenterprisesusa.llc`.

Supabase Auth's custom SMTP setting is not an application API. The application requires its own server-only transport. The simplest candidate is a Node.js server-side SMTP adapter with `nodemailer` (port 465, TLS) using Vercel encrypted environment variables; this requires dependency and lockfile changes plus a server runtime deployment, all separately reviewed. No secret values in source control.

## Proposed server-only Vercel environment variable names
- `THRIVE_SUPPORT_SMTP_HOST` = `smtp.gmail.com`
- `THRIVE_SUPPORT_SMTP_PORT` = `465`
- `THRIVE_SUPPORT_SMTP_USER` = `derek@dssenterprisesusa.llc`
- `THRIVE_SUPPORT_SMTP_APP_PASSWORD` = private Google app password, entered directly in Vercel **by the user**, never in chat
- `THRIVE_SUPPORT_EMAIL_FROM` = `thrive@dssenterprisesusa.llc` (only if alias sending is confirmed)
- `THRIVE_SUPPORT_EMAIL_TO` = `derek@dssenterprisesusa.llc`
- `THRIVE_SUPPORT_ORIGIN` = `https://thrive-stability-platform.vercel.app`

Do not enter these yet. Configuration should happen only after the final server adapter and outbox worker are approved, to avoid dangling credentials or nonfunctional deployment.

## Important implementation gap
- Durable queue SQL currently exists **only** at `docs/candidates/THRIVE_SUPPORT_NOTIFICATION_OUTBOX_v0_1.review.sql`; it has not been installed.
- `src/lib/supportNotificationDelivery.ts` is an isolated candidate; the outbox adapter, SMTP adapter, and authorized worker entry point still need implementation and test.
- A trigger from committed inserts to outbox (not direct SMTP) is needed to prevent lost events when a participant closes their browser.
- Worker must atomically claim jobs with a lease; retry only safely. After SMTP accepts mail but before database acknowledgment, crash recovery can cause a duplicate. v0.1 must not promise exactly-once external email, only duplicate-resistant events and auditable attempts.
- Ensure `markSent` failures are not misreported as mail delivery failures and never prompt blind resend.
- Access to worker must never be reachable via a participant-callable or unverified public endpoint.

## Test sequence (once implementation exists)
1. Unit-test email subject/body privacy and both event kinds.
2. Test outbox insert event uniqueness and existing lifecycle trigger compatibility.
3. Simulate transport errors, temporary failures, retries, and concurrent workers.
4. Validate recipient and alias sending with a private server-initiated test containing no participant details.
5. Create one test Support request using an authorized test participant, verify Admin alert and proper audit records.
6. Only after successful preview verification request explicit production install/activation approval.

This is an implementation candidate, not instructions to switch on live notifications.
