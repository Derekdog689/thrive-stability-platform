# THRIVE Resources Product Surface Candidate v0.1

**Date:** 2026-08-24
**Repository:** `thrive-stability-platform`
**Branch:** `main`
**Status:** Review-only product-surface candidate

## Verified starting state

Resources backend installation is complete and the controlled authenticated RLS/RPC validation is closed.

The installed model has already proven, through normal authenticated browser sessions, that:

- workspace admins can create, prepare, verify, activate, and pause canonical Resources;
- participants can read active, visible Resources, access paths, and guidance through RLS;
- participant canonical writes are denied;
- Support users do not inherit Resources-admin authority;
- verification-maintenance evidence remains hidden from participants;
- participants can carry visible Resource context into their own existing submitted Support request;
- pausing workspace visibility removes the Resource from participant view without deleting the canonical Resource or its history/evidence.

This candidate does not reopen those backend decisions.

## Frozen boundaries

This pass does **not** authorize:

- participant or admin UI implementation;
- schema, RLS, RPC, constraint, or privilege changes;
- Resources production content seeding;
- automatic Resource assignment or ranking;
- automatic Support request creation;
- eligibility determination;
- diagnosis, clinical matching, relapse-risk interpretation, financial-need scoring, or fiduciary conclusions;
- hidden demographic, financial, behavioral, or wellness profiling;
- Trust Engine synchronization;
- service-role use;
- external sharing beyond existing authority;
- hard deletes.

Resources remains a participant-directed navigation and guidance layer. The outside authority remains the authority.

---

# 1. Participant product surface

## Candidate route

`/resources`

Optional detail route:

`/resources/[slug]`

The participant surface should use the existing THRIVE participant shell and mobile-first navigation patterns.

Candidate navigation placement:

`Goals -> Resources -> Support`

Reason: Resources is a self-directed navigation layer that can optionally lead into Support. It should not be hidden inside Support because simply viewing a Resource is not a Support event.

## Participant landing page purpose

The landing page should answer one ordinary question:

**What are you looking for?**

The page should feel like a trusted starting-point finder, not a giant directory.

### Top section

Candidate heading:

**Find a trusted starting point**

Candidate helper copy:

`Choose a topic and THRIVE will show verified places to start, what they do, and how to get there.`

Boundary copy should remain short and human:

`THRIVE helps you navigate. The outside organization makes its own decisions.`

## Category presentation

Use the already-approved participant-friendly categories:

- Food & basic needs
- Identification & documents
- Recovery & community support
- Employment & education
- Transportation
- Housing information
- Health & wellness navigation
- Financial education
- Government programs & benefits
- Other / not sure

These are browsing categories only. They must not be presented as a conclusion that the participant needs a category.

### Mobile behavior

On phone, categories should be thumb-friendly cards or chips with ordinary language, not a dense select menu.

The participant should be able to choose a category without typing.

Search may be added later, but v0.1 should not depend on fuzzy ranking or recommendation logic.

## Resource results

After category choice, show a small set of Resource cards that are already visible to the participant through RLS.

Do not show inactive, draft, paused, archived, or maintenance-only records.

Do not expose verification internals such as verifier identity, maintenance note, or administrative review evidence.

### Participant Resource card contract

Each card should show only enough to answer:

1. What is this?
2. Who runs it?
3. Why might I open it?
4. Is it an official starting point?

Candidate card layout:

**Florida Food Assistance (SNAP)**

Florida Department of Children and Families

`Official Florida starting point for Food Assistance / SNAP applications and case access.`

Badges may include plain factual scope only, for example:

- Official source
- Florida
- Government program

Primary action:

`View details`

Avoid badges such as:

- Recommended
- Best match
- You qualify
- High priority
- Good for you

## Resource detail page

The detail page should read like a short guided path, not a dossier.

Candidate order:

### A. Identity

- Resource name
- primary authority / organization
- plain-language purpose
- geography or service area when useful

