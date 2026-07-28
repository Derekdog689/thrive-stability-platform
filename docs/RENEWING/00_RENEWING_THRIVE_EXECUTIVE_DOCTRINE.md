# Renewing THRIVE Executive Doctrine

## Purpose

THRIVE is a DSS Enterprises financial capability, personal stability, and recovery-informed support platform.

It exists to help one person at a time understand money, manage responsibilities, recognize patterns, and ask for support before problems become crises.

The first modeled person is Johnny. The system must remain reusable without flattening different people into one generic record.

## Governing Principles

### 1. One Person at a Time

Every supported person has an independent identity, context, permissions, support plan, explanations, wellness input, and growth path.

Organizations, trusts, staff, and external systems may support the person, but they do not become the person and they do not own the person's support spine.

### 2. Truth Before Features

THRIVE must reflect verified reality before adding automation.

The platform must distinguish:

- facts;
- patterns;
- explanations;
- conclusions.

No feature may silently turn an observation into a conclusion.

### 3. Explain Before Flagging

The preferred sequence is:

1. show what happened;
2. explain the practical effect;
3. offer education or options;
4. invite support;
5. escalate only when lawful, necessary, and human-reviewed.

Example:

- Cash received: $200.00
- ATM surcharge: $3.75
- Non-network fee: $3.00
- Total removed: $206.75
- Cost of access: $6.75

THRIVE should explain this cost without shame or assigning intent.

### 4. Independent Systems Remain Independent

Johnny's personal THRIVE spine and the Trust Engine are separate systems.

- THRIVE records Johnny's personal support truth.
- The Trust Engine records trust truth.

A controlled bridge may compare authorized facts, but neither system may automatically rewrite, approve, classify, or control the other.

### 5. Human Authority Remains Human

THRIVE may organize, calculate, summarize, explain, and identify possible patterns.

THRIVE must not replace:

- the individual's agency;
- lawful support authority;
- trustee judgment;
- legal counsel;
- clinical judgment;
- financial advisory services;
- crisis services;
- informed consent.

### 6. Support Without Shame

Preferred language includes:

- protected;
- pause;
- review;
- support touchpoint;
- spending pressure;
- cash access pattern;
- needs documentation;
- would you like help reviewing this?

Avoid moralizing, diagnosing, humiliating, or implying incapacity without lawful evidence and authority.

## Build Doctrine

### Backend Is Truth

The database is the source of truth. The interface reflects verified database state.

### Read Before Write

Before any migration, lifecycle change, or write-enabled feature:

1. inspect the live schema;
2. reconcile the current state;
3. document the proposed change;
4. review permissions and boundaries;
5. test with synthetic or controlled data;
6. obtain explicit approval;
7. execute only the approved scope;
8. verify the postflight state.

### No Broad Rebuilds

Prefer the smallest safe next step.

Do not rebuild a working layer merely because a cleaner architecture is imaginable.

### No Silent Scope Expansion

When a task reveals a new requirement, stop and name it. Do not quietly add it to the current pass.

### No Automatic Finality

Observational data must not become approved, final, authoritative, clinical, fiduciary, or legal merely because it entered the database.

## Current Product Boundaries

THRIVE may support:

- personal financial organization;
- budget education;
- responsibilities and reminders;
- voluntary wellness reflection;
- personal explanations;
- recovery-informed pattern awareness;
- authorized support relationships;
- selected evidence sharing;
- trust-support documentation when applicable.

THRIVE is not:

- a trustee;
- a fiduciary replacement;
- a clinical system;
- a financial adviser;
- a surveillance tool;
- a punishment system;
- an automated payment authority.

## Stop Conditions

Pause the build when any of the following occurs:

- personal and trust records begin to blur;
- a field is being used for a purpose it was not designed to serve;
- the interface implies more authority than the database grants;
- a write path exists without tested RLS;
- a new feature would create irreversible data without a rollback strategy;
- the current task cannot be explained in one paragraph;
- the team is solving three future problems instead of today's verified problem.

At a stop condition, return to the latest alignment checkpoint and restate:

- what is true;
- what is frozen;
- what is approved;
- what is next.
