# THRIVE Resources / Support Scope + Audience v0.1

**Date:** 2026-10-01  
**Owner:** DSS Enterprises  
**Status:** APPROVED PRODUCT SCOPE / ACTIVE THRIVE BUILD LANE  
**Branch:** `feature/resources-scope-catalog-v0-1`

## Purpose

Define a finite, maintainable first-wave Resources layer for THRIVE and preserve the separation between self-service Resources and assisted Support.

THRIVE Resources should help a participant move from:

`I know roughly what I need, but I do not know where to start.`

to:

`I know the real organization, what the resource is for, how to reach it, what I can do next, and how to ask THRIVE Support for help if I want it.`

The MVP is not intended to become a universal directory.

## Intended audience

The first-wave THRIVE Resources audience is:

> Adults working on stability, recovery, financial capability, and everyday life management who may need practical support connecting to community, recovery, benefit, employment, housing, transportation, health-access, or administrative resources.

The initial catalog should be especially useful to the current South Florida participant population while retaining national and Florida-wide anchors that can later support broader expansion.

## Product boundary: Resources vs Support

### Resources = self-service navigation

Resources is for a participant who knows roughly what they need and wants a trustworthy path.

Examples:

- find a recovery meeting or recovery community;
- start a SNAP application;
- find a workforce center;
- replace an ID document;
- find transportation help;
- understand where to start for housing assistance.

Resources may provide verified official starting points, plain-language guidance, geography, access paths, and maintenance/verification information.

### Support = assisted help

Support is for a participant who is unsure, stuck, needs navigation help, wants to ask a question, or wants a human/THRIVE-assisted response.

Support may receive visible context from a Resource, Wellness, Goal, or Money lane, but the participant must intentionally submit the Support request.

### Required separation

- Viewing a Resource must never create a Support request.
- Resource content must not become a participant conclusion.
- Support work must not overwrite canonical Resource truth.
- Resource browsing must not be used as hidden evidence of need, intent, relapse, incapacity, eligibility, or priority.
- Support and Resources may link to one another without merging ownership or authority.

## First-wave catalog cap

**Maximum: 40 real participant-facing resources.**

Synthetic test records do not count toward the 40.

The cap is deliberate. The MVP goal is trustworthy navigation, not directory size.

## Domain allocation

The first-wave target is:

| Domain | Maximum first-wave records | Intended use |
| --- | ---: | --- |
| Recovery support | 7 | Meetings, peer support, recovery community organizations, recovery-oriented connection |
| Basic needs | 6 | Food, clothing, hygiene, utilities, emergency household needs |
| Housing / housing stability | 5 | Housing navigation, sober/transitional pathways, rent/homelessness-prevention starting points |
| Benefits / income support | 5 | SNAP, Medicaid/public benefits navigation, Social Security/disability, unemployment or benefit gateways |
| Employment / education | 5 | Workforce centers, GED/adult education, vocational/job-search starting points |
| Transportation / identification | 4 | Transit help, reduced fare, DMV/ID, vital-document navigation |
| Health access | 4 | Primary care, dental, behavioral-health access, medication/community clinic navigation |
| Legal / administrative navigation | 4 | Legal aid, court self-help, document/admin navigation, appropriate government starting points |
| **Total** | **40** | |

Gateway resources such as 211 count within the most appropriate domain; they do not create a ninth category or an unlimited overflow bucket.

## Geography strategy

The first catalog should favor three layers:

1. **National anchors** when the resource is genuinely national and useful.
2. **Florida statewide resources** for state-controlled systems and statewide navigation.
3. **Broward + Palm Beach / South Florida local resources** where local service access materially matters.

Do not pretend the first-wave catalog is nationally complete.

Future geography expansion should follow actual participant demand and the same verification standard.

## Resource hierarchy shown to participants

Resources should not be displayed as a flat directory.

Use a small-result hierarchy:

### Start here

High-confidence gateways or official front doors that solve or route a broad class of need.

### Common need

Specific resources for recurring participant needs.

### Local option

Verified local or county/service-area resources when geography materially changes access.

### Specialized help

Narrower resources shown only when relevant.

Participant surfaces should prefer a few useful choices over a large result dump.

## Participant resource-card contract

