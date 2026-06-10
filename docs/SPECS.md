# THRIVE Product Specifications

## Purpose of This File

This file is the controlled product specification for THRIVE Stewardship & Stability Platform.

It should be updated after meaningful build sessions, product decisions, schema changes, or legal/ethical scope decisions.

This file is not a scratchpad. It is the living source of truth for what the product is, what it does, what it does not do, and what is intentionally parked for later.

## Product Summary

THRIVE is a financial stability and stewardship platform designed to help individuals and approved support teams protect essential spending, understand financial behavior, complete daily check-ins, and generate consent-based support summaries.

The first modeled real-world use case is Johnny, beneficiary of the Jutta Koster Living Trust. However, THRIVE is not a single-person app. Johnny is the first modeled case inside a broader platform structure.

## Core Product Promise

THRIVE helps answer four practical questions:

1. What money is truly available?
2. What essential needs must be protected first?
3. What patterns or pressures should be reviewed before spending?
4. What should be shared with approved support people?

## Primary User Types

### Supported Individual

The person whose financial stability is being supported.

Examples:

- Trust beneficiary
- Recovery community member
- Supported housing resident
- Reentry client
- Person receiving family or case-management support

### Support Role

A person approved to view summaries or provide support.

Examples:

- Trustee
- Case manager
- Sponsor or peer support
- Family support
- DSS Enterprises administrator
- Financial stability coach

### Administrator

A system-level role responsible for configuration, documentation, reporting, and audit support.

## MVP Modules

### 1. Dashboard

Purpose:

Provide a quick financial stability snapshot.

Initial dashboard fields:

- Available balance
- Safe-to-spend estimate
- Stability score
- Best next action
- Mock bank feed status
- Daily check-in summary
- Support guidance
- Protected categories
- Recent activity
- Trust Mode summary

Current status:

- Static dashboard shell exists in `src/app/page.tsx`.
- Uses mock data only.
- No database connection yet.

### 2. Budget

Purpose:

Organize money into protected and flexible categories.

Initial categories:

- Rent / housing
- Phone
- Food and groceries
- Transportation
- Medical / recovery essentials
- Utilities
- Flexible spending
- Emergency reserve

Future functionality:

- Monthly budget setup
- Protected category locks
- Safe-to-spend calculation
- Upcoming bill awareness
- Category overrun alerts

### 3. Daily Check-In

Purpose:

Capture daily behavioral and financial pressure signals.

Initial check-in fields:

- Stress
- Spending urge
- Sleep quality
- Recovery support
- Cash access pressure
- Notes or reflection

Important boundary:

Check-ins are not clinical assessments and must not diagnose relapse, substance use, mental health conditions, or treatment needs.

### 4. Spending Context

Purpose:

Show financial activity with plain-language context.

Possible flags:

- Within plan
- Essential
- Cash access flag
- High-risk time
- Needs receipt
- Requires review
- Support-linked
- Protected expense

Important boundary:

Flags must be supportive and factual, not shaming.

### 5. Trust Mode

Purpose:

Support trust administration workflows for Johnny and future trust-style use cases.

Initial Johnny model functions:

- Monthly distribution plan
- Essentials paid directly by trust
- Weekly flexible disbursement schedule
- Receipt tracking
- Trustee-facing summary
- Beneficiary-facing summary
- DSS administrative memo
- Audit trail notes

Important boundary:

DSS Enterprises may support documentation, organization, reporting, and administrative planning. The trustee remains the fiduciary decision-maker.

### 6. Reports

Purpose:

Generate structured outputs for different audiences.

Initial report types:

- Individual summary
- Trustee summary
- Beneficiary-facing summary
- DSS administrative memo
- Weekly support summary
- Monthly distribution summary

Report principle:

Each report must be audience-specific. Trustee-facing language, beneficiary-facing language, and DSS internal notes should not be blended into one uncontrolled output.

### 7. Consent and Permissions

Purpose:

Control who can view what information.

Future permission ideas:

- User-only view
- Trustee view
- Support-circle view
- DSS administrator view
- Read-only report viewer
- Emergency contact visibility

Important boundary:

No support person should receive sensitive data unless access is authorized and documented.

### 8. Audit Log

Purpose:

Track important system actions.

Future audit events:

- Record created
- Record updated
- Report generated
- Report viewed
- Document uploaded
- Distribution marked paid
- Receipt marked received
- Consent changed
- Admin note added

## Initial Data Model Concepts

These are planning concepts only. They are not approved database tables yet.

Potential core tables:

- `profiles`
- `support_roles`
- `consents`
- `budgets`
- `budget_categories`
- `transactions`
- `checkins`
- `distribution_plans`
- `distribution_payments`
- `documents`
- `reports`
- `support_notes`
- `audit_log`

## Existing Supabase Project Notes

Existing Supabase project name:

- `thrive`

Observed existing tables include:

- `projects`
- `system_anchors`
- `trust_documents`
- `trust_ledger`
- `trust_ledger_transactions`
- `transaction_receipts`
- `transactions_profile`
- `transactions_snapshot`
- `import_batches`
- `import_events`

Observed security issue:

- Supabase Advisor shows multiple Row Level Security warnings for public tables.

Decision:

Do not use real sensitive data until Supabase schema, roles, and RLS policies are inventoried and reviewed.

## Mock Data Rule

During early development, the application must use mock data only.

Mock data may include:

- Fake balances
- Fake transactions
- Fake check-in values
- Fake bills
- Fake reports
- Fake Johnny-mode demonstration data

Mock data must not include real bank records, real beneficiary transactions, real account numbers, real receipts, or private trust documents.

## Language Standards

Preferred language:

- Protected spending
- Safe-to-spend
- Spending pressure
- Support touchpoint
- Review needed
- Cash access flag
- High-risk time
- Documentation needed
- Trustee review
- Beneficiary summary
- DSS administrative note

Avoid language:

- Bad spending
- Failed
- Addict behavior
- Relapse confirmed
- Irresponsible
- Manipulative
- Noncompliant unless formally documented and contextually appropriate
- Guaranteed recovery
- Guaranteed financial outcome

## Out of Scope for MVP

The following are intentionally not part of the early MVP:

- Live bank integration
- Plaid or bank aggregator connection
- Automated financial advice
- Investment recommendations
- Clinical treatment recommendations
- Crisis intervention workflows
- Credit repair services
- Bankruptcy recommendation engine
- Full mobile app
- Multi-tenant commercial SaaS deployment
- Production use with real sensitive data

## Future Parking Lot

Possible future features:

- Bank integration through Plaid, MX, Finicity, or Teller
- PDF report generation
- Role-based dashboards
- Trustee approval workflow
- Receipt OCR
- Spending trend charts
- Support-circle notifications
- Weekly email summaries
- Beneficiary acknowledgement forms
- Case manager review queue
- Recovery community version
- Representative-payee-style version
- Personal finance coaching version

## Current Build Status

### Completed

- GitHub repository created
- Next.js app scaffolded
- Initial THRIVE dashboard shell created
- README created
- GOVERNANCE created
- Initial foundation committed and pushed to GitHub

### Current Phase

Phase 0: Foundation and Documentation

### Next Priorities

1. Commit `docs/SPECS.md`.
2. Update README to reference specs file.
3. Begin Supabase schema inventory.
4. Document existing database tables.
5. Decide whether existing Supabase tables are active, archive, utility, or replace.
6. Keep app mock-only until data security is resolved.

