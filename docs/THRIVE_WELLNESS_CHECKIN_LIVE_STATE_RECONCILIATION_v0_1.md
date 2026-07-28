# THRIVE Wellness Check-In Live-State Reconciliation v0.1

## Status

Review-only reconciliation from the live database inspection and current repository.

No SQL has been executed. No Wellness records have been created.

## Verified live database state

The inspection did not surface any existing public table, view, index, constraint,
RLS setting, or policy whose name matched:

- wellness
- checkin
- check_in
- reflection
- mood

The current participant identity spine remains:

- `workspaces`
- `programs`
- `program_participants`
- `supported_people`

Verified relevant columns:

### workspaces

- id
- name
- workspace_type
- status
- created_by
- created_at
- updated_at

### programs

- id
- workspace_id
- program_name
- program_type
- status
- description
- created_by
- created_at
- updated_at

### supported_people

- id
- workspace_id
- auth_user_id
- display_name
- preferred_name
- status
- external_reference
- created_by
- created_at
- updated_at

### program_participants

- id
- workspace_id
- program_id
- supported_person_id
- participant_role
- status
- created_by
- created_at
- updated_at

## Verified application state

The current `/wellness` page:

- uses `AuthGate`;
- uses the shared participant shell;
- has no Wellness data hook;
- has no form submission;
- has no database write;
- shows a neutral no-check-in state;
- shows reflection previews only;
- shows no scoring;
- shows no fabricated history;
- keeps Wellness separate from financial evidence and Trust Engine records.

## Candidate ownership decision

A Wellness check-in should be participant-owned self-report.

The record should preserve:

- workspace;
- program;
- supported person;
- authenticated creator;
- check-in date;
- optional self-report fields;
- optional note;
- optional chosen next step;
- lifecycle state;
- created and updated timestamps;
- archive timestamp.

## Candidate interaction model

The first write flow should remain small:

### Overall day

- good
- okay
- hard
- not_sure

### Optional reflection fields

- stress
- sleep
- energy
- confidence
- routine
- recovery support
- support needed

### Optional next step

- take_a_break
- review_today_plan
- choose_one_task
- contact_supportive_person
- food_water_rest
- ask_for_help
- other

### Optional note

A short participant-written note.

## Important boundary

These fields are self-report labels, not clinical scores.

They must not automatically become:

- a diagnosis;
- a relapse finding;
- a capacity determination;
- an emergency conclusion;
- a compliance score;
- a fiduciary conclusion;
- a spending explanation;
- a Trust Engine fact.

## Candidate lifecycle

Allowed states:

- active
- archived

No hard delete during the MVP.

A participant may have at most one active check-in for a given calendar date.

## Unresolved dependencies before installation

Before any SQL installation, confirm:

1. current primary and unique constraints on the four parent tables;
2. current helper functions used for workspace-admin and participant identity checks;
3. whether staff read access is wanted in v0.1 or should remain participant-only;
4. whether participants may edit an active same-day check-in;
5. whether archive is participant-controlled, staff-controlled, or both.

## Frozen boundaries

- no SQL execution;
- no Wellness writes;
- no Johnny data;
- no clinical scoring;
- no emergency workflow;
- no financial cross-reference;
- no Trust Engine synchronization;
- no push or deployment.

## Exact next gate

Review the schema/RLS candidate and interface candidate, then run a narrow helper-
function and parent-constraint inspection before finalizing an executable dry run.
