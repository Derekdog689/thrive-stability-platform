-- THRIVE Resources / Guided Reference
-- Review-only resume visibility RPC candidate v0.1
-- Date: 2026-08-24
-- Repository: thrive-stability-platform
-- Branch: main
--
-- PURPOSE
-- Close the narrow lifecycle gap discovered during Slice A runtime validation:
-- an already-active canonical Resource with a paused workspace/program visibility
-- mapping needs a safe admin-only way to resume participant visibility without
-- re-running canonical activation or bypassing the installed authority model.
--
-- REVIEW ONLY. DO NOT EXECUTE WITHOUT EXPLICIT INSTALL APPROVAL.
--
-- Frozen boundaries:
-- - no new Resource rows
-- - no canonical Resource content/status edits
-- - no verification edits
-- - no organization/access-path/guidance edits
-- - no Support request creation
-- - no participant inference, eligibility, recommendation, or prioritization
-- - no service role
-- - no hard delete
-- - no Trust Engine work

begin;

create or replace function public.admin_resume_resource_visibility(
  p_resource_id uuid,
  p_workspace_id uuid,
  p_program_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_resource_status text;
  v_visibility_status text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_workspace_admin(p_workspace_id) then
    raise exception 'Workspace admin authority required';
  end if;

  select r.status
    into v_resource_status
  from public.resources r
  where r.id = p_resource_id
    and r.archived_at is null;

  if v_resource_status is null then
    raise exception 'Resource not found';
  end if;

  -- This RPC is intentionally narrower than canonical activation.
  -- It may only restore visibility for a Resource whose canonical lifecycle
  -- already remains active.
  if v_resource_status <> 'active' then
    raise exception 'Resource must already be active before visibility can resume';
  end if;

  select rv.status
    into v_visibility_status
  from public.resource_visibility rv
  where rv.resource_id = p_resource_id
    and rv.workspace_id = p_workspace_id
    and rv.archived_at is null
    and (
      (p_program_id is null and rv.scope_type = 'workspace' and rv.program_id is null)
      or
      (p_program_id is not null and rv.scope_type = 'program' and rv.program_id = p_program_id)
    )
  limit 1;

  if v_visibility_status is null then
    raise exception 'Matching resource visibility mapping not found';
  end if;

  if p_program_id is not null
     and not public.is_program_in_workspace(p_program_id, p_workspace_id) then
    raise exception 'Program is not active in workspace';
  end if;

  if v_visibility_status = 'active' then
    -- Idempotent success. Re-running the reviewed action should not create
    -- duplicate state or broaden authority.
    return;
  end if;

  if v_visibility_status <> 'paused' then
    raise exception 'Only paused resource visibility can be resumed';
  end if;

  update public.resource_visibility
  set status = 'active',
      updated_at = now()
  where resource_id = p_resource_id
    and workspace_id = p_workspace_id
    and archived_at is null
    and status = 'paused'
    and (
      (p_program_id is null and scope_type = 'workspace' and program_id is null)
      or
      (p_program_id is not null and scope_type = 'program' and program_id = p_program_id)
    );

  if not found then
    raise exception 'Paused resource visibility mapping was not updated';
  end if;
end;
$$;

comment on function public.admin_resume_resource_visibility(uuid, uuid, uuid) is
'Admin-only non-destructive lifecycle RPC. Resumes an existing paused workspace/program visibility mapping only when the canonical Resource is already active. Does not alter Resource content, verification, eligibility, recommendation, Support lifecycle, or Trust Engine authority.';

revoke all on function public.admin_resume_resource_visibility(uuid, uuid, uuid) from public;
grant execute on function public.admin_resume_resource_visibility(uuid, uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Candidate validation matrix
-- ---------------------------------------------------------------------------
-- ADMIN
-- [ ] workspace admin can resume own matching paused visibility for active Resource
-- [ ] repeated call while already active is idempotent success
-- [ ] admin cannot resume visibility for a non-active canonical Resource
-- [ ] admin cannot resume inactive/archived visibility through this RPC
-- [ ] workspace A admin cannot resume workspace B mapping
-- [ ] program-scoped resume requires active program in same workspace
--
-- SUPPORT / PARTICIPANT
-- [ ] support member denied
-- [ ] participant denied
--
-- CLOSEOUT
-- [ ] existing admin_pause_resource_visibility returns mapping to paused
-- [ ] canonical Resource/history/evidence remain preserved

rollback;

-- END REVIEW-ONLY CANDIDATE
