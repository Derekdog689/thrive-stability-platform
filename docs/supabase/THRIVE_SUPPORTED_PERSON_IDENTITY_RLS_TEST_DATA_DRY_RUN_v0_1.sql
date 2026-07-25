-- THRIVE Supported-Person Identity Authenticated RLS Test Data
-- Dry-run version: v0.1
-- Status: REVIEW-ONLY DRY RUN
-- DO NOT EXECUTE WITHOUT SEPARATE DRY-RUN APPROVAL
--
-- Purpose:
-- Define controlled, clearly labeled test records for authenticated RLS proof.
--
-- This candidate does not:
-- - create authentication users;
-- - create or modify Johnny;
-- - use real personal, financial, clinical, recovery, legal, or trust data;
-- - create explanation records;
-- - access or synchronize the Trust Engine;
-- - disable or bypass RLS;
-- - use service-role application access;
-- - permanently install test records.
--
-- REQUIRED BEFORE A FUTURE APPROVED EXECUTION:
-- Six nonproduction authentication accounts must already exist:
-- 1. Test workspace administrator
-- 2. Test supported person A
-- 3. Test supported person B
-- 4. Test support-role member
-- 5. Test viewer-role member
-- 6. Test outsider with no workspace membership
--
-- Six verified synthetic auth UUIDs are resolved below.
-- The outsider UUID is documented but intentionally receives no membership.

begin;

-- ============================================================
-- 1. Controlled identifiers
-- ============================================================

create temporary table thrive_supported_person_rls_test_ids (
  key text primary key,
  id uuid not null
) on commit drop;

insert into thrive_supported_person_rls_test_ids (key, id)
values
  ('workspace_id',       '71000000-0000-4000-8000-000000000001'),
  ('program_id',         '71000000-0000-4000-8000-000000000002'),
  ('person_a_id',        '71000000-0000-4000-8000-000000000003'),
  ('person_b_id',        '71000000-0000-4000-8000-000000000004'),
  ('participation_a_id', '71000000-0000-4000-8000-000000000005'),
  ('participation_b_id', '71000000-0000-4000-8000-000000000006'),

  -- VERIFIED SYNTHETIC AUTH USER UUIDS: RESOLVED JULY 25, 2026.
  ('admin_auth_user_id',   '3c0300e6-c4e9-4a84-b668-4a7e39593162'),
  ('person_a_auth_user_id','9b283c6e-c2f8-4f87-9f90-fa081ee249bd'),
  ('person_b_auth_user_id','28cecd10-43ed-4ae5-8668-31cfa515412c'),
  ('support_auth_user_id', '7f0a7540-7a6d-4a1a-a29f-7a26c9571db9'),
  ('viewer_auth_user_id',  'd3782ad5-8e99-4779-8928-0143bd567486'),
  ('outsider_auth_user_id','d89a6549-ac1a-431c-aff1-1ba7313175ab');

-- ============================================================
-- 2. Mandatory resolved-identity guard
-- ============================================================

do $function$
declare
  resolved_auth_count integer;
  distinct_auth_count integer;
begin
  select
    count(*),
    count(distinct id)
  into
    resolved_auth_count,
    distinct_auth_count
  from thrive_supported_person_rls_test_ids
  where key like '%auth_user_id';

  if resolved_auth_count <> 6 then
    raise exception
      'REVIEW-ONLY STOP: expected six resolved synthetic auth-user UUIDs, found %',
      resolved_auth_count;
  end if;

  if distinct_auth_count <> 6 then
    raise exception
      'REVIEW-ONLY STOP: all six synthetic auth-user UUIDs must be distinct';
  end if;

  if exists (
    select 1
    from thrive_supported_person_rls_test_ids ids
    left join auth.users users
      on users.id = ids.id
    where ids.key like '%auth_user_id'
      and users.id is null
  ) then
    raise exception
      'REVIEW-ONLY STOP: one or more resolved synthetic auth-user UUIDs do not exist';
  end if;
end;
$function$;

-- ============================================================
-- 3. Test workspace
-- ============================================================

insert into public.workspaces (
  id,
  name,
  workspace_type,
  status,
  created_by
)
select
  ids.id,
  'SUPPORTED PERSON RLS TEST',
  'demo',
  'active',
  admin_ids.id
