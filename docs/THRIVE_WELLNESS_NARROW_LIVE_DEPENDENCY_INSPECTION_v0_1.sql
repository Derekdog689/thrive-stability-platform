-- THRIVE WELLNESS NARROW LIVE DEPENDENCY INSPECTION v0.1
-- READ ONLY
--
-- Purpose:
-- 1. Inspect parent primary and unique constraints.
-- 2. Inspect existing auth and workspace helper functions.
-- 3. Inspect current program-participant RLS policies and referenced helpers.
--
-- This script does not create, alter, insert, update, delete, grant, or revoke.

begin transaction read only;

-- ============================================================
-- 1. PARENT PRIMARY, UNIQUE, AND FOREIGN-KEY CONSTRAINTS
-- ============================================================

select
  conrelid::regclass::text as table_name,
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
where connamespace = 'public'::regnamespace
  and conrelid in (
    'public.workspaces'::regclass,
    'public.programs'::regclass,
    'public.supported_people'::regclass,
    'public.program_participants'::regclass
  )
  and contype in ('p', 'u', 'f')
order by
  conrelid::regclass::text,
  case contype when 'p' then 1 when 'u' then 2 when 'f' then 3 else 4 end,
  conname;

-- Supporting indexes on the same parent tables.
select
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in (
    'workspaces',
    'programs',
    'supported_people',
    'program_participants'
  )
order by tablename, indexname;

-- ============================================================
-- 2. AUTH, IDENTITY, WORKSPACE, AND PARTICIPATION HELPERS
-- ============================================================

-- Function inventory by likely name and function body references.
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  pg_get_function_result(p.oid) as return_type,
  l.lanname as language_name,
  p.prosecdef as security_definer,
  p.provolatile as volatility,
  p.proacl as access_control
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
join pg_language l on l.oid = p.prolang
where n.nspname = 'public'
  and (
    p.proname ilike '%workspace%'
    or p.proname ilike '%admin%'
    or p.proname ilike '%participant%'
    or p.proname ilike '%supported_person%'
    or p.proname ilike '%auth%'
    or pg_get_functiondef(p.oid) ilike '%auth.uid()%'
    or pg_get_functiondef(p.oid) ilike '%program_participants%'
    or pg_get_functiondef(p.oid) ilike '%supported_people%'
  )
order by p.proname, identity_arguments;

-- Full definitions for likely authorization and participant-scope helpers.
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  pg_get_functiondef(p.oid) as function_definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and (
    p.proname ilike '%workspace%'
    or p.proname ilike '%admin%'
    or p.proname ilike '%participant%'
    or p.proname ilike '%supported_person%'
    or p.proname ilike '%auth%'
  )
order by p.proname, identity_arguments;

-- Grants for those functions.
select
  routine_schema,
  routine_name,
  grantee,
  privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and (
    routine_name ilike '%workspace%'
    or routine_name ilike '%admin%'
    or routine_name ilike '%participant%'
    or routine_name ilike '%supported_person%'
    or routine_name ilike '%auth%'
  )
order by routine_name, grantee, privilege_type;

-- ============================================================
-- 3. PROGRAM-PARTICIPANT RLS STATUS AND POLICIES
-- ============================================================

select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'program_participants',
    'programs',
    'supported_people'
  )
  and c.relkind = 'r'
order by c.relname;

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
  and tablename in (
    'program_participants',
    'programs',
    'supported_people'
  )
order by tablename, policyname;

-- ============================================================
-- 4. FUNCTIONS REFERENCED BY CURRENT POLICIES
-- ============================================================

-- This gives a compact searchable policy text list.
with policy_text as (
  select
    schemaname,
    tablename,
    policyname,
    coalesce(qual, '') || ' ' || coalesce(with_check, '') as expression_text
  from pg_policies
  where schemaname = 'public'
    and tablename in (
      'program_participants',
      'programs',
      'supported_people'
    )
)
select
  schemaname,
  tablename,
  policyname,
  expression_text
from policy_text
order by tablename, policyname;

-- Inventory public functions whose names appear in any selected policy text.
with policy_text as (
  select
    lower(coalesce(qual, '') || ' ' || coalesce(with_check, '')) as expression_text
  from pg_policies
  where schemaname = 'public'
    and tablename in (
      'program_participants',
      'programs',
      'supported_people'
    )
),
public_functions as (
  select
    p.oid,
    p.proname,
    pg_get_function_identity_arguments(p.oid) as identity_arguments
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
)
select distinct
  pf.proname as referenced_function_name,
  pf.identity_arguments,
  pg_get_functiondef(pf.oid) as function_definition
from public_functions pf
cross join policy_text pt
where pt.expression_text like '%' || lower(pf.proname) || '%'
order by pf.proname, pf.identity_arguments;

rollback;
