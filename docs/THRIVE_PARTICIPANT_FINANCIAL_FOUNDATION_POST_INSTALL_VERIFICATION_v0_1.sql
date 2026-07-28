-- THRIVE PARTICIPANT FINANCIAL FOUNDATION POST-INSTALL VERIFICATION v0.1
-- READ-ONLY

begin transaction read only;

-- 1. Confirm tables
select
  to_regclass('public.financial_source_owners') as ownership_table,
  to_regclass('public.participant_transaction_explanations') as explanation_table,
  to_regclass('public.participant_budget_periods') as budget_period_table,
  to_regclass('public.participant_budget_lines') as budget_line_table;

-- 2. Confirm participant read functions
select
  p.proname as function_name,
  p.prosecdef as security_definer,
  has_function_privilege(
    'authenticated',
    p.oid,
    'EXECUTE'
  ) as authenticated_can_execute
from pg_proc p
join pg_namespace n
  on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'get_my_financial_sources_v1',
    'get_my_financial_batches_v1',
    'get_my_financial_transactions_v1'
  )
order by p.proname;

-- 3. Confirm RLS
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n
  on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'financial_source_owners',
    'participant_transaction_explanations',
    'participant_budget_periods',
    'participant_budget_lines'
  )
order by c.relname;

-- 4. Confirm policies
select
  tablename,
  policyname,
  cmd,
  roles,
  permissive
from pg_policies
where schemaname = 'public'
  and tablename in (
    'financial_source_owners',
    'participant_transaction_explanations',
    'participant_budget_periods',
    'participant_budget_lines'
  )
order by tablename, cmd, policyname;

-- 5. Confirm triggers
select
  event_object_table as table_name,
  trigger_name,
  action_timing,
  event_manipulation
from information_schema.triggers
where trigger_schema = 'public'
  and event_object_table in (
    'financial_source_owners',
    'participant_transaction_explanations',
    'participant_budget_periods',
    'participant_budget_lines'
  )
order by event_object_table, trigger_name;

-- 6. Confirm empty initial state
select 'financial_source_owners' as object_name, count(*) as row_count
from public.financial_source_owners
union all
select 'participant_transaction_explanations', count(*)
from public.participant_transaction_explanations
union all
select 'participant_budget_periods', count(*)
from public.participant_budget_periods
union all
select 'participant_budget_lines', count(*)
from public.participant_budget_lines
order by object_name;

rollback;
