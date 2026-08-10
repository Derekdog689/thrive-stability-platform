# THRIVE Participant Transaction Explanation RLS Failure Reconciliation and Correction Candidate v0.1

## Status

Review-only documentation candidate.

This document records the controlled synthetic Participant D transaction-explanation INSERT failure, reconciles the verified live cause, and defines the smallest correction candidate for later review.

This document does not authorize SQL execution, schema changes, RLS changes, service-role use, Johnny activation, Trust Engine synchronization, deployment, merge, or push.

## Verified Controlled Test State

The transaction-explanation test harness was temporarily unlocked for one controlled synthetic Participant D proof and then relocked after the first failed INSERT.

Verified browser-authenticated identity:

- Participant: Participant D
- Auth user ID: `d48b7268-9aa6-4498-a923-2851fd5232c9`
- Supported-person ID: `71000000-0000-4000-8000-000000000009`
- Workspace ID: `71000000-0000-4000-8000-000000000001`
- Program ID: `71000000-0000-4000-8000-000000000002`

Verified staged transaction:

- ID: `72000000-0000-4000-8000-000000000003`
- Financial source ID: `72000000-0000-4000-8000-000000000001`
- Merchant: `TEST GROCER`
- Category: `Food`
- Subcategory: `Groceries`
- Amount: `-25.00`
- Lifecycle: `posted`
- Parse status: `parsed`

The transaction was successfully returned through:

`public.get_my_financial_transactions_v1()`

The returned transaction matched the approved synthetic baseline.

## Failed Controlled Action

Attempted action:

Create one participant-authored draft explanation for the owned staged transaction.

Expected initial values:

- `explanation_category = recognized_purchase`
- `explanation_text = Synthetic test only. I recognize this grocery purchase.`
- `status = draft`
- `submitted_at = null`
- `submitted_by = Participant D auth.uid()`

Observed result:

PostgreSQL error code:

`42501`

Observed message:

`new row violates row-level security policy for table "participant_transaction_explanations"`

No draft explanation was created.

No retry was performed.

The test harness was relocked after the failure.

## Verified Preconditions

The failure was not caused by a bad synthetic fixture.

The following were independently verified:

### Supported-person identity

Participant D is linked to the expected supported-person record.

- supported-person status: `active`
- auth-user link: exact expected Participant D auth user

### Program participation

Participant D has an active participation row for the exact expected workspace and program.

- workspace: `71000000-0000-4000-8000-000000000001`
- program: `71000000-0000-4000-8000-000000000002`
- participation status: `active`

### Financial source ownership

The owned financial source relationship exists and is active.

- ownership ID: `72000000-0000-4000-8000-000000000005`
- ownership role: `primary`
- ownership status: `active`
- supported person: Participant D
- exact workspace/program scope preserved

### Staged transaction relationship

The owned staged transaction exists and joins correctly to the active ownership row.

- transaction ID: `72000000-0000-4000-8000-000000000003`
- transaction financial source matches ownership financial source
- transaction workspace matches ownership workspace
- transaction program matches ownership program
- transaction lifecycle: `posted`
- parse status: `parsed`

## Installed Explanation INSERT Policy

The installed participant INSERT policy requires:

1. `submitted_by = auth.uid()`
2. `public.is_supported_person_self(supported_person_id)`
3. `public.is_program_participant_active(supported_person_id, program_id, workspace_id)`
4. an `EXISTS` ownership proof joining:
   - `public.financial_source_owners`
   - `public.staged_financial_transactions`

The first three conditions were verified independently.

The ownership and transaction rows also exist and match when inspected under administrative database access.

## Live RLS Reconciliation

### `financial_source_owners`

The table includes a participant-self SELECT policy:

`financial_source_owners_select_for_supported_person_self`

It permits the linked supported person to read active ownership rows.

### `staged_financial_transactions`

The table does not include a participant-self SELECT policy.

Its installed SELECT path is limited to workspace administrators.

Therefore Participant D does not directly receive table-level SELECT visibility to `staged_financial_transactions`.

## Verified Participant Transaction Read Architecture

`public.get_my_financial_transactions_v1()` is:

- `SECURITY DEFINER`
- `STABLE`
- `search_path = public`

The function joins:

- `staged_financial_transactions`
- `financial_source_owners`

and returns only transactions whose ownership resolves through:

`public.is_supported_person_self(fso.supported_person_id)`

This explains why Participant D can successfully read the owned transaction through the approved participant financial RPC while lacking direct SELECT access to the base staged-transaction table.

