# THRIVE Synthetic Participant Usability Reconciliation v0.1

**Project:** Renewing THRIVE
**Owner:** DSS Enterprises
**Status:** Review-only product reconciliation
**Date:** 2026-08-10
**Latest committed checkpoint entering reconciliation:** `66038c8`

## 1. Purpose

THRIVE is not being prepared for Johnny activation in this gate.

The current goal is to let one synthetic supported person use THRIVE manually through the ordinary participant-facing UI so the system can be exercised as a product rather than primarily through isolated test harnesses.

## 2. What Is Working

Verified pieces include:

- synthetic participant authentication
- supported-person identity and program/workspace scope
- participant-owned financial source visibility
- participant financial transaction read path
- one participant-owned draft transaction explanation create/read/edit path
- protected staged bank evidence
- transaction explanation RLS correction
- transaction explanation harness relocked after proof
- previously validated Support foundation slices

These are working building blocks, not a declaration that the modules are finished.

## 3. What Is Not Done Yet

### Budget

Current participant experience is still primarily read-oriented.

Still needed:

- normal participant-facing budget input/edit controls
- persistence verification
- ordinary workflow without relying on a test harness
- validation and safe error handling

### Banking

Current participant experience can read owned synthetic financial data, and the draft explanation path has been proven.

Still needed:

- normal integrated participant explanation UI
- ordinary interaction from Banking/Reports instead of the dedicated harness
- any intended participant banking input/import workflow must be separately defined and tested
- no bank evidence may be silently changed by participant context

### Wellness

Persistence is not yet trusted as complete.

Still needed:

- verify what the ordinary participant Wellness UI currently saves
- identify any non-persistent controls
- prove saved state survives refresh/re-entry
- keep clinical interpretation boundaries separate

### Support

Support has a validated backend/foundation, but the ordinary participant experience is not yet considered finished.

Still needed:

- reconcile current participant-facing Support UI against the validated support data model
- prove the intended ordinary request flow
- confirm lifecycle/status presentation
- avoid expanding into another Support feature slice unless required for usability

### Reports

Reports are not yet considered complete.

Still needed:

- reconcile what participant reports currently display
- determine which reports are read-only summaries versus interactive surfaces
- ensure explanations, bank facts, calculations, and future Trust facts stay distinct
- complete ordinary participant-facing report usability

### Navigation / Product Experience

The system currently exposes many test pages.

Still needed:

- identify the real participant routes that should remain visible in ordinary use
- keep test harnesses available for controlled verification but out of the normal participant experience
- create a coherent synthetic participant journey through Today, Budget, Banking/Reports, Wellness, Support, and other approved modules
- avoid presenting synthetic test infrastructure as production UX

## 4. Synthetic Participant Goal

Use one synthetic participant as a stand-in for a future real supported person.

The synthetic participant should be able to:

1. sign in through the normal participant path;
2. land on the ordinary THRIVE participant experience;
3. move through the real navigation;
4. enter or update permitted participant-owned information;
5. save it;
6. refresh or return later and see persisted state;
7. view bank evidence without changing the evidence itself;
8. attach participant-authored context where authorized;
9. request Support through the normal UI;
10. view Reports through the normal UI.

This is a usability and integration target, not a real-person activation.

## 5. Frozen Boundaries

- Do not create Johnny.
- Do not create Johnny's auth user.
- Do not insert Johnny data.
- Do not connect Johnny to financial sources.
- Do not synchronize THRIVE with the Trust Engine.
- Do not fabricate consent, authority, history, explanations, wellness records, or support records.
- Do not broaden participant authority simply to make the UI easier.
- Do not push, deploy, merge, or use service-role access without separate approval.
- Do not hard delete data.
- Keep synthetic data clearly synthetic.

## 6. Smallest Safe Next Gate

### Synthetic Participant Usability Inspection v0.1

Inspect the current ordinary participant-facing routes and classify each as:

- working and persistent
- working but read-only
- partially working
- test-harness only
- blocked/broken
- not yet wired

Priority inspection order:

1. Today / participant home
2. Budget
3. Banking / financial experience
4. Wellness
5. Support
6. Reports
7. navigation and test-page exposure

For each module, inspect the current repo files and live database behavior before proposing changes.

## 7. Candidate Build Direction After Inspection

After the inspection, select the smallest product-facing usability slice.

The likely sequence should favor:

1. one real participant input that saves successfully;
2. one real participant readback after refresh;
3. integration into ordinary navigation;
4. removal of dependence on a dedicated test harness for that workflow.

Do not choose the slice by assumption. Choose it from verified current code and database truth.

## 8. Readiness Assessment

**Transaction explanation draft proof:** PASS

**Synthetic participant product usability:** IN PROGRESS

**Budget participant input:** NOT YET VERIFIED COMPLETE

**Banking participant interaction:** PARTIAL

**Wellness persistence:** NOT YET VERIFIED COMPLETE

**Support ordinary participant experience:** NOT YET RECONCILED COMPLETE

**Reports ordinary participant experience:** NOT YET RECONCILED COMPLETE

**Johnny activation:** OUT OF SCOPE

**Trust Engine synchronization:** OUT OF SCOPE

## 9. Direction

The next milestone is not activation.

The next milestone is the first point where a synthetic participant can sit inside the normal THRIVE interface, enter something meaningful through the ordinary UI, save it, come back, and see that THRIVE behaved like a real application.

That is the bridge from test harnesses to product use.
