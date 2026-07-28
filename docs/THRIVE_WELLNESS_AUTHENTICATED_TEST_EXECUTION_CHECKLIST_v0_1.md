# THRIVE Wellness Authenticated Test Execution Checklist v0.1

## Status

Synthetic authenticated test package.

No real participant data may be used.

## Starting state

Confirm:

- [ ] commit checkpoint is `ede156d`;
- [ ] Wellness schema is installed;
- [ ] post-install validation passed;
- [ ] Wellness record count begins at `0`;
- [ ] Person D, Person A, admin, and outsider test accounts are available;
- [ ] no UI write path is enabled;
- [ ] no Johnny data is used;
- [ ] no Trust Engine synchronization is active.

## Person D positive tests

- [ ] D1 can resolve own supported-person row;
- [ ] D2 can insert own active same-day check-in;
- [ ] D3 can read own check-in;
- [ ] D4 can update own same-day check-in.

## Person D negative tests

Run each statement separately.

- [ ] D5 duplicate same-day active insert fails;
- [ ] D6 insert for Person A fails;
- [ ] D7 self-archive fails;
- [ ] D8 workspace change fails;
- [ ] D9 program change fails;
- [ ] D10 supported-person change fails;
- [ ] D11 creator change fails;
- [ ] D12 Person A query returns zero rows.

## Person A isolation tests

- [ ] A1 Person A sees zero Person D rows;
- [ ] A2 Person A update of Person D affects zero rows.

## Outsider tests

- [ ] O1 outsider sees zero rows;
- [ ] O2 outsider insert fails;
- [ ] O3 outsider update fails or affects zero rows.

## Workspace admin tests

- [ ] ADM1 admin can read Person D row;
- [ ] ADM2 admin can archive Person D row;
- [ ] ADM2 result has `archived_at`;
- [ ] ADM3 workspace move fails;
- [ ] ADM4 program move fails;
- [ ] ADM5 supported-person move fails.

## Final state

Expected:

- [ ] exactly one synthetic Person D Wellness row exists;
- [ ] row is archived;
- [ ] archived timestamp is populated;
- [ ] no Person A row exists;
- [ ] no outsider row exists;
- [ ] no real participant data exists.

## Evidence to capture

For each test, record:

- authenticated identity;
- SQL statement label;
- result or error;
- expected result;
- pass or fail.

## Failure handling

If any test behaves unexpectedly:

1. stop the test pass;
2. do not open the UI write path;
3. capture the exact result or error;
4. reconcile policy, trigger, and helper behavior;
5. prepare a candidate correction;
6. do not modify production without approval.

## Frozen boundaries

- synthetic data only;
- no Johnny data;
- no real Wellness data;
- no UI writes;
- no financial cross-reference;
- no Trust Engine synchronization;
- no push or deployment.

## Exact next gate

Run Person D positive tests first. Do not proceed to Person A, outsider, or admin
until Person D insert, read, and same-day update pass.
