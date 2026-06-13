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
- Current commit: `d34818b Add program RLS app test page`.

Security boundary:

* THRIVE remains mock/test only.
* The program test page is for RLS verification only.
* No real financial, trust, beneficiary, clinical, recovery, or personally identifying data should be entered.
* Program records are organizational support lanes only.
* Program creation does not create legal, clinical, fiduciary, credit repair, bankruptcy, investment, or crisis-service authority.
* Full program integration into dashboard workflows remains future work.

## Checkpoint 014: Program Context Dashboard Integration Complete

Stable truth:

- `src/app/ProgramContextPanel.tsx` was created.
- `ProgramContextPanel` loads active programs for the selected workspace through Supabase RLS.
- Program selection is browser-local only.
- Selected program ID is persisted in browser `localStorage`.
- Selected program context is broadcast using the browser event `thrive:selectedProgramChanged`.
- `src/app/page.tsx` now displays the program context panel below the workspace context panel.
- The dashboard now shows the active workspace context and active program context before mock dashboard data.
- `npm run build` passed.
- Local commit succeeded.
- Push to GitHub succeeded.
- Current commit: `4df2e23 Add program context to dashboard`.

Security boundary:

- THRIVE remains mock/test only.
- Program context does not load real financial, trust, beneficiary, clinical, recovery, or private case records.
- Program selection does not create legal, clinical, fiduciary, credit repair, bankruptcy, investment, or crisis-service authority.
- Program context is an organizational support layer only.
- Future protected records must still be built with table-level RLS and app-based access testing.

## Checkpoint 015: Dashboard Program Listener Complete

Stable truth:

- `src/app/DashboardProgramScope.tsx` was created.
- `DashboardProgramScope` listens for the browser event `thrive:selectedProgramChanged`.
- `DashboardProgramScope` reads the selected program ID from browser `localStorage`.
- `src/app/page.tsx` now displays the program dashboard scope below the workspace dashboard scope.
- The dashboard visually confirms the active selected program ID.
- The dashboard now has both workspace-level and program-level listening proof.
- `npm run build` passed.
- Local commit succeeded.
- Push to GitHub succeeded.
- Current commit: `57de3bb Add dashboard program scope listener`.

Security boundary:

- THRIVE remains mock/test only.
- Dashboard program listening does not load protected records.
- Program context remains an organizational support layer only.
- No real financial, trust, beneficiary, clinical, recovery, or personally identifying data is authorized at this layer.
- Future protected tables must still be created with RLS, tested through authenticated app paths, and documented before use.

## Checkpoint 017: Budget Categories SQL Draft Complete

Stable truth:

- `docs/supabase/BUDGET_CATEGORIES_PLAN.md` was created.
- `docs/supabase/BUDGET_CATEGORIES_SQL_DRAFT.sql` was created.
- The budget category layer is planned as workspace-scoped and program-scoped.
- Budget categories include protected, flexible, support, and reserve category types.
- Budget categories include planned, spent, and remaining amount fields.
- The SQL draft includes RLS enablement.
- The SQL draft includes select policy for authenticated workspace members.
- The SQL draft includes insert/update policy for workspace admins.
- The SQL draft includes a program/workspace validation helper.
- The SQL draft includes a controlled creation function for app-based testing.
- `npm run build` passed before this checkpoint.
- The SQL draft was committed and pushed to GitHub.
- Current commit: `a7cb16e Add budget categories SQL draft`.

Security boundary:

- THRIVE remains mock/test only.
- No real financial, trust, beneficiary, clinical, recovery, or personally identifying data is authorized at this layer.
- Budget categories are planning and visibility tools only.
- Budget categories do not create legal, clinical, fiduciary, credit repair, bankruptcy, investment, or crisis-service authority.
- No live Supabase budget category SQL has been executed yet.
- Budget category RLS must be tested through authenticated app paths before future protected records rely on this layer.

Next required step:

- Create `docs/supabase/BUDGET_CATEGORIES_RLS_TEST_PLAN.md` before running budget category SQL in Supabase.

