# THRIVE Wellness Synthetic Person D Client-Path Activation Candidate v0.1

## Status

Review-only activation candidate. Test mode is off by default.

## Activation control

The candidate reads:

`NEXT_PUBLIC_THRIVE_WELLNESS_PERSON_D_TEST`

Writes are available only when:

1. the environment variable equals `true`;
2. the authenticated user is Person D;
3. the resolved supported person is Person D.

## Controlled identities

- Person D auth user:
  `d48b7268-9aa6-4498-a923-2851fd5232c9`
- Person D supported person:
  `71000000-0000-4000-8000-000000000009`

## Test sequence

1. confirm no active Person D check-in exists today;
2. enable the local environment flag;
3. restart the development server;
4. sign in as Person D;
5. save one synthetic check-in;
6. verify the saved state;
7. update the same-day check-in;
8. verify the refreshed saved state;
9. archive the row through the tester-admin path;
10. remove the environment flag;
11. restart the development server;
12. verify save is disabled again.

## Isolation

Person A, outsider, tester admin, and all other identities remain read-only in
the participant UI.

## Frozen boundaries

- Person D synthetic data only;
- no real participant data;
- no Johnny data;
- no Support request;
- no financial cross-reference;
- no Trust Engine synchronization;
- no push or deployment.

## Exact next gate

Static-review and commit this candidate with the environment flag absent.
Activation requires separate explicit approval.
