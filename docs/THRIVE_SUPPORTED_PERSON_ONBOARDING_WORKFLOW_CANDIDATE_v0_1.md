# THRIVE Supported-Person Onboarding Workflow Candidate v0.1

## Status

Review-only workflow candidate.

This document defines the proposed supported-person onboarding sequence using synthetic records only.

It does not authorize Johnny onboarding, authentication-user creation, production data entry, Trust Engine synchronization, SQL execution, push, merge, or deployment.

## Purpose

The onboarding workflow must prove that THRIVE can safely create and manage one supported person at a time while preserving:

- person-centered identity;
- workspace scope;
- program participation;
- optional authentication access;
- role-based authority;
- immutable lineage;
- non-destructive lifecycle handling;
- visible audit evidence.

## Operating Model

The workflow is developed and tested with synthetic identities first.

Progression:

1. Design the workflow.
2. Review each step and boundary.
3. Build synthetic application affordances.
4. Test with controlled synthetic identities.
5. Record expected and observed behavior.
6. Correct defects.
7. Approve an operational onboarding plan.
8. Create real operational records only after explicit approval.

Synthetic testing does not automatically authorize operational use.

## Core Entities

### Supported Person

The supported-person record represents one person inside one THRIVE workspace.

Required operational identity fields:

- display name;
- optional preferred name;
- status;
- optional external reference;
- workspace scope;
- creation lineage.

It does not establish:

- legal authority;
- clinical status;
- fiduciary status;
- incapacity;
- guardianship;
- trust-beneficiary ownership;
- consent for external sharing.

### Authentication User

Authentication access is optional and separate from supported-person identity creation.

A supported-person record may exist without an authentication user.

Authentication linking must be:

- separately initiated;
- separately approved;
- auditable;
- reversible only through a separately reviewed workflow;
- limited to the correct supported-person identity.

Creating a supported-person record must not automatically create an authentication account.

### Program Participation

Program participation is separate from supported-person identity.

Participation records:

- identify the program;
- identify the supported person;
- preserve workspace scope;
- preserve immutable identity relationships;
- carry a non-destructive lifecycle status.

Participation does not create broader financial, legal, clinical, or Trust Engine authority.

## Proposed Onboarding Stages

### Stage 1: Administrator Starts Onboarding

Actor:

- authorized workspace administrator

Administrator action:

- select the authorized workspace;
- select the intended program;
- begin a new supported-person onboarding candidate.

System requirements:

- display the authenticated administrator;
- display the fixed workspace;
- display the selected program;
- warn that the workflow creates no authentication user automatically;
- warn that the workflow creates no Trust Engine relationship;
- require explicit confirmation before record creation.

No record is written while the page is merely loaded.

### Stage 2: Supported-Person Identity Candidate

Administrator enters:

- display name;
- optional preferred name;
- optional external reference;
- initial status.

Initial supported-person status must use the installed values:

- `active`
- `paused`
- `archived`

Default candidate status:

- `active`

Validation requirements:

- display name cannot be blank;
- preferred name cannot be blank when supplied;
- external reference cannot be blank when supplied;
- workspace is fixed and cannot be edited;
- created-by identity is derived from the authenticated administrator;
- creation timestamp is database-generated;
- authentication link remains empty unless separately approved.

### Stage 3: Identity Review

Before creation, the application displays:

- exact payload preview;
- workspace ID;
- authenticated administrator;
- identity fields;
- status;
- confirmation that `auth_user_id` is empty;
- confirmation that no program participation exists yet;
- confirmation that no Trust Engine or financial data is involved.

Administrator must explicitly confirm the creation request.

The application must not provide a generic table editor.

### Stage 4: Supported-Person Identity Creation

Expected behavior:

- authorized administrator may create the record;
- returned row is displayed;
- created-by lineage is visible;
- workspace scope is visible;
- authentication link remains null;
- no other records are created automatically.

Failure behavior:

- stop after the first error;
- display the exact error;
- do not retry automatically;
- do not create participation;
- do not create an authentication account;
- do not attempt cleanup automatically.

### Stage 5: Program Participation Candidate

After identity creation succeeds, the administrator may prepare participation.

Participation candidate fields:

- fixed workspace;
- selected program;
- newly created supported-person ID;
- participant role: `supported_person`;
- initial participation status: `active`;
- authenticated administrator as creator.

Installed participation statuses:

- `active`
- `inactive`
- `completed`

Validation requirements:

- workspace matches the supported-person workspace;
- program belongs to the workspace;
- supported-person ID is fixed;
- participant role is fixed;
- creator is the authenticated administrator;
- duplicate participation is prevented.

### Stage 6: Participation Review

Before participation creation, display:

- exact payload;
- supported-person identity;
- program identity;
- workspace;
- participant role;
- status;
- creator;
- duplicate-assignment warning;
- confirmation that no authentication account is created.

Administrator must explicitly confirm the participation request.

### Stage 7: Participation Creation

Expected behavior:

- authorized administrator may create the participation;
- returned row is displayed;
- immutable scope fields are visible;
- participation status is active;
- no unrelated records are created.

Failure behavior:

- stop after the first error;
- do not retry automatically;
- retain the supported-person identity;
- do not delete the supported-person record;
- present the participation failure for review.

A failed participation step must not trigger a hard delete of the supported-person identity.

### Stage 8: Authentication-Link Decision

Authentication linking is a separate decision gate.

Available workflow outcomes:

- continue without direct login access;
- prepare a future authentication-user candidate;
- defer authentication indefinitely.

