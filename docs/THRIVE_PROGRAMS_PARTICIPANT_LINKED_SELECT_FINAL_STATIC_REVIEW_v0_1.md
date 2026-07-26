# THRIVE Programs Participant-Linked SELECT Final Static Review v0.1

## Status

Final static review complete, pending helper search-path verification.

## Reviewed Candidate

- version: `v0.3`
- policy name: `programs_select_for_linked_supported_people`
- table: `public.programs`
- operation: `SELECT`
- role: `authenticated`
- policy type: permissive

## Final Candidate Logic

```sql
exists (
  select 1
  from public.program_participants pp
  where pp.program_id = programs.id
    and pp.workspace_id = programs.workspace_id
    and pp.status = 'active'
    and public.is_supported_person_self(pp.supported_person_id)
)
```

## Verified Authority Chain

```text
authenticated user
→ public.is_supported_person_self(supported_person_id)
→ exact auth_user_id match
→ active supported-person record
→ active matching participation
→ exact program ID and workspace
→ SELECT only
```

## Static Safety Findings

- exact program scope is preserved
- exact workspace scope is preserved
- active participation is required
- active supported-person identity is required
- no workspace membership is inferred
- no broad program list authority is introduced beyond qualifying rows
- no INSERT authority is introduced
- no UPDATE authority is introduced
- no DELETE authority is introduced
- existing workspace-member SELECT policy remains unchanged
- no new index is required
- helper call is schema-qualified

## SECURITY DEFINER Review

The helper is confirmed `SECURITY DEFINER`.

Its body is confirmed to query:

```sql
public.supported_people
```

and compare against:

```sql
auth.uid()
```

The helper returns only a boolean existence result.

## Remaining Static Risk

The helper's configured `search_path` was not visible in the inspected dashboard screens.

Because referenced objects are schema-qualified, the remaining risk is limited, but installation should not proceed until the function settings are verified.

## Candidate Disposition

- syntax shape: acceptable
- authorization model: aligned
- index support: acceptable
- lifecycle rule: intentionally narrow
- write authority: unchanged
- installation readiness: pending one read-only helper-settings check

## Build Status

No application code changed in this pass.

## Git Checkpoint

To be recorded after this review package is committed.

## Exact Next Gate

Verify the live function settings for `public.is_supported_person_self(uuid)`.

Do not install the policy yet.
