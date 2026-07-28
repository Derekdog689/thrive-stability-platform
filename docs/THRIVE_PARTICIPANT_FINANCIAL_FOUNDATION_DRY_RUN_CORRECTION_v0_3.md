# THRIVE Participant Financial Foundation v0.3 Dry-Run Correction

## Status

Review and rollback dry-run candidate.

## v0.2 dry-run result

The candidate stopped with PostgreSQL error `42702`:

`column reference "workspace_id" is ambiguous`

The error occurred while compiling the participant transaction explanation INSERT policy.

No installation was authorized.

Because the candidate was enclosed in one transaction and did not commit, the failed transaction should leave no candidate objects installed. This must still be verified directly.

## v0.3 correction

The nested ownership query now explicitly qualifies outer-row values through:

`public.participant_transaction_explanations`

Corrected fields:

- `supported_person_id`
- `workspace_id`
- `program_id`
- `staged_transaction_id`

The administrative financial tables and policies remain unchanged.

## Next gate

1. Verify that v0.2 left no candidate objects.
2. Replace staged v0.2 with v0.3.
3. Run v0.3 with its final rollback.
4. Verify that no candidate objects remain after rollback.
5. Stop for explicit installation approval.
