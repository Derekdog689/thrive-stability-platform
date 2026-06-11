# THRIVE Program RLS Test Plan

## Purpose

This file defines the planned test path for verifying program-level Row Level Security (RLS) in the THRIVE Stewardship & Stability Platform.

This is a planning document only.

No Supabase SQL should be executed from this file.

No real financial, trust, beneficiary, clinical, recovery, or personally identifying data should be entered during this test phase.

## Current Build Position

The program layer has been planned in:

* `docs/supabase/PROGRAM_SCHEMA_PLAN.md`
* `docs/supabase/PROGRAM_SCHEMA_SQL_DRAFT.sql`

The SQL draft has not yet been executed in Supabase.

The current application already proves:

* Supabase email/password authentication works.
* Workspace records are visible only through authenticated access.
* Workspace membership and RLS behavior have been tested through the app.
* Workspace selection persists in browser `localStorage`.
* The dashboard listens for selected workspace context.

## Test Objective

The purpose of program RLS testing is to prove that program records are safely scoped to authenticated workspace access.

The test must answer:

1. Can an authenticated workspace admin create a program?
2. Can the same workspace admin read programs inside their assigned workspace?
3. Can a signed-in user without workspace membership see no program records?
4. Can an anonymous visitor see no program records?
5. Can program records remain mock/test only during development?

## Program Table Under Test

Planned table:

```text
public.programs
```

Planned program types:

```text
demo
stability_support
trust_stewardship
```

Planned statuses:

```text
active
paused
archived
```

## Required Security Assumptions

Program RLS testing assumes the following workspace helper functions already exist:

```text
public.is_workspace_member(p_workspace_id uuid)
public.is_workspace_admin(p_workspace_id uuid)
```

These helper functions are used to avoid recursive RLS problems when checking workspace access.

## Test Roles

### 1. Anonymous Visitor

Description:
A user who is not signed into the THRIVE application.

Expected result:
Anonymous visitors should not see program records.

Expected behavior:

* Cannot select programs.
* Cannot create programs.
* Cannot update programs.
* Cannot read program data.

### 2. Authenticated User Without Workspace Membership

Description:
A signed-in user who exists in Supabase Auth but is not assigned to the relevant workspace.

Expected result:
The user should not see programs for that workspace.

Expected behavior:

* Cannot read programs outside assigned workspace.
* Cannot create programs for workspaces where they are not an admin.
* Cannot update programs outside assigned workspace.

### 3. Authenticated Workspace Member

Description:
A signed-in user with active membership in the workspace.

Expected result:
The user may read visible program records in the assigned workspace.

Expected behavior:

* Can read programs in assigned workspace.
* Cannot create programs unless role allows creation.
* Cannot update programs unless role allows management.
* Cannot see programs from unrelated workspaces.

### 4. Workspace Admin

Description:
A signed-in user with active `admin` role in the workspace.

Expected result:
The workspace admin may create and manage programs in that workspace.

Expected behavior:

* Can create mock/test programs.
* Can read programs in assigned workspace.
* Can update program name, type, status, and description.
* Cannot hard-delete programs during MVP.
* Should archive programs instead of deleting them.

## Initial Test Records

Only mock/test records may be created.

### Test Program 001

| Field        | Value                                                               |
| ------------ | ------------------------------------------------------------------- |
| program_name | THRIVE Demo Program                                                 |
| program_type | `demo`                                                              |
| status       | `active`                                                            |
| description  | Mock/test program used to verify workspace-scoped program behavior. |

### Test Program 002

| Field        | Value                                                                          |
| ------------ | ------------------------------------------------------------------------------ |
| program_name | Trust Stewardship Demo                                                         |
| program_type | `trust_stewardship`                                                            |
| status       | `active`                                                                       |
| description  | Mock trust-stewardship support lane used for development and RLS testing only. |

## Application Test Path

After SQL execution is approved and completed, create a temporary test page:

```text
src/app/program-test/page.tsx
```

The test page should allow a signed-in user to:

1. Confirm active Supabase session.
2. Load visible workspaces.
3. Select one visible workspace.
4. Create a mock/test program through the approved SQL function or controlled insert path.
5. Load visible programs from `public.programs`.
6. Confirm only programs for accessible workspaces are visible.
7. Display a clear mock/test-only security warning.

## Expected Success Criteria

Program RLS testing is successful when:

* Anonymous users cannot access program records.
* Signed-out users cannot access program records.
* Signed-in users without workspace membership cannot access unrelated program records.
* Workspace members can read programs only for assigned workspaces.
* Workspace admins can create mock/test programs for assigned workspaces.
* Program records display correctly through the application.
* No real financial, trust, beneficiary, clinical, recovery, or personally identifying data is entered.
* No hard-delete workflow is introduced during MVP.

## Manual Supabase Checks

After SQL execution, verify in Supabase:

* `public.programs` exists.
* RLS is enabled on `public.programs`.
* Program policies exist.
* Program indexes exist.
* Program type and status constraints exist.
* Program creation function exists if approved.
* Function execution is granted only to authenticated users.

## App-Based RLS Checks

RLS should be verified through app behavior, not only through the Supabase SQL Editor.

Reason:
The Supabase SQL Editor does not prove the same access path as an authenticated application user.

Required app checks:

* Sign in as workspace admin.
* Create mock program.
* Load visible programs.
* Sign out.
* Confirm program access is blocked.
* Later, test a second authenticated user without membership.

## Security Boundary

During this phase:

* No real trust data.
* No real beneficiary data.
* No real financial transaction data.
* No clinical or recovery records.
* No private case notes.
* No document uploads.
* No bank imports.
* No service role usage in the client app.
* No public access to sensitive records.

Programs are organizational support lanes only.

## Deferred Tests

The following tests are deferred:

* Program-specific membership.
* Program-level consent.
* Program-level report permissions.
* Support-team visibility boundaries.
* Trustee-only visibility rules.
* Beneficiary-facing summaries.
* Multi-workspace program conflict testing.
* Archive and restore workflow.
* Audit logging for program actions.

## Current Decision

Do not execute program SQL until this test plan is accepted.

Do not create program records until the program SQL draft is reviewed.

Do not connect future sensitive tables to programs until program-level RLS is proven through the application.

## Session Notes

### Program RLS Test Session 001

Created program RLS test plan before executing the program SQL draft.

Purpose:
Define what must be proven after the `programs` table is created.

Security:
Mock/test only. Program RLS testing does not authorize real financial, trust, beneficiary, clinical, recovery, or personally identifying data entry.
