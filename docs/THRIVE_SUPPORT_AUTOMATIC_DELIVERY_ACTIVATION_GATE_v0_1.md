# THRIVE Support automatic delivery: activation decision v0.1 (review only)

## Inspected truth
- `POST /api/internal/support-notification` uses a participant/reviewer JWT and Supabase RLS-gated RPC. It can deliver **only when an authorized reviewer calls it**. This is manual, not automatic.
- Existing Supabase Auth email SMTP and alias are not application SMTP access.
- `support_notification_outbox` and claim/finish functions exist as **review-only SQL**. Nothing is installed. Queue triggers must be bound to both committed request and participant reply INSERT events.
- The proposed worker is not yet suitable for unattended sending because it has no approved non-human machine identity or independently audited scheduler authorization.
- No deployment/SQL/application secrets have been changed.

## Smallest credible automatic operation
1. **Database write truth:** request or participant reply INSERT enqueues a unique outbox event in the same transaction via vetted trigger.
2. **Delivery identity:** use an independently scoped, least-privileged non-personal worker identity and explicit approved workspace authorization. **Do not impersonate Derek or use Johnny's access token.** Do not use Supabase service role without separate explicit approval.
3. **Scheduler:** private Vercel Cron or comparable scheduled worker calls a server-only route with signed scheduler credentials. Route must verify scheduler identity BEFORE accessing the outbox. A public POST accepting a secret query string is prohibited.
4. **Claim and deliver:** only rows in an explicitly approved workspace and recipient configuration are eligible. Atomic claim token prevents competing workers. A worker never accepts arbitrary sender, recipient, request ID or message content from caller.
5. **Delivery state:** store attempt and confirmation outcomes independently of participant Support status. An ambiguous outcome (SMTP accepted but database acknowledgement failed) requires operator reconciliation before retry. Never promise exactly-once external delivery.
6. **Recipient:** `derek@dssenterprisesusa.llc`. Sender alias candidate `thrive@dssenterprisesusa.llc`; verify Google send-as behavior with a secret-free message first. No participant identifying facts in emails.
7. **Rate and abuse controls:** SMTP send timeout, maximum attempts, backoff, alert on stuck pending/failure queue, deterministic job limit per run. Fail closed if credentials or authorization are missing.
8. **Audit:** verify no unintended access, no secrets in logs, no old Support records replayed by default. Backfill requires its own approval.
9. **Test:** simulate test request + reply, no duplicate event, transport error, no credential, failed acknowledgment, wrong-workspace worker, invalid scheduler signature, and exact recipient delivery.
10. **Activation requires separate approval:** install SQL, create narrowly scoped identity and credentials, configure Vercel private env vars, enable scheduler, merge/deploy, then perform one real authorized test.

## Stop / next action
Engineering may complete tests and draft scoped scheduler + worker identity candidates on branch. **Do not claim automatic delivery or ask the user to configure SMTP secrets until a verified autonomous authorization design exists.** The current reviewer endpoint is a proving aid, not a production notifier.

Next gate is approval of specific least-privilege worker identity and scheduler credential architecture, then candidate build/test, followed by separate install approval.
