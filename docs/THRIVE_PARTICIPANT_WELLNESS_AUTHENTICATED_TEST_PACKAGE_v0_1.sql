-- THRIVE PARTICIPANT WELLNESS AUTHENTICATED TEST PACKAGE v0.1
-- SYNTHETIC TESTING ONLY
--
-- Purpose:
-- Validate participant self-access, isolation, same-day update, duplicate-day
-- blocking, immutable scope, admin archive authority, and outsider denial.
--
-- IMPORTANT:
-- This script is a test package, not a single-role script.
-- Run the labeled sections while authenticated as the specified synthetic user.
-- Do not use real participant data.
--
-- Known synthetic identities:
-- Person D auth user:
--   d48b7268-9aa6-4498-a923-2851fd5232c9
-- Person D supported person:
--   71000000-0000-4000-8000-000000000009
--
-- Person A auth user:
--   9b283c6e-c2f8-4f87-9f90-fa081ee249bd
-- Person A supported person:
--   71000000-0000-4000-8000-000000000003
--
-- Workspace admin auth user:
--   3c0300e6-c4e9-4a84-b668-4a7e39593162
--
-- Outsider auth user:
--   d89a6549-ac1a-431c-aff1-1ba7313175ab
--
-- Fixture workspace:
--   71000000-0000-4000-8000-000000000001
--
-- Fixture program:
--   71000000-0000-4000-8000-000000000002
--
-- Person D participation:
--   71000000-0000-4000-8000-000000000010

-- ============================================================
-- SECTION 0: BASELINE AS POSTGRES OR ADMIN
-- ============================================================

select count(*) as wellness_record_count_before_tests
from public.participant_wellness_checkins;

select
  id,
  workspace_id,
  program_id,
  supported_person_id,
  checkin_date,
  overall_day,
  status,
  created_by
from public.participant_wellness_checkins
order by created_at;

-- ============================================================
-- SECTION 1: PERSON D POSITIVE TESTS
-- Run while signed in as Person D.
-- ============================================================

-- D1. Confirm Person D can resolve own supported-person row.
select
  id,
  workspace_id,
  auth_user_id,
  display_name,
  preferred_name,
  status
from public.supported_people
where id = '71000000-0000-4000-8000-000000000009'::uuid;

-- D2. Insert own same-day check-in.
insert into public.participant_wellness_checkins (
  workspace_id,
  program_id,
  supported_person_id,
  checkin_date,
  overall_day,
  stress,
  sleep,
  energy,
  confidence,
  routine,
  recovery_support,
  support_needed,
  chosen_next_step,
  participant_note,
  status,
  created_by
)
values (
  '71000000-0000-4000-8000-000000000001'::uuid,
  '71000000-0000-4000-8000-000000000002'::uuid,
  '71000000-0000-4000-8000-000000000009'::uuid,
  current_date,
  'okay',
  'okay',
  'good',
  'okay',
  'okay',
  'mixed',
  'connected',
  'no',
  'review_today_plan',
  'Synthetic Person D Wellness test entry.',
  'active',
  auth.uid()
)
returning
  id,
  supported_person_id,
  checkin_date,
  overall_day,
  status,
  created_by;

-- D3. Read own row.
select
  id,
  supported_person_id,
  checkin_date,
  overall_day,
  stress,
  sleep,
  energy,
  confidence,
  routine,
  recovery_support,
  support_needed,
  chosen_next_step,
  participant_note,
  status,
  created_by
from public.participant_wellness_checkins
order by created_at desc;

-- D4. Update own same-day row.
update public.participant_wellness_checkins
set
  overall_day = 'good',
  energy = 'good',
  chosen_next_step = 'choose_one_task',
  participant_note = 'Synthetic Person D Wellness test entry updated.'
where supported_person_id = '71000000-0000-4000-8000-000000000009'::uuid
  and checkin_date = current_date
  and status = 'active'
returning
  id,
  overall_day,
  energy,
  chosen_next_step,
  participant_note,
  updated_at;

-- ============================================================
-- SECTION 2: PERSON D NEGATIVE TESTS
-- Run while signed in as Person D.
-- Each statement should fail.
-- Run one at a time.
-- ============================================================

-- D5. Duplicate active same-day check-in should fail.
insert into public.participant_wellness_checkins (
  workspace_id,
  program_id,
  supported_person_id,
  overall_day,
  status,
  created_by
)
values (
  '71000000-0000-4000-8000-000000000001'::uuid,
  '71000000-0000-4000-8000-000000000002'::uuid,
  '71000000-0000-4000-8000-000000000009'::uuid,
  'okay',
  'active',
  auth.uid()
);

-- D6. Insert for Person A should fail.
insert into public.participant_wellness_checkins (
  workspace_id,
  program_id,
  supported_person_id,
  overall_day,
  status,
  created_by
)
values (
  '71000000-0000-4000-8000-000000000001'::uuid,
  '71000000-0000-4000-8000-000000000002'::uuid,
  '71000000-0000-4000-8000-000000000003'::uuid,
  'okay',
  'active',
  auth.uid()
);

