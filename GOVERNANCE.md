# THRIVE Governance, Roadmap, and Build Doctrine

## North Star

THRIVE exists to create financial clarity, reduce administrative stress, protect essential needs, and support responsible stewardship.

The platform should help people and support teams see the truth clearly without shame, confusion, or overreach.

The first purpose is personal and internal operational support. Future expansion is allowed only if it preserves the original purpose, legal boundaries, ethical clarity, and technical simplicity.

## Project Identity

Project name: THRIVE Stewardship & Stability Platform  
Prototype lineage: SteadyPath Budget & Recovery Companion  
Owner: DSS Enterprises  
Primary modeled case: Johnny / Jutta Koster Living Trust  
Initial build phase: Phase 0, repository and governance foundation

## Core Operating Principles

### 1. Truth Before Features

The system must reflect reality before it adds automation.

No fake certainty. No false legal authority. No clinical conclusions. No financial guarantees.

### 2. Essentials First

The platform prioritizes:

- Housing
- Food
- Utilities
- Phone
- Transportation
- Medical or recovery-related essentials
- Required beneficiary distributions
- Trustee documentation

Flexible spending is secondary to protected needs.

### 3. Support Without Shame

The platform must avoid language that humiliates, diagnoses, moralizes, or labels the user.

Preferred language:

- “Protected”
- “Pause”
- “Review”
- “Support touchpoint”
- “Spending pressure”
- “Cash access flag”
- “Needs documentation”
- “Requires review”

Avoid language such as:

- “Bad behavior”
- “Failure”
- “Addict spending”
- “Relapse proof”
- “Irresponsible”
- “Noncompliant” unless used in a formal compliance context with evidence

### 4. Human Authority Remains Human

THRIVE may organize, calculate, summarize, and flag information.

THRIVE must not replace:

- Trustee judgment
- Legal counsel
- Clinical judgment
- Financial advisory services
- Crisis services
- User consent

### 5. DSS Role Clarity

For trust-related use, DSS Enterprises may support documentation, administrative organization, reporting, planning, and analysis.

DSS Enterprises is not the trustee unless separately and legally appointed.

The trustee remains the fiduciary decision-maker.

## Legal and Ethical Boundaries

THRIVE must not present itself as:

- Legal advice
- Financial advisory services
- Investment advice
- Credit repair
- Bankruptcy advice
- Therapy
- Medical advice
- Substance use diagnosis
- Crisis intervention
- Trustee authority
- Fiduciary replacement

THRIVE may present itself as:

- Budget education
- Financial organization
- Protected spending support
- Trust administration support documentation
- Consent-based support reporting
- Recovery-informed financial awareness
- Administrative planning support

## Data Protection Principles

No real sensitive data should be entered until Supabase security is verified.

Sensitive data includes:

- Trust records
- Beneficiary financial records
- Bank transactions
- Receipts
- Health or recovery-related notes
- Behavioral check-ins
- Personally identifiable information
- Legal documents

Before real data use:

1. Inventory database tables.
2. Enable Row Level Security where needed.
3. Define access roles.
4. Create and test policies.
5. Separate mock/demo data from real records.
6. Confirm no service role keys are exposed client-side.
7. Confirm no secrets are committed to GitHub.

## Technical Build Doctrine

This project follows the DSS Truth Build Doctrine.

Preferred baseline:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- GitHub
- Vercel or Netlify only after deployment plan is confirmed
- Simple, explainable architecture
- One file at a time when troubleshooting
- Verify before changing
- Commit after stable checkpoints

## Product Specification Control

The active product specification is maintained in:

- `docs/SPECS.md`

Any meaningful change to modules, MVP scope, data model direction, legal/ethical product boundaries, or future feature priorities should be reflected in the specs file.

## Current Roadmap

### Phase 0: Foundation

Status: Active

Goals:

- Create repository
- Scaffold Next.js app
- Create README
- Create governance file
- Create initial dashboard shell
- Commit clean checkpoint
- Inventory Supabase schema
- Identify security gaps

Exit criteria:

- App runs locally
- README exists
- GOVERNANCE.md exists
- Initial dashboard shell renders
- First commit pushed
- Supabase tables and RLS status documented

### Phase 1: Product Skeleton

Goals:

- Build static navigation
- Create dashboard route
- Create budget route
- Create check-in route
- Create trust mode route
- Create reports route
- Create mock data layer
- Keep all data local/mock

Exit criteria:

- Routes work
- Mock data displays consistently
- No real sensitive data used
- Build passes

### Phase 2: Supabase Inventory and Schema Design

Goals:

- Review existing Supabase tables
- Classify tables as active, archive, utility, or replace
- Design core THRIVE schema
- Define user roles
- Define RLS policy needs
- Document schema plan before applying changes

Exit criteria:

- Schema plan approved
- RLS strategy documented
- No destructive database changes made without backup/export

### Phase 3: Secure Database Connection

Goals:

- Add Supabase client
- Add environment variable structure
- Connect read-only test query
- Validate RLS behavior
- Use only mock or test records

Exit criteria:

- App connects safely
- RLS policies verified
- No secrets exposed
- Test data only

### Phase 4: Johnny / Trust Mode MVP

Goals:

- Build trust distribution dashboard
- Track essentials paid directly
- Track weekly disbursements
- Track receipt status
- Generate trustee-facing summary
- Generate beneficiary-facing summary
- Generate DSS administrative memo

Exit criteria:

- Johnny model case works with mock data
- Legal role language is visible
- Reports separate trustee, beneficiary, and DSS views

### Phase 5: Broader THRIVE Platform

Goals:

- Generalize beyond Johnny
- Add reusable supported-person profiles
- Add support-circle permissions
- Add consent-based reporting
- Add broader financial stability workflows

Exit criteria:

- Johnny is one use case, not the entire system
- Platform remains legally and ethically bounded

## Session Log

### Session 001: Project Start

Completed:

- Created GitHub repository `thrive-stability-platform`
- Confirmed Supabase project `thrive` exists and is healthy
- Observed RLS disabled warnings in Supabase advisor
- Scaffolded Next.js app
- Confirmed local app runs at `http://localhost:3000`
- Replaced default starter page with initial THRIVE dashboard shell
- Established need for README and governance documentation

Next:

- Add README.md
- Add GOVERNANCE.md
- Commit clean checkpoint
- Begin Supabase schema inventory