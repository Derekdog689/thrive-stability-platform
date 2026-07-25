-- THRIVE January 2025 Atomic Financial Import Function
-- Candidate version: v0.3
-- Status: CORRECTED REVIEW ONLY
--
-- v0.3 corrections:
-- - preserve all v0.2 transaction and validation controls
-- - remove unsupported min(uuid) aggregation
-- - count matching sources first
-- - select the UUID separately only when exactly one source exists
-- DO NOT EXECUTE WITHOUT SEPARATE APPROVAL
--
-- Governing rule:
-- The bank feed supplies observational data.
-- The reviewed trust record remains authoritative.
--
-- Purpose:
-- Atomically create or reuse the verified financial source,
-- create one January 2025 import batch,
-- insert exactly 85 staged source rows,
-- validate the resulting batch,
-- and stop at ready_for_review.
--
-- This function must not:
-- - approve the batch;
-- - create transaction-review conclusions;
-- - create trust-ledger records;
-- - automate payments;
-- - merge content-identical source rows;
-- - silently accept partial imports.

create or replace function public.import_january_2025_financial_batch(
  p_workspace_id uuid,
  p_program_id uuid,
  p_source_filename text,
  p_source_file_sha256 text,
  p_statement_period_start date,
  p_statement_period_end date,
  p_rows jsonb
)
returns table (
  financial_source_id uuid,
  import_batch_id uuid,
  inserted_row_count integer,
  import_status text
)
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_user_id uuid;
  v_source_id uuid;
  v_batch_id uuid;
  v_inserted_count integer;
  v_matching_source_count integer;
  v_distinct_source_row_count integer;
  v_min_source_row integer;
  v_max_source_row integer;
  v_missing_source_row_count integer;
  v_expected_count constant integer := 85;
  v_expected_sha256 constant text :=
    '9c993baf1e7558de40215ac7802c23c1fbee04f7ca80e5405366c1043a6b951a';
  v_expected_total constant numeric := -12570.54;
  v_observed_total numeric;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authenticated user is required';
  end if;

  if p_workspace_id <>
    'd1cb9168-b0cd-42d0-8745-024c3e421c11'::uuid
  then
    raise exception 'Unexpected workspace scope';
  end if;

  if p_program_id <>
    'f67f14a2-6666-44d6-99d4-dbb2678a2863'::uuid
  then
    raise exception 'Unexpected program scope';
  end if;

  if not public.is_workspace_admin(p_workspace_id) then
    raise exception 'Active workspace administrator access is required';
  end if;

  if not public.is_program_in_workspace(
    p_program_id,
    p_workspace_id
  ) then
    raise exception 'Program is not active within the locked workspace';
  end if;

  -- Serialize attempts for this locked workspace, program, and file.
  -- The lock is released automatically when the transaction ends.
  perform pg_advisory_xact_lock(
    hashtextextended(
      p_workspace_id::text
        || ':'
        || p_program_id::text
        || ':'
        || p_source_file_sha256,
      0
    )
  );

  if p_source_filename <>
    'acct_2847_01_01_2025_to_01_31_2025.csv'
  then
    raise exception 'Unexpected January source filename';
  end if;

  if p_source_file_sha256 <> v_expected_sha256 then
    raise exception 'January source SHA-256 does not match reconciliation';
  end if;

  if p_statement_period_start <> date '2025-01-01'
    or p_statement_period_end <> date '2025-01-31'
  then
    raise exception 'Unexpected January statement period';
  end if;

  if jsonb_typeof(p_rows) <> 'array' then
    raise exception 'Staged rows must be supplied as a JSON array';
  end if;

  if jsonb_array_length(p_rows) <> v_expected_count then
    raise exception
      'Expected % staged rows and received %',
      v_expected_count,
      jsonb_array_length(p_rows);
  end if;

  select
    count(distinct source_row_number),
    min(source_row_number),
    max(source_row_number)
  into
    v_distinct_source_row_count,
    v_min_source_row,
    v_max_source_row
  from jsonb_to_recordset(p_rows) as row_check (
    source_row_number integer
  );

  if v_distinct_source_row_count <> v_expected_count
    or v_min_source_row <> 2
    or v_max_source_row <> 86
  then
    raise exception
      'January source rows must contain each original row number from 2 through 86 exactly once';
  end if;

  select count(*)
  into v_missing_source_row_count
  from generate_series(2, 86) as required_row(source_row_number)
  where not exists (
    select 1
    from jsonb_to_recordset(p_rows) as supplied_row (
      source_row_number integer
    )
    where supplied_row.source_row_number =
      required_row.source_row_number
  );

  if v_missing_source_row_count <> 0 then
    raise exception
      'January payload is missing % required source rows',
      v_missing_source_row_count;
  end if;

  if exists (
    select 1
    from public.financial_import_batches fib
    where fib.workspace_id = p_workspace_id
      and fib.program_id = p_program_id
      and fib.source_file_sha256 = p_source_file_sha256
  ) then
    raise exception
      'The reconciled January source file already has an import batch';
  end if;

  select count(*)
  into v_matching_source_count
  from public.financial_sources fs
  where fs.workspace_id = p_workspace_id
    and fs.program_id = p_program_id
    and fs.source_type = 'bank_account'
    and fs.account_mask = '2847'
    and fs.status = 'active';

  if v_matching_source_count > 1 then
    raise exception
      'Multiple active financial sources match account ending 2847; import requires source reconciliation';
  end if;

  if v_matching_source_count = 1 then
    select fs.id
    into strict v_source_id
    from public.financial_sources fs
    where fs.workspace_id = p_workspace_id
      and fs.program_id = p_program_id
      and fs.source_type = 'bank_account'
      and fs.account_mask = '2847'
      and fs.status = 'active';
  end if;

  if v_matching_source_count = 0 then
    insert into public.financial_sources (
      workspace_id,
      program_id,
      source_name,
      institution_name,
      source_type,
      account_mask,
      source_mode,
      status,
      created_by
    )
    values (
      p_workspace_id,
      p_program_id,
      'Truist Account Ending 2847',
      'Truist',
      'bank_account',
      '2847',
      'historical',
      'active',
      v_user_id
    )
    returning id into v_source_id;
  end if;

  insert into public.financial_import_batches (
    workspace_id,
    program_id,
    financial_source_id,
    statement_period_start,
    statement_period_end,
    source_filename,
    source_file_sha256,
    source_row_count,
    import_status,
    data_boundary,
    source_lifecycle,
    uploaded_by
  )
  values (
    p_workspace_id,
    p_program_id,
    v_source_id,
    p_statement_period_start,
    p_statement_period_end,
    p_source_filename,
    p_source_file_sha256,
    v_expected_count,
    'uploaded',
    'historical',
    'posted',
    v_user_id
  )
  returning id into v_batch_id;

  insert into public.staged_financial_transactions (
    workspace_id,
    program_id,
    financial_source_id,
    import_batch_id,
    source_row_number,
    source_row_identity,
    source_content_fingerprint,
    raw_posted_date,
    raw_transaction_date,
    raw_transaction_type,
    raw_check_serial,
    raw_full_description,
    raw_merchant_name,
    raw_category_name,
    raw_subcategory_name,
    raw_amount,
    raw_daily_posted_balance,
    posted_date,
    transaction_date,
    transaction_type,
    check_serial,
    merchant_name,
    category_name,
    subcategory_name,
    amount,
    daily_posted_balance,
    transaction_lifecycle,
    parse_status,
    parse_error,
    created_by
  )
  select
    p_workspace_id,
    p_program_id,
    v_source_id,
    v_batch_id,
    row_data.source_row_number,
    row_data.source_row_identity,
    row_data.source_content_fingerprint,
    row_data.raw_posted_date,
    row_data.raw_transaction_date,
    row_data.raw_transaction_type,
    nullif(row_data.raw_check_serial, ''),
    row_data.raw_full_description,
    nullif(row_data.raw_merchant_name, ''),
    row_data.raw_category_name,
    row_data.raw_subcategory_name,
    row_data.raw_amount,
    row_data.raw_daily_posted_balance,
    row_data.posted_date,
    row_data.transaction_date,
    row_data.transaction_type,
    nullif(row_data.check_serial, ''),
    nullif(row_data.merchant_name, ''),
    row_data.category_name,
    row_data.subcategory_name,
    row_data.amount,
    row_data.daily_posted_balance,
    'posted',
    'parsed',
    null,
    v_user_id
  from jsonb_to_recordset(p_rows) as row_data (
    source_row_number integer,
    source_row_identity text,
    source_content_fingerprint text,
    raw_posted_date text,
    raw_transaction_date text,
    raw_transaction_type text,
    raw_check_serial text,
    raw_full_description text,
    raw_merchant_name text,
    raw_category_name text,
    raw_subcategory_name text,
    raw_amount text,
    raw_daily_posted_balance text,
    posted_date date,
    transaction_date date,
    transaction_type text,
    check_serial text,
    merchant_name text,
    category_name text,
    subcategory_name text,
    amount numeric,
    daily_posted_balance numeric
  );

  get diagnostics v_inserted_count = row_count;

  if v_inserted_count <> v_expected_count then
    raise exception
      'Atomic import expected % rows and inserted %',
      v_expected_count,
      v_inserted_count;
  end if;

  select
    count(*),
    coalesce(sum(sft.amount), 0)
  into
    v_inserted_count,
    v_observed_total
  from public.staged_financial_transactions sft
  where sft.import_batch_id = v_batch_id;

  if v_inserted_count <> v_expected_count then
    raise exception
      'Post-insert verification expected % rows and found %',
      v_expected_count,
      v_inserted_count;
  end if;

  if v_observed_total <> v_expected_total then
    raise exception
      'Normalized amount total mismatch. Expected % and found %',
      v_expected_total,
      v_observed_total;
  end if;

  update public.financial_import_batches
  set import_status = 'ready_for_review'
  where id = v_batch_id
    and import_status = 'uploaded';

  if not found then
    raise exception
      'January batch could not be advanced to ready_for_review';
  end if;

  return query
  select
    v_source_id,
    v_batch_id,
    v_inserted_count,
    'ready_for_review'::text;
end;
$function$;

-- Execution privilege remains intentionally withheld in this candidate.
--
-- Future reviewed execution statement:
--
-- revoke all on function
--   public.import_january_2025_financial_batch(
--     uuid,
--     uuid,
--     text,
--     text,
--     date,
--     date,
--     jsonb
--   )
-- from public;
--
-- grant execute on function
--   public.import_january_2025_financial_batch(
--     uuid,
--     uuid,
--     text,
--     text,
--     date,
--     date,
--     jsonb
--   )
-- to authenticated;
