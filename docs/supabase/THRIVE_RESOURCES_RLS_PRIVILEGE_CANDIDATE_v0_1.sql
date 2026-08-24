-- THRIVE Resources / Guided Reference
-- Review-only RLS + privilege candidate v0.1
-- Date: 2026-08-24
-- Repository: thrive-stability-platform
-- Branch: main
--
-- IMPORTANT
-- This file is a REVIEW-ONLY candidate.
-- It must not be executed without explicit approval.
-- No seed data, UI implementation, automatic referral, external sharing,
-- service-role use, or Trust Engine synchronization is authorized here.
--
-- Governing product decisions already approved:
-- 1. global DSS canonical resource library + workspace/program visibility mappings
-- 2. flexible controlled guidance sections
-- 3. DSS admin only may verify/activate resources in v0.1
-- 4. participant-friendly frozen categories
-- 5. tiered reverification cadence
-- 6. participant-initiated, context-only Support bridge
--
-- Live permission primitives inspected read-only on 2026-08-24:
--   public.is_workspace_admin(workspace_id)
--   public.is_support_reviewer(workspace_id)
--   public.is_supported_person_self(supported_person_id)
--   public.is_program_participant_active(supported_person_id, program_id, workspace_id)
--   public.is_workspace_member(workspace_id)
--   public.is_program_in_workspace(program_id, workspace_id)
--   public.is_supported_person_in_workspace(supported_person_id, workspace_id)
--
-- Important distinction:
-- is_support_reviewer() currently includes admin + support.
-- v0.1 resource verification/activation is ADMIN-ONLY, so this candidate
-- intentionally does not use is_support_reviewer() for canonical resource writes.

begin;

-- ---------------------------------------------------------------------------
-- Expected tables from THRIVE_RESOURCES_SCHEMA_CANDIDATE_v0_1.sql
-- ---------------------------------------------------------------------------
-- public.resource_organizations
-- public.resources
-- public.resource_visibility
-- public.resource_organization_roles
-- public.resource_access_paths
-- public.resource_guidance_sections
-- public.resource_verifications
-- public.support_request_links extended with resource_id and optional resource_access_path_id
--
-- This candidate assumes those objects exist only for review purposes.

-- ---------------------------------------------------------------------------
-- Helper candidate: participant visibility check
-- ---------------------------------------------------------------------------
-- Purpose:
-- A participant may read an ACTIVE canonical resource only when an ACTIVE
-- visibility mapping matches either:
--   a) the participant's workspace; or
--   b) the participant's active program within that workspace.
--
-- The helper keeps visibility logic centralized and auditable.

create or replace function public.can_participant_read_resource(
  p_resource_id uuid,
  p_supported_person_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.resources r
    join public.resource_visibility rv
      on rv.resource_id = r.id
     and rv.status = 'active'
    join public.supported_people sp
      on sp.id = p_supported_person_id
     and sp.status = 'active'
    where r.id = p_resource_id
      and r.status = 'active'
      and public.is_supported_person_self(sp.id)
      and (
        (
          rv.scope_type = 'workspace'
          and rv.workspace_id = sp.workspace_id
          and rv.program_id is null
        )
        or
        (
          rv.scope_type = 'program'
          and rv.workspace_id = sp.workspace_id
          and rv.program_id is not null
          and public.is_program_participant_active(
            sp.id,
            rv.program_id,
            rv.workspace_id
          )
        )
      )
  );
$$;

comment on function public.can_participant_read_resource(uuid, uuid) is
'Candidate helper: returns true only when the signed-in supported person may read an active canonical resource through an active workspace/program visibility mapping. Does not establish eligibility, recommendation, diagnosis, or support priority.';

-- ---------------------------------------------------------------------------
-- Helper candidate: admin management scope
-- ---------------------------------------------------------------------------
-- Canonical resources are global, but activation must still be controlled by DSS
-- admins operating inside an authorized workspace context.
--
-- A visibility row gives us the workspace/program scope through which a global
-- canonical resource is exposed. This helper answers whether the current user is
-- an admin in at least one active workspace where the resource is visible.

