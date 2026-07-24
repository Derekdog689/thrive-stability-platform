# THRIVE Monthly Financial Ingestion RLS and Lifecycle Test Plan v0.3

## Status

- Test-plan status: Review only
- SQL execution: Not yet authorized
- Real-data import: Not yet authorized
- Initial validation month: January 2025
- Data classification: High-risk financial information

## Governing Rule

The bank feed supplies observational data. The reviewed trust record remains authoritative.

## Purpose

This plan defines the required validation path for the proposed monthly financial-ingestion schema before any real financial source is imported.

The schema under review is:

`THRIVE_MONTHLY_FINANCIAL_INGESTION_SCHEMA_DRAFT_v0_3.sql`

## Proposed Tables

1. `public.financial_sources`
2. `public.financial_import_batches`
3. `public.staged_financial_transactions`
4. `public.financial_transaction_reviews`

## Security Boundary

Initial access is restricted to active workspace administrators assigned to the relevant active workspace and program.

During testing:

- Use synthetic records only.
- Do not import the January 2025 CSV.
- Do not enter real merchant descriptions.
- Do not enter real account information.
- Do not enter beneficiary information.
- Do not create trust conclusions.
- Do not enable public access.
- Do not expose a service-role key in the client application.

## Required Roles

### Anonymous Visitor

Expected behavior:

- Cannot select any proposed financial table.
- Cannot insert records.
- Cannot update records.
- Cannot delete records.

### Authenticated User Without Workspace Membership

Expected behavior:

- Cannot read records from the test workspace.
- Cannot create records for the test workspace.
- Cannot update records for the test workspace.
- Cannot access records through a program outside their authorization.

### Active Workspace Member Who Is Not an Admin

Expected behavior:

- Cannot read raw financial-ingestion records during the initial phase.
- Cannot insert financial sources or batches.
- Cannot insert staged transactions or reviews.
- Cannot update financial-ingestion records.

### Active Workspace Admin

Expected behavior:

- Can create a synthetic financial source for an active program in the assigned workspace.
- Can create a synthetic import batch.
- Can add synthetic staged rows while the batch is open.
- Can normalize staged fields through an authorized workflow.
- Can create and update review records before approval.
- Cannot directly delete records.
- Cannot modify immutable source evidence.
- Cannot modify approved or rejected batches.
- Cannot add rows or reviews after approval or rejection.

## Test Dataset

Use one synthetic source file identity:

`aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`

Use synthetic source-row identities:

- `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:2`
- `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:3`

No value should correspond to a real account, merchant, beneficiary, or trust record.

## RLS Tests

### Test 1: Anonymous Read Denial

Attempt to select each table while signed out.

Expected result:

- Zero records returned or permission denied.
- No sensitive metadata exposed.

### Test 2: Nonmember Read Denial

Sign in as an authenticated user without membership in the test workspace.

Expected result:

- No records visible in any proposed financial table.

### Test 3: Nonadmin Member Read Denial

Sign in as an active workspace member without the admin role.

Expected result:

- No raw source, batch, transaction, or review records visible.

### Test 4: Admin Scoped Read

Sign in as an active admin of the test workspace.

Expected result:

- Test records in the assigned workspace and active program are visible.
- Records from unrelated workspaces remain invisible.

### Test 5: Cross-Workspace Insert Denial

Attempt to create a source or batch for a workspace where the user is not an admin.

Expected result:

- Insert denied by RLS.

### Test 6: Cross-Program Scope Denial

Attempt to associate a source or batch with a program outside the selected workspace.

Expected result:

- Insert denied by RLS, foreign-key scope protection, or both.

## Source and Batch Integrity Tests

### Test 7: File Hash Format

Attempt to create a batch with a malformed SHA-256 value.

Expected result:

- Check constraint rejects the record.

### Test 8: Same File Re-import

Attempt to create a second batch using the same workspace, program, source, and file hash.

Expected result:

- Unique constraint rejects the repeated file.

### Test 9: Source Row Identity Format

Attempt identities with:

- an invalid hash,
- row zero,
- a negative row number,
- missing colon,
- nonnumeric suffix.

Expected result:

- Each malformed identity is rejected.

### Test 10: Parent Hash Mismatch

Create a staged row whose identity hash does not match the parent batch hash.

Expected result:

- Parent-batch identity trigger rejects the row.

### Test 11: Content-Identical Rows

Insert two source rows with different row numbers but identical financial contents.

Expected result:

- Both rows are retained.
- Content fingerprint may match.
- No automatic duplicate conclusion occurs.

## Parse Lifecycle Tests

### Test 12: Parsed Completeness

Mark a row `parsed` while required normalized fields are null.

