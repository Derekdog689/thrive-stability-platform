# THRIVE Support Request Controlled Test Execution Plan v0.1

## Status

Review-only candidate.

This plan is based on the verified Support schema, the reconciled authenticated test plan v0.2, the six verified synthetic actors, and the currently inspected browser harness functions.

The Support harness remains locked:

```ts
export const SUPPORT_TEST_EXECUTION_ENABLED = false as const;
```

No synthetic Support execution is approved by this document.

## Verified checkpoint

- Commit checkpoint: `fa3bcbb`
- Six required synthetic actors: verified and configured
- Inactive Support reviewer result: `false`
- Production build: passed
- `git diff --check`: clean before the current checkpoint
- Support tables: no synthetic execution started
- Service-role use: prohibited
- Johnny activation: prohibited
- Trust Engine synchronization: prohibited
- Push, merge, and deployment: not approved

## Frozen boundaries

This controlled test pass must not:

- use real participant or staff accounts;
- activate Johnny;
- use service-role credentials;
- create notification or emergency workflows;
- synchronize Support with the Trust Engine;
- mutate linked Goals, Wellness, budget, or financial source records;
- hard delete Support records;
- push, merge, or deploy;
- move from review into execution without separate approval.

## Verified synthetic actors

### Participant D

- Auth user ID: `d48b7268-9aa6-4498-a923-2851fd5232c9`
- Email: `dstein561+thrive-onboarding-person-d@gmail.com`
- Workspace ID: `71000000-0000-4000-8000-000000000001`
- Program ID: `71000000-0000-4000-8000-000000000002`
- Supported-person ID: `71000000-0000-4000-8000-000000000009`
- Expected reviewer result: `false`

### Participant A

- Auth user ID: `9b283c6e-c2f8-4f87-9f90-fa081ee249bd`
- Email: `dstein561+thrive-rls-person-a@gmail.com`
- Workspace ID: `71000000-0000-4000-8000-000000000001`
- Program ID: `71000000-0000-4000-8000-000000000002`
- Supported-person ID: `71000000-0000-4000-8000-000000000003`
- Expected reviewer result: `false`

### Outsider

- Auth user ID: `d89a6549-ac1a-431c-aff1-1ba7313175ab`
- Email: `dstein561+thrive-rls-outsider@gmail.com`
- Expected reviewer result: `false`

### Active Support member

- Auth user ID: `7f0a7540-7a6d-4a1a-a29f-7a26c9571db9`
- Email: `dstein561+thrive-rls-support@gmail.com`
- Workspace member ID: `cca88550-bac5-49b2-92a6-d5d9e19dd8ea`
- Workspace ID: `71000000-0000-4000-8000-000000000001`
- Expected reviewer result: `true`

### Active admin

- Auth user ID: `3c0300e6-c4e9-4a84-b668-4a7e39593162`
- Email: `dstein561+thrive-rls-admin@gmail.com`
- Workspace member ID: `566f964c-9348-457f-88a6-d7e589250390`
- Workspace ID: `71000000-0000-4000-8000-000000000001`
- Expected reviewer result: `true`

### Inactive Support member

- Auth user ID: `a3f99fb6-1642-413b-ae0e-595a9b91f8b2`
- Email: `dstein561+thrive-rls-inactive-support@gmail.com`
- Workspace member ID: `bbe36c06-8856-485f-82ae-d48eb5eb9ded`
- Workspace ID: `71000000-0000-4000-8000-000000000001`
- Membership status: `inactive`
- Verified reviewer result: `false`

## Current harness capability inventory

The inspected harness currently contains these verified operations:

1. Load authenticated browser identity.
2. Create a synthetic Support request.
3. Read a Support request by ID.
4. Withdraw a Support request.
5. Read request entries.
6. Read request links.
7. Read request status events.
8. Attempt a direct status-event insert and capture the returned denial.

The inspected portion does not yet prove that the harness exposes controls for:

- reviewer lifecycle updates;
- routing changes;
- assignment changes;
- entry creation;
- entry archival;
- link creation;
- link archival;
- direct update or delete attempts on status events;
- DELETE attempts on all four Support tables;
- cross-workspace reviewer tests.

These remain test-plan requirements, but they must not be treated as executable harness steps until the corresponding browser functions and controls are inspected or added through a separately approved candidate.

## Execution doctrine

When execution is later approved:

- run one actor at a time;
- run one action at a time;
- capture the authenticated identity before every actor sequence;
- record every created record ID immediately;
- compare actual results against expected results before continuing;
- stop on the first material policy failure;
- do not use a run-all control;
- do not manually repair failed records during the same pass;
- preserve synthetic history through lifecycle and archive fields only.

## Controlled execution phases

## Phase 0: Preflight

Before unlocking the harness:

