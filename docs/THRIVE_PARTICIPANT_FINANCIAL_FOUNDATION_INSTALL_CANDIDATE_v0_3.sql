-- THRIVE PARTICIPANT FINANCIAL FOUNDATION INSTALL CANDIDATE v0.3
-- REVIEW AND DRY-RUN CANDIDATE ONLY
-- FINAL ROLLBACK INTENTIONALLY PREVENTS INSTALLATION

begin;

-- ============================================================
-- 0. STATIC COMPATIBILITY ASSUMPTIONS CONFIRMED LIVE
-- ============================================================
-- supported_people(id, workspace_id) has a matching unique index.
-- Existing helpers:
--   is_supported_person_self(uuid)
--   is_supported_person_in_workspace(uuid, uuid)
--   is_program_participant_active(uuid, uuid, uuid)
--   is_program_in_workspace(uuid, uuid)
--   is_workspace_admin(uuid)

-- ============================================================
-- 1. FINANCIAL SOURCE OWNERSHIP
-- ============================================================

create table public.financial_source_owners (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  program_id uuid not null references public.programs(id) on delete restrict,
  financial_source_id uuid not null,
  supported_person_id uuid not null,
  ownership_role text not null default 'primary',
  status text not null default 'active',
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint financial_source_owners_role_check
    check (ownership_role in ('primary', 'authorized_viewer', 'historical_owner')),

  constraint financial_source_owners_status_check
    check (status in ('active', 'inactive', 'archived')),

  constraint financial_source_owners_effective_window_check
    check (effective_to is null or effective_to >= effective_from),

  constraint financial_source_owners_source_scope_fk
    foreign key (financial_source_id, workspace_id, program_id)
    references public.financial_sources(id, workspace_id, program_id)
    on delete restrict,

  constraint financial_source_owners_person_scope_fk
    foreign key (supported_person_id, workspace_id)
    references public.supported_people(id, workspace_id)
    on delete restrict
);

create unique index financial_source_owners_one_active_primary_idx
  on public.financial_source_owners(financial_source_id)
  where status = 'active' and ownership_role = 'primary';

create index financial_source_owners_person_idx
  on public.financial_source_owners(
    workspace_id, program_id, supported_person_id, status
  );

create index financial_source_owners_source_idx
  on public.financial_source_owners(
    workspace_id, program_id, financial_source_id, status
  );

create or replace function public.protect_financial_source_owner_scope()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  if new.workspace_id is distinct from old.workspace_id
    or new.program_id is distinct from old.program_id
    or new.financial_source_id is distinct from old.financial_source_id
    or new.supported_person_id is distinct from old.supported_person_id
    or new.ownership_role is distinct from old.ownership_role
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Financial-source ownership identity and scope are immutable';
  end if;

  new.updated_at := now();
  return new;
end;
$function$;

create trigger protect_financial_source_owner_scope_before_update
before update on public.financial_source_owners
for each row
execute function public.protect_financial_source_owner_scope();

alter table public.financial_source_owners enable row level security;

create policy financial_source_owners_select_for_workspace_admins
  on public.financial_source_owners
  for select
  to authenticated
  using (
    public.is_workspace_admin(workspace_id)
    and public.is_program_in_workspace(program_id, workspace_id)
  );

create policy financial_source_owners_insert_for_workspace_admins
  on public.financial_source_owners
  for insert
  to authenticated
  with check (
    public.is_workspace_admin(workspace_id)
    and public.is_program_in_workspace(program_id, workspace_id)
    and public.is_supported_person_in_workspace(
      supported_person_id,
      workspace_id
    )
    and public.is_program_participant_active(
      supported_person_id,
      program_id,
      workspace_id
    )
    and created_by = auth.uid()
  );

