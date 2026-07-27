# THRIVE Financial and Wellness Data Model Blueprint v0.1

## Status

Review-only conceptual data model.

This document defines the intended information layers, ownership, provenance, lifecycle, and analytical boundaries for THRIVE financial and wellness data.

It does not authorize schema creation, SQL execution, migration, data import, RLS changes, service-role use, production writes, deployment, push, merge, Johnny insertion, or Trust Engine synchronization.

## Product scope

THRIVE is intended to support:

- participant-owned budgeting;
- full-year bank history;
- financial audit history;
- transaction reconciliation;
- participant explanations;
- monthly and annual reporting;
- personal wellness tracking;
- routine and stability tracking;
- goals;
- support requests;
- behavioral analytics;
- spending and wellness cross-reference;
- multi-tenant use.

Johnny is the first modeled participant.

The permanent design should support additional residents and supported people without embedding Johnny-specific logic.

## Fundamental separation

The financial model must preserve distinct layers:

1. source evidence;
2. reconciliation;
3. classification;
4. participant explanation;
5. planning;
6. analytics;
7. reports.

The wellness model must preserve distinct layers:

1. participant self-report;
2. routine and activity observations;
3. participant notes;
4. support requests;
5. derived patterns;
6. reports.

Facts, explanations, patterns, and conclusions must remain separate.

## Multi-tenant ownership model

Every durable record should be attributable to the correct scope.

Candidate ownership hierarchy:

- tenant or workspace;
- program, where applicable;
- supported person;
- financial account or wellness stream;
- source/import batch;
- individual record.

The exact live schema must be inspected before any implementation proposal.

### Required isolation behavior

- a participant sees only their own participant-facing records;
- authorized staff see only permitted people;
- records from different tenants or workspaces do not leak across boundaries;
- reports inherit the same participant and tenant boundaries as their source records;
- imported financial data remains tied to the correct account and participant;
- wellness data remains tied to the correct participant;
- Trust Engine facts, when later displayed, remain separately sourced.

## Financial data layers

## Layer 1: Source evidence

### Purpose

Preserve what was actually received from the bank statement, transaction export, or authorized financial source.

### Candidate record types

- financial account;
- source institution;
- source statement;
- import batch;
- source transaction;
- statement balance;
- account balance snapshot;
- source document reference.

### Candidate source transaction fields

Conceptually:

- tenant or workspace identifier;
- supported-person identifier;
- financial-account identifier;
- statement identifier;
- import-batch identifier;
- source transaction identifier when available;
- posted date;
- transaction date when separately available;
- source description;
- source amount;
- debit or credit direction;
- source balance when available;
- source transaction type;
- pending or posted state;
- raw source payload or normalized source snapshot;
- source file reference;
- source line or page reference when practical;
- imported timestamp;
- source checksum or deduplication key;
- archive state.

### Source preservation rule

Original source values must not be overwritten by later normalization.

A corrected merchant name, category, explanation, or transfer match belongs in a later layer.

### Full-year history

The model should support at least:

- twelve months of statements;
- multiple statements per account when necessary;
- multiple accounts;
- overlapping imports;
- re-import detection;
- missing-month identification;
- statement coverage reporting.

## Layer 2: Reconciliation

### Purpose

Resolve whether source records represent unique, duplicated, matched, corrected, or related financial activity.

### Candidate reconciliation states

- unreviewed;
- accepted;
- possible duplicate;
- confirmed duplicate;
- transfer candidate;
- transfer matched;
- refund candidate;
- refund matched;
- reversal;
- pending-posted pair;
- source correction needed;
- excluded from participant totals;
- archived.

### Candidate reconciliation relationships

- source transaction to duplicate source transaction;
- debit transfer to credit transfer;
- charge to refund;
- pending transaction to posted transaction;
- source transaction to statement;
- source statement to import batch.

### Reconciliation rule

Reconciliation may change how a transaction participates in totals, but it must not erase the original source record.

### Duplicate handling

A duplicate should be:

- preserved;
- marked;
- excluded from relevant totals when confirmed;
- traceable to the accepted source record;
- reversible if the reconciliation decision changes.

## Layer 3: Classification

### Purpose

Add participant-usable meaning without altering source evidence.

### Candidate classification values

Transaction nature:

- income;
- expense;
- transfer;
- refund;
- reversal;
- fee;
- interest;
- adjustment;
- unknown.

Budget category examples:

- housing;
- utilities;
- food;
- transportation;
- insurance;
- medical;
- personal;
- household;
- entertainment;
- subscriptions;
- debt;
- savings;
- support expense;
- uncategorized.

### Candidate classification fields

- normalized merchant;
- merchant alias;
- transaction nature;
- category;
- subcategory;
- recurring status;
- essential or flexible planning label;
- participant-adjusted category;
- categorization source;
- categorization confidence;
- reviewed status;
- archive state.

### Classification sources

A classification should identify whether it came from:

- participant;
- authorized staff;
- rule;
- import mapping;
- system suggestion;
- approved normalization mapping.

### Classification rule

A category is a classification, not a conclusion about the participant.

## Layer 4: Participant explanation

### Purpose

Give the participant a durable voice in the meaning of a transaction.

### Candidate explanation states

- recognized;
- not recognized;
- planned;
- unexpected;
- needs explanation;
- personal purchase;
- recurring obligation;
- support requested;
- no explanation provided.

### Candidate explanation fields

- supported-person identifier;
- transaction identifier;
- explanation state;
- participant note;
- participant-selected category override;
- planned-expense link;
- support-request link;
- created timestamp;
- updated timestamp;
- archive state.

### Explanation rule

Participant context must remain distinguishable from:

- imported facts;
- staff notes;
- system categories;
- analytics;
- Trust Engine facts.

Nothing entered as a THRIVE explanation is sent to the Trust Engine.

## Layer 5: Budget planning

### Purpose

Represent what the participant intends to do with money.

### Candidate planning records

- budget period;
- expected income;
- recurring bill;
- planned variable spending;
- savings goal;
- debt payment plan;
- one-time planned expense;
- category allocation;
- rollover decision;
- budget note.

### Candidate budget period

A budget period may include:

- month;
- supported person;
- expected income total;
- planned obligation total;
- planned flexible spending total;
- planned savings total;
- available-to-plan amount;
- actual income total;
- actual expense total;
- variance;
- status;
- archive state.

### Planning rule

The budget plan is participant-owned unless explicitly identified otherwise.

A planned amount is not the same as an observed transaction.

## Layer 6: Financial analytics

### Purpose

Calculate understandable relationships from preserved data.

### Candidate financial analytics

- monthly income total;
- monthly expense total;
- net cash flow;
- category total;
- merchant total;
- recurring-payment history;
- planned versus actual variance;
- average weekly spending;
- account balance trend;
- savings progress;
- debt progress;
- unexplained transaction count;
- statement coverage;
- reconciliation completion;
- year-to-date totals.

### Interpretation boundary

Analytics may describe:

- change;
- frequency;
- variance;
- timing;
- category concentration;
- recurring behavior;
- correlation.

Analytics must not automatically determine:

- irresponsibility;
- relapse;
- incapacity;
- deception;
- trust misuse;
- legal fault;
- fiduciary fault.

Automatic interpretations should remain deferred until source ingestion, reconciliation, categorization, participant explanation, and report validation are reliable.

## Layer 7: Financial reports

### Purpose

Provide the participant with a durable audit and understanding layer.

### MVP report shell

The shell should support:

- report type;
- month;
- year;
- account;
- date range;
- data coverage state;
- reconciliation state;
- explanation completeness;
- empty state;
- generation timestamp.

### Candidate report types

- monthly financial summary;
- annual transaction history;
- income report;
- expense report;
- category report;
- recurring obligations;
- merchant history;
- planned versus actual;
- savings progress;
- debt progress;
- reconciliation report;
- transaction explanation history;
- statement coverage report.

### Report source labels

Reports should identify whether a value is:

- bank observed;
- participant entered;
- THRIVE calculated;
- staff classified;
- externally authorized.

## Wellness data layers

## Layer 1: Participant wellness entry

### Purpose

Capture participant self-report for personal reflection, behavioral analytics, and support.

THRIVE Wellness is not a clinical record.

### Candidate wellness fields

- tenant or workspace identifier;
- supported-person identifier;
- entry date and time;
- mood selection;
- sleep quality or duration;
- stress level;
- energy level;
- confidence level;
- routine completion;
- support connection;
- current challenge;
- participant note;
- help requested;
- archive state.

