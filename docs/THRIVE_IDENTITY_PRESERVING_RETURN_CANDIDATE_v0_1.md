# THRIVE Identity-Preserving Return Candidate v0.1

Date: 2026-10-03  
Status: REVIEW-ONLY DESIGN CANDIDATE  
Branch: `docs/identity-preserving-return-v0-1`  
Base application checkpoint: `f63345a631b216dbcc775995fd01fbe016e86d6f`  
Continuity-map checkpoint reviewed separately: `7dca483217c1e7f9aca4d71bec244ee6556bb7a4`

## 1. Purpose

This candidate defines how Today and Story should return a participant to the **actual existing THRIVE thread or object** that produced a card, instead of sending the participant to a generic lane and making them hunt.

The participant experience rule is:

> **Rich internal continuity, minimal visible navigation.**

The system does the gymnastics. The participant should normally make **one intentional tap**.

This is a design candidate only.

It does **not** authorize:

- application-code changes;
- schema changes;
- SQL writes;
- deployment or merge;
- new participant lanes;
- new analytics or scoring;
- new Resource infrastructure;
- new Goal inference;
- Trust Engine work;
- invented attendance, completion, need, importance, causation, or outcome.

---

# 2. One-door return rule

A return is successful when the participant can answer:

1. **What happened?**
2. **Why am I seeing this?**
3. **Where can I continue it?**

without navigating through multiple generic pages.

The intended shape is:

```text
Story / Today card
→ one intentional tap
→ exact existing object or focused state
→ one useful continuation or Done for now
```

Avoid:

```text
Story
→ Goals home
→ find Past goals
→ identify the goal
→ open it
→ remember why it mattered
→ decide where to go next
```

Internal complexity is acceptable. Visible navigation gymnastics are not.

---

# 3. Verified receiver capabilities today

## Goals

Current Goal data already has exact object identity through `goal.id`.

Current Goal records retain:

- title;
- why it matters;
- next step;
- goal area;
- progress status;
- timestamps.

**Receiver limitation:** the current Goals participant page does not expose a reviewed deep-link contract such as `?goal=<id>`, and no specific Goal route was found in the current main implementation.

Therefore:

- Story and Today know which Goal they mean;
- the receiving Goals surface cannot yet be assumed to focus that exact Goal;
- a generic `/goals` return is truthful but creates navigation work.

**Candidate implication:** exact Goal return needs a small receiver-side focus contract before Story/Today should claim to deep-link to the Goal.

No schema change appears necessary from the current inspection.

---

## Support

Current Support has exact request identity through `request.id`.

Support already:

- separates open and past requests;
- groups replies, participant responses, and status events by request ID;
- supports Goal, Wellness, Money, and Resource-origin context when creating Support;
- supports Money-plan return through linked assisted Budget data.

**Receiver limitation:** the participant Support page currently prioritizes an open request and can reveal other open/past requests, but no reviewed participant-facing `?request=<id>` focus contract exists.

Therefore a Story status event can know exactly which request changed while still landing at generic `/support`.

**Candidate implication:** Support needs a minimal focus contract that can:

- open the relevant request;
- reveal past history when the target request is completed/withdrawn/archived;
- leave all other Support behavior unchanged.

No new Support architecture is needed.

---

## Money

Money is currently the strongest receiver for object-specific return.

The participant Money page already reads:

`/budget?review=<budget_period_id>`

and resolves that ID against existing Budget periods.

Support already uses this pattern for an assisted starter plan.

Money also has stable in-page sections such as:

- `#money-plan`;
- `#money-activity`.

**Candidate implication:** completed Money-plan Story events can likely reuse the existing `review` contract instead of inventing a new Money route.

This is the clearest first object-specific return candidate.

### Financial Activity

The Financial Activity page has exact activity IDs internally.

**Receiver limitation:** no reviewed `activity=<id>` focus contract was found.

Therefore Story currently knows Money activity only as a date-grouped event and sends the participant to broad `/financial-activity`.

**Candidate implication:** do not pretend exact activity focus exists yet. For v0.1, either:

- keep the factual broad return; or
- if activity belongs to a known current plan, return to the existing Money activity section for that plan.

Exact single-activity deep-linking should remain deferred until proven necessary.

---

## Wellness

Wellness has exact saved check-in identity through `checkin.id`.

The Wellness interface already has a real history mechanism:

- recent dates;
- `historyDay`;
- multiple check-ins can exist on one day;
- history cards are rendered from saved check-ins.

**Receiver limitation:** the history focus is component state. No reviewed URL contract such as `?date=<date>&checkin=<id>` exists.

Story currently groups Wellness by date, not by individual check-in.

**Candidate implication:** the smallest truthful return is a focused **history day**, not necessarily one exact check-in.

