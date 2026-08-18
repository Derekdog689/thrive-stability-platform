# THRIVE Stewardship & Stability Platform

THRIVE is a DSS Enterprises person-centered financial capability, personal stability, and recovery-informed support platform.

THRIVE is designed to help one supported person at a time understand what is happening, make their own choices, build practical plans, explain their own context, and reach for help when they want it.

The platform is not designed to shame, diagnose, surveil, or silently assign intent. It separates observable facts, participant explanations, patterns, support activity, and conclusions.

Johnny is the first modeled real-world person. Synthetic participants are used during development and controlled proof work.

---

## Core Product Model

THRIVE is being built as a set of independent participant-facing modules connected through a future feedback layer.

```text
WELLNESS
"How am I doing?"

GOALS
"What am I trying to do?"

BUDGET
"What did I plan?"

BANK ACTIVITY
"What actually happened?"

TRANSACTION CONTEXT
"What do I say happened?"

SUPPORT
"Where do I want human help?"

RESOURCES
"Where can I find help or options for myself?"

        ↓

THRIVE FEEDBACK LAYER

        ↓

TODAY
"What should I pay attention to now?"

REPORTS
"What has been happening over time?"
```

Each module remains independently owned and governed.

The feedback layer may compare authorized facts across modules, but it must not merge authority, fabricate conclusions, or treat correlation as causation.

---

## Person-Centered Interaction Model

THRIVE should help the participant move through this loop:

```text
NOTICE
→ PLAN
→ OBSERVE
→ EXPLAIN
→ COMPARE
→ ADJUST
→ CHOOSE SUPPORT
```

Examples:

- Wellness helps the participant notice how they are doing.
- Goals identify what matters to them.
- Budget records what they intend to do with available money.
- Bank activity provides observational financial evidence.
- Transaction Context lets the participant add their own explanation.
- THRIVE compares plan and evidence without assigning intent.
- Today surfaces useful next steps.
- Reports show history and patterns over time.
- Support lets the participant ask DSS or another authorized human for help.
- Resources lets the participant privately explore community, peer, educational, or practical support options without automatically creating a support request.

---

## Frozen System Boundaries

### THRIVE and the Trust Engine

Johnny's THRIVE personal support spine and the Trust Engine are independent systems.

THRIVE may compare authorized verified facts from an external trust system when appropriate, but it must not merge ownership, fiduciary authority, approvals, decision-making, ledgers, consent, or responsibility.

The trustee remains responsible for fiduciary decisions in the Trust Engine.

### Bank Data

Bank data is observational evidence.

A displayed transaction does not establish intent, irresponsibility, relapse, incapacity, trust misuse, legal wrongdoing, clinical conclusions, or fiduciary conclusions.

Participant explanations remain separate from imported bank evidence.

### Facts, Patterns, Explanations, Conclusions

THRIVE must distinguish:

1. **Fact** — what an authorized source actually shows.
2. **Pattern** — a repeatable relationship or trend in observed information.
3. **Explanation** — context supplied by the participant or an authorized human.
4. **Conclusion** — an interpretation requiring appropriate authority and evidence.

THRIVE should explain before flagging.

---

## Primary Participant Modules

### Today

Provide the participant with a practical starting point for the day.

Today should eventually summarize useful cross-module signals such as Wellness availability, active Goal next steps, Budget status, recent account activity needing participant context, open Support requests, and relevant self-directed Resources.

Today is an action surface, not an authority engine.

### My Program

Show the program and participation context connected to the supported person.

### Wellness

Provide voluntary, non-clinical reflection.

Wellness input may contribute to participant-facing feedback, but it must not automatically create clinical findings, relapse conclusions, or emergency determinations.

### Goals

Help the participant define what matters and keep the next step visible.

Goals may later connect to Budget, Wellness, Resources, and Today through transparent references.

### Budget

Help the participant create and work their own practical money plan.

The participant can enter expected income, create and edit categories, set and adjust planned amounts, activate a Budget, review totals, see what remains unplanned, compare the plan with available account activity, and adjust the active plan when appropriate.

DSS or another authorized support person may assist, suggest, demonstrate, or help prepare a Budget. The participant remains able to work their own plan.

Transaction allocations are relationships within a Budget period. They help connect observed account activity to the participant's plan without turning THRIVE into an accounting system.

Budget lifecycle behavior remains under active human-usability review. A participant-facing `archive allocation` action is not approved. Budget-level archive semantics must preserve the historical plan, allocations, totals, and transaction relationships while closing editing for the archived Budget.

### Bank Activity

Show participant-owned financial evidence from authorized sources.

Bank activity remains distinct from participant explanations and Budget planning.

