# THRIVE My Story North Star v0.1

Date: 2026-08-23
Status: APPROVED PRODUCT ANCHOR / DOCUMENTATION-ONLY GATE
Branch: `mobile-viewport-fix-v0-1`

## North Star

**MY STORY** is the experience anchor for THRIVE.

THRIVE helps a person understand, build, and reflect on their own story using their own truth, choices, plans, experiences, and support.

THRIVE does not write the person's story for them. It helps the person see their own story more clearly.

This product anchor guides Today, Wellness, Goals, Budget, Financial Activity, Transaction Context, Support, Resources, history/reflection, future Admin/onboarding, and future feedback work.

---

## What My Story means

The current participant modules remain valid and distinct:

- **Wellness** = how I have been doing.
- **Goals** = what I have been working toward.
- **Budget** = what I planned.
- **Financial Activity** = what happened in available money records.
- **Transaction Context** = what I said about what happened.
- **Support** = where I asked for human help.
- **Resources** = where I can find guided references, options, or next steps.
- **History / Reflection** = what I have already lived through, chosen, completed, changed, or learned from.

The value of THRIVE is not merely that these modules exist. The value is that they can remain factually separate while contributing to a participant-owned longitudinal story.

---

## Experience architecture

### Previous navigation model

`Wellness | Goals | Budget | Activity | Support | Reports`

This remains useful as module navigation, but it is not sufficient as the participant experience architecture.

### Emerging experience model

#### ENTRY

**Today**

Today answers:

> What should I pay attention to now?

Today should orient and route. It should not force every module or repeatedly route a participant back to an action they already completed or reviewed during the current journey.

#### GUIDED ACTIONS

- Wellness
- Goals
- Money / Budget / Financial Activity
- Support

Participant workflows should favor **guided, progressive decisions** over full-page data-entry surfaces when practical.

The intended pattern is:

`one clear question -> one participant choice -> one understandable result -> one optional next step`

Support is the strongest current example of this interaction model.

#### MEMORY

**My Story**

History should become participant-usable memory, not merely archived records.

THRIVE should help the participant look back across their own recorded facts, choices, notes, plans, completed Goals, prior Budgets, Wellness reflections, Support history, and Financial Activity without assigning clinical, moral, fiduciary, or behavioral meaning.

#### HUMAN CONNECTION

**Support + Resources**

Support remains a participant-controlled human-help pathway.

Resources should provide guided references and practical pathways such as identification replacement, birth certificates, nutritional assistance, public benefits, employment, transportation, recovery/community supports, and other appropriate resources.

Resource guidance may help a participant get to the right place. It does not determine eligibility, establish authority, or create legal, clinical, fiduciary, or benefit conclusions.

The first resource-library evolution should favor staff/reviewer quality control, with selective participant-facing resource exposure after the resource truth and verification process are proven.

#### FEEDBACK

THRIVE may help a participant notice relationships among **their own recorded facts**.

It must distinguish:

- fact;
- participant explanation;
- observed historical pattern;
- interpretation;
- conclusion.

THRIVE may reflect facts and clearly bounded patterns. It must not silently assign intent, diagnose, shame, score worth, establish relapse, incapacity, irresponsibility, misuse, or fiduciary/legal conclusions.

---

## New participant versus established participant

Guidance should change with **familiarity with THRIVE**, not assumptions about ability, intelligence, recovery status, or capacity.

### New participant / guided mode

A new participant should not be dropped into every available module and expected to understand the product architecture.

Candidate experience:

1. Welcome to THRIVE.
2. Complete a small Wellness check-in.
3. Choose whether there is something the participant wants to work toward.
4. Introduce a simple Budget / money plan when appropriate.
5. Explain where Financial Activity will appear and how it remains separate from participant context.
6. Introduce Support and how to ask for help.
7. Make clear that the participant may stop, skip, or return later.

The experience should cascade one decision at a time rather than presenting an entire workbench at once.

### Established participant / orientation mode

An established participant should not repeat onboarding every time they sign in.

Today should become a concise orientation surface such as:

- what changed since the last visit;
- what remains active;
- what may need the participant's attention;
- what was already completed/reviewed today;
- where the participant left off;
- optional next doors.

A central action may be:

**Continue where I left off**

The participant must remain free to choose another area or finish for now.

---

## Today session-routing principle

Today should not create loops.

Example problem observed during live usability:

