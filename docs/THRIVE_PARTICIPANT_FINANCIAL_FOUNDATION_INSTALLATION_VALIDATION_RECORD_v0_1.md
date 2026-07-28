# THRIVE Participant Financial Foundation Installation Validation Record v0.1

## Status

Controlled installation completed and structurally verified.

## Repository checkpoint before installation

`519dd86 Add THRIVE participant financial product candidates`

## Installed database objects

### Tables

- `financial_source_owners`
- `participant_transaction_explanations`
- `participant_budget_periods`
- `participant_budget_lines`

### Participant read functions

- `get_my_financial_sources_v1`
- `get_my_financial_batches_v1`
- `get_my_financial_transactions_v1`

### Update-protection triggers

- `protect_financial_source_owner_scope_before_update`
- `protect_participant_transaction_explanation_scope_before_update`
- `protect_participant_budget_period_scope_before_update`
- `set_participant_budget_line_updated_at_before_update`

## Dry-run result

The v0.3 rollback dry run completed successfully.

Post-rollback verification confirmed:

- no candidate tables remained;
- no candidate functions remained.

## Controlled installation result

The approved controlled install completed successfully with `commit`.

No seed data was inserted.

## Initial row counts

- `financial_source_owners`: 0
- `participant_transaction_explanations`: 0
- `participant_budget_periods`: 0
- `participant_budget_lines`: 0

## RLS verification

RLS is enabled on all four installed tables:

| Table | RLS enabled | RLS forced |
|---|---:|---:|
| `financial_source_owners` | true | false |
| `participant_transaction_explanations` | true | false |
| `participant_budget_periods` | true | false |
| `participant_budget_lines` | true | false |

## Function verification

All three participant read functions are installed as `SECURITY DEFINER`.

The `authenticated` role has EXECUTE permission on all three:

- `get_my_financial_sources_v1`
- `get_my_financial_batches_v1`
- `get_my_financial_transactions_v1`

## Installed policies

### `financial_source_owners`

- admin INSERT
- admin SELECT
- admin UPDATE
- supported-person self SELECT

### `participant_transaction_explanations`

- participant self INSERT
- participant self SELECT
- participant draft UPDATE
- admin SELECT
- admin UPDATE

### `participant_budget_periods`

- participant self SELECT
- admin INSERT
- admin SELECT
- admin UPDATE

### `participant_budget_lines`

- participant self SELECT
- admin INSERT
- admin SELECT
- admin UPDATE

## Trigger verification

The following live triggers were confirmed:

- `financial_source_owners`
  - `protect_financial_source_owner_scope_before_update`
- `participant_transaction_explanations`
  - `protect_participant_transaction_explanation_scope_before_update`
- `participant_budget_periods`
  - `protect_participant_budget_period_scope_before_update`
- `participant_budget_lines`
  - `set_participant_budget_line_updated_at_before_update`

## Boundaries preserved

The installation did not:

- insert Johnny;
- assign any financial source owner;
- create a participant budget period;
- create a participant budget line;
- create a participant transaction explanation;
- alter existing financial-source, batch, transaction, or review rows;
- change existing administrative financial policies;
- change the January 2025 importer;
- synchronize anything with the Trust Engine;
- use a service-role path;
- push, merge, or deploy application code.

## Build status

No application code changed during this installation pass.

No application build was required.

## Verification conclusion

The participant financial foundation is installed and structurally ready for controlled identity and RLS testing.

The next gate is not application rollout yet.

The next gate is controlled test data and authenticated verification using:

- workspace admin;
- supported Person A;
- supported Person D;
- outsider.

## Exact next gate

Prepare a review-only identity test plan and a narrowly scoped ownership seed candidate using existing synthetic identities and existing synthetic financial source data.

Do not assign Johnny or real participant data during the synthetic validation gate.
