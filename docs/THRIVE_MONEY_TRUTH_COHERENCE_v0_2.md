# THRIVE Money Truth / Coherence v0.2

## Verified defects

1. Budget activity was selected by date overlap instead of Budget ownership.
2. Activity allocated to earlier Budget periods could appear inside a newer Budget.
3. Activity cards could display category allocations from a different Budget period.
4. Assisted Money Support used the generic waiting-for-participant reply UI even when the real participant action was to review a linked starter plan.
5. Today repeated the same generic Support-reply action.
6. Admin assisted-budget setup prefilled Total Money Available with $1,500, making total-plan money too easy to confuse with a Housing/Rent allocation.
7. Inflows currently have no explicit Budget-period ownership relationship; date overlap is the only connection.

## Installed / candidate behavior

### Budget activity truth

- Date overlap means an activity is eligible to be considered for a period.
- An explicit allocation means an outflow belongs to that Budget.
- Current-plan activity count and activity cards use allocations whose `budget_period_id` matches the current Budget.
- Allocations from prior Budgets are never displayed as current-Budget category chips.
- A Budget with zero linked activity displays zero current activity even when older transactions share its dates.

### Assisted Budget return

For a `budget_money` Support request that is `waiting_for_participant` and has a linked `budget_period_id`:

- Support primary action becomes **Review starter plan**.
- Message Support remains available as a secondary action.
- Today primary action becomes **Your starter Money plan is ready → Review plan**.
- The exact linked Budget ID is carried to Money with `?review=<budget_period_id>`.
- Money deliberately selects/focuses that exact draft when it is still a draft.

### Admin clarity

- Total Money Available starts blank.
- Label becomes **Total money available for this plan**.
- Helper text explicitly says not to enter a category amount there.
- Category amounts are labeled **Amount to set aside**.

## Inflow ownership

Outflows already have an explicit period relationship through
`participant_financial_activity_allocations`.

Inflows did not have an explicit Budget-period ownership relationship.

On 2026-09-29 the live database was reconciled and hardened around
`participant_financial_activity_period_links`. The table already existed
with zero rows, so it was preserved rather than recreated. The insert policy
was replaced with participant-scoped validation, `archive_reason` was added,
and the following participant RPCs were installed:

- `link_my_inflow_to_budget_v1`
- `create_my_manual_inflow_for_budget_v1`

Manual Money-in added from an active Budget is now created and linked in one
transaction. Linked manual inflows are guarded so their direction cannot be
changed to outflow and their date cannot be moved outside the owning Budget.
Archiving the manual activity archives the period link instead of deleting it.

The ownership validator was hardened to SECURITY INVOKER after advisor review.
No historical activity was backfilled or reinterpreted.

## Frozen boundaries

- no historical transaction rewrite;
- no allocation reassignment;
- no bank-data inference;
- no hard deletes;
- no Trust Engine crossover;
- participant remains the final actor for assisted-plan activation.


## Verification checkpoint

- authenticated manual Money-in can be created and linked to its active Budget;
- direct attempts to use the inflow link for an outflow are denied;
- RLS blocks direct invalid link inserts;
- linked inflow direction/date guards pass;
- archiving a linked manual inflow archives its period link;
- anon cannot execute the new write RPCs;
- Supabase security advisor shows no new finding for the installed ownership helper;
- current live Budget `bddadb93-df3c-4167-be36-ad7d67fabbd5` has zero explicit period links and zero current-Budget outflow allocations from this feature, so prior date-overlapping activity is not treated as owned activity by the v0.2 UI.
