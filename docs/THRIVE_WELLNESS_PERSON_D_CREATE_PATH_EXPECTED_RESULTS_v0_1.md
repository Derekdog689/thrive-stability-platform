# THRIVE Person D Wellness Create-Path Expected Results v0.1

## Status

Review-only expected-results record.

## Test sequence

| Phase | Expected result |
|---|---|
| Preflight | Person D flag absent or false; working tree clean; build passes |
| Identity | Exact Person D auth, supported-person, workspace, program, and participation resolve |
| Create | One active same-day synthetic row is inserted |
| Saved view | Wellness page displays the inserted row |
| Duplicate | Second active same-day row is denied |
| Update | Same row ID is updated; immutable scope fields remain unchanged |
| Archive | Synthetic row becomes archived with `archived_at` populated |
| Postflight | Zero active Person D rows remain for the test date |
| Deactivation | Environment flag removed; save button disabled |
| Final verification | Build, diff check, and status pass |

## Create assertions

- row count before create: `0 active rows for Person D and test date`
- row count after create: `1 active row`
- row status: `active`
- archive timestamp: `null`
- created-by actor: Person D auth UUID
- all scope identifiers match the controlled fixture
- participant note clearly states that the row is synthetic

## Duplicate assertions

- active row count remains `1`
- original row ID remains present
- no second active row is created
- unique-index or application duplicate handling is observed

## Update assertions

- active row count remains `1`
- row ID is unchanged
- `updated_at` is later than the create timestamp
- approved reflection fields match the update payload
- workspace, program, person, date, creator, and create timestamp do not change

## Archive assertions

- active row count becomes `0`
- archived row count for the synthetic row becomes `1`
- `status = archived`
- `archived_at` is not null
- no hard delete occurs

## Identity isolation assertions

### Person A

- cannot see Person D row
- cannot update Person D row
- cannot archive Person D row
- save remains unavailable unless separately authorized

### Outsider

- cannot see Person D row
- cannot insert within Person D scope
- cannot update or archive Person D row
- save remains unavailable

### Admin

- may perform only previously approved administrative observations or cleanup
- does not replace the participant-path test
- does not use service-role credentials

## Final pass criteria

The test passes only when:

1. exact Person D UI create succeeds;
2. duplicate active same-day creation is prevented;
3. same-day update preserves row identity and immutable scope;
4. synthetic row is archived, not deleted;
5. environment activation is removed;
6. save returns to disabled;
7. no active synthetic row remains;
8. no other identity gains access;
9. build and repository checks pass.

## Failure handling

If any assertion fails:

- stop the test;
- preserve the current row and logs;
- remove the activation flag;
- restart the development server;
- do not attempt compensating SQL without a separate reviewed candidate;
- document the observed state before making changes.
