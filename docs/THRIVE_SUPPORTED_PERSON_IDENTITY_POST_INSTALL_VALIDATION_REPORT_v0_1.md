# THRIVE Supported-Person Identity Post-Install Validation Report v0.1

## Status

Post-install schema validation report.

This report documents the approved installation and its verified results.

It does not authorize:

- Johnny's authentication account;
- Johnny's profile;
- Johnny's workspace membership;
- Johnny's supported-person record;
- Johnny's program participation;
- test or production person records;
- personal financial explanation tables or records;
- Trust Engine synchronization;
- push, merge, or deployment.

## Installation Date

July 25, 2026

## Approved Installation Artifact

- Repository: `thrive-stability-platform`
- Branch: `main`
- Commit checkpoint: `e6bf2d5`
- Artifact:
  `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_INSTALL_CANDIDATE_v0_1.sql`
- Line count: `493`
- SHA-256:
  `1de4d535c10903ceb52d614099e37c1f0612c3ced863c215b223a25b04bc792b`

## Execution Environment

- Organization: `DSS Enterprises`
- Project: `thrive-stewardship-stability-platform`
- Environment: `main / production`
- Database role: `postgres`

The complete approved artifact was executed as one transaction through its final
`commit;`.

## Installation Scope

The approved installation created schema objects only.

It did not create:

- authentication users;
- profiles;
- workspace memberships;
- supported-person records;
- program-participation records;
- financial records;
- explanation records;
- trust records;
- consent records.

## Installed Tables

The following tables now exist:

| Table | RLS enabled | Forced RLS | Row count |
|---|---:|---:|---:|
| `supported_people` | Yes | No | 0 |
| `program_participants` | Yes | No | 0 |

## Installed Program Scope Constraint

The installation created:

```text
programs_scoped_identity_unique
UNIQUE (id, workspace_id)
```

This supports the composite program/workspace foreign key used by
program_participants.

## Installed `supported_people` Constraints

Verified constraints include:

primary key on id;
foreign key from workspace_id to workspaces(id) with restrictive deletion;
nullable foreign key from auth_user_id to auth.users(id) with restrictive deletion;
foreign key from created_by to auth.users(id) with restrictive deletion;
unique nullable auth_user_id;
unique (id, workspace_id);
nonblank display_name;
nonblank optional preferred_name;
nonblank optional external_reference;
status limited to active, paused, or archived.
## Installed `program_participants` Constraints

Verified constraints include:

primary key on id;
foreign key from workspace_id to workspaces(id) with restrictive deletion;
foreign key from created_by to auth.users(id) with restrictive deletion;
composite foreign key from (program_id, workspace_id) to
programs(id, workspace_id);
composite foreign key from (supported_person_id, workspace_id) to
supported_people(id, workspace_id);
unique (workspace_id, program_id, supported_person_id);
scoped identity unique constraint;
participant role limited to supported_person;
status limited to active, inactive, or completed.
## Installed Functions

The following functions were verified:

is_supported_person_self(uuid);
is_supported_person_in_workspace(uuid, uuid);
is_program_participant_active(uuid, uuid, uuid);
set_supported_person_identity_updated_at();
protect_supported_person_identity_scope();
protect_program_participant_scope().

The three access helpers are installed as SECURITY DEFINER functions with
search_path=public.

is_supported_person_self(uuid) is marked STABLE.

## Installed Triggers
supported_people
set_supported_people_updated_at;
protect_supported_person_identity_scope.
program_participants
set_program_participants_updated_at;
protect_program_participant_scope.

All four triggers are installed as BEFORE UPDATE.

## Installed RLS Policies
supported_people
supported_people_select_self;
supported_people_select_workspace_admins;
supported_people_insert_workspace_admins;
supported_people_update_workspace_admins.
program_participants
program_participants_select_self;
program_participants_select_workspace_admins;
program_participants_insert_workspace_admins;
program_participants_update_workspace_admins.
## Confirmed Policy Absences

The installed schema contains no:

- broad workspace-member supported-person read policy;
- supported-person self-insert policy;
- supported-person self-update policy;
- participation self-insert policy;
- participation self-update policy;
- delete policy.

## Record-Safety Result

Post-install verification confirmed:

```text
supported_people: 0 rows
program_participants: 0 rows
```

No Johnny data was created.

No authentication account, profile, workspace membership, program assignment,
explanation record, or Trust Engine connection was created.


## Installation Decision

The schema installation passed structural verification.

The supported-person identity foundation is installed and empty.

Authenticated RLS behavior has not yet been proven through controlled test
identities and application paths.

## Preserved Boundaries

This installation does not establish:

- legal authority;
- clinical status;
- incapacity;
- guardianship;
- trustee or fiduciary authority;
- consent;
- external sharing authority.

Johnny's THRIVE personal support spine remains independent from the Trust Engine.

## Next Gate

Review and commit this post-install report together with the authenticated RLS
application test plan.

After separate approval, prepare controlled test identities, test records, and
temporary application test routes.

Do not create test identities or records during this documentation gate.
