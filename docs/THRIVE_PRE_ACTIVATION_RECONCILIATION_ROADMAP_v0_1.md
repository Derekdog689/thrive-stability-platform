# THRIVE Pre-Activation Reconciliation Roadmap v0.1

**Status:** Approved current execution anchor  
**Repository:** `Derekdog689/thrive-stability-platform`  
**Anchored from production/main checkpoint:** `153ed5d85d3827490247f643eeb566def2e56fd9`  
**Evidence basis:** Live THRIVE Personal Stability database reconciliation, participant-authored input, current production behavior, and the approved THRIVE Participant Value Framework v0.1.  
**Primary objective:** Reconcile operator experience and participant value before activating Johnny as a live participant.

---

## 1. Why this roadmap exists

THRIVE is no longer primarily blocked by missing CRUD, missing participant identity, or missing domain tables.

The live system already contains:

- participant identity and program participation;
- authentication and explicit app-access linking;
- Today;
- Wellness;
- Goals;
- Budget / Money;
- Support;
- Resources;
- Reports / history;
- Admin onboarding, app access, support review, and resource maintenance.

The current problem is different:

> THRIVE collects meaningful participant input more reliably than it returns useful orientation, guidance, continuity, or next-step value.

The database also contains a substantial body of participant-authored product evidence. Some records are genuine life-context input, some are beta/product-testing commentary, and some contain both. That evidence must be used deliberately rather than treated as test debris.

This roadmap is the current working spine for pre-activation reconciliation.

---

## 2. Frozen architecture and authority boundaries

These boundaries remain controlling throughout this roadmap:

1. Johnny's THRIVE personal support spine and the Trust Engine remain independent systems.
2. Personal THRIVE activation belongs in the **THRIVE Personal Stability** workspace / **THRIVE Stability Support** program unless separately approved otherwise.
3. Trust-side records do not create participant authority, consent, or app access.
4. Bank and transaction data are observational evidence only.
5. THRIVE must separate facts, patterns, participant explanations, and conclusions.
6. Participant notes do not establish diagnosis, relapse, incapacity, irresponsibility, intent, or fiduciary misuse.
7. No hard deletes during the current MVP.
8. No service-role shortcutting.
9. No production data mutation, Johnny activation, cross-system synchronization, or deployment action without the applicable explicit gate approval.
10. The live database remains truth for installed state; current production behavior and current `main` remain implementation truth.

---

## 3. Product value anchor

The existing approved participant value promise remains:

> THRIVE helps you keep track of what's going on, figure out what matters next, and keep moving without having to hold everything in your head.

Internal principle:

> THRIVE turns scattered life information into continuity, choices, and follow-through.

Every participant interaction should increasingly answer:

> **Did THRIVE help something move?**

The roadmap therefore prioritizes **useful return on participant effort**, not feature count.

---

## 4. Live human-input evidence baseline

### Personal Stability workspace participation footprint

At reconciliation time, the personal workspace contained:

- Derek Steinmetz — active, app access linked;
- Heidi Pfeiffer — active, app access linked;
- Jason Seaman — active beta-live tester, app access linked;
- Matt Culpepper — active beta-live user, app access linked, little/no participant activity;
- Laurie O'Connor — paused beta pressure tester;
- D Rock Tester — active onboarding-flow test identity, no app access;
- Participant D — active synthetic onboarding identity, no app access.

These identities are not interchangeable. Real-use, beta, synthetic, paused, and historical records must be visually and analytically distinguished rather than flattened into one admin list.

### Human-input volume

Observed participant-domain usage included:

| Surface | Live footprint observed |
|---|---:|
| Wellness check-ins | 56 |
| Wellness check-ins with participant notes | 46 total check-ins for Derek with 42 notes; 3 noted Heidi check-ins; 1 noted Jason check-in |
| Goals | 27 |
| Support requests | 16 |
| Support conversation entries | 2 participant-response entries |
| Budget periods | 6 |
| Manual financial activity rows | 29 |
| Participant transaction explanations | 0 |

