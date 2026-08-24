# THRIVE Resources Authenticated Validation Closeout

Date: 2026-08-24

Status: Closed / authenticated browser validation passed.

## Purpose

This document records the completed controlled authenticated validation of the installed THRIVE Resources RLS/RPC model.

The validation used only synthetic THRIVE test actors, the fixed synthetic Resources fixture, normal authenticated browser sessions, and the installed production RLS/RPC model.

This closeout does not authorize new Resources product UI, broader data access, Trust Engine synchronization, Johnny activation, service-role use, hard deletes, or any expansion of authority.

## Frozen boundaries preserved

- THRIVE Resources remains separate from the Trust Engine.
- No Johnny data was used.
- No real participant or staff data was used.
- No service-role client was used.
- No generic SQL or arbitrary RPC execution path was exposed in the browser harness.
- No hard delete was used.
- Support authority did not become Resources-admin authority.
- Participant visibility did not become canonical Resources write authority.
- Resource context could be linked to an existing participant-authored Support request, but Resources did not create or control that Support request.
- Internal verification maintenance evidence remained hidden from the participant.

## Fixed synthetic scope

Workspace:

`71000000-0000-4000-8000-000000000001`

Program:

`71000000-0000-4000-8000-000000000002`

Synthetic Resource:

`SYNTHETIC RESOURCES RLS TEST ONLY`

Synthetic Resource ID:

`834492d1-1a8b-45b3-a260-280e680e110f`

Synthetic Resource slug:

`synthetic-resources-rls-test-only`

## Controlled actors used

### Workspace administrator

- Email: `dstein561+thrive-rls-admin@gmail.com`
- Role observed by harness: Workspace administrator
- Membership role: `admin`

### Support member

- Email: `dstein561+thrive-rls-support@gmail.com`
- Role observed by harness: Support member (non-admin)
- Membership role: `support`

### Supported-person participant

- Email: `dstein561+thrive-onboarding-person-d@gmail.com`
- Role observed by harness: Supported-person participant
- Supported-person ID: `71000000-0000-4000-8000-000000000009`

## Validation results

### R01 - Admin creates/reconciles fixed draft

PASS.

Observed:

- exactly one fixed synthetic Resource existed;
- canonical Resource status was `draft` before activation;
- duplicate creation was not attempted after reconciliation;
- external read-only database verification confirmed workspace visibility status `paused`.

### R02 - Support non-admin admin-RPC attempt is denied

PASS.

Observed denial:

`Workspace admin authority required`

No Support-created denial-test Resource was created.

### R03 - Participant admin-RPC attempt is denied

PASS.

Observed denial:

`Workspace admin authority required`

No participant-created denial-test Resource was created.

### R04 - Admin adds synthetic authority organization

PASS.

Synthetic organization ID:

`2caac295-a5f5-4fcf-b293-dff293dc7e25`

Primary-authority relationship was created for the synthetic Resource.

### R05 - Admin adds fixed active access path

PASS.

Synthetic access path ID:

`c0559450-2a84-40a2-b8f0-3840ec8ab0ff`

Observed status: `active`.

### R06 - Admin adds fixed plain-language guidance

PASS.

Synthetic guidance ID:

`a78707ae-7cda-4685-9092-83c7ca158e2d`

Observed status: `active`.

### R07 - Admin adds verification evidence

PASS.

Synthetic verification ID:

`e3f32cc7-ba1f-4f35-9d26-8b69a6c67ed5`

Observed verification status: `verified`.

### R08 - Admin activates after required evidence exists

PASS.

Observed canonical Resource status after activation: `active`.

The browser harness intentionally did not directly read `resource_visibility` because ordinary authenticated users do not have direct SELECT privilege on that table.

### R09 - Participant reads visible Resource through RLS

PASS.

Observed participant-visible rows while visibility was active:

- resource rows: `1`
- access paths: `1`
- guidance rows: `1`
- verification maintenance rows: `0`

This proved participant access to the intended Resource experience without exposing verification-maintenance evidence.

### R10 - Participant direct canonical write is denied

PASS.

Observed denial:

`permission denied for table resources`

