-- THRIVE Support Request Schema and RLS Install Candidate v0.1
-- INSTALL CANDIDATE. DO NOT EXECUTE WITHOUT EXPLICIT INSTALL APPROVAL.
--
-- Frozen:
-- - no production use
-- - no Johnny activation
-- - no Trust Engine synchronization
-- - no emergency workflow
-- - no notifications
-- - no service-role client use
-- - no hard deletes

begin;

create or replace function public.is_support_reviewer(
  p_workspace_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wm.member_role in ('admin', 'support')
  );
$$;

revoke all on function public.is_support_reviewer(uuid) from public;
grant execute on function public.is_support_reviewer(uuid) to authenticated;

create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  program_id uuid not null,
  supported_person_id uuid not null,

  participant_category text not null,
  routing_category text null,

  participant_message text not null,
  requested_support text null,
  contact_preference text null,

  status text not null default 'submitted',
  assigned_member_id uuid null,

  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  withdrawn_at timestamptz null,
  completed_at timestamptz null,
  archived_at timestamptz null,

  constraint support_requests_workspace_fk
    foreign key (workspace_id)
    references public.workspaces(id)
    on delete restrict,

  constraint support_requests_program_scope_fk
    foreign key (program_id, workspace_id)
    references public.programs(id, workspace_id)
    on delete restrict,

  constraint support_requests_person_scope_fk
    foreign key (supported_person_id, workspace_id)
    references public.supported_people(id, workspace_id)
    on delete restrict,

  constraint support_requests_participation_scope_fk
    foreign key (workspace_id, program_id, supported_person_id)
    references public.program_participants(
      workspace_id, program_id, supported_person_id
    )
    on delete restrict,

  constraint support_requests_assigned_member_fk
    foreign key (assigned_member_id)
    references public.workspace_members(id)
    on delete restrict,

  constraint support_requests_created_by_fk
    foreign key (created_by)
    references auth.users(id)
    on delete restrict,

  constraint support_requests_participant_category_check
    check (
      participant_category in (
        'budget_money',
        'transaction_understanding',
        'wellness_support',
        'goal_support',
        'appointment_paperwork',
        'technology_app',
        'program_question',
        'other'
      )
    ),

  constraint support_requests_routing_category_check
    check (
      routing_category is null
      or routing_category in (
        'budget_money',
        'transaction_understanding',
        'wellness_support',
        'goal_support',
        'appointment_paperwork',
        'technology_app',
        'program_question',
        'other'
      )
    ),

  constraint support_requests_message_length
    check (length(btrim(participant_message)) between 1 and 4000),

  constraint support_requests_requested_support_length
    check (
      requested_support is null
      or length(btrim(requested_support)) between 1 and 2000
    ),

  constraint support_requests_contact_preference_check
    check (
      contact_preference is null
      or contact_preference in (
        'in_app',
        'phone',
        'text',
        'email',
        'no_preference'
      )
    ),

  constraint support_requests_status_check
    check (
      status in (
        'submitted',
        'withdrawn',
        'acknowledged',
        'in_progress',
        'waiting_for_participant',
        'completed',
        'archived'
      )
    ),

  constraint support_requests_lifecycle_timestamp_check
    check (
      (
        status = 'submitted'
        and withdrawn_at is null
        and completed_at is null
        and archived_at is null
      )
      or (
        status in ('acknowledged', 'in_progress', 'waiting_for_participant')
        and withdrawn_at is null
        and completed_at is null
        and archived_at is null
      )
      or (
        status = 'withdrawn'
        and withdrawn_at is not null
        and completed_at is null
        and archived_at is null
      )
      or (
        status = 'completed'
        and completed_at is not null
        and withdrawn_at is null
        and archived_at is null
      )
      or (
        status = 'archived'
        and archived_at is not null
        and not (
          withdrawn_at is not null
          and completed_at is not null
        )
      )
    ),

  constraint support_requests_scoped_identity_unique
    unique (id, workspace_id, program_id, supported_person_id)
);

create index support_requests_participant_active_idx
  on public.support_requests (
    supported_person_id,
    program_id,
    created_at desc
  )
  where status in (
    'submitted',
    'acknowledged',
    'in_progress',
    'waiting_for_participant'
  );

create index support_requests_workspace_queue_idx
  on public.support_requests (
    workspace_id,
    status,
    created_at
  );

