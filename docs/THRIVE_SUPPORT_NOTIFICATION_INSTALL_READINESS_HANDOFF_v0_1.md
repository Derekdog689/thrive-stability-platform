# THRIVE Support Notification v0.1 | Production readiness and credentials handoff (REVIEW ONLY)

Checkpoint: 2026-10-11, Draft PR #66, branch feature/support-notification-v0-1-candidate-20261010.

## Verified
- Commit 9aac1de GitHub Vercel status: SUCCESS (preview build).
- GitHub Actions: synthetic dedicated worker permission fixture successful; actual v0.2 reviewed SQL extracted and executed in disposable PostgreSQL 17 with synthetic Support schema: request/reply trigger insert, internal-note exclusion, rollback, scope, role access and competing claims passed.
- Previously, six isolated Node tests and local Next.js build passed.
- No live notification outbox, worker roles or functions installed; no production mail scheduler or delivery activated.

## Must resolve BEFORE credentials or production activation
1. **Framework security:** npm audit --omit=dev previously reported Next.js 16.2.12 as critical, recommending 16.4.0 outside pinned range. Complete separately tested dependency remediation (including PostCSS, sharp, nanoid, source-map-js); verify compatibility and no regressions. Do not use npm audit fix --force blindly.
2. **Production privileges:** disposable PostgreSQL is not Supabase. Verify production PostgreSQL installer can create dedicated LOGIN and NOLOGIN roles, reassign table/functions, revoke schema CREATE, and preserve request/entry triggers + RLS. Use SELECT-only inventory before approval; no service-role keys.
3. **Connection endpoint and TLS:** pick Supabase-supported direct or session-mode pooler endpoint that preserves SESSION_USER for thrive_support_notifier, prove pg TLS certificate verification, allow outbound traffic from Vercel and test DB protocol connection. Never use transaction pooling until verified.
4. **SQL assembly:** v0.2 review SQL remains comment-prefixed and has EXACT_APPROVED_WORKSPACE_UUID marker. Build a separately reviewed production-scoped install artifact using the explicitly authorized workspace UUID after owner/grants and scope are checked. No historical backfill, no DELETE.
5. **SMTP semantics:** deliverable is notifications **to** derek@dssenterprisesusa.llc **from** thrive@dssenterprisesusa.llc. Supabase Auth SMTP credentials are NOT automatically available to Vercel application code; use a separate server-only secret. Verify Gmail Send mail as alias in Workspace and test with non-sensitive fixture before activation.
6. **Scheduler:** CRON_SECRET must be 32+ random bytes/characters; private Vercel environment. Enable only after approved SQL/credentials. Proposed /api/internal/support-notification/cron route fails closed when flag absent or false. No automatic schedule yet defined in production.
7. **Operations:** stuck 'sending' jobs must be manually reconciled; no blind retries after uncertain SMTP acceptance or DB ack. Define monitoring, rate limits, operator review and pause procedure.

## Protected Vercel variables to prepare (do NOT send values in chat)
- THRIVE_SUPPORT_WORKER_DATABASE_URL = dedicated restricted Postgres login URI, verified TLS (never use service-role).
- CRON_SECRET = random high-entropy Bearer secret (minimum 32 characters).
- THRIVE_SUPPORT_SMTP_USER = authorized Gmail Workspace mailbox login.
- THRIVE_SUPPORT_SMTP_APP_PASSWORD = app-specific SMTP credential stored only in protected Vercel server environment.
- THRIVE_SUPPORT_EMAIL_FROM = verified send-as alias.
- THRIVE_SUPPORT_EMAIL_TO = authorized DSS recipient.
- THRIVE_SUPPORT_ORIGIN = canonical https:// production origin for Admin inbox link.
- THRIVE_SUPPORT_NOTIFICATION_ENABLED = omit or false until a separate activation signoff; switch only after all tests.

## Sequence for handoff
A. Security candidate and application regression tests -> B. live read-only role/privilege/connection inventory -> C. dedicated, scoped production SQL installation explicit approval -> D. privately configure worker DB login, SMTP send-as/credentials and cron secret in Vercel under separate authorization -> E. test one new synthetic Support request and reply, verify delivery/logs, pause on ambiguity -> F. enable scheduler and operational monitoring by separate production activation approval.

**No credentials requested yet.** This document alone authorizes no changes. Never paste passwords, connection strings or app passwords into GitHub, chat, CI logs or docs.
