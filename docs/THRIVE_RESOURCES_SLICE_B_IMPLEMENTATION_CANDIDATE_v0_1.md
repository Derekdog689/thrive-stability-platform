# THRIVE Resources Slice B Implementation Candidate v0.1

Date: 2026-08-24
Status: Review-only candidate
Repository: `Derekdog689/thrive-stability-platform`
Branch: `main`

## Verified starting state

Slice A is closed and runtime-validated.

The participant Resources list/detail surface is live and read-only. The controlled synthetic Resource is preserved with canonical status `active` and workspace visibility `paused` after closeout.

The installed Resources/Support bridge model has already been authenticated-tested through R12 using a participant-created submitted Support request.

This candidate does not reopen Slice A or the installed Resources authority model.

## Frozen boundaries

Slice B must preserve all of the following:

- participant initiates the Support request;
- participant writes their own question/request;
- nothing is submitted automatically;
- Resources does not create a Support request merely because a Resource was viewed or because `Ask Support` was clicked;
- Resource context does not establish eligibility, diagnosis, recommendation, need, urgency, risk, priority, legal authority, clinical authority, fiduciary authority, or Trust Engine authority;
- Support remains the existing Support system and lifecycle;
- no new Support system;
- no Support-user Resources-admin authority;
- no production Resource seeding;
- no admin Resources product UI;
- no Trust Engine synchronization;
- no hard deletes;
- no service-role client.

## Inspection findings

### Existing participant Support create flow

Current route: `/support`.

The participant Support create flow already:

- resolves the signed-in supported person;
- resolves active program participation;
- lets the participant choose a Support area;
- lets the participant choose optional guided wording;
- requires the participant to provide their own `participant_message`;
- optionally captures `requested_support` and contact preference;
- inserts the Support request with status `submitted` and `created_by = auth.uid()`;
- then displays the existing lifecycle confirmation/history UI.

There is no reason to replace this flow for Slice B.

### Existing `support_request_links` bridge

Live database inspection confirms `support_request_links` already contains:

- `support_request_id`;
- `resource_id`;
- `resource_access_path_id`;
- participant/workspace/program scope fields;
- archive fields;
- `created_by`.

The table enforces exactly one link target among transaction, budget, wellness, goal, prior Support request, and Resource.

The installed Resource/path pair foreign key enforces that `resource_access_path_id` belongs to the same `resource_id`.

Authenticated users have `SELECT`, `INSERT`, and `UPDATE`, subject to RLS.

### Participant Resource-link INSERT policy

The live participant INSERT policy already requires:

- `created_by = auth.uid()`;
- own supported-person identity;
- active program participation;
- the target Support request must belong to the participant;
- the target Support request must still be `submitted`;
- the Support request must have been created by the current participant;
- the Resource must still be participant-visible through Resources RLS;
- an attached access path, if supplied, must be active and belong to the same Resource.

This is exactly the authority boundary Slice B needs.

### Proven write path

The controlled R12 test already proved that a participant can insert:

- their own submitted Support request;
- one visible Resource;
- one matching active Resource access path;

into `support_request_links` through the normal authenticated browser session.

Result: no new schema/RLS/RPC is currently required for Slice B.

## Candidate participant flow

### 1. Resource detail page

Replace the Slice A informational Support callout with a participant-initiated action:

**Need help using this?**

`Ask THRIVE Support`

The action navigates to the existing Support route with Resource context identifiers in the URL.

Candidate shape:

`/support?resource=<resource-slug>&path=<primary-access-path-id>`

The URL is only a pointer. It is not authority and must never be trusted as proof that the participant may use the Resource.

### 2. Support page revalidation

When `/support` receives Resource context, the Support page must re-read the Resource through the participant's current authenticated RLS session.

The Support page must verify:

- Resource exists for this participant now;
- canonical Resource is currently participant-visible through RLS;
- supplied access path, if present, is currently visible/active;
- supplied access path belongs to the Resource.

If any check fails, drop the Resource context and continue with the ordinary Support flow.

Do not expose a database error as a recommendation or participant fault.

Candidate fallback message:

`That Resource is not available to attach right now. You can still ask Support in your own words.`

### 3. Context banner

If revalidation succeeds, show a visible, removable context card above the existing create flow.

Candidate copy:

**You came here from Resources**

