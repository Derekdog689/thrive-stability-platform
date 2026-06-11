# THRIVE Supabase Schema Plan

## Purpose

This file defines the planned clean Supabase schema for the THRIVE Stewardship & Stability Platform.

This is a planning document only. It does not create tables by itself.

No database tables should be created until this schema plan is reviewed and accepted.

## Current Database Direction

THRIVE will use the clean Supabase project:

`thrive-stewardship-stability-platform`

The prior legacy/trust database is not the THRIVE production foundation.

## Schema Principles

THRIVE will be built from scratch using these rules:

1. RLS from the beginning.
2. Mock/test data first.
3. No real financial, beneficiary, recovery, or support data during early build.
4. Every sensitive record must belong to a workspace.
5. Every user-facing data path must have a role boundary.
6. App-facing tables should use clean column names.
7. Raw import/staging tables should not power the public UI.
8. Audit fields should be included early, not glued on later.

## Core Access Model

THRIVE will use a workspace-based access model.

A workspace represents one supported financial-stability environment.

Examples:

- Johnny trust-support workspace
- Recovery-support budgeting workspace
- Personal financial stability workspace
- Supported living financial support workspace

Users gain access through `workspace_members`.

## Planned MVP Tables

### 1. `profiles`

Purpose:
Stores basic application profile information for authenticated users.

Planned columns:

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key; references `auth.users(id)` |
| display_name | text | User display name |
| email | text | User email, copied for convenience |
| role_label | text | Optional general role label |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Update timestamp |

Security:
User-owned. A user may read their own profile. Admin may read managed profiles.

### 2. `workspaces`

Purpose:
Represents a supported financial-stability workspace.

Planned columns:

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | text | Workspace name |
| workspace_type | text | Example: `personal`, `trust_support`, `recovery_support`, `case_support` |
| status | text | Example: `active`, `paused`, `archived` |
| created_by | uuid | References `auth.users(id)` |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Update timestamp |

Security:
Workspace-scoped. Only assigned members should access.

### 3. `workspace_members`

Purpose:
Controls which authenticated users can access a workspace and what role they hold.

Planned columns:

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| workspace_id | uuid | References `workspaces(id)` |
| user_id | uuid | References `auth.users(id)` |
| member_role | text | Example: `admin`, `trustee`, `support`, `individual`, `viewer` |
| status | text | Example: `active`, `inactive`, `removed` |
| created_at | timestamptz | Creation timestamp |

Security:
Admin-managed. Access policies should use this table to verify workspace membership.

### 4. `daily_checkins`

Purpose:
Stores daily self-reported stability indicators.

Planned columns:

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| workspace_id | uuid | References `workspaces(id)` |
| user_id | uuid | References `auth.users(id)` |
| checkin_date | date | Date of check-in |
| stress_score | integer | 1 to 10 |
| spending_urge_score | integer | 1 to 10 |
| sleep_quality_score | integer | 1 to 10 |
| recovery_support_score | integer | 1 to 10 |
| cash_access_pressure | integer | 1 to 10 |
| note | text | Optional user note |
| created_at | timestamptz | Creation timestamp |

Security:
Workspace-scoped and user-sensitive. Support viewers should see only approved summaries unless specifically authorized.

Clinical boundary:
This is not a clinical assessment and must not diagnose relapse, withdrawal, mental health symptoms, or treatment needs.

### 5. `budget_categories`

Purpose:
Stores protected and flexible budget categories for a workspace.

Planned columns:

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| workspace_id | uuid | References `workspaces(id)` |
| category_name | text | Category name |
| category_type | text | Example: `protected`, `flexible`, `support`, `reserve` |
| planned_amount | numeric | Planned budget amount |
| spent_amount | numeric | Current spent amount |
| remaining_amount | numeric | Remaining amount |
| sort_order | integer | Display order |
| is_active | boolean | Whether category is active |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Update timestamp |

Security:
Workspace-scoped.

### 6. `transactions_mock`

Purpose:
Stores mock transaction records for early dashboard and workflow development.