### B. What this is

Render active `what_this_is` guidance.

This is THRIVE explanation and should remain visibly plain-language guidance.

### C. Start here

Show the primary active official access path prominently.

Candidate action labels should describe the actual route:

- Open official site
- Start application
- View official instructions
- Find an office
- Find a meeting
- Call official help

Do not use a generic `Go` when a clearer action label exists.

### D. What you can do there

Render active `what_you_can_do` guidance.

### E. How this works

Render active `how_it_works` guidance when present.

Keep procedural explanation short. If the official source owns detailed instructions, summarize the purpose and link to the official instructions rather than copying a large procedure into THRIVE.

### F. What to have ready

Render `what_to_have_ready` only when supported by the official source.

Do not invent universal document checklists.

### G. Other official paths

Display secondary active access paths by type, such as:

- direct action
- instructions
- finder
- office locator
- phone
- document
- fallback

This is especially important for portals that can fail or require session flow.

### H. Important note / boundary

Show short participant-facing boundary language when useful.

Example:

`Florida DCF decides eligibility. THRIVE can help you find and understand the official process.`

### I. Need help?

Candidate callout:

**Need help using this?**

`You can ask THRIVE Support for help navigating this resource.`

Action:

`Ask Support`

Rules remain frozen:

- nothing is submitted by viewing or tapping the callout;
- Resource context may be carried into the existing Support create flow;
- the participant still writes their own question and chooses whether to submit;
- Resource context does not establish eligibility, need, diagnosis, urgency, or recommendation.

## Participant empty states

If no visible Resources exist for a category:

`No verified starting points are available here right now.`

Then offer:

- choose another category;
- `Ask Support` without claiming Support already knows what the participant needs.

If the entire Resources library has no participant-visible records:

`Resources are being prepared for your program.`

Do not expose draft, paused, or maintenance content merely to avoid an empty page.

---

# 2. Worked participant example: Florida SNAP

This worked example uses the already-reviewed Florida SNAP reference pattern. It is a **display candidate only**. It does not authorize production seeding or assert that previously verified links remain current without reverification at ingestion time.

## List card

**Florida Food Assistance (SNAP)**

Florida Department of Children and Families

`Official Florida starting point for applying for and managing Food Assistance / SNAP.`

Badges:

`Official source` · `Florida` · `Food & basic needs`

Action:

`View details`

## Detail candidate

### Florida Food Assistance (SNAP)

**Florida Department of Children and Families**

**What this is**

Food Assistance, often called SNAP or food stamps, is a government food-assistance program. THRIVE can help you find the official starting point and understand the process. THRIVE does not decide whether you qualify.

**Start here**

Primary action:

`Open Florida MyACCESS`

Secondary official path:

`Read Florida DCF application guidance`

**What you can do there**

The official system can be used for actions such as applying, managing an application or case, responding to official requests, and accessing official notices or help information when those functions are currently offered by DCF.

**How this works**

Use short, source-supported guidance such as:

`Start with the official application. DCF reviews the information and may ask for an interview or additional verification. DCF makes the eligibility decision.`

**What to have ready**

Do not present a THRIVE-created universal checklist.

Candidate wording:

`DCF may ask for information or documents based on your application. Follow the specific request and deadline DCF gives you.`

**If the first link is not working**

Show the stable official agency landing/instructions path and any currently verified official contact fallback.

**Need help using this?**

`Ask THRIVE Support`

The Support composer may display visible context:

`Resource: Florida Food Assistance (SNAP)`

`Organization: Florida Department of Children and Families`

The participant writes the actual request.

## What this example must never imply

The surface must not say or visually imply:

- You qualify for SNAP.
- You should apply because of your spending.
- THRIVE recommends SNAP based on your finances or wellness.
- DCF will approve you.
- THRIVE has verified every live rule, screen, office, processing time, or external portal state beyond the exact recorded verification scope.

---

# 3. Admin Resources maintenance surface

## Candidate route

