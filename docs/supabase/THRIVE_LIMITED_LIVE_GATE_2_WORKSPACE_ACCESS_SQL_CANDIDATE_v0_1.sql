-- THRIVE Limited-Live Gate 2 Workspace Access SQL Candidate v0.1
-- Date: 2026-08-25
-- Status: REVIEW-ONLY / NOT YET EXECUTED
-- Scope: Bootstrap real workspace access only.
--
-- Creates or reconciles exactly two workspace memberships in
-- THRIVE Personal Stability:
--   1) derek@dssenterprisesusa.llc -> active admin
--   2) trust.mail4jutta@yahoo.com -> active support
--
-- Explicitly out of scope:
--   * no supported_people rows
--   * no program_participants rows
--   * no auth.users creation or mutation
--   * no dstein561@gmail.com workspace membership
--   * no Heidi.pfeiffer@ymail.com auth/user creation
--   * no synthetic fixture changes
--   * no Support lifecycle/RLS changes
--   * no hard deletes

begin;

-- Resolve and verify the real limited-live workspace.
do $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.workspaces
  where id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
    and name = 'THRIVE Personal Stability'
    and workspace_type = 'personal'
    and status = 'active';

  if v_count <> 1 then
    raise exception 'Expected the active THRIVE Personal Stability workspace; found % matching rows', v_count;
  end if;
end
$$;

-- Verify Derek system/admin auth identity.
do $$
begin
  if not exists (
    select 1
    from auth.users
    where id = '4c68820a-b824-419a-bcc1-1485a3dcba94'::uuid
      and lower(email) = lower('derek@dssenterprisesusa.llc')
  ) then
    raise exception 'Derek system/admin auth identity was not found as expected';
  end if;
end
$$;

-- Verify Heidi reviewer/support auth identity.
do $$
begin
  if not exists (
    select 1
    from auth.users
    where id = '9aab91d4-0d6e-42a0-9447-bb60556a7a7f'::uuid
      and lower(email) = lower('trust.mail4jutta@yahoo.com')
  ) then
    raise exception 'Heidi reviewer/support auth identity was not found as expected';
  end if;
end
$$;

-- Fail closed on duplicate or conflicting Derek memberships in the real workspace.
do $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.workspace_members
  where workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
    and user_id = '4c68820a-b824-419a-bcc1-1485a3dcba94'::uuid;

  if v_count > 1 then
    raise exception 'Multiple Derek memberships already exist in THRIVE Personal Stability';
  end if;
end
$$;

insert into public.workspace_members (
  workspace_id,
  user_id,
  member_role,
  status
)
select
  '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid,
  '4c68820a-b824-419a-bcc1-1485a3dcba94'::uuid,
  'admin',
  'active'
where not exists (
  select 1
  from public.workspace_members
  where workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
    and user_id = '4c68820a-b824-419a-bcc1-1485a3dcba94'::uuid
);

update public.workspace_members
set member_role = 'admin', status = 'active'
where workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
  and user_id = '4c68820a-b824-419a-bcc1-1485a3dcba94'::uuid
  and (member_role <> 'admin' or status <> 'active');

-- Fail closed on duplicate or conflicting Heidi reviewer memberships.
do $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.workspace_members
  where workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
    and user_id = '9aab91d4-0d6e-42a0-9447-bb60556a7a7f'::uuid;

  if v_count > 1 then
    raise exception 'Multiple Heidi reviewer memberships already exist in THRIVE Personal Stability';
  end if;
end
$$;

insert into public.workspace_members (
  workspace_id,
  user_id,
  member_role,
  status
)
select
  '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid,
  '9aab91d4-0d6e-42a0-9447-bb60556a7a7f'::uuid,
  'support',
  'active'
where not exists (
  select 1
  from public.workspace_members
  where workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
    and user_id = '9aab91d4-0d6e-42a0-9447-bb60556a7a7f'::uuid
);

update public.workspace_members
set member_role = 'support', status = 'active'
where workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
  and user_id = '9aab91d4-0d6e-42a0-9447-bb60556a7a7f'::uuid
  and (member_role <> 'support' or status <> 'active');

-- Verify exact resulting access state.
do $$
declare
  v_derek_count integer;
  v_heidi_count integer;
begin
  select count(*) into v_derek_count
  from public.workspace_members
  where workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
    and user_id = '4c68820a-b824-419a-bcc1-1485a3dcba94'::uuid
    and member_role = 'admin'
    and status = 'active';

  select count(*) into v_heidi_count
  from public.workspace_members
  where workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
    and user_id = '9aab91d4-0d6e-42a0-9447-bb60556a7a7f'::uuid
    and member_role = 'support'
    and status = 'active';

  if v_derek_count <> 1 or v_heidi_count <> 1 then
    raise exception 'Expected one active Derek admin and one active Heidi support membership; got Derek %, Heidi %', v_derek_count, v_heidi_count;
  end if;
end
$$;

commit;

-- Post-install verification (read-only):
-- select wm.id, w.name, au.email, wm.member_role, wm.status
-- from public.workspace_members wm
-- join public.workspaces w on w.id = wm.workspace_id
-- join auth.users au on au.id = wm.user_id
-- where wm.workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
-- order by wm.member_role, lower(au.email);
