# THRIVE Read-Only Financial Spine Reconciliation v0.1

## Status

Read-only reconciliation record.

This document reconciles the approved THRIVE participant and data-model blueprints against the current repository evidence gathered from the application routes, documentation, SQL artifacts, and Supabase client references.

It does not authorize:

- code changes;
- SQL execution;
- schema changes;
- RLS changes;
- bank import;
- Johnny data creation or insertion;
- Trust Engine synchronization;
- service-role use;
- push;
- merge;
- deployment;
- deletion.

## Verified checkpoint

Current repository checkpoint:

`32a3961 Document approved THRIVE participant and data model blueprints`

Current known untracked items:

- `docs/RENEWING/`
- `docs/THRIVE_PARTICIPANT_EXPERIENCE_BLUEPRINT_v0_1.md`

The second item is the earlier unapproved draft. It remains outside this reconciliation and should not be deleted during the current gate.

## Evidence basis

This reconciliation is grounded in the read-only repository inventory that identified:

### Participant-facing and test routes

- `/budget`
- `/budget-test`
- `/financial-ingestion-january-2025`
- `/financial-ingestion-january-2025/reconciliation`
- `/financial-ingestion-test`
- `/my-program`
- workspace, program, supported-person, and RLS test routes

### Financial table references

- `budget_categories`
- `financial_sources`
- `financial_import_batches`
- `staged_financial_transactions`
- `financial_transaction_reviews`

### Financial RPC and action references

- `create_budget_category_for_program`
- January 2025 ingestion actions
- atomic import function candidates and installed artifacts
- reconciliation reads across import batches, sources, staged transactions, and reviews

### Financial schema and policy artifacts

- `THRIVE_PERSONAL_FINANCIAL_SCHEMA_RECONCILIATION_v0_1.md`
- `THRIVE_MONTHLY_FINANCIAL_INGESTION_SCHEMA_REVIEW_v0_2.md`
- `THRIVE_MONTHLY_FINANCIAL_INGESTION_SCHEMA_DRAFT_v0_2.sql`
- `THRIVE_MONTHLY_FINANCIAL_INGESTION_SCHEMA_DRAFT_v0_3.sql`
- monthly ingestion RLS lifecycle test plan
- January atomic import candidates and install artifacts
- budget category schema and RLS drafts

## Reconciliation rule

Repository evidence and SQL artifacts are not treated as proof of current live database state.

This document separates:

1. source-confirmed application behavior;
2. source-confirmed expected database objects;
3. installed-state indicators;
4. live-state unknowns requiring direct database inspection.

The database remains truth.

# 1. Existing financial architecture

## 1.1 Budget category layer

### Confirmed source evidence

The application contains:

- `/budget`
- `/budget-test`
- `BudgetCategoriesDashboardCard`
- reads from `budget_categories`
- an RPC call to `create_budget_category_for_program`

### Reconciled interpretation

The current participant Budget experience is not yet a full budget ledger.

It is primarily a budget-category layer.

It can support:

- category display;
- program-scoped category structure;
- future classification;
- future planning labels.

It does not yet prove support for:

- monthly budget periods;
- expected income;
- recurring bills;
- planned category allocations;
- savings plans;
- debt plans;
- planned versus actual totals;
- annual participant reports.

### Classification

**Useful foundation needing evolution**

The existing route and table should be preserved and evaluated for reuse.

## 1.2 Financial source layer

### Confirmed source evidence

Application and schema artifacts reference:

`financial_sources`

The January reconciliation route and general financial-ingestion test route read or write this object.

### Reconciled purpose

This layer appears intended to identify the origin of imported financial information.

Candidate responsibilities include:

- source institution;
- source account or statement origin;
- workspace and program scope;
- source lifecycle;
- source metadata.

### Live-state confidence

The application source strongly indicates this table is expected and has been used in the ingestion workflow.

However, this reconciliation has not directly inspected the live table definition, row counts, constraints, indexes, or policies.

### Classification

**Existing ingestion foundation, live definition still requires inspection**

## 1.3 Import batch layer

### Confirmed source evidence

Application and schema artifacts reference:

`financial_import_batches`

The January reconciliation route reads import batches.