`<Resource name>`

`Support can see which Resource you were looking at if you choose to send this request.`

Optional secondary line:

`Starting point: <access-path label>`

Actions:

- `Keep this Resource with my request`
- `Remove Resource context`

Default candidate: context remains selected because the participant explicitly clicked `Ask Support` from that Resource, but it remains visibly removable before submission.

### 4. Do not auto-map Support category

Resource categories and Support request categories are different systems with different purposes.

Slice B must not infer a Support category from the Resource category.

The existing Step 1 remains unchanged.

The participant chooses their own Support area.

### 5. Do not prefill participant words

Slice B must not generate or inject a participant message such as:

`I need help with SNAP.`

The existing participant-message step remains required and participant-authored.

Resource name/path remain structured context only.

### 6. Existing six-step Support flow remains authoritative

Opening Support from Resources may automatically open the existing create form, but it must start at the normal first Support step.

The participant may:

- change category;
- go back;
- cancel;
- remove Resource context;
- leave without submitting.

No Support row is created until the existing final submit action.

## Candidate write sequence

Because `support_request_links` references an existing `support_request_id`, the current browser flow must create the Support request first and then attach the Resource link.

Candidate sequence on final participant submission:

1. Validate the participant's ordinary Support draft using the existing rules.
2. Create the Support request through the existing `support_requests` INSERT path.
3. If no Resource context is selected, finish exactly as Support does today.
4. If Resource context is selected, immediately insert one `support_request_links` row using:
   - the newly created Support request id;
   - the participant's current workspace/program/supported-person ids;
   - revalidated Resource id;
   - revalidated matching access-path id when present;
   - `created_by = auth.uid()`.
5. RLS remains the final authority for the link insert.

No generic link target picker is introduced.

## Non-atomic two-write behavior

Client-side creation of the Support request and Resource link is not a database transaction.

That means a narrow failure is possible:

- Support request creation succeeds;
- Resource-context link insert fails.

Slice B must not silently pretend context was attached.

Recommended behavior:

- keep the participant-created Support request intact;
- do not withdraw or fabricate a replacement request;
- show a clear warning:

`Your Support request was sent, but the Resource context could not be attached. Support will still receive the words you submitted.`

Why this is preferred for v0.1:

- participant intent to contact Support remains honored;
- no hidden retry or duplicate Support request;
- no new RPC is required;
- no lifecycle rollback is fabricated;
- failure is visible rather than silently losing context.

If future runtime testing shows this failure mode is operationally unacceptable, an atomic create-request-with-context RPC may be considered as a separate candidate gate.

## Existing Support history surface

Slice B should load active Resource links for the participant's own Support requests so the participant can see when Resource context was actually attached.

Candidate request-card section:

**Resource context**

`<Resource name>`

`<access-path label>` when available

This is factual provenance only.

Do not show:

- recommended resource;
- reason THRIVE thinks they need it;
- risk/priority labels;
- eligibility conclusions.

If the Resource later becomes paused, the historical Support link should remain preserved. The Support request should not lose its history merely because current participant Resource visibility changes.

For v0.1, the Support history display should avoid re-querying the Resource through current participant visibility if doing so would make historical context disappear. Before implementation, use the participant-readable `support_request_links` row plus only data that remains safely readable under the installed model. If historical Resource naming requires a new read helper or privilege change, stop and reconcile rather than broadening authority silently.

## Candidate code changes

### `src/app/resources/[slug]/page.tsx`

- replace Slice A `Open Support` link with `Ask THRIVE Support`;
- include Resource slug and primary access-path id in query parameters;
- no write on click.

### `src/app/support/page.tsx`

- read optional Resource query parameters;
- revalidate Resource/path through participant RLS;
- show removable Resource-context banner;
- open normal create flow at Step 1 when valid Resource context arrives;
- keep all current category/guidance/message/contact/confirmation steps;
- show link-attachment success/failure state after submission;
- optionally display factual Resource context on request cards if the existing read model supports it without privilege changes.

### `src/app/support/useParticipantSupport.ts`

Candidate extension:

- add an optional validated `SupportResourceContext` argument to `createRequest`;
- create the Support request exactly as today;
- after successful request insert, insert a `support_request_links` Resource row when context is present;
- return whether context attachment succeeded;
- never generate participant message text from Resource context;
- never create a second Support request when link insertion fails.

