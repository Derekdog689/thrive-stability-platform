-- THRIVE PARTICIPANT WELLNESS CHECK-IN ROLLBACK-ONLY DRY RUN v0.1
-- EXECUTABLE REVIEW CANDIDATE
--
-- Purpose:
-- - validate table shape
-- - validate composite scope foreign keys
-- - validate lifecycle and field constraints
-- - validate scope-protection trigger
-- - validate participant/admin RLS policy syntax
--
-- This script MUST end in ROLLBACK.
-- It does not leave permanent schema objects or data behind.

begin;

-- ============================================================
-- PRECHECKS
-- ============================================================

do $$
begin
  if to_regclass('public.workspaces') is null then
    raise exception 'Missing dependency: public.workspaces';
  end if;

  if to_regclass('public.programs') is null then
    raise exception 'Missing dependency: public.programs';
  end if;

  if to_regclass('public.supported_people') is null then
    raise exception 'Missing dependency: public.supported_people';
  end if;

  if to_regclass('public.program_participants') is null then
    raise exception 'Missing dependency: public.program_participants';
  end if;

  if to_regprocedure('public.is_workspace_admin(uuid)') is null then
    raise exception 'Missing helper: public.is_workspace_admin(uuid)';
  end if;

  if to_regprocedure('public.is_program_in_workspace(uuid,uuid)') is null then
    raise exception 'Missing helper: public.is_program_in_workspace(uuid,uuid)';
  end if;

  if to_regprocedure('public.is_program_participant_active(uuid,uuid,uuid)') is null then
    raise exception 'Missing helper: public.is_program_participant_active(uuid,uuid,uuid)';
  end if;

  if to_regprocedure('public.is_supported_person_self(uuid)') is null then
    raise exception 'Missing helper: public.is_supported_person_self(uuid)';
  end if;
end;
$$;

-- ============================================================
-- TABLE
-- ============================================================

create table public.participant_wellness_checkins (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null,
  program_id uuid not null,
  supported_person_id uuid not null,

  checkin_date date not null default current_date,

  overall_day text not null,

  stress text null,
  sleep text null,
  energy text null,
  confidence text null,
  routine text null,
  recovery_support text null,

  support_needed text null,

  chosen_next_step text null,
  participant_note text null,

  status text not null default 'active',

  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint participant_wellness_checkins_workspace_fk
    foreign key (workspace_id)
    references public.workspaces(id)
    on delete restrict,

  constraint participant_wellness_checkins_program_scope_fk
    foreign key (program_id, workspace_id)
    references public.programs(id, workspace_id)
    on delete restrict,

  constraint participant_wellness_checkins_person_scope_fk
    foreign key (supported_person_id, workspace_id)
    references public.supported_people(id, workspace_id)
    on delete restrict,

  constraint participant_wellness_checkins_participation_scope_fk
    foreign key (
      workspace_id,
      program_id,
      supported_person_id
    )
    references public.program_participants(
      workspace_id,
      program_id,
      supported_person_id
    )
    on delete restrict,

  constraint participant_wellness_checkins_created_by_fk
    foreign key (created_by)
    references auth.users(id)
    on delete restrict,

  constraint participant_wellness_checkins_overall_day_check
    check (overall_day in ('good', 'okay', 'hard', 'not_sure')),

  constraint participant_wellness_checkins_stress_check
    check (
      stress is null
      or stress in ('low', 'okay', 'high', 'not_sure')
    ),

  constraint participant_wellness_checkins_sleep_check
    check (
      sleep is null
      or sleep in ('good', 'okay', 'poor', 'not_sure')
    ),

  constraint participant_wellness_checkins_energy_check
    check (
      energy is null
      or energy in ('good', 'okay', 'low', 'not_sure')
    ),

  constraint participant_wellness_checkins_confidence_check
    check (
      confidence is null
      or confidence in ('good', 'okay', 'low', 'not_sure')
    ),

  constraint participant_wellness_checkins_routine_check
    check (
      routine is null
      or routine in ('on_track', 'mixed', 'off_track', 'not_sure')
    ),

  constraint participant_wellness_checkins_recovery_support_check
    check (
      recovery_support is null
      or recovery_support in (
        'connected',
        'could_use_support',
        'not_needed',
        'not_sure'
      )
    ),

  constraint participant_wellness_checkins_support_needed_check
    check (
      support_needed is null
      or support_needed in ('yes', 'no', 'not_sure')
    ),

  constraint participant_wellness_checkins_next_step_check
    check (
      chosen_next_step is null
      or chosen_next_step in (
        'take_a_break',
        'review_today_plan',
        'choose_one_task',
        'contact_supportive_person',
        'food_water_rest',
        'ask_for_help',
        'other'
      )
    ),

  constraint participant_wellness_checkins_status_check
    check (status in ('active', 'archived')),

  constraint participant_wellness_checkins_note_length_check
    check (
      participant_note is null
      or (
        length(trim(participant_note)) between 1 and 2000
      )
    ),

  constraint participant_wellness_checkins_archive_state_check
    check (
      (status = 'active' and archived_at is null)
      or
      (status = 'archived' and archived_at is not null)
    )
);

