# THRIVE January 2025 Dry-Run Validation Report

## Status

- Validation status: **PASS**
- Generated at: 2026-07-25T00:32:14.877593+00:00
- Source period: January 2025
- Database writes: **0**
- Supabase access: **None**
- Real source file committed to Git: **No**
- Real staging previews committed to Git: **No**

## Governing Rule

The bank feed supplies observational data. The reviewed trust record remains authoritative.

## Source Identity

- Source file: `acct_2847_01_01_2025_to_01_31_2025.csv`
- Local source location: `docs/source_samples/january_2025/acct_2847_01_01_2025_to_01_31_2025.csv`
- Masked account: ending in `2847`
- SHA-256: `9c993baf1e7558de40215ac7802c23c1fbee04f7ca80e5405366c1043a6b951a`
- Reconciled SHA-256 match: `PASS`

## Structural Validation

| Metric | Result |
|---|---:|
| Expected columns | 10 |
| Observed columns | 10 |
| Expected transaction rows | 85 |
| Observed transaction rows | 85 |
| Rows accepted for proposed staging | 85 |
| Rows rejected | 0 |
| Rows silently removed | 0 |
| Parse or validation issues | 0 |

## Date Validation

- Posted-date range: `2025-01-02` through `2025-01-31`
- Transaction-date range: `2024-12-31` through `2025-01-31`
- Monthly assignment rule: `Posted Date`
- Required posted boundary: `2025-01-01` through `2025-01-31`, inclusive
- December transaction dates posted in January remain assigned to January.

## Financial Normalization

- Proposed normalized amount total: `$-12570.54`
- Currency locale: `en-US`
- Parenthetical source amounts normalize to negative numeric values.
- Raw amount strings remain preserved unchanged.
- `Daily Posted Balance` remains a source-provided daily marker and is not treated as a transaction-specific running balance.

## Transaction-Type Inventory

- `ATM`: 25
- `Check`: 8
- `FEE`: 21
- `POS`: 31

## Classification Inventory

- Distinct source categories: 8
- Distinct source subcategories: 10

Source-provided category labels remain observational bank metadata. They do not independently establish THRIVE, trust, legal, or fiduciary classifications.

## Source Identity and Content Comparison

| Metric | Result |
|---|---:|
| Unique source-row identities | 85 |
| Expected source-row identities | 85 |
| Distinct content fingerprints | 78 |
| Content-identical source-row groups | 7 |
| Rows within content-identical groups | 14 |

Each proposed staging row uses:

`<source-file-sha256>:<original-source-row-number>`

Content fingerprints are intentionally nonunique.

Content-identical rows remain separate source observations and are not automatically removed, merged, or classified as duplicate financial events.

## Private Dry-Run Artifacts

The following generated previews contain real financial source content and remain excluded from Git:

- `private_artifacts/financial_ingestion/january_2025/january_2025_staging_preview.json`
- `private_artifacts/financial_ingestion/january_2025/january_2025_staging_preview.csv`

These previews contain:

- original source-row identity;
- all raw imported fields;
- proposed normalized fields;
- proposed content fingerprint;
- parse status;
- zero trust conclusions.

## Validation Issues

- No validation issues detected.

## Import Readiness Decision

**PASS**

The dry run may advance only when all of the following are true:

- file SHA-256 matches the reconciled source;
- all 85 transaction rows are read;
- all rows contain exactly 10 columns;
- all posted dates fall within January 2025;
- every source row receives a unique source identity;
- every date and money field normalizes successfully;
- no row is silently dropped or merged;
- content-identical rows remain separate;
- database writes remain zero during this dry run.

## Legal, Ethical, and Fiduciary Boundary

This dry run does not establish that any source transaction is:

- an approved trust distribution;
- appropriate or inappropriate spending;
- a protected expense;
- a fiduciary conclusion;
- a beneficiary obligation;
- a legal conclusion;
- a financial recommendation;
- or authority to make or automate payments.

The reviewed trust record remains authoritative.

## Current Decision

No January 2025 source row was written to Supabase.

A separate authorization is required before creating the real financial source, January import batch, or staged financial transactions.
