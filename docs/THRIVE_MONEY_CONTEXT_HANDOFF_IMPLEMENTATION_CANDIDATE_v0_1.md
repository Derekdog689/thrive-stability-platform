# THRIVE Money Context Handoff Implementation Candidate v0.1

Date: 2026-10-03  
Status: REVIEW-ONLY IMPLEMENTATION CANDIDATE  
Branch: `docs/money-context-handoff-v0-1`  
Base checkpoint: `8aa613c382a3e12e401597c8e1eb1bf8120a5f49`

## 1. Purpose

The full continuity run proved that identity-preserving returns work across Money, Goals, Support, and Wellness.

The strongest remaining continuity gap is **Money → Support**.

Today, a participant can be looking at a meaningful Money plan closeout and choose:

**Talk it through with Support**

but Support currently receives only a generic Money-origin flag and a starter-plan request.

That breaks continuity.

The participant should not have to restate what THRIVE just showed them.

This candidate defines the smallest factual packet that should travel from the exact Money context the participant is viewing into Support.

This document does not authorize implementation.

---

# 2. Frozen boundaries

This candidate does not authorize:

- schema changes;
- SQL;
- new Support tables;
- new Money tables;
- transaction interpretation;
- financial scoring;
- clinical interpretation;
- automatic Support creation;
- trustee or Trust Engine involvement;
- automatic escalation;
- inferred irresponsibility, misuse, relapse, incapacity, or instability;
- merge or deployment.

Bank and transaction data remain observational evidence.

The participant must explicitly choose to open Support and explicitly choose whether to send a Support request.

---

# 3. Current state

## Money side

Completed Money plans already calculate and display factual context including:

- exact Budget period ID;
- period start;
- period end;
- status;
- expected/available amount;
- planned amount;
- recorded money out;
- remaining amount in planned categories;
- unassigned/flexible amount;
- total activity count;
- factual within-plan / over-plan category counts;
- factual comparison to the previous completed plan where available.

The participant-facing completed-plan surface already says:

**The plan in plain English**

and:

**THRIVE noticed**

It also offers:

**Start the next plan**

or:

**Talk it through with Support**

Current Support link:

```text
/support?from=money
```

This loses the exact Money-plan identity and closeout context.

## Support side

Support already has context-carrying architecture for:

- Goal → Support;
- Wellness → Support;
- Money → Support.

However, current Money context is only a boolean `moneyContext`.

When `from=money`, Support pre-fills:

```text
I’d like help building a starter Money plan.
```

and:

```text
Help me build a starter plan I can review before I use it.
```

This is appropriate for a participant who has **no plan and wants help building one**.

It is not appropriate for every Money-origin Support handoff.

---

# 4. Core rule

> **The Money handoff should carry the exact factual Money object the participant chose to discuss, but only the minimum context needed to avoid re-explaining it.**

Support should receive context.

Support should not receive an interpretation.

---

# 5. Two Money → Support intents already exist conceptually

The current Money experience contains two distinct participant intents that should not be collapsed.

## Intent A: starter-plan help

This is the existing:

```text
/support?from=money&intent=starter-plan
```

Participant meaning:

> I do not have a plan ready and I want help building a starting point.

Current Support starter-plan behavior is appropriate here.

## Intent B: talk through this Money plan

This occurs from a specific active/completed plan.

Participant meaning:

> I am looking at this plan and I want another person to help me think through what I am seeing.

This needs a separate contextual handoff.

The current generic `from=money` behavior does not distinguish these intents.

---

# 6. Candidate route contract

For a specific Money plan:

```text
/support?from=money&intent=review-plan&budgetPeriod=<id>
```

The route should carry only:

- origin;
- intent;
- exact Budget period identity.

Support should resolve the factual plan context from the participant's own currently visible Money data.

Do **not** put all plan totals into the URL.

Why:

- avoids long query strings;
- avoids duplicate factual payloads;
- avoids stale copied values;
- preserves the database-backed object as truth;
- keeps Support tied to the exact Budget period ID.

---

# 7. Receiver-side resolution

Support should use the existing participant financial read model to resolve:

`budgetPeriod=<id>`

against the participant's visible Budget periods.

If the period cannot be found:

- fail soft;
- keep Support available;
- show generic Money-origin context;
- do not disclose whether an inaccessible period exists.

No service-role access.

No broader Money query than the participant can already perform.

---

# 8. Minimal factual context packet

