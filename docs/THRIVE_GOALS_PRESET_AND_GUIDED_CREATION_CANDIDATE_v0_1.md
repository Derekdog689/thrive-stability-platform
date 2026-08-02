# THRIVE Goals Preset and Guided Creation Candidate v0.1

## Status

Review-only UX candidate.

This document defines a guided participant Goal-creation experience for `/goals`.

It does not authorize:

- implementation;
- schema changes;
- SQL execution;
- automatic Goal creation;
- staff-created participant commitments;
- Wellness-to-Goal conversion;
- Johnny activation;
- production participant use;
- Trust Engine synchronization;
- service-role use;
- deployment;
- merge;
- push.

## Verified starting state

- Goals schema v0.2 is installed and verified.
- Authenticated synthetic RLS testing passed.
- Participant Goal create, view, edit, progress, refresh, archive, and archived-history flows passed.
- Archived Goals are read-only to participants.
- No hard-delete path exists.
- The current `/goals` creation form begins with open text fields.
- The current Goal-area list already provides the foundation for a guided preset system.
- No additional database migration is required for this candidate.

## Purpose

Reduce blank-page pressure while preserving participant ownership.

The guided experience should help a participant begin with a useful Goal starter, personalize the wording, choose one manageable next step, and save only after reviewing the final text.

A preset is a suggestion.

A preset does not become a Goal until the participant:

1. selects it;
2. reviews or edits it;
3. selects or writes a next step;
4. presses `Save goal`.

## Product principles

### Participant ownership

The participant controls the final saved Goal.

Preset wording must remain editable.

Suggested next steps must remain editable.

Selecting a preset must never silently create a record.

### Explain before action

The interface should explain what each choice does before saving.

The participant should always know:

- what will be saved;
- what can still be changed;
- that a preset is optional;
- that `Other` allows fully custom wording.

### Supportive language

The interface must avoid:

- assignment language;
- compliance language;
- failure labels;
- relapse conclusions;
- clinical interpretations;
- capacity judgments;
- legal or fiduciary conclusions.

### Smallest useful step

Each Goal should lead to one clear next step.

The system should help narrow the Goal without turning it into a scorecard.

## Guided creation flow

## Step 1 — Choose a Goal area

Prompt:

```text
What part of life would you like to work on?
```

Options:

- Daily stability
- Money and budgeting
- Health and wellness
- Relationships and support
- Work and education
- Personal growth
- Other

Behavior:

- one area may be selected;
- `Other` opens the custom Goal path;
- changing the area resets the selected preset and suggested next step only after a clear warning if the participant has already typed custom text;
- the area remains editable before saving.

## Step 2 — Choose a Goal starter

Prompt:

```text
Choose a starting point
```

Helper text:

```text
You can change the wording before saving.
```

The preset list changes based on the selected Goal area.

## Preset library

### Daily stability

#### Build a steadier morning routine

Suggested next steps:

- Choose one regular wake-up time
- Prepare tomorrow's items the night before
- Write a simple three-step morning checklist
- Complete one morning task before checking my phone
- Write my own next step

#### Keep my living space more organized

Suggested next steps:

- Choose one small area to organize
- Put away five items
- Create one place for important papers
- Set a ten-minute cleanup timer
- Write my own next step

#### Improve my weekly planning

Suggested next steps:

- Review the week ahead
- Write down three important tasks
- Add one appointment to my calendar
- Choose one day for errands
- Write my own next step

#### Complete important appointments and tasks

Suggested next steps:

- Make one appointment
- Confirm an upcoming appointment
- Gather the documents I need
- Write down the next deadline
- Write my own next step

#### Create a healthier sleep routine

Suggested next steps:

- Choose a regular bedtime
- Reduce screen use before bed
- Prepare for tomorrow before bedtime
- Create a short wind-down routine
- Write my own next step

#### Other

Opens the custom Goal path.

### Money and budgeting

#### Understand where my money is going

Suggested next steps:

- Review one week of spending
- List my essential expenses
- Identify one spending pattern
- Compare planned and actual spending
- Write my own next step

#### Build a weekly spending plan

Suggested next steps:

- List this week's available money
- Write down essential expenses
- Set an amount for food and transportation
- Leave room for one flexible expense
- Write my own next step

#### Save toward something important

Suggested next steps:

- Name what I am saving for
- Choose a first savings amount
- Set aside a small amount this week
- Decide where the savings will be kept
- Write my own next step

#### Catch up on an important expense

Suggested next steps:

- Confirm the current amount due
- Review the payment options
- Choose a realistic first payment
- Write down the next due date
- Write my own next step

#### Reduce unnecessary spending

Suggested next steps:

- Identify one expense to reduce
- Pause one nonessential purchase
- Compare prices before buying
- Set a weekly discretionary limit
- Write my own next step

#### Prepare for an upcoming bill

Suggested next steps:

- Confirm the due date
- Confirm the expected amount
- Decide how much to set aside this week
- Add the bill to my plan
- Write my own next step

#### Other

Opens the custom Goal path.

### Health and wellness

#### Improve my sleep

Suggested next steps:

- Choose a regular bedtime
- Reduce screen use before bed
- Prepare my sleeping space
- Discuss sleep concerns with an appropriate provider
- Write my own next step

#### Become more physically active

Suggested next steps:

- Take a short walk
- Choose one activity I enjoy
- Schedule one active period this week
- Track one day of movement
- Write my own next step

#### Keep up with medical appointments

Suggested next steps:

- Confirm my next appointment
- Add the appointment to my calendar
- Gather questions for the provider
- Arrange transportation
- Write my own next step

#### Improve my eating routine

Suggested next steps:

- Plan one balanced meal
- Make a short grocery list
- Choose one regular meal time
- Prepare one food item in advance
- Write my own next step

#### Make time for emotional wellness

Suggested next steps:

- Choose one calming activity
- Take ten quiet minutes
- Write down what has been weighing on me
- Reach out to a supportive person
- Write my own next step

#### Practice a healthy coping skill

Suggested next steps:

- Choose one coping skill to practice
- Use the skill once today
- Write down when the skill might help
- Ask someone supportive for ideas
- Write my own next step

#### Other

Opens the custom Goal path.

### Relationships and support

#### Strengthen a supportive relationship

Suggested next steps:

- Reach out to the person
- Plan a short conversation
- Share one honest update
- Ask how we can stay connected
- Write my own next step

#### Ask for help when I need it

Suggested next steps:

- Name the help I need
- Choose one person to ask
- Write or practice what I want to say
- Make one request
- Write my own next step

#### Improve communication with someone important

Suggested next steps:

- Choose one topic to discuss
- Write down what I want the person to understand
- Pick a calm time to talk
- Practice using clear and respectful language
- Write my own next step

#### Build a stronger support network

Suggested next steps:

- Identify one positive person
- Attend one supportive activity
- Save one contact number
- Introduce myself to one new support
- Write my own next step

#### Set a healthy boundary

Suggested next steps:

- Name the boundary I need
- Write one clear sentence
- Choose when to communicate it
- Ask a supportive person to help me practice
- Write my own next step

#### Reconnect with a positive person

Suggested next steps:

- Send a short message
- Make one phone call
- Suggest a simple time to connect
- Share one positive update
- Write my own next step

#### Other

Opens the custom Goal path.

### Work and education

#### Find employment

Suggested next steps:

- Update my resume
- Identify three places to apply
- Complete one application
- Ask someone to review my resume
- Prepare answers for common interview questions
- Write my own next step

#### Improve my resume

Suggested next steps:

- Add my most recent experience
- Review my contact information
- Improve one job description
- Ask someone to proofread it
- Write my own next step

#### Prepare for an interview

Suggested next steps:

- Review common interview questions
- Choose appropriate clothing
- Practice one answer
- Confirm the interview time and location
- Write my own next step

#### Complete a job application

Suggested next steps:

- Gather my work history
- Choose one job opening
- Complete the first section
- Submit one application
- Write my own next step

#### Explore training or education

Suggested next steps:

- Identify one program
- Review the admission requirements
- Find the cost or funding options
- Contact the program for information
- Write my own next step

#### Build a dependable work routine

Suggested next steps:

- Choose a regular wake-up time
- Plan transportation
- Prepare work items the night before
- Write down my weekly schedule
- Write my own next step

#### Other

Opens the custom Goal path.

### Personal growth

#### Build more confidence

Suggested next steps:

- Name one thing I handled well
- Complete one task I have been avoiding
- Practice one encouraging statement
- Ask someone I trust for feedback
- Write my own next step

