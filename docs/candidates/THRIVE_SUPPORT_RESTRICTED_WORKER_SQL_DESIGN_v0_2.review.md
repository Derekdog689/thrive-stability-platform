# THRIVE Support notification | restricted-worker SQL design v0.2
REVIEW ONLY — NOT AN INSTALLABLE MIGRATION. 2026-10-11.

## Fresh live evidence
SELECT-only metadata check: public.support_requests, support_request_entries and workspaces are owned by postgres. Both Support tables have RLS enabled **and FORCE ROW LEVEL SECURITY**. Workspaces has RLS enabled without FORCE. The worker LOGIN role, function-owner role, notification outbox, claim/finish functions and enqueue function are not installed.

## Gate blocker: SQL function ownership and RLS
The worker's NOINHERIT, NOBYPASSRLS LOGIN role must never directly SELECT/UPDATE the Support tables or queue. The outbox candidate enables RLS without a client policy. For SECURITY DEFINER claim/finish to work under such RLS, the function owner MUST have precisely proven authority over the outbox (for example a dedicated non-login outbox owner without FORCE RLS there). Using the Support tables' postgres ownership or granting broad BYPASSRLS is not acceptable by default. Ensure trigger enqueue can INSERT as its explicitly audited owner. Explicitly specify function owners after creation and REVOKE PUBLIC EXECUTE in the same approved installation transaction, before exposure.

RLS is not replaced by checking SESSION_USER: both database permissions and the in-function identity/workspace guards matter. PostgreSQL transaction-pooling and connection identity behavior must be tested with the intended Supabase connection endpoint before relying on SESSION_USER.

## Fixed-scope candidate
Claim and finish functions compare SESSION_USER to thrive_support_notifier; they use a single approved hardcoded workspace UUID, with no caller-supplied workspace, recipient or arbitrary SQL. Claim returns only opaque job UUID, event kind and token. Token-match, status='sending' and workspace match are mandatory to finish. SKIP LOCKED/unique(event_kind,source_id) bound concurrency and duplication. No historical backfill and no DELETE.

Workspace ID remains UNSPECIFIED. Do not infer it from someone's Support request or a person's identity.

## Cross-table provenance requirement
The reply-trigger candidate copies new.workspace_id, new.support_request_id. Verify the database enforces new.workspace_id = parent support_requests.workspace_id (or derive workspace from the parent within the trusted trigger). An unchecked mismatched pair could contaminate the notification queue across workspaces. Do not install until proven.

## Delivery observability requirement
A 'sending' row after a lost SMTP DATA acknowledgment or DB acknowledgment must remain quarantined, with an operator-only review path. It must not automatically flip back to pending. Retriable failed rows require bounded attempts and meaningful backoff. Distinguish 'SMTP definitively rejected' from 'transport stopped at an uncertain boundary'.

## Privilege matrix (design, not observed grants)
- participant/authenticated/anon: existing Support writes as already authorized; NO outbox rights and NO claim/finish EXECUTE.
- worker LOGIN: CONNECT, public schema USAGE and EXECUTE solely on fixed claim/finish functions. NO direct table rights, NO BYPASSRLS, NO membership in privileged owner roles.
- dedicated function owner NOLOGIN: minimum outbox SELECT/UPDATE needed to claim/finish, proven under outbox RLS. Separate enqueue trigger owner can INSERT only. Check ownership grants and SECURITY DEFINER before installation.
- service_role: no new claim/finish EXECUTE granted.
- operator: review/repair via separately authorized audited procedure, NOT blanket queue mutation.

## Required validation in isolated database before installation
1. Database login role metadata, CONNECT and function ACLs; PUBLIC's default EXECUTE revoked.
2. Real authenticated request INSERT and reply INSERT produce one queue job; wrong entry_type does not.
3. Cross-workspace foreign key/trigger mismatch rejected. Original Support INSERT and audit/lifecycle triggers unaffected.
4. Worker claim/finish works only from correct database session role, and only fixed workspace.
5. Wrong role (anon/authenticated/service_role), wrong token and second finish all denied/no-op.
6. Concurrent SKIP LOCKED claim; uniqueness and bounded retries.
7. STOP before any prod install if pooler does not preserve SESSION_USER identity or TLS certificate chain cannot be validated.
8. Rollback/disable strategy must preserve historical queue states and never hard delete rows.

## Decision
DESIGN RECONCILED, NOT PROVEN INSTALLABLE. Existing review SQL files are templates only. Next gate: candidate SQL implementation resolving outbox ownership/RLS and reply parent provenance, then run isolated PostgreSQL permission tests. Separate explicit authorization required before live role/table/function/trigger creation, env secrets, cron enablement or production deployment.
