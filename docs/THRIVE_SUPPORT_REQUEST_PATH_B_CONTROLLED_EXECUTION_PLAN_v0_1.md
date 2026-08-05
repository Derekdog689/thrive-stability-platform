# THRIVE Support Request Path B Controlled Execution Plan v0.1

## Status

Review-only candidate.

This plan sequences the controlled browser-authenticated Path B validation pass. It does not approve execution.

The Support harness must remain locked:

```ts
export const SUPPORT_TEST_EXECUTION_ENABLED = false as const;
```

## Verified starting state

- Current commit checkpoint: `6dadbe9`
- Path A validation: completed and documented
- Path B controls: committed
- Production build: passed
- `git diff --check`: clean
- Known unrelated parked files remain outside scope
- Existing primary synthetic request:
  - `e8526d24-3310-4fe6-a6bb-4589a0a53b54`
  - current status: `submitted`
- Existing withdrawal-path request:
  - `f50d1546-9dda-456e-9b3d-75cbb9772964`
  - current status: `withdrawn`
- `supportLinkedRecords`: empty
- Path B execution: not started

## Frozen boundaries

Do not:

- activate Johnny;
- use a service-role client;
- create notifications or emergency workflows;
- synchronize with the Trust Engine;
- push, merge, or deploy;
- hard delete any record;
- modify actor memberships;
- populate linked-record IDs without a separate verification gate;
- run multiple harness actions at once;
- enable the harness before a separate execution approval.

## Approved actor set for a future execution pass

| Actor | Purpose |
|---|---|
| Participant D | Participant visibility and post-review response checks |
| Participant A | Cross-participant isolation |
| Outsider | No-access proof |
| Active Support member | Primary reviewer workflow |
| Active admin | Reviewer-equivalence check |
| Inactive Support member | Reviewer-denial proof |

## Execution discipline

Every test action must follow this pattern:

1. Confirm the authenticated browser identity.
2. Confirm the request, entry, link, or event ID.
3. Run exactly one harness action.
4. Capture the full result.
5. Compare expected and actual behavior.
6. Stop immediately on any boundary failure.
7. Do not continue to the next action until the prior result is reconciled.

There is no run-all path.

## Gate B1: Temporary harness activation candidate

Future execution requires a one-line temporary change:

```ts
export const SUPPORT_TEST_EXECUTION_ENABLED = true as const;
```

Before any browser action:

1. run `npm run build`;
2. run `git diff --check`;
3. verify only `src/app/support-test/supportTestConfig.ts` changed;
4. do not stage or commit the temporary activation;
5. confirm `supportLinkedRecords` remains empty.

Expected result:

- build passes;
- harness shows `Execution enabled`;
- no Support records are changed merely by loading the page.

## Gate B2: Active Support reviewer identity and request read

Authenticate as the active Support member.

Expected:

- identity matches the configured synthetic Support actor;
- the primary submitted request is visible;
- the withdrawal-path request is visible;
- no unrelated workspace records are visible.

Stop condition:

- any cross-workspace request appears.

## Gate B3: Lifecycle rejection proof

Using the primary request:

```text
e8526d24-3310-4fe6-a6bb-4589a0a53b54
```

Attempt the invalid direct transition:

```text
submitted -> archived
```

Expected:

- transition fails;
- request remains `submitted`;
- no archive timestamp is added;
- no false audit event is created.

This rejection proof must occur before the valid lifecycle sequence.

## Gate B4: Routing and assignment validation

### Routing-only update

Set only a valid synthetic routing category.

Expected:

- routing category changes;
- participant category remains unchanged;
- assigned member remains unchanged;
- a routing audit event is created.

### Valid assignment

Assign the request to the active same-workspace Support membership:

```text
cca88550-bac5-49b2-92a6-d5d9e19dd8ea
```

Expected:

- assignment succeeds;
- assignment audit event is created.

Repeat with active admin membership:

```text
566f964c-9348-457f-88a6-d7e589250390
```

Expected:

- assignment succeeds.

### Invalid assignment candidates

Test separately:

- inactive Support membership;
- active viewer membership;
- active individual membership;
- outsider Auth ID or another non-membership ID.

Expected for each:

- update fails;
- existing valid assignment remains unchanged;
- no false assignment event is created.

Do not test trustee or cross-workspace assignment until a separately verified synthetic actor exists.

## Gate B5: Valid lifecycle sequence

Using the active Support reviewer, run one transition at a time:

1. `submitted -> acknowledged`
2. `acknowledged -> in_progress`
3. `in_progress -> waiting_for_participant`
4. `waiting_for_participant -> in_progress`

After each transition:

- read the request;
- read status events;
- verify exactly one expected lifecycle event;
- verify participant-authored fields did not change.

Do not complete or archive the request yet.

## Gate B6: Reviewer entry creation

Create one:

```text
participant_response
```

Create one:

```text
internal_note
```

Record both entry IDs.

Expected:

- reviewer sees both;
- titles and content are preserved;
- created-by matches the authenticated reviewer;
- parent request and scope values match.

