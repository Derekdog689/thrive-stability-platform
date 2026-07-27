# THRIVE Budget Period and Planning Model Candidate v0.1

## Status

Review-only candidate.

## Purpose

Evolve the current program-scoped `budget_categories` summary into a participant-owned, period-based budget.

## Existing live foundation

The current table already contains:

- category name
- category type
- planned amount
- spent amount
- remaining amount
- sort order
- active state

## Candidate period object

`participant_budget_periods`

Candidate fields:

- `id`
- `workspace_id`
- `program_id`
- `supported_person_id`
- `period_start`
- `period_end`
- `status`
- `expected_income`
- `notes`
- `created_by`
- `created_at`
- `updated_at`
- `archived_at`

Candidate statuses:

- `draft`
- `active`
- `completed`
- `archived`

## Candidate line object

`participant_budget_lines`

Candidate fields:

- `id`
- `budget_period_id`
- `category_name`
- `category_type`
- `planned_amount`
- `actual_amount`
- `remaining_amount`
- `sort_order`
- `is_active`
- `created_at`
- `updated_at`

## Candidate category types

Retain:

- `protected`
- `flexible`
- `support`
- `reserve`

## Actual amount strategy

Do not overwrite source transactions.

Actuals should be derived from participant-safe classified transactions or stored as period snapshots with provenance.

## Period rules

- one active budget period per supported person for an overlapping date range;
- completed periods become immutable except through an approved correction path;
- archived instead of deleted;
- historical plans remain visible in Reports;
- category names may vary by participant and period.

## Migration direction

Do not mutate existing `budget_categories` yet.

First determine whether it is:

- synthetic test data;
- operational program-level template;
- seed categories;
- or an early budget instance.

## Frozen boundary

No budget-period table, migration, trigger, or route should be installed in this gate.
