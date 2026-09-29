# THRIVE Money Truth Coherence v0.1

## Status

Approved, implemented, backend installed, and candidate UI build verified.

## Core rule

A date makes Financial Activity eligible to consider for a Money plan. A matching date does **not** make that activity belong to the plan.

## Money plan activity

An outflow belongs to a Budget period when it has an active `participant_financial_activity_allocations` relationship to a Budget line in that period.

An inflow belongs to a Budget period when it has an active `participant_financial_activity_period_links` relationship to that period.

The Money screen counts and displays only activity explicitly related to the selected active Budget.

## Available activity

Activity inside the active plan dates with no active Budget relationship appears separately as **Available to add**.

Activity already related to any other Budget is excluded from the current Budget and remains in its original history.

## Ownership hardening

Money-out Financial Activity may have multiple category allocations inside one Budget period, but may not have active allocations across different Budget periods.

Money-in Financial Activity may have one active Budget-period membership.

No historical activity or prior allocation was moved, rewritten, or deleted during this pass.

## Assisted Budget handoff

For a Money Support request linked to a draft Budget:

- Support shows **Review starter plan** as the primary action.
- Messaging Support remains secondary.
- Today shows **Your starter Money plan is ready** and routes directly to the exact linked Budget.
- Money accepts the linked Budget ID via `?review=<budget_period_id>` and prefers that exact draft.

If the linked Budget is already active, participant surfaces no longer treat the Support request as requiring a reply merely because its Support workflow status is still `waiting_for_participant`.

## Admin wording

The assisted-Budget screen distinguishes:

- **Total money available for this plan**
- category **Amount to set aside**

The total available field starts blank rather than prefilled.

## Verification

Verified with rollback-safe live tests:

- manual inflow can be linked to the active Budget;
- duplicate inflow membership is denied;
- cross-Budget outflow ownership is denied;
- current live assisted Budget had zero activity relationships;
- previously displayed Gas / Sunburn / Flowery rows were related to prior Budget periods, not the current Budget;
- Supabase security advisor reports no new finding for the new table/functions/guard.


## 2026-09-29 hardening reconciliation

A later live-schema reconciliation found that the first installed period-link INSERT
policy used ambiguous unqualified references inside correlated subqueries. The live
policy was replaced with an exact participant/Budget/activity validator.

Additional hardening now installed:

- `can_link_my_inflow_to_budget_v1` validates the exact participant, program,
  Budget period, activity identity, inflow direction, and activity date;
- the validator is `SECURITY INVOKER`;
- `create_my_manual_inflow_for_budget_v1` creates manual Money-in and its Budget
  membership atomically, so a membership failure does not leave an orphan activity;
- linked manual inflows cannot be changed to Money-out or moved outside the owning
  Budget period;
- archiving a linked manual inflow archives its period link and preserves history;
- anonymous execution is denied for the new write RPCs;
- Supabase security advisor reports no new finding for the hardened validator.

No historical Financial Activity was moved, reclassified, backfilled, or deleted.
