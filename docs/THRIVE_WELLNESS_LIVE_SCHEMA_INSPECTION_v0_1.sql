-- THRIVE WELLNESS LIVE SCHEMA INSPECTION v0.1
-- READ ONLY
-- Run in Supabase SQL Editor as postgres or authenticated admin.
-- This script does not create, alter, insert, update, or delete anything.

begin transaction read only;

select table_schema, table_name, table_type
from information_schema.tables
where table_schema = 'public'
  and (
    table_name ilike '%wellness%'
    or table_name ilike '%checkin%'
    or table_name ilike '%check_in%'
    or table_name ilike '%reflection%'
    or table_name ilike '%mood%'
  )
order by table_schema, table_name;

select table_name, ordinal_position, column_name, data_type, is_nullable,
       column_default, is_generated, generation_expression
from information_schema.columns
where table_schema = 'public'
  and (
    table_name ilike '%wellness%'
    or table_name ilike '%checkin%'
    or table_name ilike '%check_in%'
    or table_name ilike '%reflection%'
    or table_name ilike '%mood%'
    or column_name ilike '%wellness%'
    or column_name ilike '%checkin%'
    or column_name ilike '%check_in%'
    or column_name ilike '%reflection%'
    or column_name ilike '%mood%'
  )
order by table_name, ordinal_position;

select conrelid::regclass::text as table_name,
       conname as constraint_name,
       contype as constraint_type,
       pg_get_constraintdef(oid) as constraint_definition
from pg_constraint
where connamespace = 'public'::regnamespace
  and (
    conrelid::regclass::text ilike '%wellness%'
    or conrelid::regclass::text ilike '%checkin%'
    or conrelid::regclass::text ilike '%check_in%'
    or conrelid::regclass::text ilike '%reflection%'
    or conrelid::regclass::text ilike '%mood%'
  )
order by table_name, constraint_name;

select tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and (
    tablename ilike '%wellness%'
    or tablename ilike '%checkin%'
    or tablename ilike '%check_in%'
    or tablename ilike '%reflection%'
    or tablename ilike '%mood%'
  )
order by tablename, indexname;

select n.nspname as schema_name,
       c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and (
    c.relname ilike '%wellness%'
    or c.relname ilike '%checkin%'
    or c.relname ilike '%check_in%'
    or c.relname ilike '%reflection%'
    or c.relname ilike '%mood%'
  )
order by c.relname;

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and (
    tablename ilike '%wellness%'
    or tablename ilike '%checkin%'
    or tablename ilike '%check_in%'
    or tablename ilike '%reflection%'
    or tablename ilike '%mood%'
  )
order by tablename, policyname;

select table_name, ordinal_position, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('supported_people', 'program_participants', 'programs', 'workspaces')
order by table_name, ordinal_position;

rollback;
