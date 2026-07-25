# THRIVE Supported-Person Identity RLS Test-Data Installation Verification Checklist v0.1

## Status

Review-only installation verification checklist.

This document does not authorize:

- permanent controlled fixture installation;
- execution of the installation candidate;
- profile creation;
- use of the temporary supported-person route;
- authenticated RLS testing;
- Johnny onboarding;
- explanation-table work;
- Trust Engine access or synchronization;
- service-role application access;
- push, merge, or deployment.

## Purpose

Define the exact pre-install, execution, and post-install verification steps for
the permanent controlled supported-person RLS test fixtures.

The fixture installation remains a separate approval gate.

## Approved Candidate Identity

- Repository: `thrive-stability-platform`
- Branch: `main`
- Commit checkpoint: `38101a9`
- Artifact:
  `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_RLS_TEST_DATA_INSTALL_CANDIDATE_v0_1.sql`
- SHA-256:
  `0cc8cc46f0ef2f92545277847d47184d7b56321c9c6ae10b7c1e3be4dcd39895`

## Target Environment

Immediately before any future execution, confirm:

```text
Organization: DSS Enterprises
Project: thrive-stewardship-stability-platform
Environment: main / production
Database: Primary Database
Role: postgres
```

Stop if any value differs.

## Installation Scope

The candidate is designed to install exactly:

```text
1 controlled test workspace
5 controlled workspace memberships
1 controlled test program
2 controlled supported-person records
2 controlled program-participation records
0 synthetic profile rows
0 outsider memberships
```

The candidate must not create:

- authentication users;
- profiles;
- Johnny records;
- Trust Engine records;
- explanation records;
- clinical, recovery, legal, or financial records.

## Controlled Fixture IDs
Workspace:
71000000-0000-4000-8000-000000000001

Program:
71000000-0000-4000-8000-000000000002

Supported person A:
71000000-0000-4000-8000-000000000003

Supported person B:
71000000-0000-4000-8000-000000000004

Participation A:
71000000-0000-4000-8000-000000000005

Participation B:
71000000-0000-4000-8000-000000000006

## Controlled Authentication UUIDs
Administrator:
3c0300e6-c4e9-4a84-b668-4a7e39593162

Supported person A:
9b283c6e-c2f8-4f87-9f90-fa081ee249bd

Supported person B:
28cecd10-43ed-4ae5-8668-31cfa515412c

Support member:
7f0a7540-7a6d-4a1a-a29f-7a26c9571db9

Viewer member:
d3782ad5-8e99-4779-8928-0143bd567486

Outsider:
d89a6549-ac1a-431c-aff1-1ba7313175ab

## Final Artifact Verification

Before execution, verify the committed artifact:

```bash
sha256sum \
  docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_RLS_TEST_DATA_INSTALL_CANDIDATE_v0_1.sql

grep -nE \
  '^[[:space:]]*(begin|commit|rollback);[[:space:]]*$' \
  docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_RLS_TEST_DATA_INSTALL_CANDIDATE_v0_1.sql
```

Expected:

```text
SHA-256:
0cc8cc46f0ef2f92545277847d47184d7b56321c9c6ae10b7c1e3be4dcd39895

Transaction statements:
one begin;
one commit;
no rollback;
```

Do not execute if the hash differs.

## Pre-Install Authentication Verification

Run this read-only query:

```sql
with expected_users(role_key, user_id, expected_email) as (
  values
    (
      'admin_auth_user_id',
      '3c0300e6-c4e9-4a84-b668-4a7e39593162'::uuid,
      'dstein561+thrive-rls-admin@gmail.com'
    ),
    (
      'person_a_auth_user_id',
      '9b283c6e-c2f8-4f87-9f90-fa081ee249bd'::uuid,
      'dstein561+thrive-rls-person-a@gmail.com'
    ),
    (
      'person_b_auth_user_id',
      '28cecd10-43ed-4ae5-8668-31cfa515412c'::uuid,
      'dstein561+thrive-rls-person-b@gmail.com'
    ),
    (
      'support_auth_user_id',
      '7f0a7540-7a6d-4a1a-a29f-7a26c9571db9'::uuid,
      'dstein561+thrive-rls-support@gmail.com'
    ),
    (
      'viewer_auth_user_id',
      'd3782ad5-8e99-4779-8928-0143bd567486'::uuid,
      'dstein561+thrive-rls-viewer@gmail.com'
    ),
    (
      'outsider_auth_user_id',
      'd89a6549-ac1a-431c-aff1-1ba7313175ab'::uuid,
      'dstein561+thrive-rls-outsider@gmail.com'
    )
)
select
  e.role_key,
  e.user_id,
  u.email,
  u.email = e.expected_email as email_matches,
  u.email_confirmed_at is not null as email_confirmed
from expected_users e
left join auth.users u
  on u.id = e.user_id
order by e.role_key;
```

Expected:

