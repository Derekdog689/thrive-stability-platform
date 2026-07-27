# THRIVE My Program v0.1 Validation

## Status

Validated as a review-only participant-facing candidate.

This document records the observed authenticated behavior of:

`/my-program-candidate`

No database write, SQL execution, RLS change, program mutation, participation mutation, workspace-membership change, route installation, navigation installation, Johnny change, Trust Engine synchronization, service-role use, delete, push, merge, or deployment occurred during this validation pass.

## Candidate under review

- Participant-facing title: `My Program`
- Candidate route: `/my-program-candidate`
- Candidate commit: `19b399e`
- Candidate purpose: show the signed-in supported person a clear summary of the active program connected through their own active participation
- Query posture: authenticated, participant-linked, read-only
- Output posture: participant-safe summary rather than administrative or raw-record output

## Required dependency

The candidate depends on the installed `programs` SELECT policy:

`programs_select_for_linked_supported_people`

The policy permits an authenticated supported person to read a program only when:

1. an active `program_participants` row links that supported person to the program;
2. the participation and program share the same workspace;
3. `is_supported_person_self(...)` confirms the signed-in user owns the linked supported-person identity.

The policy does not create workspace membership and does not grant general program-list access.

## Validation matrix

| Actor | Expected result | Observed result | Status |
|---|---|---|---|
| Synthetic supported person D | Own active participant-linked program summary visible | `SUPPORTED PERSON PROGRAM TEST` shown with active program and participation details | PASS |
| Synthetic supported person A | Own active participant-linked program summary visible | `SUPPORTED PERSON PROGRAM TEST` shown with active program and participation details | PASS |
| Controlled outsider | No participant-linked program visible | Participant-safe empty state shown | PASS |
| Controlled administrator | No supported-person participation assumed | Participant-safe empty state shown | PASS |

## Person D positive validation

Authenticated account:

`dstein561+thrive-onboarding-person-d@gmail.com`

Observed participant-facing content:

- Welcome name: `Onboarding Test D`
- Program name: `SUPPORTED PERSON PROGRAM TEST`
- Program type: `demo`
- Program status: `active`
- Participant role: `supported person`
- Participation status: `active`
- Participant-safe program description displayed

Not displayed:

- UUIDs
- raw JSON
- other participants
- workspace administration controls
- financial observations
- Trust Engine controls
- mutation controls

Result: PASS.

## Person A positive validation

Authenticated account:

`dstein561+thrive-rls-person-a@gmail.com`

Observed participant-facing content:

- Welcome name: `Test A`
- Program name: `SUPPORTED PERSON PROGRAM TEST`
- Program type: `demo`
- Program status: `active`
- Participant role: `supported person`
- Participation status: `active`
- Participant-safe program description displayed

Companion isolation checks also showed:

- shared controlled synthetic program: visible
- unrelated demo program: hidden
- Johnny program: hidden

Result: PASS.

## Outsider negative validation

Authenticated account:

`dstein561+thrive-rls-outsider@gmail.com`

Observed content:

`No active participant-linked program is available for this account.`

No program name, description, role, participation status, UUID, raw JSON, financial observation, or Trust Engine information was displayed.

Result: PASS.

## Administrator negative validation

Authenticated account:

`dstein561+thrive-rls-admin@gmail.com`

Observed content:

`No active participant-linked program is available for this account.`

The administrator was not silently treated as a supported-person participant and received no participant program summary.

Result: PASS.

## Participant-safe fields approved in this candidate

The current candidate exposes only:

- preferred participant name
- authenticated account email
- active program name
- participant-safe program description
- program type
- program status
- participant role
- participation status

## Fields and capabilities intentionally excluded

- supported-person UUID
- participation UUID
- program UUID
- workspace UUID
- creator identity
- timestamps
- raw database rows
- raw JSON
- other participants
- workspace administration
- program administration
- participant administration
- financial observations
- bank activity
- explanations
- Trust Engine data or controls
- legal, clinical, fiduciary, recovery, or diagnostic conclusions
- create, update, archive, complete, or delete actions

## Interpretation

The candidate demonstrates that a supported person can read a narrow summary of their own active participant-linked program without requiring workspace membership and without exposing unrelated programs.

This validation does not establish permission for future financial, explanation, consent, Trust Engine, reporting, or administrative features. Those remain separate gates.

## Build and repository checkpoint

At candidate creation:

- build passed
- static generation completed for 20 of 20 pages
- `git diff --check` was clean
- candidate commit: `19b399e Add review-only My Program v0.1 candidate`
- persistent untracked package: `docs/RENEWING/`
- `docs/RENEWING/` remained untouched

## Conclusion

My Program v0.1 passed the defined review matrix for:

- two valid supported-person participants;
- one authenticated outsider;
- one administrator without supported-person participation.

The candidate is eligible for a separate navigation and route-installation review. It is not yet installed as a permanent participant navigation destination.
