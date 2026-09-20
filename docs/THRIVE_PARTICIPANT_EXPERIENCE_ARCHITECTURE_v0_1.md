# THRIVE Participant Experience Architecture v0.1

Status: Review-only architecture anchor  
Scope: Participant experience model only  
Production effect: None

## Purpose

THRIVE should function as a living personal workspace, not as a collection of modules the participant must learn to operate.

The participant should not need to understand how Wellness, Goals, Money, Support, Resources, or program data are organized internally before THRIVE can be useful.

The participant experience should organize real activity into understandable orientation, continuity, reflection, and next-step options while preserving the distinction between facts, patterns, participant explanations, and conclusions.

## Core Experience Model

**Now → Threads → Moments → Signals → Story**

### 1. Now

Now is the participant's orientation surface.

It should answer:

- What is happening right now?
- What still needs attention?
- What has moved?
- What can I do from here?

Now is not a daily checklist and should not imply that one daily interaction represents the participant's whole day.

The participant may return many times in one day.

Now should adapt to the current state of the participant's workspace each time they return.

### 2. Threads

Threads represent things that remain open, active, ongoing, waiting, or unresolved across time.

Examples include:

- active goals
- support requests
- current money planning work
- recovery-support needs
- resource needs
- program participation

Threads provide continuity.

A participant may have several concurrent threads. THRIVE should help organize them rather than forcing the participant to mentally combine separate modules.

Useful thread groupings may include:

- Working on
- Waiting
- Ongoing
- Moved / completed

These are experience concepts, not approved schema changes.

### 3. Moments

Moments are discrete events or participant interactions that happen over time.

Examples include:

- a Wellness check-in
- a participant note
- creation of a goal
- completion of a goal step
- a goal status change
- a Support request
- a Support reply
- a Support status change
- recorded financial activity
- a participant transaction explanation
- a resource interaction when that interaction is intentionally persisted
- a change to a plan

Moments are the raw footage.

THRIVE should not assume one meaningful participant interaction per day.

A participant may create many moments during the same day.

## State and Event Distinction

THRIVE should distinguish persistent state from moments/events.

### Stateful things

Examples:

- goals
- support requests
- budget periods
- budget lines
- program participation
- resource records and visibility state

State answers: **What is true or active now?**

### Events / moments

Examples:

- check-ins
- support replies
- support lifecycle events
- goal creation
- goal completion
- goal status changes
- financial activity
- participant explanations
- plan changes

Events answer: **What happened, and when?**

Not every existing state transition currently has a dedicated event record. Missing event history should be reconciled only when needed to support trustworthy continuity or Story.

THRIVE should not create a universal event table merely for architectural neatness. Existing domain truth should be reused where it already captures moments correctly.

## 4. Signals

Signals are grounded observations derived from stored facts and moments.

Signals are the connective tissue across THRIVE.

A signal may come from:

- Wellness
- Goals
- Money
- Support
- Resources
- program participation

Examples:

### Something keeps coming up

> Stress has been marked high in three check-ins today.

### Something moved

> You completed two goals since yesterday.

### Something changed

> Your recorded energy is different from earlier today.

### Something is still open

> One Support request needs your response.

### Money example

> Recorded food activity is $42 above the current plan.

Signals must remain descriptive.

A signal must never convert observational evidence into intent, irresponsibility, relapse, incapacity, Trust misuse, legal conclusions, clinical conclusions, or fiduciary conclusions.

## Signal Rules

Every signal should be:

### Grounded

Based on stored facts or participant-authored information.

### Traceable

The participant should be able to answer:

**Why is THRIVE showing this?**

The explanation should identify the underlying facts in plain language.

Example:

> Based on your 9:10 AM, 12:40 PM, and 3:05 PM check-ins.

### Bounded

Signals may identify repetition, change, completion, waiting, unresolved work, or other direct relationships among recorded facts.

Signals must not invent causes, diagnoses, motives, capacity judgments, or participant explanations.

### Useful

THRIVE should not create a visible signal for every data change.

Signals should surface only when the observation is likely to help orientation, continuity, or a reasonable next step.

### Current

Signals should have understandable relevance over time and should not remain visually urgent after they are no longer current.

### Nonjudgmental

Especially in Money, recovery, and Support.

Prefer:

> Recorded food activity is $42 above the current plan.

Do not convert this to:

> You overspent on food again.

## Signal Strength

Signals may eventually have different presentation strength without changing their evidentiary standard.

Possible experience categories:

- Something changed
- Something keeps coming up
- Something moved
- Something is still open
- Support / connection update

These are presentation concepts only.

They do not represent risk scoring or clinical severity.

## 5. Story

Story is the participant's understandable history across time.

Story is not a clinical chart, an AI interpretation of the participant, or an administrative audit log.

Story should be composed from significant moments, states, and grounded signals.

Example:

### This week

> You checked in eight times.

> You completed three goals.

> You asked for help twice.

> Stress appeared more often early in the week and less often later.

> One Money question is still open.

Each statement should remain traceable to its underlying facts.

### Story Rule

**THRIVE does not invent the plot. It helps the participant see the footage.**

Story must not fabricate explanation, meaning, causation, or motivation.

If participant-authored explanation exists, THRIVE may preserve it as the participant's explanation and must keep that distinction visible.

## Module Reframing

Existing participant modules remain useful capabilities.

They should not define the entire participant experience.

### Wellness

Wellness check-ins are moments and context.

Wellness should not function as the center of the entire participant experience.