The onboarding workflow must clearly distinguish:

```text
Supported-person identity exists
from:

Supported person has direct login access

No authentication user is created during the synthetic onboarding workflow unless a separately approved authentication-link test is opened.

Stage 9: Supported-Person Read Experience

After synthetic onboarding, the controlled supported-person account should be able to read only:

their own supported-person identity;
their own authorized program participation;
their authorized workspace and program context.

They must not be able to:

create another supported-person record;
directly edit the protected identity row;
create participation;
alter participation;
access another supported person;
access administrative controls.
Stage 10: Administrator Lifecycle Management

Supported-person lifecycle actions:

active to paused;
paused to active;
active or paused to archived, if separately approved.

Participation lifecycle actions:

active to inactive;
active or inactive to completed, if separately approved.

Lifecycle rules:

no hard delete;
retain creation lineage;
retain audit timestamps;
do not alter immutable workspace, program, or person scope;
require explicit confirmation;
display expected result before execution.

Exact transition rules require a separate lifecycle matrix before implementation.

Audit Evidence

The onboarding experience should display or preserve:

authenticated actor;
actor classification;
workspace;
program;
supported-person ID;
participation ID;
created-by identity;
created timestamp;
updated timestamp;
current status;
exact confirmed request;
observed response;
failure message when applicable.

The audit display must separate:

facts;
workflow state;
user-entered explanations;
conclusions.

No explanation or conclusion should be fabricated.

Authorization Summary
Administrator

May:

create supported-person identity;
update permitted metadata;
create participation;
perform approved lifecycle transitions.

May not:

change immutable workspace scope;
change creation lineage;
reassign participation identity or scope;
hard delete records through routine workflows.
Supported Person

May:

read their authorized identity and participation.

May not:

create identity records;
directly update protected identity rows;
create or modify participation records.
Support Member

May:

read authorized support context when permitted by application design.

May not:

directly modify supported-person identity;
directly modify participation.
Viewer

May:

read authorized context only.

May not:

perform supported-person or participation writes.
Outsider

May not:

view the workspace;
view the program;
create supported-person records;
create participation;
update protected records.
Synthetic Test Sequence

The synthetic onboarding implementation should be tested in this order:

Administrator opens onboarding page.
Page load performs no write.
Administrator reviews synthetic identity payload.
Administrator creates synthetic supported person.
Returned identity row is verified.
Administrator reviews synthetic participation payload.
Administrator creates synthetic participation.
Returned participation row is verified.
Supported-person account verifies self-read.
Support, viewer, and outsider accounts verify denied writes.
Administrator verifies permitted metadata update.
Administrator verifies permitted lifecycle transition.
Administrator verifies immutable-scope denial.
Final synthetic state is reconciled.
Workflow evidence is documented.

Each action must be executed individually.

No automatic multi-step transaction is proposed for the first implementation.

Operational Migration Boundary

Synthetic workflow completion does not automatically migrate to operational use.

Before operational onboarding, prepare a separate operational readiness candidate covering:

authorized real person;
lawful and organizational authority;
workspace selection;
program selection;
minimum required identity fields;
authentication decision;
support-team access;
consent requirements;
data-sharing boundaries;
rollback and correction procedures;
staff training;
production verification;
explicit final approval.

Johnny must not be used as the first operational record merely because he is the first modeled person.

His onboarding requires its own explicit approval and verified authority.

Explanation Boundary

No explanation table or explanation workflow is included.

Future explanation features require a separate design for:

authorship;
observation linkage;
consent;
visibility;
amendment;
disagreement;
unresolved context.
Trust Engine Boundary

The onboarding workflow does not:

read Trust Engine records;
write Trust Engine records;
synchronize identifiers;
merge ownership;
merge approval paths;
establish financial or fiduciary authority.

Any later comparison workflow requires separate authorization and design.

Failure Handling

On any unexpected result:

Stop.
Record the exact action.
Record the authenticated actor.
Record the payload.
Record the response or error.
Confirm whether a row was created or changed.
Do not retry automatically.
Do not delete records.
Prepare a correction candidate.
Obtain approval before corrective execution.
Candidate Implementation Shape

A future synthetic application candidate may include:

administrator-only onboarding route;
identity payload preview;
explicit confirmation field;
single-action create button;
participation payload preview;
separate participation confirmation;
returned-row evidence panel;
lifecycle test controls;
boundary warning panel.

It must not include:

generic database editing;
delete controls;
service-role access;
automatic authentication-user creation;
automatic Trust Engine synchronization;
Johnny-specific values;
production onboarding controls.
Acceptance Criteria

The synthetic onboarding workflow candidate may advance to application implementation only when:

each stage is reviewed;
required fields are confirmed;
lifecycle transitions are documented;
audit evidence is defined;
no automatic authentication creation exists;
no explanation table exists;
no Trust Engine integration exists;
no Johnny-specific execution exists;
a synthetic test plan is approved;
explicit implementation approval is provided.
Approval Status
workflow candidate created: yes
application implementation created: no
SQL created: no
SQL executed: no
service-role access used: no
Johnny auth user created: no
Johnny supported-person record created: no
Johnny participation created: no
explanation table created: no
Trust Engine synchronized: no
push performed: no
merge performed: no
deployment performed: no
Next Gate

Review this workflow candidate and prepare the smallest synthetic application implementation candidate:

Administrator-only supported-person onboarding route
Identity creation only
No participation creation yet
No authentication-user creation
No Johnny-specific data

Do not implement or execute the route until separately approved.
