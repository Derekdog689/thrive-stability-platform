-- THRIVE Recovery Resources Content Install Candidate v0.1
-- Date: 2026-09-30
-- REVIEW ONLY. DO NOT EXECUTE.
--
-- Purpose:
-- Seed the first six canonical Recovery Support resources using the EXISTING
-- Resources schema. No schema changes. No Trust Engine work. No service-role use.
--
-- Required before execution:
-- 1. Replace v_actor with an authorized DSS admin auth.users id.
-- 2. Re-verify each official access path.
-- 3. Confirm workspace visibility target.
-- 4. Explicit install approval.

begin;

do $$
declare
  v_actor uuid := null; -- REQUIRED: authorized DSS admin auth.users id
  v_workspace uuid := '211d2c03-e2ac-4205-96b2-9a821b8bc6bd';

  v_aa_org uuid;
  v_na_org uuid;
  v_smart_org uuid;
  v_samhsa_org uuid;

  v_aa_meetings uuid;
  v_na_meetings uuid;
  v_smart_meetings uuid;
  v_aa_reflections uuid;
  v_na_literature uuid;
  v_samhsa_recovery uuid;

  v_path uuid;
begin
  if v_actor is null then
    raise exception 'REVIEW ONLY: set v_actor before any approved execution.';
  end if;

  -- -------------------------------------------------------------------------
  -- Organizations
  -- -------------------------------------------------------------------------

  insert into public.resource_organizations (
    organization_name, organization_type, official_website_url, country_code,
    status, created_by
  )
  values (
    'Alcoholics Anonymous World Services',
    'nonprofit',
    'https://www.aa.org/',
    'US',
    'active',
    v_actor
  )
  on conflict do nothing;

  select id into v_aa_org
  from public.resource_organizations
  where lower(btrim(organization_name)) = lower('Alcoholics Anonymous World Services')
    and archived_at is null
  limit 1;

  insert into public.resource_organizations (
    organization_name, organization_type, official_website_url, country_code,
    status, created_by
  )
  values (
    'Narcotics Anonymous World Services',
    'nonprofit',
    'https://na.org/',
    'US',
    'active',
    v_actor
  )
  on conflict do nothing;

  select id into v_na_org
  from public.resource_organizations
  where lower(btrim(organization_name)) = lower('Narcotics Anonymous World Services')
    and archived_at is null
  limit 1;

  insert into public.resource_organizations (
    organization_name, organization_type, official_website_url, country_code,
    status, created_by
  )
  values (
    'SMART Recovery USA',
    'nonprofit',
    'https://smartrecovery.org/',
    'US',
    'active',
    v_actor
  )
  on conflict do nothing;

  select id into v_smart_org
  from public.resource_organizations
  where lower(btrim(organization_name)) = lower('SMART Recovery USA')
    and archived_at is null
  limit 1;

  insert into public.resource_organizations (
    organization_name, organization_type, official_website_url, country_code,
    status, created_by
  )
  values (
    'Substance Abuse and Mental Health Services Administration',
    'government',
    'https://www.samhsa.gov/',
    'US',
    'active',
    v_actor
  )
  on conflict do nothing;

  select id into v_samhsa_org
  from public.resource_organizations
  where lower(btrim(organization_name)) = lower('Substance Abuse and Mental Health Services Administration')
    and archived_at is null
  limit 1;

  -- -------------------------------------------------------------------------
  -- Canonical resources
  -- -------------------------------------------------------------------------

  insert into public.resources (
    resource_name, resource_slug, category, subcategory,
    plain_language_purpose, participant_boundary_note,
    country_code, service_area_text, audience_text,
    verification_cadence, status, created_by
  )
  values (
    'Alcoholics Anonymous meeting support',
    'aa-meeting-support',
    'recovery_community_support',
    'mutual_support_meeting_finder',
    'Find current Alcoholics Anonymous meeting information and local A.A. support through official A.A. starting points.',
    'THRIVE provides official starting points. Local meeting details are maintained by A.A. service entities and may change.',
    'US',
    'United States and participating international A.A. service entities',
    'People who want to explore Alcoholics Anonymous meetings or local A.A. support.',
    'fast_changing',
    'active',
    v_actor
  )
  on conflict (resource_slug) do nothing;

  select id into v_aa_meetings from public.resources where resource_slug='aa-meeting-support';

  insert into public.resources (
    resource_name, resource_slug, category, subcategory,
    plain_language_purpose, participant_boundary_note,
    country_code, service_area_text, audience_text,
    verification_cadence, status, created_by
  )
  values (
    'Narcotics Anonymous meeting support',
    'na-meeting-support',
    'recovery_community_support',
    'mutual_support_meeting_finder',
    'Find local or virtual Narcotics Anonymous meeting information through NA World Services official starting points.',
    'NA World Services does not maintain one central in-person meeting database. Local NA communities maintain updated in-person meeting information.',
    'US',
    'United States and international NA communities',
    'People who want to explore Narcotics Anonymous meetings.',
    'fast_changing',
    'active',
    v_actor
  )
  on conflict (resource_slug) do nothing;

  select id into v_na_meetings from public.resources where resource_slug='na-meeting-support';

  insert into public.resources (
    resource_name, resource_slug, category, subcategory,
    plain_language_purpose, participant_boundary_note,
    country_code, service_area_text, audience_text,
    verification_cadence, status, created_by
  )
  values (
    'SMART Recovery meeting finder',
    'smart-recovery-meeting-finder',
    'recovery_community_support',
    'mutual_support_meeting_finder',
    'Find free SMART Recovery meetings online or in person through the official SMART Recovery USA meeting finder.',
    'Meeting availability changes. Use the official finder for current details.',
    'US',
    'United States',
    'People who want to explore SMART Recovery mutual-support meetings.',
    'fast_changing',
    'active',
    v_actor
  )
  on conflict (resource_slug) do nothing;

  select id into v_smart_meetings from public.resources where resource_slug='smart-recovery-meeting-finder';

  insert into public.resources (
    resource_name, resource_slug, category, subcategory,
    plain_language_purpose, participant_boundary_note,
    country_code, service_area_text, audience_text,
    verification_cadence, status, created_by
  )
  values (
    'A.A. Daily Reflections',
    'aa-daily-reflections',
    'recovery_community_support',
    'recovery_reading',
    'Open the official Alcoholics Anonymous Daily Reflections page for a daily recovery reading.',
    'Daily Reflections is copyrighted by Alcoholics Anonymous World Services. THRIVE links to the official source and should not reproduce the full reading.',
    'US',
    'Online',
    'People who want an official A.A. daily recovery reading.',
    'moderate',
    'active',
    v_actor
  )
  on conflict (resource_slug) do nothing;

  select id into v_aa_reflections from public.resources where resource_slug='aa-daily-reflections';

  insert into public.resources (
    resource_name, resource_slug, category, subcategory,
    plain_language_purpose, participant_boundary_note,
    country_code, service_area_text, audience_text,
    verification_cadence, status, created_by
  )
  values (
    'NA Recovery Literature',
    'na-recovery-literature',
    'recovery_community_support',
    'recovery_literature',
    'Browse official Narcotics Anonymous recovery pamphlets, booklets, and literature starting points.',
    'THRIVE links to the official NA source. Do not reproduce full copyrighted NA literature unless a specific use is clearly permitted.',
    'US',
    'Online / international',
    'People who want to explore official NA recovery literature.',
    'moderate',
    'active',
    v_actor
  )
  on conflict (resource_slug) do nothing;

  select id into v_na_literature from public.resources where resource_slug='na-recovery-literature';

  insert into public.resources (
    resource_name, resource_slug, category, subcategory,
    plain_language_purpose, participant_boundary_note,
    country_code, service_area_text, audience_text,
    verification_cadence, status, created_by
  )
  values (
    'SAMHSA Recovery and Support',
    'samhsa-recovery-support',
    'recovery_community_support',
    'recovery_education_peer_support',
    'Explore federal recovery-support information, peer-support material, and related recovery resources.',
    'This is a federal information starting point and does not replace participant choice or individualized professional advice.',
    'US',
    'United States',
    'People who want broader recovery-support and peer-support information.',
    'moderate',
    'active',
    v_actor
  )
  on conflict (resource_slug) do nothing;

  select id into v_samhsa_recovery from public.resources where resource_slug='samhsa-recovery-support';

  -- -------------------------------------------------------------------------
  -- Primary organizations
  -- -------------------------------------------------------------------------

  insert into public.resource_organization_roles (
    resource_id, organization_id, role_type, is_primary, status, created_by
  )
  values
    (v_aa_meetings, v_aa_org, 'primary_authority', true, 'active', v_actor),
    (v_aa_reflections, v_aa_org, 'primary_authority', true, 'active', v_actor),
    (v_na_meetings, v_na_org, 'primary_authority', true, 'active', v_actor),
    (v_na_literature, v_na_org, 'primary_authority', true, 'active', v_actor),
    (v_smart_meetings, v_smart_org, 'primary_authority', true, 'active', v_actor),
    (v_samhsa_recovery, v_samhsa_org, 'primary_authority', true, 'active', v_actor)
  on conflict do nothing;

  -- -------------------------------------------------------------------------
  -- Official access paths
  -- -------------------------------------------------------------------------

  insert into public.resource_access_paths (
    resource_id, organization_id, path_type, label,
    plain_language_instruction, url, country_code, locality_text,
    sort_order, is_primary, status, created_by
  )
  values (
    v_aa_meetings, v_aa_org, 'finder', 'Find A.A. near you',
    'Search by location to reach the closest A.A. service entity and current local meeting information.',
    'https://www.aa.org/find-aa', 'US', 'United States / participating A.A. service entities',
    1, true, 'active', v_actor
  )
  on conflict do nothing;

  insert into public.resource_access_paths (
    resource_id, organization_id, path_type, label,
    plain_language_instruction, url, country_code, locality_text,
    sort_order, is_primary, status, created_by
  )
  values (
    v_aa_meetings, v_aa_org, 'finder', 'A.A. Meeting Guide',
    'Open official Meeting Guide information for Android and iOS meeting search.',
    'https://www.aa.org/meeting-guide-app', 'US', 'United States / Canada / participating service entities',
    2, false, 'active', v_actor
  )
  on conflict do nothing;

  insert into public.resource_access_paths (
    resource_id, organization_id, path_type, label,
    plain_language_instruction, url, country_code, locality_text,
    sort_order, is_primary, status, created_by
  )
  values (
    v_na_meetings, v_na_org, 'finder', 'Find NA',
    'Find the closest NA community for current in-person meeting information or use NA virtual meeting resources.',
    'https://na.org/MeetingSearch/', 'US', 'United States / international',
    1, true, 'active', v_actor
  )
  on conflict do nothing;

  insert into public.resource_access_paths (
    resource_id, organization_id, path_type, label,
    plain_language_instruction, url, country_code, locality_text,
    sort_order, is_primary, status, created_by
  )
  values (
    v_smart_meetings, v_smart_org, 'finder', 'Find a SMART Recovery meeting',
    'Search by city and state or ZIP code for current in-person or online meetings.',
    'https://meetings.smartrecovery.org/meetings/', 'US', 'United States',
    1, true, 'active', v_actor
  )
  on conflict do nothing;

  insert into public.resource_access_paths (
    resource_id, organization_id, path_type, label,
    plain_language_instruction, url, country_code, locality_text,
    sort_order, is_primary, status, created_by
  )
  values (
    v_aa_reflections, v_aa_org, 'landing_page', 'Read today''s A.A. Daily Reflection',
    'Open the official A.A. Daily Reflections page to read today''s reflection.',
    'https://www.aa.org/daily-reflections', 'US', 'Online',
    1, true, 'active', v_actor
  )
  on conflict do nothing;

  insert into public.resource_access_paths (
    resource_id, organization_id, path_type, label,
    plain_language_instruction, url, country_code, locality_text,
    sort_order, is_primary, status, created_by
  )
  values (
    v_na_literature, v_na_org, 'landing_page', 'Browse NA recovery literature',
    'Open the official NA Recovery Literature page to browse recovery material and free literature.',
    'https://na.org/literature/', 'US', 'Online / international',
    1, true, 'active', v_actor
  )
  on conflict do nothing;

  insert into public.resource_access_paths (
    resource_id, organization_id, path_type, label,
    plain_language_instruction, url, country_code, locality_text,
    sort_order, is_primary, status, created_by
  )
  values (
    v_samhsa_recovery, v_samhsa_org, 'landing_page', 'Explore SAMHSA recovery support',
    'Open the SAMHSA Recovery and Support page for peer-support and recovery information.',
    'https://www.samhsa.gov/substance-use/recovery', 'US', 'United States',
    1, true, 'active', v_actor
  )
  on conflict do nothing;

  -- -------------------------------------------------------------------------
  -- Participant guidance
  -- -------------------------------------------------------------------------

  insert into public.resource_guidance_sections (
    resource_id, section_type, heading, content, sort_order, status, created_by
  )
  values
    (v_aa_meetings, 'what_this_is', 'What this gives you', 'Official A.A. starting points for current local meeting information and Meeting Guide.', 1, 'active', v_actor),
    (v_aa_meetings, 'important_note', 'Why THRIVE sends you here', 'A.A. local service entities maintain detailed meeting information, so the official finder is more reliable than a copied meeting list.', 2, 'active', v_actor),
    (v_na_meetings, 'what_this_is', 'What this gives you', 'An official NA route to local communities for current in-person meetings and virtual meeting resources.', 1, 'active', v_actor),
    (v_na_meetings, 'important_note', 'Why THRIVE sends you here', 'NA World Services says local NA communities maintain current in-person meeting information.', 2, 'active', v_actor),
    (v_smart_meetings, 'what_this_is', 'What this gives you', 'The official SMART Recovery USA meeting finder for in-person and online mutual-support meetings.', 1, 'active', v_actor),
    (v_aa_reflections, 'important_note', 'About the reading', 'THRIVE opens the official source because Daily Reflections is copyrighted material.', 1, 'active', v_actor),
    (v_na_literature, 'what_this_is', 'What this gives you', 'An official NA starting point for recovery literature and free literature resources.', 1, 'active', v_actor),
    (v_samhsa_recovery, 'what_this_is', 'What this gives you', 'A federal starting point for recovery-support and peer-support information.', 1, 'active', v_actor)
  on conflict do nothing;

  -- -------------------------------------------------------------------------
  -- Workspace visibility
  -- -------------------------------------------------------------------------

  insert into public.resource_visibility (
    resource_id, workspace_id, program_id, scope_type, status, created_by
  )
  values
    (v_aa_meetings, v_workspace, null, 'workspace', 'active', v_actor),
    (v_na_meetings, v_workspace, null, 'workspace', 'active', v_actor),
    (v_smart_meetings, v_workspace, null, 'workspace', 'active', v_actor),
    (v_aa_reflections, v_workspace, null, 'workspace', 'active', v_actor),
    (v_na_literature, v_workspace, null, 'workspace', 'active', v_actor),
    (v_samhsa_recovery, v_workspace, null, 'workspace', 'active', v_actor)
  on conflict do nothing;

  -- -------------------------------------------------------------------------
  -- Verification evidence
  -- -------------------------------------------------------------------------

  insert into public.resource_verifications (
    resource_id, access_path_id, organization_id,
    verification_scope, verification_status, verified_on,
    verified_by, source_url, verification_note, next_review_on
  )
  select
    rap.resource_id,
    rap.id,
    rap.organization_id,
    'access_path',
    'verified',
    date '2026-09-30',
    v_actor,
    rap.url,
    'Official access path reviewed during THRIVE Recovery Support candidate preparation.',
    case
      when r.verification_cadence = 'fast_changing' then date '2026-10-31'
      else date '2026-12-31'
    end
  from public.resource_access_paths rap
  join public.resources r on r.id = rap.resource_id
  where rap.resource_id in (
    v_aa_meetings, v_na_meetings, v_smart_meetings,
    v_aa_reflections, v_na_literature, v_samhsa_recovery
  )
    and rap.status = 'active'
    and rap.archived_at is null;

end $$;

-- Review-only candidate intentionally ends with rollback.
rollback;
