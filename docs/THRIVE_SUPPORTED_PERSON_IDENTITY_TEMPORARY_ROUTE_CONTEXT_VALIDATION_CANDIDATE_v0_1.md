# THRIVE Supported-Person Identity Temporary Route Context-Validation Candidate v0.1

## Status

Review-only route correction candidate.

This document proposes the smallest change needed to prevent stale browser
workspace or program identifiers from being displayed or used when they are not
visible to the currently authenticated user.

It does not authorize:

- modification of the temporary route;
- database schema or policy changes;
- write testing;
- lifecycle changes;
- fixture cleanup;
- profile creation;
- Johnny onboarding;
- Trust Engine access or synchronization;
- push, merge, or deployment.

## Governing Checkpoints

```text
Repository: thrive-stability-platform
Branch: main

Authenticated read-test validation commit:
2729d9c

Outsider workspace-context finding commit:
ca84944
```

## Verified Problem

The temporary route currently reads:

```text
thrive:selectedWorkspaceId
thrive:selectedProgramId
```

directly from browser local storage.

It then displays those identifiers and uses them as optional query filters
without first confirming that the current authenticated user can read the
corresponding workspace or program.

During outsider test R6, a workspace UUID left by a prior test identity remained
visible in the browser context.

No protected supported-person or participation rows were exposed.

## Candidate Objective

Validate stored workspace and program context against records visible through
the current authenticated Supabase session before displaying or using those
identifiers.

## Proposed Workspace Validation

After authentication succeeds:

1. Read the stored workspace UUID from local storage.
2. Query `public.workspaces` through the shared authenticated Supabase client.
3. Request only the minimum fields required for validation:
   - `id`
   - `name`
   - `workspace_type`
   - `status`
4. Determine whether the stored UUID appears in the visible workspace result.
5. Retain the stored UUID only when it is visible.
6. Otherwise:
   - clear the route workspace state;
   - remove `thrive:selectedWorkspaceId` from local storage;
   - clear the route program state;
   - remove `thrive:selectedProgramId` from local storage.

RLS remains the authority for workspace visibility.

## Proposed Program Validation

When a validated workspace exists:

1. Read the stored program UUID from local storage.
2. Query `public.programs` through the authenticated client.
3. Filter by the validated workspace UUID.
4. Request only:
   - `id`
   - `workspace_id`
   - `program_name`
   - `program_type`
   - `status`
5. Retain the stored program UUID only when it appears in the visible program
   result.
6. Otherwise:
   - clear the route program state;
   - remove `thrive:selectedProgramId` from local storage.

RLS remains the authority for program visibility.

## Proposed Query Boundary

Supported-person and participation queries must run only after context
validation completes.

The route must not:

- trust an unvalidated stored UUID;
- display an unvalidated workspace UUID;
- display an unvalidated program UUID;
- import a service-role credential;
- bypass RLS;
- write to supported-person or participation tables;
- create profiles;
- query Johnny or Trust Engine data.

## Proposed User-Facing Behavior

When no validated workspace is visible:

```text
Workspace context:
No workspace selected

Program context:
No program selected

Supported-person rows:
0

Participation rows:
0
```

When a workspace is valid but the stored program is not:

```text
Workspace context:
validated visible workspace

Program context:
No program selected
```

The route may explain that stale browser context was cleared, but it must not
suggest that stale context represented database authority.

## Candidate Code Scope

Proposed file:

```text
src/app/supported-person-test/page.tsx
```

No other application file is included unless inspection proves a shared helper
is necessary.

Preferred scope:

- one route file;
- no schema changes;
- no SQL;
- no new RPC;
- no service-role use;
- no write controls;
- no navigation changes.

## Proposed Verification Matrix

### V1 Administrator

Expected:

- controlled workspace retained;
- controlled program retained;
- two supported-person rows;
- two participation rows.

### V2 Supported Person A

Expected:

- controlled workspace retained;
- controlled program retained;
- Test A only;
- participation A only.

### V3 Supported Person B

Expected:

- controlled workspace retained;
- controlled program retained;
- Test B only;
- participation B only.

### V4 Support Member

Expected:

- controlled workspace retained when visible through workspace RLS;
- controlled program retained when visible through program RLS;
- zero supported-person rows;
- zero participation rows.

### V5 Viewer Member

Expected:

- controlled workspace retained when visible through workspace RLS;
- controlled program retained when visible through program RLS;
- zero supported-person rows;
- zero participation rows.

### V6 Outsider With Stale Browser Context

Precondition:

```text
thrive:selectedWorkspaceId =
71000000-0000-4000-8000-000000000001

thrive:selectedProgramId =
71000000-0000-4000-8000-000000000002
```

Expected:

- stored workspace UUID rejected as not visible;
- stored workspace key removed or ignored;
- stored program key removed or ignored;
- workspace context shows no selection;
- program context shows no selection;
- zero supported-person rows;
- zero participation rows.

## Required Static Checks

Before any route-use approval:

```text
npx eslint src/app/supported-person-test/page.tsx
npm run build
```

Also verify:

- no insert, update, upsert, delete, or RPC call;
- no service-role import;
- no Johnny or Trust Engine query;
- only authenticated client reads;
- route remains explicitly temporary and read-only.

## Failure Stop Rules

Stop if:

- an unauthorized workspace or program remains displayed;
- outsider context is retained after validation;
- any actor loses access they previously passed without an explained policy
  reason;
- any protected row becomes visible to support, viewer, or outsider;
- person A sees person B;
- person B sees person A;
- any write occurs;
- any service-role credential is introduced;
- any Johnny or Trust Engine data appears.

Do not weaken RLS to make the route test pass.

## Candidate Classification

```text
Database policy change: no
Schema change: no
SQL execution: no
Route candidate: yes
Read-only authenticated queries: yes
Local-storage cleanup candidate: yes
Protected-data write: no
```

## Approval Status

```text
Context-validation candidate prepared for review.
Route source has not been modified.
No new authenticated route test has begun.
No write testing has been approved.
No lifecycle or cleanup action has been approved.
Johnny onboarding has not been approved.
Trust Engine synchronization has not been approved.
```

## Next Gate

Review and commit this candidate document.

After that documentation checkpoint, explicit approval may be requested to
modify only `src/app/supported-person-test/page.tsx` according to this candidate.

Do not modify the route during this documentation gate.