The zero transaction-explanation count is significant: Transaction Context infrastructure exists, but meaningful real-use adoption in the personal workspace is not yet demonstrated.

---

## 5. Human Feedback Reconciliation Matrix

### Signal legend

- **Strong:** repeated across dates, flows, or users.
- **Moderate:** repeated but concentrated in one user or one workflow.
- **Isolated:** one clear instance worth preserving.
- **Positive:** direct evidence that a flow, wording, or action worked.

| Signal | Evidence surfaces | Strength | Product meaning | Current posture |
|---|---|---|---|---|
| Too much reading / cognitive load | Wellness, Goals, Support | Strong | Participant must scan and act with less clerical reading | Open |
| Losing orientation between steps | Wellness, Goals | Strong | Flow state and visual hierarchy need reconciliation | Open |
| Participant gives input but gets weak return | Wellness, Goals, Support, Money | Strong | Core feedback-layer gap | Open |
| Multiple wellness signals collapse into one generic action | Wellness | Strong | Current return does not sufficiently honor multidimensional input | Open |
| Same or similar guidance appears across different states | Wellness | Strong | Guidance must become more contextual without becoming diagnostic | Open |
| Goals are expected to progress step-by-step | Goals, Heidi feedback | Strong | UI mental model and lifecycle semantics diverge | Open |
| User should not need to know the answer before THRIVE can help | Goals, Support, Money | Strong | THRIVE must offer examples, structure, or bounded options | Open |
| Voice / talk-to-text reduces typing burden | Goals, Support feedback | Moderate | Accessibility / effort reduction candidate | Open |
| Visual icons / scan-click-move interaction preferred | Wellness, Goals | Strong | Affordance pass should reduce text-dominant navigation | Open |
| Support requests contain product-orientation questions | Support | Strong | Product is routing some missing guidance to humans | Open |
| Notification expectations unclear | Support | Isolated but activation-relevant | Participant must know how replies/updates arrive | Open before Johnny |
| Recovery / peer connection is requested but weakly surfaced | Wellness, Resources, Support | Strong | Contextual Resources opportunity | Open |
| Sleep-support guidance is requested | Wellness, Goals | Moderate | Resource/guidance connection opportunity | Open |
| Money mechanics work but "where do I start?" remains unanswered | Money, Support | Strong | Financial capability layer is thinner than Budget mechanics | Open |
| Morning-routine goal flow worked well | Goals | Positive | Preserve and reuse this interaction pattern | Preserve |
| Wellness "flow worked" / "this is good" / "a lot better" signals exist | Wellness | Positive | Do not rebuild the module wholesale | Preserve |
| Support persistence and lifecycle function | Support | Positive | Improve orientation, not core request infrastructure | Preserve |
| Resource governance is mature | Resources/Admin | Positive | Improve contextual surfacing and admin affordance, not data model | Preserve |

---

## 6. Core reconciliation conclusion

The dominant participant signal is:

> **"I gave THRIVE information. What useful thing did THRIVE give me back?"**

This is broader than one Wellness defect.

The same gap appears in different forms:

- Wellness records several dimensions but often returns one generic lane.
- Goals frequently ask the participant to supply their own method instead of helping shape the next experiment.
- Support receives questions the product itself should often answer.
- Budget records amounts but can still leave the participant asking where to begin.
- Resources exist, but are not consistently surfaced at the moment a participant expresses a relevant need.

The pre-activation program therefore focuses on **continuity, orientation, contextual help, and operator clarity**, not a rebuild.

---

## 7. Readiness matrix for pre-activation work

### GREEN — preserve and avoid broad reopening

- Authentication foundation
- Participant identity
- Workspace isolation
- Program participation
- Explicit app-access linking boundary
- Support persistence / lifecycle
- Resource governance
- Core responsive participant shell
- Goal create/update persistence
- Budget persistence
- Wellness persistence
- No-hard-delete posture
- Trust Engine separation

