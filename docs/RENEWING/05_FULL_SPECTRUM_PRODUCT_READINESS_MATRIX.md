# Renewing THRIVE Full-Spectrum Product Readiness Matrix

**Status:** Living product control document
**Repository:** `thrive-stability-platform`
**Branch:** `main`
**Reconciled checkpoint:** `679df81`
**Framework:** Next.js 16.2.12

## Purpose

This matrix is the authoritative route-level view of THRIVE product readiness.

It prevents repeated excavation of historical candidates and validation records.
Detailed documents remain evidence, but this file records the current product
state and the smallest approved next step for each module.

## Readiness labels

- **WORKING**: Connected and usable for its currently approved purpose.
- **PARTIALLY CONNECTED**: Real data or logic exists, but the participant workflow is incomplete.
- **SHELL ONLY**: Participant-facing route exists, but meaningful persistent workflow is not connected.
- **BLOCKED**: Cannot safely proceed until a named dependency or approval is resolved.
- **TEST-READY**: Implementation exists and is awaiting a controlled synthetic test.

## Current application matrix

| Module | Current state | Database / service state | Participant UI state | Write state | Synthetic validation | Smallest next step |
|---|---|---|---|---|---|---|
| Authentication | WORKING | Supabase authentication connected | Login and protected-route behavior working | Authentication writes handled by Supabase | Multiple synthetic users tested | Confirm route behavior locally after framework patch |
| Participant identity | WORKING | `supported_people` installed with RLS | Signed-in participant resolves own identity | Admin-controlled identity writes | Person A, Person D, admin, and outsider tested | Treat identity spine as established infrastructure |
| Workspace isolation | WORKING | Workspace membership and helper functions installed | Workspace scope enforced behind participant experience | Admin-controlled | Admin/member/outsider paths tested | No additional broad verification unless a defect appears |
| Program participation | WORKING | `programs` and `program_participants` installed with RLS | My Program resolves linked active program | Admin-controlled participation writes | Person A and Person D isolation tested | Review participant usefulness, not schema existence |
| Today | WORKING | Uses established participant context and approved route reads | Participant home prioritizes Wellness, Goals, and Support with contained financial context | Read-only | Desktop/mobile route review and 24/24 build passed | Preserve current participant-home scope unless a defect or approved action requires change |
| My Program | WORKING | Reads active program and participation | Participant-facing program summary uses plain-language program context | Read-only | Person D/Person A isolation plus desktop/mobile review passed | Preserve the current read-only participant summary |
| Budget | WORKING | Budget periods and lines installed; participant SELECT validated | Current plan, recorded activity, remaining amount, category progress, and neutral status language are visible | Read-only | Financial visibility plus desktop/mobile participant review passed | Keep read-only while a separately approved participant interaction is defined |
| Banking / financial evidence | PARTIALLY CONNECTED | Sources, batches, staged transactions, reviews, and ownership model installed | Evidence is not yet a complete participant workflow | Imports/admin review controlled; participant explanation model exists | January ingestion and visibility tested | Build a plain-language participant transaction evidence view |
| Transaction explanations | PARTIALLY CONNECTED | Explanation table and RLS installed | Full participant explanation workflow not confirmed | Participant draft write policy exists | Database-level behavior tested | Connect one transaction explanation form to the validated model |
| Wellness | WORKING | Table, constraints, business-date default, trigger, RLS, same-day update, and archive behavior installed | Participant reflection form and current active check-in read are connected | General participant saving remains off; controlled Person D path closed | Create, changed-value update, duplicate prevention, admin archive, deactivation, desktop/mobile review, and 24/24 build passed | Keep general activation frozen until a separate rollout decision |
| Goals | WORKING | `participant_goals` v0.2 installed with constraints, trigger, RLS, and no DELETE policy | Guided participant creation, editing, progress, archive, and read-only history are connected | Participant-owned create and update paths validated | Participant A, Participant D, outsider, and admin RLS tests plus guided UI lifecycle validation passed | Preserve the current participant-owned Goal scope unless a defect or separately approved refinement appears |
| Support | WORKING | Persistent Support request, entry, link, status-event, routing, assignment, RLS, privilege-hardening, and lifecycle controls are installed | Participant and reviewer authenticated paths exist; guarded synthetic controls have validated request lifecycle, link archival, routing, and assignment | Participant and reviewer writes are scoped and guarded; no DELETE privilege; status-event table is read-only to authenticated users | Synthetic participant/reviewer validation passed through Support Path B fifth slice, including lifecycle, archived-link preservation, routing, assignment, and audit-event reconciliation | Preserve the current validated Support scope until the product control spine identifies a separately approved next refinement |
| Reports | WORKING | Aggregates approved participant financial read models | Statement periods, connected sources, transaction totals, category summaries, and source boundaries are visible | Read-only | Desktop/mobile participant review and connected synthetic financial data verified | Preserve the current read-only summary while separately reviewing future participant explanations |
| PWA / mobile | WORKING | Manifest and application metadata installed | Shared navigation and mobile shell exist | Not applicable | Build and route generation passed | Test installation and navigation on an actual phone |
| Trust Engine comparison | BLOCKED | Independent system; no synchronization approved | No merged participant workflow | No writes or synchronization | Not applicable | Keep frozen until separate authority and comparison design are approved |
| Deployment | BLOCKED | No production host approved | Local and Codespaces development only | Not applicable | Local production build passes | Resolve dependency security disposition and complete product-readiness review |

## Current technical baseline

- Next.js 16.2.12
- React 19.2.4
- Local development environment working
- Production build generating 25 of 25 routes
- Supabase environment connected
- GitHub remains the authoritative source repository
- SSD clone is the primary daily development workspace
- Codespaces is an optional secondary workspace

## Current security disposition

The application builds successfully on Next.js 16.2.12.

`npm audit --omit=dev` currently reports transitive findings through Next.js:

- nested PostCSS;
- optional Sharp.

Do not run `npm audit fix --force`.

Deployment remains gated until these findings are resolved upstream or a separately
approved compatibility-tested override is adopted.

This does not block continued local participant-experience development.

## Product-development rule

Do not repeat broad schema, RLS, identity, or isolation verification unless:

1. a new feature changes those boundaries;
2. a test fails;
3. a live-schema discrepancy appears;
4. a production deployment gate specifically requires it.

Use existing validated infrastructure and move forward through focused route-level
product passes.

## Recommended working order

1. Reconcile the remaining authoritative product-control documents against current repository truth
2. Banking evidence and participant explanations
3. PWA phone test
4. Deployment readiness

## Exact next gate

Reconcile the current executive handoff against the verified repository state and the newly updated Support checkpoint history.

Do not begin a sixth Support slice, broaden participant writes, modify schema or RLS, introduce clinical escalation, imply emergency-response capability, activate Johnny, synchronize with the Trust Engine, deploy, merge, or push during this reconciliation.
