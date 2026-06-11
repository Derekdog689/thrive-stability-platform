-- THRIVE Stewardship & Stability Platform
-- Clean Supabase Schema SQL Draft
-- Draft only. Review before running in Supabase SQL Editor.
-- Project: thrive-stewardship-stability-platform

-- ============================================================
-- SECTION 001: Extensions and Utility Functions
-- ============================================================

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- SECTION 002: Profiles
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  role_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- ============================================================
-- SECTION 003: Workspaces
-- ============================================================

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  workspace_type text not null,
  status text not null default 'active',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint workspaces_workspace_type_check check (
    workspace_type in (
      'personal',
      'trust_support',
      'recovery_support',
      'case_support',
      'demo'
    )
  ),

  constraint workspaces_status_check check (
    status in (
      'active',
      'paused',
      'archived'
    )
  )
);

create trigger set_workspaces_updated_at
before update on public.workspaces
for each row
execute function public.set_updated_at();

alter table public.workspaces enable row level security;

-- Policy note:
-- Workspace read access depends on workspace_members.
-- This policy is added after workspace_members exists.

-- ============================================================
-- SECTION 004: Workspace Members
-- ============================================================

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  member_role text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),

  constraint workspace_members_unique_user_workspace unique (workspace_id, user_id),

  constraint workspace_members_member_role_check check (
    member_role in (
      'admin',
      'trustee',
      'support',
      'individual',
      'viewer'
    )
  ),

  constraint workspace_members_status_check check (
    status in (
      'active',
      'inactive',
      'removed'
    )
  )
);

alter table public.workspace_members enable row level security;

-- ============================================================
-- SECTION 005: Workspace Access Policies
-- ============================================================

create policy "Workspace members can read assigned workspaces"
on public.workspaces
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspaces.id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
);


-- Direct workspace inserts are intentionally not allowed for MVP.
-- Workspaces should be created through public.create_workspace_with_admin()
-- so every workspace receives an initial admin membership.

create policy "Workspace admins can update workspaces"
on public.workspaces
for update
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspaces.id
      and wm.user_id = auth.uid()
      and wm.member_role = 'admin'
      and wm.status = 'active'
  )
)
with check (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspaces.id
      and wm.user_id = auth.uid()
      and wm.member_role = 'admin'
      and wm.status = 'active'
  )
);

create policy "Members can read own workspace membership"
on public.workspace_members
for select
to authenticated
using (user_id = auth.uid());

create policy "Workspace admins can read workspace memberships"
on public.workspace_members
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members admin_member
    where admin_member.workspace_id = workspace_members.workspace_id
      and admin_member.user_id = auth.uid()
      and admin_member.member_role = 'admin'
      and admin_member.status = 'active'
  )
);

create policy "Workspace creators can insert initial admin membership"
on public.workspace_members
for insert
to authenticated
with check (
  user_id = auth.uid()
  and member_role = 'admin'
  and exists (
    select 1
    from public.workspaces w
    where w.id = workspace_members.workspace_id
      and w.created_by = auth.uid()
  )
);

create policy "Workspace admins can manage memberships"
on public.workspace_members
for update
to authenticated
using (
  exists (
    select 1
    from public.workspace_members admin_member
    where admin_member.workspace_id = workspace_members.workspace_id
      and admin_member.user_id = auth.uid()
      and admin_member.member_role = 'admin'
      and admin_member.status = 'active'
  )
)
with check (
  exists (
    select 1
    from public.workspace_members admin_member
    where admin_member.workspace_id = workspace_members.workspace_id
      and admin_member.user_id = auth.uid()
      and admin_member.member_role = 'admin'
      and admin_member.status = 'active'
  )
);

-- ============================================================
-- SECTION 006: Workspace Bootstrap Function

-- Creates a workspace and immediately assigns the creator as admin.
-- This avoids a half-created workspace with no admin member.

create or replace function public.create_workspace_with_admin(
  p_name text,
  p_workspace_type text default 'demo'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_actor_id uuid;
begin
  v_actor_id := auth.uid();

  if v_actor_id is null then
    raise exception 'Authentication required';
  end if;

  if p_workspace_type not in (
    'personal',
    'trust_support',
    'recovery_support',
    'case_support',
    'demo'
  ) then
    raise exception 'Invalid workspace_type: %', p_workspace_type;
  end if;

  insert into public.workspaces (
    name,
    workspace_type,
    status,
    created_by
  )
  values (
    p_name,
    p_workspace_type,
    'active',
    v_actor_id
  )
  returning id into v_workspace_id;

  insert into public.workspace_members (
    workspace_id,
    user_id,
    member_role,
    status
  )
  values (
    v_workspace_id,
    v_actor_id,
    'admin',
    'active'
  );

  return v_workspace_id;
end;
$$;

revoke all on function public.create_workspace_with_admin(text, text) from public;

grant execute on function public.create_workspace_with_admin(text, text) to authenticated;
-- ============================================================

-- This draft currently includes:
-- profiles
-- workspaces
-- workspace_members
-- workspace bootstrap function
-- starter RLS policies
--
-- Not yet included:
-- budget_categories
-- transactions
-- daily_checkins
-- support_notes
-- reports
-- audit_log
--
-- Do not run until reviewed.