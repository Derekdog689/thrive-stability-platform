# THRIVE Admin + Historical Money Continuity Reconciliation v0.1

Date: 2026-10-04  
Status: REVIEW-ONLY RECONCILIATION  
Base main: `e12de60ad16479a0c1a850e731bd75c2f43c4331`

## Purpose

Reconcile what THRIVE already does across participant Money, Support, Story, and Admin before implementing any additional Money-context work.

The question is not whether THRIVE can build an assisted Budget. It already can.

The question is:

> How should THRIVE preserve and discuss the exact history of any completed Money plan, including older completed plans, while keeping review, comparison, Support conversation, and future-plan creation distinct?

No implementation is authorized by this document.

## Verified current capability

### Participant Money

The participant Money surface already loads all participant-visible Budget periods and all current Budget lines for those periods.

Completed periods are sorted newest-first.

When a specific Budget period ID is supplied through:

```
/budget?review=<budget_period_id>
```

Money can resolve that exact period.

If it is completed, the surface uses that selected completed period as the primary completed-plan object instead of defaulting to the latest completed plan.

This means the architecture is already capable of revisiting older completed plans by exact Budget-period identity, not only the most recent one.

### Historical comparison

For the selected completed plan, Money already derives:

- available / expected income;
- planned total;
- recorded money out;
- remaining inside planned categories;
- unassigned/flexible amount;
- activity count;
- categories that stayed within plan;
- categories that ended above plan.

It also identifies the prior completed period relative to the selected plan and derives factual deltas for:

- recorded money out;
- planned amount.

Therefore, a selected historical plan can already be compared with the completed plan immediately before it in the participant's Budget history.

No causal explanation is inferred.

### Financial Activity membership

THRIVE already preserves the rule that date alone does not make Financial Activity part of a Budget.

Outflow activity belongs to a Budget through active allocation relationships.

Inflow activity belongs through active period-link relationships.

Historical activity already linked to another Budget remains with that historical Budget.

This existing relationship model is sufficient to preserve factual historical plan context.

### Story

Story already emits one factual event for every completed Budget period in its visible time window.

Each completed-plan event points to:

```
/budget?review=<exact-budget-period-id>
```

Story therefore preserves exact completed-plan identity.

Story currently tells the participant that a Money plan completed. It does not yet summarize multi-plan historical patterns such as "this plan stayed closer to the amounts you set than two plans ago."

That distinction should remain deliberate.

### Participant Support

A participant reviewing a completed plan can now choose:

```
Talk it through with Support
```

The route preserves:

- `from=money`;
- `intent=review-plan`;
- exact `budgetPeriod=<id>`.

A separate starter-plan intent remains:

```
from=money&intent=starter-plan
```

These two jobs are distinct and should remain distinct.

### Admin Support

Admin Support already exposes a Money-specific action for a Money Support request:

```
Prepare starter budget
```

That action opens:

```
/admin/assisted-budget?request=<support-request-id>
```

The admin assisted-Budget tool loads the Support request and participant identity before preparing anything.

### Admin assisted-Budget workflow

The existing Admin Money workflow is operational, not conceptual.

Available starter structures include:

- Basic monthly plan;
- Weekly spending plan;
- First paycheck plan;
- Limited-income starter plan;
- Housing transition plan;
- Back-to-work plan.

Admin can set:

- period start;
- period end;
- total money available;
- category amounts;
- optional participant note.

The existing `prepare_assisted_budget_v1` flow:

1. creates a participant-owned draft;
2. creates starter lines;
3. creates the existing Support link;
4. sends a participant-visible Support message;
5. moves Support to waiting-for-participant.

Only the participant may activate the draft.

The participant can edit it, activate it, or leave it for later.

## Core reconciliation

There are now three separate Money jobs.

### Job 1: Build me a starter plan

Participant intent:

> I need help creating a starting structure.

Existing system:

Participant Support request → Admin starter-plan tool → participant-owned draft → participant reviews/changes/activates.

This is already implemented.

Do not rebuild it.

### Job 2: Help me review this completed plan

Participant intent:

> I want to talk about what happened in this exact plan.

Current state:

Participant can reopen the exact completed plan and carry its ID into Support.

Gap:

Support/Admin do not yet receive the factual completed-plan context as part of the review conversation.

This is the strongest continuity gap.

Reviewing a completed plan must not automatically create a new draft.

### Job 3: Help me use history when deciding what comes next

Participant intent may be:

> This older plan worked better. What should I carry forward?

or:

> This plan went differently from the prior one. I want help deciding whether to change the next plan.

This job begins as historical review.

It may optionally continue into the existing assisted-Budget workflow, but only after an explicit participant decision.

Historical review and future-plan preparation must not be collapsed into the same action.

## Historical reach

The current participant Money read model already loads all visible Budget periods, not only the current and latest completed period.

A completed period can therefore be addressed by exact ID even when it is several plans back.

The current UI comparison is pairwise:

```
selected completed plan
        versus
previous completed plan
```

It does not currently provide arbitrary multi-plan comparison such as:

- selected plan vs four plans ago;
- best-performing period;
- rolling average;
- trend score;
- rank.

Those would be new capabilities and are not required for continuity.

The smallest useful model is:

> Open any exact historical plan, see its facts, compare it to the immediately prior completed plan, and optionally choose another historical plan to inspect.

## What Story should do

Story and Money should not become the same surface.

### Story job

Story should surface factual movement across time.

Candidate future examples, only where directly supported by saved plan facts:

- "This completed plan had fewer categories above the amounts you set than the prior completed plan."
- "You assigned less money to categories than in the prior completed plan."
- "More money remained unassigned in this plan than in the prior completed plan."

Story should link back to the exact plan.

Story should not tell the participant why those differences occurred.

### Money job

Money is where the participant opens the exact historical object and walks through:

- what was available;
- what was planned;
- what was recorded;
- what remained;
- which categories were within/above plan;
- factual comparison with the immediately prior completed plan.

### Support job

Support is where a participant can ask:

- "Why did this feel easier to follow?"
- "Can someone help me look at what changed?"
- "What from this plan should I consider carrying forward?"
- "I want help setting up the next plan."

The participant supplies the interpretation/question.

THRIVE supplies factual context.

## Admin review gap

The current Admin assisted-Budget page is designed for Job 1: build a starter plan.

It does not currently load an exact historical Budget period from a review-plan Support request.

Therefore Admin currently sees the participant's Support message, but not the exact completed-plan facts behind that request.

This is a real continuity break.

The next implementation should not immediately alter the starter-Budget workflow.

First, Admin/Support needs a read-only review context for `review-plan`.

## Candidate read-only review context

For a review-plan Support request, Admin/Support could be shown the same factual packet already used by participant Money:

- exact period start/end;
- completed status;
- available;
- planned;
- recorded out;
- remaining;
- unassigned;
- activity count;
- within-plan category count;
- over-plan category count;
- immediate prior completed-period comparison.

No transaction list by default.

No bank-source metadata by default.

No participant explanation rewriting.

No judgment.

## History-first, creation-second rule

For a completed-plan review:

1. show the exact historical plan;
2. let participant/Support discuss it;
3. allow "Done for now";
4. if participant explicitly wants a next plan, then open the existing assisted-Budget workflow.

Do not make "prepare starter budget" the automatic admin action for every Money Support request.

The admin action should depend on intent.

Conceptually:

```
starter-plan
  → Prepare starter budget

review-plan
  → Review Money context
  → optional participant-directed next-plan continuation
```

## support_request_links boundary

The existing Support link is verified for the assisted-Budget lifecycle:

Support request → admin-prepared draft Budget.

That semantic relationship is already meaningful.

A completed historical Budget under discussion is not necessarily the same relationship.

Therefore:

- do not silently use the existing assisted-Budget link to mean "this Support conversation references this old completed plan";
- do not change its semantics during the next pass;
- first determine whether the existing Support schema already has an appropriate read-only/context relationship for historical reference;
- if not, keep the review-plan Budget ID as handoff/session context until a separately reviewed persistence design exists.

## Smallest safe next implementation candidate

### Historical Money Review Context v0.1

Scope:

1. participant review-plan continues to carry exact `budgetPeriod` ID;
2. Support resolves and displays a compact factual view of that exact completed plan;
3. Admin Support can view the same exact factual context for a review-plan request;
4. no starter draft is created merely because the request is Money-related;
5. existing `Prepare starter budget` remains available for starter-plan intent;
6. review-plan may expose a future explicit "Help prepare the next plan" action only after review;
7. no schema change presumed;
8. no multi-plan scoring, ranking, or interpretation.

## What should remain out of scope

Do not add during this continuity pass:

- "best Budget" scoring;
- success/failure labels;
- automatic recommendations;
- inferred reasons for over/under amounts;
- arbitrary multi-period analytics;
- Trust Engine data;
- admin authority expansion;
- new template tables;
- automatic copying of an old completed plan into a new draft;
- automatic Support request creation;
- historical rewrites.

## Recommended implementation order

### H1: Participant Support historical context
Resolve exact completed Budget and show factual packet in review-plan Support.

### H2: Admin Support historical context
Show the same review-plan factual packet to authorized Admin/Support.

### H3: Intent-aware Admin action
Starter-plan requests keep "Prepare starter budget."

Review-plan requests get a review-first action/state instead of immediately presenting plan creation as the primary job.

### H4: Optional continuation
Only after explicit participant desire, allow the conversation to hand off into the already-existing assisted-Budget creation path.

### H5: Story long-view candidate
After review behavior is coherent, separately consider whether Story should surface restrained factual cross-plan comparisons.

## Decision summary

Current THRIVE already supports:

- exact historical Budget identity;
- revisiting older completed plans;
- factual closeout;
- immediate-prior-plan comparison;
- linked Financial Activity history;
- assisted starter-Budget creation;
- Admin templates;
- participant review/edit/activation;
- exact assisted-draft return.

The main missing layer is not Budget creation.

It is:

> **shared historical Money context across participant Support and Admin Support when discussing an exact completed plan.**

That is the next useful seam.
