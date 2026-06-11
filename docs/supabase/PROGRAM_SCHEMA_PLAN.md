# THRIVE Program Schema Plan

## Purpose

This file defines the planned program layer for the THRIVE Stewardship & Stability Platform.

This is a planning document only. It does not create tables by itself.

No Supabase tables, policies, or functions should be created from this plan until the program schema and RLS design are reviewed and accepted.

## Current Build Position

THRIVE already has the following foundation in place:

* Supabase email/password authentication.
* Workspace records.
* Workspace membership records.
* Workspace-scoped RLS proof.
* Workspace selector.
* Browser-local selected workspace persistence.
* Dashboard listener for selected workspace context.

The next architectural layer is:

```text
Workspace → Program → Future Records
```

## Program Layer Definition

A program is a workspace-scoped operating lane used to organize mock/test or approved support activity under a clear purpose.

A program helps THRIVE separate different support contexts inside one workspace before sensitive records are created.

A program does not create legal, clinical, fiduciary, credit repair, bankruptcy, investment, or crisis-service authority. It is an organizational support lane only.

## Approved Initial Program Types

The initial approved `program_type` values are:

| Program Type        | Purpose                                                                                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `demo`              | Used for mock/testing only. This keeps development data clearly separated from anything real.                                                                                                                 |
| `stability_support` | Used for personal financial stability, essentials-first budgeting, spending awareness, and general support-team summaries.                                                                                    |
| `trust_stewardship` | Used for trust-related support workflows where DSS may help organize reporting, receipts, disbursement planning, documentation, and oversight support while the trustee remains the fiduciary decision-maker. |

## Recommended Table: `programs`

Purpose:
Stores workspace-scoped program records.

Planned columns:

| Column       | Type        | Notes                                                            |
| ------------ | ----------- | ---------------------------------------------------------------- |
| id           | uuid        | Primary key                                                      |
| workspace_id | uuid        | References `workspaces(id)`                                      |
| program_name | text        | Program display name                                             |
| program_type | text        | Allowed values: `demo`, `stability_support`, `trust_stewardship` |
| status       | text        | Example: `active`, `paused`, `archived`                          |
| description  | text        | Optional program description                                     |
| created_by   | uuid        | References `auth.users(id)`                                      |
| created_at   | timestamptz | Creation timestamp                                               |
| updated_at   | timestamptz | Update timestamp                                                 |

## Initial Status Values

The initial approved `status` values are:

| Status     | Purpose                                                                                       |
| ---------- | --------------------------------------------------------------------------------------------- |
| `active`   | Program is currently available for use.                                                       |
| `paused`   | Program is temporarily inactive but retained.                                                 |
| `archived` | Program is retained for historical or audit purposes and should not be used for new activity. |

## Security Direction

Programs must be workspace-scoped.

A signed-in user may only access a program if:

1. The program belongs to a workspace.
2. The user has active membership in that workspace.
3. Supabase RLS allows the action.
4. The action is appropriate for the user’s workspace role.

Programs must not be globally visible.

Program creation and management should be limited to workspace admins or approved roles.

## RLS Planning Direction

Initial RLS policy direction for `programs`:

| Action        | Direction                                                                |
| ------------- | ------------------------------------------------------------------------ |
| Read/select   | Active workspace members may read programs in their assigned workspaces. |
| Insert/create | Workspace admins may create programs in workspaces they manage.          |
| Update        | Workspace admins may update program name, type, status, and description. |
| Delete        | Avoid hard delete during MVP. Prefer archive status.                     |

## MVP Boundary

During MVP development:

* Program records must use mock/test data only.
* No real financial, trust, beneficiary, clinical, recovery, or personally identifying records should be entered.
* Program records should only establish organizational structure.
* Program records should not contain sensitive case narratives.
* Program records should not contain transaction details.
* Program records should not contain clinical, legal, fiduciary, credit repair, bankruptcy, investment, or crisis-service conclusions.

## First Test Program Recommendation

For initial testing, create one safe demo program:

| Field        | Value                                                               |
| ------------ | ------------------------------------------------------------------- |
| program_name | THRIVE Demo Program                                                 |
| program_type | `demo`                                                              |
| status       | `active`                                                            |
| description  | Mock/test program used to verify workspace-scoped program behavior. |

After the demo program is proven, a second mock program may be created:

| Field        | Value                                                                          |
| ------------ | ------------------------------------------------------------------------------ |
| program_name | Trust Stewardship Demo                                                         |
| program_type | `trust_stewardship`                                                            |
| status       | `active`                                                                       |
| description  | Mock trust-stewardship support lane used for development and RLS testing only. |

## Future Relationship Direction

Future tables should reference both `workspace_id` and, where appropriate, `program_id`.

Likely future program-scoped tables include:

* `budget_categories`
* `transactions`
* `daily_checkins`
* `support_notes`
* `reports`
* `audit_log`

The purpose is to keep future records tied to a clear operating lane instead of attaching everything directly to the workspace.

## Deferred Decisions

The following decisions are deferred:

* Whether every future table must include `program_id`.
* Whether a workspace can have multiple active programs of the same type.
* Whether program membership needs a separate table beyond workspace membership.
* Whether support consent should be workspace-level, program-level, or both.
* Whether reports should always be program-scoped.
* Whether archived programs should remain visible to all workspace admins.

## Current Decision

Proceed with a separate `PROGRAM_SCHEMA_PLAN.md` before changing the main `SCHEMA_PLAN.md`.

Do not create Supabase program tables yet.

Do not run SQL yet.

Do not enter real data.

The program layer should be planned and reviewed before implementation.

## Session Notes

### Program Schema Session 001

Created separate program schema planning document after deciding that the safer path is to avoid large edits inside the existing `SCHEMA_PLAN.md`.

Security:
Mock/test only. Program planning does not authorize real financial, trust, beneficiary, clinical, recovery, or personally identifying data entry.
