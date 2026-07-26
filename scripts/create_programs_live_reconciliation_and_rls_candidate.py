#!/usr/bin/env python3
from pathlib import Path

DOC = Path("docs/THRIVE_PROGRAMS_LIVE_SCHEMA_POLICY_RECONCILIATION_v0_1.md")
SQL = Path("docs/THRIVE_PROGRAMS_PARTICIPANT_LINKED_SELECT_POLICY_CANDIDATE_v0_1.sql")

doc = """# THRIVE Programs Live Schema and Policy Reconciliation v0.1

## Status

Live inspection complete.

This document records the current `public.programs` table, target synthetic program row, active Row Level Security policies, exact-program probe result, and the resulting candidate direction.

No SQL was executed and no policy was changed during this pass.

## Verified Table

Table:

- `public.programs`

RLS status:

- enabled

## Verified Columns

| Column | Type | Nullability / Default |
|---|---|---|
| `id` | `uuid` | not null, default `gen_random_uuid()` |
| `workspace_id` | `uuid` | not null |
| `program_name` | `text` | not null |
| `program_type` | `text` | not null |
| `status` | `text` | not null, default `active` |
| `description` | `text` | nullable |
| `created_by` | `uuid` | not null |
| `created_at` | `timestamptz` | not null, default `now()` |
| `updated_at` | `timestamptz` | not null, default `now()` |

## Verified Constraints

- primary key: `programs_pkey (id)`
- scoped unique identity: `programs_scoped_identity_unique (id, workspace_id)`
- foreign key: `workspace_id -> workspaces.id`
- foreign-key delete behavior: `ON DELETE CASCADE`
- foreign key: `created_by -> auth.users.id`
- `program_name` must not be blank
- `program_type` must be one of:
  - `demo`
  - `stability_support`
  - `trust_stewardship`
- `status` must be one of:
  - `active`
  - `paused`
  - `archived`

## Verified Indexes

- `programs_workspace_id_idx (workspace_id)`
- `programs_workspace_status_idx (workspace_id, status)`
- `programs_created_by_idx (created_by)`

## Verified Trigger

- `set_programs_updated_at`
- timing: before update
- scope: each row

## Verified Synthetic Target Row

- `id`: `71000000-0000-4000-8000-000000000002`
- `workspace_id`: `71000000-0000-4000-8000-000000000001`
- `program_name`: `SUPPORTED PERSON PROGRAM TEST`
- `program_type`: `demo`
- `status`: `active`
- `description`: `Controlled nonproduction program for supported-person RLS proof.`
- `created_by`: `3c0300e6-c4e9-4a84-b668-4a7e39593162`
- `created_at`: `2026-07-25 21:34:02.699497+00`
- `updated_at`: `2026-07-25 21:34:02.699497+00`

## Existing Policies

### `programs_insert_for_workspace_admins`

- command: `INSERT`
- role: `authenticated`
- behavior: permissive
- check expression:

```sql
is_workspace_admin(workspace_id)
AND created_by = auth.uid()
```

### `programs_select_for_workspace_members`

- command: `SELECT`
- role: `authenticated`
- behavior: permissive
- using expression:

```sql
is_workspace_member(workspace_id)
```

### `programs_update_for_workspace_admins`

- command: `UPDATE`
- role: `authenticated`
- behavior: permissive
- using expression:

```sql
is_workspace_admin(workspace_id)
```

- check expression:

```sql
is_workspace_admin(workspace_id)
```

### Delete Policy

No `DELETE` policy was visible for `public.programs`.

## Exact-Program Probe Result

Authenticated user:

- email: `dstein561+thrive-onboarding-person-d@gmail.com`
- auth user ID: `d48b7268-9aa6-4498-a923-2851fd5232c9`

Verified self-visible records:

- supported-person D row: returned
- participation D row: returned

Exact target program query:

- program ID: `71000000-0000-4000-8000-000000000002`
- workspace ID: `71000000-0000-4000-8000-000000000001`
- error: none
- data: `null`

## Reconciliation

The target program row exists.

The authenticated user is linked to supported person D.

Supported person D has an active participation pointing to the target program and workspace.

The current program SELECT policy authorizes only workspace members:

```sql
is_workspace_member(workspace_id)
```

Person D is not a workspace member.

Therefore the exact program row is filtered by current RLS even though the related participation is visible.

This is expected behavior under the current policy. It is not evidence of a missing program row, broken authentication link, or application-query failure.

## Candidate Direction

Prepare one additional permissive `SELECT` policy for participant-linked exact program visibility.

The policy should permit a program row only when an authenticated user's linked supported-person record has a matching active participation where:

- `program_participants.program_id = programs.id`
- `program_participants.workspace_id = programs.workspace_id`
- `program_participants.supported_person_id = supported_people.id`
- `supported_people.auth_user_id = auth.uid()`
- supported-person lifecycle status is approved
- participation lifecycle status is approved

The new policy must not change the existing workspace-member policy.

Because PostgreSQL permissive policies combine with logical OR, workspace members retain their current visibility while supported people gain only rows connected through their own qualifying participation.

## Candidate Lifecycle Recommendation

Initial narrow recommendation:

- supported-person status must be `active`
- participation status must be `active`
- program status is not used as an RLS eligibility filter in v0.1

Rationale:

- access authority should come from the person-participation relationship;
- program lifecycle fields may still need to be displayed for orientation;
- adding program-status filtering could silently hide paused or archived program history before product intent is settled.

This recommendation remains review-only.

## Security Boundaries

The candidate does not grant:

- workspace membership
- broad program listing beyond qualifying participation
- `INSERT`
- `UPDATE`
- `DELETE`
- access to other participants
- access to unrelated workspaces
- administrator authority
- support-role authority
- Trust Engine authority
- service-role authority

## Required Test Matrix Before Installation

### Positive

- person D can read program `71000000-0000-4000-8000-000000000002`
- returned workspace matches participation workspace
- returned row count is exactly one
- no write occurs

### Negative

- person D cannot read unrelated program rows
- person D cannot read Johnny's program row
- outsider cannot read the target program
- person A cannot read D's program unless A independently has a qualifying participation
- inactive supported person cannot read the program
- inactive participation cannot expose the program
- person D cannot insert, update, or delete programs
- person D does not become a workspace member

## Boundary Confirmation

- SQL candidate created: yes
- SQL executed: no
- RLS changed: no
- database migration applied: no
- workspace membership created: no
- program created: no
- supported-person changed: no
- participation changed: no
- Johnny changed: no
- Trust Engine synchronized: no
- service role used: no
- push performed: no
- merge performed: no
- deployment performed: no

## Exact Next Gate

Review the participant-linked SELECT policy candidate.

After explicit approval:

1. inspect candidate syntax;
2. run static review only;
3. prepare a controlled installation plan;
4. do not install until separately approved.
"""

