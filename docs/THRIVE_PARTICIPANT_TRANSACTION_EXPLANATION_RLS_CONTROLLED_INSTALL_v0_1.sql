-- THRIVE Participant Transaction Explanation RLS Controlled Install v0.1
-- DSS Enterprises / Renewing THRIVE
--
-- STATUS
-- Controlled executable installation package.
--
-- IMPORTANT
-- This file is prepared for review and later execution only.
-- Preparing this file does NOT authorize execution.
--
-- Scope:
-- 1. Install one narrow SECURITY DEFINER ownership-verification helper.
-- 2. Replace only participant_transaction_explanations_insert_self.
-- 3. Preserve the existing controlled participant financial-read architecture.
-- 4. Do not grant participant SELECT access to staged_financial_transactions.
--
-- Frozen boundaries:
-- - no Johnny activation
-- - no Trust Engine synchronization
-- - no service-role use
-- - no hard delete
-- - no staged transaction mutation
-- - no financial source ownership mutation
-- - no participant SELECT expansion on staged_financial_transactions
-- - no explanation INSERT retry in this installation package
-- - no deployment, merge, or push
--
-- Verified live basis before package preparation:
-- - participant_transaction_explanations_insert_self currently performs a direct
--   EXISTS join across financial_source_owners and staged_financial_transactions.
-- - staged_financial_transactions has no participant-self SELECT policy.
-- - financial_source_owners has an active participant-self SELECT policy.
-- - get_my_financial_transactions_v1() is STABLE SECURITY DEFINER.
-- - is_supported_person_self() is STABLE SECURITY DEFINER.
-- - is_program_participant_active() is SECURITY DEFINER.
--
-- ============================================================
-- PRE-INSTALL REVIEW QUERIES
-- Run and inspect these before executing the installation block.
-- They are read-only.
-- ============================================================

select
  p.proname as function_name,
  p.prosecdef as security_definer,
  pg_get_function_identity_arguments(p.oid) as arguments,
  pg_get_functiondef(p.oid) as function_definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'get_my_financial_transactions_v1',
    'is_supported_person_self',
    'is_program_participant_active',
    'is_owned_staged_transaction_for_self'
  )
order by p.proname;

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
    'participant_transaction_explanations',
    'financial_source_owners',
    'staged_financial_transactions'
  )
order by tablename, policyname;

-- Expected before install:
-- - is_owned_staged_transaction_for_self should not yet exist.
-- - participant_transaction_explanations_insert_self should still contain the
--   direct EXISTS join to staged_financial_transactions.
-- - staged_financial_transactions should still have no participant-self SELECT policy.

-- ============================================================
-- CONTROLLED INSTALLATION BLOCK
-- Execute only after separate explicit install approval.
-- ============================================================

begin;