create or replace function public.can_workspace_admin_manage_resource(
  p_resource_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.resource_visibility rv
    where rv.resource_id = p_resource_id
      and rv.status in ('active', 'paused')
      and public.is_workspace_admin(rv.workspace_id)
  );
$$;

comment on function public.can_workspace_admin_manage_resource(uuid) is
'Candidate helper: current user is an active workspace admin for at least one workspace where the global resource is mapped. Intended only for review of admin maintenance rules.';

-- ---------------------------------------------------------------------------
-- RLS enablement candidate
-- ---------------------------------------------------------------------------

alter table public.resource_organizations enable row level security;
alter table public.resources enable row level security;
alter table public.resource_visibility enable row level security;
alter table public.resource_organization_roles enable row level security;
alter table public.resource_access_paths enable row level security;
alter table public.resource_guidance_sections enable row level security;
alter table public.resource_verifications enable row level security;

-- Deliberately NOT forcing RLS yet.
-- Force-RLS should be reviewed separately at installation-candidate stage against
-- existing ownership/service-role conventions.

-- ---------------------------------------------------------------------------
-- Explicit privilege posture candidate
-- ---------------------------------------------------------------------------
-- Start from least privilege for authenticated users.

revoke all on table public.resource_organizations from authenticated;
revoke all on table public.resources from authenticated;
revoke all on table public.resource_visibility from authenticated;
revoke all on table public.resource_organization_roles from authenticated;
revoke all on table public.resource_access_paths from authenticated;
revoke all on table public.resource_guidance_sections from authenticated;
revoke all on table public.resource_verifications from authenticated;

-- Participants need SELECT only on participant-facing canonical content.
-- RLS decides which rows are visible.
grant select on table public.resources to authenticated;
grant select on table public.resource_access_paths to authenticated;
grant select on table public.resource_guidance_sections to authenticated;

-- resource_organizations may be participant-readable because source organization
-- identity is part of transparency. RLS below limits rows to organizations tied to
-- visible resources.
grant select on table public.resource_organizations to authenticated;
grant select on table public.resource_organization_roles to authenticated;

-- Visibility mappings are implementation detail. No general participant SELECT is
-- needed unless the UI later requires it directly.
-- Verification records are maintenance/audit detail and are not participant-facing
-- in v0.1.

-- Admin maintenance requires INSERT/UPDATE/SELECT through RLS.
-- No DELETE grants in MVP.
grant insert, update, select on table public.resource_organizations to authenticated;
grant insert, update, select on table public.resource_visibility to authenticated;
grant insert, update, select on table public.resource_verifications to authenticated;

-- These tables are both participant-readable and admin-maintained.
grant insert, update on table public.resources to authenticated;
grant insert, update on table public.resource_organization_roles to authenticated;
grant insert, update on table public.resource_access_paths to authenticated;
grant insert, update on table public.resource_guidance_sections to authenticated;

-- ---------------------------------------------------------------------------
-- resources policies
-- ---------------------------------------------------------------------------

-- Participant read: active resources only, with explicit visibility to self.
create policy resources_select_participant_visible
on public.resources
for select
to authenticated
using (
  status = 'active'
  and exists (
    select 1
    from public.supported_people sp
    where public.can_participant_read_resource(resources.id, sp.id)
  )
);

-- Admin read: workspace admin may inspect resources mapped to a workspace they
-- administer, including paused/inactive/draft records for maintenance review.
create policy resources_select_workspace_admins
on public.resources
for select
to authenticated
using (
  public.can_workspace_admin_manage_resource(resources.id)
);

-- Admin insert: canonical record starts non-participant-visible.
-- Global canonical rows have no workspace_id by design.
create policy resources_insert_admin_draft_only
on public.resources
for insert
to authenticated
with check (
  created_by = auth.uid()
  and status in ('draft', 'paused')
  and not exists (
    select 1
    from public.resource_visibility rv
    where rv.resource_id = resources.id
      and rv.status = 'active'
  )
);

