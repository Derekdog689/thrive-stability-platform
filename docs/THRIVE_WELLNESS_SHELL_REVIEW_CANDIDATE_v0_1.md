# THRIVE Wellness Shell Review Candidate v0.1

## Document status

Review-only product and interface candidate.

This document defines the first participant-facing Wellness shell. It does not authorize implementation, schema creation, SQL execution, stored check-ins, participant writes, clinical interpretation, emergency workflows, deployment, push, or merge.

## Purpose

Wellness should give the participant a simple place to pause, reflect, and identify one manageable next step.

The page should help answer:

- How am I doing today?
- What is affecting me?
- What support would help?
- What routine am I trying to maintain?
- What is one useful next step?

Wellness is a personal stability and reflection tool. It is not a clinical assessment, diagnostic instrument, relapse detector, capacity evaluator, or emergency decision engine.

## First-shell goal

The first implementation should prove:

- shared participant-shell integration;
- mobile-first layout;
- understandable non-clinical language;
- visible participant ownership;
- clear no-history state;
- separation from financial evidence;
- absence of unsupported inference;
- no write behavior.

## Proposed page heading

### Wellness

**A small check-in for today.**

> Take a moment to notice how things are going. This space is for your own reflection and support planning. It does not provide a diagnosis or make conclusions about you.

## Proposed read-only sections

### 1. Today's reflection

Initial state:

**No check-in recorded today**

> A future check-in may help you describe how today feels, what is affecting you, and whether support would be useful.

No button should submit or store information in v0.1.

Optional disabled label:

`Check-ins are not available yet`

### 2. Areas you may reflect on

Preview cards:

- Overall day
- Stress
- Sleep
- Energy
- Confidence
- Routine
- Recovery support
- Support needed

These are reflection areas, not scored clinical domains.

Do not display:

- risk score;
- relapse score;
- diagnostic label;
- compliance status;
- stability grade;
- automated warning level.

### 3. One manageable next step

Candidate supportive options:

- Take a short break
- Review today's plan
- Choose one small task
- Contact someone supportive
- Make time for food, water, or rest
- Ask for help

These are educational suggestions only.

### 4. Support preview

Initial state:

**Support requests are not available yet**

> When the Support workflow is approved, you may be able to ask for help with routines, goals, budgeting, or general support.

A support request must not create consent for external sharing, expanded system access, clinical intervention, Trust Engine action, or emergency escalation.

### 5. Wellness history

Initial state:

**No Wellness check-ins recorded yet**

> Future entries will remain separate from imported financial evidence, clinical records, and Trust Engine records.

The shell must not fabricate prior check-ins, trends, streaks, progress, or historical conclusions.

### 6. Participant boundary

> Wellness entries are participant self-report and personal context. They do not automatically become a diagnosis, relapse finding, incapacity determination, fiduciary conclusion, or emergency decision.

## Participant-safe language

Preferred:

- How are things feeling today?
- What is affecting you today?
- What would make today more manageable?
- Would support be useful?
- Choose one small next step.
- Add context.
- Take your time.
- You may skip anything you do not want to answer.

Avoid:

- High risk
- Relapse warning
- Noncompliant
- Unstable
- Failed check-in
- Bad day score
- Concerning behavior
- Clinical status
- Capacity concern

## Ownership model

Future Wellness entries should be classified as participant-owned self-report.

A future write model should preserve supported person, program and workspace scope, submitter, timestamp, skipped prompts, optional participant note, archive or inactive state rather than hard delete, source ownership, and edit history when material.

These are future requirements, not authorization to create schema.

## Safety boundary

The first shell contains no automated urgent-safety logic.

Any future urgent-safety workflow requires a separate gate covering participant-facing language, authority, consent, local emergency information, staff responsibility, notification behavior, audit trail, failure handling, testing, and required legal or clinical review.

The system must not silently infer an emergency from an unanswered prompt, low-rated response, spending pattern, missed routine, or optional note.

## Financial separation

Wellness may eventually allow a participant to reflect on whether finances are affecting the day.

It must not:

- convert spending into a mood conclusion;
- infer relapse from a transaction;
- infer instability from a Budget variance;
- blend a bank record into a Wellness entry;
- create a clinical or fiduciary conclusion from cross-reference.

Any future cross-reference must visibly separate financial observation, participant explanation, participant self-report, support information, and an authorized conclusion if one exists.

## Mobile-first candidate layout

Recommended order:

1. page purpose;
2. today's reflection state;
3. reflection-area previews;
4. one manageable next step;
5. support preview;
6. history state;
7. participant boundary.

Design requirements:

- large touch targets;
- short cards;
- limited text per card;
- no dense grid on narrow screens;
- no horizontal scrolling;
- clear keyboard focus;
- no color-only meaning;
- readable contrast;
- optional disclosure clearly labeled.

## Read-only implementation acceptance criteria

The first `/wellness` shell is acceptable when:

- it appears inside the existing participant shell;
- Wellness is marked as the active navigation item;
- Person D can open it;
- Person A can open the same neutral shell;
- outsider authentication behavior remains consistent with the current app;
- no database request attempts to create or update Wellness data;
- no fake check-in history appears;
- no score or conclusion appears;
- no Trust Engine control appears;
- mobile layout remains readable;
- production build passes.

## Out of scope

- Wellness schema;
- stored check-ins;
- participant notes;
- trend calculations;
- streaks;
- reminders;
- notifications;
- support-request creation;
- emergency escalation;
- clinical screening tools;
- staff review dashboard;
- spending correlation;
- Trust Engine comparison;
- real Johnny data.

## Frozen boundaries

- no schema;
- no SQL;
- no Wellness writes;
- no clinical interpretation;
- no urgent-safety workflow;
- no participant financial cross-reference;
- no Johnny data;
- no Trust Engine synchronization;
- no push, merge, or deployment.

## Build status

Review-only document. No source build required.

## Exact next gate

Approve, revise, or reject this Wellness shell candidate.

After approval:

1. inspect `ThriveSidebar`, `ThriveNavigation`, and the existing participant page-shell pattern;
2. create `/wellness` as a read-only page;
3. run a targeted source check;
4. run the production build;
5. visually verify Person D and Person A;
6. document the validation;
7. commit without push.
