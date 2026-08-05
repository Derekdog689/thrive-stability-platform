# THRIVE Support Request Path B Third-Slice Controlled Execution Plan Candidate v0.1

## Status

Review-only candidate.

This document proposes the next controlled browser-authenticated validation slice for THRIVE Support Request Path B. It does not authorize execution. No test action may begin until this candidate is reviewed and explicitly approved.

## Verified state

- Path B second-slice validation closeout is committed at `19a2593`.
- The Support test harness is relocked.
- The most recent production build passed.
- `git diff --check` was clean.
- No push, merge, deployment, service-role use, Trust Engine synchronization, notification workflow, emergency workflow, or Johnny activation occurred.
- The existing primary synthetic Support request remains `acknowledged` and is not eligible for new participant-created links.
- No separate Participant D synthetic Support request currently exists in `submitted`.
- One active synthetic goal target is available:
  - Goal ID: `506f98d8-3354-4cc7-8ddd-617614fb1bdc`
  - Workspace ID: `71000000-0000-4000-8000-000000000001`
  - Program ID: `71000000-0000-4000-8000-000000000002`
  - Supported-person ID: `71000000-0000-4000-8000-000000000009`
  - Title: `To accomplish Thrive`
  - Progress status: `in_progress`
  - Archived at: `null`

## Synthetic actors

### Participant D

- Email: `dstein561+thrive-onboarding-person-d@gmail.com`
- Auth user ID: `d48b7268-9aa6-4498-a923-2851fd5232c9`
- Supported-person ID: `71000000-0000-4000-8000-000000000009`
- Workspace ID: `71000000-0000-4000-8000-000000000001`
- Program ID: `71000000-0000-4000-8000-000000000002`

### Active Support reviewer

- Email: `dstein561+thrive-rls-support@gmail.com`
- Auth user ID: `7f0a7540-7a6d-4a1a-a29f-7a26c9571db9`
- Workspace-member ID: `cca88550-bac5-49b2-92a6-d5d9e19dd8ea`
- Workspace ID: `71000000-0000-4000-8000-000000000001`

## Live Support-link findings

### Allowed target model

Each Support link must reference exactly one of:

- staged transaction;
- budget category;
- budget period;
- wellness check-in;
- goal;
- prior completed Support request.

This candidate uses only the verified active goal target.

### Scope controls

The link must match the parent Support request across:

- workspace ID;
- program ID;
- supported-person ID;
- Support request ID.

The goal target must match the same:

- workspace ID;
- program ID;
- supported-person ID.

### Participant creation rule

A participant may create a Support link only when:

- `created_by = auth.uid()`;
- the link starts unarchived;
- the supported person is the authenticated participant;
- active program participation exists;
- the parent Support request remains `submitted`;
- the parent request was created by the same authenticated participant.

### Reviewer rule

The authenticated browser path contains no reviewer link-insert policy.

An authorized Support reviewer may:

- read links in an authorized workspace;
- archive an active link.

### Participant visibility

The participant may read only their own active links.

Archived links are not participant-visible.

### Link immutability

The following fields are immutable after creation:

- workspace ID;
- program ID;
- supported-person ID;
- Support request ID;
- all target IDs;
- creator;
- creation timestamp.

Only `archived_at` and `archive_reason` may change.

### Archive behavior

- Archived links are terminal.
- Archive requires both `archived_at` and `archive_reason`.
- Participants may archive only while the parent request remains `submitted`.
- Reviewers may archive within their authorized workspace.
- A valid archive creates one `link_archived` event.
- Hard deletes are rejected.

## Purpose of the proposed third slice

The third slice should verify the participant-created Support-link lifecycle against one active synthetic goal.

The slice must prove:

1. Participant D can create one new synthetic Support request;
2. the new request remains `submitted`;
3. Participant D can create one goal link on that submitted request;
4. Participant D can read the active link;
5. the active Support reviewer can read the same link;
6. link identity and target fields cannot be changed;
7. the active Support reviewer can archive the link;
8. the archive creates the expected `link_archived` event;
9. Participant D cannot read the archived link;
10. the reviewer can still reconcile the archived link;
11. the harness is relocked immediately after the approved actions.

## Proposed new synthetic Support request

The request should be created by Participant D using only synthetic content.

Suggested values:

- Participant category: `other`
- Participant message: `SYNTHETIC SUPPORT LINK TEST ONLY`
- Requested support: `Review-only goal-link validation candidate.`
- Contact preference: `in_app`

Expected initial state:

- status: `submitted`;
- routing category: `null`;
- assigned member ID: `null`;
- withdrawn at: `null`;
- completed at: `null`;
- archived at: `null`;
- created by: Participant D auth user ID.

The returned request ID must be captured and used for every later third-slice action.

## Proposed synthetic goal link

- Target type: `goal`
- Goal ID: `506f98d8-3354-4cc7-8ddd-617614fb1bdc`
- Created by: Participant D
- Archived at: `null`
- Archive reason: `null`

## Proposed archive reason

`Controlled synthetic goal-link archive validation.`

## Proposed execution order

Each action must be performed separately. No run-all control, loop, batch action, automatic cleanup, or service-role path may be used.

### Gate 1: temporary harness activation

- Change only the committed Support test execution flag from `false` to `true`.
- Run `npm run build`.
- Stop if the build fails.
- Do not commit the enabled state.

### Gate 2: Participant D identity

