# THRIVE Supported-Person Identity Schema Reconciliation v0.2

## Status

Review-only reconciliation.

No SQL execution, database installation, supported-person creation, authentication account creation, explanation-table creation, Trust Engine synchronization, push, merge, or deployment is authorized by this document.

## Reconciliation Date

July 25, 2026

## Repository State

- Repository: `thrive-stability-platform`
- Branch inspected: `main`
- Candidate source: `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_SCHEMA_CANDIDATE_v0_1.sql`
- Corrected candidate: `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_SCHEMA_CANDIDATE_v0_2.sql`

## Verified Live Foundation

The following live public tables exist:

- `profiles`
- `workspaces`
- `workspace_members`
- `programs`

RLS is enabled on all four tables.

The following proposed tables do not currently exist:

- `supported_people`
- `program_participants`

## Verified Workspace Roles

The live `workspace_members.member_role` constraint permits:

- `admin`
- `trustee`
- `support`
- `individual`
- `viewer`

Johnny's future workspace membership is intended to use `individual`.

Workspace membership remains separate from supported-person identity.

## Verified Helper Functions

### `is_workspace_member(uuid)`

Returns true when the authenticated user has any active membership in the specified workspace.

Because it accepts all active workspace roles, it is not sufficiently narrow for reading every supported person's identity or participation record.

### `is_workspace_admin(uuid)`

Returns true only when the authenticated user has an active `admin` membership in the specified workspace.

This helper is appropriate for supported-person and participation management.

### `is_program_in_workspace(uuid, uuid)`

Returns true only when the program:

- matches the supplied program ID;
- belongs to the supplied workspace;
- has `status = 'active'`.

All three helpers are installed as `SECURITY DEFINER` functions with `search_path=public`.

## Verified Program Constraints

The live `programs` table has:

- primary key `(id)`;
- foreign key from `workspace_id` to `workspaces(id)`;
- no unique constraint on `(id, workspace_id)`;
- no equivalent unique composite index.

A unique `(id, workspace_id)` key is therefore required before `program_participants` can use a scope-preserving composite foreign key to `programs`.

## v0.1 Findings

### Broad workspace-member reads

v0.1 permitted all active workspace members to read supported-person and program-participation records through:

- `supported_people_select_workspace_members`
- `program_participants_select_workspace_members`

This included active users with roles such as `individual`, `viewer`, `support`, or `trustee`.

That access was broader than the approved supported-person boundary.

### Missing structural program scope

v0.1 referenced `programs(id)` directly.

Its RLS policies checked program/workspace alignment, but the table relationship did not permanently enforce that the participation's `program_id` and `workspace_id` identified the same program scope.

### Inconsistent self-read lifecycle

v0.1 allowed direct supported-person self-read through `auth_user_id = auth.uid()`.

The related helper required the supported-person record to have `status = 'active'`.

v0.2 uses the helper consistently for linked-person self-read.

## v0.2 Corrections

The v0.2 candidate:

1. Adds a supporting unique constraint on `programs(id, workspace_id)`.
2. Adds a composite foreign key from `program_participants(program_id, workspace_id)` to `programs(id, workspace_id)`.
3. Retains the composite supported-person/workspace foreign key.
4. Removes broad workspace-member read policies.
5. Adds explicit workspace-administrator read policies.
6. Uses `is_supported_person_self(id)` for linked active self-read.
7. Retains administrator-only inserts and updates.
8. Retains immutable scope and creation-lineage triggers.
9. Retains updated-at triggers.
10. Retains nullable unique `auth_user_id`.
11. Provides no self-create or self-update policies.
12. Provides no delete policies.
13. Ends with `rollback` and remains review-only.

## Intended Access Model

```text
Active workspace administrator
  -> may read supported-person records in the administered workspace
  -> may create supported-person and participation records
  -> may update permitted metadata and lifecycle status
  -> may not hard-delete records through an RLS policy

Linked active supported person
  -> may read their own supported-person identity
  -> may read their own program participation
  -> may not create, assign, update, archive, approve, or delete records

Other active workspace members
  -> receive no supported-person or participation access solely because of workspace membership
```

## Preserved Boundaries

The candidate does not:

- create Johnny's supported-person record;
- create Johnny's authentication account;
- create Johnny's workspace membership;
- assign Johnny to a program;
- create a personal financial explanation table;
- alter imported financial observations;
- merge THRIVE with the Trust Engine;
- establish legal, clinical, fiduciary, trustee, or guardianship authority;
- create delete policies;
- execute or install SQL.

## Next Gate

Review the v0.2 reconciliation and SQL candidate together.

After explicit approval, prepare a separate test and installation plan.

Do not execute the candidate, create Johnny's records, or synchronize external systems during the review phase.
