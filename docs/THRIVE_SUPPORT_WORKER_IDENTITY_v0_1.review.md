# THRIVE dedicated notification worker identity v0.1 (review-only)

## Decision candidate
Use a dedicated PostgreSQL LOGIN role `thrive_support_notifier`, **not** Supabase `service_role`, `postgres`, Johnny's account, or Derek's personal login. Vercel Cron authenticates independently with `CRON_SECRET` at a private GET endpoint. Server opens a TLS-verified PostgreSQL connection via a restricted connection URL and calls only tightly scoped claim/finish functions. Separate SMTP env variables authenticate the Google Workspace mailbox. None of these credentials are client-visible.

This is an authorization architecture candidate, NOT a SQL install, credential creation, or production job.

## Worker role / database contract
- A narrowly scoped login role has CONNECT and USAGE only where required, and EXECUTE on notification-only claim/finish RPC functions. Do not grant direct SELECT/INSERT/UPDATE/DELETE on Support or outbox rows; functions validate the single approved workspace, recipient configuration, and machine role.
- Supabase built-in `auth.uid()`/reviewer permissions are **not** a worker identity. Existing `is_support_reviewer(workspace_id)` cannot authorize a non-human Postgres role. Create separately named worker-only functions with fixed workspace scope and strict `current_user` role checks, rather than broadening reviewer RPC grants.
- `SECURITY DEFINER` functions use a pinned `search_path`, schema-qualified tables, restricted EXECUTE grants, and an audited owner. Validate role behavior from the actual connected role before installation.
- Enqueue only after committed Support request or `participant_reply` INSERT. Unique event source key prevents duplicate *queue rows*. Existing lifecycle triggers remain intact. No historical backfill.
- Atomic claim with `FOR UPDATE SKIP LOCKED`, a unique claim token, bounded batch, retry/backoff, and a hard stop after ambiguous SMTP-confirmed-but-DB-unconfirmed delivery.
- The outbox does not store participant message text or any SMTP credential.

## Vercel Cron execution
- Vercel scheduler sends `Authorization: Bearer <CRON_SECRET>`. Route validates secret (constant-time, fail closed) **before** database access.
- No arbitrary URL-supplied workspace, recipient, template, request ID, or SQL.
- Verify private env vars are scoped to the intended environment and never available as `NEXT_PUBLIC_*`.
- Vercel Cron frequency and platform plan must be verified before enabling; **do not** add a live `vercel.json` cron schedule in this candidate.

## Environment variables (proposed)
`CRON_SECRET`: separate random, at least 32 characters, user enters directly into Vercel.
`THRIVE_SUPPORT_WORKER_DATABASE_URL`: dedicated least-privilege Postgres login with TLS, entered directly in Vercel.
`THRIVE_SUPPORT_SMTP_APP_PASSWORD`: Google Workspace app password, entered directly in Vercel, separate from Supabase Auth's stored SMTP configuration.
`THRIVE_SUPPORT_SMTP_USER` = `derek@dssenterprisesusa.llc`
`THRIVE_SUPPORT_EMAIL_FROM` = `thrive@dssenterprisesusa.llc` (test alias permitted)
`THRIVE_SUPPORT_EMAIL_TO` = `derek@dssenterprisesusa.llc`
`THRIVE_SUPPORT_ORIGIN` = `https://thrive-stability-platform.vercel.app`

## Build work still required
1. Review create-role/grants SQL **with the live database role owners**. Do not assume Supabase can create/restrict the role or that direct DB access is available on Vercel.
2. Implement the Postgres adapter using a vetted driver and committed lockfile. Verify TLS trust settings and avoid sensitive SQL logging.
3. Create private scheduler route calling the existing server-only SMTP transport and outbox worker through that adapter. Add unit and integration tests.
4. Validate failures (unauthenticated cron, wrong worker role, wrong workspace, concurrent cron calls, SMTP accepted but confirmation failed, retry cap).
5. Request explicit install approval for database objects/role and Vercel config, then perform one non-sensitive email test.

No production merge, cron activation, environment secret, SQL execution, or email sending authorized by this document.
