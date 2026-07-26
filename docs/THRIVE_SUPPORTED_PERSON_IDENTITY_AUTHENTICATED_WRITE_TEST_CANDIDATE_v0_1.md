# THRIVE Supported-Person Identity Authenticated Write-Test Candidate v0.1

## Status

Review-only authenticated write-test candidate.

This document defines future synthetic write tests but does not authorize their
implementation or execution.

No application route, SQL harness, database record, RLS policy, trigger,
function, authentication account, or fixture lifecycle state may be changed
during this documentation gate.

## Verified Starting State

```text
Repository: thrive-stability-platform
Branch: main
Checkpoint: e65ca8b

Supported-person schema: installed
Controlled fixture installation: complete
Authenticated read tests: 6 passed, 0 failed
Temporary route context validation: 6 passed, 0 failed
Synthetic profile rows: 0
Johnny records involved: 0
Trust Engine records involved: 0
```

## Governing Artifacts

- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_RLS_APPLICATION_TEST_PLAN_v0_1.md`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_RLS_TEST_EXECUTION_CHECKLIST_v0_1.md`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_AUTHENTICATED_RLS_READ_TEST_VALIDATION_REPORT_v0_1.md`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_TEMPORARY_ROUTE_CONTEXT_VALIDATION_REPORT_v0_1.md`
- `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_RLS_TEST_DATA_INSTALL_CANDIDATE_v0_1.sql`
- `src/app/supported-person-test/page.tsx`

## Purpose

The next proof should determine whether authenticated write access matches the
installed policies and immutable-scope protections.

The candidate must test the smallest controlled set of permitted and denied
writes using only synthetic fixture records.

The existing read-only route must remain read-only unless a separately reviewed
write-test harness candidate is approved.

## Frozen Person and System Boundary

Testing must not:

- use Johnny as an authentication identity or supported person;
- create, update, or link a Johnny record;
- access personal financial observations;
- access clinical, recovery, legal, or private case information;
- create explanation records;
- access or synchronize the Trust Engine;
- use service-role application access;
- disable, bypass, or broadly weaken RLS;
- hard-delete any record.

## Controlled Identities

```text
Administrator:
3c0300e6-c4e9-4a84-b668-4a7e39593162

Supported Person A:
9b283c6e-c2f8-4f87-9f90-fa081ee249bd

Supported Person B:
28cecd10-43ed-4ae5-8668-31cfa515412c

Support Member:
7f0a7540-7a6d-4a1a-a29f-7a26c9571db9

Viewer Member:
d3782ad5-8e99-4779-8928-0143bd567486

Authenticated Outsider:
d89a6549-ac1a-431c-aff1-1ba7313175ab
```

## Controlled Fixture Context

```text
Workspace:
71000000-0000-4000-8000-000000000001

Program:
71000000-0000-4000-8000-000000000002

Supported Person A:
71000000-0000-4000-8000-000000000003

Supported Person B:
71000000-0000-4000-8000-000000000004

Participation A:
71000000-0000-4000-8000-000000000005

Participation B:
71000000-0000-4000-8000-000000000006
```

## Candidate Test Architecture

A future write-test harness may be prepared only after separate approval.

The preferred candidate is a temporary authenticated route separate from the
existing read-only route.

Suggested route:

```text
/supported-person-write-test
```

The write-test harness should:

- use the shared authenticated Supabase client;
- expose only narrowly defined synthetic test actions;
- display the authenticated email and UUID;
- display the selected controlled workspace and program;
- show the exact proposed payload before submission;
- require an explicit confirmation for each isolated action;
- capture the returned row or exact error;
- contain no generic record editor;
- contain no delete control;
- contain no service-role credential;
- contain no Johnny or Trust Engine query;
- remain absent from production navigation.

This document does not authorize creation of that route.

## Test Record Strategy

Permitted-write tests should not alter the two baseline supported-person
fixtures or their two baseline participation records unless the test explicitly
requires a controlled metadata update.

Any future create test should use reserved synthetic IDs and unmistakable labels.

Proposed reserved IDs:

```text
Created supported person:
71000000-0000-4000-8000-000000000007

Created participation:
71000000-0000-4000-8000-000000000008
```

Proposed synthetic label:

```text
SUPPORTED PERSON WRITE TEST C
External reference: RLS-WRITE-TEST-PERSON-C
```

The reserved IDs must be checked for zero conflicts before execution.

## Permitted Administrator Tests

### W1 Administrator Creates Supported Person

Actor: controlled administrator.

Proposed action:

- insert one synthetic supported-person record;
- use the controlled workspace;
- use reserved supported-person ID `71000000-0000-4000-8000-000000000007`;
- leave `auth_user_id` null unless separately justified;
- set `created_by` to the authenticated administrator UUID;
- use unmistakable synthetic labels.

Expected result: allowed.

### W2 Administrator Updates Permitted Supported-Person Metadata

Target: the synthetic record created in W1.

Candidate fields:

- `display_name`;
- `preferred_name`;
- `status`;
- `external_reference`;
- `auth_user_id`, only if a separately approved controlled identity is selected.

Expected result: allowed when policy checks pass.

### W3 Administrator Creates Participation

Target: synthetic supported person created in W1.

Proposed action:

- insert reserved participation ID
  `71000000-0000-4000-8000-000000000008`;
- use the controlled workspace and controlled active program;
- set participant role to `supported_person`;
- set status to `active`;
- set `created_by` to the authenticated administrator UUID.

