# THRIVE Resources Authenticated Test Route Candidate v0.1

**Date:** 2026-08-24
**Repository:** `thrive-stability-platform`
**Branch:** `main`
**Status:** Review-only temporary authenticated test-harness candidate

## Verified starting state

- Resources schema/RLS/RPC installation completed.
- Structural verification passed.
- All seven Resources tables currently contain zero rows.
- Role-by-role authenticated lifecycle testing is still pending.
- Existing THRIVE precedent uses temporary hidden authenticated routes for RLS proof.
- Shared browser client uses the normal Supabase anon-key client and authenticated user session.

## Purpose

Create the smallest app-compatible authenticated surface needed to prove the installed Resources authority model using real browser sessions and normal RLS/RPC behavior.

This is a test harness, not participant Resources UI and not admin Resources UI.

## Proposed route

`/resources-test`

The route must not appear in normal THRIVE navigation.

## Authentication boundary

The route must:

- require a current authenticated Supabase session;
- display signed-in email and user UUID;
- query the authenticated user's visible workspace membership;
- derive role from live `workspace_members`, never from email alone;
- use only `@/lib/supabaseClient`;
- use no service-role secret;
- bypass no RLS policy;
- expose no action while signed out;
- expose only fixed test actions appropriate to the observed actor.

## Controlled workspace/program

Use only the existing controlled THRIVE synthetic workspace/program:

- workspace: `71000000-0000-4000-8000-000000000001`
- program: `71000000-0000-4000-8000-000000000002`

No arbitrary workspace or program input is permitted.

## Controlled actors

The test sequence uses existing controlled authenticated actors in the same workspace:

1. workspace administrator;
2. non-admin Support member;
3. onboarding supported-person test participant.

The route must classify actors from current authenticated UUID + live membership/self records, not from browser-local assumptions.

## Synthetic Resource fixture

A successful browser-auth test cannot be rolled back across multiple requests. Therefore one clearly labeled synthetic canonical Resource will remain as test evidence.

Fixed identity:

- name: `SYNTHETIC RESOURCES RLS TEST ONLY`
- slug: `synthetic-resources-rls-test-only`
- category: `other_not_sure`
- purpose: `Controlled authenticated Resources RLS validation only.`
- boundary note: `Synthetic test record only. Not participant guidance.`
- geography: US / FL
- cadence: stable

The route must refuse to create a second record with this slug.

## Lifecycle disposition

The synthetic Resource may become active temporarily during validation so participant visibility can be proven.

At closeout, the workspace visibility mapping must be changed to `paused` using `admin_pause_resource_visibility`.

No hard delete is permitted.

The canonical synthetic Resource may remain in the database as test evidence, but with no active participant visibility after closeout.

A later archive/inactive lifecycle candidate may be considered separately if desired.

## Fixed test actions

### R01 — Admin creates draft

Actor: workspace admin

Call `admin_create_resource_draft` with the fixed workspace and synthetic Resource fixture.

Expected:

- RPC succeeds;
- one Resource row exists;
- Resource status = `draft`;
- one workspace visibility row exists;
- visibility status = `paused`.

### R02 — Non-admin Support creation denial

Actor: non-admin Support member

Attempt the same `admin_create_resource_draft` RPC using a distinct fixed denial-only slug that must not persist if denial works.

Expected:

- RPC denied by workspace-admin authority check;
- no Resource row created;
- no visibility row created.

### R03 — Participant creation denial

Actor: supported-person test participant

Attempt the same admin RPC using a distinct fixed denial-only slug.

Expected:

- RPC denied;
- no Resource/visibility row created.

### R04 — Admin adds authority organization

Actor: workspace admin

Call `admin_add_resource_organization` for the synthetic Resource.

Fixed organization:

- `SYNTHETIC RESOURCES TEST AUTHORITY ONLY`
- organization type: `other_verified`
- role: `primary_authority`

Expected:

- organization and organization-role row exist;
- linkage points only to the synthetic Resource.

### R05 — Admin adds official access-path test row

Actor: workspace admin

Insert one fixed `resource_access_paths` row through normal authenticated table access/RLS.

Fixed values:

- type: `landing_page`
- label: `Synthetic official starting point`
- URL: `https://example.org/thrive-resources-synthetic-test`
- status: active

