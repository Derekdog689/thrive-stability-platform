# THRIVE Assisted Budget Backend v0.1 Test Plan

## Status

Review-only candidate. No installation authorized by this file.

## Preconditions

- correct THRIVE Supabase project;
- one active workspace admin;
- one active participant with app access and active program participation;
- one Money Support request owned by that participant;
- no overlapping draft or active Budget for the test period.

## Admin preparation tests

1. Admin prepares a starter plan from an open `budget_money` Support request.
   - expected: one draft Budget period;
   - expected: requested categories inserted;
   - expected: Support link points to the new Budget period;
   - expected: participant-visible Support entry created;
   - expected: Support status becomes `waiting_for_participant`.

2. Non-admin Support reviewer calls prepare RPC.
   - expected: denied.

3. Outsider calls prepare RPC.
   - expected: denied.

4. Wrong participant/program/workspace scope.
   - expected: denied.

5. Non-Money Support request.
   - expected: denied.

6. Completed, withdrawn, archived, or waiting-for-participant request.
   - expected: denied.

7. Overlapping participant draft/active Budget.
   - expected: denied.

8. Empty category list, negative amount, blank category, invalid type, duplicate category.
   - expected: entire transaction rolls back;
   - expected: no partial Budget period, Budget line, Support link, or Support message.

9. Same Support request attempts a second assisted draft.
   - expected: denied.

## Participant review tests

10. Participant can read admin-prepared draft and lines.
    - expected: visible through existing participant reads.

11. Participant changes Money available.
    - expected: existing `update_my_budget_period_v1` succeeds.

12. Participant changes/adds/removes categories.
    - expected: existing participant Budget RPCs succeed.

13. Participant chooses Leave it for later.
    - expected: Budget remains `draft`;
    - expected: no activation.

14. Participant accepts the draft.
    - expected: existing `activate_my_budget_v1` succeeds;
    - expected: same Budget period ID moves `draft -> active`;
    - expected: no copy/re-entry.

## Activation authority tests

15. Workspace admin attempts direct `draft -> active` update.
    - expected: denied by activation-owner trigger.

16. Support reviewer attempts direct `draft -> active`.
    - expected: denied.

17. Participant calls existing activation RPC for own draft.
    - expected: succeeds if current Budget validation rules pass.

18. Participant attempts to activate another person's draft.
    - expected: denied by existing participant RPC checks.

## Existing Budget rules retained

19. Draft has no active category.
    - expected: activation denied.

20. Planned total is above Money available without participant acknowledgement.
    - expected: activation denied.

21. Another active Budget exists.
    - expected: activation denied.

## No-change boundaries

- no Trust Engine record;
- no external-sharing consent;
- no bank-data inference;
- no hard delete;
- no service-role path;
- Support and Money remain separate systems connected only by the scoped Support link.
