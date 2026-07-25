-- THRIVE Supported Person Identity Schema Dry Run
-- Dry-run candidate version: v0.1
-- Status: REVIEW ONLY - DO NOT EXECUTE WITHOUT SEPARATE APPROVAL
-- DO NOT EXECUTE WITHOUT SEPARATE APPROVAL
--
-- Purpose:
-- Establish a neutral supported-person identity and program participation
-- relationship without conflating the person with an authenticated user,
-- workspace, program, trust, organization, or record author.
--
-- This candidate does not:
-- - create Johnny's record;
-- - create an auth user;
-- - create a workspace membership;
-- - migrate existing financial records;
-- - create personal financial explanations;
-- - synchronize with the Trust Engine;
-- - grant trustee or fiduciary authority;
-- - permit hard deletion.

begin;

-- ============================================================
-- 1. supported_people
-- ============================================================

create table if not exists public.supported_people (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id) on delete restrict,

  auth_user_id uuid
    references auth.users(id) on delete restrict,

  display_name text not null,
  preferred_name text,
  status text not null default 'active',
  external_reference text,

  created_by uuid not null
    references auth.users(id) on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint supported_people_display_name_not_blank
    check (length(trim(display_name)) > 0),

  constraint supported_people_preferred_name_not_blank
    check (
      preferred_name is null
      or length(trim(preferred_name)) > 0
    ),

  constraint supported_people_external_reference_not_blank
    check (
      external_reference is null
      or length(trim(external_reference)) > 0
    ),

  constraint supported_people_status_check
    check (
      status in (
        'active',
        'paused',
        'archived'
      )
    ),

  constraint supported_people_auth_user_unique
    unique (auth_user_id),

  constraint supported_people_scoped_identity_unique
    unique (
      id,
      workspace_id
    )
);

create index if not exists supported_people_workspace_id_idx
  on public.supported_people (workspace_id);

create index if not exists supported_people_auth_user_id_idx
  on public.supported_people (auth_user_id)
  where auth_user_id is not null;

create index if not exists supported_people_workspace_status_idx
  on public.supported_people (
    workspace_id,
    status
  );

create index if not exists supported_people_created_by_idx
  on public.supported_people (created_by);

-- ============================================================
-- 2. Program scope prerequisite
-- ============================================================
--
-- public.programs currently has id as its primary key but does not
-- have the composite unique key required for a scope-preserving
-- program/workspace foreign key.
--
-- This supporting constraint does not change program ownership,
-- authorization, lifecycle, or access.

alter table public.programs
  add constraint programs_scoped_identity_unique
  unique (
    id,
    workspace_id
  );

-- ============================================================
-- 3. program_participants
-- ============================================================

create table if not exists public.program_participants (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id) on delete restrict,

  program_id uuid not null,

  supported_person_id uuid not null,

  participant_role text not null default 'supported_person',
  status text not null default 'active',

  created_by uuid not null
    references auth.users(id) on delete restrict,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint program_participants_program_scope_fk
    foreign key (
      program_id,
      workspace_id
    )
    references public.programs (
      id,
      workspace_id
    )
    on delete restrict,

  constraint program_participants_person_scope_fk
    foreign key (
      supported_person_id,
      workspace_id
    )
    references public.supported_people (
      id,
      workspace_id
    )
    on delete restrict,

  constraint program_participants_role_check
    check (
      participant_role = 'supported_person'
    ),

  constraint program_participants_status_check
    check (
      status in (
        'active',
        'inactive',
        'completed'
      )
    ),

  constraint program_participants_person_program_unique
    unique (
      workspace_id,
      program_id,
      supported_person_id
    ),

  constraint program_participants_scoped_identity_unique
    unique (
      id,
      workspace_id,
      program_id,
      supported_person_id
    )
);

create index if not exists program_participants_workspace_id_idx
  on public.program_participants (workspace_id);

create index if not exists program_participants_program_id_idx
  on public.program_participants (program_id);

create index if not exists program_participants_supported_person_id_idx
  on public.program_participants (supported_person_id);

