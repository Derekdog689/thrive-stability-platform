-- THRIVE Participant Transaction Explanation RLS Correction Candidate v0.1
-- REVIEW ONLY. DO NOT EXECUTE WITHOUT SEPARATE APPROVAL.
--
-- Purpose:
-- Preserve the existing controlled participant financial-read architecture while
-- allowing participant_transaction_explanations INSERT policy to verify exact
-- ownership without granting direct participant SELECT access to
-- staged_financial_transactions.
--
-- Frozen boundaries:
-- - no Johnny activation
-- - no Trust Engine synchronization
-- - no service-role use
-- - no hard delete
-- - no staged transaction mutation
-- - no participant SELECT expansion on staged_financial_transactions
-- - no execution authorized by this file

begin;

-- ============================================================
-- 1. NARROW BOOLEAN OWNERSHIP HELPER
-- ============================================================

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

comment on function public.is_owned_staged_transaction_for_self(uuid, uuid, uuid, uuid)
is 'Returns true only when the authenticated supported person actively owns the exact staged financial transaction within the exact workspace and program. Read-only authorization helper for participant transaction explanations.';

revoke all on function public.is_owned_staged_transaction_for_self(uuid, uuid, uuid, uuid) from public;
revoke all on function public.is_owned_staged_transaction_for_self(uuid, uuid, uuid, uuid) from anon;
grant execute on function public.is_owned_staged_transaction_for_self(uuid, uuid, uuid, uuid) to authenticated;

-- ============================================================
-- 2. MINIMAL PARTICIPANT INSERT POLICY REPLACEMENT
-- ============================================================

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

-- ============================================================
-- 3. REVIEW / POST-INSTALL VERIFICATION QUERIES
-- ============================================================

select
  p.proname as function_name,
  p.prosecdef as security_definer,
  pg_get_function_identity_arguments(p.oid) as arguments,
  pg_get_functiondef(p.oid) as function_definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'is_owned_staged_transaction_for_self';

select
  routine_name,
  privilege_type,
  grantee
from information_schema.role_routine_grants
where specific_schema = 'public'
  and routine_name = 'is_owned_staged_transaction_for_self'
order by grantee, privilege_type;

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

select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual
from pg_policies
where schemaname = 'public'
  and tablename = 'staged_financial_transactions'
order by policyname;

-- ============================================================
-- 4. SYNTHETIC BOOLEAN PROBE
-- ============================================================
-- Expected Participant D result after separate approval and installation:
--
-- select public.is_owned_staged_transaction_for_self(
--   '71000000-0000-4000-8000-000000000009'::uuid,
--   '72000000-0000-4000-8000-000000000003'::uuid,
--   '71000000-0000-4000-8000-000000000001'::uuid,
--   '71000000-0000-4000-8000-000000000002'::uuid
-- );

-- ============================================================
-- 5. STOP CONDITIONS
-- ============================================================
-- Stop and reconcile before any participant INSERT retry if:
-- - helper does not return the expected result under Participant D auth;
-- - policy installation differs from this candidate;
-- - direct participant SELECT on staged_financial_transactions becomes necessary;
-- - schema or ownership relationships differ from the verified live state;
-- - service-role access appears necessary;
-- - any staged transaction row changes;
-- - any boundary outside this candidate is implicated.

rollback;

-- This candidate intentionally ends in ROLLBACK.
-- It is not an executable migration package.
