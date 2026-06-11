-- THRIVE Program Schema SQL Draft
-- Purpose:
-- Draft SQL for the THRIVE program layer.
--
-- This file is for review only.
-- Do not run in Supabase until reviewed and approved.
--
-- Security boundary:
-- Mock/test only.
-- No real financial, trust, beneficiary, clinical, recovery, or personally identifying data.
-- Programs are organizational support lanes only.
-- Programs do not create legal, clinical, fiduciary, credit repair, bankruptcy,
-- investment, or crisis-service authority.

-- ============================================================
-- 1. programs table
-- ============================================================

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null references public.workspaces(id) on delete cascade,

  program_name text not null,
  program_type text not null,
  status text not null default 'active',
  description text,

  created_by uuid not null references auth.users(id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint programs_program_name_not_blank
    check (length(trim(program_name)) > 0),

  constraint programs_program_type_check
    check (program_type in ('demo', 'stability_support', 'trust_stewardship')),

  constraint programs_status_check
    check (status in ('active', 'paused', 'archived'))
);

-- Helpful indexes for workspace-scoped program loading.
create index if not exists programs_workspace_id_idx
  on public.programs (workspace_id);

create index if not exists programs_workspace_status_idx
  on public.programs (workspace_id, status);

create index if not exists programs_created_by_idx
  on public.programs (created_by);

-- ============================================================
-- 2. updated_at trigger
-- ============================================================

create or replace function public.set_programs_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_programs_updated_at on public.programs;

create trigger set_programs_updated_at
before update on public.programs
for each row
execute function public.set_programs_updated_at();

-- ============================================================
-- 3. RLS enablement
-- ============================================================

alter table public.programs enable row level security;

-- ============================================================
-- 4. RLS policies
-- ============================================================
--
-- These policies assume the existing workspace helper functions exist:
--
-- public.is_workspace_member(p_workspace_id uuid)
-- public.is_workspace_admin(p_workspace_id uuid)
--
-- Those helper functions were created earlier to avoid recursive RLS problems
-- when checking workspace membership.

drop policy if exists "programs_select_for_workspace_members"
  on public.programs;

create policy "programs_select_for_workspace_members"
on public.programs
for select
to authenticated
using (
  public.is_workspace_member(workspace_id)
);

drop policy if exists "programs_insert_for_workspace_admins"
  on public.programs;

create policy "programs_insert_for_workspace_admins"
on public.programs
for insert
to authenticated
with check (
  public.is_workspace_admin(workspace_id)
  and created_by = auth.uid()
);

drop policy if exists "programs_update_for_workspace_admins"
  on public.programs;

create policy "programs_update_for_workspace_admins"
on public.programs
for update
to authenticated
using (
  public.is_workspace_admin(workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
);

-- No delete policy during MVP.
-- Programs should be archived by setting status = 'archived'
-- rather than hard-deleted.

-- ============================================================
-- 5. Optional app bootstrap function
-- ============================================================
--
-- This function creates a program only when the signed-in user is an admin
-- of the target workspace.
--
-- Use this only after review if direct table inserts from the app should remain
-- restricted behind a controlled function.

create or replace function public.create_program_for_workspace(
  p_workspace_id uuid,
  p_program_name text,
  p_program_type text,
  p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid;
  v_program_id uuid;
begin
  v_actor_id := auth.uid();

  if v_actor_id is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_workspace_admin(p_workspace_id) then
    raise exception 'Workspace admin access required';
  end if;

  insert into public.programs (
    workspace_id,
    program_name,
    program_type,
    status,
    description,
    created_by
  )
  values (
    p_workspace_id,
    trim(p_program_name),
    p_program_type,
    'active',
    p_description,
    v_actor_id
  )
  returning id into v_program_id;

  return v_program_id;
end;
$$;

revoke all on function public.create_program_for_workspace(uuid, text, text, text)
  from public;

grant execute on function public.create_program_for_workspace(uuid, text, text, text)
  to authenticated;

-- ============================================================
-- 6. Draft review notes
-- ============================================================
--
-- This draft currently includes:
--
-- programs table
-- program type check constraint
-- status check constraint
-- workspace foreign key
-- created_by auth user foreign key
-- updated_at trigger
-- RLS enabled
-- select policy for active workspace members via helper function
-- insert/update policies for workspace admins via helper function
-- optional controlled program bootstrap function
--
-- This draft does not include:
--
-- program_members table
-- support consent table
-- real financial records
-- trust ledger data
-- beneficiary records
-- clinical/recovery records
-- document storage
-- hard delete policy
--
-- Do not run until reviewed.
