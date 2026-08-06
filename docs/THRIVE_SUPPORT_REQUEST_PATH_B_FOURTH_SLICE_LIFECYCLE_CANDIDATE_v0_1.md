# THRIVE Support Request Path B Fourth-Slice Lifecycle Candidate v0.1

## Status

Review-only candidate.

This document proposes the smallest safe next browser-authenticated lifecycle validation for the existing synthetic Support request. It does not authorize execution, production installation, schema changes, policy changes, push, merge, deployment, or expansion into still-frozen lifecycle areas.

## Verified starting state

Current committed checkpoint:

`adcde2c Document Support Path B third-slice validation`

Existing synthetic Support request:

`bac7360c-0a4e-4ceb-9e73-cb17c83b50c0`

Verified current request state:

- Status: `submitted`
- Routing category: `null`
- Assigned member ID: `null`
- Withdrawn at: `null`
- Completed at: `null`
- Archived at: `null`

Verified actors:

### Participant D

- Email: `dstein561+thrive-onboarding-person-d@gmail.com`
- Auth user ID: `d48b7268-9aa6-4498-a923-2851fd5232c9`
- Supported-person ID: `71000000-0000-4000-8000-000000000009`

### Active Support reviewer

- Email: `dstein561+thrive-rls-support@gmail.com`
- Auth user ID: `7f0a7540-7a6d-4a1a-a29f-7a26c9571db9`
- Workspace-member ID: `cca88550-bac5-49b2-92a6-d5d9e19dd8ea`

Verified scope:

- Workspace ID: `71000000-0000-4000-8000-000000000001`
- Program ID: `71000000-0000-4000-8000-000000000002`
- Supported-person ID: `71000000-0000-4000-8000-000000000009`

## Live lifecycle findings

The live database allows the following reviewer-controlled active-state transitions relevant to this candidate:

```text
submitted -> in_progress
in_progress -> waiting_for_participant
waiting_for_participant -> in_progress
```

The live database does not require an intermediate `acknowledged` state before `in_progress`.

The following controls were verified:

- participant-authored identity, scope, and content are immutable;
- only an authorized Support reviewer may perform reviewer-controlled transitions;
- rejected transitions occur before the audit-event trigger;
- each successful status change creates one `status_changed` event;
- `completed_at`, `withdrawn_at`, and `archived_at` remain null for active states;
- `updated_at` is maintained automatically;
- archived requests are terminal;
- completion, withdrawal, and archive behavior remain outside this candidate.

## Candidate purpose

Validate only the reversible active-work lifecycle path for one existing synthetic request:

```text
submitted
  -> in_progress
  -> waiting_for_participant
  -> in_progress
```

This slice is designed to answer four narrow questions:

1. Can an authorized Support reviewer move a submitted request directly to `in_progress`?
2. Can that reviewer move the request to `waiting_for_participant`?
3. Can that reviewer return it to `in_progress`?
4. Does each successful transition create exactly one correct audit event without altering frozen fields?

## Proposed execution scope

### Included

- reviewer authentication;
- reviewer read of the current request;
- request status transition from `submitted` to `in_progress`;
- reconciliation read;
- status-event read;
- request status transition from `in_progress` to `waiting_for_participant`;
- reconciliation read;
- status-event read;
- request status transition from `waiting_for_participant` back to `in_progress`;
- final reconciliation read;
- final status-event read;
- harness relock;
- build and repository verification;
- review-only closeout documentation.

### Excluded

- `submitted -> acknowledged`;
- `acknowledged -> any state`;
- completion;
- request archival;
- participant withdrawal;
- assignment changes;
- routing changes;
- edits to participant-authored fields;
- edits to scope;
- request deletion;
- status-event deletion;
- link deletion;
- policy changes;
- trigger changes;
- function changes;
- schema changes;
- service-role use;
- real supported-person data;
- Johnny activation;
- Trust Engine synchronization;
- notifications;
- emergency workflow;
- external sharing;
- push;
- merge;
- deployment.

## Preconditions

Execution must not begin unless all of the following are verified immediately before the first mutation:

1. The harness is locked before preparation.
2. The working tree is reconciled and unrelated parked files remain untouched.
3. The current request still exists.
4. The current request status is still `submitted`.
5. `routing_category` is still null.
6. `assigned_member_id` is still null.
7. `withdrawn_at` is still null.
8. `completed_at` is still null.
9. `archived_at` is still null.
10. The active Support reviewer identity matches the verified synthetic reviewer.
11. The harness exposes exact controls for:
   - reading one request;
   - updating only the request status;
   - reading request status events.
12. No control silently changes assignment, routing, timestamps, scope, or participant-authored content.
13. A production build passes after any actual harness code change.
14. The harness is enabled only after the reviewed controls are committed.

If any precondition fails, stop and reconcile before execution.

## Proposed controlled steps

### Gate 1: Reviewer identity

Sign in as the verified active Support reviewer.

Expected identity:

- Email: `dstein561+thrive-rls-support@gmail.com`
- Auth user ID: `7f0a7540-7a6d-4a1a-a29f-7a26c9571db9`

Pass condition:

- authenticated identity matches exactly.

Stop condition:

- any different user, missing user, or ambiguous identity.

### Gate 2: Baseline request read

Read request:

`bac7360c-0a4e-4ceb-9e73-cb17c83b50c0`

Expected baseline:

```text
status = submitted
routing_category = null
assigned_member_id = null
withdrawn_at = null
completed_at = null
archived_at = null
```

Record:

- `updated_at`;
- current event count;
- current status-event IDs.

Pass condition:

- baseline matches exactly.

Stop condition:

- any unexpected status, assignment, routing value, lifecycle timestamp, or scope change.

### Gate 3: Transition `submitted -> in_progress`

Update only:

```text
status = in_progress
```

No other field should be supplied by the browser control.

Expected returned state:

```text
status = in_progress
withdrawn_at = null
completed_at = null
archived_at = null
```

Expected unchanged fields:

- workspace ID;
- program ID;
- supported-person ID;
- participant category;
- participant message;
- requested support;
- contact preference;
- routing category;
- assigned member ID;
- created by;
- created at.

Pass condition:

- update succeeds;
- only status and system-maintained `updated_at` change;
- active-state lifecycle timestamps remain null.

Stop condition:

- any unexpected field changes;
- any returned error;
- any assignment or routing change;
- any completion, withdrawal, or archive timestamp.

### Gate 4: First audit-event reconciliation

Read request status events.

Expected new event:

```text
event_type = status_changed
from_status = submitted
to_status = in_progress
changed_by = active Support reviewer auth user ID
```

Pass condition:

- exactly one new matching event exists;
- no duplicate event exists;
- no assignment or routing event was created.

Stop condition:

- missing event;
- duplicate event;
- wrong actor;
- wrong from/to status;
- unexpected event type.

### Gate 5: Transition `in_progress -> waiting_for_participant`

Update only:

```text
status = waiting_for_participant
```

Expected returned state:

```text
status = waiting_for_participant
withdrawn_at = null
completed_at = null
archived_at = null
```

Expected unchanged fields:

- identity;
- scope;
- participant-authored content;
- routing;
- assignment;
- creation lineage.

Pass condition:

- update succeeds;
- only status and `updated_at` change;
- lifecycle timestamps remain null.

Stop condition:

- any unexpected field changes or event behavior.

### Gate 6: Second audit-event reconciliation

Expected new event:

```text
event_type = status_changed
from_status = in_progress
to_status = waiting_for_participant
changed_by = active Support reviewer auth user ID
```

Pass condition:

- exactly one new matching event exists;
- no duplicate event exists;
- no routing or assignment event exists.

Stop condition:

- missing, duplicate, or incorrect event.

### Gate 7: Transition `waiting_for_participant -> in_progress`

Update only:

```text
status = in_progress
```

Expected returned state:

```text
status = in_progress
withdrawn_at = null
completed_at = null
archived_at = null
```

Pass condition:

- update succeeds;
- only status and `updated_at` change;
- frozen fields remain unchanged.

Stop condition:

- any unexpected field change or error.

### Gate 8: Final reconciliation

Read the request and status events.

Expected final request state:

```text
status = in_progress
routing_category = null
assigned_member_id = null
withdrawn_at = null
completed_at = null
archived_at = null
```

Expected new third event:

```text
event_type = status_changed
from_status = waiting_for_participant
to_status = in_progress
changed_by = active Support reviewer auth user ID
```

Expected total new events for this slice:

```text
3
```

Expected event sequence:

1. `submitted -> in_progress`
2. `in_progress -> waiting_for_participant`
3. `waiting_for_participant -> in_progress`

Pass condition:

- final request state matches;
- exactly three new status events exist;
- ordering and actors are correct;
- no assignment or routing events were created.

Stop condition:

- any mismatch.

### Gate 9: Relock and repository verification

After browser execution:

1. restore the harness execution flag to `false`;
2. run the production build;
3. run `git diff --check`;
4. run `git status --short`;
5. confirm only expected harness or documentation changes exist;
6. do not push.

## Expected surviving state

If the candidate passes, the request should remain:

```text
status = in_progress
routing_category = null
assigned_member_id = null
withdrawn_at = null
completed_at = null
archived_at = null
```

The request must not be completed, withdrawn, or archived.

## Expected audit evidence

Three new `status_changed` events should exist:

### Event 1

```text
from_status = submitted
to_status = in_progress
```

### Event 2

```text
from_status = in_progress
to_status = waiting_for_participant
```

### Event 3

```text
from_status = waiting_for_participant
to_status = in_progress
```

All three should show:

```text
changed_by = 7f0a7540-7a6d-4a1a-a29f-7a26c9571db9
```

No new `assignment_changed` or `routing_changed` event should exist.

## Failure handling

If any gate fails:

1. stop immediately;
2. do not attempt a compensating lifecycle change unless separately reviewed;
3. relock the harness;
4. capture the exact browser result;
5. read the request;
6. read the status events;
7. document the surviving database state;
8. run build and repository checks as applicable;
9. prepare a reconciliation note before proposing any further execution.

Do not improvise around a failed transition.

## Approval boundary

This document is a candidate only.

Execution requires explicit approval after review of:

- the exact harness controls;
- the exact fields sent by each control;
- the current request baseline;
- the expected audit-event reads;
- the stop conditions;
- the surviving-state plan.

Approval of this candidate would not approve completion, archival, withdrawal, assignment, routing, deletion, policy changes, schema changes, service-role use, push, merge, or deployment.

## Exact next gate

Review this fourth-slice candidate against the current harness.

Do not enable the harness and do not execute any request lifecycle transition until the browser controls and payloads are separately inspected and explicitly approved.