The general financial-ingestion test route appears to exercise creation and lifecycle updates for import batches.

Atomic January import function artifacts also indicate a controlled batch-based ingestion model.

### Reconciled purpose

This is the correct reusable container for monthly and full-year ingestion.

A batch may represent:

- one statement;
- one month;
- one account export;
- one controlled import operation;
- one parsing and reconciliation lifecycle.

### Reuse conclusion

The year-long financial history should reuse the batch concept rather than create a separate January, February, or per-month schema.

January 2025 should become one batch in a reusable ingestion sequence.

### Classification

**Strong reusable foundation**

## 1.4 Staged transaction layer

### Confirmed source evidence

Application and schema artifacts reference:

`staged_financial_transactions`

Both the January reconciliation route and the general ingestion test route read this object.

The ingestion test route appears to perform multiple transaction updates and lifecycle operations.

### Reconciled purpose

This layer appears to preserve imported transaction rows before final participant-facing interpretation.

Likely responsibilities include:

- imported date;
- imported description;
- imported amount;
- source relationship;
- batch relationship;
- import status;
- review status;
- duplicate or reconciliation state.

### Alignment with approved blueprint

This layer maps well to the approved source-evidence and reconciliation model if original source values remain preserved.

### Key verification still required

The live schema must show whether:

- raw source values are immutable or preserved;
- normalized merchant values are separate;
- participant explanations are separate;
- duplicates are preserved rather than deleted;
- archive and lifecycle states exist;
- supported-person ownership exists directly or can be resolved safely.

### Classification

**Core ingestion spine, pending live structural verification**

## 1.5 Transaction review layer

### Confirmed source evidence

Application and schema artifacts reference:

`financial_transaction_reviews`

The January reconciliation route reads review records.

The general ingestion test route appears to create and update reviews.

### Reconciled purpose

This layer appears intended to hold review or explanation information distinct from the imported source transaction.

That separation aligns with the approved model:

- bank observation;
- classification;
- participant explanation;
- staff review;
- analytics

should not be collapsed into one record.

### Open question

The exact meaning of a review is not yet confirmed.

It may currently represent:

- administrator review;
- reconciliation decision;
- classification;
- participant explanation;
- or a combination.

The live table and route fields must be inspected before it is reused as the participant explanation layer.

### Classification

**Potentially reusable, semantic ownership unresolved**

# 2. January 2025 ingestion workflow

## Confirmed source evidence

The repository contains:

- `/financial-ingestion-january-2025`
- `/financial-ingestion-january-2025/reconciliation`
- January-specific actions
- multiple atomic import function candidates
- atomic import installation artifacts
- an atomic rollback test

## Reconciled conclusion

The January 2025 workflow is not disposable test fluff.

It appears to prove several important capabilities:

- scoped workspace and program selection;
- controlled source and batch creation;
- staged transaction ingestion;
- reconciliation review;
- atomic import design;
- rollback testing;
- lifecycle handling.

## Architectural limitation

The route name and likely fixed payload are month-specific.

The permanent application should not create twelve separate route families such as:

- January ingestion;
- February ingestion;
- March ingestion.

Instead, the reusable model should accept:

- participant;
- account or source;
- statement period;
- import file;
- batch;
- transaction set.

January 2025 should be retained as historical validation evidence and possibly as one imported batch, not as the permanent architecture.

## Classification

**Validated prototype requiring generalization**

# 3. General financial-ingestion test route

## Confirmed source evidence

The general ingestion test route references:

- workspaces;
- programs;
- financial sources;
- import batches;
- staged transactions;
- transaction reviews.

It appears to exercise multiple inserts, updates, review operations, and lifecycle states.

## Reconciled purpose

This route is the broadest available manual diagnostic harness for the ingestion spine.

It is useful for validating:

- object visibility;
- RLS behavior;
- allowed writes;
- lifecycle transitions;
- review records;
- batch completion behavior.

## Product boundary

It is not the participant experience.

It should remain:

- internal;
- outside participant navigation;
- preserved during MVP;
- eventually restricted or archived after automated coverage exists.

## Classification

**Internal testing scaffolding with high diagnostic value**

# 4. Current RLS posture

## Confirmed source evidence

