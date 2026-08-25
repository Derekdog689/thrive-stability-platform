# THRIVE Progressive Participant Onboarding v0.1 Implementation Candidate

Date: 2026-08-25
Status: REVIEW-ONLY CANDIDATE

## Purpose

Add a guided first-run participant experience without changing THRIVE's underlying database model, participant lifecycles, Support authority, or Resources authority.

The participant learns THRIVE by using real THRIVE records. Nothing created during onboarding is disposable training data.

---

## Frozen product rules

1. Progressive onboarding is guidance, not a lockout.
2. Wellness, Goals, and Budget are guided but optional.
3. Support is always reachable and never required to complete onboarding.
4. Resources is always reachable, remains its own lane, and is never required to complete onboarding.
5. Financial Activity remains available and is introduced when useful, but the participant is not forced to create activity.
6. A participant may choose `Not now` / `Explore THRIVE` at any guided step.
7. Onboarding fades away as meaningful participant use accumulates.
8. No permanent progress meter or percentage-complete UI.
9. No system-generated personal meaning, diagnosis, conclusion, or forced goal.
10. `Create my first Budget` may be offered as a suggested Goal, not imposed as the participant's goal.

---

## Current code findings

### Today already has the required source hooks

`src/app/page.tsx` currently reads:

- `useParticipantFinancial()`
- `useWellnessCheckinCandidate()`
- `useParticipantGoals()`
- `useParticipantSupport()`

Today already derives current Wellness, Goal, Budget, Financial Activity, and Support states.

### Wellness

`useWellnessCheckinCandidate()` currently exposes:

- `todayCheckin`
- `recentCheckins`

`recentCheckins.length > 0` can act as the v0.1 signal that the participant has begun Wellness.

### Goals

`useParticipantGoals()` exposes the complete participant goal collection as `goals`.

`goals.length > 0` can act as the v0.1 signal that the participant has begun Goals, including completed/archived history rather than only current goals.

### Budget / Financial Activity

`useParticipantFinancial()` exposes:

- `budgetPeriods`
- `financialActivity`

`budgetPeriods.length > 0` can act as the v0.1 signal that the participant has begun Budget.

`financialActivity.length > 0` can be used only for contextual introduction of Financial Activity. It is not an onboarding completion prerequisite.

### Navigation

`ThriveNavigation.tsx` already permanently exposes Today, Budget, Financial Activity, Wellness, Goals, Resources, Support, and Reports.

Progressive onboarding therefore does not need to hide routes or alter authorization. It changes Today emphasis only.

---

## Derived onboarding state v0.1

No new database table or participant onboarding record is proposed.

Derive:

```ts
const hasWellnessHistory = recentCheckins.length > 0;
const hasGoalHistory = goals.length > 0;
const hasBudgetHistory = budgetPeriods.length > 0;

const isFirstRun =
  !hasWellnessHistory &&
  !hasGoalHistory &&
  !hasBudgetHistory;
```

Recommended guided stage precedence:

```text
FIRST_RUN
  no Wellness history
  no Goal history
  no Budget history

WELLNESS_STARTED
  Wellness history exists
  Goal history absent

GOAL_STARTED
  Goal history exists
  Budget history absent

FOUNDATIONS_STARTED
  Wellness + Goal + Budget history exist
  normal Today becomes primary experience
```

This is guidance state, not a participant lifecycle status.

Do not persist `onboarding_stage` in v0.1.

---

## Today experience

### First run

Replace normal returning greeting with first-run orientation:

**Welcome to THRIVE, {participantName}.**

Suggested supporting copy:

`You do not need to set everything up today. Start with what feels useful, and THRIVE will help you learn the rest as you go.`

Primary guided card:

- eyebrow: `Start here`
- title: `How are you doing today?`
- detail: `A quick check-in is a simple way to begin your THRIVE story.`
- action: `Start my first check-in`
- destination: `/wellness`

Secondary actions remain visible:

- `Not now`
- `Explore THRIVE`

Support and Resources remain visible through normal navigation.

### After Wellness, before first Goal

Suggested orientation:

`You've started your THRIVE story.`

Primary guided card:

- title: `Is there something you want to work toward?`
- action: `Create my first Goal`
- destination: `/goals`

Goal remains optional.

### After Goal, before first Budget

Suggested orientation:

`You have something you're working toward.`

Primary guided card:

- title: `Want to make a simple money plan?`
- action: `Build my first Budget`
- destination: `/budget`

Today may additionally surface a suggested Goal concept such as `Create my first Budget`, but THRIVE must not silently create or assign that Goal.

### After first Budget

Progressive training shell fades.

Normal Today becomes the primary experience and may briefly introduce Financial Activity:

`Financial Activity is where you can review what happened and how it relates to your plan.`

No activity creation is required.

Support and Resources remain independent lanes and do not become onboarding requirements.

---

## Greeting behavior

Current unconditional copy:

`Welcome back, {participantName}.`

v0.1 should become conditional:

- first-run participant: `Welcome to THRIVE, {participantName}.`
- participant with meaningful prior THRIVE history: `Welcome back, {participantName}.`

Auth account age/login count must not determine returning status.

---

## What counts as meaningful history in v0.1

Only real participant-domain records:

- any Wellness check-in history;
- any Goal history;
- any Budget period history.

Support requests and Resources use are not required.

Financial Activity is not required because activity may arrive through external evidence or may legitimately be absent.

---

## Scope of code change

Candidate implementation should be limited primarily to:

- `src/app/page.tsx`

A small helper module may be introduced if it materially improves clarity/testability, but no database migration, RPC, RLS change, or new participant table is authorized by this candidate.

Existing module pages remain authoritative for creating their own records.

---

## Runtime validation plan

Use the newly onboarded ordinary participant identity while it still has no Wellness, Goal, or Budget records.

Validate sequentially:

1. first login shows `Welcome to THRIVE`, not `Welcome back`;
2. Wellness is emphasized as the first useful action;
3. Support and Resources remain immediately reachable;
4. participant may bypass guidance without being locked out;
5. save one real Wellness check-in;
6. return to Today and verify Goal becomes the next guided emphasis;
7. create one real Goal;
8. return to Today and verify Budget becomes the next guided emphasis;
9. create first real Budget;
10. return to Today and verify progressive training fades into normal Today;
11. verify Financial Activity is introduced contextually without being required;
12. verify no synthetic/test data appears in the real participant scope.

Heidi's future personal participant identity should later serve as a second fresh-user validation of the same flow.

---

## Explicitly out of scope

This candidate does not authorize:

- database schema changes;
- new onboarding persistence tables;
- new RLS or RPCs;
- forced Goal creation;
- forced Budget creation;
- forced Wellness completion;
- forced Support request;
- forced Resource use;
- hiding Support or Resources;
- changing Support lifecycle;
- changing Resources lifecycle;
- My Story derived view implementation;
- participant reflection storage;
- broad navigation redesign;
- admin onboarding UI.

---

## Implementation gate

If approved, implement the smallest frontend change that derives first-run/progressive state from existing participant data and adjusts Today greeting, orientation copy, and primary guidance accordingly.

Then runtime-test with the current still-empty limited-live participant account before broadening scope.
