# THRIVE Support notification: final scoped installation approval packet v0.3

**Date:** 2026-10-11. **Status:** REVIEW ONLY; do not execute production SQL, configure credentials or enable sending from this document.

## Verified basis
- Draft PR #66, candidate branch, persisted Next.js 16.4.0 at fa4a4f4; latest reviewed documentation checkpoint 52b84ba.
- Vercel preview, seven isolated worker tests, synthetic PostgreSQL role/trigger/rollback/concurrency CI and production-only dependency audit passed. These tests are NOT proof of real production connectivity or privileges.
- Live THRIVE notification queue, LOGIN role, functions, cron schedule and SMTP delivery remain uninstalled/inactive. No historical backfill.

## Development-toolchain advisory: documented, not waived
- The broader npm install audit reported high-severity findings involving braces via micromatch -> fast-glob -> @next/eslint-plugin-next -> eslint-config-next.
- npm audit --omit=dev showed ZERO production dependency vulnerabilities for the persisted candidate. These findings are development-build-time supply-chain risks, not necessarily publicly reachable app routes, but should not be described as harmless.
- npm audit fix --force offered an incompatible eslint-config-next downgrade. **Do not apply it**.
- Candidate mitigation: limit GitHub Actions write permissions, keep CI untrusted PR code away from credentials, inspect lockfile patches and upstream fixes, update version-compatible transitive packages through a separate testable candidate. Re-run npm audit (full and production), npm ci, notification tests and build. Do not claim all-dependency clean until that evidence exists.
- This risk is documented as OPEN. A merge/release decision needs deliberate remediation or explicit documented acceptance; never silently waive.

## Production preflight to approve separately
1. **Read-only Supabase inventory:** confirm project, approved workspace UUID, existing triggers on support_requests/support_request_entries, RLS FORCE and policy behavior, installer role/CREATE/ALTER OWNER privileges, role-name availability, service/pooler endpoint restrictions. Do not use participant identity data in review output.
2. **Installation artifact:** promote exact SQL candidate v0.2 only after replacing EXACT_APPROVED_WORKSPACE_UUID with verified authorized workspace; keep one-transaction DDL, default EXECUTE revocations, dedicated NOLOGIN function owner and dedicated LOGIN worker with NO BYPASSRLS. Verify definer search_path and user identity restrictions. Confirm enqueue only on newly inserted requests and participant_reply entries, not internal notes. Do not backfill old requests.
3. **Install approval:** explicit authorization to create/alter only the approved outbox, two dedicated roles, three functions, and two AFTER INSERT triggers plus necessary grants. Confirm production rollback = disable/pause and preserve queue, no hard deletes.
4. **Private restricted DB login provisioning:** give dedicated worker its own random password in a protected secret manager, never a service-role key; use the database endpoint actually supported by Vercel. Confirm session_user = thrive_support_notifier, host TLS certificate verified, query permissions narrow, and timeout behavior. URL validator's synthetic tests alone are insufficient.
5. **Private SMTP provision:** confirm the Workspace send-as alias thrive@dssenterprisesusa.llc is authorized for derek@dssenterprisesusa.llc. Configure server-only THRIVE_SUPPORT_SMTP_USER, THRIVE_SUPPORT_SMTP_APP_PASSWORD, THRIVE_SUPPORT_EMAIL_FROM, THRIVE_SUPPORT_EMAIL_TO, THRIVE_SUPPORT_ORIGIN, CRON_SECRET, and THRIVE_SUPPORT_WORKER_DATABASE_URL in approved Vercel scope. Existing Supabase Auth SMTP is separate. Do not expose in NEXT_PUBLIC or logs.
6. **Fail-closed tests:** flag THRIVE_SUPPORT_NOTIFICATION_ENABLED remains false. Prove restricted DB identity and TLS, admin-only inbox link, synthetic new Support request and reply queue, negative authorization, harmless test notification with SMTP acceptance and DB acknowledge. Observe and reconcile uncertain sending states rather than automatically replaying.
7. **Separate activation approval:** only after successful smoke test configure appropriate Vercel cron, enable flag, verify one fresh request's email arrives; keep disable/pause plan ready and monitor failed/stuck queue.

## Explicit authorization boundaries
- Current user approval: review/candidate preparation and automated synthetic testing.
- NOT approved by this document: running production DDL, creating live roles, generating/entering production credentials, Vercel settings mutation, cron activation, merging, pushing or deployment.
- When the above read-only preflight and artifact are ready, request ONE scoped approval for the concrete production installation action; request separate credentials access and final activation authorization when relevant.

## Next exact gate
Complete live read-only preflight when connector allows; reconcile role/grant/trigger concerns. Close or explicitly decide the development-only advisory. Then present narrowly scoped production SQL approval with exact workspace identity and no real secrets.