### YELLOW — working mechanics, incomplete experience/value

- Admin home hierarchy
- Supported People roster affordance
- App Access queue affordance
- Support Review operator affordance
- Resource Library / Maintenance affordance
- Today synthesis
- Wellness return / guidance
- Goal progression and continuity
- Budget orientation / decision support
- Contextual Resource surfacing
- Support post-submit expectation clarity

### ORANGE — infrastructure exists, insufficient real-use proof

- Transaction Context participant adoption
- Operational bank/financial ingestion
- Cross-module participant story / reflection layer
- Clean separation of product feedback from participant reflection
- Notification channel behavior beyond current verified in-app behavior

### FROZEN unless separately approved

- Trust Engine synchronization
- Trust-side authority crossover
- Clinical interpretation
- Automated intent / relapse / incapacity / fiduciary inference
- Service-role shortcuts
- Hard deletes

---

## 8. Track A — Admin / operator reconciliation

### Goal

Make Admin function as an operational control surface rather than a set of technical management pages.

### A1. Admin Home

**Current issue:** Four equal navigation cards do not communicate what needs attention.

**Candidate direction:**

- orientation summary first;
- counts for active participants, access waiting, support needing action, resources needing review;
- current operational attention items above maintenance actions;
- retain links to People, App Access, Support, Resources;
- no new authority or automation implied.

**Gate:** Walk page as Derek, define KEEP / MOVE / COLLAPSE / HIDE / ADD-SUMMARY before code.

### A2. Supported People

**Current issue:** Add-person form and lifecycle controls dominate; real, beta, synthetic, paused, and unlinked identities are visually flattened.

**Candidate direction:**

- roster first;
- create-person action secondary;
- search / filter;
- clear badges for active, paused, synthetic/beta reference, linked/unlinked access, participation state;
- person detail for lifecycle controls rather than always-expanded mutation buttons;
- no hard-delete control.

### A3. App Access

**Current issue:** Historical/test/unrelated confirmed Auth accounts visually compete with actual onboarding candidates.

**Candidate direction:**

- "Needs participant access decision" queue first;
- filters / collapsed development-history section;
- preserve explicit human linking;
- no automatic email/name matching;
- no participation mutation during linking.

### A4. Support Review

**Current issue:** Request object is visually dominant; participant, age, last activity, status, and next action are not sufficiently scannable.

**Candidate direction:**

- human-first queue;
- person, topic, age, status, last activity, next action;
- distinguish "needs action" from historical/closed;
- make participant-visible communication clear;
- reconcile notification expectations before Johnny activation.

### A5. Resource Library / Maintenance

**Current issue:** Governance is sound but every layer is exposed at once.

**Candidate direction:**

- inventory/status first;
- show live / draft / needs review / visibility state;
- create draft secondary;
- progressive disclosure for authority, access path, guidance, verification;
- preserve all current governance facts and activation boundaries.

---

## 9. Track B — Participant value reconciliation

### B1. Wellness

**Problem to solve:** multidimensional input currently produces insufficiently contextual return.

**Must reconcile:**

- step orientation;
- multi-signal summary;
- guidance ranking;
- relationship between selected dimensions and suggested next actions;
- recovery-support pathways;
- sleep / routine / stress / energy / confidence context;
- "Other" and "Ask for help" escape-hatch overuse;
- repeated/generic output;
- participant language such as "hard" where the wording itself creates friction.

**Do not introduce:**

- clinical severity;
- diagnosis;
- hidden risk scoring;
- inferred causes;
- fabricated participant explanations.

**Acceptance test:** participant can see what THRIVE noticed, why an option is being offered, and more than one reasonable path when appropriate, without needing to read a wall of text.

### B2. Goals

**Problem to solve:** current goal lifecycle can look like progressive steps while behaving like a one-step completion model.