1. Confirm the branch and commit checkpoint.
2. Confirm the working tree contains only known parked changes.
3. Run `npm run build`.
4. Run `git diff --check`.
5. Confirm the actor configuration contains no passwords, tokens, service-role credentials, Johnny data, or real operational identities.
6. Confirm `supportLinkedRecords` is still empty unless separately verified synthetic linked-record IDs are approved.
7. Confirm all four Support tables contain no unexpected operational records.
8. Confirm the harness lock is still `false`.

Expected result: no execution occurs.

Stop if any actor, scope ID, or repository state differs from the verified checkpoint.

## Phase 1: Harness lock proof

While the lock remains `false`:

1. Open `/support-test`.
2. Attempt each visible action button.
3. Confirm every action is blocked by the review-only lock.
4. Confirm no Support table row is created or changed.

Expected result:

```text
Review-only lock active. Separate approval is required before enabling synthetic execution.
```

This phase may be performed before execution approval because it proves the lock, not Support authority.

## Phase 2: Identity proof

After separate approval to unlock, authenticate each actor individually and run only the identity action.

Required order:

1. Participant D
2. Participant A
3. Outsider
4. Inactive Support member
5. Active Support member
6. Active admin

For each actor, capture:

- email;
- Auth user ID;
- authenticated state;
- expected role relationship;
- expected reviewer result from the previously verified database record.

Do not perform write actions during identity proof.

Stop if the returned Auth user does not match the intended actor.

## Phase 3: Participant D request creation

Authenticate as Participant D.

Use:

- workspace ID: `71000000-0000-4000-8000-000000000001`
- program ID: `71000000-0000-4000-8000-000000000002`
- supported-person ID: `71000000-0000-4000-8000-000000000009`
- participant category: `other`
- participant message: `SYNTHETIC SUPPORT TEST ONLY`
- requested support: `Controlled browser-authenticated Support validation.`
- contact preference: `in_app`

Expected:

- insert succeeds;
- returned status is `submitted`;
- routing category is null;
- assigned member is null;
- withdrawn, completed, and archived timestamps are null;
- one automatic `null -> submitted` status event exists.

Capture immediately:

- request ID;
- created-by Auth user ID;
- created timestamp;
- returned scope fields;
- initial status event ID.

Stop if any returned scope field differs from the configured Participant D scope.

## Phase 4: Read-isolation proof using currently available harness reads

Using the captured Participant D request ID:

### Participant D

Expected:

- request read returns the own request;
- entries read returns only participant-visible entries, initially empty;
- links read returns own active links, initially empty;
- events read returns participant-visible `status_changed` events.

### Participant A

Expected:

- request read returns no rows;
- entries read returns no rows;
- links read returns no rows;
- events read returns no rows.

### Outsider

Expected:

- all four reads return no rows.

### Inactive Support member

Expected:

- reviewer-only visibility is denied;
- all reads return no authorized Support data unless another policy explicitly grants access, which is not expected.

### Active Support member

Expected:

- same-workspace request read succeeds;
- authorized event read succeeds.

### Active admin

Expected:

- same-workspace request read succeeds;
- authorized event read succeeds.

Stop immediately if Participant A, the outsider, or the inactive Support actor can see Participant D data.

## Phase 5: Direct status-event insert denial

Run the harness direct status-event insert proof against the captured Participant D request.

Run as:

1. Participant D
2. Active Support member
3. Active admin
4. Outsider
5. Inactive Support member

Expected for every actor:

- no row is inserted;
- returned error is present;
- status-event table remains unchanged except for trigger-generated events from legitimate request lifecycle actions.

This function currently returns both data and error for inspection. Treat a returned error as the expected pass condition.

Stop if any authenticated actor directly inserts a status event.

## Phase 6: Participant withdrawal

A second Participant D request is required so the primary submitted request remains available for later reviewer workflow.

Authenticate as Participant D:

1. Create a second synthetic request.
2. Capture its request ID.
3. Withdraw that second request.

Expected:

- status changes from `submitted` to `withdrawn`;
- `withdrawn_at` is populated;
- participant-authored content remains unchanged;
- a trigger-generated status event is created;
- later reopening must fail.

The currently inspected harness supports the withdrawal action but does not show a reopening attempt. Reopening remains a required later harness capability or manual browser-client candidate.

## Phase 7: Reviewer workflow

This phase is required by the reconciled test plan but is not yet executable from the inspected harness portion.

Required future operations include:

- reject `submitted -> archived`;
- change `submitted -> acknowledged`;
- set routing category;
- assign an eligible active same-workspace admin or Support member;
- reject viewer, individual, outsider, inactive, removed, trustee, and cross-workspace assignment;
- move through `in_progress`;
- move to `waiting_for_participant`;
- return to `in_progress`;
- complete;
- verify `completed_at`;
- reject reopening;
- archive while preserving `completed_at`.

Before this phase can be approved, inspect or add the exact browser functions and controls through a review-only harness change candidate.

## Phase 8: Entries

This phase is required but not yet executable from the inspected harness portion.

Required future operations:

