# THRIVE Supported-Person Identity Authenticated Write-Test Outsider Exception v0.1

## Status

Documentation-only exception candidate approved for creation and review.

This document resolves a narrow contradiction in the committed temporary
write-test route candidate.

It does not authorize:

- creation of the temporary write-test route;
- authenticated database writes;
- successful outsider writes;
- SQL execution;
- RLS policy changes;
- schema changes;
- lifecycle changes;
- cleanup;
- Johnny records;
- Trust Engine access or synchronization;
- profile creation;
- push, merge, or deployment.

## Verified Starting State

```text
Repository: thrive-stability-platform
Branch: main
Checkpoint: 86c5d63

Authenticated read tests: passed
Temporary route context validation: passed
Authenticated write-test candidate: committed
Temporary write-test route candidate: committed
Write-test route created: no
Database writes authorized: no
```

## Governing Artifacts
docs/THRIVE_SUPPORTED_PERSON_IDENTITY_AUTHENTICATED_WRITE_TEST_CANDIDATE_v0_1.md
docs/THRIVE_SUPPORTED_PERSON_IDENTITY_TEMPORARY_WRITE_TEST_ROUTE_CANDIDATE_v0_1.md
docs/THRIVE_SUPPORTED_PERSON_IDENTITY_AUTHENTICATED_RLS_READ_TEST_VALIDATION_REPORT_v0_1.md
docs/THRIVE_SUPPORTED_PERSON_IDENTITY_TEMPORARY_ROUTE_CONTEXT_VALIDATION_REPORT_v0_1.md
Problem Being Resolved

The route candidate requires write-test controls to remain disabled when the
authenticated actor cannot see the controlled workspace or program.

That rule is correct for ordinary authorized-user tests.

The controlled outsider is intentionally unable to see the controlled
workspace or program through RLS.

However, tests W13 and W14 are intended to prove that the outsider also cannot
insert or update protected supported-person and participation records.

Without a narrow exception, the route would disable those two tests before the
requests could reach the RLS boundary.

Important Distinction

The outsider does not receive workspace or program access.

The exception permits only a fixed denied-write attempt to be submitted so the
database can prove that it rejects the request.

A browser-displayed UUID or source-code constant does not establish workspace
visibility, membership, ownership, or authority.

## Narrow Outsider Exception

The controlled outsider may access only:

W13: outsider supported-person insert or update denial test
W14: outsider participation insert or update denial test

For W13 and W14:

the route must use fixed, reviewed synthetic fixture identifiers;
fixture identifiers must come from committed source constants;
local storage must not supply authority or test identifiers;
the outsider must not enter, edit, or select identifiers;
the outsider must not receive a generic payload editor;
the outsider must not receive workspace or program records;
the outsider must not receive any other write-test action;
the expected result must be clearly labeled as denied;
the authenticated Supabase client must submit the request;
RLS must remain the final authorization boundary;
service-role access must not be used.
Required User-Facing State

When authenticated as the controlled outsider, the route should clearly show:

Workspace visibility: denied as expected
Program visibility: denied as expected
Available write tests: W13 and W14 only
Expected result: database denial

The route must not imply that the fixed workspace or program identifiers are
visible or authorized resources.

Authorized Member Rule

All non-outsider actors must still pass authenticated workspace and program
visibility validation before any applicable write-test control is enabled.

This exception must not weaken that rule.

## Failure Stop Rules

Stop immediately if:

the outsider can see a protected workspace or program row;
the outsider can choose or modify fixture identifiers;
the outsider can access a generic write interface;
the outsider can run any action other than W13 or W14;
either outsider request succeeds;
service-role access is used;
an RLS policy is bypassed or disabled;
any Johnny, Trust Engine, financial, clinical, recovery, legal, or private
case information appears;
any unexpected database change occurs.
## Candidate Scope Summary

```text
Documentation-only exception: yes
Route implementation authorized: no
Authenticated writes authorized: no
Successful outsider writes authorized: no
Database writes authorized: no
RLS changes authorized: no
Schema changes authorized: no
Generic editor authorized: no
Johnny records authorized: no
Trust Engine access authorized: no
```

## Approval Status

```text
Narrow outsider exception documented for review.
Temporary write-test route has not been created.
No authenticated write request has been submitted.
No database record has been changed.
No lifecycle action has been taken.
No cleanup action has been taken.
Johnny onboarding has not been approved.
Trust Engine synchronization has not been approved.
```

## Next Gate

Review and commit this documentation-only outsider exception.

After that checkpoint, explicit approval may be requested to implement only:

src/app/supported-person-write-test/page.tsx

Route implementation must follow both the committed route candidate and this
narrow outsider exception.

No authenticated write execution is authorized by committing this document.
