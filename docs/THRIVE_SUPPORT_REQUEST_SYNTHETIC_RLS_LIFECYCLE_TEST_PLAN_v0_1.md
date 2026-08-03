# THRIVE Support Request Synthetic RLS and Lifecycle Test Plan v0.1

## Status

Review-only test candidate.

Do not install the Support schema or execute these tests without separate approval.

## Required actors

- Participant D
- Participant A
- outsider
- active workspace member with `member_role = support`
- active workspace admin
- inactive or removed support member

All tests must use normal authenticated client paths. Do not use the service role to prove participant or reviewer access.

## Preconditions

- Support candidate installed only in the approved controlled test environment.
- Participant A and Participant D remain isolated.
- Both participants have active program participation.
- Support reviewer belongs to the intended workspace.
- Outsider belongs to no authorized Support workspace.
- Synthetic linked records exist for Goals, Wellness, budget category, budget period, and staged transaction.

## Participant D tests

### Create

- Create a request for self and active program.
- Verify default status is `submitted`.
- Verify creator is the authenticated user.
- Reject alternate workspace.
- Reject alternate program.
- Reject Participant A supported-person ID.
- Reject unsupported category.
- Reject blank-only message.
- Reject oversized message.
- Reject reviewer-only routing or assignment fields.

### Read

- See own active and historical requests.
- See participant-visible responses.
- Never see internal notes.
- See status-change events.
- See active related links.
- Do not see archived links in the normal participant query.

### Immutability

- Reject editing participant category.
- Reject editing message.
- Reject editing requested support.
- Reject editing contact preference.
- Reject changing assignment or routing category.
- Reject completing or archiving own request.

### Withdrawal

- Permit `submitted -> withdrawn`.
- Require `withdrawn_at`.
- Reject any other simultaneous field mutation.
- Reject withdrawal after acknowledgment.
- Reject reopening a withdrawn request.

### Links

- Add a same-scope Goal link while submitted.
- Add a same-scope Wellness link while submitted.
- Add a same-scope staged transaction link while submitted.
- Add a same-scope budget category link while submitted.
- Add a same-scope budget period link while submitted.
- Reject cross-workspace, cross-program, or cross-person links.
- Reject multiple targets in one link row.
- Permit participant archive of a mistaken link while parent remains submitted.
- Require archive reason.
- Reject participant link changes after acknowledgment.
- Reject automatic creation from Goal, Wellness, transaction, or budget state.

## Participant A isolation tests

- Cannot see Participant D requests.
- Cannot see Participant D responses.
- Cannot see Participant D internal notes.
- Cannot see Participant D links.
- Cannot see Participant D status events.
- Cannot update or withdraw Participant D requests.
- Cannot link Participant D records.

Repeat valid self-only creation and withdrawal for Participant A.

## Outsider tests

- Cannot select any Support request.
- Cannot insert a Support request for another person.
- Cannot add links.
- Cannot read entries.
- Cannot read status events.
- Cannot use reviewer update paths.

## Active Support reviewer tests

### Reviewer recognition

- `is_support_reviewer(workspace_id)` returns true in own workspace.
- Returns false in another workspace.

### Workflow

- Select requests in authorized workspace.
- Reject direct `submitted -> archived`.
- Permit `submitted -> acknowledged`.
- Permit acknowledged transitions to in progress, waiting, completed, or archived.
- Permit `in_progress <-> waiting_for_participant`.
- Permit completed to archived.
- Permit withdrawn to archived.
- Preserve `completed_at` after archive.
- Preserve `withdrawn_at` after archive.
- Reject reopening completed, withdrawn, or archived requests.
- Reject mutation of participant-authored category or message.

### Routing and assignment

- Add or change internal routing category.
- Preserve participant category.
- Assign only an active same-workspace `admin` or `support` membership row.
- Reject inactive, removed, viewer, trustee, individual, or cross-workspace assignment.
- Verify no automatic assignment occurs.

### Entries

- Add participant-visible response.
- Add internal note.
- Participant sees only participant response.
- Entry title is optional and limited to 120 characters.
- Content is required and limited to 4000 characters.
- Reject content edits.
- Archive a mistaken entry with reason.
- Reject hard delete.
- Verify archived participant response is removed from normal participant view but remains reviewer-visible.

### Status history

- Every status transition creates an immutable event.
- Assignment and routing changes create staff-only event types.
- Participants see status-change events only.
- Reviewers see all event types.
- Reject direct client insertion of status events.
- Reject update or delete of events.

## Workspace admin tests

Run the same operational workflow tests as the active Support reviewer.

Confirm broader admin authority does not alter participant-authored request content.

## Inactive or removed Support member tests

- `is_support_reviewer(workspace_id)` returns false.
- Cannot select reviewer-only data.
- Cannot update requests.
- Cannot assign.
- Cannot add responses or internal notes.
- Cannot archive entries.

## No-delete proof

For all four Support tables:

- participant DELETE denied;
- Support reviewer DELETE denied;
- admin DELETE denied through authenticated client policies;
- records remain available through authorized historical reads.

## Cross-module boundary proof

- Support link does not update Goal.
- Support link does not update Wellness check-in.
- Support link does not update transaction evidence.
- Support link does not update budget period or category.
- Support request creates no Trust Engine record or action.
- Support request creates no external-sharing consent.
- No emergency or clinical workflow is triggered.

## Expected closeout

Produce:

- pass/fail table for every test;
- exact actor used;
- exact request and link IDs;
- screenshots of participant and reviewer visibility;
- policy and trigger verification queries;
- confirmation that no service-role client was used;
- cleanup through archive or inactive states only;
- no hard deletes.

## Rollback-validation checkpoint

The v0.2 SQL candidate completed a full rollback-only parse and dependency
validation against the live database.

Post-run verification confirmed that no Support tables, functions, or policies
remained.

This validates SQL structure and dependencies only. It does not validate RLS,
lifecycle behavior, actor isolation, or participant experience.

Controlled installation and authenticated synthetic testing remain separately
gated.
