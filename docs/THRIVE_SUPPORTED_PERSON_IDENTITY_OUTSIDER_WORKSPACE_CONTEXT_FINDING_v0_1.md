# THRIVE Supported-Person Identity Outsider Workspace-Context Finding v0.1

## Status

Review-only finding.

This document records the source of the workspace UUID displayed during the
authenticated outsider read test.

It does not authorize route modification, storage clearing, write testing,
lifecycle changes, cleanup, Johnny onboarding, Trust Engine synchronization,
push, merge, or deployment.

## Governing Checkpoint

```text
Repository: thrive-stability-platform
Branch: main
Authenticated read-test validation commit: 2729d9c
```

## Observed Behavior

During authenticated read test R6, the controlled outsider saw:

```text
Workspace context:
71000000-0000-4000-8000-000000000001

Program context:
No program selected

Supported-person rows:
0

Participation rows:
0
```

The outsider had no membership in the controlled workspace.

## Read-Only Source Inspection

The temporary route defines these browser-storage keys:

```text
thrive:selectedWorkspaceId
thrive:selectedProgramId
```

During initialization, the route reads both values directly from
`window.localStorage`.

The route assigns the stored values to local React state and displays them as
the current workspace and program context.

The route does not query the `workspaces` table to confirm that the stored
workspace UUID is readable by the currently authenticated user before
displaying that UUID.

## Source Location

Relevant route:

```text
src/app/supported-person-test/page.tsx
```

Relevant behavior:

```text
Read stored workspace UUID from localStorage.
Read stored program UUID from localStorage.
Display stored values as route context.
Use stored values as optional filters on authenticated RLS queries.
```

## Explanation

The controlled workspace UUID remained in browser local storage from an earlier
authenticated test identity.

After the outsider signed in, the temporary route reused that stored UUID.

The stored UUID is browser state. Its display does not establish that the
outsider could read the corresponding workspace database row.

## RLS Result

The outsider received:

```text
Supported-person rows: 0
Participation rows: 0
```

No controlled supported-person identity or participation record was returned.

No Johnny, Trust Engine, financial, clinical, recovery, legal, or real-person
record appeared.

## Finding Classification

```text
RLS isolation failure: no
Protected-row exposure: no
Database write: no
Service-role use: no
Stale client-context display: yes
Potential UI confusion: yes
```

## Candidate Correction Direction

A future route candidate may validate browser-stored context against records
visible to the current authenticated user before displaying or using that
context.

Possible candidate behavior:

1. Query visible workspaces through the authenticated client.
2. Retain the stored workspace UUID only when it appears in the visible result.
3. Otherwise clear or ignore the stored workspace UUID.
4. Apply the same validation to the stored program UUID.
5. Continue relying on RLS as the database access boundary.

This document does not select or install a correction.

## Boundary Statement

A displayed transaction, identifier, or client-side context value does not by
itself establish access authority, intent, ownership, or database visibility.

The observed workspace UUID was browser context, not proof of workspace access.

## Conclusion

Authenticated outsider read isolation passed.

The workspace UUID displayed during R6 came from stale local-storage context,
not from a protected workspace row returned to the outsider.

The issue is limited to temporary-route context presentation and should be
handled through a separately reviewed UI correction candidate.

## Next Gate

Review and commit this finding.

After that documentation checkpoint, prepare a review-only temporary-route
context-validation candidate.

Do not modify the route during this finding gate.
