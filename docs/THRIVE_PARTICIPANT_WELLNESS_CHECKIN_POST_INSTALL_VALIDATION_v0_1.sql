-- THRIVE PARTICIPANT WELLNESS CHECK-IN POST-INSTALL VALIDATION v0.1
-- READ ONLY
--
-- Run only after the controlled installation candidate has been explicitly
-- approved and executed.

begin transaction read only;

-- 1. Table existence and columns.
select
  table_schema,
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'participant_wellness_checkins';

select
  ordinal_position,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'participant_wellness_checkins'
order by ordinal_position;

-- 2. Constraints.
select
  conname as constraint_name,
  case contype
    when 'p' then 'primary key'
    when 'u' then 'unique'
    when 'f' then 'foreign key'
    when 'c' then 'check'
    else contype::text
  end as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
from pg_constraint
where conrelid = 'public.participant_wellness_checkins'::regclass
order by constraint_type, constraint_name;

-- 3. Indexes.
select
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'participant_wellness_checkins'
order by indexname;

-- 4. Trigger.
select
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
from information_schema.triggers
where event_object_schema = 'public'
  and event_object_table = 'participant_wellness_checkins'
order by trigger_name, event_manipulation;

-- 5. RLS state.
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'participant_wellness_checkins';

-- 6. Policies.
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'participant_wellness_checkins'
order by policyname;

-- 7. Grants.
select
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'participant_wellness_checkins'
order by grantee, privilege_type;

-- 8. Confirm no records were inserted by installation.
select count(*) as wellness_record_count
from public.participant_wellness_checkins;

rollback;
