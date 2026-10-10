# THRIVE Support Notification v0.1 | implementation candidate (review only)

## Verified state | 2026-10-10
- Production auth recovery PR #65 merged at `6e04b093`; SMTP auth recovery and participant password update confirmed by user screenshots.
- Main participant request write: `src/app/support/useParticipantSupport.ts` creates rows in `public.support_requests` via Supabase client. Admin workspace reads support requests in `src/app/admin/support/page.tsx`.
- Live Supabase public schema includes `support_requests`, `support_request_entries`, `support_request_status_events`, `workspace_members`; none is a notification outbox. No Supabase Edge Functions deployed.
- Supabase Authentication custom SMTP delivery **does not** establish app email transport capability. Gmail alias `thrive@dssenterprisesusa.llc` is a sender identity, not its own authenticated mailbox. Workspace account `derek@dssenterprisesusa.llc` currently owns the SMTP app password. Do not put that password in a browser bundle, SQL migration, GitHub, or this document.

## Candidate v0.1 operating loop
1. A saved participant support request is the database truth. App response may say only 'Your request was received' until external delivery is verified.
2. Server-side notification mechanism operates after committed inserts, not before. Also identify participant replies (`support_request_entries.entry_type='participant_reply'`).
3. A durable notification outbox records unique event ID, event type, source row ID, status, attempt count, timestamps and last failure category; no message body stored in email queue. Uniqueness blocks duplicate sends from retries.
4. Authorized private server worker sends a minimal alert to an explicitly authorized DSS recipient: 'New THRIVE Support request' + secure admin link to request. No participant message, bank data, clinical details or private identifiers in email subject/body.
5. Keep delivery result distinct from Support status. Failure to send does not undo a saved Support request and must be visible in the Admin workspace/retry queue.
6. Admin acknowledgment/response stays within current app workflow. Later outbound reply notification to participant is separately gated, not conflated with request receipt.
7. Verification covers: duplicate event retries, mail transport failure, disabled recipient, forged request attempts, workspace authorization, successful real inbox delivery, and no unrequested participant data in mail.

## Decision points before activation
- Confirm DSS notification recipient, initially proposed `derek@dssenterprisesusa.llc`, and whether alerts should come **from** `thrive@dssenterprisesusa.llc`.
- Inspect actual database insert policies, webhook/trigger suitability, existing Vercel server-side deployment secrets and Google SMTP sending-as alias permissions before choosing transport.
- Do not use Auth's SMTP app-password setting as an application transport API. Candidate options: dedicated server-side SMTP provider using environment-scoped credential, or separate transactional email provider.
- No live email notifications, outbox migration, external sharing, deployments or production configuration changes authorized by this candidate.

## Exact next gate
Review recipient + transport decision, then implement an isolated server-only delivery/outbox candidate and tests on this branch. Verify on preview, request explicit approval before production activation.
