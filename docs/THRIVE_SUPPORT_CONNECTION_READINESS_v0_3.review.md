# THRIVE Support notification production connection gate v0.3
Date: 2026-10-11. Draft PR #66. REVIEW ONLY.

## Frozen verified state
- Feature commit fa4a4f494caf77a1818d875233d84f2ce9e64d69 persists Next.js 16.4.0 and eslint-config-next 16.4.0 in both manifests.
- Three GitHub Actions workflows passed for that commit: restricted PostgreSQL worker, actual SQL candidate triggers/concurrency, dependency security. Vercel preview success.
- Seven isolated worker tests, full build and production-only audit passed. Zero reported production dependency advisories.
- One remaining development dependency advisory chain: braces / micromatch / fast-glob / @next/eslint-plugin-next / eslint-config-next. npm audit fix --force proposed a breaking eslint-config-next downgrade. Do not apply automatically.

## Pending protected connection proof
1. Read-only production introspection at approval time: confirm that custom LOGIN, NOLOGIN owner, schema privileges, RLS/trigger interaction and database endpoint are supported. Previously inspected Support request and entry tables were FORCE RLS. Do not silently change their policies.
2. Once dedicated restricted LOGIN identity is installed with separately approved live SQL, privately configure its own password, not the Supabase service-role key.
3. Choose direct or SESSION pooler PostgreSQL endpoint preserving session_user, with verified TLS certificate identity. The project-scoped pooler URL parser passed synthetic tests but real session_user and network behavior are still unproven.
4. Privately configure Vercel server-only DB URL and a test-only delivery configuration. Never paste secrets in PR, CI, chat, or client-side NEXT_PUBLIC variables.
5. Keep notification enabled switch off until one new synthetic request and reply and one benign SMTP delivery are verified with no historical backfill. No merge, deployment or installation from this document.

## Next gate
Resolve or risk-document the development-only advisory with a nonbreaking, version-compatible method; assemble exact scoped production installation approval packet; separately approve live SQL and credentials before execution.

This update supersedes older security result notes that said dependency manifests were not yet persisted.
