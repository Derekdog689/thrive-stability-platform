# THRIVE MVP Participant Engine → Living Signal Reconciliation Map
## 2026-09-30

Status: **READ-ONLY RECONCILIATION / IMPLEMENTATION NOT APPROVED**

Purpose: inspect the current production/MVP participant engine and map its working routes, data sources, resources, participant actions, and returns into the accepted Living Signal chassis.

This document does **not** authorize schema changes, SQL execution, production route replacement, auth-user creation, data insertion, Trust Engine synchronization, merge, or deployment.

---

## 1. Verified system state

Supabase project:
- `thrive-stewardship-stability-platform`
- project ref: `ovzifochmrsaxabclxoe`
- current status inspected: `ACTIVE_HEALTHY`
- PostgreSQL 17
- all inspected `public` tables report RLS enabled

Living Signal:
- accepted participant-facing visual system
- working branch: `feature/living-signal-shell-v0-1`
- draft PR #32
- preview root currently redirects to `/living-signal` for phone testing
- preview redirect is branch-only plumbing and is not yet a production migration decision

The current MVP/production participant engine remains the behavior/data reference.

---

## 2. Current participant-facing route inventory

The current shared participant navigation exposes:

- `/` — Today
- `/my-program` — My Program
- `/budget` — Money / Budget
- `/financial-activity` — Financial Activity
- `/wellness` — Wellness
- `/goals` — Goals
- `/resources` — Resources
- `/support` — Support
- `/reports` — Reports

Authentication and account-purpose routing are separate shared infrastructure.

Test/probe/admin routes are not participant product surfaces and should not be transplanted into Living Signal.

---

## 3. Identity and access engine

### Current behavior

`AuthGate.tsx` uses `useThriveAccountPurpose()`.

Purpose is resolved from:
- Supabase Auth session
- `workspace_members` for active admin/support membership
- `supported_people` for an active supported person linked by `auth_user_id`
- `program_participants` for an active program participation

Possible resolved purposes:
- participant
- support
- admin
- signed-out
- unconfigured
- conflict
- error

Admin and support identities are redirected away from participant routes.

### Living Signal destination

**Preserve underneath the chassis. Do not redesign its authority model.**

Living Signal should consume the same resolved participant identity and program scope before loading participant data.

### Reconciliation decision

**KEEP / REUSE.**

The visual shell changes. Identity ownership, access checks, and participant scoping do not.

---

## 4. Today

### Current MVP engine

Current Today already combines multiple lanes:

- participant identity / name
- Wellness current-day state
- recent Wellness history
- active/open Goals
- Money periods and lines
- current Financial Activity
- Support requests
- Support-assisted budget links
- a priority action
- cross-lane synthesis

`crossLaneSynthesis.ts` currently supports narrow factual relationships:
- Money ↔ Support
- Wellness ↔ Support
- Wellness ↔ Goals
- Goals ↔ Money

The synthesis deliberately places facts next to each other without assigning motive, cause, intent, clinical meaning, or financial irresponsibility.

A separate `buildNowSignals.ts` helper also exists for factual current-state signals such as:
- Support waiting for participant
- draft Money plan
- ended / ending Money plan
- recorded outflow above currently planned amount
- repeated high-stress check-ins
- multiple same-day check-ins
- open Goals

### Living Signal destination

**Today / morning / evening Living Signal.**

The new chassis should become the presentation layer for the existing priority/action/synthesis engine.

### Reconciliation decision

**KEEP ENGINE + REPLACE PRESENTATION.**

Do not recreate Today logic from scratch.

### Thin/missing

The MVP return is useful but visually flat and fragmented. Living Signal fixes the presentation problem.

Later reconciliation should decide whether `buildNowSignals.ts` is active product logic, parked logic, or redundant with current Today synthesis before wiring it into the new chassis.

---

## 5. Wellness

### Current MVP engine

Primary hook:
- `useWellnessCheckinCandidate.ts`

