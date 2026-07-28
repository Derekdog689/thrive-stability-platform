# THRIVE Wellness Check-In Dependency Reconciliation v0.1

## Status

Live dependencies reconciled. Rollback-only schema/RLS dry-run candidate prepared.

No Wellness object has been installed permanently.

## Verified parent constraints

### programs

- primary key on `id`
- scoped unique identity on `(id, workspace_id)`

### supported_people

- primary key on `id`
- unique auth-user link on `auth_user_id`
- scoped unique identity on `(id, workspace_id)`

### program_participants

- primary key on `id`
- unique participant-program scope on
  `(workspace_id, program_id, supported_person_id)`
- scoped unique identity on
  `(id, workspace_id, program_id, supported_person_id)`
- composite person-scope foreign key to
  `supported_people(id, workspace_id)`
- composite program-scope foreign key to
  `programs(id, workspace_id)`

These constraints support direct composite foreign keys from a Wellness check-in.

## Verified helpers

The live database includes:

- `is_program_in_workspace(uuid, uuid)`
- `is_program_participant_active(uuid, uuid, uuid)`
- `is_supported_person_in_workspace(uuid, uuid)`
- `is_supported_person_self(uuid)`
- `is_workspace_admin(uuid)`
- `is_workspace_member(uuid)`

The Wellness candidate reuses the first four participant-scope helpers and the
workspace-admin helper.

It does not use general workspace membership for Wellness visibility.

## Verified RLS pattern

The current participant spine uses:

- participant self-select through `is_supported_person_self`;
- workspace-admin select and update;
- active-program checks;
- active-participation checks;
- immutable identity and scope through trigger functions.

The Wellness candidate follows that same pattern.

## Candidate decisions

### Participant

May:

- insert an own active check-in;
- read own check-ins;
- update only the own active check-in for the current date.

May not:

- archive;
- reactivate;
- delete;
- change scope or creator fields;
- access another participant's check-in.

### Workspace admin

May:

- read check-ins in the workspace;
- update and archive check-ins in the workspace;
- reactivate an archived check-in if later approved operationally.

### Other workspace members

No Wellness access in v0.1.

### Lifecycle

- active
- archived

No hard delete.

### Daily uniqueness

At most one active check-in per supported person per date.

## Dry-run behavior

The SQL candidate:

1. begins a transaction;
2. checks live dependencies;
3. creates the proposed table;
4. creates composite scope foreign keys;
5. creates validation constraints and indexes;
6. creates the scope-protection trigger;
7. enables and forces RLS;
8. creates participant and admin policies;
9. validates the resulting catalog;
10. rolls back everything.

## Important note

The live helper grants currently include `anon` execution for several
authorization helpers. This dry run does not change those grants because that
would broaden the approved gate. The Wellness table itself grants no access to
`anon`.

## Frozen boundaries

- no permanent schema installation;
- no Wellness data;
- no UI writes;
- no Johnny data;
- no financial cross-reference;
- no Trust Engine synchronization;
- no push or deployment.

## Exact next gate

Run the rollback-only dry run in Supabase and review:

- table creation;
- constraint creation;
- trigger creation;
- RLS enablement and force status;
- policy expressions;
- final rollback confirmation.

Only after a clean dry run should a controlled installation candidate be
prepared.
