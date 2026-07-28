# Renewing THRIVE Full-Spectrum Product Readiness Matrix

**Status:** Living product control document  
**Repository:** `thrive-stability-platform`  
**Branch:** `main`  
**Baseline checkpoint:** `20b8664`  
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
| Today | PARTIALLY CONNECTED | Uses existing participant context | Route exists and is participant-facing | No meaningful participant action confirmed | Route/build verified | Decide the smallest useful daily summary and next-action panel |
| My Program | WORKING | Reads active program and participation | Participant-facing program summary connected | Read-only | Person D and Person A access tested | Review wording and remove any remaining diagnostic language |
| Budget | PARTIALLY CONNECTED | Budget periods and lines installed; participant SELECT validated | Current budget period and summaries visible | Participant editing not yet established | Financial visibility tested | Define the smallest safe participant budget interaction |
| Banking / financial evidence | PARTIALLY CONNECTED | Sources, batches, staged transactions, reviews, and ownership model installed | Evidence is not yet a complete participant workflow | Imports/admin review controlled; participant explanation model exists | January ingestion and visibility tested | Build a plain-language participant transaction evidence view |
| Transaction explanations | PARTIALLY CONNECTED | Explanation table and RLS installed | Full participant explanation workflow not confirmed | Participant draft write policy exists | Database-level behavior tested | Connect one transaction explanation form to the validated model |
| Wellness | TEST-READY | Table, constraints, trigger, RLS, and same-day update installed | Read model and form connected | Person D client-path activation remains off | Authenticated database tests passed | Run one controlled Person D UI create/update/archive test |
| Goals | SHELL ONLY | No confirmed persistent goals model | Participant route and reviewed shell exist | Disabled / absent | Route and build verified | Define a minimal participant-owned goal record and one useful action |
| Support | SHELL ONLY | No confirmed persistent support-request model | Participant route and reviewed shell exist | Disabled / absent | Route and build verified | Define what a support request creates without clinical escalation |
| Reports | SHELL ONLY | Can eventually aggregate existing approved records | Participant route exists | No report-generation write needed yet | Route and build verified | Build one plain-language participant summary from existing read models |
| PWA / mobile | WORKING | Manifest and application metadata installed | Shared navigation and mobile shell exist | Not applicable | Build and route generation passed | Test installation and navigation on an actual phone |
| Trust Engine comparison | BLOCKED | Independent system; no synchronization approved | No merged participant workflow | No writes or synchronization | Not applicable | Keep frozen until separate authority and comparison design are approved |
| Deployment | BLOCKED | No production host approved | Local and Codespaces development only | Not applicable | Local production build passes | Resolve dependency security disposition and complete product-readiness review |

## Current technical baseline

- Next.js 16.2.12
- React 19.2.4
- Local development environment working
- Production build generating 24 of 24 routes
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

1. Wellness controlled Person D client-path test
2. Budget participant interaction
3. Banking evidence and participant explanations
4. Today summary
5. Goals
6. Support
7. Reports
8. PWA phone test
9. Deployment readiness

## Exact next gate

Review the participant-facing routes locally and update this matrix only with
observed evidence.

Begin with `/`, `/my-program`, `/budget`, and `/wellness`.

Do not activate writes during the visual readiness review.
