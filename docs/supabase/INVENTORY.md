# THRIVE Supabase Inventory

## Purpose

This file documents the current Supabase project before the THRIVE application connects to it.

The goal is to understand the existing database truth before making schema changes, applying Row Level Security policies, or connecting the Next.js app.

## Supabase Project

Project name: thrive  
Status: Healthy  
Use status: Inventory only  
Real sensitive data allowed: No

## Current Rule

Do not enter or connect real trust, beneficiary, financial, behavioral, recovery-related, or personally identifiable data until:

1. Existing tables are inventoried.
2. RLS status is reviewed.
3. Roles are defined.
4. Policies are designed.
5. Policies are tested.
6. Mock/test data is separated from real data.

## Observed Existing Tables

Initial observed tables from Supabase dashboard:

- projects
- system_anchors
- trust_documents
- trust_ledger
- trust_ledger_transactions
- transaction_receipts
- transactions_profile
- transactions_snapshot
- import_batches
- import_events

## Table Classification Key

Each table should be classified as one of the following:

- Active THRIVE core
- Johnny / trust module
- Import utility
- Archive / legacy
- Replace later
- Unknown pending review

## Table Inventory

| Table | Classification | Purpose | RLS Status | Notes |
|---|---|---|---|---|
| projects | Active THRIVE core candidate | General project registry table with optional creator link to `auth.users` | RLS unknown | Has `id`, `name`, `status`, `created_at`, `created_by`; primary key on `id`; foreign key from `created_by` to `auth.users(id)` |
| system_anchors | Active THRIVE governance / system metadata candidate | Stores system baseline anchors, schema snapshots, and architecture checkpoint notes | RLS unknown / likely previously disabled | Existing row documents `DSS_MAIN_HUB_BASELINE_V1`; references prior Supabase integration and notes RLS was not enabled |
| trust_documents | Johnny / trust module candidate | Stores metadata for trust-related documents linked to Supabase Storage objects | RLS disabled | Empty table; includes `storage_object_id` foreign key to `storage.objects(id)` and `uploaded_by` foreign key to `auth.users(id)` |
| trust_ledger | Johnny / trust module candidate | Stores normalized trust ledger transactions imported from financial source data | RLS status needs verification | Empty table; includes batch link to `import_batches(id)`, committed user link to `auth.users(id)`, and debit/credit direction check |
| trust_ledger_transactions | Johnny / trust module staging candidate | Stores imported trust ledger transactions, likely from Truist source data | RLS disabled | Empty table; links to `import_batches(id)` and `auth.users(id)`; may be staging or earlier ledger structure |
| transaction_receipts | Johnny / trust module candidate | Needs inspection | Unknown | Potential receipt tracking table |
| transactions_profile | Unknown pending review | Needs inspection | Unknown | Existing table |
| transactions_snapshot | Import utility candidate | Needs inspection | Unknown | Existing table |
| import_batches | Import utility candidate | Needs inspection | Unknown | Existing table |
| import_events | Import utility candidate | Needs inspection | Unknown | Existing table |

## Security Concerns

Supabase Advisor previously showed multiple RLS disabled warnings for public tables.

This must be resolved before production or real sensitive use.

## Next Inventory Tasks

1. Export or screenshot table list.
2. Inspect each table's columns.
3. Inspect primary keys.
4. Inspect foreign keys.
5. Inspect RLS status.
6. Inspect policies.
7. Identify which tables are safe to keep.
8. Identify which tables should be archived or replaced.
9. Design THRIVE MVP schema only after inventory is complete.

## Session Notes

### Inventory Session 001

Started Supabase inventory documentation after successful build and clean Git checkpoint.

No schema changes made.
No RLS changes made.
No application connection made.
## Detailed Table Notes

### `public.projects`

Classification: Active THRIVE core candidate

Purpose:
General project registry table. May be used to track THRIVE workstreams, internal DSS projects, or operational project anchors.

Columns:

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | Primary key |
| name | text | No | None | Project name |
| status | text | No | 'Planning' | Project status |
| created_at | timestamp with time zone | No | now() | Creation timestamp |
| created_by | uuid | Yes | None | Optional creator user |

