# THRIVE Thread Reanchor — 2026-10-05

## Purpose

This document is the clean handoff anchor for the next THRIVE working thread.

The current conversation became overloaded and unreliable for precise gate control. Use this document, the live repository, and the live database as the starting truth for the next thread. Do not reconstruct state from memory alone.

---

## Verified repository state

Repository: `Derekdog689/thrive-stability-platform`

Current `main` at handoff:

```
45b443b6b6d088d89b21d6ceee4a9e05d79914a4
```

That commit is the merge of PR #47:

```
fix: keep Financial Activity day focus in sync
```

PR #47 changed the Financial Activity receiver so the page reads the `day` query through Next.js search params.

No schema, SQL, transaction interpretation, Trust Engine work, or financial-calculation changes were part of that correction.

---

## Frozen THRIVE boundaries

1. THRIVE personal support spine and the Trust Engine remain independent systems.
2. Authorized facts may be compared across systems, but ownership, approvals, consent, authority, ledgers, and decision-making do not merge.
3. Bank and financial activity are observational evidence only.
4. A displayed transaction does not establish intent, irresponsibility, relapse, incapacity, trust misuse, or any clinical, legal, fiduciary, or moral conclusion.
5. Keep facts, patterns, explanations, and conclusions separate.
6. Explain before flagging. Participant language remains supportive, educational, and non-shaming.
7. Database and live code are truth.
8. Work in gates: inspect → reconcile → document → candidate → test → approve → install → verify → commit.
9. No production execution, merge, deployment, destructive action, service-role use, or scope expansion without explicit approval.
10. No hard deletes.
11. Do not fabricate consent, explanations, check-ins, clinical findings, authority, or historical events.
12. Prefer the smallest safe next step.

---

## What has been completed and accepted in the continuity sequence

The identity-preserving return architecture has been proven across the major participant lanes:

- Money completed plan → exact Money plan.
- Goal → exact Goal.
- Support → exact Support request.
- Wellness → exact history day / grouped-day receiver.

The rule remains:

**Single object → exact object. Grouped records → exact truthful group/list/history context.**

Participant-facing navigation principle:

**Rich internal continuity, minimal visible navigation. The system does the gymnastics, not the participant.**

Story is factual. Today is orientation. Financial Activity is observational.

---

## Money → Support work completed

The Money context handoff sequence was implemented and phone-tested.

### Participant side

A completed Money plan can start a Support request with:

- exact completed-plan identity
- review-plan intent
- participant-editable request
- no automatic creation merely from opening Support

The resulting Support card can preserve a visible Money context and open the exact completed plan.

Multiple completed Money plans were tested and each retained its own exact plan identity.

### Admin side

The Support queue now shows a compact review card for a completed Money plan with factual context such as:

- period
- completed status
- available
- planned
- recorded out
- activity count

Participant message and "What would be useful" can be collapsed so the queue is not a wall of text.

The admin card explicitly frames the attached Money facts as context for review, not as an interpretation or conclusion.

The starter-Money Support path remains distinct from the completed-plan review path.

---

## Conceptual idea intentionally parked, not lost

After the current continuity sequence is finished, revisit **interactive interpretation**.

This is not a chatbot concept.

The idea is for THRIVE to help a participant work through factual Money information in the moment without unnecessarily forcing a human Support ticket.

Desired direction:

- immediate participant-facing reflection
- factual comparisons
- participant-supplied explanation can change what THRIVE says next
- useful next-step choices
- no invented intent
- no moralizing
- no "you overspent because you lack discipline"
- human Support remains available when needed

Example principle:

If a category is above the planned amount, THRIVE may say that fact and ask what changed. If the participant says food costs were the reason, THRIVE can use that participant-provided explanation to help explore a next plan. It must not manufacture the explanation itself.

This idea is important, but it is **not the current implementation gate**.

---

## Current failed verification that caused this reanchor

The most recent live phone verification did **not** prove the Financial Activity day-focus experience.

### User-visible result

From Story, tapping a Money activity event for Sep 30 landed on the normal broad Financial Activity list.

