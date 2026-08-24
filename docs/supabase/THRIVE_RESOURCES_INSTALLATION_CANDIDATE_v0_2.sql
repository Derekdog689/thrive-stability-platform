-- THRIVE Resources / Guided Reference
-- Combined installation candidate v0.2
-- Date: 2026-08-24
-- Repository: thrive-stability-platform
-- Branch: main
--
-- REVIEW-ONLY INSTALLATION CANDIDATE. DO NOT EXECUTE.
--
-- v0.2 is a bounded correction of v0.1 after joint review.
-- It fixes exactly three issues:
--   1. resource/visibility activation and pause are RPC-only; direct authenticated
--      UPDATE cannot bypass lifecycle checks;
--   2. Support resource-link policies actually enforce participant visibility and
--      active matching access-path context;
--   3. database-level composite integrity guarantees an access path belongs to the
--      same resource recorded on support_request_links.
--
-- No architecture redesign is introduced.
-- No seed data is included.
-- No service-role pathway is introduced.
-- No Trust Engine synchronization exists.
-- No hard deletes are authorized.

begin;

-- ===========================================================================
-- PHASE 1: SCHEMA
-- ===========================================================================

create table if not exists public.resource_organizations (
  id uuid primary key default gen_random_uuid(),
  organization_name text not null,
  organization_type text not null,
  official_website_url text,
  country_code text,
  status text not null default 'active',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint resource_organizations_name_nonblank_chk check (length(btrim(organization_name)) >= 1),
  constraint resource_organizations_type_chk check (organization_type = any (array['government','nonprofit','university','institution','professional_association','other_verified']::text[])),
  constraint resource_organizations_status_chk check (status = any (array['active','inactive','archived']::text[])),
  constraint resource_organizations_country_code_chk check (country_code is null or country_code ~ '^[A-Z]{2}$')
);
create unique index if not exists resource_organizations_name_unique_idx
  on public.resource_organizations(lower(btrim(organization_name)))
  where archived_at is null;

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  resource_name text not null,
  resource_slug text not null,
  category text not null,
  subcategory text,
  plain_language_purpose text not null,
  participant_boundary_note text,
  country_code text,
  state_code text,
  county_name text,
  service_area_text text,
  audience_text text,
  verification_cadence text not null default 'moderate',
  status text not null default 'draft',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint resources_name_nonblank_chk check (length(btrim(resource_name)) >= 1),
  constraint resources_slug_chk check (resource_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint resources_category_chk check (category = any (array[
    'food_basic_needs','identification_documents','recovery_community_support',
    'employment_education','transportation','housing_information',
    'health_wellness_navigation','financial_education',
    'government_programs_benefits','other_not_sure'
  ]::text[])),
  constraint resources_purpose_nonblank_chk check (length(btrim(plain_language_purpose)) >= 1),
  constraint resources_status_chk check (status = any (array['draft','active','paused','inactive','archived']::text[])),
  constraint resources_verification_cadence_chk check (verification_cadence = any (array['fast_changing','moderate','stable']::text[])),
  constraint resources_country_code_chk check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  constraint resources_state_code_chk check (state_code is null or state_code ~ '^[A-Z]{2}$')
);
create unique index if not exists resources_slug_unique_idx on public.resources(resource_slug);
create index if not exists resources_category_status_idx on public.resources(category,status);
create index if not exists resources_geography_idx on public.resources(country_code,state_code,county_name);

create table if not exists public.resource_visibility (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete restrict,
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  program_id uuid,
  scope_type text not null,
  status text not null default 'active',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint resource_visibility_scope_type_chk check (scope_type = any (array['workspace','program']::text[])),
  constraint resource_visibility_scope_shape_chk check ((scope_type='workspace' and program_id is null) or (scope_type='program' and program_id is not null)),
  constraint resource_visibility_status_chk check (status = any (array['active','paused','inactive','archived']::text[])),
  constraint resource_visibility_program_workspace_fk foreign key (program_id,workspace_id) references public.programs(id,workspace_id) on delete restrict
);
create unique index if not exists resource_visibility_workspace_unique_idx
  on public.resource_visibility(resource_id,workspace_id)
  where scope_type='workspace' and archived_at is null;
