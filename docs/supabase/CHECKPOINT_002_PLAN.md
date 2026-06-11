# THRIVE Checkpoint 002 Plan

## Checkpoint Name

Auth-Aware Workspace Testing

## Purpose

Checkpoint 002 will verify that THRIVE can move from mock-only dashboard behavior into controlled Supabase-backed behavior without exposing private or sensitive data.

## Core Goal

Confirm that the app can safely recognize an authenticated Supabase user and create or read only that user's authorized workspace records.

## Scope

This checkpoint may include:

- Supabase Auth configuration review
- Auth status display in the app
- Controlled test login or test session flow
- Workspace bootstrap function testing through authenticated app context
- Read-only workspace display after authentication
- Mock/test workspace records only

## Out of Scope

This checkpoint will not include:

- Real financial data
- Real trust records
- Real beneficiary records
- Real bank imports
- Receipt uploads
- Document storage
- Production onboarding
- Service role automation
- Multi-user support circles
- Plaid, MX, Finicity, or Teller integration

## Security Rules

- Use mock/test data only.
- Do not weaken the bootstrap function to make SQL Editor testing easier.
- Do not expose service role keys in the browser.
- Do not commit `.env.local`.
- Use authenticated user context for workspace creation testing.
- Keep RLS enabled on all user-facing tables.

## Success Criteria

Checkpoint 002 is complete when:

1. The app can show whether Supabase is configured.
2. The app can show whether a user is authenticated.
3. A test authenticated user can create one workspace through the approved bootstrap function.
4. The created workspace automatically assigns that user as admin.
5. The app can read and display the user's assigned workspace.
6. The build passes.
7. The changes are committed and pushed.

## Current Status

Not started.

## Next Technical Step

Review the current Supabase Auth setup and decide whether to use email/password, magic link, or temporary development-only test auth for the first controlled app test.