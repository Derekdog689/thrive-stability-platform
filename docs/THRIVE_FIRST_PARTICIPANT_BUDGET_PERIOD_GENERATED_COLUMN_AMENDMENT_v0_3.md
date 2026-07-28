# THRIVE First Participant Budget Period Candidate Generated-Column Amendment v0.3

## Status

The v0.2 rollback dry run failed safely.

No Budget period or Budget-line rows were installed.

## Confirmed additional live behavior

`participant_budget_lines.remaining_amount` is a generated column.

The database calculates it from the planning values. It must not receive a
non-default value during INSERT.

## v0.3 correction

The Budget-line INSERT now supplies only:

- id
- budget period
- category name
- category type
- planned amount
- actual amount
- sort order
- active state

`remaining_amount` remains available for SELECT and display but is omitted from
INSERT.

## Expected generated values

- Housing and utilities: $1,400.00
- Food and household: $475.00
- Transportation: $190.00
- Reserve: $300.00

Expected totals:

- planned: $2,400.00
- actual: $35.00
- generated remaining: $2,365.00

## Boundary

This remains a rollback-only synthetic candidate.

No installation is approved by this amendment.