create index if not exists program_participants_scope_status_idx
  on public.program_participants (
    workspace_id,
    program_id,
    status
  );

create index if not exists program_participants_created_by_idx
  on public.program_participants (created_by);

-- ============================================================
-- 4. updated_at trigger functions
-- ============================================================

create or replace function public.set_supported_person_identity_updated_at()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

drop trigger if exists set_supported_people_updated_at
  on public.supported_people;

create trigger set_supported_people_updated_at
before update on public.supported_people
for each row
execute function public.set_supported_person_identity_updated_at();

drop trigger if exists set_program_participants_updated_at
  on public.program_participants;

create trigger set_program_participants_updated_at
before update on public.program_participants
for each row
execute function public.set_supported_person_identity_updated_at();

-- ============================================================
-- 5. identity and scope protection triggers
-- ============================================================

create or replace function public.protect_supported_person_identity_scope()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  if new.workspace_id is distinct from old.workspace_id
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
  then
    raise exception
      'Supported-person workspace scope and creation lineage are immutable';
  end if;

  return new;
end;
$function$;

drop trigger if exists protect_supported_person_identity_scope
  on public.supported_people;

create trigger protect_supported_person_identity_scope
before update on public.supported_people
for each row
execute function public.protect_supported_person_identity_scope();

create or replace function public.protect_program_participant_scope()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  if new.workspace_id is distinct from old.workspace_id
    or new.program_id is distinct from old.program_id
    or new.supported_person_id is distinct from old.supported_person_id
    or new.participant_role is distinct from old.participant_role
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
  then
    raise exception
      'Program-participant identity and scope are immutable';
  end if;

  return new;
end;
$function$;

drop trigger if exists protect_program_participant_scope
  on public.program_participants;

create trigger protect_program_participant_scope
before update on public.program_participants
for each row
execute function public.protect_program_participant_scope();

-- ============================================================
-- 6. helper functions
-- ============================================================