-- NOTE:
-- The insert policy above cannot independently prove admin authority before a
-- visibility mapping exists. For installation, choose one of these explicit
-- approaches rather than weakening the rule:
--   A) create resource + visibility through an admin-only RPC/transaction; or
--   B) add an explicit global DSS-admin authority primitive.
--
-- This candidate RECOMMENDS option A for MVP because it reuses existing
-- workspace-admin authority and avoids inventing a new global role silently.
-- Therefore the raw INSERT policy should be replaced/removed if the admin RPC
-- approach is approved.

-- Admin update: mapped workspace admin only.
create policy resources_update_workspace_admins
on public.resources
for update
to authenticated
using (
  public.can_workspace_admin_manage_resource(resources.id)
)
with check (
  public.can_workspace_admin_manage_resource(resources.id)
);

-- ---------------------------------------------------------------------------
-- resource_visibility policies
-- ---------------------------------------------------------------------------

-- Admin-only SELECT/INSERT/UPDATE.
create policy resource_visibility_select_workspace_admins
on public.resource_visibility
for select
to authenticated
using (
  public.is_workspace_admin(workspace_id)
);

create policy resource_visibility_insert_workspace_admins
on public.resource_visibility
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.is_workspace_admin(workspace_id)
  and (
    (scope_type = 'workspace' and program_id is null)
    or
    (
      scope_type = 'program'
      and program_id is not null
      and public.is_program_in_workspace(program_id, workspace_id)
    )
  )
);

create policy resource_visibility_update_workspace_admins
on public.resource_visibility
for update
to authenticated
using (
  public.is_workspace_admin(workspace_id)
)
with check (
  public.is_workspace_admin(workspace_id)
  and (
    (scope_type = 'workspace' and program_id is null)
    or
    (
      scope_type = 'program'
      and program_id is not null
      and public.is_program_in_workspace(program_id, workspace_id)
    )
  )
);

-- ---------------------------------------------------------------------------
-- resource_access_paths participant/admin policies
-- ---------------------------------------------------------------------------

create policy resource_access_paths_select_participant_visible
on public.resource_access_paths
for select
to authenticated
using (
  status = 'active'
  and exists (
    select 1
    from public.supported_people sp
    where public.can_participant_read_resource(resource_access_paths.resource_id, sp.id)
  )
);

create policy resource_access_paths_select_workspace_admins
on public.resource_access_paths
for select
to authenticated
using (
  public.can_workspace_admin_manage_resource(resource_access_paths.resource_id)
);

create policy resource_access_paths_insert_workspace_admins
on public.resource_access_paths
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.can_workspace_admin_manage_resource(resource_access_paths.resource_id)
);

create policy resource_access_paths_update_workspace_admins
on public.resource_access_paths
for update
to authenticated
using (
  public.can_workspace_admin_manage_resource(resource_access_paths.resource_id)
)
with check (
  public.can_workspace_admin_manage_resource(resource_access_paths.resource_id)
);

-- ---------------------------------------------------------------------------
-- resource_guidance_sections participant/admin policies
-- ---------------------------------------------------------------------------

create policy resource_guidance_sections_select_participant_visible
on public.resource_guidance_sections
for select
to authenticated
using (
  status = 'active'
  and exists (
    select 1
    from public.supported_people sp
    where public.can_participant_read_resource(resource_guidance_sections.resource_id, sp.id)
  )
);

create policy resource_guidance_sections_select_workspace_admins
on public.resource_guidance_sections
for select
to authenticated
using (
  public.can_workspace_admin_manage_resource(resource_guidance_sections.resource_id)
);

create policy resource_guidance_sections_insert_workspace_admins
on public.resource_guidance_sections
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.can_workspace_admin_manage_resource(resource_guidance_sections.resource_id)
);

create policy resource_guidance_sections_update_workspace_admins
on public.resource_guidance_sections
for update
to authenticated
using (
  public.can_workspace_admin_manage_resource(resource_guidance_sections.resource_id)
)
with check (
  public.can_workspace_admin_manage_resource(resource_guidance_sections.resource_id)
);

