# THRIVE My Story Guided Participant UX Candidate v0.1

Date: 2026-08-23
Status: REVIEW-ONLY UX CANDIDATE
Branch: `mobile-viewport-fix-v0-1`

## Purpose

This document translates the approved `My Story` North Star into a bounded participant-experience candidate for:

- Today
- Wellness
- Goals

It is intentionally **experience-first**.

It does not authorize schema changes, SQL execution, production deployment, Admin/onboarding implementation, Trust Engine work, or broad lifecycle redesign.

The goal is to improve the participant journey using the existing data model wherever practical.

---

# 1. Product anchor

**THRIVE helps a person understand, build, and reflect on their own story using their own truth, choices, plans, experiences, and support.**

THRIVE does not write the person's story for them.

This candidate therefore favors:

- one clear decision at a time;
- participant ownership;
- progressive disclosure;
- meaningful reflection from participant-entered history;
- visible next steps without forced completion;
- lower cognitive load;
- lower typing burden;
- separation of fact, participant explanation, observation, and conclusion.

---

# 2. Experience modes

The participant experience should adapt to familiarity with THRIVE, not assumptions about intelligence, ability, recovery status, diagnosis, or capacity.

## A. New participant: Guided mode

A new participant should not land on a full workbench of every THRIVE feature.

Candidate entry:

### Welcome to THRIVE

Short participant-facing message:

> We'll take this one piece at a time. You can stop, skip, or come back later.

Primary action:

**Start with today**

Secondary action:

**Look around first**

The guided path may introduce the system in this order:

1. Wellness check-in
2. one optional Goal
3. simple Budget / money orientation
4. Financial Activity explanation
5. Support introduction

The participant is not required to finish every layer in one session.

## B. Established participant: Orientation mode

An established participant should see a concise Today page that answers:

- What changed?
- What is active?
- What have I already handled today?
- Is anything waiting for me?
- Where did I leave off?

Primary orientation action:

**Continue where I left off**

Other participant-controlled doors remain visible.

---

# 3. Today: from dashboard to session guide

Today remains the entry/orientation surface.

It should not become a compliance checklist.

## Current problem observed

During real usability testing:

1. participant completed Wellness;
2. Today routed toward Goals;
3. participant reviewed/updated a Goal;
4. participant returned to Today;
5. Today again emphasized the same Goal as the dominant next action.

The participant entered a loop.

## Candidate Today behavior

Today should maintain enough current-day/session orientation to avoid immediately repeating the same dominant prompt.

Candidate session map:

### Moving Forward

- Wellness checked in today ✓
- Goal reviewed today ✓
- Budget active
- 3 new Financial Activity items
- Support request received

This section should communicate **state**, not score completion.

## Candidate Today card order

### 1. Welcome / orientation

Established participant example:

> Good morning. Here's where things stand today.

### 2. One primary next door

Primary action should be chosen from factual current state, for example:

- Continue where I left off
- Check in for today
- Review a Support reply
- Look at new Financial Activity
- Continue an active Goal

The system should not infer a need from sensitive or ambiguous facts.

### 3. Current money snapshot

Concise only:

- income received;
- money out;
- current Budget state;
- new/unresolved Financial Activity count if useful.

Full detail remains in Budget / Financial Activity.

### 4. Current Goal

Today should not display arbitrarily long Goal text as a giant hero.

Candidate presentation:

**Your Goal**
Build a dependable work routine

**Next step**
Short preview of the participant's next step.

**Continue Goal**

If the Goal was already reviewed today, Today should reduce its prominence and offer another next door.

### 5. Wellness state

If not checked in today:

**How are things today?**

If already checked in:

**Checked in today**

Optional action:

**View today's reflection**

Do not repeatedly prompt another check-in merely because the participant returns to Today.

### 6. Support

State must reflect operational truth.

Examples:

Submitted but unassigned:

**Your request was received.**

Acknowledged/assigned:

**Your request is with the team.**

Waiting for participant:

**Support is waiting for your reply.**

Completed:

**This request is complete.**

### 7. Finish / choose another path

Candidate end-of-session prompt:

**What would you like to do now?**

- Review money
- Continue a Goal
- Look at Support
- Look back at My Story
- I'm done for now

No forced sequence.

---

# 4. Wellness: guided reflection, not form dumping

## Existing strengths

The Wellness data model already captures useful participant-owned facts such as:

- overall day;
- stress;
- sleep;
- energy;
- confidence;
- routine;
- recovery support;
- support need;
- chosen next step;
- participant note.

The problem is primarily interaction flow and reflection value.

## Candidate Wellness guided flow

The participant should see one layer at a time.

### Step 1: How is today going?

Choices remain simple and human-readable.

### Step 2: What feels most important right now?

Progressively show relevant categories rather than the entire page.

Examples may include:

- stress
- energy
- sleep
- routine
- confidence
- support
- something else

The participant can skip details.

### Step 3: What would help next?

Offer existing small next-step choices in clearer language.

Examples:

- Pick one small task
- Get food, water, or rest
- Review today's plan
- Contact someone supportive
- Ask for help
- Something else

### Step 4: Optional detail

Prompt:

**Anything you want to remember about today?**

Participant may type or, in a future candidate, use speech-to-text.

### Step 5: Review and save

Short confirmation of what the participant selected.

No interpretation.

### Step 6: After save

Do not strand the participant on the same form.

Candidate acknowledgment:

**Check-in saved.**

Then:

**What would be useful next?**

- Continue an active Goal
- Review money
- Look at recent activity
- Ask for Support
- Finish for now

---

# 5. Wellness history: from chronological drawer to reflection

The current history remains useful as source detail but should not be the only reflection experience.

## Candidate default reflection surface

### Your week so far

Display a factual seven-day strip based on participant-entered values.

Possible elements:

- overall-day selection by day;
- energy selection by day;
- chosen next step by day.

Avoid combined hidden scores.

## Candidate factual summaries

Examples:

**Next steps you chose this week**

- Ask for help: 3
- Pick one task: 2
- Review today's plan: 1

**Want to look back?**

- Days you marked as hard
- Days you chose Ask for help
- Days you wrote a note

These are participant-owned filters, not clinical interpretations.

## Candidate historical reflection language

Acceptable:

> You recorded other hard days before. Want to look at what you chose or wrote on those days?

Not acceptable:

> You are falling into the same pattern again.

The first reflects recorded history.
The second invents causal meaning.

## Raw history

Keep a participant-controlled drawer/action:

**View all reflections**

This retains chronological transparency without forcing the participant to scroll through the entire archive on every visit.

---

# 6. Goals: guided creation and continuation

## Existing strengths

The Goal lifecycle already supports:

- create;
- edit;
- in progress;
- pause;
- complete;
- archive;
- history.

The current weakness is that creation/editing still resembles a Goal-record workbench.

## Candidate Goal creation flow

### Step 1: What do you want to work on?

Choose a broad area.

Examples:

- Work / education
- Money
- Relationships / support
- Health / routine
- Personal growth
- Something else

### Step 2: Where would you like to start?

Offer concrete, editable starters.

Example under Personal Growth:

- Be more consistent with something
- Feel more confident doing something myself
- Learn something useful
- Make progress on a decision
- Create my own Goal

Avoid vague phrases that force the participant to interpret what the system meant.

### Step 3: Put it in your words

Show the starter as editable participant-owned text.

### Step 4: What would be different if this went well?

This is a candidate replacement/refinement for overly abstract `Why does this matter?` prompting.

The participant may skip or answer in their own words.

### Step 5: What is one small thing you could try first?

Offer concrete suggestions based on the selected Goal area, plus:

**My own next step**

The participant remains the final chooser.

### Step 6: Review

Show:

- Goal
- why / desired difference
- next step

Primary action:

**Save Goal**

Secondary:

**Change something**

---

# 7. Active Goal experience

An established participant should not repeatedly see the entire Goal creation/editing apparatus.

Candidate active Goal card:

**Build a dependable work routine**

Status: In progress

Why this matters:
Short participant text

Next step:
Short participant text

Actions:

- Continue
- Edit
- Pause
- Mark complete

The full edit form should appear only when requested.

---

# 8. Goal completion and history

When a participant completes a Goal:

Candidate acknowledgment:

**You marked this Goal complete.**

Optional reflection:

**Anything you want to remember about what helped?**

This should remain optional.

Then offer:

- Return to Today
- Look at another Goal
- Finish for now

## Archived Goal value

Archived Goals should support My Story.

Candidate surfaces:

**Things you've completed**

**Past Goals you may want to revisit**