The financial evidence foundation includes sources, import batches, staged transactions, ownership mapping, review state, derived allocation reads, and participant-facing summaries.

The current operational gap is Financial Ingestion. THRIVE still needs a deliberate, traceable workflow for authorized statements and other approved financial sources.

### Transaction Context

Let the participant add their own context to an imported transaction without changing the bank record.

The ordinary participant path supports viewing existing context, creating participant-owned draft context, editing the participant's own draft, and persistent readback after refresh.

The imported transaction remains separate and unchanged.

The current lifecycle still requires semantic review because ordinary participant context remains in `draft` status without a complete participant-facing submit or finalize transition.

### Support

Let the participant directly ask an authorized human for assistance through a complete participant and reviewer communication loop.

The currently approved human lifecycle is:

submitted -> acknowledged -> in_progress -> waiting_for_participant -> in_progress -> completed

Participant-facing language remains:

Received -> Acknowledged -> In review -> Waiting for you -> In review -> Resolved

The participant can create a Support request, follow progress, read participant-visible reviewer messages, reply when Support is waiting for information, and retain completed or withdrawn requests in history.

The authorized reviewer can acknowledge the request, start work, send updates, request information, read participant replies, resume work, complete the request, and review closed requests as read-only history.

Participant reply submission does not automatically change reviewer-controlled lifecycle status.

Reviewer timing guidance is informational only. It does not automatically change status, create reminders, infer urgency, or create clinical, legal, fiduciary, or behavioral conclusions.

A Support request does not itself create external sharing consent, expanded authority, clinical intervention, emergency escalation, or Trust Engine action.

Support is working infrastructure for its currently approved human loop. Further expansion requires a separately approved product gate or a verified defect.

### Resources

Give the participant a self-directed way to explore help without automatically involving DSS or another support person.

Future resource areas may include peer and recovery support, community groups, food assistance, transportation, housing, employment and reentry, legal aid, financial education, health and wellness resources, recreation or sober community activities, and faith or community organizations.

Browsing Resources should not automatically create a Support request or Trust notification.

### Reports

Show history and patterns over time.

Reports must preserve source distinctions and should not imply causation where only correlation or coincidence has been observed.

---

## THRIVE Feedback Layer

The Feedback Layer is the planned connective tissue between modules.

Its job is to compare authorized information and produce understandable participant-facing feedback without fabricating intent or authority.

Preferred participant choices may include:

- Review Budget
- View Goal
- Add transaction context
- Browse Resources
- Ask for Support
- Dismiss for now

Human support should generally remain participant-chosen unless a separately authorized workflow explicitly requires otherwise.

---

## Current Participant Usability State

The original synthetic-participant usability sequence established controlled proof for ordinary participant behavior across Wellness, Support, Transaction Context, and Budget.

That synthetic sequence has served its primary purpose and should now be treated as regression and authorization evidence rather than the default human-usability environment.

### Wellness

Verified ordinary participant behavior includes:

- authenticated participant read;
- ordinary participant check-in save;
- persistent readback after refresh;
- recent-history / multi-checkin support;
- voluntary participant reflection;
- no automatic Support request, clinical finding, emergency action, Goal, relapse conclusion, or capacity judgment.

### Support

Verified ordinary participant behavior includes:

- participant request history;
- ordinary request creation;
- participant-friendly status display;
- persistent readback;
- reviewer participant-visible messages;
- participant reply while the request is `waiting_for_participant`;
- participant reply history preserved after refresh;
- completed requests displayed as `Resolved`;
- withdrawn and completed requests preserved in history;
- separation between participant-owned request content and reviewer-controlled lifecycle, routing, assignment, and completion.

Verified reviewer behavior includes:

- acknowledgement;
- start work;
- participant-visible updates;
- information requests;
- follow-up questions while waiting for the participant;
- participant reply review;
- resume work;
- completion;
- read-only closed-request history.

The verified human lifecycle is:

submitted -> acknowledged -> in_progress -> waiting_for_participant -> in_progress -> completed

Participant reply submission does not automatically change reviewer-controlled lifecycle status.

Reviewer timing guidance remains informational only and does not create reminders, automatic escalation, or clinical, legal, fiduciary, or behavioral conclusions.

### Transaction Context

Verified ordinary participant behavior includes:

- participant-owned transaction read through the financial path;
- existing participant context display;
- ordinary draft context creation;
- ordinary draft context editing;
- persistent readback;
- imported transaction remains separate and unchanged.

Current lifecycle gap:

- ordinary participant context remains in `draft` status;
- a complete participant-facing submit or finalize transition is not yet defined.

### Budget

Verified ordinary participant behavior includes:

