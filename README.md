# THRIVE Stewardship & Stability Platform

THRIVE is a DSS Enterprises software project focused on financial stability, protected spending, recovery-informed budgeting, trust-support workflows, and consent-based support reporting.

The platform is being designed first for internal and personal operational use, especially to support trust administration and beneficiary financial oversight. Any future public or client-facing use must remain secondary to the original purpose: reducing administrative stress, improving clarity, and supporting responsible stewardship.

## Project Purpose

THRIVE helps individuals and support teams organize financial activity, protect essential expenses, track behavioral and financial patterns, and generate structured summaries for approved support roles.

The platform is not intended to replace professional legal, financial, clinical, fiduciary, or crisis services.

## Current Prototype Direction

The current dashboard shell includes:

- Available balance
- Safe-to-spend estimate
- Stability score
- Daily check-in indicators
- Recovery-aware support prompts
- Protected budget categories
- Recent spending context
- Trust Mode model case for Johnny / Jutta Koster Living Trust

## Primary Use Case

The first real-world modeled use case is Johnny, beneficiary of the Jutta Koster Living Trust.

THRIVE may support:

- Monthly trust distribution planning
- Essentials paid directly by the trust
- Weekly beneficiary disbursement tracking
- Receipts and documentation
- Trustee-facing reports
- Beneficiary-facing summaries
- DSS administrative notes
- Spending pattern review

DSS Enterprises may support organization, reporting, documentation, and administrative planning. The trustee remains the legal fiduciary decision-maker.

## Legal and Ethical Guardrails

THRIVE must not be represented as:

- Legal advice
- Financial advisory services
- Investment advice
- Bankruptcy advice
- Credit repair
- Therapy
- Medical advice
- Substance use diagnosis
- Crisis intervention
- Fiduciary decision-making authority

THRIVE may be represented as:

- Financial organization support
- Budget education
- Protected spending planning
- Recovery-informed financial awareness
- Consent-based support reporting
- Trust administration support documentation
- Personal financial stability tooling

## Technical Stack

Initial build stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- GitHub
- Local development through VS Code / Codespaces-compatible workflow

## Current Status

Phase 0 is active.

Completed:

- GitHub repository created: `thrive-stability-platform`
- Next.js app scaffolded
- Local development server confirmed at `http://localhost:3000`
- Initial THRIVE dashboard shell created

Next priorities:

1. Create governance and roadmap documentation.
2. Commit the clean scaffold checkpoint.
3. Inventory existing Supabase schema.
4. Define data model boundaries.
5. Resolve Supabase RLS/security issues before real data use.
6. Build THRIVE dashboard modules with mock data first.
7. Add real Supabase integration only after schema and policies are verified.

## Development Rule

No blind rebuilds. No casual deletion. No real beneficiary, trust, financial, or recovery-related data should be entered until the database security model is reviewed and Row Level Security policies are properly designed.

## Repository Stewardship

This repository should stay clean and purposeful.

Use this documentation structure:

```text
README.md
GOVERNANCE.md
docs/
  SPECS.md

  Additional files and folders should only be added when they support the working application, verified documentation, or necessary project governance.