create index support_requests_assigned_member_idx
  on public.support_requests (
    assigned_member_id,
    status,
    created_at
  )
  where assigned_member_id is not null;

create table public.support_request_entries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  program_id uuid not null,
  supported_person_id uuid not null,
  support_request_id uuid not null,

  entry_type text not null,
  title text null,
  content text not null,

  created_by uuid not null,
  created_at timestamptz not null default now(),
  archived_at timestamptz null,
  archive_reason text null,

  constraint support_request_entries_request_scope_fk
    foreign key (
      support_request_id,
      workspace_id,
      program_id,
      supported_person_id
    )
    references public.support_requests(
      id,
      workspace_id,
      program_id,
      supported_person_id
    )
    on delete restrict,

  constraint support_request_entries_created_by_fk
    foreign key (created_by)
    references auth.users(id)
    on delete restrict,

  constraint support_request_entries_type_check
    check (entry_type in ('participant_response', 'internal_note')),

  constraint support_request_entries_title_length
    check (
      title is null
      or length(btrim(title)) between 1 and 120
    ),

  constraint support_request_entries_content_length
    check (length(btrim(content)) between 1 and 4000),

  constraint support_request_entries_archive_consistency
    check (
      (archived_at is null and archive_reason is null)
      or (
        archived_at is not null
        and archive_reason is not null
        and length(btrim(archive_reason)) between 1 and 1000
      )
    )
);

create table public.support_request_status_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  program_id uuid not null,
  supported_person_id uuid not null,
  support_request_id uuid not null,

  event_type text not null,
  from_status text null,
  to_status text null,

  changed_by uuid not null,
  changed_at timestamptz not null default now(),
  change_note text null,

  constraint support_request_status_events_request_scope_fk
    foreign key (
      support_request_id,
      workspace_id,
      program_id,
      supported_person_id
    )
    references public.support_requests(
      id,
      workspace_id,
      program_id,
      supported_person_id
    )
    on delete restrict,

  constraint support_request_status_events_changed_by_fk
    foreign key (changed_by)
    references auth.users(id)
    on delete restrict,

  constraint support_request_status_events_type_check
    check (
      event_type in (
        'status_changed',
        'assignment_changed',
        'routing_changed',
        'entry_archived',
        'link_archived'
      )
    ),

  constraint support_request_status_events_status_values_check
    check (
      (
        from_status is null
        or from_status in (
          'submitted',
          'withdrawn',
          'acknowledged',
          'in_progress',
          'waiting_for_participant',
          'completed',
          'archived'
        )
      )
      and (
        to_status is null
        or to_status in (
          'submitted',
          'withdrawn',
          'acknowledged',
          'in_progress',
          'waiting_for_participant',
          'completed',
          'archived'
        )
      )
    ),

  constraint support_request_status_events_note_length
    check (
      change_note is null
      or length(btrim(change_note)) between 1 and 1000
    )
);

alter table public.budget_categories
  add constraint budget_categories_support_link_scope_unique
  unique (id, workspace_id, program_id);

alter table public.participant_budget_periods
  add constraint participant_budget_periods_support_link_scope_unique
  unique (id, workspace_id, program_id, supported_person_id);

alter table public.participant_goals
  add constraint participant_goals_support_link_scope_unique
  unique (id, workspace_id, program_id, supported_person_id);

alter table public.participant_wellness_checkins
  add constraint participant_wellness_support_link_scope_unique
  unique (id, workspace_id, program_id, supported_person_id);

