# THRIVE Financial Spine Confirmed Live-State Amendment v0.1

## Status

Confirmed live-state documentation amendment.

This amendment updates:

`docs/THRIVE_READ_ONLY_FINANCIAL_SPINE_RECONCILIATION_v0_1.md`

with direct read-only evidence from the live Supabase database.

It does not authorize:

- schema changes;
- RLS changes;
- function installation;
- bank import;
- participant financial access;
- Johnny data creation;
- Trust Engine synchronization;
- service-role use;
- application installation;
- push;
- merge;
- deployment;
- deletion.

## Repository checkpoint

Starting repository checkpoint:

`bbe9cc1 Document read-only THRIVE financial spine reconciliation`

## Confirmed live objects

The following live tables were inspected:

- `budget_categories`
- `financial_sources`
- `financial_import_batches`
- `staged_financial_transactions`
- `financial_transaction_reviews`

The following installed functions were inspected:

- `create_budget_category_for_program`
- `import_january_2025_financial_batch`
- `protect_financial_import_batch_lifecycle`

## Executive conclusion

The live database contains a strong administrative financial-ingestion spine.

Its core chain is:

`financial source -> import batch -> staged transaction -> administrative review`

The chain is protected through composite workspace, program, source, batch, and transaction relationships.

The database already supports:

- source identity;
- source account masking;
- historical and current source modes;
- statement periods;
- file SHA-256 duplicate protection;
- source-row identity;
- source-content fingerprints;
- raw imported values;
- normalized transaction values;
- parsing lifecycle;
- transaction lifecycle;
- batch review and approval lifecycle;
- duplicate review;
- separately authorized Trust comparison metadata;
- Budget category planning, spending, and remaining amounts.

The live system does not currently provide:

- supported-person ownership of financial sources;
- participant-safe financial RLS;
- participant transaction explanations;
- participant communication or disbursement requests;
- reusable generic monthly import;
- full participant Budget periods;
- Today or Reports product shells.

A broad rebuild is not warranted.

The smallest future structural direction remains an exact supported-person ownership bridge at or immediately above the financial-source layer.

# 1. Confirmed financial ownership state

## 1.1 Financial tables are program-scoped

The inspected financial tables use:

- `workspace_id`
- `program_id`

The source, batch, transaction, and review structures do not contain:

- `supported_person_id`
- `participant_id`

## 1.2 Current ownership implication

The database can identify:

- the workspace;
- the program;
- the source;
- the import batch;
- the staged transaction;
- the administrative review.

It cannot directly determine which supported person owns the financial source.

This prevents safe participant access when multiple supported people may participate in the same program.

## 1.3 Confirmed RLS posture

Live policies confirmed:

### Budget categories

- SELECT for workspace members when the program belongs to the workspace;
- INSERT for workspace admins;
- UPDATE for workspace admins.

### Financial sources

- SELECT for workspace admins;
- INSERT for workspace admins;
- UPDATE for workspace admins.

### Financial import batches

- SELECT for workspace admins;
- INSERT for workspace admins;
- UPDATE for workspace admins.

### Staged transactions

- SELECT for workspace admins;
- INSERT for workspace admins;
- UPDATE for workspace admins.

### Financial transaction reviews

- SELECT for workspace admins;
- INSERT for workspace admins;
- UPDATE for workspace admins.

There is no participant self-read policy on the financial spine.

## 1.4 Participant access conclusion

A participant policy must not be added by program membership alone.

Safe participant access requires an exact relationship between:

- authenticated user;
- active supported person;
- owned financial source or account;
- downstream batch and transaction records.

# 2. Confirmed relationship integrity

## 2.1 Financial source scope

`financial_sources` enforces a unique identity scope across:

- `id`
- `workspace_id`
- `program_id`

## 2.2 Import batch scope

`financial_import_batches` references the exact source scope through:

- `financial_source_id`
- `workspace_id`
- `program_id`

It also exposes a composite unique scope used downstream by staged transactions.

## 2.3 Staged transaction scope

`staged_financial_transactions` references the exact batch scope through:

- `import_batch_id`
- `workspace_id`
- `program_id`
- `financial_source_id`

