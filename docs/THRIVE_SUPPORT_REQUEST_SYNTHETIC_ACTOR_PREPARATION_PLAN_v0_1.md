# THRIVE Support Request Synthetic Actor Preparation Plan v0.1

## Status

Review-only candidate.

This document records the verified synthetic actors prepared for future browser-authenticated Support testing.

Do not activate Johnny, use a service-role client, enable the Support harness, execute synthetic tests, synchronize with the Trust Engine, deploy, merge, or push.

## Current verified checkpoint

- Current commit checkpoint: `a672c34`
- Support schema: permanently installed
- Forced RLS: enabled on all four Support tables
- Privilege hardening: installed and verified
- Browser-authenticated Support harness: committed and review-locked
- Harness execution flag:

```ts
export const SUPPORT_TEST_EXECUTION_ENABLED = false as const;
```

- Existing required actors ready: six of six
- Inactive Support actor: installed and reviewer-denial verified
- Support tables: no synthetic execution started

## Shared synthetic scope

Verified workspace:

```text
71000000-0000-4000-8000-000000000001
```

Verified participant program:

```text
71000000-0000-4000-8000-000000000002
```

Participant D, Participant A, the active Support member, the active admin, and the inactive Support member are aligned to this synthetic workspace.

The outsider has no supported-person identity, no program participation, and no workspace membership.

## Required actor reconciliation

### Participant D

**Status:** Ready for future testing.

| Field | Verified value |
|---|---|
| Actor label | Participant D |
| Email | `dstein561+thrive-onboarding-person-d@gmail.com` |
| Auth user ID | `d48b7268-9aa6-4498-a923-2851fd5232c9` |
| Supported-person ID | `71000000-0000-4000-8000-000000000009` |
| Workspace ID | `71000000-0000-4000-8000-000000000001` |
| Program ID | `71000000-0000-4000-8000-000000000002` |
| Supported-person status | `active` |
| Program participation status | `active` |
| Workspace member ID | Not applicable |
| Workspace role | Not applicable |
| Expected reviewer result | `false` |

**Planned purpose:**

- valid participant self-request creation;
- participant self-read;
- participant link creation while request is submitted;
- participant withdrawal;
- participant visibility proof;
- participant denial from reviewer-only paths.

### Participant A

**Status:** Ready for future testing.

| Field | Verified value |
|---|---|
| Actor label | Participant A |
| Email | `dstein561+thrive-rls-person-a@gmail.com` |
| Auth user ID | `9b283c6e-c2f8-4f87-9f90-fa081ee249bd` |
| Supported-person ID | `71000000-0000-4000-8000-000000000003` |
| Workspace ID | `71000000-0000-4000-8000-000000000001` |
| Program ID | `71000000-0000-4000-8000-000000000002` |
| Supported-person status | `active` |
| Program participation status | `active` |
| Workspace member ID | `d58b7b64-39d4-4be1-b683-bdd4a62e3a98` |
| Workspace role | `individual` |
| Membership status | `active` |
| Expected reviewer result | `false` |

**Planned purpose:**

- participant-to-participant isolation proof;
- valid self-only participant behavior;
- proof that active `individual` membership does not create Support reviewer authority.

### Outsider

**Status:** Ready for future testing.

| Field | Verified value |
|---|---|
| Actor label | outsider |
| Email | `dstein561+thrive-rls-outsider@gmail.com` |
| Auth user ID | `d89a6549-ac1a-431c-aff1-1ba7313175ab` |
| Supported-person ID | Not applicable |
| Workspace ID | Not applicable |
| Program ID | Not applicable |
| Workspace member ID | Not applicable |
| Expected reviewer result | `false` |

**Planned purpose:**

- no Support data visibility;
- no participant creation authority;
- no reviewer authority;
- no link, entry, or status-event access.

### Active same-workspace Support member

**Status:** Ready for future testing.

| Field | Verified value |
|---|---|
| Actor label | active same-workspace Support member |
| Email | `dstein561+thrive-rls-support@gmail.com` |
| Auth user ID | `7f0a7540-7a6d-4a1a-a29f-7a26c9571db9` |
| Workspace member ID | `cca88550-bac5-49b2-92a6-d5d9e19dd8ea` |
| Workspace ID | `71000000-0000-4000-8000-000000000001` |
| Member role | `support` |
| Membership status | `active` |
| Expected reviewer result | `true` |

**Planned purpose:**

- same-workspace reviewer recognition;
- lifecycle transitions;
- routing and assignment;
- participant response and internal-note creation;
- entry and link archival;
- workspace-boundary denial;
- no-delete proof.