A future return contract could focus the date and let the existing history list show the saved moments for that day.

No new Wellness persistence is required.

---

## Recovery Support

Recovery Support already receives contextual URL state and carries Wellness context forward.

It is currently the best example of identity/context preservation without user gymnastics.

**Candidate implication:** no new return architecture is needed here for v0.1. Preserve the existing contextual route behavior.

---

# 4. Story return candidate

## Current behavior

Current Story event IDs preserve useful source identity:

- `goal-created:<goal.id>`
- `goal-completed:<goal.id>`
- `budget-complete:<period.id>`
- `support:<status_event.id>`
- Wellness day bucket identity
- Money day bucket identity

But the current `href` often collapses identity:

- Goal → `/goals`
- Support → `/support`
- completed Money plan → `/budget`
- Wellness → `/wellness`
- Money activity → `/financial-activity`

The candidate rule is:

> If Story already knows the object identity, do not discard it at the final navigation step when the receiving lane can safely accept it.

## Candidate return matrix

| Story item | Identity already known? | Receiver supports exact focus today? | Review-only candidate return | User-facing effect |
|---|---:|---:|---|---|
| Goal added | Yes, Goal ID | No | Add a Goal focus contract before changing Story href | Tap returns to that Goal, not Goals home |
| Goal completed | Yes, Goal ID | No | Same Goal focus contract, including Past Goals | Tap opens completed Goal context |
| Current Goal thread | Yes, Goal ID | No | Same contract | Resume that Goal directly |
| Support status event | Yes, request ID is available through status event relationship | No | Add request focus contract | Tap opens the request that changed |
| Unresolved Support thread | Yes, request ID | No | Same contract | Resume exact Support request |
| Money plan completed | Yes, period ID | **Yes** | Reuse `/budget?review=<period.id>` | Tap opens that completed Money plan |
| Current/draft Money plan | Yes, period ID | Partial/existing Money state | Prefer current plan state; use review when needed | Tap opens the plan, not generic Money exploration |
| Wellness day | Yes, date; check-ins known | No URL focus | Add day-focus contract only if lightweight | Tap opens that day in Wellness history |
| Money activity day | Day + activity rows known | No single-activity focus | Keep broad/focused plan activity return in v0.1 | No fake precision |

---

# 5. Today return candidate

Today already carries more object context than its links reveal.

Examples from current main:

- `currentGoal` is an actual Goal object;
- unresolved Support is an actual Support request;
- assisted Budget review has an exact Budget link;
- Money state knows active/draft periods;
- moved-today rows know the event source.

## Candidate rule

Today should use the **same return contract as Story**.

Do not create one routing system for Today and another for Story.

The intended pattern:

```text
same underlying object
→ same focused return
→ regardless of whether entry came from Today or Story
```

## Today candidate matrix

| Today item | Current knowledge | Current return | Candidate |
|---|---|---|---|
| Continue current Goal | exact Goal object | `/goals` | focused Goal return |
| Goal moved today | exact Goal object | `/goals` | focused Goal return |
| Support needs reply | exact request | `/support` | focused Support request |
| Support moved today | exact status/request relationship | `/support` | focused Support request |
| Assisted starter plan | exact Budget period link | `/budget` | use existing `?review=<id>` |
| Completed/ended Money plan | exact period | `/budget` | use existing plan review context |
| Wellness check-in | saved Wellness facts/date | `/wellness` | focused Wellness history day if approved |
| Wellness moved today | saved moment/date | `/wellness` | same focused Wellness contract |
| Story entry | system chronology | Story | unchanged |

---

# 6. Participant copy rule

Object identity should improve behavior without exposing database language.

Do not show:

- "Open Goal ID";
- "Resume request record";
- "Navigate to Budget period";
- "Cross-lane thread."

Use human actions such as:

- **Open this goal**
- **Keep going**
- **See what changed**
- **Review this Money plan**
- **Open this Support request**
- **See that check-in**
- **Done for now**

The user should experience continuity, not architecture.

---

# 7. Minimal-navigation rule

Each Story/Today card should normally offer **one primary continuation**.

A secondary action is acceptable only when it prevents a forced task, for example:

- **Keep going**
- **Done for now**

Avoid presenting every mathematically related THRIVE lane on every card.

Example:

A completed Money Goal should not immediately expose:

- Money;
- Resources;
- Support;
- Wellness;
- new Goal;
- Story.

Instead, the primary return is the **completed Goal itself**.

That focused Goal view can then show at most one or two relevant existing continuations based on saved context and approved Goal-area rules.

This keeps cross-lane intelligence internal and participant navigation simple.

---

# 8. Completed Goal return behavior

Completed Goals are the clearest proof case.

Candidate experience:

