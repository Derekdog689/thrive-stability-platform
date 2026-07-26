# THRIVE Supported-Person Identity Authenticated Write-Test Phases C-F Validation Report v0.1

## Status

Authenticated denied-write testing for W9 through W17 completed and verified.

This report covers:

- Phase C: W9-W10
- Phase D: W11-W12
- Phase E: W13-W14
- Phase F: W15-W17

W18 and W19 remain deferred.

## Fixed Scope

- Workspace ID: 71000000-0000-4000-8000-000000000001
- Program ID: 71000000-0000-4000-8000-000000000002
- Supported Person A ID: 71000000-0000-4000-8000-000000000003
- Participation A ID: 71000000-0000-4000-8000-000000000005
- Supported Person C ID: 71000000-0000-4000-8000-000000000007
- Participation C ID: 71000000-0000-4000-8000-000000000008

## Phase C: Controlled Support Member

Authenticated identity:

- Email: dstein561+thrive-rls-support@gmail.com
- User ID: 7f0a7540-7a6d-4a1a-a29f-7a26c9571db9
- Classification: Controlled support member

### W9 Support Member Attempts Supported-Person Update

- Expected: denied
- Observed: denied
- Returned rows: zero
- Result: PASS

The attempted preferred-name update affected no visible rows.

### W10 Support Member Attempts Participation Update

- Expected: denied
- Observed: denied
- Returned rows: zero
- Result: PASS

The attempted participation-status update affected no visible rows.

## Phase D: Controlled Viewer

Authenticated identity:

- Email: dstein561+thrive-rls-viewer@gmail.com
- User ID: d3782ad5-8e99-4779-8928-0143bd567486
- Classification: Controlled viewer member

### W11 Viewer Attempts Supported-Person Update

- Expected: denied
- Observed: denied
- Returned rows: zero
- Result: PASS

The attempted supported-person metadata update affected no visible rows.

### W12 Viewer Attempts Participation Update

- Expected: denied
- Observed: denied
- Returned rows: zero
- Result: PASS

The attempted participation-status update affected no visible rows.

## Phase E: Controlled Authenticated Outsider

Authenticated identity:

- Email: dstein561+thrive-rls-outsider@gmail.com
- User ID: d89a6549-ac1a-431c-aff1-1ba7313175ab
- Classification: Controlled authenticated outsider

Read visibility observed:

- Visible workspaces: zero
- Visible programs: zero

### W13 Outsider Attempts Supported-Person Insert

- Expected: denied
- Observed: denied
- Result: PASS
- Evidence: row-level security rejected the supported-person insert.

### W14 Outsider Attempts Participation Insert

- Expected: denied
- Observed: denied
- Result: PASS
- Evidence: row-level security rejected the participation insert.

## Phase F: Controlled Administrator Immutable-Scope Tests

Authenticated identity:

- Email: dstein561+thrive-rls-admin@gmail.com
- User ID: 3c0300e6-c4e9-4a84-b668-4a7e39593162
- Classification: Controlled administrator

### W15 Administrator Attempts Supported-Person Workspace Change

- Expected: denied
- Observed: denied
- Result: PASS
- Message: Supported-person workspace scope and creation lineage are immutable.

The attempted workspace reassignment was rejected.

### W16 Administrator Attempts Creation-Lineage Change

- Expected: denied
- Observed: denied
- Result: PASS
- Message: Supported-person workspace scope and creation lineage are immutable.

The attempted created_by reassignment was rejected.

### W17 Administrator Attempts Participation Scope Change

- Expected: denied
- Observed: denied
- Result: PASS
- Message: Program-participant identity and scope are immutable.

The attempted supported-person reassignment on the participation was rejected.

## Consolidated Authenticated Write-Test Matrix

- W1-W4 administrator permitted writes: 4 passed
- W5-W8 supported-person denied writes: 4 passed
- W9-W10 support-member denied writes: 2 passed
- W11-W12 viewer denied writes: 2 passed
- W13-W14 outsider denied inserts: 2 passed
- W15-W17 administrator immutable-scope tests: 3 passed

Total executed: 17
Total passed: 17
Total failed: 0

## Database Effects

Permitted synthetic changes:

- Supported Person C created
- Supported Person C permitted metadata updated
- Participation C created
- Participation C changed from active to inactive

Unauthorized changes applied:

- Supported-person inserts: zero
- Supported-person metadata changes: zero
- Participation inserts: zero
- Participation status changes: zero
- Workspace-scope changes: zero
- Creation-lineage changes: zero
- Participation identity or scope changes: zero

## Preserved Boundaries

- Johnny records involved: no
- Trust Engine records involved: no
- Real-person data involved: no
- Financial observations involved: no
- Clinical or recovery information involved: no
- Service-role access used: no
- Delete operations performed: no
- Hard deletes performed: no
- Push performed: no
- Merge performed: no
- Deployment performed: no

## Deferred Tests

W18 and W19 remain deferred and were not executed.

Their visibility or presence in planning documents does not constitute approval.

## Validation Conclusion

The authenticated write-test matrix through W17 passed.

The installed policies:

- allow the controlled administrator to perform approved routine synthetic writes;
- deny supported-person, support-member, viewer, and outsider write attempts;
- prevent administrator changes to immutable workspace, creation-lineage, participant-identity, and participant-scope fields.

## Current Synthetic State

Supported Person C:

- ID: 71000000-0000-4000-8000-000000000007
- Status: active
- Retained as controlled synthetic test evidence

Participation C:

- ID: 71000000-0000-4000-8000-000000000008
- Status: inactive
- Retained as controlled synthetic test evidence

No cleanup or disposition is authorized by this report.

## Next Gate

Perform a final read-only reconciliation of:

- Phase A report
- Phase B report
- this Phases C-F report
- installed policy behavior
- current synthetic fixture state

Do not execute W18 or W19.

Do not begin Johnny onboarding, Trust Engine synchronization, cleanup, push, merge, or deployment without separate explicit approval.
