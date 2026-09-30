# THRIVE Recovery Resource Content Candidate v0.1

Date: 2026-09-30
Status: review-only content candidate
Parent: THRIVE Vertical Proving Slice v0.1
Production impact: none
Database impact: none at this gate
Trust Engine impact: none

## Purpose

Prepare the first small, verified Recovery Support resource set for the vertical proving slice.

The live Resources subsystem already exists and is working. This candidate grows content only. It does not propose a new Resources schema.

## Current live Resource baseline

Current useful participant-visible Resources:

- Florida MyACCESS
- Social Security Administration
- 211 Broward
- 211 Palm Beach & Treasure Coast

Two additional active rows are synthetic test records and are not product content.

The current Recovery & community support category exists in code, but the live canonical library has no real recovery-support content yet.

## Content standard

Every Recovery Resource candidate must include:

- official organization / authority;
- official URL;
- clear participant-friendly purpose;
- access-path type;
- plain-language next step;
- service area / online availability;
- verification date;
- verification cadence;
- source provenance;
- copyright-safe guidance.

No scraped unofficial meeting lists should be treated as canonical meeting truth.

## Candidate 1 — Alcoholics Anonymous: Find A.A. Near You

**Organization:** Alcoholics Anonymous World Services / General Service Office

**Category:** recovery_community_support

**Subcategory:** mutual_support_meeting_finder

**Purpose:**
Find local A.A. service entities and meeting information near a city, ZIP code, state/province, or current location.

**Primary access path:** finder

**Participant label:** Find A.A. near me

**Plain-language instruction:**
Search by city, ZIP code, or state to find the closest A.A. service office and current local meeting information. For phone or online meetings, A.A. also points to its Meeting Guide and Online Intergroup options.

**Official URL:** https://www.aa.org/find-aa

**Service area:** United States / international directory

**Why this belongs in THRIVE:**
A.A. explicitly directs people to local service entities because detailed in-person meeting information is maintained locally. This makes the official finder a better canonical source than copying local meeting lists into THRIVE.

**Verification date:** 2026-09-30

**Verification cadence candidate:** monthly

## Candidate 2 — Alcoholics Anonymous: Meeting Guide

**Organization:** Alcoholics Anonymous World Services

**Category:** recovery_community_support

**Subcategory:** meeting_finder_app

**Purpose:**
Find current in-person and online A.A. meetings using meeting data supplied by A.A. service entities.

**Primary access path:** finder / app information

**Participant label:** Open A.A. Meeting Guide

**Plain-language instruction:**
Use Meeting Guide to search by location or keyword and see meeting time, location, format, and notes. Meeting Guide is available for Android and iOS.

**Official URL:** https://www.aa.org/meeting-guide-app

**Service area:** United States / Canada / participating A.A. service entities

**Operational note:**
A.A. states that Meeting Guide receives data from more than 500 service entities, lists more than 150,000 weekly meetings, and refreshes information twice daily.

**Verification date:** 2026-09-30

**Verification cadence candidate:** monthly

## Candidate 3 — Narcotics Anonymous World Services: Find NA

**Organization:** Narcotics Anonymous World Services

**Category:** recovery_community_support

**Subcategory:** mutual_support_meeting_finder

**Purpose:**
Find the closest NA community for current in-person meeting information or use NA's virtual meeting finder.

**Primary access path:** finder

**Participant label:** Find NA near me

**Plain-language instruction:**
Search by city, state/province, or postal code to find the closest NA community and its local meeting information. Use the virtual meeting option if you want an online meeting.

**Official URL:** https://na.org/MeetingSearch/

**Service area:** United States / international

**Important source note:**
NA World Services states that it does not maintain a central database of in-person NA meetings. Local NA communities maintain current in-person meeting information. THRIVE should therefore link to the official NA finder rather than copy an unofficial static meeting list.

**Verification date:** 2026-09-30

**Verification cadence candidate:** monthly

## Candidate 4 — SMART Recovery USA Meeting Finder

**Organization:** SMART Recovery USA

**Category:** recovery_community_support

**Subcategory:** mutual_support_meeting_finder

**Purpose:**
Find free SMART Recovery meetings in person or online.

**Primary access path:** finder

**Participant label:** Find a SMART Recovery meeting

**Plain-language instruction:**
Enter a city and state or ZIP code to find nearby in-person or online meetings. Results can include meeting type, time, location, and joining information.

**Official URL:** https://meetings.smartrecovery.org/meetings/

