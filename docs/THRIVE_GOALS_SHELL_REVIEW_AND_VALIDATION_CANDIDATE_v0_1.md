# THRIVE Goals Shell Review and Validation Candidate v0.1

## Status

Read-only participant Goals shell candidate created locally.

No Goals schema, participant write, assignment workflow, task-completion
workflow, scoring, staff dashboard, or hard-delete behavior was added.

## Candidate behavior

The `/goals` route:

- uses the shared participant shell;
- marks Goals as the active navigation route;
- presents a neutral no-goals state;
- previews participant-centered goal areas;
- previews plain-language goal structure;
- presents non-punitive progress states;
- explains participant-created versus staff-suggested ownership;
- performs no Goals database read or write.

## Required validation

- targeted source check passes;
- production build passes;
- Person D can open the page;
- Person A can open the same neutral shell;
- outsider authentication behavior remains unchanged;
- no fabricated goals or history appear;
- no compliance score or judgment appears;
- no Trust Engine control appears;
- mobile layout remains readable.

## Frozen boundaries

- no schema;
- no SQL;
- no Goal writes;
- no assignment workflow;
- no task completion;
- no hard delete;
- no Johnny data;
- no Trust Engine synchronization;
- no push or deployment.

## Exact next gate

Visually verify Person D and Person A, document the result, then commit without
push.