Primary table:
- `participant_wellness_checkins`

Current data includes:
- overall day
- stress
- sleep
- energy
- confidence
- routine
- recovery support
- support needed
- chosen next step
- participant note
- status
- check-in date and timestamps

Current behavior:
- resolves active participant + active program
- reads today's check-in
- reads recent history
- inserts a participant check-in
- supports an allowed same-day completion/update path
- maintains participant/program/workspace scope
- returns structured write errors
- uses America/New_York business-date logic

Existing Wellness logic also includes:
- `buildWellnessGuidance.ts`
- `contextualWellnessReturn.ts`

### Live database inspected

`participant_wellness_checkins`: 106 rows at inspection.

### Living Signal destination

**Wellness Living Signal + Today return + Story.**

The new Wellness scene should be the front end for the existing save/history/guidance behavior.

### Reconciliation decision

**KEEP DATA + KEEP WRITE BEHAVIOR + REHOUSE RETURN.**

No reason to rebuild the working Wellness storage model just to obtain the new visual experience.

### Thin/missing

The new visual concept supports richer right-now and multi-moment presentation. Before adding any schema, first determine how much can be produced from the existing check-in rows and timestamps.

---

## 6. Goals

### Current MVP engine

`/goals` re-exports the existing Goals candidate page.

Primary hook:
- `useParticipantGoals.ts`

Primary table:
- `participant_goals`

Goal lifecycle:
- not_started
- in_progress
- paused
- completed
- archived

Current behavior:
- participant creates Goal
- participant updates Goal
- participant starts / pauses / continues / completes Goal
- archive rather than hard delete
- Goal has title, why-it-matters, next step, area, ownership source
- presets provide participant-friendly starting points
- lightweight guidance can:
  - give an example
  - make the step smaller
  - help think it through
- Goal can hand off to:
  - Resources
  - Support with Goal context in the URL

### Live database inspected

`participant_goals`: 51 rows at inspection.

### Living Signal destination

**Goals lane + Goal Completion + Story.**

The glowing completion moment is presentation for a real `completed` Goal state, not a new goal engine.

### Reconciliation decision

**KEEP ENGINE + REPLACE/RESHAPE PRESENTATION.**

The current status model maps cleanly into Living Signal.

### Thin/missing

Current Goal help is useful but rule-based and contained inside the Goal card. Living Signal can make the return feel more contextual without changing ownership or inventing progress.

---

## 7. Money / Budget

### Current MVP engine

`/budget` is the participant Money/Budget route.

Shared financial hook:
- `useParticipantFinancial.ts`

Current Money data includes:
- financial sources
- import batches
- imported transactions
- combined Financial Activity
- Financial Activity allocations
- Financial Activity period links
- budget periods
- budget lines

Important RPC-backed reads include:
- `get_my_financial_sources_v1`
- `get_my_financial_batches_v1`
- `get_my_financial_transactions_v2`
- `get_my_financial_activity_v1`
- `get_my_financial_activity_allocations_v1`
- `get_my_financial_activity_period_links_v1`
- `get_my_budget_lines_v3`

Budget lifecycle already distinguishes:
- current
- recent history
- historical

A completed budget has a 45-day correction window in current client logic.

### Live database inspected

Relevant current tables include:
- `participant_budget_periods`: 15 rows
- `participant_budget_lines`: 52 rows
- `participant_manual_financial_activity`: 54 rows
- `participant_financial_activity_allocations`: 67 rows
- `participant_financial_activity_period_links`: 1 row
- `participant_transaction_allocations`: 4 rows
- `participant_transaction_explanations`: 26 rows
- `financial_sources`: 8 rows
- `financial_import_batches`: 6 rows
- `staged_financial_transactions`: 114 rows

### Living Signal destination

**Money lane + Money Closeout + Today + Story.**

The Living Signal Money closeout can be driven by real budget lifecycle and derived plan totals.

### Reconciliation decision

**KEEP FINANCIAL ENGINE / KEEP PROVENANCE / REPLACE PRESENTATION.**