Planned columns:

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| workspace_id | uuid | References `workspaces(id)` |
| transaction_date | date | Transaction date |
| merchant_name | text | Mock merchant name |
| description | text | Mock description |
| amount | numeric | Mock amount |
| category | text | Category label |
| context_flag | text | Example: `within_plan`, `cash_access_flag`, `essential`, `review_needed` |
| documented | boolean | Whether mock receipt/documentation exists |
| created_at | timestamptz | Creation timestamp |

Security:
Mock-only during MVP. No real transaction data.

Design note:
This table should be replaced or upgraded later when real transaction import is designed.

### 7. `support_notes`

Purpose:
Stores internal or role-specific support notes.

Planned columns:

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| workspace_id | uuid | References `workspaces(id)` |
| author_id | uuid | References `auth.users(id)` |
| note_type | text | Example: `admin`, `support`, `trustee`, `beneficiary_visible` |
| note_body | text | Note content |
| visibility | text | Example: `internal`, `trustee`, `support_team`, `individual` |
| created_at | timestamptz | Creation timestamp |

Security:
Strictly role-scoped. Notes should not be globally visible.

### 8. `reports`

Purpose:
Stores generated report metadata and report content snapshots.

Planned columns:

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| workspace_id | uuid | References `workspaces(id)` |
| report_type | text | Example: `individual_summary`, `trustee_summary`, `support_summary`, `admin_memo` |
| report_period_start | date | Period start |
| report_period_end | date | Period end |
| report_status | text | Example: `draft`, `final`, `archived` |
| report_content | jsonb | Structured report snapshot |
| created_by | uuid | References `auth.users(id)` |
| created_at | timestamptz | Creation timestamp |

Security:
Workspace-scoped and role-scoped. Audience-specific reports must not be blended.

### 9. `audit_log`

Purpose:
Tracks important system actions.

Planned columns:

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| workspace_id | uuid | Nullable depending on event |
| actor_id | uuid | References `auth.users(id)` |
| action_type | text | Example: `record_created`, `record_updated`, `report_generated` |
| table_name | text | Related table |
| record_id | uuid | Related record, when available |
| metadata | jsonb | Event details |
| created_at | timestamptz | Creation timestamp |

Security:
Admin-only or tightly scoped audit viewer access.

## MVP Creation Order

Tables should be created in this order:

1. `profiles`
2. `workspaces`
3. `workspace_members`
4. `budget_categories`
5. `transactions_mock`
6. `daily_checkins`
7. `support_notes`
8. `reports`
9. `audit_log`

## Initial RLS Direction

Every table should have RLS enabled immediately.

Initial policy direction:

| Table | RLS Direction |
|---|---|
| `profiles` | User can read/update own profile |
| `workspaces` | Members can read assigned workspaces |
| `workspace_members` | Members can read their own membership; admin manages membership |
| `budget_categories` | Workspace members can read; admin/support can manage |
| `transactions_mock` | Workspace members can read mock data; admin/support can manage |
| `daily_checkins` | User can create own check-ins; role-scoped read access later |
| `support_notes` | Role-scoped access only |
| `reports` | Role-scoped access by report type |
| `audit_log` | Admin-only or restricted audit access |

## Out of Scope for Initial Schema

The initial schema will not include:

- Real bank import
- Plaid/MX/Finicity/Teller integration
- Real trust ledger data
- Receipt uploads
- Document storage
- Service role automation
- Complex permissions engine
- Multi-organization SaaS billing
- Production client onboarding

## Open Design Questions

1. Should `workspace_type` be enforced through a check constraint or left flexible at first?
2. Should support-circle consent be a separate table before support summaries are built?
3. Should `transactions_mock` be temporary only, or become `transactions` with a `data_source` field?
4. Should reports store rendered text, JSON snapshots, or both?
5. Should `audit_log.record_id` be text instead of uuid to support mixed table identifiers?

## Current Decision

Proceed with a clean schema from scratch.

Do not reuse legacy trust database tables.

Do not create real transaction tables until mock workflows are stable and security boundaries are proven.

## Session Notes

### Schema Session 001

Created initial THRIVE schema plan for clean Supabase project.

No database tables created.
No RLS policies created.
No app connection code written.