### Entry rule

A participant wellness entry records what the participant chose to report at that time.

It is not a diagnosis or clinical finding.

## Layer 2: Routine and stability observations

### Purpose

Track participant-selected routines and practical stability indicators.

### Candidate observation types

- wake-time routine;
- sleep routine;
- meal routine;
- appointment attendance;
- budgeting activity;
- goal activity;
- exercise or movement;
- support contact;
- planned-task completion;
- app engagement.

These should be configured carefully and should not become covert surveillance.

## Layer 3: Wellness explanation and support

### Candidate records

- participant note;
- current challenge;
- requested support category;
- suggested next step;
- participant-selected next step;
- support-request link;
- follow-up status.

## Layer 4: Wellness analytics

### Candidate analytics

- check-in frequency;
- mood trend;
- sleep trend;
- stress trend;
- energy trend;
- confidence trend;
- routine completion trend;
- support-request frequency;
- goal progress relationship;
- spending relationship.

### Pattern boundary

A wellness pattern is an observed relationship in available THRIVE data.

It should be presented as:

- a question;
- an observation;
- a participant-facing insight;
- an invitation to add context.

It should not be presented as a clinical conclusion.

## Spending and wellness cross-reference

### Purpose

Help the participant understand whether financial behavior and wellness observations move together over time.

### Candidate cross-references

- spending amount by self-reported stress level;
- discretionary spending after poor sleep;
- budget variance during low-confidence periods;
- goal completion during stable-routine periods;
- transaction frequency during high-stress days;
- support requests near unusual spending activity;
- planned versus unexpected spending by wellness state.

### Required safeguards

- preserve date and source;
- distinguish correlation from cause;
- use understandable language;
- allow participant context;
- avoid accusatory labels;
- show data gaps;
- show sample size or coverage;
- avoid conclusions when data is sparse;
- avoid hidden scoring.

### Example participant-facing wording

Preferred:

- “Spending was higher on several days when you reported high stress.”
- “Would you like to review those days?”
- “You recorded better sleep during weeks when more planned expenses stayed on track.”

Avoid:

- “Stress caused overspending.”
- “This behavior proves poor control.”
- “This indicates relapse.”
- “This shows incapacity.”

## Goals data model

### Candidate goal fields

- tenant or workspace identifier;
- supported-person identifier;
- creator type;
- goal title;
- participant reason;
- category;
- next step;
- target date;
- progress status;
- barrier;
- support requested;
- related budget item;
- related wellness routine;
- related program;
- completed timestamp;
- archive state.

### Goal states

- active;
- paused;
- completed;
- archived.

No hard delete during the MVP.

## Support request data model

### Candidate fields

- tenant or workspace identifier;
- supported-person identifier;
- category;
- participant message;
- related transaction;
- related budget item;
- related wellness entry;
- related goal;
- status;
- assigned support person when applicable;
- response summary;
- created timestamp;
- updated timestamp;
- completed or archived timestamp.

### Candidate statuses

- submitted;
- acknowledged;
- in progress;
- waiting for participant;
- completed;
- archived.

A THRIVE support request does not create authority for Trust Engine action.

## Provenance model

Every imported, entered, calculated, or externally referenced value should have enough provenance to answer:

- Who or what created this?
- When was it created?
- What participant does it belong to?
- What tenant or workspace does it belong to?
- What source record supports it?
- Has it been changed?
- Is it current, inactive, completed, or archived?
- Is it participant-entered, bank-observed, THRIVE-calculated, staff-entered, or externally authorized?

## Lifecycle and archive model

No hard deletes during the MVP.

Candidate lifecycle states should include, where appropriate:

- active;
- inactive;
- pending;
- reviewed;
- reconciled;
- completed;
- paused;
- superseded;
- archived.

Archive should preserve:

- original record;
- ownership;
- timestamps;
- source relationship;
- prior meaning;
- audit history.

## Import and ingestion model

### Candidate ingestion sequence

1. create or identify the participant financial account;
2. register the source document or import file;
3. create an import batch;
4. parse source transactions;
5. preserve raw source values;
6. calculate deduplication candidates;
7. reconcile duplicates, transfers, refunds, and pending-posted pairs;
8. normalize merchant names;
9. classify transactions;
10. invite participant explanation;
11. calculate monthly and annual analytics;
12. generate reports.

