-- THRIVE Monthly Financial Ingestion Schema Draft
-- Candidate version: v0.2
-- Status: REVIEW ONLY
-- DO NOT EXECUTE IN SUPABASE WITHOUT SEPARATE APPROVAL
--
-- Initial source reconciliation:
-- January 2025
--
-- Governing rule:
-- The bank feed supplies observational data.
-- The reviewed trust record remains authoritative.
--
-- Security classification:
-- High-risk financial data.
-- Admin-only access during the initial ingestion and validation phase.
--
-- This draft creates:
-- 1. financial_sources
-- 2. financial_import_batches
-- 3. staged_financial_transactions
-- 4. financial_transaction_reviews
--
-- This draft does not:
-- - import any CSV file
-- - upload or retain source-file contents
-- - create trust-ledger conclusions
-- - create beneficiary-facing records
-- - authorize automated payments
-- - automatically classify repeated transactions as duplicates
-- - create a general delete pathway
--
-- Content-identical source rows remain separate source observations.
-- Source-file SHA-256 plus source-row number establishes source identity.

-- ============================================================
-- 1. financial_sources
-- ============================================================

create table if not exists public.financial_sources (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,

  program_id uuid not null
    references public.programs(id) on delete cascade,

  source_name text not null,
  institution_name text,
  source_type text not null,
  account_mask text,
  source_mode text not null,
  status text not null default 'active',

  created_by uuid not null
    references auth.users(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint financial_sources_name_not_blank
    check (length(trim(source_name)) > 0),

  constraint financial_sources_institution_not_blank
    check (
      institution_name is null
      or length(trim(institution_name)) > 0
    ),

  constraint financial_sources_account_mask_not_blank
    check (
      account_mask is null
      or length(trim(account_mask)) > 0
    ),

  constraint financial_sources_source_type_check
    check (
      source_type in (
        'bank_account',
        'manual_record',
        'trust_record',
        'other'
      )
    ),

  constraint financial_sources_source_mode_check
    check (
      source_mode in (
        'historical',
        'current_manual',
        'current_csv',
        'future_bank_sync'
      )
    ),

  constraint financial_sources_status_check
    check (
      status in (
        'active',
        'inactive',
        'archived'
      )
    ),

  constraint financial_sources_identity_scope_unique
    unique (id, workspace_id, program_id)
);

create index if not exists financial_sources_workspace_id_idx
  on public.financial_sources (workspace_id);

create index if not exists financial_sources_program_id_idx
  on public.financial_sources (program_id);

create index if not exists financial_sources_workspace_program_idx
  on public.financial_sources (workspace_id, program_id);

create index if not exists financial_sources_status_idx
  on public.financial_sources (
    workspace_id,
    program_id,
    status
  );

create index if not exists financial_sources_created_by_idx
  on public.financial_sources (created_by);

-- ============================================================
-- 2. financial_import_batches
-- ============================================================

create table if not exists public.financial_import_batches (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,

  program_id uuid not null
    references public.programs(id) on delete cascade,

  financial_source_id uuid not null,

  statement_period_start date not null,
  statement_period_end date not null,

  source_filename text not null,
  source_file_sha256 text not null,
  source_row_count integer not null,

  import_status text not null default 'uploaded',
  data_boundary text not null,
  source_lifecycle text not null default 'posted',

  uploaded_by uuid not null
    references auth.users(id),

  uploaded_at timestamptz not null default now(),

  reviewed_by uuid
    references auth.users(id),

  reviewed_at timestamptz,

  approved_by uuid
    references auth.users(id),

  approved_at timestamptz,

  rejection_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint financial_import_batches_source_scope_fk
    foreign key (
      financial_source_id,
      workspace_id,
      program_id
    )
    references public.financial_sources (
      id,
      workspace_id,
      program_id
    )
    on delete restrict,

  constraint financial_import_batches_period_valid
    check (
      statement_period_start <= statement_period_end
    ),

  constraint financial_import_batches_filename_not_blank
    check (
      length(trim(source_filename)) > 0
    ),

  constraint financial_import_batches_sha256_format
    check (
      source_file_sha256 ~ '^[0-9a-f]{64}$'
    ),

  constraint financial_import_batches_row_count_positive
    check (
      source_row_count > 0
    ),

  constraint financial_import_batches_status_check
    check (
      import_status in (
        'uploaded',
        'parsed',
        'validation_failed',
        'ready_for_review',
        'under_review',
        'approved',
        'rejected',
        'rolled_back'
      )
    ),

  constraint financial_import_batches_boundary_check
    check (
      data_boundary in (
        'historical',
        'current'
      )
    ),

  constraint financial_import_batches_lifecycle_check
    check (
      source_lifecycle in (
        'posted',
        'pending_and_posted',
        'unknown'
      )
    ),

  constraint financial_import_batches_rejection_reason_not_blank
    check (
      rejection_reason is null
      or length(trim(rejection_reason)) > 0
    ),

  constraint financial_import_batches_review_pair_check
    check (
      (
        reviewed_by is null
        and reviewed_at is null
      )
      or
      (
        reviewed_by is not null
        and reviewed_at is not null
      )
    ),

  constraint financial_import_batches_approval_pair_check
    check (
      (
        approved_by is null
        and approved_at is null
      )
      or
      (
        approved_by is not null
        and approved_at is not null
      )
    ),

  constraint financial_import_batches_file_scope_unique
    unique (
      workspace_id,
      program_id,
      financial_source_id,
      source_file_sha256
    ),

  constraint financial_import_batches_staged_scope_unique
    unique (
      id,
      workspace_id,
      program_id,
      financial_source_id
    )
);

create index if not exists financial_import_batches_workspace_id_idx
  on public.financial_import_batches (workspace_id);

create index if not exists financial_import_batches_program_id_idx
  on public.financial_import_batches (program_id);

create index if not exists financial_import_batches_source_id_idx
  on public.financial_import_batches (financial_source_id);

create index if not exists financial_import_batches_scope_status_idx
  on public.financial_import_batches (
    workspace_id,
    program_id,
    import_status
  );

create index if not exists financial_import_batches_statement_period_idx
  on public.financial_import_batches (
    workspace_id,
    program_id,
    statement_period_start,
    statement_period_end
  );

create index if not exists financial_import_batches_uploaded_by_idx
  on public.financial_import_batches (uploaded_by);

-- ============================================================
-- 3. staged_financial_transactions
-- ============================================================

create table if not exists public.staged_financial_transactions (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,

  program_id uuid not null
    references public.programs(id) on delete cascade,

  financial_source_id uuid not null,
  import_batch_id uuid not null,

  source_row_number integer not null,
  source_row_identity text not null,
  source_content_fingerprint text not null,

  raw_posted_date text not null,
  raw_transaction_date text not null,
  raw_transaction_type text not null,
  raw_check_serial text,
  raw_full_description text not null,
  raw_merchant_name text,
  raw_category_name text not null,
  raw_subcategory_name text not null,
  raw_amount text not null,
  raw_daily_posted_balance text not null,

  posted_date date,
  transaction_date date,
  transaction_type text,
  check_serial text,
  merchant_name text,
  category_name text,
  subcategory_name text,
  amount numeric(18, 2),
  daily_posted_balance numeric(18, 2),

  transaction_lifecycle text not null default 'posted',
  parse_status text not null default 'unparsed',
  parse_error text,

  created_by uuid not null
    references auth.users(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint staged_financial_transactions_batch_scope_fk
    foreign key (
      import_batch_id,
      workspace_id,
      program_id,
      financial_source_id
    )
    references public.financial_import_batches (
      id,
      workspace_id,
      program_id,
      financial_source_id
    )
    on delete restrict,

  constraint staged_financial_transactions_row_number_positive
    check (
      source_row_number > 0
    ),

  constraint staged_financial_transactions_row_identity_not_blank
    check (
      length(trim(source_row_identity)) > 0
    ),

  constraint staged_financial_transactions_content_hash_format
    check (
      source_content_fingerprint ~ '^[0-9a-f]{64}$'
    ),

  constraint staged_financial_transactions_raw_posted_not_blank
    check (
      length(trim(raw_posted_date)) > 0
    ),

  constraint staged_financial_transactions_raw_transaction_not_blank
    check (
      length(trim(raw_transaction_date)) > 0
    ),

  constraint staged_financial_transactions_raw_type_not_blank
    check (
      length(trim(raw_transaction_type)) > 0
    ),

  constraint staged_financial_transactions_raw_description_not_blank
    check (
      length(trim(raw_full_description)) > 0
    ),

  constraint staged_financial_transactions_raw_category_not_blank
    check (
      length(trim(raw_category_name)) > 0
    ),

  constraint staged_financial_transactions_raw_subcategory_not_blank
    check (
      length(trim(raw_subcategory_name)) > 0
    ),

  constraint staged_financial_transactions_raw_amount_not_blank
    check (
      length(trim(raw_amount)) > 0
    ),

  constraint staged_financial_transactions_raw_balance_not_blank
    check (
      length(trim(raw_daily_posted_balance)) > 0
    ),

  constraint staged_financial_transactions_lifecycle_check
    check (
      transaction_lifecycle in (
        'pending',
        'posted',
        'reversed',
        'removed',
        'unknown'
      )
    ),

  constraint staged_financial_transactions_parse_status_check
    check (
      parse_status in (
        'unparsed',
        'parsed',
        'needs_review',
        'rejected'
      )
    ),

  constraint staged_financial_transactions_parse_error_not_blank
    check (
      parse_error is null
      or length(trim(parse_error)) > 0
    ),

  constraint staged_financial_transactions_batch_row_unique
    unique (
      import_batch_id,
      source_row_number
    ),

  constraint staged_financial_transactions_batch_identity_unique
    unique (
      import_batch_id,
      source_row_identity
    ),

  constraint staged_financial_transactions_review_scope_unique
    unique (
      id,
      workspace_id,
      program_id
    )
);

create index if not exists staged_financial_transactions_workspace_id_idx
  on public.staged_financial_transactions (workspace_id);

create index if not exists staged_financial_transactions_program_id_idx
  on public.staged_financial_transactions (program_id);

create index if not exists staged_financial_transactions_source_id_idx
  on public.staged_financial_transactions (financial_source_id);

create index if not exists staged_financial_transactions_batch_id_idx
  on public.staged_financial_transactions (import_batch_id);

create index if not exists staged_financial_transactions_posted_date_idx
  on public.staged_financial_transactions (
    workspace_id,
    program_id,
    posted_date
  );

create index if not exists staged_financial_transactions_parse_status_idx
  on public.staged_financial_transactions (
    workspace_id,
    program_id,
    parse_status
  );

create index if not exists staged_financial_transactions_content_hash_idx
  on public.staged_financial_transactions (
    source_content_fingerprint
  );

-- The content fingerprint is intentionally not unique.
-- Content-identical source rows must remain separate observations.

-- ============================================================
-- 4. financial_transaction_reviews
-- ============================================================

create table if not exists public.financial_transaction_reviews (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,

  program_id uuid not null
    references public.programs(id) on delete cascade,

  staged_transaction_id uuid not null,

  review_status text not null default 'unreviewed',
  duplicate_classification text not null default 'not_assessed',
  trust_match_status text not null default 'not_assessed',

  trust_record_reference text,
  review_notes text,
  exclusion_reason text,

  reviewed_by uuid
    references auth.users(id),

  reviewed_at timestamptz,

  created_by uuid not null
    references auth.users(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint financial_transaction_reviews_transaction_scope_fk
    foreign key (
      staged_transaction_id,
      workspace_id,
      program_id
    )
    references public.staged_financial_transactions (
      id,
      workspace_id,
      program_id
    )
    on delete restrict,

  constraint financial_transaction_reviews_status_check
    check (
      review_status in (
        'unreviewed',
        'routine_repeated_activity',
        'potential_duplicate',
        'not_duplicate',
        'confirmed_duplicate',
        'needs_information',
        'matched_to_trust_record',
        'excluded_with_reason'
      )
    ),

  constraint financial_transaction_reviews_duplicate_check
    check (
      duplicate_classification in (
        'not_assessed',
        'content_identical',
        'potential_cross_source_match',
        'not_duplicate',
        'confirmed_duplicate'
      )
    ),

  constraint financial_transaction_reviews_trust_match_check
    check (
      trust_match_status in (
        'not_assessed',
        'unmatched',
        'potential_match',
        'matched',
        'not_applicable'
      )
    ),

  constraint financial_transaction_reviews_reference_not_blank
    check (
      trust_record_reference is null
      or length(trim(trust_record_reference)) > 0
    ),

  constraint financial_transaction_reviews_notes_not_blank
    check (
      review_notes is null
      or length(trim(review_notes)) > 0
    ),

  constraint financial_transaction_reviews_exclusion_not_blank
    check (
      exclusion_reason is null
      or length(trim(exclusion_reason)) > 0
    ),

  constraint financial_transaction_reviews_review_pair_check
    check (
      (
        reviewed_by is null
        and reviewed_at is null
      )
      or
      (
        reviewed_by is not null
        and reviewed_at is not null
      )
    ),

  constraint financial_transaction_reviews_exclusion_required
    check (
      review_status <> 'excluded_with_reason'
      or exclusion_reason is not null
    ),

  constraint financial_transaction_reviews_transaction_unique
    unique (staged_transaction_id)
);

create index if not exists financial_transaction_reviews_workspace_id_idx
  on public.financial_transaction_reviews (workspace_id);

create index if not exists financial_transaction_reviews_program_id_idx
  on public.financial_transaction_reviews (program_id);

create index if not exists financial_transaction_reviews_status_idx
  on public.financial_transaction_reviews (
    workspace_id,
    program_id,
    review_status
  );

create index if not exists financial_transaction_reviews_duplicate_idx
  on public.financial_transaction_reviews (
    workspace_id,
    program_id,
    duplicate_classification
  );

create index if not exists financial_transaction_reviews_trust_match_idx
  on public.financial_transaction_reviews (
    workspace_id,
    program_id,
    trust_match_status
  );

-- ============================================================
-- 5. updated_at trigger
-- ============================================================

create or replace function public.set_financial_ingestion_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_financial_sources_updated_at
  on public.financial_sources;

create trigger set_financial_sources_updated_at
before update on public.financial_sources
for each row
execute function public.set_financial_ingestion_updated_at();

drop trigger if exists set_financial_import_batches_updated_at
  on public.financial_import_batches;

create trigger set_financial_import_batches_updated_at
before update on public.financial_import_batches
for each row
execute function public.set_financial_ingestion_updated_at();

drop trigger if exists set_staged_financial_transactions_updated_at
  on public.staged_financial_transactions;

create trigger set_staged_financial_transactions_updated_at
before update on public.staged_financial_transactions
for each row
execute function public.set_financial_ingestion_updated_at();

drop trigger if exists set_financial_transaction_reviews_updated_at
  on public.financial_transaction_reviews;

create trigger set_financial_transaction_reviews_updated_at
before update on public.financial_transaction_reviews
for each row
execute function public.set_financial_ingestion_updated_at();

-- ============================================================
-- 6. RLS enablement
-- ============================================================

alter table public.financial_sources
  enable row level security;

alter table public.financial_import_batches
  enable row level security;

alter table public.staged_financial_transactions
  enable row level security;

alter table public.financial_transaction_reviews
  enable row level security;

-- FORCE ROW LEVEL SECURITY is intentionally not enabled in this draft.
-- This mirrors the current public-schema security posture.

-- ============================================================
-- 7. financial_sources RLS
-- ============================================================

drop policy if exists "financial_sources_select_for_workspace_admins"
  on public.financial_sources;

create policy "financial_sources_select_for_workspace_admins"
on public.financial_sources
for select
to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(program_id, workspace_id)
);

drop policy if exists "financial_sources_insert_for_workspace_admins"
  on public.financial_sources;

create policy "financial_sources_insert_for_workspace_admins"
on public.financial_sources
for insert
to authenticated
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(program_id, workspace_id)
  and created_by = auth.uid()
);

drop policy if exists "financial_sources_update_for_workspace_admins"
  on public.financial_sources;

create policy "financial_sources_update_for_workspace_admins"
on public.financial_sources
for update
to authenticated
using (
  public.is_workspace_admin(workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(program_id, workspace_id)
);

-- ============================================================
-- 8. financial_import_batches RLS
-- ============================================================

drop policy if exists "financial_import_batches_select_for_workspace_admins"
  on public.financial_import_batches;

create policy "financial_import_batches_select_for_workspace_admins"
on public.financial_import_batches
for select
to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(program_id, workspace_id)
);

drop policy if exists "financial_import_batches_insert_for_workspace_admins"
  on public.financial_import_batches;

create policy "financial_import_batches_insert_for_workspace_admins"
on public.financial_import_batches
for insert
to authenticated
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(program_id, workspace_id)
  and uploaded_by = auth.uid()
);