## Root Cause

The controlled failure is a policy-path mismatch.

The participant transaction read architecture intentionally uses a controlled `SECURITY DEFINER` function to expose only participant-owned financial records.

However, the `participant_transaction_explanations_insert_self` RLS policy attempts to independently re-prove ownership by directly joining `staged_financial_transactions` inside the policy expression.

During a normal authenticated Participant D INSERT, the staged-transaction table remains protected by its own RLS and is not directly participant-readable.

As a result, the direct ownership `EXISTS` proof cannot see the staged-transaction row through the participant's ordinary table privileges, even though the same transaction is validly visible through the controlled participant financial RPC.

The policy therefore rejects the INSERT with `42501`.

## What This Failure Does Not Mean

This failure does not establish that:

- the transaction belongs to another person;
- Participant D lacks active program participation;
- the financial ownership fixture is invalid;
- the staged transaction is missing;
- participant transaction visibility is broken;
- the financial read RPC is broken;
- the transaction record should be changed;
- direct participant access to the staged transaction table should automatically be broadened.

## Review-Only Correction Direction

The smallest correction should preserve the existing financial-read architecture.

The correction should not casually add broad participant SELECT access to `public.staged_financial_transactions`.

Instead, the explanation INSERT authorization path should use a narrow ownership-verification helper that can safely answer one question:

> Does the authenticated supported person actively own this exact staged financial transaction in this exact workspace and program?

A candidate helper should:

- accept only the identifiers required for the ownership proof;
- operate as `SECURITY DEFINER`;
- set `search_path = public`;
- use the existing `financial_source_owners` and `staged_financial_transactions` relationship;
- require `public.is_supported_person_self(...)`;
- require active ownership;
- preserve exact workspace and program scope;
- return boolean only;
- perform no inserts, updates, deletes, classification, or lifecycle change;
- create no new authority beyond the already-approved participant financial visibility boundary.

The explanation INSERT policy could then call that helper rather than directly joining the protected staged-transaction table.

## Candidate Authorization Shape

Review-only conceptual shape:

```sql
public.is_owned_staged_transaction_for_self(
  p_supported_person_id uuid,
  p_staged_transaction_id uuid,
  p_workspace_id uuid,
  p_program_id uuid
) returns boolean
```

Conceptual required checks:

```text
authenticated supported person is self
AND supported person is active
AND program participation is active
AND financial source ownership is active
AND staged transaction matches that owned source
AND workspace matches exactly
AND program matches exactly
```

The helper should return only `true` or `false`.

## Explicitly Not Approved

This candidate does not authorize:

- creating the helper function;
- changing the explanation INSERT policy;
- adding participant SELECT to `staged_financial_transactions`;
- changing financial source ownership policies;
- changing transaction records;
- retrying the explanation INSERT;
- changing the explanation schema;
- using service-role credentials;
- creating Johnny records;
- using real bank data;
- synchronizing with the Trust Engine;
- deployment;
- merge;
- push.

## Current Test Harness State

`src/app/transaction-explanation-test/page.tsx`

Execution flag:

```ts
const TRANSACTION_EXPLANATION_TEST_EXECUTION_ENABLED = false as const;
```

The controlled execution path is relocked.

## Build and Working-State Notes

Last reported production build before this reconciliation:

- Next.js `16.2.12`
- build: PASS
- TypeScript: PASS
- static generation: `27/27`

The transaction-explanation harness file passed targeted `git diff --check` after relocking.

Unrelated parked local changes and artifacts remain outside this reconciliation scope.

## Conclusion

The first participant transaction-explanation draft test correctly stopped at a real authorization discrepancy.

The underlying participant identity, program participation, source ownership, staged transaction, and participant financial read path are intact.

The failure is isolated to the explanation INSERT policy's direct dependency on a base table that the participant is intentionally not allowed to read directly.

The preferred correction direction is to preserve the controlled participant financial-read boundary and introduce, only after separate approval, a narrowly scoped boolean ownership-verification helper for the explanation INSERT policy.

## Exact Next Gate

Review this reconciliation and correction direction.

If approved, prepare a separate review-only SQL candidate containing:

1. the narrow boolean ownership-verification helper;
2. the minimal replacement for the participant explanation INSERT policy;
3. post-candidate verification queries;
4. no execution.

Do not retry the Participant D explanation INSERT until that correction is separately reviewed, approved, installed, verified, and the harness is intentionally unlocked again.
