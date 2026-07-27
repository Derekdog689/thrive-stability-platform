# THRIVE My Program v0.1 Review Candidate

## Status

Review-only candidate.

No navigation integration, database write, SQL execution, RLS change, push, merge, or deployment is performed by this generator.

## Verified Starting State

- Synthetic participant-safe program access validation is complete.
- Checkpoint commit before this candidate: `835c39a`.
- W18 and W19 remain deferred.
- `docs/RENEWING/` remains outside this work.
- Johnny and the Trust Engine remain frozen.

## Local Source Inspection

The generator inspected these repository paths:

- `src/app/page.tsx`: present, 275 lines; supabase=3, ThriveSidebar=3
- `src/app/ThriveNavigation.tsx`: present, 63 lines; ThriveNavigation=1, navigation=2, href==1
- `src/app/ThriveSidebar.tsx`: present, 35 lines; ThriveNavigation=3, ThriveSidebar=1
- `src/app/DashboardProgramScope.tsx`: present, 58 lines; DashboardProgramScope=1
- `src/app/DashboardWorkspaceScope.tsx`: present, 61 lines; workspace=5
- `src/app/ProgramContextPanel.tsx`: present, 315 lines; programs=12, supabase=4, workspace=14
- `src/app/supported-person-program-summary-probe/page.tsx`: present, 265 lines; programs=1, program_participants=1, supabase=6, workspace=3, href==1
- `src/app/supported-person-program-negative-tests/page.tsx`: present, 256 lines; programs=1, supabase=4, workspace=2, href==1

## Candidate Route

`/my-program-candidate`

The route is intentionally parked and not linked from the main navigation.

## Read Path

The candidate uses the authenticated Supabase client and performs:

1. self lookup in `supported_people` by `auth_user_id`
2. first active self-visible row in `program_participants`
3. exact active program lookup in `programs`

All reads depend on the existing authenticated RLS path.

## Participant-Facing Fields

- participant preferred/display name
- program name
- program type
- program status
- participant role
- participation status
- participant-safe program description

## Intentionally Excluded

- UUID display
- raw JSON
- workspace administration
- other participants
- creator fields
- financial observations
- Trust Engine controls
- create, update, delete, archive, or membership actions
- service-role access

## Candidate Limitation

The current schema can support more than one participation, but v0.1 displays the earliest active self-visible participation only.

This is a deliberate small-scope candidate. Multi-program selection is not included.

## Review Matrix

### Person D

Expected:

- My Program loads
- shared controlled synthetic program is visible
- active participant role/status are visible
- no UUIDs or raw JSON appear

### Person A

Expected:

- My Program loads
- shared controlled synthetic program is visible
- active participant role/status are visible

### Outsider

Expected:

- no active participant-linked program message
- no program data appears

### Administrator

Not a participant-facing acceptance actor for v0.1.

## Frozen Boundaries

- no Johnny mutation
- no Trust Engine synchronization
- no financial data
- no service-role use
- no navigation installation
- no test-route deletion
- no W18 or W19 execution
- no push, merge, or deployment

## Next Gate

Build and inspect `/my-program-candidate` under Person D, Person A, and outsider.

Do not add it to `ThriveNavigation` or `ThriveSidebar` until the review matrix passes and installation is explicitly approved.