create table public.support_request_links (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  program_id uuid not null,
  supported_person_id uuid not null,
  support_request_id uuid not null,

  staged_transaction_id uuid null,
  budget_category_id uuid null,
  budget_period_id uuid null,
  wellness_checkin_id uuid null,
  goal_id uuid null,
  prior_support_request_id uuid null,

  created_by uuid not null,
  created_at timestamptz not null default now(),
  archived_at timestamptz null,
  archive_reason text null,

  constraint support_request_links_request_scope_fk
    foreign key (
      support_request_id,
      workspace_id,
      program_id,
      supported_person_id
    )
    references public.support_requests(
      id,
      workspace_id,
      program_id,
      supported_person_id
    )
    on delete restrict,

  constraint support_request_links_transaction_scope_fk
    foreign key (
      staged_transaction_id,
      workspace_id,
      program_id
    )
    references public.staged_financial_transactions(
      id,
      workspace_id,
      program_id
    )
    on delete restrict,

  constraint support_request_links_budget_category_scope_fk
    foreign key (
      budget_category_id,
      workspace_id,
      program_id
    )
    references public.budget_categories(
      id,
      workspace_id,
      program_id
    )
    on delete restrict,

  constraint support_request_links_budget_period_scope_fk
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

  constraint support_request_links_goal_scope_fk
    foreign key (
      goal_id,
      workspace_id,
      program_id,
      supported_person_id
    )
    references public.participant_goals(
      id,
      workspace_id,
      program_id,
      supported_person_id
    )
    on delete restrict,

  constraint support_request_links_wellness_scope_fk
    foreign key (
      wellness_checkin_id,
      workspace_id,
      program_id,
      supported_person_id
    )
    references public.participant_wellness_checkins(
      id,
      workspace_id,
      program_id,
      supported_person_id
    )
    on delete restrict,

  constraint support_request_links_prior_request_scope_fk
    foreign key (
      prior_support_request_id,
      workspace_id,
      program_id,
      supported_person_id
    )
    references public.support_requests(
      id,
      workspace_id,
      program_id,
      supported_person_id
    )
    on delete restrict,

  constraint support_request_links_created_by_fk
    foreign key (created_by)
    references auth.users(id)
    on delete restrict,

  constraint support_request_links_exactly_one_target
    check (
      num_nonnulls(
        staged_transaction_id,
        budget_category_id,
        budget_period_id,
        wellness_checkin_id,
        goal_id,
        prior_support_request_id
      ) = 1
    ),

  constraint support_request_links_not_self_reference
    check (
      prior_support_request_id is null
      or prior_support_request_id <> support_request_id
    ),

  constraint support_request_links_archive_consistency
    check (
      (archived_at is null and archive_reason is null)
      or (
        archived_at is not null
        and archive_reason is not null
        and length(btrim(archive_reason)) between 1 and 1000
      )
    )
);

-- Complete candidate protection and lifecycle layer.

create or replace function public.set_support_request_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.validate_support_assignment()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.assigned_member_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.workspace_members wm
    where wm.id = new.assigned_member_id
      and wm.workspace_id = new.workspace_id
      and wm.status = 'active'
      and wm.member_role in ('admin', 'support')
  ) then
    raise exception
      'Assigned Support reviewer must be an active admin or support member in the same workspace';
  end if;

  return new;
end;
$$;

create or replace function public.protect_support_request_scope_and_lifecycle()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_is_self boolean;
  v_is_reviewer boolean;
