# THRIVE Support Participant Reply Layer v0.1 Candidate

## Status

Review-only candidate.

No SQL execution, RLS installation, database mutation, push, merge, deployment, Trust Engine synchronization, Johnny activation, or service-role use is performed by this candidate.

## Verified Starting State

Repository:
`Derekdog689/thrive-stability-platform`

Working branch:
`budget-builder-category-v0-1`

Current pushed checkpoint:
`af7dc0c`

Current Support lifecycle already proven through:

`submitted -> acknowledged -> in_progress -> waiting_for_participant`

Current local candidate also contains the reviewer-side reverse transition:

`waiting_for_participant -> in_progress`

The reverse transition has been coded and built but has not yet been exercised in the controlled participant/reviewer test.

The current synthetic request remains in:

`waiting_for_participant`

## Problem Being Solved

The current Support lifecycle allows a reviewer to place a request into:

`waiting_for_participant`

The participant sees:

`Waiting for you`

However, the current Support architecture does not provide the participant with a request-scoped write path for supplying the information the reviewer is waiting for.

This creates an incomplete human workflow.

The missing loop is:

1. reviewer explains what information is needed;
2. request moves to `waiting_for_participant`;
3. participant sees the reviewer request;
4. participant provides the requested information;
5. reviewer reads the participant reply;
6. reviewer decides whether to resume work;
7. request returns to `in_progress`.

The participant must not gain reviewer lifecycle authority.

## Existing Support Entry Model

Current table:

`public.support_request_entries`

Verified durable scope:

- `workspace_id`
- `program_id`
- `supported_person_id`
- `support_request_id`

Existing content fields:

- `entry_type`
- `title`
- `content`

Existing creation lineage:

- `created_by`
- `created_at`

Existing archive fields:

- `archived_at`
- `archive_reason`

The current composite foreign key binds each entry to the exact Support request scope:

`support_request_id + workspace_id + program_id + supported_person_id`

## Existing Entry Types

Current live constraint permits:

- `participant_response`
- `internal_note`

Semantic meaning:

### `participant_response`

Reviewer-authored participant-visible Support communication.

Direction:

`reviewer -> participant`

### `internal_note`

Reviewer/internal Support note.

Direction:

`reviewer -> reviewer`

Participant visibility is not provided.

## Candidate Entry Type

Add:

`participant_reply`

Semantic meaning:

Participant-authored response to information requested by Support.

Direction:

`participant -> reviewer`

This entry type must remain request-scoped and must not create lifecycle authority for the participant.

## Candidate Conversation Model

The Support entry ledger becomes:

- `participant_response` = reviewer -> participant
- `participant_reply` = participant -> reviewer
- `internal_note` = reviewer-only

No second messaging table is proposed.

No generic chat subsystem is proposed.

## Supported-Person Identity Rule

Participant reply authority must reuse the existing supported-person identity model.

The authenticated user must resolve to the same supported person through the established self-identity path:

`public.is_supported_person_self(supported_person_id)`

The participant must not be allowed to choose or override arbitrary ownership.

## Candidate Participant INSERT Rule

A participant may insert a `participant_reply` only when all of the following are true:

1. `entry_type = 'participant_reply'`;
2. `created_by = auth.uid()`;
3. `public.is_supported_person_self(supported_person_id)` is true;
4. the composite entry scope matches an existing Support request through the existing foreign key;
5. that exact Support request is currently `waiting_for_participant`;
6. the participant is acting only within their own supported-person scope.

The candidate must not permit participant insertion of:

- `participant_response`;
- `internal_note`;
- entries for another supported person;
- entries for another request scope.

## Candidate Request-State Guard

Participant reply insertion should be valid only while the matching request is:

`waiting_for_participant`

A participant reply must not be accepted while the request is:

- `submitted`
- `acknowledged`
- `in_progress`
- `completed`
- `withdrawn`
- `archived`
- any other non-waiting state

The exact live request lifecycle constraints must be re-inspected before SQL installation.

## Candidate Participant SELECT Rule

The participant should continue to read active reviewer-authored:

`participant_response`

The participant should also be able to read their own active:

`participant_reply`

Participant access must remain limited to their own supported-person scope.

Internal notes remain hidden.

Candidate self-visible entry types:

- `participant_response`
- `participant_reply`

with:

`archived_at is null`

and:

`public.is_supported_person_self(supported_person_id)`

## Reviewer Read Authority

Current reviewer SELECT authority already permits authorized Support reviewers to read Support request entries within their workspace.

The reviewer UI currently does not load or render participant replies.

The candidate therefore requires reviewer application wiring, not broader reviewer SELECT authority unless later live inspection identifies a missing guard.

## Immutability

Current live entry immutability protects:

- workspace scope
- program scope
- supported-person scope
- Support request scope
- entry type
- title
- content
- creator
- creation timestamp

This candidate does not weaken those protections.

Participant replies should be append-only after creation.

## Archive Authority

Current entry archiving is reviewer-controlled.

This candidate does not grant participant archive authority.