#### Become more consistent

Suggested next steps:

- Choose one small daily action
- Pick a regular time
- Track the action for three days
- Remove one obstacle
- Write my own next step

#### Work on something I have been avoiding

Suggested next steps:

- Name the first small part
- Spend ten minutes on it
- Gather what I need
- Ask for help with one part
- Write my own next step

#### Practice making healthier decisions

Suggested next steps:

- Pause before one decision
- Write down two options
- Ask how each option may affect tomorrow
- Talk through one choice with a supportive person
- Write my own next step

#### Develop a new skill

Suggested next steps:

- Choose the skill
- Find one beginner resource
- Practice for ten minutes
- Ask someone experienced for guidance
- Write my own next step

#### Make progress toward greater independence

Suggested next steps:

- Choose one responsibility to practice
- Complete one task on my own
- Make one important phone call
- Learn one step in a process I rely on
- Write my own next step

#### Other

Opens the custom Goal path.

### Other

The interface skips preset selection and opens custom fields.

Prompt:

```text
Write your Goal in your own words
```

The participant may also return to the preset list without losing custom text unless they confirm they want to reset it.

## Step 3 — Review and personalize the Goal

After a preset is selected, populate the editable Goal field.

Example:

```text
Selected starter:
Build a weekly spending plan

Goal in your own words:
Build a weekly spending plan
```

The participant may revise it to:

```text
Build a weekly spending plan that covers my essential expenses
```

The interface must make the editable nature obvious.

Recommended helper text:

```text
This is only a starting point. Change it so it sounds right to you.
```

## Step 4 — Why it matters

Prompt:

```text
Why does this matter to you?
```

Optional.

Do not generate or infer the participant's reason.

The interface may provide neutral helper text:

```text
You can leave this blank or write a short reason in your own words.
```

No preset reason should be automatically inserted.

## Step 5 — Choose a suggested next step

After selecting a Goal starter, show suggested next steps.

Selecting a next-step suggestion pre-fills the editable next-step field.

The participant may change it before saving.

`Write my own next step` clears the suggestion and focuses the editable field.

Recommended helper text:

```text
Choose one small action you can begin with. You can change the wording.
```

## Step 6 — Final participant review

Before save, show a concise review panel:

```text
Your Goal
[final editable title]

Why it matters
[participant text or "Not added"]

Your next step
[final editable next step]

Goal area
[selected area]
```

The review panel must use the same form state. It must not create a second hidden version of the content.

## Step 7 — Save

Button:

```text
Save Goal
```

Save is enabled only when:

- Goal title is not blank;
- next step is not blank;
- an active participant and program are resolved;
- no save request is already pending.

On save:

```text
ownership_source = participant
progress_status = not_started
```

Identity and scope remain derived from the authenticated participant context.

## Preset data model

The preset library should live in application code, not the database, for v0.1.

Recommended file:

```text
src/app/goals/goalPresets.ts
```

Suggested shape:

```ts
type GoalPreset = {
  id: string;
  area: GoalArea;
  title: string;
  nextSteps: string[];
};

type GoalAreaDefinition = {
  id: GoalArea;
  label: string;
  description: string;
  presets: GoalPreset[];
};
```

Stable internal IDs should not be shown in the participant interface.

## Form state

Recommended state:

```ts
type GuidedGoalDraft = {
  selectedArea: string;
  selectedPresetId: string;
  selectedNextStepId: string;
  title: string;
  whyItMatters: string;
  nextStep: string;
};
```

Changing a selection updates the editable text only when safe.

## Unsaved-text protection

If the participant has edited the Goal or next-step text and then selects a different area or preset, show an inline confirmation:

```text
Change this Goal starter?

Your current wording will be replaced by the new starter.

Keep my wording | Use new starter
```

Do not discard participant-written text silently.

## Create-form layout

## No active Goals

Keep the guided creation form open.

Order:

1. Goal area
2. Goal starter
3. editable Goal title
4. why it matters
5. suggested next step
6. editable next step
7. final review
8. save

## One or more active Goals

Show a compact button:

```text
Add another Goal
```

The guided form remains collapsed until requested.

When expanded:

- preserve typed content until save or explicit cancel;
- do not collapse after validation errors;
- after successful save, collapse and focus the new Goal heading.