Expected result: allowed.

### W4 Administrator Updates Participation Status

Target: the synthetic participation created in W3.

Candidate transition:

```text
active -> inactive
```

Expected result: allowed if the installed policy permits the transition.

Restoration or further transition requires separate approval.

## Denied Role Tests

Each denied test must use an isolated request and must not retry automatically.

### W5 Supported Person A Inserts Supported Person

Expected result: denied.

### W6 Supported Person A Updates Own Supported-Person Record

Expected result: denied.

### W7 Supported Person A Inserts Participation

Expected result: denied.

### W8 Supported Person A Updates Own Participation

Expected result: denied.

### W9 Support Member Inserts or Updates Supported Person

Expected result: denied.

### W10 Support Member Inserts or Updates Participation

Expected result: denied.

### W11 Viewer Member Inserts or Updates Supported Person

Expected result: denied.

### W12 Viewer Member Inserts or Updates Participation

Expected result: denied.

### W13 Authenticated Outsider Inserts or Updates Supported Person

Expected result: denied.

### W14 Authenticated Outsider Inserts or Updates Participation

Expected result: denied.

## Immutable-Scope Tests

Immutable tests should target only the synthetic W1 and W3 records.

### W15 Change Supported-Person Workspace

Attempted field:

```text
workspace_id
```

Expected result: denied by immutable-scope enforcement.

### W16 Change Supported-Person Creation Authority

Attempted fields:

```text
created_by
created_at
```

Expected result: denied.

### W17 Change Participation Scope

Attempted fields:

```text
workspace_id
program_id
supported_person_id
participant_role
created_by
created_at
```

Expected result: denied.

## Cross-Workspace Tests

Cross-workspace testing cannot proceed using only the current single controlled
workspace.

A future cross-workspace test requires a separately reviewed candidate defining:

- a second synthetic workspace;
- a second synthetic program;
- controlled memberships;
- reserved record IDs;
- installation and verification steps;
- non-destructive lifecycle disposition.

No second workspace or program is authorized by this candidate.

### W18 Cross-Workspace Program Assignment

Status: deferred pending separate second-workspace candidate.

Expected result when properly constructed: denied.

### W19 Cross-Workspace Supported-Person Assignment

Status: deferred pending separate second-workspace candidate.

Expected result when properly constructed: denied.

## Delete Boundary

No delete test is included in the first executable write-test pass.

A delete attempt would be destructive in intent even when RLS is expected to
deny it.

Any future delete-denial test requires:

- a separate candidate;
- an isolated disposable synthetic record;
- explicit approval;
- proof that no hard delete can occur.

## Pre-Execution Checks

Before any future write test:

1. Verify repository commit and approved artifact hashes.
2. Verify the target Supabase organization, project, environment, and role.
3. Verify the authenticated actor email and UUID.
4. Verify the controlled workspace and program IDs.
5. Verify reserved IDs have zero conflicts.
6. Verify the baseline fixture counts remain unchanged.
7. Verify synthetic profiles remain absent.
8. Verify the harness contains no delete control.
9. Verify the harness contains no service-role credential.
10. Verify no Johnny or Trust Engine references are queried.
11. Run ESLint and a production build.
12. Obtain explicit execution approval.

## Evidence Required Per Test

Capture:

- test ID;
- date and time;
- authenticated email;
- authenticated UUID;
- workspace role;
- target table;
- operation;
- exact payload;
- expected result;
- observed result;
- returned row or exact error;
- before count;
- after count;
- screenshot;
- pass or fail;
- reviewer name.

## Stop Rules

Stop immediately if:

- an expected denial succeeds;
- an unexpected record is created or changed;
- a real person or Johnny record appears;
- Trust Engine data appears;
- profile rows are created;
- service-role access is detected;
- a baseline fixture record is unexpectedly altered;
- an immutable field changes successfully;
- a cross-workspace relationship succeeds;
- a delete occurs;
- the harness submits more than one operation from one confirmation;
- the database state cannot be reconciled.

Do not weaken RLS during testing.

Do not run ad hoc repair SQL.

Capture the exact actor, payload, response, and database state before preparing
the smallest review-only correction candidate.

## Non-Destructive Disposition

No hard deletes are permitted.

After successful testing, a separately approved lifecycle candidate may propose:

- archiving the synthetic W1 supported person;
- setting the W3 participation to `inactive` or `completed`;
- preserving the records as test evidence;
- removing the temporary write-test route only after evidence is documented.

This candidate does not authorize those lifecycle actions.

## Candidate Scope Summary

```text
Documentation-only candidate: yes
Write harness created: no
Database writes authorized: no
SQL execution authorized: no
RLS policy changes authorized: no
Schema changes authorized: no
Hard deletes authorized: no
Johnny records authorized: no
Trust Engine access authorized: no
```

## Approval Status

```text
Authenticated write-test candidate prepared for review.
No write-test route has been created.
No write request has been submitted.
No database record has been changed.
No lifecycle action has been taken.
No cleanup action has been taken.
Johnny onboarding has not been approved.
Trust Engine synchronization has not been approved.
```

## Next Gate

Review and commit this authenticated write-test candidate.

After that documentation checkpoint, choose whether to prepare:

1. A temporary authenticated write-test route candidate.
2. A second-workspace cross-scope test-data candidate.

Neither candidate may be implemented during this documentation gate.
