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
| import_batches | Import utility / trust workflow candidate | Tracks monthly source-file import batches, reconciliation, approval, rejection, and commit status | RLS disabled | Empty table observed; has status FSM trigger and unique `(workspace_id, period_month)` constraint |
| import_events | Import utility / snapshot pipeline candidate | Tracks import events by source type, source name, initiator, and start time | RLS disabled | One record observed for manual CSV import from Truist checking source |
| transaction_receipts | Receipt support candidate | Stores receipt file metadata linked to transaction snapshots | RLS disabled | Empty table observed; references `transactions_snapshot(id)` with cascade delete |
| transactions_snapshot | Active transaction snapshot candidate / sensitive existing data | Stores raw transaction snapshots with posted date, raw description, amount, and created timestamp | RLS policy present | 89 records observed; contains sensitive real-looking transaction/merchant/payment data |
| transactions_profile | Active transaction review/profile candidate | Stores documentation status, category, timing tag, notes, review status, and updated timestamp for each transaction snapshot | RLS policies present | 89 records observed; references `transactions_snapshot(id)` |
| transactions_audit_log | Active audit log candidate | Logs profile field changes by snapshot, field changed, old/new values, actor, and timestamps | RLS policies present | 29 records observed; documents changes to transaction profile fields |
| transactions_provenance | Import provenance candidate | Links transaction snapshots to import events and source metadata | RLS disabled | 89 records observed; tracks CSV/manual import source and actor |
| truist_import_staging | Import staging / raw bank data candidate | Stores raw Truist import rows using source-file column names | RLS disabled | 89 records observed; contains raw bank transaction details and should be treated as highly sensitive |
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

### `public.import_batches`

Classification: Import utility / trust workflow candidate

Purpose:
Tracks monthly import batches tied to a workspace, source document, reconciliation status, approval status, rejection notes, and commit metadata. This table appears designed to control whether imported trust ledger data is still draft, staged, verified, rejected, or committed.

Current data status:
Empty table observed.

Columns:

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | Primary key |
| workspace_id | uuid | No | None | Workspace or project grouping identifier |
| period_month | date | No | None | Monthly import period |
| source_file_id | uuid | No | None | Source file reference |
| status | text | No | 'DRAFT' | Import batch status |
| opening_balance | numeric | No | None | Opening balance |
| closing_balance | numeric | No | None | Closing balance |
| expected_net_change | numeric | Yes | None | Expected net change |
| calculated_net_change | numeric | Yes | None | Calculated net change |
| reconciliation_delta | numeric | Yes | None | Difference between expected and calculated changes |
| exception_count | integer | Yes | 0 | Count of exceptions |
| rejected_reason | text | Yes | None | Rejection reason |
| rejected_note | text | Yes | None | Rejection note |
| approved_at | timestamp with time zone | Yes | None | Approval timestamp |
| approved_by | uuid | Yes | None | Approving user |
| committed_at | timestamp with time zone | Yes | None | Commit timestamp |
| committed_by | uuid | Yes | None | Committing user |
| created_at | timestamp with time zone | No | now() | Creation timestamp |
| governance_version | text | Yes | None | Governance version marker |

Constraints and triggers:

| Name | Type | Notes |
|---|---|---|
| import_batches_pkey | Primary key | Uses `id` |
| import_batches_workspace_id_period_month_key | Unique constraint | Unique by `workspace_id` and `period_month` |
| import_batches_source_file_id_fkey | Foreign key | `source_file_id` references `trust_documents(id)` with `on delete RESTRICT` |
| import_batches_status_check | Check constraint | Status limited to `DRAFT`, `STAGED`, `VERIFIED`, `REJECTED`, `COMMITTED` |
| import_batch_fsm_trigger | Trigger | Runs `enforce_import_batch_fsm()` before update |

Initial decision:
Keep pending review. This is a strong governance candidate for controlled monthly trust imports.

Security note:
RLS is disabled. This table may contain trust balances, approval records, and reconciliation details. It should not be public or client-readable before policy design.

Design note:
The status workflow is valuable. The trigger suggests a finite-state-machine approach already exists and should be inspected before changes.

### `public.import_events`

Classification: Import utility / snapshot pipeline candidate

Purpose:
Tracks import events from manual CSV or other sources. This appears connected to the transaction snapshot/provenance pipeline.

Current data status:
One record observed for a manual CSV import from a Truist checking source. Do not repeat raw source/account details in public documentation beyond generalized description.

