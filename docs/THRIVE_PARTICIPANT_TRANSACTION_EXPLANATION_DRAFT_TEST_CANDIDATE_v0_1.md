# THRIVE Participant Transaction Explanation Draft Test Candidate v0.1

## Status

Review-only candidate.

This document defines one narrow authenticated synthetic participant test for the installed `participant_transaction_explanations` model.

It does not authorize SQL execution, schema changes, UI activation, Johnny activation, Trust Engine synchronization, service-role use, hard delete, deployment, merge, or push.

## Purpose

Prove that one authenticated supported person can create, read, and edit their own draft explanation for one financial transaction they already own without modifying the underlying bank evidence.

The explanation remains participant-authored context stored separately from the transaction record.

## Verified Preconditions

### Synthetic participant

Participant D:

- email: `dstein561+thrive-onboarding-person-d@gmail.com`
- auth user ID: `d48b7268-9aa6-4498-a923-2851fd5232c9`
- supported-person ID: `71000000-0000-4000-8000-000000000009`
- workspace ID: `71000000-0000-4000-8000-000000000001`
- program ID: `71000000-0000-4000-8000-000000000002`

### Synthetic financial source ownership

Verified live ownership:

- financial source ID: `72000000-0000-4000-8000-000000000001`
- supported-person ID: `71000000-0000-4000-8000-000000000009`
- ownership role: `primary`
- ownership status: `active`

### Synthetic transaction

Verified live transaction:

- transaction ID: `72000000-0000-4000-8000-000000000003`
- merchant: `TEST GROCER`
- category: `Food`
- subcategory: `Groceries`
- amount: `-25.00`
- posted date: `2099-02-05`
- transaction lifecycle: `posted`
- parse status: `parsed`

### Existing explanation state

A read-only live query confirmed zero existing explanation rows for:

`72000000-0000-4000-8000-000000000003`

This transaction is therefore clean for the first controlled draft-explanation proof.

## Installed Model Already Verified

The installed `participant_transaction_explanations` model includes:

- participant self SELECT;
- participant self INSERT;
- participant self draft UPDATE;
- workspace-admin SELECT;
- workspace-admin UPDATE;
- immutable identity and scope fields;
- no DELETE policy.

Allowed explanation categories include:

- `recognized_purchase`
- `bill_or_essential`
- `transfer`
- `refund_or_reversal`
- `shared_expense`
- `medical_expense`
- `cash_withdrawal_context`
- `incorrect_or_unrecognized`
- `other`

Allowed statuses include:

- `draft`
- `submitted`
- `needs_follow_up`
- `resolved`
- `archived`

This candidate uses only `draft`.

## Approved Test Scope

The controlled test is limited to the following sequence:

1. Authenticate as Participant D through the normal browser-authenticated Supabase session.
2. Verify the authenticated identity matches Participant D.
3. Re-read the target transaction and confirm the verified baseline.
4. Confirm no explanation already exists for the target transaction.
5. Insert exactly one participant-owned explanation with `status = draft`.
6. Read that explanation back as Participant D.
7. Update only the editable draft content.
8. Read the edited draft back.
9. Re-read the underlying staged transaction and confirm the financial evidence remains unchanged.
10. Stop.

## Proposed Draft Explanation

Initial candidate values:

```text
staged_transaction_id = 72000000-0000-4000-8000-000000000003
explanation_category = recognized_purchase
explanation_text = Synthetic participant draft explanation for TEST GROCER.
status = draft
```

The insert must use the verified Participant D scope:

```text
workspace_id = 71000000-0000-4000-8000-000000000001
program_id = 71000000-0000-4000-8000-000000000002
supported_person_id = 71000000-0000-4000-8000-000000000009
submitted_by = d48b7268-9aa6-4498-a923-2851fd5232c9
submitted_at = null
archived_at = null
```

The final `submitted_by` value must come from the authenticated browser session rather than being silently substituted through privileged execution.

