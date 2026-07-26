# THRIVE Supported-Person Identity Authenticated Write-Test Execution Checklist v0.1

## Status

Review-only execution checklist.

This document prepares the controlled execution sequence for authenticated
write tests W1 through W17.

Creating or committing this checklist does not authorize any authenticated
write request.

## Verified Starting State

```text
Repository: thrive-stability-platform
Branch: main
Checkpoint: 47fdac4

Supported-person schema: installed
Permanent synthetic fixture: installed
Authenticated read tests: 6 passed, 0 failed
Temporary route context validation: 6 passed, 0 failed
Temporary write-test route: implemented and committed
Authenticated write requests submitted through route: 0
Johnny records involved: 0
Trust Engine records involved: 0
```

## Governing Artifacts
- `THRIVE_SUPPORTED_PERSON_IDENTITY_AUTHENTICATED_WRITE_TEST_CANDIDATE_v0_1.md`
- `THRIVE_SUPPORTED_PERSON_IDENTITY_TEMPORARY_WRITE_TEST_ROUTE_CANDIDATE_v0_1.md`
- `THRIVE_SUPPORTED_PERSON_IDENTITY_AUTHENTICATED_WRITE_TEST_OUTSIDER_EXCEPTION_v0_1.md`
- `THRIVE_SUPPORTED_PERSON_IDENTITY_TEMPORARY_WRITE_TEST_ROUTE_IMPLEMENTATION_VALIDATION_REPORT_v0_1.md`

## Controlled Fixture Identifiers
Workspace:
71000000-0000-4000-8000-000000000001

Program:
71000000-0000-4000-8000-000000000002

Baseline supported person A:
71000000-0000-4000-8000-000000000003

Baseline supported person B:
71000000-0000-4000-8000-000000000004

Baseline participation A:
71000000-0000-4000-8000-000000000005

Baseline participation B:
71000000-0000-4000-8000-000000000006

Reserved write-test supported person C:
71000000-0000-4000-8000-000000000007

Reserved write-test participation C:
71000000-0000-4000-8000-000000000008

## Controlled Authentication Identities
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

## Global Execution Rules
Use /supported-person-write-test.
Run one named action at a time.
Confirm the authenticated email and UUID before every action.
Review the complete fixed payload before submission.
Use the required confirmation control.
Capture the exact returned row or exact error.
Do not retry automatically.
Stop immediately on an unexpected result.
Do not use service-role credentials.
Do not use Johnny, Trust Engine, financial, clinical, recovery, legal, or private case information.
Do not run deletes.
Do not run W18 or W19.
Do not broaden the payload or use a generic editor.

## Pre-Execution Database Baseline

Before any write execution, verify through an approved read-only method:

Reserved supported person C exists: no
Reserved participation C exists: no
Baseline supported people count: 2
Baseline participation count: 2
Controlled workspace exists: yes
Controlled program exists: yes
Six controlled authentication accounts exist: yes
Profiles created for synthetic identities: 0

Any mismatch stops the pass.


## Execution Order

### Phase A: Administrator Allowed Writes
#### W1 Administrator Creates Supported Person

Actor: administrator

Target table: supported_people

Expected result: allowed

Fixed payload:

```json
{
  "id": "71000000-0000-4000-8000-000000000007",
  "workspace_id": "71000000-0000-4000-8000-000000000001",
  "auth_user_id": null,
  "display_name": "SUPPORTED PERSON WRITE TEST C",
  "preferred_name": "Test C",
  "status": "active",
  "external_reference": "RLS-WRITE-TEST-PERSON-C",
  "created_by": "3c0300e6-c4e9-4a84-b668-4a7e39593162"
}
```

Required evidence:

Authenticated identity:
Payload preview:
Confirmation completed:
Returned row:
Returned error:
Result:

Postcondition:

Reserved supported person C exists: yes
Baseline supported people A and B unchanged: yes

Stop if the insert fails or any non-reserved record changes.

#### W2 Administrator Updates Permitted Supported-Person Metadata

Actor: administrator

Target: reserved supported person C

Expected result: allowed

Approved changes:

```json
{
  "display_name": "SUPPORTED PERSON WRITE TEST C UPDATED",
  "preferred_name": "Test C Updated",
  "external_reference": "RLS-WRITE-TEST-PERSON-C-UPDATED"
}
```

Do not change:

workspace_id
created_by
created_at

Required evidence:

Authenticated identity:
Payload preview:
Confirmation completed:
Returned row:
Returned error:
Result:

Postcondition:

Only approved metadata changed: yes
Workspace remained unchanged: yes
Creation lineage remained unchanged: yes
#### W3 Administrator Creates Participation

Actor: administrator

Target table: program_participants

Expected result: allowed

Fixed payload:

