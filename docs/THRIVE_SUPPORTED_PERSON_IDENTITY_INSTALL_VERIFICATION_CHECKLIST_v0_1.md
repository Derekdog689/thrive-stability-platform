# THRIVE Supported-Person Identity Installation Verification Checklist v0.1

## Status

Review-only installation verification checklist.

This document does not authorize:

- execution of installation SQL;
- creation of Johnny's authentication account;
- creation of Johnny's supported-person record;
- creation of Johnny's workspace membership;
- assignment of Johnny to a program;
- insertion of test or production records;
- creation of the personal financial explanation table;
- Trust Engine synchronization;
- push, merge, or deployment.

## Governing Artifacts

This checklist applies to:

- `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_INSTALL_CANDIDATE_v0_1.sql`
- `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_DRY_RUN_CANDIDATE_v0_1.sql`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_DRY_RUN_VALIDATION_REPORT_v0_1.md`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_DRY_RUN_EXPECTED_RESULTS_v0_1.md`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_TEST_AND_INSTALLATION_PLAN_v0_1.md`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_SCHEMA_RECONCILIATION_v0_2.md`

## Installation Boundary

A future approved installation may create schema objects only.

It may create:

- `supported_people`;
- `program_participants`;
- the supporting unique constraint on `programs(id, workspace_id)`;
- approved helper functions;
- approved triggers;
- approved indexes;
- approved RLS policies.

It may not create:

- Johnny's authentication account;
- Johnny's profile;
- Johnny's workspace membership;
- Johnny's supported-person record;
- Johnny's program participation;
- test or production person records;
- financial explanation records;
- Trust Engine connections;
- delete policies.

## Pre-Installation Repository Verification

Before any installation execution, confirm:

- [ ] Repository is `thrive-stability-platform`.
- [ ] Current branch is recorded.
- [ ] Current Git commit is recorded.
- [ ] Installation artifact path is exact.
- [ ] Installation artifact SHA-256 is recorded.
- [ ] Installation artifact line count is recorded.
- [ ] `git diff --check` is clean.
- [ ] All tracked and untracked changes are understood.
- [ ] The `docs/RENEWING/` package remains outside installation scope.
- [ ] No unreviewed changes were made after approval.

## Installation Artifact Verification

Confirm:

- [ ] File begins with `begin;`.
- [ ] File ends with `commit;`.
- [ ] No `rollback;` statement exists.
- [ ] No `insert into` statement exists.
- [ ] No `delete from` statement exists.
- [ ] No `truncate` statement exists.
- [ ] No authentication-user creation exists.
- [ ] No Johnny-specific data exists.
- [ ] No explanation-table SQL exists.
- [ ] No Trust Engine synchronization exists.
- [ ] No service-role application activity exists.
- [ ] No delete policy exists.
- [ ] No broad workspace-member supported-person read policy exists.

## Target Environment Verification

Before execution, record and reconfirm:

- Supabase organization;
- Supabase project;
- database environment;
- database branch;
- database role;
- authorized operator;
- execution date and time.

Expected environment from the dry run:

```text
Organization: DSS Enterprises
Project: thrive-stewardship-stability-platform
Environment: main / production
Database role: postgres
```

The environment must be reverified immediately before execution.

Pre-Installation Live Schema Snapshot

Before installation, confirm:

 profiles exists with RLS enabled.
 workspaces exists with RLS enabled.
 workspace_members exists with RLS enabled.
 programs exists with RLS enabled.
 supported_people does not exist.
 program_participants does not exist.
 programs_scoped_identity_unique does not exist.
 supported-person helper functions do not exist.
 supported-person triggers do not exist.
 supported-person policies do not exist.
 the live foundation matches the dry-run validation report.

Any difference is a stop condition.

Expected Installed Tables

After installation, confirm:

Table	Expected state	RLS
supported_people	Present	Enabled
program_participants	Present	Enabled
Expected Program Constraint

Confirm:

 programs_scoped_identity_unique exists.
 It enforces UNIQUE (id, workspace_id).
Expected supported_people Constraints

Confirm:

 Primary key on id.
 Foreign key from workspace_id to workspaces(id).
 Foreign key from auth_user_id to auth.users(id).
 Foreign key from created_by to auth.users(id).
 Unique nullable auth_user_id.
 Unique (id, workspace_id).
 Nonblank display_name validation.
 Nonblank optional preferred_name validation.
 Nonblank optional external_reference validation.
 Status limited to active, paused, or archived.
 Foreign-key delete behavior is restrictive.
Expected program_participants Constraints

