# THRIVE Support Request Path B Fifth-Slice Routing and Assignment Candidate v0.1

## Status

Review-only candidate.

This document proposes the smallest safe next browser-authenticated validation for routing and assignment on the existing synthetic Support request. It does not authorize execution, completion, archival, withdrawal, schema changes, policy changes, service-role use, Johnny activation, Trust Engine synchronization, notification workflow, push, merge, or deployment.

## Verified starting state

Current committed checkpoint:

`169449b Document Support Path B fourth-slice validation`

Existing synthetic Support request:

`bac7360c-0a4e-4ceb-9e73-cb17c83b50c0`

Verified live surviving request state:

- Status: `in_progress`
- Routing category: `null`
- Assigned member ID: `null`
- Withdrawn at: `null`
- Completed at: `null`
- Archived at: `null`

Verified synthetic participant:

- Email: `dstein561+thrive-onboarding-person-d@gmail.com`
- Auth user ID: `d48b7268-9aa6-4498-a923-2851fd5232c9`
- Supported-person ID: `71000000-0000-4000-8000-000000000009`

Verified active Support reviewer:

- Email: `dstein561+thrive-rls-support@gmail.com`
- Auth user ID: `7f0a7540-7a6d-4a1a-a29f-7a26c9571db9`
- Workspace-member ID: `cca88550-bac5-49b2-92a6-d5d9e19dd8ea`

Verified scope:

- Workspace ID: `71000000-0000-4000-8000-000000000001`
- Program ID: `71000000-0000-4000-8000-000000000002`
- Supported-person ID: `71000000-0000-4000-8000-000000000009`

## Live control findings

The live database and inspected harness support separate reviewer-controlled updates for:

- `routing_category`
- `assigned_member_id`

The live assignment guard requires the assigned member to be:

- in the same workspace;
- active;
- role `admin` or `support`.

The verified synthetic active Support member satisfies those requirements:

`cca88550-bac5-49b2-92a6-d5d9e19dd8ea`

The routing category must use the controlled vocabulary already enforced by the live constraint.

The proposed routing value for this slice is:

`goal_support`

This value is consistent with the request context and the live allowed routing vocabulary.

## Candidate purpose

Validate only one routing update and one assignment update for the existing synthetic request.

The candidate is designed to answer six narrow questions:

1. Can the authorized Support reviewer set `routing_category` from `null` to `goal_support`?
2. Does that update leave request status, assignment, scope, participant-authored content, and lifecycle timestamps unchanged?
3. Does exactly one `routing_changed` event appear?
4. Can the authorized Support reviewer set `assigned_member_id` from `null` to the verified active Support member?
5. Does that update leave request status, routing, scope, participant-authored content, and lifecycle timestamps unchanged?
6. Does exactly one `assignment_changed` event appear?

## Proposed execution scope

### Included

- active Support reviewer identity check;
- baseline request read;
- baseline status-event read;
- one routing update:
  - `null -> goal_support`
- routing reconciliation read;
- routing audit-event reconciliation;
- one assignment update:
  - `null -> cca88550-bac5-49b2-92a6-d5d9e19dd8ea`
- assignment reconciliation read;
- assignment audit-event reconciliation;
- final request read;
- final status-event read;
- harness relock;
- production build;
- `git diff --check`;
- `git status --short`;
- review-only closeout documentation.

### Excluded

- changing request status;
- completion;
- archival;
- participant withdrawal;
- changing routing a second time;
- clearing routing;
- changing assignment a second time;
- clearing assignment;
- assigning another Support member;
- assigning the active admin;
- assigning an inactive or removed member;
- assigning a member from another workspace;
- editing participant-authored fields;
- editing scope;
- entries;
- links;
- delete proofs;
- direct event writes;
- schema changes;
- policy changes;
- trigger changes;
- function changes;
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
3. The request still exists.
4. Request status is still `in_progress`.
5. `routing_category` is still `null`.
6. `assigned_member_id` is still `null`.
7. `withdrawn_at` is still `null`.
8. `completed_at` is still `null`.
9. `archived_at` is still `null`.
10. The active Support reviewer identity matches exactly.
11. The active Support workspace-member ID remains:
   `cca88550-bac5-49b2-92a6-d5d9e19dd8ea`