### Import batch states

- uploaded;
- parsing;
- parsed;
- needs review;
- reconciled;
- completed;
- failed;
- archived.

### Data quality measures

Candidate measures:

- statement coverage by month;
- duplicate candidate count;
- unresolved transfer count;
- uncategorized transaction count;
- unexplained transaction count;
- missing balance data;
- reconciliation completion percentage;
- participant review completion.

## Reports shell model

The Reports shell should be built before all report data exists.

It should be capable of showing:

- available report families;
- unavailable report families;
- missing-data reasons;
- partial-year coverage;
- reconciliation status;
- explanation status;
- date-range controls;
- participant-readable empty states.

This allows the product structure to exist while data ingestion fills the year.

## Trust Engine boundary

THRIVE does not report data to the Trust Engine.

The Trust Engine does not receive:

- participant wellness entries;
- transaction explanations;
- THRIVE goals;
- support requests;
- behavioral analytics;
- THRIVE reports;
- participant notes.

The Trust Engine's involvement is limited to:

- its own beneficiary portal;
- separately authorized read-only facts displayed for participant comparison later.

Any displayed Trust Engine fact must retain:

- source identity;
- date;
- authority context;
- read-only treatment;
- separation from THRIVE ownership.

## Candidate comparison labels

- Participant entered
- Bank observed
- THRIVE calculated
- Staff classified
- Trust Engine reported

These labels should remain visible wherever cross-source information is shown.

## Security and access concepts

Before implementation, the live schema and roles must be inspected.

Conceptually:

- participants access their own records;
- authorized staff access permitted participant records;
- tenant boundaries are enforced;
- financial source documents are protected;
- wellness entries are participant-scoped;
- reports inherit source access rules;
- internal diagnostics are not participant navigation;
- service-role use is not part of the participant application path.

## What should not be combined

Do not collapse the following into one field or record:

- raw merchant description and normalized merchant;
- bank category and participant category;
- bank observation and participant explanation;
- budget plan and actual transaction;
- wellness entry and derived pattern;
- pattern and conclusion;
- THRIVE record and Trust Engine record;
- participant note and staff note;
- active record and archived history.

## Required live inspection before schema proposal

Before any schema candidate is written, inspect:

- current Supabase tables;
- current RLS policies;
- current workspace and program ownership fields;
- current supported-person relationships;
- current Budget routes;
- current financial ingestion routes;
- current reconciliation route;
- any existing transaction, statement, account, budget, or wellness structures;
- archive and status conventions;
- existing test fixtures;
- current role and permission model.

The database is truth.

## Open design questions for the inspection gate

- Which current tables already represent accounts, statements, transactions, budgets, or categories?
- Is there already a durable import-batch concept?
- How are source documents currently referenced?
- What reconciliation logic already exists?
- How are duplicate and transfer candidates currently represented?
- Which participant write policies already exist?
- What staff roles already exist?
- Which fields currently support multi-tenant isolation?
- What archive conventions are already in use?
- Which analytical values should be calculated live versus stored as snapshots?
- How should wellness check-in prompts be configured per tenant or program?
- How should report snapshots be versioned?

## Frozen boundaries

This blueprint does not authorize:

- schema creation;
- SQL execution;
- RLS changes;
- Johnny insertion;
- Johnny authentication changes;
- bank import;
- statement parsing;
- transaction insertion;
- wellness entry insertion;
- Trust Engine synchronization;
- THRIVE-to-Trust reporting;
- service-role use;
- push;
- merge;
- deployment;
- hard deletion.

## Build status

Documentation-only pass.

No source build was required or run.

## Commit checkpoint

Starting checkpoint:

`d5989c4 Document permanent My Program v0.1 validation`

## Exact next gate

Place both approved blueprint documents in `docs/` and commit them together as documentation.

After that commit, perform a read-only inspection of:

- the live database schema;
- RLS and ownership relationships;
- existing Budget pages;
- financial ingestion pages;
- reconciliation pages;
- dashboard shell;
- current participant navigation;
- any wellness or goals code already present.

The inspection should produce a reconciliation document and the smallest safe Today, Reports shell, and Budget foundation candidate.

Do not execute SQL, import bank statements, insert Johnny, synchronize with the Trust Engine, or install production code during that inspection.