Constraints:

| Constraint | Type | Notes |
|---|---|---|
| projects_pkey | Primary key | Uses `id` |
| projects_created_by_fkey | Foreign key | `created_by` references `auth.users(id)` |

Initial decision:
Keep pending review. Do not connect app logic to this table until role and RLS strategy are defined.

Security note:
RLS status still needs verification. If used, access should likely be admin-only or creator-scoped depending on whether projects are internal system records or user-facing workspaces.
### `public.system_anchors`

Classification: Active THRIVE governance / system metadata candidate

Purpose:
Stores system-level anchors, baseline notes, schema snapshots, and governance checkpoints. This appears to have been used to document prior Supabase integration work and database authority decisions.

Columns:

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | Primary key |
| anchor_name | text | No | None | Name of the system anchor or baseline |
| description | text | Yes | None | Human-readable description |
| schema_snapshot | jsonb | Yes | None | JSON snapshot of schema, notes, or RLS state |
| created_at | timestamp with time zone | No | now() | Creation timestamp |
| created_by | uuid | Yes | None | Optional creator user |

Constraints:

| Constraint | Type | Notes |
|---|---|---|
| system_anchors_pkey | Primary key | Uses `id` |
| system_anchors_created_by_fkey | Foreign key | `created_by` references `auth.users(id)` |

Observed sample record:

| Field | Value |
|---|---|
| anchor_name | DSS_MAIN_HUB_BASELINE_V1 |
| description | Initial Supabase integration with projects table and auth configured. No RLS enabled yet. |
| schema_snapshot | Notes that authority doctrine was established, UI reads from Supabase, `projects` table existed, and `projects` RLS was disabled |
| created_at | 2026-02-11 22:40:32.784788+00 |
| created_by | null |

Initial decision:
Keep pending review. This table may be useful for admin-only architecture checkpoints and system governance records.

Security note:
This table should likely be admin-only. It may expose internal schema notes, security status, project structure, and system governance history. It should not be readable by public or normal supported-user roles..

### `public.trust_documents`

Classification: Johnny / trust module candidate

Purpose:
Stores metadata for trust-related documents uploaded to Supabase Storage. This table appears designed to track documents by workspace, storage object, document type, title, uploader, upload time, optional file hash, and notes.

Current data status:
Empty table. No records observed.

Columns:

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | Primary key |
| workspace_id | uuid | No | None | Workspace or project grouping identifier |
| storage_object_id | uuid | No | None | Links to Supabase Storage object |
| document_type | text | No | None | Type/category of document |
| title | text | No | None | Human-readable document title |
| uploaded_by | uuid | No | None | User who uploaded the document |
| uploaded_at | timestamp with time zone | No | now() | Upload timestamp |
| hash_sha256 | text | Yes | None | Optional file integrity hash |
| notes | text | Yes | None | Optional document notes |

Constraints:

| Constraint | Type | Notes |
|---|---|---|
| trust_documents_pkey | Primary key | Uses `id` |
| trust_documents_storage_fk | Foreign key | `storage_object_id` references `storage.objects(id)` with `on delete RESTRICT` |
| trust_documents_uploaded_by_fkey | Foreign key | `uploaded_by` references `auth.users(id)` |

Initial decision:
Keep pending review. This table is a strong candidate for Trust Mode document tracking, receipt storage, statements, trustee records, beneficiary documents, and audit-support files.

Security note:
This table is sensitive and must not remain publicly readable or writable. RLS is currently disabled. Before real use, policies must restrict access by workspace, role, and document permission. Storage bucket policies must also be reviewed because protecting the metadata table alone is not enough if files are exposed through storage permissions.

Design note:
The `workspace_id` column currently has no visible foreign key in the provided SQL. Inventory should later determine whether `workspace_id` should reference `projects(id)`, a future `workspaces` table, or another trust/profile grouping table.

### `public.trust_ledger`

Classification: Johnny / trust module candidate

