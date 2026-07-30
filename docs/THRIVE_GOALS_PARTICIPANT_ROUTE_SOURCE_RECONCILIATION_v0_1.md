# THRIVE Goals Participant-Route Source Reconciliation v0.1

## Status

Review-only route inspection.

No code, schema, SQL, RLS, database record, or participant write is authorized
by this document.

## Current route

`src/app/goals/page.tsx`

## Observed participant promise

The current shell presents Goals as a participant-owned way to:

- identify something that matters;
- explain why it matters;
- choose one manageable next step;
- optionally identify useful support;
- track a non-punitive progress state.

The route explicitly states that goal creation is not yet available.

## Existing goal areas

- Daily stability
- Financial progress
- Health and wellness
- Relationships and support
- Work and education
- Personal growth

These are optional organizing areas, not diagnoses, requirements, treatment
assignments, or judgments.

## Existing lifecycle language

- Not started
- In progress
- Paused
- Completed
- Archived

The current shell correctly favors pause, completion, and archive over hard
deletion.

## Existing ownership boundary

The route distinguishes:

- participant-created goals;
- staff-suggested goals.

A staff suggestion must not silently become a participant commitment.

## Current weaknesses

### Shell and blueprint language is participant-visible

The route exposes future-product language such as:

- “future goals”;
- “future goal structure”;
- “participant-written title”;
- “future goal actions require...”;
- “this shell does not create goals.”

This is useful for internal design review but reads like scaffolding rather
than a finished participant experience.

### No persistent record is confirmed

The readiness matrix currently classifies Goals as `SHELL ONLY`.

No live goals table, participant read model, write policy, archive flow, or
history model has been confirmed in this route pass.

### No smallest action is selected

The route shows many possible fields but does not yet choose the smallest
useful first workflow.

## Smallest safe product candidate

The first persistent Goals candidate should support one participant-owned goal
with only:

- plain-language title;
- optional “why this matters”;
- one next step;
- optional goal area;
- progress state;
- participant ownership;
- created and updated timestamps;
- archive lifecycle.

A target date, barriers, support request, staff suggestion, check-in history,
scoring, reminders, and reporting should remain outside the first candidate
unless live-schema inspection proves they already exist.

## Required boundaries

- participant ownership must be explicit;
- staff suggestions must remain suggestions;
- no automatic assignment;
- no compliance score;
- no clinical interpretation;
- no relapse inference;
- no legal or fiduciary conclusion;
- no hard delete;
- no silent effect on program participation;
- no Support-module request should be created merely by writing optional
  support text;
- no Trust Engine ownership or authority may be merged.

## Exact next inspection

1. inspect the live database for any existing goal-related tables, functions,
   policies, indexes, or migrations;
2. search the repository for goal models and prior candidates;
3. reconcile current UI promises against live infrastructure;
4. document a candidate record only after reconciliation;
5. do not create or execute SQL during inspection.

## Stop conditions

Stop and create a new candidate if:

- an existing live goal model is found;
- current UI fields conflict with existing database vocabulary;
- ownership cannot be represented clearly;
- support text would create an external request;
- the candidate requires program, clinical, legal, or fiduciary authority;
- scope expands beyond one participant-owned goal and one useful action.
