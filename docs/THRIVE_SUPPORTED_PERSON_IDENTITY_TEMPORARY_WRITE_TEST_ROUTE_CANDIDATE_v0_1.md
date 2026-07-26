# THRIVE Supported-Person Identity Temporary Write-Test Route Candidate v0.1

## Status

Review-only temporary authenticated write-test route candidate.

This document defines a possible test harness but does not authorize route
creation, source modification, authenticated writes, SQL execution, lifecycle
changes, cleanup, or deployment.

## Verified Starting State

```text
Repository: thrive-stability-platform
Branch: main
Checkpoint: dbf10f6

Authenticated read tests: passed
Temporary read-route context validation: passed
Authenticated write-test candidate: committed
Write-test route created: no
Database writes authorized: no
Johnny records involved: no
Trust Engine records involved: no
```

## Governing Artifacts

- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_AUTHENTICATED_WRITE_TEST_CANDIDATE_v0_1.md`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_AUTHENTICATED_RLS_READ_TEST_VALIDATION_REPORT_v0_1.md`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_TEMPORARY_ROUTE_CONTEXT_VALIDATION_REPORT_v0_1.md`
- `src/app/supported-person-test/page.tsx`

## Candidate Objective

Define the smallest temporary authenticated harness needed to test the approved
synthetic write cases without turning the application into a general record
editor.

The route must expose only fixed, reviewed test operations.

## Proposed Route

```text
/supported-person-write-test
```

The route must remain absent from normal application navigation.

## Required Authentication Boundary

The route must:

- require an authenticated Supabase session;
- display the signed-in email;
- display the signed-in UUID;
- rely on the shared authenticated Supabase client;
- never import or use a service-role secret;
- never bypass RLS;
- refuse to operate while signed out.

## Controlled Fixture Context

```text
Workspace:
71000000-0000-4000-8000-000000000001

Program:
71000000-0000-4000-8000-000000000002

Baseline Supported Person A:
71000000-0000-4000-8000-000000000003

Baseline Supported Person B:
71000000-0000-4000-8000-000000000004

Reserved Write-Test Supported Person:
71000000-0000-4000-8000-000000000007

