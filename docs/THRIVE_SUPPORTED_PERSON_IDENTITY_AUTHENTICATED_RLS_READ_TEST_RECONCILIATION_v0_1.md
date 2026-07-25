# THRIVE Supported-Person Identity Authenticated RLS Read-Test Reconciliation v0.1

## Status

Review-only reconciliation for authenticated read testing.

This document does not authorize authenticated sign-in, temporary route use,
write testing, lifecycle changes, cleanup, Johnny onboarding, Trust Engine
access, push, merge, or deployment.

## Verified Current State

```text
Repository: thrive-stability-platform
Branch: main
Current checkpoint: 86bcbb9

Controlled authentication users: 6
Controlled workspace records: 1
Controlled workspace memberships: 5
Controlled outsider memberships: 0
Controlled program records: 1
Controlled supported-person records: 2
Controlled participation records: 2
Synthetic profile records: 0
```

The controlled fixture installation has been completed, verified, documented,
and committed.

## Governing Artifacts

- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_RLS_APPLICATION_TEST_PLAN_v0_1.md`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_RLS_TEST_EXECUTION_CHECKLIST_v0_1.md`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_RLS_TEST_DATA_INSTALL_VERIFICATION_CHECKLIST_v0_1.md`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_RLS_TEST_DATA_INSTALL_VALIDATION_REPORT_v0_1.md`
- `src/app/supported-person-test/page.tsx`

## Reconciled Historical Statements

The earlier planning documents contain statements that were accurate when
written but are no longer current.

Current reconciled facts:

```text
Authentication accounts have been created and verified.
Authentication UUIDs have been resolved.
Controlled fixture data has been installed.
Post-installation verification has passed.
Synthetic profiles remain absent.
The temporary route exists but has not been used for authenticated testing.
Authenticated RLS testing has not begun.
```

## Approved Candidate Scope

The next proposed execution scope is limited to authenticated read testing
through the existing temporary route.

The proposed test pass does not include:

- insert testing;
- update testing;
- delete testing;
- immutable-scope testing;
- cross-workspace write testing;
- pause or archive testing;
- fixture cleanup;
- route removal.

Those remain separate future gates.

## Controlled Authentication Identities

```text
Administrator:
dstein561+thrive-rls-admin@gmail.com
3c0300e6-c4e9-4a84-b668-4a7e39593162

Supported person A:
dstein561+thrive-rls-person-a@gmail.com
9b283c6e-c2f8-4f87-9f90-fa081ee249bd

Supported person B:
dstein561+thrive-rls-person-b@gmail.com
28cecd10-43ed-4ae5-8668-31cfa515412c

Support member:
dstein561+thrive-rls-support@gmail.com
7f0a7540-7a6d-4a1a-a29f-7a26c9571db9

Viewer member:
dstein561+thrive-rls-viewer@gmail.com
d3782ad5-8e99-4779-8928-0143bd567486

Outsider:
dstein561+thrive-rls-outsider@gmail.com
d89a6549-ac1a-431c-aff1-1ba7313175ab
```

Credentials must not be recorded in repository files or screenshots.

## Controlled Record Context

```text
Workspace:
71000000-0000-4000-8000-000000000001
SUPPORTED PERSON RLS TEST

Program:
71000000-0000-4000-8000-000000000002
SUPPORTED PERSON PROGRAM TEST

Supported person A:
71000000-0000-4000-8000-000000000003

Supported person B:
71000000-0000-4000-8000-000000000004

Participation A:
71000000-0000-4000-8000-000000000005

Participation B:
71000000-0000-4000-8000-000000000006
```

## Reconciled Read-Test Matrix

| Test | Actor | Expected supported people | Expected participation |
|---|---|---:|---:|
| R1 | Administrator | 2 | 2 |
| R2 | Supported person A | 1, A only | 1, A only |
| R3 | Supported person B | 1, B only | 1, B only |
| R4 | Support member | 0 | 0 |
| R5 | Viewer member | 0 | 0 |
| R6 | Outsider | 0 | 0 |

## Required Test Order

Run exactly one identity at a time:

1. Administrator
2. Supported person A
3. Supported person B
4. Support member
5. Viewer member
6. Outsider

Before each identity:

1. Sign out through the application.
2. Confirm the previous session is cleared.
3. Sign in with the next controlled test identity.
4. Confirm the displayed email and authentication UUID.
5. Confirm the controlled workspace and program context.
6. Open `/supported-person-test`.
7. Reload the route once.
8. Record visible supported-person and participation counts.
9. Record visible labels.
10. Sign out before proceeding.

Do not keep multiple identities active in the same browser profile.

## Required Evidence

For every test capture:

- test ID;
- date and time;
- authenticated email;
- authentication UUID;
- workspace role;
- linked supported-person UUID, when applicable;
- expected supported-person count;
- observed supported-person count;
- expected participation count;
- observed participation count;
- visible labels;
- displayed error, if any;
- screenshot;
- pass or fail decision;
- reviewer name or initials.

Do not capture passwords, magic links, access tokens, refresh tokens, cookies,
authorization headers, or service credentials.

## Stop Rules

Stop immediately if:

- person A can see person B;
- person B can see person A;
- support can see supported-person or participation data;
- viewer can see supported-person or participation data;
- outsider can see supported-person or participation data;
- any Johnny or production identity appears;
- any Trust Engine, clinical, financial, legal, or recovery data appears;
- the route performs an unexpected insert, update, or delete;
- a service-role credential is used;
- the route exposes authentication secrets.

Do not continue to the next identity after a failed isolation test.

Do not weaken an RLS policy during active testing.

## Route Preconditions

Before execution approval, reconfirm:

```text
npx eslint src/app/supported-person-test/page.tsx
npm run build
```

Also confirm the route:

- contains no insert, update, upsert, delete, or RPC operation;
- uses the shared authenticated Supabase client;
- imports no service-role secret;
- queries no Johnny or Trust Engine data;
- remains labeled temporary and read-only.

## Frozen Future Tests

The following remain separate approval gates:

- denied write testing;
- administrator write testing;
- immutable-scope testing;
- cross-workspace relationship testing;
- pause and archive testing;
- cleanup or deactivation;
- route removal.

## Approval Status

```text
Authenticated read-test reconciliation prepared for review.
Controlled authentication users exist.
Controlled fixture installation is complete.
Synthetic profiles remain absent.
The temporary route has not been used for authenticated testing.
Authenticated RLS testing has not begun.
Johnny onboarding has not been approved.
Trust Engine synchronization has not been approved.
```

## Next Gate

Review and commit this reconciliation document.

After it is committed, run the route precondition checks.

Only after the route checks pass may explicit approval be requested for the six
authenticated read tests.
