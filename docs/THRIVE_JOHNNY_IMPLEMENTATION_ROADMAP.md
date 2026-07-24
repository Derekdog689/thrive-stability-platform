# THRIVE Johnny Implementation Roadmap

## Document Status

- Status: Approved implementation roadmap
- Approval: Derek and Heidi
- Application: THRIVE Stability Platform
- Beneficiary model: Johnny
- Current operating mode: Controlled mock/test development
- Production beneficiary use: Not yet authorized
- Governing principle: The bank feed supplies observational data. The reviewed trust record remains authoritative.

---

## 1. Purpose

This roadmap governs the development of THRIVE from its current authenticated mock/test application into a controlled beneficiary-support platform that may eventually be used by Johnny.

THRIVE is intended to help Johnny understand:

- What financial support has been provided
- What funds remain available
- Which expenses are protected
- How spending activity is developing
- What patterns may require attention
- What support actions may improve stability
- What information has been reviewed and approved

THRIVE is not intended to replace:

- The trust ledger
- Trustee judgment
- Fiduciary review
- Bank records
- Legal or tax advice
- Clinical judgment
- Crisis services
- Formal accounting controls

---

## 2. Governing Architecture

THRIVE will maintain three separate but coordinated information layers.

### 2.1 Trust Record Layer

The trust record remains the authoritative source for:

- Trustee-approved distributions
- Direct-paid support
- Corrections
- Reversals
- Monthly closeouts
- Supporting documentation
- Fiduciary decisions
- Committed historical records

The trust record answers:

> What did the trust actually approve, distribute, pay, or formally record?

### 2.2 THRIVE Support Layer

THRIVE receives only the approved information necessary to support Johnny’s understanding and planning.

The THRIVE support layer may display:

- Approved support totals
- Protected expenses
- Flexible spending amounts
- Reserve amounts
- Current budget status
- Reviewed transaction categories
- Spending patterns
- Plain-language explanations
- Support reminders
- Consent-based collaboration information

The THRIVE support layer answers:

> What does Johnny need to understand and manage today?

### 2.3 Bank Observation Layer

Bank information may enter THRIVE through:

- CSV imports
- Bank statements
- Future read-only Plaid synchronization

The bank observation layer may provide:

- Current account balances
- Posted transactions
- Pending transactions
- Deposits
- Withdrawals
- Checks
- ATM activity
- Merchant descriptions
- Bank fees

The bank observation layer answers:

> What activity appears in the connected bank account?

Bank activity does not automatically become a trust conclusion, approved expense, beneficiary distribution, or fiduciary decision.

---

## 3. Governing Data Rule

The following rule controls all financial ingestion and presentation:

> The bank feed supplies observational data. The reviewed trust record remains authoritative.

Accordingly:

- Bank transactions may be imported and displayed.
- Bank transactions may be categorized provisionally.
- Bank transactions may be matched to trust records.
- Suggested matches require review.
- Unmatched activity remains unmatched.
- Unclear activity remains unclear.
- Trust classifications require authorized review.
- THRIVE may not silently rewrite the trust ledger.
- THRIVE may not infer trustee approval from bank activity.
- THRIVE may not initiate or automate distributions.

Manual Zelle distributions may continue outside THRIVE under the existing authorized process.

---

## 4. Historical and Current Record Boundary

THRIVE will establish a formal operational start date for Johnny.

### 4.1 Historical Record

Activity before the operational start date will be labeled:

> Historical imported and reconciled record

Historical data may include:

- Imported bank transactions
- Statement balances
- Trust distributions
- Direct-paid support
- Checks
- Deposits
- ATM withdrawals
- Bank fees
- Merchant activity
- Weekly summaries
- Monthly summaries
- Reviewed categories
- Reconciled closeouts

Historical data must not imply that THRIVE guidance, check-ins, alerts, or recommendations existed at the time.

### 4.2 Current Operating Record

Activity on or after the operational start date will be labeled:

> Current THRIVE operating record

Current operations may later include:

- Read-only bank synchronization
- Current budget periods
- Current balances
- Current transaction review
- Optional daily check-ins
- Support requests
- Safe-to-spend calculations
- Pattern alerts
- Consent-based support collaboration
- Beneficiary-facing explanations

---

## 5. Historical Data Integrity

### 5.1 Permitted Historical Records

THRIVE may reconstruct factual historical information supported by source records, including:

- Transaction date
- Posted date
- Transaction description
- Merchant
- Amount
- Deposit or withdrawal direction
- Check number
- Statement period
- Opening balance
- Closing balance
- Weekly grouping
- Monthly grouping
- Reviewed category
- Reconciliation status
- Source document
- Import batch
- Human review status

