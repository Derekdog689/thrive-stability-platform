# THRIVE Supported-Person Schema Candidate v0.2 Live-Evidence Reconciliation

## Status

Review-only reconciliation.

This document compares the review-only supported-person schema candidate v0.2 against:

- the approved installation artifact;
- the post-install validation report;
- the installation verification checklist;
- the prior schema reconciliation;
- the authenticated write-test results through W17;
- the current application test harness behavior.

This document does not authorize SQL execution.

## Repository State

- Repository: `thrive-stability-platform`
- Branch: `main`
- Schema candidate checkpoint: `9f00624`
- Authenticated write-test closure checkpoint: `7177bc3`
- Current untracked package outside scope: `docs/RENEWING/`

## Evidence Limitation

Direct PostgreSQL catalog access was not available in the repository environment.

The Supabase OpenAPI schema endpoint returned:

```text
HTTP 401
UNAUTHORIZED_INVALID_API_KEY_TYPE
Only the service_role API key can be used for this endpoint.
Service-role use remains frozen and was not attempted.

Accordingly, this reconciliation relies on:

the approved installation SQL;
the recorded post-install verification;
the installation checklist;
the prior live-foundation reconciliation;
authenticated RLS behavior tested through the application.

This is sufficient for a review-only comparison, but it is not a fresh database-catalog dump.

## Installed Schema Evidence

The post-install report verifies that the following tables were installed:

supported_people
program_participants

Both tables have RLS enabled.

The installation report recorded zero rows immediately after installation.

Controlled synthetic records were later installed and tested under separate approved gates.

supported_people Reconciliation
### Candidate Logical Fields

The v0.2 review-only candidate proposes:

id
workspace_id
auth_user_id
display_name
preferred_name
status
external_reference
created_by
created_at
updated_at
### Installed Evidence

The approved installation artifact and post-install report confirm the same logical field set.

### Installed Constraints

Verified installed constraints include:

primary key on id;
foreign key from workspace_id to workspaces(id);
nullable foreign key from auth_user_id to auth.users(id);
foreign key from created_by to auth.users(id);
unique nullable auth_user_id;
unique (id, workspace_id);
nonblank display_name;
nonblank optional preferred_name;
nonblank optional external_reference;
status limited to:
active
paused
archived
restrictive foreign-key deletion.
### Candidate Difference

The review-only candidate listed:

active
inactive
archived

for supported-person lifecycle status.

The installed database instead verifies:

active
paused
archived
### Reconciliation Decision

The review-only candidate must be corrected to use the installed supported-person status vocabulary:

active
paused
archived

No migration is warranted merely to replace paused with inactive.

The installed vocabulary should remain authoritative unless a separately approved lifecycle redesign establishes a need for change.

program_participants Reconciliation
### Candidate Logical Fields

The v0.2 review-only candidate proposes:

id
workspace_id
program_id
supported_person_id
participant_role
status
created_by
created_at
updated_at
### Installed Evidence

The approved installation artifact and post-install report confirm the same logical field set.

### Installed Constraints

Verified installed constraints include:

primary key on id;
foreign key from workspace_id to workspaces(id);
foreign key from created_by to auth.users(id);
composite foreign key from:
(program_id, workspace_id)
to programs(id, workspace_id);
composite foreign key from:
(supported_person_id, workspace_id)
to supported_people(id, workspace_id);
unique (workspace_id, program_id, supported_person_id);
scoped identity unique constraint;
participant_role limited to supported_person;
status limited to:
active
inactive
completed;
restrictive foreign-key deletion.
### Candidate Difference

The review-only candidate additionally listed:

paused

as a possible participation status.

The installed database does not verify paused as an allowed participation state.

### Reconciliation Decision

The candidate must be corrected to use the installed participation status vocabulary:

active
inactive
completed

No participation paused state should be proposed without a separately documented workflow need and migration review.

## Program Scope Constraint

The prior live-foundation reconciliation established that programs originally lacked a unique (id, workspace_id) constraint.

The installation added:

programs_scoped_identity_unique
UNIQUE (id, workspace_id)

This supports the composite program/workspace foreign key used by program_participants.

### Reconciliation Decision

The review-only v0.2 candidate is aligned with the installed structural program-scope protection.

No additional program-scope migration is proposed.

## Installed Indexes

The installation evidence identifies indexes for supported_people covering:

primary key;
unique authentication link;
scoped identity;
workspace;
non-null authentication user;
workspace and status;
creator.

The installation evidence identifies indexes for program_participants covering:

primary key;
unique person and program assignment;
scoped identity;
workspace;
program;
supported person;
workspace, program, and status;
creator.
### Reconciliation Decision

The candidate does not currently identify a verified missing index.

No new index candidate is proposed.

A future catalog-level inspection may evaluate redundancy or query-plan needs, but that is outside this review-only gate.

## Installed Functions

Verified installed functions:

is_supported_person_self(uuid)
is_supported_person_in_workspace(uuid, uuid)
is_program_participant_active(uuid, uuid, uuid)
set_supported_person_identity_updated_at()
protect_supported_person_identity_scope()
protect_program_participant_scope()

Verified access-helper properties:

SECURITY DEFINER
search_path=public
is_supported_person_self(uuid) marked STABLE

The installation checklist also expects public execution privileges to be revoked and authenticated execution privileges to be granted for the access helpers.

### Reconciliation Decision

The candidate authorization model is aligned with the installed helper-function design.

No helper-function replacement is proposed.

A future direct catalog inspection may re-confirm ownership and grants, but no discrepancy is documented in current evidence.

## Installed Triggers

Verified triggers on supported_people:

set_supported_people_updated_at
protect_supported_person_identity_scope

Verified triggers on program_participants:

set_program_participants_updated_at
protect_program_participant_scope

All four triggers are installed as BEFORE UPDATE.

### Authenticated Behavioral Evidence

W15 and W16 confirmed that the supported-person trigger denies:

workspace-scope changes;
creation-lineage changes.

W17 confirmed that the participation trigger denies:

supported-person identity reassignment;
participation scope changes.
### Reconciliation Decision

The candidate immutable-scope principles are aligned with installed and authenticated behavior.

No trigger change is proposed.

## Installed RLS Policies
supported_people

Verified policies:

supported_people_select_self
supported_people_select_workspace_admins
supported_people_insert_workspace_admins
supported_people_update_workspace_admins

Verified absences:

broad workspace-member read policy;
self-insert policy;
self-update policy;
delete policy.
program_participants

Verified policies:

program_participants_select_self
program_participants_select_workspace_admins
program_participants_insert_workspace_admins
program_participants_update_workspace_admins

Verified absences:

broad workspace-member read policy;
self-insert policy;
self-update policy;
delete policy.
### Authenticated Behavioral Evidence

The W1-W17 matrix verified:

administrator permitted create and approved metadata/lifecycle updates;
supported-person direct writes denied;
support-member writes denied;
viewer writes denied;
outsider inserts denied;
immutable administrator scope changes denied.
### Reconciliation Decision

The candidate role-based authorization model matches installed and authenticated policy behavior.

No RLS policy expansion is proposed.

## Authentication Link

The installed schema verifies:

auth_user_id is nullable;
auth_user_id is unique when present;
the foreign key is restrictive.
### Reconciliation Decision

The candidate principle of optional authentication linking is aligned with the installed schema.

The following remains unresolved as an application workflow question:

whether archived supported-person records retain their authentication link;
whether unlinking requires a separate audited workflow;
whether one person may ever be represented in multiple workspaces through separate supported-person records.

No authentication-link migration is proposed.

## Participation Uniqueness

The installed database verifies:

UNIQUE (workspace_id, program_id, supported_person_id)
### Reconciliation Decision

The current schema permits one participation row per person, program, and workspace.

This means repeated historical participation cycles are not represented by multiple concurrent rows under the current unique constraint.

A future re-enrollment model would require a separate lifecycle and history design.

No such change is proposed in v0.2.

## Delete Behavior

The installed schema verifies:

restrictive foreign-key deletion;
no RLS delete policy;
no authenticated delete tests;
no hard-delete workflow.
### Reconciliation Decision

The candidate non-destructive lifecycle principle is aligned with the installed system.

No delete policy or hard-delete mechanism is proposed.

## Explanation Data

No explanation table was installed.

No explanation record was created.

No explanation schema is included in the review-only candidate.

### Reconciliation Decision

Explanation data remains excluded.

A future explanation model requires a separate candidate covering authorship, consent, visibility, amendment, dispute, and observation linkage.

## Trust Engine Boundary

No Trust Engine foreign key, shared identifier, synchronization mechanism, or authority merge was installed.

### Reconciliation Decision

The review-only candidate remains aligned with the frozen system boundary.

THRIVE may later compare separately authorized facts, but ownership, approval, and authority remain independent.

## Johnny Boundary

No evidence reviewed in this reconciliation authorizes:

Johnny authentication-user creation;
Johnny supported-person insertion;
Johnny program participation;
Johnny workspace membership;
explanation records;
financial-data import;
Trust Engine synchronization.
### Reconciliation Decision

Johnny remains outside this schema candidate and outside the synthetic fixture.

## Candidate Corrections Required

The review-only candidate should be amended in two places:

### Supported-person status

Replace:

active
inactive
archived

with:

active
paused
archived
### Participation status

Replace:

active
inactive
completed
paused

with:

active
inactive
completed

These are documentation corrections only.

They do not require SQL.

## Candidate Findings
### Aligned with installed state
workspace-scoped supported-person identity;
separate program participation;
nullable unique authentication link;
restrictive foreign keys;
immutable workspace and creation lineage;
immutable participation identity and scope;
administrator-only create and update authority;
linked active self-read;
no broad workspace-member access;
no self-write policies;
no delete policies;
non-destructive lifecycle model;
no explanation table;
no Trust Engine integration.
### Not established by direct catalog access in this pass
current function ownership;
current execution grants;
exact index definitions after installation;
exact trigger ordering;
whether any later unrecorded schema drift occurred.

No evidence of such drift was found, but direct catalog proof was unavailable without service-role or PostgreSQL access.

## Reconciliation Conclusion

The review-only v0.2 candidate is substantially aligned with the installed supported-person identity schema and the authenticated RLS behavior.

Two lifecycle vocabulary corrections are required in the candidate documentation:

supported people use paused, not inactive;
program participants do not currently use paused.

No executable migration is recommended from this reconciliation.

The installed schema should remain unchanged.

## Approval Status
Live-evidence reconciliation created: yes
Direct service-role inspection performed: no
Direct PostgreSQL catalog inspection performed: no
SQL migration created: no
SQL executed: no
Johnny auth user created: no
Johnny inserted: no
explanation table created: no
Trust Engine synchronized: no
cleanup performed: no
push performed: no
merge performed: no
deployment performed: no
## Next Gate

Amend the review-only v0.2 candidate documentation to correct the two lifecycle vocabularies.

After that documentation checkpoint, prepare a recommendation on whether v0.2 requires any database change at all.

Current evidence supports the likely conclusion:

No database migration required.
Documentation and future workflow design only.

Do not create executable SQL.