If a current Goal shares an explicit participant-selected area with a past Goal, THRIVE may offer:

> You worked on another Goal in this area before. Want to see the steps you chose then?

Do not claim the previous Goal applies to the current situation.

---

# 9. My Story: first participant-facing concept candidate

My Story should not launch as a giant analytics page.

The first useful version can be modest.

Candidate sections:

## Recently

- latest Wellness reflection;
- current Goal;
- current Budget;
- recent Financial Activity count;
- recent Support state.

## Looking back

Participant chooses:

- 7 days
- 30 days
- 3 months
- 6 months

Then THRIVE reflects factual module history.

## Things I've worked on

- completed Goals;
- prior Budget periods;
- Support requests completed;
- participant-selected Wellness reflections.

## My words

Optional access to participant notes/context across modules where appropriate.

No hidden AI summary is required for v0.1.

The first value is **organized memory**, not generated interpretation.

---

# 10. Financial Activity relationship to the guided journey

Financial Activity is outside the implementation scope of this UX candidate, but its participant-flow contract should be preserved.

When automatic or frequent ingestion is available, Today should favor:

**3 new items since your last visit**

rather than making the participant manually inspect an entire statement period.

Financial Activity should eventually default toward:

- new / unresolved;
- needs Budget connection;
- needs participant context;
- connected / explained;
- older activity collapsed.

This reduces burden while preserving deep transaction detail on demand.

Manual Financial Activity remains available for cash and participants without connected bank sources.

---

# 11. Speech-to-text placement candidate

Speech-to-text should reduce burden in participant-owned free-text fields.

Candidate placements:

- Wellness note;
- Goal wording;
- Goal reflection / why;
- Goal next step;
- Support request;
- Transaction Context.

Candidate interaction:

1. participant taps microphone;
2. participant speaks;
3. transcription appears in the text field;
4. participant reviews/edits;
5. participant explicitly saves/submits.

Do not auto-submit speech transcription.

---

# 12. Language principles

Participant-facing UI should avoid exposing internal system vocabulary unless it helps the participant.

Examples:

Prefer:

- Your THRIVE plan
- Your program
- Your support
- Your Goal
- Your history
- My Story

Avoid unnecessary participant-facing labels such as:

- supported person
- routing category
- allocation lifecycle
- parse state

These may remain valid internal/database concepts.

---

# 13. What this candidate does NOT change

This candidate does not authorize changes to:

- Supabase schema;
- RLS;
- auth model;
- participant ownership model;
- Budget lifecycle;
- Financial Activity evidence model;
- transaction explanation lifecycle;
- Support request lifecycle;
- Trust Engine boundaries;
- Admin/onboarding roles.

The intention is to reuse current capabilities with a better interaction layer first.

---

# 14. Known separate defect

Budget `Recent Account Activity` still reports `0 posted transactions` for current imported activity because of the date-normalization mismatch previously documented.

This is a separate code repair candidate.

It should be repaired without fabricating source `posted_date` values.

---

# 15. Candidate implementation order if approved later

If this review-only UX candidate is approved, the smallest implementation sequence should be:

1. Today anti-loop / session-orientation behavior
2. Wellness progressive flow + after-save next doors
3. Goals progressive creation flow + compact active Goal presentation
4. Wellness reflection summary + raw-history drawer
5. archived Goal participant-memory treatment
6. first minimal My Story surface
7. speech-to-text candidate proof on one controlled text field
8. broader speech-to-text reuse only after proof

Each implementation should remain separately reviewable and testable.

---

# 16. Review questions before implementation

Before approving code, answer:

1. Does the guided mode feel respectful rather than childish?
2. Can the participant stop or skip at every reasonable point?
3. Does Today stop looping without becoming a completion checklist?
4. Does Wellness reflection help the participant notice their own history without assigning meaning?
5. Does Goal creation become easier without taking ownership away from the participant?
6. Does an established participant get out of onboarding quickly?
7. Does My Story feel like participant-owned memory rather than system surveillance?
8. Can most of this be achieved without schema changes?

---

# 17. Current gate

**Review this UX candidate only.**

No implementation is authorized yet.

If approved, the next gate is:

**Create the smallest code candidate for Today anti-loop/session orientation first, on a review branch, without DB/schema changes.**

Admin/onboarding remains parked until the participant-flow implementation is reconciled sufficiently to define what Admin must support.