## 2.4 Administrative review scope

`financial_transaction_reviews` references the exact transaction scope through:

- `staged_transaction_id`
- `workspace_id`
- `program_id`

It permits only one review row per staged transaction.

## 2.5 Structural conclusion

The live chain prevents accidental cross-workspace, cross-program, cross-source, cross-batch, and cross-transaction relationships.

That makes source-level participant ownership a credible minimal bridge because downstream records already inherit exact source scope.

# 3. Confirmed financial-source model

Live source fields include:

- source name;
- institution name;
- source type;
- account mask;
- source mode;
- status;
- creator;
- timestamps.

Allowed source types include:

- `bank_account`
- `manual_record`
- `trust_record`
- `other`

Allowed source modes include:

- `historical`
- `current_manual`
- `current_csv`
- `future_bank_sync`

Allowed source states include:

- `active`
- `inactive`
- `archived`

## 3.1 Live source population

Two active historical bank-account sources currently exist:

### Source population A

- one active historical bank account;
- workspace `b0cad5e3-8b0b-40aa-adf8-9f75f6a092b5`;
- program `477ccd11-510f-4d85-8367-be9020f219f5`.

### Source population B

- one active historical bank account;
- workspace `d1cb9168-b0cd-42d0-8745-024c3e421c11`;
- program `f67f14a2-6666-44d6-99d4-dbb2678a2863`.

## 3.2 Source-level ownership finding

Neither source is directly linked to a supported person in the inspected schema.

No participant-safe conclusion may be inferred from program scope alone.

# 4. Confirmed import-batch model

Live batch fields and checks support:

- statement-period start and end;
- source filename;
- source-file SHA-256;
- declared source-row count;
- import status;
- historical or current boundary;
- source lifecycle;
- uploader;
- reviewer;
- approver;
- rejection reason;
- timestamps.

Allowed import statuses include:

- `uploaded`
- `parsed`
- `validation_failed`
- `ready_for_review`
- `under_review`
- `approved`
- `rejected`

Allowed source lifecycle values include:

- `posted`
- `pending_and_posted`
- `unknown`

The database enforces:

- valid statement date ranges;
- positive source-row counts;
- valid SHA-256 format;
- consistent review state;
- consistent approval state;
- consistent rejection state;
- one file hash per workspace, program, and source.

## 4.1 Live batch population

### Batch A

- workspace `b0cad5e3-8b0b-40aa-adf8-9f75f6a092b5`;
- program `477ccd11-510f-4d85-8367-be9020f219f5`;
- source `ea9975f4-4c25-4ae3-b97d-2ce5f0ea154a`;
- status `approved`;
- boundary `historical`;
- lifecycle `posted`;
- statement period `2099-01-01` through `2099-01-31`;
- one batch;
- two declared source rows.

The 2099 period strongly suggests controlled synthetic or validation data, but that classification must remain an inference unless separately documented.

### Batch B

- workspace `d1cb9168-b0cd-42d0-8745-024c3e421c11`;
- program `f67f14a2-6666-44d6-99d4-dbb2678a2863`;
- source `37e6d930-8158-4899-84cf-a14e281d0bf4`;
- status `ready_for_review`;
- boundary `historical`;
- lifecycle `posted`;
- statement period `2025-01-01` through `2025-01-31`;
- one batch;
- 85 declared source rows.

## 4.2 Full-year readiness

The schema can represent multiple statement periods and multiple batches.

The database is not structurally limited to January.

The currently installed import function is limited to January.

# 5. Confirmed staged-transaction model

The live transaction structure preserves both raw and normalized fields.

## 5.1 Required raw evidence

The following raw values are protected by nonblank checks:

- raw posted date;
- raw transaction date;
- raw transaction type;
- raw category;
- raw subcategory;
- raw full description;
- raw amount;
- raw daily posted balance.

## 5.2 Separate normalized values

Normalized values include:

- posted date;
- transaction date;
- transaction type;
- check serial;
- merchant name;
- category;
- subcategory;
- amount;
- daily posted balance.

A parsed row must satisfy normalized completeness requirements.

