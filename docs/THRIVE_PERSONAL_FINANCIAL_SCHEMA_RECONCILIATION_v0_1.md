# THRIVE Personal Financial Schema Reconciliation v0.1

## Status

Read-only schema and language reconciliation.

No database migration is authorized by this document.

## Governing Principle

THRIVE supports one person at a time.

Johnny’s personal financial record is independent from the Trust Engine.

The Trust Engine records trust truth.

THRIVE records Johnny’s personal support truth.

Neither system automatically controls, approves, rewrites, or classifies the other.

## Current Financial Ingestion Tables

### financial_sources

Classification: KEEP

Purpose:

- identifies the observational financial source;
- records institution, account mask, source mode, and status;
- does not establish trust authority or personal spending conclusions.

### financial_import_batches

Classification: KEEP WITH USER-FACING LANGUAGE REVIEW

Purpose:

- controls source ingestion lifecycle;
- verifies row count, source hash, statement period, and closure state;
- provides immutability after finalization.

The term `approved` currently means that the import batch is finalized and immutable.

It must not be presented as approval of Johnny’s spending, behavior, purpose, or personal decisions.

Preferred user-facing term:

- Finalized import

### staged_financial_transactions

Classification: KEEP

Purpose:

- preserves source evidence;
- stores raw and normalized values separately;
- preserves content-identical rows separately;
- does not establish purpose, intent, responsibility, or behavioral meaning.

### financial_transaction_reviews

Classification: KEEP TEMPORARILY, RECONCILE SEMANTICS

This table currently contains both neutral source-review concepts and trust-centric concepts.

Neutral concepts:

- review_status
- duplicate_classification
- review_notes
- reviewer identity
- review timestamp

Trust-centric concept:

- trust_match_status

## Field Classification

### review_status

Classification: KEEP

Preferred user-facing label:

- Personal review status

Permitted use:

- unreviewed;
- explanation recorded;
- source similarity reviewed;
- excluded with documented reason;
- personal support review completed.

Must not imply:

- trustee approval;
- behavioral judgment;
- recovery status;
- spending permission.

### duplicate_classification

Classification: KEEP

Preferred user-facing label:

- Source similarity status

Purpose:

- describes whether two source rows are content-identical or potentially duplicated;
- does not independently prove that a transaction occurred twice.

### trust_match_status

Classification: FUTURE SCHEMA RENAME

Current problem:

The name suggests that Johnny’s personal bank activity must be evaluated against the trust record.

That is not the governing model.

Recommended future replacement:

- support_context_status

Possible values:

- not_assessed
- no_context_recorded
- explanation_recorded
- supporting_evidence_recorded
- linked_external_fact
- unresolved
- not_applicable

Until migration:

- retain the database field for compatibility;
- do not expose the trust-centered name in the personal interface;
- do not create new `matched` values for Johnny’s personal reconciliation workflow;
- display neutral explanation or support-context language.

### matched_to_trust_record

Classification: DEPRECATE FROM PERSONAL SPINE

This review state should not be created by Johnny’s personal financial workflow.

A trust comparison, when legally authorized and operationally necessary, belongs in a separate controlled bridge or Trust Engine workflow.

## Batch Lifecycle Language

Current database values may remain temporarily:

- uploaded
- parsed
- validation_failed
- ready_for_review
- under_review
- approved
- rejected

Preferred personal-interface language:

- uploaded → Source received
- parsed → Source prepared
- validation_failed → Validation issue
- ready_for_review → Ready for personal review
- under_review → In personal review
- approved → Finalized import
- rejected → Import not accepted

The database lifecycle controls ingestion integrity only.

They do not approve or reject Johnny’s spending.

## Application Inventory

### January 2025 reconciliation page

Current classification:

- user-facing language corrected;
- read-only;
- no trust approval workflow;
- no behavioral conclusion;
- no personal explanation writes yet.

Legacy internal field still referenced:

- trust_match_status

This is temporarily acceptable only because the visible interface uses neutral language.

### Synthetic financial-ingestion test page

Classification:

- regression and lifecycle test only;
- synthetic data only;
- not production navigation;
- may retain legacy field names until schema migration;
- must not be treated as product language.

### January import confirmation page

Classification:

- requires later wording cleanup;
- still contains trust-stewardship and fiduciary language;
- historical import controls remain valid;
- visible framing should eventually be updated to personal financial source ingestion.

## External Trust Domain

The following concepts belong only to the separate Trust Engine or a controlled bridge:

- trustee approval;
- beneficiary obligation;
- authorized distribution;
- trust-ledger matching;
- fiduciary determination;
- trust record authority.

These concepts must not control Johnny’s personal bank-account records.

## Migration Direction

No migration is authorized yet.

Future work may:

1. add a neutral `support_context_status` field;
2. backfill neutral values where appropriate;
3. update application reads and writes;
4. stop writing `trust_match_status`;
5. remove or archive trust-specific constraints from the personal review table;
6. create a separate controlled bridge for authorized trust comparisons;
7. retire the legacy field only after application and data verification.

## Non-Goals

This reconciliation does not:

- alter database tables;
- rename columns;
- drop constraints;
- rewrite historical records;
- approve financial activity;
- create trust records;
- merge Johnny’s personal spine with the Trust Engine.

## Decision

The current ingestion spine remains usable.

The review layer requires semantic correction before write-enabled personal reconciliation is introduced.

The next step is to design the neutral personal-review model before any database migration.
