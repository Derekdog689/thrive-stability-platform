# Renewing THRIVE Full-Spectrum Product Readiness Matrix

**Status:** Living product control document
**Repository:** `thrive-stability-platform`
**Branch:** `budget-builder-category-v0-1`
**Reconciled checkpoint:** `d1a3ad9 Preserve historical Budget allocation visibility`
**Checkpoint continuity:** `BUILD_CHECKPOINTS.md` resumed at Checkpoint 065 after the post-064 usability and Budget sequence.
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
| Today | WORKING | Uses established participant context plus current participant-domain hooks | Participant home includes cross-module synthesis, plain-language current information, and next-step framing across Wellness, Goals, Support, Budget, My Program, and Reports | Read-only synthesis; does not create participant obligations | Desktop/mobile route review plus current synthesis behavior verified | Preserve Today as an action surface and continue only through approved Feedback Layer work |
| My Program | WORKING | Reads active program and participation | Participant-facing program summary uses plain-language program context | Read-only | Person D/Person A isolation plus desktop/mobile review passed | Preserve the current read-only participant summary |
| Budget | WORKING | Budget periods, lines, participant write paths, allocation relationships, lifecycle history, and derived allocation reads are installed | Participant can create and activate a Budget, enter expected income, create/edit categories, edit the active plan, review totals, compare recorded activity, and see historical periods | Participant-owned Budget writes are connected; participant-facing allocation archive is not approved | Ordinary Budget Builder, active-plan editing, allocation, lifecycle, and historical visibility work verified through current branch; archive-allocation experiment failed usability review and was not committed | Finish Budget-level complete/archive semantics while preserving historical allocations, totals, and transaction relationships; do not add participant-facing allocation archive controls |
| Banking / financial evidence | PARTIALLY CONNECTED | Financial sources, import batches, staged transactions, review state, ownership mapping, derived allocation reads, and posted-balance snapshot support are installed | Participant-facing financial evidence is visible through Budget, Today, and Reports, but a dedicated operational ingestion workflow is not complete | Imports and review remain controlled; participant-facing reads are connected | Institution-file ingestion, synthetic financial visibility, derived allocation reads, and participant reporting have been validated | Complete a traceable Financial Ingestion workflow for authorized statements and approved sources without blurring evidence, Budget planning, or participant explanation |
| Transaction Context | PARTIALLY CONNECTED | Participant transaction explanation table, RLS, and ordinary participant write path are installed | Participant can view existing context, create draft context, edit their own draft, and confirm persistent readback without changing the imported bank record | Participant-owned draft create/update is connected; complete participant submit/finalize semantics are not yet defined | Controlled proof plus ordinary participant-path validation completed | Define and verify the intended human lifecycle beyond persistent `draft` status before treating Transaction Context as fully complete |
| Wellness | WORKING | Wellness table, constraints, business-date handling, trigger, RLS, participant save path, and recent-history support are installed | Ordinary participant check-in, persistent readback, voluntary reflection, and recent history are connected | Ordinary participant save is enabled within the validated participant path | Controlled create/update, duplicate prevention, archived-history behavior, ordinary save, and recent-history behavior have been validated | Preserve Wellness as a voluntary non-clinical reflection module and review lifecycle semantics only if a human-flow defect appears |
| Goals | WORKING | `participant_goals` v0.2 installed with constraints, trigger, RLS, and no DELETE policy | Guided participant creation, editing, progress, archive, and read-only history are connected | Participant-owned create and update paths validated | Participant A, Participant D, outsider, and admin RLS tests plus guided UI lifecycle validation passed | Preserve the current participant-owned Goal scope unless a defect or separately approved refinement appears |
| Support | WORKING | Persistent Support requests, entries, links, immutable status-event history, routing, assignment, RLS, privilege hardening, and lifecycle controls are installed | Ordinary participant request creation and request history are connected; reviewer lifecycle, routing, and assignment remain separate from participant-owned content | Participant request writes are connected within validated scope; reviewer writes remain guarded; no DELETE privilege | Synthetic participant/reviewer validation plus ordinary participant request flow have been verified | Preserve the current Support scope and only expand through a separately approved refinement or defect correction |
| Reports | WORKING | Aggregates approved participant financial read models and current-plan comparison data | Statement periods, connected sources, transaction totals, category summaries, recorded outflow, source boundaries, and current-plan comparison are visible | Read-only | Desktop/mobile participant review plus connected synthetic financial data and current-plan comparison verified | Preserve Reports as a read-only history and pattern layer while future Feedback Layer work remains separate |
| PWA / mobile | WORKING | Manifest and application metadata installed | Shared navigation and mobile shell exist | Not applicable | Build and route generation passed | Test installation and navigation on an actual phone |
| Trust Engine comparison | BLOCKED | Independent system; no synchronization approved | No merged participant workflow | No writes or synchronization | Not applicable | Keep frozen until separate authority and comparison design are approved |
| Deployment | BLOCKED | No production host approved | Local and Codespaces development only | Not applicable | Local production build passes | Resolve dependency security disposition and complete product-readiness review |

## Current technical baseline

- Next.js 16.2.12
- React 19.2.4
- Local development environment working
- Last verified production build generated 28 of 28 routes
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

Use existing validated infrastructure and move forward through focused participant-facing product passes.

Before exposing lifecycle actions or backend status concepts in the ordinary participant UI, define the intended human meaning first:

- what the participant sees before the action;
- what the participant expects the action to mean;
- what remains visible afterward;
- what remains counted afterward;
- what remains editable afterward;
- how history is preserved.

Backend audit behavior must not automatically define participant-facing product semantics.

## Recommended working order

1. Complete reconciliation of the remaining authoritative product-control documents.
2. Finish Budget-level lifecycle semantics and close the current Budget layer.
3. Preserve and retire the 2099 synthetic participant from ordinary usability work.
4. Establish a new current-time tester using realistic periods and ordinary application-created data wherever possible.
5. Complete the operational Financial Ingestion workflow.
6. Build the authorized Admin / onboarding layer.
7. Reconcile Transaction Context lifecycle semantics beyond the current draft-only path.
8. Continue the THRIVE Feedback Layer and Today synthesis.
9. Continue Reports as the historical and pattern layer.
10. Add Resources as the self-directed support path.
11. Complete real-device, security, and deployment-readiness review after the participant product loop is coherent.

## Exact next gate

Complete the current documentation reconciliation.

Next:

- reconcile `README.md`;
- verify the complete documentation diff;
- run the production build;
- run `git diff --check`;
- review `git status`;
- review the reconciliation checkpoint before any commit or push.

Do not resume Budget feature wiring until the control spine accurately reflects the current participant product model and Budget-level lifecycle semantics.

Do not execute new SQL, activate Johnny, synchronize with the Trust Engine, use service-role shortcuts, delete historical evidence, deploy, merge, or push without separate explicit approval.
