# THRIVE Current-Affordance Continuity Map v0.1

Date: 2026-10-03  
Status: REVIEW-ONLY  
Branch: `docs/current-affordance-continuity-map-v0-1`  
Base checkpoint: `f63345a631b216dbcc775995fd01fbe016e86d6f`

## 1. Purpose

This document reconciles the participant affordances THRIVE already exposes and asks a narrow question:

> When a participant does something inside THRIVE, does that thread have somewhere meaningful to continue using capabilities THRIVE already has?

This is not a feature-expansion plan.

It does not authorize:

- new participant lanes;
- new analytics engines;
- scoring or ranking systems;
- six-month prediction logic;
- new Resource infrastructure;
- new visual systems;
- Trust Engine synchronization;
- clinical inference;
- bank-data intent inference;
- invented attendance, reading, contact, completion, success, importance, or severity.

The goal is to close internal circuits that already exist.

The working continuity model is:

```text
entry
→ action
→ useful destination
→ saved fact
→ return path
```

The participant-facing version is simpler:

> You did this. THRIVE remembers it. Here is where that thread can continue if you want it to.

## 2. Verified system state

Current participant-facing lanes and surfaces:

- Today
- Wellness
- Goals
- Money
- Support
- Resources
- Recovery Support
- Story

Current repo and live-database inspection confirms that the system already contains durable participant records or governed support objects for:

- Wellness check-ins;
- participant Goals;
- Money plans and Money activity;
- Support requests, lifecycle events, replies, and linked objects;
- governed Resources, organizations, access paths, guidance, verification, and visibility;
- participant identity/program scope.

Story v0.1 currently derives factual chronology from existing records rather than persisting a new Story conclusion layer.

Recovery Support currently provides the clearest example of a complete internal circuit:

```text
Wellness input
→ contextual return
→ Recovery Support
→ contextual Resources or human Support
→ official destination / bounded next action
```

The continuity problem is therefore not absence of underlying capability. It is that many participant actions still terminate as isolated facts or return to generic lane pages.

## 3. Descriptive dimensions used in this map

### Scale / horizon

Scale describes the practical size or time horizon of an action. It is not importance.

Suggested descriptive bands:

- **Moment** — can happen now or today.
- **Short step** — usually one concrete action over hours or a few days.
- **Near-term thread** — several linked actions over days or weeks.
- **Longer thread** — an ongoing direction likely to span weeks or months.
- **Cycle** — a bounded repeating period, such as a Money plan period.
- **Unknown / participant-defined** — THRIVE does not have enough factual basis to assign a horizon.

These are structural descriptions only.

### Goal size is not Goal importance

A small action can be extremely important to a participant.

THRIVE should not infer importance from:

- duration;
- category;
- completion difficulty;
- repetition;
- external appearance;
- how "big" the title sounds.

Importance should come from participant-supplied context such as `why_it_matters`, explicit language, or future approved participant input.

### Thread role

Each action may function as:

- **Step** — one move inside a broader direction.
- **Thread** — an ongoing line of effort or support.
- **Endpoint** — a truthful completion point for a bounded item.
- **Mixed / context-dependent** — role cannot be safely determined from the current saved fact alone.

An endpoint does not mean the larger life area is finished.

Example:

```text
Complete a job application = endpoint for that application
Finding employment = larger ongoing thread
```

## 4. Continuity principles

1. Preserve object identity whenever THRIVE already has it.
2. Prefer exact thread return over generic lane return.
3. Use existing capabilities before inventing new ones.
4. A completed item should remain useful history, not become a dead card.
5. Resources should be connected only where an actually useful governed Resource exists.
6. Support should receive context when the participant explicitly chooses human help.
7. Story should be downstream of coherent lane behavior.
8. Today should orient and return, not become an authority engine.
9. No cross-lane relationship should manufacture facts the source lane did not establish.
10. Participant-authored Goals deserve preservation without assuming they are larger or more important than preset Goals.

---

# 5. Lane-by-lane continuity map

## A. Wellness

### Current affordances

