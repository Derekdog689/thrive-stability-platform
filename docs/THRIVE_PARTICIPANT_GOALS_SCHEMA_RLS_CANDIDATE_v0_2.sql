begin;

do $preflight$
begin
  if to_regclass('public.participant_goals') is not null then
    raise exception
      'Preflight failed: public.participant_goals already exists. Stop and reconcile the live object before installation.';
  end if;
end;
$preflight$;

create table public.participant_goals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  program_id uuid not null,
  supported_person_id uuid not null,
  title text not null,
  why_it_matters text null,
  next_step text not null,
  goal_area text null,
  progress_status text not null default 'not_started',
  ownership_source text not null default 'participant',
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,

  constraint participant_goals_workspace_fk
    foreign key (workspace_id)
    references public.workspaces(id)
    on delete restrict,

  constraint participant_goals_program_workspace_fk
    foreign key (program_id, workspace_id)
    references public.programs(id, workspace_id)
    on delete restrict,

  constraint participant_goals_supported_person_workspace_fk
    foreign key (supported_person_id, workspace_id)
    references public.supported_people(id, workspace_id)
    on delete restrict,

  constraint participant_goals_created_by_fk
    foreign key (created_by)
    references auth.users(id)
    on delete restrict,

  constraint participant_goals_title_not_blank
    check (length(btrim(title)) between 1 and 240),

  constraint participant_goals_why_length
    check (
      why_it_matters is null
      or length(btrim(why_it_matters)) between 1 and 2000
    ),

  constraint participant_goals_next_step_not_blank
    check (length(btrim(next_step)) between 1 and 500),

  constraint participant_goals_area_length
    check (
      goal_area is null
      or length(btrim(goal_area)) between 1 and 120
    ),

  constraint participant_goals_progress_status_check
    check (
      progress_status in (
        'not_started',
        'in_progress',
        'paused',
        'completed',
        'archived'
      )
    ),

  constraint participant_goals_ownership_source_check
    check (
      ownership_source in (
        'participant',
        'staff_suggestion'
      )
    ),

  constraint participant_goals_archive_state_check
    check (
      (
        progress_status = 'archived'
        and archived_at is not null
      )
      or (
        progress_status <> 'archived'
        and archived_at is null
      )
    )
);

create index if not exists participant_goals_person_program_idx
  on public.participant_goals (
    workspace_id,
    program_id,
    supported_person_id,
    created_at desc
  );

create index if not exists participant_goals_person_active_idx
  on public.participant_goals (
    supported_person_id,
    updated_at desc
  )
  where progress_status <> 'archived';

create or replace function public.protect_participant_goal_scope()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  if tg_op = 'INSERT' then
    if new.created_by is distinct from auth.uid() then
      raise exception 'Goal creator must match authenticated user';
    end if;

    if new.ownership_source <> 'participant' then
      raise exception 'Participant-created Goals must use participant ownership';
    end if;

    if not public.is_supported_person_self(new.supported_person_id) then
      raise exception 'Goal must belong to the authenticated participant';
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

    if new.progress_status = 'archived' or new.archived_at is not null then
      raise exception 'A new participant Goal cannot begin archived';
    end if;

    new.created_at := now();
    new.updated_at := now();
    return new;
  end if;

  if new.workspace_id is distinct from old.workspace_id
    or new.program_id is distinct from old.program_id
    or new.supported_person_id is distinct from old.supported_person_id
    or new.ownership_source is distinct from old.ownership_source
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Goal identity, ownership, and scope are immutable';
  end if;

  if public.is_supported_person_self(old.supported_person_id) then
    if old.ownership_source <> 'participant' then
      raise exception 'A staff suggestion is not a participant commitment';
    end if;

    if old.progress_status = 'archived' then
      raise exception 'Participants cannot reactivate archived Goals';
    end if;

    if new.progress_status = 'archived' then
      new.archived_at := coalesce(new.archived_at, now());
    elsif new.archived_at is not null then
      raise exception 'Participant archived_at requires archived status';
    end if;

  elsif public.is_workspace_admin(old.workspace_id) then
    if new.progress_status = 'archived'
      and old.progress_status <> 'archived'
    then
      new.archived_at := coalesce(new.archived_at, now());
    elsif new.progress_status <> 'archived'
      and old.progress_status = 'archived'
    then
      new.archived_at := null;
    elsif new.progress_status <> 'archived'
      and new.archived_at is not null
    then
      raise exception 'Active Goal cannot retain archived_at';
    end if;

  else
    raise exception 'Goal update not authorized';
  end if;

  new.updated_at := now();
  return new;
end;
$function$;

drop trigger if exists participant_goals_scope_guard
  on public.participant_goals;

create trigger participant_goals_scope_guard
before insert or update
on public.participant_goals
for each row
execute function public.protect_participant_goal_scope();

alter table public.participant_goals enable row level security;

drop policy if exists participant_goals_select_self
  on public.participant_goals;

create policy participant_goals_select_self
on public.participant_goals
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

drop policy if exists participant_goals_insert_self
  on public.participant_goals;

create policy participant_goals_insert_self
on public.participant_goals
for insert
to authenticated
with check (
  created_by = auth.uid()
  and ownership_source = 'participant'
  and progress_status <> 'archived'
  and archived_at is null
  and public.is_supported_person_self(supported_person_id)
  and public.is_program_in_workspace(program_id, workspace_id)
  and public.is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
);

drop policy if exists participant_goals_update_self
  on public.participant_goals;

create policy participant_goals_update_self
on public.participant_goals
for update
to authenticated
using (
  ownership_source = 'participant'
  and public.is_supported_person_self(supported_person_id)
  and public.is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
)
with check (
  ownership_source = 'participant'
  and public.is_supported_person_self(supported_person_id)
  and public.is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
);

drop policy if exists participant_goals_select_workspace_admins
  on public.participant_goals;

create policy participant_goals_select_workspace_admins
on public.participant_goals
for select
to authenticated
using (
  public.is_workspace_admin(workspace_id)
);

drop policy if exists participant_goals_update_workspace_admins
  on public.participant_goals;

create policy participant_goals_update_workspace_admins
on public.participant_goals
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

rollback;
