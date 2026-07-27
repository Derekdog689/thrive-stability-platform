# THRIVE Participant Experience Blueprint v0.1

## Status

Approved product blueprint.

This version incorporates the approved product decisions made after initial review.

It remains documentation-only and does not authorize code changes, schema changes, SQL execution, data import, production writes, service-role use, deployment, push, merge, or Trust Engine synchronization.

## Verified starting state

The following foundation has been completed and validated:

- authenticated supported-person identity linkage;
- active participation lookup;
- participant-linked program lookup;
- participant-safe program RLS;
- Person A positive access validation;
- Person D positive access validation;
- controlled outsider isolation validation;
- participant navigation installation;
- permanent participant route at `/my-program`;
- production build validation;
- permanent My Program v0.1 validation record.

Current source checkpoint:

`d5989c4 Document permanent My Program v0.1 validation`

The synthetic accounts and diagnostic routes were used to prove system communication, scope, and isolation. They are not the intended final participant experience.

## Product intent

THRIVE should help one supported person understand:

- where they are today;
- what matters now;
- what money is available;
- what was planned;
- what actually happened;
- what needs explanation;
- how wellness and behavior may relate to spending;
- what progress has been made;
- what manageable next step is available.

THRIVE is a personal financial capability, personal stability, wellness, and behavioral analytics platform.

THRIVE is not a clinical system.

THRIVE does not report participant-entered data to the Trust Engine.

## Core system boundary

Johnny's THRIVE personal support spine and the Trust Engine are independent systems.

The Trust Engine's involvement is limited to its own beneficiary-facing portal and, only when separately authorized, the display of selected Trust Engine facts for comparison inside THRIVE.

Nothing entered into THRIVE is sent to the Trust Engine.

THRIVE may eventually compare authorized facts across systems, but it must not merge:

- ownership;
- authority;
- approvals;
- consent;
- decision-making;
- record custody;
- fiduciary conclusions.

A bank transaction is an observed fact. It does not establish intent, irresponsibility, relapse, incapacity, trust misuse, deception, or any legal or fiduciary conclusion.

## Approved participant navigation

The MVP navigation is:

1. Today
2. My Program
3. Budget
4. Wellness
5. Goals
6. Support
7. Reports

Reports is included in the MVP shell because THRIVE is intended to hold a full year of bank history and provide a participant-owned audit trail and financial reference outside the bank interface itself.

## Page 1: Today

### Purpose

`Today` is the permanent participant landing page.

It should answer:

- What matters today?
- What is coming soon?
- What needs my attention?
- What can I complete now?
- What changed since my last visit?

### Candidate content

- greeting and current date;
- one primary next step;
- upcoming bill or financial reminder;
- upcoming appointment or commitment;
- active goal progress;
- wellness check-in prompt;
- unresolved explanation request;
- recent positive progress;
- quick access to Budget, Wellness, Goals, Support, and Reports.

### Participant actions

- complete a participant-owned task;
- open a budget item;
- add context to a transaction;
- complete a wellness check-in;
- open or update a goal;
- request help;
- review a report.

## Page 2: My Program

### Purpose

`My Program` explains the participant's current support structure.

It should answer:

- What program am I part of?
- What is the program intended to support?
- What is my role?
- What supports are active?
- What decisions belong to me?
- Who can help me?

### Current v0.1 capability

The permanent `/my-program` route currently displays:

- participant preferred or display name;
- active linked program;
- program description;
- program type;
- program status;
- participant role;
- participation status.

### Candidate v0.2 additions

- plain-language program overview;
- participant goals connected to the program;
- current support categories;
- participant-safe next steps;
- support contacts;
- explanation of participant choice and decision boundaries;
- source labels for program facts.

Program administration and membership changes remain outside the participant-facing workflow unless separately approved.

## Page 3: Budget

### Purpose

`Budget` is a robust participant financial capability tool, not a lightweight acknowledgment page.

It should answer:

- What money is available?
- What income is expected?
- What bills are planned?
- What has been spent?
- What remains available to plan?
- What changed from the plan?
- What needs explanation?
- What financial goal am I working toward?
- What does the full-year history show?

### Approved capability direction

Budget may support:

- expected income;
- recurring bills;
- flexible spending;
- debt;
- savings;
- planned one-time expenses;
- monthly rollover;
- transaction import;
- transaction categorization;
- merchant normalization;
- transfer and refund handling;
- participant explanations;
- planned versus actual comparison;
- monthly and annual views;
- category trends;
- recurring payment history;
- audit history;
- downloadable or printable summaries later.

### Participant-entered data

Initial participant-owned information may include:

- expected monthly income;
- planned bills;
- recurring expenses;
- planned spending;
- savings goals;
- personal categories;
- one-time planned expenses;
- transaction explanations;
- personal notes;
- help requests.

### Bank statement ingestion

Bank statement ingestion should begin early.

The system should not wait to load bank records.

The correct sequence is:

1. import source records;
2. preserve original statement evidence;
3. reconcile duplicates and transfers;
4. normalize merchant descriptions;
5. categorize transactions;
6. allow participant explanation;
7. produce monthly and annual reporting;
8. add increasingly reliable pattern analysis.

Automatic interpretation and conclusions should wait until the ingestion, reconciliation, categorization, and explanation model is reliable.

This means the data enters early, while unsupported meaning is deferred.

## Page 4: Wellness

### Purpose

`Wellness` supports personal reflection, routine tracking, behavioral analytics, stability awareness, and help-seeking.

THRIVE Wellness is not a clinical record system.

### Candidate content

- daily or scheduled check-in;
- mood;
- sleep;
- stress;
- energy;
- confidence;
- support connection;
- routine completion;
- optional personal note;
- current challenge;
- help request;
- suggested next step.

### Approved analytics direction

Wellness entries may be analyzed alongside spending behavior to identify participant-facing patterns such as:

- higher spending during periods of poor sleep;
- impulse spending during high-stress periods;
- missed routines followed by budget variance;
- stable weeks associated with stronger goal progress.

These are observed associations and participant-support analytics, not diagnoses or clinical conclusions.

## Page 5: Goals

### Purpose

`Goals` turns broad intentions into manageable participant-owned steps.

### Goal structure

A goal may include:

- participant-written title;
- participant-written reason;
- category;
- next step;
- target date when useful;
- progress status;
- completed evidence;
- barrier;
- support request;
- optional connection to Budget, Wellness, or My Program.

### Approved participant control

The participant may:

- create a goal;
- edit a participant-owned goal;
- pause a goal;
- complete a goal;
- archive a goal;
- add progress;
- request support.

No hard delete is included in the MVP.

## Page 6: Support

### Purpose

`Support` gives the participant a clear way to ask for help and track what happened.

### Initial support categories

- Budget or money help
- Help understanding a transaction
- Wellness support
- Goal support
- Appointment or paperwork help
- Technology or app help
- Something else

A THRIVE support request does not create authority for Trust Engine action or external sharing.

## Page 7: Reports

### Purpose

`Reports` is included in the MVP shell from the beginning.

It should become the participant's long-view financial and wellness reference.

### Initial shell

The first Reports version may contain:

- clear empty states;
- date-range controls;
- month and year selectors;
- report type placeholders;
- source and data coverage notices;
- links back to incomplete reconciliation or explanation work.

### Planned report families

- monthly financial summary;
- annual financial history;
- spending by category;
- recurring bills;
- income history;
- planned versus actual spending;
- transaction explanation history;
- savings progress;
- debt progress;
- merchant history;
- wellness check-in history;
- goal progress;
- spending and wellness cross-reference;
- authorized external fact comparison later.

Reports should preserve source labels and distinguish raw facts from participant explanations and analytics.

## Information ownership model

### Participant-owned

Examples:

- personal goal;
- personal note;
- transaction explanation;
- wellness check-in;
- help request;
- planned expense;
- personal budget plan.

### THRIVE operational record

Examples:

- support request status;
- program participation fact;
- system-generated reminder;
- educational recommendation;
- reconciliation state;
- normalized merchant value;
- report generation metadata.

### Observational evidence

Examples:

- imported bank transaction;
- statement opening and closing balance;
- account balance snapshot;
- transaction timestamp;
- source statement;
- import batch;
- comparison result.

These are observations, not conclusions.

### External authorized fact

A separately authorized fact displayed from the Trust Engine or another source.

The source must remain visible.

THRIVE must not send participant-entered data back to the Trust Engine.

## Fact and explanation display model

A reusable participant-safe information block should support:

### Verified fact

What is known and where it came from.

### Participant context

What the participant says happened or what the item means to them.

### THRIVE explanation

Educational or operational context.

### Pattern

A repeated or notable relationship calculated from available data.

### Next step

A manageable participant action.

### Conclusion

Only when a valid, separately authorized conclusion exists. THRIVE must not manufacture one.

## Multi-tenant direction

THRIVE should be designed as a multi-tenant platform.

Johnny is the first modeled supported person, not permanent application logic.

The architecture should support:

- multiple supported people;
- separate tenant, workspace, or program boundaries;
- participant self-access;
- authorized staff access only to permitted people;
- shared application code;
- isolated participant data;
- configurable programs;
- no Johnny-specific table or route logic in the permanent design.

## Internal diagnostic routes

Existing synthetic and diagnostic routes should remain during development.

They should:

- stay outside participant navigation;
- be marked internal;
- later be restricted to development or authorized staff;
- eventually be replaced by automated tests where practical;
- be moved to an archived or inactive state after the product has operated reliably;
- not be hard-deleted during the MVP.

## Approved MVP build order

### Phase 1: Participant shell

- Today landing shell
- Reports shell
- updated navigation
- mobile-first participant layout

### Phase 2: Budget foundation

- participant-owned budget plan
- recurring bills
- savings and debt structure
- planned versus actual model
- import-ready financial views

### Phase 3: Bank ingestion and reconciliation

- statement and transaction import
- source preservation
- duplicate reconciliation
- transfer and refund handling
- merchant normalization
- categorization
- explanation workflow

### Phase 4: Wellness

- participant check-in
- routine and stability tracking
- participant help request
- wellness history

### Phase 5: Goals and Support

- participant-owned goals
- next-step tracking
- structured support requests

### Phase 6: Reports and analytics

- monthly and annual financial reporting
- wellness history
- spending and wellness cross-reference
- participant-facing patterns
- authorized external fact comparisons later

## Approved product decisions

- `Today` is the permanent participant landing page.
- Reports receives an MVP shell immediately.
- Budget may be robust.
- Bank statement data should enter early.
- Unsupported automatic conclusions should wait until the model is reliable.
- Wellness is non-clinical.
- Wellness may support behavioral analytics and spending cross-reference.
- Goals are participant-created and participant-owned.
- Support categories are approved as an initial list.
- Nothing entered into THRIVE is reported to the Trust Engine.
- Trust Engine involvement is limited to its own beneficiary portal and separately authorized read-only comparison facts.
- THRIVE should be multi-tenant capable.
- Diagnostic routes remain internal and may later be archived.
- No hard deletes are part of the MVP.

## Frozen boundaries

This blueprint does not authorize:

- real Johnny data entry;
- Johnny authentication changes;
- bank import;
- Trust Engine synchronization;
- THRIVE-to-Trust reporting;
- new database objects;
- SQL execution;
- RLS changes;
- service-role use;
- deployment;
- push or merge;
- deletion of diagnostic routes.

## Build status

Documentation-only pass.

No source build was required or run.

## Commit checkpoint

Starting checkpoint:

`d5989c4 Document permanent My Program v0.1 validation`

## Exact next gate

Review the companion `THRIVE Financial and Wellness Data Model Blueprint v0.1`.

After both blueprints are approved and committed, inspect the live schema, current Budget routes, dashboard shell, financial ingestion routes, and participant-safe access paths before preparing any schema or implementation candidate.
