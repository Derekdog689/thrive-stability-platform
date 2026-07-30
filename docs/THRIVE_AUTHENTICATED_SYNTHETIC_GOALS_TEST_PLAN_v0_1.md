# THRIVE Authenticated Synthetic Goals Test Plan v0.1

## Status

Review-only test plan.

This document does not authorize SQL execution, schema installation, authenticated database writes, test-user creation, participant activation, deployment, production use, or cleanup execution.

## Verified starting state

- Goals schema/RLS v0.1 candidate committed at `0ed4ae4`.
- Goals schema/RLS v0.2 amendment committed at `7700b7d`.
- v0.2 adds strict table-absence preflight and scoped foreign keys with `ON DELETE RESTRICT`.
- The reviewed SQL remains transaction-wrapped and ends with `rollback;`.
- No Goals SQL has been executed.
- No Goals table or test record has been created.
- Existing synthetic supported-person identities may be used only after they are explicitly selected and reconfirmed.
- Johnny is excluded from all testing.
- Trust Engine synchronization is excluded.

## Purpose

Define the smallest authenticated test package needed to validate participant-owned Goals after separate approval of:

1. schema installation;
2. synthetic identity selection;
3. authenticated test execution;
4. cleanup or archive handling.

The plan keeps facts, observed behavior, explanations, and conclusions separate.

## Required synthetic identities

Do not create new identities during this gate.

Before testing, select and document:

| Test role | Required state |
|---|---|
| Participant A | Existing synthetic auth user linked to an active supported person |
| Participant D | Existing synthetic auth user linked to a different supported person |
| Workspace admin | Existing synthetic authenticated admin in the same workspace |
| Outsider | Existing synthetic authenticated user without workspace membership |
| Active workspace | Existing non-production synthetic workspace |
| Active program | Existing synthetic program in the active workspace |
| Active participation A | Participant A active in the selected program |
| Active participation D | Participant D active in a separate allowed scope or different participant row |
| Inactive participation fixture | Existing or separately approved synthetic participation that can be made inactive without touching production identities |

Record exact UUIDs only in a local, non-public evidence file. Do not place credentials, passwords, refresh tokens, service-role keys, or session secrets in repository documents.

## Preconditions

Testing must not begin until all are true:

- live helper function signatures are reconfirmed;
- `participant_goals` is confirmed absent before installation;
- v0.2 SQL hash is recorded;
- explicit schema-installation approval is given;
- explicit authenticated-test approval is given;
- selected identities are synthetic;
- no selected identity is Johnny;
- no selected workspace is production-facing;
- rollback and cleanup behavior are documented;
- browser or client sessions are clearly labeled by test identity.

## Test record convention

Use visibly synthetic values.

Example:

```text
title = SYNTHETIC TEST GOAL A
why_it_matters = Synthetic RLS validation only
next_step = Record one synthetic verification result
goal_area = synthetic_testing
progress_status = not_started
ownership_source = participant
```

Never use clinical narratives, real financial information, personal recovery details, Trust Engine records, or live participant explanations.

## Evidence model

For every test, record:

- test number;
- authenticated identity;
- workspace ID;
- program ID;
- supported-person ID;
- attempted action;
- expected result;
- actual result;
- database error or response code;
- row count before and after;
- pass, fail, or stop;
- explanation;
- conclusion.

A displayed row is evidence of database behavior only. It does not establish intent, responsibility, capacity, compliance, recovery status, or any clinical, legal, or fiduciary conclusion.

## Test sequence

### T01 — Baseline absence

**Actor:** workspace admin or read-only catalog session  
**Action:** confirm no preexisting synthetic Goals rows exist for the selected participants.  
**Expected:** zero matching rows.

Stop if unexplained Goals rows already exist.

### T02 — Participant A self-select before create

**Actor:** Participant A  
**Action:** select Goals in Participant A's active workspace/program scope.  
**Expected:** no rows or only previously approved synthetic rows belonging to Participant A.

Participant A must not see Participant D rows.

### T03 — Valid Participant A insert

**Actor:** Participant A  
**Action:** insert one participant-owned synthetic Goal using Participant A's own supported-person, program, and workspace scope.  
**Expected:** insert succeeds.

Required persisted boundaries:

```text
created_by = auth.uid()
ownership_source = participant
supported_person_id = Participant A
progress_status = not_started
archived_at = null
```

### T04 — Wrong creator denial

**Actor:** Participant A  
**Action:** attempt an insert with `created_by` set to another auth user.  
**Expected:** denied.

No row created.

### T05 — Wrong supported-person denial

**Actor:** Participant A  
**Action:** attempt to insert a Goal owned by Participant D.  
**Expected:** denied.

No row created.

### T06 — Wrong workspace/program denial

**Actor:** Participant A  
**Action:** attempt to use a mismatched workspace and program.  
**Expected:** denied.

No row created.

### T07 — Staff-suggestion participant insert denial