`/admin/resources`

Candidate detail/editor route:

`/admin/resources/[id]`

## Critical authority rule

The existing general THRIVE Review shell recognizes both `admin` and `support` memberships for Support-review purposes.

That general reviewer access check is **not sufficient authority for Resources maintenance**.

The Resources admin surface must require the existing Resources workspace-admin authority and must not treat a Support reviewer as a Resources admin merely because the user can enter `/admin`.

The backend already denies Support Resources-admin RPCs. The UI must reflect, not weaken, that rule.

## Admin landing page

Purpose: quickly answer what needs maintenance without becoming a sprawling CMS.

Candidate summary cards:

- Draft
- Active
- Paused
- Review due / overdue
- Inactive

Do not show participant-risk scores, popularity ranking, referral counts, or inferred need.

Candidate filters:

- lifecycle status
- category
- verification cadence / due state
- visibility workspace/program

Candidate row/card fields:

- Resource name
- category
- canonical status
- visibility state for current workspace/program
- primary authority
- primary access path present / missing
- latest verification date
- next review date

Primary actions:

- Open Resource
- Create draft

No delete action.

## Admin Resource editor structure

Use sections that map directly to the installed model rather than a giant flat form.

### A. Resource basics

- name
- slug
- category / subcategory
- plain-language purpose
- participant boundary note
- geography/service area
- verification cadence

### B. Organizations & roles

Show organizations linked to the Resource and role:

- primary authority
- service provider
- local maintainer
- listing source
- research source
- other

The role should be visible because organization, authority, and live-data maintainer are not always the same entity.

### C. Official access paths

Manage the structured paths already supported by the model:

- landing page
- direct action
- instructions
- finder
- office locator
- phone
- email
- document
- fallback
- other

Admin UI should make one primary participant starting point visually obvious while still allowing alternate/fallback official routes.

### D. Participant guidance

Manage controlled guidance sections:

- What this is
- Start here
- What you can do
- How it works
- What to have ready
- Important note
- Fallback
- Need help
- Other

Each section should expose its sort order and active/archived state.

If a section is based on a specific access path, show the supporting path relationship when available.

### E. Verification

Show maintenance evidence clearly to the admin but never the participant.

Candidate fields/display:

- verification scope
- verification status
- verified date
- verifier
- source URL
- note
- next review date

The UI should say exactly what was verified. It must not transform `official access point verified` into `all live content behind this source verified`.

### F. Visibility

Show where the Resource is exposed:

- workspace
- optional program
- active / paused / inactive / archived visibility state

Because direct authenticated SELECT on `resource_visibility` is intentionally restricted in the installed model, implementation must use an approved read path rather than casually granting table SELECT merely for admin UI convenience.

This is an implementation design checkpoint, not permission to alter privileges.

### G. Lifecycle controls

Candidate controls:

- Save draft changes
- Verify
- Activate
- Pause visibility
- Mark inactive
- Archive when the installed lifecycle supports the approved action path

No hard delete.

Activation should remain visibly gated by verification evidence rather than presented as an ordinary toggle.

## Admin edit-warning candidate

The current installed design has known caveats around editing child content while a canonical Resource is already active and around forced reverification after material changes.

The first admin UI should **not hide that unresolved design question**.

Until separately reconciled, the safest initial admin editor candidate is:

- draft Resources: editable;
- active Resources: read-focused maintenance view with pause/review action prominent;
- do not introduce broad active-content mutation UX that silently bypasses reverification expectations.

---

# 4. Surface behavior by actor

## Participant

Can:

- open `/resources`;
- see only RLS-visible active Resources;
- read participant-facing active access paths and guidance;
- open official outside paths;
- choose to carry Resource context into Support.

Cannot:

- see verification evidence;
- see draft/paused/inactive/archived Resources;
- edit canonical content;
- activate/pause Resources;
- infer admin maintenance state from hidden records.

## Support member

For Resources v0.1, Support is not a Resources maintenance actor.

