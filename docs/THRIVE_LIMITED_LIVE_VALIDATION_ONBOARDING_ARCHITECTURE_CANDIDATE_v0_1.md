# THRIVE Limited-Live Validation + Onboarding Architecture Candidate v0.1

Date: 2026-08-25
Status: REVIEW-ONLY CANDIDATE
Baseline: `THRIVE_SYSTEM_BASELINE_V1` / `v1.0.0`
Repo baseline checkpoint: `60d02f5360d02733763fd7b5620a6271d8151f24`

## Purpose

This candidate defines the smallest safe operating model for moving THRIVE from synthetic/system validation into controlled limited-live use by real humans.

Limited-live validation means real people use THRIVE for its intended participant and Support workflows while the system remains intentionally small, observed, and under active product validation. It is not broad rollout, commercialization, or unrestricted production operation.

This document does not create any workspace, program, supported person, auth user, workspace membership, or data record.

---

## Verified starting state

- `THRIVE_SYSTEM_BASELINE_V1` is recorded as `frozen`.
- Local and remote `main` are synchronized at the frozen baseline closeout checkpoint.
- Participant surfaces for Today, Wellness, Goals, Budget, Financial Activity, Support, and Resources have been exercised through controlled validation.
- Support is a two-sided human assistance workflow, not an intake-only form.
- The Support reviewer surface can acknowledge, start work, send participant-visible responses, request information, receive participant replies, and complete requests.
- Support lifecycle and audit history are database-enforced.
- Synthetic supported-person fixtures remain available as validation evidence and are not to be deleted.
- No real non-demo supported-person operating workspace/program has yet been created for this limited-live phase.

---

## Proposed operating spine

### Workspace

**Name:** `THRIVE Personal Stability`

**workspace_type:** `personal`

**status:** `active`

Purpose: the real limited-live workspace for participant-centered THRIVE use. It should not inherit demo/test naming or authority merely because synthetic fixtures already exist elsewhere.

### Program

**Name:** `THRIVE Stability Support`

**program_type:** `stability_support`

**status:** `active`

Purpose: the real supported-person program inside the limited-live workspace.

The test workspace/program are not renamed into these records. The limited-live spine is created separately so test evidence and operating truth remain distinguishable.

---

## Three experience roles

THRIVE currently has three distinct experience responsibilities even where route names are still evolving.

### 1. Participant

Participant-facing THRIVE includes:

- Today;
- Wellness;
- Goals;
- Budget;
- Financial Activity;
- participant-owned Transaction Context;
- Support request/reply experience;
- Resources;
- future My Story / Reflection experience.

A participant should experience only participant-authorized behavior. Admin privileges must not silently improve or alter the participant test experience.

### 2. Reviewer / Support

The reviewer/support experience is the authorized human-response side of THRIVE Support.

Its current primary operational surface is the Support Review queue.

An authorized reviewer/support person may:

- see participant Support requests within their authorized workspace;
- acknowledge a request;
- start work;
- send participant-visible responses;
- request additional participant information;
- receive participant replies;
- continue work;
- complete the request;
- review closed request history;
- create reviewer-only internal notes where authorized;
- use assignment/routing behavior already governed by the Support model.

Support must remain a human assistance workflow. THRIVE may display timing obligations or orientation, but must not fabricate a human response, automatically decide that support has been provided, or automatically mark a request complete.

### 3. System Admin / Maintenance

System admin/maintenance authority is separate from ordinary participant use and reviewer/support work.

This role may eventually include:

- supported-person onboarding;
- workspace/program maintenance;
- role/access maintenance;
- Resource governance;
- system checkpoints/governance;
- controlled synthetic-test maintenance;
- other explicitly approved system operations.

System admin authority does not mean that an admin testing the participant experience should use admin permissions during that participant session.

---

## Initial limited-live identities

### System owner / maintenance authority

The system owner remains an admin/system-maintenance authority for THRIVE.

### Ordinary participant validation identity

The system owner may separately use an ordinary personal THRIVE identity during the limited-live week to experience THRIVE with participant permissions only.

The ordinary participant identity must not rely on admin membership to access participant data. Participant access should derive from the supported-person + active program-participation model already validated in the database.

### Reviewer / Support validation identity

Heidi's reviewer/support identity may be used to exercise the Support Review side of the real limited-live workflow.

Her personal identity may separately be used for participant-side validation if and when that is intentionally onboarded.

Reviewer/support authority and participant identity should remain distinguishable even when the same human may hold both in separate contexts.

---

## Supported-person onboarding order

For each real limited-live participant, the candidate onboarding sequence is:

1. Create the supported-person record in `THRIVE Personal Stability`.
2. Create the person's active `supported_person` participation in `THRIVE Stability Support`.
3. Decide whether the person needs interactive login access.
4. If login is needed, create or identify the intended auth user and link `supported_people.auth_user_id` to that user through the separately approved onboarding process.
5. Do not automatically create a `workspace_members` row merely because someone is a supported person.
6. Add workspace membership only if that identity separately needs workspace-level authority such as admin, support, or viewer access.
7. Verify participant access under ordinary participant permissions before relying on the account for limited-live use.