-- D7. Archive own check-in should fail.
update public.participant_wellness_checkins
set
  status = 'archived',
  archived_at = now()
where supported_person_id = '71000000-0000-4000-8000-000000000009'::uuid
  and checkin_date = current_date
  and status = 'active';

-- D8. Change workspace scope should fail.
update public.participant_wellness_checkins
set workspace_id = gen_random_uuid()
where supported_person_id = '71000000-0000-4000-8000-000000000009'::uuid
  and checkin_date = current_date
  and status = 'active';

-- D9. Change program scope should fail.
update public.participant_wellness_checkins
set program_id = gen_random_uuid()
where supported_person_id = '71000000-0000-4000-8000-000000000009'::uuid
  and checkin_date = current_date
  and status = 'active';

-- D10. Change supported person should fail.
update public.participant_wellness_checkins
set supported_person_id = '71000000-0000-4000-8000-000000000003'::uuid
where supported_person_id = '71000000-0000-4000-8000-000000000009'::uuid
  and checkin_date = current_date
  and status = 'active';

-- D11. Change creator should fail.
update public.participant_wellness_checkins
set created_by = gen_random_uuid()
where supported_person_id = '71000000-0000-4000-8000-000000000009'::uuid
  and checkin_date = current_date
  and status = 'active';

-- D12. Read Person A rows should return zero.
select *
from public.participant_wellness_checkins
where supported_person_id = '71000000-0000-4000-8000-000000000003'::uuid;

-- ============================================================
-- SECTION 3: PERSON A ISOLATION TESTS
-- Run while signed in as Person A.
-- ============================================================

-- A1. Person A should not see Person D row.
select *
from public.participant_wellness_checkins
where supported_person_id = '71000000-0000-4000-8000-000000000009'::uuid;

-- A2. Person A update of Person D row should affect zero rows.
update public.participant_wellness_checkins
set participant_note = 'This should not be allowed.'
where supported_person_id = '71000000-0000-4000-8000-000000000009'::uuid
returning id;

-- ============================================================
-- SECTION 4: OUTSIDER TESTS
-- Run while signed in as outsider.
-- ============================================================

-- O1. Outsider select should return zero rows.
select *
from public.participant_wellness_checkins;

-- O2. Outsider insert should fail.
insert into public.participant_wellness_checkins (
  workspace_id,
  program_id,
  supported_person_id,
  overall_day,
  status,
  created_by
)
values (
  '71000000-0000-4000-8000-000000000001'::uuid,
  '71000000-0000-4000-8000-000000000002'::uuid,
  '71000000-0000-4000-8000-000000000009'::uuid,
  'okay',
  'active',
  auth.uid()
);

-- O3. Outsider update should affect zero rows or fail.
update public.participant_wellness_checkins
set participant_note = 'Outsider update attempt.'
where supported_person_id = '71000000-0000-4000-8000-000000000009'::uuid
returning id;

-- ============================================================
-- SECTION 5: WORKSPACE ADMIN TESTS
-- Run while signed in as workspace admin.
-- ============================================================

-- ADM1. Admin can read Person D row.
select
  id,
  workspace_id,
  program_id,
  supported_person_id,
  checkin_date,
  overall_day,
  status,
  created_by
from public.participant_wellness_checkins
where supported_person_id = '71000000-0000-4000-8000-000000000009'::uuid;

-- ADM2. Admin archives Person D row.
update public.participant_wellness_checkins
set status = 'archived'
where supported_person_id = '71000000-0000-4000-8000-000000000009'::uuid
  and checkin_date = current_date
  and status = 'active'
returning
  id,
  status,
  archived_at,
  updated_at;

-- ADM3. Admin cannot move row to another workspace.
update public.participant_wellness_checkins
set workspace_id = gen_random_uuid()
where supported_person_id = '71000000-0000-4000-8000-000000000009'::uuid
  and checkin_date = current_date
returning id;

-- ADM4. Admin cannot move row to another program.
update public.participant_wellness_checkins
set program_id = gen_random_uuid()
where supported_person_id = '71000000-0000-4000-8000-000000000009'::uuid
  and checkin_date = current_date
returning id;

-- ADM5. Admin cannot move row to another supported person.
update public.participant_wellness_checkins
set supported_person_id = '71000000-0000-4000-8000-000000000003'::uuid
where supported_person_id = '71000000-0000-4000-8000-000000000009'::uuid
  and checkin_date = current_date
returning id;

-- ============================================================
-- SECTION 6: POST-TEST REVIEW
-- Run as postgres or workspace admin.
-- ============================================================

select
  id,
  workspace_id,
  program_id,
  supported_person_id,
  checkin_date,
  overall_day,
  stress,
  sleep,
  energy,
  confidence,
  routine,
  recovery_support,
  support_needed,
  chosen_next_step,
  participant_note,
  status,
  created_by,
  created_at,
  updated_at,
  archived_at
from public.participant_wellness_checkins
order by created_at;

-- Expected final state:
-- - one synthetic Person D row
-- - status archived
-- - archived_at populated
-- - no Person A row
-- - no outsider row
