-- THRIVE Resources / Guided Reference
-- Review-only admin creation / activation RPC candidate v0.1
-- Date: 2026-08-24
-- Repository: thrive-stability-platform
-- Branch: main
--
-- IMPORTANT
-- REVIEW-ONLY CANDIDATE. DO NOT EXECUTE.
--
-- Purpose:
-- Solve the global-resource bootstrap problem without granting broad raw INSERT
-- privileges to authenticated users.
--
-- Frozen product rules preserved here:
-- - canonical resources are global DSS records
-- - visibility is workspace/program scoped
-- - DSS admin only may verify/activate in v0.1
-- - participant visibility never establishes eligibility, recommendation, diagnosis,
--   support priority, legal authority, clinical authority, fiduciary authority,
--   or Trust Engine authority
-- - no hard deletes
-- - Support bridge remains participant-initiated

begin;

-- ---------------------------------------------------------------------------
-- RPC 1: create a canonical resource draft with an explicit workspace anchor
-- ---------------------------------------------------------------------------
--
-- This function creates only a DRAFT resource plus its first visibility mapping.
-- It does not activate the resource for participants.
--
-- Why this exists:
-- A new global canonical resource has no workspace_id of its own. The explicit
-- p_workspace_id supplied to this RPC creates the authority anchor and must pass
-- is_workspace_admin(p_workspace_id) before anything is written.