| Current affordance | Captured input / fact | Scale / horizon | Role | Existing THRIVE relationship | Current continuity | Best existing return | Must remain unclaimed |
|---|---|---|---|---|---|---|---|
| Quick Wellness check-in | overall day plus saved check-in metadata | Moment | Step / observation | Today, Story, Wellness history | Strong | Exact saved moment in Wellness; factual summary on Today/Story | diagnosis, cause, relapse, incapacity |
| Expanded check-in | stress, sleep, energy, confidence, routine, recovery support, support needed, optional note | Moment | Step / observation | Recovery Support, Support, Today, Story | Strongest lane | Contextual return using explicit participant selections | clinical interpretation, severity beyond selected values |
| "Could use recovery support" | explicit participant selection | Moment → near-term | Thread opening | Recovery Support, Resources | Strong | Recovery Support chooser with carried context | preferred recovery modality, relapse status |
| Explicit human Support request | explicit support-needed choice | Moment → near-term | Thread opening | Support | Strong | Support creation with Wellness context | that support was required clinically |
| "Done for now" | explicit participant exit choice | Moment | Endpoint for this interaction | Today | Good | Return to Today without forced task | that issue is resolved |
| Repeat check-in | another factual saved moment | Moment / repeated | Thread evidence | Wellness history, Story | Good | Compare factually with prior saved check-in | meaning of change unless participant supplies it |

### Continuity assessment

**Strength:** Wellness currently has the clearest input → return → optional action loop.

**Gap:** Story still points Wellness events back to generic `/wellness` rather than the specific saved moment or a focused history state.

**Recommended continuity treatment:** preserve the check-in identity and allow Story/Today to return to the relevant Wellness history moment where current architecture can support it without new persistence.

---

## B. Goals

### Current captured facts

Current Goal records include:

- title;
- why it matters;
- next step;
- goal area;
- progress status;
- timestamps;
- ownership/provenance fields.

Current Goal areas include:

- Routine / daily stability
- Money
- Health
- Support
- Work / education
- Personal growth
- Other / participant-authored

The current record does not reliably preserve the exact preset identifier that originally produced a Goal. Therefore continuity should use the saved Goal itself and `goal_area`, not silently reconstruct a preset selection from title text.

### Goal affordance matrix

| Goal affordance / area | Captured fact | Likely scale / horizon | Role | Existing THRIVE relationships | Current continuity | Best existing return | Must remain unclaimed |
|---|---|---|---|---|---|---|---|
| Routine Goal | Goal + why + next step + area | Short step → longer thread | Step or thread | Wellness, Today, Story; Recovery routine when explicitly relevant | Partial | Actual Goal detail/context; Wellness if participant chooses reflection | that routine problem is clinical or recovery-related |
| Money Goal | Goal + next step + area | Short step → cycle / longer thread | Step or thread | Money, Support, Today, Story, financial Resources when actually available | Partial | Goal → relevant Money surface or Goal thread; optional Support | financial distress, irresponsibility, eligibility |
| Health Goal | Goal + next step + area | Short → longer | Step or thread | Wellness, Support, health navigation Resources when actually available | Partial | Goal thread first; relevant existing Resource only when catalog supports it | diagnosis, treatment need |
| Support Goal | Goal + next step + area | Short → near-term | Step / thread | Support, Resources | Partial | Goal context carried into Support only if participant chooses human help | that Support is required |
| Work / education Goal | Goal + next step + area | Short step → longer thread | Step / thread | Employment/education Resources when available, Support, Story, Today | Weak today | Exact Goal thread; relevant governed Resource when catalog coverage exists | employability, readiness, eligibility |
| Personal growth Goal | Goal + next step + area | Usually participant-defined | Thread / mixed | Wellness, Support, Story, Today | Weak today | Preserve Goal identity and next step; do not force Resource link | psychological conclusion |
| Other / write my own | Participant-authored Goal | Unknown / participant-defined | Mixed | Any current lane only where explicit factual relationship exists | Weak today but high continuity value | Preserve full Goal identity, why, next step, and participant wording | inferred category, inferred importance, inferred severity |
| Mark Goal complete | explicit completed status | Endpoint for this Goal record | Endpoint | Story, Today, possibly Money/Resources/Support if already linked by context | Weak return | Completion should return to the completed Goal context, not generic Goals | that larger life issue is solved |
| Archive Goal | archived status | Endpoint for active display | Endpoint | Goal history | Structurally supported | Past Goal/history | failure, abandonment, reason unless supplied |
| Change next step | updated Goal record | Short step | Step | Today, Story | Partial | Exact Goal | meaning of the change |

