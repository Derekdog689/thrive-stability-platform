# THRIVE Gate 4 - Role/Purpose Landing Candidate v0.1

Date: 2026-08-25
Status: REVIEW-ONLY CANDIDATE

## Purpose

Gate 4 gives each authenticated THRIVE identity the correct front door after login.

This candidate does not create new roles, new identities, new database tables, new memberships, or dual-role switching.

Frozen operating rule:

> One account has one purpose. One purpose has one intended landing.

THRIVE does not need an account-level role chooser or experience switcher for the current limited-live model.

---

## Verified current state

The live database already distinguishes the four limited-live identities correctly:

- Derek system identity -> active `admin` workspace membership.
- Derek ordinary identity -> active supported person / active program participant.
- Heidi reviewer identity -> active `support` workspace membership.
- Heidi ordinary identity -> active supported person / active program participant.

The access records are correct. The remaining issue is front-end landing behavior.

Current code behavior:

1. `/login` authenticates with Supabase.
2. Successful login always calls `router.push("/")`.
3. `/` is the participant Today page and immediately loads participant hooks.
4. `AuthGate` checks only signed-in versus signed-out state.
5. `/admin` and `/admin/support` already perform their own active admin/support membership checks through `useAdminAccess()`.

Therefore admin/support identities can authenticate correctly but still land on participant-shaped Today because the front door does not resolve account purpose.

---

## Frozen identity purpose model

### Derek system identity

Purpose: THRIVE system administration / maintenance.

Intended landing: `/admin`

It is not a participant identity.

### Derek ordinary identity

Purpose: ordinary THRIVE participant use.

Intended landing: `/`

It receives participant access from `supported_people` + active `program_participants`, not workspace admin membership.

### Heidi reviewer identity

Purpose: THRIVE Support reviewer / responder.

Intended landing: `/admin/support`

It is not a participant identity and does not need admin/system-maintenance authority.

### Heidi ordinary identity

Purpose: ordinary THRIVE participant use.

Intended landing: `/`

It receives participant access from `supported_people` + active `program_participants`.

---

## Smallest implementation architecture

Gate 4 should add one shared read-only purpose resolver rather than duplicate role logic across pages.

Conceptual result:

```text
signed-in user
    |
    +-- active workspace membership role = admin
    |       -> /admin
    |
    +-- active workspace membership role = support
    |       -> /admin/support
    |
    +-- active supported-person + active program participation
    |       -> /
    |
    +-- none of the above
            -> access-not-configured state
```

No account in the current limited-live model should satisfy more than one purpose branch by design.

If malformed data ever causes an identity to satisfy multiple branches, Gate 4 should fail closed or surface an access-configuration error rather than silently choosing a role.

---

## Proposed code changes

### 1. Add a shared account-purpose resolver

Candidate location:

`src/app/useThriveAccountPurpose.ts`

Responsibility:

- get the authenticated Supabase user;
- read active `workspace_members` rows for that user limited to `admin` / `support`;
- read the participant identity path for the same auth user;
- return one of:
  - `admin`
  - `support`
  - `participant`
  - `unconfigured`
  - `conflict`
  - `signed-out`
  - `checking`
  - `error`

This is read-only identity resolution. It must not create or mutate membership or participant records.

### 2. Change successful login routing

Current `/login` behavior always routes to `/`.

Candidate behavior after successful authentication:

- resolve account purpose;
- `admin` -> `/admin`;
- `support` -> `/admin/support`;
- `participant` -> `/`;
- `unconfigured` -> a clear access-not-configured state;
- `conflict` -> a clear access-configuration error;
- no automatic role selection.

### 3. Guard participant root `/`

The root Today page should not attempt to render participant hooks for an identity whose purpose is admin or support.

If an admin manually opens `/`, route to `/admin`.

If a support reviewer manually opens `/`, route to `/admin/support`.

Only a participant identity should continue into Today.

This protects bookmarked `/` URLs and installed-home-screen launches, not just fresh login redirects.

### 4. Preserve existing `/admin` and `/admin/support` authorization

The existing `useAdminAccess()` checks remain authoritative for the reviewer/admin surfaces during Gate 4.

Gate 4 should not weaken or bypass those checks.

The new purpose resolver is navigation/orientation, not authorization replacement.

---

## Admin and reviewer landing behavior

### Admin

`/admin` remains the current THRIVE Review/Admin landing for this gate.

No broad admin console redesign is included.

Future separation of system administration versus reviewer tools may be addressed by the later onboarding/admin UI gate.

### Support reviewer

A `support` identity should land directly at `/admin/support` because its sole current operating purpose is responding to participant Support requests.

This avoids an unnecessary reviewer dashboard step during limited-live validation.

---

## Installed-app / home-screen behavior

Because an installed PWA/home-screen icon may open `/` directly, Gate 4 must protect the root route in addition to changing the login redirect.

Expected behavior:

- participant home-screen launch -> Today;
- admin home-screen/root launch -> `/admin`;
- support reviewer home-screen/root launch -> `/admin/support`.

The browser/PWA launch mechanism does not determine authorization. The signed-in account purpose does.

---

## Explicitly out of scope

Gate 4 does not authorize:

- database schema changes;
- new auth users;
- new memberships;
- new supported people;
- program enrollment changes;
- dual-role accounts;
- account role switchers;
- Support lifecycle changes;
- Support RLS changes;
- participant feature redesign;
- full onboarding admin UI;
- synthetic fixture cleanup;
- My Story implementation.

---

## Candidate validation matrix

After implementation, validate all four real limited-live identities independently:

| Identity purpose | Expected root/login landing | Expected access |
| --- | --- | --- |
| Derek system admin | `/admin` | admin/review landing |
| Derek participant | `/` | participant Today |
| Heidi reviewer/support | `/admin/support` | Support Review queue |
| Heidi participant | `/` | participant Today |

Additional negative checks:

- participant manually opening `/admin` remains denied;
- participant manually opening `/admin/support` remains denied;
- reviewer manually opening `/` is redirected to `/admin/support`;
- admin manually opening `/` is redirected to `/admin`;
- unconfigured authenticated account does not receive participant fallback;
- malformed multi-purpose identity fails closed rather than receiving an arbitrary landing.

---

## Approval boundary

Approval of this candidate authorizes only the bounded Gate 4 implementation described above.

No database writes are required for Gate 4.
