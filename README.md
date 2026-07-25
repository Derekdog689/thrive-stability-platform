# THRIVE Stewardship & Stability Platform

THRIVE is a DSS Enterprises financial capability, personal stability, and recovery-informed support platform.

THRIVE helps one person at a time understand their money, manage daily responsibilities, recognize personal patterns, and ask for support before problems become crises.

The platform combines financial education, personal responsibility tracking, wellness reflection, behavioral input, and consent-based support. It is designed to reduce confusion, improve practical independence, and support honest growth without shame, surveillance, or false authority.

The first modeled use case is Johnny. Future expansion may support other individuals, families, recovery programs, or housing programs, but every implementation must remain person-centered. THRIVE serves the individual first. Organizations, support teams, and external systems exist only to support that person within clearly defined authority, consent, and legal boundaries.

## Project Purpose

THRIVE helps an individual:

- understand income, spending, fees, balances, and recurring obligations;
- manage bills, appointments, documents, deadlines, and daily responsibilities;
- record voluntary wellness and behavioral reflections;
- identify possible connections between financial activity, stress, routines, wellness, and recovery;
- receive understandable education before warnings or flags;
- document personal explanations and supporting evidence;
- request help through authorized and consent-based support relationships;
- measure personal growth over time.

THRIVE may organize and explain observable information. It must distinguish between a fact, a pattern, an explanation, and a conclusion.

For example, THRIVE may explain that a $200.00 cash withdrawal resulted in $206.75 leaving the account when a $3.75 ATM surcharge and a separate $3.00 non-network bank fee are included. It may then offer a lower-cost option. It must not label the person irresponsible or assign intent.

The platform is not intended to replace professional legal, financial, clinical, fiduciary, or crisis services.

## Current Prototype Direction

The current prototype is being developed around one supported person at a time.

The first modeled person is Johnny. THRIVE is intended to help him understand and manage:

- personal bank activity;
- bills and recurring responsibilities;
- available funds and practical safe-to-spend estimates;
- avoidable fees and lower-cost alternatives;
- appointments, deadlines, documents, and renewals;
- voluntary wellness and behavioral reflections;
- recovery-informed personal patterns;
- receipts, check images, and supporting evidence;
- reminders and authorized support from DSS Enterprises;
- personal goals and growth over time.

The system should explain financial activity in understandable real-world terms.

For example, a transaction displayed as a $203.75 ATM withdrawal may represent:

- $200.00 received in cash;
- a $3.75 ATM operator surcharge;
- a separate $3.00 non-network bank fee;
- $206.75 removed from the account in total.

THRIVE should connect related events and explain their practical effect before offering a warning, educational prompt, or support option.

## Primary Modeled Use Case

The first real-world modeled case is Johnny.

DSS Enterprises assists Johnny with responsibilities he is not currently able to manage reliably on his own. This may include financial organization, account assistance, bill support, documentation, reminders, education, reconciliation, wellness reflection, and preparation for requests or decisions involving an external system.

Johnny’s personal financial records remain part of his independent THRIVE support spine.

The Jutta Koster Living Trust remains a separate external system with its own ledger, distributions, direct-paid expenses, trustee decisions, and fiduciary records.

THRIVE may receive limited verified facts from the Trust Engine when those facts help Johnny understand his responsibilities, such as:

- a distribution was sent;
- rent or another essential was paid directly;
- a planned trust payment is pending;
- documentation may be needed for a specific request.

THRIVE may also help Johnny prepare a limited explanation or supporting evidence package when he requests assistance or a discretionary distribution.

The two systems must not automatically merge, control, approve, or rewrite one another.

## Person-Centered Product Modules

THRIVE is organized around five primary support areas:

### Money

- Financial activity
- Income and spending
- Bills and recurring obligations
- Cash flow
- Avoidable fees
- Financial education
- Practical safe-to-spend guidance

### Responsibilities

- Phone
- Housing
- Utilities
- Transportation
- Appointments
- Documents
- Deadlines
- Renewals
- Daily and weekly tasks

### Wellness

- Mood
- Stress
- Sleep
- Cravings
- Physical wellness
- Support contact
- Personal reflection
- Goals

### Patterns

- Repeated financial costs
- Changes in spending pressure
- Missed responsibilities
- Positive routines
- Possible correlations between financial activity and voluntary wellness input
- Personal growth over time

### Support

- Authorized helpers
- Consent and permissions
- Reminders
- Education
- Requests for assistance
- Selected evidence sharing
- Administrative support
- Resources and referrals

## Universal Platform Direction

THRIVE may later support other individuals, families, recovery programs, housing programs, or support organizations.

The reusable model is:

```text
Workspace
  -> Supported person
  -> Support program
  -> Authorized relationships
  -> Consent and permissions
  -> Person-specific modules
Johnny is the first modeled person, not the permanent limit of the platform.

Each supported person must retain an independent record, personal context, consent structure, permissions, goals, and support plan.

The platform may serve many people, but it must always work one person at a time.

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

## Product Specifications

The controlled product specification is maintained in:

- `docs/SPECS.md`

This file defines the product modules, MVP boundaries, data model concepts, language standards, Supabase inventory notes, and future feature parking lot.

## Repository Stewardship

This repository should stay clean and purposeful.

Use this documentation structure:

```text
README.md
GOVERNANCE.md
docs/
  SPECS.md

  Additional files and folders should only be added when they support the working application, verified documentation, or necessary project governance.


  ## Alignment Checkpoint

**Date:** July 25, 2026  
**Participants:** DSS Enterprises and System G  

At this checkpoint, the THRIVE mission, person-centered boundaries, and relationship between the personal support spine and external systems were reviewed and aligned.