create unique index if not exists resource_visibility_program_unique_idx
  on public.resource_visibility(resource_id,workspace_id,program_id)
  where scope_type='program' and archived_at is null;

create table if not exists public.resource_organization_roles (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete restrict,
  organization_id uuid not null references public.resource_organizations(id) on delete restrict,
  role_type text not null,
  is_primary boolean not null default false,
  status text not null default 'active',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint resource_organization_roles_type_chk check (role_type = any (array['primary_authority','service_provider','local_maintainer','listing_source','research_source','other']::text[])),
  constraint resource_organization_roles_status_chk check (status = any (array['active','inactive','archived']::text[]))
);
create unique index if not exists resource_organization_roles_unique_idx
  on public.resource_organization_roles(resource_id,organization_id,role_type)
  where archived_at is null;

create table if not exists public.resource_access_paths (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete restrict,
  organization_id uuid references public.resource_organizations(id) on delete restrict,
  path_type text not null,
  label text not null,
  plain_language_instruction text,
  url text,
  phone text,
  email text,
  country_code text,
  state_code text,
  locality_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  status text not null default 'active',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint resource_access_paths_type_chk check (path_type = any (array['landing_page','direct_action','instructions','finder','office_locator','phone','email','document','fallback','other']::text[])),
  constraint resource_access_paths_label_nonblank_chk check (length(btrim(label)) >= 1),
  constraint resource_access_paths_reachable_chk check (nullif(btrim(url),'') is not null or nullif(btrim(phone),'') is not null or nullif(btrim(email),'') is not null),
  constraint resource_access_paths_status_chk check (status = any (array['active','paused','inactive','archived']::text[])),
  constraint resource_access_paths_country_code_chk check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  constraint resource_access_paths_state_code_chk check (state_code is null or state_code ~ '^[A-Z]{2}$'),
  constraint resource_access_paths_id_resource_unique unique (id,resource_id)
);
create index if not exists resource_access_paths_resource_sort_idx on public.resource_access_paths(resource_id,sort_order,status);

create table if not exists public.resource_guidance_sections (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete restrict,
  section_type text not null,
  heading text not null,
  content text not null,
  source_access_path_id uuid references public.resource_access_paths(id) on delete restrict,
  sort_order integer not null default 0,
  status text not null default 'active',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint resource_guidance_sections_type_chk check (section_type = any (array['what_this_is','start_here','what_you_can_do','how_it_works','what_to_have_ready','important_note','fallback','need_help','other']::text[])),
  constraint resource_guidance_sections_heading_nonblank_chk check (length(btrim(heading)) >= 1),
  constraint resource_guidance_sections_content_nonblank_chk check (length(btrim(content)) >= 1),
  constraint resource_guidance_sections_status_chk check (status = any (array['active','paused','inactive','archived']::text[]))
);
create index if not exists resource_guidance_sections_resource_sort_idx on public.resource_guidance_sections(resource_id,sort_order,status);

create table if not exists public.resource_verifications (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete restrict,
  access_path_id uuid references public.resource_access_paths(id) on delete restrict,
  organization_id uuid references public.resource_organizations(id) on delete restrict,
  verification_scope text not null,
  verification_status text not null,
  verified_on date not null,
  verified_by uuid not null references auth.users(id) on delete restrict,
  source_url text,
  verification_note text,
  next_review_on date,
  created_at timestamptz not null default now(),
  constraint resource_verifications_scope_chk check (verification_scope = any (array['resource_identity','official_domain','access_path','contact_information','published_guidance','service_area','other']::text[])),
  constraint resource_verifications_status_chk check (verification_status = any (array['verified','needs_review','unable_to_verify','superseded']::text[])),
  constraint resource_verifications_review_date_chk check (next_review_on is null or next_review_on >= verified_on)
);
create index if not exists resource_verifications_resource_date_idx on public.resource_verifications(resource_id,verified_on desc);
create index if not exists resource_verifications_next_review_idx on public.resource_verifications(next_review_on) where verification_status='verified';