- participant Budget draft creation;
- expected-income entry;
- category creation;
- category editing;
- Budget activation;
- active-plan editing;
- planned, recorded, and remaining amounts;
- participant-owned account activity;
- transaction-to-Budget allocation relationships;
- Budget lifecycle history;
- historical allocation visibility.

Current lifecycle gap:

- participant-facing `archive allocation` behavior was rejected during human-usability review;
- Budget-level complete/archive semantics still need final reconciliation;
- archived Budgets should preserve their plan, allocations, totals, and transaction relationships while closing editing.

### Test Strategy Transition

The existing 2099 synthetic participant and related harnesses remain preserved as regression, authorization, edge-case, and historical evidence.

They should not be deleted.

After the current Budget layer is closed, that tester should be retired from ordinary usability work.

Future ordinary usability testing should use current-time periods, realistic workflows, and application-created data wherever the intended UI path exists.

Current Budget state:

- participant Budget creation is installed and working;
- participant expected-income entry is working;
- participant category creation and editing are working;
- Budget activation is working;
- active-plan editing is working;
- participant transaction allocation controls are connected;
- derived allocation reads are connected;
- Budget lifecycle history and historical allocation visibility are working.

The remaining Budget gap is human lifecycle semantics at the Budget-period level.

A participant-facing `archive allocation` action is not approved.

The next Budget phase is to reconcile complete/archive behavior for the Budget itself while preserving the historical plan, allocations, totals, and transaction relationships.

---

## Current Product Sequence

```text
1. Documentation / control-spine reconciliation   ← CURRENT
2. Finish Budget human lifecycle semantics
3. Retire the 2099 tester from ordinary usability
4. Establish a current-time usability tester
5. Complete Financial Ingestion
6. Build Admin / onboarding
7. Reconcile Transaction Context lifecycle
8. Continue THRIVE Feedback Layer
9. Continue Today synthesis
10. Continue Reports history / pattern layer
11. Add Resources / self-directed support
12. Real-device, security, and deployment readiness
```

This order may be adjusted when live database findings require a safer dependency sequence.

---

## Development Doctrine

The database is truth.

Work proceeds in gates:

```text
inspect
→ reconcile
→ document
→ candidate
→ test
→ approve
→ install
→ verify
→ commit
```

Rules:
- no blind rebuilds
- no guessing current schema
- inspect live database and current files before changing architecture
- prefer the smallest safe next step
- do not silently broaden scope
- no hard deletes during the current MVP
- no fabricated consent, clinical findings, historical check-ins, explanations, or authority
- no production SQL, RLS, or schema changes without a reviewed candidate and explicit approval
- no service-role use without explicit approval
- no deployment, push, or merge without explicit approval
- build and verify before committing stable milestones

### Participant Lifecycle Semantics

Participant-facing lifecycle words are product contracts.

Before exposing actions or statuses such as `draft`, `completed`, `archived`, `withdrawn`, or `historical`, define and verify:

- what the participant sees before the action;
- what the participant expects the action to mean;
- what remains visible afterward;
- what remains counted afterward;
- what remains editable afterward;
- how history is preserved.

Backend status names, audit mechanics, and test-harness behavior must not automatically become participant-facing product semantics.

Human usability determines whether the participant experience is correct.

---

## Technical Stack

Current application stack includes:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- Row Level Security
- GitHub
- local development through VS Code / Git Bash

---

## Current Checkpoint

Current safe code checkpoint:

`fd3acb1 Complete THRIVE Support participant reply workflow`

Current documentation continuity checkpoint:

Checkpoint 068

Support Participant Reply and Resolution Loop Complete

Last verified production build:

PASS

30 / 30 routes generated

Current working gate:

Documentation and product-control reconciliation

Support is now working infrastructure for its currently approved participant/reviewer human loop.

The current remaining participant-product gaps are centered on:

- Budget-level complete/archive semantics;
- operational Financial Ingestion;
- Admin / onboarding;
- Transaction Context lifecycle beyond persistent draft status;
- future Feedback Layer, Today, Reports, Resources, real-device, security, and deployment-readiness work.

The most recent participant-facing Budget archive-allocation experiment failed human-usability review and was not committed.

Budget-level lifecycle semantics remain the next planned product gate after documentation reconciliation is complete.

No Johnny activation, Trust Engine synchronization, new production SQL, deployment, merge, or push is implied by this checkpoint.

---

## Product Principle

THRIVE exists to help the person understand, plan, choose, and connect.

The intended experience is not:

```text
system observes
→ system judges
→ system controls
```

The intended experience is:

```text
person reflects
→ person plans
→ THRIVE shows evidence
→ person adds context
→ THRIVE explains
→ person chooses what to do next
```

That person-centered loop is the organizing principle for future work.