A Support user may receive Resource context inside an authorized Support request through the existing Support system, but must not gain canonical Resources creation/edit/verification/activation authority.

## Workspace admin

Can perform only the Resources actions already authorized by the installed backend and separately exposed by the approved UI slice.

The UI remains subordinate to the database/RPC authority model.

---

# 5. Recommended implementation sequence after review

Do not build the entire participant and admin experience in one pass.

## Slice A - Participant read-only Resources shell

**Recommended first code gate.**

Scope:

- add participant navigation item `Resources`;
- create `/resources`;
- create `/resources/[slug]`;
- load only data already visible through participant RLS;
- render category browsing;
- render Resource identity, active guidance sections, and active access paths;
- render safe empty/error/loading states;
- no writes;
- no Support-link write yet;
- no admin UI;
- no production Resource seeding;
- no schema/RLS/RPC changes.

Why first:

It proves the real product read surface against the already-validated participant RLS boundary with the smallest blast radius.

### Slice A acceptance test

With the currently paused synthetic fixture, the controlled participant should initially see a valid Resources shell with no visible synthetic Resource.

A later separately approved synthetic visibility test may temporarily activate the existing synthetic fixture to prove list/detail rendering, then pause it again. Do not perform that lifecycle write as part of the code commit without explicit approval.

## Slice B - Participant Support bridge UI

After Slice A is runtime-verified:

- add `Ask Support` from Resource detail;
- carry Resource/access-path context into the existing Support create flow;
- participant writes and submits their own request;
- verify no automatic request creation;
- preserve existing Support lifecycle.

No new Support system.

## Slice C - Admin Resources read/maintenance shell

After participant presentation is stable:

- add Resources card/link to THRIVE Review for **workspace admin only**;
- create `/admin/resources`;
- create `/admin/resources/[id]`;
- initially emphasize read/review, draft creation, evidence inspection, activation/pause controls already supported by installed RPCs;
- do not silently add broad active-content mutation behavior.

Any missing admin read requirement, especially visibility maintenance reads, must be reconciled as a separate candidate before changing database privileges.

## Slice D - Real Resource ingestion

Only after the product surfaces and maintenance workflow are proven:

- prepare a small reviewed seed/content candidate;
- reverify every official source at ingestion time;
- begin with a tiny number of high-value Resources rather than 20-40 at once;
- use normal admin authority/lifecycle;
- verify participant presentation before expanding the library.

---

# 6. Product decisions proposed for approval

This candidate recommends freezing these surface decisions before code:

1. Participant route is `/resources` with detail route `/resources/[slug]`.
2. `Resources` appears in participant navigation immediately before `Support`.
3. v0.1 discovery is category-first, not recommendation-engine first.
4. Participant cards remain small and factual: identity, authority, purpose, scope, official-source signal.
5. Detail pages use controlled guidance sections and structured official access paths in a clear reading order.
6. `Need help using this?` is optional and participant-initiated.
7. Support users do not receive Resources-admin UI authority.
8. Admin Resources maintenance lives at `/admin/resources`, but must enforce workspace-admin authority independently of the general Support-review shell.
9. No hard delete action appears anywhere.
10. First code slice is participant **read-only** Resources UI only.
11. Real Resource ingestion waits until the participant and admin maintenance surfaces are proven.
12. Official-source authority and THRIVE explanation remain visibly separate.

---

# Exact next gate

Review and approve, revise, or reject the twelve proposed surface decisions above.

If approved, the next gate is **Slice A implementation candidate and code review**:

- participant navigation `Resources` item;
- `/resources` read-only category/list surface;
- `/resources/[slug]` read-only detail surface;
- participant RLS reads only;
- no database writes;
- no Support bridge write;
- no admin Resources UI;
- no production seeding;
- no schema/RLS/RPC changes;
- no Trust Engine work.

Do not move into Slice B, Slice C, content ingestion, or any database privilege change without a separate approved gate.