1. participant checks in;
2. Today routes to an active Goal;
3. participant reviews/updates the Goal;
4. participant returns to Today;
5. Today presents the same Goal as the dominant next action again.

Candidate principle:

Today should recognize the participant's current-day/session interactions sufficiently to avoid immediately routing them back to the same completed/reviewed action.

This does not require surveillance or compliance scoring. It is participant orientation.

Candidate states may include:

- Checked in today;
- Goal reviewed today;
- Budget active;
- new Financial Activity available;
- Support reply waiting;
- Support request received;
- no action needed.

After one guided action, Today should offer the next useful doors rather than require completion of all THRIVE modules.

---

## Historical value by module

The archive is not the product. **Participant-usable memory is the product value of the archive.**

### Wellness history

Current value:
- saved participant reflections remain available by date.

Future participant value:
- week-at-a-glance views based strictly on participant-entered responses;
- common participant-selected next steps;
- direct access to prior reflections with similar participant-selected states;
- prompts such as: `You recorded other hard days before. Want to look at what you chose or wrote on those days?`

THRIVE must not claim that two days have the same cause or clinical meaning.

### Goal history

Current value:
- completed/archived Goals are preserved and cannot be silently deleted.

Future participant value:
- show what the participant completed;
- allow the participant to review steps they previously chose;
- offer prior similar Goals as optional memory, not instruction;
- support reflection such as: `You worked on something similar before. Want to see the steps you used then?`

Archived Goals should become memory rather than a graveyard of cards.

### Budget history

Current value:
- historical plans, categories, allocations, and lifecycle are preserved.

Future participant value:
- compare prior plans over participant-selected periods;
- show factual changes in planned amounts and recorded activity;
- let the participant review previous plan adjustments;
- support 30-day, 3-month, or 6-month reflection without assigning why the numbers changed.

Example acceptable statement:

`Your Transportation planned amount was different across these three Budgets. Want to review those plans?`

Avoid unsupported interpretation such as:

`Your transportation costs are increasing.`

### Financial Activity history

Current value:
- imported evidence and participant-entered Financial Activity remain distinct;
- Budget allocations and submitted participant context remain connected but independently visible.

Future participant value:
- default to new / unresolved activity rather than an endless transaction river;
- collapse older connected/explained activity;
- allow filtering for items needing Budget connection or participant context;
- use automatic or near-daily ingestion, when available and authorized, to reduce monthly categorization burden.

Manual Financial Activity remains important for participants without connected financial institutions or for cash/other events outside imported records.

### Support history

Current value:
- request lifecycle, replies, status history, completion, and withdrawal are preserved.

Future participant value:
- review what help was requested;
- review prior staff/reviewer responses;
- reconnect with previously useful resources;
- see resolved requests without reopening or rewriting their history.

Support history should inform participant memory without automatically creating a new request.

---

## Reports versus My Story

The current Reports surface is primarily a **financial reporting** surface.

It should not silently become an everything-page simply because cross-module history is now valuable.

The product concept should distinguish:

### Financial Reports

- Financial Activity totals;
- source visibility;
- statement history;
- Budget comparison;
- other financial summaries that remain within the approved financial evidence model.

### My Story

A future participant-owned longitudinal reflection surface where the participant may review selected history across:

- Wellness;
- Goals;
- Budget;
- Financial Activity;
- participant Context;
- Support;
- Resources used or saved;
- meaningful participant-controlled milestones.

`My Story` is the approved conceptual name and North Star anchor for this cross-module experience.

Exact navigation placement and implementation remain future UX candidates.

---

## Program page principle

Internal relational/data-model language does not have to be exposed as participant-facing vocabulary.

The database may appropriately use concepts such as `supported_person`.

The participant-facing My Program experience should favor language that explains:

- the participant's current THRIVE plan/program;
- what areas are available;
- participation status;
- who or what support is available when authorized;
- how THRIVE works for the participant.

Do not expose internal governance vocabulary merely because it exists in the schema.

---

## Wellness experience candidate direction

The Wellness model is functioning, but the current interface remains too close to a complete form + chronological history drawer.

Candidate UX direction:

- progressive/cascading questions;
- optional detail only when useful;
- participant-controlled free text;
- after-save acknowledgment;
- optional routing to another THRIVE area;
- participant-usable weekly reflection rather than only raw chronological cards.

Do not add more questions merely to make Wellness appear more robust.

---

## Goals experience candidate direction

The Goal lifecycle is functioning: create, edit, pause, complete, archive, preserve history.