sql = """-- THRIVE Programs Participant-Linked SELECT Policy Candidate v0.1
-- REVIEW ONLY
-- DO NOT EXECUTE
--
-- Purpose:
-- Permit an authenticated supported person to SELECT only program rows
-- connected to their own active participation.
--
-- This candidate does not grant workspace membership and does not modify
-- INSERT, UPDATE, or DELETE authority.

begin;

create policy programs_select_for_linked_supported_people
on public.programs
as permissive
for select
to authenticated
using (
  exists (
    select 1
    from public.program_participants pp
    join public.supported_people sp
      on sp.id = pp.supported_person_id
     and sp.workspace_id = pp.workspace_id
    where pp.program_id = programs.id
      and pp.workspace_id = programs.workspace_id
      and pp.status = 'active'
      and sp.status = 'active'
      and sp.auth_user_id = auth.uid()
  )
);

rollback;

-- Review notes:
--
-- 1. The rollback is intentional. This file is a candidate artifact only.
-- 2. Existing policy programs_select_for_workspace_members remains unchanged.
-- 3. Permissive SELECT policies combine with logical OR.
-- 4. The candidate performs no INSERT, UPDATE, DELETE, or membership grant.
-- 5. Before installation, inspect:
--    - current program_participants indexes;
--    - current supported_people indexes;
--    - exact lifecycle values;
--    - whether duplicate qualifying participations are possible;
--    - execution plan for the EXISTS lookup.
"""

DOC.write_text(doc, encoding="utf-8")
SQL.write_text(sql, encoding="utf-8")

print(f"Wrote {DOC}")
print(f"Wrote {SQL}")
print("No SQL was executed.")