-- ---------------------------------------------------------------------------
-- resource_organization_roles policies
-- ---------------------------------------------------------------------------

create policy resource_organization_roles_select_participant_visible
on public.resource_organization_roles
for select
to authenticated
using (
  status = 'active'
  and exists (
    select 1
    from public.supported_people sp
    where public.can_participant_read_resource(resource_organization_roles.resource_id, sp.id)
  )
);

create policy resource_organization_roles_select_workspace_admins
on public.resource_organization_roles
for select
to authenticated
using (
  public.can_workspace_admin_manage_resource(resource_organization_roles.resource_id)
);

create policy resource_organization_roles_insert_workspace_admins
on public.resource_organization_roles
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.can_workspace_admin_manage_resource(resource_organization_roles.resource_id)
);

create policy resource_organization_roles_update_workspace_admins
on public.resource_organization_roles
for update
to authenticated
using (
  public.can_workspace_admin_manage_resource(resource_organization_roles.resource_id)
)
with check (
  public.can_workspace_admin_manage_resource(resource_organization_roles.resource_id)
);

-- ---------------------------------------------------------------------------
-- resource_organizations policies
-- ---------------------------------------------------------------------------

-- Participant sees organizations only when they are tied through an active role to
-- a resource the participant can read.
create policy resource_organizations_select_participant_visible
on public.resource_organizations
for select
to authenticated
using (
  status = 'active'
  and exists (
    select 1
    from public.resource_organization_roles ror
    join public.supported_people sp on true
    where ror.organization_id = resource_organizations.id
      and ror.status = 'active'
      and public.can_participant_read_resource(ror.resource_id, sp.id)
  )
);

create policy resource_organizations_select_workspace_admins
on public.resource_organizations
for select
to authenticated
using (
  exists (
    select 1
    from public.resource_organization_roles ror
    where ror.organization_id = resource_organizations.id
      and public.can_workspace_admin_manage_resource(ror.resource_id)
  )
);

-- As with creating a brand-new canonical resource, a brand-new organization can
-- exist before it is linked to a mapped resource. Raw table INSERT cannot prove
-- workspace-admin authority without another scope anchor.
--
-- Recommendation: create organization/resource/role/visibility atomically through
-- one admin-only RPC/transaction. Do not loosen INSERT to every authenticated user.

-- No standalone INSERT policy is proposed here for resource_organizations until
-- the admin-only creation RPC candidate is reviewed.

create policy resource_organizations_update_workspace_admins
on public.resource_organizations
for update
to authenticated
using (
  exists (
    select 1
    from public.resource_organization_roles ror
    where ror.organization_id = resource_organizations.id
      and public.can_workspace_admin_manage_resource(ror.resource_id)
  )
)
with check (
  exists (
    select 1
    from public.resource_organization_roles ror
    where ror.organization_id = resource_organizations.id
      and public.can_workspace_admin_manage_resource(ror.resource_id)
  )
);

-- ---------------------------------------------------------------------------
-- resource_verifications policies
-- ---------------------------------------------------------------------------

-- Verification evidence is admin-maintenance data in v0.1.
-- Participants do not need direct row access to verification history.

create policy resource_verifications_select_workspace_admins
on public.resource_verifications
for select
to authenticated
using (
  public.can_workspace_admin_manage_resource(resource_verifications.resource_id)
);

create policy resource_verifications_insert_workspace_admins
on public.resource_verifications
for insert
to authenticated
with check (
  verified_by = auth.uid()
  and public.can_workspace_admin_manage_resource(resource_verifications.resource_id)
);

create policy resource_verifications_update_workspace_admins
on public.resource_verifications
for update
to authenticated
using (
  public.can_workspace_admin_manage_resource(resource_verifications.resource_id)
)
with check (
  public.can_workspace_admin_manage_resource(resource_verifications.resource_id)
);

