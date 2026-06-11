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

### 6. "transactions"

Purpose:
Stores mock transaction records for early dashboard and workflow development.

| data_source | text | Initial value: `mock`; future values may include `manual`, `csv_import`, `bank_connection`, `trust_ledger` |

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
5.  `transactions`
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
| `transactions` | Workspace members can read mock data; admin/support can manage |
| `daily_checkins` | User can create own check-ins; role-scoped read access later |
| `support_notes` | Role-scoped access only |
| `reports` | Role-scoped access by report type |
| `audit_log` | Admin-only or restricted audit access |

## Deferred Until Post-MVP Evolution

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
These items are not abandoned. They are intentionally deferred so the MVP can establish a clean, secure, understandable foundation first. The schema should not block these future layers.

## Resolved Design Decisions

### Decision 001: `workspace_type` Will Use a Check Constraint

Decision:
`workspace_type` should be constrained to approved values.

Initial allowed values:

- `personal`
- `trust_support`
- `recovery_support`
- `case_support`
- `demo`

Reason:
This prevents inconsistent workspace labels and protects the long-term schema from naming drift.

### Decision 002: Consent Should Become Its Own Table

Decision:
Support-circle consent should become a separate table, likely named `support_consents`.

Reason:
Consent is a legal, ethical, and operational boundary. It should not be buried inside notes, reports, or membership records.

MVP status:
Deferred until support-sharing features are built.

### Decision 003: Use `transactions`, Not `transactions`

Decision:
The MVP should use a real `transactions` table with a `data_source` field rather than a temporary `transactions` table.

Initial data source:

- `mock`

Future data sources may include:

- `manual`
- `csv_import`
- `bank_connection`
- `trust_ledger`

Reason:
This allows the UI and reporting pipeline to mature without being rebuilt later. The MVP remains mock-only, but the table design can evolve.

### Decision 004: Reports Should Store Both JSON and Rendered Text

Decision:
Reports should store structured report data and human-readable report text.

Recommended fields:

- `report_content jsonb`
- `rendered_text text`

Reason:
JSON supports dashboards, calculations, and future exports. Rendered text supports human-facing summaries, memos, and PDF generation.

### Decision 005: `audit_log.record_id` Should Be Text

Decision:
`audit_log.record_id` should use `text` rather than `uuid`.

Reason:
Audit logs may eventually reference records from different systems or tables that do not all use UUIDs.

### Decision 006: SQL Execution and RLS Testing Must Be Separated

Decision:
Schema SQL may be executed by the project owner through the Supabase SQL Editor. RLS behavior must later be tested through real app access patterns.

Required test perspectives:

- Anonymous visitor
- Authenticated user with no workspace access
- Authenticated user with correct workspace access
- Workspace admin
- Support or trustee role, when applicable

Reason:
Creating tables as an admin does not prove application security. RLS must be tested from the perspective of actual app users.

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

Security:
Workspace-scoped. MVP records must use mock data only. No real transaction data until security boundaries and import design are approved.