## Gate B7: Entry visibility isolation

### Participant D

Expected:

- sees the non-archived participant response;
- does not see the internal note.

### Participant A

Expected:

- sees neither entry.

### Outsider

Expected:

- sees neither entry.

### Inactive Support

Expected:

- sees neither entry.

### Active admin

Expected:

- sees both entries.

Stop immediately if an internal note becomes participant-visible.

## Gate B8: Entry immutability

Using the participant-response entry ID, attempt content mutation.

Expected:

- denial is confirmed by an actual database error;
- `denialConfirmed = true`;
- original title and content remain unchanged.

Repeat for the internal-note entry only after the first result is reconciled.

## Gate B9: Entry archival

Archive the participant-response entry with a non-empty reason.

Expected:

- archival succeeds;
- archive timestamp and reason are populated;
- participant no longer sees the archived response;
- active reviewers retain audit visibility;
- entry content remains unchanged;
- an `entry_archived` event is created.

Do not archive the internal note until the participant-response archive behavior is verified.

## Gate B10: Linked-record preparation gate

Path B link execution remains blocked because:

```ts
export const supportLinkedRecords = {};
```

Before link testing, perform a separate read-only reconciliation to identify verified synthetic same-scope records for:

- goal;
- wellness check-in;
- budget category;
- budget period;
- staged transaction, only if ownership is independently proven;
- completed prior Support request.

No linked-record IDs may be added during this execution-plan gate.

## Gate B11: Link execution, separately gated

Only after linked IDs are verified and separately approved:

1. populate one verified target at a time;
2. rebuild with the harness still locked;
3. review and commit the config change separately;
4. temporarily enable the harness;
5. create one link;
6. verify participant and reviewer visibility;
7. archive one mistaken link while the request is still eligible;
8. verify archive reason and `link_archived` event;
9. test invalid cross-scope and multi-target cases separately.

Until then, do not click `Create configured link`.

## Gate B12: Status-event mutation denial

Using a verified event ID:

- attempt direct update;
- attempt direct delete.

Expected for each:

- actual database error returned;
- `denialConfirmed = true`;
- event remains unchanged and visible to authorized reviewers.

Direct insert denial already passed in Path A but may be repeated once as a regression check.

## Gate B13: No-delete proof

Run separately against verified existing IDs:

- request delete;
- entry delete;
- link delete only after a link exists.

Expected:

- actual database error returned;
- `denialConfirmed = true`;
- record remains present.

Do not interpret an empty result without an error as a confirmed denial.

## Gate B14: Completion and archive

Only after entries and event proofs pass:

1. transition `in_progress -> completed`;
2. verify `completed_at`;
3. verify reopening fails;
4. transition `completed -> archived`;
5. verify `completed_at` remains unchanged;
6. verify `archived_at` is populated;
7. verify participant-authored content remains unchanged.

Do not use the withdrawn request for this lifecycle path.

## Gate B15: Active admin equivalence

Using the active admin:

- read the completed or archived request;
- read all authorized events;
- confirm reviewer visibility;
- do not repeat the entire lifecycle unless a specific discrepancy appears.

## Gate B16: Relock and closeout

Immediately after the approved execution slice:

1. restore:

```ts
export const SUPPORT_TEST_EXECUTION_ENABLED = false as const;
```

2. run `npm run build`;
3. run `git diff --check`;
4. run `git status --short`;
5. verify no temporary config diff remains;
6. preserve all synthetic records through lifecycle and archive states;
7. create a Path B validation closeout candidate;
8. commit only the approved closeout artifact;
9. do not push.

## Stop conditions

Stop immediately if:

- Participant A sees Participant D data;
- the outsider sees Support data;
- inactive Support gains reviewer access;
- an internal note becomes participant-visible;
- assignment succeeds for an invalid membership;
- participant-authored fields change during reviewer updates;
- an invalid lifecycle transition succeeds;
- a terminal request reopens;
- DELETE succeeds;
- a denial-proof function returns no error;
- a linked source record is mutated;
- a cross-workspace record appears;
- any Trust Engine, notification, emergency, or external-sharing action occurs.

## Recommended first execution slice

The smallest safe next execution slice is:

1. temporary activation candidate;
2. active Support identity;
3. primary request read;
4. direct `submitted -> archived` rejection;
5. routing-only update;
6. valid active-Support assignment;
7. invalid inactive-Support assignment;
8. `submitted -> acknowledged`;
9. read request and events;
10. relock and stop.

Do not include entries, links, completion, archival, or delete proofs in the first Path B slice.

## Exact next gate

Review and approve or revise the recommended first Path B execution slice.

The harness remains locked until that slice is separately approved.

## Pass closeout

- Build status: previously passed
- `git diff --check`: previously clean
- Git status: known parked unrelated files only
- Commit checkpoint: `6dadbe9`
- Harness execution: disabled
- Path B execution: not started
- Database writes during this planning gate: none
- Exact next gate: approve or revise the limited first Path B execution slice