create policy financial_source_owners_update_for_workspace_admins
  on public.financial_source_owners
  for update
  to authenticated
  using (
    public.is_workspace_admin(workspace_id)
    and public.is_program_in_workspace(program_id, workspace_id)
  )
  with check (
    public.is_workspace_admin(workspace_id)
    and public.is_program_in_workspace(program_id, workspace_id)
  );

create policy financial_source_owners_select_for_supported_person_self
  on public.financial_source_owners
  for select
  to authenticated
  using (
    status = 'active'
    and public.is_supported_person_self(supported_person_id)
  );

-- ============================================================
-- 2. SECURITY-DEFINER PARTICIPANT READ FUNCTIONS
-- ============================================================

create or replace function public.get_my_financial_sources_v1()
returns table (
  id uuid,
  workspace_id uuid,
  program_id uuid,
  supported_person_id uuid,
  source_name text,
  institution_name text,
  source_type text,
  account_mask text,
  source_mode text,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $function$
  select
    fs.id,
    fs.workspace_id,
    fs.program_id,
    fso.supported_person_id,
    fs.source_name,
    fs.institution_name,
    fs.source_type,
    fs.account_mask,
    fs.source_mode,
    fs.status,
    fs.created_at,
    fs.updated_at
  from public.financial_sources fs
  join public.financial_source_owners fso
    on fso.financial_source_id = fs.id
   and fso.workspace_id = fs.workspace_id
   and fso.program_id = fs.program_id
  where fso.status = 'active'
    and public.is_supported_person_self(fso.supported_person_id);
$function$;

create or replace function public.get_my_financial_batches_v1()
returns table (
  id uuid,
  workspace_id uuid,
  program_id uuid,
  supported_person_id uuid,
  financial_source_id uuid,
  statement_period_start date,
  statement_period_end date,
  source_filename text,
  source_row_count integer,
  import_status text,
  source_lifecycle text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $function$
  select
    fib.id,
    fib.workspace_id,
    fib.program_id,
    fso.supported_person_id,
    fib.financial_source_id,
    fib.statement_period_start,
    fib.statement_period_end,
    fib.source_filename,
    fib.source_row_count,
    fib.import_status,
    fib.source_lifecycle,
    fib.created_at,
    fib.updated_at
  from public.financial_import_batches fib
  join public.financial_source_owners fso
    on fso.financial_source_id = fib.financial_source_id
   and fso.workspace_id = fib.workspace_id
   and fso.program_id = fib.program_id
  where fso.status = 'active'
    and public.is_supported_person_self(fso.supported_person_id);
$function$;

create or replace function public.get_my_financial_transactions_v1()
returns table (
  id uuid,
  workspace_id uuid,
  program_id uuid,
  supported_person_id uuid,
  financial_source_id uuid,
  import_batch_id uuid,
  posted_date date,
  transaction_date date,
  transaction_type text,
  merchant_name text,
  category_name text,
  subcategory_name text,
  amount numeric,
  transaction_lifecycle text,
  parse_status text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $function$
  select
    sft.id,
    sft.workspace_id,
    sft.program_id,
    fso.supported_person_id,
    sft.financial_source_id,
    sft.import_batch_id,
    sft.posted_date,
    sft.transaction_date,
    sft.transaction_type,
    sft.merchant_name,
    sft.category_name,
    sft.subcategory_name,
    sft.amount,
    sft.transaction_lifecycle,
    sft.parse_status,
    sft.created_at,
    sft.updated_at
  from public.staged_financial_transactions sft
  join public.financial_source_owners fso
    on fso.financial_source_id = sft.financial_source_id
   and fso.workspace_id = sft.workspace_id
   and fso.program_id = sft.program_id
  where fso.status = 'active'
    and sft.parse_status = 'parsed'
    and public.is_supported_person_self(fso.supported_person_id);
$function$;

revoke all on function public.get_my_financial_sources_v1() from public;
revoke all on function public.get_my_financial_batches_v1() from public;
revoke all on function public.get_my_financial_transactions_v1() from public;

grant execute on function public.get_my_financial_sources_v1() to authenticated;
grant execute on function public.get_my_financial_batches_v1() to authenticated;
grant execute on function public.get_my_financial_transactions_v1() to authenticated;

-- ============================================================
-- 3. PARTICIPANT TRANSACTION EXPLANATIONS
-- ============================================================

create table public.participant_transaction_explanations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  program_id uuid not null references public.programs(id) on delete restrict,
  supported_person_id uuid not null,
  staged_transaction_id uuid not null,
  explanation_category text not null,
  explanation_text text,
  status text not null default 'draft',
  submitted_by uuid not null references auth.users(id),
  submitted_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint participant_transaction_explanations_category_check
    check (
      explanation_category in (
        'recognized_purchase',
        'bill_or_essential',
        'transfer',
        'refund_or_reversal',
        'shared_expense',
        'medical_expense',
        'cash_withdrawal_context',
        'incorrect_or_unrecognized',
        'other'
      )
    ),

  constraint participant_transaction_explanations_status_check
    check (
      status in (
        'draft',
        'submitted',
        'needs_follow_up',
        'resolved',
        'archived'
      )
    ),

  constraint participant_transaction_explanations_text_not_blank
    check (
      explanation_text is null
      or length(trim(explanation_text)) > 0
    ),

  constraint participant_transaction_explanations_submit_consistency
    check (
      (status = 'draft' and submitted_at is null)
      or
      (status <> 'draft' and submitted_at is not null)
    ),

  constraint participant_transaction_explanations_person_scope_fk
    foreign key (supported_person_id, workspace_id)
    references public.supported_people(id, workspace_id)
    on delete restrict,

  constraint participant_transaction_explanations_transaction_scope_fk
    foreign key (staged_transaction_id, workspace_id, program_id)
    references public.staged_financial_transactions(
      id,
      workspace_id,
      program_id
    )
    on delete restrict
);

create index participant_transaction_explanations_person_idx
  on public.participant_transaction_explanations(
    workspace_id,
    program_id,
    supported_person_id,
    status
  );

create index participant_transaction_explanations_transaction_idx
  on public.participant_transaction_explanations(
    staged_transaction_id,
    status
  );

create or replace function public.protect_participant_transaction_explanation_scope()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  if new.workspace_id is distinct from old.workspace_id
    or new.program_id is distinct from old.program_id
    or new.supported_person_id is distinct from old.supported_person_id
    or new.staged_transaction_id is distinct from old.staged_transaction_id
    or new.submitted_by is distinct from old.submitted_by
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Participant explanation identity and scope are immutable';
  end if;

  new.updated_at := now();
  return new;
end;
$function$;

create trigger protect_participant_transaction_explanation_scope_before_update
before update on public.participant_transaction_explanations
for each row
execute function public.protect_participant_transaction_explanation_scope();

alter table public.participant_transaction_explanations enable row level security;

create policy participant_transaction_explanations_select_self
  on public.participant_transaction_explanations
  for select
  to authenticated
  using (
    public.is_supported_person_self(supported_person_id)
  );

create policy participant_transaction_explanations_insert_self
  on public.participant_transaction_explanations
  for insert
  to authenticated
  with check (
    submitted_by = auth.uid()
    and public.is_supported_person_self(supported_person_id)
    and public.is_program_participant_active(
      supported_person_id,
      program_id,
      workspace_id
    )
    and exists (
      select 1
      from public.financial_source_owners fso
      join public.staged_financial_transactions sft
        on sft.financial_source_id = fso.financial_source_id
       and sft.workspace_id = fso.workspace_id
       and sft.program_id = fso.program_id
      where fso.supported_person_id =
              public.participant_transaction_explanations.supported_person_id
        and fso.workspace_id =
              public.participant_transaction_explanations.workspace_id
        and fso.program_id =
              public.participant_transaction_explanations.program_id
        and fso.status = 'active'
        and sft.id =
              public.participant_transaction_explanations.staged_transaction_id
    )
  );

create policy participant_transaction_explanations_update_self_draft
  on public.participant_transaction_explanations
  for update
  to authenticated
  using (
    status = 'draft'
    and submitted_by = auth.uid()
    and public.is_supported_person_self(supported_person_id)
  )
  with check (
    submitted_by = auth.uid()
    and public.is_supported_person_self(supported_person_id)
  );

create policy participant_transaction_explanations_select_for_workspace_admins
  on public.participant_transaction_explanations
  for select
  to authenticated
  using (
    public.is_workspace_admin(workspace_id)
    and public.is_program_in_workspace(program_id, workspace_id)
  );

create policy participant_transaction_explanations_update_for_workspace_admins
  on public.participant_transaction_explanations
  for update
  to authenticated
  using (
    public.is_workspace_admin(workspace_id)
    and public.is_program_in_workspace(program_id, workspace_id)
  )
  with check (
    public.is_workspace_admin(workspace_id)
    and public.is_program_in_workspace(program_id, workspace_id)
  );

-- ============================================================
-- 4. PARTICIPANT BUDGET PERIODS
-- ============================================================

create table public.participant_budget_periods (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  program_id uuid not null references public.programs(id) on delete restrict,
  supported_person_id uuid not null,
  period_start date not null,
  period_end date not null,
  status text not null default 'draft',
  expected_income numeric not null default 0,
  notes text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,

  constraint participant_budget_periods_period_check
    check (period_start <= period_end),

  constraint participant_budget_periods_status_check
    check (status in ('draft', 'active', 'completed', 'archived')),

  constraint participant_budget_periods_income_nonnegative
    check (expected_income >= 0),

  constraint participant_budget_periods_notes_not_blank
    check (notes is null or length(trim(notes)) > 0),

  constraint participant_budget_periods_person_scope_fk
    foreign key (supported_person_id, workspace_id)
    references public.supported_people(id, workspace_id)
    on delete restrict
);

create index participant_budget_periods_person_period_idx
  on public.participant_budget_periods(
    workspace_id,
    program_id,
    supported_person_id,
    period_start,
    period_end
  );

create unique index participant_budget_periods_one_active_exact_period_idx
  on public.participant_budget_periods(
    supported_person_id,
    period_start,
    period_end
  )
  where status = 'active';

create or replace function public.protect_participant_budget_period_scope()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  if new.workspace_id is distinct from old.workspace_id
    or new.program_id is distinct from old.program_id
    or new.supported_person_id is distinct from old.supported_person_id
    or new.period_start is distinct from old.period_start
    or new.period_end is distinct from old.period_end
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Participant budget period identity and scope are immutable';
  end if;

  new.updated_at := now();
  return new;
end;
$function$;

create trigger protect_participant_budget_period_scope_before_update
before update on public.participant_budget_periods
for each row
execute function public.protect_participant_budget_period_scope();

alter table public.participant_budget_periods enable row level security;

create policy participant_budget_periods_select_self
  on public.participant_budget_periods
  for select
  to authenticated
  using (
    public.is_supported_person_self(supported_person_id)
  );

create policy participant_budget_periods_select_for_workspace_admins
  on public.participant_budget_periods
  for select
  to authenticated
  using (
    public.is_workspace_admin(workspace_id)
    and public.is_program_in_workspace(program_id, workspace_id)
  );

create policy participant_budget_periods_insert_for_workspace_admins
  on public.participant_budget_periods
  for insert
  to authenticated
  with check (
    public.is_workspace_admin(workspace_id)
    and public.is_program_in_workspace(program_id, workspace_id)
    and public.is_supported_person_in_workspace(
      supported_person_id,
      workspace_id
    )
    and public.is_program_participant_active(
      supported_person_id,
      program_id,
      workspace_id
    )
    and created_by = auth.uid()
  );

create policy participant_budget_periods_update_for_workspace_admins
  on public.participant_budget_periods
  for update
  to authenticated
  using (
    public.is_workspace_admin(workspace_id)
    and public.is_program_in_workspace(program_id, workspace_id)
  )
  with check (
    public.is_workspace_admin(workspace_id)
    and public.is_program_in_workspace(program_id, workspace_id)
  );

-- ============================================================
-- 5. PARTICIPANT BUDGET LINES
-- ============================================================

create table public.participant_budget_lines (
  id uuid primary key default gen_random_uuid(),
  budget_period_id uuid not null
    references public.participant_budget_periods(id)
    on delete restrict,
  category_name text not null,
  category_type text not null,
  planned_amount numeric not null default 0,
  actual_amount numeric not null default 0,
  remaining_amount numeric generated always as (
    greatest(planned_amount - actual_amount, 0)
  ) stored,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint participant_budget_lines_name_not_blank
    check (length(trim(category_name)) > 0),

  constraint participant_budget_lines_type_check
    check (
      category_type in (
        'protected',
        'flexible',
        'support',
        'reserve'
      )
    ),

  constraint participant_budget_lines_planned_nonnegative
    check (planned_amount >= 0),

  constraint participant_budget_lines_actual_nonnegative
    check (actual_amount >= 0)
);

create index participant_budget_lines_period_sort_idx
  on public.participant_budget_lines(
    budget_period_id,
    is_active,
    sort_order
  );

create or replace function public.set_participant_budget_line_updated_at()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

create trigger set_participant_budget_line_updated_at_before_update
before update on public.participant_budget_lines
for each row
execute function public.set_participant_budget_line_updated_at();

alter table public.participant_budget_lines enable row level security;

create policy participant_budget_lines_select_self
  on public.participant_budget_lines
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.participant_budget_periods pbp
      where pbp.id = budget_period_id
        and public.is_supported_person_self(pbp.supported_person_id)
    )
  );

