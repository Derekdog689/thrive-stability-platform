# THRIVE Supported-Person Schema Candidate v0.2 Fresh Catalog Confirmation

## Status

Review-only evidence amendment.

This amendment closes the prior evidence limitation in `THRIVE_SUPPORTED_PERSON_SCHEMA_CANDIDATE_v0_2_LIVE_EVIDENCE_RECONCILIATION.md` by comparing the existing v0.2 conclusion against a fresh read-only inspection of the live THRIVE database on 2026-08-26.

No database mutation was performed.

## Verified Database

- Supabase project: `THRIVE DB`
- Project id: `ovzifochmrsaxabclxoe`
- Schema inspected: `public`
- Tables inspected in detail: `supported_people`, `program_participants`
- Inspection mode: read-only catalog and metadata queries

## Frozen Boundaries

This confirmation does not authorize or perform:

- schema changes;
- RLS changes;
- SQL migration execution;
- supported-person inserts;
- Johnny authentication-user creation;
- Johnny supported-person or participation records;
- explanation-table creation;
- Trust Engine synchronization;
- hard deletes;
- merge or deployment.

## Fresh Catalog Findings

### `supported_people`

The live table confirms the established identity spine:

- `id uuid` primary key;
- `workspace_id uuid` required;
- `auth_user_id uuid` nullable;
- `display_name text` required;
- `preferred_name text` nullable;
- `status text` required, default `active`;
- `external_reference text` nullable;
- `created_by uuid` required;
- `created_at timestamptz` required, default `now()`;
- `updated_at timestamptz` required, default `now()`.

Fresh catalog inspection confirms:

- globally unique nullable `auth_user_id`;
- unique scoped identity `(id, workspace_id)`;
- restrictive foreign keys to `workspaces` and `auth.users`;
- nonblank checks for required or populated name/reference fields;
- status vocabulary `active`, `paused`, `archived`.

### `program_participants`

The live table confirms the separate participation spine:

- `id uuid` primary key;
- `workspace_id uuid` required;
- `program_id uuid` required;
- `supported_person_id uuid` required;
- `participant_role text` required, default `supported_person`;
- `status text` required, default `active`;
- `created_by uuid` required;
- `created_at timestamptz` required, default `now()`;
- `updated_at timestamptz` required, default `now()`.

Fresh catalog inspection confirms:

- unique `(workspace_id, program_id, supported_person_id)`;
- unique scoped participation identity;
- composite program/workspace foreign-key protection;
- composite supported-person/workspace foreign-key protection;
- restrictive deletion behavior;
- `participant_role` limited to `supported_person`;
- participation status vocabulary `active`, `inactive`, `completed`.

## Fresh RLS Confirmation

The live database confirms the previously documented policy shape.

### `supported_people`

Authenticated policies present for:

- linked supported-person self select;
- workspace-admin select;
- workspace-admin insert;
- workspace-admin update.

No self-insert, self-update, broad workspace-member write, or delete policy was identified.

### `program_participants`

Authenticated policies present for:

- linked supported-person self select;
- workspace-admin select;
- workspace-admin insert with workspace/program/person scope checks;
- workspace-admin update with workspace/program/person scope checks.

No self-insert, self-update, broad workspace-member write, or delete policy was identified.

## Fresh Trigger Confirmation

The live database confirms the expected `BEFORE UPDATE` protections.

### `supported_people`

- identity-scope protection trigger;
- `updated_at` trigger.

### `program_participants`

- participation-scope protection trigger;
- `updated_at` trigger.

The installed protection functions preserve the immutable identity and participation scope previously validated through authenticated testing.

## Fresh Helper-Function Confirmation

Direct inspection confirms the installed authorization helpers used by this spine, including:

- `is_workspace_admin(uuid)`;
- `is_program_in_workspace(uuid, uuid)`;
- `is_supported_person_in_workspace(uuid, uuid)`;
- `is_supported_person_self(uuid)`.

The access-check helpers inspected are owned by `postgres`; the authorization helpers are installed as `SECURITY DEFINER` where expected and use the installed workspace/person/program checks. The scope-protection and timestamp trigger functions are not security-definer functions.

This fresh inspection removes the prior uncertainty about current function ownership and security mode for the inspected helpers.

## Index Confirmation

Fresh catalog inspection confirms the previously documented indexes for supported-person identity, authentication linking, workspace scope, program scope, status lookup, creator lookup, and scoped uniqueness.

No missing index requirement was identified in this review-only gate.

A partial non-null `auth_user_id` lookup index exists in addition to the global unique authentication-link index. This may be redundant from a future optimization perspective, but no index removal is proposed here because this gate is not a performance redesign and no query-plan problem has been established.

## Reconciliation Against Existing v0.2 Recommendation

The fresh catalog evidence supports the existing final recommendation without requiring a database change.

Confirmed authoritative lifecycle vocabularies remain:

### Supported person

- `active`
- `paused`
- `archived`

### Program participation

- `active`
- `inactive`
- `completed`

The installed database already provides the v0.2 supported-person foundation described by the prior candidate and final recommendation.

## Final Finding

**No supported-person v0.2 database migration is required.**

The prior review-only final recommendation remains valid:

- retain the installed schema;
- do not expand RLS in this gate;
- do not add delete policies;
- do not create an explanation table;
- do not merge THRIVE authority with the Trust Engine;
- do not create Johnny-specific identity or participation records.

The remaining work belongs in separately bounded application/workflow gates rather than in the supported-person database foundation.

## Approval / Execution Record

- fresh live catalog inspected: yes
- review-only evidence documented: yes
- database migration recommended: no
- database mutation performed: no
- service-role mutation performed: no
- Johnny auth user created: no
- Johnny inserted: no
- explanation table created: no
- Trust Engine synchronized: no
- hard delete performed: no
- merge performed: no
- deployment performed: no

## Gate Closeout

The review-only v0.2 supported-person schema candidate is reconciled against fresh live database truth.

No database action is warranted.

For the participant-experience branch, this removes the schema-gate ambiguity that interrupted the presentation work. Any return to participant UX remains an application-layer experiment and must continue to preserve the database, RLS, role, and authority boundaries above.