## Checkpoint 018: Budget Categories SQL Executed in Supabase

Stable truth:

- The budget category SQL draft was executed in the THRIVE Supabase project.
- Supabase returned success with no rows returned, which is expected for schema SQL.
- `public.budget_categories` now exists.
- The `budget_categories` table is currently empty.
- RLS policies were created for budget categories.
- The following policies were verified:
  - `budget_categories_insert_for_workspace_admins`
  - `budget_categories_select_for_workspace_members`
  - `budget_categories_update_for_workspace_admins`
- The following functions were verified:
  - `create_budget_category_for_program`
  - `is_program_in_workspace`
  - `set_budget_categories_updated_at`
- The select policy was hardened before execution to require both workspace membership and program/workspace validation.
- No budget category records were created during SQL execution.
- No real financial, trust, beneficiary, clinical, recovery, or personally identifying data was entered.

Security boundary:

- Budget categories remain mock/test only.
- Budget categories are planning and visibility tools only.
- Budget categories do not create legal, fiduciary, clinical, credit repair, bankruptcy, investment, or crisis-service authority.
- RLS must still be proven through the authenticated application path before dashboard cards or protected workflows rely on this table.
- No service role key is used in the client application.

Next required step:

- Create a temporary app route at `src/app/budget-test/page.tsx` to test budget category creation and visibility through authenticated Supabase RLS.


## Checkpoint 019: Budget Category RLS App Proof Complete

Stable truth:

- The temporary app route `src/app/budget-test/page.tsx` was created.
- `npm run build` passed with `/budget-test` included in the route list.
- The budget test page loaded successfully at `/budget-test`.
- The page authenticated the signed-in Supabase user.
- The page loaded visible workspaces through authenticated RLS.
- The correct workspace was selected:
  - `b0cad5e3-8b0-40aa-adf8-9f75f6a092b5`
- The correct active program was selected:
  - `477ccd11-510f-4d85-8367-be9020f219f5`
- The page created mock/test budget categories through the controlled Supabase RPC function:
  - `create_budget_category_for_program`
- The page reloaded and displayed budget categories through authenticated RLS.
- Four mock/test categories were created and displayed:
  - Housing
  - Food
  - Flexible Spending
  - Emergency Reserve
- Remaining amounts calculated correctly.
- The app proof was committed and pushed to GitHub.
- Current commit: `2ea7814 Add budget category RLS app test page`.

Security boundary:

- Budget category testing used mock/test records only.
- No real financial, trust, beneficiary, clinical, recovery, or personally identifying data was entered.
- The test page is a temporary RLS proof route, not the final production budget UI.
- Budget categories remain planning and visibility tools only.
- THRIVE does not create legal, fiduciary, clinical, credit repair, bankruptcy, investment, or crisis-service authority.
- DSS may support organization and reporting, while authorized decision-makers remain responsible for final decisions.

Next required step:

- Decide whether to keep `/budget-test` as a temporary development route or later remove/hide it before production rollout.
- Begin planning the real budget dashboard integration using the proven `budget_categories` layer.


## Checkpoint 020: Budget Dashboard Integration Complete

Stable truth:

- The real dashboard at `src/app/page.tsx` was connected to live mock budget category data.
- A new component was created:
  - `src/app/BudgetCategoriesDashboardCard.tsx`
- The old static `protectedCategories` array was removed from the dashboard.
- The dashboard budget card now reads from `public.budget_categories`.
- Budget category records load through authenticated Supabase RLS.
- Budget category records are scoped by:
  - selected workspace ID
  - selected program ID
- The dashboard listens to existing browser-local workspace and program context.
- `/budget-test` remains a temporary development proof route.
- `npm run build` passed.
- Browser smoke test confirmed the dashboard displayed:
  - Housing
  - Food
  - Flexible Spending
  - Emergency Reserve
- The checkpoint was committed and pushed to GitHub.
- Current commit: `2dba9c5 Integrate live budget categories into dashboard`.