from thrive_supported_person_rls_test_ids ids
cross join thrive_supported_person_rls_test_ids admin_ids
where ids.key = 'workspace_id'
  and admin_ids.key = 'admin_auth_user_id';

-- ============================================================
-- 4. Test workspace memberships
-- ============================================================

insert into public.workspace_members (
  workspace_id,
  user_id,
  member_role,
  status
)
select workspace_ids.id, actor_ids.id, assignments.member_role, 'active'
from (
  values
    ('admin_auth_user_id',    'admin'),
    ('person_a_auth_user_id', 'individual'),
    ('person_b_auth_user_id', 'individual'),
    ('support_auth_user_id',  'support'),
    ('viewer_auth_user_id',   'viewer')
) as assignments(auth_key, member_role)
join thrive_supported_person_rls_test_ids actor_ids
  on actor_ids.key = assignments.auth_key
cross join thrive_supported_person_rls_test_ids workspace_ids
where workspace_ids.key = 'workspace_id';

-- The outsider intentionally receives no workspace membership.

-- ============================================================
-- 5. Test program
-- ============================================================

insert into public.programs (
  id,
  workspace_id,
  program_name,
  program_type,
  status,
  description,
  created_by
)
select
  program_ids.id,
  workspace_ids.id,
  'SUPPORTED PERSON PROGRAM TEST',
  'demo',
  'active',
  'Controlled nonproduction program for supported-person RLS proof.',
  admin_ids.id
from thrive_supported_person_rls_test_ids program_ids
cross join thrive_supported_person_rls_test_ids workspace_ids
cross join thrive_supported_person_rls_test_ids admin_ids
where program_ids.key = 'program_id'
  and workspace_ids.key = 'workspace_id'
  and admin_ids.key = 'admin_auth_user_id';

-- ============================================================
-- 6. Supported-person test records
-- ============================================================

insert into public.supported_people (
  id,
  workspace_id,
  auth_user_id,
  display_name,
  preferred_name,
  status,
  external_reference,
  created_by
)
select
  person_ids.id,
  workspace_ids.id,
  auth_ids.id,
  test_values.display_name,
  test_values.preferred_name,
  'active',
  test_values.external_reference,
  admin_ids.id
from (
  values
    (
      'person_a_id',
      'person_a_auth_user_id',
      'SUPPORTED PERSON TEST A',
      'Test A',
      'RLS-TEST-PERSON-A'
    ),
    (
      'person_b_id',
      'person_b_auth_user_id',
      'SUPPORTED PERSON TEST B',
      'Test B',
      'RLS-TEST-PERSON-B'
    )
) as test_values(
  person_key,
  auth_key,
  display_name,
  preferred_name,
  external_reference
)
join thrive_supported_person_rls_test_ids person_ids
  on person_ids.key = test_values.person_key
join thrive_supported_person_rls_test_ids auth_ids
  on auth_ids.key = test_values.auth_key
cross join thrive_supported_person_rls_test_ids workspace_ids
cross join thrive_supported_person_rls_test_ids admin_ids
where workspace_ids.key = 'workspace_id'
  and admin_ids.key = 'admin_auth_user_id';

-- ============================================================
-- 7. Program-participation test records
-- ============================================================

insert into public.program_participants (
  id,
  workspace_id,
  program_id,
  supported_person_id,
  participant_role,
  status,
  created_by
)
select
  participation_ids.id,
  workspace_ids.id,
  program_ids.id,
  person_ids.id,
  'supported_person',
  'active',
  admin_ids.id
from (
  values
    ('participation_a_id', 'person_a_id'),
    ('participation_b_id', 'person_b_id')
) as assignments(participation_key, person_key)
join thrive_supported_person_rls_test_ids participation_ids
  on participation_ids.key = assignments.participation_key
join thrive_supported_person_rls_test_ids person_ids
  on person_ids.key = assignments.person_key
cross join thrive_supported_person_rls_test_ids workspace_ids
cross join thrive_supported_person_rls_test_ids program_ids
cross join thrive_supported_person_rls_test_ids admin_ids
where workspace_ids.key = 'workspace_id'
  and program_ids.key = 'program_id'
  and admin_ids.key = 'admin_auth_user_id';

-- ============================================================
-- 8. Candidate inspection
-- ============================================================