12. The target workspace member is still active.
13. The target workspace member still has role `support` or `admin`.
14. The target workspace member is still in workspace:
   `71000000-0000-4000-8000-000000000001`
15. The harness exposes separate controls for routing and assignment.
16. The routing control sends only `routing_category`.
17. The assignment control sends only `assigned_member_id`.
18. Status-event reads remain read-only.
19. A production build passes after any actual harness code change.
20. The harness is enabled only after the exact controls and payloads are reviewed and committed.

If any precondition fails, stop and reconcile before execution.

## Recommended harness hardening

The current general-purpose controls are technically capable of performing these updates, but the safest fifth-slice execution should use two dedicated guarded controls:

```text
Set routing to goal support
Assign verified Support member
```

Each control should:

- require the existing Support request ID;
- read the request first;
- verify the exact expected baseline;
- update only one approved field;
- use a second database filter for the expected current value;
- return baseline, payload, and updated request;
- stop when the request no longer matches the approved fifth-slice state.

## Proposed guarded routing behavior

### Guarded routing action

Expected starting state:

```text
status = in_progress
routing_category = null
assigned_member_id = null
withdrawn_at = null
completed_at = null
archived_at = null
```

Approved payload:

```json
{
  "routing_category": "goal_support"
}
```

Recommended update filters:

```text
id = bac7360c-0a4e-4ceb-9e73-cb17c83b50c0
routing_category IS NULL
status = in_progress
```

Expected returned state:

```text
status = in_progress
routing_category = goal_support
assigned_member_id = null
withdrawn_at = null
completed_at = null
archived_at = null
```

Stop if:

- routing is already populated;
- assignment is already populated;
- request status is not `in_progress`;
- any lifecycle timestamp is populated;
- request scope or participant-authored content differs from the verified baseline.

## Proposed guarded assignment behavior

### Guarded assignment action

Expected starting state:

```text
status = in_progress
routing_category = goal_support
assigned_member_id = null
withdrawn_at = null
completed_at = null
archived_at = null
```

Approved payload:

```json
{
  "assigned_member_id": "cca88550-bac5-49b2-92a6-d5d9e19dd8ea"
}
```

Recommended update filters:

```text
id = bac7360c-0a4e-4ceb-9e73-cb17c83b50c0
assigned_member_id IS NULL
status = in_progress
routing_category = goal_support
```

Expected returned state:

```text
status = in_progress
routing_category = goal_support
assigned_member_id = cca88550-bac5-49b2-92a6-d5d9e19dd8ea
withdrawn_at = null
completed_at = null
archived_at = null
```

Stop if:

- assignment is already populated;
- routing is not exactly `goal_support`;
- request status is not `in_progress`;
- any lifecycle timestamp is populated;
- request scope or participant-authored content differs from the verified baseline.

## Proposed controlled steps

### Gate 1: Reviewer identity

Sign in as the verified active Support reviewer.

Expected:

- Email: `dstein561+thrive-rls-support@gmail.com`
- Auth user ID: `7f0a7540-7a6d-4a1a-a29f-7a26c9571db9`

Pass condition:

- identity matches exactly.

Stop condition:

- any different, missing, or ambiguous identity.

### Gate 2: Baseline request read

Read request:

`bac7360c-0a4e-4ceb-9e73-cb17c83b50c0`

Expected:

```text
status = in_progress
routing_category = null
assigned_member_id = null
withdrawn_at = null
completed_at = null
archived_at = null
```

Record:

- current `updated_at`;
- current event count;
- current event IDs;
- current participant-authored fields;
- current scope.

Pass condition:

- baseline matches exactly.

Stop condition:

- any mismatch.

### Gate 3: Baseline event read

Read all current request events.

Record:

- event count;
- event IDs;
- event types;
- ordering;
- current latest event timestamp.

Pass condition:

- existing history is readable and internally consistent.

Stop condition:

- unreadable or contradictory history.

### Gate 4: Set routing to `goal_support`

Use only the dedicated guarded routing control.

Approved payload:

```json
{
  "routing_category": "goal_support"
}
```

Expected request result:

