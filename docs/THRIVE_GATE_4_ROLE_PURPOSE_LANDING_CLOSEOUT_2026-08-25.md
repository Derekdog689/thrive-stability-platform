# THRIVE Gate 4 - Role/Purpose Landing Closeout

Date: 2026-08-25
Status: CLOSED / runtime-validated on phone

## Purpose

Gate 4 gave each authenticated limited-live THRIVE identity the correct front door while preserving the operating rule:

> One account has one purpose. One purpose has one intended landing.

No dual-role chooser or experience switcher was introduced.

## Verified limited-live identity model

- Derek system/admin identity -> active `admin` membership in `THRIVE Personal Stability` -> intended landing `/admin`.
- Derek ordinary identity -> active supported person / active program participant -> intended landing `/`.
- Heidi reviewer/support identity -> active `support` membership in `THRIVE Personal Stability` -> intended landing `/admin/support`.
- Heidi ordinary identity -> active supported person / active program participant -> intended landing `/`.

## Implemented behavior

Gate 4 added a shared read-only account-purpose resolver and participant front-door routing.

The resolver:

- checks the current Supabase browser session;
- treats a missing session as normal signed-out state;
- scopes admin/support membership resolution to the real `THRIVE Personal Stability` workspace;
- resolves admin, support, participant, unconfigured, conflict, signed-out, and error states;
- fails closed on malformed multi-purpose identity state.

Participant-facing `AuthGate` now prevents admin/support identities from falling into participant Today.

Expected routing:

- admin -> `/admin`;
- support -> `/admin/support`;
- participant -> participant THRIVE `/`;
- signed-out -> protected access / login path;
- conflict or unconfigured -> explicit access state rather than participant fallback.

Existing `/admin` and `/admin/support` authorization remains separately enforced through reviewer/admin access checks. Navigation/orientation does not replace authorization.

## Auth-session correction

Initial Gate 4 runtime testing exposed a front-door bug:

`Auth session missing!`

Cause:

The account-purpose resolver called `auth.getUser()` before confirming that the current browser origin had a Supabase session and treated the missing-session result as an error.

Correction:

The resolver now calls `auth.getSession()` first.

- no session -> signed out;
- session present -> resolve account purpose;
- actual auth/data error -> error state.

This also preserves sane behavior when Vercel deployment-specific URLs do not share the same local browser auth session as the normal production domain.

## Runtime validation observed on phone

Observed after deployment:

### Heidi reviewer/support

- THRIVE Review loaded successfully;
- displayed `Role: support`;
- Support queue opened successfully;
- real workspace queue displayed an appropriate empty state when no real limited-live requests existed.

### Derek admin

- THRIVE Review/Admin landing loaded successfully;
- displayed `Role: admin`;
- Support queue entry remained available.

### Participant identities

Derek and Heidi ordinary participant identities had already been verified on the participant Today experience during limited-live onboarding.

## Scope preserved

Gate 4 did not:

- change database schema;
- change memberships;
- create supported people;
- change program participation;
- create auth users;
- change Support lifecycle or RLS;
- introduce dual-role accounts;
- build the Supported People admin UI;
- build Resources admin maintenance UI;
- modify synthetic fixtures;
- implement My Story.

## Relevant commits

- `7b69af6a6fb5d9a91f9e9ae5c2b54553ee41374b` - Gate 4 role-purpose landing candidate
- `37a98574d6126fd66f330389ea2609cda23afe63` - add THRIVE account purpose resolver
- `17e119e7a3e6ad6c22e74faa22c535c161fc5738` - route THRIVE identities to intended experience
- `b1e53a4b486e8d147760175710a3193de992759e` - scope reviewer access to real THRIVE workspace
- `157265c87cd2598d541a9f0096cf055f30f3e85d` - treat missing auth session as signed out

## Closeout

Gate 4 is CLOSED for its approved scope.

Further work on Admin / Review belongs to the next product gate and should focus on actual administrative operating surfaces rather than authentication-role reconstruction.
