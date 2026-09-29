# THRIVE Assisted Budget Setup Candidate v0.1

## Status

Review-only UX and lifecycle candidate. No database, RLS, RPC, Money lifecycle, or Trust Engine change is authorized by this file.

## Product intent

Reduce the effort required to get value without reducing participant control.

## Proposed lifecycle

1. Participant requests help building a budget.
2. Authorized admin/support worker prepares a starter plan from a blank plan or reusable template.
3. Prepared plan is marked as participant-review-needed and remains non-active.
4. Participant reviews the proposed money available amount, categories, estimates, and note.
5. Participant may accept the plan, change the plan, or leave it for later.
6. Only participant acceptance may advance the assisted draft into the participant's Money plan.
7. Acceptance should populate the participant-owned Money plan without requiring re-entry.

## Suggested starter templates

- Basic monthly plan
- Weekly spending plan
- First paycheck plan
- Limited-income starter plan
- Housing transition plan
- Back-to-work plan
- Blank plan

Templates provide structure only. They do not establish what the participant should spend.

## Provenance and uncertainty

An admin-prepared amount should preserve whether it is:
- participant-confirmed;
- estimate;
- participant unsure.

No estimate should be presented as a confirmed participant fact.

## Authority boundary

Admin/support may prepare structure and enter information explicitly supplied by the participant.

Admin/support may not silently activate the participant's budget or represent an estimate as participant-approved.

The participant retains the final action before the plan becomes active.

## Prototype routes

- Admin side: `/admin/assisted-budget-candidate`
- Participant side: `/budget/assisted-budget-candidate`

Both are UI-only candidate surfaces. They do not persist or activate records.

## Database reconciliation required before implementation

Live Supabase inspection is required before proposing:
- new assisted-draft fields/tables;
- relationships to Support requests;
- admin/support write RLS;
- participant review/accept RLS;
- conversion/activation RPC or transaction;
- audit/provenance events.

Supabase access was unavailable during this candidate pass, so no live-schema claims are made here.
