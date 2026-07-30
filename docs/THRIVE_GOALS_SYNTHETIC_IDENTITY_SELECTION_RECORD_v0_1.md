# THRIVE Goals Synthetic Identity Selection Record v0.1

## Status

Review-only evidence record.

This document records the exact synthetic identities and scope selected for future authenticated Goals testing.

It does not authorize:

- Goals schema installation;
- SQL execution;
- authenticated test writes;
- synthetic user creation;
- auth linking;
- participant status changes;
- Johnny creation or testing;
- Trust Engine synchronization;
- service-role use;
- deployment;
- merge;
- push.

## Verified database preflight

```text
public.participant_goals = null
```

The Goals table does not currently exist.

## Selected synthetic workspace

```text
workspace_id: 71000000-0000-4000-8000-000000000001
workspace_type: demo
workspace_status: active
```

## Selected synthetic program

```text
program_id: 71000000-0000-4000-8000-000000000002
program_name: SUPPORTED PERSON PROGRAM TEST
program_type: demo
program_status: active
workspace_id: 71000000-0000-4000-8000-000000000001
```

## Participant A

```text
supported_person_id: 71000000-0000-4000-8000-000000000003
display_name: SUPPORTED PERSON TEST A
preferred_name: Test A
external_reference: RLS-TEST-PERSON-A
supported_person_status: active
auth_user_id: 9b283c6e-c2f8-4f87-9f90-fa081ee249bd

participation_id: 71000000-0000-4000-8000-000000000005
participant_role: supported_person
participation_status: active
program_id: 71000000-0000-4000-8000-000000000002
workspace_id: 71000000-0000-4000-8000-000000000001
```

Participant A is the primary participant-self create, read, update, archive, and denial-test identity.

## Participant D

```text
supported_person_id: 71000000-0000-4000-8000-000000000009
display_name: SUPPORTED PERSON ONBOARDING TEST D
preferred_name: Onboarding Test D
external_reference: RLS-ONBOARDING-TEST-PERSON-D
supported_person_status: active
auth_user_id: d48b7268-9aa6-4498-a923-2851fd5232c9

participation_id: 71000000-0000-4000-8000-000000000010
participant_role: supported_person
participation_status: active
program_id: 71000000-0000-4000-8000-000000000002
workspace_id: 71000000-0000-4000-8000-000000000001
```

Participant D is the cross-person isolation identity.

## Selected workspace administrator

```text
auth_user_id: 3c0300e6-c4e9-4a84-b668-4a7e39593162
workspace_id: 71000000-0000-4000-8000-000000000001
member_role: admin
membership_status: active
```

This identity is limited to workspace-admin tests within the selected synthetic workspace.

## Selected outsider

```text
auth_user_id: 4c68820a-b824-419a-bcc1-1485a3dcba94
selected_workspace_membership: none
```

This user has authenticated memberships in other workspaces but no membership in:

```text
71000000-0000-4000-8000-000000000001
```

This makes the identity suitable for outsider-denial testing against the selected synthetic workspace.

## Selected inactive participation fixture

```text
supported_person_id: 71000000-0000-4000-8000-000000000007
display_name: SUPPORTED PERSON WRITE TEST C UPDATED
preferred_name: Write Test C Updated
external_reference: RLS-WRITE-TEST-PERSON-C-UPDATED
supported_person_status: active
auth_user_id: null

participation_id: 71000000-0000-4000-8000-000000000008
participant_role: supported_person
participation_status: inactive
program_id: 71000000-0000-4000-8000-000000000002
workspace_id: 71000000-0000-4000-8000-000000000001
```

## Deferred test

The inactive fixture has no linked auth user.

Therefore:

- it may support admin-side inactive-participation verification;
- it cannot support authenticated participant-self inactive testing;
- no auth user will be linked during this gate;
- no active participant will be changed to inactive merely to create a fixture.

Authenticated participant-self inactive testing is deferred until a separately approved synthetic fixture exists.

## Selection decisions

The following selections are locked for the current synthetic Goals test plan:

- Participant A: selected;
- Participant D: selected;
- workspace administrator: selected;
- outsider: selected;
- workspace: selected;
- program: selected;
- active participation for Participant A: selected;
- active participation for Participant D: selected;
- inactive admin-side fixture: selected;
- inactive authenticated participant fixture: deferred.

## Data-handling boundary

These UUIDs are synthetic test identifiers.

Do not add:

- passwords;
- access tokens;
- refresh tokens;
- service-role keys;
- browser session secrets;
- real participant data;
- clinical narratives;
- real financial information;
- Trust Engine records.

## Next gate

Prepare a review-only Goals installation and authenticated-test execution checklist using the selected identities above.

Do not execute SQL, install the schema, create Goals rows, change participation status, link an auth user, or run authenticated tests until separate explicit approval is given.
