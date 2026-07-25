# THRIVE Supported-Person Identity Authenticated RLS Application Test Plan v0.1

## Status

Review-only authenticated RLS test plan.

No test identities, authentication accounts, memberships, supported-person
records, participation records, application routes, or SQL are authorized by
this document.

## Purpose

The installed schema has passed structural verification.

The next proof must confirm that authenticated application users receive only
the access intended by the installed RLS policies.

Testing must occur through authenticated application paths rather than relying
only on the Supabase SQL Editor or the `postgres` role.

## Governing Artifacts

- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_POST_INSTALL_VALIDATION_REPORT_v0_1.md`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_INSTALL_VERIFICATION_CHECKLIST_v0_1.md`
- `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_INSTALL_CANDIDATE_v0_1.sql`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_TEST_AND_INSTALLATION_PLAN_v0_1.md`

## Frozen Boundaries

Testing must not use Johnny.

Testing must not:

- create or modify Johnny's authentication account;
- create Johnny's supported-person record;
- create Johnny's workspace membership;
- assign Johnny to a program;
- use personal financial observations;
- create explanation records;
- access or synchronize the Trust Engine;
- use service-role application access;
- disable or bypass RLS;
- hard-delete records.

## Required Controlled Test Identities

Future testing requires clearly marked nonproduction identities:

1. Test workspace administrator
2. Test supported person A
3. Test supported person B
4. Test support-role member
5. Test viewer-role member
6. Authenticated outsider with no test-workspace membership

Every account and record must contain an unmistakable test label.

## Required Test Scope

Use a dedicated nonproduction workspace and program.

Recommended labels:

```text
Workspace: SUPPORTED PERSON RLS TEST
Program: SUPPORTED PERSON PROGRAM TEST
```

The test program must belong to the test workspace and have status = active.

No existing production person record may be reused.

## Required Test Records

After separate approval, create only:

one test workspace;
one active test program;
controlled workspace memberships;
supported-person test record A;
supported-person test record B;
one active program participation for each test supported person.

The test records must contain no real financial, clinical, recovery, legal, or
trust information.

## Application Test Route Boundary

A temporary authenticated application route may be prepared after separate
approval.

Suggested route:

/supported-person-test

The route should provide only the minimum controls needed to prove:

authenticated identity;
selected workspace;
visible supported-person rows;
visible participation rows;
permitted administrator creation and updates;
denied nonadministrator creation and updates;
immutable-scope enforcement;
zero delete capability.

The route must not become a production supported-person interface.

## Test Matrix
### Test 1: Administrator reads supported people

Actor: active administrator in the test workspace.

Expected:

Supported-person A and B are visible.
### Test 2: Administrator reads participation records

Expected:

Participation A and B are visible.
### Test 3: Administrator creates a supported person

Conditions:

administered workspace;
created_by = auth.uid();
clearly marked test identity.

Expected: allowed.

### Test 4: Administrator updates permitted identity metadata

Permitted fields may include:

display_name;
preferred_name;
status;
external_reference;
auth_user_id.

Expected: allowed.

### Test 5: Administrator changes immutable supported-person scope

Attempted fields:

workspace_id;
created_by;
created_at.

Expected: denied by the immutable-scope trigger.

### Test 6: Supported person A reads own identity

Conditions:

signed in as test person A;
auth_user_id linked to person A;
person A status is active.

Expected:

Person A is visible.
Person B is not visible.
### Test 7: Supported person A reads own participation

Expected:

Participation A is visible.
Participation B is not visible.
### Test 8: Supported person A creates or updates identity

Expected: denied.

### Test 9: Supported person A creates or updates participation

Expected: denied.

### Test 10: Supported person A becomes paused or archived

Expected:

Self-read is denied while the supported-person status is not active.

Restoration to active status must be performed only by the authorized test
administrator.

### Test 11: Support-role workspace member reads supported people

Expected: denied solely on the basis of support membership.

### Test 12: Viewer-role workspace member reads supported people

Expected: denied.

### Test 13: Individual member without supported-person linkage reads records

Expected: denied.

### Test 14: Authenticated outsider reads test-workspace records

Expected: denied.

### Test 15: Administrator creates participation

Conditions:

program is active and belongs to the test workspace;
supported person belongs to the test workspace and is not archived;
created_by = auth.uid().

Expected: allowed.

### Test 16: Cross-workspace program assignment

Expected: denied by composite foreign key and policy validation.

### Test 17: Cross-workspace supported-person assignment

Expected: denied by composite foreign key and policy validation.

### Test 18: Assignment to paused or archived program

Expected: denied by is_program_in_workspace().

### Test 19: Assignment of archived supported person

Expected: denied by is_supported_person_in_workspace().

### Test 20: Administrator updates participation status

Permitted examples:

active to inactive;
active to completed;
inactive to active when current policy checks pass.

Expected: allowed.

### Test 21: Administrator changes immutable participation scope

Attempted fields:

workspace_id;
program_id;
supported_person_id;
participant_role;
created_by;
created_at.

Expected: denied by the immutable-scope trigger.

### Test 22: Delete attempt

Expected: denied because no delete policy exists.

## Test Evidence

For every test, capture:

- test number;
- authenticated actor;
- actor workspace role;
- linked supported-person ID when applicable;
- action attempted;
- expected result;
- observed result;
- visible row count;
- relevant error message;
- screenshot or copied response;
- pass or fail decision.

## Cleanup Boundary

No hard deletes are permitted.

After successful testing:

- test supported people should be archived;
- test participation records should be completed or inactive;
- test memberships should be marked inactive or removed according to existing
  membership lifecycle rules;
- temporary routes should be removed only after test evidence is documented;
- test auth accounts require a separately reviewed cleanup decision.

No cleanup action is authorized by this planning document.


## Failure Handling

If an expected denial is allowed, stop testing immediately.

If an expected allowed action is denied:

1. Record the exact actor and request.
2. Capture the full error.
3. Inspect the relevant RLS policy and helper behavior.
4. Do not weaken RLS broadly.
5. Prepare the smallest review-only correction candidate.
6. Obtain approval before any policy change.

## Success Criteria

Authenticated RLS proof passes only if:

- administrators can manage records in administered workspaces;
- linked active supported people can read only their own records;
- supported people cannot create or update managed identity records;
- support and viewer roles receive no broad person access;
- outsiders receive no access;
- cross-workspace relationships are denied;
- immutable fields cannot be changed;
- deletion remains unavailable;
- no production or Johnny data is involved.

## Approval Status
```text
Authenticated RLS application test plan prepared for review.
Test identities have not been created.
Test records have not been created.
Temporary application routes have not been created.
Johnny onboarding has not been approved.
Trust Engine synchronization has not been approved.
```

## Next Gate

Review the post-install validation report and authenticated RLS application test
plan together.

After explicit approval, prepare only:

1. The controlled test-identity and test-data candidate.
2. The temporary authenticated application-test route candidate.
3. The test execution checklist.

Do not create identities, records, or routes during this documentation gate.