**Actor:** Participant A  
**Action:** attempt insert with `ownership_source = staff_suggestion`.  
**Expected:** denied.

No row created and no silent conversion to participant ownership.

### T08 — Participant D cross-person select denial

**Actor:** Participant D  
**Action:** attempt to read Participant A's Goal.  
**Expected:** zero visible rows.

### T09 — Outsider select denial

**Actor:** Outsider  
**Action:** attempt to read Participant A's Goal.  
**Expected:** zero visible rows.

### T10 — Participant A content update

**Actor:** Participant A  
**Action:** update title, why-it-matters, next step, goal area, or progress status on their own Goal.  
**Expected:** allowed.

Identity and provenance fields remain unchanged.

### T11 — Immutable-field update denial

**Actor:** Participant A  
**Action:** attempt to change any of:

- workspace ID;
- program ID;
- supported-person ID;
- ownership source;
- created-by;
- created-at.

**Expected:** denied.

Original row remains unchanged.

### T12 — Participant archive

**Actor:** Participant A  
**Action:** set `progress_status = archived`.  
**Expected:** allowed.

Expected row state:

```text
progress_status = archived
archived_at = populated
updated_at = advanced
```

### T13 — Participant reactivation denial

**Actor:** Participant A  
**Action:** attempt to move archived Goal back to an active status.  
**Expected:** denied.

The Goal remains archived.

### T14 — Workspace-admin read

**Actor:** Workspace admin  
**Action:** read Participant A's Goal in the admin's workspace.  
**Expected:** allowed.

No access outside the admin's workspace.

### T15 — Workspace-admin reactivation

**Actor:** Workspace admin  
**Precondition:** Participant A remains actively participating in the program.  
**Action:** move archived Goal back to an allowed active status.  
**Expected:** allowed.

Expected:

```text
archived_at = null
updated_at = advanced
```

### T16 — Inactive-participation denial

**Actor:** Participant A and workspace admin  
**Precondition:** use a separately approved synthetic inactive-participation fixture.  
**Action:** attempt participant read/write and admin lifecycle update.  
**Expected:** denied where active participation is required.

Historical read behavior, if separately supported by policy, must be documented exactly rather than assumed.

### T17 — DELETE denial

**Actor:** Participant A, Participant D, outsider, and workspace admin  
**Action:** attempt DELETE.  
**Expected:** denied for every authenticated role.

No hard delete occurs.

### T18 — Cross-module non-action

**Actor:** read-only verification  
**Action:** compare relevant Wellness, Budget, Support, Reports, program participation, and Trust Engine-linked structures before and after Goals tests.  
**Expected:** no automatic change caused by Goals operations.

## Stop conditions

Stop immediately if:

- any identity can read another participant's Goal without approved authority;
- a participant can create for another supported person;
- a mismatched program/workspace write succeeds;
- `ownership_source` can be changed;
- a staff suggestion becomes a participant commitment silently;
- an archived Goal can be reactivated by the participant;
- DELETE succeeds;
- active-participation requirements are bypassed;
- archive status and `archived_at` diverge;
- any unrelated module changes;
- a real person's data appears in the synthetic test scope;
- credentials or secrets are written into evidence.

Do not continue to later tests after a stop condition.

## Cleanup model

No hard-delete cleanup is permitted during the MVP.

Preferred closeout:

1. archive synthetic Goal rows;
2. preserve test evidence;
3. label rows clearly as synthetic;
4. leave schema installed only if installation and retention are separately approved;
5. use the reviewed rollback only if full schema removal receives separate approval and no retained test evidence depends on the table.

Do not execute rollback automatically after a failed test. First document the failure and obtain approval.

## Acceptance criteria

The authenticated synthetic test pass is successful only when:

- Participant A can create, read, and update only their own participant-owned Goal;
- Participant D and outsider cannot read Participant A's Goal;
- wrong creator, person, workspace, and program writes are denied;
- staff-suggestion insert is denied;
- immutable identity and ownership fields remain protected;
- participant archive succeeds;
- participant reactivation fails;
- workspace-admin lifecycle behavior matches the active-participation boundary;
- DELETE fails;
- no unrelated module changes;
- all evidence is synthetic and complete.

## Explicitly excluded

- production participant testing;
- Johnny;
- staff-suggestion workflow;
- goal acceptance workflow;
- reminders;
- milestones;
- target dates;
- barriers;
- scoring;
- compliance judgments;
- clinical interpretation;
- relapse findings;
- capacity findings;
- legal or fiduciary conclusions;
- Trust Engine synchronization;
- UI activation;
- deployment;
- push.

## Approval checkpoints

Separate explicit approval is required for:

1. selecting exact synthetic identities;
2. installing v0.2 schema;
3. executing authenticated tests;
4. retaining or archiving synthetic rows;
5. rollback;
6. participant UI wiring;
7. deployment;
8. push.

## Exact next gate

Reconfirm and document the exact existing synthetic identities, workspace, program, and participation records to be used.

Do not install schema or create test rows during identity selection.