**Must reconcile:**

- goal vs current step;
- completing a step vs completing the goal;
- continuing after a completed step;
- examples when participant does not know how;
- "why this could help";
- lightweight tracking / reflection;
- reuse known-good morning-routine interaction pattern.

**Acceptance test:** a participant can say "I want this" without already knowing the full method, take one small step, return, record what happened, and receive a coherent next move.

### B3. Support

**Problem to solve:** Support is carrying product-orientation work in addition to human support.

**Must reconcile:**

- what happens after submission;
- whether/where the participant should expect updates;
- current verified notification behavior;
- difference between product guidance and a human support request;
- status language;
- unanswered/open requests before adding new live participants.

**Acceptance test:** participant knows whether the request was received, what happens next, where a reply will appear, and when Support is the appropriate path.

### B4. Money / Budget

**Problem to solve:** mechanics exist, but decision orientation is weak.

**Must reconcile:**

- "where do I start?" state;
- current-plan meaning;
- what changed;
- what requires attention now;
- bank connection expectations;
- relationship between budget plan and observed/manual financial activity.

**Boundary:** no moral scoring or intent inference.

**Acceptance test:** participant can understand the plan and identify one practical next money decision without THRIVE judging the transaction history.

### B5. Contextual Resources

**Problem to solve:** Resources exist as a governed library but participant needs do not consistently lead to relevant resources.

**Must reconcile contextual entry from:**

- Wellness;
- Goals;
- Support;
- Money when appropriate.

Examples already expressed in live input include therapy/insurance, sleep support, peer/recovery connection, and broad "where do I turn?" needs.

**Acceptance test:** THRIVE can surface a verified resource because it matches an explicit participant-stated need or selected context, while making clear that the resource is an option rather than a diagnosis, eligibility decision, or mandate.

### B6. Participant feedback separation

**Problem to solve:** beta testers have used Wellness/Goal/Support participant fields as product-feedback channels.

**Candidate direction:** establish a lightweight product-feedback affordance or operational convention so future participant reflection remains participant reflection.

**No schema change is assumed or approved by this roadmap.**

---

## 10. Track C — Data and activation reconciliation

Before Johnny activation:

1. classify current supported-person records as real-use / beta / synthetic / paused / historical;
2. reconcile confirmed Auth accounts awaiting links;
3. identify intentionally unlinked development/test accounts;
4. reconcile current Support requests that remain acknowledged/in-progress;
5. verify what notification behavior actually exists;
6. verify active participant Resources and upcoming verification dates;
7. reconcile bank-ingestion expectations versus installed capability;
8. confirm participant-facing language does not imply capabilities that are not installed;
9. verify Johnny's intended Auth account and personal THRIVE workspace/program;
10. only then prepare Johnny Activation Candidate v0.1.

No Johnny record creation or access linking is authorized by this roadmap itself.

---

## 11. Working sequence

### Pass 1 — Anchor and classify
- Anchor this roadmap.
- Treat live DB + current production + current `main` as truth.
- Mark older control documents that contain stale readiness claims for later reconciliation.
- No feature work.

### Pass 2 — Admin Home walk
- Walk Admin Home as Derek.
- Produce exact KEEP / MOVE / COLLAPSE / HIDE / ADD-SUMMARY candidate.
- Review live data needed for each summary.
- Approve before code.

### Pass 3 — Supported People + App Access
- Reconcile roster categories and access queue.
- Preserve explicit authority boundaries.
- Make current vs historical/test state scannable.
- Approve before code.

### Pass 4 — Support Review + notification truth
- Reconcile open support work.
- Verify actual reply/notification behavior.
- Make queue human-first.
- Resolve participant expectation copy.
- Approve before code.

### Pass 5 — Resource admin
- Inventory/status-first library.
- Progressive-disclosure maintenance.
- Verify resource review cadence / due state.
- Approve before code.

