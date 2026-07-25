# THRIVE Supported-Person Identity Dry-Run Validation Report v0.1

## Status

Review-only validation report.

This report documents the completed controlled dry run and successful rollback.

It does not authorize:

- schema installation;
- creation of Johnny's authentication account;
- creation of Johnny's supported-person record;
- creation of Johnny's workspace membership;
- assignment of Johnny to a program;
- insertion of test or production records;
- creation of the personal financial explanation table;
- Trust Engine synchronization;
- push, merge, or deployment.

## Validation Date

July 25, 2026

## Approved Dry-Run Artifact

- Repository: `thrive-stability-platform`
- Branch: `main`
- Approval checkpoint: `0613003`
- Artifact:
  `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_DRY_RUN_CANDIDATE_v0_1.sql`
- Line count: `612`
- SHA-256:
  `d0d273693218c08ad72b8efb884a8174d4f100475a15d9cfdb869546f0322069`

## Execution Environment

The controlled dry run was executed in the verified Supabase environment:

- Organization: `DSS Enterprises`
- Project: `thrive-stewardship-stability-platform`
- Environment: `main / production`
- Database role: `postgres`

The execution was limited to the approved dry-run artifact.

## Transaction Boundary

The approved artifact contained:

- `begin;` at line 21;
- no `commit;`;
- `rollback;` at line 608.

The complete artifact was executed through the final rollback.

## Pre-Run Verification

Before execution, the following were verified:

- repository path and branch;
- approved Git checkpoint;
- artifact path;
- artifact line count;
- artifact SHA-256;
- presence of `begin;`;
- absence of `commit;`;
- presence of final `rollback;`;
- absence of prohibited record inserts;
- absence of authentication-user creation;
- absence of explanation-table creation;
- absence of Trust Engine synchronization;
- absence of broad workspace-member supported-person policies;
- absence of delete policies.

## Live Foundation Before Dry Run

The pre-run live snapshot confirmed:

- `profiles` existed with RLS enabled;
- `workspaces` existed with RLS enabled;
- `workspace_members` existed with RLS enabled;
- `programs` existed with RLS enabled;
- `supported_people` did not exist;
- `program_participants` did not exist;
- `programs_scoped_identity_unique` did not exist;
- no supported-person helper functions existed;
- no supported-person policies existed;
- no supported-person triggers existed.

## Dry-Run Structural Results

### Tables

During the transaction, the dry run successfully created:

- `supported_people`;
- `program_participants`.

RLS was enabled on both proposed tables.

### Program Scope Constraint

During the transaction, the dry run successfully created:

- `programs_scoped_identity_unique`;
- unique scope on `programs(id, workspace_id)`.

### Supported-Person Constraints

The expected supported-person constraints were created, including:

- primary key on `id`;
- workspace foreign key;
- nullable authentication-user foreign key;
- creator foreign key;
- unique nullable `auth_user_id`;
- unique `(id, workspace_id)`;
- status validation;
- nonblank text validation;
- restrictive foreign-key deletion behavior.

### Program-Participant Constraints

The expected participation constraints were created, including:

- primary key on `id`;
- workspace foreign key;
- creator foreign key;
- composite program/workspace foreign key;
- composite supported-person/workspace foreign key;
- unique person/program assignment;
- scoped identity unique constraint;
- participant-role validation;
- status validation;
- restrictive foreign-key deletion behavior.

### Indexes

The expected table, scope, status, creator, authentication-link, and constraint-backed indexes were created during the transaction.

No unexpected supported-person indexes were reported.

### Helper Functions

The expected helper functions were created:

- `is_supported_person_self(uuid)`;
- `is_supported_person_in_workspace(uuid, uuid)`;
- `is_program_participant_active(uuid, uuid, uuid)`;
- `set_supported_person_identity_updated_at()`;
- `protect_supported_person_identity_scope()`;
- `protect_program_participant_scope()`.

The access helpers used `SECURITY DEFINER` and `search_path=public` as expected.

### Triggers

The following triggers were created successfully:

#### `supported_people`

- `set_supported_people_updated_at`;
- `protect_supported_person_identity_scope`.

#### `program_participants`

- `set_program_participants_updated_at`;
- `protect_program_participant_scope`.

All four triggers were attached as `BEFORE UPDATE` triggers.

### RLS Policies

The expected supported-person policies were created:

- `supported_people_select_self`;
- `supported_people_select_workspace_admins`;
- `supported_people_insert_workspace_admins`;
- `supported_people_update_workspace_admins`.

The expected participation policies were created:

- `program_participants_select_self`;
- `program_participants_select_workspace_admins`;
- `program_participants_insert_workspace_admins`;
- `program_participants_update_workspace_admins`.

The dry run did not create:

- broad workspace-member supported-person read policies;
- supported-person self-insert policies;
- supported-person self-update policies;
- delete policies.

## Record-Safety Result

The dry run created no:

- supported-person records;
- participation records;
- authentication accounts;
- profiles;
- workspace memberships;
- financial observations;
- explanation records;
- trust records;
- consent records;
- production test data.

No Johnny data was used.

No Trust Engine access or synchronization occurred.


## Rollback Result

The dry run reached the required final `rollback;`.

Post-rollback verification returned:

```text
supported_people: NULL
program_participants: NULL
```

Additional post-rollback checks returned the expected absence of:

- programs_scoped_identity_unique;
- supported-person helper functions;
- supported-person policies;
- supported-person triggers.

The existing foundation schema remained unchanged.

## Validation Decision

The controlled dry run passed.

The v0.2 supported-person schema candidate is structurally capable of being created inside the verified live database transaction and fully removed by rollback.

This result establishes dry-run readiness only.

It does not authorize installation.

## Preserved Boundaries

The dry-run result does not authorize:

- installing the supported-person schema;
- creating Johnny's authentication account;
- creating Johnny's supported-person record;
- creating Johnny's workspace membership;
- assigning Johnny to a program;
- creating the explanation table;
- synchronizing with the Trust Engine;
- creating delete policies;
pushing, merging, or deploying.
## Next Gate

Review and approve this validation report.

After separate approval, prepare only a review-only supported-person schema installation candidate and installation verification checklist.

Do not execute installation SQL.
