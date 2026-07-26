-- THRIVE Programs Participant-Linked SELECT Policy Candidate v0.3
-- FINAL STATIC-REVIEW CANDIDATE
-- DO NOT EXECUTE WITHOUT SEPARATE EXPLICIT APPROVAL
--
-- Purpose:
-- Permit an authenticated supported person to SELECT only program rows
-- connected to their own active participation.
--
-- Existing workspace-member SELECT policy remains unchanged.
-- This candidate grants no workspace membership and no INSERT, UPDATE,
-- DELETE, service-role, Trust Engine, or administrative authority.

begin;

create policy programs_select_for_linked_supported_people
on public.programs
as permissive
for select
to authenticated
using (
  exists (
    select 1
    from public.program_participants pp
    where pp.program_id = programs.id
      and pp.workspace_id = programs.workspace_id
      and pp.status = 'active'
      and public.is_supported_person_self(pp.supported_person_id)
  )
);

rollback;

-- FINAL STATIC REVIEW NOTES
--
-- 1. The rollback is intentional. This file is not an installation script.
-- 2. Existing policy programs_select_for_workspace_members remains unchanged.
-- 3. Permissive SELECT policies combine with logical OR.
-- 4. The candidate reuses public.is_supported_person_self(uuid).
-- 5. The helper is confirmed SECURITY DEFINER.
-- 6. The helper body is confirmed to require:
--      sp.id = p_supported_person_id
--      sp.auth_user_id = auth.uid()
--      sp.status = 'active'
-- 7. The helper references public.supported_people and auth.uid().
-- 8. The function search_path setting was not visible in the inspected UI.
--    Verify pg_proc.proconfig or the dashboard function settings before install.
-- 9. Existing index program_participants_scope_status_idx
--    (workspace_id, program_id, status) supports the correlated lookup.
-- 10. No new index is proposed.
-- 11. No policy installation is approved by this file.
