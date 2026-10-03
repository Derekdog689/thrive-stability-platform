# THRIVE Identity-Preserving Return Implementation Candidate v0.1

Date: 2026-10-03  
Status: REVIEW-ONLY IMPLEMENTATION CANDIDATE  
Branch: `docs/identity-preserving-return-v0-1`  
Approved design checkpoint: `a61013ab581debcf93471ab42e14181078070a06`

## 1. Gate

This document translates the approved Identity-Preserving Return design into a concrete implementation sequence.

It does **not** authorize application-code changes.

No schema change is proposed.

No SQL is proposed.

No merge or deployment is proposed.

The participant experience target remains:

> **Rich internal continuity, minimal visible navigation.**

The participant should normally make one intentional tap and arrive at the correct current thread or object.

---

# 2. Implementation principle

Receiver behavior comes first.

Do not rewire Story or Today until the destination can safely understand the object identity being passed to it.

Implementation order:

1. prove existing Money object return;
2. add Goal focus behavior;
3. add Support focus behavior;
4. add Wellness history-day focus behavior only if it remains lightweight;
5. rewire Story;
6. rewire Today;
7. phone-test the complete return loop.

---

# 3. Candidate A: Money proof

## Current capability

Money already supports:

`/budget?review=<budget_period_id>`

The current Money page resolves the review ID against participant Budget periods.

Support already uses this behavior for assisted Money-plan review.

## Proposed change

No new receiver contract.

Story and Today should use the existing review contract when they already know a specific Budget period ID.

### Story

Current:

```text
Money plan completed
→ /budget
```

Candidate:

```text
Money plan completed
→ /budget?review=<period.id>
```

### Today

Where Today already holds an exact Budget period:

```text
review / ended / completed Money plan
→ /budget?review=<period.id>
```

## Likely files

- `src/app/living-signal/story/buildStoryReadModel.ts`
- `src/app/living-signal/today/_liveToday.tsx`

No Money schema or persistence change.

## Test

- completed period exists;
- Story card opens that period;
- Today Money action opens that same period;
- different completed period IDs resolve correctly;
- invalid/missing review ID falls back safely to current Money behavior.

---

# 4. Candidate B: Goal focus contract

## Current capability

Goal objects already include exact `goal.id`.

Current Goals UI already loads the participant Goal set.

Current Story/Today know which Goal they mean but return to generic `/goals`.

## Proposed receiver contract

```text
/goals?goal=<goal.id>
```

The Goals page should:

1. read `goal` from the URL;
2. resolve it against the already-loaded participant Goal set;
3. reveal the correct active/completed/history container;
4. bring the selected Goal into view;
5. visually focus it without changing persistence;
6. preserve normal Goals behavior when no focus ID exists.

## Guardrails

- no new table;
- no new Goal status;
- no title matching;
- no preset reconstruction;
- no inferred importance;
- invalid ID does not create an error state that blocks Goals;
- completed Goal remains completed;
- archived Goal remains historical.

## Likely files

- `src/app/goals/page.tsx`
- current Goals participant component(s) used by that page
- `src/app/living-signal/story/buildStoryReadModel.ts`
- `src/app/living-signal/today/_liveToday.tsx`

## Candidate URL generation

Story:

```text
goal-created:<id>
→ /goals?goal=<id>
```

```text
goal-completed:<id>
→ /goals?goal=<id>
```

Current Goal thread:

```text
goal:<id>
→ /goals?goal=<id>
```

Today:

```text
currentGoal
→ /goals?goal=<id>
```

## Test

- active Goal focuses;
- not-started Goal focuses;
- completed Goal automatically reveals history/past area;
- unrelated Goal does not focus;
- invalid ID gracefully falls back to ordinary Goals;
- browser back behaves normally;
- no duplicate Goal state is created.

---

# 5. Candidate C: Support focus contract

## Current capability

Support already loads exact requests and groups:

- replies;
- participant responses;
- status events;
- linked assisted Money plans.

Current UI distinguishes:

- priority request;
- other open requests;
- past requests.

## Proposed receiver contract

```text
/support?request=<request.id>
```

The Support page should:

1. read `request`;
2. resolve it against the loaded participant request set;
3. override presentation focus only;
4. if open, show that request as the focused request;
5. if completed/withdrawn/archived, reveal Past requests and focus the target;
6. preserve all request lifecycle state;
7. leave normal priority behavior intact when no request ID exists.

## Important separation

This is **presentation focus**, not Support authority.

It does not:

- reopen a request;
- change status;
- create a request;
- alter ownership;
- alter responses/replies;
- imply the real-world issue is unresolved or resolved.

## Likely files

- `src/app/support/page.tsx`
- possibly `src/app/support/useParticipantSupport.ts` only if a small helper is cleaner, but no persistence change is expected
- `src/app/living-signal/story/buildStoryReadModel.ts`
- `src/app/living-signal/today/_liveToday.tsx`

## Story requirement

Story status events currently retain the status-event ID.

The return must use the related `support_request_id`, not the status-event ID.

That relationship already exists in the loaded status-event data.

## Test

- waiting-for-participant request focuses;
- ordinary open request focuses;
- completed request opens Past requests;
- archived/withdrawn request opens history without changing status;
- invalid request ID falls back safely;
- existing Goal/Wellness/Money create-context URLs remain unchanged.

---

# 6. Candidate D: Wellness history-day focus

## Current capability

Wellness already has:

- recent check-ins;
- history dates;
- `historyDay` component state;
- multiple check-ins per day.

Story currently groups Wellness events by date.

## Proposed receiver contract

Prefer:

