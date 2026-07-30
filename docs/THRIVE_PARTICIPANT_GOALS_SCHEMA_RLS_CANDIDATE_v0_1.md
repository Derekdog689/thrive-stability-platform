# THRIVE Participant Goals Schema and RLS Candidate v0.1

## Status

Review-only candidate.

This document does not authorize SQL execution, table creation, policy
installation, trigger installation, participant activation, deployment, or
production use.

## Verified starting state

- repository checkpoint: `ef75ad1`;
- Goals route exists as a participant-facing shell;
- repository search found no persistent Goals model;
- live database census found no Goals table, view, function, policy, or index;
- `participant_wellness_checkins.chosen_next_step` remains Wellness evidence
  only and must not create or update a Goal automatically.

## Purpose

Define the smallest persistent record needed for one participant-owned goal.

The candidate supports:

- one plain-language goal title;
- an optional participant-written reason;
- one next step;
- an optional goal area;
- a simple progress state;
- participant ownership;
- archive lifecycle;
- workspace and program isolation;
- participant self-read and self-write boundaries;
- workspace-admin read and update support.

## Explicitly excluded from v0.1

- target dates;
- reminders;
- barriers;
- milestones;
- scoring;
- compliance tracking;
- treatment assignments;
- clinical interpretations;
- relapse findings;
- capacity findings;
- legal or fiduciary conclusions;
- Support requests;
- reporting workflows;
- staff assignment;
- automatic conversion from Wellness;
- Trust Engine synchronization;
- hard deletion.

## Proposed table

`public.participant_goals`

### Columns

| Column | Type | Required | Purpose |
|---|---|---:|---|
| id | uuid | yes | Goal identifier |
| workspace_id | uuid | yes | Workspace boundary |
| program_id | uuid | yes | Active program boundary |
| supported_person_id | uuid | yes | Participant owner |
| title | text | yes | Participant-written goal |
| why_it_matters | text | no | Participant reason |
| next_step | text | yes | One manageable action |
| goal_area | text | no | Optional organizing area |
| progress_status | text | yes | Current lifecycle state |
| ownership_source | text | yes | Provenance of ownership |
| created_by | uuid | yes | Authenticated creator |
| created_at | timestamptz | yes | Creation timestamp |
| updated_at | timestamptz | yes | Last update timestamp |
| archived_at | timestamptz | no | Archive timestamp |

## Controlled values

### `progress_status`

- `not_started`
- `in_progress`
- `paused`
- `completed`
- `archived`

### `ownership_source`

- `participant`
- `staff_suggestion`

## Ownership rule

A `staff_suggestion` is not a participant commitment.

The first participant create path forces:

```text
ownership_source = participant
created_by = auth.uid()
supported_person_id = authenticated participant
```

No executable staff-suggestion workflow is included in v0.1.

## Participant policy model

### SELECT

A participant may read a Goal only when:

- the row belongs to that supported person;
- the person has active participation in the row's program and workspace.

Archived rows remain readable to the participant in v0.1 so the lifecycle is
visible and no hard delete is needed.

### INSERT

A participant may insert only when:

- `created_by = auth.uid()`;
- `ownership_source = 'participant'`;
- the Goal belongs to the authenticated supported person;
- the program belongs to the workspace;
- active program participation exists;
- `progress_status <> 'archived'`;
- `archived_at is null`.

### UPDATE

A participant may update only their own participant-created Goal.

The participant may:

- change title;
- change why-it-matters;
- change next step;
- change goal area;
- change progress state;
- archive the Goal by setting `progress_status = 'archived'`.

The participant may not:

- change workspace;
- change program;
- change supported person;
- change ownership source;
- change creator;
- change created timestamp;
- reactivate an archived Goal in v0.1.

### DELETE

No DELETE policy is proposed.

## Workspace-admin policy model

Workspace admins may:

- read Goals in their workspace;
- update Goal content and lifecycle while preserving identity and ownership
  provenance;
- archive or reactivate a Goal through status transitions.

Workspace admins may not use this model to convert a staff suggestion into a
participant-owned Goal silently.

No workspace-admin INSERT policy is included in v0.1 because staff-suggestion
acceptance requires a separate design.

## Trigger protections

The proposed trigger:

- validates participant-created inserts;
- preserves immutable identity and ownership fields;
- prevents participant archive/reactivation bypass;
- populates `archived_at` on archive;
- clears `archived_at` only for an authorized workspace-admin reactivation;
- updates `updated_at`;
- rejects unauthorized updates.

## Indexes

- participant/program/date retrieval;
- partial active-goal index by participant;
- no uniqueness rule limiting a participant to one Goal total.

## No automatic cross-module behavior

This candidate does not:

- create Goals from Wellness next steps;
- create Support requests from optional text;
- change Budget records;
- change program participation;
- change Trust Engine records;
- produce clinical, legal, fiduciary, relapse, or capacity conclusions.

## Candidate files

- `THRIVE_PARTICIPANT_GOALS_SCHEMA_RLS_CANDIDATE_v0_1.sql`
- `THRIVE_PARTICIPANT_GOALS_SCHEMA_RLS_ROLLBACK_v0_1.sql`
- `THRIVE_PARTICIPANT_GOALS_SCHEMA_RLS_EXPECTED_RESULTS_v0_1.md`

## Approval checkpoints

Separate explicit approval is required for:

1. SQL installation;
2. authenticated synthetic database testing;
3. participant UI wiring;
4. participant create-path activation;
5. workspace-admin workflow;
6. staff-suggestion design;
7. deployment.

## Exact next gate

Review this candidate against live helper functions and naming conventions.

Do not execute SQL until:

- helper function signatures are reconfirmed;
- candidate constraints are reviewed;
- rollback is reviewed;
- authenticated synthetic test identities are selected;
- explicit installation approval is given.