Confirm:

 Primary key on id.
 Foreign key from workspace_id to workspaces(id).
 Foreign key from created_by to auth.users(id).
 Composite foreign key from (program_id, workspace_id) to programs(id, workspace_id).
 Composite foreign key from (supported_person_id, workspace_id) to supported_people(id, workspace_id).
 Unique (workspace_id, program_id, supported_person_id).
 Scoped identity unique constraint.
 participant_role limited to supported_person.
 Status limited to active, inactive, or completed.
 Foreign-key delete behavior is restrictive.
Expected Indexes
supported_people

Confirm the expected indexes exist for:

primary key;
unique authentication link;
scoped identity;
workspace;
non-null authentication user;
workspace and status;
creator.
program_participants

Confirm the expected indexes exist for:

primary key;
unique person and program assignment;
scoped identity;
workspace;
program;
supported person;
workspace, program, and status;
creator.
Expected Functions

Confirm these functions exist:

is_supported_person_self(uuid);
is_supported_person_in_workspace(uuid, uuid);
is_program_participant_active(uuid, uuid, uuid);
set_supported_person_identity_updated_at();
protect_supported_person_identity_scope();
protect_program_participant_scope().

Confirm:

 Access helpers are SECURITY DEFINER.
 Functions use search_path=public.
 is_supported_person_self is STABLE.
 Public execution privileges are revoked from access helpers.
 Authenticated execution privileges are granted to access helpers.
Expected Triggers
supported_people

Confirm:

 set_supported_people_updated_at.
 protect_supported_person_identity_scope.
 Both are BEFORE UPDATE.
program_participants

Confirm:

 set_program_participants_updated_at.
 protect_program_participant_scope.
 Both are BEFORE UPDATE.
Expected RLS Policies
supported_people

Confirm:

 supported_people_select_self.
 supported_people_select_workspace_admins.
 supported_people_insert_workspace_admins.
 supported_people_update_workspace_admins.

Confirm absent:

 workspace-member-wide read policy;
 self-insert policy;
 self-update policy;
 delete policy.
program_participants

Confirm:

 program_participants_select_self.
 program_participants_select_workspace_admins.
 program_participants_insert_workspace_admins.
 program_participants_update_workspace_admins.

Confirm absent:

 workspace-member-wide read policy;
 self-insert policy;
 self-update policy;
 delete policy.
Record-Safety Verification

Immediately after installation, confirm:

 supported_people contains zero rows.
 program_participants contains zero rows.
- No authentication users were created.
- No profiles were created.
- No workspace memberships were created.
- No program assignments were created.
- No financial observations were modified.
- No explanation records were created.
- No Trust Engine records were read or written.
## Installation Success Criteria

Installation is successful only if:

- every approved schema object exists;
- every approved constraint exists;
- every approved index exists;
- every approved helper function exists;
- every approved trigger exists;
- every approved policy exists;
- no prohibited policy or object exists;
- both new tables contain zero rows;
- the transaction committed successfully;
- existing foundation objects remain unchanged.
## Installation Failure Conditions

Treat installation as failed if:

- any SQL statement errors;
- the transaction does not commit cleanly;
- expected objects are missing;
- unexpected objects appear;
- a broad workspace-member read policy appears;
- a delete policy appears;
- any records are inserted;
- any Johnny data is created;
- the live foundation differs unexpectedly;
- Trust Engine or explanation-table activity occurs.

Do not perform ad hoc cleanup before inspecting and documenting the resulting live state.

## Recovery Boundary

If installation fails before commit, the transaction should roll back.

If an unexpected committed state appears:

1. Stop.
2. Inspect the live state.
3. Document every installed or missing object.
4. Do not hard-delete records or objects impulsively.
5. Prepare a separate reviewed correction or recovery candidate.
6. Obtain explicit approval before recovery execution.

## Evidence Required

Capture:

- approved Git commit;
- installation artifact path;
- installation artifact SHA-256;
- target Supabase project;
- database role;
- authorized operator;
- execution date and time;
- full SQL execution result;
- table and RLS results;
- constraints;
- indexes;
- functions;
- triggers;
- policies;
- row counts;
- confirmation of no Johnny records;
- confirmation of no Trust Engine access;
- `git diff --check`;
- `git status`;
- final commit checkpoint.

## Approval Status
```text
Installation candidate prepared for review.
Installation execution has not been approved.
Johnny onboarding has not been approved.
Record creation has not been approved.
Explanation-table creation has not been approved.
Trust Engine synchronization has not been approved.
Push, merge, and deployment have not been approved.
```

## Next Gate

Review the installation candidate and verification checklist together.

After explicit approval, prepare and complete the exact installation preflight.

Do not execute installation SQL without separate explicit approval.