A participant must not delete or rewrite a submitted reply.

No hard delete is introduced.

## Participant UI Candidate

Existing route:

`/support`

Existing request card already contains:

- request status
- request details
- Request progress
- Support response

When:

`request.status === 'waiting_for_participant'`

the request card should additionally show a participant reply layer.

Candidate presentation:

### Support response

Reviewer-authored explanation of what is needed.

Example:

`Please confirm your current phone number.`

### Your response

Participant text input.

Candidate controls:

- response text area
- Send response button
- working state
- success/error notice

The reply control must be scoped to the exact Support request card.

## Participant UI Visibility Rule

The reply composer appears only when:

`request.status === 'waiting_for_participant'`

Existing submitted participant replies may remain visible as part of that request's conversation history after the request returns to `in_progress`.

## Participant Hook Candidate

Current participant hook separately loads:

`ParticipantSupportResponse[]`

The smallest candidate should preserve that working path.

Add a separate narrow type:

`ParticipantSupportReply`

Candidate fields:

- `id`
- `workspace_id`
- `program_id`
- `supported_person_id`
- `support_request_id`
- `entry_type: 'participant_reply'`
- `title`
- `content`
- `created_at`

Add separate state:

`participantReplies`

Do not convert the current hook into a generic chat/message abstraction during this layer.

## Participant Reply Creation Candidate

The participant-side write should:

1. verify an authenticated user;
2. require a loaded supported person;
3. require the exact active participation scope;
4. require the request currently displayed as `waiting_for_participant`;
5. insert:
   - exact request workspace;
   - exact request program;
   - exact request supported person;
   - exact Support request ID;
   - `entry_type = 'participant_reply'`;
   - participant content;
   - `created_by = authenticated user ID`;
6. rely on RLS and the composite FK as database enforcement;
7. reload or append the returned participant reply on success.

The client-side status check is usability protection only.

Database enforcement remains authoritative.

## Reviewer UI Candidate

Existing route:

`/admin/support`

Current reviewer UI writes `participant_response` entries but does not currently load request entries for display.

The candidate should add reviewer loading for:

`participant_reply`

Replies should be grouped by:

`support_request_id`

Candidate presentation:

### Participant response

`Participant replied:`

followed by the participant-authored content and created timestamp.

The reviewer must clearly be able to distinguish:

- reviewer participant-visible responses;
- participant replies;
- internal notes.

This layer does not require redesigning internal notes.

## Waiting-for-Participant Rule

`waiting_for_participant` must have an identifiable participant-facing reason.

Reviewer workflow should not treat this status as a generic pause.

Candidate workflow:

1. reviewer writes a participant-visible response explaining what is needed;
2. reviewer moves the request to `waiting_for_participant`;
3. participant sees both:
   - `Waiting for you`;
   - the reviewer response describing the requested action;
4. participant submits `participant_reply`;
5. reviewer reviews the reply;
6. reviewer decides whether the information is sufficient;
7. reviewer selects `Resume work`;
8. status returns to `in_progress`.

Whether steps 1 and 2 must become one atomic database operation remains a separate implementation decision and must be verified before installation.

## Lifecycle Authority Boundary

Participant reply submission must not automatically change request status.

Participant authority:

`provide requested information`

Reviewer authority:

`control Support request lifecycle`

Therefore:

`participant_reply INSERT`

does not automatically perform:

`waiting_for_participant -> in_progress`

The reviewer retains responsibility for selecting:

`Resume work`

## Existing Reverse Transition Candidate

The local reviewer candidate currently contains:

`waiting_for_participant -> in_progress`

This remains appropriate.

It should not be exercised until participant reply functionality is installed and the full human loop can be tested coherently.

## Candidate SQL Change Surface

Review-only SQL work is expected to include only the smallest necessary changes:

1. replace or revise `support_request_entries_type_check` to permit:
   - `participant_response`
   - `participant_reply`
   - `internal_note`

2. add participant self INSERT policy for `participant_reply`;

3. revise participant self SELECT policy to permit active:
   - `participant_response`
   - `participant_reply`;

4. enforce matching request state:
   - `waiting_for_participant`

5. preserve:
   - reviewer INSERT;
   - reviewer SELECT;
   - reviewer archive authority;
   - immutability trigger;
   - no-hard-delete trigger;
   - composite request-scope FK;
   - creation lineage FK.

No broader privilege grant is proposed.

## Candidate Negative Tests

The participant reply layer must reject:

1. anonymous insert;
2. outsider insert;
3. another participant's request;
4. wrong workspace;
5. wrong program;
6. wrong supported person;
7. wrong Support request scope;
8. `created_by` not equal to authenticated user;
9. `entry_type = participant_response`;
10. `entry_type = internal_note`;
11. reply while request is `submitted`;
12. reply while request is `acknowledged`;
13. reply while request is `in_progress`;
14. reply after request is terminal;
15. mutation of reply content after creation;
16. hard delete of reply.

## Candidate Positive Tests

The controlled participant should be able to:

