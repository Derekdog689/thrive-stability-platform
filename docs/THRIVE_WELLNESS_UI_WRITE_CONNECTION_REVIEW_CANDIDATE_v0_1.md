# THRIVE Wellness UI Write Connection Review Candidate v0.1

## Status

Review-only connection candidate.

The participant Wellness form remains unable to save or update records.

## Verified database foundation

- Wellness schema installed;
- structural validation passed;
- authenticated Person D tests passed;
- Person A isolation tests passed;
- outsider denial tests passed;
- workspace-admin archive tests passed.

## Candidate behavior

The Wellness page now attempts to resolve:

1. authenticated Supabase user;
2. active supported-person record;
3. active program participation;
4. active Wellness check-in for the current date.

The read path uses the installed table and existing RLS.

## Saved-state display

When an active check-in exists for today, the candidate displays:

- overall day;
- energy;
- chosen next step;
- status;
- participant note when present.

Editing remains unavailable.

## Draft payload preparation

The hook includes a `buildInsertCandidate` function that can prepare the future
database payload from form state.

The function does not execute a write.

No call exists for:

- `insert`;
- `update`;
- `upsert`;
- write RPC;
- server action;
- route-handler write.

## Duplicate-day behavior

The candidate reads today's active check-in before showing the draft form.

Future behavior should be:

- no active row today: show create form;
- active row today: show saved state and same-day edit affordance;
- duplicate insert response `23505`: refresh today's saved state and explain
  that a check-in already exists;
- no automatic retry through `upsert`.

## Error handling candidate

Participant-facing errors should remain simple:

- sign-in missing;
- participant connection missing;
- active program missing;
- Wellness connection unavailable;
- check-in already exists;
- save could not be completed.

Raw database errors should not be displayed in the final UI.

## Write activation blockers

Before enabling save:

- connect form state to `buildInsertCandidate`;
- review exact insert call;
- review duplicate-day handling;
- review same-day update call;
- review saved-state refresh;
- review loading and disabled states;
- review safe error mapping;
- verify Person D and Person A in the UI;
- run authenticated negative tests through the actual client path.

## Frozen boundaries

- no UI write;
- no real Wellness data;
- no Johnny data;
- no automatic Support request;
- no financial cross-reference;
- no Trust Engine synchronization;
- no push or deployment.

## Exact next gate

Visually verify the connected no-record and saved-record states. Review the
future insert and same-day update logic before enabling any save action.
