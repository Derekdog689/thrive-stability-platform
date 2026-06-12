# THRIVE Budget Categories RLS Test Plan

## Purpose

This file defines the planned test path for verifying budget-category Row Level Security (RLS) in the THRIVE Stewardship & Stability Platform.

This is a planning document only.

No Supabase SQL should be executed from this file.

No real financial, trust, beneficiary, clinical, recovery, or personally identifying data should be entered during this test phase.

## Current Build Position

The budget category layer has been planned in:

- docs/supabase/BUDGET_CATEGORIES_PLAN.md
- docs/supabase/BUDGET_CATEGORIES_SQL_DRAFT.sql

The budget category SQL draft has not yet been executed in Supabase.

The current application already proves:

- Supabase email/password authentication works.
- Workspace records are visible only through authenticated RLS.
- Program records are visible only through authenticated RLS.
- Workspace selection persists in browser localStorage.
- Program selection persists in browser localStorage.
- The dashboard listens to both workspace context and program context.

## Test Objective

The purpose of budget category RLS testing is to prove that budget category records are safely scoped to authenticated workspace and program access.

The test must answer:

1. Can an authenticated workspace admin create a mock budget category for a program?
2. Can the same workspace admin read budget categories inside the selected workspace and program?
3. Can a signed-in user without workspace membership see no budget category records?
4. Can an anonymous visitor see no budget category records?
5. Can budget category records remain mock/test only during development?
6. Does the system prevent a budget category from being attached to a program outside the selected workspace?

## Table Under Test

Planned table:

- public.budget_categories

Planned category types:

- protected
- flexible
- support
- reserve

Relationship:

- workspaces
- programs
- budget_categories

## Required Security Assumptions

Budget category RLS testing assumes the following helper functions exist or will be created by the SQL draft:

- public.is_workspace_member(p_workspace_id uuid)
- public.is_workspace_admin(p_workspace_id uuid)
- public.is_program_in_workspace(p_program_id uuid, p_workspace_id uuid)

The first two functions were created during workspace RLS work.

The third function is planned in the budget category SQL draft and verifies that a selected program belongs to the selected workspace.

## Test Roles

### 1. Anonymous Visitor

Description: A user who is not signed into the THRIVE application.

Expected result: Anonymous visitors should not see budget category records.

Expected behavior:

- Cannot load budget categories.
- Cannot create budget categories.
- Cannot update budget categories.
- Cannot read budget category data.

### 2. Authenticated User Without Workspace Membership

Description: A signed-in user who exists in Supabase Auth but is not assigned to the relevant workspace.

Expected result: The user should not see budget categories for that workspace or program.

Expected behavior:

- Cannot read budget categories outside assigned workspace.
- Cannot create budget categories for workspaces where they are not an admin.
- Cannot update budget categories outside assigned workspace.

### 3. Authenticated Workspace Member

Description: A signed-in user with active membership in the workspace.

Expected result: The user may read visible budget category records in the assigned workspace, subject to MVP role rules.

Expected behavior:

- Can read budget categories in assigned workspace.
- Cannot create budget categories unless role allows creation.
- Cannot update budget categories unless role allows management.
- Cannot see categories from unrelated workspaces.

### 4. Workspace Admin

Description: A signed-in user with active admin role in the workspace.

Expected result: The workspace admin may create and manage mock/test budget categories in that workspace and program.

Expected behavior:

- Can create mock/test budget categories for active programs in assigned workspace.
- Can read budget categories in assigned workspace and selected program.
- Can update category name, type, planned amount, spent amount, remaining amount, sort order, and active status.
- Cannot hard-delete categories during MVP.
- Should deactivate categories using is_active = false if needed.

## Initial Test Records

Only mock/test records may be created.

### Test Category 001

- category_name: Housing
- category_type: protected
- planned_amount: 1200.00
- spent_amount: 1200.00
- expected_remaining_amount: 0.00
- sort_order: 1
- is_active: true

### Test Category 002

- category_name: Food
- category_type: protected
- planned_amount: 400.00
- spent_amount: 125.00
- expected_remaining_amount: 275.00
- sort_order: 2
- is_active: true

