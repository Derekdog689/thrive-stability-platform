# THRIVE My Program Navigation Renderer Inspection v0.1

## Verified result

The live participant-facing navigation renderer is:

`src/app/ThriveNavigation.tsx`

## Wiring observed

- `src/app/page.tsx` renders `ThriveSidebar`
- `src/app/ThriveSidebar.tsx` renders `ThriveNavigation`
- `src/app/ThriveNavigation.tsx` owns the `navItems` array and active-route behavior

## Current ordering

- Dashboard
- Budget
- Check-in
- Patterns
- Trust Mode
- Reports

## Reviewed patch candidate

The candidate inserts exactly one participant-facing navigation item after Dashboard and before Budget:

```ts
{ label: "My Program", href: "/my-program-candidate" },
```

Candidate artifact:

`docs/THRIVE_MY_PROGRAM_NAVIGATION_PATCH_CANDIDATE_v0_1.patch`

## Proposed installed ordering

- Dashboard
- My Program
- Budget
- Check-in
- Patterns
- Trust Mode
- Reports

## Source change

The reviewed candidate changes only:

`src/app/ThriveNavigation.tsx`

No existing navigation item is renamed, removed, or otherwise changed.

## Frozen boundaries

- no route renamed
- no database request
- no SQL or RLS change
- no program, participation, workspace, or supported-person mutation
- no Johnny change
- no Trust Engine synchronization
- no service-role use
- no push, merge, or deployment

## Validation state

- patch applicability check: passed
- patch application: passed
- production build: passed
- `/my-program-candidate` included in build: yes
- route rendering for controlled Person A: passed
- visual navigation ordering from dashboard: pending

## Exact next gate

Open the dashboard at `/`, verify that My Program appears after Dashboard and before Budget, then click My Program and confirm it opens `/my-program-candidate`. After that observation is confirmed, commit this corrected inspection document and the installed navigation source change together.