## 5.3 Parsing lifecycle

Allowed parse statuses:

- `unparsed`
- `parsed`
- `needs_review`
- `rejected`

Parse errors are required for rows needing review or rejection and prohibited for unparsed or parsed rows.

## 5.4 Transaction lifecycle

Allowed transaction lifecycle values:

- `pending`
- `posted`
- `reversed`
- `removed`
- `unknown`

`removed` is a lifecycle state and does not establish that a database row was hard-deleted.

## 5.5 Source-row identity protections

The database requires:

- a SHA-256 content fingerprint;
- a source-row identity formatted as SHA-256 plus row number;
- consistency between the row number embedded in the identity and `source_row_number`;
- positive row numbers;
- uniqueness by batch and source-row identity;
- uniqueness by batch and source-row number.

## 5.6 Live staged-transaction population

### Batch A

- two parsed transactions;
- lifecycle `posted`.

### Batch B

- 85 parsed transactions;
- lifecycle `posted`.

Total staged transactions represented by the supplied live counts:

`87`

No transaction amounts, merchants, descriptions, or notes were required for this structural reconciliation.

# 6. Confirmed administrative-review model

The review table contains:

- review status;
- duplicate classification;
- Trust match status;
- Trust record reference;
- exclusion reason;
- review notes;
- reviewer identity;
- reviewer timestamp.

Allowed review statuses include:

- `unreviewed`
- `routine_repeated_activity`
- `potential_duplicate`
- `not_duplicate`
- `confirmed_duplicate`
- `needs_information`
- `matched_to_trust_record`
- `excluded_with_reason`

Allowed duplicate classifications include:

- `not_assessed`
- `content_identical`
- `potential_cross_source_match`
- `not_duplicate`
- `confirmed_duplicate`

Allowed Trust match states include:

- `not_assessed`
- `unmatched`
- `potential_match`
- `matched`
- `not_applicable`

The table enforces reviewer completion for non-unreviewed states and allows only one review per staged transaction.

## 6.1 Live review population

One review currently exists:

- workspace `b0cad5e3-8b0b-40aa-adf8-9f75f6a092b5`;
- program `477ccd11-510f-4d85-8367-be9020f219f5`;
- review status `routine_repeated_activity`;
- duplicate classification `content_identical`;
- Trust match status `not_applicable`;
- review count `1`.

## 6.2 Review-model conclusion

This is an administrative reconciliation object.

It should not be reused as:

- participant explanation;
- participant message;
- disbursement request;
- medical-bill request;
- beneficiary communication thread.

Those are separate ownership and communication concerns.

# 7. Confirmed Trust boundary

## 7.1 Current live metadata

The review model contains constrained Trust comparison fields.

These fields may support a later separately authorized comparison between:

- what the Trust reports;
- what the participant reports or understands;
- what THRIVE independently observes or calculates.

## 7.2 Frozen system boundary

THRIVE does not send Budget, Wellness, Goals, or participant explanations into the Trust Engine.

The Trust Engine remains independent.

The later beneficiary-facing comparison may display separately sourced information without merging:

- ownership;
- authority;
- approvals;
- fiduciary decisions;
- participant decisions.

## 7.3 Later communication direction

A future participant-facing Trust area may permit:

- viewing what the Trust paid or recorded;
- comparing that information with participant records;
- requesting an additional disbursement;
- reporting a medical bill or other need;
- sending context or a message;
- viewing a Trust response or outcome.

That future communication requires its own request and message structure.

It should not be inserted into `financial_transaction_reviews.review_notes`.

## 7.4 Current disposition

Trust comparison fields should remain intact and dormant for ordinary Budget and Wellness flows.

No Trust integration change is authorized by this amendment.

# 8. Confirmed Budget model

Live Budget category checks confirm:

- category name;
- category type;
- planned amount;
- spent amount;
- remaining amount;
- sort order;
- active state;
- creator;
- timestamps.

Allowed category types:

- `protected`
- `flexible`
- `support`
- `reserve`

Planned, spent, and remaining amounts must be nonnegative.

## 8.1 Installed Budget function

