# Issue #68: Goals guidance continuity v0.1 | isolated verification gate

Status: **REVIEW ONLY**. Production schema and participant records are unchanged. Draft PR #74 must remain unmerged.

## Verified live baseline (read-only, 2026-10-11)

- `public.participant_goals` has immutable goal identity/scope columns, `progress_status` and `updated_at`; four guidance columns are not installed.
- Composite FKs bind goal to workspace, participant and program; creator FK references Auth with RESTRICT.
- RLS self SELECT/UPDATE requires `is_supported_person_self` and active program participation; participant UPDATE additionally requires `ownership_source = 'participant'`.
- Workspace admin SELECT/UPDATE has separate workspace-scoped access.
- `protect_participant_goal_scope()` forbids changing workspace, program, supported person, creator, ownership, and creation timestamp, and restricts archive transitions. The candidate leaves this trigger unchanged.

## Candidate

Migration: `supabase/migrations/20261012001000_goals_guidance_continuity_v0_1.sql`, FOUR nullable fields on the existing goal row. Goal UI retains the displayed title/body and choice after an explicit **Keep this guidance** action. A separate optional usefulness response is stored for the currently retained suggestion only. Changing saved guidance resets usefulness to NULL. No update to progress status.

## Required isolated database test (NOT YET RUN)

1. Use an independently authorized nonproduction Supabase project or an isolated disposable local PostgreSQL/Supabase instance with a representative copy of schema, RLS, functions, and constraints. **Do not clone, export or insert live participant personal data.** Use invented test identities explicitly labeled synthetic, only in the isolated environment.
2. Record pre-migration schema diff and migration checksum; apply candidate migration to the isolated instance only after explicit authorization of that environment and execution.
3. Verify four columns remain nullable for pre-existing synthetic goal rows and all original FKs/RLS/trigger remain unchanged.
4. Attempt valid guidance `example`, `smaller`, `think`; invalid choice; missing title/body; usefulness without guidance; all three feedback values; invalid feedback. Confirm consistency failures are rejected.
5. With isolated participant A / participant B authenticated contexts, verify A can update and retrieve only A's own active participant-owned goal, not B's or a staff-suggestion goal. Verify unauthorized unauthenticated requests are rejected. Confirm workspace admin privileges do not silently expand.
6. Confirm the application can save guidance, reload the Goals page in a fresh session, restore the exact saved title/body, save usefulness, reload again, and then replace the guidance and clear its old usefulness response.
7. Check that status, original next_step, workspace/program/person identity, archival state, and other fields remain unchanged throughout guidance/feedback operations. Confirm no Trust Engine tables or synchronization are referenced.
8. Record actual executed SQL results, browser observations, rollback plan and approval checkpoint. No merge or production rollout without separate approval.

## Risk and sequencing

- **Known preview incompatibility:** PR #74 currently queries four columns that are absent in production. The candidate preview is NOT an acceptable functional test against live production Supabase. Do not merge before schema installation and/or use a separately configured isolated preview.
- Scoped change ordering after future explicit authorization: isolated migration -> isolated data/RLS tests -> isolated app preview test -> approval for production migration -> production schema verification -> approval for app merge/deployment -> production verification.
- If checks fail, stop and revise the candidate on the branch. No destructive production cleanup, no service role, no live account insertion.

## Current evidence

- Candidate static tests and standalone Next.js CI build: passed on PR #74's candidate workflow.
- Vercel code build: passed.
- Isolated database migration, access and browser persistence tests: **NOT RUN**.
- Production migration/merge: **NOT AUTHORIZED**.