The current creation/editing interface still behaves too much like a Goal-object workbench.

Candidate UX direction:

1. Choose an area.
2. Choose a concrete starting point or use the participant's own words.
3. Ask a clearer, concrete reflection prompt instead of abstract phrasing when possible.
4. Help the participant identify one manageable next step.
5. Review the participant's choices before saving.
6. After save/update, return to a useful next door rather than immediately routing back into the same Goal.

The participant's full narrative remains preserved. Summary surfaces such as Today should not turn arbitrarily long `next_step` content into oversized hero text.

---

## Speech-to-text usability candidate

Speech-to-text is now an approved **participant usability candidate**, not an implemented feature.

Potential surfaces include:

- Wellness notes;
- Goal wording / why it matters / next step;
- Support request text;
- Transaction Context;
- other participant-owned text entry where typing burden is meaningful.

Candidate safety/usability principle:

1. participant chooses to speak;
2. THRIVE transcribes;
3. transcribed text is shown to the participant;
4. participant can edit/approve it;
5. only then is the text saved/submitted.

Do not treat transcription as participant-approved truth until the participant reviews/submits it.

---

## Resource direction

Resources should become a guided reference layer connected to participant-expressed needs and Support.

Examples may include:

- state identification;
- birth certificate replacement;
- Social Security card replacement;
- nutritional assistance;
- public benefit application guidance;
- employment resources;
- transportation;
- community/recovery support;
- other location-appropriate resources.

A future resource record/process should be capable of preserving:

- resource category;
- geography;
- official source/link;
- phone/contact information;
- common documents or preparation steps;
- participant-facing summary;
- internal reviewer notes where appropriate;
- last verified date;
- active/inactive state.

Resources guide. They do not determine eligibility or authority.

---

## Known product defect captured during this gate

### Budget Recent Account Activity date normalization

The current Budget page reports `0 posted transactions` for the active August 2026 Budget despite imported current-period Financial Activity being present and visible elsewhere.

Previous live database reconciliation established:

- 24 imported current records exist;
- usable transaction/activity dates exist;
- `posted_date` is null for those uploaded records;
- Financial Activity and Reports include the records;
- Budget current-account-activity logic still relies on the wrong date assumption for this source.

This remains a code repair candidate.

Do not rewrite source evidence or fabricate `posted_date` values merely to satisfy the Budget UI.

---

## Admin/onboarding relationship

Admin/onboarding remains a separate future gate.

Before that implementation begins, the participant experience contract should be reconciled sufficiently that Admin is designed around real participant journeys rather than outdated test harnesses.

Future Admin/onboarding is expected to support controlled THRIVE access such as participant/user, reviewer/support, and admin roles, scoped to appropriate workspace/program relationships.

THRIVE roles must not silently confer Trust Engine, clinical, fiduciary, legal, or other independent authority.

---

## Approved bounded reconciliation sequence

1. **Document the guided participant journey principle.**
2. **Define new participant vs established participant behavior.**
3. **Define what Today does after each action so it does not loop.**
4. **Define historical value of Wellness, Goals, Budget, Financial Activity, and Support.**
5. **Separate Financial Reports from the broader My Story concept.**
6. **Capture the known Budget transaction-date defect.**
7. **Preserve speech-to-text as a participant usability candidate with participant transcription review before save.**
8. **Create a review-only UX candidate for Wellness + Goals + Today guided flow.**
9. **Only after participant-flow reconciliation, open Admin/onboarding architecture.**

No schema change is authorized by this document.
No SQL execution is authorized by this document.
No production deployment, merge, push to `main`, or Trust Engine work is authorized by this document.

---

## Product test for future decisions

When considering a new participant-facing feature, ask:

1. Does this help the person understand, build, or reflect on **their own story**?
2. Is the displayed information factual or clearly identified as the participant's own explanation/choice?
3. Does the feature preserve participant agency?
4. Does it reduce burden or add burden?
5. Does it help the person know what they can do next without forcing that action?
6. Does historical information become useful memory rather than passive storage?
7. Does the feature preserve THRIVE's authority boundaries?

If the feature cannot answer these well, it should not be justified merely because the database can support it.

---

## Current gate after this anchor

**Next gate: review-only UX candidate for the guided participant journey, centered on Today + Wellness + Goals, with My Story as the longitudinal North Star.**

The candidate should describe experience behavior before implementation and should reuse the existing participant data model wherever practical.

Admin/onboarding remains parked until this participant-flow candidate is reconciled and approved.
