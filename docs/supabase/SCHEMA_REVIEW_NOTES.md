# THRIVE Schema Review Notes

## Purpose

This file documents review decisions before running schema SQL in Supabase.

The goal is to prevent avoidable security, data-model, and governance mistakes before database objects are created.

## Review Session 001

Date: 2026-06-10

Schema file reviewed:

`docs/supabase/SCHEMA_SQL_DRAFT.sql`

## Current Draft Scope

The current SQL draft includes:

- `profiles`
- `workspaces`
- `workspace_members`
- `create_workspace_with_admin()` bootstrap function
- starter RLS policies

The current SQL draft does not yet include:

- `budget_categories`
- `transactions`
- `daily_checkins`
- `support_notes`
- `reports`
- `audit_log`

## Security Review Notes

### Security Definer Function

The draft includes:

`public.create_workspace_with_admin(p_name text, p_workspace_type text)`

This function uses `security definer`.

Decision:
Keep the function, but treat it as a controlled bootstrap function only.

Reason:
The function prevents a workspace from being created without an initial admin membership.

Required safeguards confirmed in draft:

- Requires `auth.uid()`
- Rejects unauthenticated execution
- Validates `workspace_type`
- Inserts only one workspace
- Inserts only the authenticated user as initial admin
- Grants execute only to `authenticated`
- Revokes public execution

### RLS Bootstrap Concern

The workspace and membership model can create a chicken-and-egg problem if the app must create a workspace first and membership second.

Decision:
Use the bootstrap function as the preferred workspace creation path.

Reason:
This reduces the risk of orphaned workspaces and avoids relying on the app to coordinate multiple inserts correctly.

### Starter Policy Concern

The policy allowing workspace creators to insert their initial admin membership was tightened.

Decision:
Allow initial admin membership insert only when the authenticated user created the workspace.

Reason:
A user should not be able to make themselves admin of a workspace they did not create.

## Review Status

Approved for controlled first Supabase SQL test after one final syntax review.

Do not add real financial, trust, beneficiary, clinical, recovery, or personally identifying data during early testing.

Mock/test records only.

## Bootstrap Function Test 001

Tested `public.create_workspace_with_admin(text, text)` from Supabase SQL Editor.

Result:

`ERROR: P0001: Authentication required`

Interpretation:

This is an expected protective failure. The function exists and executes, but Supabase SQL Editor does not provide an authenticated app-user context through `auth.uid()`. The function correctly blocks workspace creation when no authenticated user is present.

Decision:

Do not weaken the function for SQL Editor convenience. Future successful testing should occur through an authenticated app route, Supabase Auth session, or a separate controlled development-only test method.


## RLS Recursion Fix 001

Issue:

After authenticated workspace creation succeeded, loading visible workspace records failed with:

`infinite recursion detected in policy for relation "workspace_members"`

Cause:

The original `workspace_members` policies checked `workspace_members` from inside policies already being evaluated on `workspace_members`. This caused recursive RLS evaluation.

Resolution:

Added SECURITY DEFINER helper functions:

- `public.is_workspace_member(uuid)`
- `public.is_workspace_admin(uuid)`

These functions check membership/admin status without causing policy recursion.

Updated RLS policies now call these helper functions instead of directly querying `workspace_members` inside recursive policy paths.

Result:

Authenticated user `derek@dssenterprisesusa.llc` successfully loaded the created workspace through the RLS-protected application path.

Confirmed visible workspace:

- Workspace name: `THRIVE Demo Workspace`
- Workspace ID: `38b3064f-f415-46a4-b204-a19ac6911cd4`
- Workspace type/status: `personal / active`

Security decision:

Do not weaken RLS for app convenience. Use helper functions for safe policy checks. Keep all early data mock/test only.