create or replace function public.is_supported_person_self(
  p_supported_person_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $function$
  select exists (
    select 1
    from public.supported_people sp
    where sp.id = p_supported_person_id
      and sp.auth_user_id = auth.uid()
      and sp.status = 'active'
  );
$function$;

create or replace function public.is_supported_person_in_workspace(
  p_supported_person_id uuid,
  p_workspace_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $function$
  select exists (
    select 1
    from public.supported_people sp
    where sp.id = p_supported_person_id
      and sp.workspace_id = p_workspace_id
      and sp.status <> 'archived'
  );
$function$;

create or replace function public.is_program_participant_active(
  p_supported_person_id uuid,
  p_program_id uuid,
  p_workspace_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $function$
  select exists (
    select 1
    from public.program_participants pp
    where pp.supported_person_id = p_supported_person_id
      and pp.program_id = p_program_id
      and pp.workspace_id = p_workspace_id
      and pp.status = 'active'
  );
$function$;

revoke all on function public.is_supported_person_self(uuid)
  from public;

revoke all on function public.is_supported_person_in_workspace(uuid, uuid)
  from public;

revoke all on function public.is_program_participant_active(uuid, uuid, uuid)
  from public;

grant execute on function public.is_supported_person_self(uuid)
  to authenticated;

grant execute on function public.is_supported_person_in_workspace(uuid, uuid)
  to authenticated;

grant execute on function public.is_program_participant_active(uuid, uuid, uuid)
  to authenticated;

-- ============================================================
-- 7. Row Level Security
-- ============================================================

alter table public.supported_people
  enable row level security;

alter table public.program_participants
  enable row level security;

-- Linked active supported people may read only their own identity.
create policy "supported_people_select_self"
on public.supported_people
for select
to authenticated
using (
  public.is_supported_person_self(id)
);

-- Workspace administrators may read supported-person identities
-- within workspaces they actively administer.
create policy "supported_people_select_workspace_admins"
on public.supported_people
for select
to authenticated
using (
  public.is_workspace_admin(workspace_id)
);

-- Only workspace admins may create supported-person identities.
create policy "supported_people_insert_workspace_admins"
on public.supported_people
for insert
to authenticated
with check (
  public.is_workspace_admin(workspace_id)
  and created_by = auth.uid()
);

-- Only workspace admins may update supported-person identity metadata.
create policy "supported_people_update_workspace_admins"
on public.supported_people
for update
to authenticated
using (
  public.is_workspace_admin(workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
);

-- Supported people may read their own program participation.
create policy "program_participants_select_self"
on public.program_participants
for select
to authenticated
using (
  public.is_supported_person_self(supported_person_id)
);

-- Workspace administrators may read program participation
-- within workspaces they actively administer.
create policy "program_participants_select_workspace_admins"
on public.program_participants
for select
to authenticated
using (
  public.is_workspace_admin(workspace_id)
);

-- Only workspace admins may create program participation.
create policy "program_participants_insert_workspace_admins"
on public.program_participants
for insert
to authenticated
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(
    program_id,
    workspace_id
  )
  and public.is_supported_person_in_workspace(
    supported_person_id,
    workspace_id
  )
  and created_by = auth.uid()
);

-- Only workspace admins may update participation status.
create policy "program_participants_update_workspace_admins"
on public.program_participants
for update
to authenticated
using (
  public.is_workspace_admin(workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and public.is_program_in_workspace(
    program_id,
    workspace_id
  )
  and public.is_supported_person_in_workspace(
    supported_person_id,
    workspace_id
  )
);

-- No DELETE policies.
-- Identity records should be archived.
-- Participation records should be made inactive or completed.


-- ============================================================
-- 8. Dry-run structural inspection
-- ============================================================
--
-- These queries inspect objects created inside this transaction.
-- The final ROLLBACK must remove every proposed object.

select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_catalog.pg_class c
join pg_catalog.pg_namespace n
  on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in (
    'programs',
    'supported_people',
    'program_participants'
  )
order by c.relname;

select
  conrelid::regclass as table_name,
  conname as constraint_name,
  case contype
    when 'p' then 'PRIMARY KEY'
    when 'u' then 'UNIQUE'
    when 'f' then 'FOREIGN KEY'
    when 'c' then 'CHECK'
    else contype::text
  end as constraint_type,
  pg_get_constraintdef(oid, true) as definition
from pg_catalog.pg_constraint
where connamespace = 'public'::regnamespace
  and conrelid in (
    'public.programs'::regclass,
    'public.supported_people'::regclass,
    'public.program_participants'::regclass
  )
order by conrelid::regclass::text, constraint_type, constraint_name;

select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_catalog.pg_indexes
where schemaname = 'public'
  and tablename in (
    'programs',
    'supported_people',
    'program_participants'
  )
order by tablename, indexname;

select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_catalog.pg_policies
where schemaname = 'public'
  and tablename in (
    'supported_people',
    'program_participants'
  )
order by tablename, policyname;

select
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer,
  p.provolatile as volatility_code,
  p.proconfig as function_configuration
from pg_catalog.pg_proc p
join pg_catalog.pg_namespace n
  on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'is_supported_person_self',
    'is_supported_person_in_workspace',
    'is_program_participant_active',
    'set_supported_person_identity_updated_at',
    'protect_supported_person_identity_scope',
    'protect_program_participant_scope'
  )
order by p.proname;

select
  event_object_schema,
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation,
  action_statement
from information_schema.triggers
where event_object_schema = 'public'
  and event_object_table in (
    'supported_people',
    'program_participants'
  )
order by event_object_table, trigger_name, event_manipulation;

-- ============================================================
-- 9. Dry-run boundary
-- ============================================================
--
-- No supported-person, participation, authentication, financial,
-- explanation, Trust Engine, or test-data records are inserted.
--
-- The transaction must end with ROLLBACK.
rollback;

-- REVIEW ONLY:
-- This candidate intentionally ends with ROLLBACK.
-- It must not be used as an installation script.
