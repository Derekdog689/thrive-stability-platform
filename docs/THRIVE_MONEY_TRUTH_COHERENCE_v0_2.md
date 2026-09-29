# THRIVE Money Truth / Coherence v0.2 Candidate

## Verified defects

1. Budget activity was selected by date overlap instead of Budget ownership.
2. Activity allocated to earlier Budget periods could appear inside a newer Budget.
3. Activity cards could display category allocations from a different Budget period.
4. Assisted Money Support used the generic waiting-for-participant reply UI even when the real participant action was to review a linked starter plan.
5. Today repeated the same generic Support-reply action.
6. Admin assisted-budget setup prefilled Total Money Available with $1,500, making total-plan money too easy to confuse with a Housing/Rent allocation.
7. Inflows currently have no explicit Budget-period ownership relationship; date overlap is the only connection.

## Candidate behavior

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

Inflows do not.

The review-only SQL candidate adds
`participant_financial_activity_period_links` for period-only ownership,
primarily for inflows. It intentionally does not change or reinterpret any
historical activity.

Until that schema candidate is separately approved and installed, the UI
candidate must not claim that date-overlapping inflows belong to a Budget.

## Frozen boundaries

- no historical transaction rewrite;
- no allocation reassignment;
- no bank-data inference;
- no hard deletes;
- no Trust Engine crossover;
- participant remains the final actor for assisted-plan activation.
