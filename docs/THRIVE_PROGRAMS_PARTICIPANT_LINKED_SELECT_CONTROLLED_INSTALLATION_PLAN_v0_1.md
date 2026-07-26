# THRIVE Programs Participant-Linked SELECT Controlled Installation Plan v0.1

## Status

Controlled installation plan only.

The final static-review candidate exists, but installation is not approved by this document.

## Candidate

- file: `THRIVE_PROGRAMS_PARTICIPANT_LINKED_SELECT_POLICY_CANDIDATE_v0_3.sql`
- target table: `public.programs`
- command: `SELECT`
- target role: `authenticated`
- behavior: permissive
- proposed policy name: `programs_select_for_linked_supported_people`

## Verified Preconditions

The following have been inspected and documented:

- `public.programs` schema
- target synthetic program row
- current `programs` policies
- `public.program_participants` schema
- `public.program_participants` indexes
- `public.program_participants` lifecycle constraints
- `public.program_participants` policies
- `public.supported_people` schema
- `public.supported_people` indexes
- `public.supported_people` lifecycle constraints
- `public.supported_people` policies
- `public.is_supported_person_self(uuid)` function body
- helper security mode: `SECURITY DEFINER`

## Remaining Pre-Install Check

Confirm the configured search path for:

```sql
public.is_supported_person_self(uuid)
```

Preferred verification:

```sql
select
  p.oid::regprocedure as function_name,
  p.prosecdef as security_definer,
  p.proconfig as function_settings
from pg_proc p
where p.oid = 'public.is_supported_person_self(uuid)'::regprocedure;
```

Expected review outcome:

- `security_definer = true`
- function settings are either explicitly safe or null with all referenced objects schema-qualified

Do not run this query until read-only SQL inspection is separately approved.

## Installation Gate

Installation requires a new explicit approval after:

1. final candidate review;
2. helper search-path verification;
3. current policy snapshot capture;
4. rollback statement review;
5. test identities confirmed available.

## Proposed Installation Statement

The install statement should be extracted from v0.3 without the surrounding review-only rollback wrapper.

Proposed installation body:

```sql
create policy programs_select_for_linked_supported_people
on public.programs
as permissive
for select
to authenticated
using (
  exists (
    select 1
    from public.program_participants pp
    where pp.program_id = programs.id
      and pp.workspace_id = programs.workspace_id
      and pp.status = 'active'
      and public.is_supported_person_self(pp.supported_person_id)
  )
);
```

## Installation Transaction

When separately approved, use one explicit transaction:

```sql
begin;

create policy programs_select_for_linked_supported_people
on public.programs
as permissive
for select
to authenticated
using (
  exists (
    select 1
    from public.program_participants pp
    where pp.program_id = programs.id
      and pp.workspace_id = programs.workspace_id
      and pp.status = 'active'
      and public.is_supported_person_self(pp.supported_person_id)
  )
);

commit;
```

Do not add or alter any other policy in the same transaction.

## Immediate Verification

After installation, do not assume success from the SQL response alone.

Verify:

1. policy appears on `public.programs`;
2. command is `SELECT`;
3. role is `authenticated`;
4. behavior is permissive;
5. `USING` expression matches v0.3 exactly;
6. existing policies are unchanged;
7. no new INSERT, UPDATE, or DELETE policy exists.

## Positive Test

Authenticated as synthetic person D:

- route: `/supported-person-program-summary-probe`
- supported-person row expected: one
- participation row expected: one
- exact program row expected: one
- exact program ID expected:
  - `71000000-0000-4000-8000-000000000002`
- exact workspace ID expected:
  - `71000000-0000-4000-8000-000000000001`
- error expected: none

## Negative Tests

### Unrelated Program

Synthetic person D must not see unrelated program rows.

### Johnny Program

Synthetic person D must not see:

- `Johnny Stability and Trust Support`
- program ID `f67f14a2-6666-44d6-99d4-dbb2678a2863`

### Other Supported Person

Synthetic person A must not see person D's program unless A independently has a qualifying active participation for the same program.

### Outsider

The controlled outsider identity must not see the target program.

### Inactive Participation

A supported person with an inactive participation must not gain program visibility through this policy.

### Completed Participation

A completed participation must not gain visibility under v0.3.

### Write Boundaries

Synthetic person D must remain unable to:

- insert a program
- update a program
- delete a program
- create workspace membership
- modify participation
- modify supported-person identity

## Rollback Plan

If any positive or negative test fails, stop immediately.

Rollback statement:

```sql
drop policy if exists programs_select_for_linked_supported_people
on public.programs;
```

After rollback:

1. confirm the policy no longer appears;
2. rerun the exact-program probe as person D;
3. expected exact program result returns to `null`;
4. confirm existing workspace-member behavior remains intact;
5. document the failure before any revision.

## No-Retry Rule

If installation or verification produces an unexpected result:

- do not stack another policy;
- do not modify existing policies;
- do not broaden access;
- do not retry with service-role access;
- capture the exact result;
- rollback if necessary;
- reconcile before continuing.

## Boundary Confirmation

This plan does not authorize:

- SQL execution
- RLS installation
- migration
- workspace membership creation
- program creation
- supported-person mutation
- participation mutation
- Johnny changes
- Trust Engine synchronization
- service-role use
- delete outside the explicit rollback policy drop
- push
- merge
- deployment

## Exact Next Gate

Perform the read-only helper search-path verification.

Then present:

- verified helper settings;
- final candidate checksum;
- installation command;
- rollback command;
- test checklist.

Installation still requires separate explicit approval.