For `intent=review-plan`, Support should derive and display:

### Identity

- period start;
- period end;
- status.

### Factual totals

- available / expected income;
- planned;
- recorded money out;
- unassigned amount, if any;
- remaining amount inside planned categories;
- activity count.

### Optional factual summary

Reuse concise factual closeout language already shown in Money, where available.

For example:

> You had $4,000 available, assigned $2,330 to categories, and recorded $2,455 as money out.

Do not copy every category or every transaction by default.

---

# 9. What should not travel automatically

Do not automatically send:

- every transaction;
- merchant names;
- every Budget line;
- participant transaction explanations;
- bank-source details;
- account masks;
- imported statement metadata;
- inferred spending categories beyond existing saved Budget categories;
- prior Support history;
- trustee context;
- Trust Engine context.

If Support later needs more detail, that should be a separate participant-controlled interaction.

The handoff packet should be enough to preserve conversational continuity, not enough to recreate the entire Money lane inside Support.

---

# 10. Participant-facing Support presentation

For a plan-review handoff, Support should show a compact context card before the request form:

## Continuing from Money

**Sep 1 to Sep 30**

- Available: $4,000
- Planned: $2,330
- Recorded out: $2,455
- Unassigned: $1,670
- Activity: 10

Optional:

> THRIVE is carrying over the plan you were just looking at. These numbers are factual context, not a judgment.

Then:

**What do you want help with?**

The participant can review or edit the request before sending.

---

# 11. Draft request behavior

For `intent=review-plan`, do not use the starter-plan default message.

Candidate default:

```text
I’d like help talking through this Money plan.
```

Candidate requested-support starter:

```text
Help me understand what I want to carry forward, change, or ask about from this plan.
```

The participant can edit both before sending.

Do not imply:

- the plan is bad;
- the participant overspent;
- Support needs to intervene;
- a new plan is required;
- the participant needs supervision.

---

# 12. Starter-plan behavior remains separate

For:

```text
/support?from=money&intent=starter-plan
```

retain the existing starter-plan language:

> I’d like help building a starter Money plan.

This is a separate job from reviewing a specific plan.

That distinction should remain explicit.

---

# 13. Money-side candidate links

## Completed plan

Current:

```text
Talk it through with Support
→ /support?from=money
```

Candidate:

```text
Talk it through with Support
→ /support?from=money&intent=review-plan&budgetPeriod=<completed-period-id>
```

## Active plan

If/when the existing active-plan surface offers Support from that exact plan:

```text
/support?from=money&intent=review-plan&budgetPeriod=<active-period-id>
```

## Draft plan

If a participant chooses Support while working in an existing draft:

```text
/support?from=money&intent=review-plan&budgetPeriod=<draft-period-id>
```

Do not automatically add new buttons during this candidate.

Only wire existing intentional Support entry points when implementation is approved.

---

# 14. Support-side state model

Current Support has:

- `moneyContext: boolean`.

Candidate should conceptually become a narrow Money context object, for example:

```ts
type MoneySupportContext = {
  intent: "starter-plan" | "review-plan";
  budgetPeriodId: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  status: string | null;
  available: number | null;
  planned: number | null;
  recordedOut: number | null;
  unassigned: number | null;
  remaining: number | null;
  activityCount: number | null;
};
```

This is presentation/session state.

No new persistence is proposed.

---

# 15. Data derivation

Support can derive the context from existing Money reads.

Expected existing sources:

- `budgetPeriods`;
- `budgetLines`;
- `financialActivity`;
- `financialActivityAllocations`;
- `financialActivityPeriodLinks`.

The same period/activity relationships already used by Money should define the packet.

Do not duplicate financial truth with separate Support calculations if a shared helper can be extracted safely.

A shared pure helper would be preferable if implementation proves duplication would otherwise occur.

---

# 16. Truth-preserving calculation rules

For the selected Budget period:

### Available

```text
expected_income
```

### Planned

Sum active Budget-line planned amounts for the selected period.

### Recorded out

Sum existing derived actual amounts for active Budget lines associated with the selected period.

### Remaining inside categories

Sum existing derived remaining amounts for active Budget lines.

### Unassigned

```text
max(available - planned, 0)
```

### Activity count

Count only Financial Activity already linked/allocated to the selected period using the existing period-link/allocation relationships.

No new transaction classification.

---

# 17. Avoid duplicated meaning

Money already produces participant-facing closeout text.