### Goal scale examples

These are descriptive examples, not hardcoded judgments:

- "Complete a job application" → usually a **short step / endpoint for that application**.
- "Find employment" → usually a **longer thread**.
- "Build a steadier morning routine" → often a **near-term or longer thread**.
- "Complete important appointments and tasks" → may be a **short step or near-term thread**.
- "Improve my resume" → usually a **short step**.
- "Explore training or education" → usually a **near-term thread**.
- "Understand where my money is going" → often a **Money cycle or longer thread**.
- participant-written Goal → **unknown / participant-defined** unless the saved Goal itself supplies clear horizon.

### Critical Goal continuity finding

A completed Goal currently appears truthfully in Story but returns to generic Goals.

This loses:

- the specific Goal identity;
- why it mattered;
- its last next step;
- its Goal area;
- potential relationship to existing Money / Support / Resources / Wellness surfaces.

**Primary correction target:** preserve the completed Goal as a thread-bearing object even after completion.

Completion should mean:

> This Goal is complete.

It should not mean:

> Everything connected to this subject is complete.

---

## C. Money

### Current affordances

| Current affordance | Captured fact | Scale / horizon | Role | Existing THRIVE relationship | Current continuity | Best existing return | Must remain unclaimed |
|---|---|---|---|---|---|---|---|
| Start Money plan | budget period + planned categories | Cycle | Thread | Today, Story, Support | Strong | Exact active/draft plan | financial health conclusion |
| Record Money activity | factual participant/manual financial activity and plan membership where linked | Moment | Step | Financial Activity, active plan, Story, Today | Strong backend / moderate UX | Exact activity or active plan context | intent, irresponsibility |
| Adjust plan | revised factual planning record | Cycle | Thread | Money | Strong | Current plan | reason for adjustment unless supplied |
| Complete Money plan | completed budget period | Cycle | Endpoint for period | Story, Today, next Money plan | Good fact / weak return | Completed period / closeout first, then optional next plan | success/failure judgment |
| Ask for starter Money-plan help | explicit Support request | Near-term | Thread | Support, assisted Budget link, Money | Strong plumbing | Support carries context; linked plan returns to Money | incapacity to budget independently |
| Support prepares draft | factual assisted-plan link/status | Near-term | Step | Support, Money | Strong | Specific draft plan | participant approval until participant chooses |
| Explain transaction/activity | participant explanation separate from evidence | Moment | Step / explanation | Money history | Existing architecture | Exact evidence + explanation separation | intent inferred from transaction |

### Continuity assessment

Money has significant object-level plumbing already.

Main continuity gaps are presentation/return gaps:

- Story completed-plan card returns broadly to `/budget`;
- Money activity Story cards return to Financial Activity but do not necessarily preserve the exact activity context;
- prior plan meaning should carry into next plan only through factual prior values, participant choices, or explicit continuity rules.

**Primary correction target:** make Story and Today return to the relevant plan/activity/closeout object rather than lane home whenever current routing can support it.

---

## D. Support

### Current affordances