Imported evidence and participant-entered activity must remain visibly distinct.

### Frozen interpretation boundary

Bank/financial activity is observational evidence. Displayed activity does not establish intent, irresponsibility, relapse, incapacity, misuse, or any legal, clinical, or fiduciary conclusion.

---

## 8. Financial Activity

### Current MVP engine

`/financial-activity` is materially more capable than a simple transaction list.

Current behavior includes:
- imported Financial Activity
- participant manual Financial Activity
- CSV upload path
- participant manual create
- participant manual correction
- participant manual removal through lifecycle-safe behavior
- connect activity to Budget lines
- edit allocation amount
- participant context/explanations for imported transactions
- explanation draft and submit lifecycle
- explicit provenance labels

The route uses RPCs for participant-safe financial mutations and preserves imported evidence separately from participant-entered records.

### Living Signal destination

This does **not** need to remain a dominant top-level visual lane.

Likely destinations:
- Money details
- Money plan activity drill-down
- contextual “what changed” explanation
- optional deeper history surface

### Reconciliation decision

**KEEP ENGINE / DEMOTE NAVIGATION PROMINENCE.**

The capability is valuable. The participant should not have to think in terms of database/accounting architecture to use it.

---

## 9. Resources

### Current MVP engine

Primary files:
- `resources/page.tsx`
- `resources/[slug]/page.tsx`
- `resources/resourceData.ts`

Current resource categories:
- food & basic needs
- identification & documents
- recovery & community support
- employment & education
- transportation
- housing information
- health & wellness navigation
- financial education
- government programs & benefits
- other / not sure

Resource model includes:
- resource
- organization
- organization role
- access path
- guidance section
- visibility
- verification

Participant detail can present:
- official source
- service area
- plain-language purpose
- primary official path
- other official paths
- phone / URL / email where present
- guidance
- boundary note
- “Ask THRIVE Support” handoff

Resource → Support context can include:
- resource slug
- access path id

### Live database inspected

- `resource_organizations`: 6 rows
- `resources`: 6 rows
- `resource_visibility`: 6 rows
- `resource_organization_roles`: 6 rows
- `resource_access_paths`: 6 rows
- `resource_guidance_sections`: 10 rows
- `resource_verifications`: 6 rows

### Living Signal destination

Resources should become a **capability that appears where useful**, not merely a directory the participant must remember to visit.

Examples:
- Goal → relevant Resource
- Wellness → relevant support path
- Recovery Support → verified recovery/community resources
- Money → financial education or benefits resource
- Today → contextually useful next action
- Story/follow-up → return to a resource thread

A browse-all Resources surface should remain available as a fallback.

### Reconciliation decision

**KEEP RESOURCE ENGINE + CHANGE DISCOVERY MODEL.**

The verified resource structure is one of the strongest existing assets in the MVP.

### Genuine missing layer

The current resource engine can tell a participant **where to go** and can hand off to Support. It does not yet provide a general participant resource-interaction/follow-up model such as:
- participant chose this option
- participant used/opened this path
- participant said it helped / did not help
- follow-up is due

Do not misuse `support_request_entries` as a generic resource tracking table.

Any persistent follow-up model would require a separate candidate and approval gate.

---

## 10. Support

### Current MVP engine

Primary hook:
- `useParticipantSupport.ts`

Current data model:
- `support_requests`
- `support_request_entries`
- `support_request_status_events`
- `support_request_links`

Current participant behavior includes:
- create a Support request
- choose participant category
- describe what is happening
- describe requested support
- choose contact preference
- withdraw a newly submitted request
- view Support responses/status history
- reply when Support is waiting for participant
- preserve historical thread
- link Support to a participant Budget period
- attach validated Resource context to a Support request

### Live database inspected

- `support_requests`: 38 rows
- `support_request_entries`: 13 rows
- `support_request_status_events`: 119 rows
- `support_request_links`: 5 rows

### Living Signal destination

