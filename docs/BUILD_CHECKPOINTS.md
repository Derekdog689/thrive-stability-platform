# THRIVE Build Checkpoints

## Checkpoint 001: Clean Foundation

Date: 2026-06-10

Commit:
`12dce2f`

Status:
Stable foundation confirmed.

Completed:
- Next.js application builds successfully.
- GitHub repository is connected and synced.
- Clean Supabase project selected.
- Legacy database decision documented.
- Clean schema plan documented.
- Initial schema SQL draft created.
- Supabase client package installed.
- Public Supabase environment variables added locally.
- `.env.local` remains private and ignored.
- `.env.example` is committed as a safe template.
- Dashboard now displays Supabase environment status.

Security posture:
- No real financial, trust, beneficiary, clinical, recovery, or personally identifying data should be used during early development.
- Mock/test data only.
- Supabase connection is limited to public anon client configuration.
- No service role key is used in the app.
- No real database queries are active in the UI yet.

Current application state:
- The dashboard is mock-data driven.
- Supabase environment status is visible.
- The app does not yet authenticate users.
- The app does not yet create or read workspace records from Supabase.

Next recommended milestone:
Checkpoint 002 should add a controlled authenticated test path or a mock workspace UI layer before connecting real workspace data.

## Checkpoint 003: Auth-Aware Dashboard Entry Point Complete

Stable truth:

- `npm run build` passed.
- `src/app/AuthStatusPanel.tsx` was created.
- `src/app/page.tsx` now displays authenticated dashboard status.
- `/login` works.
- `/workspace-test` works.
- Local commit succeeded.
- Push to GitHub succeeded.
- Current commit: `fc98447 Add auth-aware dashboard status panel`.

Security boundary:

- THRIVE remains mock/test only.
- No real financial, trust, beneficiary, clinical, recovery, or personally identifying data should be entered during this stage.
- Test workspaces may exist only as development records used to prove authentication and RLS behavior.

## Checkpoint 004: Auth-Protected App Shell Complete

Stable truth:

- `npm run build` passed.
- `src/app/AuthGate.tsx` was created.
- `src/app/page.tsx` now wraps the dashboard in `AuthGate`.
- Signed-in users can view the THRIVE dashboard.
- Signed-out users are shown a protected access message and login link.
- `/login` remains available for authentication testing.
- `/workspace-test` remains available for authenticated workspace and RLS testing.
- Local commit succeeded.
- Push to GitHub succeeded.
- Current commit: `7f09539 Add auth-protected app shell`.

Security boundary:

- THRIVE remains mock/test only.
- No real financial, trust, beneficiary, clinical, recovery, or personally identifying data should be entered during this stage.
- This checkpoint protects the app shell visually and behaviorally, but full server-side route protection and role-based authorization are still future work.

## Checkpoint 005: Workspace Selection Foundation Complete

Stable truth:

- `npm run build` passed.
- `src/app/WorkspaceContextPanel.tsx` was created.
- `src/app/page.tsx` now displays the workspace context panel below the dashboard header.
- The panel checks the current Supabase session before loading workspace records.
- The panel loads only workspace records visible to the authenticated user through Supabase RLS.
- The panel allows selection of a visible workspace.
- `/login` remains available for authentication testing.
- `/workspace-test` remains available for authenticated workspace and RLS testing.
- Local commit succeeded.
- Push to GitHub succeeded.
- Current commit: `c62f7f1 Add workspace context panel`.

Security boundary:

- THRIVE remains mock/test only.
- No real financial, trust, beneficiary, clinical, recovery, or personally identifying data should be entered during this stage.
- Workspace selection is a foundation layer only. It does not yet load protected financial, trust, beneficiary, clinical, recovery, or case records.
- Test workspaces may exist only as development records used to prove authentication, workspace membership, and RLS behavior.

## Checkpoint 006: Selected Workspace Persistence Complete

Stable truth:

- `npm run build` passed.
- `src/app/WorkspaceContextPanel.tsx` now persists the selected workspace ID in browser `localStorage`.
- The selected workspace is restored after page refresh when it remains visible to the authenticated user through Supabase RLS.
- If the saved workspace is no longer visible, the panel safely falls back to the first visible workspace.
- Workspace selection remains browser-local only.
- `/login` remains available for authentication testing.
- `/workspace-test` remains available for authenticated workspace and RLS testing.
- Local commit succeeded.
- Push to GitHub succeeded.
- Current commit: `775c39e Persist selected workspace context`.

Security boundary:

- THRIVE remains mock/test only.
- No real financial, trust, beneficiary, clinical, recovery, or personally identifying data should be entered during this stage.
- Local workspace persistence stores only a workspace ID in the browser.
- This checkpoint does not load protected financial, trust, beneficiary, clinical, recovery, or case records.

## Checkpoint 007: Workspace-Scoped Dashboard Shell Complete

Stable truth:

- `npm run build` passed.
- `src/app/WorkspaceContextPanel.tsx` now broadcasts the selected workspace ID using the browser event `thrive:selectedWorkspaceChanged`.
- The selected workspace ID is broadcast when workspace context first loads.
- The selected workspace ID is broadcast when the user changes the active workspace.
- The selected workspace ID remains persisted in browser `localStorage`.
- This creates the browser-side foundation for workspace-scoped dashboard behavior.
- `/login` remains available for authentication testing.
- `/workspace-test` remains available for authenticated workspace and RLS testing.
- Local commit succeeded.
- Push to GitHub succeeded.
- Current commit: `552d95e Broadcast selected workspace context`.

Security boundary:

- THRIVE remains mock/test only.
- No real financial, trust, beneficiary, clinical, recovery, or personally identifying data should be entered during this stage.
- This checkpoint broadcasts only a selected workspace ID in the browser.
- This checkpoint does not load protected financial, trust, beneficiary, clinical, recovery, or case records.
- Full server-side route protection and role-based authorization remain future work.

## Checkpoint 008: Dashboard Workspace Listener Complete

Stable truth:

- `npm run build` passed.
- `src/app/DashboardWorkspaceScope.tsx` was created.
- `src/app/page.tsx` now displays the dashboard workspace scope panel below the workspace context panel.
- The dashboard scope panel listens for the browser event `thrive:selectedWorkspaceChanged`.
- The dashboard scope panel reads the persisted selected workspace ID from browser `localStorage`.
- Changing the active workspace updates the dashboard scope display immediately.
- This confirms the dashboard shell can react to selected workspace context.
- `/login` remains available for authentication testing.
- `/workspace-test` remains available for authenticated workspace and RLS testing.
- Local commit succeeded.
- Push to GitHub succeeded.
- Current commit: `aa19fb0 Add dashboard workspace scope listener`.

Security boundary:

- THRIVE remains mock/test only.
- No real financial, trust, beneficiary, clinical, recovery, or personally identifying data should be entered during this stage.
- This checkpoint displays only the selected workspace ID.
- This checkpoint does not load protected financial, trust, beneficiary, clinical, recovery, or case records.
- Full server-side route protection and role-based authorization remain future work.


## Checkpoint 013: Program RLS App Test Complete

Stable truth:

* `public.programs` table was created in Supabase.
* `public.programs` has RLS enabled.
* Program RLS policies were confirmed in Supabase:

  * `programs_insert_for_workspace_admins`
  * `programs_select_for_workspace_members`
  * `programs_update_for_workspace_admins`
* `public.create_program_for_workspace(...)` exists as a security definer function.
* `/program-test` was created as the application-based program RLS test page.
* `npm run build` passed.
* `/program-test` appears in the successful Next.js build route list.
* A mock/test program was created through the authenticated application path.
* Program records loaded through authenticated RLS.
* Local commit succeeded.
* Push to GitHub succeeded.
* Current commit: `d34818b Add program RLS app test page`.

Security boundary:

* THRIVE remains mock/test only.
* The program test page is for RLS verification only.
* No real financial, trust, beneficiary, clinical, recovery, or personally identifying data should be entered.
* Program records are organizational support lanes only.
* Program creation does not create legal, clinical, fiduciary, credit repair, bankruptcy, investment, or crisis-service authority.
* Full program integration into dashboard workflows remains future work.