begin
  if tg_op = 'INSERT' then
    if new.status <> 'submitted'
      or new.routing_category is not null
      or new.assigned_member_id is not null
      or new.withdrawn_at is not null
      or new.completed_at is not null
      or new.archived_at is not null
    then
      raise exception 'New participant Support requests must begin as unassigned submitted requests';
    end if;

    return new;
  end if;

  if new.workspace_id is distinct from old.workspace_id
    or new.program_id is distinct from old.program_id
    or new.supported_person_id is distinct from old.supported_person_id
    or new.participant_category is distinct from old.participant_category
    or new.participant_message is distinct from old.participant_message
    or new.requested_support is distinct from old.requested_support
    or new.contact_preference is distinct from old.contact_preference
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Support request participant-authored identity, scope, and content are immutable';
  end if;

  v_is_self := public.is_supported_person_self(old.supported_person_id);
  v_is_reviewer := public.is_support_reviewer(old.workspace_id);

  if v_is_self and not v_is_reviewer then
    if old.status <> 'submitted' or new.status <> 'withdrawn' then
      raise exception 'Participants may only withdraw their own submitted Support request';
    end if;

    if new.routing_category is distinct from old.routing_category
      or new.assigned_member_id is distinct from old.assigned_member_id
      or new.completed_at is distinct from old.completed_at
      or new.archived_at is distinct from old.archived_at
    then
      raise exception 'Participant withdrawal cannot change reviewer-controlled fields';
    end if;

    new.withdrawn_at := now();
    new.completed_at := null;
    new.archived_at := null;
    return new;
  end if;

  if not v_is_reviewer then
    raise exception 'Only the participant or an authorized Support reviewer may update this request';
  end if;

  if old.status = 'archived' then
    raise exception 'Archived Support requests are terminal';
  end if;

  if old.status in ('completed', 'withdrawn')
    and new.status <> 'archived'
  then
    raise exception
      'Completed and withdrawn Support requests may only move to archived';
  end if;

  if new.status is distinct from old.status then
    if not (
      (old.status = 'submitted' and new.status in ('acknowledged', 'in_progress'))
      or (old.status = 'acknowledged' and new.status in ('in_progress', 'waiting_for_participant', 'completed', 'archived'))
      or (old.status = 'in_progress' and new.status in ('waiting_for_participant', 'completed', 'archived'))
      or (old.status = 'waiting_for_participant' and new.status in ('in_progress', 'completed', 'archived'))
      or (old.status = 'withdrawn' and new.status = 'archived')
      or (old.status = 'completed' and new.status = 'archived')
    ) then
      raise exception 'Unsupported Support request status transition: % -> %', old.status, new.status;
    end if;
  end if;

  if new.status = 'withdrawn' then
    raise exception 'Only the participant may withdraw a submitted Support request';
  elsif new.status = 'completed' then
    new.completed_at := now();
    new.withdrawn_at := null;
    new.archived_at := null;
  elsif new.status = 'archived' then
    new.archived_at := now();
    if old.status = 'completed' then
      new.completed_at := old.completed_at;
      new.withdrawn_at := null;
    elsif old.status = 'withdrawn' then
      new.withdrawn_at := old.withdrawn_at;
      new.completed_at := null;
    else
      new.withdrawn_at := null;
      new.completed_at := null;
    end if;
  else
    new.withdrawn_at := null;
    new.completed_at := null;
    new.archived_at := null;
  end if;

  return new;
end;
$$;

create or replace function public.record_support_request_events()
returns trigger
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.support_request_status_events (
      workspace_id,
      program_id,
      supported_person_id,
      support_request_id,
      event_type,
      from_status,
      to_status,
      changed_by
    ) values (
      new.workspace_id,
      new.program_id,
      new.supported_person_id,
      new.id,
      'status_changed',
      null,
      new.status,
      auth.uid()
    );

    return new;
  end if;

  if new.status is distinct from old.status then
    insert into public.support_request_status_events (
      workspace_id,
      program_id,
      supported_person_id,
      support_request_id,
      event_type,
      from_status,
      to_status,
      changed_by
    ) values (
      new.workspace_id,
      new.program_id,
      new.supported_person_id,
      new.id,
      'status_changed',
      old.status,
      new.status,
      auth.uid()
    );
  end if;

  if new.assigned_member_id is distinct from old.assigned_member_id then
    insert into public.support_request_status_events (
      workspace_id,
      program_id,
      supported_person_id,
      support_request_id,
      event_type,
      changed_by
    ) values (
      new.workspace_id,
      new.program_id,
      new.supported_person_id,
      new.id,
      'assignment_changed',
      auth.uid()
    );
  end if;

  if new.routing_category is distinct from old.routing_category then
    insert into public.support_request_status_events (
      workspace_id,
      program_id,
      supported_person_id,
      support_request_id,
      event_type,
      changed_by
    ) values (
      new.workspace_id,
      new.program_id,
      new.supported_person_id,
      new.id,
      'routing_changed',
      auth.uid()
    );
  end if;

  return new;
end;
$$;

create or replace function public.protect_support_entry_immutability()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.workspace_id is distinct from old.workspace_id
    or new.program_id is distinct from old.program_id
    or new.supported_person_id is distinct from old.supported_person_id
    or new.support_request_id is distinct from old.support_request_id
    or new.entry_type is distinct from old.entry_type
    or new.title is distinct from old.title
    or new.content is distinct from old.content
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Support entry content, identity, scope, and creation lineage are immutable';
  end if;

  if old.archived_at is not null then
    raise exception 'Archived Support entries are terminal';
  end if;

  if new.archived_at is null or new.archive_reason is null then
    raise exception 'Archiving a Support entry requires archived_at and archive_reason';
  end if;

  if not public.is_support_reviewer(old.workspace_id) then
    raise exception 'Only an authorized Support reviewer may archive an entry';
  end if;

  return new;
