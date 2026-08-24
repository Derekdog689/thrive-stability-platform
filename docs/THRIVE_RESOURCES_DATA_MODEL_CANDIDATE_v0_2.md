# THRIVE Resources / Guided Reference Data Model Candidate v0.2

**Date:** 2026-08-23
**Repository:** `thrive-stability-platform`
**Branch:** `main`
**Status:** Review-only data-model candidate with approved governance decisions

## Purpose

Carry forward the validated Resources architecture and freeze the six product/governance decisions approved on 2026-08-23.

This document supersedes the open-decision section of `THRIVE_RESOURCES_DATA_MODEL_CANDIDATE_v0_1.md`. It does not authorize SQL execution, table creation, RLS installation, production seeding, UI implementation, external sharing, automatic referral, or Trust Engine work.

## Approved decisions

### 1. Canonical scope

Use a **global DSS-maintained canonical resource library with workspace/program visibility mappings**.

Reason:

Florida SNAP, A.A., and FLHSMV should not be duplicated separately for every participant or workspace. The authoritative resource content should exist once, while visibility controls determine where it is shown.

### 2. Guidance structure

Use **flexible `resource_guidance_sections` with controlled section types**.

Approved first section types:

- `what_this_is`
- `start_here`
- `what_you_can_do`
- `how_it_works`
- `what_to_have_ready`
- `important_note`
- `fallback`
- `need_help`
- `other`

This preserves plain-language flexibility without creating uncontrolled freeform structure.

### 3. Verification authority

For v0.1, **DSS admin only** may verify and activate canonical resources.

Draft creation/editing permissions may be reconsidered later, but verification and participant-visible activation remain admin-controlled in the MVP.

### 4. Initial participant categories

Freeze these participant-friendly v0.1 categories:

- `food_basic_needs`
- `identification_documents`
- `recovery_community_support`
- `employment_education`
- `transportation`
- `housing_information`
- `health_wellness_navigation`
- `financial_education`
- `government_programs_benefits`
- `other_not_sure`

These are navigation categories, not diagnoses or determinations of need.

### 5. Re-verification cadence

Use a tiered review cadence based on volatility:

- `fast_changing` -> 90 days
- `moderate` -> 6 months
- `stable` -> 12 months

The verification record must state what THRIVE actually verified. Verifying an official finder does not mean DSS independently verified every live item inside that outside system.

### 6. Support bridge

Include the Support bridge in v0.1 as a **participant-initiated, context-only bridge**.

Rules:

- viewing a resource never creates a Support request;
- `Need help using this?` may carry visible resource context into the existing Support create flow;
- the participant still chooses to submit and writes their own request;
- resource context does not establish eligibility, recommendation, diagnosis, or authority;
- reuse the existing Support lifecycle rather than create a Resources-specific support system.

## Live-schema fit

Read-only inspection of the current database confirms:

- participant-owned operational data is commonly scoped through workspace/program/supported person;
- the Resources canonical library should not be participant-owned;
- `support_request_links` already provides the correct architectural pattern for contextual Support linkage;
- lifecycle patterns already use non-destructive states such as active, paused, inactive, completed, withdrawn, and archived.

## Approved candidate structure

### `resource_organizations`

Represents outside organizations.

Key fields:

- `id`
- `organization_name`
- `organization_type`
- `official_website_url`
- `country_code`
- `status`
- creator/timestamps/archive fields

### `resources`

Global canonical participant-facing resource/topic record.

Key fields:

- `id`
- `resource_name`
- `resource_slug`
- `category`
- `subcategory`
- `plain_language_purpose`
- `participant_boundary_note`
- geography/service-area fields
- `verification_cadence`
- `status`
- creator/timestamps/archive fields

`resources` does **not** carry `workspace_id` in v0.2 because canonical resources are global.

### `resource_visibility`

Controls where a global canonical resource is visible.

Key fields:

- `id`
- `resource_id`
- `workspace_id`
- optional `program_id`
- `scope_type` = `workspace` or `program`
- `status` = `active`, `paused`, `inactive`, `archived`
- creator/timestamps/archive fields

A workspace-level row exposes the resource to the workspace. A program-level row narrows visibility to one program within that workspace.

### `resource_organization_roles`

Connects resources to organizations and states the organization's role.

Approved role types:

- `primary_authority`
- `service_provider`
- `local_maintainer`
- `listing_source`
- `research_source`
- `other`

### `resource_access_paths`

Stores the official ways a participant can reach or use the resource.

Approved path types:

- `landing_page`
- `direct_action`
- `instructions`
- `finder`
- `office_locator`
- `phone`
- `email`
- `document`
- `fallback`
- `other`

One resource may have several access paths.

### `resource_guidance_sections`

Stores THRIVE's plain-language guidance in controlled sections.

Each section may optionally point to the official access path that supports the paraphrase.

Plain-language guidance remains separate from outside-source authority.

### `resource_verifications`

Preserves verification evidence.

Key fields:

- `resource_id`
- optional `access_path_id`
- optional `organization_id`
- `verification_scope`
- `verification_status`
- `verified_on`
- `verified_by`
- `source_url`
- `verification_note`
- `next_review_on`

Approved verification scopes include:

- `resource_identity`
- `official_domain`
- `access_path`
- `contact_information`
- `published_guidance`
- `service_area`
- `other`

## Resource lifecycle

Approved states:

- `draft` — not participant-visible
- `active` — verified and available where visibility allows
- `paused` — temporarily hidden pending review
- `inactive` — no longer offered as current guidance
- `archived` — historical, preserved, not current

No hard deletes in the MVP.

## Visibility rule

A participant should only be able to read a resource when all of the following are true:

1. the canonical resource is `active`;
2. an active visibility mapping exists for the participant's workspace or active program;
3. the participant is an active program participant in that scope;
4. the participant only receives participant-facing fields and active guidance/access paths.

Exact RLS implementation remains a schema-candidate concern and is not installed by this document.

## Admin verification rule

Only DSS admin users may change a resource from draft/paused into participant-visible active status or create a verification event marked `verified` in v0.1.

The SQL candidate should preserve this requirement but must not invent a new global authority model silently. RLS/security implementation should reconcile this with the existing live membership model before installation approval.

## Support bridge candidate

The preferred v0.1 relationship remains an extension of `support_request_links`:

- nullable `resource_id`
- optionally nullable `resource_access_path_id`

The participant initiates Support. The context is visible and informational.

No resource view, category selection, or demographic fact automatically creates or prioritizes a Support request.

## Re-verification behavior

`resources.verification_cadence` determines the expected review interval.

The actual due date is recorded in `resource_verifications.next_review_on` so the historical verification record remains explicit.

A materially questionable resource should be paused while reviewed rather than left active because its prior verification date has not yet expired.

## Privacy and inference boundary

The model intentionally does not contain fields such as:

- eligibility score
- recommended-for-participant flag
- clinical match
- risk match
- financial-need score
- relapse-risk match
- priority score

Participant intent, outside-source facts, THRIVE explanation, and Support work remain separate.

## Exact next gate

Create a **review-only SQL/schema candidate** derived from these approved decisions.

The SQL candidate may define the proposed tables, constraints, indexes, and relationship extension to `support_request_links` for review.

It must **not** be executed.

After the SQL candidate is reviewed, the next gate is explicit approval or revision before any installation candidate or database write.
