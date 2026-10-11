# Support notification security / connection gate | 2026-10-11

REVIEW ONLY. Draft PR #66. Production unchanged.

## Evidence
- Candidate commit 6a064760: Vercel success; GitHub Actions "THRIVE dependency security candidate" success, run 38159443291.
- Candidate trial installed Next.js 16.4.0 and eslint-config-next 16.4.0 in disposable CI only, reran seven isolated notification tests and full Next.js build; all succeeded.
- npm audit --omit=dev against the UPDATED ephemeral dependency lock reported: 0 critical, 1 high, 1 moderate, total 2. Previous locked Next.js 16.2.12 audit reported 1 critical, 4 high, 1 moderate, total 6. Full patched audit report is attached as CI artifact for inspection. The two remaining package advisories must be identified/remediated or formally accepted; do not label as zero-risk.
- Both PostgreSQL CI workflows at the same commit succeeded. These are synthetic DB tests, not live Supabase.
- Session-mode Supabase pooler URL validation accepts only the exact THRIVE project-scoped worker identity, TLS required. A real session-user, certificate-chain and Vercel-to-database connection remain untested pending dedicated credentials.
- The repository's package.json and package-lock.json are STILL pinned to old Next.js. The patched CI installation did NOT mutate tracked GitHub dependencies.

## Before requesting credentials
- Persist patched lockfile to a reviewable candidate commit and rerun Vercel/CI and dependency audit.
- Identify residual high and moderate advisories, assess applicability and fix or document acceptance.
- Reconcile production database connection type and projected worker identity without disclosing or changing credentials.
- Obtain separate explicit approval for live role/table/function/trigger installation and Vercel configuration. No service-role key.
- Only then privately supply a dedicated worker password/connection URL, protected cron secret, SMTP app password, alias sender verification, and keep THRIVE_SUPPORT_NOTIFICATION_ENABLED=false until authorized end-to-end smoke test.

Current next gate: persist candidate dependency upgrade and analyze remaining two security findings. Do not merge, install SQL or activate notifications.