### 5.2 Prohibited Historical Fabrication

THRIVE must not invent historical:

- Stress ratings
- Spending urges
- Sleep ratings
- Recovery support ratings
- Emotional conditions
- Purchase motives
- Clinical explanations
- Beneficiary intent
- Trustee approval
- Support conversations
- Check-in responses

When no historical check-in exists, THRIVE should display:

> No historical check-in data available.

### 5.3 Fact and Interpretation Labels

Historical outputs must distinguish among:

- Source fact
- Calculated result
- Human-reviewed classification
- Suggested classification
- Unresolved item
- Unknown information

Example:

- Source fact: Four ATM withdrawals occurred.
- Calculated result: ATM activity increased from the prior week.
- Human-reviewed classification: The transactions were categorized as cash access.
- Unknown information: The purpose of the cash is not documented.
- Prohibited inference: Johnny withdrew cash because he was stressed.

---

## 6. Historical Budget Treatment

THRIVE will distinguish between two historical budget concepts.

### 6.1 Actual Historical Spending

Actual historical spending is calculated from reconciled transactions.

Examples include:

- Cash access
- Groceries
- Restaurants
- Transportation
- Communications
- Clothing
- Household expenses
- Bank fees
- Direct-paid support

### 6.2 Reconstructed Historical Plan

A reconstructed historical plan may be created later using approved trust records or documented support expectations.

It must be labeled as one of the following:

- Reconstructed plan
- Retrospective benchmark
- Historical support framework

A reconstructed plan must not be represented as an original contemporaneous budget unless source records prove that the budget existed at that time.

---

## 7. Q1 2025 Proving Package

The initial historical proving package will use:

- December 2024 statement as the opening bridge
- January 2025 statement
- February 2025 statement
- March 2025 statement
- Q1 2025 bank CSV
- Existing reviewed trust support records
- Existing beneficiary-facing trust summaries

The Q1 proving package will test:

- Source registration
- CSV parsing
- Transaction staging
- Duplicate detection
- Statement reconciliation
- Opening and closing balance controls
- Deposit matching
- Check matching
- Trust-record matching
- Merchant normalization
- Category assignment
- Weekly summaries
- Monthly summaries
- Exception handling
- Human review
- Beneficiary-facing presentation

No full-year import should occur until the Q1 structure and reconciliation rules are verified.

The statement chain currently available includes the December 2024 opening bridge and the January, February, and March 2025 statement periods. These provide independent statement-level controls for the Q1 import and reconciliation process.

---

## 8. Approved Implementation Phases

### Phase 1: Identity and Permissions

Goal:

Establish who may access Johnny’s records and what each authorized role may see or do.

Required outcomes:

- Johnny beneficiary identity
- Trustee identity
- DSS support identity
- Workspace membership
- Program membership
- Role assignments
- RLS enforcement
- Read versus review permissions
- Consent boundary
- No cross-beneficiary access

### Phase 2: Johnny Data Model

Goal:

Create the minimum beneficiary-support structure required for Johnny without importing financial activity yet.

Required outcomes:

- Beneficiary profile
- Trust relationship
- Support relationship
- Authorized viewers
- Operational status
- Historical start date
- Current operating start date
- Consent status
- Data-source references

### Phase 3: Historical Source Registry

Goal:

Register every imported source before transactions enter the operating record.

Required outcomes:

- Source type
- Source period
- Original filename
- Import date
- Imported by
- File hash or duplicate control
- Account reference
- Source status
- Review status
- Notes
- No raw account credentials stored

### Phase 4: CSV Import and Transaction Staging

Goal:

Import Q1 transaction data into a non-authoritative staging layer.

Required outcomes:

- Stable CSV parser
- Field validation
- Posted-date preservation
- Transaction-date preservation
- Amount preservation
- Description preservation
- Merchant preservation
- Category preservation when supplied
- Import batch identity
- Duplicate prevention
- Reversible import
- No automatic trust posting

### Phase 5: Statement and Trust Reconciliation

Goal:

Reconcile staged bank activity against statements and approved trust records.

Required outcomes:

- Opening balance control
- Closing balance control
- Deposit totals
- Withdrawal totals
- Check totals
- Fee totals
- Missing transaction detection
- Duplicate detection
- Trust-record matching
- Unmatched-item queue
- Human approval
- Reconciliation status

### Phase 6: Historical Categories and Budget Periods

Goal:

Organize reconciled activity into meaningful beneficiary-support categories.

