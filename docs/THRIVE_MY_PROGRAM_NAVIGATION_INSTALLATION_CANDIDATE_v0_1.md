# THRIVE My Program Navigation Installation Candidate v0.1

## Status

Review-only installation candidate.

No navigation file, route name, database object, policy, or production deployment is changed by this document.

## Purpose

Provide the smallest participant-facing navigation affordance that allows a signed-in supported person to open their validated My Program summary.

## Verified prerequisite

The review-only route:

`/my-program-candidate`

has passed validation for:

- synthetic supported person D;
- synthetic supported person A;
- controlled outsider;
- controlled administrator.

Validation is documented in:

`docs/THRIVE_MY_PROGRAM_V0_1_VALIDATION.md`

## Proposed participant-facing affordance

- Label: `My Program`
- Destination during first installation pass: `/my-program-candidate`
- Audience: authenticated users
- Display behavior: the route itself determines whether an active participant-linked program is available
- Mutation behavior: none
- Administrative controls: none

## Smallest safe installation candidate

The first installation pass should change only the participant-facing navigation component that currently renders the dashboard navigation.

Based on the earlier code inspection, likely review targets include:

- `src/app/ThriveNavigation.tsx`
- `src/app/ThriveSidebar.tsx`

The live file must be inspected immediately before editing. Only the component actually responsible for the visible navigation should be changed.

## Proposed navigation placement

Place `My Program` directly after `Dashboard` and before `Budget`.

Proposed order:

1. Dashboard
2. My Program
3. Budget
4. Check-in
5. Patterns
6. Trust Mode
7. Reports

Reasoning:

- My Program is foundational identity and participation context.
- It should be easier to find than downstream tools.
- It should not be buried among future financial or reporting functions.
- The label is plain language and does not expose internal terms such as participation, RLS, workspace, or supported-person identity.

## Proposed first-pass destination

Use:

`/my-program-candidate`

for the initial navigation installation.

Do not rename or move the route in the same pass.

Keeping the validated route unchanged allows navigation behavior to be tested independently from route migration. Route promotion can occur in a later, separate gate after the link is proven.

## Candidate navigation item

Conceptual candidate only:

```tsx
{
  label: "My Program",
  href: "/my-program-candidate",
}
```

The actual implementation must match the existing navigation component's current structure and styling. Do not introduce a new navigation system or broaden the component.

## Expected behavior by actor

### Supported person D

Selecting `My Program` should show the validated active program summary for Onboarding Test D.

### Supported person A

Selecting `My Program` should show the validated active program summary for Test A.

### Controlled outsider

Selecting `My Program` should show the participant-safe empty state.

### Administrator

Selecting `My Program` should show the participant-safe empty state unless the administrator separately has a supported-person identity and active participation.

## Explicit non-goals

This installation candidate does not authorize:

- changing `/my-program-candidate` to `/my-program`;
- deleting or archiving the candidate route;
- changing SQL or RLS;
- granting workspace membership;
- creating or changing programs;
- creating or changing participation;
- creating conditional navigation based on hidden database assumptions;
- adding financial observations;
- adding Trust Engine controls;
- adding reports;
- adding explanation records;
- changing Johnny;
- deploying or pushing.

## Test plan after a separately approved navigation edit

1. Build the application.
2. Confirm `git diff --check` is clean.
3. Sign in as Person D.
4. Confirm `My Program` appears in navigation.
5. Open it and confirm Person D's validated summary.
6. Sign in as Person A.
7. Confirm the same link opens Person A's validated summary.
8. Sign in as outsider.
9. Confirm the link opens the safe empty state.
10. Sign in as administrator.
11. Confirm the link opens the safe empty state.
12. Confirm Dashboard, Budget, and existing navigation still work.
13. Confirm no write request occurs.
14. Commit only after all four actor checks pass.

## Rollback plan

Because the proposed installation is one navigation item only, rollback should consist of removing that single item and rebuilding.

No database rollback should be required because this candidate proposes no database change.

## Route-promotion gate after navigation validation

Only after the navigation link passes should a separate candidate consider:

- creating permanent route `/my-program`;
- preserving or redirecting `/my-program-candidate`;
- updating the navigation destination;
- updating validation documentation;
- removing candidate language from the participant-facing page.

That later route-promotion pass requires separate approval.

## Approval checkpoint

Approval of this document would authorize only:

- inspect the current live navigation implementation;
- prepare the smallest code patch adding `My Program`;
- build and present the patch for review.

Approval of this document would not authorize push, merge, deployment, route rename, SQL, RLS, database writes, Johnny work, or Trust Engine synchronization.

## Recommended next gate

Inspect the current navigation renderer and prepare a one-item navigation patch candidate targeting `/my-program-candidate`.

Do not install the patch until the exact diff is reviewed and explicitly approved.