### `src/app/resources/resourceData.ts`

Prefer reusing the existing participant Resource/detail read helpers for Support-page context validation.

If a small helper is useful, add only a read-only helper that loads a visible Resource by slug and verifies the selected access path belongs to it.

## Candidate UI states

### Valid Resource context

`You came here from Resources`

Resource title and optional starting-point label are shown.

The participant can remove the context.

### Resource no longer visible

`That Resource is not available to attach right now. You can still ask Support in your own words.`

Ordinary Support remains available.

### Participant cancels

No Support request and no Support link are created.

### Request sent + context attached

Confirmation:

`Your Support request was received, and the Resource you selected was attached for context.`

### Request sent + context attachment failed

Confirmation/warning:

`Your Support request was sent, but the Resource context could not be attached. Support will still receive the words you submitted.`

Do not retry automatically if doing so could create duplicate links or obscure the first failure.

## Runtime validation candidate

Use the same controlled synthetic Resource and controlled participant.

The fixture should begin and end with workspace visibility `paused`.

Proposed sequence:

1. Admin resumes the existing synthetic visibility through installed `admin_resume_resource_visibility`.
2. Controlled participant opens `/resources/[slug]`.
3. Participant clicks `Ask THRIVE Support`.
4. Support page shows revalidated Resource context and normal Step 1.
5. Participant removes context once and verifies ordinary Support flow remains intact, without submission.
6. Participant returns from the Resource and keeps context.
7. Participant completes the existing Support flow using synthetic text only.
8. Before submit, verify no Support request/link exists from merely entering the flow.
9. Participant submits once.
10. Verify exactly one new submitted Support request is created.
11. Verify exactly one matching Resource-context `support_request_links` row is created for that request.
12. Verify no auto-generated participant message or category exists.
13. Verify participant request card shows factual context only if implemented safely.
14. Admin pauses synthetic visibility again.
15. Verify `/resources` no longer shows the synthetic Resource.
16. Verify the submitted Support request/history remains preserved.

No test should use real participant data.

## Known caveat carried forward

The existing participant pre-ack archive policy on a Resource link requires the Resource to remain participant-visible in its `WITH CHECK` clause.

That means if a Resource is paused before a participant attempts to archive/remove an already-created link while the Support request is still submitted, the archive action may fail.

Slice B does not need participant post-submit link removal for v0.1.

Therefore:

- do not introduce a post-submit `Remove Resource context` action in Slice B;
- the participant may remove context before submission;
- after submission, the Resource link is treated as preserved Support-request provenance;
- any future post-submit unlink/archive UX requires a separate lifecycle reconciliation candidate.

## Proposed decisions to freeze before code

1. `Ask THRIVE Support` starts the existing Support flow; it does not create a Support request.
2. Resource slug + path id may travel in the URL only as untrusted pointers.
3. Support revalidates Resource/path through participant RLS before displaying or attaching context.
4. Resource category does not auto-select Support category.
5. Resource context does not prefill participant-authored message text.
6. Valid context opens the normal Support create flow at Step 1.
7. Context is visibly removable before submission.
8. Final Support submission remains the only action that creates the Support request.
9. Resource link insertion happens only after the participant-created request succeeds.
10. If link insertion fails, preserve the Support request and show a transparent warning; do not create a duplicate request.
11. No post-submit participant unlink action in Slice B v0.1.
12. No schema/RLS/RPC change is proposed for initial Slice B implementation.
13. Existing Support lifecycle remains unchanged.
14. Controlled synthetic runtime testing must begin/end with Resource visibility paused.

## Exact next gate

Review and approve, revise, or reject the fourteen Slice B decisions above.

If approved, the next gate is **Slice B implementation only**:

- Resource detail `Ask THRIVE Support` context handoff;
- Support-page participant-RLS context revalidation;
- removable pre-submit context banner;
- existing Support six-step flow unchanged;
- Support request create followed by Resource-link insert;
- transparent partial-failure handling;
- no database migration;
- no new RPC;
- no production Resource seeding;
- no admin Resources UI;
- no Trust Engine work.

Do not broaden into post-submit unlinking, atomic RPC design, admin Resource maintenance UI, real Resource ingestion, or any database authority change without a separate approved gate.
