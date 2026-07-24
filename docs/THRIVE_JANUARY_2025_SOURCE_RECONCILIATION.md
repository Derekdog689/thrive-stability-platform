# THRIVE January 2025 Source Reconciliation

## Document Status

- Status: Read-only source reconciliation
- Initial month: January 2025
- Application: THRIVE Stability Platform
- Schema execution: Not authorized
- Real-data import: Not authorized
- Governing rule: The bank feed supplies observational data. The reviewed trust record remains authoritative.

## 1. Purpose

This document records the structure and meaning of the January 2025 financial source before any ingestion schema is finalized or any data is imported into THRIVE.

## 2. Required Source Evidence

The January source review must identify:

- Source file name
- Source type
- Institution or record origin
- Account label or masked account identifier
- Statement start date
- Statement end date
- Export date, if known
- Column names
- Date format
- Amount format
- Debit and credit representation
- Running balance availability
- Pending transaction behavior
- Description or merchant fields
- Unique transaction identifier availability
- Duplicate-risk conditions
- Header rows
- Footer rows
- Blank rows
- Summary rows
- Reversals
- Corrections
- Transfers
- Cash withdrawals
- Deposits
- Checks
- Fees
- Any trust-record reference fields

## 3. January Import Boundary

The first import batch must include only activity assigned to January 2025.

Any transaction outside the January statement boundary must be:

- excluded,
- held for later review, or
- assigned to the correct monthly batch.

## 4. Source-to-System Rule

The source file will be treated as observational evidence only.

No source row will automatically become:

- an approved beneficiary distribution,
- a protected expense,
- a trust conclusion,
- a fiduciary decision,
- a support recommendation,
- or a finalized THRIVE transaction.

## 5. Required Reconciliation Outcomes

Before schema approval, this document must record:

- Exact source columns
- Required normalized fields
- Optional fields
- Fields that must remain raw
- Duplicate fingerprint inputs
- Date-boundary rules
- Debit-credit normalization rule
- Import rejection conditions
- Human review requirements
- Trust-record matching fields
- Rollback requirements

## 6. Current Status

Source structure not yet inspected.

Next action:

Inspect the January 2025 source file and document its exact columns and row behavior before creating table definitions.

## 7. Verified Source Structure

Source file:

- `acct_2847_01_01_2025_to_01_31_2025.csv`

Source characteristics:

- Source type: Monthly financial account CSV export
- Account identifier: Masked account ending in `2847`
- Intended statement period: January 1, 2025 through January 31, 2025
- Transaction row count: 85
- Column count: 10
- Encoding inspected with UTF-8 BOM handling
- All 85 transaction rows contain exactly 10 columns
- Row-shape validation result: PASS

Exact source columns, in source order:

1. `Posted Date`
2. `Transaction Date`
3. `Transaction Type`
4. `Check/Serial #`
5. `Full description`
6. `Merchant name`
7. `Category name`
8. `Sub-category name`
9. `Amount`
10. `Daily Posted Balance`

## 8. Initial Date-Boundary Decision

The monthly import batch should be assigned according to `Posted Date`.

Reason:

- The source is a posted-activity account export.
- Some transactions may have a transaction date before the month in which they post.
- The original `Transaction Date` must still be preserved as source evidence.
- A transaction must not be duplicated into two monthly batches merely because its transaction date and posted date fall in different months.

Initial rule:

> January 2025 includes source rows whose Posted Date falls from January 1, 2025 through January 31, 2025, inclusive.

The final rule remains subject to verification against the full January source and the reviewed trust record.

## 9. Initial Source Field Classification

Fields expected to remain preserved exactly as imported:

- Posted Date
- Transaction Date
- Transaction Type
- Check/Serial #
- Full description
- Merchant name
- Category name
- Sub-category name
- Amount
- Daily Posted Balance

Additional normalized fields may later be derived, but the original source values must remain traceable and unchanged.

## 10. Current Reconciliation Status

Completed:

- Source file identified
- Exact source columns verified
- Transaction row count verified
- Uniform row width verified
- Initial monthly date-boundary rule identified

