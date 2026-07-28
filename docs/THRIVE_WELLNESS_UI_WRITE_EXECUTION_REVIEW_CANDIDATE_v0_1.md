# THRIVE Wellness UI Write Execution Review Candidate v0.1

## Status

Review-only write execution candidate.

The exact insert and same-day update functions now exist in source code, but a
hard-coded execution flag remains false.

No participant can save or update a Wellness check-in through the UI.

## Added candidate functions

### `executeInsertCandidate`

Candidate behavior:

1. confirm write execution is enabled;
2. resolve participant, program, and authenticated user;
3. require overall-day selection;
4. build the insert payload;
5. insert into `participant_wellness_checkins`;
6. return the inserted row;
7. update the saved-state display.

Current behavior:

- exits immediately with `write_disabled`;
- never reaches the Supabase insert call.

### `executeSameDayUpdate`

Candidate behavior:

1. confirm write execution is enabled;
2. require an active saved check-in for today;
3. require overall-day selection;
4. update only mutable self-report fields;
5. preserve identity and scope fields;
6. return the updated row;
7. update the saved-state display.

Current behavior:

- exits immediately with `write_disabled`;
- never reaches the Supabase update call.

### `refreshTodayCheckin`

Reads the current active check-in for today and updates the saved-state display.

## Duplicate-day handling

PostgreSQL error `23505` maps to:

`A check-in is already saved for today.`

The candidate refreshes today's saved state and does not use `upsert`.

## Safe participant-facing errors

- missing identity: `Your participant and program connection is not ready.`
- missing overall day: `Choose how today is going before saving.`
- duplicate day: `A check-in is already saved for today.`
- access denial: `This check-in could not be saved with the current access.`
- connection issue: `The Wellness connection is unavailable right now.`
- fallback: `The check-in could not be saved. Please try again.`

## Hard lock

Both write functions contain:

`const WRITE_EXECUTION_ENABLED = false;`

The UI save button remains disabled.

## Frozen boundaries

- no active UI write;
- no real Wellness data;
- no Johnny data;
- no automatic Support request;
- no financial cross-reference;
- no Trust Engine synchronization;
- no push or deployment.

## Exact next gate

Static-review the write functions and connect form state to them without
changing `WRITE_EXECUTION_ENABLED` or enabling the save button.
