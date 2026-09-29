# THRIVE Cross-Lane Synthesis v0.1 — Read-Only Reconciliation Candidate

Date: 2026-09-29  
Repository: `Derekdog689/thrive-stability-platform`  
Supabase project: `ovzifochmrsaxabclxoe`  
Base checkpoint: `e75cb50d9627873b0f58e2dfec53045b1d7065a4`

## Gate

This is a **review-only, read-only reconciliation candidate**.

No product code, schema, RLS, historical data, Trust Engine behavior, or production data is changed by this document.

## Verified live state

The connected Supabase project is `thrive-stewardship-stability-platform` and is ACTIVE_HEALTHY.

Current participant-facing lanes already share the same identity spine:

- `supported_people.id`
- `workspace_id`
- `program_id`
- `supported_person_id`

The relevant live lane tables include:

- `participant_wellness_checkins`
- `participant_goals`
- `support_requests`
- `support_request_links`
- `participant_budget_periods`
- `participant_budget_lines`
- `participant_manual_financial_activity`
- `participant_financial_activity_allocations`
- `participant_financial_activity_period_links`
- `participant_transaction_explanations`

All inspected participant-facing tables remain person/workspace/program scoped.

## Existing cross-lane capability already in the database

`support_request_links` is already an explicit cross-lane bridge. It can reference:

- `budget_period_id`
- `budget_category_id`
- `wellness_checkin_id`
- `goal_id`
- `staged_transaction_id`
- `prior_support_request_id`
- resource context

That means v0.1 does **not** need a new generic cross-lane relationship table merely to prove synthesis.

## Existing cross-lane capability already in the app

Today already reads multiple lanes together:

- Wellness
- Goals
- Money
- Support

Today currently chooses a primary next action from the combined state. Examples already implemented include:

- unfinished Wellness check-in
- current Goal next step
- Support needing participant attention
- assisted Money plan ready for review
- expired Money plan
- completed Money plan with no next plan yet

This proves the app already has a read-only multi-lane observation point.

Wellness also already has a bounded interpretation layer in `contextualWellnessReturn.ts` that:

- compares current and prior check-ins,
- distinguishes change from repetition,
- carries participant choice forward,
- routes to Support when the participant asked for help,
- does not diagnose or claim causality.

That pattern is a strong behavioral precedent for cross-lane synthesis.

## Live-data viability

The production database contains participants with enough activity across multiple lanes to exercise synthesis without fabricating history.

Example aggregate coverage observed during reconciliation:

- one active participant has dozens of Wellness check-ins, Goals, Support requests, and several Money plans;
- other active participants have partial lane coverage;
- some active participants have little or no data yet.

Therefore the synthesis layer must handle both rich-history and sparse-history participants without treating missing data as a problem.

## v0.1 design principle

Cross-Lane Synthesis should not create a permanent label about the person.

It should assemble a temporary, explainable return from already-authorized participant facts:

1. **Fact** — what the participant actually recorded.
2. **Pattern** — what changed, repeated, or co-occurred.
3. **Bounded interpretation** — why those facts may be worth viewing together.
4. **Optional guidance** — one practical next move.
5. **Participant choice** — the participant decides whether the connection fits.

## Candidate v0.1 pairings

Start narrow. Do not synthesize every lane with every other lane.

### 1. Wellness + Goals

Useful when a current/recent Wellness check-in and an active Goal share an obvious practical tension or support opportunity.

Allowed examples:

- a participant reports low energy and has an active Goal with a next step;
- a participant chooses one small task and already has a Goal next step;
- a participant reports improved routine while a related Goal is in progress.

Return style:

> You said your energy is low today. You also have a next step on your goal. Those may be worth looking at together. You can keep the step, make it smaller, or leave it for later.

Do not claim the Wellness state caused Goal progress or non-progress.

### 2. Wellness + Support

This is already partially supported by explicit Wellness-to-Support routing.

Use when:

- `support_needed = yes`,
- chosen next step is help/support,
- or a Wellness-linked Support request already exists.

Prefer explicit links when available.

### 3. Money + Support

