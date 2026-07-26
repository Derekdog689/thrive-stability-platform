# THRIVE Synthetic Program Participation D Candidate v0.1

## Status

Review-only implementation candidate.

Approved scope:

- design the synthetic program-participation creation step for supported person D;
- define the exact fixed payload;
- define the administrator-only route behavior;
- define validation and regression checks;
- prepare the application-code candidate;
- perform local build and static validation.

Not approved in this checkpoint:

- executing the participation insert;
- creating an authentication user;
- creating or modifying Johnny;
- creating explanation data;
- synchronizing with the Trust Engine;
- using service-role access;
- pushing, merging, or deploying.

## Verified Starting State

Synthetic supported person D already exists.

- Supported-person ID: `71000000-0000-4000-8000-000000000009`
- Workspace ID: `71000000-0000-4000-8000-000000000001`
- Authentication user ID: `null`
- Display name: `SUPPORTED PERSON ONBOARDING TEST D`
- Preferred name: `Onboarding Test D`
- Status: `active`
- External reference: `RLS-ONBOARDING-TEST-PERSON-D`
- Created by: `3c0300e6-c4e9-4a84-b668-4a7e39593162`

The `CREATE-D` action passed and is documented at commit `567bcde`.

## Frozen Boundaries

THRIVE and the Trust Engine remain independent systems.

This candidate uses synthetic data only.

No real financial observations, clinical information, recovery information, legal information, private case data, or Johnny-specific data may be introduced.

No generic editor, delete action, automatic retry, service-role access, or cross-workspace mutation may be added.

## Proposed Synthetic Participation

Reserved participation ID:

`71000000-0000-4000-8000-000000000010`

Fixed payload:

```json
{
  "id": "71000000-0000-4000-8000-000000000010",
  "workspace_id": "71000000-0000-4000-8000-000000000001",
  "program_id": "71000000-0000-4000-8000-000000000002",
  "supported_person_id": "71000000-0000-4000-8000-000000000009",
  "participant_role": "supported_person",
  "status": "active",
  "created_by": "3c0300e6-c4e9-4a84-b668-4a7e39593162"
}
```

## Proposed Route Action

Action ID:

`CREATE-D-PARTICIPATION`

Title:

`Create synthetic program participation for supported person D`

Expected result:

`allowed`

Allowed actor:

`administrator`

Description:

Creates one reserved synthetic program-participation row linking supported person D to the fixed synthetic program. It does not create an authentication user or modify the supported-person identity.

## Application Behavior

The route must:

1. remain administrator-only;
2. expose only the fixed action;
3. display the exact payload before execution;
4. require the administrator to type `CREATE-D-PARTICIPATION`;
5. submit one authenticated `insert(...).select()` request to `program_participants`;
6. treat one returned row as `allowed`;
7. treat an API error as `denied` or `error`, preserving the exact message;
8. clear the confirmation field after the request;
9. perform no automatic retry;
10. perform no write on page load.

## Candidate Validation Before Execution

The application-code candidate must pass:

- `npm run build`
- `git diff --check`
- route appears in the Next.js build output;
- only the intended route file and candidate documentation are changed;
- the payload uses supported person D, not person A, B, C, or Johnny;
- the reserved participation ID is not reused elsewhere;
- no service-role key or server-side bypass is introduced;
- no delete or generic update path is introduced;
- no authentication-user creation path is introduced;
- no Trust Engine reference or synchronization path is introduced.

## Expected Execution Evidence

When separately approved and executed, the observed response should return exactly one row containing:

- ID: `71000000-0000-4000-8000-000000000010`
- Workspace ID: `71000000-0000-4000-8000-000000000001`
- Program ID: `71000000-0000-4000-8000-000000000002`
- Supported-person ID: `71000000-0000-4000-8000-000000000009`
- Participant role: `supported_person`
- Status: `active`
- Created by: `3c0300e6-c4e9-4a84-b668-4a7e39593162`

## Regression Checks After Execution

After a separately approved insert:

- supported person D remains unchanged;
- `auth_user_id` remains `null`;
- no additional supported-person row is created;
- no additional participation row is created;
- no existing participation is modified;
- workspace and program scope remain fixed;
- no Johnny record exists;
- no Trust Engine action occurs.

## Approval Status

- Candidate design approved: yes
- Candidate documentation creation approved: yes
- Application-code candidate creation approved: yes
- Local build and static validation approved: yes
- Participation insert approved: no
- Authentication-user creation approved: no
- Johnny onboarding approved: no
- Service-role use approved: no
- Push approved: no
- Merge approved: no
- Deployment approved: no

## Exact Next Gate

Build the administrator-only application-code candidate for `CREATE-D-PARTICIPATION`, run the compact local validation checkpoint, and stop before executing the insert.

The participation insert remains a separate approval boundary.
