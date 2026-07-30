# THRIVE Goals Installation and Authenticated Test Execution Checklist v0.1

## Status

Review-only execution checklist.

This checklist does not authorize SQL execution, schema installation, authenticated writes, participant status changes, auth linking, rollback, deployment, merge, or push.

## Verified starting state

- Goals schema/RLS v0.1 committed at `0ed4ae4`.
- Goals schema/RLS v0.2 amendment committed at `7700b7d`.
- Authenticated synthetic Goals test plan committed at `9da9fe9`.
- Test-plan whitespace cleanup committed at `a45412d`.
- Synthetic identity selection record prepared.
- `public.participant_goals` is absent.
- No Goals SQL has been executed.
- No Goals records exist.
- Johnny is excluded.
- Trust Engine synchronization is excluded.

## Locked synthetic scope

### Workspace

```text
workspace_id: 71000000-0000-4000-8000-000000000001
workspace_type: demo
status: active
```

### Program

```text
program_id: 71000000-0000-4000-8000-000000000002
program_name: SUPPORTED PERSON PROGRAM TEST
status: active
```

### Participant A

```text
supported_person_id: 71000000-0000-4000-8000-000000000003
auth_user_id: 9b283c6e-c2f8-4f87-9f90-fa081ee249bd
participation_id: 71000000-0000-4000-8000-000000000005
participation_status: active
```

### Participant D

```text
supported_person_id: 71000000-0000-4000-8000-000000000009
auth_user_id: d48b7268-9aa6-4498-a923-2851fd5232c9
participation_id: 71000000-0000-4000-8000-000000000010
participation_status: active
```

### Workspace admin

```text
auth_user_id: 3c0300e6-c4e9-4a84-b668-4a7e39593162
member_role: admin
membership_status: active
```

### Outsider

```text
auth_user_id: 4c68820a-b824-419a-bcc1-1485a3dcba94
membership in selected workspace: none
```

### Inactive admin-side fixture

```text
supported_person_id: 71000000-0000-4000-8000-000000000007
participation_id: 71000000-0000-4000-8000-000000000008
participation_status: inactive
auth_user_id: null
```

Authenticated participant-self inactive testing remains deferred.

## Gate A — final preflight

Complete before any installation approval.

- [ ] Confirm current repository commit.
- [ ] Confirm branch and working-tree status.
- [ ] Run `npm run build`.
- [ ] Run `git diff --check`.
- [ ] Confirm v0.2 SQL hash.
- [ ] Confirm rollback SQL hash.
- [ ] Confirm `public.participant_goals` is absent.
- [ ] Confirm selected workspace remains active.
- [ ] Confirm selected program remains active.
- [ ] Confirm Participant A participation remains active.
- [ ] Confirm Participant D participation remains active.
- [ ] Confirm workspace admin membership remains active.
- [ ] Confirm outsider still has no membership in selected workspace.
- [ ] Confirm inactive fixture remains inactive.
- [ ] Confirm helper function signatures and argument order.
- [ ] Confirm no service-role key is required.
- [ ] Confirm no production identity is in scope.

Stop if any preflight fact changed.

## Gate B — explicit installation approval

Do not continue unless explicit approval is recorded for:

- [ ] installing the Goals v0.2 schema candidate;
- [ ] using the selected synthetic workspace and identities;
- [ ] retaining the schema during authenticated testing;
- [ ] stopping immediately on any RLS or ownership failure.

Approval for installation does not authorize authenticated test writes.

## Gate C — controlled schema installation

Only after Gate B approval.

- [ ] Use the reviewed v0.2 SQL artifact.
- [ ] Remove or replace the review-only terminal `rollback;` only in a separately reviewed install artifact.
- [ ] Do not alter ownership, RLS, foreign keys, archive rules, or active-participation requirements.
- [ ] Execute once against the approved database.
- [ ] Record timestamp and operator.
- [ ] Record exact SQL hash.
- [ ] Capture execution result.
- [ ] Do not create test rows during installation.

Stop if:

- the table already exists unexpectedly;
- any helper function is missing;
- any foreign key fails;
- any policy or trigger fails;
- any unrelated object changes.

## Gate D — post-install verification

Before authenticated writes:

- [ ] Confirm `public.participant_goals` exists.
- [ ] Confirm all expected columns.
- [ ] Confirm all constraints.
- [ ] Confirm four scoped foreign keys.
- [ ] Confirm both indexes.
- [ ] Confirm trigger exists.
- [ ] Confirm RLS is enabled.
- [ ] Confirm five expected policies.
- [ ] Confirm no DELETE policy.
- [ ] Confirm no rows exist.
- [ ] Confirm no unrelated module changed.

Installation success does not authorize testing.

## Gate E — explicit authenticated-test approval

Do not continue unless explicit approval is recorded for:

- [ ] Participant A authenticated writes;
- [ ] Participant D isolation checks;
- [ ] workspace-admin lifecycle checks;
- [ ] outsider denial checks;
- [ ] archive-only synthetic closeout;
- [ ] no hard deletes;
- [ ] deferred inactive participant-self test.

## Gate F — ordered authenticated tests

Run in this order.

- [ ] T01 baseline absence.
- [ ] T02 Participant A self-select before create.
- [ ] T03 valid Participant A insert.
- [ ] T04 wrong creator denial.
- [ ] T05 wrong supported-person denial.
- [ ] T06 wrong workspace/program denial.
- [ ] T07 staff-suggestion insert denial.
- [ ] T08 Participant D cross-person select denial.
- [ ] T09 outsider select denial.
- [ ] T10 Participant A content update.
- [ ] T11 immutable-field update denial.
- [ ] T12 Participant A archive.
- [ ] T13 Participant A reactivation denial.
- [ ] T14 workspace-admin read.
- [ ] T15 workspace-admin reactivation while participation remains active.
- [ ] T16 inactive admin-side fixture verification.
- [ ] T17 DELETE denial for all authenticated roles.
- [ ] T18 cross-module non-action verification.

Record expected and actual results for every test.

## Stop conditions

Stop immediately if:

- cross-person access succeeds;
- outsider access succeeds;
- a participant writes for another person;
- wrong workspace/program scope succeeds;
- ownership source changes;
- a staff suggestion becomes participant-owned silently;
- immutable identity fields change;
- participant reactivation succeeds;
- DELETE succeeds;
- inactive participation is bypassed;
- archive status and timestamp diverge;
- any unrelated module changes;
- any real-person data enters the test scope.

Do not continue after a stop condition.

## Gate G — closeout

- [ ] Archive synthetic Goal rows.
- [ ] Preserve evidence.
- [ ] Confirm no hard delete occurred.
- [ ] Confirm no unrelated module changed.
- [ ] Record final row state.
- [ ] Decide whether schema remains installed.
- [ ] Decide whether rollback is required.

Rollback requires separate explicit approval.

## Gate H — repository checkpoint

After testing and documentation:

- [ ] Update review documents with actual results.
- [ ] Run `npm run build`.
- [ ] Run `git diff --check`.
- [ ] Run `git status`.
- [ ] Review staged files.
- [ ] Create an isolated commit.
- [ ] Verify commit with `git show --check`.
- [ ] Record commit hash.

Do not push without separate explicit approval.

## Current exact next gate

Complete Gate A final preflight only.

Do not install schema or run authenticated tests yet.
