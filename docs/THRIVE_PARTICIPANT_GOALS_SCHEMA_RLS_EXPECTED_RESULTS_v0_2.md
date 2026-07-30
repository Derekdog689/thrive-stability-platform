# THRIVE Participant Goals Schema and RLS Expected Results v0.2

## Candidate status

Review-only. No SQL has been authorized for execution.

## Preflight expectation

Before creating any object, the transaction checks whether:

```text
public.participant_goals
```

already exists.

Expected behavior:

- absent table: review transaction may continue;
- existing table: raise an exception and stop;
- no existing table is altered, replaced, or silently reused.

## Expected schema

One table:

```text
public.participant_goals
```

No history, milestone, reminder, barrier, score, or support-request table.

## Expected referential integrity

- `workspace_id` references `public.workspaces(id)`;
- `(program_id, workspace_id)` references `public.programs(id, workspace_id)`;
- `(supported_person_id, workspace_id)` references `public.supported_people(id, workspace_id)`;
- `created_by` references `auth.users(id)`;
- every foreign key uses `ON DELETE RESTRICT`.

Expected denials:

- nonexistent workspace;
- program outside the selected workspace;
- supported person outside the selected workspace;
- nonexistent creator;
- deletion of referenced parent records while Goal rows remain.

## Expected constraints

- title cannot be blank;
- next step cannot be blank;
- optional text is length-limited;
- progress state is controlled;
- ownership provenance is controlled;
- archived state and `archived_at` remain aligned.

## Expected participant behavior

The participant can read only their own Goals while active in the associated program.

The participant can create only a participant-owned Goal for themselves with:

```text
created_by = auth.uid()
ownership_source = participant
supported_person_id = authenticated participant
```

A new Goal cannot begin archived.

The participant may update content and archive their own participant-created Goal. Workspace, program, supported person, ownership source, creator, and creation timestamp remain immutable. Participant reactivation remains blocked.

## Expected workspace-admin behavior

A workspace admin may read and update Goals only within the workspace and only while active program participation exists. The admin may archive or reactivate through lifecycle transitions while identity, scope, and ownership provenance remain immutable.

No workspace-admin INSERT policy exists.

## Expected staff-suggestion boundary

A `staff_suggestion` is not participant-owned and is not a participant commitment. No staff INSERT policy or acceptance workflow exists in v0.2.

## Expected deletion behavior

No authenticated DELETE policy exists. No hard-delete workflow is introduced.

## Expected cross-module behavior

No automatic action occurs in Wellness, Support, Budget, Reports, Trust Engine, or program participation.

## Rollback expectation

The rollback candidate removes, in dependency order:

1. five RLS policies;
2. one trigger;
3. one trigger function;
4. `public.participant_goals`.

Indexes, constraints, and foreign keys disappear with the table.

The rollback file also ends in `rollback;`, so it remains review-only until separately approved.

## Required authenticated tests after separate approval

1. strict existing-table preflight failure;
2. valid participant self-select;
3. cross-person and outsider denial;
4. valid participant insert;
5. wrong creator denial;
6. wrong supported-person denial;
7. wrong workspace/program denial;
8. foreign-key denial for invalid parent identities;
9. participant staff-suggestion insert denial;
10. participant content update;
11. immutable-field update denial;
12. participant archive;
13. participant reactivation denial;
14. admin archive/reactivation while participation is active;
15. admin update denial after participation is inactive or completed;
16. DELETE denial;
17. rollback object-coverage verification.

## Stop conditions

Stop testing if cross-person access succeeds, ownership can change, staff suggestion becomes participant-owned silently, DELETE succeeds, active participation is bypassed, referential integrity is missing, archive state diverges, or another module changes.