create or replace function public.admin_create_resource_draft(
  p_workspace_id uuid,
  p_program_id uuid default null,
  p_scope_type text default 'workspace',
  p_resource_name text default null,
  p_resource_slug text default null,
  p_category text default null,
  p_subcategory text default null,
  p_plain_language_purpose text default null,
  p_participant_boundary_note text default null,
  p_country_code text default null,
  p_state_code text default null,
  p_county_name text default null,
  p_service_area_text text default null,
  p_audience_text text default null,
  p_verification_cadence text default 'moderate'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_resource_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_workspace_admin(p_workspace_id) then
    raise exception 'Workspace admin authority required';
  end if;

  if p_scope_type not in ('workspace', 'program') then
    raise exception 'Invalid resource visibility scope';
  end if;

  if p_scope_type = 'workspace' and p_program_id is not null then
    raise exception 'Workspace visibility cannot include program_id';
  end if;

  if p_scope_type = 'program' then
    if p_program_id is null then
      raise exception 'Program visibility requires program_id';
    end if;

    if not public.is_program_in_workspace(p_program_id, p_workspace_id) then
      raise exception 'Program is not active in workspace';
    end if;
  end if;

  if nullif(btrim(p_resource_name), '') is null then
    raise exception 'Resource name is required';
  end if;

  if nullif(btrim(p_resource_slug), '') is null then
    raise exception 'Resource slug is required';
  end if;

  if nullif(btrim(p_plain_language_purpose), '') is null then
    raise exception 'Plain-language purpose is required';
  end if;

  insert into public.resources (
    resource_name,
    resource_slug,
    category,
    subcategory,
    plain_language_purpose,
    participant_boundary_note,
    country_code,
    state_code,
    county_name,
    service_area_text,
    audience_text,
    verification_cadence,
    status,
    created_by
  ) values (
    btrim(p_resource_name),
    btrim(p_resource_slug),
    p_category,
    nullif(btrim(p_subcategory), ''),
    btrim(p_plain_language_purpose),
    nullif(btrim(p_participant_boundary_note), ''),
    p_country_code,
    p_state_code,
    nullif(btrim(p_county_name), ''),
    nullif(btrim(p_service_area_text), ''),
    nullif(btrim(p_audience_text), ''),
    p_verification_cadence,
    'draft',
    auth.uid()
  )
  returning id into v_resource_id;

  insert into public.resource_visibility (
    resource_id,
    workspace_id,
    program_id,
    scope_type,
    status,
    created_by
  ) values (
    v_resource_id,
    p_workspace_id,
    p_program_id,
    p_scope_type,
    'paused',
    auth.uid()
  );

  return v_resource_id;
end;
$$;

comment on function public.admin_create_resource_draft(
  uuid, uuid, text, text, text, text, text, text, text, text, text, text, text, text, text
) is
'Candidate admin-only RPC. Creates a global canonical resource in draft state and a paused workspace/program visibility mapping after verifying workspace-admin authority. Does not activate participant visibility.';

-- ---------------------------------------------------------------------------
-- RPC 2: add an organization and connect it to an existing draft resource
-- ---------------------------------------------------------------------------
--
-- This preserves the same explicit mapped-resource admin authority and avoids
-- general authenticated INSERT on resource_organizations.

create or replace function public.admin_add_resource_organization(
  p_resource_id uuid,
  p_organization_name text,
  p_organization_type text,
  p_official_website_url text default null,
  p_country_code text default null,
  p_role_type text default 'primary_authority',
  p_is_primary boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_organization_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.can_workspace_admin_manage_resource(p_resource_id) then
    raise exception 'Workspace admin authority required for this resource';
  end if;

  if nullif(btrim(p_organization_name), '') is null then
    raise exception 'Organization name is required';
  end if;

  select ro.id
    into v_organization_id
  from public.resource_organizations ro
  where lower(btrim(ro.organization_name)) = lower(btrim(p_organization_name))
    and ro.archived_at is null
  limit 1;

  if v_organization_id is null then
    insert into public.resource_organizations (
      organization_name,
      organization_type,
      official_website_url,
      country_code,
      status,
      created_by
    ) values (
      btrim(p_organization_name),
      p_organization_type,
      nullif(btrim(p_official_website_url), ''),
      p_country_code,
      'active',
      auth.uid()
    )
    returning id into v_organization_id;
  end if;

  insert into public.resource_organization_roles (
    resource_id,
    organization_id,
    role_type,
    is_primary,
    status,
    created_by
  ) values (
    p_resource_id,
    v_organization_id,
    p_role_type,
    p_is_primary,
    'active',
    auth.uid()
  )
  on conflict do nothing;

  return v_organization_id;
end;
$$;

comment on function public.admin_add_resource_organization(uuid, text, text, text, text, text, boolean) is
'Candidate admin-only RPC. Adds or reuses an outside organization and links it to a resource that the caller is authorized to manage.';

-- ---------------------------------------------------------------------------
-- RPC 3: activate a resource only after explicit verification
-- ---------------------------------------------------------------------------
--
-- Activation is separate from draft creation.
-- This function requires:
-- - workspace-admin authority through the resource visibility mapping
-- - resource currently draft or paused
-- - at least one verification record marked verified
-- - at least one active access path
-- - at least one active organization role
--
-- It does not decide whether the resource is appropriate for any participant.

create or replace function public.admin_activate_resource(
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
  v_visibility_id uuid;
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

  if v_resource_status not in ('draft', 'paused') then
    raise exception 'Resource is not in an activatable state';
  end if;

  select rv.id
    into v_visibility_id
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

  if v_visibility_id is null then
    raise exception 'Matching resource visibility mapping not found';
  end if;

  if p_program_id is not null
     and not public.is_program_in_workspace(p_program_id, p_workspace_id) then
    raise exception 'Program is not active in workspace';
  end if;

  if not exists (
    select 1
    from public.resource_verifications rvf
    where rvf.resource_id = p_resource_id
      and rvf.verification_status = 'verified'
      and rvf.verified_by = auth.uid()
  ) then
    raise exception 'A current admin verification record is required before activation';
  end if;

  if not exists (
    select 1
    from public.resource_access_paths rap
    where rap.resource_id = p_resource_id
      and rap.status = 'active'
      and rap.archived_at is null
  ) then
    raise exception 'At least one active official access path is required';
  end if;

  if not exists (
    select 1
    from public.resource_organization_roles ror
    where ror.resource_id = p_resource_id
      and ror.status = 'active'
      and ror.archived_at is null
  ) then
    raise exception 'At least one active organization role is required';
  end if;

  update public.resources
  set status = 'active',
      updated_at = now()
  where id = p_resource_id;

  update public.resource_visibility
  set status = 'active',
      updated_at = now()
  where id = v_visibility_id;
end;
$$;

comment on function public.admin_activate_resource(uuid, uuid, uuid) is
'Candidate admin-only activation RPC. Requires explicit workspace-admin authority, mapped visibility, a verified resource record, an active access path, and an active organization role before participant exposure.';

-- ---------------------------------------------------------------------------
-- RPC 4: pause participant exposure without deleting history
-- ---------------------------------------------------------------------------

create or replace function public.admin_pause_resource_visibility(
  p_resource_id uuid,
  p_workspace_id uuid,
  p_program_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_workspace_admin(p_workspace_id) then
    raise exception 'Workspace admin authority required';
  end if;

  update public.resource_visibility
  set status = 'paused',
      updated_at = now()
  where resource_id = p_resource_id
    and workspace_id = p_workspace_id
    and archived_at is null
    and (
      (p_program_id is null and scope_type = 'workspace' and program_id is null)
      or
      (p_program_id is not null and scope_type = 'program' and program_id = p_program_id)
    );

  if not found then
    raise exception 'Matching resource visibility mapping not found';
  end if;
end;
$$;

comment on function public.admin_pause_resource_visibility(uuid, uuid, uuid) is
'Candidate admin-only RPC for non-destructive pause of a resource visibility mapping.';

-- ---------------------------------------------------------------------------
-- Execute privileges candidate
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER alone is not sufficient. Every function performs explicit
-- auth/workspace-admin checks internally.
--
-- Installation candidate should revoke PUBLIC execute and grant authenticated
-- only after these functions are fully reviewed and tested.

revoke all on function public.admin_create_resource_draft(
  uuid, uuid, text, text, text, text, text, text, text, text, text, text, text, text, text
) from public;
revoke all on function public.admin_add_resource_organization(uuid, text, text, text, text, text, boolean) from public;
revoke all on function public.admin_activate_resource(uuid, uuid, uuid) from public;
revoke all on function public.admin_pause_resource_visibility(uuid, uuid, uuid) from public;

-- Candidate grants for later installation review:
grant execute on function public.admin_create_resource_draft(
  uuid, uuid, text, text, text, text, text, text, text, text, text, text, text, text, text
) to authenticated;
grant execute on function public.admin_add_resource_organization(uuid, text, text, text, text, text, boolean) to authenticated;
grant execute on function public.admin_activate_resource(uuid, uuid, uuid) to authenticated;
grant execute on function public.admin_pause_resource_visibility(uuid, uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Deliberate boundaries
-- ---------------------------------------------------------------------------
-- No participant-facing resource is activated during creation.
-- No automatic resource recommendation exists.
-- No demographic, financial, wellness, or bank fact triggers creation or exposure.
-- No Support request is created by these RPCs.
-- No eligibility determination is stored.
-- No clinical/legal/fiduciary conclusion is stored.
-- No hard delete exists.
-- No service-role access is introduced.
-- No Trust Engine synchronization exists.

-- ---------------------------------------------------------------------------
-- Candidate authenticated test matrix for later review
-- ---------------------------------------------------------------------------
-- ADMIN
-- [ ] workspace admin can create a resource draft anchored to own workspace
-- [ ] workspace admin cannot create draft anchored to another workspace
-- [ ] program scope requires active program in same workspace
-- [ ] create returns draft resource + paused visibility only
-- [ ] admin can add/reuse official organization for mapped resource
-- [ ] activation fails without verified verification record
-- [ ] activation fails without active access path
-- [ ] activation fails without active organization role
-- [ ] activation succeeds only for matching admin workspace visibility
-- [ ] pause hides visibility without deleting resource/history
--
-- SUPPORT NON-ADMIN
-- [ ] support member cannot create resource draft
-- [ ] support member cannot add canonical organization through RPC
-- [ ] support member cannot activate resource
-- [ ] support member cannot pause resource visibility
--
-- PARTICIPANT
-- [ ] participant cannot execute successful admin RPC actions
-- [ ] participant cannot create or activate canonical resource content
--
-- CROSS-WORKSPACE
-- [ ] workspace A admin cannot activate/pause workspace B mapping
--
-- AUDIT / TRUTH
-- [ ] created_by/verified_by remain auth.uid()
-- [ ] draft creation never implies verification
-- [ ] verification never implies participant eligibility or recommendation

rollback;

-- END REVIEW-ONLY ADMIN RPC CANDIDATE
