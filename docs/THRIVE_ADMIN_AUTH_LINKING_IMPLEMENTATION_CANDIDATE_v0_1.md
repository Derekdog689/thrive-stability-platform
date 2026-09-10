# THRIVE Admin Auth-Linking Implementation Candidate v0.1

Status: REVIEW-ONLY CANDIDATE

This document defines the smallest safe implementation candidate for linking an already-confirmed Supabase Auth account to an existing THRIVE supported-person record.

## Verified current state

- Public signup creates a Supabase Auth user.
- Email confirmation now returns to the production THRIVE application.
- A confirmed user with no THRIVE purpose reaches the existing "THRIVE access is not configured" boundary.
- Admin can create a `supported_people` record and activate `program_participants` independently.
- `supported_people.auth_user_id` already exists as a nullable foreign key to `auth.users(id)`.
- `supported_people.auth_user_id` is unique.
- Current Admin UI already distinguishes `App access linked` from `No app access yet`.
- Browser clients must not directly read raw `auth.users`.

## Frozen boundaries

This candidate does not:

- create Auth users,
- auto-link by email,
- auto-create supported people,
- auto-activate program participation,
- change supported-person status,
- let participants choose their own supported-person record,
- expose raw `auth.users` to the browser,
- introduce a new identity table,
- use a service-role key in the client,
- hard-delete any identity or participation record,
- merge THRIVE authority with the Trust Engine.

## Proposed operator workflow

Rename the current Admin section from `Onboarding and participation` to `Supported People & Access`.

Inside the page, preserve the existing People workflow and add a separate App access workflow.

### App access section

Heading: `Accounts waiting for THRIVE access`

For each confirmed Auth account that is not already linked to a supported person, show only:

- email,
- auth user id,
- created date,
- email-confirmed date,
- status: `Not linked`.

Primary action: `Link to supported person`.

The selection list must show only supported people in the current Admin workspace where `auth_user_id IS NULL`.

Before linking, require explicit confirmation:

`Link <email> to <supported person>?`

Boundary copy:

`This gives this login access to this THRIVE participant record. It does not change supported-person status or program participation.`

After a successful link:

- the pending Auth account leaves the waiting list,
- the supported-person card changes from `No app access yet` to `App access linked`,
- optionally display the linked email under the access state.

## Candidate database functions

These are candidates only. Do not install without a separate approval gate.

### 1. List confirmed unlinked Auth accounts

```sql
create or replace function public.admin_list_unlinked_auth_accounts(
  p_workspace_id uuid
)
returns table (
  auth_user_id uuid,
  email text,
  created_at timestamptz,
  email_confirmed_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_workspace_admin(p_workspace_id) then
    raise exception 'THRIVE workspace admin access required';
  end if;

  return query
  select
    u.id,
    u.email,
    u.created_at,
    u.email_confirmed_at
  from auth.users u
  where u.email_confirmed_at is not null
    and not exists (
      select 1
      from public.supported_people sp
      where sp.auth_user_id = u.id
    )
  order by u.created_at desc;
end;
$$;
```

Recommended grants candidate:

```sql
revoke all on function public.admin_list_unlinked_auth_accounts(uuid) from public;
grant execute on function public.admin_list_unlinked_auth_accounts(uuid) to authenticated;
```

### 2. Link one Auth account to one supported person

```sql
create or replace function public.admin_link_auth_account_to_supported_person(
  p_workspace_id uuid,
  p_supported_person_id uuid,
  p_auth_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_supported_person public.supported_people%rowtype;
  v_email_confirmed_at timestamptz;
begin
  if not public.is_workspace_admin(p_workspace_id) then
    raise exception 'THRIVE workspace admin access required';
  end if;

  select *
  into v_supported_person
  from public.supported_people
  where id = p_supported_person_id
    and workspace_id = p_workspace_id
  for update;

  if not found then
    raise exception 'Supported person not found in this workspace';
  end if;

  if v_supported_person.auth_user_id is not null then
    raise exception 'Supported person already has app access linked';
  end if;

  select u.email_confirmed_at
  into v_email_confirmed_at
  from auth.users u
  where u.id = p_auth_user_id;

  if not found then
    raise exception 'Auth account not found';
  end if;

  if v_email_confirmed_at is null then
    raise exception 'Auth account must be confirmed before linking';
  end if;

  if exists (
    select 1
    from public.supported_people sp
    where sp.auth_user_id = p_auth_user_id
  ) then
    raise exception 'Auth account is already linked';
  end if;

  update public.supported_people
  set auth_user_id = p_auth_user_id
  where id = p_supported_person_id
    and workspace_id = p_workspace_id;
end;
$$;
```

Recommended grants candidate:

```sql
revoke all on function public.admin_link_auth_account_to_supported_person(uuid, uuid, uuid) from public;
grant execute on function public.admin_link_auth_account_to_supported_person(uuid, uuid, uuid) to authenticated;
```

## Security posture

The functions are `SECURITY DEFINER` because the browser should not receive direct access to `auth.users`.

Every call must begin by confirming workspace-admin authority through the existing `is_workspace_admin(p_workspace_id)` function.

The linking function must validate all of the following before update:

1. caller is an active workspace admin,
2. supported person exists in the supplied workspace,
3. supported person currently has no Auth account linked,
4. Auth account exists,
5. Auth account is email-confirmed,
6. Auth account is not already linked anywhere.

The existing unique constraint on `supported_people.auth_user_id` remains the final database-level guard against duplicate linkage.

## UI candidate

Suggested states:

### Waiting account card

- Email
- Confirmed
- Created date
- `Not linked`
- `Link to supported person`

### Supported-person access state

If `auth_user_id IS NULL`:

`No app access yet`

If linked:

`App access linked`

Optional secondary display after the list RPC is available:

`Linked login: user@example.com`

### Confirmation dialog

Title:

`Link app access?`

Body:

`Link <email> to <supported person>? This gives this login access to this THRIVE participant record. Supported-person status and program participation will not change.`

Actions:

- `Cancel`
- `Link app access`

## Failure states

The UI must surface plain-language errors for:

- account already linked,
- supported person already linked,
- account not confirmed,
- supported person not in workspace,
- admin authority lost,
- stale selection after another admin linked the account.

No retry should silently choose a different supported person or Auth account.

## Test candidate

After separate approval to install:

1. Install the two functions only.
2. Confirm non-admin authenticated users cannot list unlinked Auth accounts.
3. Confirm workspace admin can list confirmed unlinked accounts.
4. Confirm unconfirmed Auth accounts are excluded.
5. Confirm already-linked Auth accounts are excluded.
6. Confirm a workspace admin can link one confirmed unlinked account to one unlinked supported person in the same workspace.
7. Confirm duplicate link attempts fail.
8. Confirm cross-workspace supported-person linking fails.
9. Confirm linking does not change `supported_people.status`.
10. Confirm linking does not change `program_participants.status`.
11. Confirm the linked participant can sign in and resolve to their existing supported-person record.
12. Confirm the Admin card renders `App access linked`.

## Install gate

No SQL in this document is approved for execution by virtue of this candidate being committed.

A separate explicit approval is required before:

- creating either function,
- granting execute permissions,
- changing the Admin UI,
- linking any live account,
- creating or changing any Auth user.

## Next gate

Review this candidate. If approved, the next bounded gate is:

`Install and test Admin Auth-Linking database functions only; no UI implementation and no live account linking.`