Purpose:
Stores normalized trust ledger transactions imported from financial source data. This table appears designed to become the authoritative transaction ledger for trust-related activity after import review and commitment.

Current data status:
Empty table. No records observed.

Columns:

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | Primary key |
| workspace_id | uuid | No | None | Workspace or project grouping identifier |
| batch_id | uuid | No | None | Import batch reference |
| posted_date | date | No | None | Posted date from financial source |
| transaction_date | date | Yes | None | Transaction date, if available |
| transaction_type | text | Yes | None | Transaction type from source |
| check_serial | text | Yes | None | Check number or serial, if available |
| full_description | text | Yes | None | Full transaction description |
| merchant_name | text | Yes | None | Normalized or parsed merchant name |
| category_name | text | Yes | None | Main category |
| sub_category_name | text | Yes | None | Subcategory |
| amount | numeric(14,2) | No | None | Transaction amount |
| running_balance | numeric(14,2) | Yes | None | Running balance after transaction, if available |
| normalized_direction | text | No | None | Must be `DEBIT` or `CREDIT` |
| normalized_category | text | Yes | None | Normalized reporting category |
| source_row_hash | text | No | None | Source row hash for deduplication/audit |
| committed_at | timestamp with time zone | No | now() | Time record was committed |
| committed_by | uuid | No | None | User who committed the record |

Constraints:

| Constraint | Type | Notes |
|---|---|---|
| trust_ledger_pkey | Primary key | Uses `id` |
| trust_ledger_batch_id_fkey | Foreign key | `batch_id` references `import_batches(id)` |
| trust_ledger_committed_by_fkey | Foreign key | `committed_by` references `auth.users(id)` |
| trust_ledger_direction_check | Check constraint | `normalized_direction` must be `DEBIT` or `CREDIT` |

Initial decision:
Keep pending review. This table is a strong candidate for Trust Mode transaction history and audit-backed financial reporting.

Security note:
This table is highly sensitive. It may contain beneficiary financial records, transaction descriptions, balances, merchants, and spending patterns. It must not be publicly readable or writable. RLS status must be verified and policies must be designed before any real records are inserted or displayed.

Design note:
The `workspace_id` column currently has no visible foreign key in the provided SQL. Inventory should later determine whether `workspace_id` should reference `projects(id)`, a future `workspaces` table, a trust profile table, or another access-control boundary.
### `public.trust_ledger_transactions`

Classification: Johnny / trust module staging candidate

Purpose:
Stores imported trust ledger transaction rows, likely from Truist source data. This table appears simpler than `trust_ledger` and may function as a staging table, earlier transaction structure, or source-specific ledger table.

Current data status:
Empty table. No records observed.

Columns:

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | Primary key |
| batch_id | uuid | No | None | Import batch reference |
| transaction_date | date | No | None | Transaction date |
| description | text | No | None | Transaction description |
| merchant_name | text | Yes | None | Merchant name, if parsed |
| transaction_type | text | No | None | Transaction type |
| amount | numeric | No | None | Transaction amount |
| running_balance | numeric | Yes | None | Running balance, if available |
| source_system | text | No | 'TRUIST' | Source financial system |
| created_at | timestamp with time zone | No | now() | Creation timestamp |
| created_by | uuid | No | None | User who created/imported record |

Constraints:

| Constraint | Type | Notes |
|---|---|---|
| trust_ledger_transactions_pkey | Primary key | Uses `id` |
| trust_ledger_transactions_batch_id_fkey | Foreign key | `batch_id` references `import_batches(id)` |
| trust_ledger_transactions_created_by_fkey | Foreign key | `created_by` references `auth.users(id)` |

Initial decision:
Keep pending review. This table may be useful as an import staging table, but it may overlap with `trust_ledger`.

Security note:
This table is highly sensitive. It may contain beneficiary financial transactions, descriptions, merchants, amounts, and balances. RLS is currently disabled. It must not be publicly readable or writable before real use.

Design note:
Compare this table against `trust_ledger`. THRIVE may not need both long-term. A likely future pattern is: import rows into a staging table, review/normalize, then commit approved records into an authoritative ledger table.