This URL is deliberately test-only and must never be presented as participant guidance outside this hidden route.

Expected: admin insert succeeds.

### R06 — Admin adds plain-language guidance test row

Actor: workspace admin

Insert one fixed `resource_guidance_sections` row:

- type: `what_this_is`
- heading: `Synthetic test resource`
- content: `This is controlled RLS validation only.`
- status: active

Expected: admin insert succeeds.

### R07 — Admin creates verification evidence

Actor: workspace admin

Insert one fixed `resource_verifications` row:

- scope: `resource_identity`
- status: `verified`
- verified_by: current authenticated admin UUID
- verification note: `Synthetic Resources RLS validation only.`

Expected: insert succeeds.

### R08 — Activation

Actor: workspace admin

Call `admin_activate_resource` for the controlled workspace.

Expected:

- activation succeeds only after organization + access path + verification exist;
- Resource status = active;
- visibility status = active.

### R09 — Participant visible read

Actor: onboarding test participant

Read `resources` through normal authenticated SELECT.

Expected:

- synthetic Resource is visible;
- active access path, guidance, and linked organization identity are visible;
- verification-maintenance rows are not directly participant-readable.

### R10 — Participant raw write denial

Actor: participant

Attempt direct Resource UPDATE or child-table admin write using fixed synthetic target.

Expected: denied by privilege/RLS.

No changed row may result.

### R11 — Non-admin Support canonical write denial

Actor: non-admin Support member

Attempt admin-only Resources mutation against the synthetic Resource.

Expected: denied.

Existing Support workflow authority remains unchanged.

### R12 — Participant Support resource-link proof

Actor: onboarding participant

Use an existing participant-created `submitted` Support request in the controlled workspace/program.

Insert a fixed `support_request_links` row whose primary target is the synthetic `resource_id`, optionally including the matching active `resource_access_path_id`.

Expected:

- valid visible Resource context succeeds;
- exact-one-target constraint remains satisfied;
- matching resource/path composite FK passes.

The test must not change the Support request status.

### R13 — Mismatched resource/path denial

Only if a second controlled access-path fixture can be created without broadening scope. Otherwise defer.

Expected: composite FK / policy rejects mismatch.

Do not manufacture another participant-facing Resource merely to force this test.

### R14 — Pause closeout

Actor: workspace admin

Call `admin_pause_resource_visibility`.

Expected:

- visibility status = paused;
- Resource/history remain preserved;
- participant can no longer SELECT the synthetic Resource through normal Resources visibility.

## Support-link disposition

If R12 creates a synthetic `support_request_links` row, do not hard-delete it.

Use the existing participant pre-ack archive path only if the linked Support request is still eligible and the action is explicitly performed through the test route. Otherwise retain the synthetic link as test evidence and record that fact in closeout.

Do not alter the Support request lifecycle merely for cleanup.

## Test-page safety controls

The route must:

- contain no generic SQL box;
- contain no arbitrary RPC picker;
- accept no arbitrary UUIDs;
- accept no free-form payload JSON;
- contain no DELETE call;
- contain no upsert;
- contain no service-role import;
- contain no Johnny/Trust Engine references;
- never auto-run tests on load;
- show exact expected outcome before each action;
- require explicit button press for each action;
- stop on any unexpected success/denial or unexpected row count.

## Proposed source scope

One temporary source file only:

`src/app/resources-test/page.tsx`

Reuse the shared Supabase client. Do not modify participant Support, admin Support, Resources product navigation, or other production pages during this gate.

## Static validation before execution

Before any R01-R14 action:

- production build should pass;
- route should appear in the route manifest;
- source should be scanned for DELETE/upsert/service-role usage;
- only the temporary route and test documentation should change;
- database Resources census should be reconfirmed before R01.

## Expected closeout

A successful pass should leave:

- one clearly labeled synthetic Resource test record;
- its visibility paused;
- no unexpected Resources rows;
- no real participant resource guidance;
- no production seed set;
- no Trust Engine changes;
- no hard deletes.

The closeout record must distinguish allowed facts, denied attempts, and any deferred case.

## Exact next gate

Review and approve implementation of the one-file hidden `/resources-test` route.

Route implementation and static validation come next.

Authenticated R01-R14 write execution requires a separate explicit approval after the route source is reviewed.
