-- THRIVE Money Activity Period Ownership Candidate v0.1
-- REVIEW ONLY. DO NOT EXECUTE.
--
-- Goal:
-- Date overlap makes Financial Activity eligible for a Budget period.
-- An explicit link makes it belong to that Budget period.
--
-- Existing outflow allocations already establish period ownership.
-- This table provides the missing period-only ownership relationship,
-- primarily for inflows that do not belong to an expense category.

create table public.participant_financial_activity_period_links (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  program_id uuid not null references public.programs(id) on delete restrict,
  supported_person_id uuid not null,
  activity_record_type text not null
    check (activity_record_type in ('imported','manual')),
  staged_transaction_id uuid null
    references public.staged_financial_transactions(id) on delete restrict,
  manual_financial_activity_id uuid null
    references public.participant_manual_financial_activity(id) on delete restrict,
  budget_period_id uuid not null,
  status text not null default 'active'
    check (status in ('active','archived')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  archive_reason text null,

  constraint participant_financial_activity_period_links_person_scope_fk
    foreign key (supported_person_id, workspace_id)
    references public.supported_people(id, workspace_id)
    on delete restrict,

  constraint participant_financial_activity_period_links_budget_scope_fk
    foreign key (
      budget_period_id,
      workspace_id,
      program_id,
      supported_person_id
    )
    references public.participant_budget_periods(
      id,
      workspace_id,
      program_id,
      supported_person_id
    )
    on delete restrict,

  constraint participant_financial_activity_period_links_record_check
    check (
      (
        activity_record_type='imported'
        and staged_transaction_id is not null
        and manual_financial_activity_id is null
      )
      or
      (
        activity_record_type='manual'
        and manual_financial_activity_id is not null
        and staged_transaction_id is null
      )
    ),

  constraint participant_financial_activity_period_links_archive_check
    check (
      (status='active' and archived_at is null)
      or
      (status='archived' and archived_at is not null)
    )
);

create unique index participant_financial_activity_period_links_imported_active_one_budget_idx
on public.participant_financial_activity_period_links(staged_transaction_id)
where status='active'
  and archived_at is null
  and staged_transaction_id is not null;

create unique index participant_financial_activity_period_links_manual_active_one_budget_idx
on public.participant_financial_activity_period_links(manual_financial_activity_id)
where status='active'
  and archived_at is null
  and manual_financial_activity_id is not null;

create index participant_financial_activity_period_links_budget_idx
on public.participant_financial_activity_period_links(
  budget_period_id,
  status,
  archived_at
);

alter table public.participant_financial_activity_period_links
enable row level security;

revoke all on table public.participant_financial_activity_period_links from anon;
grant select, insert on table public.participant_financial_activity_period_links to authenticated;

create policy participant_financial_activity_period_links_select_self
on public.participant_financial_activity_period_links
for select
to authenticated
using (
  archived_at is null
  and public.is_supported_person_self(supported_person_id)
);

create policy participant_financial_activity_period_links_insert_self
on public.participant_financial_activity_period_links
for insert
to authenticated
with check (
  created_by = auth.uid()
  and archived_at is null
  and status = 'active'
  and public.is_supported_person_self(supported_person_id)
  and public.is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
  and exists (
    select 1
    from public.participant_budget_periods pbp
    where pbp.id = budget_period_id
      and pbp.workspace_id = workspace_id
      and pbp.program_id = program_id
      and pbp.supported_person_id = supported_person_id
      and pbp.status in ('draft','active')
      and pbp.archived_at is null
  )
);

create or replace function public.link_my_inflow_to_budget_v1(
  p_activity_record_type text,
  p_activity_id uuid,
  p_budget_period_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path to ''
as $function$
declare
  v_actor_id uuid := auth.uid();
  v_supported_person_id uuid;
  v_workspace_id uuid;
  v_program_id uuid;
  v_activity_date date;
  v_activity_direction text;
  v_period public.participant_budget_periods;
  v_link_id uuid;
begin
  if v_actor_id is null then
    raise exception 'Authentication required';
  end if;

  if p_activity_record_type not in ('imported','manual') then
    raise exception 'Unsupported Financial Activity record type';
  end if;

  select sp.id, sp.workspace_id
    into v_supported_person_id, v_workspace_id
  from public.supported_people sp
  where sp.auth_user_id = v_actor_id
    and sp.status = 'active';

  if v_supported_person_id is null then
    raise exception 'No active supported-person record is connected to this user';
  end if;

  if p_activity_record_type='imported' then
    select sft.program_id,
           coalesce(sft.transaction_date,sft.posted_date),
           case when sft.amount > 0 then 'inflow'
                when sft.amount < 0 then 'outflow'
                else null end
      into v_program_id, v_activity_date, v_activity_direction
    from public.staged_financial_transactions sft
    where sft.id=p_activity_id
      and sft.workspace_id=v_workspace_id
      and sft.parse_status='parsed'
      and sft.transaction_lifecycle='posted';

    if v_program_id is null
       or not public.is_owned_staged_transaction_for_self(
         v_supported_person_id,
         p_activity_id,
         v_workspace_id,
         v_program_id
       )
    then
      raise exception 'Participant Financial Activity access denied';
    end if;
  else
    select pmfa.program_id, pmfa.activity_date, pmfa.activity_direction
      into v_program_id, v_activity_date, v_activity_direction
    from public.participant_manual_financial_activity pmfa
    where pmfa.id=p_activity_id
      and pmfa.workspace_id=v_workspace_id
      and pmfa.supported_person_id=v_supported_person_id
      and pmfa.status='active';

    if v_program_id is null then
      raise exception 'Participant Financial Activity access denied';
    end if;
  end if;

  if v_activity_direction <> 'inflow' then
    raise exception 'This period-only link is reserved for money-in activity';
  end if;

  select pbp.*
    into v_period
  from public.participant_budget_periods pbp
  where pbp.id=p_budget_period_id;

  if v_period.id is null
     or v_period.workspace_id<>v_workspace_id
     or v_period.program_id<>v_program_id
     or v_period.supported_person_id<>v_supported_person_id
     or v_period.status not in ('draft','active')
     or v_period.archived_at is not null
  then
    raise exception 'Participant Budget access denied';
  end if;

  if v_activity_date < v_period.period_start
     or v_activity_date > v_period.period_end
  then
    raise exception 'Financial Activity date is outside this Budget period';
  end if;

  insert into public.participant_financial_activity_period_links(
    workspace_id,
    program_id,
    supported_person_id,
    activity_record_type,
    staged_transaction_id,
    manual_financial_activity_id,
    budget_period_id,
    status,
    created_by
  )
  values(
    v_workspace_id,
    v_program_id,
    v_supported_person_id,
    p_activity_record_type,
    case when p_activity_record_type='imported' then p_activity_id else null end,
    case when p_activity_record_type='manual' then p_activity_id else null end,
    v_period.id,
    'active',
    v_actor_id
  )
  returning id into v_link_id;

  return v_link_id;
end;
$function$;

revoke all on function public.link_my_inflow_to_budget_v1(text,uuid,uuid) from public;
revoke all on function public.link_my_inflow_to_budget_v1(text,uuid,uuid) from anon;
grant execute on function public.link_my_inflow_to_budget_v1(text,uuid,uuid) to authenticated;
