# THRIVE My Program Shared Shell and Budget Period Candidate v0.1

## Status

Application shell candidate installed locally.

Budget-period SQL remains review-only and unexecuted.

## My Program change

`/my-program` now uses the same participant shell as:

- Today
- Budget
- Reports

It includes:

- `AuthGate`
- `ThriveSidebar`
- participant-scoped program lookup
- neutral loading, error, and no-program states
- no financial records
- no Trust controls
- no write actions

## Budget candidate

The candidate proposes one synthetic February 2099 Budget period for Person D:

- expected income: $2,400.00
- Housing and utilities: $1,400.00 protected
- Food and household: $500.00 protected
- Transportation: $200.00 flexible
- Reserve: $300.00 reserve

The two synthetic imported transactions are represented only as candidate actual amounts:

- Food and household: $25.00
- Transportation: $10.00

This is a planning candidate, not an assertion about intent or final categorization.

## Required next step

Run only the opening `information_schema.columns` query from the SQL candidate.

Reconcile the live columns and constraints before attempting a rollback dry run.

## Frozen boundaries

- no SQL execution yet
- no real participant data
- no Johnny data
- no participant write UI
- no Trust synchronization
- no push or deployment
