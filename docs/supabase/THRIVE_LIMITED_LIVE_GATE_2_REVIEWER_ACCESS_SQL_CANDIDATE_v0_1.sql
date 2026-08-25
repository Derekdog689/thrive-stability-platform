-- THRIVE Limited-Live Gate 2 Reviewer Access SQL Candidate v0.1
-- Date: 2026-08-25
-- Status: REVIEW-ONLY / NOT YET EXECUTED
-- Scope: Bootstrap only the real limited-live workspace memberships required
--        for system administration and Support Review operation.
--
-- Intended memberships:
--   derek@dssenterprisesusa.llc -> admin
--   trust.mail4jutta@yahoo.com  -> support
--
-- Explicitly out of scope:
--   * no supported_people rows
--   * no program_participants rows
--   * no auth.users creation or mutation
--   * no Heidi personal participant identity creation
--   * no Derek personal participant membership
--   * no synthetic fixture changes
--   * no Support lifecycle/RLS changes
--   * no hard deletes

begin;

-- Resolve and validate the real limited-live workspace.
do $$
declare
  v_count integer;
begin
  select count(*)
  into v_count
  from public.workspaces
  where id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
    and name = 'THRIVE Personal Stability'
    and workspace_type = 'personal'
    and status = 'active';

  if v_count <> 1 then
    raise exception 'Expected active THRIVE Personal Stability workspace was not found exactly once';
  end if;
end
$$;

-- Validate both intended auth identities exist exactly once.
do $$
declare
  v_admin_count integer;
  v_support_count integer;
begin
  select count(*) into v_admin_count
  from auth.users
  where id = '4c68820a-b824-419a-bcc1-1485a3dcba94'::uuid
    and lower(email) = lower('derek@dssenterprisesusa.llc');

  select count(*) into v_support_count
  from auth.users
  where id = '9aab91d4-0d6e-42a0-9447-bb60556a7a7f'::uuid
    and lower(email) = lower('trust.mail4jutta@yahoo.com');

  if v_admin_count <> 1 then
    raise exception 'Expected Derek system-admin auth identity not found exactly once';
  end if;

  if v_support_count <> 1 then
    raise exception 'Expected Heidi reviewer/support auth identity not found exactly once';
  end if;
end
$$;

-- Fail closed if either intended user already has a membership in this workspace
-- with a conflicting role/status.
do $$
begin
  if exists (
    select 1
    from public.workspace_members
    where workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
      and user_id = '4c68820a-b824-419a-bcc1-1485a3dcba94'::uuid
      and (member_role <> 'admin' or status <> 'active')
  ) then
    raise exception 'Derek workspace membership exists with unexpected role/status';
  end if;

  if exists (
    select 1
    from public.workspace_members
    where workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
      and user_id = '9aab91d4-0d6e-42a0-9447-bb60556a7a7f'::uuid
      and (member_role <> 'support' or status <> 'active')
  ) then
    raise exception 'Heidi reviewer workspace membership exists with unexpected role/status';
  end if;
end
$$;

-- Reconcile Derek system identity as active admin if absent.
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
    and member_role = 'admin'
    and status = 'active'
);

-- Reconcile Heidi reviewer identity as active support if absent.
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
    and member_role = 'support'
    and status = 'active'
);

-- Require exactly one intended active membership for each identity.
do $$
declare
  v_admin_count integer;
  v_support_count integer;
begin
  select count(*) into v_admin_count
  from public.workspace_members
  where workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
    and user_id = '4c68820a-b824-419a-bcc1-1485a3dcba94'::uuid
    and member_role = 'admin'
    and status = 'active';

  select count(*) into v_support_count
  from public.workspace_members
  where workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
    and user_id = '9aab91d4-0d6e-42a0-9447-bb60556a7a7f'::uuid
    and member_role = 'support'
    and status = 'active';

  if v_admin_count <> 1 then
    raise exception 'Expected exactly one active Derek admin membership; found %', v_admin_count;
  end if;

  if v_support_count <> 1 then
    raise exception 'Expected exactly one active Heidi support membership; found %', v_support_count;
  end if;
end
$$;

commit;

-- Post-install verification query (read-only):
-- select
--   wm.id as workspace_member_id,
--   wm.workspace_id,
--   w.name as workspace_name,
--   wm.user_id,
--   u.email,
--   wm.member_role,
--   wm.status
-- from public.workspace_members wm
-- join public.workspaces w on w.id = wm.workspace_id
-- join auth.users u on u.id = wm.user_id
-- where wm.workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
-- order by wm.member_role, lower(u.email);