create or replace function public.is_owned_staged_transaction_for_self(
  p_supported_person_id uuid,
  p_staged_transaction_id uuid,
  p_workspace_id uuid,
  p_program_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select
    public.is_supported_person_self(p_supported_person_id)
    and public.is_program_participant_active(
      p_supported_person_id,
      p_program_id,
      p_workspace_id
    )
    and exists (
      select 1
      from public.financial_source_owners fso
      join public.staged_financial_transactions sft
        on sft.financial_source_id = fso.financial_source_id
       and sft.workspace_id = fso.workspace_id
       and sft.program_id = fso.program_id
      where fso.supported_person_id = p_supported_person_id
        and fso.workspace_id = p_workspace_id
        and fso.program_id = p_program_id
        and fso.status = 'active'
        and sft.id = p_staged_transaction_id
    );
$function$;

comment on function public.is_owned_staged_transaction_for_self(
  uuid,
  uuid,
  uuid,
  uuid
)
is
'Returns true only when the authenticated supported person actively owns the exact staged financial transaction within the exact workspace and program. Read-only authorization helper for participant transaction explanations.';

revoke all
on function public.is_owned_staged_transaction_for_self(
  uuid,
  uuid,
  uuid,
  uuid
)
from public;

revoke all
on function public.is_owned_staged_transaction_for_self(
  uuid,
  uuid,
  uuid,
  uuid
)
from anon;

grant execute
on function public.is_owned_staged_transaction_for_self(
  uuid,
  uuid,
  uuid,
  uuid
)
to authenticated;

drop policy if exists participant_transaction_explanations_insert_self
  on public.participant_transaction_explanations;

create policy participant_transaction_explanations_insert_self
  on public.participant_transaction_explanations
  for insert
  to authenticated
  with check (
    submitted_by = auth.uid()
    and public.is_supported_person_self(supported_person_id)
    and public.is_program_participant_active(
      supported_person_id,
      program_id,
      workspace_id
    )
    and public.is_owned_staged_transaction_for_self(
      supported_person_id,
      staged_transaction_id,
      workspace_id,
      program_id
    )
  );

commit;

-- ============================================================
-- POST-INSTALL VERIFICATION
-- Read-only. Run immediately after installation.
-- ============================================================

-- 1. Confirm helper exists and remains SECURITY DEFINER with public search_path.
select
  p.proname as function_name,
  p.prosecdef as security_definer,
  pg_get_function_identity_arguments(p.oid) as arguments,
  pg_get_functiondef(p.oid) as function_definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'is_owned_staged_transaction_for_self';

-- Expected:
-- - exactly one function
-- - security_definer = true
-- - STABLE SECURITY DEFINER
-- - SET search_path TO 'public'

-- 2. Confirm helper EXECUTE grants.
select
  routine_name,
  grantee,
  privilege_type
from information_schema.role_routine_grants
where specific_schema = 'public'
  and routine_name = 'is_owned_staged_transaction_for_self'
order by grantee, privilege_type;

-- Expected application grant:
-- - authenticated / EXECUTE
--
-- Expected absence:
-- - anon / EXECUTE
-- - PUBLIC / EXECUTE

-- 3. Confirm the replacement INSERT policy.
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
  and tablename = 'participant_transaction_explanations'
  and policyname = 'participant_transaction_explanations_insert_self';

-- Expected:
-- - INSERT
-- - authenticated
-- - submitted_by = auth.uid()
-- - is_supported_person_self(...)
-- - is_program_participant_active(...)
-- - is_owned_staged_transaction_for_self(...)
-- - no direct join to staged_financial_transactions in the policy expression

-- 4. Confirm staged transaction RLS was not broadened.
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
  and tablename = 'staged_financial_transactions'
order by policyname;

-- Expected:
-- - existing admin policies only
-- - no participant-self SELECT policy

-- 5. Confirm participant explanation table remains RLS-enabled.
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as force_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'participant_transaction_explanations';

-- Expected:
-- - rls_enabled = true

-- ============================================================
-- AUTHENTICATED SYNTHETIC PROOF GATE
-- DO NOT RUN AS PART OF INSTALLATION.
-- ============================================================
--
-- After the install is separately verified, return to the browser-authenticated
-- Participant D harness.
--
-- Keep:
--
-- const TRANSACTION_EXPLANATION_TEST_EXECUTION_ENABLED = false as const;
--
-- until a separate synthetic proof approval is given.
--
-- The later browser proof sequence remains:
-- 1. Load Participant D identity.
-- 2. Read the exact staged transaction baseline.
-- 3. Create one draft explanation.
-- 4. Read the draft explanation.
-- 5. Edit only draft category/text.
-- 6. Re-read the draft.
-- 7. Verify the staged transaction remains unchanged.
--
-- Do not perform that proof from SQL Editor because the intended validation is
-- the normal browser-authenticated participant path.

-- ============================================================
-- RECOVERY / ROLLBACK PACKAGE
-- DO NOT RUN UNLESS A SEPARATE RECOVERY GATE IS APPROVED.
-- ============================================================
--
-- Purpose:
-- Restore the exact pre-install participant INSERT policy and remove the new
-- helper if installation verification reveals an unexpected discrepancy.
--
-- begin;
--
-- drop policy if exists participant_transaction_explanations_insert_self
--   on public.participant_transaction_explanations;
--
-- create policy participant_transaction_explanations_insert_self
--   on public.participant_transaction_explanations
--   for insert
--   to authenticated
--   with check (
--     submitted_by = auth.uid()
--     and public.is_supported_person_self(supported_person_id)
--     and public.is_program_participant_active(
--       supported_person_id,
--       program_id,
--       workspace_id
--     )
--     and exists (
--       select 1
--       from public.financial_source_owners fso
--       join public.staged_financial_transactions sft
--         on sft.financial_source_id = fso.financial_source_id
--        and sft.workspace_id = fso.workspace_id
--        and sft.program_id = fso.program_id
--       where fso.supported_person_id =
--               participant_transaction_explanations.supported_person_id
--         and fso.workspace_id =
--               participant_transaction_explanations.workspace_id
--         and fso.program_id =
--               participant_transaction_explanations.program_id
--         and fso.status = 'active'
--         and sft.id =
--               participant_transaction_explanations.staged_transaction_id
--     )
--   );
--
-- drop function if exists public.is_owned_staged_transaction_for_self(
--   uuid,
--   uuid,
--   uuid,
--   uuid
-- );
--
-- commit;
--
-- After any recovery:
-- - re-run the read-only policy/function verification;
-- - keep the browser harness locked;
-- - document the discrepancy before any new candidate is prepared.

-- ============================================================
-- STOP CONDITIONS
-- ============================================================
--
-- Stop before execution if:
-- - live schema or policy state differs from the verified baseline;
-- - is_owned_staged_transaction_for_self already exists unexpectedly;
-- - the policy name differs;
-- - staged_financial_transactions has gained a participant-self SELECT policy;
-- - any install step requires service-role use;
-- - any broader schema/RLS change appears necessary.
--
-- Stop after installation and do not unlock the browser harness if:
-- - helper definition differs from this package;
-- - helper grants include anon or PUBLIC unexpectedly;
-- - replacement policy differs from this package;
-- - staged transaction RLS was broadened;
-- - explanation table RLS is no longer enabled;
-- - any unrelated database object changes.
