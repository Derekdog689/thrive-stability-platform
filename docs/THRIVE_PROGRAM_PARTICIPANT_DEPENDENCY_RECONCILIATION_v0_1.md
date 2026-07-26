# THRIVE Program Participant Dependency Reconciliation v0.1

## Status

Live dependency inspection complete.

This document reconciles the current `program_participants` and `supported_people` schemas, indexes, lifecycle constraints, and RLS policies against the participant-linked `programs` SELECT policy candidate.

No SQL was executed and no database policy was changed during this pass.

## Verified `program_participants` Schema

Columns:

- `id uuid not null`
- `workspace_id uuid not null`
- `program_id uuid not null`
- `supported_person_id uuid not null`
- `participant_role text not null default 'supported_person'`
- `status text not null default 'active'`
- `created_by uuid not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

## Verified `program_participants` Constraints

- primary key: `program_participants_pkey (id)`
- unique participation identity:
  - `(workspace_id, program_id, supported_person_id)`
- scoped row identity:
  - `(id, workspace_id, program_id, supported_person_id)`
- `workspace_id -> workspaces.id`
- `(supported_person_id, workspace_id) -> supported_people(id, workspace_id)`
- `(program_id, workspace_id) -> programs(id, workspace_id)`
- `created_by -> auth.users.id`
- all foreign-key delete behavior: `ON DELETE RESTRICT`
- allowed participation statuses:
  - `active`
  - `inactive`
  - `completed`
- allowed participant role:
  - `supported_person`

## Verified `program_participants` Indexes

- `program_participants_workspace_id_idx (workspace_id)`
- `program_participants_program_id_idx (program_id)`
- `program_participants_supported_person_id_idx (supported_person_id)`
- `program_participants_scope_status_idx (workspace_id, program_id, status)`
- `program_participants_created_by_idx (created_by)`

The candidate lookup by `workspace_id`, `program_id`, and `status` is supported by the existing composite scope-status index.

## Verified `program_participants` Triggers

- `protect_program_participant_scope`
- `set_program_participants_updated_at`

## Verified `program_participants` Policies

### Insert

`program_participants_insert_workspace_admins`

```sql
is_workspace_admin(workspace_id)
AND is_program_in_workspace(program_id, workspace_id)
AND is_supported_person_in_workspace(supported_person_id, workspace_id)
AND created_by = auth.uid()
```

### Self Select

`program_participants_select_self`

```sql
is_supported_person_self(supported_person_id)
```

### Workspace Admin Select

`program_participants_select_workspace_admins`

```sql
is_workspace_admin(workspace_id)
```

### Update

`program_participants_update_workspace_admins`

Using:

```sql
is_workspace_admin(workspace_id)
```

Check:

```sql
is_workspace_admin(workspace_id)
AND is_program_in_workspace(program_id, workspace_id)
AND is_supported_person_in_workspace(supported_person_id, workspace_id)
```

No DELETE policy was observed.

## Verified `supported_people` Schema

Columns:

- `id uuid not null`
- `workspace_id uuid not null`
- `auth_user_id uuid null`
- `display_name text not null`
- `preferred_name text null`
- `status text not null default 'active'`
- `external_reference text null`
- `created_by uuid not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

## Verified `supported_people` Constraints

- primary key: `supported_people_pkey (id)`
- scoped identity: `(id, workspace_id)`
- unique auth link: `(auth_user_id)`
- `workspace_id -> workspaces.id`
- `created_by -> auth.users.id`
- `auth_user_id -> auth.users.id`
- foreign-key delete behavior: `ON DELETE RESTRICT`
- allowed statuses:
  - `active`
  - `paused`
  - `archived`
- display name must not be blank
- preferred name must be null or nonblank
- external reference must be null or nonblank

## Verified `supported_people` Indexes

- `supported_people_workspace_id_idx (workspace_id)`
- `supported_people_auth_user_id_idx (auth_user_id)` where non-null
- `supported_people_workspace_status_idx (workspace_id, status)`
- `supported_people_created_by_idx (created_by)`

The auth-user lookup used by the existing self-identity helper is supported by the partial `auth_user_id` index.

## Verified `supported_people` Triggers

- `protect_supported_person_identity_scope`
- `set_supported_people_updated_at`

## Verified `supported_people` Policies

### Insert

`supported_people_insert_workspace_admins`

```sql
is_workspace_admin(workspace_id)
AND created_by = auth.uid()
```

### Self Select

`supported_people_select_self`

```sql
is_supported_person_self(id)
```

### Workspace Admin Select

`supported_people_select_workspace_admins`

```sql
is_workspace_admin(workspace_id)
```

### Update

`supported_people_update_workspace_admins`

Using:

```sql
is_workspace_admin(workspace_id)
```

Check:

```sql
is_workspace_admin(workspace_id)
```

No DELETE policy was observed.

## Candidate Reconciliation

The v0.1 candidate used a direct join from `program_participants` to `supported_people` and compared `supported_people.auth_user_id` to `auth.uid()`.

That shape is logically valid and supported by indexes.

However, the live database already centralizes supported-person self-identity through:

```sql
is_supported_person_self(supported_person_id)
```

The same helper is already used successfully by:

```text
program_participants_select_self
```

The preferred v0.2 candidate therefore reuses that helper.

Benefits:

- preserves one identity rule rather than duplicating it;
- aligns program visibility with the already-tested participation self-read path;
- reduces policy complexity;
- avoids coupling the program policy directly to `supported_people.auth_user_id`;
- keeps the workspace and program match explicit;
- remains SELECT-only.

## Revised Candidate Logic

A program row is visible to an authenticated user when a qualifying participation exists where:

```sql
pp.program_id = programs.id
AND pp.workspace_id = programs.workspace_id
AND pp.status = 'active'
AND is_supported_person_self(pp.supported_person_id)
```

## Lifecycle Decision

v0.2 remains intentionally narrow:

- participation must be `active`
- supported-person lifecycle is delegated to the existing `is_supported_person_self` identity helper
- program status is not used as an RLS filter

Reasoning:

- the participation row is the current authority-bearing relationship;
- paused or archived program visibility is a product-history decision, not an identity decision;
- no unsupported assumption should be added to the helper’s behavior.

Before installation, inspect the definition of `is_supported_person_self(uuid)` to confirm whether it checks only auth linkage or also lifecycle status.

## Performance Finding

The existing index:

```sql
program_participants_scope_status_idx
  (workspace_id, program_id, status)
```

supports the correlated `EXISTS` lookup.

The unique participation constraint also prevents duplicate active rows for the same workspace, program, and supported person.

No new index is currently justified by the observed schema.

## Security Finding

The revised candidate does not grant:

- workspace membership
- access to unrelated programs
- broad program administration
- INSERT
- UPDATE
- DELETE
- access to other supported people
- access to other participants
- Trust Engine authority
- service-role authority

Existing permissive policies continue to combine by logical OR:

- workspace members keep existing program visibility;
- linked supported people gain only programs connected through qualifying participation.

## Candidate Status

- live dependencies inspected: yes
- candidate revised: yes
- SQL executed: no
- RLS changed: no
- new index proposed: no
- database write performed: no

## Exact Next Gate

Inspect the live definition of:

```sql
is_supported_person_self(uuid)
```

Then perform a final static review of the v0.2 candidate.

If the helper definition matches the expected auth-link identity rule, prepare a controlled installation plan.

Do not install the policy until separately approved.
