# THRIVE Wellness Controlled-Test Closeout v0.1

## Status

Completed and verified.

## Repository checkpoint

`ef75ad1` — `Add Wellness business-date correction candidate`

## Controlled identity

Synthetic Person D only.

- auth user: `d48b7268-9aa6-4498-a923-2851fd5232c9`
- supported person: `71000000-0000-4000-8000-000000000009`
- workspace: `71000000-0000-4000-8000-000000000001`
- program: `71000000-0000-4000-8000-000000000002`

No Johnny or real participant data was used.

## Verified outcomes

### Create path

- participant-authenticated create succeeded;
- row ownership and creator attribution remained Person D;
- workspace, program, supported-person, and date scope were correct;
- one active row was created.

### Same-day update path

The first update attempt exposed a date-boundary defect:

- the application used the browser-local date;
- the database self-update policy used PostgreSQL `CURRENT_DATE`;
- the scope-guard trigger also used `CURRENT_DATE`;
- after UTC midnight but before New York midnight, the participant-facing date
  was still `2026-07-28` while the database date was `2026-07-29`.

The defect was explained before correction. No intent, responsibility, relapse,
capacity, or compliance conclusion was inferred from the failed request.

### Business-date correction

The installed correction aligned these four layers to `America/New_York`:

1. application business-date helper;
2. participant self-update RLS policy;
3. participant branch of the scope-guard trigger;
4. `checkin_date` column default.

The active-day unique index remained unchanged because it uses the stored date
and does not calculate a date.

### Update retest

After installation:

- same-row participant update succeeded;
- changed values persisted;
- immutable identity and scope fields remained unchanged;
- `created_by` and `created_at` remained unchanged;
- `updated_at` advanced;
- status remained active;
- `archived_at` remained null.

### Duplicate protection

A second same-day participant insert was attempted through the controlled UI.

Verified result:

- participant-facing message stated that a check-in was already saved;
- no second active row was created;
- active same-day count remained one;
- the existing active row remained unchanged.

### Archive cleanup

The remaining active synthetic row was archived through the authenticated
workspace-admin path.

Verified result:

- no hard delete occurred;
- the trigger populated `archived_at`;
- active rows for Person D on `2026-07-28`: `0`;
- archived rows for Person D on `2026-07-28`: `2`.

### Test deactivation

- `NEXT_PUBLIC_THRIVE_WELLNESS_PERSON_D_TEST` was removed from `.env.local`;
- the dev server was restarted;
- controlled-test banners and actions disappeared;
- saving returned to unavailable;
- archived rows were not displayed as an active check-in;
- the normal participant reflection form remained readable.

## Installed permanent state

- explicit application business date using `America/New_York`;
- participant same-day update policy using the same business date;
- scope-guard trigger using the same business date;
- aligned `checkin_date` default;
- unchanged select, insert, admin, identity, participation, archive, and unique-index boundaries.

## Validation

- targeted Wellness lint: PASS;
- production build: PASS, 24/24 routes;
- `git diff --check`: PASS;
- working tree after temporary-artifact cleanup: clean.

## Product classification

Wellness is **WORKING** for the currently approved participant purpose:

- participant can read the current active check-in;
- participant form and write implementation are connected;
- controlled create, same-day update, duplicate protection, archive cleanup,
  and deactivation were proven with synthetic data;
- general participant write activation remains intentionally off pending a
  separate product rollout decision.

This classification does not authorize general activation.

## Frozen boundaries

- no deletion of archived test evidence;
- no reactivation of Person D test mode;
- no broad participant rollout;
- no clinical, emergency, relapse, capacity, or compliance interpretation;
- no push, deployment, or Trust Engine synchronization.

## Next gate

Proceed to the Goals participant-route review.

The first Goals pass is read-only source reconciliation. It must not create a
goals table, enable writes, or turn staff suggestions into participant
commitments.
