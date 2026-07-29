begin;

alter policy participant_wellness_checkins_update_self_same_day
on public.participant_wellness_checkins
using (
  is_supported_person_self(supported_person_id)
  and status = 'active'
  and checkin_date = (now() at time zone 'America/New_York')::date
)
with check (
  is_supported_person_self(supported_person_id)
  and status = 'active'
  and archived_at is null
  and checkin_date = (now() at time zone 'America/New_York')::date
  and is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
);

create or replace function public.protect_participant_wellness_checkin_scope()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
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

    if old.checkin_date <> (now() at time zone 'America/New_York')::date then
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
$function$;

alter table public.participant_wellness_checkins
  alter column checkin_date
  set default ((now() at time zone 'America/New_York')::date);

rollback;
