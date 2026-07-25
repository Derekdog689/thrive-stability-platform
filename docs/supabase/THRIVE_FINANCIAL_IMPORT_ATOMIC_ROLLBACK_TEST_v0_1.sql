-- THRIVE Financial Import Atomic Rollback Test
-- Version: v0.1
-- Classification: SYNTHETIC TEST ONLY
--
-- Purpose:
-- Prove that a failure after creating a source, batch, and staged rows
-- rolls back the complete unit of work.
--
-- This script:
-- - uses synthetic identifiers only;
-- - does not call the January import function;
-- - does not use the January source hash;
-- - does not use account ending 2847;
-- - intentionally raises an exception;
-- - verifies that no synthetic records remain.

do $test$
declare
  v_workspace_id constant uuid :=
    'd1cb9168-b0cd-42d0-8745-024c3e421c11'::uuid;

  v_program_id constant uuid :=
    'f67f14a2-6666-44d6-99d4-dbb2678a2863'::uuid;

  v_test_hash constant text :=
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

  v_test_account_mask constant text :=
    'ROLLBACK-V01';

  v_actor_id uuid;
  v_source_id uuid;
  v_batch_id uuid;

  v_source_count integer;
  v_batch_count integer;
  v_row_count integer;

  v_failure_observed boolean := false;
begin
  select au.id
  into v_actor_id
  from auth.users au
  order by au.created_at
  limit 1;

  if v_actor_id is null then
    raise exception
      'Synthetic rollback test requires at least one authenticated user';
  end if;

  -- Preflight: this sentinel must not already exist.
  select count(*)
  into v_source_count
  from public.financial_sources fs
  where fs.workspace_id = v_workspace_id
    and fs.program_id = v_program_id
    and fs.account_mask = v_test_account_mask;

  select count(*)
  into v_batch_count
  from public.financial_import_batches fib
  where fib.workspace_id = v_workspace_id
    and fib.program_id = v_program_id
    and fib.source_file_sha256 = v_test_hash;

  select count(*)
  into v_row_count
  from public.staged_financial_transactions sft
  where sft.workspace_id = v_workspace_id
    and sft.program_id = v_program_id
    and split_part(sft.source_row_identity, ':', 1) = v_test_hash;

  if v_source_count <> 0
    or v_batch_count <> 0
    or v_row_count <> 0
  then
    raise exception
      'Synthetic rollback sentinel already exists; reconcile before testing';
  end if;

  begin
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
      v_workspace_id,
      v_program_id,
      'Synthetic Atomic Rollback Source',
      'THRIVE Test Institution',
      'bank_account',
      v_test_account_mask,
      'historical',
      'active',
      v_actor_id
    )
    returning id into v_source_id;

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
      v_workspace_id,
      v_program_id,
      v_source_id,
      date '2099-01-01',
      date '2099-01-31',
      'synthetic_atomic_rollback_test.csv',
      v_test_hash,
      2,
      'uploaded',
      'historical',
      'posted',
      v_actor_id
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
    values
    (
      v_workspace_id,
      v_program_id,
      v_source_id,
      v_batch_id,
      1,
      v_test_hash || ':1',
      'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      '01/02/2099',
      '01/01/2099',
      'POS',
      null,
      'SYNTHETIC ROLLBACK TEST ROW ONE',
      'Synthetic Merchant One',
      'Test Category',
      'Test Subcategory',
      '($10.00)',
      '$990.00',
      date '2099-01-02',
      date '2099-01-01',
      'POS',
      null,
      'Synthetic Merchant One',
      'Test Category',
      'Test Subcategory',
      -10.00,
      990.00,
      'posted',
      'parsed',
      null,
      v_actor_id
    ),
    (
      v_workspace_id,
      v_program_id,
      v_source_id,
      v_batch_id,
      2,
      v_test_hash || ':2',
      'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      '01/03/2099',
      '01/02/2099',
      'POS',
      null,
      'SYNTHETIC ROLLBACK TEST ROW TWO',
      'Synthetic Merchant Two',
      'Test Category',
      'Test Subcategory',
      '($20.00)',
      '$970.00',
      date '2099-01-03',
      date '2099-01-02',
      'POS',
      null,
      'Synthetic Merchant Two',
      'Test Category',
      'Test Subcategory',
      -20.00,
      970.00,
      'posted',
      'parsed',
      null,
      v_actor_id
    );

    -- Confirm the synthetic unit exists before forcing failure.
    if (
      select count(*)
      from public.staged_financial_transactions sft
      where sft.import_batch_id = v_batch_id
    ) <> 2
    then
      raise exception
        'Synthetic setup failed before rollback test';
    end if;

    raise exception
      'INTENTIONAL THRIVE ATOMIC ROLLBACK TEST FAILURE';

  exception
    when others then
      if sqlerrm =
        'INTENTIONAL THRIVE ATOMIC ROLLBACK TEST FAILURE'
      then
        v_failure_observed := true;
      else
        raise;
      end if;
  end;

  if not v_failure_observed then
    raise exception
      'Intentional rollback exception was not observed';
  end if;

  -- The inner exception block is a PostgreSQL subtransaction.
  -- Every write inside it must now be absent.

  select count(*)
  into v_source_count
  from public.financial_sources fs
  where fs.workspace_id = v_workspace_id
    and fs.program_id = v_program_id
    and fs.account_mask = v_test_account_mask;

  select count(*)
  into v_batch_count
  from public.financial_import_batches fib
  where fib.workspace_id = v_workspace_id
    and fib.program_id = v_program_id
    and fib.source_file_sha256 = v_test_hash;

  select count(*)
  into v_row_count
  from public.staged_financial_transactions sft
  where sft.workspace_id = v_workspace_id
    and sft.program_id = v_program_id
    and split_part(sft.source_row_identity, ':', 1) = v_test_hash;

  if v_source_count <> 0 then
    raise exception
      'ROLLBACK FAILURE: % synthetic source records remain',
      v_source_count;
  end if;

  if v_batch_count <> 0 then
    raise exception
      'ROLLBACK FAILURE: % synthetic batch records remain',
      v_batch_count;
  end if;

  if v_row_count <> 0 then
    raise exception
      'ROLLBACK FAILURE: % synthetic staged rows remain',
      v_row_count;
  end if;

  raise notice
    'PASS: intentional failure observed and complete rollback verified';

  raise notice
    'PASS: synthetic sources remaining = %',
    v_source_count;

  raise notice
    'PASS: synthetic batches remaining = %',
    v_batch_count;

  raise notice
    'PASS: synthetic staged rows remaining = %',
    v_row_count;
end;
$test$;