Security boundary:

- The dashboard uses mock/test budget records only.
- No real financial, trust, beneficiary, clinical, recovery, or personally identifying data was entered.
- Budget categories remain planning, organization, reporting, and visibility support tools only.
- THRIVE does not provide legal advice, fiduciary decision-making, clinical services, credit repair, bankruptcy advice, investment advice, or crisis intervention.
- DSS supports organization and reporting; authorized decision-makers remain responsible for final decisions.

Next required step:

- Improve login flow so successful sign-in redirects users to the main dashboard.


## Checkpoint 021: Login Redirect to Dashboard Complete

Stable truth:

- `src/app/login/page.tsx` was updated to use Next.js router navigation.
- Successful Supabase email/password sign-in now redirects users from `/login` to `/`.
- The login page still supports sign-in, sign-up, and sign-out during MVP development.
- The main dashboard remains the correct post-login destination.
- `npm run build` passed.
- Browser smoke test confirmed:
  - user can sign out
  - user can sign back in
  - successful sign-in redirects to `/`
- The checkpoint was committed and pushed to GitHub.
- Current commit: `b73c7f7 Redirect login to dashboard after sign in`.

Security boundary:

- Authentication remains Supabase email/password for MVP testing.
- No role-based dashboard routing has been added yet.
- All authenticated users currently land on the same main dashboard.
- No real beneficiary, trust, clinical, financial, recovery, or private case data should be entered during testing.

Next required step:

- Improve the live budget category dashboard card so it is clearer for human use.


## Checkpoint 022: Budget Category Dashboard Card Usability Complete

Stable truth:

- `src/app/BudgetCategoriesDashboardCard.tsx` was updated for clearer dashboard language.
- The card title changed from `Protected categories` to `Budget categories`.
- The section label changed to `Budget guardrails`.
- The card now explains that live mock budget categories are loaded through authenticated Supabase RLS for the selected workspace and program.
- Each category now displays:
  - planned amount
  - spent amount
  - remaining amount
- The card continues to load live mock records from `public.budget_categories`.
- The card continues to scope records by selected workspace and selected program.
- `npm run build` passed.
- Browser smoke test confirmed the dashboard card displayed the updated budget category layout.
- The checkpoint was committed and pushed to GitHub.
- Current commit: `8a2caf3 Improve budget category dashboard card`.

Security boundary:

- Budget category data remains mock/test only.
- Budget category information is for planning, organization, reporting, and visibility support only.
- THRIVE does not create legal, fiduciary, clinical, credit repair, bankruptcy, investment, or crisis-service authority.
- DSS remains a support and reporting layer only.

Next required step:

- Wire the dashboard sidebar so navigation labels accurately reflect current MVP route status.


## Checkpoint 023: Dashboard Sidebar Navigation States Complete

Stable truth:

- `src/app/page.tsx` was updated to import `Link` from `next/link`.
- A `navItems` array was added to define the dashboard sidebar navigation state.
- The sidebar now treats `Dashboard` as the active route to `/`.
- Future feature areas are visibly marked as `Soon`:
  - Budget
  - Check-in
  - Patterns
  - Trust Mode
  - Reports
- Temporary development proof routes are not exposed in the main sidebar:
  - `/budget-test`
  - `/workspace-test`
  - `/program-test`
- `npm run build` passed.
- Browser smoke test confirmed the sidebar renders accurate navigation states.
- The checkpoint was committed and pushed to GitHub.
- Current commit: `a9df004 Wire dashboard sidebar navigation states`.

Security boundary:

- Sidebar navigation does not expose development proof routes as user-facing workflows.
- Future feature routes remain parked until intentionally built.
- THRIVE remains an MVP planning, organization, reporting, and visibility support tool.
- No legal, fiduciary, clinical, credit repair, bankruptcy, investment, or crisis-service authority is created by navigation labels.

Next required step:

- Create a real `/budget` route shell before changing the sidebar Budget item from `Soon` to an active link.
