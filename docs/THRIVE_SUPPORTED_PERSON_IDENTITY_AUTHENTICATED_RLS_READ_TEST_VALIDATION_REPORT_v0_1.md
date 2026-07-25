# THRIVE Supported-Person Identity Authenticated RLS Read-Test Validation Report v0.1

## Status

Authenticated read-only RLS testing completed and verified.

This report documents the six approved authenticated read tests through the
temporary `/supported-person-test` route.

It does not authorize:

- insert, update, upsert, delete, or RPC testing;
- lifecycle changes;
- fixture cleanup;
- profile creation;
- Johnny onboarding;
- Trust Engine access or synchronization;
- route modification or removal;
- push, merge, or deployment.

## Governing Checkpoint

```text
Repository: thrive-stability-platform
Branch: main
Authenticated read-test reconciliation commit: b4d926a
Execution checkpoint at test completion: 86bcbb9
```

## Controlled Database State

The authenticated tests used only the previously installed synthetic fixtures:

```text
Controlled workspace: 1
Active workspace memberships: 5
Outsider memberships: 0
Controlled program: 1
Controlled supported people: 2
Controlled participation records: 2
Synthetic profiles: 0
```

No fixture record was inserted, updated, archived, completed, or deleted during
the authenticated read-test pass.

## Approved Test Scope

The approved pass was limited to:

- controlled synthetic authentication;
- use of `/supported-person-test`;
- authenticated read queries;
- screenshots and evidence capture.

The tests ran in this order:

1. Administrator
2. Supported person A
3. Supported person B
4. Support member
5. Viewer member
6. Authenticated outsider

## Expected Access Matrix

| Test | Actor | Expected supported people | Expected participation |
|---|---|---:|---:|
| R1 | Administrator | 2 | 2 |
| R2 | Supported person A | 1, A only | 1, A only |
| R3 | Supported person B | 1, B only | 1, B only |
| R4 | Support member | 0 | 0 |
| R5 | Viewer member | 0 | 0 |
| R6 | Outsider | 0 | 0 |

## R1 Administrator

```text
Email: dstein561+thrive-rls-admin@gmail.com
User UUID: 3c0300e6-c4e9-4a84-b668-4a7e39593162
Workspace role: admin

Expected supported-person rows: 2
Observed supported-person rows: 2

Expected participation rows: 2
Observed participation rows: 2

Visible supported people:
SUPPORTED PERSON TEST A
SUPPORTED PERSON TEST B

Visible participation records:
71000000-0000-4000-8000-000000000005
71000000-0000-4000-8000-000000000006

Result: PASS
```

Before the controlled administrator test, the route was briefly opened under an
existing real application session. That session returned zero protected rows
and was excluded from the controlled RLS result as an invalid setup attempt.

## R2 Supported Person A

```text
Email: dstein561+thrive-rls-person-a@gmail.com
User UUID: 9b283c6e-c2f8-4f87-9f90-fa081ee249bd
Workspace role: individual
Linked supported-person UUID:
71000000-0000-4000-8000-000000000003

Expected supported-person rows: 1, A only
Observed supported-person rows: 1, A only

Expected participation rows: 1, A only
Observed participation rows: 1, A only

Visible supported person:
SUPPORTED PERSON TEST A

Visible participation:
71000000-0000-4000-8000-000000000005

Result: PASS
```

Person B was not visible.

## R3 Supported Person B

```text
Email: dstein561+thrive-rls-person-b@gmail.com
User UUID: 28cecd10-43ed-4ae5-8668-31cfa515412c
Workspace role: individual
Linked supported-person UUID:
71000000-0000-4000-8000-000000000004

Expected supported-person rows: 1, B only
Observed supported-person rows: 1, B only

Expected participation rows: 1, B only
Observed participation rows: 1, B only

Visible supported person:
SUPPORTED PERSON TEST B

Visible participation:
71000000-0000-4000-8000-000000000006

Result: PASS
```

Person A was not visible.

## R4 Support Member

```text
Email: dstein561+thrive-rls-support@gmail.com
User UUID: 7f0a7540-7a6d-4a1a-a29f-7a26c9571db9
Workspace role: support

Expected supported-person rows: 0
Observed supported-person rows: 0

Expected participation rows: 0
Observed participation rows: 0

Result: PASS
```

## R5 Viewer Member

```text
Email: dstein561+thrive-rls-viewer@gmail.com
User UUID: d3782ad5-8e99-4779-8928-0143bd567486
Workspace role: viewer

Expected supported-person rows: 0
Observed supported-person rows: 0

Expected participation rows: 0
Observed participation rows: 0

Result: PASS
```

## R6 Authenticated Outsider

```text
Email: dstein561+thrive-rls-outsider@gmail.com
User UUID: d89a6549-ac1a-431c-aff1-1ba7313175ab
Workspace role: none
Controlled workspace membership: none

Expected supported-person rows: 0
Observed supported-person rows: 0

Expected participation rows: 0
Observed participation rows: 0

Program context: no program selected
Result: PASS
```

### R6 UI-Context Observation

The temporary route displayed the controlled workspace UUID:

```text
71000000-0000-4000-8000-000000000001
```

The outsider had no controlled workspace membership, no program selection, and
no visible supported-person or participation records.

This is recorded as a route-context observation rather than an RLS isolation
failure. No route change is authorized by this report.

## Consolidated Results

| Test | Actor | Expected people / participation | Observed | Result |
|---|---|---|---|---|
| R1 | Administrator | 2 / 2 | 2 / 2 | PASS |
| R2 | Supported person A | 1 / 1, A only | 1 / 1, A only | PASS |
| R3 | Supported person B | 1 / 1, B only | 1 / 1, B only | PASS |
| R4 | Support member | 0 / 0 | 0 / 0 | PASS |
| R5 | Viewer member | 0 / 0 | 0 / 0 | PASS |
| R6 | Outsider | 0 / 0 | 0 / 0 | PASS |

## Boundary Verification

During the six-test pass:

- no write control was used;
- no insert, update, upsert, delete, or RPC was performed;
- no fixture lifecycle state changed;
- no profile row was created;
- no Johnny record appeared;
- no Trust Engine record appeared;
- no real-person, financial, clinical, recovery, or legal record appeared;
- no service-role access was used.

## Validation Conclusion

The authenticated read-only RLS proof passed all six controlled identity tests.

The administrator could read both controlled supported people and participation
records.

Each linked supported person could read only their own identity and
participation.

Support, viewer, and outsider identities received no supported-person or
participation rows.

The installed RLS policies therefore passed the approved authenticated
read-isolation matrix for this test scope.

## Frozen Future Gates

This validation does not approve:

- administrator write testing;
- denied write testing;
- immutable-scope testing;
- cross-workspace relationship testing;
- pause or archive testing;
- cleanup or deactivation;
- authentication-account cleanup;
- temporary route modification or removal;
- Johnny onboarding;
- Trust Engine synchronization.

## Approval Status

```text
Authenticated read tests completed: 6
Authenticated read tests passed: 6
Authenticated read tests failed: 0
Database writes during testing: 0
Synthetic profiles created: 0
Johnny records involved: 0
Trust Engine records involved: 0
```

## Next Gate

Review and commit this authenticated read-test validation report.

After that documentation checkpoint, choose the next separate candidate gate.

No write testing, lifecycle action, cleanup, or route modification is authorized
during this report gate.
