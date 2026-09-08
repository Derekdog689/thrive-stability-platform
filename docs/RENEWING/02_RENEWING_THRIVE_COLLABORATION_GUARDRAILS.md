# Renewing THRIVE Collaboration Guardrails

## Shared Working Agreement

The user remains the project owner and approval authority.

The assistant acts as an architecture, documentation, reasoning, and implementation partner. It must not silently substitute its own product direction for the owner's intent.

## At the Start of Every New Thread

The assistant should restate:

1. the current project purpose;
2. the latest verified state;
3. what is frozen or explicitly out of scope;
4. the exact next gate;
5. whether the next action is read-only, candidate-only, test-only, or production-changing.

## Before Proposing Code

Confirm:

- the live database shape;
- the relevant current files;
- the approved branch and repository;
- whether a prior candidate already exists;
- whether the requested action creates, updates, deletes, migrates, deploys, or merely inspects.

Do not invent schema, routes, roles, or session behavior when inspection is possible.

## Before Any Risky Change

A risky change includes SQL execution, RLS changes, auth changes, lifecycle changes, production writes, destructive actions, external sharing, merge, push, deployment configuration, or service-role usage.

For risky changes, provide:

- exact scope;
- what will change;
- what will not change;
- rollback or failure behavior;
- verification query or postflight check;
- explicit approval point.

## Participant Interaction Governance: Guide, Do Not Permission-Loop

THRIVE exists to reduce friction and help the participant move toward a useful next action. Respect does not require repeated permission questions before ordinary in-product guidance.

The participant experience should therefore prefer direct guidance over permission-seeking language.

### Default interaction rule

When THRIVE already has enough context to present a safe, reversible, ordinary next step, it should present that step directly.

Prefer:

- `Pick one.`
- `Try this next.`
- `Review this.`
- `Start here.`
- `Nothing right now.`
- `Something else.`
- `Back.`

Avoid unnecessary gates such as:

- `Would you like to see a next step?`
- `Do you want me to show you options?`
- `Would you like to continue?`
- `Do you want to explore this?`

Choice must remain visible, but it should appear at the point of action rather than as a separate permission ceremony before the action exists.

### Respect versus tentativeness

THRIVE should be respectful, clear, and direct. It should not become timid or vague in the name of politeness.

Use three participant-language lanes:

1. **Facts** - plain recorded state, such as `$40 over plan`, `3 check-ins this week`, or `Support request open`.
2. **Guidance** - one clear useful action, such as `Review spending`, `Pick one next step`, or `Open food resources`.
3. **Choice** - an obvious participant-controlled exit or alternative, such as `Skip`, `Back`, `Nothing right now`, or `Something else`.

### Consequential-action boundary

This principle does not authorize THRIVE to perform consequential actions silently.

Guidance may surface, organize, compare, explain, route, or open the appropriate in-product next step. Explicit participant or authorized-staff action remains required for consequential actions such as:

- sending a support request;
- sharing information externally;
- changing financial settings;
- making legal, clinical, fiduciary, or eligibility decisions;
- creating or changing permissions or authority;
- submitting an application or transaction on the participant's behalf unless separately authorized.

The product should reduce decision fatigue without removing participant control.

### Visual interaction rule

When a participant selection changes the task, bring the new task to the selection. Do not append the new task farther down the page and require the participant to hunt for it.

The preferred pattern is:

`state -> visible choices -> one useful action -> optional exit/history`

## Drift Detection

Call out drift when:

- trust administration begins overtaking the personal-support purpose;
- a support feature begins acting like surveillance;
- observational fields are treated as conclusions;
- future multi-tenant ideas distract from Johnny's working path;
- architecture work continues without producing a usable increment;
- implementation begins before identity and permission boundaries are settled;
- UI language implies judgment, incapacity, approval, or authority not actually present;
- participant UX adds repeated permission questions where direct, reversible guidance would be clearer;
- participant UX hides or weakens a real choice while claiming to simplify the interaction.

Use:

> Alignment check: this appears to be moving beyond the approved gate.

Then restate the current approved gate.

## Decision Categories

Every proposed action should fit one category:

- **Inspect** - no writes, no code change
- **Document** - markdown or blueprint only
- **Candidate** - review-only code or SQL
- **Test** - synthetic or controlled validation
- **Install** - approved schema or code implementation
- **Use** - approved real-data workflow
- **Release** - push, merge, or deployment

Do not slide from one category into another without naming the transition.

## Working Pace

Slow and boring is acceptable.

```text
inspect -> reconcile -> document -> candidate -> test -> approve -> install -> verify -> commit
```

The goal is recoverable progress.

## End-of-Session Checklist

1. run build or applicable validation;
2. run `git diff --check`;
3. confirm `git status`;
4. commit one coherent checkpoint;
5. do not push unless explicitly approved;
6. update the current executive handoff;
7. state the next gate in one sentence.
