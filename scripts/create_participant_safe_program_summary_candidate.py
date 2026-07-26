#!/usr/bin/env python3
from pathlib import Path

DOC = Path("docs/THRIVE_PARTICIPANT_SAFE_PROGRAM_SUMMARY_CANDIDATE_v0_1.md")

content = """# THRIVE Participant-Safe Program Summary Candidate v0.1

## Status

Review-only candidate.

This document proposes a narrow, read-only program summary for an authenticated supported person who already has a visible program participation.

This document does not authorize SQL, RLS changes, workspace membership, program creation, profile creation, service-role use, Johnny onboarding, Trust Engine synchronization, push, merge, or deployment.

## Verified Starting State

Synthetic supported person D currently has:

- supported-person ID: `71000000-0000-4000-8000-000000000009`
- participation ID: `71000000-0000-4000-8000-000000000010`
- program ID: `71000000-0000-4000-8000-000000000002`
- workspace ID: `71000000-0000-4000-8000-000000000001`
- participant role: `supported_person`
- participation status: `active`
- authenticated self-read of own supported-person row: allowed
- authenticated self-read of own participation row: allowed
- workspace-member visibility: not granted
- workspace-scoped program visibility through `/program-test`: not granted

The current RLS behavior correctly separates supported-person participation from workspace membership.

## Problem Statement

A supported person may reasonably need limited context about the program connected to their own participation.

The current workspace-member route is not appropriate for that purpose because it is designed around workspace visibility and administrator/member authority.

The candidate therefore proposes a separate participant-safe summary that:

- derives access only from the supported person's own visible participation;
- reveals only a minimal, approved subset of program information;
- does not grant workspace visibility;
- does not create program-management authority;
- does not expose other participants, staff, financial data, Trust Engine data, clinical information, recovery information, legal information, or private case data.

## Candidate Access Rule

A supported person may view a limited program summary only when all of the following are true:

1. the authenticated user is linked to a supported-person record;
2. that supported-person record has a visible participation row;
3. the participation belongs to the requested program;
4. the participation is in a visibility-eligible lifecycle state;
5. the program belongs to the same workspace recorded on that participation;
6. the request is read-only.

No workspace-membership row is created or inferred.

## Candidate Lifecycle Rule

Initial recommendation:

- `active` participation: summary visible
- `inactive` participation: summary hidden unless later approved for historical continuity
- `completed` participation: summary hidden in MVP unless later approved for historical continuity

This recommendation is provisional and must be reconciled against the live database and documented product intent.

## Minimum Candidate Fields

The summary should evaluate only the minimum fields needed for orientation:

- program ID
- program name
- program type
- program status, if such a field exists in the live schema
- brief participant-facing description, if such a field exists and is appropriate
- participation role
- participation status

The candidate should not assume that all listed fields exist.

## Fields Excluded by Default

Do not expose through this summary:

- workspace-member records
- workspace administration metadata
- program creator or internal owner identifiers
- staff assignments
- other participants
- internal notes
- financial transactions
- bank observations
- Trust Engine data
- clinical information
- recovery information
- legal information
- private case information
- service-role or internal authorization data
- audit metadata unless separately approved

## Candidate UI

Proposed route:

- `/supported-person-program-summary-test`

Proposed behavior:

- authenticated read-only page;
- displays the signed-in synthetic identity;
- loads the signed-in person's visible participation;
- resolves only the program connected to that participation;
- displays the minimum approved participant-safe fields;
- displays no create, update, archive, complete, delete, or membership controls;
- displays a clear boundary notice;
- performs no write when loaded or refreshed.

## Candidate Query Shape

Conceptual only, not executable SQL:

1. load the authenticated user's visible supported-person row;
2. load that supported person's visible participation;
3. obtain the participation's `program_id` and `workspace_id`;
4. request only the approved program fields for that exact `program_id`;
5. verify returned program workspace matches participation workspace;
6. return zero or one summary record.

The application must not request all programs and filter client-side.

## RLS Decision Boundary

Two possible implementation paths must be evaluated after live inspection.

### Path A: Current RLS Already Supports Exact Program Read

Use a UI-only candidate if the authenticated supported person can already read the exact program row connected to their visible participation.

Requirements:

- exact-row query only;
- no broader program list;
- no workspace membership;
- no policy change;
- read-only UI.

### Path B: Current RLS Does Not Support Exact Program Read

Prepare a separate review-only RLS candidate only if live testing proves the exact program row is not visible.

Any future policy candidate must:

- require a linked supported-person identity;
- require a matching visible participation;
- require matching `program_id`;
- require matching `workspace_id`;
- grant read only;
- grant no insert, update, delete, or workspace-member visibility;
- remain separate from Trust Engine authority.

No policy change is authorized by this document.

## Required Live Inspection Before Implementation

Inspect and document:

1. current `programs` table columns;
2. current `programs` constraints;
3. current `programs` indexes relevant to exact-row lookup;
4. current `programs` RLS policies;
5. whether person D can read program ID `71000000-0000-4000-8000-000000000002` directly;
6. whether the returned row contains fields unsuitable for participant display;
7. whether active, inactive, or completed participation should control visibility;
8. whether a participant-facing description already exists.

The database is truth. This candidate must be corrected if live findings differ.

## Test Matrix Candidate

### Positive

- person D sees exactly one summary for program `71000000-0000-4000-8000-000000000002`
- returned program workspace matches participation workspace
- participation role and status display correctly
- page performs no write

### Negative

- person D does not see unrelated programs
- person D does not see workspace-member data
- person D does not see other participants
- person D cannot create or modify a program
- supported person A cannot see D's program through D's participation
- outsider cannot see the summary
- support and viewer roles receive only authority already granted by their own policies

## Boundary Confirmation

This candidate does not authorize:

- SQL creation or execution
- RLS policy creation or modification
- database migration
- workspace membership creation
- program creation
- supported-person mutation
- participation mutation
- profile creation
- service-role access
- Johnny creation or onboarding
- explanation table creation
- Trust Engine synchronization
- delete
- push
- merge
- deployment

## Candidate Recommendation

Proceed first with a read-only live inspection and exact-row program visibility test as synthetic person D.

Prefer the UI-only path if current RLS already permits the exact program read.

Do not broaden access merely to make the page easier to build.

## Approval Status

- Review-only candidate created: yes
- Live `programs` schema inspected in this pass: no
- Live `programs` policies inspected in this pass: no
- Exact program read tested as person D in this pass: no
- Application route created: no
- SQL created: no
- SQL executed: no
- RLS changed: no
- Database write performed: no

## Exact Next Gate

Perform a read-only live inspection of the `programs` table and its policies, then test whether person D can read only program `71000000-0000-4000-8000-000000000002` through an exact-row authenticated query.

After that evidence is documented:

- choose UI-only implementation if the exact row is already visible;
- otherwise prepare a separate review-only RLS candidate.

Do not implement either path until the live findings are reconciled and separately approved.
"""

DOC.write_text(content, encoding="utf-8")
print(f"Wrote {DOC}")
print("Review-only candidate created.")
print("No database request was executed.")