**Service area:** United States

**Participant guidance candidate:**
SMART Recovery meetings are free mutual-support meetings focused on addictive or problematic behaviors. Meetings are facilitated by trained volunteers and are available online and in person.

**Verification date:** 2026-09-30

**Verification cadence candidate:** monthly

## Candidate 5 — Alcoholics Anonymous: Daily Reflections

**Organization:** Alcoholics Anonymous World Services

**Category:** recovery_community_support

**Subcategory:** recovery_reading

**Purpose:**
Provide a daily official A.A. reflection that a participant may choose to read.

**Primary access path:** landing_page

**Participant label:** Read today's A.A. Daily Reflection

**Plain-language instruction:**
Open the official A.A. Daily Reflections page to read or listen to today's reflection.

**Official URL:** https://www.aa.org/daily-reflections

**Copyright handling:**
THRIVE should link to or summarize the official page. Do not reproduce the full Daily Reflection inside THRIVE. A.A. explicitly retains copyright.

**Verification date:** 2026-09-30

**Verification cadence candidate:** quarterly for access-path health; content changes daily at the official source

## Candidate 6 — Narcotics Anonymous World Services: Recovery Literature

**Organization:** Narcotics Anonymous World Services

**Category:** recovery_community_support

**Subcategory:** recovery_literature

**Purpose:**
Give the participant an official starting point for NA recovery pamphlets, booklets, and free literature.

**Primary access path:** landing_page

**Participant label:** Browse NA recovery literature

**Plain-language instruction:**
Open the official NA recovery literature page to browse available pamphlets, booklets, languages, and free literature.

**Official URL:** https://na.org/literature/

**Copyright handling:**
Use the official NA page as the access point. Do not copy full copyrighted NA literature into THRIVE unless the specific item and use are clearly permitted.

**Verification date:** 2026-09-30

**Verification cadence candidate:** quarterly

## Candidate 7 — SAMHSA Recovery and Support

**Organization:** Substance Abuse and Mental Health Services Administration

**Category:** recovery_community_support

**Subcategory:** recovery_education_peer_support

**Purpose:**
Provide a federal recovery-support starting point with peer-support and recovery resources.

**Primary access path:** landing_page

**Participant label:** Explore SAMHSA recovery support

**Plain-language instruction:**
Use SAMHSA's Recovery and Support page to explore peer support, recovery publications, and related recovery resources.

**Official URL:** https://www.samhsa.gov/substance-use/recovery

**Service area:** United States

**Verification date:** 2026-09-30

**Verification cadence candidate:** quarterly

## First proving-slice display priority

For the first Recovery Support flow, do not show all seven options at once.

### Find a meeting

Primary choices:

1. A.A. Meeting Guide / Find A.A.
2. NA Find NA
3. SMART Recovery Meeting Finder

Then:
- Show another option
- Online meeting options

### Read something

Primary choices:

1. A.A. Daily Reflections
2. NA Recovery Literature
3. SAMHSA Recovery and Support

THRIVE may later learn participant preferences only after a separately approved persistence model.

## Live meeting results vs official finders

The visual concept board showed direct meeting cards with time, distance, and directions.

That remains a target experience, but the first coded slice must not fabricate or freeze meeting listings.

Implementation sequence:

1. first prove the flow with verified official meeting finders;
2. determine whether an approved live meeting-data source / API / embeddable feed exists;
3. only then render direct current meeting cards from live data;
4. otherwise keep the participant one tap from the official finder.

## Candidate insert posture

No SQL is authorized.

If this content candidate is approved, prepare a separate insert/activation candidate using the existing:

- resources
- resource_organizations
- resource_organization_roles
- resource_access_paths
- resource_guidance_sections
- resource_verifications
- resource_visibility

No new table should be created for this first content set.

## Review questions

- Are A.A., NA, SMART Recovery, and SAMHSA the right first set?
- Should all four organizations be visible equally, or should THRIVE lead with "Choose what fits you"?
- Should literature be its own Recovery Support path or remain inside Resources?
- Is the first version acceptable if exact local meetings open through official meeting finders rather than being rendered directly inside THRIVE?
- Is the participant-facing language neutral enough to support multiple recovery approaches without flattening them into generic content?

## Next gate

After content approval:

1. prepare canonical Resource insert candidate;
2. verify each official access path again immediately before install;
3. install only after explicit approval;
4. verify participant visibility and mobile opening behavior.