The financial schema drafts contain admin-centered policy names for:

- financial sources;
- import batches;
- staged transactions;
- transaction reviews.

Examples include SELECT, INSERT, and UPDATE policies for workspace administrators.

## Reconciled conclusion

The ingestion system was designed first as an authorized administrative workflow.

That is appropriate for:

- source loading;
- statement import;
- reconciliation;
- normalization;
- controlled corrections.

It does not yet prove a participant-safe read path.

## Missing participant access path

Before Johnny or another supported person can see financial history, the system needs a separately reviewed read path that resolves:

- authenticated supported person;
- supported-person ownership of the financial account or imported data;
- workspace or tenant boundary;
- participant-safe fields;
- source-document privacy;
- exclusion of administrative-only metadata.

## Important boundary

Participant access should not be created by granting broad workspace membership.

It should use supported-person self identity and exact ownership relationships.

## Classification

**Administrative RLS foundation exists; participant financial RLS remains unverified or missing**

# 5. Multi-tenant readiness

## Confirmed foundation

The current system already uses:

- workspaces;
- programs;
- supported people;
- program participants;
- authenticated identity links.

The financial ingestion routes also resolve workspace and program context.

## Reconciled conclusion

The project has a multi-tenant skeleton.

However, full financial multi-tenant safety depends on whether each financial record can be tied to:

- one workspace or tenant;
- one supported person;
- one account or source;
- one import batch.

## Critical live-schema question

The current financial objects may be program-scoped without direct supported-person ownership.

If so, a program containing multiple supported people could not safely use only `program_id` to determine participant access.

The live schema must be inspected for:

- `supported_person_id`;
- account ownership;
- source ownership;
- participant-to-source relationship;
- or another exact ownership bridge.

## Classification

**Tenant skeleton present; participant financial ownership must be verified**

# 6. Approved financial-layer mapping

The existing spine maps to the approved blueprint as follows:

| Approved layer | Current repository evidence | Reconciliation |
|---|---|---|
| Source evidence | `financial_sources`, import batch metadata, staged transactions | Present in concept |
| Reconciliation | staged transaction lifecycle and review route | Present in concept |
| Classification | `budget_categories`, review fields, possible transaction fields | Partial and unresolved |
| Participant explanation | possible `financial_transaction_reviews` reuse | Not yet confirmed |
| Budget planning | `/budget` and categories | Incomplete |
| Analytics | roadmap and report concepts | Not yet implemented as participant product |
| Reports | approved blueprint only | Shell still missing |

# 7. Missing durable product structures

Based on current repository evidence, the following are not yet proven as complete live structures:

## 7.1 Participant financial account ownership

Needed to answer:

- Which account belongs to which supported person?
- Can one participant see only their own imported transactions?
- How are multiple accounts handled?
- Can one tenant contain multiple participants safely?

## 7.2 Budget period and plan

Needed for:

- monthly expected income;
- planned recurring bills;
- flexible spending;
- savings;
- debt;
- category allocation;
- planned versus actual calculations;
- rollover.

## 7.3 Participant explanation ownership

Needed to separate:

- bank observation;
- staff review;
- participant explanation;
- support request.

## 7.4 Merchant normalization

Needed to preserve raw source description while presenting understandable merchant names.

## 7.5 Reconciliation relationships

Needed for:

- duplicate links;
- transfer matching;
- refund matching;
- reversal matching;
- pending-to-posted matching.

## 7.6 Report shell

Needed now, even before all data exists, for:

- monthly reports;
- annual history;
- statement coverage;
- missing-month notices;
- reconciliation completion;
- explanation completion;
- future wellness cross-reference.

## 7.7 Wellness and goals structures

No durable live implementation was confirmed in the repository inventory for:

- wellness entries;
- routines;
- goals;
- support requests;
- wellness-spending analytics.

# 8. What can be built without new financial tables

Subject to exact source inspection and participant-safe access, the following UI candidates may be possible without adding tables:

## Today shell

May initially display:

- participant identity;
- current program;
- links to Budget, Wellness, Goals, Support, and Reports;
- data coverage notices;
- import status summaries if participant-safe fields already exist.

## Reports shell

May initially display:

- report families;
- month and year controls;
- data unavailable states;
- statement coverage placeholders;
- reconciliation status;
- explanation status;
- links back to Budget or transaction review.

## Budget foundation

May initially display:

- current categories;
- empty states for monthly planning;
- import coverage;
- participant-safe transaction counts;
- clear labels separating observed data from planned data.

No new writes should be installed merely to make a visually complete shell.

# 9. Reuse, evolve, archive matrix

## Reuse

- workspaces;
- programs;
- supported people;
- program participants;
- authenticated self identity;
- budget categories;
- financial sources;
- import batches;
- staged transactions;
- transaction reviews where semantics fit;
- atomic import pattern;
- reconciliation route logic.

## Evolve

- `/budget` into a full participant Budget experience;
- January-specific ingestion into a reusable monthly importer;
- financial review semantics into clearly separated reconciliation and participant explanation;
- admin-only reads into exact participant-safe reads;
- reports from blueprint into a real shell;
- dashboard into Today.

## Keep internal

- `/budget-test`
- `/financial-ingestion-test`
- January implementation and validation harnesses;
- supported-person and RLS probes;
- workspace and program test pages.

## Archive later

- superseded documentation drafts;
- old test routes after automated coverage and stable product use;
- month-specific prototypes after reusable workflows are proven.

No hard delete.

# 10. Live database unknowns

The following remain unverified in this gate:

- exact live columns;
- exact live constraints;
- exact live indexes;
- exact live functions;
- exact live triggers;
- exact installed policy definitions;
- exact row counts;
- exact archive and status values;
- whether v0.2 or v0.3 draft matches live state;
- whether January atomic import v0.4 is currently installed;
- whether financial records have `supported_person_id`;
- whether participant financial SELECT policies exist;
- whether transaction review records are participant explanations or admin reviews.

No schema candidate should be written until these are inspected directly.

# 11. Candidate live-inspection requirements

The next live read-only inspection should return:

## Tables and columns

For:

- `budget_categories`
- `financial_sources`
- `financial_import_batches`
- `staged_financial_transactions`
- `financial_transaction_reviews`

## Constraints and indexes

Including:

- primary keys;
- foreign keys;
- unique constraints;
- check constraints;
- indexes;
- status checks;
- ownership fields.

## Functions

Including:

- `create_budget_category_for_program`
- January atomic import function or functions;
- any helper used by financial RLS.

## Policies

All policies on the five financial tables, including:

- command;
- roles;
- permissive or restrictive mode;
- USING expression;
- WITH CHECK expression.

## Row-level ownership evidence

Read-only counts grouped by:

- workspace;
- program;
- supported person when present;
- import batch status;
- source status;
- review status.

No sensitive transaction values are required for the structural inspection.

# 12. Reconciliation conclusion

The project already has a real financial ingestion spine.

It is more than a set of acknowledgment cards and more than a synthetic experiment.

The strongest existing foundation is:

`financial source -> import batch -> staged transaction -> review/reconciliation`

The largest product gaps are:

- exact supported-person financial ownership;
- participant-safe financial RLS;
- monthly budget planning;
- participant explanation separation;
- reusable multi-month ingestion;
- Reports shell;
- Wellness, Goals, and Support structures.

The correct next move is not a rebuild.

The correct next move is a direct live-schema reconciliation followed by the smallest safe candidate that reuses the existing spine.

## Build status

Documentation-only pass.

No source build was required or run.

## Git status expectation

No repository file has been changed by creation of this downloadable candidate.

Current repository status should remain:

- `docs/RENEWING/` untracked;
- earlier unapproved participant blueprint draft untracked.

## Commit checkpoint

Starting checkpoint:

`32a3961 Document approved THRIVE participant and data model blueprints`

## Exact next gate

Run a read-only live Supabase structural inspection for the five financial tables, their functions, constraints, indexes, and policies.

Then update this reconciliation with:

- confirmed live state;
- differences from repository drafts;
- participant ownership findings;
- the smallest Today, Reports shell, and Budget candidate.

Do not execute schema SQL, import statements, insert Johnny, create wellness data, create participant financial policies, synchronize with the Trust Engine, or install application code during that inspection.