Columns:

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | text | No | None | Primary key |
| source_type | text | No | None | Import source type |
| source_name | text | No | None | Source name |
| initiated_by | text | No | None | Actor or initiator |
| started_at | timestamp without time zone | No | CURRENT_TIMESTAMP | Import start timestamp |

Constraints:

| Constraint | Type | Notes |
|---|---|---|
| import_events_pkey | Primary key | Uses `id` |

Initial decision:
Keep pending review. May remain useful for import history, but it uses `text` identity fields rather than `uuid` and does not reference `auth.users`.

Security note:
RLS is disabled. Source names may reveal sensitive account/source information. Treat as sensitive.

### `public.transaction_receipts`

Classification: Receipt support candidate

Purpose:
Stores receipt file metadata linked to transaction snapshots. This table appears designed to support documentation of transactions through file URLs and filenames.

Current data status:
Empty table observed.

Columns:

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | uuid | No | gen_random_uuid() | Primary key |
| snapshot_id | text | No | None | Linked transaction snapshot |
| file_url | text | No | None | Receipt file URL |
| file_name | text | Yes | None | Receipt file name |
| uploaded_at | timestamp with time zone | No | now() | Upload timestamp |

Constraints and indexes:

| Name | Type | Notes |
|---|---|---|
| transaction_receipts_pkey | Primary key | Uses `id` |
| transaction_receipts_snapshot_id_fkey | Foreign key | `snapshot_id` references `transactions_snapshot(id)` with `on delete CASCADE` |
| transaction_receipts_snapshot_id_idx | Index | Index on `snapshot_id` |

Initial decision:
Keep pending review. This is useful for receipt tracking, but file storage strategy must be redesigned carefully.

Security note:
RLS is disabled. Receipt URLs and filenames can expose sensitive financial documentation. This table must be protected before use.

Design note:
This table uses `file_url` instead of Supabase Storage object IDs. Compare against `trust_documents`, which uses `storage_object_id`. Long-term, THRIVE should choose one secure document-storage pattern.

### `public.transactions_snapshot`

Classification: Active transaction snapshot candidate / sensitive existing data

Purpose:
Stores raw transaction snapshots, including posted date, raw transaction description, amount, and creation timestamp.

Current data status:
89 records observed. Records include real-looking transaction, merchant, cash withdrawal, payment, and spending data. Do not use or expose these records in the app until access policies are reviewed.

Columns:

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | text | No | None | Primary key |
| external_txn_id | text | Yes | None | Optional external transaction identifier |
| posted_date | date | No | None | Posted transaction date |
| description_raw | text | No | None | Raw transaction description |
| amount | numeric | No | None | Transaction amount |
| created_at | timestamp without time zone | No | CURRENT_TIMESTAMP | Creation timestamp |

Constraints:

| Constraint | Type | Notes |
|---|---|---|
| transactions_snapshot_pkey | Primary key | Uses `id` |

Initial decision:
Keep pending review. This may be the existing transaction source for Johnny-style financial pattern review, but it overlaps with the trust ledger/import staging structure.

Security note:
This table contains sensitive financial transaction data. It currently shows at least one RLS policy, but policies must be inspected before any app connection. Treat as sensitive and do not expose through public client logic.

Design note:
This table does not include workspace, user, beneficiary, or trust ownership fields. That may limit safe multi-profile use unless access boundaries are added elsewhere.

### `public.transactions_profile`

Classification: Active transaction review/profile candidate

Purpose:
Stores review metadata for each transaction snapshot, including documentation status, category, timing tag, note, review status, and updated timestamp.

Current data status:
89 records observed. Records correspond to transaction snapshots and include categories such as cash/checks, groceries, household, utilities, and transfers/payments.

Columns:

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| snapshot_id | text | No | None | Primary key and foreign key to transaction snapshot |
| documented | boolean | No | false | Whether transaction has documentation |
| category | text | Yes | None | Review/category label |
| timing_tag | text | Yes | None | Timing or risk/context tag |
| note | text | Yes | None | Review note |
| reviewed | boolean | No | false | Whether transaction has been reviewed |
| updated_at | timestamp without time zone | No | CURRENT_TIMESTAMP | Last update timestamp |

Constraints and triggers:

| Name | Type | Notes |
|---|---|---|
| transactions_profile_pkey | Primary key | Uses `snapshot_id` |
| transactions_profile_snapshot_id_fkey | Foreign key | `snapshot_id` references `transactions_snapshot(id)` with `on delete RESTRICT` |
| trg_transactions_profile_audit | Trigger | After update, runs `log_transaction_profile_update()` |

Initial decision:
Keep pending review. This table is useful for transaction documentation/review workflows.

