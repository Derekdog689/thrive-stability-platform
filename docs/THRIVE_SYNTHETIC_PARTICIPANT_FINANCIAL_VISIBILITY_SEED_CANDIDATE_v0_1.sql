-- THRIVE SYNTHETIC PARTICIPANT FINANCIAL VISIBILITY SEED CANDIDATE v0.1
-- REVIEW AND DRY-RUN ONLY
-- FINAL ROLLBACK PREVENTS INSTALLATION

begin;

-- Controlled fixture identities
-- Workspace: 71000000-0000-4000-8000-000000000001
-- Program:   71000000-0000-4000-8000-000000000002
-- Person D:  71000000-0000-4000-8000-000000000009

-- Stable synthetic IDs
-- Source:     72000000-0000-4000-8000-000000000001
-- Batch:      72000000-0000-4000-8000-000000000002
-- Txn 1:      72000000-0000-4000-8000-000000000003
-- Txn 2:      72000000-0000-4000-8000-000000000004
-- Ownership:  72000000-0000-4000-8000-000000000005

do $$
begin
  if not exists (
    select 1
    from public.workspaces
    where id = '71000000-0000-4000-8000-000000000001'::uuid
      and status = 'active'
  ) then
    raise exception 'Controlled fixture workspace is missing or inactive';
  end if;

  if not exists (
    select 1
    from public.programs
    where id = '71000000-0000-4000-8000-000000000002'::uuid
      and workspace_id = '71000000-0000-4000-8000-000000000001'::uuid
      and status = 'active'
  ) then
    raise exception 'Controlled fixture program is missing or inactive';
  end if;

  if not exists (
    select 1
    from public.supported_people
    where id = '71000000-0000-4000-8000-000000000009'::uuid
      and workspace_id = '71000000-0000-4000-8000-000000000001'::uuid
      and status = 'active'
  ) then
    raise exception 'Controlled Person D fixture is missing or inactive';
  end if;

  if not exists (
    select 1
    from public.program_participants
    where supported_person_id = '71000000-0000-4000-8000-000000000009'::uuid
      and program_id = '71000000-0000-4000-8000-000000000002'::uuid
      and workspace_id = '71000000-0000-4000-8000-000000000001'::uuid
      and status = 'active'
  ) then
    raise exception 'Controlled Person D program participation is missing or inactive';
  end if;

  if exists (
    select 1
    from public.financial_sources
    where id = '72000000-0000-4000-8000-000000000001'::uuid
  ) then
    raise exception 'Synthetic financial source ID already exists';
  end if;
end;
$$;

insert into public.financial_sources (
  id,
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
  '72000000-0000-4000-8000-000000000001'::uuid,
  '71000000-0000-4000-8000-000000000001'::uuid,
  '71000000-0000-4000-8000-000000000002'::uuid,
  'SYNTHETIC TEST BANK ACCOUNT 9999',
  'THRIVE TEST BANK',
  'bank_account',
  '9999',
  'historical',
  'active',
  auth.uid()
);

insert into public.financial_import_batches (
  id,
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
  '72000000-0000-4000-8000-000000000002'::uuid,
  '71000000-0000-4000-8000-000000000001'::uuid,
  '71000000-0000-4000-8000-000000000002'::uuid,
  '72000000-0000-4000-8000-000000000001'::uuid,
  date '2099-02-01',
  date '2099-02-28',
  'synthetic_person_d_financial_visibility_2099_02.csv',
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  2,
  'ready_for_review',
  'historical',
  'posted',
  auth.uid()
);

insert into public.staged_financial_transactions (
  id,
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
  '72000000-0000-4000-8000-000000000003'::uuid,
  '71000000-0000-4000-8000-000000000001'::uuid,
  '71000000-0000-4000-8000-000000000002'::uuid,
  '72000000-0000-4000-8000-000000000001'::uuid,
  '72000000-0000-4000-8000-000000000002'::uuid,
  2,
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:2',
  'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
  '02/05/2099',
  '02/05/2099',
  'DEBIT',
  null,
  'SYNTHETIC TEST GROCER',
  'TEST GROCER',
  'Food',
  'Groceries',
  '-25.00',
  '975.00',
  date '2099-02-05',
  date '2099-02-05',
  'DEBIT',
  null,
  'TEST GROCER',
  'Food',
  'Groceries',
  -25.00,
  975.00,
  'posted',
  'parsed',
  null,
  auth.uid()
),
(
  '72000000-0000-4000-8000-000000000004'::uuid,
  '71000000-0000-4000-8000-000000000001'::uuid,
  '71000000-0000-4000-8000-000000000002'::uuid,
  '72000000-0000-4000-8000-000000000001'::uuid,
  '72000000-0000-4000-8000-000000000002'::uuid,
  3,
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:3',
  'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  '02/06/2099',
  '02/06/2099',
  'DEBIT',
  null,
  'SYNTHETIC TEST TRANSIT',
  'TEST TRANSIT',
  'Transportation',
  'Local transit',
  '-10.00',
  '965.00',
  date '2099-02-06',
  date '2099-02-06',
  'DEBIT',
  null,
  'TEST TRANSIT',
  'Transportation',
  'Local transit',
  -10.00,
  965.00,
  'posted',
  'parsed',
  null,
  auth.uid()
);

insert into public.financial_source_owners (
  id,
  workspace_id,
  program_id,
  financial_source_id,
  supported_person_id,
  ownership_role,
  status,
  created_by
)
values (
  '72000000-0000-4000-8000-000000000005'::uuid,
  '71000000-0000-4000-8000-000000000001'::uuid,
  '71000000-0000-4000-8000-000000000002'::uuid,
  '72000000-0000-4000-8000-000000000001'::uuid,
  '71000000-0000-4000-8000-000000000009'::uuid,
  'primary',
  'active',
  auth.uid()
);

-- Dry-run inventory
select
  (select count(*) from public.financial_sources
   where id = '72000000-0000-4000-8000-000000000001'::uuid) as source_count,
  (select count(*) from public.financial_import_batches
   where id = '72000000-0000-4000-8000-000000000002'::uuid) as batch_count,
  (select count(*) from public.staged_financial_transactions
   where import_batch_id = '72000000-0000-4000-8000-000000000002'::uuid) as transaction_count,
  (select count(*) from public.financial_source_owners
   where id = '72000000-0000-4000-8000-000000000005'::uuid) as ownership_count;

rollback;
