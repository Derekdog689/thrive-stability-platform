-- THRIVE Budget Categories SQL Draft
-- Purpose:
-- Draft SQL for the THRIVE budget category layer.
--
-- This file is for review only.
-- Do not run in Supabase until reviewed and approved.
--
-- Security boundary:
-- Mock/test only.
-- No real financial, trust, beneficiary, clinical, recovery, or personally identifying data.
-- Budget categories are planning and visibility tools only.
-- Budget categories do not create legal, clinical, fiduciary, credit repair,
-- bankruptcy, investment, or crisis-service authority.

-- ============================================================
-- 1. budget_categories table
-- ============================================================

create table if not exists public.budget_categories (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,

  category_name text not null,
  category_type text not null,

  planned_amount numeric not null default 0,
  spent_amount numeric not null default 0,
  remaining_amount numeric not null default 0,

  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_by uuid not null references auth.users(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint budget_categories_name_not_blank
    check (length(trim(category_name)) > 0),

  constraint budget_categories_category_type_check
    check (category_type in ('protected', 'flexible', 'support', 'reserve')),

  constraint budget_categories_planned_amount_nonnegative
    check (planned_amount >= 0),

  constraint budget_categories_spent_amount_nonnegative
    check (spent_amount >= 0),

  constraint budget_categories_remaining_amount_nonnegative
    check (remaining_amount >= 0)
);

-- Helpful indexes for workspace-scoped and program-scoped loading.
create index if not exists budget_categories_workspace_id_idx
  on public.budget_categories (workspace_id);

create index if not exists budget_categories_program_id_idx
  on public.budget_categories (program_id);

create index if not exists budget_categories_workspace_program_idx
  on public.budget_categories (workspace_id, program_id);

create index if not exists budget_categories_active_sort_idx
  on public.budget_categories (workspace_id, program_id, is_active, sort_order);

create index if not exists budget_categories_created_by_idx
  on public.budget_categories (created_by);

-- ============================================================
-- 2. updated_at trigger
-- ============================================================

create or replace function public.set_budget_categories_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_budget_categories_updated_at on public.budget_categories;

create trigger set_budget_categories_updated_at
before update on public.budget_categories
for each row
execute function public.set_budget_categories_updated_at();

-- ============================================================
-- 2b. program/workspace validation helper
-- ============================================================

create or replace function public.is_program_in_workspace(
  p_program_id uuid,
  p_workspace_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.programs
    where id = p_program_id
      and workspace_id = p_workspace_id
      and status = 'active'
  );
$$;

revoke all on function public.is_program_in_workspace(uuid, uuid)
  from public;

grant execute on function public.is_program_in_workspace(uuid, uuid)
  to authenticated;

-- ============================================================
-- 3. RLS enablement
-- ============================================================

alter table public.budget_categories enable row level security;

-- ============================================================
-- 4. RLS policies
-- ============================================================
--
-- These policies assume the existing workspace helper functions exist:
--
-- public.is_workspace_member(p_workspace_id uuid)
-- public.is_workspace_admin(p_workspace_id uuid)
--
-- Budget categories are scoped to both workspace_id and program_id.
-- The first MVP policy checks workspace membership/admin status.
-- Program-specific membership is deferred.

drop policy if exists "budget_categories_select_for_workspace_members"
  on public.budget_categories;

create policy "budget_categories_select_for_workspace_members"
on public.budget_categories
for select
to authenticated
using (
  public.is_workspace_member(workspace_id)
);

drop policy if exists "budget_categories_insert_for_workspace_admins"
  on public.budget_categories;

create policy "budget_categories_insert_for_workspace_admins"
on public.budget_categories
for insert
to authenticated
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(program_id, workspace_id)
  and created_by = auth.uid()
);

drop policy if exists "budget_categories_update_for_workspace_admins"
  on public.budget_categories;

create policy "budget_categories_update_for_workspace_admins"
on public.budget_categories
for update
to authenticated
using (
  public.is_workspace_admin(workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(program_id, workspace_id)
);

-- No delete policy during MVP.
-- Budget categories should be deactivated with is_active = false
-- rather than hard-deleted.

-- ============================================================
-- 5. Optional controlled app function
-- ============================================================
--
-- This function creates a mock/test budget category only when the signed-in
-- user is an admin of the target workspace.
--
-- It also verifies that the selected program belongs to the same workspace.

create or replace function public.create_budget_category_for_program(
  p_workspace_id uuid,
  p_program_id uuid,
  p_category_name text,
  p_category_type text,
  p_planned_amount numeric default 0,
  p_spent_amount numeric default 0,
  p_sort_order integer default 0
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid;
  v_category_id uuid;
  v_program_workspace_id uuid;
  v_remaining_amount numeric;
begin
  v_actor_id := auth.uid();

  if v_actor_id is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_workspace_admin(p_workspace_id) then
    raise exception 'Workspace admin access required';
  end if;

  select workspace_id
  into v_program_workspace_id
  from public.programs
  where id = p_program_id;

  if v_program_workspace_id is null then
    raise exception 'Program not found';
  end if;

  if v_program_workspace_id <> p_workspace_id then
    raise exception 'Program does not belong to selected workspace';
  end if;

  if p_category_type not in ('protected', 'flexible', 'support', 'reserve') then
    raise exception 'Invalid budget category type';
  end if;

  if p_planned_amount < 0 then
    raise exception 'Planned amount cannot be negative';
  end if;

  if p_spent_amount < 0 then
    raise exception 'Spent amount cannot be negative';
  end if;

  v_remaining_amount := p_planned_amount - p_spent_amount;

  if v_remaining_amount < 0 then
    v_remaining_amount := 0;
  end if;

  insert into public.budget_categories (
    workspace_id,
    program_id,
    category_name,
    category_type,
    planned_amount,
    spent_amount,
    remaining_amount,
    sort_order,
    is_active,
    created_by
  )
  values (
    p_workspace_id,
    p_program_id,
    trim(p_category_name),
    p_category_type,
    p_planned_amount,
    p_spent_amount,
    v_remaining_amount,
    p_sort_order,
    true,
    v_actor_id
  )
  returning id into v_category_id;

  return v_category_id;
end;
$$;

revoke all on function public.create_budget_category_for_program(
  uuid,
  uuid,
  text,
  text,
  numeric,
  numeric,
  integer
)
from public;

grant execute on function public.create_budget_category_for_program(
  uuid,
  uuid,
  text,
  text,
  numeric,
  numeric,
  integer
)
to authenticated;

-- ============================================================
-- 6. Draft review notes
-- ============================================================
--
-- This draft currently includes:
--
-- budget_categories table
-- workspace foreign key
-- program foreign key
-- created_by auth user foreign key
-- category type check constraint
-- nonnegative amount constraints
-- updated_at trigger
-- RLS enabled
-- select policy for active workspace members via helper function
-- insert/update policies for workspace admins via helper function
-- optional controlled budget category creation function
--
-- This draft does not include:
--
-- real financial records
-- real trust ledger data
-- transaction import
-- receipt uploads
-- document storage
-- category history table
-- monthly budget periods
-- program-specific membership rules
-- hard delete policy
--
-- Do not run until reviewed.
