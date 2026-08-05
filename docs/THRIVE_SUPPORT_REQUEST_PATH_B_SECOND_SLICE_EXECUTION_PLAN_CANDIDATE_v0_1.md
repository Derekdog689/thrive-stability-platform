# THRIVE Support Request Path B Second-Slice Controlled Execution Plan Candidate v0.1

## Status

Review-only candidate.

This document proposes the next controlled browser-authenticated validation slice for THRIVE Support Request Path B. It does not authorize execution. No test action may begin until this candidate is reviewed and explicitly approved.

## Verified state

- Path B first-slice validation is committed at `151e973`.
- The Support test harness is relocked.
- The production build passed after relock.
- `git diff --check` was clean.
- No push, merge, deployment, service-role use, Trust Engine synchronization, notification workflow, emergency workflow, or Johnny activation occurred.
- The surviving synthetic Support request remains:
  - Request ID: `e8526d24-3310-4fe6-a6bb-4589a0a53b54`
  - Status: `acknowledged`
  - Routing category: `other`
  - Assigned reviewer member ID: `cca88550-bac5-49b2-92a6-d5d9e19dd8ea`

## Live entry schema findings

### Allowed entry types

- `participant_response`
- `internal_note`

### Content constraints

- `content` is required after trimming.
- `content` length: 1 to 4,000 characters.
- `title` may be null.
- When present, `title` length: 1 to 120 trimmed characters.

### Archive consistency

An entry must be either:

- active, with both `archived_at` and `archive_reason` null; or
- archived, with both fields populated.

Archive-reason length: 1 to 1,000 trimmed characters.

### Scope and lineage

- `created_by` must reference an authenticated user.
- Entry scope must match the parent request across:
  - request ID
  - workspace ID
  - program ID
  - supported-person ID
- Parent deletion is restricted.

## Live RLS findings

### Reviewer insert

Authenticated reviewers may insert entries only when:

- `created_by = auth.uid()`
- the user is an authorized Support reviewer in the same workspace

### Reviewer read

Authorized reviewers may read all entries within their permitted workspace scope.

### Participant read

A supported person may read only:

- `entry_type = participant_response`
- entries belonging to their own supported-person record
- entries where `archived_at is null`

A supported person may not read:

- `internal_note`
- archived participant responses

### Reviewer archive

An authorized reviewer may update an entry only when:

- the row is currently unarchived
- the resulting row has both `archived_at` and `archive_reason`
- reviewer authority exists in the same workspace

## Live privilege findings

The `authenticated` role has:

- `SELECT`
- `INSERT`
- `UPDATE`

The `authenticated` role does not have `DELETE`.

No useful anonymous privilege was identified.

## Live trigger and function findings

### Immutability guard

`protect_support_entry_immutability()` rejects changes to:

- workspace ID
- program ID
- supported-person ID
- Support request ID
- entry type
- title
- content
- creator
- creation timestamp

Only archival fields may change.

### Terminal archive

Once `archived_at` is populated, the entry is terminal. A second update is rejected.

### Archive requirements

Archival requires:

- `archived_at`
- `archive_reason`
- authorized Support reviewer status

### Hard-delete prevention

`prevent_support_hard_delete()` raises:

`Hard delete is not permitted for THRIVE Support records`

### Archive event recording

`record_support_child_archive_event()` creates a Support status event only when an entry moves from unarchived to archived.

For an entry archive, the event should contain:

- `event_type = entry_archived`
- parent request scope
- `changed_by = auth.uid()`
- `change_note = archive_reason`

## Purpose of the proposed second slice

The second slice should verify the database boundary between participant-visible Support communication and reviewer-only internal documentation.

The slice must prove:

1. an active Support reviewer can create a participant response;
2. the supported participant can read that active response;
3. an active Support reviewer can create an internal note;
4. the supported participant cannot read the internal note;
5. entry content and identity fields cannot be rewritten;
6. an authorized reviewer can archive an entry;
7. the archive creates the expected audit event;
8. an archived participant response is no longer participant-visible;
9. the reviewer can still reconcile the archived record and event;
10. the harness is relocked immediately after the approved actions.

## Proposed synthetic entries

### Participant response candidate

- Entry type: `participant_response`
- Title: `Synthetic participant response`
- Content: `SYNTHETIC SUPPORT TEST ONLY. Your Support request has been acknowledged for controlled validation.`
- Created by: active Support reviewer
- Parent request: `e8526d24-3310-4fe6-a6bb-4589a0a53b54`

### Internal note candidate

- Entry type: `internal_note`
- Title: `Synthetic internal note`
- Content: `SYNTHETIC SUPPORT TEST ONLY. Reviewer-only validation note with no clinical, fiduciary, or intent conclusion.`
- Created by: active Support reviewer
- Parent request: `e8526d24-3310-4fe6-a6bb-4589a0a53b54`

### Archive reason candidate

`Controlled synthetic archive visibility validation.`

## Proposed execution order

Each action must be performed separately. No run-all control, loop, batch action, or cleanup automation may be used.

### Gate 1: temporary harness activation