Security note:
RLS policies are present, but must be inspected. Profile data can reveal behavioral and spending-pattern analysis, so it should be protected.

Design note:
This table is likely useful for THRIVE’s “spending with context” and receipt/documentation workflow. It should eventually be tied to proper user/workspace ownership.

### `public.transactions_audit_log`

Classification: Active audit log candidate

Purpose:
Logs changes made to transaction profile records, including field changed, old value, new value, actor, and timestamps.

Current data status:
29 records observed. Changes appear to document transaction profile updates, especially documentation status changes.

Columns:

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | text | No | gen_random_uuid() | Primary key, although typed as text |
| snapshot_id | text | No | None | Linked transaction snapshot |
| field_changed | text | No | None | Changed field |
| old_value | text | Yes | None | Prior value |
| new_value | text | Yes | None | New value |
| actor | text | No | None | Actor label |
| changed_at | timestamp without time zone | No | CURRENT_TIMESTAMP | Change timestamp |
| field_name | text | No | None | Field name |
| created_at | timestamp with time zone | No | now() | Creation timestamp |

Constraints:

| Constraint | Type | Notes |
|---|---|---|
| transactions_audit_log_pkey | Primary key | Uses `id` |
| transactions_audit_log_snapshot_id_fkey | Foreign key | `snapshot_id` references `transactions_snapshot(id)` with `on delete RESTRICT` |

Initial decision:
Keep pending review. This audit-log pattern is valuable for THRIVE and should be preserved or improved.

Security note:
RLS policies are present, but must be inspected. Audit logs can reveal user activity and sensitive transaction review history.

Design note:
There appears to be overlap between `field_changed` and `field_name`. Future cleanup may standardize this.

### `public.transactions_provenance`

Classification: Import provenance candidate

Purpose:
Links transaction snapshots to import events and source metadata, including source type, source name, actor, and import timestamp.

Current data status:
89 records observed. Records link transaction snapshots to a manual CSV import event.

Columns:

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| id | text | No | None | Primary key |
| snapshot_id | text | No | None | Linked transaction snapshot |
| import_event_id | text | No | None | Linked import event |
| source_type | text | No | None | Source type |
| source_name | text | No | None | Source name |
| actor | text | No | None | Actor label |
| imported_at | timestamp without time zone | No | CURRENT_TIMESTAMP | Import timestamp |

Constraints:

| Constraint | Type | Notes |
|---|---|---|
| transactions_provenance_pkey | Primary key | Uses `id` |
| transactions_provenance_snapshot_id_fkey | Foreign key | `snapshot_id` references `transactions_snapshot(id)` with `on delete RESTRICT` |

Initial decision:
Keep pending review. Provenance is useful for auditability and import traceability.

Security note:
RLS is disabled. Source names and import metadata may reveal sensitive financial source information. This table should not be public.

Design note:
The provided SQL does not show a foreign key from `import_event_id` to `import_events(id)`, even though the names imply a relationship. Verify later.

### `public.truist_import_staging`

Classification: Import staging / raw bank data candidate

Purpose:
Stores raw Truist import rows using original source column names. This appears to be a direct staging table before transformation into transaction snapshots or trust ledger records.

Current data status:
89 records observed. Contains raw financial transaction rows. Treat as highly sensitive.

Columns:

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| Posted Date | date | Yes | None | Raw posted date from source |
| Transaction Date | date | Yes | None | Raw transaction date from source |
| Transaction Type | text | Yes | None | Raw transaction type |
| Check/Serial # | text | Yes | None | Raw check/serial field |
| Full description | text | Yes | None | Raw transaction description |
| Merchant name | text | Yes | None | Raw merchant name |
| Category name | text | Yes | None | Raw category name |
| Sub-category name | text | Yes | None | Raw subcategory name |
| Amount | text | Yes | None | Raw amount as text |
| Daily Posted Balance | text | Yes | None | Raw daily posted balance as text |
| batch_id | uuid | Yes | None | Optional import batch reference |

Constraints:

| Constraint | Type | Notes |
|---|---|---|
| truist_import_staging_batch_id_fkey | Foreign key | `batch_id` references `import_batches(id)` |

Initial decision:
Keep only as a staging/import utility pending review. Do not use as an app-facing table.

Security note:
RLS is disabled. This table contains raw bank data and must be restricted before any real use. Because the column names contain spaces and symbols, this table is useful for raw import but not ideal for app logic.

Design note:
This should likely remain temporary/staging only. Long-term app-facing logic should use normalized tables with clean column names, typed amounts, workspace ownership, and strong RLS.