### Active same-workspace admin

**Status:** Ready for future testing.

| Field | Verified value |
|---|---|
| Actor label | active same-workspace admin |
| Email | `dstein561+thrive-rls-admin@gmail.com` |
| Auth user ID | `3c0300e6-c4e9-4a84-b668-4a7e39593162` |
| Workspace member ID | `566f964c-9348-457f-88a6-d7e589250390` |
| Workspace ID | `71000000-0000-4000-8000-000000000001` |
| Member role | `admin` |
| Membership status | `active` |
| Expected reviewer result | `true` |

**Planned purpose:**

- admin reviewer equivalence;
- proof that broader admin role does not permit changing participant-authored content;
- same workspace and lifecycle restrictions as active Support;
- no cross-workspace or hard-delete authority.

### Inactive Support member

**Status:** Ready for future testing.

| Field | Verified value |
|---|---|
| Actor label | inactive or removed support member |
| Email | `dstein561+thrive-rls-inactive-support@gmail.com` |
| Auth user ID | `a3f99fb6-1642-413b-ae0e-595a9b91f8b2` |
| Workspace member ID | `bbe36c06-8856-485f-82ae-d48eb5eb9ded` |
| Workspace ID | `71000000-0000-4000-8000-000000000001` |
| Member role | `support` |
| Membership status | `inactive` |
| Verified reviewer result | `false` |

**Planned purpose:**

- prove inactive Support membership does not create reviewer authority;
- deny reviewer-only reads;
- deny request updates;
- deny entry insertion and archival;
- deny link archival;
- deny assignment authority.

## Additional verified actors

### Active viewer

This actor is not one of the six primary required actors, but remains useful for negative assignment and reviewer tests.

| Field | Verified value |
|---|---|
| Email | `dstein561+thrive-rls-viewer@gmail.com` |
| Auth user ID | `d3782ad5-8e99-4779-8928-0143bd567486` |
| Workspace member ID | `c0c81cc9-ebab-4017-997c-4fc3cabe9225` |
| Workspace ID | `71000000-0000-4000-8000-000000000001` |
| Member role | `viewer` |
| Membership status | `active` |
| Expected reviewer result | `false` |

### Spare participant

This actor may remain parked as an optional isolation actor.

| Field | Verified value |
|---|---|
| Email | `dstein561+thrive-rls-person-b@gmail.com` |
| Auth user ID | `28cecd10-43ed-4ae5-8668-31cfa515412c` |
| Supported-person ID | `71000000-0000-4000-8000-000000000004` |
| Workspace ID | `71000000-0000-4000-8000-000000000001` |
| Program ID | `71000000-0000-4000-8000-000000000002` |
| Workspace member ID | `2c634958-95ce-4db5-a54e-1a70cd0fa5d3` |
| Workspace role | `individual` |
| Membership status | `active` |

## Inactive Support actor installation record

The dedicated synthetic inactive Support actor was selected and installed after explicit approval.

Installed membership:

```text
workspace_id = 71000000-0000-4000-8000-000000000001
user_id = a3f99fb6-1642-413b-ae0e-595a9b91f8b2
member_role = support
status = inactive
```

Post-install verification confirmed:

```text
reviewer_result = false
```

No existing actor was deactivated or repurposed. No hard delete was used.

## Configuration mapping

All six verified actor IDs may now populate:

```text
src/app/support-test/supportTestConfig.ts
```

Do not store:

- passwords;
- tokens;
- service-role credentials;
- Johnny data;
- real participant or staff information.

All six verified actor IDs are now populated in the review-locked configuration. Harness execution remains disabled.

## Stop conditions

Stop immediately if:

- any real person or operational account would be reused;
- Johnny would be activated;
- the outsider would gain a workspace relationship;
- a service-role client is proposed for browser-access proof;
- passwords or tokens would be stored in source control;
- the inactive Support actor unexpectedly qualifies as reviewer;
- the scope expands into notifications, emergency workflow, external sharing, or Trust Engine synchronization.

## Exact next gate

Review the populated actor configuration and this updated preparation record, then commit only these two files if separately approved.

Do not enable the harness or execute synthetic Support tests.

## Pass closeout

- Build status: passed.
- `git diff --check`: clean.
- `git diff --cached --check`: clean before this replacement.
- Commit checkpoint: `a672c34`
- Actor reconciliation: all six required actors verified and configured.
- Inactive Support reviewer-denial proof: passed.
- Push, merge, deployment, synthetic execution, and additional database writes: none.