```text
status = in_progress
routing_category = goal_support
assigned_member_id = null
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
- created by;
- created at.

Pass condition:

- update succeeds;
- only routing and system-maintained `updated_at` change.

Stop condition:

- any other field changes;
- any returned error;
- any assignment change;
- any lifecycle timestamp.

### Gate 5: Routing audit-event reconciliation

Read request events.

Expected new event:

```text
event_type = routing_changed
from_status = null
to_status = null
changed_by = 7f0a7540-7a6d-4a1a-a29f-7a26c9571db9
```

Expected event count change:

```text
+1
```

Pass condition:

- exactly one new `routing_changed` event;
- no duplicate event;
- no `assignment_changed` event;
- no `status_changed` event.

Stop condition:

- missing, duplicate, or unexpected event.

### Gate 6: Assign verified Support member

Use only the dedicated guarded assignment control.

Approved payload:

```json
{
  "assigned_member_id": "cca88550-bac5-49b2-92a6-d5d9e19dd8ea"
}
```

Expected request result:

```text
status = in_progress
routing_category = goal_support
assigned_member_id = cca88550-bac5-49b2-92a6-d5d9e19dd8ea
withdrawn_at = null
completed_at = null
archived_at = null
```

Expected unchanged fields:

- workspace ID;
- program ID;
- supported-person ID;
- participant-authored content;
- created by;
- created at.

Pass condition:

- update succeeds;
- only assignment and system-maintained `updated_at` change.

Stop condition:

- any other field changes;
- any returned error;
- any status change;
- any lifecycle timestamp.

### Gate 7: Assignment audit-event reconciliation

Read request events.

Expected new event:

```text
event_type = assignment_changed
from_status = null
to_status = null
changed_by = 7f0a7540-7a6d-4a1a-a29f-7a26c9571db9
```

Expected event count change:

```text
+1
```

Pass condition:

- exactly one new `assignment_changed` event;
- no duplicate event;
- no second routing event;
- no status event.

Stop condition:

- missing, duplicate, or unexpected event.

### Gate 8: Final request reconciliation

Read the request.

Expected final surviving state:

```text
status = in_progress
routing_category = goal_support
assigned_member_id = cca88550-bac5-49b2-92a6-d5d9e19dd8ea
withdrawn_at = null
completed_at = null
archived_at = null
```

Pass condition:

- final request state matches exactly;
- scope, participant-authored content, and creation lineage remain unchanged.

Stop condition:

- any mismatch.

### Gate 9: Final event reconciliation

Read request events.

Expected exactly two new events for this slice:

1. `routing_changed`
2. `assignment_changed`

Expected actor for both:

`7f0a7540-7a6d-4a1a-a29f-7a26c9571db9`

Pass condition:

- exactly two new events;
- correct order;
- correct actor;
- no duplicate or unrelated event.

Stop condition:

- any mismatch.

### Gate 10: Relock and repository verification

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
routing_category = goal_support
assigned_member_id = cca88550-bac5-49b2-92a6-d5d9e19dd8ea
withdrawn_at = null
completed_at = null
archived_at = null
```

The request must not be completed, withdrawn, or archived.

## Expected audit evidence

Two new request events should exist:

### Routing event

```text
event_type = routing_changed
changed_by = 7f0a7540-7a6d-4a1a-a29f-7a26c9571db9
```

### Assignment event

```text
event_type = assignment_changed
changed_by = 7f0a7540-7a6d-4a1a-a29f-7a26c9571db9
```

No new `status_changed` event should exist.

## Failure handling

If any gate fails:

1. stop immediately;
2. do not attempt a compensating routing or assignment change unless separately reviewed;
3. relock the harness;
4. capture the exact browser result;
5. read the request;
6. read the status events;
7. document the surviving database state;
8. run build and repository checks as applicable;
9. prepare a reconciliation note before proposing further execution.

Do not improvise around a failed routing or assignment action.

## Approval boundary

This document is a candidate only.

Execution requires explicit approval after review of:

- the exact harness controls;
- the exact payloads;
- the baseline reads;
- the workspace-member state;
- the event-read behavior;
- the stop conditions;
- the final surviving-state plan.

Approval of this candidate would not approve completion, archival, withdrawal, reassignment, clearing assignment, rerouting, schema changes, policy changes, service-role use, push, merge, or deployment.

## Exact next gate

Review this fifth-slice candidate against the current harness and verify the live workspace-member state.

Do not enable the harness and do not execute routing or assignment changes until the dedicated controls, payloads, and target workspace-member state are separately inspected and explicitly approved.
