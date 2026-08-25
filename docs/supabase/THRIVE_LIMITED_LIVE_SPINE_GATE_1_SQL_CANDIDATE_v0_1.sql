-- THRIVE Limited-Live Spine Gate 1 SQL Candidate v0.1
-- Date: 2026-08-25
-- Status: REVIEW-ONLY / NOT YET EXECUTED
-- Scope: Create the real THRIVE Personal Stability workspace and
--        THRIVE Stability Support program only.
--
-- Explicitly out of scope:
--   * no supported_people rows
--   * no program_participants rows
--   * no workspace_members rows
--   * no auth.users creation or mutation
--   * no synthetic fixture changes
--   * no Support/Resources lifecycle or RLS changes
--   * no hard deletes

begin;

-- Fail closed if a workspace with the intended name already exists
-- with a different operating type/status than this candidate expects.
do $$
begin
  if exists (
    select 1
    from public.workspaces
    where name = 'THRIVE Personal Stability'
      and (workspace_type <> 'personal' or status <> 'active')
  ) then
    raise exception 'THRIVE Personal Stability already exists with unexpected type/status';
  end if;
end
$$;

-- Create the real limited-live workspace only if absent.
insert into public.workspaces (
  name,
  workspace_type,
  status,
  created_by
)
select
  'THRIVE Personal Stability',
  'personal',
  'active',
  '05eee777-4a09-461c-af26-54a99395a98c'::uuid
where not exists (
  select 1
  from public.workspaces
  where name = 'THRIVE Personal Stability'
    and workspace_type = 'personal'
    and status = 'active'
);

-- Require exactly one intended workspace after reconciliation.
do $$
declare
  v_count integer;
begin
  select count(*)
  into v_count
  from public.workspaces
  where name = 'THRIVE Personal Stability'
    and workspace_type = 'personal'
    and status = 'active';

  if v_count <> 1 then
    raise exception 'Expected exactly one active THRIVE Personal Stability workspace; found %', v_count;
  end if;
end
$$;

-- Fail closed if the intended program name already exists in the
-- intended workspace with a different type/status.
do $$
begin
  if exists (
    select 1
    from public.programs p
    join public.workspaces w on w.id = p.workspace_id
    where w.name = 'THRIVE Personal Stability'
      and w.workspace_type = 'personal'
      and w.status = 'active'
      and p.program_name = 'THRIVE Stability Support'
      and (p.program_type <> 'stability_support' or p.status <> 'active')
  ) then
    raise exception 'THRIVE Stability Support already exists with unexpected type/status';
  end if;
end
$$;

-- Create the real limited-live program only if absent.
insert into public.programs (
  workspace_id,
  program_name,
  program_type,
  status,
  description,
  created_by
)
select
  w.id,
  'THRIVE Stability Support',
  'stability_support',
  'active',
  'Person-centered stability-support program for controlled limited-live THRIVE use.',
  '05eee777-4a09-461c-af26-54a99395a98c'::uuid
from public.workspaces w
where w.name = 'THRIVE Personal Stability'
  and w.workspace_type = 'personal'
  and w.status = 'active'
  and not exists (
    select 1
    from public.programs p
    where p.workspace_id = w.id
      and p.program_name = 'THRIVE Stability Support'
      and p.program_type = 'stability_support'
      and p.status = 'active'
  );

-- Require exactly one intended program after reconciliation.
do $$
declare
  v_count integer;
begin
  select count(*)
  into v_count
  from public.programs p
  join public.workspaces w on w.id = p.workspace_id
  where w.name = 'THRIVE Personal Stability'
    and w.workspace_type = 'personal'
    and w.status = 'active'
    and p.program_name = 'THRIVE Stability Support'
    and p.program_type = 'stability_support'
    and p.status = 'active';

  if v_count <> 1 then
    raise exception 'Expected exactly one active THRIVE Stability Support program; found %', v_count;
  end if;
end
$$;

commit;

-- Post-install verification query (read-only):
-- select
--   w.id as workspace_id,
--   w.name as workspace_name,
--   w.workspace_type,
--   w.status as workspace_status,
--   p.id as program_id,
--   p.program_name,
--   p.program_type,
--   p.status as program_status,
--   p.description
-- from public.workspaces w
-- join public.programs p on p.workspace_id = w.id
-- where w.name = 'THRIVE Personal Stability'
--   and p.program_name = 'THRIVE Stability Support';
