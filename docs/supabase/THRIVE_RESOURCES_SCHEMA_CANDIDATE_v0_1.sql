-- THRIVE Resources / Guided Reference schema candidate v0.1
-- Date: 2026-08-23
-- Status: REVIEW-ONLY. DO NOT EXECUTE.
--
-- This candidate is derived from:
-- - THRIVE_RESOURCES_GUIDED_REFERENCE_BLUEPRINT_v0_1.md
-- - THRIVE_RESOURCES_CROSS_DOMAIN_VALIDATION_v0_1.md
-- - THRIVE_RESOURCES_DATA_MODEL_CANDIDATE_v0_2.md
--
-- Frozen product decisions:
-- 1. global canonical resource library with workspace/program visibility mappings
-- 2. flexible controlled guidance sections
-- 3. admin-only verify/activate in v0.1
-- 4. participant-friendly frozen category set
-- 5. tiered re-verification cadence: 90d / 6mo / 12mo
-- 6. participant-initiated, context-only Support bridge in v0.1
--
-- This file does NOT authorize SQL execution, RLS installation, seeding,
-- production ingestion, UI implementation, external sharing, or Trust Engine work.

begin;

-- -----------------------------------------------------------------------------
-- 1. External organizations
-- -----------------------------------------------------------------------------

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

  constraint resource_organizations_name_nonblank_chk
    check (length(btrim(organization_name)) >= 1),

  constraint resource_organizations_type_chk
    check (
      organization_type = any (array[
        'government'::text,
        'nonprofit'::text,
        'university'::text,
        'institution'::text,
        'professional_association'::text,
        'other_verified'::text
      ])
    ),

  constraint resource_organizations_status_chk
    check (
      status = any (array[
        'active'::text,
        'inactive'::text,
        'archived'::text
      ])
    ),

  constraint resource_organizations_country_code_chk
    check (
      country_code is null
      or country_code ~ '^[A-Z]{2}$'
    )
);

create unique index if not exists resource_organizations_name_unique_idx
  on public.resource_organizations (lower(btrim(organization_name)))
  where archived_at is null;

-- -----------------------------------------------------------------------------
-- 2. Global canonical resources
-- -----------------------------------------------------------------------------

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

  constraint resources_name_nonblank_chk
    check (length(btrim(resource_name)) >= 1),

  constraint resources_slug_chk
    check (resource_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),

  constraint resources_category_chk
    check (
      category = any (array[
        'food_basic_needs'::text,
        'identification_documents'::text,
        'recovery_community_support'::text,
        'employment_education'::text,
        'transportation'::text,
        'housing_information'::text,
        'health_wellness_navigation'::text,
        'financial_education'::text,
        'government_programs_benefits'::text,
        'other_not_sure'::text
      ])
    ),

  constraint resources_purpose_nonblank_chk
    check (length(btrim(plain_language_purpose)) >= 1),

  constraint resources_status_chk
    check (
      status = any (array[
        'draft'::text,
        'active'::text,
        'paused'::text,
        'inactive'::text,
        'archived'::text
      ])
    ),

  constraint resources_verification_cadence_chk
    check (
      verification_cadence = any (array[
        'fast_changing'::text,
        'moderate'::text,
        'stable'::text
      ])
    ),

  constraint resources_country_code_chk
    check (
      country_code is null
      or country_code ~ '^[A-Z]{2}$'
    ),

  constraint resources_state_code_chk
    check (
      state_code is null
      or state_code ~ '^[A-Z]{2}$'
    )
);

create unique index if not exists resources_slug_unique_idx
  on public.resources (resource_slug);

create index if not exists resources_category_status_idx
  on public.resources (category, status);

create index if not exists resources_geography_idx
  on public.resources (country_code, state_code, county_name);

-- -----------------------------------------------------------------------------
-- 3. Visibility mappings
-- -----------------------------------------------------------------------------

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

  constraint resource_visibility_scope_type_chk
    check (
      scope_type = any (array[
        'workspace'::text,
        'program'::text
      ])
    ),

  constraint resource_visibility_scope_shape_chk
    check (
      (scope_type = 'workspace' and program_id is null)
      or
      (scope_type = 'program' and program_id is not null)
    ),

  constraint resource_visibility_status_chk
    check (
      status = any (array[
        'active'::text,
        'paused'::text,
        'inactive'::text,
        'archived'::text
      ])
    ),

  constraint resource_visibility_program_workspace_fk
    foreign key (program_id, workspace_id)
    references public.programs(id, workspace_id)
    on delete restrict
);

create unique index if not exists resource_visibility_workspace_unique_idx
  on public.resource_visibility (resource_id, workspace_id)
  where scope_type = 'workspace' and archived_at is null;

create unique index if not exists resource_visibility_program_unique_idx
  on public.resource_visibility (resource_id, workspace_id, program_id)
  where scope_type = 'program' and archived_at is null;

-- -----------------------------------------------------------------------------
-- 4. Organization roles
-- -----------------------------------------------------------------------------

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

  constraint resource_organization_roles_type_chk
    check (
      role_type = any (array[
        'primary_authority'::text,
        'service_provider'::text,
        'local_maintainer'::text,
        'listing_source'::text,
        'research_source'::text,
        'other'::text
      ])
    ),

  constraint resource_organization_roles_status_chk
    check (
      status = any (array[
        'active'::text,
        'inactive'::text,
        'archived'::text
      ])
    )
);

create unique index if not exists resource_organization_roles_unique_idx
  on public.resource_organization_roles (resource_id, organization_id, role_type)
  where archived_at is null;

