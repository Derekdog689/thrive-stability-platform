# THRIVE Participant Financial Upload v0.1
## Controlled Install + Synthetic Validation Closeout

**Status:** Installed and controlled synthetic validation passed
**Date:** 2026-08-22
**Scope:** Participant-controlled CSV import into the existing Financial Activity spine

## Purpose

Prove the foundational bridge:

> Participant-controlled CSV import -> Financial Activity -> existing Budget / Reports / Today spine

This closeout records the installed database behavior, controlled synthetic validation, and participant-facing UI observations. It does not authorize broader UI work, bank connectivity, PDF ingestion, automatic categorization, or deployment.

## Installed Database Changes

The approved v0.1 controlled migration installed:

- targeted relaxation of legacy staged-row requirements that generic CSV files may not contain;
- `public.import_my_financial_activity_csv_v1(...)`;
- participant CSV provenance support in `public.get_my_financial_activity_v1()`;
- authenticated execute access to the controlled RPC;
- no new participant direct RLS write policy on the financial base tables.

A follow-up controlled repair replaced unsupported `min(uuid)` scope resolution with:

1. count matching active participant/program scopes;
2. require exactly one match;
3. resolve that one supported-person/workspace UUID pair directly.

## Controlled Synthetic Fixture

Authenticated synthetic supported person:

- supported person: `71000000-0000-4000-8000-000000000009`
- program: `71000000-0000-4000-8000-000000000002`

Test CSV-equivalent rows:

| Date | Description | Amount |
|---|---|---:|
| 2026-08-20 | GAS TEST | -25.00 |
| 2026-08-21 | PAYCHECK TEST | 1000.00 |

## Validation Results

### Positive import

PASS.

Created:

- one active `current_csv` financial source;
- one parsed import batch;
- two parsed staged financial rows.

Returned import result:

- inserted row count: 2
- import status: `parsed`

### Unified Financial Activity read

PASS.

`get_my_financial_activity_v1()` returned:

- `GAS TEST` -> `-25.00` -> `outflow` -> `participant_csv_upload`
- `PAYCHECK TEST` -> `1000.00` -> `inflow` -> `participant_csv_upload`

### Duplicate protection

PASS.

Repeating the same file SHA-256 was rejected with:

> This file was already added.

No second batch or duplicate rows were created.

### Atomic malformed-row rollback

PASS.

A malformed controlled import left:

- 0 new batches
- 0 new staged rows

No partial write remained.

### Outsider / no-active-participant denial

PASS.

An authenticated context that did not resolve to an active supported person in the selected program was denied.

Residue:

- 0 batches
- 0 rows

### Automatic Budget relationship boundary

PASS.

The two uploaded rows created:

- 0 automatic Budget allocations.

Budget relationships remain participant-controlled and separate from transaction evidence.

## Participant-Facing UI Observation

The existing `/financial-activity` route recognized the new uploaded rows without additional UI wiring.

Observed:

### PAYCHECK TEST

- displayed as Money received;
- displayed as uploaded activity;
- context affordance available;
- no manual Edit / Remove activity controls exposed.

### GAS TEST

- displayed as Money spent;
- displayed as uploaded activity;
- Budget connection affordance available;
- context affordance available;
- no manual Edit / Remove activity controls exposed.

This confirms the shared Financial Activity layer is functioning as the intended participant-facing convergence point.

No participant edits were performed during this observation.

## Reconciliation Findings Before Upload UI Work

Two participant-facing gaps remain.

### 1. Provenance pill wording

Database provenance is correctly:

`participant_csv_upload`

Current UI still renders the pill:

`Bank import`

For participant CSV uploads, the participant-facing label should be reconciled to something such as:

`Uploaded by you`

This is a presentation correction only. It must not rewrite historical provenance or collapse future connected-account provenance.

### 2. Missing upload affordance

The backend import bridge now exists and is validated, but the participant has no normal application path to use it.

The next participant-facing flow should be:

Financial Activity
-> Upload activity
-> Choose CSV
-> Preview Date / Description / Amount
-> Confirm import
-> Refresh Financial Activity

The participant should not be exposed to:

- import batches;
- staged transactions;
- SHA hashes;
- row fingerprints;
- parsing lifecycle terminology.

## Preserved Boundaries

This v0.1 work does not:

- infer intent, responsibility, relapse, incapacity, misuse, or any legal/clinical/fiduciary conclusion;
- automatically categorize activity;
- automatically connect activity to Budget;
- automatically create Support, Goals, or Wellness records;
- hard-delete financial evidence;
- synchronize with external systems;
- provide bank connectivity;
- support PDF/OCR/XLSX ingestion.

## Current Build / Repository Checkpoint

- Latest verified application build: PASS, 31/31 routes
- Latest committed checkpoint: `f966dd2 Reframe Today around participant orientation`
- Branch last verified: `budget-builder-category-v0-1`
- Branch last verified: 10 commits ahead of origin
- `next.config.ts` remains parked
- `src/app/AuthGate.tsx` remains parked
- no push
- no deploy

## Participant UI Validation

A real participant-facing CSV upload was completed through `/financial-activity`.

Source-file behavior validated:

- Wells Fargo posted-transaction CSV;
- 22 completed transaction rows;
- transaction date range: 2026-08-03 through 2026-08-21;
- money received: $600.00;
- money out: $428.99;
- preview totals matched the source file;
- participant confirmed the import through the UI;
- all 22 rows became available through Financial Activity;
- provenance displayed as `Uploaded by you`;
- lifecycle displayed as `Posted`;
- uploaded outflows remained unconnected to Budget;
- no automatic Budget allocations were created.

Existing synthetic upload evidence remained separate.

Reports subsequently showed:

- 24 imported activities total, consisting of 22 real uploaded rows plus 2 earlier synthetic rows;
- $453.99 imported outflow, consisting of $428.99 from the real upload plus the earlier $25.00 synthetic outflow;
- statement history preserved the actual transaction date range rather than deriving dates from the source filename.

The active Budget remained unchanged by the upload until an explicit Budget relationship is created.

## CSV v0.1 Boundary

Participant Financial Upload v0.1 uses this minimum source contract:

- Date
- Description
- Amount

Pending transactions are outside the v0.1 import scope.

Institution-specific fields may exist in a source file but are not required by the v0.1 contract.

Participants should export completed or posted activity for v0.1.

## Gate Closeout

### Completed gate

**Participant CSV upload -> preview -> participant confirmation -> normalized Financial Activity**

Result: **PROVEN**

The bridge is now validated through the participant-facing UI using a real posted-transaction CSV.

### Current Build / Repository Checkpoint

- application build: PASS, 31/31 routes
- `git diff --cached --check`: PASS
- branch: `budget-builder-category-v0-1`
- prior commit checkpoint: `f966dd2 Reframe Today around participant orientation`
- `next.config.ts` remains parked
- `src/app/AuthGate.tsx` remains parked
- no push
- no deploy

### Next gate

**Commit the approved Participant Financial Upload v0.1 UI and validation closeout.**

No broader financial redesign is authorized by this closeout.