end;
$$;

create or replace function public.validate_support_link_scope()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.staged_transaction_id is not null and not exists (
    select 1
    from public.financial_source_owners fso
    join public.staged_financial_transactions sft
      on sft.financial_source_id = fso.financial_source_id
     and sft.workspace_id = fso.workspace_id
     and sft.program_id = fso.program_id
    where fso.supported_person_id = new.supported_person_id
      and fso.workspace_id = new.workspace_id
      and fso.program_id = new.program_id
      and fso.status = 'active'
      and sft.id = new.staged_transaction_id
  ) then
    raise exception 'Linked transaction is not actively owned by this supported person in the same scope';
  end if;

  if new.budget_category_id is not null and not exists (
    select 1
    from public.budget_categories bc
    where bc.id = new.budget_category_id
      and bc.workspace_id = new.workspace_id
      and bc.program_id = new.program_id
  ) then
    raise exception 'Linked budget category is outside the Support request scope';
  end if;

  if new.budget_period_id is not null and not exists (
    select 1
    from public.participant_budget_periods pbp
    where pbp.id = new.budget_period_id
      and pbp.workspace_id = new.workspace_id
      and pbp.program_id = new.program_id
      and pbp.supported_person_id = new.supported_person_id
  ) then
    raise exception 'Linked budget period is outside the Support request scope';
  end if;

  if new.goal_id is not null and not exists (
    select 1
    from public.participant_goals pg
    where pg.id = new.goal_id
      and pg.workspace_id = new.workspace_id
      and pg.program_id = new.program_id
      and pg.supported_person_id = new.supported_person_id
  ) then
    raise exception 'Linked Goal is outside the Support request scope';
  end if;

  if new.wellness_checkin_id is not null and not exists (
    select 1
    from public.participant_wellness_checkins pwc
    where pwc.id = new.wellness_checkin_id
      and pwc.workspace_id = new.workspace_id
      and pwc.program_id = new.program_id
      and pwc.supported_person_id = new.supported_person_id
  ) then
    raise exception 'Linked Wellness check-in is outside the Support request scope';
  end if;

  if new.prior_support_request_id is not null and not exists (
    select 1
    from public.support_requests prior
    where prior.id = new.prior_support_request_id
      and prior.workspace_id = new.workspace_id
      and prior.program_id = new.program_id
      and prior.supported_person_id = new.supported_person_id
      and prior.completed_at is not null
  ) then
    raise exception 'A prior Support link must reference a completed request in the same scope';
  end if;

  return new;
end;
$$;

create or replace function public.protect_support_link_archive()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_parent_status text;
  v_is_owner boolean;
  v_is_reviewer boolean;
begin
  if new.workspace_id is distinct from old.workspace_id
    or new.program_id is distinct from old.program_id
    or new.supported_person_id is distinct from old.supported_person_id
    or new.support_request_id is distinct from old.support_request_id
    or new.staged_transaction_id is distinct from old.staged_transaction_id
    or new.budget_category_id is distinct from old.budget_category_id
    or new.budget_period_id is distinct from old.budget_period_id
    or new.wellness_checkin_id is distinct from old.wellness_checkin_id
    or new.goal_id is distinct from old.goal_id
    or new.prior_support_request_id is distinct from old.prior_support_request_id
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Support link identity, target, scope, and creation lineage are immutable';
  end if;

  if old.archived_at is not null then
    raise exception 'Archived Support links are terminal';
  end if;

  if new.archived_at is null or new.archive_reason is null then
    raise exception 'Archiving a Support link requires archived_at and archive_reason';
  end if;

  select sr.status,
         public.is_supported_person_self(sr.supported_person_id),
         public.is_support_reviewer(sr.workspace_id)
    into v_parent_status, v_is_owner, v_is_reviewer
  from public.support_requests sr
  where sr.id = old.support_request_id
    and sr.workspace_id = old.workspace_id
    and sr.program_id = old.program_id
    and sr.supported_person_id = old.supported_person_id;

  if not found then
    raise exception 'Parent Support request was not found';
  end if;

  if v_is_owner and not v_is_reviewer and v_parent_status <> 'submitted' then
    raise exception 'Participants may archive a Support link only while the request is submitted';
  end if;

  if not v_is_owner and not v_is_reviewer then
    raise exception 'Only the participant or an authorized Support reviewer may archive this link';
  end if;

  return new;
