# THRIVE Resources Slice A Closeout

Date: 2026-08-24
Status: Closed / participant read-only Resources surface runtime-validated
Repository: `Derekdog689/thrive-stability-platform`
Branch: `main`

## Purpose

This document closes Slice A of the THRIVE Resources product surface.

Slice A was intentionally limited to the participant read-only Resources experience:

- participant navigation item `Resources`;
- `/resources` category-first list surface;
- `/resources/[slug]` detail surface;
- reads through the already-installed participant RLS model;
- no participant canonical writes;
- no Resource-to-Support context write;
- no admin Resources product UI;
- no production Resource seeding;
- no Trust Engine work.

## Frozen boundaries preserved

- Resources remains separate from the Trust Engine.
- Viewing a Resource does not establish eligibility, recommendation, diagnosis, need, urgency, misuse, incapacity, or any legal, clinical, fiduciary, or financial conclusion.
- External organizations remain the authority for their own programs, services, and decisions.
- Support authority does not become Resources-admin authority.
- No hard delete was used.
- No service-role client was used.
- No production participant Resource content was seeded.
- No automatic Support request was created.
- Slice A did not carry Resource context into Support.

## Implemented Slice A surface

### Participant navigation

`Resources` was added to the THRIVE participant navigation immediately before `Support`.

### `/resources`

The participant landing page provides:

- heading: `Find a trusted starting point`;
- plain-language boundary copy;
- category-first browsing using the frozen Resources categories;
- participant-visible Resources only;
- Resource cards showing factual identity, authority organization, geography/category signals, plain-language purpose, and `View details`;
- safe loading, error, and empty states.

The page does not display draft, paused, inactive, archived, or verification-maintenance records to the participant.

### `/resources/[slug]`

The participant detail page provides:

- Resource identity;
- primary authority organization;
- service-area information when available;
- primary `Start here` access path;
- active guidance sections;
- participant boundary note;
- a read-only `Open Support` option that does not carry Resource context in Slice A.

Verification-maintenance evidence is not exposed on the participant detail page.

## Runtime validation sequence

The Slice A runtime test used only the existing controlled synthetic Resource and controlled test actors.

The existing synthetic Resource remained the sole fixture:

`SYNTHETIC RESOURCES RLS TEST ONLY`

No new Resource was created for Slice A validation.

### 1. Initial paused-state participant proof

With the synthetic Resource canonical status `active` and workspace visibility `paused`, the controlled participant opened `/resources`.

Observed:

- Resources navigation loaded correctly;
- category browsing loaded correctly;
- no synthetic Resource card was visible;
- empty state displayed: `Resources are being prepared for your program.`

Result: PASS.

### 2. Lifecycle gap discovered

The existing `admin_activate_resource` RPC was correctly unsuitable for re-exposing an already-active canonical Resource whose visibility alone was paused.

The RPC requires canonical status `draft` or `paused` for activation, while the synthetic closeout state was:

- canonical Resource: `active`;
- workspace visibility: `paused`.

No dashboard SQL shortcut or privilege broadening was used.

### 3. Bounded resume-visibility lifecycle addition

A review-only candidate was created and separately approved for installation:

`admin_resume_resource_visibility(uuid, uuid, uuid)`

Installed behavior is deliberately narrow:

- caller must be authenticated;
- caller must be workspace admin for the supplied workspace;
- canonical Resource must already be `active`;
- matching visibility mapping must already exist;
- mapping may be resumed only from `paused` to `active`;
- already-active visibility is idempotent success;
- inactive/archived visibility is not resumed by this function;
- canonical Resource content/status is not changed;
- verification, organization, access-path, guidance, Support, participant, and Trust Engine state is not changed.

Installation verification confirmed:

- function exists with expected signature;
- `authenticated` has EXECUTE;
- the synthetic fixture remained `active` + `paused` immediately after installation.

### 4. R15 resume test

The isolated hidden route `/resources-visibility-test` was used with the controlled workspace admin.

R15:

`Admin resumes existing paused visibility`

Observed:

`PASS / expected behavior`

`Resume RPC succeeded. Canonical Resource remains active. Visibility is intentionally verified by participant read and external read-only closeout.`

Result: PASS.

### 5. Participant list-card proof

The controlled participant returned to `/resources` after R15.

Observed participant card:

- `Official source` indicator;
- `FL` geography indicator;
- `Other / not sure` category indicator;
- synthetic Resource title;
- synthetic authority organization;
- plain-language purpose;
- `View details` action.

Result: PASS.

This proved that the real Slice A list UI is fed by the existing participant RLS visibility model.

### 6. Participant detail-page proof

The participant selected `View details`.

Observed on `/resources/[slug]`:

- clear Resource identity;
- authority organization visible;
- service area visible;
- primary official access path shown as the `Start here` action;
- active plain-language guidance rendered;
- participant boundary note shown separately;
- Support option remained read-only and explicitly did not carry Resource context;
- no verification-maintenance evidence was exposed.

Result: PASS.

### 7. Non-destructive visibility pause closeout

The controlled admin returned to the original hidden Resources RLS route and ran the existing R14 pause action.

Observed:

`PASS / expected behavior`

`Pause RPC succeeded. Visibility status is intentionally not directly readable by authenticated browser role; closeout verification is external/read-only plus participant invisibility check.`

External read-only database verification confirmed:

- canonical Resource status: `active`;
- workspace visibility status: `paused`;
- access path count: `1`;
- guidance count: `1`;
- verification count: `1`;
- participant-created Support link count: `1`.

Nothing was deleted or rewritten.

### 8. Final participant invisibility proof

The controlled participant returned to `/resources` after R14.

Observed:

- synthetic Resource card no longer visible;
- category browsing still operational;
- clean empty state restored.

Result: PASS.

## Slice A conclusion

Slice A is CLOSED.

The participant Resources read surface has now been runtime-proven across the full non-destructive visibility cycle:

`paused -> participant empty state -> admin resume -> participant list card -> participant detail -> admin pause -> participant empty state`

The product surface and installed participant RLS model are aligned for the approved read-only scope.

## Relevant checkpoints

- `db84b34617c1f553b5adbe2a78646be18387fa86` - Slice A participant Resources surface
- `4b4508c411dbd5be43c1fd60379e09262b7d5e22` - review-only resume visibility RPC candidate
- `fe0186f319349a300ccc04bcc600e92d8ec507d5` - isolated hidden R15 visibility-resume test route

## Build / repository closeout

- Slice A production participant shell, list, and detail surfaces were runtime-tested successfully.
- Resume-visibility RPC was installed only after explicit approval.
- Final synthetic lifecycle state: canonical Resource `active`, workspace visibility `paused`.
- `git diff --check`: unavailable through the GitHub connector during this pass and therefore not claimed.
- `git status`: local workstation state is not visible through the connector and therefore not claimed.

## Exact next gate

Slice B is a separate gate and is not authorized by this closeout document.

Candidate Slice B scope:

- participant starts from a visible Resource detail page;
- participant explicitly chooses `Ask Support`;
- visible Resource and matching access-path context may be carried into the existing Support create flow;
- participant writes their own question/request;
- nothing is submitted automatically;
- no new Support system is created;
- existing Support lifecycle and authority remain authoritative;
- Resource context does not establish eligibility, urgency, diagnosis, recommendation, need, or priority;
- no schema/RLS/RPC change unless a separately documented blocker is found;
- no admin Resources product UI;
- no production Resource seeding;
- no Trust Engine work.

Before implementation, inspect the current Support create flow and the installed `support_request_links` write path, then prepare a bounded Slice B implementation candidate for review.
