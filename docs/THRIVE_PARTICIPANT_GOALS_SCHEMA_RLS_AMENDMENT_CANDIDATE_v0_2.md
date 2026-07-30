# THRIVE Participant Goals Schema and RLS Amendment Candidate v0.2

## Status

Review-only amendment candidate.

This package does not authorize SQL execution, schema installation, authenticated writes, participant activation, deployment, or production use.

## Verified starting point

- v0.1 Goals candidate committed at `0ed4ae4`;
- v0.1 build and TypeScript checks passed;
- controlled installation review found no DELETE policy, no staff-suggestion insert path, and no service-role or deployment behavior;
- v0.1 remained transactional and ended in `rollback;`;
- no Goals SQL has been executed.

## Approved v0.2 amendment scope

This amendment changes only three installation-safety concerns:

1. add durable foreign-key relationships using the established workspace-scoped identity pattern;
2. replace silent `CREATE TABLE IF NOT EXISTS` behavior with a strict preflight that stops when `public.participant_goals` already exists;
3. reclassify the shell artifact as a reconstruction script rather than an installer.

The approved active-participation rule remains unchanged. Workspace admins may update, archive, or reactivate Goals only while the supported person has active participation in the associated program and workspace.

## Foreign-key candidate

The table adds:

```text
workspace_id -> public.workspaces(id) ON DELETE RESTRICT
(program_id, workspace_id) -> public.programs(id, workspace_id) ON DELETE RESTRICT
(supported_person_id, workspace_id) -> public.supported_people(id, workspace_id) ON DELETE RESTRICT
created_by -> auth.users(id) ON DELETE RESTRICT
```

These keys preserve the separation between identity, program participation, and organizational authority. They do not create new authority or synchronize another system.

## Strict preflight

The SQL candidate begins a transaction and checks:

```text
to_regclass('public.participant_goals') is null
```

If the table already exists, the candidate raises an exception and stops. It does not adopt, alter, replace, or silently reuse an existing table.

## Unchanged boundaries

- participant inserts remain participant-owned;
- `created_by = auth.uid()` remains required;
- active participation remains required;
- workspace and program isolation remain required;
- no workspace-admin INSERT policy exists;
- no staff-suggestion workflow exists;
- ownership and scope remain immutable;
- no DELETE policy exists;
- no Wellness conversion occurs;
- no Budget, Support, Reports, or Trust Engine record changes occur;
- no hard delete is introduced.

## Reconstruction script classification

The companion shell file is named:

```text
restore_thrive_participant_goals_schema_rls_candidate_v0_2.sh
```

It reconstructs review artifacts only. It does not connect to Supabase, execute SQL, deploy code, push Git history, or perform authenticated writes.

## Candidate files

- `THRIVE_PARTICIPANT_GOALS_SCHEMA_RLS_CANDIDATE_v0_2.sql`
- `THRIVE_PARTICIPANT_GOALS_SCHEMA_RLS_EXPECTED_RESULTS_v0_2.md`
- `THRIVE_PARTICIPANT_GOALS_SCHEMA_RLS_ROLLBACK_v0_2.sql`
- `restore_thrive_participant_goals_schema_rls_candidate_v0_2.sh`

## Review requirements

Before any installation approval:

- reconfirm the composite unique keys on `programs(id, workspace_id)` and `supported_people(id, workspace_id)`;
- reconfirm helper signatures and argument order;
- inspect the strict preflight;
- compare every created object with rollback coverage;
- select authenticated synthetic identities;
- prepare a separate controlled test plan;
- obtain explicit SQL installation approval.

## Exact next gate

Inspect the v0.2 amendment package against the live database catalog and current repository naming conventions. Do not execute SQL.