This preserves the verified distinction between supported-person participation and workspace-level authority.

---

## Reviewer / Support onboarding

A reviewer/support identity requires an active `workspace_members` relationship in the limited-live workspace with an appropriate reviewer role already recognized by the Support authorization model.

Current database truth recognizes active `admin` and `support` workspace members as Support reviewers.

For limited-live validation:

- the system owner remains `admin`;
- the designated reviewer/support identity should use `support` unless broader admin authority is intentionally required;
- participant identities should not receive Support reviewer authority merely for convenience.

The Support Review queue must be tested under the actual reviewer/support identity, not only under system-admin access.

---

## Support loop as a core limited-live requirement

The limited-live week must exercise at least one ordinary end-to-end Support episode using real participant/reviewer identities:

1. participant submits an ordinary Support request;
2. reviewer sees it in Support Review;
3. reviewer acknowledges it;
4. reviewer starts work or provides a meaningful participant-visible response;
5. if more information is needed, reviewer moves the request to waiting-for-participant and asks for that information;
6. participant replies through the participant Support experience;
7. reviewer receives the reply and continues the work;
8. reviewer completes the request when the support episode is actually complete;
9. both sides verify that the resulting history remains visible appropriately.

A Support request is not complete merely because it was submitted, viewed, acknowledged, or automatically timed out.

---

## Synthetic fixture policy

Synthetic fixtures remain preserved as system-validation evidence.

During limited-live use:

- do not hard-delete synthetic supported people, Support history, Resources validation records, or other test fixtures;
- do not reuse synthetic identities as real participant records;
- do not rename the synthetic test workspace/program into the real limited-live workspace/program;
- keep synthetic fixtures outside ordinary operating workflows;
- later archive, pause, deactivate, or complete synthetic records only through a separately reviewed cleanup gate after the real operating spine is proven.

---

## Limited-live validation definition

This phase is successful if real humans can use THRIVE through the intended identities and permissions while preserving the current governance and person-centered model.

The week should observe, rather than prematurely redesign:

- whether Today orients appropriately;
- whether participant navigation feels understandable;
- whether Wellness and Goals feel natural in ordinary use;
- whether Budget / Financial Activity separation remains understandable;
- whether Support works as a real two-way assistance loop;
- whether reviewer timing and queue behavior remain workable;
- whether Resources provide useful guided references without creating unsupported conclusions;
- what information the participant naturally expects THRIVE to remember;
- what prior information would have been useful to surface;
- where My Story / Reflection should provide continuity without duplicating source truth.

Defects discovered during the week should be documented and prioritized. The existence of a defect does not automatically authorize a schema or lifecycle redesign.

---

## My Story during the limited-live week

My Story remains the approved longitudinal product North Star.

During this first limited-live week, My Story / Reflection is an observation and design rail rather than the next immediate broad implementation.

The intended future architecture remains:

`authoritative source records -> derived participant story read model -> participant reflection -> future participant context`

A future derived story view should normalize selected factual milestones without duplicating the authoritative source records.

A future reflection record may be appropriate for genuinely new participant-authored reflection. It must not copy or overwrite the underlying Wellness, Goal, Budget, Financial Activity, Support, or Resource truth.

---

## Explicitly not authorized by this candidate

This candidate does not authorize:

- creating the workspace or program;
- creating or linking a real supported person;
- creating an auth user;
- changing workspace membership;
- changing Support lifecycle or RLS;
- changing reviewer permissions;
- archiving or deactivating synthetic fixtures;
- building the My Story derived view;
- building participant reflection storage;
- broad admin/reviewer UI redesign;
- production deployment or unrelated feature work.

Each execution step requires a separately approved gate.

---

## Proposed execution gates after approval

### Gate 1: Limited-live spine creation candidate

Prepare exact SQL/data-operation candidate for:

- `THRIVE Personal Stability` workspace;
- `THRIVE Stability Support` program;
- required system-owner/admin membership only if not already established through the chosen identity model.

Review before execution.

### Gate 2: Reviewer/support identity candidate

Inspect the intended reviewer/support auth identity and prepare the exact workspace membership candidate. Review before execution.

### Gate 3: First participant onboarding candidate

Choose the first real limited-live participant identity and prepare the exact supported-person + program-participation + optional auth-link sequence. Review before execution.

### Gate 4: Permission validation

Verify ordinary participant access and reviewer/support access independently using their intended identities.

### Gate 5: One-week limited-live validation

Use THRIVE normally. Exercise the participant experience and at least one complete Support loop. Record defects, friction, and My Story / Reflection observations without silently broadening the architecture.

### Gate 6: Limited-live reconciliation

After the week, reconcile findings into:

- defect fixes where needed;
- onboarding/admin refinements;
- Support Review refinements only if actual use justifies them;
- My Story derived-view + Reflection candidate informed by real use.

---

## Approval question

Approve, revise, or reject this candidate before any limited-live workspace/program/member/participant creation occurs.