Still required:

- Date format validation
- Amount sign and currency-format validation
- Daily balance format validation
- Blank-value analysis
- Transaction-type inventory
- Category and sub-category inventory
- Duplicate-risk inspection
- Check and serial-number behavior
- Debit and credit normalization rule
- Reversal and correction behavior
- Trust-record matching strategy

## 11. Verified Field Formats and Completeness

Date fields:

- `Posted Date` is populated on all 85 rows.
- `Transaction Date` is populated on all 85 rows.
- Both date fields use `MM/DD/YYYY`.
- Posted-date range: January 2, 2025 through January 31, 2025.
- Transaction-date range: December 31, 2024 through January 31, 2025.
- The earlier transaction-date boundary confirms that monthly batch membership must be based on `Posted Date`.

Amount fields:

- `Amount` is populated and parseable on all 85 rows.
- All January amounts contain a currency symbol.
- All January amounts use parentheses to represent negative values.
- January contains 85 negative amounts, zero positive amounts, and zero zero-value amounts.
- `Daily Posted Balance` is populated and parseable on all 85 rows.
- All daily posted balances are positive in this source file.
- No malformed currency values were detected.

Blank-value behavior:

- `Check/Serial #` is blank on 78 rows and populated on 7 rows.
- `Merchant name` is blank on 12 rows and populated on 73 rows.
- No other source fields contain blank values.

Transaction-type inventory:

- ATM: 25
- Check: 8
- FEE: 21
- POS: 31

Classification structure:

- Eight distinct category names are present.
- Ten distinct sub-category names are present.
- No category or sub-category values are blank.

## 12. Initial Amount Normalization Rule

The source `Amount` value must be preserved exactly as imported in a raw source field.

A separate normalized numeric amount will be derived as follows:

- Parenthetical currency values are converted to negative numeric amounts.
- Non-parenthetical positive values remain positive.
- Currency symbols and formatting characters are removed only in the normalized field.
- The raw source value remains unchanged.
- Zero-value rows may be retained but must be explicitly identified.
- Invalid or unparseable values must cause row rejection or review rather than silent conversion.

January 2025 contains only debit-like negative amounts. This is a source observation, not a universal schema assumption.

Future monthly imports may contain:

- Deposits
- Credits
- Refunds
- Reversals
- Corrections
- Interest
- Other positive-value transactions

The ingestion design must support both positive and negative amounts.

## 13. Initial Required and Optional Fields

Required source fields:

- Posted Date
- Transaction Date
- Transaction Type
- Full description
- Category name
- Sub-category name
- Amount
- Daily Posted Balance

Optional source fields:

- Check/Serial #
- Merchant name

A missing optional value must remain distinguishable from an empty normalized value. Optional fields must not cause import rejection merely because they are blank.

## 14. Current Reconciliation Status

Completed:

- Exact source columns verified
- Row count verified
- Uniform row width verified
- Date formats verified
- Posted-date and transaction-date ranges verified
- Amount format verified
- Daily balance format verified
- Blank-value behavior verified
- Transaction-type inventory verified
- Category completeness verified
- Initial amount normalization rule defined
- Required and optional source fields identified

Still required:

- Check/serial relationship analysis
- Duplicate-risk analysis
- Exact duplicate detection
- Potential duplicate fingerprint design
- Same-day identical-amount analysis
- Reversal and correction behavior
- Human review-state design
- Trust-record matching strategy
- Import rejection rules
- Rollback rules

## 15. Check, Serial, and Merchant Behavior

Check/Serial behavior by transaction type:

- ATM: 25 rows; all serial values blank
- Check: 8 rows; 7 serial values present and 1 blank
- FEE: 21 rows; all serial values blank
- POS: 31 rows; all serial values blank

Initial conclusion:

- `Check/Serial #` cannot serve as a universal transaction identifier.
- A populated check serial may assist matching but cannot be required.
- A missing check serial must not automatically reject a check transaction.
- Serial values must remain preserved exactly as supplied.

Merchant behavior:

- ATM: 21 merchant values present and 4 blank
- Check: all 8 merchant values blank
- FEE: all 21 merchant values present
- POS: all 31 merchant values present

Initial conclusion:

- `Merchant name` is optional.
- Merchant absence is expected for certain transaction types.
- Merchant name cannot be required for ingestion or duplicate detection.

## 16. Verified Duplicate Risk

Duplicate analysis identified:

- Seven exact-duplicate groups
- Fourteen rows within exact-duplicate groups
- Seven duplicate groups using the proposed business fields
- Fourteen rows within those business-key groups
- Twelve groups sharing Posted Date, Amount, and Transaction Type
- Twenty-eight rows within those broader collision groups

Interpretation:

- Exact source duplicates exist or appear to exist in the January export.
- Same-date and same-amount matches are not sufficient to establish duplication.
- Legitimate repeated purchases, ATM withdrawals, checks, and fees may share dates and amounts.
- The source does not provide a universal transaction identifier.
- Imported rows must retain their source row number and batch identity.

Initial duplicate-control rule:

> Potential duplicates must be flagged for review rather than silently removed, merged, or rejected.

A transaction fingerprint may support detection, but it must not independently decide whether a row represents a duplicate financial event.

The first candidate fingerprint should consider:

- Source identifier
- Import batch identifier
- Posted Date
- Transaction Date
- Transaction Type
- Check/Serial #
- Full description
- Merchant name
- Category name
- Sub-category name
- Raw Amount
- Raw Daily Posted Balance

Two separate concepts should be maintained:

1. Source-row fingerprint, used to detect the same source row or file being imported again.
2. Financial-event duplicate candidate, used to identify transactions requiring human comparison.

## 17. Source File Fingerprint

January source SHA-256:

`9c993baf1e7558de40215ac7802c23c1fbee04f7ca80e5405366c1043a6b951a`

Purpose:

- Identify the exact source file used during reconciliation
- Detect an attempted re-import of the same file
- Preserve source lineage without storing the source contents in documentation
- Support audit and rollback review

The file hash does not establish that each transaction is unique or correct.

## 18. Updated Reconciliation Requirements

Completed:

- Check and serial behavior analyzed
- Merchant completeness analyzed
- Exact duplicate risk identified
- Broader collision risk identified
- Source-file fingerprint established
- Initial duplicate-control principle defined

Still required:

- Determine whether exact duplicate rows are adjacent or separated
- Determine whether duplicate groups cross posted dates or transaction dates
- Define source-row fingerprint construction
- Define duplicate review states
- Define import rejection conditions
- Define reversal and correction handling
- Define trust-record matching fields
- Define rollback rules

## 19. Repeated Activity Is Not Duplication

Observed account behavior includes legitimate repeated activity such as:

- Multiple purchases from the same merchant on the same date
- Multiple purchases within the same category on the same date
- Repeated ATM withdrawals
- Related ATM fees
- Multiple transactions with similar descriptions
- Different transactions sharing a merchant, date, type, or amount

These patterns are expected and must not independently establish duplication.

The following fields are insufficient, alone or in combination, to confirm a duplicate:

- Posted Date
- Transaction Date
- Merchant name
- Category
- Sub-category
- Transaction Type
- Amount

Duplicate classification must distinguish:

1. Repeated activity
   Separate legitimate transactions with similar characteristics.

2. Potential duplicate
   Transactions with strong matching evidence requiring review.

3. Confirmed duplicate
   A duplicate established through human review or verified repeated import of the same source record.

No transaction may be excluded solely because another transaction has the same merchant, date, transaction type, category, or amount.

## 20. Pending and Posted Transaction Lifecycle

Historical monthly CSV imports are based on posted transactions.

Future current-account or bank-feed ingestion may include pending transactions. Pending transactions must not be treated as final financial events because they may:

- change amount,
- change description,
- receive a different posted date,
- disappear,
- or be replaced by a posted record.

Future ingestion should preserve a transaction lifecycle state such as:

- pending
- posted
- reversed
- removed
- unknown