-- ---------------------------------------------------------------------------
-- Activation boundary candidate
-- ---------------------------------------------------------------------------
-- RLS alone cannot compare OLD.status to NEW.status inside a normal policy.
-- To enforce "only admin may verify/activate" robustly, installation should use
-- one of:
--   1. admin-only RPC/function controlling draft -> active transitions; or
--   2. trigger enforcing transition authority.
--
-- Recommendation for v0.1: admin-only RPC because creation + visibility +
-- verification can be kept in one auditable transaction.
--
-- This RLS candidate therefore intentionally does NOT claim that direct UPDATE
-- policies alone fully enforce the activation lifecycle. That remains the next
-- bounded security-design question before installation.

-- ---------------------------------------------------------------------------
-- Support bridge extension candidate
-- ---------------------------------------------------------------------------
-- Existing support_request_links participant INSERT policy already requires:
--   created_by = auth.uid()
--   participant is self
--   active program participation
--   linked support request is still submitted and participant-created
--
-- When resource_id/resource_access_path_id are added, the existing self-insert rule
-- should be strengthened with resource visibility validation.
--
-- Candidate replacement/additional WITH CHECK fragment:
--
--   and (
--     resource_id is null
--     or public.can_participant_read_resource(resource_id, supported_person_id)
--   )
--   and (
--     resource_access_path_id is null
--     or exists (
--       select 1
--       from public.resource_access_paths rap
--       where rap.id = resource_access_path_id
--         and rap.resource_id = support_request_links.resource_id
--         and rap.status = 'active'
--     )
--   )
--
-- Meaning:
-- A participant may intentionally link a Support request only to a resource they
-- could actually read, and an access path must belong to that same resource.
-- Viewing a resource still creates nothing.

-- ---------------------------------------------------------------------------
-- No DELETE policies
-- ---------------------------------------------------------------------------
-- No hard deletes in MVP. Lifecycle uses draft/active/paused/inactive/archived.

-- ---------------------------------------------------------------------------
-- Candidate test matrix for later authenticated testing
-- ---------------------------------------------------------------------------
-- PARTICIPANT
-- [ ] can SELECT active resource with active workspace visibility
-- [ ] can SELECT active resource with active program visibility + active participation
-- [ ] cannot SELECT resource without matching visibility
-- [ ] cannot SELECT paused/inactive/archived resource
-- [ ] can SELECT only active access paths/guidance/organization roles for visible resource
-- [ ] cannot INSERT/UPDATE canonical resource content
-- [ ] can intentionally link visible resource context to own submitted Support request
-- [ ] cannot link invisible resource or mismatched access path
--
-- SUPPORT MEMBER (non-admin)
-- [ ] does not receive canonical verification/activation authority merely because
--     is_support_reviewer() is true
-- [ ] retains existing Support workflow authority only
--
-- WORKSPACE ADMIN
-- [ ] can maintain visibility mappings for own workspace
-- [ ] can maintain resource content mapped to own workspace
-- [ ] can create verification events for mapped resource
-- [ ] cannot use hard delete
--
-- CROSS-WORKSPACE
-- [ ] admin of workspace A cannot manage resource solely mapped to workspace B
-- [ ] participant in workspace A cannot read resource solely mapped to workspace B
--
-- LIFECYCLE
-- [ ] paused visibility hides resource without deleting it
-- [ ] archived records remain preserved
-- [ ] reverification evidence remains historical

-- ---------------------------------------------------------------------------
-- Open security design item discovered by this candidate
-- ---------------------------------------------------------------------------
-- Global canonical resources create one legitimate bootstrap problem:
-- before the first visibility mapping exists, row-level workspace authority has no
-- scope anchor for creating the global resource/organization safely.
--
-- DO NOT solve this by granting broad authenticated INSERT.
--
-- Recommended next candidate:
-- an admin-only resource creation/activation RPC that accepts explicit workspace
-- context, verifies is_workspace_admin(workspace_id), and atomically creates:
--   organization(s) as needed
--   resource draft
--   organization role(s)
--   access path(s)/guidance as applicable
--   workspace/program visibility
-- then separately requires admin verification before active participant exposure.
--
-- This is a candidate finding only. No RPC is created here.

rollback;

-- END REVIEW-ONLY RLS / PRIVILEGE CANDIDATE
