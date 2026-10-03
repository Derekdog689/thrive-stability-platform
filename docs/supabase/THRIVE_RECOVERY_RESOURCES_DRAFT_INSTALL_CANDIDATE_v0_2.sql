-- THRIVE Recovery Resources Draft Install Candidate v0.2
-- Date: 2026-10-02
-- Branch: feature/recovery-vertical-slice-v0-2
-- REVIEW ONLY. DO NOT EXECUTE FROM A SERVICE-ROLE / SQL-EDITOR SESSION.
--
-- Purpose:
-- Prepare six canonical Recovery Resources using the existing Admin lifecycle.
-- This candidate intentionally relies on auth.uid() through installed Admin RPCs.
-- It is not a migration and creates no new tables.
--
-- Frozen boundaries:
-- - all Resources begin as draft
-- - workspace visibility begins paused
-- - no participant visibility until separate activation approval
-- - no automatic Support request
-- - no attendance/read/contact/completion inference
-- - no hard delete
-- - no Trust Engine synchronization
--
-- Target workspace:
-- THRIVE Personal Stability
-- 211d2c03-e2ac-4205-96b2-9a821b8bc6bd
--
-- IMPORTANT:
-- Execute only through an authenticated THRIVE Admin session or another separately
-- approved actor-preserving path. admin_create_resource_draft() and
-- admin_add_resource_organization() use auth.uid() for provenance.
--
-- Verification/access-path/guidance rows are intentionally listed below as
-- candidate payloads and must be authored by the authenticated Admin before
-- activation. admin_activate_resource() remains a separate approval gate.


-- ============================================================================
-- RESOURCE 1
-- Alcoholics Anonymous Meeting Support
-- ============================================================================

-- select public.admin_create_resource_draft(
--   p_workspace_id => '211d2c03-e2ac-4205-96b2-9a821b8bc6bd',
--   p_program_id => null,
--   p_scope_type => 'workspace',
--   p_resource_name => 'Alcoholics Anonymous Meeting Support',
--   p_resource_slug => 'alcoholics-anonymous-meeting-support',
--   p_category => 'recovery_community_support',
--   p_subcategory => 'mutual_support_meeting_finder',
--   p_plain_language_purpose => 'Help a participant find current A.A. meeting information and local A.A. support.',
--   p_participant_boundary_note => 'THRIVE provides official starting points. A.A. and its local service entities maintain their own meeting information, program practices, and services.',
--   p_country_code => 'US',
--   p_state_code => null,
--   p_county_name => null,
--   p_service_area_text => 'United States and participating international A.A. service entities',
--   p_audience_text => null,
--   p_verification_cadence => 'fast_changing'
-- );

-- Organization:
-- Alcoholics Anonymous World Services
-- official website: https://www.aa.org/
-- role: primary_authority
--
-- Access path A (primary):
-- path_type: finder
-- label: Find A.A. near you
-- url: https://www.aa.org/find-aa
-- instruction: Search by city, ZIP code, or state to find current local A.A. service and meeting information.
--
-- Access path B:
-- path_type: finder
-- label: Open A.A. Meeting Guide
-- url: https://www.aa.org/meeting-guide-app
-- instruction: Use the official Meeting Guide starting point for current in-person and online meeting information.


-- ============================================================================
-- RESOURCE 2
-- Narcotics Anonymous Meeting Support
-- ============================================================================

-- select public.admin_create_resource_draft(
--   p_workspace_id => '211d2c03-e2ac-4205-96b2-9a821b8bc6bd',
--   p_program_id => null,
--   p_scope_type => 'workspace',
--   p_resource_name => 'Narcotics Anonymous Meeting Support',
--   p_resource_slug => 'narcotics-anonymous-meeting-support',
--   p_category => 'recovery_community_support',
--   p_subcategory => 'mutual_support_meeting_finder',
--   p_plain_language_purpose => 'Help a participant find current local or virtual Narcotics Anonymous meeting information.',
--   p_participant_boundary_note => 'THRIVE links to the official NA starting point. Local NA communities maintain current in-person meeting information and NA defines its own program practices.',
--   p_country_code => 'US',
--   p_state_code => null,
--   p_county_name => null,
--   p_service_area_text => 'United States and international NA communities',
--   p_audience_text => null,
--   p_verification_cadence => 'fast_changing'
-- );

