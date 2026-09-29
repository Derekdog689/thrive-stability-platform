-- THRIVE Money Activity Period Ownership Candidate v0.1
-- HISTORICAL CANDIDATE. LIVE INSTALL WAS RECONCILED/HARDENED ON 2026-09-29.
-- Do not run this file wholesale against production; see the v0.2 implementation note.
--
-- Goal:
-- Date overlap makes Financial Activity eligible for a Budget period.
-- An explicit link makes it belong to that Budget period.
--
-- Existing outflow allocations already establish period ownership.
-- This table supplies period-only ownership for inflows, which do not
-- belong to an expense category.

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
    ),

  constraint participant_financial_activity_period_links_archive_reason_check
    check (
      archive_reason is null
      or length(trim(archive_reason)) > 0
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

revoke all on table public.participant_financial_activity_period_links from public;
revoke all on table public.participant_financial_activity_period_links from anon;
grant select, insert on table public.participant_financial_activity_period_links
  to authenticated;

create or replace function public.can_link_my_inflow_to_budget_v1(
  p_supported_person_id uuid,
  p_workspace_id uuid,
  p_program_id uuid,
  p_activity_record_type text,
  p_staged_transaction_id uuid,
  p_manual_financial_activity_id uuid,
  p_budget_period_id uuid
)
returns boolean
language sql
stable
security definer
set search_path to ''
as $function$
  select
    auth.uid() is not null
    and public.is_supported_person_self(p_supported_person_id)
    and public.is_program_participant_active(
      p_supported_person_id,
      p_program_id,
      p_workspace_id
    )
    and exists (
      select 1
      from public.participant_budget_periods pbp
      where pbp.id = p_budget_period_id
        and pbp.workspace_id = p_workspace_id
        and pbp.program_id = p_program_id
        and pbp.supported_person_id = p_supported_person_id
        and pbp.status in ('draft','active')
        and pbp.archived_at is null
        and (
          (
            p_activity_record_type = 'manual'
            and p_staged_transaction_id is null
            and p_manual_financial_activity_id is not null
            and exists (
              select 1
              from public.participant_manual_financial_activity pmfa
              where pmfa.id = p_manual_financial_activity_id
                and pmfa.workspace_id = p_workspace_id
                and pmfa.program_id = p_program_id
                and pmfa.supported_person_id = p_supported_person_id
                and pmfa.status = 'active'
                and pmfa.archived_at is null
                and pmfa.activity_direction = 'inflow'
                and pmfa.activity_date between pbp.period_start and pbp.period_end
            )
          )
          or
          (
            p_activity_record_type = 'imported'
            and p_manual_financial_activity_id is null
            and p_staged_transaction_id is not null
            and public.is_owned_staged_transaction_for_self(
              p_supported_person_id,
              p_staged_transaction_id,
              p_workspace_id,
              p_program_id
            )
            and exists (
              select 1
              from public.staged_financial_transactions sft
              where sft.id = p_staged_transaction_id
                and sft.workspace_id = p_workspace_id
                and sft.program_id = p_program_id
                and sft.parse_status = 'parsed'
                and sft.transaction_lifecycle = 'posted'
                and sft.amount > 0
                and coalesce(sft.transaction_date, sft.posted_date)
                    between pbp.period_start and pbp.period_end
            )
          )
        )
    );
$function$;

revoke all on function public.can_link_my_inflow_to_budget_v1(
  uuid,uuid,uuid,text,uuid,uuid,uuid
) from public;
revoke all on function public.can_link_my_inflow_to_budget_v1(
  uuid,uuid,uuid,text,uuid,uuid,uuid
) from anon;
grant execute on function public.can_link_my_inflow_to_budget_v1(
  uuid,uuid,uuid,text,uuid,uuid,uuid
) to authenticated;

create policy participant_financial_activity_period_links_select_self
on public.participant_financial_activity_period_links
for select
to authenticated
using (
  public.is_supported_person_self(supported_person_id)
);

create policy participant_financial_activity_period_links_insert_self
on public.participant_financial_activity_period_links
for insert
to authenticated
with check (
  created_by = auth.uid()
  and status = 'active'
  and archived_at is null
  and archive_reason is null
  and public.can_link_my_inflow_to_budget_v1(
    supported_person_id,
    workspace_id,
    program_id,
    activity_record_type,
    staged_transaction_id,
    manual_financial_activity_id,
    budget_period_id
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

  select pbp.program_id
    into v_program_id
  from public.participant_budget_periods pbp
  where pbp.id = p_budget_period_id
    and pbp.workspace_id = v_workspace_id
    and pbp.supported_person_id = v_supported_person_id
    and pbp.status in ('draft','active')
    and pbp.archived_at is null;

  if v_program_id is null then
    raise exception 'Participant Budget access denied';
  end if;

  if not public.can_link_my_inflow_to_budget_v1(
    v_supported_person_id,
    v_workspace_id,
    v_program_id,
    p_activity_record_type,
    case when p_activity_record_type='imported' then p_activity_id else null end,
    case when p_activity_record_type='manual' then p_activity_id else null end,
    p_budget_period_id
  ) then
    raise exception 'Money-in activity cannot be linked to this Budget';
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
    p_budget_period_id,
    'active',
    v_actor_id
  )
  returning id into v_link_id;

  return v_link_id;
end;
$function$;

revoke all on function public.link_my_inflow_to_budget_v1(text,uuid,uuid)
  from public;
revoke all on function public.link_my_inflow_to_budget_v1(text,uuid,uuid)
  from anon;
grant execute on function public.link_my_inflow_to_budget_v1(text,uuid,uuid)
  to authenticated;

create or replace function public.create_my_manual_inflow_for_budget_v1(
  p_program_id uuid,
  p_budget_period_id uuid,
  p_activity_date date,
  p_amount numeric,
  p_description text
)
returns uuid
language plpgsql
security invoker
set search_path to ''
as $function$
declare
  v_activity_id uuid;
begin
  v_activity_id := public.create_my_manual_financial_activity_v1(
    p_program_id,
    p_activity_date,
    'inflow',
    p_amount,
    p_description
  );

  perform public.link_my_inflow_to_budget_v1(
    'manual',
    v_activity_id,
    p_budget_period_id
  );

  return v_activity_id;
end;
$function$;

revoke all on function public.create_my_manual_inflow_for_budget_v1(
  uuid,uuid,date,numeric,text
) from public;
revoke all on function public.create_my_manual_inflow_for_budget_v1(
  uuid,uuid,date,numeric,text
) from anon;
grant execute on function public.create_my_manual_inflow_for_budget_v1(
  uuid,uuid,date,numeric,text
) to authenticated;

create or replace function public.protect_linked_manual_inflow_v1()
returns trigger
language plpgsql
security invoker
set search_path to ''
as $function$
declare
  v_period_start date;
  v_period_end date;
begin
  select pbp.period_start, pbp.period_end
    into v_period_start, v_period_end
  from public.participant_financial_activity_period_links pfl
  join public.participant_budget_periods pbp
    on pbp.id = pfl.budget_period_id
   and pbp.workspace_id = pfl.workspace_id
   and pbp.program_id = pfl.program_id
   and pbp.supported_person_id = pfl.supported_person_id
  where pfl.manual_financial_activity_id = old.id
    and pfl.status = 'active'
    and pfl.archived_at is null
  limit 1;

  if v_period_start is null then
    return new;
  end if;

  if new.activity_direction <> 'inflow' then
    raise exception 'Linked Money-in activity must remain money in';
  end if;

  if new.activity_date < v_period_start
     or new.activity_date > v_period_end
  then
    raise exception 'Linked Money-in activity date must stay inside its Budget period';
  end if;

  return new;
end;
$function$;

create trigger participant_manual_financial_activity_link_guard
before update of activity_date, activity_direction, status
on public.participant_manual_financial_activity
for each row
execute function public.protect_linked_manual_inflow_v1();

create or replace function public.archive_linked_manual_inflow_v1()
returns trigger
language plpgsql
security invoker
set search_path to ''
as $function$
begin
  if old.status = 'active' and new.status = 'archived' then
    update public.participant_financial_activity_period_links
    set
      status = 'archived',
      archived_at = coalesce(new.archived_at, now()),
      archive_reason = 'Source activity archived',
      updated_at = now()
    where manual_financial_activity_id = new.id
      and status = 'active'
      and archived_at is null;
  end if;

  return new;
end;
$function$;

create trigger participant_manual_financial_activity_link_archive
after update of status
on public.participant_manual_financial_activity
for each row
execute function public.archive_linked_manual_inflow_v1();
