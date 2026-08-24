# THRIVE System Governance Checkpoint Candidate v0.1

Date: 2026-08-24
Status: Review-only candidate
Repository: `Derekdog689/thrive-stability-platform`
Branch: `main`

## Purpose

THRIVE has reached a point where its currently verified database and application behavior has earned a formal known-good baseline marker.

This candidate proposes the smallest possible database governance ledger for recording that state without turning the database into a documentation warehouse.

The repository remains the detailed evidence store. The database checkpoint is the concise system-of-record marker that says: this explicitly verified state was trusted at this point in time.

## What a freeze means

A THRIVE freeze does **not** mean:

- the product is finished;
- the schema can never change;
- a future defect cannot be found;
- later versions cannot supersede this baseline;
- every area of the platform has been commercially validated;
- every possible actor/path has been tested.

A THRIVE freeze **does** mean:

> The architecture, authority boundaries, lifecycle behavior, and product surfaces explicitly listed in the checkpoint have been reconciled against live database truth and documented runtime evidence and are considered trustworthy for that verified scope as of the recorded point in time.

Future change proceeds through new documented gates and, when appropriate, a later superseding checkpoint.

## Design principle

Keep the database checkpoint concise.

The DB should hold the brass plaque. The repository should hold the evidence room.

Do not duplicate long closeout documents, test transcripts, or implementation history into the database.

## Proposed table

Candidate table name:

`system_checkpoints`

Candidate columns:

- `id uuid primary key default gen_random_uuid()`
- `checkpoint_name text not null`
- `version text not null`
- `status text not null`
- `scope text not null`
- `summary text not null`
- `repo_commit text`
- `evidence_paths text[]`
- `recorded_at timestamptz not null default now()`
- `recorded_by uuid`
- `notes text`
- `supersedes_checkpoint_id uuid null references system_checkpoints(id)`

Candidate uniqueness:

- unique `(checkpoint_name, version)`

Candidate status values:

- `candidate`
- `frozen`
- `superseded`
- `archived`

No hard delete is proposed.

## Authority model candidate

Initial v0.1 authority should be narrow:

- authenticated ordinary participants: no direct insert/update/delete;
- support members: no direct insert/update/delete;
- workspace admins: no generic client-side mutation merely because they are workspace admins;
- checkpoint creation should occur only through a separately reviewed administrative path after explicit approval;
- no service-role client in participant/admin product UI;
- no PUBLIC mutation privileges;
- no hard DELETE grant.

Because this is a system-level governance ledger rather than ordinary workspace content, implementation authority should be reviewed separately before installation.

This candidate deliberately does **not** assume existing workspace-admin authority should govern system freezes.

## Proposed first checkpoint

Candidate checkpoint name:

`THRIVE_SYSTEM_BASELINE_V1`

Candidate version:

`v1.0.0`

Candidate status:

`frozen`

Candidate scope:

`Supported-person THRIVE platform through Resources Slice B`

Candidate summary:

> Known-good supported-person THRIVE platform baseline. Live database structure, authenticated authority boundaries, participant lifecycle surfaces, and documented cross-domain behavior have been reconciled against production application behavior for the explicitly verified scope. Future versions may evolve through documented gates; this record preserves the trusted state at this point in time.

Candidate repo checkpoint:

`42f5d2fe622ce9252a8cef835851debec372d143`

Candidate evidence paths include:

- `docs/BUILD_CHECKPOINTS.md`
- Resources install/verification documentation
- Resources Slice A closeout
- Resources Slice B implementation candidate
- Resources Slice B closeout
- existing supported-person, budget, wellness, goals, and Support closeout/verification documentation already present in the repository

The final evidence list must be reconciled from the repository before installation rather than fabricated or guessed.

## Verified scope intended for baseline

The first baseline is intended to summarize already-proven areas, not create new claims.

Candidate scope categories:

1. supported-person identity and program participation spine;
2. authenticated participant/admin/support authority boundaries already runtime-tested;
3. participant financial capability surfaces and installed budget/financial data model already verified in prior gates;
4. participant wellness flow already verified in prior gates;
5. participant goals lifecycle already verified in prior gates;
6. Support request lifecycle and authenticated role behavior already verified;
7. Resources RLS/RPC model and participant read surface;
8. Resources-to-Support participant-initiated context bridge through Slice B;
9. non-destructive lifecycle semantics used throughout current MVP.

Before installation, each included category must be tied to repository evidence and/or a current live DB verification query.

## Explicitly outside the first baseline

The first checkpoint must not be read as approval or verification of:

- commercial deployment;
- SPR institutional adoption;
- MOU or external organizational authority;
- Trust Engine synchronization;
- legal, clinical, fiduciary, credit, bankruptcy, or investment decision-making;
- production Resource content ingestion beyond the controlled synthetic validation fixture;
- admin Resources maintenance UI;
- any real supported person not separately onboarded under documented authority;
- future system behavior after the checkpoint date.

## Relationship to synthetic/demo records

Creating a system checkpoint does not archive or mutate current synthetic/demo workspaces, programs, people, or test evidence.

Any later transition to limited live use should be a separate gated operation.

Existing lifecycle statuses already support non-destructive retirement:

- workspaces: `active / paused / archived`;
- programs: `active / paused / archived`;
- supported_people: `active / paused / archived`;
- program_participants: `active / inactive / completed`;
- workspace_members: `active / inactive / removed`.

No synthetic record cleanup is part of this candidate.

## Candidate installation sequence

If this candidate is later approved for implementation:

1. inspect repository evidence paths and live schema again;
2. prepare SQL candidate only;
3. review authority/RLS/privilege model;
4. approve installation separately;
5. install the ledger table and constraints only;
6. verify table/RLS/privileges/functions as applicable;
7. prepare the first checkpoint row as a separate reviewed candidate;
8. approve checkpoint recording separately;
9. insert the baseline record;
10. verify exact stored scope, commit, evidence pointers, and status;
11. document and commit the governance closeout.

No step may silently collapse schema installation and baseline recording into one approval.

## Exact next gate

Do not install this candidate now.

Resume the approved read-only live database architecture walkthrough.

After the DB walkthrough is complete:

- reconcile the complete evidence set;
- revise this candidate if the walkthrough surfaces missing scope or architectural caveats;
- then decide whether to move to a SQL candidate for `system_checkpoints`.

Local SSD / VS Code sync remains a separate personal workstation step to perform at a clean repository checkpoint after the walkthrough.
