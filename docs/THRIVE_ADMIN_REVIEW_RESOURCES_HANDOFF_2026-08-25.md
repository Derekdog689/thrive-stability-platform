# THRIVE Admin / Review + Resources Handoff

Date: 2026-08-25
Status: NEW THREAD HANDOFF / current operating rail

## Thread purpose

Continue THRIVE from the post-Gate-4 limited-live state with the next product rail focused on:

1. Admin / Review operating surfaces;
2. Supported People / onboarding administration;
3. Resources admin maintenance (Resources Slice C);
4. small remaining roadmap reconciliation items that directly support those layers;
5. controlled regression testing using preserved synthetic actors where useful.

This is not a broad rebuild.

---

## Verified current state

### System baseline

`THRIVE_SYSTEM_BASELINE_V1` is already recorded as the frozen system baseline.

The real limited-live operating spine is installed:

- workspace: `THRIVE Personal Stability`;
- workspace id: `211d2c03-e2ac-4205-96b2-9a821b8bc6bd`;
- workspace type: `personal`;
- status: `active`;
- program: `THRIVE Stability Support`;
- program id: `1a5887be-aa0e-4392-a688-04304686fbd6`;
- program type: `stability_support`;
- status: `active`.

### Limited-live identities

The current live identity model is intentionally one account / one purpose.

- Derek system/admin identity -> active `admin` workspace membership.
- Derek ordinary identity -> active supported person + active program participant.
- Heidi reviewer/support identity -> active `support` workspace membership.
- Heidi ordinary identity -> active supported person + active program participant.

Do not merge these identities or introduce role switching unless a separately approved future architecture requires it.

### Gate 4 role-aware landing

CLOSED and runtime-validated on phone.

- admin root/front-door behavior routes to `/admin`;
- support reviewer root/front-door behavior routes to `/admin/support`;
- ordinary participant identities remain in participant THRIVE `/`;
- missing browser auth session is treated as signed out, not as an auth failure;
- reviewer/admin access resolution is scoped to the real limited-live workspace rather than historical demo memberships.

Closeout:

`docs/THRIVE_GATE_4_ROLE_PURPOSE_LANDING_CLOSEOUT_2026-08-25.md`

### Support

Support is working infrastructure for the currently approved human assistance loop.

Participant side:

- create request;
- follow status;
- read participant-visible reviewer response;
- reply when Support is waiting for participant;
- see closed history.

Reviewer side:

- acknowledge;
- start work;
- send participant-visible update;
- request information;
- read participant reply;
- continue work;
- complete;
- review closed history.

The current real limited-live reviewer queue may be empty until a real participant submits a request. That is expected and not a defect.

### Resources

Resources participant work is already closed for:

- Slice A: participant read-only Resources list/detail;
- Slice B: participant-selected Resource -> existing Support bridge.

Participant Resource behavior is proven:

- category-first discovery;
- factual guidance;
- official access paths;
- participant-initiated Support handoff;
- no auto-created request;
- no prefilled participant words;
- Resource context is structured provenance only;
- pausing Resource visibility does not erase Support history.

Current Resources product gap:

**Slice C - Admin Resources read/maintenance shell is intentionally not built yet.**

Frozen prior design for Slice C:

- add Resources card/link for workspace admin only;
- create `/admin/resources`;
- create `/admin/resources/[id]`;
- initially emphasize read/review, draft creation, evidence inspection, verification state, activation/pause controls already supported by installed backend/RPCs;
- do not grant Resources maintenance authority to ordinary `support` reviewers;
- do not silently add broad active-content mutation behavior;
- reconcile any missing admin read requirement before changing DB privileges;
- no hard delete.

Real Resource content ingestion remains later Slice D work after the admin maintenance surface is proven.

No production Resource content has been seeded yet.

---

## Admin / Review product interpretation

THRIVE currently has three intentionally distinct experiences:

### Participant THRIVE

Ordinary supported-person experience.

### THRIVE Review

Authorized human-response surface for Support requests.

Reviewer/support authority is operational, not system-governance authority.

### THRIVE Admin

System ownership / maintenance / onboarding authority.

The current `/admin` landing still carries the `THRIVE Review` title and currently exposes:

- Support queue;
- Supported People -> Coming later;
- Reports -> Coming later.

This landing is functional but not yet fully reconciled as a distinct Admin product surface.

Do not redesign it broadly before defining the smallest operating tasks.

---

## Recommended next rail

### Gate A - Admin / Review landing reconciliation

Read-only inspect the current `/admin`, `/admin/support`, `useAdminAccess`, and role-purpose resolver against the now-proven operating model.

Decide the smallest UI distinction between:

- admin system owner;
- support reviewer.

Likely outcome:

- support identity continues directly to `/admin/support`;
- admin identity lands on `/admin`;
- `/admin` becomes the small system-operation home rather than pretending admin and reviewer are the same role;
- Support queue remains available to admin because existing authorization permits it, but reviewer work remains conceptually separate from system-maintenance work.

Candidate first. No broad redesign.

