# THRIVE Support notification: live catalog preflight and advisory decision v0.4
Date: 2026-10-11. REVIEW ONLY. PR #66. No production modifications.

## SELECT-only production evidence
- Connected THRIVE project database: PostgreSQL 17.6, login identity postgres.
- public.support_requests and public.support_request_entries: owner postgres, RLS enabled AND FORCE RLS enabled.
- Existing Support triggers: support_requests has BEFORE assignment guard, no-hard-delete, scope/lifecycle guard, updated-at setter, and AFTER event record; support_request_entries has immutable/archive guard, no-hard-delete, and AFTER archive record.
- No thrive_support_notifier or thrive_support_notification_owner role. No thrive_enqueue_support_notification, thrive_worker_claim_support_notification or thrive_worker_finish_support_notification functions. No support_notification_outbox table.
- Entry composite FK already binds request, workspace, program and supported person.
- public schema owner is pg_database_owner. Superuser/CREATEROLE capability and effective CREATE/ALTER OWNER privileges of intended live installer are NOT yet proven; introspection query result did not include these values.

## Important compatibility issue to resolve
The v0.2 review SQL creates notification outbox as installer and later reassigns ownership to dedicated NOLOGIN owner. ALTER OWNER requires suitable rights and schema privileges. For foreign keys on parent Support tables, installer and role ownership/grant assumptions must be checked against Supabase privileges. CI uses standalone postgres superuser, which is NOT equivalent to production Supabase installer.
The new AFTER INSERT notification trigger runs as part of the user's transaction, and its SECURITY DEFINER function uses only NEW IDs and queue access. It must not alter existing lifecycle/audit triggers, and failure to enqueue must not silently break participant Support submission. Synthetic CI proved basic trigger behavior, not live RLS+function-owner interaction.
The SQL scope placeholder EXACT_APPROVED_WORKSPACE_UUID is NOT authorized to replace without a verified workspace and installation approval. Do not install any candidate yet.

## Development advisory decision
DEFER, DO NOT ACCEPT OR WAIVE. Production-only audit at fa4a4f4 had zero findings, verified in CI and on the developer's machine. Full npm install audit had five HIGH dev-toolchain findings in a braces -> micromatch -> fast-glob -> @next/eslint-plugin-next -> eslint-config-next dependency path. npm audit fix --force proposed a breaking downgrade and is prohibited absent distinct review. This dev-chain risk remains OPEN for release governance. Prefer compatible upstream transitive remediation on a separate candidate and full npm audit, CI tests, build.
The production-only audit cannot be interpreted as zero risk across all packages.

## Outcome and next gate
Live catalog existence/trigger/RLS checks: PASSED.
Live installer role capability, actual ALTER OWNER, Supabase network/TLS/session-user and SMTP: NOT PROVEN.
Next: finish read-only privilege/role-capability preflight and inspect exact installed role constraints. Then produce smallest Supabase-compatible installation candidate in review-only form with exact workspace authorization as a later gate. Separate approval required before DDL, service credentials, cron, deployment, merge or activation.
No secrets in chat or source.