- Change only the committed Support test execution flag from `false` to `true`.
- Run `npm run build`.
- Stop if the build fails.
- Do not commit the enabled state.

### Gate 2: active Support identity

- Sign in as the approved active Support reviewer.
- Read and verify the authenticated identity.
- Stop on mismatch.

Expected auth user ID:

`7f0a7540-7a6d-4a1a-a29f-7a26c9571db9`

### Gate 3: parent request reconciliation

- Read the primary Support request.
- Verify:
  - request ID matches
  - status is `acknowledged`
  - routing category is `other`
  - assignment remains the approved active reviewer
- Stop on mismatch.

### Gate 4: create participant response

- Insert one `participant_response` using the approved synthetic content.
- Capture the returned entry ID and complete row.
- Do not create another entry.

Expected:

- insert succeeds
- `created_by` matches active Support auth ID
- archive fields are null
- parent scope matches the Support request

### Gate 5: reviewer read reconciliation

- As active Support, read entries for the request.
- Verify the participant response is visible.
- Capture the exact row.

### Gate 6: participant visibility proof

- Sign in as Participant D.
- Read entries for the request.
- Verify the participant response is visible.
- Verify no internal note exists yet.
- Capture the exact returned rows.

Expected Participant D auth user ID:

`d48b7268-9aa6-4498-a923-2851fd5232c9`

### Gate 7: create internal note

- Sign back in as active Support.
- Insert one `internal_note` using the approved synthetic content.
- Capture the returned entry ID and complete row.
- Do not create a second internal note.

### Gate 8: reviewer reads both entries

- As active Support, read entries for the request.
- Verify both entries are visible:
  - participant response
  - internal note

### Gate 9: participant internal-note isolation

- Sign in as Participant D.
- Read entries for the request.
- Verify:
  - participant response remains visible
  - internal note is absent
- Capture the full returned rows.

### Gate 10: immutability negative proof

- Sign in as active Support.
- Attempt one update that changes only the participant-response `content`.
- Do not modify archive fields in this attempt.

Expected:

- update rejected
- error states that Support entry content, identity, scope, and creation lineage are immutable
- no archive event created
- participant response remains unchanged

### Gate 11: archive participant response

- As active Support, update only:
  - `archived_at`
  - `archive_reason`
- Use the approved synthetic archive reason.
- Capture the returned row.

Expected:

- archival succeeds
- original content and lineage remain unchanged
- `archived_at` is populated
- `archive_reason` is populated

### Gate 12: archive-event proof

- As active Support, read status events for the parent request.
- Verify one new event:
  - `event_type = entry_archived`
  - `changed_by` matches active Support auth ID
  - `change_note` matches the archive reason
- Capture the event ID and complete row.

### Gate 13: reviewer post-archive reconciliation

- As active Support, read entries for the request.
- Verify:
  - archived participant response remains reviewer-visible
  - internal note remains reviewer-visible
  - archive fields are accurate

### Gate 14: participant post-archive visibility

- Sign in as Participant D.
- Read entries for the request.

Expected:

- archived participant response is absent
- internal note is absent
- returned entry list is empty

### Gate 15: relock and stop

- Restore the Support test execution flag to `false`.
- Run:
  - `npm run build`
  - `git diff --check`
  - `git status --short`
- Confirm the execution flag does not remain modified.
- Do not stage or commit execution-state changes.
- Stop.

## Required evidence

The controlled execution record should preserve:

- active Support identity result
- Participant D identity result
- parent request preflight result
- inserted participant-response row
- participant visibility result before archive
- inserted internal-note row
- reviewer read containing both entries
- participant read excluding internal note
- immutability rejection code and message
- archived participant-response row
- entry-archive event ID and row
- reviewer post-archive read
- participant post-archive empty result
- relocked file state
- build result
- `git diff --check`
- `git status --short`

## Stop conditions

Stop immediately if:

- the authenticated identity is not the expected synthetic actor;
- the parent request does not match the verified surviving state;
- an insert changes participant-authored request fields;
- Participant D can read an internal note;
- Participant D can read an archived participant response;
- entry content mutation succeeds;
- archival changes immutable entry fields;
- archival fails to create the expected event;
- a rejected action creates an audit event;
- the harness cannot be relocked;
- the build fails;
- unrelated files become staged;
- any action would require service-role access.

## Still-frozen areas

This candidate does not include:

- Support links
- request completion
- request archival
- direct event update
- direct event deletion
- request deletion
- entry deletion
- link deletion
- automated cleanup
- service-role access
- real supported-person data
- Johnny activation
- Trust Engine synchronization
- notifications
- emergency workflow
- external sharing
- push
- merge
- deployment

## Approval boundary

Approval of this document would authorize only the ordered gates above.

It would not authorize any later Path B slice or any production installation.

## Candidate closeout requirement

After execution, prepare a review-only second-slice validation closeout containing:

- every tested action
- every rejected action
- created entry IDs
- surviving entry state
- archive-event ID
- participant and reviewer visibility reconciliation
- build status
- `git diff --check`
- `git status`
- commit checkpoint
- exact next gate

Do not move into links, completion, request archival, or delete proofs without a separate reviewed candidate and explicit approval.