- reviewer inserts one `participant_response`;
- reviewer inserts one `internal_note`;
- Participant D sees only the participant response;
- Participant A and outsider see neither;
- reviewer sees both;
- content mutation fails;
- archive requires a reason;
- archived participant response disappears from participant view;
- reviewer retains audit visibility;
- hard delete fails.

Before execution, inspect or add exact entry creation, mutation-denial, archive, and delete-proof controls.

## Phase 9: Links

The current harness can read links but the inspected portion does not show link creation or archival controls.

Before link testing:

- independently verify synthetic linked records;
- populate `supportLinkedRecords` only with approved synthetic IDs;
- confirm exact person, program, and workspace scope;
- never use Johnny or operational records.

Required future operations:

- Participant D creates valid same-scope links while request is submitted;
- multiple-target insert fails;
- cross-scope inserts fail;
- self-referencing prior request fails;
- incomplete prior request link fails;
- participant archives one mistaken link with a reason while submitted;
- reviewer reads and archives links;
- no hard delete occurs.

## Phase 10: Status-event update and delete denial

The current harness proves only direct insert denial.

Before this phase, inspect or add exact browser functions for:

- direct status-event update;
- direct status-event delete.

Expected: both fail for all authenticated actors.

## Phase 11: No-delete proof

Before execution, inspect or add browser functions that attempt DELETE against:

- `support_requests`
- `support_request_entries`
- `support_request_links`
- `support_request_status_events`

Run as:

- Participant D
- Active Support member
- Active admin
- Outsider

Expected: every DELETE fails.

Stop immediately if any DELETE succeeds.

## Phase 12: Cross-module boundary proof

Before and after the controlled Support pass, compare the linked source records and relevant module records.

Confirm Support actions do not mutate:

- Goals;
- Wellness check-ins;
- staged transactions;
- budget periods;
- budget categories;
- program participation;
- Trust Engine records.

Support records are observational and administrative. They do not establish intent, irresponsibility, relapse, incapacity, misuse, consent, or legal, clinical, or fiduciary conclusions.

## Evidence log

For each action, record:

| Field | Required value |
|---|---|
| Test step | Sequential step number |
| Actor | Synthetic actor label |
| Email | Authenticated email |
| Auth user ID | Returned browser identity |
| Action | Exact button or function |
| Request ID | Parent Support request |
| Child record ID | Entry, link, or event ID where applicable |
| Expected result | Allow or deny |
| Actual result | Returned data or error |
| Pass/fail | Result |
| Screenshot | File name or evidence reference |
| Notes | Facts only |

Do not place passwords, access tokens, cookies, or service-role credentials in evidence.

## Stop conditions

Stop the entire pass immediately if:

- one participant sees another participant's record;
- the outsider receives Support data;
- the inactive Support member receives reviewer authority;
- an internal note becomes participant-visible;
- a direct status-event write succeeds;
- a terminal request reopens;
- a linked source record changes through Support;
- DELETE succeeds;
- reviewer authority crosses workspace boundaries;
- Johnny data appears;
- a Trust Engine, notification, emergency, or external-sharing action occurs;
- the authenticated user differs from the intended actor;
- test data cannot be distinguished clearly from operational data.

## Closeout

After separately approved execution:

- archive synthetic records through valid lifecycle and archive fields;
- do not hard delete;
- preserve withdrawn and completed timestamps;
- retain synthetic audit events;
- record all actor and record IDs;
- capture pass/fail evidence;
- confirm no service-role client was used;
- rerun the production build;
- run `git diff --check`;
- run `git status --short`;
- prepare an authenticated Support validation closeout candidate;
- do not push, merge, or deploy without separate approval.

## Harness gap reconciliation

The current harness is sufficient for a limited first execution slice:

1. lock proof;
2. actor identity proof;
3. Participant D request creation;
4. request, entry, link, and event read isolation;
5. direct status-event insert denial;
6. Participant D withdrawal.

The current inspected harness is not yet proven sufficient for the full v0.2 test plan.

A separate review-only harness-gap candidate is required before full execution. It should cover reviewer lifecycle controls, assignment, routing, entries, links, direct update/delete denial, and no-delete proof.

## Exact next gate

Review this controlled execution plan and choose one of two bounded paths:

### Path A: limited first execution slice

Approve only the six currently verified harness capabilities listed under Harness gap reconciliation.

The harness lock would remain unchanged until a separate execution approval.

### Path B: full harness completion candidate

Keep the harness locked and prepare one review-only code candidate adding the missing controls required for Gates 6 through 10 of the reconciled test plan.

No execution occurs under either path until separately approved.

## Pass closeout

- Build status: previously passed
- `git diff --check`: previously clean
- Git status: parked unrelated files remain outside scope
- Commit checkpoint: `fa3bcbb`
- Harness execution: disabled
- Synthetic Support execution: not started
- Exact next gate: review this plan and select the limited first slice or the full harness completion candidate