| Current affordance | Captured fact | Scale / horizon | Role | Existing THRIVE relationship | Current continuity | Best existing return | Must remain unclaimed |
|---|---|---|---|---|---|---|---|
| Ask for Support | explicit participant request | Near-term | Thread | Goals, Wellness, Money, Resources | Strong | Specific Support request | that request proves need beyond what participant said |
| Continue from Wellness | carried Wellness context | Near-term | Thread | Wellness | Strong | Request retains participant-selected context | clinical conclusion |
| Continue from Goal | carried Goal title / next step | Near-term | Thread | Goals | Existing and underused | Specific Goal → Support handoff | that Goal requires human intervention |
| Continue from Money | carried Money context | Near-term | Thread | Money | Strong plumbing | Money → Support → linked Money plan | incapacity |
| Participant reply | factual response | Moment | Step | Support lifecycle | Strong | Same request | meaning beyond content |
| Status changes | lifecycle fact | Near-term | Thread state | Story, Today | Strong data / weak Story return | Specific request | underlying problem resolved merely because request closed |
| Resolve request | completed Support lifecycle | Endpoint for request | Endpoint | Story/history | Good factual record | Exact past request | real-world outcome unless documented |
| Resource-linked Support | support_request_links can reference Resource/access path | Near-term | Thread | Resources | Infrastructure exists | Specific Resource context where used | Resource use or outcome |

### Critical Support continuity finding

Support already accepts context from Goals, Wellness, and Money.

Therefore the next continuity pass should **use** that capability rather than design a new Support architecture.

The participant-facing issue is currently twofold:

1. upstream lanes often fail to offer the existing context-preserving Support path at the right moment;
2. Story status cards return to generic Support instead of the request that actually changed.

Support history also contains test-era / earlier participant language that can look noisy. That is a presentation/reconciliation issue, not evidence that the lifecycle engine is unsound.

---

## E. Resources

### Current governed infrastructure

Live database and current code support:

- canonical Resources;
- organizations;
- organization roles;
- access paths;
- participant guidance;
- verification;
- visibility;
- Resource-to-Support linking.

Current Resource category vocabulary includes:

- Food & basic needs
- Identification & documents
- Recovery & community support
- Employment & education
- Transportation
- Housing information
- Health & wellness navigation
- Financial education
- Government programs & benefits
- Other / not sure

This category vocabulary is broader than the current live catalog.

### Current catalog reality

The Resource subsystem should not be treated as if every current THRIVE Goal or action already has a matching Resource.

Current meaningful content has grown in slices:

- synthetic/testing content used during infrastructure proving;
- 211 community starting points;
- government-benefit pathways such as SNAP / Social Security work;
- the first governed Recovery Support set.

The first Recovery set established six approved Resource directions:

- Alcoholics Anonymous Meeting Support
- Narcotics Anonymous Meeting Support
- SMART Recovery Meeting Finder
- Celebrate Recovery Group Support
- A.A. Daily Reflections
- NA Recovery Literature

### Resource continuity dimensions

For each current Resource, evaluate:

| Dimension | Question |
|---|---|
| Purpose | What concrete participant need or action can this Resource support? |
| Access friction | Does it go directly to a useful official destination or require multiple navigation steps? |
| Starting usefulness | Is it a strong first stop, a broad directory, a reading source, or a fallback? |
| Current THRIVE connection | Which existing Goal / Wellness / Support / Recovery Support / Money context can legitimately expose it? |
| Return | What can THRIVE show afterward without claiming use? |
| Must remain unclaimed | Attendance, reading, contact, application, eligibility, approval, completion, usefulness unless participant confirms it |

### Resource coverage model

The planned catalog should function as **coverage of existing THRIVE affordances**, not as a generic directory target.

Before adding a Resource, ask:

> Which current THRIVE door does this Resource make more useful?

Examples:

- Work / education Goals → employment and education Resources.
- Money Goals → financial education or government-benefit Resources where appropriate.
- Health Goals → health / wellness navigation Resources.
- Recovery-support selection → Recovery Resources.
- Other / unsure → 211 or a broad official community starting point when that is genuinely useful.
- Transportation Goal / Support issue → transportation Resource when the catalog contains one.
- ID/document Goal → identification/document Resource when available.

A category existing in code does not prove adequate live coverage.

### Resource ranking / grading

Do **not** rank Resources by moral worth, clinical importance, or participant severity.

A useful future internal review can grade Resources operationally by:

