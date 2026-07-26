# THRIVE Synthetic Authentication-Link Candidate for Supported Person D v0.1

## Status

Review-only design candidate.

This document defines the next synthetic onboarding gate for supported person D.

It does not create an authentication user, modify the supported-person record, execute SQL, use service-role access, or link any real person.

## Verified Starting State

Synthetic supported person D exists.

- Supported-person ID: `71000000-0000-4000-8000-000000000009`
- Workspace ID: `71000000-0000-4000-8000-000000000001`
- Display name: `SUPPORTED PERSON ONBOARDING TEST D`
- Preferred name: `Onboarding Test D`
- Status: `active`
- External reference: `RLS-ONBOARDING-TEST-PERSON-D`
- Authentication user ID: `null`
- Created by: `3c0300e6-c4e9-4a84-b668-4a7e39593162`

Synthetic program participation D exists.

- Participation ID: `71000000-0000-4000-8000-000000000010`
- Program ID: `71000000-0000-4000-8000-000000000002`
- Participant role: `supported_person`
- Participation status: `active`

## System Boundaries

THRIVE and the Trust Engine remain independent systems.

The authentication identity establishes only sign-in capability and the application identity used by THRIVE authorization rules.

It does not establish:

- ownership of Trust Engine data;
- fiduciary authority;
- legal authority;
- consent to external sharing;
- clinical findings;
- financial intent;
- capacity;
- recovery status;
- approval authority outside THRIVE.

## Candidate Decision

Supported person D should receive a controlled synthetic authentication identity so the onboarding sequence can prove the optional authentication-link workflow.

The authentication user and the supported-person record remain separate objects.

The supported-person record may reference the authentication user through `auth_user_id`, but the authentication user does not own or control the supported-person record merely because the link exists.

## Proposed Controlled Synthetic Account

Candidate email:

`dstein561+thrive-onboarding-person-d@gmail.com`

Candidate classification:

`Controlled synthetic supported person D`

Candidate authentication user ID:

To be supplied by Supabase Auth only after separately approved account creation.

No UUID is fabricated in this candidate.

## Proposed Auth-User Creation Gate

Auth-user creation must be separately approved and performed through an authorized Supabase administrative path.

The creation action must:

1. create exactly one controlled synthetic user;
2. use the fixed synthetic email;
3. avoid Johnny or any real person's email;
4. avoid service-role use unless separately approved for the exact operation;
5. record the returned authentication user ID;
6. stop immediately on any unexpected response;
7. perform no automatic retry;
8. perform no supported-person update in the same operation.

## Proposed Supported-Person Link Gate

After the auth user exists and its returned UUID is verified, a separate administrator-only action may update only:

```json
{
  "auth_user_id": "<verified Supabase Auth user UUID>"
}
```

Target record:

`71000000-0000-4000-8000-000000000009`

The link action must not change:

- workspace ID;
- display name;
- preferred name;
- status;
- external reference;
- created-by lineage;
- program participation;
- Trust Engine data.

## Proposed Application Actions

### Action 1: Review Auth Identity

Action ID:

`REVIEW-D-AUTH`

Purpose:

Display the fixed synthetic email, current supported-person state, and frozen boundaries.

Expected result:

No database write.

### Action 2: Link Verified Auth User

Action ID:

`LINK-D-AUTH`

Availability:

Administrator only.

Precondition:

A separately approved synthetic auth user has already been created and its UUID has been independently verified.

Expected result:

Allowed only when updating supported person D with the exact verified UUID.

The route must require exact typed confirmation:

`LINK-D-AUTH`

## Required Validation Before Any Execution

- supported person D still exists;
- participation D still exists;
- `auth_user_id` is still `null`;
- the synthetic email is not already in use;
- no auth UUID is guessed or fabricated;
- no service-role key is added to client code;
- no Trust Engine integration is introduced;
- no Johnny record is referenced;
- no broad generic editor is introduced;
- no delete path is introduced;
- build passes;
- `git diff --check` passes;
- only intended candidate files are changed.

## Expected Post-Link Behavior

After a separately approved and successful link:

- supported person D can authenticate through the linked user;
- person D may read only the records allowed by existing RLS;
- person D receives no administrator write authority;
- person D receives no support-member or viewer authority;
- person D receives no Trust Engine authority;
- workspace and creation lineage remain immutable;
- participation D remains unchanged.

## Negative Tests Required After Linking

The linked synthetic person D must be denied when attempting to:

- create another supported-person record;
- alter workspace scope;
- alter creation lineage;
- create or modify program participation;
- update another supported person;
- access another workspace;
- access Trust Engine data;
- perform administrator-only onboarding.

## Non-Destructive Validation

No rollback delete is proposed.

The synthetic auth user and link should remain as controlled test fixtures unless a later approved archive or disable plan is created.

Current MVP rules prohibit hard deletes.

## Deferred Items

- actual auth-user creation;
- service-role use;
- exact returned auth UUID;
- supported-person link execution;
- password-delivery workflow;
- password reset workflow;
- production invitation workflow;
- Johnny auth-user creation;
- Johnny supported-person record;
- operational onboarding;
- explanation table;
- Trust Engine synchronization;
- external sharing;
- push, merge, and deployment.

## Approval Status

- Candidate design creation approved: yes
- Candidate documentation approved: yes
- Application review affordance approved: yes
- Local build and static validation approved: yes
- Auth-user creation approved: no
- Service-role access approved: no
- Supported-person auth link approved: no
- Johnny onboarding approved: no
- Push approved: no
- Merge approved: no
- Deployment approved: no

## Exact Next Gate

Build a review-only administrator affordance that displays the proposed synthetic auth identity and verifies the current database-visible state of supported person D.

Do not create the authentication user.

Do not update `auth_user_id`.

After local validation and commit, stop for the separate auth-user creation decision.
