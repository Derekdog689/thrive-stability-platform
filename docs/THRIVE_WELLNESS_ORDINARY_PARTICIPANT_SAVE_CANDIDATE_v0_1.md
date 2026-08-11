# THRIVE Wellness Ordinary Participant Save Candidate v0.1

## Status

Review-only code candidate.

No SQL, schema, RLS, trigger, database record, deployment, merge, or push is authorized by this candidate.

## Approved scope

Connect the ordinary `/wellness` participant route to the already-proven participant create path.

v0.1 product behavior:

- authenticated supported person with active program participation may save one active Wellness check-in for the THRIVE business date;
- the existing database RLS, trigger, and unique active-day index remain the enforcement boundary;
- after successful save, the existing client state displays the saved check-in;
- refresh/re-entry must read the same active record;
- duplicate active same-day insert remains blocked;
- no Support request is created automatically;
- no Goal is created automatically;
- no Trust Engine action occurs;
- no clinical, relapse, emergency, capacity, or compliance conclusion is created;
- no archive or delete action is exposed to the participant.

## Files in candidate

1. `src/app/wellness/useWellnessCheckinCandidate.ts`
2. `src/app/wellness/WellnessCheckinPreview.tsx`

## What changes

### Hook

Remove the retired Person D environment-test execution gate from the normal participant create/update functions.

`writeEnabled` becomes true only when the ordinary authenticated participant identity and active participation have resolved.

Database authorization remains unchanged and continues to enforce:

- self ownership;
- active program participation;
- active status;
- creator equals authenticated user;
- same-day update restriction;
- immutable identity/scope;
- one active record per supported person/day.

### Participant wording

Replace test/scaffold language with ordinary participant language:

- "Saving is not available yet" -> "You can save one check-in for today."
- "Saving is not available yet" -> "Review your check-in"
- "Save test check-in" -> "Save check-in"

## Deliberately not added in v0.1

Although the same-day update function is already proven and remains in the hook, the normal route still renders a saved check-in as read-only after creation.

This candidate does not add an Edit button or ordinary same-day editing workflow.

That is a separate product decision.

## Verification plan after separate install approval

1. Confirm browser identity is Synthetic Person D.
2. Confirm no active Person D check-in exists for the current business date.
3. Select an overall-day value and optional synthetic fields.
4. Save once from `/wellness`.
5. Confirm the saved-check-in view appears.
6. Refresh `/wellness`.
7. Confirm the same active check-in is read back.
8. Verify exactly one active current-day Person D row in Supabase.
9. Confirm the row scope and `created_by` remain Person D.
10. Confirm no Support request, Goal, or Trust Engine record/action was created.
11. Confirm archived July 28 synthetic records remain unchanged.
12. Run targeted lint, production build, `git diff --check`, and `git status`.

## Stop conditions

Stop before installation if:

- the candidate requires SQL, RLS, trigger, schema, or service-role changes;
- the current browser identity is not the approved synthetic participant for the first proof;
- an unexplained active current-day Wellness row already exists;
- the patch touches parked `AuthGate.tsx`, `next.config.ts`, or `evidence/`;
- the ordinary route would create Support, Goal, Trust, clinical, emergency, or other external effects;
- the database truth differs from the inspected state.