- directness;
- verification strength;
- access friction;
- geographic fit;
- whether it is a true starting point versus a broad directory;
- whether the participant can act without unnecessary detours.

That is Resource quality, not participant scoring.

---

## F. Recovery Support

### Current affordances

| Current affordance | Captured fact | Scale / horizon | Role | Existing relationship | Current continuity | Best return | Must remain unclaimed |
|---|---|---|---|---|---|---|---|
| Find a meeting | navigation choice only | Moment / short step | Step | Recovery Resources | Strong | Contextual meeting Resource list | attendance |
| Read something | navigation choice only | Moment | Step | Recovery Resources | Strong | Contextual reading Resource list | reading/completion |
| Connect with someone | participant chooses human-assistance path | Near-term | Thread opening | Support | Strong path | Context-carrying Support | clinical need |
| Build a routine | participant-selected proving interaction | Near-term | Thread | Recovery Support, Resources, Wellness | Non-persistent proving flow | Routine reflection + optional existing meeting/reading paths | adherence/completion |
| Return to Wellness | navigation | Moment | Return | Wellness | Strong | Wellness | any change in recovery state |

### Continuity assessment

Recovery Support is the current proving model for THRIVE's internal affordance design.

It demonstrates:

```text
explicit participant signal
→ bounded choices
→ existing THRIVE destination
→ truthful boundary
```

Future continuity work should copy this structural pattern across current lanes without copying Recovery language where it does not belong.

---

## G. Today

### Current affordances

Today currently reads existing participant state and prioritizes a small number of current actions.

Examples already supported include:

- Check in;
- Support needs your reply;
- assisted Money plan ready;
- Money plan ended;
- continue a current Goal;
- start the next Money plan;
- current Wellness / Goals / Money / Support state;
- what moved today;
- one cross-lane synthesis card;
- Story entry.

### Today continuity map

| Today surface | Source fact | Scale | Role | Current destination | Continuity assessment |
|---|---|---|---|---|---|
| Primary action | selected current factual state | Moment | Return / next step | Relevant lane | Generally strong, sometimes generic |
| Current Wellness | latest check-in | Moment | Orientation | Wellness | Good |
| Current Goals | open Goal count/current Goal | Near/longer | Orientation | Goals | Loses specific Goal when generic |
| Current Money | active/draft/next-plan state | Cycle | Orientation | Money | Good |
| Current Support | priority request state | Near-term | Orientation | Support | Could preserve request identity more tightly |
| What moved today: Wellness | saved check-ins | Moment | Factual event | Wellness | Generic return |
| What moved today: Goal | updated Goal | Short/near | Factual event | Goals | Generic return |
| What moved today: Money | Money activity | Moment | Factual event | Financial Activity | Broad return |
| What moved today: Support | status event | Near | Factual event | Support | Generic return |
| Worth noticing / synthesis | read-only cross-lane relationship | Moment | Orientation | lane-specific action | Useful proving layer |

### Today governing role

Today should answer:

- what is active;
- what changed;
- what needs the participant;
- what can continue;
- where to go.

Today should not become the system that decides what the participant's life "really means."

**Primary correction target:** where Today is already holding a specific Goal, Support request, Budget object, or saved event identity, preserve that identity through the return path when possible.

---

## H. Story

### Current live read model

Story v0.1 currently derives events from:

- Wellness check-ins;
- Goals;
- Money activity and completed Money plans;
- Support status events.

It also builds current threads from:

- Recovery Support need from latest Wellness state;
- current Goal;
- unresolved Support request;
- active/draft Money plan.

### Current Story event returns

| Story event | Current href | Continuity result |
|---|---|---|
| Wellness check-in(s) | `/wellness` | factual but generic |
| Goal added | `/goals` | loses Goal identity |
| Goal completed | `/goals` | loses Goal identity and completion context |
| Money activity | `/financial-activity` | broad, not exact activity |
| Money plan completed | `/budget` | loses specific closeout object |
| Support changed status | `/support` | loses request identity |

### Current open-thread returns

