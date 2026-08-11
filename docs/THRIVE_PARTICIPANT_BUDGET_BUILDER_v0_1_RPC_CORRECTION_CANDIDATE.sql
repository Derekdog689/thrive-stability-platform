-- THRIVE Participant Budget Builder v0.1
-- REVIEW-ONLY RPC CORRECTION CANDIDATE
--
-- Purpose:
-- Reconcile participant Budget line write RPCs with the live
-- participant_budget_lines.remaining_amount generated column.
--
-- IMPORTANT:
-- This file is a candidate only. Do not execute without explicit approval.
-- It intentionally does not alter table schema, RLS, ownership, grants,
-- Trust Engine boundaries, Johnny data, or participant authority scope.
--
-- Live truth confirmed before drafting:
-- remaining_amount is GENERATED ALWAYS AS
-- GREATEST(planned_amount - actual_amount, 0)
--
-- Therefore participant write RPCs must not INSERT or UPDATE
-- remaining_amount directly.

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
set search_path to ''
as $function$
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
       v_period.supported_person_id,
       v_period.program_id,
       v_period.workspace_id
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
    budget_period_id,
    category_name,
    category_type,
    planned_amount,
    actual_amount,
    sort_order,
    is_active
  )
  values (
    p_budget_period_id,
    v_category_name,
    p_category_type,
    p_planned_amount,
    0,
    p_sort_order,
    true
  )
  returning id into v_budget_line_id;

  return v_budget_line_id;
end;
$function$;


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
set search_path to ''
as $function$
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
       v_period.supported_person_id,
       v_period.program_id,
       v_period.workspace_id
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
      is_active = p_is_active,
      sort_order = p_sort_order
  where id = p_budget_line_id
  returning * into v_line;

  return v_line;
end;
$function$;
