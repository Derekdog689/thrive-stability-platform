# THRIVE Supported-Person Identity RLS Test-Data Installation Validation Report v0.1

## Status

Permanent controlled fixture installation completed and verified.

This report documents only the approved supported-person RLS test fixture installation.

It does not authorize:

- use of the temporary supported-person route;
- authenticated RLS testing;
- Johnny onboarding;
- profile creation;
- explanation-table work;
- Trust Engine access or synchronization;
- service-role application access;
- push, merge, or deployment.

## Approved Installation Identity

- Repository: `thrive-stability-platform`
- Branch: `main`
- Installation candidate commit: `38101a9`
- Verification checklist commit: `dcf7ad1`
- Artifact:
  `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_RLS_TEST_DATA_INSTALL_CANDIDATE_v0_1.sql`
- SHA-256:
  `0cc8cc46f0ef2f92545277847d47184d7b56321c9c6ae10b7c1e3be4dcd39895`

## Target Environment

```text
Organization: DSS Enterprises
Project: thrive-stewardship-stability-platform
Environment: main / production
Database: Primary Database
Role: postgres
Pre-Install Verification

The following checks passed before installation:

6 controlled authentication users resolved
6 expected emails matched
6 authentication emails confirmed
workspace conflicts: 0
workspace membership conflicts: 0
program conflicts: 0
supported-person conflicts: 0
participation conflicts: 0
synthetic profile conflicts: 0
Installation Result

The complete approved artifact executed once without reported error.

Transaction verification:

begin: line 31
commit: line 516
rollback: none
Installed Record Counts
workspace:             1
workspace_members:     5
outsider_memberships:  0
program:               1
supported_people:      2
program_participants:  2
profiles:              0
Workspace Verification
id: 71000000-0000-4000-8000-000000000001
name: SUPPORTED PERSON RLS TEST
workspace_type: demo
status: active
created_by: 3c0300e6-c4e9-4a84-b668-4a7e39593162
Program Verification
id: 71000000-0000-4000-8000-000000000002
workspace_id: 71000000-0000-4000-8000-000000000001
program_name: SUPPORTED PERSON PROGRAM TEST
program_type: demo
status: active
created_by: 3c0300e6-c4e9-4a84-b668-4a7e39593162
Membership Verification
admin:       1 active
individual:  2 active
support:     1 active
viewer:      1 active
outsider:    no membership

Controlled members:

3c0300e6-c4e9-4a84-b668-4a7e39593162  admin
9b283c6e-c2f8-4f87-9f90-fa081ee249bd  individual
28cecd10-43ed-4ae5-8668-31cfa515412c  individual
7f0a7540-7a6d-4a1a-a29f-7a26c9571db9  support
d3782ad5-8e99-4779-8928-0143bd567486  viewer

The controlled outsider UUID has no workspace membership:

d89a6549-ac1a-431c-aff1-1ba7313175ab
Supported-Person Verification

Test person A:

id: 71000000-0000-4000-8000-000000000003
auth_user_id: 9b283c6e-c2f8-4f87-9f90-fa081ee249bd
display_name: SUPPORTED PERSON TEST A
preferred_name: Test A
status: active
external_reference: RLS-TEST-PERSON-A
created_by: 3c0300e6-c4e9-4a84-b668-4a7e39593162

Test person B:

id: 71000000-0000-4000-8000-000000000004
auth_user_id: 28cecd10-43ed-4ae5-8668-31cfa515412c
display_name: SUPPORTED PERSON TEST B
preferred_name: Test B
status: active
external_reference: RLS-TEST-PERSON-B
created_by: 3c0300e6-c4e9-4a84-b668-4a7e39593162

No real-person identity data was installed.

Participation Verification
71000000-0000-4000-8000-000000000005
supported_person_id: 71000000-0000-4000-8000-000000000003
participant_role: supported_person
status: active

71000000-0000-4000-8000-000000000006
supported_person_id: 71000000-0000-4000-8000-000000000004
participant_role: supported_person
status: active

Both participation rows use:

workspace_id: 71000000-0000-4000-8000-000000000001
program_id: 71000000-0000-4000-8000-000000000002
created_by: 3c0300e6-c4e9-4a84-b668-4a7e39593162
Profile Verification
synthetic profile rows: 0

No profile rows were created to support this fixture installation.

## Boundary Verification

The installation did not create or authorize:

- Johnny records;
- Trust Engine records;
- explanation records;
- clinical records;
- financial records;
- legal records;
- recovery records;
- service-role application access;
- temporary route use;
- authenticated RLS testing.

## Validation Conclusion

The permanent controlled supported-person RLS fixture installation matches the
approved artifact and verification checklist.

The installed database state is limited to the approved synthetic workspace,
memberships, program, supported people, and participation records.

## Next Gate

Review and commit this validation report.

Authenticated RLS testing remains a separate approval gate.

Do not open `/supported-person-test` and do not begin authenticated RLS testing
until separately approved.
