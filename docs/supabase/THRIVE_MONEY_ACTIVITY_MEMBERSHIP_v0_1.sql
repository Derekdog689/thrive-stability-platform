-- THRIVE Money Truth Coherence v0.1
-- Installed and verified in THRIVE production Supabase on 2026-09-29.
--
-- Adds explicit plan membership for inflow Financial Activity.
-- Outflow plan membership remains represented by participant_financial_activity_allocations.
-- No historical Financial Activity or prior Budget allocation is moved, rewritten, or deleted.

create table if not exists public.participant_financial_activity_period_links (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  program_id uuid not null references public.programs(id) on delete restrict,
  supported_person_id uuid not null,
  activity_record_type text not null
    check (activity_record_type in ('imported','manual')),
  staged_transaction_id uuid null,
  manual_financial_activity_id uuid null,
  budget_period_id uuid not null,
  status text not null default 'active'
    check (status in ('active','archived')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint participant_financial_activity_period_links_source_xor_check
    check (
      (activity_record_type='imported' and staged_transaction_id is not null and manual_financial_activity_id is null)
      or
      (activity_record_type='manual' and manual_financial_activity_id is not null and staged_transaction_id is null)
    ),
  constraint participant_financial_activity_period_links_archive_consistency
    check (
      (status='active' and archived_at is null)
      or
      (status='archived' and archived_at is not null)
    ),
  constraint participant_financial_activity_period_links_person_scope_fk
    foreign key (supported_person_id, workspace_id)
    references public.supported_people(id, workspace_id)
    on delete restrict,
  constraint participant_financial_activity_period_links_budget_scope_fk
    foreign key (budget_period_id, workspace_id, program_id, supported_person_id)
    references public.participant_budget_periods(id, workspace_id, program_id, supported_person_id)
    on delete restrict,
  constraint participant_financial_activity_period_links_staged_scope_fk
    foreign key (staged_transaction_id, workspace_id, program_id)
    references public.staged_financial_transactions(id, workspace_id, program_id)
    on delete restrict,
  constraint participant_financial_activity_period_links_manual_fk
    foreign key (manual_financial_activity_id)
    references public.participant_manual_financial_activity(id)
    on delete restrict
);

create unique index if not exists participant_financial_activity_period_links_one_active_imported
  on public.participant_financial_activity_period_links(supported_person_id, staged_transaction_id)
  where status='active' and staged_transaction_id is not null;

create unique index if not exists participant_financial_activity_period_links_one_active_manual
  on public.participant_financial_activity_period_links(supported_person_id, manual_financial_activity_id)
  where status='active' and manual_financial_activity_id is not null;

create index if not exists participant_financial_activity_period_links_budget_idx
  on public.participant_financial_activity_period_links(budget_period_id, status);

create index if not exists participant_financial_activity_period_links_person_idx
  on public.participant_financial_activity_period_links(workspace_id, program_id, supported_person_id, status);

drop trigger if exists participant_financial_activity_period_links_set_updated_at
  on public.participant_financial_activity_period_links;

create trigger participant_financial_activity_period_links_set_updated_at
before update on public.participant_financial_activity_period_links
for each row
execute function public.set_updated_at();

alter table public.participant_financial_activity_period_links enable row level security;

revoke all on public.participant_financial_activity_period_links from anon;
revoke all on public.participant_financial_activity_period_links from authenticated;
grant select, insert on public.participant_financial_activity_period_links to authenticated;

drop policy if exists participant_financial_activity_period_links_select_self
  on public.participant_financial_activity_period_links;

create policy participant_financial_activity_period_links_select_self
on public.participant_financial_activity_period_links
for select
to authenticated
using (
  public.is_supported_person_self(supported_person_id)
);

drop policy if exists participant_financial_activity_period_links_select_workspace_admin
  on public.participant_financial_activity_period_links;

create policy participant_financial_activity_period_links_select_workspace_admin
on public.participant_financial_activity_period_links
for select
to authenticated
using (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(program_id, workspace_id)
);

drop policy if exists participant_financial_activity_period_links_insert_self
  on public.participant_financial_activity_period_links;

create policy participant_financial_activity_period_links_insert_self
on public.participant_financial_activity_period_links
for insert
to authenticated
with check (
  created_by = auth.uid()
  and status='active'
  and archived_at is null
  and public.is_supported_person_self(supported_person_id)
  and public.is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
  and exists (
    select 1
    from public.participant_budget_periods bp
    where bp.id=budget_period_id
      and bp.workspace_id=workspace_id
      and bp.program_id=program_id
      and bp.supported_person_id=supported_person_id
      and bp.status in ('draft','active')
      and bp.archived_at is null
  )
  and (
    (
      activity_record_type='imported'
      and exists (
        select 1
        from public.staged_financial_transactions sft
        where sft.id=staged_transaction_id
          and sft.workspace_id=workspace_id
          and sft.program_id=program_id
          and sft.parse_status='parsed'
          and sft.transaction_lifecycle='posted'
          and sft.amount > 0
          and public.is_owned_staged_transaction_for_self(
            supported_person_id,
            sft.id,
            workspace_id,
            program_id
          )
      )
    )
    or
    (
      activity_record_type='manual'
      and exists (
        select 1
        from public.participant_manual_financial_activity pmfa
        where pmfa.id=manual_financial_activity_id
          and pmfa.workspace_id=workspace_id
          and pmfa.program_id=program_id
          and pmfa.supported_person_id=supported_person_id
          and pmfa.status='active'
          and pmfa.activity_direction='inflow'
      )
    )
  )
);

create or replace function public.get_my_financial_activity_period_links_v1()
returns table(
  link_id uuid,
  workspace_id uuid,
  program_id uuid,
  supported_person_id uuid,
  activity_record_type text,
  activity_id uuid,
  budget_period_id uuid,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  archived_at timestamptz
)
language sql
stable
security invoker
set search_path to ''
as $function$
  select
    l.id,
    l.workspace_id,
    l.program_id,
    l.supported_person_id,
    l.activity_record_type,
    case
      when l.activity_record_type='imported' then l.staged_transaction_id
      else l.manual_financial_activity_id
    end,
    l.budget_period_id,
    l.status,
    l.created_at,
    l.updated_at,
    l.archived_at
  from public.participant_financial_activity_period_links l
  where l.status='active'
    and l.archived_at is null
    and public.is_supported_person_self(l.supported_person_id)
  order by l.created_at desc;
$function$;

revoke all on function public.get_my_financial_activity_period_links_v1() from public;
revoke all on function public.get_my_financial_activity_period_links_v1() from anon;
grant execute on function public.get_my_financial_activity_period_links_v1() to authenticated;

create or replace function public.link_my_financial_activity_to_budget_v1(
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

  if p_activity_id is null or p_budget_period_id is null then
    raise exception 'Financial Activity and Budget plan are required';
  end if;

  select sp.id, sp.workspace_id
    into v_supported_person_id, v_workspace_id
  from public.supported_people sp
  where sp.auth_user_id=v_actor_id
    and sp.status='active';

  if v_supported_person_id is null then
    raise exception 'No active supported-person record is connected to this user';
  end if;

  if p_activity_record_type='imported' then
    select
      sft.program_id,
      coalesce(sft.transaction_date,sft.posted_date),
      case when sft.amount > 0 then 'inflow' when sft.amount < 0 then 'outflow' else null end
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
    raise exception 'Only money-in Financial Activity uses direct Budget plan membership';
  end if;

  if not public.is_program_participant_active(
    v_supported_person_id,
    v_program_id,
    v_workspace_id
  ) then
    raise exception 'Active program participation is required';
  end if;

  select bp.*
    into v_period
  from public.participant_budget_periods bp
  where bp.id=p_budget_period_id;

  if v_period.id is null
     or v_period.workspace_id<>v_workspace_id
     or v_period.program_id<>v_program_id
     or v_period.supported_person_id<>v_supported_person_id
     or v_period.status not in ('draft','active')
     or v_period.archived_at is not null
  then
    raise exception 'Participant Budget access denied';
  end if;

  if v_activity_date is null
     or v_activity_date < v_period.period_start
     or v_activity_date > v_period.period_end
  then
    raise exception 'Financial Activity date is outside this Budget period';
  end if;

  if exists (
    select 1
    from public.participant_financial_activity_period_links l
    where l.supported_person_id=v_supported_person_id
      and l.status='active'
      and l.archived_at is null
      and (
        (p_activity_record_type='imported' and l.staged_transaction_id=p_activity_id)
        or
        (p_activity_record_type='manual' and l.manual_financial_activity_id=p_activity_id)
      )
  ) then
    raise exception 'This money-in activity already belongs to a Budget plan';
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

revoke all on function public.link_my_financial_activity_to_budget_v1(text,uuid,uuid) from public;
revoke all on function public.link_my_financial_activity_to_budget_v1(text,uuid,uuid) from anon;
grant execute on function public.link_my_financial_activity_to_budget_v1(text,uuid,uuid) to authenticated;


-- Keep money-out activity owned by one Budget period at a time.
-- Multiple category allocations inside the same Budget period remain allowed.
create or replace function public.enforce_financial_activity_single_budget_v1()
returns trigger
language plpgsql
security invoker
set search_path to ''
as $function$
begin
  if new.status <> 'active' then
    return new;
  end if;

  if new.staged_transaction_id is not null
     and exists (
       select 1
       from public.participant_financial_activity_allocations a
       where a.id <> new.id
         and a.supported_person_id = new.supported_person_id
         and a.staged_transaction_id = new.staged_transaction_id
         and a.status = 'active'
         and a.archived_at is null
         and a.budget_period_id <> new.budget_period_id
     )
  then
    raise exception 'This Financial Activity already belongs to another Budget plan';
  end if;

  if new.manual_financial_activity_id is not null
     and exists (
       select 1
       from public.participant_financial_activity_allocations a
       where a.id <> new.id
         and a.supported_person_id = new.supported_person_id
         and a.manual_financial_activity_id = new.manual_financial_activity_id
         and a.status = 'active'
         and a.archived_at is null
         and a.budget_period_id <> new.budget_period_id
     )
  then
    raise exception 'This Financial Activity already belongs to another Budget plan';
  end if;

  return new;
end;
$function$;

drop trigger if exists participant_financial_activity_allocations_single_budget_guard
  on public.participant_financial_activity_allocations;

create trigger participant_financial_activity_allocations_single_budget_guard
before insert or update of status, archived_at, budget_period_id, staged_transaction_id, manual_financial_activity_id
on public.participant_financial_activity_allocations
for each row
execute function public.enforce_financial_activity_single_budget_v1();


-- 2026-09-29 hardening reconciliation
-- Live inspection found the original INSERT policy used ambiguous unqualified
-- column references inside correlated subqueries. The policy below replaces it
-- with a participant-scoped validator that verifies the exact Budget and
-- exact inflow activity. No historical rows are backfilled or moved.

alter table public.participant_financial_activity_period_links
  add column if not exists archive_reason text null;

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
security invoker
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
      join public.get_my_financial_activity_v1() fa
        on fa.workspace_id = pbp.workspace_id
       and fa.program_id = pbp.program_id
       and fa.supported_person_id = pbp.supported_person_id
      where pbp.id = p_budget_period_id
        and pbp.workspace_id = p_workspace_id
        and pbp.program_id = p_program_id
        and pbp.supported_person_id = p_supported_person_id
        and pbp.status in ('draft','active')
        and pbp.archived_at is null
        and fa.activity_direction = 'inflow'
        and fa.activity_date between pbp.period_start and pbp.period_end
        and (
          (
            p_activity_record_type = 'manual'
            and p_staged_transaction_id is null
            and p_manual_financial_activity_id is not null
            and fa.activity_record_type = 'manual'
            and fa.activity_id = p_manual_financial_activity_id
          )
          or
          (
            p_activity_record_type = 'imported'
            and p_manual_financial_activity_id is null
            and p_staged_transaction_id is not null
            and fa.activity_record_type = 'imported'
            and fa.activity_id = p_staged_transaction_id
            and fa.lifecycle = 'posted'
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

drop policy if exists participant_financial_activity_period_links_insert_self
  on public.participant_financial_activity_period_links;

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

-- Atomic participant path for a manual Money-in entry that belongs to a Budget.
-- If the membership insert fails, the activity insert rolls back with it.
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

-- Keep an active linked manual inflow inside the owning Budget period.
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

drop trigger if exists participant_manual_financial_activity_link_guard
  on public.participant_manual_financial_activity;

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

drop trigger if exists participant_manual_financial_activity_link_archive
  on public.participant_manual_financial_activity;

create trigger participant_manual_financial_activity_link_archive
after update of status
on public.participant_manual_financial_activity
for each row
execute function public.archive_linked_manual_inflow_v1();