`create_budget_category_for_program` is installed as:

- `SECURITY DEFINER`;
- volatile;
- authenticated-user dependent;
- workspace-admin restricted;
- program-to-workspace validated.

It accepts:

- workspace;
- program;
- category name;
- category type;
- planned amount;
- spent amount;
- sort order.

It calculates:

`remaining_amount = max(planned_amount - spent_amount, 0)`

It inserts an active category and records the authenticated actor as creator.

## 8.2 Live Budget population

The inspected live program contains four active categories:

### Flexible

- category count: 1;
- planned: $300;
- spent: $210;
- remaining: $90.

### Protected

- category count: 2;
- planned: $1,600;
- spent: $1,325;
- remaining: $275.

### Reserve

- category count: 1;
- planned: $500;
- spent: $0;
- remaining: $500.

### Totals

- categories: 4;
- planned: $2,400;
- spent: $1,535;
- remaining: $865.

No active `support` category appeared in the supplied count.

## 8.3 Budget interpretation limits

The live data does not prove:

- which supported person owns the budget;
- the applicable budget month;
- whether spent amounts are transaction-derived;
- whether amounts are manually maintained;
- whether the Budget values reconcile to the 87 staged transactions;
- whether the populated Budget is synthetic or operational.

## 8.4 Budget conclusion

The current Budget table is more than a category dictionary.

It is an early program-scoped budget summary.

It remains incomplete for a durable participant Budget because it lacks:

- exact supported-person ownership;
- budget period;
- income plan;
- participant explanation;
- account linkage;
- historical budget versions;
- savings and debt structures;
- rollover treatment.

# 9. Confirmed installed January importer

## 9.1 Function identity

Installed function:

`import_january_2025_financial_batch`

It is:

- `SECURITY DEFINER`;
- volatile;
- authenticated-user dependent;
- workspace-admin restricted;
- atomic inside the caller transaction.

## 9.2 Hard-locked controls

The function is locked to one:

- workspace UUID;
- program UUID;
- filename;
- file SHA-256;
- statement period;
- expected row count;
- exact source-row number range;
- expected normalized amount total;
- account mask.

The function requires:

- 85 JSON rows;
- original source rows 2 through 86 exactly once;
- a specific January 2025 filename;
- a specific SHA-256;
- statement dates from January 1 through January 31, 2025;
- a fixed normalized total of `-12570.54`;
- account ending `2847`.

## 9.3 Atomic behavior

The function:

1. verifies authentication;
2. verifies exact locked workspace and program;
3. verifies workspace-admin access;
4. verifies program scope;
5. obtains an advisory transaction lock;
6. validates filename, hash, statement period, JSON type, row count, and source-row coverage;
7. rejects a duplicate file hash;
8. finds or creates the exact bank source;
9. creates one import batch;
10. inserts staged transactions;
11. verifies inserted row count;
12. verifies normalized amount total;
13. advances the batch to `ready_for_review`;
14. returns source ID, batch ID, inserted count, and status.

## 9.4 Importer conclusion

This function is strong proof of a controlled atomic historical import.

It is not a reusable monthly importer.

It should be preserved as:

- January 2025 import evidence;
- atomic workflow proof;
- rollback and validation reference.

A generic importer should not be created by merely removing validation controls.

It requires a separately reviewed design that preserves:

- exact source evidence;
- file uniqueness;
- statement-period validation;
- row identity;
- atomic rollback;
- declared versus inserted row verification;
- reconciliation status.

# 10. Confirmed lifecycle protection trigger

Installed function:

`protect_financial_import_batch_lifecycle`

This trigger function prevents changes to batch source identity and lineage, including:

- workspace;
- program;
- source;
- statement period;
- filename;
- file hash;
- row count;
- data boundary;
- source lifecycle;
- uploader;
- upload timestamp;
- creation timestamp.

It also makes approved and rejected batches immutable.

## 10.1 Lifecycle conclusion

The database correctly treats source identity and lineage as durable evidence.

Future participant-facing work should read from this evidence rather than rewrite it.

# 11. Reconciliation against approved data model

