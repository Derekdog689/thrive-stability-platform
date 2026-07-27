# THRIVE Supported-Person Program Isolation Test Route v0.1

## Status

Temporary read-only test route.

## Route

`/supported-person-program-negative-tests`

## Actor

Synthetic supported person D:

- Auth UUID: `d48b7268-9aa6-4498-a923-2851fd5232c9`

## Exact Reads

The page performs three exact-ID reads against `public.programs`:

1. Person D linked program:
   - `71000000-0000-4000-8000-000000000002`
   - expected: visible
2. Unrelated demo program:
   - `477ccd11-510f-4d85-8367-be9020f219f5`
   - expected: hidden
3. Johnny program:
   - `f67f14a2-6666-44d6-99d4-dbb2678a2863`
   - expected: hidden

## Boundary

No broad program list query is performed.

No create, update, delete, membership, service-role, Johnny mutation, or Trust Engine path exists.

## Next Gate

Build and commit the temporary route, load it while signed in as synthetic person D, and capture all three results.

Do not proceed to other identities until Person D isolation passes.