### Pass 6 — Wellness value loop
- Reconcile current production guidance against live feedback.
- Preserve working contextual-history logic.
- Fix multi-signal return and orientation rather than rebuilding persistence.

### Pass 7 — Goals continuity
- Reconcile step progression mental model.
- Preserve working creation/editing persistence.
- Candidate a small experiment/next-step cycle.

### Pass 8 — Money orientation
- Reconcile current Budget mechanics with "where do I start?" need.
- Clarify bank/financial-source expectations.
- Keep observational-evidence boundary intact.

### Pass 9 — Contextual Resources
- Connect verified resources to explicit participant-stated context.
- Avoid eligibility/diagnostic inference.

### Pass 10 — Pre-Johnny readiness review
- Walk participant pages as a user.
- Walk admin pages as operator.
- Review unresolved Support items.
- Review identity/access truth.
- Produce Johnny Activation Candidate v0.1.
- Stop for explicit approval before any live activation write.

---

## 12. Decision matrix for every reconciliation item

Each candidate change should be tagged with exactly one current disposition:

- **KEEP** — working and aligned; preserve.
- **MODIFY** — keep capability, change affordance/wording/placement/flow.
- **COLLAPSE** — capability remains, but progressive disclosure reduces noise.
- **MOVE** — capability belongs elsewhere in the flow.
- **FIX DEFECT** — implemented behavior contradicts intended behavior or live truth.
- **PARK** — valid future idea, not required before Johnny.
- **ALREADY RESOLVED** — old feedback no longer reproduces in current production.
- **NEEDS TEST** — evidence is insufficient or contradictory.

Do not convert participant frustration directly into implementation. Reproduce against current production first.

---

## 13. Evidence handling rule

Participant-authored data can provide:

- a recorded fact;
- a participant-stated explanation;
- product feedback;
- a question;
- a preference;
- a request.

It must not be silently converted into:

- diagnosis;
- clinical finding;
- hidden intent;
- incapacity;
- relapse conclusion;
- irresponsibility;
- trust misuse;
- legal/fiduciary conclusion.

For product reconciliation, preserve the distinction between:

1. **Recorded input**
2. **Repeated product pattern**
3. **Participant explanation / question**
4. **Product implication**
5. **Approved implementation**

---

## 14. Johnny activation readiness definition

Johnny is **not** considered ready merely because an Auth account exists.

Activation readiness means:

- intended Auth account verified;
- supported-person identity candidate verified;
- personal THRIVE workspace/program verified;
- participation state understood;
- app access linking path verified;
- Admin can see/manage the participant without excessive ambiguity;
- participant knows what THRIVE is for;
- Wellness produces a useful bounded return;
- Goals support a coherent next step;
- Support expectations are understandable;
- Resources are reachable/contextual enough to be useful;
- Money does not overpromise bank connectivity or interpretation;
- known high-friction defects relevant to first use are resolved or explicitly accepted.

---

## 15. Documentation reconciliation note

Existing control documents include historical readiness language that no longer matches production reality.

In particular, older documents may still describe:

- deployment as blocked;
- Resources as future work;
- Admin/onboarding as future work;
- Wellness as complete based mainly on persistence;
- older branch/commit checkpoints.

Do not delete those records.

Reconcile them in a later documentation pass so historical evidence remains available while current status points to this roadmap and live truth.

---

## 16. Current next gate

**Admin Home Reconciliation v0.1 — review-only candidate**

Required output:

1. inspect the live data that could support Admin Home summaries;
2. walk the current Admin Home as Derek;
3. produce KEEP / MOVE / COLLAPSE / HIDE / ADD-SUMMARY decisions;
4. define the smallest UI candidate;
5. stop for approval before runtime code changes.

### Still frozen at this gate

- Johnny activation;
- database writes;
- schema/RLS changes;
- Trust Engine synchronization;
- hard deletes;
- service-role use;
- broad participant UI rebuild;
- production deployment changes.