```json
{
  "id": "71000000-0000-4000-8000-000000000008",
  "workspace_id": "71000000-0000-4000-8000-000000000001",
  "program_id": "71000000-0000-4000-8000-000000000002",
  "supported_person_id": "71000000-0000-4000-8000-000000000007",
  "participant_role": "supported_person",
  "status": "active",
  "created_by": "3c0300e6-c4e9-4a84-b668-4a7e39593162"
}
```

Required evidence:

Authenticated identity:
Payload preview:
Confirmation completed:
Returned row:
Returned error:
Result:

Postcondition:

Reserved participation C exists: yes
Participation points only to reserved supported person C: yes
Baseline participation records unchanged: yes
#### W4 Administrator Updates Participation Status

Actor: administrator

Target: reserved participation C

Expected result: allowed

Approved change:

```json
{
  "status": "inactive"
}
```

Required evidence:

Authenticated identity:
Payload preview:
Confirmation completed:
Returned row:
Returned error:
Result:

Postcondition:

Status is inactive: yes
Identity and scope fields unchanged: yes

Stop after W4 for an intermediate verification checkpoint.


### Phase B: Supported Person A Denied Writes

For W5 through W8, authenticate as Supported Person A.

Each action must return an RLS or authorization denial and produce no database
change.

#### W5 Insert Supported Person

Expected result: denied.

#### W6 Update Own Supported-Person Record

Target: baseline supported person A.

Expected result: denied.

#### W7 Insert Participation

Expected result: denied.

#### W8 Update Own Participation

Target: baseline participation A.

Expected result: denied.

After each test record:

Authenticated identity:
Exact action:
Exact payload:
Returned row:
Returned error:
Database changed: no
Result:

### Phase C: Support Member Denied Writes

Authenticate as Support Member.

#### W9 Insert or Update Supported Person

Expected result: denied.

#### W10 Insert or Update Participation

Expected result: denied.

No database change is acceptable.


### Phase D: Viewer Member Denied Writes

Authenticate as Viewer Member.

#### W11 Insert or Update Supported Person

Expected result: denied.

#### W12 Insert or Update Participation

Expected result: denied.

No database change is acceptable.


### Phase E: Authenticated Outsider Denied Writes

Authenticate as the controlled outsider.

The outsider exception permits access only to fixed W13 and W14 denial actions.
It does not grant workspace membership or write authority.

#### W13 Insert or Update Supported Person

Expected result: denied.

#### W14 Insert or Update Participation

Expected result: denied.

Required outsider postcondition:

Workspace membership gained: no
Program access gained: no
Supported-person rows changed: no
Participation rows changed: no

### Phase F: Administrator Immutable-Scope Denials

Authenticate again as administrator.

These actions target only the reserved W1 and W3 records.

#### W15 Change Supported-Person Workspace

Attempt to change:

workspace_id

Expected result: denied by immutable-scope enforcement.

#### W16 Change Supported-Person Creation Authority

Attempt to change:

created_by
created_at

Expected result: denied.

#### W17 Change Participation Scope

Attempt one fixed immutable-scope action at a time against participation C:

workspace_id
program_id
supported_person_id
participant_role
created_by
created_at

Expected result: denied.

The route must not combine multiple ambiguous mutations into one generic edit.


## Deferred Tests
W18 cross-workspace program assignment: deferred
W19 cross-workspace supported-person assignment: deferred

They require a separately reviewed second-workspace fixture candidate.


## Failure Stop Rules

Stop the entire pass immediately if:

an expected allowed action is denied;
an expected denied action succeeds;
the authenticated UUID does not match the intended actor;
a payload differs from the reviewed fixed payload;
a baseline fixture changes unexpectedly;
a reserved record exists before W1 or W3;
an automatic retry occurs;
service-role access appears;
a delete control appears;
Johnny, Trust Engine, financial, clinical, recovery, legal, or private case information appears;
any unexplained database change occurs.

Do not continue to the next numbered action after a stop condition.


## Evidence Package

Capture for each action:

Test number:
Timestamp:
Authenticated email:
Authenticated UUID:
Exact payload:
Expected result:
Returned data:
Returned error:
Observed result:
Database postcondition:
PASS or FAIL:
Screenshot reference:

## Non-Destructive Disposition

No hard deletion is authorized.

After W17, the reserved records remain controlled synthetic evidence until a
separate disposition gate is reviewed and approved.

Potential future disposition states may include:

supported person C: archived
participation C: inactive or completed

No disposition change is authorized by this checklist.


## Execution Approval Status
Checklist prepared: yes
Checklist committed: no
Authenticated W1-W17 execution approved: no
W18-W19 execution approved: no
Delete testing approved: no
Cleanup approved: no
Johnny onboarding approved: no
Trust Engine synchronization approved: no
Push approved: no
Merge approved: no
Deployment approved: no

## Next Gate

Review and commit this execution checklist.

After that documentation checkpoint, request explicit approval for the first
controlled execution phase only:

Phase A: W1 through W4

Do not execute W1 through W17 during this checklist-preparation gate.