This already has the strongest explicit relationship infrastructure through `support_request_links.budget_period_id`.

Use when:

- Support prepared or discussed a Money plan,
- participant asked for Money help,
- or a Money question is already represented in Support.

Do not infer financial irresponsibility from spending.

### 4. Goals + Money

Use only where the relationship is grounded in participant-owned facts.

Examples:

- a Goal explicitly concerns saving, bills, transportation, housing, work, or another Money-relevant next step;
- the participant has a Money state that directly affects the recorded Goal next step.

Do not connect unrelated Goals to Money merely because both exist.

## Candidate synthesis eligibility

A cross-lane return should appear only when at least one of these is true:

1. there is an explicit database link,
2. there is a literal shared participant term/context,
3. the participant's own selected next step clearly points into another lane,
4. a deterministic factual rule can explain the connection without guessing motive.

If none apply, return nothing.

Silence is better than synthetic cleverness.

## Evidence ordering

Prefer evidence in this order:

1. explicit `support_request_links`,
2. current participant-selected actions/next steps,
3. current or recent factual lane state,
4. historical pattern within a bounded recency window,
5. no inference beyond the recorded evidence.

## Recency

v0.1 should favor recent, actionable context rather than scanning the participant's entire history.

Candidate windows:

- Wellness: current day plus recent 7-day context already used by Wellness.
- Goals: active/non-archived Goals, prioritizing in-progress then not-started.
- Money: current active plan, latest completed plan when no active plan exists, and activity owned by those periods.
- Support: unresolved requests first; completed history only when explicitly linked or necessary for continuity.

These windows are candidate behavior, not database retention rules.

## Where synthesis should live first

### Candidate: Today

Today is already the front-door translator and already loads the four primary lanes.

v0.1 should first prove synthesis as a **read-only return on Today**, rather than adding a new page or table.

The return should be small:

- one connection at a time,
- plain language,
- evidence visible,
- optional next move,
- dismissible/ignorable by participant choice.

Do not turn Today into a dashboard of every discovered relationship.

## No new schema recommendation for v0.1

The current live model is sufficient to prototype the first read-only synthesis behavior.

Do **not** create at this gate:

- a synthesis table,
- a pattern table,
- a permanent participant label,
- a scoring table,
- a Trust Engine sync table,
- a generalized inference ledger.

If v0.1 later needs durable participant feedback such as "this connection was useful / not useful," evaluate that separately after real use demonstrates the need.

## Important boundary

Cross-Lane Synthesis may compare authorized THRIVE participant facts.

It does not merge THRIVE with the Trust Engine, and it does not transfer ownership, approvals, authority, or conclusions between systems.

Money/bank evidence remains observational only.

## Candidate implementation shape after approval

If this reconciliation candidate is approved, the smallest implementation pass should be:

1. add a pure/read-only synthesis builder in application code,
2. consume existing lane hook outputs,
3. generate at most one explainable synthesis return,
4. render it first on Today,
5. add no database writes,
6. test against sparse and rich-history participants,
7. phone-test before any broader lane integration.

## Explicitly out of scope

- schema changes,
- RLS changes,
- new migrations,
- backfills,
- Trust Engine synchronization,
- historical rewrites,
- Story page implementation,
- scoring/ranking the participant,
- automated clinical, fiduciary, legal, relapse, intent, or capacity conclusions.

## Decision needed

Review whether this v0.1 boundary is correct:

**Cross-Lane Synthesis begins as a read-only Today-layer interpretation built from existing authorized lane data and explicit links, with no new schema.**

Only after that review should implementation be authorized.

## Working-pass checkpoint

- Live Supabase inspected: yes.
- Current participant lane schema inspected: yes.
- Current Today/Wellness/Goals/Support/Money application surfaces inspected: yes.
- Database changed: no.
- Production code changed: no.
- Trust Engine touched: no.
- `git diff --check`: not run locally; remote connector workflow.
- `git status`: no local checkout.
- Base production checkpoint: `e75cb50d9627873b0f58e2dfec53045b1d7065a4`.
- Next gate: review and approve/revise this Cross-Lane Synthesis v0.1 candidate before implementation.
