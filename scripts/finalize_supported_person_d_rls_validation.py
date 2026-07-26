#!/usr/bin/env python3
from pathlib import Path

DOC = Path("docs/THRIVE_SUPPORTED_PERSON_D_READ_ONLY_RLS_VALIDATION_v0_1.md")

content = """# THRIVE Supported Person D Read-Only RLS Validation v0.1

## Status

Validation complete.

This pass documents authenticated, read-only Row Level Security behavior for synthetic supported person D.

No database write was performed during this validation.

## Verified Authentication Identity

- Email: `dstein561+thrive-onboarding-person-d@gmail.com`
- User ID: `d48b7268-9aa6-4498-a923-2851fd5232c9`
- Identity type: controlled synthetic supported person
- Authentication link previously established: yes

## Supported-Person Read Result

Route tested:

- `/supported-person-test`

Observed:

- visible supported-person row count: `1`
- visible supported-person ID: `71000000-0000-4000-8000-000000000009`
- display name: `SUPPORTED PERSON ONBOARDING TEST D`
- preferred name: `Onboarding Test D`
- workspace ID: `71000000-0000-4000-8000-000000000001`
- linked auth user ID: `d48b7268-9aa6-4498-a923-2851fd5232c9`
- external reference: `RLS-ONBOARDING-TEST-PERSON-D`
- status: `active`

No supported-person A, B, or C row was visible.

## Participation Read Result

Observed:

- visible participation row count: `1`
- participation ID: `71000000-0000-4000-8000-000000000010`
- supported-person ID: `71000000-0000-4000-8000-000000000009`
- program ID: `71000000-0000-4000-8000-000000000002`
- workspace ID: `71000000-0000-4000-8000-000000000001`
- participant role: `supported_person`
- status: `active`

No unrelated participation row was visible.

## Workspace and Program Visibility Result

Routes observed:

- application dashboard
- `/program-test`

Observed:

- visible workspace count: `0`
- selected workspace: none
- visible program records through the workspace-member route: `0`
- program creation authority established: no

The static program-type selector displayed available form values. That display does not establish visibility, membership, authority, or permission to create a program.

## RLS Interpretation

The observed behavior supports the following conclusions:

- synthetic supported person D can read their own supported-person identity;
- synthetic supported person D can read their own participation;
- synthetic supported person D cannot browse workspace-member records;
- synthetic supported person D cannot browse workspace-scoped programs through the administrator/member route;
- synthetic supported person D did not inherit administrator, support, viewer, or workspace-member authority from the auth link;
- the authentication link acts as a narrow self-access link rather than broad workspace authority.

## Boundary Confirmation

- Database write performed during this validation: no
- Supported-person record changed: no
- Participation changed: no
- Workspace membership created: no
- Program created: no
- Profile created: no
- Johnny record created: no
- Explanation table created: no
- Trust Engine synchronized: no
- Service-role access used: no
- Delete performed: no
- Push performed: no
- Merge performed: no
- Deployment performed: no

## Conclusion

Synthetic supported person D read-only RLS validation passed.

The current authenticated policy behavior correctly exposes only D's own supported-person row and D's own participation while withholding workspace-member and unrelated-record visibility.

## Next Steps

### Next Gate

Prepare a review-only participant-safe program summary candidate.

The candidate should determine whether a supported person may see a limited summary of the program attached to their own participation without becoming a workspace member and without receiving workspace-wide visibility.

### Candidate Scope

Review only:

- inspect the current `programs` table shape;
- inspect existing program read policies;
- identify the minimum fields that may be appropriate for participant-safe display;
- document the distinction between participation visibility and workspace membership;
- prepare a UI-only or policy candidate recommendation;
- do not execute SQL;
- do not change RLS;
- do not add workspace membership;
- do not create program records;
- do not touch Johnny;
- do not synchronize with the Trust Engine.

### Decision Questions

Before implementation, determine:

1. Which program fields are safe and useful for a supported person to see?
2. Should the summary be derived only through the person's active participation?
3. Should inactive or completed participation affect visibility?
4. Is an RLS policy change required, or can the current app safely derive the summary from existing visible participation data?
5. Should the program summary remain read-only in the MVP?

No production change is approved by this document.
"""

DOC.write_text(content, encoding="utf-8")
print(f"Wrote {DOC}")
print("No database request was executed.")
