# THRIVE Supported-Person Identity Authenticated RLS Test Execution Checklist v0.1

## Status

Review-only execution checklist.

This document does not authorize:

- creation of authentication accounts;
- creation of profiles;
- replacement of SQL UUID placeholders;
- execution of test-data SQL;
- creation of permanent test records;
- use of the temporary application route;
- Johnny onboarding;
- explanation-table work;
- Trust Engine access or synchronization;
- service-role application access;
- push, merge, or deployment.

## Governing Artifacts

- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_POST_INSTALL_VALIDATION_REPORT_v0_1.md`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_RLS_APPLICATION_TEST_PLAN_v0_1.md`
- `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_RLS_TEST_DATA_CANDIDATE_v0_1.sql`
- `src/app/supported-person-test/page.tsx`

## Required Approval Sequence

Testing must proceed through separate gates:

1. Review and commit the three candidate artifacts.
2. Approve controlled test-auth account creation.
3. Create and verify the six test authentication accounts.
4. Decide whether matching profile rows are needed for application usability.
5. Reconcile the six auth UUIDs into a new execution candidate.
6. Review the resolved execution candidate.
7. Approve installation of controlled test data.
8. Execute and verify test-data installation.
9. Approve temporary route use.
10. Run authenticated RLS tests one identity at a time.
11. Document results.
12. Archive or deactivate test records through a separately approved cleanup gate.

No later step is implied by approval of an earlier step.

## Frozen Person Boundary

Johnny must not be used as:

- a test authentication identity;
- a workspace member;
- a supported-person test record;
- a program participant;
- a source of financial, clinical, recovery, legal, or trust information.

All test records must use unmistakable synthetic labels.

## Required Test Authentication Identities

Six nonproduction identities are required:

| Test identity | Intended condition |
|---|---|
| Test administrator | Active `admin` membership in the test workspace |
| Test supported person A | Active `individual` membership and linked supported-person record A |
| Test supported person B | Active `individual` membership and linked supported-person record B |
| Test support member | Active `support` membership |
| Test viewer member | Active `viewer` membership |
| Test outsider | No membership in the test workspace |

Authentication credentials must not be stored in repository files.

## Required UUID Reconciliation

Before any test-data execution:

- capture each test account's actual `auth.users.id`;
- map each ID to the correct placeholder key;
- verify that no UUID belongs to Johnny or a real production person;
- verify that all six UUIDs are distinct;
- prepare a new resolved SQL execution candidate;
- compute and record its SHA-256;
- review the complete resolved artifact;
- obtain separate execution approval.

The current review candidate must not be edited directly into an executable artifact without a new version and review checkpoint.

## Test-Data Installation Preconditions

Before installation, verify:

- the target Supabase organization;
- the target project;
- the target environment;
- the SQL Editor role;
- the installed supported-person schema;
- zero preexisting rows with the controlled test UUIDs;
- zero conflicting workspace, program, membership, supported-person, or participation IDs;
- all six authentication accounts exist;
- all six placeholder UUIDs are resolved;
- the placeholder guard no longer raises an exception;
- the execution artifact ends with `commit;`, not `rollback;`;
- the exact artifact hash has been approved.

## Expected Controlled Records

After approved installation, expect:

```text
1 test workspace
5 test workspace memberships
1 test program
2 supported-person records
2 program-participation records
1 outsider with no workspace membership
```

The outsider must not receive a workspace membership.

## Post-Installation Verification

Immediately verify:

### Test workspace
name is SUPPORTED PERSON RLS TEST;
type is demo;
status is active;
created_by matches the test administrator.

### Memberships

Verify exactly five memberships:

- administrator;
supported person A as individual;
supported person B as individual;
- support member;
- viewer member.

Verify no outsider membership exists.

### Test program
name is SUPPORTED PERSON PROGRAM TEST;
type is demo;
status is active;
- workspace matches the test workspace.

### Supported people

Verify exactly two controlled rows:

SUPPORTED PERSON TEST A;
SUPPORTED PERSON TEST B.

Both must be active and linked to their respective test auth identities.

### Participation records

Verify exactly two active records:

- person A in the test program;
- person B in the test program.

## Temporary Route Verification

Before authenticated testing:

run npx eslint src/app/supported-person-test/page.tsx;
run npm run build;
confirm /supported-person-test appears in the route manifest;
confirm the route contains no insert, update, upsert, delete, or RPC calls;
confirm it uses the shared authenticated Supabase client;
confirm no service-role credential is imported;
confirm no Johnny or Trust Engine data is queried;
confirm the route remains clearly labeled temporary and read-only.

## Authentication Test Procedure

Run one identity at a time.

Before changing identities:

Sign out through the application.
Confirm the prior session is cleared.
Sign in with the next controlled test account.
Confirm the displayed email and user ID.
Set or confirm the controlled workspace context.
Set or confirm the controlled program context.
Open /supported-person-test.
Reload the authenticated queries.
Capture visible supported-person and participation row counts.
Record the observed result before moving to the next identity.

Do not keep multiple test identities signed in within the same browser profile unless isolated browser containers are deliberately used.

## Read-Test Matrix

### Test administrator

Expected:

Supported people visible: 2
Participation rows visible: 2

### Test supported person A

Expected:

Supported people visible: 1
Visible identity: TEST A only
Participation rows visible: 1
Visible participation: TEST A only

### Test supported person B

Expected:

Supported people visible: 1
Visible identity: TEST B only
Participation rows visible: 1
Visible participation: TEST B only

### Test support member

Expected:

Supported people visible: 0
Participation rows visible: 0

### Test viewer member

Expected:

Supported people visible: 0
Participation rows visible: 0

### Test outsider

Expected:

Supported people visible: 0
Participation rows visible: 0

## Denied Write Tests

The temporary route is read-only and cannot perform write tests.

Any future write-test interface or SQL harness requires a separate candidate and approval.

Required denied behaviors eventually include:

- supported-person self-insert;
- supported-person self-update;
- participant self-insert;
- participant self-update;
- support-role insert or update;
- viewer-role insert or update;
- outsider insert or update;
- cross-workspace assignment;
- immutable-scope modification;
- delete attempts.

Do not add write controls to the temporary route during this gate.

## Pause and Archive Tests

Testing inactive lifecycle behavior requires a separately approved administrator action.

Future controlled tests should verify:

- paused or archived supported person loses self-read;
- inactive or completed participation is handled as designed;
- restoration to active is administrator-controlled;
- no hard delete is used.

## Evidence Required Per Test

Capture:

- test number;
- date and time;
- authenticated test email;
- authenticated user UUID;
- workspace role;
- linked supported-person UUID where applicable;
- selected workspace UUID;
- selected program UUID;
- expected supported-person row count;
- observed supported-person row count;
- expected participation row count;
- observed participation row count;
- visible record labels;
- displayed error, if any;
- screenshot;
- pass or fail decision;
- reviewer initials or name.

## Failure Stop Rules

Stop immediately if:

- one supported person can see the other person's identity;
- support, viewer, or outsider can see supported-person data;
- any actor sees cross-workspace data;
- any production or Johnny data appears;
- the route uses service-role access;
- an expected denial succeeds;
- test records cannot be distinguished from production records;
- an unexpected insert, update, or delete occurs.

Do not weaken RLS during active testing.

Prepare the smallest review-only correction candidate after documenting the exact failure.

## Cleanup Rules

No hard deletes are authorized.

A separately approved cleanup candidate should:

- archive supported-person test records;
- set participation records to `completed` or `inactive`;
- mark memberships `inactive` or `removed`;
- pause or archive the test program;
- pause or archive the test workspace;
- address test authentication accounts through a separately reviewed auth cleanup decision;
- remove the temporary route only after evidence is preserved.

## Success Criteria

The authenticated read proof passes only when:

- the administrator sees both controlled people and both participation rows;
- supported person A sees only A;
- supported person B sees only B;
- support sees no supported-person or participation rows;
- viewer sees no supported-person or participation rows;
- outsider sees no supported-person or participation rows;
- no Johnny, production, Trust Engine, clinical, legal, recovery, or financial data appears;
- no unauthorized write or delete capability is introduced.

## Approval Status
```text
Execution checklist prepared for review.
Authentication accounts have not been created.
UUID placeholders have not been resolved.
Test-data SQL has not been executed.
The temporary route has not been used for testing.
Johnny onboarding has not been approved.
Trust Engine synchronization has not been approved.
```

## Next Gate

Review the controlled test-data SQL candidate, temporary authenticated route candidate, and this execution checklist together.

After explicit approval, commit only these three review artifacts.

Test-auth account creation remains a later, separate approval gate.
