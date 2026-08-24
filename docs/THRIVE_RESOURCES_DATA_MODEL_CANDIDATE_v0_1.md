# THRIVE Resources / Guided Reference Data Model Candidate v0.1

**Date:** 2026-08-23
**Repository:** `thrive-stability-platform`
**Branch:** `main`
**Status:** Review-only data-model candidate

## Purpose

Translate the validated Resources / Guided Reference product contract into a database candidate that fits the live THRIVE schema without creating participant conclusions, auto-referrals, or a parallel authority system.

This document is a candidate only. It does not authorize SQL execution, table creation, RLS installation, seed data, UI implementation, production ingestion, or Trust Engine work.

## Live schema findings that shape this candidate

A read-only inspection of the current `public` schema on 2026-08-23 confirms that THRIVE already has these important structural patterns:

- `workspaces` provide top-level operating scope;
- `programs` are scoped to a workspace;
- `supported_people` are scoped to a workspace;
- `program_participants` connects a supported person to a program within a workspace;
- participant-owned flows such as Wellness, Goals, Budget, Financial Activity, and Support use workspace/program/person scope;
- `support_requests` has a dedicated lifecycle with entries, status events, and linked context;
- lifecycle states use non-destructive patterns such as active, paused, completed, withdrawn, inactive, archived;
- existing participant data models preserve provenance through creator, timestamps, status, and scoped foreign keys.

These findings argue against making the core resource library participant-owned.

## Core architecture decision

Resources should be separated into two conceptual layers:

### A. Curated reference layer

A maintained library of verified resources, organizations, official access paths, geography, plain-language guidance, and verification records.

This layer describes outside systems and sources. It does not belong to one participant.

### B. Participant interaction layer

Optional participant-specific events such as:

- opening or viewing a resource;
- choosing to ask Support for help using a resource;
- linking a Support request to a resource.

Participant interaction must remain separate from the resource's authoritative content.

## Candidate table set

The smallest reusable candidate that survived all three prototypes is five tables.

### 1. `resource_organizations`

Purpose: represent the organizations connected to a resource without forcing parent authority, local maintainer, and data source into one field.

Candidate fields:

- `id uuid primary key`
- `organization_name text not null`
- `organization_type text not null`
  - candidate values: `government`, `nonprofit`, `university`, `institution`, `professional_association`, `other_verified`
- `official_website_url text null`
- `country_code text null`
- `status text not null default 'active'`
  - candidate values: `active`, `inactive`, `archived`
- `created_by uuid not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `archived_at timestamptz null`

Notes:

This table identifies organizations. It does not by itself say what role the organization plays for a particular resource.

### 2. `resources`

Purpose: represent the stable THRIVE concept the participant sees, such as:

- Florida Food Assistance / SNAP;
- Find an A.A. meeting or local A.A. contact;
- Replace a Florida driver license or ID card.

Candidate fields:

- `id uuid primary key`
- `workspace_id uuid null`
- `resource_name text not null`
- `resource_slug text not null`
- `category text not null`
- `subcategory text null`
- `plain_language_purpose text not null`
- `participant_boundary_note text null`
- `country_code text null`
- `state_code text null`
- `county_name text null`
- `service_area_text text null`
- `audience_text text null`
- `status text not null default 'draft'`
  - candidate values: `draft`, `active`, `paused`, `inactive`, `archived`
- `created_by uuid not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `archived_at timestamptz null`

### Workspace scope question

This candidate intentionally leaves `workspace_id` nullable pending governance review.

Reason:

Some resources may be globally reusable across THRIVE, while DSS may later need workspace-specific or program-specific resources.

Do not resolve this by assumption. The installation candidate should explicitly decide whether v0.1 resources are:

- global curated records;
- workspace-owned records;
- or global records with workspace visibility mappings.

For MVP simplicity, a single DSS-maintained global library may be preferable, but that decision is not frozen by this document.

### 3. `resource_organization_roles`

Purpose: connect resources to organizations and describe the organization's role for that resource.

Candidate fields:

- `id uuid primary key`
- `resource_id uuid not null`
- `organization_id uuid not null`
- `role_type text not null`
  - candidate values: `primary_authority`, `service_provider`, `local_maintainer`, `listing_source`, `research_source`, `other`
- `is_primary boolean not null default false`
- `status text not null default 'active'`
- `created_by uuid not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `archived_at timestamptz null`

Why this exists:

The A.A. test proved that central authority, local meeting-data maintainer, and listing source can differ.

### 4. `resource_access_paths`

Purpose: represent all official ways a participant may reach or use the resource without creating one URL column for every possible action.

Candidate fields:

- `id uuid primary key`
- `resource_id uuid not null`
- `organization_id uuid null`
- `path_type text not null`
  - candidate values: `landing_page`, `direct_action`, `instructions`, `finder`, `office_locator`, `phone`, `email`, `document`, `fallback`, `other`
- `label text not null`
- `plain_language_instruction text null`
- `url text null`
- `phone text null`
- `email text null`
- `country_code text null`
- `state_code text null`
- `locality_text text null`
- `sort_order integer not null default 0`
- `is_primary boolean not null default false`
- `status text not null default 'active'`
- `created_by uuid not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `archived_at timestamptz null`

