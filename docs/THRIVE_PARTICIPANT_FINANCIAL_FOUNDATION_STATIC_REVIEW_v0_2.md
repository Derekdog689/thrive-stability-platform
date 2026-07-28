# THRIVE Participant Financial Foundation v0.2 Static Review

## Status

Static review complete. Dry-run candidate only.

## Confirmed compatibility

Live `supported_people` includes:

- primary key on `id`;
- unique index on `(id, workspace_id)`;
- unique authenticated-user linkage.

The composite foreign keys in the candidate are compatible.

## v0.1 issues corrected

1. Replaced participant-safe views with narrow `SECURITY DEFINER` read functions.
2. Reused live identity and scope helpers.
3. Added immutable ownership scope.
4. Added immutable explanation scope.
5. Added immutable Budget-period scope.
6. Tightened explanation update permissions.
7. Added explicit function execute grants.
8. Preserved existing administrator financial policies.
9. Retained final rollback for dry-run safety.

## Candidate objects

Tables:

- `financial_source_owners`
- `participant_transaction_explanations`
- `participant_budget_periods`
- `participant_budget_lines`

Participant read functions:

- `get_my_financial_sources_v1`
- `get_my_financial_batches_v1`
- `get_my_financial_transactions_v1`

## Remaining dry-run questions

- Do all statements compile in the live PostgreSQL version?
- Do policy subqueries avoid recursive RLS errors?
- Do generated columns compile as written?
- Do existing object names conflict?
- Does rollback remove every candidate object?

## Installation boundary

Dry-run approval does not authorize installation.