drop policy if exists "financial_import_batches_update_for_workspace_admins"
  on public.financial_import_batches;

create policy "financial_import_batches_update_for_workspace_admins"
on public.financial_import_batches
for update
to authenticated
using (
  public.is_workspace_admin(workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(program_id, workspace_id)
);

-- ============================================================
-- 9. staged_financial_transactions RLS
-- ============================================================

drop policy if exists "staged_financial_transactions_select_for_workspace_admins"
  on public.staged_financial_transactions;

create policy "staged_financial_transactions_select_for_workspace_admins"
on public.staged_financial_transactions
for select
to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(program_id, workspace_id)
);

drop policy if exists "staged_financial_transactions_insert_for_workspace_admins"
  on public.staged_financial_transactions;

create policy "staged_financial_transactions_insert_for_workspace_admins"
on public.staged_financial_transactions
for insert
to authenticated
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(program_id, workspace_id)
  and created_by = auth.uid()
);

drop policy if exists "staged_financial_transactions_update_for_workspace_admins"
  on public.staged_financial_transactions;

create policy "staged_financial_transactions_update_for_workspace_admins"
on public.staged_financial_transactions
for update
to authenticated
using (
  public.is_workspace_admin(workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(program_id, workspace_id)
);

-- ============================================================
-- 10. financial_transaction_reviews RLS
-- ============================================================

drop policy if exists "financial_transaction_reviews_select_for_workspace_admins"
  on public.financial_transaction_reviews;

create policy "financial_transaction_reviews_select_for_workspace_admins"
on public.financial_transaction_reviews
for select
to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(program_id, workspace_id)
);