end;
$$;

create or replace function public.record_support_child_archive_event()
returns trigger
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if old.archived_at is null and new.archived_at is not null then
    insert into public.support_request_status_events (
      workspace_id,
      program_id,
      supported_person_id,
      support_request_id,
      event_type,
      changed_by,
      change_note
    ) values (
      new.workspace_id,
      new.program_id,
      new.supported_person_id,
      new.support_request_id,
      case when tg_table_name = 'support_request_entries'
        then 'entry_archived'
        else 'link_archived'
      end,
      auth.uid(),
      new.archive_reason
    );
  end if;

  return new;
end;
$$;

create or replace function public.prevent_support_status_event_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'Support status events are immutable';
end;
$$;

create or replace function public.prevent_support_hard_delete()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'Hard delete is not permitted for THRIVE Support records';
end;
$$;

revoke all on function public.set_support_request_updated_at() from public;
revoke all on function public.validate_support_assignment() from public;
revoke all on function public.protect_support_request_scope_and_lifecycle() from public;
revoke all on function public.record_support_request_events() from public;
revoke all on function public.protect_support_entry_immutability() from public;
revoke all on function public.validate_support_link_scope() from public;
revoke all on function public.protect_support_link_archive() from public;
revoke all on function public.record_support_child_archive_event() from public;
revoke all on function public.prevent_support_status_event_mutation() from public;
revoke all on function public.prevent_support_hard_delete() from public;

create trigger support_requests_scope_lifecycle_guard
before insert or update on public.support_requests
for each row
execute function public.protect_support_request_scope_and_lifecycle();

create trigger support_requests_assignment_guard
before insert or update of assigned_member_id, workspace_id
on public.support_requests
for each row
execute function public.validate_support_assignment();

create trigger support_requests_set_updated_at
before update on public.support_requests
for each row
execute function public.set_support_request_updated_at();

create trigger support_requests_record_events
after insert or update on public.support_requests
for each row
execute function public.record_support_request_events();

create trigger support_request_entries_immutable_archive_guard
before update on public.support_request_entries
for each row
execute function public.protect_support_entry_immutability();

create trigger support_request_entries_record_archive
after update on public.support_request_entries
for each row
execute function public.record_support_child_archive_event();

create trigger support_request_links_scope_guard
before insert or update of
  workspace_id,
  program_id,
  supported_person_id,
  support_request_id,
  staged_transaction_id,
  budget_category_id,
  budget_period_id,
  wellness_checkin_id,
  goal_id,
  prior_support_request_id
on public.support_request_links
for each row
execute function public.validate_support_link_scope();

create trigger support_request_links_archive_guard
before update on public.support_request_links
for each row
execute function public.protect_support_link_archive();

create trigger support_request_links_record_archive
after update on public.support_request_links
for each row
execute function public.record_support_child_archive_event();

create trigger support_request_status_events_immutable
before update or delete on public.support_request_status_events
for each row
execute function public.prevent_support_status_event_mutation();

create trigger support_requests_no_hard_delete
before delete on public.support_requests
for each row
execute function public.prevent_support_hard_delete();

create trigger support_request_entries_no_hard_delete
before delete on public.support_request_entries
for each row
execute function public.prevent_support_hard_delete();

create trigger support_request_links_no_hard_delete
before delete on public.support_request_links
for each row
execute function public.prevent_support_hard_delete();


alter table public.support_requests enable row level security;
alter table public.support_requests force row level security;

alter table public.support_request_entries enable row level security;
alter table public.support_request_entries force row level security;

alter table public.support_request_links enable row level security;
alter table public.support_request_links force row level security;

alter table public.support_request_status_events enable row level security;
alter table public.support_request_status_events force row level security;

create policy support_requests_select_self
on public.support_requests
for select
to authenticated
using (
  is_supported_person_self(supported_person_id)
);

create policy support_requests_select_reviewers
on public.support_requests
for select
to authenticated
using (is_support_reviewer(workspace_id));

create policy support_requests_insert_self
on public.support_requests
for insert
to authenticated
with check (
  created_by = auth.uid()
  and status = 'submitted'
  and routing_category is null
  and assigned_member_id is null
  and withdrawn_at is null
  and completed_at is null
  and archived_at is null
  and is_supported_person_self(supported_person_id)
  and is_program_in_workspace(program_id, workspace_id)
  and is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
);