**Support lane + Recovery Support flow + Follow-up + Today.**

This is the working human bridge underneath “Real options. Real people.”

### Reconciliation decision

**KEEP SUPPORT ENGINE.**

Living Signal should make the status and next action clearer, not replace the governed Support workflow.

---

## 11. My Program

### Current MVP engine

`/my-program` resolves:
- supported person
- active program participation
- active program

Tables:
- `supported_people`
- `program_participants`
- `programs`

Current output explains:
- current program
- program type/focus
- participant role
- participation status
- program description

### Living Signal destination

This becomes **context**, not necessarily a primary everyday lane.

Potential homes:
- profile/account area
- “About your THRIVE” sheet
- setup/onboarding
- support/context drawer

### Reconciliation decision

**KEEP DATA / REDUCE DAY-TO-DAY PROMINENCE.**

---

## 12. Reports

### Current MVP engine

`/reports` derives summaries from `useParticipantFinancial()`.

Current output includes:
- statement periods
- Financial Activity count
- imported activity count
- participant-added activity count
- imported outflow
- expected/received/still-expected income
- planned total
- recorded-against-budget total
- remaining plan amount
- unplanned expected income
- financial sources
- imported category summaries
- statement history

The route explicitly preserves source/provenance boundaries.

### Living Signal destination

Reports should become **Story + Money history/details**, not a generic institutional report tab unless a participant explicitly wants a report view.

### Reconciliation decision

**KEEP DERIVED INFORMATION / REHOUSE PRESENTATION.**

---

## 13. Current database spine relevant to participant experience

Live public schema inspection found the following principal participant-system tables, all with RLS enabled:

Identity / scope:
- `workspaces`
- `workspace_members`
- `programs`
- `supported_people`
- `program_participants`

Wellness:
- `participant_wellness_checkins`

Goals:
- `participant_goals`

Support:
- `support_requests`
- `support_request_entries`
- `support_request_status_events`
- `support_request_links`

Money / evidence / participant financial activity:
- `financial_sources`
- `financial_import_batches`
- `staged_financial_transactions`
- `financial_transaction_reviews`
- `participant_transaction_explanations`
- `participant_manual_financial_activity`
- `participant_financial_activity_allocations`
- `participant_financial_activity_period_links`
- `participant_transaction_allocations`
- `participant_budget_periods`
- `participant_budget_lines`
- `budget_categories`

Resources:
- `resource_organizations`
- `resources`
- `resource_visibility`
- `resource_organization_roles`
- `resource_access_paths`
- `resource_guidance_sections`
- `resource_verifications`

System checkpoint:
- `system_checkpoints`

---

## 14. MVP → Living Signal route reconciliation

| MVP capability | Current route / engine | Living Signal destination | Treatment |
|---|---|---|---|
| account purpose | AuthGate / useThriveAccountPurpose | shared shell | preserve |
| current priorities | Today | Today morning/evening | reuse engine, replace presentation |
| Wellness input/history | /wellness | Wellness + Today + Story | reuse |
| contextual Wellness return | Wellness guidance helpers | Wellness return | reuse/refine |
| Goals CRUD/lifecycle | /goals | Goals | reuse |
| Goal completion | Goal status=completed | Goal Completion + Story | reuse state, new presentation |
| Money plan | /budget | Money | reuse |
| Money closeout/history | budget lifecycle | Money Closeout + Story | reuse state, new presentation |
| Financial Activity | /financial-activity | Money details/history | preserve capability, reduce prominence |
| transaction context | Financial Activity | Money details | preserve |
| Resources browse | /resources | Resources fallback | preserve |
| Resource detail/action | /resources/[slug] | contextual Resources / Recovery Support | preserve and surface contextually |
| Resource → Support | query/context + support link | Recovery Support / Follow-up | preserve |
| Support thread | /support | Support / Recovery Support | reuse |
| participant reply | /support | Follow-up / Support | reuse |
| program summary | /my-program | account/context | preserve, reduce prominence |
| financial reports | /reports | Story + Money detail | rehouse |
| cross-lane synthesis | crossLaneSynthesis | Today / Story / contextual return | reuse |
| progress narrative | scattered current data | Story | derive first; do not invent history |
| live meeting results | preview only | Recovery Support / Meeting Results | missing live source integration |
| “did this help?” resource outcome | preview only | Follow-up | missing general persistence model |