drop policy if exists "financial_transaction_reviews_insert_for_workspace_admins"
  on public.financial_transaction_reviews;

create policy "financial_transaction_reviews_insert_for_workspace_admins"
on public.financial_transaction_reviews
for insert
to authenticated
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(program_id, workspace_id)
  and created_by = auth.uid()
);

drop policy if exists "financial_transaction_reviews_update_for_workspace_admins"
  on public.financial_transaction_reviews;

create policy "financial_transaction_reviews_update_for_workspace_admins"
on public.financial_transaction_reviews
for update
to authenticated
using (
  public.is_workspace_admin(workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(program_id, workspace_id)
);

-- ============================================================
-- 11. Delete and rollback boundary
-- ============================================================
--
-- No direct DELETE policies are created.
--
-- Records should not be removable through ordinary authenticated
-- table access.
--
-- A future rollback function may be considered only after:
--
-- - test-batch lifecycle rules are approved,
-- - approval-state protections are defined,
-- - dependent-row behavior is reviewed,
-- - audit requirements are documented,
-- - and RLS testing is completed.
--
-- A future rollback function must not remove an approved batch.

-- ============================================================
-- 12. Legal, ethical, and fiduciary boundary
-- ============================================================
--
-- Imported bank records are observational evidence.
--
-- They do not independently establish:
--
-- - an approved trust distribution,
-- - an appropriate or inappropriate expenditure,
-- - a fiduciary conclusion,
-- - a beneficiary obligation,
-- - a legal conclusion,
-- - a financial recommendation,
-- - or authority to make or automate payments.
--
-- Human review and the authoritative trust record remain controlling.
