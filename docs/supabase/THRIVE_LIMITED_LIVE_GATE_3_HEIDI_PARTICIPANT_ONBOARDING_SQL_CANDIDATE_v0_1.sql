-- THRIVE Limited-Live Gate 3 Heidi Participant Onboarding SQL Candidate v0.1
-- Date: 2026-08-25
-- Status: REVIEW-ONLY / NOT YET EXECUTED
-- Scope: Onboard Heidi's personal auth identity as an ordinary supported person
--        in THRIVE Personal Stability / THRIVE Stability Support.
--
-- Verified preconditions:
--   workspace: THRIVE Personal Stability
--     id = 211d2c03-e2ac-4205-96b2-9a821b8bc6bd
--   program: THRIVE Stability Support
--     id = 1a5887be-aa0e-4392-a688-04304686fbd6
--   Heidi personal auth user:
--     email = Heidi.pfeiffer@ymail.com
--     id = c8206498-7df3-45d8-ae65-f0c25e0a78c5
--   Derek ordinary participant is already onboarded and is not modified here.
--
-- Explicitly out of scope:
--   * no workspace_members row for Heidi personal identity
--   * no reviewer/support membership changes
--   * no Derek participant changes
--   * no auth.users creation or password changes
--   * no synthetic fixture changes
--   * no Support lifecycle/RLS changes
--   * no hard deletes

begin;

-- Verify the intended real workspace and program.
do $$
begin
  if not exists (
    select 1
    from public.workspaces
    where id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
      and name = 'THRIVE Personal Stability'
      and workspace_type = 'personal'
      and status = 'active'
  ) then
    raise exception 'Expected active THRIVE Personal Stability workspace was not found';
  end if;

  if not exists (
    select 1
    from public.programs
    where id = '1a5887be-aa0e-4392-a688-04304686fbd6'::uuid
      and workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
      and program_name = 'THRIVE Stability Support'
      and program_type = 'stability_support'
      and status = 'active'
  ) then
    raise exception 'Expected active THRIVE Stability Support program was not found';
  end if;
end
$$;

-- Verify Heidi personal auth identity exactly.
do $$
begin
  if not exists (
    select 1
    from auth.users
    where id = 'c8206498-7df3-45d8-ae65-f0c25e0a78c5'::uuid
      and lower(email) = lower('Heidi.pfeiffer@ymail.com')
  ) then
    raise exception 'Heidi personal auth identity was not found as expected';
  end if;
end
$$;

-- Fail closed if this auth identity is already attached to a supported person
-- anywhere else, because supported_people.auth_user_id is globally unique.
do $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.supported_people
  where auth_user_id = 'c8206498-7df3-45d8-ae65-f0c25e0a78c5'::uuid;

  if v_count > 1 then
    raise exception 'Multiple supported-person rows already reference Heidi personal auth identity';
  end if;
end
$$;

-- Create Heidi supported-person row only if absent.
insert into public.supported_people (
  workspace_id,
  auth_user_id,
  display_name,
  preferred_name,
  status,
  created_by
)
select
  '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid,
  'c8206498-7df3-45d8-ae65-f0c25e0a78c5'::uuid,
  'Heidi Pfeiffer',
  'Heidi',
  'active',
  '4c68820a-b824-419a-bcc1-1485a3dcba94'::uuid
where not exists (
  select 1
  from public.supported_people
  where auth_user_id = 'c8206498-7df3-45d8-ae65-f0c25e0a78c5'::uuid
);

-- If Heidi already exists exactly in the intended workspace, require active state
-- and expected identity values rather than silently moving scope.
do $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.supported_people
  where auth_user_id = 'c8206498-7df3-45d8-ae65-f0c25e0a78c5'::uuid
    and workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
    and display_name = 'Heidi Pfeiffer'
    and preferred_name = 'Heidi'
    and status = 'active';

  if v_count <> 1 then
    raise exception 'Expected exactly one active Heidi supported-person row in THRIVE Personal Stability; found %', v_count;
  end if;
end
$$;

-- Create active program participation only if absent.
insert into public.program_participants (
  workspace_id,
  program_id,
  supported_person_id,
  participant_role,
  status,
  created_by
)
select
  sp.workspace_id,
  '1a5887be-aa0e-4392-a688-04304686fbd6'::uuid,
  sp.id,
  'supported_person',
  'active',
  '4c68820a-b824-419a-bcc1-1485a3dcba94'::uuid
from public.supported_people sp
where sp.auth_user_id = 'c8206498-7df3-45d8-ae65-f0c25e0a78c5'::uuid
  and sp.workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
  and sp.status = 'active'
  and not exists (
    select 1
    from public.program_participants pp
    where pp.workspace_id = sp.workspace_id
      and pp.program_id = '1a5887be-aa0e-4392-a688-04304686fbd6'::uuid
      and pp.supported_person_id = sp.id
  );

-- Verify exactly one active Heidi program participation.
do $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.program_participants pp
  join public.supported_people sp
    on sp.id = pp.supported_person_id
   and sp.workspace_id = pp.workspace_id
  where sp.auth_user_id = 'c8206498-7df3-45d8-ae65-f0c25e0a78c5'::uuid
    and pp.workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
    and pp.program_id = '1a5887be-aa0e-4392-a688-04304686fbd6'::uuid
    and pp.participant_role = 'supported_person'
    and pp.status = 'active';

  if v_count <> 1 then
    raise exception 'Expected exactly one active Heidi program participation; found %', v_count;
  end if;
end
$$;

-- Verify no workspace-level authority was granted to Heidi personal identity.
do $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.workspace_members
  where workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
    and user_id = 'c8206498-7df3-45d8-ae65-f0c25e0a78c5'::uuid;

  if v_count <> 0 then
    raise exception 'Heidi personal identity unexpectedly has workspace membership';
  end if;
end
$$;

commit;

-- Post-install verification (read-only):
-- select
--   sp.id as supported_person_id,
--   au.email,
--   sp.display_name,
--   sp.preferred_name,
--   sp.status as supported_person_status,
--   pp.id as program_participant_id,
--   p.program_name,
--   pp.participant_role,
--   pp.status as participant_status
-- from public.supported_people sp
-- join auth.users au on au.id = sp.auth_user_id
-- join public.program_participants pp
--   on pp.supported_person_id = sp.id
--  and pp.workspace_id = sp.workspace_id
-- join public.programs p on p.id = pp.program_id
-- where sp.auth_user_id = 'c8206498-7df3-45d8-ae65-f0c25e0a78c5'::uuid;