Candidate rule:

At least one reachable value should exist for an active access path, such as URL, phone, or email.

Why this exists:

All three prototypes showed multiple useful paths:

- SNAP: portal, application, instructions, help contact;
- A.A.: central finder, local service resource, Meeting Guide;
- FLHSMV: online portal, requirements guidance, office finder.

### 5. `resource_verifications`

Purpose: preserve evidence that THRIVE checked a resource without overstating what was verified.

Candidate fields:

- `id uuid primary key`
- `resource_id uuid not null`
- `access_path_id uuid null`
- `organization_id uuid null`
- `verification_scope text not null`
  - candidate values: `resource_identity`, `official_domain`, `access_path`, `contact_information`, `published_guidance`, `service_area`, `other`
- `verification_status text not null`
  - candidate values: `verified`, `needs_review`, `unable_to_verify`, `superseded`
- `verified_on date not null`
- `verified_by uuid not null`
- `source_url text null`
- `verification_note text null`
- `next_review_on date null`
- `created_at timestamptz not null default now()`

Why this exists:

THRIVE may verify that A.A.'s official meeting finder is genuine without claiming DSS independently verified each individual meeting listed inside it.

The verification record must say what THRIVE actually checked.

## Plain-language guidance storage

The three prototypes also need reusable guidance beyond the one-sentence resource purpose.

There are two candidate approaches.

### Option A: keep a small number of columns on `resources`

Possible fields:

- `start_here_text`
- `what_you_can_do_text`
- `how_it_works_text`
- `what_to_have_ready_text`
- `fallback_text`

Advantages:

- simple MVP;
- easy participant rendering;
- fewer tables.

Limitations:

- becomes rigid as different resource types need different guidance sections;
- difficult to order, add, or retire sections independently.

### Option B: `resource_guidance_sections`

Candidate fields:

- `id uuid primary key`
- `resource_id uuid not null`
- `section_type text not null`
  - candidate values: `what_this_is`, `start_here`, `what_you_can_do`, `how_it_works`, `what_to_have_ready`, `important_note`, `fallback`, `other`
- `heading text not null`
- `content text not null`
- `source_access_path_id uuid null`
- `sort_order integer not null default 0`
- `status text not null default 'active'`
- `created_by uuid not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `archived_at timestamptz null`

### Candidate recommendation

Prefer **Option B** if Resources is expected to grow beyond the first 20-40 curated records.

It better preserves the distinction between:

- THRIVE plain-language explanation;
- the official source supporting that explanation;
- the participant-facing order of sections.

However, this is not yet approved for installation.

## Optional Support bridge

The existing live schema already has `support_request_links` for linking Support requests to contextual THRIVE records.

A future Resources implementation should probably extend that existing pattern rather than create a second support-link system.

Candidate future change:

- add nullable `resource_id` to `support_request_links`;
- optionally add nullable `resource_access_path_id` only if the exact path matters.

Rules:

- viewing a resource never creates a Support request;
- opening `Need help using this?` may carry visible resource context into the existing Support create flow;
- the participant must still intentionally submit the request;
- linked resource context does not establish eligibility, recommendation, diagnosis, or authority.

This candidate does **not** authorize altering `support_request_links` yet.

## Participant interaction tracking

No participant-resource tracking table is required for the first read-only Resources MVP unless there is a clearly defined participant benefit.

Avoid collecting view history merely because it is technically possible.

If a later product need requires participant-owned resource bookmarks or saved references, that should be a separate candidate such as:

`participant_resource_saves`

with workspace/program/person scope.

Do not use passive browsing history as a proxy for need, intent, diagnosis, eligibility, relapse risk, incapacity, or support priority.

## Geography model

The three prototypes show that geography matters, but v0.1 does not need a full GIS model.

Candidate MVP geography:

- country code;
- state code;
- optional county/locality text;
- human-readable service area;
- access paths may carry narrower geography than the parent resource.

Example:

A.A. may have a national parent resource with local service access paths.

Do not overbuild geographic tables until the curated set proves they are needed.

## Category model

Candidate first-wave participant categories may include:

- food and basic needs;
- recovery and community connection;
- identification and documents;
- employment and education;
- transportation;
- housing information;
- health-system navigation;
- financial education;
- government benefits;
- legal-information references;
- technology and account access;
- other / not sure.

These are navigation categories, not diagnoses or determinations of need.

A participant choosing a category is participant intent.

## Maintenance workflow candidate

The resource lifecycle should follow the project's existing non-destructive pattern.

Candidate states:

### `draft`

Resource is being prepared and is not participant-visible.

### `active`

Resource is verified enough for participant use under the approved standard.

### `paused`

Temporarily hidden because a link, contact, rule, or source needs review.

### `inactive`

No longer offered as a current participant resource.

### `archived`

Preserved as historical reference and not shown as current guidance.

No hard delete is needed in the MVP.

## Verification workflow candidate

A lightweight DSS maintenance loop could be:

1. create or update candidate resource;
2. open the official source;
3. verify organization and domain;
4. verify participant-facing access paths;
5. compare THRIVE paraphrase to official meaning;
6. record verification scope and date;
7. activate only after review;
8. schedule or flag future re-verification;
9. pause a resource when material uncertainty appears rather than leaving questionable guidance active.

## Source confidence rule

Do not reduce trust to a vague numeric score.

Use explicit facts instead:

- source is official government agency;
- source is the service provider's official site;
- source is an institutional research source;
- THRIVE verified the domain on a stated date;
- THRIVE verified a specific access path on a stated date.

This is easier to explain and audit than `trust_score = 87`.

## No automated eligibility or recommendation fields

The candidate intentionally does not include fields such as:

- `eligible_for`;
- `recommended_for_participant`;
- `risk_match`;
- `clinical_match`;
- `priority_score`;
- `relapse_risk_match`;
- `financial_need_score`.

Those would collapse guidance into conclusions and are outside the approved Resources purpose.

## Example mapping: Florida SNAP

### `resources`

- Florida Food Assistance / SNAP
- category: food and basic needs
- geography: Florida
- purpose: official starting point for Florida Food Assistance information and application navigation

### `resource_organizations`

- Florida Department of Children and Families
- organization type: government

### organization role

- primary authority

### access paths

- MyACCESS landing page
- application starting point
- DCF applying-for-assistance guidance
- official help / call center

### verifications

Separate records for:

- official domain;
- portal access path;
- application guidance;
- contact information.

## Example mapping: A.A.

### `resources`

- Find an A.A. meeting or local A.A. contact
- category: recovery and community connection
- geography: national / local finder

### organizations and roles

- Alcoholics Anonymous World Services / central authority
- local A.A. service entity / local maintainer when relevant

### access paths

- Find A.A. Near You
- Meeting Guide information
- local service path returned by official finder

### verification boundary

THRIVE verifies the official finder and source relationship, not every live meeting time shown by the external system.

## Example mapping: Florida ID replacement

### `resources`

- Replace a Florida driver license or ID card
- category: identification and documents
- geography: Florida

### organization

- Florida Department of Highway Safety and Motor Vehicles

### access paths

- MyDMV Portal
- official requirements guidance
- FLHSMV office finder

### guidance boundary

THRIVE may paraphrase general preparation information but does not certify that a participant's documents will satisfy FLHSMV requirements.

## Candidate relationship sketch

```text
resource_organizations
        ^
        |
