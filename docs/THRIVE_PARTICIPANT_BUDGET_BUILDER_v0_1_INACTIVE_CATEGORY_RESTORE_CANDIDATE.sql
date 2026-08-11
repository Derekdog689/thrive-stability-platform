-- THRIVE Participant Budget Builder v0.1
-- REVIEW-ONLY INACTIVE CATEGORY RESTORE CANDIDATE
--
-- Purpose:
-- Reconcile add_my_budget_line_v1 with the approved no-hard-delete lifecycle.
-- If a same-name category exists and is inactive, restore/update that row
-- instead of creating a duplicate or rejecting the participant's re-add.
--
-- IMPORTANT:
-- Candidate only. Do not execute without explicit approval.
-- No table schema, RLS, grants, indexes, Trust Engine boundaries,
-- Johnny data, or participant authority scope are changed.

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
  v_existing_line public.participant_budget_lines;
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

  select * into v_existing_line
  from public.participant_budget_lines
  where budget_period_id = p_budget_period_id
    and lower(trim(category_name)) = lower(v_category_name)
  order by is_active desc, created_at asc
  limit 1;

  if v_existing_line.id is not null then
    if v_existing_line.is_active then
      raise exception 'A category with this name already exists in the budget';
    end if;

    update public.participant_budget_lines
    set category_name = v_category_name,
        category_type = p_category_type,
        planned_amount = p_planned_amount,
        is_active = true,
        sort_order = p_sort_order
    where id = v_existing_line.id
    returning id into v_budget_line_id;

    return v_budget_line_id;
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