Reserved Write-Test Participation:
71000000-0000-4000-8000-000000000008
```

## Route Context Validation

Before enabling any action, the route must:

1. Query workspaces visible to the authenticated user.
2. Verify the controlled workspace is visible.
3. Query programs visible for that workspace.
4. Verify the controlled program is visible.
5. Clear or reject stale local-storage context.
6. Display no trusted context derived solely from browser storage.
7. Disable all write controls when validation fails.

The existing corrected behavior from `/supported-person-test` should be reused
or mirrored rather than independently weakened.

## Actor Classification

The route may display the authenticated actor and observed workspace membership.

It must not assume authority from the email address alone.

The route must derive access through authenticated database queries and allow
RLS to decide whether each submitted operation succeeds.

## Fixed Test Actions

The route candidate may expose only the following named actions.

### Action W1

Administrator creates the reserved synthetic supported person.

### Action W2

Administrator updates permitted metadata on the reserved synthetic supported
person.

### Action W3

Administrator creates the reserved synthetic participation.

### Action W4

Administrator changes the reserved participation status from `active` to
`inactive`.

### Actions W5 Through W14

Controlled denied-role insert and update attempts for:

- supported person A;
- support member;
- viewer member;
- authenticated outsider.

### Actions W15 Through W17

Controlled immutable-scope update attempts against only the reserved synthetic
write-test records.

### Actions W18 and W19

Not included.

Cross-workspace testing remains deferred until a second-workspace candidate is
separately reviewed and approved.

## No Generic Editor

The route must not provide:

- free-form table selection;
- arbitrary column selection;
- arbitrary UUID entry;
- arbitrary JSON editing;
- generic insert controls;
- generic update controls;
- delete controls;
- SQL input;
- RPC selection;
- service-role actions.

Every payload must be fixed in source and visible before confirmation.

## Payload Preview

Before submission, the route must display:

- test ID;
- actor email;
- actor UUID;
- table;
- operation;
- target record ID;
- exact payload;
- expected outcome;
- whether the operation is expected to be allowed or denied.

No operation may submit automatically when the route loads.

## Confirmation Guard

Each write attempt must require:

1. Selection of one named test.
2. Review of the fixed payload.
3. A confirmation checkbox.
4. An explicit button press.
5. A second confirmation prompt containing the test ID.

One confirmation may submit only one database request.

The button must disable while the request is running.

Automatic retries are prohibited.

## Response Evidence

After each request, display:

- test ID;
- authenticated actor;
- start time;
- end time;
- HTTP or client result;
- returned row, if allowed;
- exact Supabase error, if denied;
- before count;
- after count;
- expected result;
- observed result;
- provisional pass or fail.

The route must not silently replace or discard error details.

## Baseline Protection

The route must not use baseline records A or B for permitted create tests.

The route may target baseline records only for explicitly approved denied-role
attempts where no successful change is expected.

Immutable-scope tests should target only the reserved synthetic write-test
records created by W1 and W3.

## Write Ordering

The future approved execution sequence should be:

```text
W1
W2
W3
W4
W5 through W14
W15 through W17
```

Later tests must remain disabled until required earlier synthetic records exist.

## Expected Stop Behavior

The route must immediately lock all remaining actions when:

- an expected denial succeeds;
- an unexpected record is created;
- an immutable field changes;
- a baseline record changes unexpectedly;
- a real person or Johnny record appears;
- Trust Engine data appears;
- a profile row is created;
- a delete occurs;
- service-role use is detected;
- the database state cannot be reconciled.

Unlocking after a failure requires a separately reviewed correction or recovery
candidate.

## Delete Boundary

The route must contain no delete control and no delete client call.

No hard-delete test is included in this candidate.

## Lifecycle Boundary

The route must not:

- archive a supported person;
- complete a participation;
- deactivate memberships;
- pause a workspace;
- pause a program;
- clean up test records.

Lifecycle disposition remains a later separate gate.

## Proposed File Scope

The smallest possible implementation should be limited to:

```text
src/app/supported-person-write-test/page.tsx
```

A shared helper may be proposed only when source inspection proves duplication
would create meaningful risk.

No modification to `/supported-person-test` is proposed.

## Static Verification Requirements

Before any future route use:

- run ESLint on the candidate route;
- run the production build;
- confirm the route appears in the route manifest;
- scan for delete calls;
- scan for RPC calls;
- scan for service-role references;
- scan for Johnny and Trust Engine queries;
- inspect the complete diff;
- confirm only approved files changed.

## Future Execution Preconditions

Before any authenticated write request:

1. Commit the route candidate implementation.
2. Reconcile the exact route source.
3. Verify reserved IDs have zero conflicts.
4. Verify baseline fixture counts.
5. Verify synthetic profiles remain absent.
6. Verify the authenticated identity.
7. Obtain explicit test-execution approval.
8. Run one named test at a time.

## Candidate Scope Summary

```text
Documentation-only candidate: yes
Route implementation authorized: no
Authenticated writes authorized: no
Database writes authorized: no
SQL execution authorized: no
RLS changes authorized: no
Schema changes authorized: no
Delete controls authorized: no
Lifecycle actions authorized: no
Johnny records authorized: no
Trust Engine access authorized: no
```

## Approval Status

```text
Temporary write-test route candidate prepared for review.
No route file has been created.
No application source has been modified.
No write request has been submitted.
No database record has been changed.
No lifecycle action has been taken.
No cleanup action has been taken.
Johnny onboarding has not been approved.
Trust Engine synchronization has not been approved.
```

## Next Gate

Review and commit this route candidate document.

After that documentation checkpoint, explicit approval may be requested to
implement only the temporary route candidate.

Do not create or modify application source during this documentation gate.
