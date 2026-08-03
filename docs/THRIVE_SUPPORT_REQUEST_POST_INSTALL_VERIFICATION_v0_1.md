# THRIVE Support Request Post-Install Verification v0.1

## Status

Read-only verification package.

Do not run until the Support install candidate has received explicit approval
and has completed successfully.

## Frozen boundaries

This verification does not authorize:

- participant Support use;
- synthetic data creation;
- Johnny activation;
- notifications;
- emergency workflows;
- Trust Engine synchronization;
- deployment;
- service-role client use;
- push or merge.

## 1. Table and RLS verification

```sql
select
  n.nspname as table_schema,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n
  on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'support_requests',
    'support_request_entries',
    'support_request_links',
    'support_request_status_events'
  )
order by c.relname;
```

Expected:

- four rows;
- `rls_enabled = true`;
- `rls_forced = true`.

## 2. Column verification

```sql
select
  table_name,
  ordinal_position,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'support_requests',
    'support_request_entries',
    'support_request_links',
    'support_request_status_events'
  )
order by table_name, ordinal_position;
```

## 3. Constraint verification

```sql
select
  conrelid::regclass::text as table_name,
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
from pg_constraint
where connamespace = 'public'::regnamespace
  and conrelid in (
    'public.support_requests'::regclass,
    'public.support_request_entries'::regclass,
    'public.support_request_links'::regclass,
    'public.support_request_status_events'::regclass
  )
order by table_name, constraint_name;
```

Confirm:

- scoped foreign keys;
- category and status checks;
- text-length checks;
- exactly-one-link-target check;
- archive consistency checks;
- no cascade delete.

## 4. Function verification

```sql
select
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n
  on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'is_support_reviewer',
    'set_support_request_updated_at',
    'validate_support_assignment',
    'protect_support_request_scope_and_lifecycle',
    'record_support_request_events',
    'protect_support_entry_immutability',
    'validate_support_link_scope',
    'protect_support_link_archive',
    'record_support_child_archive_event',
    'prevent_support_status_event_mutation',
    'prevent_support_hard_delete'
  )
order by p.proname;
```

Expected: eleven functions.

## 5. Trigger verification

```sql
select
  event_object_table as table_name,
  trigger_name,
  action_timing,
  event_manipulation,
  action_statement
from information_schema.triggers
where trigger_schema = 'public'
  and event_object_table in (
    'support_requests',
    'support_request_entries',
    'support_request_links',
    'support_request_status_events'
  )
order by event_object_table, trigger_name, event_manipulation;
```

Confirm:

- lifecycle and scope protection;
- assignment validation;
- updated-at behavior;
- event recording;
- entry and link archive protection;
- status-event immutability;
- hard-delete prevention.

## 6. Policy verification

```sql
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'support_requests',
    'support_request_entries',
    'support_request_links',
    'support_request_status_events'
  )
order by tablename, policyname;
```

Confirm:

- participant self-select and insert;
- participant withdrawal only;
- participant-visible entry and event reads;
- reviewer reads and controlled updates;
- no DELETE policy;
- no participant entry insert;
- no direct status-event insert.

## 7. Privilege verification

```sql
select
  table_name,
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in (
    'support_requests',
    'support_request_entries',
    'support_request_links',
    'support_request_status_events'
  )
order by table_name, grantee, privilege_type;
```

Confirm:

- no `anon` privileges;
- `authenticated` has only the intended table privileges.

## 8. Existing-schema preservation

```sql
select
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'supported_people',
    'programs',
    'program_participants',
    'participant_goals',
    'participant_wellness_checkins',
    'participant_budget_periods',
    'budget_categories',
    'staged_financial_transactions',
    'financial_source_owners'
  )
order by table_name;
```

Expected: all existing source tables remain.

## 9. Empty-state verification

```sql
select 'support_requests' as object_name, count(*) as row_count
from public.support_requests
union all
select 'support_request_entries', count(*)
from public.support_request_entries
union all
select 'support_request_links', count(*)
from public.support_request_links
union all
select 'support_request_status_events', count(*)
from public.support_request_status_events;
```

Expected immediately after installation: zero rows in all four tables.

## Closeout requirement

Record:

- installation timestamp;
- exact SQL candidate path;
- executing database role;
- verification results;
- any discrepancies;
- confirmation that no synthetic or real participant rows were created.

## Exact next gate

Only after every verification passes may authenticated synthetic testing be
considered for separate execution approval.