Initial categories may include:

- Protected housing
- Food and groceries
- Flexible spending
- Emergency reserve
- Cash access
- Restaurants
- Transportation
- Communications
- Clothing
- Household
- Bank fees
- Direct trust support
- Other reviewed activity

Required outcomes:

- Category definitions
- Category ownership
- Human-reviewed mappings
- Merchant normalization
- Historical month periods
- Actual spending totals
- Reconstructed budget labeling
- Category exception handling

### Phase 7: Historical Timeline and Patterns

Goal:

Create a clear beneficiary-facing historical view without exposing trustee workpapers or unsupported conclusions.

Required outcomes:

- Monthly summaries
- Weekly groupings
- Cash-access patterns
- Merchant patterns
- Fee patterns
- Deposit timing
- Category totals
- Plain-language explanations
- Fact-versus-inference labels
- Missing-data disclosures

### Phase 8: Current Operational Boundary

Goal:

Formally separate imported history from current THRIVE operation.

Required outcomes:

- Approved operational start date
- Historical labels
- Current labels
- Transition balance
- Current opening budget period
- Audit record of the transition
- No rewriting of historical context

### Phase 9: Plaid Read-Only Observation

Goal:

Connect current bank information without granting payment authority.

Approved Plaid functions:

- Account linking
- Balance retrieval
- Posted transaction retrieval
- Pending transaction retrieval
- Account status
- Synchronization status
- Disconnection detection

Prohibited Plaid functions:

- Payment initiation
- Zelle initiation
- Automatic trust distributions
- Automatic expense approval
- Silent trust classification
- Credential storage by THRIVE
- Trustee authority delegation

Implementation progression:

1. CSV proving process
2. Plaid sandbox
3. Read-only production connection
4. Human-reviewed synchronization
5. Exception and disconnection testing

### Phase 10: Current Budget Planning

Goal:

Create active budget periods that reflect current approved support planning.

Required outcomes:

- Planned amount
- Spent amount
- Remaining amount
- Protected allocation
- Flexible allocation
- Reserve allocation
- Category status
- Budget period status
- Human-approved adjustments
- Audit history

### Phase 11: Optional Daily Check-Ins

Goal:

Allow Johnny to provide current context voluntarily.

Possible check-in fields:

- Stress
- Spending urge
- Sleep quality
- Recovery or personal support
- Current concern
- Support request

Requirements:

- Voluntary participation
- Clear purpose
- Consent-based sharing
- No diagnosis
- No fabricated historical entries
- No automatic punishment or restriction
- Appropriate crisis boundary language

### Phase 12: Explainable Safe-to-Spend Calculation

Goal:

Calculate a support-planning estimate that Johnny can understand.

Possible inputs:

- Current observed balance
- Protected obligations
- Approved reserves
- Pending transactions
- Current budget period
- Known support timing
- Confirmed direct-paid expenses

Requirements:

- Calculation must be explainable.
- Inputs must be visible to authorized reviewers.
- The result must be labeled as guidance.
- The calculation may not constitute trustee authorization.
- The calculation may not initiate a payment.
- Unknown or stale inputs must reduce confidence.
- Manual override requires an audit record.

### Phase 13: Support Workflow

Goal:

Allow Johnny and approved supporters to coordinate without turning THRIVE into a surveillance or punishment system.

Possible functions:

- Request support
- Ask a budgeting question
- Flag an unfamiliar transaction
- Request category review
- Request clarification
- Record a support touchpoint
- Document consent
- Record follow-up status

### Phase 14: Separate Role Views

Goal:

Present only the information appropriate to each role.

Johnny view:

- Understandable balances
- Budget status
- Recent activity
- Protected obligations
- Support options
- Plain-language patterns
- No trustee workpapers

DSS support view:

- Approved support context
- Review queues
- Unresolved classifications
- Support requests
- Consent status
- No unauthorized fiduciary actions

Trustee view:

- Trust-record authority
- Proposed matches
- Reconciliation controls
- Approval history
- Exceptions
- Audit information

### Phase 15: Simulation and Exception Testing

Goal:

Simulate Johnny’s operating experience before real use.

Required scenarios:

- Normal spending month
- Multiple ATM withdrawals
- Duplicate CSV import
- Plaid duplicate transaction
- Pending transaction
- Reversed transaction
- Missing statement item
- Unmatched trust deposit
- Over-budget category
- No-plan category
- Stale balance
- Disconnected bank account
- No check-in data
- Declined consent
- Unauthorized access attempt
- Trustee correction
- Historical versus current boundary