The participant could read the visible Resource but could not directly mutate the canonical Resource table.

### R11 - Support non-admin canonical mutation is denied

PASS.

Observed denial:

`Workspace admin authority required for this resource`

The test harness was corrected before execution so this denial proof did not depend on Support having SELECT visibility to the canonical Resource.

### R12 - Participant links visible Resource to own submitted Support request

PASS.

Synthetic Support link ID:

`31eadd42-03ae-435d-87a9-38ce1b31be33`

The link carried the visible Resource and matching access-path context into the participant's own existing submitted Support request.

No Support request was auto-created by Resources.

### R13 - Cross-resource path mismatch

DEFERRED BY DESIGN.

No second Resource was manufactured solely to satisfy this negative fixture.

The existing composite Resource/access-path relationship remains part of the installed schema model and may be separately tested later if a safe second synthetic fixture is independently approved.

### R14 - Admin pauses workspace visibility for closeout

PASS.

The pause RPC succeeded.

External read-only database verification after R14 confirmed:

- canonical Resource status: `active`
- workspace visibility status: `paused`
- access path count: `1`
- guidance count: `1`
- verification count: `1`
- active Support link count: `1`

Nothing was deleted.

## Final participant invisibility proof

After R14, the controlled participant signed back in through the normal authenticated browser session.

The harness observed:

`Current visible fixture: Not visible to this actor / not created`

This proves that pausing workspace visibility removes the Resource from participant view while preserving the canonical Resource and its retained history/evidence.

## Harness corrections encountered during validation

Two bounded harness defects were found and corrected without changing the installed schema or privilege model.

1. The initial R01/R08/R14 harness logic attempted a direct authenticated SELECT from `resource_visibility`. This was a false-negative because direct authenticated SELECT on that table is intentionally not granted. The harness was corrected to respect the installed privilege boundary.
2. The initial R11 path required Support to SELECT the canonical Resource before attempting the expected-denial admin mutation RPC. Support correctly could not see that Resource. The harness was corrected to use the fixed synthetic Resource ID for the denial-only RPC attempt.

These corrections changed only the hidden synthetic test route.

Relevant harness checkpoints:

- `3fee4a590188f66e834c04b9efd5d36a20cb5c45` - visibility-verification harness correction
- `6de6ca9c95d609b72cb8a034809d2f6173c35d7f` - Support denial harness correction

## Final authenticated validation conclusion

The installed Resources RLS/RPC model passed the controlled authenticated browser test for the approved v0.1 scope.

Validated behavior:

- workspace admin can create and prepare canonical Resources;
- workspace admin can attach authority organization, access path, guidance, and verification evidence;
- activation succeeds after required evidence exists;
- active participant visibility works through RLS;
- verification maintenance evidence remains hidden from participants;
- participant canonical writes are denied;
- Support canonical creation and mutation authority are denied;
- participant Resource-to-Support context linking works only through the participant's own existing submitted Support request;
- pausing workspace visibility removes the Resource from participant view;
- canonical Resource/history/evidence remain preserved after pause;
- no hard delete is required for closeout.

## Known items not closed by this validation

This closeout does not silently resolve previously documented design caveats, including multi-workspace administration, active-resource child mutation/reverification behavior, append-only verification semantics, additional visibility lifecycle design, or a future safe cross-resource mismatch fixture.

Those remain separate candidate gates if and when they become necessary.

## Build and repository closeout

- Production deployment for harness checkpoint `6de6ca9c95d609b72cb8a034809d2f6173c35d7f`: verified Ready/Success during execution.
- `git diff --check`: not available through the GitHub connector during this documentation pass and therefore not claimed.
- `git status`: local workstation state is not visible through the connector and therefore not claimed.
- No push, merge, deployment command, schema migration, SQL execution, service-role use, or destructive action is performed by this documentation file.

## Exact next gate

Resources authenticated validation is closed.

The next Resources step, if separately approved, should be a review-only product-surface candidate based on the now-validated installed model and the frozen Resources product philosophy.

Do not broaden into Trust Engine integration, hidden recommendation logic, eligibility determination, clinical interpretation, automatic Support creation, or production participant content without a separate approved gate.