| Story thread | Current href | Continuity result |
|---|---|---|
| Recovery Support | `/recovery-support` | meaningful |
| Current Goal | `/goals` | thread known, destination generic |
| Unresolved Support | `/support` | thread known, destination generic |
| Current Money plan | `/budget` | useful but can be more object-specific |

### Story governing rule

**Story should be downstream of coherence.**

Story should not solve missing lane relationships by inventing a narrative.

Instead:

```text
source lane creates truthful fact
→ continuity relationship is preserved
→ Story reflects the factual thread
→ Story returns the participant to that thread
```

Story is therefore not just chronology.

Its differentiating value is **continuity with provenance**.

The desired participant experience is:

> You finished this. Here is where that thread connects if you want to keep going.

Not:

> THRIVE has decided what this completion means about you.

---

# 6. Cross-lane continuity matrix

Legend:

- **Strong** = current path already carries useful context.
- **Partial** = relationship exists, but return/context is incomplete.
- **Catalog-dependent** = connection should exist only when a good governed Resource is live.
- **No forced link** = do not invent a relationship merely to fill the matrix.

| From | To | Current state | Continuity rule |
|---|---|---|---|
| Wellness | Recovery Support | Strong | Use explicit recovery-support selection |
| Wellness | Support | Strong | Use explicit support-needed selection |
| Wellness | Today | Strong | Saved moment can reappear factually |
| Wellness | Story | Partial | Preserve exact moment/history return where possible |
| Goals | Support | Capability exists / underused | Carry Goal title + next step when participant chooses Support |
| Goals | Money | Partial | Use Goal area/context, not title inference alone |
| Goals | Wellness | Context-dependent | Offer only when reflection is a sensible optional continuation |
| Goals | Resources | Catalog-dependent | Match broad Goal area to actual governed Resources, never fake coverage |
| Goals | Today | Partial | Preserve specific Goal identity |
| Goals | Story | Partial | Preserve specific Goal identity before and after completion |
| Money | Support | Strong plumbing | Carry plan context |
| Money | Today | Strong | Preserve specific plan state |
| Money | Story | Partial | Return to specific plan/closeout/activity where feasible |
| Support | originating lane | Partial | Preserve source context and linked object identity |
| Support | Resources | Infrastructure exists | Use Resource link only when explicitly part of request |
| Support | Story | Partial | Return to specific request |
| Resources | Support | Supported | Participant chooses assistance; browsing alone creates nothing |
| Resources | Story | Not yet participant-confirmed | Resource browsing alone should not become accomplishment |
| Recovery Support | Resources | Strong | Contextual intent meeting/reading |
| Recovery Support | Support | Strong | Explicit connect-with-someone path |
| Recovery Support | Wellness | Strong | Clean return |
| Today | all lanes | Strong orientation / partial identity | Prefer exact current thread over generic lane |
| Story | all source lanes | Partial | Return to underlying object/thread, not generic lane |

---

# 7. Coverage gaps exposed by current affordances

These are **coverage questions**, not authorization to add Resources.

## Goal-area coverage

### Routine / daily stability

Current internal destinations:
- Goals;
- Wellness;
- Today;
- Story;
- Recovery routine only when recovery context is explicit.

Resource coverage:
- not required for every Routine Goal;
- no forced external Resource should be added merely because a Goal exists.

### Money

Current internal destinations:
- Money plan;
- Financial Activity;
- Support;
- Story;
- Today.

Resource coverage:
- financial education;
- government benefits;
- other factual Money starting points where live catalog supports them.

### Health

Current internal destinations:
- Wellness;
- Support;
- Goals;
- Story.

Resource coverage:
- health/wellness navigation when governed live options exist.

### Support

Current internal destinations:
- human Support;
- Resources.

Resource coverage:
- broad community starting points such as 211 can be useful when participant is unsure;
- direct governed options are preferable when the issue is known.

### Work / education

Current internal destinations:
- Goals;
- Support;
- Story;
- Today.

Resource coverage gap:
- this is a likely priority catalog area because current Goal affordances already include employment, resume, interview, job application, training/education, and work routine.

