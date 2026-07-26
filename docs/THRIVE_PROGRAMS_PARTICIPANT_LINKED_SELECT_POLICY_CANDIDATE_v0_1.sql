-- THRIVE Programs Participant-Linked SELECT Policy Candidate v0.1
-- REVIEW ONLY
-- DO NOT EXECUTE
--
-- Purpose:
-- Permit an authenticated supported person to SELECT only program rows
-- connected to their own active participation.
--
-- This candidate does not grant workspace membership and does not modify
-- INSERT, UPDATE, or DELETE authority.

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
    join public.supported_people sp
      on sp.id = pp.supported_person_id
     and sp.workspace_id = pp.workspace_id
    where pp.program_id = programs.id
      and pp.workspace_id = programs.workspace_id
      and pp.status = 'active'
      and sp.status = 'active'
      and sp.auth_user_id = auth.uid()
  )
);

rollback;

-- Review notes:
--
-- 1. The rollback is intentional. This file is a candidate artifact only.
-- 2. Existing policy programs_select_for_workspace_members remains unchanged.
-- 3. Permissive SELECT policies combine with logical OR.
-- 4. The candidate performs no INSERT, UPDATE, DELETE, or membership grant.
-- 5. Before installation, inspect:
--    - current program_participants indexes;
--    - current supported_people indexes;
--    - exact lifecycle values;
--    - whether duplicate qualifying participations are possible;
--    - execution plan for the EXISTS lookup.
