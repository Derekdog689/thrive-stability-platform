# THRIVE Person D Wellness Create-Path Activation Test Package v0.1

## Status

Review-only controlled test package.

**Do not activate the client path during package installation.**

This package defines one synthetic Person D create-path test, one duplicate-day
test, one same-day update test, and one archive cleanup pass.

## Verified baseline

- Repository: `thrive-stability-platform`
- Branch: `main`
- Starting checkpoint: `79f1abc`
- Next.js: `16.2.12`
- Production build: 24 of 24 routes
- Wellness table: `public.participant_wellness_checkins`
- Person D test activation variable: absent
- Person D client-path activation: off
- Participant-facing save button: disabled while `writeEnabled` is false

## Controlled identities

### Person D authentication

- Email: `dstein561+thrive-onboarding-person-d@gmail.com`
- Auth user ID: `d48b7268-9aa6-4498-a923-2851fd5232c9`

### Person D supported-person record

- Supported person ID: `71000000-0000-4000-8000-000000000009`
- Workspace ID: `71000000-0000-4000-8000-000000000001`

### Person D active participation

- Participation ID: `71000000-0000-4000-8000-000000000010`
- Program ID: `71000000-0000-4000-8000-000000000002`

## Activation gate

The client path becomes available only when all three conditions are true:

1. `NEXT_PUBLIC_THRIVE_WELLNESS_PERSON_D_TEST=true`
2. authenticated user ID equals Person D auth user ID
3. resolved supported-person ID equals Person D supported-person ID

No other synthetic identity and no real participant may receive write access.

## Required preflight

Before activation:

1. Confirm the local branch and checkpoint.
2. Confirm the working tree is clean.
3. Confirm the activation variable is absent or false.
4. Confirm both write functions retain the three-part Person D gate.
5. Confirm the visible save button uses `disabled={!writeEnabled}`.
6. Confirm Person D resolves to the expected supported-person and participation.
7. Confirm no active Person D Wellness check-in exists for the current local date.
8. Run the production build.
9. Record the current date used by the application.
10. Obtain explicit approval for activation.

## Single activation change

The only approved activation change is adding this line to the local,
uncommitted `.env.local` file:

```text
NEXT_PUBLIC_THRIVE_WELLNESS_PERSON_D_TEST=true
```

After changing `.env.local`, fully stop and restart the Next.js development
server so the public environment variable is rebuilt into the client bundle.

Do not commit `.env.local`.

## Synthetic create payload

Use the participant-facing form while signed in as Person D.

Required field:

- overall day: `okay`

Optional fields:

- stress: `low`
- sleep: `good`
- energy: `okay`
- confidence: `okay`
- routine: `on_track`
- recovery support: `connected`
- support needed: `no`
- chosen next step: `review_today_plan`
- participant note: `Synthetic Person D create-path test. No real participant data.`

Expected application payload:

```json
{
  "workspace_id": "71000000-0000-4000-8000-000000000001",
  "program_id": "71000000-0000-4000-8000-000000000002",
  "supported_person_id": "71000000-0000-4000-8000-000000000009",
  "checkin_date": "<LOCAL APPLICATION DATE>",
  "overall_day": "okay",
  "stress": "low",
  "sleep": "good",
  "energy": "okay",
  "confidence": "okay",
  "routine": "on_track",
  "recovery_support": "connected",
  "support_needed": false,
  "chosen_next_step": "review_today_plan",
  "participant_note": "Synthetic Person D create-path test. No real participant data.",
  "status": "active",
  "created_by": "d48b7268-9aa6-4498-a923-2851fd5232c9"
}
```

## Expected create result

Exactly one active row should exist for Person D and the current application
date.

Expected properties:

- generated UUID present;
- workspace, program, supported person, and creator match the allowlist;
- `status = active`;
- `archived_at is null`;
- check-in values match the submitted form;
- participant-facing page changes from the form to the saved check-in view;
- no other participant row is visible.

## Duplicate same-day test

After the first successful insert, attempt to create a second active check-in
for the same Person D and date only through an approved test path.

Expected result:

- second active row is not created;
- unique same-day protection remains effective;
- application refreshes or displays the existing row;
- original row remains unchanged unless the explicit update action is used.

Do not bypass the UI or RLS with service-role credentials.

## Same-day update payload

Update only the existing active Person D row:

- energy: `good`
- confidence: `good`
- chosen next step: `choose_one_task`
- participant note:
  `Synthetic Person D same-day update test. No real participant data.`

Fields that must remain unchanged:

- id;
- workspace ID;
- program ID;
- supported-person ID;
- check-in date;
- created by;
- created at.

Expected result:

- one active row remains;
- row ID remains unchanged;
- allowed reflection fields change;
- `updated_at` advances;
- immutable scope fields remain unchanged.

## Archive cleanup

After the create and update observations are recorded, archive the synthetic
test row using the already validated archive behavior or an explicitly approved
participant/admin path.

Expected archive state:

- `status = archived`;
- `archived_at` is populated;
- no active Person D row remains for the test date;
- row is not hard-deleted.

No hard delete is allowed.

## Postflight

1. Confirm no active Person D Wellness row remains for the test date.
2. Confirm the archived synthetic row remains available as audit evidence.
3. Remove this line from `.env.local`:

```text
NEXT_PUBLIC_THRIVE_WELLNESS_PERSON_D_TEST=true
```

4. Fully restart the development server.
5. Confirm the Wellness save button is disabled again.
6. Confirm Person A and outsider identities remain read-only.
7. Run targeted lint.
8. Run the production build.
9. Run `git diff --check`.
10. Run `git status --short`.
11. Confirm `.env.local` is not staged or committed.

## Stop conditions

Stop immediately if:

- the resolved user is not Person D;
- the supported-person ID differs;
- the participation or program differs;
- an active row already exists before the test;
- the save button becomes available to another identity;
- more than one active same-day row appears;
- an immutable scope field changes during update;
- cleanup cannot archive the synthetic row;
- the environment flag cannot be removed cleanly.

## Frozen boundaries

- synthetic Person D only;
- no Johnny data;
- no real participant data;
- no service-role use;
- no RLS bypass;
- no database schema changes;
- no Trust Engine synchronization;
- no deployment;
- no hard delete.

## Approval checkpoint

Installing and committing this package does not authorize activation.

Activation requires a separate explicit approval after:

- preflight output is reviewed;
- current application date is confirmed;
- no active Person D row exists;
- exact create/update/archive steps are accepted.

## Exact next gate

Run the read-only preflight script and review its output.

Do not add the environment flag and do not click a live save button until a
separate activation approval is given.