create policy support_requests_withdraw_self
on public.support_requests
for update
to authenticated
using (
  status = 'submitted'
  and is_supported_person_self(supported_person_id)
)
with check (
  status = 'withdrawn'
  and withdrawn_at is not null
  and is_supported_person_self(supported_person_id)
);

create policy support_requests_update_reviewers
on public.support_requests
for update
to authenticated
using (is_support_reviewer(workspace_id))
with check (
  is_support_reviewer(workspace_id)
  and is_program_in_workspace(program_id, workspace_id)
  and is_supported_person_in_workspace(
    supported_person_id,
    workspace_id
  )
);

create policy support_request_entries_select_visible_self
on public.support_request_entries
for select
to authenticated
using (
  entry_type = 'participant_response'
  and archived_at is null
  and is_supported_person_self(supported_person_id)
);

create policy support_request_entries_select_reviewers
on public.support_request_entries
for select
to authenticated
using (is_support_reviewer(workspace_id));

create policy support_request_entries_insert_reviewers
on public.support_request_entries
for insert
to authenticated
with check (
  created_by = auth.uid()
  and is_support_reviewer(workspace_id)
);

create policy support_request_links_select_self
on public.support_request_links
for select
to authenticated
using (
  archived_at is null
  and is_supported_person_self(supported_person_id)
);

create policy support_request_links_select_reviewers
on public.support_request_links
for select
to authenticated
using (is_support_reviewer(workspace_id));

create policy support_request_links_insert_self
on public.support_request_links
for insert
to authenticated
with check (
  created_by = auth.uid()
  and archived_at is null
  and is_supported_person_self(supported_person_id)
  and is_program_participant_active(
    supported_person_id,
    program_id,
    workspace_id
  )
  and exists (
    select 1
    from public.support_requests sr
    where sr.id = support_request_id
      and sr.workspace_id = support_request_links.workspace_id
      and sr.program_id = support_request_links.program_id
      and sr.supported_person_id = support_request_links.supported_person_id
      and sr.status = 'submitted'
      and sr.created_by = auth.uid()
  )
);

create policy support_request_links_update_self_before_ack
on public.support_request_links
for update
to authenticated
using (
  archived_at is null
  and is_supported_person_self(supported_person_id)
  and exists (
    select 1
    from public.support_requests sr
    where sr.id = support_request_id
      and sr.workspace_id = support_request_links.workspace_id
      and sr.program_id = support_request_links.program_id
      and sr.supported_person_id = support_request_links.supported_person_id
      and sr.status = 'submitted'
      and sr.created_by = auth.uid()
  )
)
with check (
  archived_at is not null
  and archive_reason is not null
  and is_supported_person_self(supported_person_id)
);

create policy support_request_entries_archive_reviewers
on public.support_request_entries
for update
to authenticated
using (
  archived_at is null
  and is_support_reviewer(workspace_id)
)
with check (
  archived_at is not null
  and archive_reason is not null
  and is_support_reviewer(workspace_id)
);

create policy support_request_links_archive_reviewers
on public.support_request_links
for update
to authenticated
using (
  archived_at is null
  and is_support_reviewer(workspace_id)
)
with check (
  archived_at is not null
  and archive_reason is not null
  and is_support_reviewer(workspace_id)
);

create policy support_request_status_events_select_visible_self
on public.support_request_status_events
for select
to authenticated
using (
  event_type = 'status_changed'
  and is_supported_person_self(supported_person_id)
);

create policy support_request_status_events_select_reviewers
on public.support_request_status_events
for select
to authenticated
using (is_support_reviewer(workspace_id));

-- No DELETE policies.
-- No direct client INSERT policy for status events.
-- No participant INSERT policy for entries.
-- No participant UPDATE policy for submitted request content.

revoke all on public.support_requests from anon;
revoke all on public.support_request_entries from anon;
revoke all on public.support_request_links from anon;
revoke all on public.support_request_status_events from anon;

grant select, insert, update on public.support_requests to authenticated;
grant select, insert, update on public.support_request_entries to authenticated;
grant select, insert, update on public.support_request_links to authenticated;
grant select on public.support_request_status_events to authenticated;

commit;
