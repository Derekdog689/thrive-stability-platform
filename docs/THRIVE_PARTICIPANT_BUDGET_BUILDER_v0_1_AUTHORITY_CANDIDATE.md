# THRIVE Participant Budget Builder v0.1
## Review-Only Database Authority Candidate

### Gate
Candidate only. Do not execute SQL, apply a migration, change RLS, deploy, activate Johnny, synchronize with the Trust Engine, or push.

### Authority model
Keep participant table access read-only. Do not add broad participant INSERT/UPDATE/DELETE policies.

Expose only narrow authenticated RPCs:
1. `create_my_budget_draft_v1`
2. `update_my_budget_period_v1`
3. `add_my_budget_line_v1`
4. `update_my_budget_line_v1`
5. `activate_my_budget_v1`
6. `complete_my_budget_v1`

### Why this model
The live tables mix participant-controlled planning fields with system-controlled recorded fields.

Participant-controlled:
- expected_income
- notes
- category_name
- category_type
- planned_amount
- is_active
- sort_order

System/scope controlled:
- workspace_id
- program_id
- supported_person_id
- period_start
- period_end
- created_by
- created_at
- actual_amount
- remaining_amount
- unapproved lifecycle transitions

Broad participant UPDATE RLS would make field-level authority too loose.

### Lifecycle
```text
No Budget
   ↓
Draft
   ↓
Active
   ↓
Completed
```

Draft and Active are participant-editable through controlled RPCs.

No participant RPC is proposed for:
- completed → active
- completed → draft
- archive
- hard delete

### Budget-line math in this candidate
New line:
```text
actual_amount = 0
remaining_amount = planned_amount
```

Planned amount edit:
```text
remaining_amount = planned_amount - existing actual_amount
```

The participant never supplies `actual_amount` or `remaining_amount`.

### Over-plan activation
A Draft can be saved above expected income.

Activation requires explicit acknowledgement when:
```text
sum(active planned amounts) > expected_income
```

### Duplicate categories
Exact case-insensitive duplicate names within the same budget period are rejected.

No fuzzy semantic matching is proposed.

### Overlapping current periods
Creation rejects overlapping Draft/Active plans for the same participant/program.

Activation also rejects another overlapping Active plan.

This supplements, but does not replace, the existing exact-period active unique index in this candidate.

### Preserved protections
Keep:
- participant SELECT RLS
- admin policies
- scope immutability trigger
- line updated_at trigger
- nonnegative amount checks
- category type check
- status check
- foreign keys
- no participant DELETE policy

### Security
Each write RPC:
- requires `auth.uid()`
- is `SECURITY DEFINER`
- uses an empty search path with qualified objects
- verifies participant self-ownership
- verifies active program participation
- limits lifecycle
- accepts only approved fields
- revokes execute from PUBLIC and anon
- grants execute only to authenticated

### Explicitly parked
Not in this candidate:
- transaction ↔ budget-line association
- merchant suggestions
- split transactions
- refund/reversal allocation engine
- automatic actual_amount refresh
- budget revision history
- DSS suggestion records
- Feedback Layer integration
- Resources integration

### Candidate test matrix
Before any install, test at minimum:
1. Person D can create one Draft in an unused synthetic period.
2. Wrong user cannot create/edit Person D Budget.
3. Inactive participation cannot write.
4. Overlapping Draft/Active period is rejected.
5. Negative expected income is rejected.
6. Blank category is rejected.
7. Invalid category type is rejected.
8. Negative planned amount is rejected.
9. Exact duplicate category is rejected.
10. Participant cannot supply actual_amount/remaining_amount.
11. Planned edit recomputes remaining from existing actual.
12. Completed Budget cannot be edited.
13. Draft can activate.
14. Over-plan activation requires acknowledgement.
15. Active can complete.
16. Completed cannot revert through these RPCs.
17. No DELETE path exists.
18. Existing admin access still works.

### Recommended next gate
**Participant Budget Builder v0.1: database candidate test-plan review**

Still review-only. No production migration until that test plan is approved.