```text
/wellness?day=YYYY-MM-DD
```

rather than:

```text
/wellness?checkin=<id>
```

for this first pass.

Reason:

Story's current factual unit is the day bucket.

If there were multiple check-ins, focusing one check-in would imply more precision than the Story card currently represents.

The Wellness page/component should:

1. read `day`;
2. validate that date against loaded recent dates;
3. set the existing `historyDay`;
4. bring Wellness history into view;
5. leave ordinary check-in flow unchanged.

## Likely files

- `src/app/wellness/page.tsx`
- `src/app/wellness/WellnessCheckinCandidate.tsx`
- `src/app/living-signal/story/buildStoryReadModel.ts`
- `src/app/living-signal/today/_liveToday.tsx`

## Test

- date with one check-in opens;
- date with multiple check-ins opens all saved moments for that day;
- invalid date falls back safely;
- opening history does not start a new check-in;
- Story wording remains factual.

---

# 7. Candidate E: Story rewiring

Story should be rewired only after the receiver contracts are proven.

## Proposed Story returns

| Story event/thread | Return |
|---|---|
| Wellness day | `/wellness?day=<dateKey>` |
| Goal added | `/goals?goal=<goal.id>` |
| Goal completed | `/goals?goal=<goal.id>` |
| Current Goal thread | `/goals?goal=<goal.id>` |
| Money plan completed | `/budget?review=<period.id>` |
| Current/draft Money plan | existing Money receiver, exact period where appropriate |
| Support status | `/support?request=<support_request_id>` |
| Unresolved Support thread | `/support?request=<request.id>` |
| Recovery Support | current `/recovery-support` |
| Money activity day | keep broad for v0.1 unless a current-plan return is clearly available |

## Likely file

- `src/app/living-signal/story/buildStoryReadModel.ts`

Potential page-level copy changes should be avoided unless needed for clarity.

---

# 8. Candidate F: Today rewiring

Today should reuse exactly the same receiver contracts.

Do not create Today-only navigation logic.

## Proposed returns

| Today state | Return |
|---|---|
| current Goal | `/goals?goal=<goal.id>` |
| Goal moved today | same Goal focus contract |
| unresolved Support | `/support?request=<request.id>` |
| Support moved today | same Support focus contract |
| assisted Money plan | existing `/budget?review=<period.id>` |
| completed/ended Money plan | exact period review |
| current Wellness | focused day only when a saved day is the source |
| Wellness moved today | `/wellness?day=<dateKey>` |
| Story entry | unchanged |

## Likely file

- `src/app/living-signal/today/_liveToday.tsx`

---

# 9. Shared fallback behavior

Every receiver contract must fail soft.

If the URL identity is:

- missing;
- malformed;
- not found in the participant's loaded records;
- no longer participant-visible;

then the page should fall back to its ordinary lane behavior.

No error should reveal whether an inaccessible record exists.

This preserves current participant boundaries.

---

# 10. No-gymnastics acceptance test

Every focused return should pass:

### One tap

The participant taps once from Today or Story.

### One arrival

The correct thread/object is visible without another navigation step.

### One useful continuation

The focused state can expose the existing continuation already appropriate to that object.

### Clean exit

The participant can leave without being forced into another task.

### No re-explaining

Existing saved context remains visible where the receiver already owns it.

---

# 11. Mobile test sequence

Because participant testing is phone-first, the implementation preview should be tested in this order:

1. Today → current Goal;
2. Story → completed Goal;
3. Today → Support request needing reply;
4. Story → completed Support request;
5. Story → completed Money plan;
6. Today → Money review;
7. Story → Wellness day with one check-in;
8. Story → Wellness day with multiple check-ins;
9. browser back from each focused receiver;
10. ordinary direct entry into Goals/Support/Money/Wellness with no focus parameter.

Success is not merely that the URL works.

Success is:

> **I knew why I landed here, and I did not have to hunt.**

---

# 12. Implementation grouping

If implementation is later approved, use the smallest reversible sequence.

## Pass 1

Money exact-period return only.

Verify.

## Pass 2

Goal receiver focus only.

Verify direct URL manually before Story/Today rewiring.

## Pass 3

Support receiver focus only.

Verify open + historical.

## Pass 4

Wellness day focus only.

Verify single + multiple check-ins.

## Pass 5

Story rewiring.

Verify.

## Pass 6

Today rewiring.

Verify.

## Pass 7

Phone acceptance test.

No production merge until all green and explicitly approved.

---

# 13. Files expected to change if implementation is approved

Likely:

- `src/app/living-signal/story/buildStoryReadModel.ts`
- `src/app/living-signal/today/_liveToday.tsx`
- `src/app/goals/page.tsx` and/or the participant Goals presentation component it delegates to
- `src/app/support/page.tsx`
- `src/app/wellness/page.tsx`
- `src/app/wellness/WellnessCheckinCandidate.tsx`

Possibly unchanged:

- database migrations;
- Supabase schema;
- Resource schema;
- Trust Engine;
- Story persistence, because Story remains derived.

---

# 14. Approval decision

Approve only if we agree:

1. receiver-first remains the implementation order;
2. Money is the first proof because its receiver contract already exists;
3. Goals use `?goal=<id>`;
4. Support uses `?request=<id>`;
5. Wellness uses `?day=<date>` for the first pass;
6. Story and Today share the same receiver contracts;
7. all focus parameters fail soft;
8. exact Financial Activity deep-linking stays deferred;
9. no schema change is presumed;
10. implementation occurs in reversible passes with phone verification before any production merge.

If approved, the next gate is **preview-branch implementation Pass 1 only: Money exact-period return**.
