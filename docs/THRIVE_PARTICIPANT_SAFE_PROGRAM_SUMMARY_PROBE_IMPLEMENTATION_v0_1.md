# THRIVE Participant-Safe Program Summary Probe Implementation v0.1

## Status

Review-only, read-only implementation candidate.

## Purpose

Test whether synthetic supported person D can read exactly the program row connected to their visible participation without workspace membership and without a broad program listing.

## Route

`/supported-person-program-summary-probe`

## Exact Target

- Program ID: `71000000-0000-4000-8000-000000000002`
- Workspace ID: `71000000-0000-4000-8000-000000000001`
- Supported-person ID: `71000000-0000-4000-8000-000000000009`
- Participation ID: `71000000-0000-4000-8000-000000000010`
- Auth user ID: `d48b7268-9aa6-4498-a923-2851fd5232c9`

## Query Boundary

The route performs three authenticated reads:

1. exact supported-person D row;
2. exact participation D row;
3. exact program row by both program ID and workspace ID.

It does not request all programs and does not filter a broad result client-side.

## Interpretation

- Non-null exact program row: current RLS supports a UI-only participant summary.
- Null exact program row without error: current RLS does not expose the row.
- Explicit error: capture the exact message and stop.

## Frozen Boundaries

No SQL, RLS change, workspace membership, program creation, supported-person mutation, participation mutation, profile creation, Johnny work, Trust Engine synchronization, service-role access, delete, push, merge, or deployment.

## Next Gate

Build and commit the read-only probe, sign in as synthetic supported person D, load the route, and capture the exact program response.

Do not create a policy candidate until the observed result is reconciled.