Expected result:

- Check constraint rejects the update.

### Test 13: Parsed Row With Parse Error

Mark a row `parsed` while retaining a parse error.

Expected result:

- Check constraint rejects the update.

### Test 14: Needs Review Without Error

Mark a row `needs_review` without a nonblank parse error.

Expected result:

- Check constraint rejects the update.

### Test 15: Valid Parsed Row

Provide all required normalized values and clear the parse error.

Expected result:

- Update succeeds while the batch remains open.

## Immutability Tests

### Test 16: Raw Field Mutation

Attempt to change:

- raw amount,
- raw description,
- raw posted date,
- source row number,
- source-row identity,
- content fingerprint,
- batch or source scope.

Expected result:

- Immutability trigger rejects every change.

### Test 17: Normalized Field Update Before Approval

Update normalized fields while preserving all raw evidence.

Expected result:

- Update succeeds for an authorized admin while the batch remains open.

### Test 18: Import Batch Lineage Mutation

Attempt to change the source filename, file hash, statement dates, source-row count, workspace, program, or source identity.

Expected result:

- Batch-lifecycle trigger rejects the change.

## Review Consistency Tests

### Test 19: Completed Review Without Reviewer

Set a completed review status without `reviewed_by` and `reviewed_at`.

Expected result:

- Check constraint rejects the record.

### Test 20: Confirmed Duplicate Misalignment

Use review status `confirmed_duplicate` with a different duplicate classification.

Expected result:

- Check constraint rejects the record.

### Test 21: Potential Duplicate Alignment

Use review status `potential_duplicate` with `content_identical` or `potential_cross_source_match`.

Expected result:

- Valid aligned records succeed before batch closure.

### Test 22: Trust Match Without Reference

Set trust-match status to `matched` without a nonblank trust-record reference.

Expected result:

- Check constraint rejects the record.

### Test 23: Exclusion Without Reason

Set review status to `excluded_with_reason` without a nonblank reason.

Expected result:

- Check constraint rejects the record.

## Approval and Closure Tests

### Test 24: Approval Field Consistency

Attempt to mark a batch approved without reviewer and approver attribution.

Expected result:

- Check constraints reject the update.

### Test 25: Valid Approval

Provide aligned review and approval fields and mark the batch approved.

Expected result:

- Update succeeds once.

### Test 26: Approved Batch Reopening

Attempt to change an approved batch back to another status.

Expected result:

- Batch-lifecycle trigger rejects the update.

### Test 27: Approved Batch No-Op Update

Issue an update that does not intentionally change user fields.

Expected result:

- Update is rejected because an approved batch is closed and immutable.

### Test 28: Staged Update After Approval

Attempt to change normalized or raw staged-transaction fields after approval.

Expected result:

- Approved-record protection rejects the update.

### Test 29: Review Update After Approval

Attempt to update an existing review after approval.

Expected result:

- Approved-review protection rejects the update.

### Test 30: Staged Insert After Approval

Attempt to add a new staged row after approval.

Expected result:

- Parent-batch state validation rejects the insert.

### Test 31: Review Insert After Approval

Attempt to create a new review after approval.

Expected result:

- Review batch-state validation rejects the insert.

### Test 32: Rejected Batch Reopening

Attempt to modify or reopen a rejected batch.

Expected result:

- Batch-lifecycle trigger rejects the update.

## Delete Tests

### Test 33: Direct Delete

Attempt to delete from each proposed table as an authenticated admin.

Expected result:

- Delete denied because no delete policy exists.

### Test 34: Parent Deletion

Attempt to delete a referenced workspace, program, source, or batch using a privileged test environment.

Expected result:

- `ON DELETE RESTRICT` prevents destruction of the audit chain.

## Application-Based Verification

RLS must eventually be tested through the authenticated Next.js client, not solely through the Supabase SQL Editor.

The temporary test interface must:

- use synthetic records only;
- display a prominent test-only warning;
- avoid file upload;
- avoid the real January CSV;
- avoid service-role credentials;
- confirm signed-out denial;
- confirm nonadmin denial;
- confirm admin-scoped access;
- confirm immutable-field errors are handled clearly.

## Success Criteria

The schema may advance toward controlled execution only when:

- all RLS tests pass;
- all scope tests pass;
- all source-identity tests pass;
- all lifecycle tests pass;
- all immutability tests pass;
- all approval-closure tests pass;
- direct deletes remain unavailable;
- no real financial data is used during testing;
- test results are documented;
- a separate execution approval is recorded.

## Current Decision

Do not execute the schema yet.

Review this test plan and the final v0.3 SQL draft together before authorizing a synthetic-only Supabase test.
