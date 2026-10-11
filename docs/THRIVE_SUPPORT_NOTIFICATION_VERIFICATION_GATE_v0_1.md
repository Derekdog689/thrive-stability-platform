# THRIVE Support notification v0.1 | Verification gate (review only)

Checked 2026-10-11 against PR #66 at ec41513 and live Supabase metadata. No DDL, DML, credential or deployment changes.

## Verified
- Vercel status on ec41513: success. Compilation is not a runtime test.
- Existing public.support_requests has UUID id, workspace_id.
- Existing public.support_request_entries has UUID id, support_request_id, workspace_id and text entry_type.
- Existing public.workspaces has UUID id.
- Existing Support triggers: request BEFORE INSERT/UPDATE assignment and scope guards; request AFTER INSERT/UPDATE audit; entries BEFORE UPDATE immutability and BEFORE DELETE no-hard-delete; entries AFTER UPDATE archive. No enqueue trigger on either table as inspected.
- Outbox does not exist in the live schema.
- Cron route checks Bearer secret first and returns 401 on invalid auth, then 503 when activation flag is absent/false (source review).
- Worker DB URL enforces dedicated role naming; driver verifies TLS and session_user (source review).
- Worker adapter allowlists two parameterized SQL function calls only (source review).
- SMTP after-DATA error is classified as uncertain and leaves claim in sending for human reconciliation (source review).

## NOT verified (blockers)
- Unit/integration tests have NOT been executed for the cron route, DB role, outbox claim/finish, or SMTP. Do not classify code review as a passing test.
- SQL owner/grant/RLS and trigger execution under existing authenticated participant writes have NOT been tested.
- No real mail has been sent; Gmail alias send-as is unverified.
- No workspace ID should be guessed; reviewer must authorize exact workspace for worker claim/finish.
- SQL files remain reviews/templates. Do not execute unchanged. They require an audited non-login SECURITY DEFINER owner, exact grants, and a staged reversible test.
- Critical Next.js npm audit findings remain unresolved for production merge.
- Ambiguous SMTP DATA acceptance and DB markSent failure must each result in no automatic retry. Observe stuck-sending rows before operator adjudication.
- Auth tests required: absent/incorrect/short CRON_SECRET, disabled flag, missing mail/DB env, attempts to access with participant/reviewer JWT, correct private secret while disabled.
- SQL tests required: unauthorized database role denies claim/finish; worker scope pinned to approved workspace; concurrent claim uses SKIP LOCKED; double claim impossible; wrong claim token denied; after INSERT enqueue once per source; reply-only entry filter; no historical backfill; archive/no-hard-delete unaffected.

## Gate decision
HOLD installation and activation. Candidate review is compatible with identified columns and trigger names but not proven safe for live write execution. Next: implement and run isolated fake-adapter tests; settle SQL function owner/grants and workspace ID; verify build; request separate production installation approval.