A pending record may be linked to a later posted record, but it must not be silently overwritten or counted twice.

The historical January 2025 CSV contains posted activity and should remain separate from future pending-transaction workflows.

## 19. Repeated Activity Is Not Duplication

Observed account behavior includes legitimate repeated activity such as:

- Multiple purchases from the same merchant on the same date
- Multiple purchases within the same category on the same date
- Repeated ATM withdrawals
- Related ATM fees
- Multiple transactions with similar descriptions
- Different transactions sharing a merchant, date, type, or amount

These patterns are expected and must not independently establish duplication.

The following fields are insufficient, alone or in combination, to confirm a duplicate:

- Posted Date
- Transaction Date
- Merchant name
- Category
- Sub-category
- Transaction Type
- Amount

Duplicate classification must distinguish:

1. Repeated activity
   Separate legitimate transactions with similar characteristics.

2. Potential duplicate
   Transactions with strong matching evidence requiring review.

3. Confirmed duplicate
   A duplicate established through human review or verified repeated import of the same source record.

No transaction may be excluded solely because another transaction has the same merchant, date, transaction type, category, or amount.

## 20. Pending and Posted Transaction Lifecycle

Historical monthly CSV imports are based on posted transactions.

Future current-account or bank-feed ingestion may include pending transactions. Pending transactions must not be treated as final financial events because they may:

- change amount,
- change description,
- receive a different posted date,
- disappear,
- or be replaced by a posted record.

Future ingestion should preserve a transaction lifecycle state such as:

- pending
- posted
- reversed
- removed
- unknown

A pending record may be linked to a later posted record, but it must not be silently overwritten or counted twice.

The historical January 2025 CSV contains posted activity and should remain separate from future pending-transaction workflows.

## 21. Content-Identical Rows and Source Identity Correction

Further review of the complete January source established that content-identical rows must not be presumed to be duplicate financial events.

Observed examples include:

- Identical ATM-fee rows associated with separate ATM withdrawals
- Separate same-day ATM withdrawals with identical amounts and descriptions
- Multiple legitimate purchases at the same merchant
- Repeated events for which the source provides no transaction timestamp or universal transaction identifier

Terminology correction:

The previously identified groups should be described as `content-identical source-row groups`, not confirmed exact duplicates.

The source file contains:

- Seven content-identical source-row groups
- Fourteen rows within those groups

This finding does not establish that any of those rows are erroneous or duplicative.

### Source-row identity

Each imported row must receive a unique source identity using:

- source-file fingerprint, and
- original source-row number

Candidate identity format:

`<source_file_sha256>:<source_row_number>`

A source row must not be discarded merely because its financial fields are identical to another row in the same file.

### File-level duplicate protection

The source-file SHA-256 fingerprint should prevent accidental re-import of the same complete file into the same workspace and program.

The same-file protection is separate from transaction-level review.

### Content fingerprint

A content fingerprint may be calculated for analytical comparison, but:

- it must not be unique,
- it must not cause automatic row rejection,
- it must not establish a confirmed duplicate,
- and it must not replace the original source-row identity.

### Daily Posted Balance clarification

`Daily Posted Balance` is repeated across transactions sharing the same posted date.

It should be interpreted as a daily source balance marker rather than a transaction-specific running balance.

Accordingly:

- it must be preserved,
- it may be normalized to a numeric field,
- it must not be used as proof of transaction uniqueness,
- and it must not be interpreted as the balance immediately after each individual source row.

## 22. Revised Duplicate-Control Rule

THRIVE must distinguish:

1. Same source file
   Detected through the source-file SHA-256 fingerprint.

2. Same source row
   Identified through source-file fingerprint plus source-row number.

3. Content-identical rows
   Separate source observations containing identical financial fields.

4. Potential cross-source match
   Similar records found in different files, batches, or future bank-feed results.

5. Confirmed duplicate
   A conclusion reached through reliable source identifiers or documented human review.

Content-identical rows within an authenticated source file must be imported separately unless the source file itself is rejected as a repeated file.