-- ============================================================
-- INDEXES
-- ============================================================

create index participant_wellness_checkins_person_date_idx
  on public.participant_wellness_checkins (
    workspace_id,
    program_id,
    supported_person_id,
    checkin_date desc
  );

create unique index participant_wellness_checkins_one_active_day_idx
  on public.participant_wellness_checkins (
    supported_person_id,
    checkin_date
  )
  where status = 'active';

-- ============================================================
-- SCOPE AND UPDATE PROTECTION
-- ============================================================

create function public.protect_participant_wellness_checkin_scope()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if tg_op = 'INSERT' then
    if new.created_by is distinct from auth.uid() then
      raise exception 'Wellness check-in creator must match authenticated user';
    end if;

    if not public.is_supported_person_self(new.supported_person_id) then
      raise exception 'Wellness check-in must belong to the authenticated participant';
    end if;

    if not public.is_program_in_workspace(new.program_id, new.workspace_id) then
      raise exception 'Program is not active in the selected workspace';
    end if;

    if not public.is_program_participant_active(
      new.supported_person_id,
      new.program_id,
      new.workspace_id
    ) then
      raise exception 'Active program participation is required';
    end if;

    new.created_at := now();
    new.updated_at := now();
    return new;
  end if;

  if new.workspace_id is distinct from old.workspace_id
    or new.program_id is distinct from old.program_id
    or new.supported_person_id is distinct from old.supported_person_id
    or new.checkin_date is distinct from old.checkin_date
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Wellness check-in identity and scope are immutable';
  end if;

  if public.is_supported_person_self(old.supported_person_id) then
    if old.status <> 'active' or new.status <> 'active' then
      raise exception 'Participants cannot archive or reactivate Wellness check-ins';
    end if;

    if old.checkin_date <> current_date then
      raise exception 'Participants may update only today''s active Wellness check-in';
    end if;
  elsif public.is_workspace_admin(old.workspace_id) then
    if new.status = 'archived' and old.status = 'active' then
      new.archived_at := coalesce(new.archived_at, now());
    elsif new.status = 'active' and old.status = 'archived' then
      new.archived_at := null;
    end if;
  else
    raise exception 'Wellness check-in update not authorized';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger participant_wellness_checkins_scope_guard
before insert or update
on public.participant_wellness_checkins
for each row
execute function public.protect_participant_wellness_checkin_scope();

-- ============================================================
-- RLS
-- ============================================================

alter table public.participant_wellness_checkins enable row level security;
alter table public.participant_wellness_checkins force row level security;

create policy participant_wellness_checkins_select_self
on public.participant_wellness_checkins
for select
to authenticated
using (
  public.is_supported_person_self(supported_person_id)
  and public.is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
);

create policy participant_wellness_checkins_select_workspace_admins
on public.participant_wellness_checkins
for select
to authenticated
using (
  public.is_workspace_admin(workspace_id)
);

create policy participant_wellness_checkins_insert_self
on public.participant_wellness_checkins
for insert
to authenticated
with check (
  created_by = auth.uid()
  and status = 'active'
  and archived_at is null
  and public.is_supported_person_self(supported_person_id)
  and public.is_program_in_workspace(program_id, workspace_id)
  and public.is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
);

create policy participant_wellness_checkins_update_self_same_day
on public.participant_wellness_checkins
for update
to authenticated
using (
  public.is_supported_person_self(supported_person_id)
  and status = 'active'
  and checkin_date = current_date
)
with check (
  public.is_supported_person_self(supported_person_id)
  and status = 'active'
  and archived_at is null
  and checkin_date = current_date
  and public.is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
);

create policy participant_wellness_checkins_update_workspace_admins
on public.participant_wellness_checkins
for update
to authenticated
using (
  public.is_workspace_admin(workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(program_id, workspace_id)
  and public.is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
);

-- No DELETE policy.

-- ============================================================
-- GRANTS
-- ============================================================

revoke all on public.participant_wellness_checkins from anon;
grant select, insert, update
  on public.participant_wellness_checkins
  to authenticated;

revoke all on function public.protect_participant_wellness_checkin_scope()
  from public, anon, authenticated;

-- ============================================================
-- STRUCTURAL VALIDATION
-- ============================================================

select
  table_schema,
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'participant_wellness_checkins';

select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'participant_wellness_checkins'
order by ordinal_position;

select
  conname as constraint_name,
  case contype
    when 'p' then 'primary key'
    when 'u' then 'unique'
    when 'f' then 'foreign key'
    when 'c' then 'check'
    else contype::text
  end as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
from pg_constraint
where conrelid = 'public.participant_wellness_checkins'::regclass
order by constraint_type, constraint_name;

select
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'participant_wellness_checkins'
order by indexname;

select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'participant_wellness_checkins';

select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'participant_wellness_checkins'
order by policyname;

select
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
from information_schema.triggers
where event_object_schema = 'public'
  and event_object_table = 'participant_wellness_checkins'
order by trigger_name, event_manipulation;

-- ============================================================
-- REQUIRED END STATE
-- ============================================================

rollback;