### Personal growth

Current internal destinations:
- Goals;
- Wellness;
- Support;
- Story;
- Today.

Resource coverage:
- should not be forced.
- some future education/support Resources may fit specific participant-chosen Goals, but "personal growth" alone is too broad to determine a destination.

### Other / participant-authored

Current internal destinations:
- Goal itself;
- Support if participant asks;
- Story;
- Today.

Resource coverage:
- unknown until participant wording establishes a legitimate connection.
- do not auto-classify free text during this gate.

---

# 8. Priority continuity defects

## Priority 1 — Object identity is lost in Story

Story knows which Goal, Support request, Money plan, or date-bucketed Wellness fact generated an event, but current hrefs often collapse to generic lane pages.

This is the cleanest high-value continuity defect.

## Priority 2 — Completed Goals become historical facts but not useful threads

Completion preserves truth but loses practical continuation context.

The Goal object still contains useful fields:

- title;
- why it matters;
- next step;
- area;
- status.

These should not disappear conceptually just because `progress_status = completed`.

## Priority 3 — Goal area is underused as an internal bridge

Goal area can support broad routing to current THRIVE capabilities without pretending THRIVE knows participant intent.

Example:

```text
Money Goal
→ Money may be relevant
→ Resources may be relevant if a governed financial Resource exists
→ Support may be relevant if participant wants help
```

This is a menu of legitimate continuations, not an automatic determination.

## Priority 4 — Support context exists but is not consistently surfaced

The architecture already supports context from Goal, Wellness, and Money.

The continuity work should expose that capability rather than rebuild Support.

## Priority 5 — Resource catalog does not yet cover the affordances the UI already offers

This is expected at the current stage.

The correct response is to use the continuity map to prioritize catalog growth.

Do not add filler Resources to make every row green.

## Priority 6 — Today often knows the current object but returns generically

Today is already a strong orientation surface. Its next improvement should be preservation of thread identity, not more cards or analytics.

---

# 9. Recommended implementation order after map approval

No implementation is authorized by this document.

If this map is approved, the smallest safe implementation sequence would be:

### Candidate A — identity-preserving returns

Review-only candidate for:

- Story Goal events → actual Goal context;
- Story Support events → actual Support request context;
- Story Money completed-plan events → relevant completed period / closeout context;
- Today Goal / Support / Money events → same object identity where current routing supports it.

No new schema should be presumed.

### Candidate B — Goal continuity using existing Goal area

For each existing Goal area, define which **existing** lanes may be offered as continuations.

Example:

```text
Money
→ Continue Goal
→ Open Money
→ Find a relevant Resource if a verified one exists
→ Ask Support if the participant wants help
```

No automated interpretation of free text.

### Candidate C — Resource coverage matrix

Map the planned curated catalog against current Goal / Support / Recovery / Money affordances.

Use this to decide which Resources deserve priority.

The target catalog count can remain bounded, but usefulness and coverage should drive selection.

### Candidate D — Support origin continuity

Ensure an open or historical request can show where it came from when that source link is factual and already available.

### Candidate E — Story re-read

After A-D are proven, reassess Story.

Story should improve because the system underneath it is more coherent, not because Story invented a new interpretation layer.

---

# 10. SWOT by layer

This is a product/architecture SWOT, not a participant evaluation.

## Today

**Strengths**
- living orientation surface;
- already reads multiple lanes;
- primary-action prioritization exists;
- visual environment accepted.

**Weaknesses**
- several returns are generic;
- event identity is frequently flattened.

**Opportunities**
- become the best "resume the thread" surface using existing facts.

**Threats**
- becoming a dashboard of disconnected cards if more data is added before continuity is fixed.

## Wellness

**Strengths**
- strongest complete feedback loop;
- factual comparison;
- explicit Recovery Support and Support handoffs.

**Weaknesses**
- Story/history return is still broad.

**Opportunities**
- serve as structural template for other lanes: input → useful return → optional next action.

**Threats**
- over-interpreting repeated Wellness data or drifting clinical.

## Goals

