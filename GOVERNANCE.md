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

### 2. One Person at a Time

THRIVE is designed around the supported individual, not around the convenience of an organization, trust, facility, family member, or data system.

A reusable platform may support many individuals, but each person retains an independent record, context, consent structure, support plan, and personal growth path.

The platform exists to support one person at a time.

### 3. Explain Before Flagging

THRIVE should explain observable facts before suggesting concern, review, or support.

For example:

- Cash received: $200.00
- ATM operator surcharge: $3.75
- Non-network bank fee: $3.00
- Total removed from the account: $206.75
- Total cost of accessing $200.00: $6.75

The preferred response is educational:

> You received $200.00 in cash, but $206.75 left the account because two separate fees were charged. A lower-cost cash option may avoid some or all of these fees.

The system must not convert financial ignorance, limited skills, disability, recovery challenges, or missing context into moral judgment.

### 4. Separate Facts, Patterns, Explanations, and Conclusions

THRIVE must distinguish among:

- **Facts:** What the records directly show.
- **Patterns:** Repeated or correlated observations.
- **Explanations:** Context supplied by the individual or an authorized support person.
- **Conclusions:** Human determinations made by someone with appropriate authority.

A correlation between wellness input and financial activity does not establish cause, diagnosis, intent, relapse, misconduct, or incapacity.

### 5. Personal Growth Is the Outcome

The platform should help the individual improve over time through:

- financial understanding;
- stronger routines;
- fewer avoidable fees;
- improved responsibility completion;
- earlier requests for assistance;
- better recognition of personal patterns;
- increased confidence;
- greater practical independence;
- healthier and more stable decision-making.

Progress should be measured against the person’s own goals and prior functioning, not against an artificial universal standard.

### 6. Essentials First

The platform prioritizes:

- Housing
- Food
- Utilities
- Phone
- Transportation
- Medical or recovery-related essentials
- Required beneficiary distributions, when applicable
- Necessary documentation and responsibilities

Flexible spending is secondary to protected needs.

### 7. Support Without Shame

The platform must avoid language that humiliates, diagnoses, moralizes, or labels the user.

Preferred language:

- “Protected”
- “Pause”
- “Review”
- “Support touchpoint”
- “Spending pressure”
- “Cash access pattern”
- “Needs documentation”
- “Would you like help reviewing this?”

Avoid language such as:

- “Bad behavior”
- “Failure”
- “Addict spending”
- “Relapse proof”
- “Irresponsible”
- “Noncompliant” unless used in a formal compliance context supported by evidence

### 8. Human Authority Remains Human

THRIVE may organize, calculate, summarize, explain, and identify possible patterns.

THRIVE must not replace:

- the individual’s agency;
- lawful support authority;
- trustee judgment;
- legal counsel;
- clinical judgment;
- financial advisory services;
- crisis services;
- informed consent.

### 9. DSS Role Clarity

DSS Enterprises may support documentation, administrative organization, reporting, planning, education, account assistance, and analysis when authorized.

DSS Enterprises is not the trustee unless separately and legally appointed.

For trust-related matters, the trustee remains the fiduciary decision-maker.

For personal-support matters, DSS acts only within the authority, consent, and support relationship applicable to the individual.

### 10. Independent Systems Remain Independent

A person’s financial support spine, a trust ledger, a housing system, a treatment platform, and any other external system remain separate domains.

Information may cross between systems only through lawful authority, documented consent, defined purpose, minimum necessary disclosure, and an auditable exchange.

No external system automatically controls, rewrites, approves, or classifies another system’s records.

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

- Financial capability education
- Personal financial organization
- Daily responsibility support
- Protected spending planning
- Recovery-informed financial awareness
- Wellness reflection
- Consent-based support reporting
- Administrative planning support
- Trust administration support documentation, when applicable

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
## Person-Centered Domain Boundaries

### Personal Support Spine

Each supported individual has an independent personal support spine.

It may include:

- personal financial observations;
- bills and responsibilities;
- financial education;
- wellness reflections;
- behavioral input;
- goals;
- reminders;
- receipts and supporting evidence;
- personal explanations;
- authorized support actions;
- pattern observations.

The personal spine belongs to the person’s support context. It must not be treated as property of a trust, housing program, support organization, or external decision-maker.

### External Systems

An external system, including a trust ledger, housing system, treatment platform, or benefits system, remains independent from the individual’s personal spine.

External systems may exchange limited information with THRIVE only through:

- lawful authority;
- documented consent;
- a defined support relationship;
- a specific operational purpose;
- minimum necessary disclosure;
- an auditable exchange record.

Neither system automatically controls, rewrites, approves, or classifies records belonging to the other.

### Controlled Collaboration

For Johnny, THRIVE may receive verified information that helps him understand his responsibilities, such as:

- a trust distribution was sent;
- an essential expense was paid directly;
- an upcoming responsibility remains unpaid;
- a document or explanation may be needed for a specific request.

Johnny’s personal financial activity remains independent from the Trust Engine.

The Trust Engine records trust truth.

THRIVE records Johnny’s personal support truth.

A controlled bridge may compare relevant facts, but it must not merge ownership, authority, or decision-making.

## Recovery-Informed Behavioral Analytics

THRIVE may combine financial observations with voluntary wellness and behavioral input to identify possible patterns that may help the individual.

Permitted observations may include:

- repeated financial fees;
- increased spending pressure;
- missed responsibilities;
- changes in routine;
- correlations between stress and financial activity;
- positive changes associated with support, planning, or stable routines.

Analytics must remain:

- observational;
- explainable;
- person-centered;
- non-diagnostic;
- non-punitive;
- consent-aware;
- reviewable by a human.

THRIVE must not claim that financial activity proves relapse, impairment, dishonesty, irresponsibility, or any clinical condition.

## Human-Centered Product Statement

THRIVE helps one person at a time understand their money, manage daily responsibilities, recognize personal patterns, and ask for support before problems become crises.

The system exists to support growth, understanding, stability, dignity, and practical independence.
