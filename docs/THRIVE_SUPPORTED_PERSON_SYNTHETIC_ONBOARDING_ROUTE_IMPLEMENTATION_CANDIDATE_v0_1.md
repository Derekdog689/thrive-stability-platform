# THRIVE Supported-Person Synthetic Onboarding Route Implementation Candidate v0.1

## Status

Review-only application implementation candidate.

This document defines the smallest synthetic application slice for supported-person onboarding.

It does not authorize application code changes, database changes, SQL execution, service-role use, Johnny onboarding, program participation creation, authentication-user creation, Trust Engine synchronization, push, merge, or deployment.

## Approved Slice

The candidate covers one route only:

```text
Administrator-only supported-person onboarding route
Synthetic supported-person identity creation only

The route must not create:

program participation;
authentication users;
workspace membership;
explanation records;
financial records;
Trust Engine relationships;
Johnny-specific records.
Purpose

The route will prove that an authorized administrator can:

open a synthetic onboarding page;
review a fixed synthetic payload;
explicitly confirm one request;
create one synthetic supported-person identity;
inspect the returned row;
stop without creating any additional records.

This is a controlled application-path test, not production onboarding.

Proposed Route

Candidate path:

/supported-person-onboarding-test

Candidate visibility:

not present in normal navigation;
accessible only by direct URL;
authenticated access required;
controls visible only to the controlled administrator account.

Candidate actor:

dstein561+thrive-rls-admin@gmail.com

Candidate administrator user ID:

3c0300e6-c4e9-4a84-b668-4a7e39593162
Fixed Scope

Workspace:

71000000-0000-4000-8000-000000000001

The workspace must be displayed but not editable.

No program selection is required in this first slice because participation is excluded.

Synthetic Identity Payload

The first implementation must use a fixed reserved synthetic payload.

Candidate reserved ID:

71000000-0000-4000-8000-000000000009

Candidate payload:

{
  "id": "71000000-0000-4000-8000-000000000009",
  "workspace_id": "71000000-0000-4000-8000-000000000001",
  "auth_user_id": null,
  "display_name": "SUPPORTED PERSON ONBOARDING TEST D",
  "preferred_name": "Onboarding Test D",
  "status": "active",
  "external_reference": "RLS-ONBOARDING-TEST-PERSON-D",
  "created_by": "3c0300e6-c4e9-4a84-b668-4a7e39593162"
}

The payload must contain synthetic values only.

No user-editable identity fields are included in this first implementation.

Page Sections
1. Boundary Header

Display:

synthetic test only;
no Johnny data;
no real-person data;
no authentication-user creation;
no participation creation;
no Trust Engine access;
no service-role use;
no automatic follow-up actions.
2. Authenticated Actor

Display:

email;
user ID;
classification;
whether the actor is authorized for this route.

Expected classification:

Controlled administrator

Unauthorized actors must see no execution control.

3. Fixed Workspace

Display:

workspace ID;
workspace label;
scope status.

The workspace value must not be editable.

4. Exact Payload Preview

Display the full fixed payload before any request may be enabled.

The preview must clearly show:

auth_user_id: null

and:

No participation will be created.
5. Confirmation Control

The administrator must type:

CREATE SYNTHETIC PERSON D

The create button remains disabled until the exact phrase matches.

The confirmation resets after every attempt.

6. Single Create Action

Candidate button label:

Create synthetic supported person D

The button performs one request only.

No chained request is allowed.

No participation request follows automatically.

No retry occurs automatically.

7. Observed Response

Display:

expected result;
observed result;
returned row;
exact error when applicable;
whether any row was created;
actor;
timestamp of the attempt in the UI session.

Expected result:

allowed
Supabase Request Shape

The route must use the authenticated browser client.

Candidate operation:

insert one row into supported_people
return the inserted row

The route must not use:

service-role credentials;
server-side privileged clients;
generic database editors;
RPC functions that broaden authority;
bulk inserts;
automatic retries.
Result Interpretation

Candidate result rules:

API or RLS error
=> observed: denied or error
zero returned rows
=> observed: denied
exactly one returned row matching the reserved synthetic ID
=> observed: allowed
more than one returned row
=> observed: error

The route must not report success based only on the absence of an API error.

Duplicate Handling

If the reserved ID or external reference already exists:

stop;
display the exact error;
do not retry;
do not update the existing row;
do not delete the existing row;
reconcile the current synthetic state before another execution.

No upsert is permitted.

Failure Handling

On any unexpected result:

stop immediately;
show the exact request identity;
show the exact payload;
show the exact response;
do not retry automatically;
do not create participation;
do not create an auth user;
do not delete or alter an existing record;
preserve evidence for review.
Actor Visibility Rules
Controlled Administrator

May see:

the route;
fixed payload;
confirmation input;
create button;
observed response.
Supported Person

Must not see execution controls.

Support Member

Must not see execution controls.

Viewer

Must not see execution controls.

Authenticated Outsider

Must not see execution controls.

Unauthorized actors may see a boundary notice stating that no approved action is available.

No-Write Page Load

Loading the route must perform no database write.

The following actions must not trigger a write:

opening the route;
refreshing the route;
selecting text;
viewing the payload;
switching browser tabs;
signing in;
signing out.

Only the explicit confirmed create button may attempt the insert.

No Participation Behavior

After successful identity creation, the route must stop.

It may display:

Synthetic supported-person identity created.
Participation not created.
Authentication user not created.

It must not display or enable a participation form in this first slice.

No Authentication Behavior

The route must not:

call Supabase Admin Auth;
create an email account;
send an invitation;
generate a password;
link an existing user;
alter auth_user_id.

The inserted row must retain:

auth_user_id: null
No Johnny Behavior

The route must not contain:

Johnny's name;
Johnny's email;
Johnny's identifiers;
Johnny's program;
Johnny's financial data;
Johnny's Trust Engine data;
Johnny-specific default values.
Audit Evidence

The UI should preserve enough visible evidence to document:

authenticated actor;
actor classification;
fixed workspace;
exact payload;
exact confirmation phrase;
expected result;
observed result;
returned row or exact error;
confirmation reset;
no participation creation;
no authentication-user creation.

No explanation or conclusion is generated from this evidence.

Candidate Component Shape

Possible implementation files:

src/app/supported-person-onboarding-test/page.tsx

Optional local component:

src/app/supported-person-onboarding-test/SyntheticSupportedPersonCreatePanel.tsx

The smallest safe implementation should prefer one route file unless separation materially improves readability.

Candidate State Model

Suggested UI state:

confirmation
busy
result

Suggested result shape:

expected
observed
message
data

No persistent client-side onboarding draft is required.

Candidate Guardrails

The implementation must include:

fixed actor classification check;
fixed workspace;
fixed payload;
exact confirmation phrase;
one request at a time;
disabled button while busy;
no automatic retry;
no generic editor;
no delete action;
no update action;
no participation action;
no authentication action;
no service-role access.
Synthetic Test Plan
T1 Page Load

Expected:

route loads;
no write occurs;
payload preview visible;
button disabled.
T2 Unauthorized Actor

Expected:

execution control unavailable;
no write occurs.
T3 Incorrect Confirmation

Expected:

button remains disabled;
no write occurs.
T4 Correct Confirmation

Expected:

button enabled;
one insert request allowed.
T5 Successful Insert

Expected:

one returned row;
ID equals reserved synthetic ID;
workspace equals fixed workspace;
auth_user_id remains null;
status equals active;
created-by equals administrator ID;
no other record created.
T6 Duplicate Attempt

Expected:

request denied by constraint;
exact error displayed;
no update;
no retry;
no delete.
T7 Post-Success Boundary

Expected:

no participation created;
no auth user created;
no Trust Engine action;
confirmation cleared.
Acceptance Criteria

The implementation candidate may advance to application code only when:

fixed route path is approved;
fixed synthetic payload is approved;
reserved ID is confirmed unused;
actor restriction is approved;
confirmation phrase is approved;
result handling is approved;
duplicate behavior is approved;
synthetic test plan is approved;
explicit implementation approval is provided.
Approval Status
implementation candidate created: yes
application code created: no
route installed: no
synthetic person D created: no
participation created: no
authentication user created: no
Johnny record created: no
SQL created: no
SQL executed: no
service-role access used: no
explanation table created: no
Trust Engine synchronized: no
push performed: no
merge performed: no
deployment performed: no
Next Gate

Review this implementation candidate.

The next separately approved action would be:

Create the administrator-only synthetic onboarding route candidate in application code.
Do not execute the create action.

The route may be built and locally validated, but no synthetic database insert occurs until execution is separately approved.