1. read the reviewer request for information;
2. see `Waiting for you`;
3. submit one `participant_reply`;
4. read their submitted reply;
5. reload `/support` and still see the reply.

The authorized reviewer should be able to:

1. read the participant reply;
2. identify the exact request it belongs to;
3. distinguish it from reviewer-authored responses;
4. select `Resume work`;
5. transition:
   `waiting_for_participant -> in_progress`.

## Audit Expectations

Existing Support lifecycle audit behavior remains authoritative for status changes.

Participant reply creation is an entry creation, not a fabricated status event.

No clinical, legal, fiduciary, relapse, incapacity, behavioral, or Trust Engine conclusion is created by a participant reply.

## Trust and THRIVE Boundary

This layer belongs to the THRIVE personal Support spine.

It does not:

- synchronize with the Trust Engine;
- change trustee authority;
- infer intent from financial data;
- create clinical findings;
- establish fiduciary conclusions;
- activate Johnny;
- expand external sharing authority.

## Implementation Gates

### Gate 1 - Candidate

Create and inspect this review-only document.

### Gate 2 - Live Reconciliation

Re-inspect live:

- constraint;
- RLS policies;
- relevant functions/triggers;
- Support request lifecycle status rules;
- grants.

### Gate 3 - SQL Candidate

Create review-only SQL candidate and rollback candidate.

Do not execute yet.

### Gate 4 - Application Candidate

Implement smallest participant hook/UI and reviewer-read changes locally.

### Gate 5 - Build

Run:

`npm run build`

Require:

- compilation pass;
- TypeScript pass;
- all routes generated.

### Gate 6 - Database Installation

Only after candidate and live reconciliation agree.

Install the approved smallest SQL/RLS layer.

### Gate 7 - Controlled Test

Use only the existing synthetic Support request and controlled participant/reviewer accounts.

Test:

`reviewer asks -> waiting_for_participant -> participant replies -> reviewer reads -> reviewer resumes -> in_progress`

### Gate 8 - Audit Reconciliation

Verify:

- exact reply row;
- exact creator;
- exact request scope;
- no duplicate rows;
- correct lifecycle audit event on resume;
- no unauthorized visibility.

### Gate 9 - Documentation

Update Support checkpoint documentation.

### Gate 10 - Commit and Verify

Run:

- `git diff --check`
- `npm run build`
- `git status --short`
- scoped diff review

Then create the approved checkpoint commit.

Push only within the explicitly approved Support participant-reply layer and only after final local verification.

## Frozen Boundaries

Remain frozen throughout this layer:

- Johnny activation;
- Trust Engine synchronization;
- unrelated financial work;
- service-role paths;
- hard delete;
- unrelated schema redesign;
- generic chat/message platform;
- unrelated Support lifecycle expansion;
- deployment outside the approved layer.

## Candidate Decision

The smallest coherent architecture is:

`support_request_entries`

with:

`participant_response`
`participant_reply`
`internal_note`

The next gate after document inspection is live reconciliation followed by a review-only SQL candidate.


## Gate 2 Live Reconciliation Correction

Live reconciliation identified one required authority correction before SQL candidate creation.

The existing reviewer INSERT policy currently checks:

`created_by = auth.uid()`

and:

`is_support_reviewer(workspace_id)`

It does not currently restrict `entry_type`.

That is safe under the current two-type constraint, but once `participant_reply` is added to the table constraint, leaving the reviewer INSERT policy unchanged would allow an authorized reviewer to insert an entry labeled `participant_reply`.

That would violate the candidate authorship model.

Therefore the installed candidate must explicitly partition INSERT authority by entry type.

### Reviewer INSERT Authority

Authorized Support reviewers may insert only:

- `participant_response`
- `internal_note`

Reviewer INSERT must not permit:

- `participant_reply`

### Participant INSERT Authority

An authenticated supported person may insert only:

- `participant_reply`

Participant INSERT must not permit:

- `participant_response`
- `internal_note`

The participant reply policy must additionally require:

- `created_by = auth.uid()`;
- `public.is_supported_person_self(supported_person_id)`;
- an exact matching `support_requests` row for the entry scope;
- that matching request currently has status `waiting_for_participant`.

### Revised SQL Change Surface

The smallest SQL candidate must therefore:

1. expand `support_request_entries_type_check` to permit:
   - `participant_response`
   - `participant_reply`
   - `internal_note`;

2. replace or tighten `support_request_entries_insert_reviewers` so reviewers may insert only:
   - `participant_response`
   - `internal_note`;

3. add participant self INSERT authority for:
   - `participant_reply` only;

4. require the exact matching request to be:
   - `waiting_for_participant`;

5. revise participant self SELECT visibility to permit active:
   - reviewer-authored `participant_response`;
   - participant-authored `participant_reply`;

6. preserve reviewer SELECT authority;

7. preserve reviewer-only archive authority;

8. preserve entry immutability;

9. preserve the no-hard-delete trigger;

10. preserve the composite request-scope foreign key.

This correction prevents either side from creating entries attributed semantically to the other side.