-- -----------------------------------------------------------------------------
-- 5. Official access / action paths
-- -----------------------------------------------------------------------------

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

  constraint resource_access_paths_type_chk
    check (
      path_type = any (array[
        'landing_page'::text,
        'direct_action'::text,
        'instructions'::text,
        'finder'::text,
        'office_locator'::text,
        'phone'::text,
        'email'::text,
        'document'::text,
        'fallback'::text,
        'other'::text
      ])
    ),

  constraint resource_access_paths_label_nonblank_chk
    check (length(btrim(label)) >= 1),

  constraint resource_access_paths_reachable_chk
    check (
      nullif(btrim(url), '') is not null
      or nullif(btrim(phone), '') is not null
      or nullif(btrim(email), '') is not null
    ),

  constraint resource_access_paths_status_chk
    check (
      status = any (array[
        'active'::text,
        'paused'::text,
        'inactive'::text,
        'archived'::text
      ])
    ),

  constraint resource_access_paths_country_code_chk
    check (country_code is null or country_code ~ '^[A-Z]{2}$'),

  constraint resource_access_paths_state_code_chk
    check (state_code is null or state_code ~ '^[A-Z]{2}$')
);

create index if not exists resource_access_paths_resource_sort_idx
  on public.resource_access_paths (resource_id, sort_order, status);

-- -----------------------------------------------------------------------------
-- 6. Controlled plain-language guidance
-- -----------------------------------------------------------------------------

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

  constraint resource_guidance_sections_type_chk
    check (
      section_type = any (array[
        'what_this_is'::text,
        'start_here'::text,
        'what_you_can_do'::text,
        'how_it_works'::text,
        'what_to_have_ready'::text,
        'important_note'::text,
        'fallback'::text,
        'need_help'::text,
        'other'::text
      ])
    ),

  constraint resource_guidance_sections_heading_nonblank_chk
    check (length(btrim(heading)) >= 1),

  constraint resource_guidance_sections_content_nonblank_chk
    check (length(btrim(content)) >= 1),

  constraint resource_guidance_sections_status_chk
    check (
      status = any (array[
        'active'::text,
        'paused'::text,
        'inactive'::text,
        'archived'::text
      ])
    )
);

create index if not exists resource_guidance_sections_resource_sort_idx
  on public.resource_guidance_sections (resource_id, sort_order, status);

-- -----------------------------------------------------------------------------
-- 7. Verification evidence
-- -----------------------------------------------------------------------------

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

  constraint resource_verifications_scope_chk
    check (
      verification_scope = any (array[
        'resource_identity'::text,
        'official_domain'::text,
        'access_path'::text,
        'contact_information'::text,
        'published_guidance'::text,
        'service_area'::text,
        'other'::text
      ])
    ),

  constraint resource_verifications_status_chk
    check (
      verification_status = any (array[
        'verified'::text,
        'needs_review'::text,
        'unable_to_verify'::text,
        'superseded'::text
      ])
    ),

  constraint resource_verifications_review_date_chk
    check (next_review_on is null or next_review_on >= verified_on)
);

create index if not exists resource_verifications_resource_date_idx
  on public.resource_verifications (resource_id, verified_on desc);

create index if not exists resource_verifications_next_review_idx
  on public.resource_verifications (next_review_on)
  where verification_status = 'verified';

-- -----------------------------------------------------------------------------
-- 8. Support context bridge
-- -----------------------------------------------------------------------------

alter table public.support_request_links
  add column if not exists resource_id uuid,
  add column if not exists resource_access_path_id uuid;

alter table public.support_request_links
  add constraint support_request_links_resource_fk
    foreign key (resource_id)
    references public.resources(id)
    on delete restrict;

alter table public.support_request_links
  add constraint support_request_links_resource_access_path_fk
    foreign key (resource_access_path_id)
    references public.resource_access_paths(id)
    on delete restrict;

-- Candidate integrity rule: an exact access path should never be linked without
-- its parent resource also being present on the Support link row.
alter table public.support_request_links
  add constraint support_request_links_resource_path_shape_chk
    check (
      resource_access_path_id is null
      or resource_id is not null
    );

create index if not exists support_request_links_resource_idx
  on public.support_request_links (resource_id)
  where resource_id is not null and archived_at is null;

-- -----------------------------------------------------------------------------
-- 9. Candidate comments / boundaries
-- -----------------------------------------------------------------------------

comment on table public.resources is
  'Global DSS-maintained Guided Reference library. Resource records provide verified directions, connections, references, and plain-language how-to guidance. They do not establish eligibility, diagnosis, recommendation, legal authority, clinical conclusions, fiduciary conclusions, or Trust Engine authority.';

comment on table public.resource_visibility is
  'Controls which THRIVE workspace or program may display a global canonical resource. Visibility does not establish that a participant needs, qualifies for, or should use the resource.';

comment on table public.resource_guidance_sections is
  'THRIVE plain-language paraphrase and navigation guidance. Official outside sources remain authoritative.';

comment on table public.resource_verifications is
  'Records what DSS actually verified and when. Verification of an official portal or finder does not imply independent verification of every live item maintained inside the outside system.';

-- -----------------------------------------------------------------------------
-- 10. Deliberately NOT included in this candidate
-- -----------------------------------------------------------------------------
--
-- No RLS policies are defined here.
-- No grants are changed here.
-- No seed records are inserted here.
-- No auth roles are created here.
-- No resource-view tracking is created here.
-- No participant eligibility/recommendation fields exist here.
-- No automatic Support requests are created here.
-- No Trust Engine synchronization exists here.
--
-- Admin-only verification/activation remains a frozen product requirement that
-- must be implemented through an explicitly reviewed RLS/privilege candidate
-- against the live membership/role model before installation approval.

rollback;

-- END REVIEW-ONLY CANDIDATE