| Approved layer | Confirmed live state | Result |
|---|---|---|
| Source evidence | Source, batch, raw transaction fields, hashes | Strong |
| Reconciliation | Batch lifecycle, parsing, duplicate review | Strong administrative foundation |
| Classification | Normalized merchant/category fields | Present |
| Participant explanation | No separate participant-owned structure | Missing |
| Budget planning | Program-scoped categories and amounts | Partial |
| Analytics | No confirmed participant analytics structure | Missing |
| Reports | Statement periods and statuses available | Product shell missing |
| Wellness | No confirmed durable live structure in this pass | Missing |
| Trust comparison | Administrative metadata exists | Separately authorized future use only |
| Communication | No beneficiary request/message structure | Missing |

# 12. Smallest future candidate direction

This amendment does not approve SQL.

The smallest review-only structural candidate should examine:

## 12.1 Financial-source ownership

Prefer exact ownership at or immediately above `financial_sources`.

Candidate questions:

- Can one source have exactly one supported-person owner?
- Can one supported person have multiple sources?
- Can ownership change without rewriting historical evidence?
- Should archived ownership history be preserved?
- Should ownership be direct or represented by a link table?

## 12.2 Participant-safe financial reads

Participant reads should resolve:

- authenticated user;
- active supported-person identity;
- active or historically valid source ownership;
- downstream batch and transaction scope;
- participant-safe fields only.

Existing admin policies should remain intact.

## 12.3 Participant explanation

Create a separate conceptual structure for:

- participant explanation;
- participant-selected reason or category;
- participant note;
- explanation status;
- archive state;
- provenance.

Do not overload administrative review.

## 12.4 Budget period

A durable Budget candidate must address:

- supported-person ownership;
- monthly period;
- planned income;
- planned allocations;
- actual transaction linkage;
- version or archive history.

## 12.5 Today and Reports shells

The earliest product candidate may reuse confirmed read-only facts:

### Today

- program identity;
- Budget summary;
- import coverage notice;
- links to Budget, Wellness, Goals, Support, Reports.

### Reports

- statement-period coverage;
- source count;
- batch statuses;
- transaction counts;
- review counts;
- Budget totals;
- explicit unavailable states for unsupported analytics.

No participant financial write should be bundled into these shells.

# 13. Remaining unknowns

The following remain unresolved:

- exact row values and provenance of the 2099 batch;
- whether the 2099 data is formally documented as synthetic;
- whether Budget spent amounts are manually entered or transaction-derived;
- exact trigger attachment names and timing;
- whether additional nonmatching financial functions exist outside the inspection search pattern;
- whether future account ownership should be direct or link-based;
- whether source ownership may change over time;
- how monthly Budget history should be versioned;
- participant communication and Trust request workflow.

These unknowns do not block a read-only product-shell candidate.

They do block production participant financial access.

# 14. Frozen boundaries

The following remain frozen:

- no schema execution;
- no participant ownership installation;
- no participant financial policy installation;
- no generic importer installation;
- no bank import;
- no Johnny insertion;
- no participant explanation table;
- no Wellness table;
- no Trust Engine synchronization;
- no beneficiary communication workflow;
- no service-role use;
- no push;
- no merge;
- no deployment;
- no deletion.

# 15. Build status

Documentation-only pass.

No application build was required or run.

# 16. Git status expectation

Before this amendment is placed in the repository, no tracked repository file has been modified by this pass.

Expected existing untracked items remain:

- `docs/RENEWING/`
- `docs/THRIVE_PARTICIPANT_EXPERIENCE_BLUEPRINT_v0_1.md`

# 17. Commit checkpoint

Starting checkpoint:

`bbe9cc1 Document read-only THRIVE financial spine reconciliation`

# 18. Exact next gate

Review and commit this confirmed live-state amendment.

After that, prepare a review-only candidate package containing:

1. a supported-person financial-source ownership model candidate;
2. a participant-safe financial read model candidate;
3. a separate participant transaction explanation model candidate;
4. a Today shell candidate;
5. a Reports shell candidate;
6. a Budget period and planning model candidate.

Do not execute SQL or install application code during candidate preparation.
