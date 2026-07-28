# THRIVE Synthetic Participant Financial Visibility Test Plan v0.1

## Status

Approved synthetic validation gate.

## Scope

Validate only the newly installed participant financial ownership and read layer.

Already-proven identity, workspace, program, and `/my-program` behavior remain parked.

## Synthetic fixture

- existing fixture workspace
- existing fixture program
- existing Person D
- one synthetic source
- one synthetic batch
- two synthetic posted transactions
- one source ownership row assigned to Person D

## Expected results

### Admin

- source visible through administrative tables
- batch visible
- two transactions visible
- ownership row visible

### Person D

- `get_my_financial_sources_v1()` returns 1
- `get_my_financial_batches_v1()` returns 1
- `get_my_financial_transactions_v1()` returns 2

### Person A

- all three functions return 0 rows

### Outsider

- all three functions return 0 rows

## Negative boundary

Person A and outsider must not gain access merely because the source belongs to a program they can identify or because the functions are executable.

## Gates

1. rollback dry run
2. controlled seed install
3. authenticated read verification
4. validation record
5. application shell work

## Frozen exclusions

- no Johnny data
- no real financial source
- no Trust Engine action
- no real bank import
- no push