-- Organization:
-- Narcotics Anonymous World Services
-- official website: https://na.org/
-- role: primary_authority
--
-- Access path:
-- path_type: finder
-- label: Find an NA meeting
-- url: https://na.org/MeetingSearch/
-- instruction: Search for the nearest NA community or use the virtual meeting option for online meetings.


-- ============================================================================
-- RESOURCE 3
-- SMART Recovery Meeting Finder
-- ============================================================================

-- select public.admin_create_resource_draft(
--   p_workspace_id => '211d2c03-e2ac-4205-96b2-9a821b8bc6bd',
--   p_program_id => null,
--   p_scope_type => 'workspace',
--   p_resource_name => 'SMART Recovery Meeting Finder',
--   p_resource_slug => 'smart-recovery-meeting-finder',
--   p_category => 'recovery_community_support',
--   p_subcategory => 'mutual_support_meeting_finder',
--   p_plain_language_purpose => 'Help a participant find SMART Recovery mutual-support meetings online or in person.',
--   p_participant_boundary_note => 'THRIVE provides the official SMART Recovery starting point. SMART Recovery maintains its meeting information, program practices, and participation structure.',
--   p_country_code => 'US',
--   p_state_code => null,
--   p_county_name => null,
--   p_service_area_text => 'United States and online',
--   p_audience_text => null,
--   p_verification_cadence => 'fast_changing'
-- );

-- Organization:
-- SMART Recovery USA
-- official website: https://smartrecovery.org/
-- role: primary_authority
--
-- Access path:
-- path_type: finder
-- label: Find a SMART Recovery meeting
-- url: https://meetings.smartrecovery.org/meetings/
-- instruction: Search by city, state, or ZIP code for in-person and online meeting options.


-- ============================================================================
-- RESOURCE 4
-- Celebrate Recovery Group Support
-- ============================================================================

-- select public.admin_create_resource_draft(
--   p_workspace_id => '211d2c03-e2ac-4205-96b2-9a821b8bc6bd',
--   p_program_id => null,
--   p_scope_type => 'workspace',
--   p_resource_name => 'Celebrate Recovery Group Support',
--   p_resource_slug => 'celebrate-recovery-group-support',
--   p_category => 'recovery_community_support',
--   p_subcategory => 'christ_centered_mutual_support',
--   p_plain_language_purpose => 'Provide a Christ-centered recovery community option for participants who want that kind of support around addiction, habits, hurts, or other life struggles.',
--   p_participant_boundary_note => 'THRIVE offers Celebrate Recovery as one participant-chosen recovery-support approach. Celebrate Recovery defines its own faith-based program, beliefs, group practices, and participation structure. THRIVE does not provide religious instruction on its behalf.',
--   p_country_code => 'US',
--   p_state_code => null,
--   p_county_name => null,
--   p_service_area_text => 'United States, international groups, and online',
--   p_audience_text => null,
--   p_verification_cadence => 'fast_changing'
-- );

-- Organization:
-- Celebrate Recovery
-- official website: https://celebraterecovery.com/
-- role: primary_authority
--
-- Access path A (primary):
-- path_type: finder
-- label: Find a Celebrate Recovery group
-- url: https://locator.crgroups.info/
-- instruction: Use the official locator to search for a nearby Celebrate Recovery group.
--
-- Access path B:
-- path_type: landing_page
-- label: Join a weekly online recovery meeting
-- url: https://celebraterecovery.com/weekly-online-recovery-meetings/
-- instruction: Open the official weekly online meeting page for current access information.


-- ============================================================================
-- RESOURCE 5
-- A.A. Daily Reflections
-- ============================================================================

