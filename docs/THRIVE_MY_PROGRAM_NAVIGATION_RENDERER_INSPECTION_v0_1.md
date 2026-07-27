# THRIVE My Program Navigation Renderer Inspection v0.1

## Result

The live navigation renderer was identified, but the script did not find a supported exact insertion pattern.

- Renderer: `src/app/ThriveSidebar.tsx`
- Identification basis: ThriveSidebar is imported or rendered by page/layout wiring.
- Source files changed: none
- Patch created: no

## Wiring observed

- `src/app/page.tsx` references `ThriveSidebar`

## Required manual review

Open `src/app/ThriveSidebar.tsx` and locate the existing `Dashboard` and `Budget` entries. The intended candidate is exactly one participant-facing item between them:

- Label: `My Program`
- Destination: `/my-program-candidate`

Do not change any other navigation item, route, database object, SQL policy, or participant record.
