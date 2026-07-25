# THRIVE Monthly Financial Ingestion Live Test Results v0.3

## Status

- Test type: Synthetic-only authenticated application test
- Schema version: v0.3
- Test interface: `/financial-ingestion-test`
- Real January 2025 CSV used: No
- Real beneficiary or trust data used: No
- Service-role client use: No
- Test environment: Supabase production project using synthetic records only
- Test outcome: Passed

## Governing Rule

The bank feed supplies observational data. The reviewed trust record remains authoritative.

## Scope

The live test validated:

1. Financial-source creation
2. Monthly import-batch creation
3. Content-identical source-row preservation
4. Normalized parsing updates
5. Human review creation
6. Raw-source immutability
7. Batch review transition
8. Batch approval and closure
9. Post-approval reopening denial
10. Post-approval staged-record update denial
11. Post-approval review update denial
12. Post-approval staged-record insert denial
13. Post-approval review insert denial

## Synthetic Test Record

Synthetic values included:

- Source name: `Synthetic Monthly Test Source`
- Source filename: `synthetic_test_2099_01.csv`
- File fingerprint: 64-character synthetic `a` value
- Source rows: 2 and 3
- Transaction description: `SYNTHETIC TEST PURCHASE`
- Raw amount: `($12.34)`
- Normalized amount: `-12.34`
- Batch status progression:
  - `uploaded`
  - `under_review`
  - `approved`

No real financial information was entered.

## Open-Batch Test Results

### Source Creation

Result: Passed

The authenticated workspace admin created one synthetic financial source through the Supabase client and RLS path.

### Batch Creation

Result: Passed

The authenticated workspace admin created one synthetic monthly import batch.

### Content-Identical Source Rows

Result: Passed

Two rows with identical financial contents and different source-row identities were retained separately.

Observed count:

- Sources: 1
- Batches: 1
- Staged transactions: 2

This confirms that content similarity does not automatically establish duplication.

### Parsing

Result: Passed

Both staged rows were normalized successfully while the batch remained open.

Normalized amount:

`-12.34`

### Human Review

Result: Passed

One synthetic review was created with:

- Review status: `routine_repeated_activity`
- Duplicate classification: `content_identical`
- Trust-match status: `not_applicable`

The review documented that content similarity alone does not establish duplication.

### Raw-Source Mutation Denial

Result: Passed

Attempted mutation of a raw imported value was rejected.

Observed message:

`Raw staged financial source evidence is immutable`

## Batch-Closure Test Results

### Move to Under Review

Result: Passed

The synthetic batch moved from `uploaded` to `under_review` with reviewer attribution.

### Valid Approval

Result: Passed

The batch moved from `under_review` to `approved` with aligned reviewer and approver attribution.

### Reopening Denial

Result: Passed

An attempt to reopen the approved batch was rejected.

Observed message:

`An approved financial import batch is immutable`

### Staged Transaction Update Denial

Result: Passed

An attempt to modify a normalized staged-transaction field after approval was rejected.

Observed message:

`Records belonging to an approved financial import batch are immutable`

### Review Update Denial

Result: Passed

An attempt to modify the existing review after approval was rejected.

Observed message:

`Reviews belonging to an approved financial import batch are immutable`

### Staged Transaction Insert Denial

Result: Passed

An attempt to insert another staged row after approval was rejected.

Observed message:

`Rows cannot be added to an approved or rejected import batch`

### Review Insert Denial

Result: Passed

An attempt to insert another review after approval was rejected.

Observed message:

`Reviews cannot be inserted into an approved or rejected import batch`

## Final Record Counts

After all denied mutation and insertion tests:

- Financial sources: 1
- Financial import batches: 1
- Staged financial transactions: 2
- Financial transaction reviews: 1

No denied operation changed the stored counts.

## RLS and Trigger Evidence

The live test operated through:

- the public Supabase anonymous client;
- the authenticated user session;
- workspace-admin RLS policies;
- program/workspace scope checks;
- database constraints;
- database trigger protections.

Expected HTTP `400` responses appeared during deliberate denial tests. These responses represented successful enforcement of database protections, not application failures.

## Temporary Test UI Decision

The temporary route:

`/financial-ingestion-test`

will remain available during development and final hardening.

Purpose:

- regression testing;
- lifecycle verification;
- RLS verification;
- developer reference;
- controlled synthetic-data validation.

Restrictions:

- synthetic data only;
- no real CSV upload;
- no real account information;
- no beneficiary information;
- no trust conclusions;
- no production navigation exposure until separately approved.

The route may be removed, hidden, or converted into an internal administrative diagnostic tool during final hardening.

## Legal, Ethical, and Fiduciary Boundary

The successful test does not establish that imported bank activity is:

- an approved trust distribution;
- appropriate or inappropriate spending;
- a fiduciary conclusion;
- a legal conclusion;
- a beneficiary obligation;
- a financial recommendation;
- or authority to make or automate payments.

The reviewed trust record remains authoritative.

## Final Test Decision

Synthetic authenticated application testing for the v0.3 financial-ingestion schema passed.

Real January 2025 ingestion remains subject to a separate source-import implementation, reconciliation, validation, and explicit authorization.