Support should not invent a second interpretation layer.

Preferred hierarchy:

1. factual compact totals;
2. optionally reuse an existing factual closeout helper;
3. participant writes what they want help with.

Do not add a new `THRIVE noticed` section inside Support for the same plan.

That would duplicate interpretation surfaces.

---

# 18. Persistence behavior

Opening Support from Money should not persist anything.

Editing the draft Support request should not affect the Money plan.

Only pressing **Send to Support** should create the Support request through the existing Support write path.

The Money-plan ID should only be persisted if an existing approved linking mechanism supports it and the implementation gate explicitly approves that use.

This candidate does **not** presume a new database relationship.

---

# 19. Existing Support / Money linkage

THRIVE already has `support_request_links` used for Support-assisted Budget plans.

That existing relationship should be inspected during implementation planning before deciding whether a plan-review Support request should use it.

Do not silently repurpose that table.

The current relationship has established semantics around Support-assisted Money plans.

A participant discussing an existing completed plan may be a different relationship.

Until that is explicitly reconciled:

> carry Budget-period identity as handoff context only; do not presume persistence of the relationship.

---

# 20. Mobile presentation rule

The phone experience should avoid creating another giant Support card.

Target presentation:

```text
CONTINUING FROM MONEY

Sep 1 – Sep 30
Completed

$4,000 available
$2,330 planned
$2,455 recorded out

More plan details ▾

What do you want help with?
[ editable request ]
```

Secondary values such as unassigned, remaining, and activity count can sit behind **More plan details** if needed.

The participant should understand the handoff in one screenful.

---

# 21. Fail-soft cases

## Missing `budgetPeriod`

If intent is `review-plan` but no ID is supplied:

- keep generic Money handoff;
- do not crash;
- do not claim a plan is loaded.

## Invalid ID

- do not reveal existence;
- show generic Money Support state;
- participant can still ask for help.

## Period becomes unavailable

Same fail-soft behavior.

## Starter-plan intent

No plan identity required.

---

# 22. Existing behavior that should remain unchanged

Do not change:

- Goal → Support context;
- Wellness → Support context;
- exact Support focus `?request=<id>`;
- assisted Budget review;
- Support lifecycle;
- Support replies;
- Support status behavior;
- Money closeout calculations;
- Story;
- Today;
- Resources;
- Recovery Support.

This candidate is only the Money → Support handoff.

---

# 23. Likely files if implementation is later approved

Likely:

- `src/app/money-candidate/page.tsx`
- `src/app/support/page.tsx`

Potential shared-helper extraction:

- a new pure Money context helper under `src/app/` or `src/app/money-candidate/`

Possibly read-only reuse:

- `src/app/useParticipantFinancial.ts`

No migration file is expected from current findings.

---

# 24. Implementation sequence if later approved

## Pass A1: distinguish Money Support intent

- keep starter-plan route;
- add review-plan route from the existing completed-plan Support action;
- preserve exact Budget period ID.

## Pass A2: Support resolves exact period

- resolve participant-visible Budget period;
- derive compact factual packet;
- fail soft.

## Pass A3: presentation

- compact **Continuing from Money** card;
- editable request;
- no giant duplicated closeout report.

## Pass A4: phone test

Test:

1. completed plan → Support;
2. starter-plan help → Support;
3. active/draft plan if an existing Support doorway is wired;
4. invalid period ID;
5. close without sending;
6. send after editing;
7. return to Support normally with no Money context.

No merge between passes unless phone testing requires merged main and explicit approval is given.

---

# 25. Acceptance test

The participant should be able to say:

> **I tapped Support from this Money plan, and Support already knew which plan I meant without telling me what the numbers meant.**

That is the entire job.

---

# 26. Review decisions

Approve, modify, or reject:

1. separate `starter-plan` and `review-plan` intents;
2. route carries Budget-period identity, not copied totals;
3. Support resolves factual context from participant-visible Money data;
4. compact packet includes period, status, available, planned, recorded out, unassigned/remaining, and activity count;
5. no transaction list travels automatically;
6. request remains editable before sending;
7. opening Support creates no persistent record;
8. no automatic interpretation or escalation;
9. do not repurpose `support_request_links` without separately reconciling its semantics;
10. phone presentation stays compact, with secondary values collapsible.

If approved, the next gate is **preview-branch implementation Pass A1 only: distinguish Money Support intent and preserve exact Budget-period identity**.