```text
Story
"Goal completed: Understand where my money is going"
→ tap
→ exact completed Goal
→ shows:
   - the Goal
   - why it mattered
   - last next step / completion state
   - one relevant existing continuation if appropriate
   - Done for now
```

The continuation is not automatically "make another Goal."

If `goal_area` is Money and Money already has a legitimate current surface, the focused Goal may offer:

**Continue with Money**

If a verified Resource exists for that Goal area, that can later be offered under the approved Goal-continuity rules.

If no good current continuation exists:

**Done for now**

is a complete and valid result.

---

# 9. Support return behavior

Support should not make a participant hunt through:

- priority request;
- other open requests;
- past requests.

Candidate behavior:

```text
Story / Today Support event
→ exact request focus
→ request opens in current Support UI
→ its current status/history is visible
→ no new request is created
```

If the request is historical, the page may need to reveal Past requests automatically.

If the request is open, it should become the focused request even if another request would normally win the priority sort.

This changes presentation focus only.

It does not change Support authority, status, ownership, or lifecycle.

---

# 10. Wellness return behavior

Wellness is intentionally a softer case.

Because Story currently groups multiple check-ins by date, the candidate should not fake a single-check-in target when several moments occurred that day.

Preferred v0.1 concept:

```text
Story
"9 Wellness check-ins · Latest: Okay"
→ tap
→ Wellness
→ that date is opened in history
→ existing saved moments remain visible
```

This respects the current read model.

It avoids inventing a narrative about what the day meant.

---

# 11. Money return behavior

Money has an existing receiver contract and should be used as the first implementation proof if this design is later approved.

Example:

```text
Story
"Money plan completed · Sep 1 through Sep 30"
→ /budget?review=<period.id>
→ completed period review
```

No new table.

No new Money route.

No interpretation.

This is simply object identity surviving the trip.

For Money activity, exact activity deep-linking is not required for this first candidate.

---

# 12. Resources and Recovery Support

No new Resource return behavior is required for Identity-Preserving Return v0.1.

Current Resource behavior already correctly preserves:

- Resource slug/detail;
- contextual recovery intent;
- official access paths;
- Resource-to-Support context when explicitly chosen.

Browsing still does not become Story accomplishment.

Recovery Support remains the structural reference for:

```text
context
→ bounded choices
→ one useful doorway
```

---

# 13. What this candidate deliberately does not solve

This candidate does not attempt to solve:

- the 40-Resource coverage matrix;
- Goal-area-to-Resource recommendations;
- Goal scale/horizon persistence;
- preset-ID persistence;
- Resource saving/bookmarking;
- participant-confirmed Resource outcomes;
- long-term Story interpretation;
- 30/90/180-day analytics;
- charts;
- scoring;
- new Goal architecture;
- Support redesign;
- new Wellness dimensions.

Those remain downstream of current-affordance coherence.

---

# 14. Proposed implementation order if later approved

This section is planning only.

## A. Reuse existing Money review contract

Proof that exact-object returns improve experience without schema change.

## B. Add a lightweight Goal focus contract

Requirements:

- receives an existing Goal ID;
- locates that Goal from the already-loaded participant Goal set;
- brings it into focus;
- works for active and completed Goals;
- does not change Goal persistence.

## C. Add a lightweight Support focus contract

Requirements:

- receives an existing request ID;
- focuses the request;
- reveals open or historical container as needed;
- does not change request lifecycle.

## D. Add Wellness day focus only if needed

Requirements:

- accepts an existing check-in date;
- selects the existing history day;
- makes no new Wellness claim.

## E. Rewire Story and Today to the shared return contracts

Only after receiver behavior is proven.

This order avoids building links that point at receivers that cannot yet understand them.

---

# 15. Review decisions

Before any implementation, approve or modify:

1. **One-door rule:** one intentional tap should normally reach the focused thread.
2. **Shared return contract:** Today and Story should use the same destination behavior for the same object.
3. **Receiver first:** prove the destination can focus the object before changing Story/Today links.
4. **Money first proof:** reuse existing `/budget?review=<id>`.
5. **Goals:** add focus behavior for active and completed Goals without new persistence.
6. **Support:** add focus behavior for open and historical requests without lifecycle changes.
7. **Wellness:** focus a date/history state rather than pretend a date-grouped Story event is one check-in.
8. **Financial Activity:** defer exact single-activity deep links unless later use proves they are needed.
9. **Minimal visible choices:** focused view should normally present one useful continuation plus a clean exit, not a menu of every related THRIVE lane.
10. **No schema presumption:** current inspection does not justify a schema change for this candidate.

If approved, the next gate is **implementation-candidate planning only**, starting with the receiver-side focus contracts and the existing Money review path. No production installation follows automatically.
