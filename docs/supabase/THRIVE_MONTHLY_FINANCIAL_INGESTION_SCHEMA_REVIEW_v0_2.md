# THRIVE Monthly Financial Ingestion Schema Review v0.2

## Status

- Review type: Static SQL review
- SQL execution: Not authorized
- Supabase changes: None
- Initial implementation month: January 2025
- Data classification: High-risk financial information

## Governing Rule

The bank feed supplies observational data. The reviewed trust record remains authoritative.

## Review Outcome

The four-table ingestion spine is structurally viable but requires correction before execution.

## Confirmed Strengths

- Workspace and program scoping
- Composite foreign-key protection
- File-level SHA-256 duplicate protection
- Separate source-row and content-fingerprint concepts
- Content fingerprint is intentionally nonunique
- Raw and normalized transaction fields are separated
- Human review is separated from source evidence
- RLS is enabled on all proposed tables
- Initial access is restricted to active workspace admins
- No direct delete policy is created
- No automated trust conclusion or payment authority is introduced

## Required Corrections

### 1. Import lifecycle consistency

Add constraints ensuring:

- approved status requires approved_by and approved_at
- non-approved status does not carry approval fields unless expressly allowed
- rejected status requires a nonblank rejection reason
- reviewed states require reviewed_by and reviewed_at
- rolled-back status cannot be used without an approved rollback mechanism

### 2. Parsed-row completeness

When parse_status is parsed, require:

- posted_date
- transaction_date
- transaction_type
- amount
- daily_posted_balance

When parse_status is rejected or needs_review, permit incomplete normalized fields and preserve parse_error evidence.

### 3. Review-state consistency

Require:

- confirmed_duplicate status to align with confirmed_duplicate classification
- potential_duplicate status to align with an appropriate duplicate classification
- matched_to_trust_record status to align with matched trust status
- matched trust status to include a trust record reference
- excluded_with_reason to include a nonblank exclusion reason
- completed review states to include reviewer identity and timestamp

### 4. RLS update scope

Update-policy USING clauses should require both:

- is_workspace_admin(workspace_id)
- is_program_in_workspace(program_id, workspace_id)

### 5. Retention protection

Replace high-risk workspace and program cascade relationships with restrict behavior unless an expressly approved archival or legal-retention rule requires otherwise.

### 6. Source-row identity format

Constrain source_row_identity to the intended structure:

`<source-file-sha256>:<positive-source-row-number>`

### 7. Raw-source immutability

Prevent routine updates to:

- workspace_id
- program_id
- financial_source_id
- import_batch_id
- source_row_number
- source_row_identity
- source_content_fingerprint
- all raw source fields

A controlled correction workflow should preserve original evidence rather than silently rewriting it.

## Current Decision

Do not execute schema draft v0.2.

Prepare v0.3 as a separate corrected review-only SQL draft. Preserve v0.2 as the historical design record.
