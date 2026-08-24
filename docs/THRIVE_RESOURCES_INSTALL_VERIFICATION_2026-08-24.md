# THRIVE Resources Install Verification

**Date:** 2026-08-24
**Repository:** `thrive-stability-platform`
**Branch:** `main`
**Status:** Installed and structurally verified; authenticated synthetic lifecycle test still pending

## Installed scope

The approved Resources package was installed into the live THRIVE Supabase project using the reconciled v0.2 installation candidate plus the v0.3 Support-link target correction.

Installed objects include:

- `resource_organizations`
- `resources`
- `resource_visibility`
- `resource_organization_roles`
- `resource_access_paths`
- `resource_guidance_sections`
- `resource_verifications`
- `resource_id` and `resource_access_path_id` on `support_request_links`
- Resources helper functions
- admin-only resource lifecycle RPCs
- Resources RLS policies and explicit authenticated grants
- strengthened participant Support-link policies

No seed resources, UI implementation, automatic referral, service-role pathway, or Trust Engine synchronization was installed.

## Live verification

Read-only verification after installation confirmed:

- all seven Resources tables exist;
- RLS is enabled on all seven Resources tables;
- force-RLS is not enabled in this version;
- all seven Resources tables contain zero rows;
- `support_request_links` contains both new resource columns;
- `support_request_links_exactly_one_target` now counts `resource_id` as the seventh valid primary target;
- the composite resource/access-path foreign key is live;
- expected Resources policies are present;
- expected helper/admin functions are present.

## Privilege verification

The authenticated role currently has:

- `SELECT` only on `resources`;
- no ordinary authenticated privilege on `resource_visibility`;
- participant/admin-governed `SELECT`, `INSERT`, and/or `UPDATE` only on the approved child/evidence tables;
- no Resources `DELETE` privilege.

The five admin lifecycle RPCs are executable by `authenticated` and not by `PUBLIC`. Each RPC performs its own workspace-admin authority check.

This preserves the v0.1 rule that canonical resource bootstrap and lifecycle changes are controlled through explicit admin RPCs rather than broad raw table writes.

## Support-link truth

The live `support_request_links_exactly_one_target` constraint now allows exactly one of:

- staged financial transaction;
- budget category;
- budget period;
- wellness check-in;
- goal;
- prior Support request;
- Resource.

`resource_access_path_id` is subordinate context, not an eighth primary target.

If an access path is present, the composite foreign key requires that it belongs to the same Resource recorded on the Support link.

## Synthetic testing status

A controlled authenticated synthetic lifecycle test was prepared to exercise:

- admin draft creation;
- paused initial visibility;
- organization/access-path/verification creation;
- activation;
- participant visibility;
- non-admin Support denial;
- participant denial.

The execution environment blocked that impersonated write transaction before it ran. No synthetic Resource rows were created and no partial synthetic test occurred.

Therefore:

- **schema installation:** PASS
- **structural verification:** PASS
- **privilege shape:** PASS
- **Resources tables remain empty:** PASS
- **authenticated role-by-role lifecycle test:** PENDING

The pending test should be completed through an authenticated application-compatible test surface rather than by bypassing the execution guardrail.

## Frozen boundaries

Still not authorized by this install:

- seed Resource records;
- participant Resources UI;
- admin Resources UI;
- automatic referrals;
- passive resource-view tracking;
- eligibility, diagnosis, legal, clinical, or fiduciary conclusions;
- Trust Engine synchronization;
- hard deletes.

## Exact next gate

Complete the controlled authenticated role-by-role Resources lifecycle test through an approved authenticated surface.

Only after that test passes should the project move to the first curated Resource candidate set and participant/admin UI design.