-- select public.admin_create_resource_draft(
--   p_workspace_id => '211d2c03-e2ac-4205-96b2-9a821b8bc6bd',
--   p_program_id => null,
--   p_scope_type => 'workspace',
--   p_resource_name => 'A.A. Daily Reflections',
--   p_resource_slug => 'aa-daily-reflections',
--   p_category => 'recovery_community_support',
--   p_subcategory => 'recovery_reading',
--   p_plain_language_purpose => 'Give a participant an official A.A. daily recovery reading option.',
--   p_participant_boundary_note => 'THRIVE links to the official source and may provide brief navigation or context. THRIVE does not reproduce copyrighted A.A. Daily Reflections content.',
--   p_country_code => 'US',
--   p_state_code => null,
--   p_county_name => null,
--   p_service_area_text => 'Online',
--   p_audience_text => null,
--   p_verification_cadence => 'moderate'
-- );

-- Organization:
-- Alcoholics Anonymous World Services
-- official website: https://www.aa.org/
-- role: primary_authority
--
-- Access path:
-- path_type: landing_page
-- label: Read today's A.A. Daily Reflection
-- url: https://www.aa.org/daily-reflections
-- instruction: Open the official A.A. Daily Reflections page to read or listen to today's reflection.


-- ============================================================================
-- RESOURCE 6
-- NA Recovery Literature
-- ============================================================================

-- select public.admin_create_resource_draft(
--   p_workspace_id => '211d2c03-e2ac-4205-96b2-9a821b8bc6bd',
--   p_program_id => null,
--   p_scope_type => 'workspace',
--   p_resource_name => 'NA Recovery Literature',
--   p_resource_slug => 'na-recovery-literature',
--   p_category => 'recovery_community_support',
--   p_subcategory => 'recovery_literature',
--   p_plain_language_purpose => 'Give a participant an official starting point for NA recovery literature, pamphlets, booklets, and readings.',
--   p_participant_boundary_note => 'THRIVE provides access to the official NA source rather than copying NA literature into THRIVE. NA World Services maintains its own literature and permissions.',
--   p_country_code => 'US',
--   p_state_code => null,
--   p_county_name => null,
--   p_service_area_text => 'Online',
--   p_audience_text => null,
--   p_verification_cadence => 'moderate'
-- );

-- Organization:
-- Narcotics Anonymous World Services
-- official website: https://na.org/
-- role: primary_authority
--
-- Access path:
-- path_type: landing_page
-- label: Browse NA recovery literature
-- url: https://na.org/literature/
-- instruction: Open the official NA literature page to browse current pamphlets, booklets, languages, and available recovery readings.


-- ============================================================================
-- COMMON GUIDANCE CANDIDATE
-- ============================================================================

-- Meeting-support Resources:
-- what_this_is:
--   "A verified official starting point for finding recovery meetings or community support."
-- start_here:
--   "Open the official finder and search by location, ZIP code, or online availability where supported."
-- important_note:
--   "Opening a finder does not mean you attended a meeting. THRIVE only treats attendance as completed when you tell THRIVE that it happened."
--
-- Reading Resources:
-- what_this_is:
--   "An official recovery reading or literature source."
-- start_here:
--   "Open the official source and choose what interests you."
-- important_note:
--   "THRIVE does not assume you read something just because you opened the page."


-- ============================================================================
-- VERIFICATION CANDIDATE
-- ============================================================================

-- For every Resource:
-- 1. resource_identity = verified
-- 2. official_domain = verified
-- 3. each participant-facing access path = verified
--
-- verified_by must remain the authenticated Admin user.
-- source_url must be the exact official source reviewed.
-- next_review_on:
--   fast_changing -> approximately 90 days or sooner if operationally preferred
--   moderate      -> approximately 6 months
--
-- The manually reviewed access paths for this candidate were approved by the
-- product owner on 2026-10-02. The install actor must still record the actual
-- Admin-authored verification event at installation time.


-- ============================================================================
-- ACTIVATION
-- ============================================================================

-- DO NOT ACTIVATE IN THIS GATE.
--
-- Separate later approval:
-- select public.admin_activate_resource(
--   p_resource_id => '<resource uuid>',
--   p_workspace_id => '211d2c03-e2ac-4205-96b2-9a821b8bc6bd',
--   p_program_id => null
-- );