six rows;
every UUID resolves;
every email_matches is true;
every email_confirmed is true.

Stop if any row is missing or mismatched.

## Pre-Install Conflict Verification

Run this read-only query:

```sql
select
  'workspace' as record_type,
  count(*) as existing_count
from public.workspaces
where id = '71000000-0000-4000-8000-000000000001'::uuid

union all

select
  'workspace_members',
  count(*)
from public.workspace_members
where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid
   or user_id in (
     '3c0300e6-c4e9-4a84-b668-4a7e39593162'::uuid,
     '9b283c6e-c2f8-4f87-9f90-fa081ee249bd'::uuid,
     '28cecd10-43ed-4ae5-8668-31cfa515412c'::uuid,
     '7f0a7540-7a6d-4a1a-a29f-7a26c9571db9'::uuid,
     'd3782ad5-8e99-4779-8928-0143bd567486'::uuid,
     'd89a6549-ac1a-431c-aff1-1ba7313175ab'::uuid
   )

union all

select
  'program',
  count(*)
from public.programs
where id = '71000000-0000-4000-8000-000000000002'::uuid

union all

select
  'supported_people',
  count(*)
from public.supported_people
where id in (
  '71000000-0000-4000-8000-000000000003'::uuid,
  '71000000-0000-4000-8000-000000000004'::uuid
)

union all

select
  'program_participants',
  count(*)
from public.program_participants
where id in (
  '71000000-0000-4000-8000-000000000005'::uuid,
  '71000000-0000-4000-8000-000000000006'::uuid
)

union all

select
  'profiles',
  count(*)
from public.profiles
where id in (
  '3c0300e6-c4e9-4a84-b668-4a7e39593162'::uuid,
  '9b283c6e-c2f8-4f87-9f90-fa081ee249bd'::uuid,
  '28cecd10-43ed-4ae5-8668-31cfa515412c'::uuid,
  '7f0a7540-7a6d-4a1a-a29f-7a26c9571db9'::uuid,
  'd3782ad5-8e99-4779-8928-0143bd567486'::uuid,
  'd89a6549-ac1a-431c-aff1-1ba7313175ab'::uuid
);
```

Expected:

```text
workspace:             0
workspace_members:     0
program:               0
supported_people:      0
program_participants:  0
profiles:              0
```

Stop if any count differs.

## Execution Approval Requirement

Do not execute the artifact until explicit approval identifies:

commit 38101a9;
- exact artifact path;
- exact SHA-256;
- target organization, project, environment, and role;
- permission to create only the controlled fixture records;
- prohibition on profiles, Johnny records, Trust Engine access, and route use.

## Installation Execution Procedure

After explicit approval:

1. Open a new Supabase SQL Editor tab.
Confirm the verified project and postgres role.
3. Copy the complete committed artifact.
Confirm the script begins with begin;.
Confirm the script ends its transaction with commit;.
Confirm no rollback; exists.
7. Run the complete artifact once.
8. Do not run a selected portion.
9. Do not edit the SQL in the Supabase editor.
10. Stop on any error.

Supabase may display only the final result set from the multi-statement script.

## Immediate Post-Install Count Verification

Run this read-only query separately after successful execution:

```sql
select
  'workspace' as record_type,
  count(*) as installed_count
from public.workspaces
where id = '71000000-0000-4000-8000-000000000001'::uuid

union all

select
  'workspace_members',
  count(*)
from public.workspace_members
where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid

union all

select
  'outsider_memberships',
  count(*)
from public.workspace_members
where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid
  and user_id = 'd89a6549-ac1a-431c-aff1-1ba7313175ab'::uuid

union all

select
  'program',
  count(*)
from public.programs
where id = '71000000-0000-4000-8000-000000000002'::uuid

union all

select
  'supported_people',
  count(*)
from public.supported_people
where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid

union all

select
  'program_participants',
  count(*)
from public.program_participants
where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid

union all

select
  'profiles',
  count(*)
from public.profiles
where id in (
  '3c0300e6-c4e9-4a84-b668-4a7e39593162'::uuid,
  '9b283c6e-c2f8-4f87-9f90-fa081ee249bd'::uuid,
  '28cecd10-43ed-4ae5-8668-31cfa515412c'::uuid,
  '7f0a7540-7a6d-4a1a-a29f-7a26c9571db9'::uuid,
  'd3782ad5-8e99-4779-8928-0143bd567486'::uuid,
  'd89a6549-ac1a-431c-aff1-1ba7313175ab'::uuid
);
```

Expected:

workspace:             1
workspace_members:     5
outsider_memberships:  0
program:               1
supported_people:      2
program_participants:  2
profiles:              0

## Membership Verification

Run:

```sql
select
  wm.user_id,
  u.email,
  wm.member_role,
  wm.status
from public.workspace_members wm
join auth.users u
  on u.id = wm.user_id
where wm.workspace_id = '71000000-0000-4000-8000-000000000001'::uuid
order by wm.member_role, u.email;
```