create policy participant_budget_lines_select_for_workspace_admins
  on public.participant_budget_lines
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.participant_budget_periods pbp
      where pbp.id = budget_period_id
        and public.is_workspace_admin(pbp.workspace_id)
        and public.is_program_in_workspace(
          pbp.program_id,
          pbp.workspace_id
        )
    )
  );

create policy participant_budget_lines_insert_for_workspace_admins
  on public.participant_budget_lines
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.participant_budget_periods pbp
      where pbp.id = budget_period_id
        and public.is_workspace_admin(pbp.workspace_id)
        and public.is_program_in_workspace(
          pbp.program_id,
          pbp.workspace_id
        )
    )
  );

create policy participant_budget_lines_update_for_workspace_admins
  on public.participant_budget_lines
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.participant_budget_periods pbp
      where pbp.id = budget_period_id
        and public.is_workspace_admin(pbp.workspace_id)
        and public.is_program_in_workspace(
          pbp.program_id,
          pbp.workspace_id
        )
    )
  )
  with check (
    exists (
      select 1
      from public.participant_budget_periods pbp
      where pbp.id = budget_period_id
        and public.is_workspace_admin(pbp.workspace_id)
        and public.is_program_in_workspace(
          pbp.program_id,
          pbp.workspace_id
        )
    )
  );

-- ============================================================
-- 6. DRY-RUN INVENTORY
-- ============================================================

select
  to_regclass('public.financial_source_owners') as ownership_table,
  to_regclass('public.participant_transaction_explanations') as explanation_table,
  to_regclass('public.participant_budget_periods') as budget_period_table,
  to_regclass('public.participant_budget_lines') as budget_line_table;

select
  p.proname as function_name,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n
  on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'get_my_financial_sources_v1',
    'get_my_financial_batches_v1',
    'get_my_financial_transactions_v1'
  )
order by p.proname;

-- Intentional rollback: candidate compiles but installs nothing.
rollback;
