-- THRIVE Programs Participant-Linked SELECT Policy Candidate v0.2
-- REVIEW ONLY
-- DO NOT EXECUTE
--
-- Purpose:
-- Permit an authenticated supported person to SELECT only program rows
-- connected to their own active participation.
--
-- Existing workspace-member SELECT policy remains unchanged.
-- No workspace membership, INSERT, UPDATE, or DELETE authority is granted.

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
      and is_supported_person_self(pp.supported_person_id)
  )
);

rollback;

-- Static review notes:
--
-- 1. The rollback is intentional. This is a candidate artifact only.
-- 2. Existing programs_select_for_workspace_members remains unchanged.
-- 3. Permissive SELECT policies combine with logical OR.
-- 4. The candidate reuses the existing supported-person identity helper.
-- 5. Existing program_participants_scope_status_idx supports the lookup.
-- 6. Before installation, inspect the live definition and security mode of:
--      public.is_supported_person_self(uuid)
-- 7. Confirm the helper does not broaden authority beyond auth-linked self.
