# Renewing THRIVE Current Executive Handoff

**Checkpoint date:** July 25, 2026  
**Repository:** `thrive-stability-platform`  
**Branch:** `main`  
**Remote status:** local branch is substantially ahead of `origin/main`; do not push without explicit approval.

## Project Purpose

THRIVE helps one person at a time understand money, manage daily responsibilities, recognize personal patterns, and ask for support before problems become crises.

The first modeled person is Johnny.

Johnny's THRIVE personal support spine is independent from the Jutta Koster Living Trust and its Trust Engine.

## Verified Current State

### January 2025 personal financial ingestion

The January 2025 bank export has been:

- reconciled;
- hash-locked;
- dry-run validated;
- atomically imported;
- verified at 85 staged rows;
- verified at normalized total `-$12,570.54`;
- left at `ready_for_review`;
- not approved;
- not converted into trust conclusions.

A read-only reconciliation interface exists at:

```text
/financial-ingestion-january-2025/reconciliation
```

### Person-centered governance

`README.md` and `GOVERNANCE.md` have been recentered around:

- one person at a time;
- explain before flagging;
- facts, patterns, explanations, and conclusions as separate concepts;
- support without shame;
- personal growth as the outcome;
- independent systems remaining independent.

### Personal financial explanation model

A documentation model exists for future personal explanations.

No explanation table has been created.

The imported bank observation remains immutable and separate from any future personal explanation.

### Supported-person identity

The architecture model identifies a real schema gap: the database has authenticated users, workspaces, memberships, and programs, but no neutral supported-person identity.

The following artifacts exist:

- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_MODEL_v0_1.md`
- `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_SCHEMA_CANDIDATE_v0_1.sql`

The v0.1 SQL candidate has not been executed.

## Live Database Findings

The live foundation includes:

- `profiles`
- `workspaces`
- `workspace_members`
- `programs`

RLS is enabled on the foundation tables.

Existing workspace roles include:

- `admin`
- `trustee`
- `support`
- `individual`
- `viewer`

Johnny's future workspace membership should use `individual`.

Existing helper functions include:

- `is_workspace_member(uuid)`
- `is_workspace_admin(uuid)`
- `is_program_in_workspace(uuid, uuid)`

They are security-definer functions with `search_path=public`.

## Frozen Boundaries

Do not:

- create Johnny's auth account yet;
- insert Johnny's supported-person record yet;
- execute the v0.1 supported-person SQL candidate;
- create the personal financial explanation table;
- synchronize with the Trust Engine;
- merge personal and trust records;
- grant broad workspace-member access without explicit justification;
- add delete policies;
- push to remote without explicit approval.

## Exact Next Gate

Create a corrected **review-only v0.2 supported-person schema candidate** based on the live database inspection.

The candidate should include:

- `supported_people`;
- `program_participants`;
- nullable unique `auth_user_id`;
- composite scope-preserving foreign keys;
- updated-at triggers;
- RLS enabled;
- admin create and update policies;
- linked supported-person self-read policies;
- no self-create or self-update;
- no broad member read unless specifically justified;
- no delete policies;
- no Johnny insert;
- no auth-user creation;
- no explanation table;
- no Trust Engine synchronization.

## Intended Access Model

```text
DSS administrator
  -> may create and manage supported-person and participation records

Linked supported person
  -> may read their own supported-person record
  -> may read their own authorized program participation
  -> may not create, assign, edit, archive, approve, or delete those records
```

## First Action in the New Thread

Read this handoff, restate the current verified state and frozen boundaries, then inspect the existing v0.1 candidate before drafting v0.2.

Do not execute SQL.
