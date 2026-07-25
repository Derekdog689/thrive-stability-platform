# THRIVE Supported-Person Identity Dry-Run Expected Results v0.1

## Status

Review-only expected-results checklist.

This document does not authorize:

- execution of the dry-run SQL;
- installation of the supported-person schema;
- creation of Johnny's authentication account;
- creation of Johnny's supported-person record;
- creation of Johnny's workspace membership;
- assignment of Johnny to a program;
- insertion of production or test records;
- creation of the personal financial explanation table;
- synchronization with the Trust Engine;
- push, merge, or deployment.

## Governing Artifacts

This checklist applies to:

- `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_DRY_RUN_CANDIDATE_v0_1.sql`
- `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_SCHEMA_CANDIDATE_v0_2.sql`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_SCHEMA_RECONCILIATION_v0_2.md`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_TEST_AND_INSTALLATION_PLAN_v0_1.md`

## Required Execution Boundary

A future approved dry run must:

1. Run against the explicitly approved Supabase project.
2. Use the explicitly approved database role.
3. Begin with `begin;`.
4. Execute only the reviewed dry-run file.
5. Insert no records.
6. Create no authentication users.
7. Use no service-role application access.
8. End with `rollback;`.
9. Leave the live schema unchanged after completion.

## Pre-Run Verification

Before any future execution, confirm:

- [ ] The target project is the THRIVE Stability Platform project.
- [ ] The selected database and branch are correct.
- [ ] The SQL file hash matches the approved artifact.
- [ ] The Git commit containing the artifact is recorded.
- [ ] No unreviewed edits are present.
- [ ] The file begins with `begin;`.
- [ ] The file ends with `rollback;`.
- [ ] No `commit;` statement exists.
- [ ] No `insert into` statement exists.
- [ ] No Johnny-specific record creation exists.
- [ ] No authentication-user creation exists.
- [ ] No explanation-table SQL exists.
- [ ] No Trust Engine synchronization exists.
- [ ] No delete policy exists.

## Expected Table Results During the Transaction

The structural inspection should return these tables:

| Table | Expected during dry run | RLS |
|---|---:|---:|
| `programs` | Existing | Enabled |
| `supported_people` | Temporarily created | Enabled |
| `program_participants` | Temporarily created | Enabled |

The dry run must not create any additional person, trust, clinical, explanation, or financial tables.

## Expected Program Constraint Result

The live `programs` table currently lacks a composite unique constraint on:

```text
(id, workspace_id)

During the dry-run transaction, the inspection should show:

programs_scoped_identity_unique
UNIQUE (id, workspace_id)

The constraint must disappear after the final rollback.

Expected supported_people Constraints

The inspection should show:

 Primary key on id.
 Foreign key from workspace_id to workspaces(id).
 Foreign key from auth_user_id to auth.users(id).
 Foreign key from created_by to auth.users(id).
 Unique nullable auth_user_id.
 Unique (id, workspace_id).
 Nonblank display_name check.
 Nonblank optional preferred_name check.
 Nonblank optional external_reference check.
 Status limited to active, paused, or archived.
 Foreign-key delete behavior is restrict.
Expected program_participants Constraints

The inspection should show:

 Primary key on id.
 Foreign key from workspace_id to workspaces(id).
 Foreign key from created_by to auth.users(id).
 Composite foreign key from (program_id, workspace_id) to programs(id, workspace_id).
 Composite foreign key from (supported_person_id, workspace_id) to supported_people(id, workspace_id).
 Unique (workspace_id, program_id, supported_person_id).
 Scoped identity unique constraint.
 participant_role limited to supported_person.
 Status limited to active, inactive, or completed.
 Foreign-key delete behavior is restrict.
Expected Index Results
supported_people

Expected indexes:

supported_people_pkey
unique index supporting supported_people_auth_user_unique
unique index supporting supported_people_scoped_identity_unique
supported_people_workspace_id_idx
supported_people_auth_user_id_idx
supported_people_workspace_status_idx
supported_people_created_by_idx
program_participants

Expected indexes:

program_participants_pkey
unique index supporting program_participants_person_program_unique
unique index supporting program_participants_scoped_identity_unique
program_participants_workspace_id_idx
program_participants_program_id_idx
program_participants_supported_person_id_idx
program_participants_scope_status_idx
program_participants_created_by_idx

Index names generated automatically for constraints may vary only if PostgreSQL reports the constraint-backed index under the constraint name.

Expected Helper Functions

The inspection should return:

is_supported_person_self(uuid)
is_supported_person_in_workspace(uuid, uuid)
is_program_participant_active(uuid, uuid, uuid)
set_supported_person_identity_updated_at()
protect_supported_person_identity_scope()
protect_program_participant_scope()

Expected properties:

 All functions use search_path=public.
 The three access helpers are SECURITY DEFINER.
 is_supported_person_self is marked STABLE.
 Execute permission on access helpers is limited to authenticated.
 Public execution privilege is revoked from access helpers.
Expected Trigger Results
supported_people

Expected triggers:

set_supported_people_updated_at
protect_supported_person_identity_scope

Expected timing:

BEFORE UPDATE
program_participants

Expected triggers:

set_program_participants_updated_at
protect_program_participant_scope

Expected timing:

BEFORE UPDATE
Expected RLS Policies
supported_people

Expected policies:

supported_people_select_self
supported_people_select_workspace_admins
supported_people_insert_workspace_admins
supported_people_update_workspace_admins

Not expected:

any workspace-member-wide read policy;
any supported-person self-insert policy;
any supported-person self-update policy;
any delete policy.
program_participants

Expected policies:

program_participants_select_self
program_participants_select_workspace_admins
program_participants_insert_workspace_admins
program_participants_update_workspace_admins

Not expected:

any workspace-member-wide read policy;
any supported-person self-insert policy;
any supported-person self-update policy;
any delete policy.
Expected Policy Logic
Supported-person self-read

Expected logic:

is_supported_person_self(id)

This should require:

the authenticated user to match auth_user_id;
the supported-person record to have status = active.
Administrator access

Expected logic:

is_workspace_admin(workspace_id)

This should require:

active workspace membership;
member_role = admin;
matching authenticated user.
Participation creation

Expected checks:

administrator controls the workspace;
program belongs to the workspace;
program is active;
supported person belongs to the workspace;
supported person is not archived;
created_by = auth.uid().
Expected Absences

The dry-run transaction must not contain or create:

Johnny's name or identifiers;
authentication users;
profiles;
workspace memberships;
supported-person records;
participation records;
financial observations;
explanation records;
trust records;
trustee decisions;
consent records;
approval records;
delete policies;
service-role operations;
external-system synchronization.
Expected Rollback Result

After rollback;, a separate read-only verification must confirm:

 supported_people does not exist.
 program_participants does not exist.
 programs_scoped_identity_unique does not remain.
 Supported-person helper functions do not remain.
 Supported-person triggers do not remain.
 Supported-person policies do not remain.
 Existing programs, workspaces, workspace_members, and profiles remain unchanged.
 Existing RLS policies remain unchanged.
 No records were inserted.
 No authentication accounts were created.
Failure Conditions

The dry run must be treated as failed if:

any SQL statement errors;
the transaction cannot reach rollback;
an expected table, constraint, function, trigger, or policy is missing;
a broad workspace-member policy appears;
a delete policy appears;
a cross-workspace relationship is structurally possible;
an unexpected object remains after rollback;
any record is inserted;
the live schema differs from its pre-run state.

A failed dry run does not authorize repair SQL or manual cleanup.

The resulting live state must first be inspected and documented.

Evidence Required From a Future Dry Run

## Evidence Required From a Future Dry Run

Capture:

- execution date and time;
- target Supabase project;
- database role;
- approved Git commit;
- SQL artifact name;
- SQL artifact hash;
- complete SQL result;
- table inspection result;
- constraint inspection result;
- index inspection result;
- helper-function inspection result;
- trigger inspection result;
- RLS policy inspection result;
- rollback verification result;
- confirmation that no records were inserted;
- confirmation that no Johnny data was used;
- confirmation that no Trust Engine access occurred.

## Approval Status

```text
Expected-results checklist prepared for review.
Dry-run SQL has not been executed.
Schema installation has not been approved.
Johnny onboarding has not been approved.
Trust Engine synchronization has not been approved.
```
## Next Gate

Review the dry-run SQL candidate and expected-results checklist together.

After explicit approval, prepare a separate preflight verification artifact or approve the exact controlled dry-run execution.

Do not execute SQL without separate explicit approval.