alter table public.support_request_links add column if not exists resource_id uuid;
alter table public.support_request_links add column if not exists resource_access_path_id uuid;

alter table public.support_request_links
  add constraint support_request_links_resource_fk
  foreign key (resource_id) references public.resources(id) on delete restrict;

-- Composite FK is the authoritative resource/path integrity rule.
-- If resource_access_path_id is present, it must belong to the same resource_id.
alter table public.support_request_links
  add constraint support_request_links_resource_access_path_pair_fk
  foreign key (resource_access_path_id,resource_id)
  references public.resource_access_paths(id,resource_id)
  on delete restrict;

alter table public.support_request_links
  add constraint support_request_links_resource_path_shape_chk
  check (resource_access_path_id is null or resource_id is not null);

create index if not exists support_request_links_resource_idx
  on public.support_request_links(resource_id)
  where resource_id is not null and archived_at is null;

-- ===========================================================================
-- PHASE 2: HELPERS
-- ===========================================================================

create or replace function public.can_participant_read_resource(p_resource_id uuid,p_supported_person_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists (
    select 1
    from public.resources r
    join public.resource_visibility rv on rv.resource_id=r.id and rv.status='active'
    join public.supported_people sp on sp.id=p_supported_person_id and sp.status='active'
    where r.id=p_resource_id
      and r.status='active'
      and public.is_supported_person_self(sp.id)
      and (
        (rv.scope_type='workspace' and rv.workspace_id=sp.workspace_id and rv.program_id is null)
        or
        (rv.scope_type='program' and rv.workspace_id=sp.workspace_id and rv.program_id is not null
          and public.is_program_participant_active(sp.id,rv.program_id,rv.workspace_id))
      )
  );
$$;

create or replace function public.can_workspace_admin_manage_resource(p_resource_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists (
    select 1
    from public.resource_visibility rv
    where rv.resource_id=p_resource_id
      and rv.status in ('active','paused')
      and public.is_workspace_admin(rv.workspace_id)
  );
$$;

-- ===========================================================================
-- PHASE 3: RLS + PRIVILEGES
-- ===========================================================================

alter table public.resource_organizations enable row level security;
alter table public.resources enable row level security;
alter table public.resource_visibility enable row level security;
alter table public.resource_organization_roles enable row level security;
alter table public.resource_access_paths enable row level security;
alter table public.resource_guidance_sections enable row level security;
alter table public.resource_verifications enable row level security;

revoke all on table public.resource_organizations from authenticated;
revoke all on table public.resources from authenticated;
revoke all on table public.resource_visibility from authenticated;
revoke all on table public.resource_organization_roles from authenticated;
revoke all on table public.resource_access_paths from authenticated;
revoke all on table public.resource_guidance_sections from authenticated;
revoke all on table public.resource_verifications from authenticated;

-- Participant-readable surfaces.
grant select on table public.resources to authenticated;
grant select on table public.resource_access_paths to authenticated;
grant select on table public.resource_guidance_sections to authenticated;
grant select on table public.resource_organizations to authenticated;
grant select on table public.resource_organization_roles to authenticated;

-- Admin-maintained child/evidence surfaces.
-- No DELETE privileges anywhere.
grant insert,update on table public.resource_organization_roles to authenticated;
grant insert,update on table public.resource_access_paths to authenticated;
grant insert,update on table public.resource_guidance_sections to authenticated;
grant insert,update,select on table public.resource_verifications to authenticated;
grant update on table public.resource_organizations to authenticated;

-- SECURITY CORRECTION v0.2:
-- No ordinary authenticated INSERT or UPDATE on public.resources.
-- No ordinary authenticated INSERT or UPDATE on public.resource_visibility.
-- Resource lifecycle and visibility lifecycle are RPC-only in v0.1.

create policy resources_select_participant_visible on public.resources
for select to authenticated using (
  status='active' and exists (
    select 1 from public.supported_people sp
    where public.can_participant_read_resource(resources.id,sp.id)
  )
);
create policy resources_select_workspace_admins on public.resources
for select to authenticated using (public.can_workspace_admin_manage_resource(resources.id));

create policy resource_visibility_select_workspace_admins on public.resource_visibility
for select to authenticated using (public.is_workspace_admin(workspace_id));

create policy resource_access_paths_select_participant_visible on public.resource_access_paths
for select to authenticated using (
  status='active' and exists (
    select 1 from public.supported_people sp
    where public.can_participant_read_resource(resource_access_paths.resource_id,sp.id)
  )
);
create policy resource_access_paths_select_workspace_admins on public.resource_access_paths
for select to authenticated using (public.can_workspace_admin_manage_resource(resource_access_paths.resource_id));
create policy resource_access_paths_insert_workspace_admins on public.resource_access_paths
for insert to authenticated with check (created_by=auth.uid() and public.can_workspace_admin_manage_resource(resource_access_paths.resource_id));
create policy resource_access_paths_update_workspace_admins on public.resource_access_paths
for update to authenticated using (public.can_workspace_admin_manage_resource(resource_access_paths.resource_id))
with check (public.can_workspace_admin_manage_resource(resource_access_paths.resource_id));

create policy resource_guidance_sections_select_participant_visible on public.resource_guidance_sections
for select to authenticated using (
  status='active' and exists (
    select 1 from public.supported_people sp
    where public.can_participant_read_resource(resource_guidance_sections.resource_id,sp.id)
  )
);
create policy resource_guidance_sections_select_workspace_admins on public.resource_guidance_sections
for select to authenticated using (public.can_workspace_admin_manage_resource(resource_guidance_sections.resource_id));
create policy resource_guidance_sections_insert_workspace_admins on public.resource_guidance_sections
for insert to authenticated with check (created_by=auth.uid() and public.can_workspace_admin_manage_resource(resource_guidance_sections.resource_id));
create policy resource_guidance_sections_update_workspace_admins on public.resource_guidance_sections
for update to authenticated using (public.can_workspace_admin_manage_resource(resource_guidance_sections.resource_id))
with check (public.can_workspace_admin_manage_resource(resource_guidance_sections.resource_id));

create policy resource_organization_roles_select_participant_visible on public.resource_organization_roles
for select to authenticated using (
  status='active' and exists (
    select 1 from public.supported_people sp
    where public.can_participant_read_resource(resource_organization_roles.resource_id,sp.id)
  )
);
create policy resource_organization_roles_select_workspace_admins on public.resource_organization_roles
for select to authenticated using (public.can_workspace_admin_manage_resource(resource_organization_roles.resource_id));
create policy resource_organization_roles_insert_workspace_admins on public.resource_organization_roles
for insert to authenticated with check (created_by=auth.uid() and public.can_workspace_admin_manage_resource(resource_organization_roles.resource_id));
create policy resource_organization_roles_update_workspace_admins on public.resource_organization_roles
for update to authenticated using (public.can_workspace_admin_manage_resource(resource_organization_roles.resource_id))
with check (public.can_workspace_admin_manage_resource(resource_organization_roles.resource_id));

create policy resource_organizations_select_participant_visible on public.resource_organizations
for select to authenticated using (
  status='active' and exists (
    select 1
    from public.resource_organization_roles ror
    join public.supported_people sp on true
    where ror.organization_id=resource_organizations.id
      and ror.status='active'
      and public.can_participant_read_resource(ror.resource_id,sp.id)
  )
);
create policy resource_organizations_select_workspace_admins on public.resource_organizations
for select to authenticated using (
  exists (
    select 1 from public.resource_organization_roles ror
    where ror.organization_id=resource_organizations.id
      and public.can_workspace_admin_manage_resource(ror.resource_id)
  )
);
create policy resource_organizations_update_workspace_admins on public.resource_organizations
for update to authenticated
using (
  exists (
    select 1 from public.resource_organization_roles ror
    where ror.organization_id=resource_organizations.id
      and public.can_workspace_admin_manage_resource(ror.resource_id)
  )
)
with check (
  exists (
    select 1 from public.resource_organization_roles ror
    where ror.organization_id=resource_organizations.id
      and public.can_workspace_admin_manage_resource(ror.resource_id)
  )
);

create policy resource_verifications_select_workspace_admins on public.resource_verifications
for select to authenticated using (public.can_workspace_admin_manage_resource(resource_verifications.resource_id));
create policy resource_verifications_insert_workspace_admins on public.resource_verifications
for insert to authenticated with check (verified_by=auth.uid() and public.can_workspace_admin_manage_resource(resource_verifications.resource_id));
create policy resource_verifications_update_workspace_admins on public.resource_verifications
for update to authenticated using (public.can_workspace_admin_manage_resource(resource_verifications.resource_id))
with check (public.can_workspace_admin_manage_resource(resource_verifications.resource_id));

-- ===========================================================================
-- PHASE 4: ADMIN RPC-ONLY RESOURCE / VISIBILITY LIFECYCLE
-- ===========================================================================

create or replace function public.admin_create_resource_draft(
  p_workspace_id uuid,p_program_id uuid default null,p_scope_type text default 'workspace',
  p_resource_name text default null,p_resource_slug text default null,p_category text default null,
  p_subcategory text default null,p_plain_language_purpose text default null,
  p_participant_boundary_note text default null,p_country_code text default null,
  p_state_code text default null,p_county_name text default null,p_service_area_text text default null,
  p_audience_text text default null,p_verification_cadence text default 'moderate'
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_resource_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.is_workspace_admin(p_workspace_id) then raise exception 'Workspace admin authority required'; end if;
  if p_scope_type not in ('workspace','program') then raise exception 'Invalid resource visibility scope'; end if;
  if p_scope_type='workspace' and p_program_id is not null then raise exception 'Workspace visibility cannot include program_id'; end if;
  if p_scope_type='program' then
    if p_program_id is null then raise exception 'Program visibility requires program_id'; end if;
    if not public.is_program_in_workspace(p_program_id,p_workspace_id) then raise exception 'Program is not active in workspace'; end if;
  end if;
  if nullif(btrim(p_resource_name),'') is null then raise exception 'Resource name is required'; end if;
  if nullif(btrim(p_resource_slug),'') is null then raise exception 'Resource slug is required'; end if;
  if nullif(btrim(p_plain_language_purpose),'') is null then raise exception 'Plain-language purpose is required'; end if;

  insert into public.resources(
    resource_name,resource_slug,category,subcategory,plain_language_purpose,
    participant_boundary_note,country_code,state_code,county_name,service_area_text,
    audience_text,verification_cadence,status,created_by
  ) values (
    btrim(p_resource_name),btrim(p_resource_slug),p_category,nullif(btrim(p_subcategory),''),
    btrim(p_plain_language_purpose),nullif(btrim(p_participant_boundary_note),''),
    p_country_code,p_state_code,nullif(btrim(p_county_name),''),nullif(btrim(p_service_area_text),''),
    nullif(btrim(p_audience_text),''),p_verification_cadence,'draft',auth.uid()
  ) returning id into v_resource_id;

  insert into public.resource_visibility(resource_id,workspace_id,program_id,scope_type,status,created_by)
  values(v_resource_id,p_workspace_id,p_program_id,p_scope_type,'paused',auth.uid());

  return v_resource_id;
end;$$;

-- Bounded editor for draft/paused canonical resource details.
-- Status is intentionally not an input.
create or replace function public.admin_update_resource_details(
  p_resource_id uuid,
  p_resource_name text,
  p_category text,
  p_subcategory text,
  p_plain_language_purpose text,
  p_participant_boundary_note text default null,
  p_country_code text default null,
  p_state_code text default null,
  p_county_name text default null,
  p_service_area_text text default null,
  p_audience_text text default null,
  p_verification_cadence text default 'moderate'
) returns void language plpgsql security definer set search_path=public as $$
declare v_status text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.can_workspace_admin_manage_resource(p_resource_id) then
    raise exception 'Workspace admin authority required for this resource';
  end if;

  select status into v_status from public.resources where id=p_resource_id and archived_at is null;
  if v_status not in ('draft','paused') then
    raise exception 'Only draft or paused resource details may be edited through this RPC';
  end if;

  update public.resources
  set resource_name=btrim(p_resource_name),
      category=p_category,
      subcategory=nullif(btrim(p_subcategory),''),
      plain_language_purpose=btrim(p_plain_language_purpose),
      participant_boundary_note=nullif(btrim(p_participant_boundary_note),''),
      country_code=p_country_code,
      state_code=p_state_code,
      county_name=nullif(btrim(p_county_name),''),
      service_area_text=nullif(btrim(p_service_area_text),''),
      audience_text=nullif(btrim(p_audience_text),''),
      verification_cadence=p_verification_cadence,
      updated_at=now()
  where id=p_resource_id;
end;$$;

create or replace function public.admin_add_resource_organization(
  p_resource_id uuid,p_organization_name text,p_organization_type text,
  p_official_website_url text default null,p_country_code text default null,
  p_role_type text default 'primary_authority',p_is_primary boolean default true
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_organization_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.can_workspace_admin_manage_resource(p_resource_id) then raise exception 'Workspace admin authority required for this resource'; end if;
  if nullif(btrim(p_organization_name),'') is null then raise exception 'Organization name is required'; end if;

  select ro.id into v_organization_id
  from public.resource_organizations ro
  where lower(btrim(ro.organization_name))=lower(btrim(p_organization_name))
    and ro.archived_at is null
  limit 1;

  if v_organization_id is null then
    insert into public.resource_organizations(
      organization_name,organization_type,official_website_url,country_code,status,created_by
    ) values (
      btrim(p_organization_name),p_organization_type,nullif(btrim(p_official_website_url),''),
      p_country_code,'active',auth.uid()
    ) returning id into v_organization_id;
  end if;

  insert into public.resource_organization_roles(
    resource_id,organization_id,role_type,is_primary,status,created_by
  ) values (
    p_resource_id,v_organization_id,p_role_type,p_is_primary,'active',auth.uid()
  ) on conflict do nothing;

  return v_organization_id;
end;$$;

create or replace function public.admin_activate_resource(
  p_resource_id uuid,p_workspace_id uuid,p_program_id uuid default null
) returns void language plpgsql security definer set search_path=public as $$
declare v_resource_status text; v_visibility_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.is_workspace_admin(p_workspace_id) then raise exception 'Workspace admin authority required'; end if;

  select r.status into v_resource_status
  from public.resources r
  where r.id=p_resource_id and r.archived_at is null;

  if v_resource_status is null then raise exception 'Resource not found'; end if;
  if v_resource_status not in ('draft','paused') then raise exception 'Resource is not in an activatable state'; end if;

  select rv.id into v_visibility_id
  from public.resource_visibility rv
  where rv.resource_id=p_resource_id
    and rv.workspace_id=p_workspace_id
    and rv.archived_at is null
    and (
      (p_program_id is null and rv.scope_type='workspace' and rv.program_id is null)
      or
      (p_program_id is not null and rv.scope_type='program' and rv.program_id=p_program_id)
    )
  limit 1;

  if v_visibility_id is null then raise exception 'Matching resource visibility mapping not found'; end if;
  if p_program_id is not null and not public.is_program_in_workspace(p_program_id,p_workspace_id) then
    raise exception 'Program is not active in workspace';
  end if;

  if not exists (
    select 1 from public.resource_verifications rvf
    where rvf.resource_id=p_resource_id
      and rvf.verification_status='verified'
      and rvf.verified_by=auth.uid()
  ) then raise exception 'A current admin verification record is required before activation'; end if;

  if not exists (
    select 1 from public.resource_access_paths rap
    where rap.resource_id=p_resource_id
      and rap.status='active'
      and rap.archived_at is null
  ) then raise exception 'At least one active official access path is required'; end if;

  if not exists (
    select 1 from public.resource_organization_roles ror
    where ror.resource_id=p_resource_id
      and ror.status='active'
      and ror.archived_at is null
  ) then raise exception 'At least one active organization role is required'; end if;

  update public.resources
  set status='active',updated_at=now()
  where id=p_resource_id;

  update public.resource_visibility
  set status='active',updated_at=now()
  where id=v_visibility_id;
end;$$;

create or replace function public.admin_pause_resource_visibility(
  p_resource_id uuid,p_workspace_id uuid,p_program_id uuid default null
) returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not public.is_workspace_admin(p_workspace_id) then raise exception 'Workspace admin authority required'; end if;

  update public.resource_visibility
  set status='paused',updated_at=now()
  where resource_id=p_resource_id
    and workspace_id=p_workspace_id
    and archived_at is null
    and (
      (p_program_id is null and scope_type='workspace' and program_id is null)
      or
      (p_program_id is not null and scope_type='program' and program_id=p_program_id)
    );

  if not found then raise exception 'Matching resource visibility mapping not found'; end if;
end;$$;

revoke all on function public.admin_create_resource_draft(uuid,uuid,text,text,text,text,text,text,text,text,text,text,text,text,text) from public;
revoke all on function public.admin_update_resource_details(uuid,text,text,text,text,text,text,text,text,text,text,text) from public;
revoke all on function public.admin_add_resource_organization(uuid,text,text,text,text,text,boolean) from public;
revoke all on function public.admin_activate_resource(uuid,uuid,uuid) from public;
revoke all on function public.admin_pause_resource_visibility(uuid,uuid,uuid) from public;

grant execute on function public.admin_create_resource_draft(uuid,uuid,text,text,text,text,text,text,text,text,text,text,text,text,text) to authenticated;
grant execute on function public.admin_update_resource_details(uuid,text,text,text,text,text,text,text,text,text,text,text) to authenticated;
grant execute on function public.admin_add_resource_organization(uuid,text,text,text,text,text,boolean) to authenticated;
grant execute on function public.admin_activate_resource(uuid,uuid,uuid) to authenticated;
grant execute on function public.admin_pause_resource_visibility(uuid,uuid,uuid) to authenticated;

-- ===========================================================================
-- PHASE 5: SUPPORT LINK POLICY RECONCILIATION
-- ===========================================================================
-- Existing Support lifecycle authority remains unchanged.
-- These replacements only add resource-context truth checks.

-- Participant INSERT: own submitted Support request, active participation,
-- plus resource must be participant-visible and access path must be active.
drop policy if exists support_request_links_insert_self on public.support_request_links;
create policy support_request_links_insert_self
on public.support_request_links
for insert
to authenticated
with check (
  created_by=auth.uid()
  and archived_at is null
  and public.is_supported_person_self(supported_person_id)
  and public.is_program_participant_active(supported_person_id,program_id,workspace_id)
  and exists (
    select 1
    from public.support_requests sr
    where sr.id=support_request_links.support_request_id
      and sr.workspace_id=support_request_links.workspace_id
      and sr.program_id=support_request_links.program_id
      and sr.supported_person_id=support_request_links.supported_person_id
      and sr.status='submitted'
      and sr.created_by=auth.uid()
  )
  and (
    resource_id is null
    or public.can_participant_read_resource(resource_id,supported_person_id)
  )
  and (
    resource_access_path_id is null
    or exists (
      select 1
      from public.resource_access_paths rap
      where rap.id=support_request_links.resource_access_path_id
        and rap.resource_id=support_request_links.resource_id
        and rap.status='active'
        and rap.archived_at is null
    )
  )
);

-- Participant pre-ack archive remains allowed exactly as before, but resource
-- context must still be internally valid. This does not permit changing lifecycle
-- authority or fabricating a different Support request.
drop policy if exists support_request_links_update_self_before_ack on public.support_request_links;
create policy support_request_links_update_self_before_ack
on public.support_request_links
for update
to authenticated
using (
  archived_at is null
  and public.is_supported_person_self(supported_person_id)
  and exists (
    select 1
    from public.support_requests sr
    where sr.id=support_request_links.support_request_id
      and sr.workspace_id=support_request_links.workspace_id
      and sr.program_id=support_request_links.program_id
      and sr.supported_person_id=support_request_links.supported_person_id
      and sr.status='submitted'
      and sr.created_by=auth.uid()
  )
)
with check (
  archived_at is not null
  and archive_reason is not null
  and public.is_supported_person_self(supported_person_id)
  and (
    resource_id is null
    or public.can_participant_read_resource(resource_id,supported_person_id)
  )
  and (
    resource_access_path_id is null
    or exists (
      select 1
      from public.resource_access_paths rap
      where rap.id=support_request_links.resource_access_path_id
        and rap.resource_id=support_request_links.resource_id
    )
  )
);

-- ===========================================================================
-- PHASE 6: TEST MATRIX
-- ===========================================================================
-- No test data is inserted by this candidate.
-- Later testing must use controlled authenticated synthetic users only.
--
-- DIRECT BYPASS
-- [ ] authenticated raw INSERT into resources denied
-- [ ] authenticated raw UPDATE of resource status denied
-- [ ] authenticated raw INSERT/UPDATE of resource_visibility denied
-- [ ] non-admin cannot activate through RPC
-- [ ] workspace admin cannot activate without verification + access path + org role
--
-- DRAFT EDITING
-- [ ] admin_update_resource_details works only for mapped admin
-- [ ] draft/paused details can be edited
-- [ ] active resource details cannot be edited through draft editor
-- [ ] status cannot be supplied to detail editor
--
-- SUPPORT LINK
-- [ ] participant may link no resource context
-- [ ] participant may link visible active resource
-- [ ] participant cannot link invisible/unmapped/paused resource
-- [ ] participant may link active path belonging to visible resource
-- [ ] mismatched resource/path pair fails at composite FK
-- [ ] inactive path fails participant INSERT policy
-- [ ] existing pre-ack archive behavior remains intact
--
-- CROSS-WORKSPACE
-- [ ] workspace A admin cannot activate workspace B mapping
-- [ ] workspace A participant cannot read/link workspace B resource
--
-- LIFECYCLE
-- [ ] activation only through admin_activate_resource
-- [ ] pause only through admin_pause_resource_visibility
-- [ ] no DELETE privilege/policy exists
-- [ ] history remains preserved

-- ===========================================================================
-- DELIBERATE NON-SCOPE
-- ===========================================================================
-- No seed resources.
-- No UI.
-- No passive view tracking.
-- No automatic Support request.
-- No eligibility/recommendation score.
-- No clinical/legal/fiduciary inference.
-- No service-role pathway.
-- No Trust Engine synchronization.

rollback;

-- END REVIEW-ONLY COMBINED INSTALLATION CANDIDATE v0.2