---

## 15. What Living Signal already solves

The accepted chassis solves the largest presentation problem in the MVP:

- no longer feels like separate institutional modules;
- gives Today a real sense of place and priority;
- makes completion visible;
- gives Story an actual product role;
- makes Support feel connected to action;
- creates a place for useful resources to surface in context;
- allows Money and Wellness to return meaning, not just records;
- creates an environmental/motion system that can acknowledge progress without gamification theater.

---

## 16. What is still genuinely unfinished

This is the important distinction: changing the chassis does **not** finish the product by itself.

### A. Engine reconnection
Every accepted Living Signal preview surface still needs to consume the current participant-scoped engine safely.

### B. Story composition
There is no verified need yet for a new Story table.

First candidate:
- derive Story read-only from existing Wellness, Goal, Money, Support, and resource facts;
- separate fact from interpretation;
- never fabricate historical events.

Only consider persistence later if the derived model proves insufficient.

### C. Resource contextualization
The database/resource engine exists.

What remains is orchestration:
- why this resource appears here;
- which verified path is most useful;
- how a participant continues;
- how THRIVE follows up.

### D. Live meeting discovery
The visual Meeting Results screen is preview-only.

Production requires verified current meeting sources / official finders. Do not ship invented meeting listings.

### E. Resource outcome/follow-up
The “Did this help?” experience does not yet have a general-purpose persistence model.

This should become a separate candidate later rather than being stuffed into Support history.

### F. Navigation consolidation
The MVP has nine participant navigation destinations.

Living Signal should reduce perceived module count while preserving the underlying capabilities.

---

## 17. Recommended transplant sequence

This is a proposed sequence only. It is not implementation authorization.

1. **Shared identity/program shell**
   - prove Living Signal can resolve the same participant and program safely.

2. **Today read-only connection**
   - render real current lane state in Living Signal without writes.

3. **Wellness**
   - preserve current check-in write path and contextual return.

4. **Goals**
   - preserve lifecycle and connect real completion state to the accepted completion experience.

5. **Money**
   - connect plan/activity/closeout while preserving provenance.

6. **Support + Resources together**
   - because the existing MVP already connects these systems.

7. **Story read model**
   - derive real progress chronology from existing facts.

8. **Live Recovery/meeting resource integration**
   - only from verified official/current sources.

9. **Follow-up persistence candidate**
   - only if the product still needs durable “did this help?” state after the existing data is reused.

10. **Production migration plan**
   - only after route-by-route parity and phone verification.

---

## 18. Bottom line

The MVP is **not disposable**.

The current system already contains substantial working capability:
- participant-scoped identity;
- program scope;
- Wellness;
- Goals;
- Money plans;
- Financial Activity;
- participant context/explanations;
- Support threads;
- Support ↔ Money and Resource context links;
- verified resource structure;
- factual cross-lane synthesis;
- reports/history.

Living Signal is the new **participant experience layer** over that engine.

The job ahead is therefore primarily a **controlled transplant and orchestration problem**, not a rebuild.

The most important new product work is concentrated in:
- contextual resource discovery;
- Story composition;
- verified live meeting/resource discovery;
- resource follow-up/outcome behavior;
- deciding which old routes become details rather than top-level destinations.

---

## 19. Next gate candidate

**Living Signal Engine Reconnection Plan v0.1**

Before implementation:
- reconcile the shared participant identity/program resolver;
- choose the first route to connect;
- define read/write parity criteria;
- define rollback boundary;
- define phone verification criteria;
- keep production untouched until explicit approval.
