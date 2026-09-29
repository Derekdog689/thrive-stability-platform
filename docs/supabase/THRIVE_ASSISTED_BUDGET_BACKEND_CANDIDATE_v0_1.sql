-- THRIVE Assisted Budget Backend Candidate v0.1
-- REVIEW ONLY. DO NOT EXECUTE FROM THIS FILE.
--
-- Purpose:
-- 1. Allow a workspace admin to prepare a participant-owned Budget draft from
--    an active Money Support request.
-- 2. Link that draft back to the Support request.
-- 3. Put the Support request into waiting_for_participant with a visible message.
-- 4. Enforce that only the supported person may move draft -> active.
--
-- Existing participant Budget RPCs remain authoritative for participant editing
-- and activation.

create or replace function public.enforce_participant_budget_activation_owner_v1()
returns trigger
language plpgsql
security invoker
set search_path to ''
as $function$
begin
  if old.status = 'draft'
     and new.status = 'active'
     and not public.is_supported_person_self(new.supported_person_id)
  then
    raise exception 'Only the participant may activate this Budget plan';
  end if;

  return new;
end;
$function$;

drop trigger if exists participant_budget_periods_activation_owner_guard
  on public.participant_budget_periods;

create trigger participant_budget_periods_activation_owner_guard
before update of status on public.participant_budget_periods
for each row
execute function public.enforce_participant_budget_activation_owner_v1();

create or replace function public.prepare_assisted_budget_v1(
  p_support_request_id uuid,
  p_period_start date,
  p_period_end date,
  p_expected_income numeric,
  p_notes text,
  p_lines jsonb
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_actor_id uuid := auth.uid();
  v_request public.support_requests;
  v_budget_period_id uuid;
  v_line record;
  v_sort_order integer := 0;
begin
  if v_actor_id is null then
    raise exception 'Authentication required';
  end if;

  select sr.*
    into v_request
  from public.support_requests sr
  where sr.id = p_support_request_id
  for update;

  if v_request.id is null then
    raise exception 'Support request not found';
  end if;

  if not public.is_workspace_admin(v_request.workspace_id) then
    raise exception 'THRIVE workspace admin access required';
  end if;

  if v_request.participant_category <> 'budget_money' then
    raise exception 'Assisted Budget setup requires a Money Support request';
  end if;

  if v_request.status not in ('submitted', 'acknowledged', 'in_progress') then
    raise exception 'This Support request is not available for assisted Budget setup';
  end if;

  if not public.is_program_in_workspace(
       v_request.program_id,
       v_request.workspace_id
     )
     or not public.is_supported_person_in_workspace(
       v_request.supported_person_id,
       v_request.workspace_id
     )
     or not public.is_program_participant_active(
       v_request.supported_person_id,
       v_request.program_id,
       v_request.workspace_id
     )
  then
    raise exception 'Participant program scope is not active';
  end if;

  if p_period_start is null
     or p_period_end is null
     or p_period_start > p_period_end
  then
    raise exception 'Valid Budget period dates are required';
  end if;

  if p_expected_income is null or p_expected_income < 0 then
    raise exception 'Money available cannot be negative';
  end if;

  if p_notes is not null and length(trim(p_notes)) = 0 then
    raise exception 'Budget notes cannot be blank';
  end if;

  if p_lines is null
     or jsonb_typeof(p_lines) <> 'array'
     or jsonb_array_length(p_lines) = 0
  then
    raise exception 'At least one starter Budget category is required';
  end if;

  if exists (
    select 1
    from public.participant_budget_periods pbp
    where pbp.workspace_id = v_request.workspace_id
      and pbp.program_id = v_request.program_id
      and pbp.supported_person_id = v_request.supported_person_id
      and pbp.status in ('draft', 'active')
      and pbp.archived_at is null
      and pbp.period_start <= p_period_end
      and pbp.period_end >= p_period_start
  ) then
    raise exception 'A current draft or active Budget already overlaps this period';
  end if;

  if exists (
    select 1
    from public.support_request_links srl
    where srl.support_request_id = v_request.id
      and srl.budget_period_id is not null
      and srl.archived_at is null
  ) then
    raise exception 'This Support request already has an assisted Budget draft';
  end if;

  insert into public.participant_budget_periods (
    workspace_id,
    program_id,
    supported_person_id,
    period_start,
    period_end,
    status,
    expected_income,
    notes,
    created_by
  )
  values (
    v_request.workspace_id,
    v_request.program_id,
    v_request.supported_person_id,
    p_period_start,
    p_period_end,
    'draft',
    p_expected_income,
    nullif(trim(p_notes), ''),
    v_actor_id
  )
  returning id into v_budget_period_id;

  for v_line in
    select *
    from jsonb_to_recordset(p_lines) as x(
      category_name text,
      category_type text,
      planned_amount numeric,
      sort_order integer
    )
  loop
    if v_line.category_name is null
       or length(trim(v_line.category_name)) = 0
    then
      raise exception 'Starter Budget category name is required';
    end if;

    if v_line.category_type not in ('protected', 'flexible', 'support', 'reserve') then
      raise exception 'Invalid starter Budget category type';
    end if;

    if v_line.planned_amount is null or v_line.planned_amount < 0 then
      raise exception 'Starter Budget amount cannot be negative';
    end if;

    if exists (
      select 1
      from public.participant_budget_lines pbl
      where pbl.budget_period_id = v_budget_period_id
        and lower(trim(pbl.category_name)) = lower(trim(v_line.category_name))
    ) then
      raise exception 'Starter Budget contains a duplicate category';
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
      v_budget_period_id,
      trim(v_line.category_name),
      v_line.category_type,
      v_line.planned_amount,
      0,
      coalesce(v_line.sort_order, v_sort_order),
      true
    );

    v_sort_order := v_sort_order + 1;
  end loop;

  insert into public.support_request_links (
    workspace_id,
    program_id,
    supported_person_id,
    support_request_id,
    budget_period_id,
    created_by
  )
  values (
    v_request.workspace_id,
    v_request.program_id,
    v_request.supported_person_id,
    v_request.id,
    v_budget_period_id,
    v_actor_id
  );

  insert into public.support_request_entries (
    workspace_id,
    program_id,
    supported_person_id,
    support_request_id,
    entry_type,
    title,
    content,
    created_by
  )
  values (
    v_request.workspace_id,
    v_request.program_id,
    v_request.supported_person_id,
    v_request.id,
    'participant_response',
    'Starter Money plan ready',
    'A starter Money plan is ready for you to review. Nothing becomes active until you choose to use it.',
    v_actor_id
  );

  if v_request.status = 'submitted' then
    update public.support_requests
    set status = 'in_progress'
    where id = v_request.id
      and status = 'submitted';
  elsif v_request.status = 'acknowledged' then
    update public.support_requests
    set status = 'in_progress'
    where id = v_request.id
      and status = 'acknowledged';
  end if;

  update public.support_requests
  set status = 'waiting_for_participant'
  where id = v_request.id
    and status = 'in_progress';

  return v_budget_period_id;
end;
$function$;

revoke all on function public.prepare_assisted_budget_v1(
  uuid, date, date, numeric, text, jsonb
) from public;

revoke all on function public.prepare_assisted_budget_v1(
  uuid, date, date, numeric, text, jsonb
) from anon;

grant execute on function public.prepare_assisted_budget_v1(
  uuid, date, date, numeric, text, jsonb
) to authenticated;
