# THRIVE Participant Goals Schema and RLS Expected Results v0.1

## Candidate status

Review-only. No SQL has been authorized for execution.

## Expected schema

One table:

```text
public.participant_goals
```

No history, milestone, reminder, barrier, score, or support-request table.

## Expected constraints

- title cannot be blank;
- next step cannot be blank;
- optional text is length-limited;
- progress state is controlled;
- ownership provenance is controlled;
- archived state and `archived_at` remain aligned.

## Expected participant behavior

### Read

The participant can read only their own Goals while active in the associated
program.

### Create

The participant can create only a participant-owned Goal for themselves.

Expected forced boundaries:

```text
created_by = auth.uid()
ownership_source = participant
supported_person_id = authenticated participant
```

A new Goal cannot begin archived.

### Update

The participant can update only a participant-created Goal that belongs to
them.

Immutable:

- workspace;
- program;
- supported person;
- ownership source;
- creator;
- creation timestamp.

### Archive

The participant may archive their own participant-created Goal through a
status transition.

Expected:

```text
progress_status = archived
archived_at = populated
updated_at = advanced
```

### Reactivation

Participant reactivation is blocked in v0.1.

### Delete

No authenticated DELETE policy exists.

## Expected staff-suggestion boundary

A row marked `staff_suggestion` is not participant-owned and is not a
participant commitment.

The candidate does not include a staff INSERT policy or an acceptance workflow.

## Expected workspace-admin behavior

The workspace admin can read and update Goals in the workspace while identity,
scope, and ownership provenance remain immutable.

The admin may archive or reactivate through lifecycle transitions.

## Expected isolation

- Person D cannot read or write Person A Goals;
- Person A cannot read or write Person D Goals;
- outsider cannot read or write either;
- workspace admin can access rows only through workspace-admin policy;
- active program participation remains required.

## Expected cross-module behavior

No automatic action occurs in:

- Wellness;
- Support;
- Budget;
- Reports;
- Trust Engine;
- program participation.

## Required authenticated tests after separate approval

1. participant self-select;
2. cross-person select denial;
3. outsider select denial;
4. valid participant insert;
5. wrong creator denial;
6. wrong supported person denial;
7. wrong workspace/program denial;
8. staff-suggestion participant insert denial;
9. participant content update;
10. immutable-field update denial;
11. participant archive;
12. participant reactivation denial;
13. admin archive/reactivation;
14. DELETE denial;
15. inactive-participation denial.

## Stop conditions

Stop testing if:

- a policy permits cross-person access;
- ownership source can be changed;
- a staff suggestion becomes participant-owned silently;
- DELETE succeeds;
- active participation is bypassed;
- archive state and archived timestamp diverge;
- any other module is changed.