### Phase 16: Controlled Pilot Readiness

Goal:

Determine whether Johnny may begin a limited real-world pilot.

Readiness requires:

- Identity verified
- Permissions verified
- Consent documented
- Q1 reconciliation proven
- Current operating boundary established
- Read-only bank connection tested
- Budget calculations verified
- Role views verified
- Audit behavior verified
- Error recovery tested
- Privacy review completed
- Trustee authority preserved
- Pilot scope approved
- Rollback plan documented

---

## 9. AI Use Policy

AI may assist with:

- Merchant normalization
- Category suggestions
- Duplicate suggestions
- Match suggestions
- Transaction summaries
- Pattern descriptions
- Plain-language explanations
- Reconciliation assistance
- Review prioritization

AI outputs must be:

- Clearly labeled when suggested
- Grounded in available records
- Reviewable
- Correctable
- Traceable to source information
- Presented without false certainty

AI may not:

- Diagnose Johnny
- Infer relapse
- Infer incapacity
- Infer intent
- Declare misconduct
- Restrict access to money
- Authorize distributions
- Replace trustee judgment
- Create legal conclusions
- Create tax conclusions
- Create clinical conclusions
- Present uncertain classifications as established facts

AI serves as an assistant, translator, and reviewer-support tool. It does not serve as trustee, clinician, attorney, accountant, or final decision-maker.

---

## 10. Privacy and Security Boundaries

THRIVE development must preserve the following boundaries:

- Use mock/test data until a phase explicitly authorizes real data.
- Do not expose full account numbers in normal user-facing screens.
- Do not display internal UUIDs in normal user-facing screens.
- Do not store bank credentials.
- Do not expose raw trust workpapers to Johnny.
- Do not expose Johnny’s data to unrelated users.
- Apply RLS to all beneficiary-linked records.
- Maintain import and review audit records.
- Preserve source records without silently altering them.
- Separate raw, staged, reviewed, and committed data.
- Record corrections rather than overwriting history without trace.
- Avoid unnecessary clinical or recovery information.
- Use the minimum data needed for the support purpose.

---

## 11. Current Stable Truth

As of this roadmap:

- THRIVE authentication is functioning.
- Authenticated RLS-based workspace loading is functioning.
- Authenticated program loading is functioning.
- Shared dashboard and budget navigation are functioning.
- The budget route is read-only.
- Budget totals are displayed.
- Category progress bars are displayed.
- Category status labels are displayed.
- A budget attention summary is displayed.
- Mobile budget presentation has been compressed and reviewed.
- Development identifiers have been removed from normal user-facing screens.
- THRIVE PWA metadata and icons are configured.
- The application builds cleanly.
- No service worker or offline cache has been added.
- No payment automation has been added.
- No Plaid connection has been added.
- No real beneficiary data has been loaded into THRIVE.
- No production pilot has been authorized.

---

## 12. Immediate Next Development Objective

The next objective is not to import all historical records.

The next objective is:

> Design and verify the Q1 2025 historical ingestion and reconciliation spine before loading beneficiary financial activity into THRIVE.

The first implementation pass should determine:

- Required source registry fields
- Required transaction staging fields
- Required reconciliation states
- Required human review states
- Duplicate-control strategy
- Source-to-transaction traceability
- Trust-record matching strategy
- Historical/current boundary fields
- RLS ownership path
- Rollback and deletion behavior for test imports

No schema or SQL should be executed until the proposed structure is reconciled against the existing Supabase schema and approved.

---

## 13. Implementation Discipline

For each functional checkpoint:

1. Inspect the existing source and schema.
2. State what is known.
3. State what remains uncertain.
4. Define the smallest approved change.
5. Preserve authentication and RLS.
6. Build the feature.
7. Run `npm run build`.
8. Perform browser smoke testing.
9. Verify mobile behavior when applicable.
10. Record the checkpoint.
11. Commit locally.
12. Do not push unless explicitly approved.

Avoid:

- Broad refactors
- Premature automation
- Unreviewed real-data imports
- Automatic financial conclusions
- Unnecessary documentation sprawl
- Features added solely to claim AI capability
- Mixing trustee and beneficiary authority
- Rewriting working systems without a demonstrated need

---

## 14. Final Goal

The long-term goal is a controlled system in which Johnny can understand:

- What support has been provided
- What money is available
- What must remain protected
- What has already been spent
- What patterns are developing
- What information is uncertain
- What support is available
- What actions may improve stability

The final system should reduce confusion without removing dignity, autonomy, trustee authority, human judgment, or legal accountability.
