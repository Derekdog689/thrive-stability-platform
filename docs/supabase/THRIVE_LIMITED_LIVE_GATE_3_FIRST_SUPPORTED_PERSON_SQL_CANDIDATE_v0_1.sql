-- THRIVE Limited-Live Gate 3 First Supported Person SQL Candidate v0.1
-- Date: 2026-08-25
-- Status: REVIEW-ONLY / NOT YET EXECUTED
-- Scope: Onboard Derek's ordinary auth identity as the first real supported person
--        and enroll that supported person in THRIVE Stability Support.
--
-- Auth identity: dstein561@gmail.com
-- Auth UUID: 05eee777-4a09-461c-af26-54a99395a98c
-- Workspace: THRIVE Personal Stability
-- Workspace UUID: 211d2c03-e2ac-4205-96b2-9a821b8bc6bd
-- Program: THRIVE Stability Support
-- Program UUID: 1a5887be-aa0e-4392-a688-04304686fbd6
-- Creator/admin identity: derek@dssenterprisesusa.llc
-- Creator UUID: 4c68820a-b824-419a-bcc1-1485a3dcba94
--
-- Explicitly out of scope:
--   * no auth.users creation or mutation
--   * no Heidi personal onboarding
--   * no workspace admin/support membership changes
--   * no synthetic fixture changes
--   * no Support/Resources lifecycle or RLS changes
--   * no hard deletes

begin;

-- Validate the intended ordinary auth identity.
do $$
declare v_count integer;
begin
  select count(*) into v_count
  from auth.users
  where id = '05eee777-4a09-461c-af26-54a99395a98c'::uuid
    and lower(email) = lower('dstein561@gmail.com');
  if v_count <> 1 then
    raise exception 'Expected ordinary participant auth identity not found exactly once';
  end if;
end $$;

-- Validate the real workspace and program relationship.
do $$
declare v_count integer;
begin
  select count(*) into v_count
  from public.programs p
  join public.workspaces w on w.id = p.workspace_id
  where w.id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
    and w.name = 'THRIVE Personal Stability'
    and w.workspace_type = 'personal'
    and w.status = 'active'
    and p.id = '1a5887be-aa0e-4392-a688-04304686fbd6'::uuid
    and p.program_name = 'THRIVE Stability Support'
    and p.program_type = 'stability_support'
    and p.status = 'active';
  if v_count <> 1 then
    raise exception 'Expected active THRIVE workspace/program spine not found exactly once';
  end if;
end $$;

-- Validate the creator remains an active workspace admin.
do $$
declare v_count integer;
begin
  select count(*) into v_count
  from public.workspace_members
  where workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
    and user_id = '4c68820a-b824-419a-bcc1-1485a3dcba94'::uuid
    and member_role = 'admin'
    and status = 'active';
  if v_count <> 1 then
    raise exception 'Expected active Derek system-admin workspace membership not found exactly once';
  end if;
end $$;

-- Fail closed if this auth identity is already attached to any supported person.
do $$
begin
  if exists (
    select 1 from public.supported_people
    where auth_user_id = '05eee777-4a09-461c-af26-54a99395a98c'::uuid
  ) then
    raise exception 'Ordinary participant auth identity is already linked to a supported person; reconcile before onboarding';
  end if;
end $$;

-- Create the first real supported person.
insert into public.supported_people (
  workspace_id,
  auth_user_id,
  display_name,
  preferred_name,
  status,
  created_by
)
values (
  '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid,
  '05eee777-4a09-461c-af26-54a99395a98c'::uuid,
  'Derek Steinmetz',
  'Derek',
  'active',
  '4c68820a-b824-419a-bcc1-1485a3dcba94'::uuid
);

-- Enroll that supported person in the real stability-support program.
insert into public.program_participants (
  workspace_id,
  program_id,
  supported_person_id,
  participant_role,
  status,
  created_by
)
select
  '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid,
  '1a5887be-aa0e-4392-a688-04304686fbd6'::uuid,
  sp.id,
  'supported_person',
  'active',
  '4c68820a-b824-419a-bcc1-1485a3dcba94'::uuid
from public.supported_people sp
where sp.workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
  and sp.auth_user_id = '05eee777-4a09-461c-af26-54a99395a98c'::uuid
  and sp.status = 'active';

-- Require one supported-person row and one active program participation.
do $$
declare
  v_person_count integer;
  v_participation_count integer;
begin
  select count(*) into v_person_count
  from public.supported_people
  where workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
    and auth_user_id = '05eee777-4a09-461c-af26-54a99395a98c'::uuid
    and status = 'active';

  select count(*) into v_participation_count
  from public.program_participants pp
  join public.supported_people sp on sp.id = pp.supported_person_id
  where pp.workspace_id = '211d2c03-e2ac-4205-96b2-9a821b8bc6bd'::uuid
    and pp.program_id = '1a5887be-aa0e-4392-a688-04304686fbd6'::uuid
    and sp.auth_user_id = '05eee777-4a09-461c-af26-54a99395a98c'::uuid
    and pp.participant_role = 'supported_person'
    and pp.status = 'active';

  if v_person_count <> 1 then
    raise exception 'Expected exactly one active supported-person row; found %', v_person_count;
  end if;
  if v_participation_count <> 1 then
    raise exception 'Expected exactly one active THRIVE Stability Support participation; found %', v_participation_count;
  end if;
end $$;

commit;

-- Post-install verification (read-only):
-- select
--   sp.id as supported_person_id,
--   sp.display_name,
--   sp.preferred_name,
--   sp.status as supported_person_status,
--   u.email,
--   w.name as workspace_name,
--   p.program_name,
--   pp.participant_role,
--   pp.status as participant_status
-- from public.supported_people sp
-- join auth.users u on u.id = sp.auth_user_id
-- join public.program_participants pp on pp.supported_person_id = sp.id
-- join public.workspaces w on w.id = pp.workspace_id
-- join public.programs p on p.id = pp.program_id
-- where sp.auth_user_id = '05eee777-4a09-461c-af26-54a99395a98c'::uuid;
