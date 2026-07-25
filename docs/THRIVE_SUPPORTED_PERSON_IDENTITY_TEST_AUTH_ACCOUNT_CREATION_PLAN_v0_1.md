# THRIVE Supported-Person Identity Test Authentication Account Creation Plan v0.1

## Status

Review-only planning document.

This plan does not authorize:

- creation of authentication accounts;
- creation of profile rows;
- sending invitations, confirmations, or password-reset messages;
- replacement of SQL UUID placeholders;
- creation of workspaces, memberships, programs, supported people, or participation records;
- execution of test-data SQL;
- live use of `/supported-person-test`;
- Johnny onboarding;
- explanation-table work;
- Trust Engine access or synchronization;
- service-role application access;
- push, merge, or deployment.

## Purpose

Define the controlled creation and verification process for six synthetic
Supabase authentication accounts needed for authenticated RLS testing.

These accounts represent test access conditions only. They must not represent
real staff, residents, clients, supported people, beneficiaries, family
members, trustees, or other production users.

## Governing Artifacts

- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_RLS_APPLICATION_TEST_PLAN_v0_1.md`
- `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_RLS_TEST_EXECUTION_CHECKLIST_v0_1.md`
- `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_RLS_TEST_DATA_CANDIDATE_v0_1.sql`
- `src/app/supported-person-test/page.tsx`

## Required Test Identities

| Placeholder key | Synthetic identity | Future access condition |
|---|---|---|
| `admin_auth_user_id` | THRIVE RLS Test Administrator | Active `admin` membership |
| `person_a_auth_user_id` | THRIVE RLS Test Person A | Active `individual` membership and person A linkage |
| `person_b_auth_user_id` | THRIVE RLS Test Person B | Active `individual` membership and person B linkage |
| `support_auth_user_id` | THRIVE RLS Test Support | Active `support` membership |
| `viewer_auth_user_id` | THRIVE RLS Test Viewer | Active `viewer` membership |
| `outsider_auth_user_id` | THRIVE RLS Test Outsider | No test-workspace membership |

All six accounts must have unique emails, credentials, sessions, and
`auth.users.id` values.

## Synthetic Identity Boundary

Do not use:

- Johnny's name or account;
- an employee's identity;
- a resident or client's identity;
- a family member's identity;
- a reused production account;
- a believable fictional identity that could be confused with a real person.

The account labels must visibly identify them as THRIVE RLS test infrastructure.

## Email Naming Convention

Use a mailbox domain or alias system controlled by DSS Enterprises.

Proposed local parts:

```text
thrive.rls.admin
thrive.rls.person.a
thrive.rls.person.b
thrive.rls.support
thrive.rls.viewer
thrive.rls.outsider
```
The final email domain must be reconciled and approved before any account is
created.

Do not put real names, birth dates, case numbers, addresses, diagnoses,
financial conditions, recovery information, or trust information in the email
addresses.

Complete email addresses should not be committed to the repository until their
disclosure and use are separately approved.

## Proposed Account-Creation Method

Preferred method:

```text
Supabase Dashboard manual user creation, one account at a time.
```

Reasons:

each account and returned UUID can be reviewed individually;
no service-role key needs to enter the application or repository;
accidental batch creation is avoided;
project and environment remain visible during creation;
the process can stop immediately after any unexpected behavior.

This planning document does not authorize that method yet.

## Target Environment

Immediately before any future account creation, verify:

```text
Organization: DSS Enterprises
Project: thrive-stewardship-stability-platform
Environment: main / production
Supabase area: Authentication / Users
```

Because this is the production Supabase project, every test account must be
clearly synthetic and separately controlled.

Creating an authentication account must not automatically be treated as
authority to create application records.

## Authentication-Settings Preflight

Before account creation, inspect and record:

- whether email/password sign-in is enabled;
- whether email confirmation is required;
- whether manually created users are automatically confirmed;
- whether invitation emails are sent automatically;
- whether password-reset emails are triggered;
- whether the controlled mailboxes can receive required messages;
- whether multifactor authentication is required;
- whether any project-wide authentication setting would need to change.

Do not weaken or disable global authentication settings for this test.

If the current configuration blocks controlled testing, stop and prepare a
separate configuration candidate.

## Credential Handling

Passwords, access tokens, recovery codes, and service-role credentials must not
appear in:

- repository files;
- Markdown documents;
- SQL artifacts;
- terminal history;
- screenshots;
- chat messages;
- source code;
- issue descriptions;
- commit messages.

Use a unique password for every account.

Do not reuse:

- Derek's credentials;
- Johnny's credentials;
- staff credentials;
- credentials from another production system;
- one shared password for all test identities.

Credentials must be stored only in an approved password manager or separately
approved secure credential store.

The evidence record may state that a password was securely stored, but must not
include the password.

## Profile-Row Decision

The live database shows:

```text
workspace_members.user_id references auth.users(id)
profiles.id references auth.users(id)
```

A profile row is not required by the workspace-membership foreign key.

The current temporary supported-person route and existing workspace/program
test flow do not query profiles.

Initial decision:

```text
Do not create profile rows during the test-auth account creation gate.
```

If later authentication or application testing reveals a profile dependency:

Stop.
Capture the exact behavior.
Prepare a separate profile-row candidate.
Obtain explicit approval.
Do not create profiles ad hoc.

## Required Pre-Creation Checks

Before creating the first account, verify:

- explicit approval for account creation exists;
- the six final synthetic email addresses are approved;
- the credential-storage method is ready;
- the correct Supabase organization, project, and environment are open;
none of the proposed emails already exists in auth.users;
- no proposed account belongs to Johnny or another real person;
- invitation and confirmation behavior is understood;
- no repository file contains credentials;
- no service-role application path is being used.

## One-at-a-Time Creation Sequence

After separate approval:

Create the test administrator.
Capture and verify its UUID.
Create test supported person A.
Capture and verify its UUID.
Create test supported person B.
Capture and verify its UUID.
Create the test support member.
Capture and verify its UUID.
Create the test viewer member.
Capture and verify its UUID.
Create the test outsider.
Capture and verify its UUID.
Stop before creating any application or database records.

Do not batch-create the accounts without verifying each result.

## UUID Capture Record

Use a secure temporary working record:

Placeholder key	Auth UUID	Verified email	Distinct UUID	Synthetic identity confirmed
admin_auth_user_id	Pending	Pending	Pending	Pending
person_a_auth_user_id	Pending	Pending	Pending	Pending
person_b_auth_user_id	Pending	Pending	Pending	Pending
support_auth_user_id	Pending	Pending	Pending	Pending
viewer_auth_user_id	Pending	Pending	Pending	Pending
outsider_auth_user_id	Pending	Pending	Pending	Pending

Do not store passwords in this record.

## Identity Verification

For every account, confirm:

- the email matches its approved synthetic address;
- a valid UUID was returned;
- the UUID is distinct from the other five;
- the account is visibly synthetic;
- it is not Johnny's account;
- it does not belong to a real staff member or supported person;
- no workspace membership exists;
- no supported-person record exists;
- no participation record exists;
- no production data access was granted merely by creating the auth user.

## Post-Creation Read-Only Verification

After all six accounts are created, verify:

- exactly six approved synthetic accounts exist;
- all six UUIDs are unique;
- confirmation status is understood for each account;
- no profile rows were created unless separately approved;
- no test workspace exists;
- no test program exists;
- no test workspace memberships exist;
supported_people still contains zero test rows;
program_participants still contains zero test rows.

This verification must not expose credentials.

## SQL Candidate Reconciliation Boundary

The committed SQL candidate remains rollback-only and contains six placeholder
UUIDs.

After account creation:

Do not edit the committed v0.1 candidate in place.
Create a new resolved candidate version.
Replace only the six placeholder UUID values.
Preserve the controlled record IDs and synthetic labels.
Keep the new artifact review-only.
Run transaction, schema, and prohibited-scope checks.
Calculate and record its SHA-256.
Review the entire resolved candidate.
Obtain separate approval before test-data installation.

Account creation does not authorize UUID replacement.

UUID replacement does not authorize SQL execution.

## Stop Conditions

Stop immediately if:

- the wrong Supabase project or environment is open;
- a proposed email belongs to a real person;
- an email already exists unexpectedly;
- a returned UUID matches a real-person account;
- an invitation or confirmation would go to an uncontrolled recipient;
- account creation creates unexpected profile or application records;
- credentials appear in output, source code, screenshots, or chat;
- a workspace membership or supported-person linkage is created early;
- Johnny or Trust Engine information appears;
- global authentication settings would need to be weakened;
- a service-role credential would be required in the application.

Document the exact condition before proceeding.

## Evidence Required

For each account, preserve:

- synthetic role label;
- approved test email;
- returned UUID;
- creation date and time;
- creation method;
- confirmation status;
- credential securely stored: yes or no;
- profile row present: expected no;
- workspace membership present: expected no;
- supported-person linkage present: expected no;
- confirmation that the account is not Johnny or another real person.

Screenshots must not reveal passwords, tokens, recovery codes, or service-role
credentials.

## Cleanup Boundary

No account deletion is authorized by this plan.

A later cleanup decision may consider:

- disabling sign-in;
- banning an account;
- rotating credentials;
- retaining controlled accounts for repeatable RLS testing;
- archiving related application records.

Do not delete authentication users merely to tidy the dashboard. Cascading
foreign keys may affect later linked records.

## Success Criteria

This planning gate passes when:

- all six synthetic identities are defined;
- the final email naming convention is approved;
- the credential-storage method is approved;
- the manual dashboard method is approved or replaced;
- authentication confirmation behavior is understood;
- profile creation remains separately bounded;
- UUID capture and verification are defined;
- stop conditions are documented;
- no accounts or application records have been created.

## Approval Status
```text
Controlled test-auth account creation plan prepared for review.
No authentication accounts have been created.
No profile rows have been created.
No UUID placeholders have been replaced.
No test-data SQL has been executed.
No temporary route testing has occurred.
Johnny onboarding has not been approved.
Trust Engine synchronization has not been approved.
```

## Next Gate

Review this plan and reconcile:

1. The final controlled email domain or alias method.
2. The exact Supabase manual account-creation behavior.
3. The approved secure credential-storage method.

After separate explicit approval, create only the six controlled authentication
accounts and capture their UUIDs.

Do not create profiles, memberships, workspaces, programs, supported-person
records, participation records, or execute SQL during the account-creation gate.