- Sign in as Participant D.
- Load the browser identity.
- Verify the auth user ID exactly matches:
  `d48b7268-9aa6-4498-a923-2851fd5232c9`
- Stop on mismatch.

### Gate 3: create one new synthetic Support request

- Populate the approved synthetic request values.
- Create one request.
- Capture the complete returned row and new request ID.
- Do not create a second request.

Expected:

- request status is `submitted`;
- routing and assignment are null;
- request scope matches Participant D;
- creator matches Participant D auth ID.

### Gate 4: request persistence read

- Read the newly created request.
- Verify:
  - status remains `submitted`;
  - routing remains null;
  - assignment remains null;
  - no completion, withdrawal, or archive timestamp exists.

### Gate 5: create one goal link

- Stay signed in as Participant D.
- Set the new Support request ID.
- Set target type to `goal`.
- Use goal ID:
  `506f98d8-3354-4cc7-8ddd-617614fb1bdc`
- Create exactly one link.
- Capture the full returned row and link ID.

Expected:

- create succeeds;
- exactly one target field is populated;
- target is the verified goal ID;
- creator matches Participant D;
- archive fields are null;
- request and goal scope match.

### Gate 6: participant active-link read

- As Participant D, read links for the new request.
- Verify exactly one active goal link is returned.
- Capture the full row.

### Gate 7: active Support reviewer read

- Sign in as the active Support reviewer.
- Verify browser identity.
- Read links for the new request.
- Verify the same active goal link is visible.
- Capture the full row.

### Gate 8: link-target immutability negative proof

- Stay signed in as active Support.
- Attempt one update that changes the goal target ID or another immutable target field.
- Do not populate archive fields in this attempt.

Expected:

- update rejected;
- error states that Support link identity, target, scope, and creation lineage are immutable;
- link remains unchanged;
- no archive event is created.

The exact mutation payload must use a controlled synthetic value and must not point to real participant data.

### Gate 9: reviewer archive

- Stay signed in as active Support.
- Update only:
  - `archived_at`;
  - `archive_reason`.
- Use:
  `Controlled synthetic goal-link archive validation.`
- Capture the returned row.

Expected:

- archival succeeds;
- immutable fields remain unchanged;
- archived timestamp and reason are populated.

### Gate 10: archive-event proof

- Read status events for the new parent Support request.
- Verify one new event:
  - `event_type = link_archived`;
  - `changed_by` matches active Support auth ID;
  - `change_note` matches the archive reason;
  - request scope matches the new synthetic request.
- Capture the event ID and complete row.

### Gate 11: reviewer post-archive reconciliation

- As active Support, read links for the new request.
- Verify:
  - archived goal link remains reviewer-visible;
  - archive fields are accurate;
  - target and scope fields are unchanged.

### Gate 12: participant post-archive visibility

- Sign in as Participant D.
- Read links for the new request.

Expected:

- returned link list is empty;
- archived goal link is not participant-visible.

### Gate 13: relock and stop

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

- Participant D identity result;
- new Support request ID and full created row;
- request persistence read;
- created goal-link ID and full row;
- Participant D active-link visibility result;
- active Support identity result;
- reviewer active-link visibility result;
- immutability rejection code and message;
- archived link row;
- `link_archived` event ID and complete row;
- reviewer post-archive read;
- Participant D post-archive empty result;
- relocked file state;
- build result;
- `git diff --check`;
- `git status --short`.

## Stop conditions

Stop immediately if:

- the authenticated identity is not the expected synthetic actor;
- the new request is not created in `submitted`;
- routing or assignment is unexpectedly populated;
- the request scope does not match Participant D;
- more than one request is created;
- the goal target is archived or no longer matches the verified scope;
- more than one target field is populated;
- reviewer link creation is required;
- Participant D cannot read the active link;
- the reviewer cannot read the active link;
- immutable target mutation succeeds;
- archival changes immutable fields;
- archival fails to create the expected event;
- Participant D can read the archived link;
- a rejected action creates a false archive event;
- the harness cannot be relocked;
- the build fails;
- unrelated files become staged;
- any action would require service-role access.

## Still-frozen areas

This candidate does not include:

- linking staged financial transactions;
- linking budget categories;
- linking budget periods;
- linking wellness check-ins;
- linking prior Support requests;
- reviewer-created links;
- request acknowledgment;
- request completion;
- request archival;
- direct status-event update;
- direct status-event deletion;
- request deletion;
- entry deletion;
- link deletion;
- second update to an archived link;
- unarchiving a link;
- automated cleanup;
- service-role access;
- real supported-person data;
- Johnny activation;
- Trust Engine synchronization;
- notifications;
- emergency workflow;
- external sharing;
- push;
- merge;
- deployment.

## Approval boundary

Approval of this document would authorize only the ordered gates above.

It would not authorize:

- a different target type;
- a different participant;
- changes to live policies or functions;
- request lifecycle transitions beyond initial submitted creation;
- any later Path B slice;
- production installation.

## Candidate closeout requirement

After execution, prepare a review-only third-slice validation closeout containing:

- every tested action;
- every rejected action;
- new Support request ID;
- created link ID;
- surviving request state;
- surviving archived-link state;
- `link_archived` event ID;
- participant and reviewer visibility reconciliation;
- build status;
- `git diff --check`;
- `git status`;
- commit checkpoint;
- exact next gate.

Do not move into request completion, request archival, delete proofs, or another target type without a separate inspected candidate and explicit approval.