select
  id,
  name,
  workspace_type,
  status,
  created_by
from public.workspaces
where id = (
  select id
  from thrive_supported_person_rls_test_ids
  where key = 'workspace_id'
);

select
  workspace_id,
  user_id,
  member_role,
  status
from public.workspace_members
where workspace_id = (
  select id
  from thrive_supported_person_rls_test_ids
  where key = 'workspace_id'
)
order by member_role, user_id;

select
  id,
  workspace_id,
  program_name,
  program_type,
  status,
  created_by
from public.programs
where id = (
  select id
  from thrive_supported_person_rls_test_ids
  where key = 'program_id'
);

select
  id,
  workspace_id,
  auth_user_id,
  display_name,
  preferred_name,
  status,
  external_reference,
  created_by
from public.supported_people
where workspace_id = (
  select id
  from thrive_supported_person_rls_test_ids
  where key = 'workspace_id'
)
order by display_name;

select
  id,
  workspace_id,
  program_id,
  supported_person_id,
  participant_role,
  status,
  created_by
from public.program_participants
where workspace_id = (
  select id
  from thrive_supported_person_rls_test_ids
  where key = 'workspace_id'
)
order by supported_person_id;

-- ============================================================
-- 9. Transactional dry-run assertions
-- ============================================================

do $function$
declare
  workspace_count integer;
  membership_count integer;
  outsider_membership_count integer;
  program_count integer;
  supported_person_count integer;
  participant_count integer;
begin
  select count(*)
  into workspace_count
  from public.workspaces
  where id = '71000000-0000-4000-8000-000000000001'::uuid;

  select count(*)
  into membership_count
  from public.workspace_members
  where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid;

  select count(*)
  into outsider_membership_count
  from public.workspace_members
  where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid
    and user_id = 'd89a6549-ac1a-431c-aff1-1ba7313175ab'::uuid;

  select count(*)
  into program_count
  from public.programs
  where id = '71000000-0000-4000-8000-000000000002'::uuid;

  select count(*)
  into supported_person_count
  from public.supported_people
  where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid;

  select count(*)
  into participant_count
  from public.program_participants
  where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid;

  if workspace_count <> 1 then
    raise exception
      'DRY-RUN FAILURE: expected 1 test workspace, found %',
      workspace_count;
  end if;

  if membership_count <> 5 then
    raise exception
      'DRY-RUN FAILURE: expected 5 test memberships, found %',
      membership_count;
  end if;

  if outsider_membership_count <> 0 then
    raise exception
      'DRY-RUN FAILURE: outsider unexpectedly received a membership';
  end if;

  if program_count <> 1 then
    raise exception
      'DRY-RUN FAILURE: expected 1 test program, found %',
      program_count;
  end if;

  if supported_person_count <> 2 then
    raise exception
      'DRY-RUN FAILURE: expected 2 supported people, found %',
      supported_person_count;
  end if;

  if participant_count <> 2 then
    raise exception
      'DRY-RUN FAILURE: expected 2 program participants, found %',
      participant_count;
  end if;
end;
$function$;

select
  'workspace' as record_type,
  count(*) as expected_count
from public.workspaces
where id = '71000000-0000-4000-8000-000000000001'::uuid

union all

select
  'workspace_members',
  count(*)
from public.workspace_members
where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid

union all

select
  'program',
  count(*)
from public.programs
where id = '71000000-0000-4000-8000-000000000002'::uuid

union all

select
  'supported_people',
  count(*)
from public.supported_people
where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid

union all

select
  'program_participants',
  count(*)
from public.program_participants
where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid;

-- ============================================================
-- 10. Mandatory rollback
-- ============================================================

rollback;

-- ============================================================
-- 11. Post-rollback verification
-- ============================================================

select
  'workspace' as record_type,
  count(*) as remaining_count
from public.workspaces
where id = '71000000-0000-4000-8000-000000000001'::uuid

union all

select
  'workspace_members',
  count(*)
from public.workspace_members
where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid

union all

select
  'program',
  count(*)
from public.programs
where id = '71000000-0000-4000-8000-000000000002'::uuid

union all

select
  'supported_people',
  count(*)
from public.supported_people
where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid

union all

select
  'program_participants',
  count(*)
from public.program_participants
where workspace_id = '71000000-0000-4000-8000-000000000001'::uuid;
