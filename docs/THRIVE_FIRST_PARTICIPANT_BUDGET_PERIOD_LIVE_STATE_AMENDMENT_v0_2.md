# THRIVE First Participant Budget Period Candidate Live-State Amendment v0.2

## Status

Live schema reconciled.

The v0.1 candidate failed safely because it incorrectly assumed that
`participant_budget_lines` contained workspace, program, person, and creator columns.

No candidate rows were installed.

## Confirmed live model

### `participant_budget_periods`

Carries:

- workspace scope
- program scope
- supported-person scope
- period dates
- lifecycle status
- expected income
- notes
- creator lineage

### `participant_budget_lines`

Carries:

- `budget_period_id`
- category name and type
- planned amount
- actual amount
- optional remaining amount
- sort order
- active state

Budget-line scope is inherited through the parent period.

## Confirmed constraints

- planned and actual amounts must be nonnegative
- supported category types:
  - `protected`
  - `flexible`
  - `support`
  - `reserve`
- period start must not follow period end
- period status must be:
  - `draft`
  - `active`
  - `completed`
  - `archived`
- one exact active period is permitted per supported person and date range
- budget lines cannot outlive their parent period through cascade deletion because the FK uses `ON DELETE RESTRICT`

## Corrected synthetic candidate

February 2099:

- expected income: $2,400.00
- Housing and utilities:
  - planned $1,400.00
  - actual $0.00
  - remaining $1,400.00
- Food and household:
  - planned $500.00
  - actual $25.00
  - remaining $475.00
- Transportation:
  - planned $200.00
  - actual $10.00
  - remaining $190.00
- Reserve:
  - planned $300.00
  - actual $0.00
  - remaining $300.00

Totals:

- planned: $2,400.00
- actual: $35.00
- remaining: $2,365.00

The actual amounts are synthetic test values mapped from the two synthetic transactions.
They are not assertions about intent, final categorization, or participant responsibility.

## Exact next gate

Run the v0.2 candidate as the authenticated fixture workspace admin with the final `rollback` intact.

Expected dry-run result:

- period count represented by one grouped period row
- line count: 4
- planned total: $2,400.00
- actual total: $35.00
- remaining total: $2,365.00

No installation is approved by this amendment.