**Strengths**
- participant-centered Goal fields;
- broad useful Goal areas;
- completion/history retained.

**Weaknesses**
- completed Goals lose useful continuity;
- exact preset identity is not durably available;
- Goal area relationships are underused.

**Opportunities**
- become a central organizing thread across existing Money, Resources, Support, Wellness, Today, and Story.

**Threats**
- auto-classifying or scoring Goals in ways not supported by saved facts.

## Money

**Strengths**
- strong backend ownership;
- active/draft/completed cycles;
- Support-assisted workflow already linked.

**Weaknesses**
- Story return remains broad;
- completed cycle continuity can feel terminal.

**Opportunities**
- show factual progression across cycles without judgment.

**Threats**
- using transaction evidence to infer intent or financial character.

## Support

**Strengths**
- mature lifecycle;
- can already receive Wellness, Goal, Money, and Resource context;
- persistent history.

**Weaknesses**
- participant-facing history can feel noisy;
- status events return generically;
- source continuity is not always obvious.

**Opportunities**
- become the human continuation layer without requiring the participant to repeat themselves.

**Threats**
- turning every signal into a Support request or treating a resolved request as proof the real-world issue was resolved.

## Resources

**Strengths**
- governed canonical architecture;
- verification and visibility are separated;
- direct official access paths;
- Support linkage already exists.

**Weaknesses**
- live catalog coverage is still narrow relative to the affordances THRIVE exposes.

**Opportunities**
- use the continuity map to build a compact, high-value catalog instead of a link warehouse.

**Threats**
- filler Resources, stale links, false implication that opening equals use/completion.

## Recovery Support

**Strengths**
- clearest proving slice;
- bounded meaningful choices;
- verified Resources;
- human Support separated from community/recovery options.

**Weaknesses**
- routine path is still proving/non-persistent.

**Opportunities**
- use its structural pattern as a template across other current affordances.

**Threats**
- allowing Recovery logic to swallow ordinary Wellness or Goals context.

## Story

**Strengths**
- factual read model;
- visually distinct;
- no persisted verdict layer;
- can show chronology and carrying threads.

**Weaknesses**
- generic hrefs make it feel circular;
- not all current THRIVE lanes produce meaningful Story-level continuation yet.

**Opportunities**
- become THRIVE's differentiating continuity surface once upstream lanes preserve object identity.

**Threats**
- becoming an interpretation engine before source-lane coherence exists.

---

# 11. Differentiation thesis

THRIVE's differentiation should not come from having more modules.

Many systems can provide:

- Goals;
- a budget;
- a Wellness form;
- Support tickets;
- links;
- history.

The differentiating behavior is:

```text
participant acts in one place
→ THRIVE preserves the meaning and source of that action
→ related existing capabilities become available without forcing them
→ later surfaces remember the thread
→ the participant can return without starting over
```

The unit of experience becomes the **participant's thread**, not the module.

That is the nucleus model:

```text
one truthful action
→ connected existing affordance
→ another factual action
→ useful return
→ accumulated continuity
```

The system can grow around that nucleus without rebuilding the engine.

---

# 12. Review decisions required before implementation

This document proposes no production change.

Review should answer:

1. Is **scale / horizon** acceptable as descriptive structure only?
2. Is **step / thread / endpoint** acceptable as descriptive structure only?
3. Do we agree that Goal importance remains separate and participant-derived?
4. Do we agree that exact object/thread return is the first implementation target?
5. Do we agree that Goal area may guide which **existing** THRIVE destinations are offered, but should not automatically classify participant-authored free text?
6. Do we agree that Resource expansion should be driven by coverage of current affordances rather than filling categories for appearance?
7. Do we agree that Story remains downstream and should be re-reviewed after internal continuity improves?
8. Do we agree that Support should reuse its current context-carrying architecture rather than be rebuilt?

If approved, the next gate should be a review-only **Identity-Preserving Return Candidate v0.1**, beginning with Story and Today navigation to existing underlying objects. No schema change should be presumed until the actual route/data requirements are inspected.