## Proposed Draft Edit

The second mutation is limited to the same draft row.

Candidate edit:

```text
explanation_text = Synthetic participant edited draft explanation for TEST GROCER.
```

The update must not change:

- `workspace_id`
- `program_id`
- `supported_person_id`
- `staged_transaction_id`
- `submitted_by`
- `created_at`
- `status`
- `submitted_at`
- `archived_at`

The installed trigger must continue protecting immutable identity and scope.

## Expected Results

### After insert

Exactly one explanation should exist for the target transaction with:

```text
explanation_category = recognized_purchase
status = draft
submitted_at = null
archived_at = null
```

The row should be visible to Participant D through authenticated self SELECT.

### After draft edit

The same explanation row should remain:

```text
status = draft
submitted_at = null
archived_at = null
```

Only the approved draft content should change, together with the automatic `updated_at` timestamp.

No second explanation row should be created.

### Underlying transaction

The staged transaction must remain unchanged:

```text
id = 72000000-0000-4000-8000-000000000003
merchant_name = TEST GROCER
category_name = Food
subcategory_name = Groceries
amount = -25.00
posted_date = 2099-02-05
transaction_lifecycle = posted
parse_status = parsed
```

The participant explanation must not rewrite, recategorize, approve, exclude, resolve, or otherwise modify the bank evidence.

## Interpretation Boundary

A participant explanation is the participant's own context.

It is not:

- a correction to the imported bank record;
- a finding of responsibility;
- a determination of intent;
- a relapse finding;
- a capacity finding;
- a fiduciary conclusion;
- a Trust Engine instruction;
- an administrative transaction review;
- a clinical conclusion.

Bank evidence and participant-authored explanation remain separate records.

## Frozen Boundaries

This candidate does not authorize:

- status transition from `draft` to `submitted`;
- `needs_follow_up`;
- `resolved`;
- `archived`;
- admin editing;
- admin review;
- participant explanation deletion;
- hard delete of any record;
- transaction mutation;
- financial-source ownership changes;
- schema or RLS changes;
- new RPCs;
- service-role execution;
- UI implementation;
- Johnny activation;
- real financial data;
- Trust Engine synchronization;
- clinical escalation;
- emergency-response capability;
- deployment;
- merge;
- push.

## Success Criteria

The test passes only if all of the following are true:

- Participant D is authenticated through the normal browser session.
- The target transaction remains owned through the verified active primary financial source relationship.
- No explanation exists before the test.
- Exactly one draft explanation is created.
- Participant D can read that draft.
- Participant D can edit that same draft.
- The edit does not create a second row.
- Immutable explanation scope remains unchanged.
- The underlying staged transaction remains unchanged.
- No status transition beyond `draft` occurs.
- No unrelated financial, Support, Wellness, Goal, Trust Engine, or administrative record changes.

## Failure / Stop Conditions

Stop immediately if:

- the authenticated user is not Participant D;
- the target transaction differs from the verified baseline;
- ownership is no longer active primary ownership for Participant D;
- an explanation already exists unexpectedly;
- insert affects more than one row;
- draft edit affects more than one row;
- immutable scope changes;
- status changes from `draft`;
- the staged transaction changes;
- RLS requires a privileged or service-role workaround;
- any result differs materially from this candidate.

A failed test should be documented and reconciled before any retry or UI work.

## Cleanup Position

No hard delete is authorized.

The synthetic draft explanation should remain controlled test evidence until a separate archive or synthetic-data cleanup gate is approved.

## Build Impact

This candidate is documentation only.

No application source code changes are required to create this candidate.

No build is required until application code is changed.

## Exact Next Gate

Review this candidate against the verified live transaction, installed explanation model, and current authenticated Participant D test path.

Do not execute the draft insert or update until separately approved.

If approved, the next gate is to prepare the smallest browser-authenticated test control or execution path needed to perform exactly this draft create/read/edit/re-read proof.