The expected focused-day receiver was not visible.

Expected behavior was a focused context for the selected day, with the selected date and the records for that date, while retaining a way to return to the full activity list.

### Important code finding

Current `main` already contains Financial Activity receiver logic that:

- uses `useSearchParams()`
- reads `?day=YYYY-MM-DD`
- filters `financialActivity` for the requested day
- computes focused Money In / Money Out
- scrolls to `financial-activity-day-focus` when matching records exist

Therefore, **do not immediately rewrite the receiver again**.

The next investigation should first trace the producing doorway.

Specifically determine whether the Story Money activity event is actually generating:

```
/financial-activity?day=YYYY-MM-DD
```

or is still sending the broad:

```
/financial-activity
```

Also verify the Today Money-activity doorway separately after Story is reconciled.

---

## Greeting regression / mismatch also observed

At approximately 4:05 PM, the live Today page displayed:

```
Good morning, Derek.
```

Current `main` contains this greeting rule:

```
hour < 12  → Good morning
hour < 17  → Good afternoon
otherwise  → Good evening
```

So at 4:05 PM, current source logic should display **Good afternoon**.

Do not blindly change the greeting logic yet.

First reconcile why the live running experience did not match current `main`:

- deployed version mismatch
- stale production deployment
- browser/PWA/cache behavior
- a second Today surface / alternate source
- another proven cause

Treat the screenshot as user-visible truth and the repository as source truth. Reconcile the difference before editing.

---

## Exact next gate for the new thread

### Gate: producer/deployment reconciliation

Start read-only.

1. Verify current `main` SHA is still the handoff SHA or identify any newer commits.
2. Locate the Story read-model / Story event producer for Money activity.
3. Inspect the actual href produced for a Money activity event.
4. Inspect the Today Money-activity producer separately.
5. Reconcile the live production deployment SHA with repository `main`.
6. Reconcile the 4:05 PM greeting mismatch against the deployed Today code.
7. Document the smallest correction candidate.

Do **not** edit code until the cause is identified.

If the producer is broad, correct the producer only.

If production is stale, correct the deployment path only after explicit approval.

If another cause is proven, fix only that proven cause.

---

## Acceptance criteria for the Financial Activity day-focus gate

A Story Money activity event on a date with saved activity must:

1. carry the selected date into Financial Activity,
2. show a visible focused-day context,
3. show only activity belonging to that day in the focused section,
4. show factual day totals only,
5. preserve source/provenance,
6. provide a truthful route back to the normal full Financial Activity list,
7. fail soft to the normal Financial Activity page for missing/invalid/empty dates,
8. make no interpretation, scoring, clinical inference, or moral judgment.

Then separately verify the Today Money-activity doorway uses the same receiver contract.

---

## Known UX observations that are parked, not current gate

These remain valid feedback but should not derail the next gate:

- Wellness "Choose one useful thing" guidance felt weak and needs later improvement.
- Completed Goal cards can feel visually heavy and sometimes thin after arrival.
- Wellness history can become dense at real volume.
- Support cards can become dense.
- Generic bottom navigation should remain generic.
- Interactive interpretation may eventually reduce unnecessary Support dependence.
- User wants THRIVE to move people forward with more immediacy and usefulness, not become a ticket factory.

---

## Next-thread opening instruction

Open the next thread with:

> Continue THRIVE from `docs/THRIVE_THREAD_REANCHOR_2026-10-05.md`.
> Current handoff base is main `45b443b6b6d088d89b21d6ceee4a9e05d79914a4`.
> First gate is read-only producer/deployment reconciliation for the failed Financial Activity day-focus test and the 4:05 PM "Good morning" greeting mismatch.
> Do not change code until the actual cause is identified.

---

## Handoff closeout

Build status: no application build performed for this handoff; documentation-only branch.

`git diff --check`: not run; no local working tree opened or changed.

`git status`: not run; no local working tree opened or changed.

Commit checkpoint: documentation branch created from `main` at `45b443b6b6d088d89b21d6ceee4a9e05d79914a4`.

Next gate: read-only producer/deployment reconciliation in a clean thread.