resource_organization_roles
        |
        v
     resources
      /    |    \
     /     |     \
resource_  |  resource_
access_    |  verifications
paths      |
           v
resource_guidance_sections   [candidate preferred]

resources
   |
   | future optional context link
   v
support_request_links -> support_requests
```

## Security / RLS direction for a later candidate

No RLS policy is approved here.

Conceptually, a future implementation should likely distinguish:

- participant read access to active, approved resources intended for their program/workspace;
- DSS/admin maintenance privileges for resource creation, verification, pause/inactive/archive lifecycle;
- no participant write access to the canonical resource library;
- participant write access only to participant-owned actions such as an intentional Support request or future save/bookmark feature.

Actual RLS must be designed from live role and workspace behavior at the installation-candidate gate.

## What the data model deliberately keeps separate

### Resource truth

What the outside organization says and how to reach it.

### THRIVE explanation

Plain-language paraphrase intended to help the participant understand the path.

### Participant intent

What the participant chooses to look for or asks Support about.

### Support work

What authorized DSS Support does after a participant intentionally asks for help.

None of these should silently overwrite the others.

## Candidate assessment

The cross-domain validation supports a reusable Resources model.

The recommended candidate structure is:

1. `resource_organizations`;
2. `resources`;
3. `resource_organization_roles`;
4. `resource_access_paths`;
5. `resource_verifications`;
6. preferably `resource_guidance_sections` for scalable plain-language content.

The existing `support_request_links` table is the preferred future bridge to Support rather than a duplicate Resources-specific request system.

## Open decisions requiring sign-off before an SQL candidate

1. Should canonical resources be global DSS records, workspace-scoped records, or global records with workspace/program visibility mappings?
2. Should v0.1 use flexible `resource_guidance_sections`, or simpler fixed guidance columns for the first release?
3. Who is allowed to verify/activate a resource in the MVP: DSS admin only, admin + designated Support reviewer, or another explicit role?
4. What initial participant categories should be frozen for v0.1?
5. What re-verification cadence should be used for stable sources versus fast-changing directories/contact information?
6. Should the first MVP include the Support context link immediately, or ship Resources read-only first and connect Support in a second bounded pass?

## Exact next gate

**STOP for product/governance review.**

The next step is not SQL.

Review and approve or revise the six open decisions above. Only after that approval should THRIVE create a review-only SQL/schema candidate.

No SQL execution, schema installation, production seeding, UI implementation, resource scraping, automatic referral, external sharing, or Trust Engine work is approved by this document.
