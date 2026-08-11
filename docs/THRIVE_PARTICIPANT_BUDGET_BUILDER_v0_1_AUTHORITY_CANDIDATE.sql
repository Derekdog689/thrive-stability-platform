-- THRIVE Participant Budget Builder v0.1
-- REVIEW-ONLY DATABASE AUTHORITY CANDIDATE
-- DO NOT EXECUTE WITHOUT EXPLICIT APPROVAL.

-- Proposed participant RPCs:
--   create_my_budget_draft_v1
--   update_my_budget_period_v1
--   add_my_budget_line_v1
--   update_my_budget_line_v1
--   activate_my_budget_v1
--   complete_my_budget_v1
--
-- Design rule:
-- Keep participant table access read-only.
-- Do not add broad participant INSERT/UPDATE policies.
-- Use narrow SECURITY DEFINER functions that re-check auth.uid(),
-- participant ownership, active participation, lifecycle, and allowed fields.

create or replace function public.create_my_budget_draft_v1(
  p_program_id uuid,
  p_period_start date,
  p_period_end date,
  p_expected_income numeric default 0,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_supported_person_id uuid;
  v_workspace_id uuid;
  v_budget_period_id uuid;
begin
  if v_actor_id is null then
    raise exception 'Authentication required';
  end if;

  if p_program_id is null then
    raise exception 'Program is required';
  end if;

  if p_period_start is null or p_period_end is null or p_period_start > p_period_end then
    raise exception 'Valid budget period dates are required';
  end if;

  if p_expected_income is null or p_expected_income < 0 then
    raise exception 'Expected income cannot be negative';
  end if;

  if p_notes is not null and length(trim(p_notes)) = 0 then
    raise exception 'Budget notes cannot be blank';
  end if;

  select sp.id, sp.workspace_id
    into v_supported_person_id, v_workspace_id
  from public.supported_people sp
  where sp.auth_user_id = v_actor_id
    and sp.status = 'active';

  if v_supported_person_id is null then
    raise exception 'No active supported-person record is connected to this user';
  end if;

  if not public.is_program_in_workspace(p_program_id, v_workspace_id)
     or not public.is_program_participant_active(
       v_supported_person_id, p_program_id, v_workspace_id
     ) then
    raise exception 'Active program participation is required';
  end if;

  if exists (
    select 1
    from public.participant_budget_periods pbp
    where pbp.supported_person_id = v_supported_person_id
      and pbp.workspace_id = v_workspace_id
      and pbp.program_id = p_program_id
      and pbp.status in ('draft', 'active')
      and pbp.archived_at is null
      and pbp.period_start <= p_period_end
      and pbp.period_end >= p_period_start
  ) then
    raise exception 'A current draft or active budget already overlaps this period';
  end if;

  insert into public.participant_budget_periods (
    workspace_id, program_id, supported_person_id,
    period_start, period_end, status,
    expected_income, notes, created_by
  )
  values (
    v_workspace_id, p_program_id, v_supported_person_id,
    p_period_start, p_period_end, 'draft',
    p_expected_income, nullif(trim(p_notes), ''), v_actor_id
  )
  returning id into v_budget_period_id;

  return v_budget_period_id;
end;
$$;

revoke all on function public.create_my_budget_draft_v1(uuid,date,date,numeric,text) from public;
revoke all on function public.create_my_budget_draft_v1(uuid,date,date,numeric,text) from anon;
grant execute on function public.create_my_budget_draft_v1(uuid,date,date,numeric,text) to authenticated;


create or replace function public.update_my_budget_period_v1(
  p_budget_period_id uuid,
  p_expected_income numeric,
  p_notes text default null
)
returns public.participant_budget_periods
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_period public.participant_budget_periods;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_expected_income is null or p_expected_income < 0 then
    raise exception 'Expected income cannot be negative';
  end if;

  if p_notes is not null and length(trim(p_notes)) = 0 then
    raise exception 'Budget notes cannot be blank';
  end if;

  select * into v_period
  from public.participant_budget_periods
  where id = p_budget_period_id;

  if v_period.id is null then
    raise exception 'Budget period not found';
  end if;

  if not public.is_supported_person_self(v_period.supported_person_id)
     or not public.is_program_participant_active(
       v_period.supported_person_id, v_period.program_id, v_period.workspace_id
     ) then
    raise exception 'Participant budget access denied';
  end if;

  if v_period.status not in ('draft', 'active') then
    raise exception 'Only draft or active budgets can be edited';
  end if;

  update public.participant_budget_periods
  set expected_income = p_expected_income,
      notes = nullif(trim(p_notes), '')
  where id = p_budget_period_id
  returning * into v_period;

  return v_period;
end;
$$;

revoke all on function public.update_my_budget_period_v1(uuid,numeric,text) from public;
revoke all on function public.update_my_budget_period_v1(uuid,numeric,text) from anon;
grant execute on function public.update_my_budget_period_v1(uuid,numeric,text) to authenticated;


create or replace function public.add_my_budget_line_v1(
  p_budget_period_id uuid,
  p_category_name text,
  p_category_type text,
  p_planned_amount numeric default 0,
  p_sort_order integer default 0
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_period public.participant_budget_periods;
  v_category_name text := trim(p_category_name);
  v_budget_line_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if v_category_name is null or length(v_category_name) = 0 then
    raise exception 'Category name is required';
  end if;

  if p_category_type not in ('protected','flexible','support','reserve') then
    raise exception 'Invalid budget category type';
  end if;

  if p_planned_amount is null or p_planned_amount < 0 then
    raise exception 'Planned amount cannot be negative';
  end if;

  select * into v_period
  from public.participant_budget_periods
  where id = p_budget_period_id;

  if v_period.id is null then
    raise exception 'Budget period not found';
  end if;

  if not public.is_supported_person_self(v_period.supported_person_id)
     or not public.is_program_participant_active(
       v_period.supported_person_id, v_period.program_id, v_period.workspace_id
     ) then
    raise exception 'Participant budget access denied';
  end if;

  if v_period.status not in ('draft','active') then
    raise exception 'Categories can only be added to draft or active budgets';
  end if;

  if exists (
    select 1
    from public.participant_budget_lines
    where budget_period_id = p_budget_period_id
      and lower(trim(category_name)) = lower(v_category_name)
  ) then
    raise exception 'A category with this name already exists in the budget';
  end if;

  insert into public.participant_budget_lines (
    budget_period_id, category_name, category_type,
    planned_amount, actual_amount, remaining_amount,
    sort_order, is_active
  )
  values (
    p_budget_period_id, v_category_name, p_category_type,
    p_planned_amount, 0, p_planned_amount,
    p_sort_order, true
  )
  returning id into v_budget_line_id;

  return v_budget_line_id;
end;
$$;

revoke all on function public.add_my_budget_line_v1(uuid,text,text,numeric,integer) from public;
revoke all on function public.add_my_budget_line_v1(uuid,text,text,numeric,integer) from anon;
grant execute on function public.add_my_budget_line_v1(uuid,text,text,numeric,integer) to authenticated;


create or replace function public.update_my_budget_line_v1(
  p_budget_line_id uuid,
  p_category_name text,
  p_category_type text,
  p_planned_amount numeric,
  p_is_active boolean,
  p_sort_order integer default 0
)
returns public.participant_budget_lines
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_line public.participant_budget_lines;
  v_period public.participant_budget_periods;
  v_category_name text := trim(p_category_name);
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if v_category_name is null or length(v_category_name) = 0 then
    raise exception 'Category name is required';
  end if;

  if p_category_type not in ('protected','flexible','support','reserve') then
    raise exception 'Invalid budget category type';
  end if;

  if p_planned_amount is null or p_planned_amount < 0 then
    raise exception 'Planned amount cannot be negative';
  end if;

  select * into v_line
  from public.participant_budget_lines
  where id = p_budget_line_id;

  if v_line.id is null then
    raise exception 'Budget category not found';
  end if;

  select * into v_period
  from public.participant_budget_periods
  where id = v_line.budget_period_id;

  if v_period.id is null
     or not public.is_supported_person_self(v_period.supported_person_id)
     or not public.is_program_participant_active(
       v_period.supported_person_id, v_period.program_id, v_period.workspace_id
     ) then
    raise exception 'Participant budget access denied';
  end if;

  if v_period.status not in ('draft','active') then
    raise exception 'Categories can only be edited on draft or active budgets';
  end if;

  if exists (
    select 1
    from public.participant_budget_lines other
    where other.budget_period_id = v_line.budget_period_id
      and other.id <> v_line.id
      and lower(trim(other.category_name)) = lower(v_category_name)
  ) then
    raise exception 'A category with this name already exists in the budget';
  end if;

  update public.participant_budget_lines
  set category_name = v_category_name,
      category_type = p_category_type,
      planned_amount = p_planned_amount,
      remaining_amount = p_planned_amount - actual_amount,
      is_active = p_is_active,
      sort_order = p_sort_order
  where id = p_budget_line_id
  returning * into v_line;

  return v_line;
end;
$$;

revoke all on function public.update_my_budget_line_v1(uuid,text,text,numeric,boolean,integer) from public;
revoke all on function public.update_my_budget_line_v1(uuid,text,text,numeric,boolean,integer) from anon;
grant execute on function public.update_my_budget_line_v1(uuid,text,text,numeric,boolean,integer) to authenticated;


create or replace function public.activate_my_budget_v1(
  p_budget_period_id uuid,
  p_acknowledge_over_plan boolean default false
)
returns public.participant_budget_periods
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_period public.participant_budget_periods;
  v_planned_total numeric;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into v_period
  from public.participant_budget_periods
  where id = p_budget_period_id;

  if v_period.id is null
     or not public.is_supported_person_self(v_period.supported_person_id)
     or not public.is_program_participant_active(
       v_period.supported_person_id, v_period.program_id, v_period.workspace_id
     ) then
    raise exception 'Participant budget access denied';
  end if;

  if v_period.status <> 'draft' then
    raise exception 'Only a draft budget can be activated';
  end if;

  if not exists (
    select 1
    from public.participant_budget_lines
    where budget_period_id = p_budget_period_id
      and is_active = true
  ) then
    raise exception 'Add at least one active budget category before using this plan';
  end if;

  if exists (
    select 1
    from public.participant_budget_periods other
    where other.id <> v_period.id
      and other.supported_person_id = v_period.supported_person_id
      and other.workspace_id = v_period.workspace_id
      and other.program_id = v_period.program_id
      and other.status = 'active'
      and other.archived_at is null
      and other.period_start <= v_period.period_end
      and other.period_end >= v_period.period_start
  ) then
    raise exception 'Another active budget overlaps this period';
  end if;

  select coalesce(sum(planned_amount),0)
    into v_planned_total
  from public.participant_budget_lines
  where budget_period_id = p_budget_period_id
    and is_active = true;

  if v_planned_total > v_period.expected_income
     and coalesce(p_acknowledge_over_plan,false) = false then
    raise exception 'The plan is above expected income. Explicit acknowledgement is required';
  end if;

  update public.participant_budget_periods
  set status = 'active'
  where id = p_budget_period_id
  returning * into v_period;

  return v_period;
end;
$$;

revoke all on function public.activate_my_budget_v1(uuid,boolean) from public;
revoke all on function public.activate_my_budget_v1(uuid,boolean) from anon;
grant execute on function public.activate_my_budget_v1(uuid,boolean) to authenticated;


create or replace function public.complete_my_budget_v1(
  p_budget_period_id uuid
)
returns public.participant_budget_periods
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_period public.participant_budget_periods;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into v_period
  from public.participant_budget_periods
  where id = p_budget_period_id;

  if v_period.id is null
     or not public.is_supported_person_self(v_period.supported_person_id)
     or not public.is_program_participant_active(
       v_period.supported_person_id, v_period.program_id, v_period.workspace_id
     ) then
    raise exception 'Participant budget access denied';
  end if;

  if v_period.status <> 'active' then
    raise exception 'Only an active budget can be completed';
  end if;

  update public.participant_budget_periods
  set status = 'completed'
  where id = p_budget_period_id
  returning * into v_period;

  return v_period;
end;
$$;

revoke all on function public.complete_my_budget_v1(uuid) from public;
revoke all on function public.complete_my_budget_v1(uuid) from anon;
grant execute on function public.complete_my_budget_v1(uuid) to authenticated;

-- Existing participant SELECT RLS remains.
-- Existing admin policies remain.
-- No participant table INSERT/UPDATE/DELETE policies are proposed.
-- Existing scope-protection and updated_at triggers remain.
-- No transaction association or Trust behavior is included.