### Test Category 003

- category_name: Flexible Spending
- category_type: flexible
- planned_amount: 300.00
- spent_amount: 210.00
- expected_remaining_amount: 90.00
- sort_order: 3
- is_active: true

### Test Category 004

- category_name: Emergency Reserve
- category_type: reserve
- planned_amount: 500.00
- spent_amount: 0.00
- expected_remaining_amount: 500.00
- sort_order: 4
- is_active: true

## Application Test Path

After SQL execution is approved and completed, create a temporary test page:

- src/app/budget-test/page.tsx

The test page should allow a signed-in user to:

1. Confirm active Supabase session.
2. Load visible workspaces.
3. Load visible programs under the selected workspace.
4. Select a program.
5. Create mock/test budget categories through the controlled SQL function.
6. Load visible budget categories from public.budget_categories.
7. Confirm categories are scoped to the selected workspace and selected program.
8. Display a clear mock/test-only security warning.

## Expected Success Criteria

Budget category RLS testing is successful when:

- Anonymous users cannot access budget category records.
- Signed-out users cannot access budget category records.
- Signed-in users without workspace membership cannot access unrelated category records.
- Workspace members can read categories only for assigned workspaces.
- Workspace admins can create mock/test categories for assigned workspaces and active programs.
- The controlled SQL function prevents a category from being attached to a program outside the selected workspace.
- Budget category records display correctly through the application.
- Remaining amount is calculated correctly by the controlled function.
- No real financial, trust, beneficiary, clinical, recovery, or personally identifying data is entered.
- No hard-delete workflow is introduced during MVP.

## Manual Supabase Checks

After SQL execution, verify in Supabase:

- public.budget_categories exists.
- RLS is enabled on public.budget_categories.
- Budget category policies exist.
- Budget category indexes exist.
- Category type and amount constraints exist.
- public.is_program_in_workspace(...) exists.
- public.create_budget_category_for_program(...) exists if approved.
- Function execution is granted only to authenticated users.

## App-Based RLS Checks

RLS should be verified through app behavior, not only through the Supabase SQL Editor.

Reason: The Supabase SQL Editor does not prove the same access path as an authenticated application user.

Required app checks:

- Sign in as workspace admin.
- Select visible workspace.
- Select visible program.
- Create mock budget category.
- Load visible budget categories.
- Confirm categories belong to selected workspace and selected program.
- Sign out.
- Confirm category access is blocked.
- Later, test a second authenticated user without membership.

## Security Boundary

During this phase:

- No real bank data.
- No real trust ledger data.
- No real beneficiary data.
- No clinical or recovery records.
- No private case notes.
- No document uploads.
- No receipt uploads.
- No service role usage in the client app.
- No public access to sensitive records.

Budget categories are planning and visibility tools only.

## Legal and Ethical Boundary

Budget categories must not be represented as:

- Legal advice
- Fiduciary decision-making
- Financial advisory services
- Investment advice
- Credit repair
- Bankruptcy advice
- Clinical treatment
- Crisis intervention
- Control over another person’s money

THRIVE may support organization, reporting, planning, and clarity. Authorized decision-makers remain responsible for final decisions.

## Deferred Tests

The following tests are deferred:

- Category history tracking.
- Monthly budget periods.
- Program-specific membership rules.
- Support-user edit permissions.
- Trustee-only category visibility.
- Individual-facing category visibility.
- Receipt linkage.
- Transaction linkage.
- Archive and restore workflow.
- Audit logging for category actions.

## Current Decision

Do not execute budget category SQL until this test plan is accepted.

Do not create budget category records until the SQL draft is reviewed.

Do not connect dashboard cards to budget category records until budget category RLS is proven through the application.

## Session Notes

### Budget Categories RLS Test Session 001

Created budget category RLS test plan before executing the budget category SQL draft.

Purpose: Define what must be proven after the budget_categories table is created.

Security: Mock/test only. Budget category RLS testing does not authorize real financial, trust, beneficiary, clinical, recovery, or personally identifying data entry.
