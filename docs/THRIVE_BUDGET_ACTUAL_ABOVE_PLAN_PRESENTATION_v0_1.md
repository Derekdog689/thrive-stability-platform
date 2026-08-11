# THRIVE Budget Actual > Planned Presentation v0.1

Status: APPROVED DESIGN RULE / IMPLEMENTATION CANDIDATE

## Purpose

Define how THRIVE presents a Budget category when recorded activity is greater than the participant's planned amount without overloading `remaining_amount` with two meanings.

## Approved v0.1 rule

THRIVE keeps **Remaining** and **Above plan by** as separate facts.

- `remaining_amount` answers: **How much of the current planned amount is left?**
- `above_plan_amount` answers: **How much higher is recorded activity than the current planned amount?**

The live database remains authoritative for `remaining_amount` and currently generates it as a non-negative value:

```text
remaining_amount = GREATEST(planned_amount - actual_amount, 0)
```

The UI derives the presentation-only above-plan amount:

```text
above_plan_amount = GREATEST(actual_amount - planned_amount, 0)
```

No new database column is required for v0.1.

## Example

If a category has:

```text
Planned:   $100
Recorded:  $135
```

THRIVE presents:

```text
Remaining:       $0
Above plan by:  $35
```

Suggested participant-facing language:

> Recorded activity is $35 above the amount currently planned for Transportation.

## Presentation boundaries

1. `remaining_amount` is never displayed as a negative number in v0.1.
2. `above_plan_amount` is derived from recorded and planned amounts. It is not stored as participant-authored truth.
3. An above-plan amount is a numeric comparison, not a conclusion about intent, responsibility, relapse, incapacity, misuse, or financial behavior.
4. Bank activity remains observational evidence.
5. Transaction Context remains separate from Budget comparison.
6. No Support request, Trust Engine action, alert, escalation, or external sharing is created from above-plan status.
7. Participant-authored planned amounts remain distinct from recorded account activity.

## Category display states

### Recorded <= Planned

Display:

- Planned
- Recorded activity
- Remaining

Do not show an `Above plan by` amount when it is zero.

### Recorded > Planned

Display:

- status: `Above the current plan`
- Planned
- Recorded activity
- Remaining: `$0`
- Above plan by: calculated positive difference

Use explanatory language before any stronger attention treatment.

## Overall Budget summary

For v0.1, the same arithmetic may be applied to the displayed current-plan totals:

```text
overall_above_plan = GREATEST(total_recorded - total_planned, 0)
```

If positive, show it separately from total Remaining.

This total comparison does not replace category-level context.

## Test matrix

| Planned | Recorded | Remaining | Above plan by | Expected state |
|---:|---:|---:|---:|---|
| 100 | 0 | 100 | 0 | Plan available |
| 100 | 25 | 75 | 0 | Within current plan |
| 100 | 80 | 20 | 0 | Most of plan used |
| 100 | 100 | 0 | 0 | Plan fully used |
| 100 | 135 | 0 | 35 | Above current plan |
| 0 | 0 | 0 | 0 | No activity yet |
| 0 | 25 | 0 | 25 | Above current plan |

## Implementation candidate

The frontend should calculate:

```ts
const abovePlanAmount = Math.max(actual - planned, 0);
```

and render the separate amount only when `abovePlanAmount > 0`.

No SQL, RLS, generated-column, transaction, Trust Engine, or participant-authority change is required to implement this presentation rule.

## Next gate

Wire this approved presentation rule into the participant `/budget` category and current-picture displays on the working branch, then build and visually test before any merge to `main`.