Expected role distribution:

admin:       1
individual:  2
support:     1
viewer:      1
outsider:    no row

All five memberships must be active.

## Outsider Verification

Run:

```sql
select
  count(*) as outsider_membership_count
from public.workspace_members
where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid
  and user_id = 'd89a6549-ac1a-431c-aff1-1ba7313175ab'::uuid;
```

Expected:

outsider_membership_count: 0

## Workspace and Program Verification

Run:

```sql
select
  id,
  name,
  workspace_type,
  status,
  created_by
from public.workspaces
where id = '71000000-0000-4000-8000-000000000001'::uuid;
```

select
  id,
  workspace_id,
  program_name,
  program_type,
  status,
  created_by
from public.programs
where id = '71000000-0000-4000-8000-000000000002'::uuid;

Expected workspace:

```text
name: SUPPORTED PERSON RLS TEST
workspace_type: demo
status: active
```

Expected program:

program_name: SUPPORTED PERSON PROGRAM TEST
program_type: demo
status: active
workspace_id: 71000000-0000-4000-8000-000000000001

## Supported-Person Verification

Run:

```sql
select
  id,
  workspace_id,
  auth_user_id,
  display_name,
  preferred_name,
  status,
  external_reference,
  created_by
from public.supported_people
where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid
order by display_name;
```

Expected two rows:

```text
SUPPORTED PERSON TEST A
auth_user_id: 9b283c6e-c2f8-4f87-9f90-fa081ee249bd
status: active
external_reference: RLS-TEST-PERSON-A

SUPPORTED PERSON TEST B
auth_user_id: 28cecd10-43ed-4ae5-8668-31cfa515412c
status: active
external_reference: RLS-TEST-PERSON-B
```

No real-person identity data may appear.

## Participation Verification

Run:

```sql
select
  id,
  workspace_id,
  program_id,
  supported_person_id,
  participant_role,
  status,
  created_by
from public.program_participants
where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid
order by supported_person_id;
```

Expected:

exactly two rows;
both use the controlled workspace;
both use the controlled program;
one references test person A;
one references test person B;
both have participant_role = 'supported_person';
both have status = 'active'.

## Profile Verification

Run:

```sql
select
  id,
  display_name,
  email,
  role_label
from public.profiles
where id in (
  '3c0300e6-c4e9-4a84-b668-4a7e39593162'::uuid,
  '9b283c6e-c2f8-4f87-9f90-fa081ee249bd'::uuid,
  '28cecd10-43ed-4ae5-8668-31cfa515412c'::uuid,
  '7f0a7540-7a6d-4a1a-a29f-7a26c9571db9'::uuid,
  'd3782ad5-8e99-4779-8928-0143bd567486'::uuid,
  'd89a6549-ac1a-431c-aff1-1ba7313175ab'::uuid
);
```

Expected:

```text
0 rows
```

Do not create profile rows to make the result look complete.

## Failure Stop Rules

Stop immediately if:

- the artifact hash differs;
- the wrong environment or role is open;
- any pre-install count is nonzero;
- any synthetic auth user is missing or mismatched;
- the script reports an error;
- fewer or more than five memberships exist;
- the outsider receives membership;
- profile rows are created;
- supported-person or participation counts differ;
- any real-person or Johnny record appears;
- any Trust Engine data appears;
- an unexpected update or deletion occurs.

Do not run cleanup SQL or rerun the installer after a failure.

Capture the exact error and observed database state before preparing the smallest
review-only correction candidate.

## Route Boundary

Successful fixture installation does not authorize opening or using:

```text
/supported-person-test
```

Authenticated RLS testing remains a separate approval gate after installation
verification is documented.

## Installation Success Criteria

Fixture installation passes only when:

- the approved artifact hash matches;
- all pre-install counts are zero;
- all six synthetic auth users are verified;
- the complete artifact executes without error;
- exactly one controlled workspace exists;
- exactly five controlled memberships exist;
- the outsider has no membership;
- exactly one controlled program exists;
- exactly two supported-person records exist;
- exactly two participation records exist;
- no synthetic profile rows exist;
- no Johnny or Trust Engine records are involved.

## Approval Status

```text
Permanent fixture installation verification checklist prepared for review.
Permanent fixture installation has not been approved.
The installation candidate has not been executed.
No profile rows have been created.
The temporary route has not been used.
Authenticated RLS testing has not begun.
Johnny onboarding has not been approved.
Trust Engine synchronization has not been approved.
```

## Next Gate

Review and commit this checklist.

After separate explicit approval, run the final read-only pre-install checks.

Only after those checks pass may execution approval be requested for the exact
artifact at commit `38101a9` and SHA-256
`0cc8cc46f0ef2f92545277847d47184d7b56321c9c6ae10b7c1e3be4dcd39895`.

Do not execute the installation candidate during this checklist gate.