## Accessibility requirements

### Selection controls

- area choices should use native radio buttons or accessible button groups;
- preset choices must expose selected state;
- suggested next steps must expose selected state;
- custom text inputs must retain visible labels;
- no meaning may rely only on color.

### Programmatic state

Use:

- `aria-expanded` for the collapsible create section;
- `aria-controls` linking toggles to panels;
- `aria-pressed` or native radio state for preset choices;
- `role="status"` and `aria-live="polite"` for save confirmations;
- `role="alert"` for validation and connection errors.

### Focus management

- selecting `Other` focuses the custom Goal field;
- selecting `Write my own next step` focuses the next-step field;
- successful save focuses the new Goal heading;
- cancelling guided creation returns focus to `Add another Goal`;
- changing area or preset does not move focus unexpectedly;
- archive confirmation and edit behavior retain their existing refinement requirements.

### Field validation

Required fields:

- Goal title;
- next step.

Use field-level messages and:

```text
aria-invalid
aria-describedby
```

Do not rely only on a general error message.

## Archive behavior

The preset candidate does not change archive behavior.

The UX hardening package should still add a separate inline archive confirmation before implementation is considered complete.

Archived Goals remain:

- visible in history;
- read-only to participants;
- not hard deleted;
- not reactivated from the participant page.

## Mobile behavior

On small screens:

- display Goal areas as full-width selectable cards;
- show preset choices in a single column;
- show next-step suggestions as stacked buttons or radio rows;
- keep the final review compact;
- keep the save button full width;
- avoid requiring horizontal scrolling;
- collapse the creation form when active Goals exist.

## Empty and recovery states

### No active participant program

Show:

```text
Goals become available when your account is connected to an active THRIVE program.
```

Do not show disabled presets that appear actionable.

### Connection error

Show a supportive error message and a retry action.

### Save error

Keep all typed content.

Do not reset the form.

### Successful save

Clear the guided draft only after the saved row returns successfully.

## Analytics and audit boundary

No behavioral analytics are required for v0.1.

The database Goal row remains the record of the participant's saved choice.

Do not store:

- viewed presets;
- unselected presets;
- abandoned drafts;
- inferred preferences;
- time spent choosing;
- hidden scoring.

## Cross-module boundary

This candidate does not:

- convert Wellness next steps into Goals;
- create Support requests;
- modify Budget records;
- modify program participation;
- synchronize with the Trust Engine;
- produce clinical, relapse, capacity, legal, or fiduciary conclusions.

## Acceptance criteria

The candidate is ready for implementation review only when:

- every Goal area has approved presets;
- every preset has suggested next steps;
- `Other` is available at area, preset, and next-step levels;
- selected text remains editable;
- participant-written text is never silently overwritten;
- no record is created before `Save Goal`;
- title and next step are required;
- Goal ownership remains participant-controlled;
- no database migration is required;
- active and archived Goal behavior remains unchanged;
- accessibility requirements are documented;
- mobile behavior is documented;
- frozen cross-module boundaries are preserved.

## Candidate implementation files

Expected implementation scope after separate approval:

```text
docs/THRIVE_GOALS_PRESET_AND_GUIDED_CREATION_CANDIDATE_v0_1.md
src/app/goals/goalPresets.ts
src/app/goals/page.tsx
```

A small guided-form component may be introduced only if it keeps `page.tsx` understandable.

No change is expected in:

```text
src/app/goals/useParticipantGoals.ts
```

unless a narrowly scoped UI-state typing improvement is required.

No schema or SQL file is expected.

## Validation plan after implementation

Use Synthetic Participant D.

Validate:

1. select each Goal area;
2. confirm correct presets appear;
3. select a preset;
4. confirm title is prefilled and editable;
5. select a suggested next step;
6. confirm next step is prefilled and editable;
7. choose `Other`;
8. confirm custom path works;
9. test unsaved-text replacement warning;
10. test required-field errors;
11. save one synthetic guided Goal;
12. refresh and confirm persistence;
13. edit the saved Goal;
14. archive the Goal;
15. confirm archived history is read-only;
16. confirm ownership and scope fields remain unchanged;
17. confirm no unrelated module changes.

## Exact next gate

Review and approve this candidate's preset library, wording, guided interaction, and accessibility requirements.

Do not implement until explicit approval is given.
