# THRIVE Wellness Check-In Interface Candidate v0.1

## Status

Review-only interface candidate.

No form has been installed. No database write is authorized.

## Page behavior

The current read-only Wellness shell should become a two-state page:

### State A: no check-in today

Show:

- `How is today going?`
- four large choices;
- optional reflection areas;
- optional next step;
- optional note;
- `Save check-in` button only after schema and RLS approval.

### State B: check-in already saved today

Show:

- participant's selected overall-day label;
- selected optional areas;
- chosen next step;
- note when present;
- saved time;
- `Update today's check-in` only if same-day edit is approved;
- no score;
- no warning color tied to a clinical meaning.

## Overall-day input

Large buttons:

- Good
- Okay
- Hard
- Not sure

No numeric score should be shown.

## Optional reflection inputs

### Stress

- Low
- Okay
- High
- Not sure

### Sleep

- Good
- Okay
- Poor
- Not sure

### Energy

- Good
- Okay
- Low
- Not sure

### Confidence

- Good
- Okay
- Low
- Not sure

### Routine

- On track
- Mixed
- Off track
- Not sure

### Recovery support

- Connected
- Could use support
- Not needed today
- Not sure

### Support needed

- Yes
- No
- Not sure

## Optional next step

- Take a short break
- Review today's plan
- Choose one small task
- Contact someone supportive
- Make time for food, water, or rest
- Ask for help
- Something else

## Optional note

Label:

`Anything you want to add?`

Helper text:

`Optional. Keep it as short or detailed as you want.`

## Save behavior candidate

Before saving:

- authenticated session required;
- participant identity resolved from `supported_people.auth_user_id`;
- active program participation resolved;
- one active check-in per participant per date;
- no client-supplied authority fields trusted;
- server or database derives ownership and scope.

After saving:

- show a simple success message;
- refresh today's state;
- do not generate a score or conclusion;
- do not notify anyone automatically;
- do not create a Support request automatically;
- do not send anything to the Trust Engine.

## History candidate

The first history view should show only:

- date;
- overall-day label;
- chosen next step when present;
- archived state when applicable.

Do not show:

- streak pressure;
- compliance percentages;
- risk score;
- relapse warning;
- financial correlation;
- staff conclusion.

## Participant-facing boundary

Keep one short boundary near the bottom:

`Your check-in is your own reflection. It does not create a diagnosis or an emergency decision.`

Do not repeat the boundary under every field.

## Accessibility

- large touch targets;
- keyboard operable;
- no color-only meaning;
- visible selected state;
- clear optional labels;
- no horizontal scrolling;
- no forced completion of optional fields.

## Mobile order

1. page heading;
2. overall day;
3. optional reflection areas;
4. optional next step;
5. optional note;
6. save action;
7. today's saved state or recent history;
8. one short boundary statement.

## Frozen boundaries

- no implementation;
- no SQL execution;
- no writes;
- no clinical scoring;
- no emergency workflow;
- no automatic Support request;
- no financial cross-reference;
- no Johnny data;
- no Trust Engine synchronization;
- no push or deployment.

## Exact next gate

Inspect live parent constraints and helper functions, resolve staff visibility,
same-day editing, and archive authority, then produce a rollback-only schema/RLS
dry-run candidate.