Multiple same-day check-ins are valid and should not be treated as abnormal.

### Goals

Goals are stateful threads.

Goal creation, progress changes, pauses, completions, and future step history may contribute moments to continuity and Story.

THRIVE should support multiple concurrent goals.

The participant should not be forced into one-goal-at-a-time mental framing simply because the interface presents one highlighted goal.

### Support

A Support request is a thread.

Replies and status events are moments within that thread.

Support should remain available for genuine human assistance, but it should not become the default destination whenever THRIVE lacks product guidance.

### Money

**Money is the participant experience. Budget is one tool inside Money.**

Participants may enter Money because they want to:

- understand what happened
- plan what comes next
- add financial activity
- explain an item
- understand a transaction
- ask for help
- see what needs attention

The participant should not be required to understand budget-period mechanics before Money can orient them.

Financial facts remain observational evidence.

Money signals must remain factual and nonjudgmental.

### Resources

Resources are verified support inventory and a participant browsing surface.

They should also become contextual ingredients in guidance.

If the participant's own expressed need identifies food, insurance, recovery connection, ID assistance, therapy, transportation, or another supported category, THRIVE may surface matching verified Resources without requiring the participant to navigate the Resource Library first.

Resources should remain independently governed and verified.

### Reports / History

Current Reports functionality may remain where it is.

The future participant Story experience should not simply rename Reports.

Story should be cross-domain and participant-centered.

The need for a Story view should be validated only after the moments and signals feeding it are trustworthy.

## Navigation

Current navigation is module-forward.

No navigation redesign is approved by this architecture anchor.

Possible future models may include:

- Now | Goals | Money | Support | More
- Now | My Stuff | Help | Story

Navigation should be reconsidered only after the information model and signal behavior are pressure-tested.

## Participant Effort Principle

**Admin configures the environment. THRIVE remembers the environment. The participant makes choices inside the environment.**

The participant should not need to perform clerical work the system already knows how to avoid.

Examples:

- THRIVE should remember recurring Money categories when appropriate.
- THRIVE should remember open goals.
- THRIVE should remember open Support threads.
- THRIVE should preserve prior context rather than forcing re-entry.
- THRIVE should provide orientation even when the participant cannot identify the correct module.

## "I'm Not Sure" Is a Valid State

The participant should not be required to know the solution before THRIVE can help.

A future Now surface may offer options such as:

- Check in
- Work on a goal
- Handle money
- Find something useful
- Ask for support
- I'm not sure

"I'm not sure" should route to orientation, not failure.

## Transparency

Transparency is part of the participant experience, not merely a disclaimer.

When THRIVE reflects a pattern or relationship, the participant should be able to inspect the basis for that reflection.

Possible affordance:

**Why THRIVE is showing this**

This explanation should contain the relevant underlying recorded facts and should avoid hidden scoring.

No mysterious participant score is introduced by this architecture.

## Participant Story and Human Agency

THRIVE may help organize information and surface choices.

THRIVE does not decide what a participant should value, conclude, or choose.

Multiple reasonable paths may be presented when appropriate.

The participant remains the decision-maker.

## Boundaries Preserved

This architecture does not alter the following boundaries:

1. Johnny's THRIVE personal support spine and the Trust Engine remain independent systems.
2. Authorized facts may be compared across systems only where authority permits, but ownership, approvals, authority, and decisions remain separate.
3. Bank data remains observational evidence.
4. Facts, patterns, participant explanations, and conclusions remain distinct.
5. THRIVE explains before flagging.
6. No hard deletes are introduced.
7. Expanded access or external sharing requires separate authority or consent.
8. No clinical, legal, fiduciary, or capacity conclusions are created by Signals or Story.

## Current Architecture Disposition

### Keep

- participant Auth and account-purpose routing
- Today data aggregation capability
- Wellness records
- Goals
- Support request lifecycle
- Budget periods and lines
- financial activity
- participant transaction explanations
- Resources governance
- program participation

### Reframe

- Today → Now orientation
- modules → capabilities behind the experience
- Budget → tool inside Money
- Resources → browse + contextual guidance capability
- Wellness → moments/context rather than central daily workflow

### Add Carefully

- read-only Signals derived from existing truth
- missing lifecycle event history only where Story cannot otherwise be truthful
- contextual resource surfacing
- Story after signal provenance is trustworthy

### Do Not Add Yet

- universal events table
- AI-generated participant narrative
- hidden scoring
- clinical inference
- automatic cause inference
- participant navigation redesign
- Johnny activation based solely on this architecture document

## Recommended Sequence

1. Anchor this participant experience architecture.
2. Reconcile current Today data into a read-only Now signal candidate using existing tables only.
3. Pressure-test Now with current authorized test participants.
4. Reconcile missing event history that blocks trustworthy continuity.
5. Reconcile Money entry around orientation first, Budget as a tool.
6. Add contextual Resource surfacing.
7. Build the first cross-domain Story candidate only from traceable moments and signals.
8. Reconsider participant navigation after the experience model is validated.
9. Reassess Johnny activation readiness separately.

## Acceptance Standard

THRIVE should increasingly answer four participant questions without requiring the participant to understand the product architecture:

1. **What's happening now?**
2. **What am I still working on?**
3. **What has changed or moved?**
4. **What can I reasonably do from here?**

The participant should be able to inspect why THRIVE surfaced any reflective statement.

The system should feel like a personal workspace that remembers and organizes, not a set of forms the participant must learn to operate.
