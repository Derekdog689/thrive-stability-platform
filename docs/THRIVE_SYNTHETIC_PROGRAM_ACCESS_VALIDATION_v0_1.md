# THRIVE Synthetic Program Access Validation v0.1

## Status

Completed and verified.

## Verified State

The participant-linked `SELECT` policy on `public.programs` is installed.

Installed policy:

`programs_select_for_linked_supported_people`

The policy permits authenticated supported persons to read only programs connected through their own active participation.

## Security Preconditions Verified

- `public.is_supported_person_self(uuid)` is `SECURITY DEFINER`.
- Function `search_path` is configured as `public`.
- `anon` cannot create objects in `public`.
- `authenticated` cannot create objects in `public`.
- `PUBLIC` cannot create objects in `public`.
- Database-owner creation privileges remain intact.

## Person D Validation

Authenticated identity:

- Email: `dstein561+thrive-onboarding-person-d@gmail.com`
- Auth UUID: `d48b7268-9aa6-4498-a923-2851fd5232c9`

Observed:

- own supported-person row visible
- own active participation visible
- shared controlled synthetic program visible
- unrelated demo program hidden
- Johnny program hidden
- errors: none

Result: passed.

## Person A Validation

Authenticated identity:

- Email: `dstein561+thrive-rls-person-a@gmail.com`
- Auth UUID: `9b283c6e-c2f8-4f87-9f90-fa081ee249bd`

Observed:

- own supported-person row visible
- own active participation visible
- shared controlled synthetic program visible
- unrelated demo program hidden
- Johnny program hidden
- errors: none

Person A and Person D each hold separate active participation rows for the same controlled synthetic program.

Result: passed.

## Outsider Validation

Authenticated identity:

- Email: `dstein561+thrive-rls-outsider@gmail.com`
- Auth UUID: `d89a6549-ac1a-431c-aff1-1ba7313175ab`

Observed:

- zero visible workspaces
- zero visible programs on the dashboard
- shared controlled synthetic program hidden
- unrelated demo program hidden
- Johnny program hidden
- errors: none

Result: passed.

## Administrator Regression Validation

Authenticated identity:

- Email: `dstein561+thrive-rls-admin@gmail.com`
- Auth UUID: `3c0300e6-c4e9-4a84-b668-4a7e39593162`

Observed through the existing administrator/workspace-member path:

- controlled workspace visible
- shared controlled synthetic program visible
- no create action used
- no regression observed

Result: passed.

## Boundaries Preserved

- no workspace membership created
- no program row changed
- no participation row changed
- no supported-person row changed
- no Johnny record changed
- no Trust Engine synchronization
- no service-role use
- no delete
- no push
- no merge
- no deployment

## Write-Test Status

Authenticated write tests W1 through W17 were completed previously.

W18 and W19 remain deferred.

This validation does not authorize or execute W18 or W19.

## Build and Repository Checkpoint

- application build: passed
- static pages generated: 19 of 19
- participant isolation route present
- `git diff --check`: expected clean
- expected remaining status: `?? docs/RENEWING/`
- pre-validation commit checkpoint: `043af41`

## Conclusion

The synthetic participant-safe program read path is validated.

Active supported persons can see only programs connected through their own active participation. Unrelated programs and Johnny's program remain hidden. Outsiders receive no workspace or program visibility. Existing administrator access remains functional.

## Next Gate

Reconcile the exact purpose, payload, expected denial, rollback behavior, and stop conditions for deferred authenticated write tests W18 and W19.

Do not execute W18 or W19 until that review is complete and separately approved.

After the write-boundary decision, begin the participant-facing `My Program` product slice.