Every participant-facing Resource should answer, in plain language:

1. **What is this for?**
2. **Who is it for?**
3. **What do I do next?**
4. **When was this last verified?**

Where useful, a card may also include:

- official organization;
- service area;
- direct action path;
- fallback path;
- what the participant may want to have ready;
- `Need help using this?` bridge to Support.

The outside organization remains the authority.

## Source standard

Prefer primary and institutional sources.

Priority order:

1. official federal/state/county/municipal source;
2. official service-provider organization;
3. recognized nonprofit or institutional authority actually providing/maintaining the service;
4. institutional/research source for explanation only when needed.

Do not use SEO directories, affiliate pages, anonymous advice, random blogs, or social posts as participant resource authority.

## Verification standard

A Resource should not become active merely because a URL exists.

Before activation, verify:

- organization identity;
- official domain/source relationship;
- participant-facing access path;
- service geography when relevant;
- THRIVE plain-language paraphrase against the source;
- participant boundary language;
- verification date and scope;
- next review date or cadence when appropriate.

If material uncertainty appears, pause the Resource rather than leaving questionable guidance active.

No hard deletes.

## Existing live architecture reconciled on 2026-10-01

The live database already contains the intended Resources architecture, including:

- `resources`;
- `resource_organizations`;
- `resource_organization_roles`;
- `resource_access_paths`;
- `resource_guidance_sections`;
- `resource_verifications`;
- `resource_visibility`;
- existing `support_request_links` fields for `resource_id` and `resource_access_path_id`.

Therefore this gate does **not** require a new Resources schema.

The current library is thin, with real records including Florida MyACCESS, Social Security Administration, 211 Broward, and 211 Palm Beach & Treasure Coast, plus synthetic test records.

The active need is catalog quality, participant presentation, verification, and Support/Resources wiring, not schema invention.

## High-stakes / specialized boundary

The first-wave catalog should not attempt to become a comprehensive specialist directory for:

- acute crisis response;
- detox/residential placement;
- highly specialized clinical treatment matching;
- domestic violence shelter placement;
- immigration representation;
- CPS legal strategy;
- highly specialized disability advocacy;
- comprehensive medical provider search.

THRIVE may maintain trusted gateway resources for these needs where appropriate, but should not present itself as the deciding authority or exhaustive specialist matcher.

## Cross-lane intersections

### Wellness -> Resources / Support

A participant may choose a recovery/community or practical support path. THRIVE may show relevant Resources or offer Support. It must not infer a diagnosis or automatically create a request.

### Goals -> Resources / Support

A Goal such as GED, employment, ID replacement, transportation, or housing may expose a relevant verified Resource. The participant chooses whether to use it or ask Support.

### Money -> Resources / Support

Financial strain or a participant-selected need may lead to benefit/basic-needs Resources or Support navigation. Bank observations alone must never trigger a need conclusion.

### Today -> Resources

Today may surface a participant-chosen or already-linked Resource when it is part of an existing next step. Today should not invent a new need.

## Maintenance principle

The library should remain intentionally small enough that DSS can know what is in it.

Target behavior:

- every active record has an understandable purpose;
- every active record has a clear authority/source;
- every active record has at least one working access path;
- every active record has a meaningful geography/audience description when relevant;
- every active record has verification evidence;
- stale resources are paused/inactivated, not silently left live.

## Approved implementation sequence

1. **Inspect + reconcile** current live Resources and Support structures. **Complete.**
2. **Document scope + audience + 40-resource cap.** **This document.**
3. **Build a reviewable candidate catalog** of up to 40 real resources using current official sources.
4. **Map each candidate** to category, geography, audience, official organization, access path, guidance, and verification requirements.
5. **Reconcile duplicates and gateway overlap.**
6. **Review candidate catalog before installation.**
7. After explicit installation approval, use the existing live Resources architecture to add/activate approved records.
8. Verify participant retrieval and Support bridge behavior.
9. Only then redesign the participant-facing Resources/Support presentation using the frozen THRIVE chassis.

## Current exact next gate

**Verified Candidate Catalog v0.1**

Build the up-to-40 resource candidate on paper from current official sources.

No database insert/update, no production activation, no Support UI redesign, and no automatic referral behavior occur at this gate.