### Gate B - Supported People / onboarding admin UI candidate

Design the smallest admin UI for recurring supported-person onboarding so routine operation no longer requires manual Supabase work.

Expected operator concept:

`Admin -> Supported People -> Add / Open person`

The UI should safely orchestrate already-established database truth rather than recreate authority in the browser.

Minimum responsibilities to consider:

- supported-person identity record;
- preferred/display name;
- program participation;
- participation status;
- optional auth-user linkage when interactive login is needed;
- read-only login state / onboarding state;
- archive/pause/inactive/completed semantics rather than hard delete.

Do not automatically add a supported person to `workspace_members` merely because they participate in the program.

Reviewer/support workspace membership is a separate authority relationship.

### Gate C - Resources Slice C admin maintenance shell

After the Admin landing and operator model are reconciled, implement the previously frozen Resources admin slice.

Initial admin Resources UI should likely support:

- list canonical Resources visible to the admin maintenance layer;
- inspect canonical Resource identity;
- inspect organizations/authority;
- inspect access paths;
- inspect guidance sections;
- inspect latest verification evidence/state;
- create draft Resource through already-approved admin authority where backend support exists;
- activate/pause/resume only through installed lifecycle RPCs;
- preserve verification/reverification boundaries;
- preserve participant RLS and workspace visibility model;
- no hard delete;
- no maintenance authority for ordinary support reviewer.

Do not seed real Resources until this admin maintenance workflow is proven.

### Gate D - Small roadmap cleanup / stale control-document reconciliation

Several older control documents now contain stale state, including references that:

- Resources still needs to be added;
- actual-phone PWA testing is still pending;
- Admin/onboarding work has not started;
- deployment is fully blocked even though production Vercel is now being used for controlled limited-live validation.

Do not rewrite the entire history.

Prepare a concise current-state reconciliation / amendment after the Admin + Resources next-gate plan is approved so the roadmap stops pointing backward.

### Gate E - Limited-live observation / My Story rail

Continue the agreed one-week ordinary-use observation before building My Story broadly.

Capture:

- what information the participant expects THRIVE to remember;
- what prior information would have been useful to surface;
- what feels repetitive across Today, Wellness, Goals, Budget, Financial Activity, Support, and Resources;
- where derived narrative helps;
- where new participant reflection should be stored rather than derived.

Do not build a duplicate My Story source-of-truth table.

---

## Synthetic regression actor

Preserve the existing controlled onboarding participant D for system/regression testing:

- email: `dstein561+thrive-onboarding-person-d@gmail.com`;
- auth UUID: `d48b7268-9aa6-4498-a923-2851fd5232c9`;
- supported person id: `71000000-0000-4000-8000-000000000009`;
- display name: `SUPPORTED PERSON ONBOARDING TEST D`.

Participant D remains valuable for:

- Resources visibility regression;
- Resource-to-Support bridge regression;
- participant RLS checks;
- Support authorization checks;
- destructive-looking edge-case tests that should not use the real limited-live participants.

Participant D should not become the ordinary usability person again and should not be confused with the real `THRIVE Personal Stability` participants.

Use synthetic actors only when a test actually benefits from them.

---

## Frozen boundaries

- Database remains authoritative.
- Do not merge participant, reviewer, or admin ownership/authority.
- Bank evidence remains observational evidence only.
- Explain before flagging.
- No service-role shortcuts.
- No hard deletes.
- No fabricated consent, explanation, clinical finding, historical check-in, or authority.
- No new SQL/schema/RLS changes unless the inspected product gate proves they are necessary and a separate candidate is approved.
- No silent scope broadening.
- No Trust Engine synchronization or merged workflow.
- Existing real limited-live participant records are not synthetic test fixtures.
- Do not rewrite working Support lifecycle unless a verified defect appears.
- Do not rebuild Resources participant Slice A/B unless a verified defect appears.

---

## Exact next gate for the new thread

**Gate A: read-only Admin / Review landing reconciliation.**

Inspect current repo code and current live role model, then write the smallest candidate answering:

1. What should `/admin` mean for the system owner?
2. What should `/admin/support` mean for the support reviewer?
3. Which current cards belong on Admin home now?
4. Should `Supported People` become the first real admin workflow?
5. Where should Resources Slice C enter the Admin experience?
6. Which existing admin/reviewer code can remain untouched?

Stop for approval before code changes.

After Gate A, the preferred working order is:

**Supported People onboarding UI -> Resources Slice C admin maintenance -> stale roadmap amendment -> continue limited-live observation / My Story design rail.**

---

## Repository checkpoint at handoff

Latest known implementation before this handoff:

`157265c87cd2598d541a9f0096cf055f30f3e85d` - treat missing auth session as signed out.

Gate 4 closeout documentation commit:

`77bec3b8571cadc0ea68fa93744e7bb87a2e92d4`.

This handoff document is the next documentation checkpoint.

`git diff --check`: local workstation not available through connector during this documentation pass.

`git status`: local workstation not available through connector during this documentation pass.

Do not infer local clean/dirty state from GitHub.
