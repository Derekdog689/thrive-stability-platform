# THRIVE Support Request Reconciled Authenticated Test Plan v0.2

## Status

Review-only candidate. The Support schema is permanently installed and privilege-hardened.

Do not execute synthetic tests, create test actors, activate Johnny, use a service-role client, deploy, merge, push, or synchronize with the Trust Engine without separate approval.

## Verified installed state

The following tables are installed with forced RLS:

- `support_requests`
- `support_request_entries`
- `support_request_links`
- `support_request_status_events`

Authenticated privileges are limited to:

- `SELECT`, `INSERT`, `UPDATE` on `support_requests`
- `SELECT`, `INSERT`, `UPDATE` on `support_request_entries`
- `SELECT`, `INSERT`, `UPDATE` on `support_request_links`
- `SELECT` only on `support_request_status_events`

All four Support tables were empty at the start of this planning gate.

## Required actors

- Participant D
- Participant A
- outsider
- active same-workspace `support` member
- active same-workspace admin
- inactive or removed `support` member

All tests must use normal browser-authenticated Supabase clients. No service-role client may be used to prove participant or reviewer access.

## Installed policy reconciliation

### Requests

Participants may:

- create a request only for themselves and an active program participation;
- create only with status `submitted`;
- not supply routing, assignment, withdrawal, completion, or archive fields;
- read their own active and historical requests;
- withdraw only their own request while it remains `submitted`.

Reviewers may:

- read requests only where `is_support_reviewer(workspace_id)` is true;
- update requests only in an authorized workspace and valid program/person scope.

### Entries

Only active reviewers may insert entries.

Supported entry types are:

- `participant_response`
- `internal_note`

Participants may read only non-archived `participant_response` entries for themselves.

Only reviewers may archive entries. Entry content is immutable after creation. Hard delete is prohibited.

### Links

Participants may insert links only for their own submitted request, active program participation, and matching scope.

Participants may archive their own mistaken link only while the parent request remains `submitted`, and an archive reason is required.

Reviewers may read and archive links. The live RLS snapshot does not show a reviewer insert policy, so reviewer link creation is not part of this test pass.

Each link must contain exactly one target:

- staged transaction
- budget category
- budget period
- wellness check-in
- goal
- prior Support request

Self-reference is prohibited. Scope is enforced through composite foreign keys and validation triggers.

### Status events

Participants may read only `status_changed` events for themselves.

Reviewers may read all authorized events.

Authenticated users have `SELECT` only on status events. Direct insert, update, and delete attempts must fail.

Supported event types are:

- `status_changed`
- `assignment_changed`
- `routing_changed`
- `entry_archived`
- `link_archived`

## Gate 1: actor and identity proof

For each actor:

1. Authenticate normally.
2. Record email and `auth.uid()`.
3. Record workspace membership, if any.
4. Record supported-person identity, if any.
5. Confirm expected reviewer recognition.
6. Confirm no service-role key or client is present.

Expected reviewer recognition:

- active same-workspace `admin`: true
- active same-workspace `support`: true
- participant: false
- outsider: false
- inactive or removed support member: false

## Gate 2: Participant D request creation

Create one clearly synthetic request using Participant D's resolved:

- workspace ID
- program ID
- supported-person ID

Expected:

- insert succeeds;
- status defaults to `submitted`;
- routing and assignment remain null;
- terminal timestamps remain null;
- one `null -> submitted` status event is created automatically.

Negative tests:

- Participant A supported-person ID;
- alternate workspace;
- alternate program;
- inactive participation;
- unsupported category;
- blank message;
- message over 4,000 characters;
- requested support over 2,000 characters;
- participant-supplied routing;
- participant-supplied assignment;
- participant-supplied terminal timestamps.

## Gate 3: participant read isolation

Participant D:

- sees own request;
- sees own non-archived participant responses;
- sees own active links;
- sees only `status_changed` events;
- never sees internal notes.

Participant A:

- cannot see Participant D requests, entries, links, or events.

Outsider:

- sees no Support records.

## Gate 4: Participant D links while submitted

Test valid same-scope links for:

- Goal
- Wellness check-in
- budget category
- budget period
- staged transaction only where ownership is independently proven

Test rejection of:

- cross-person target;
- cross-program target;
- cross-workspace target;
- multiple targets in one row;
- self-referencing prior request;
- prior request that is not completed.

Archive one mistaken link:

- archive succeeds only while the request remains `submitted`;
- archive reason is required;
- no hard delete occurs.

## Gate 5: participant withdrawal

Create a second Participant D request.

Expected:

- `submitted -> withdrawn` succeeds;
- `withdrawn_at` is populated;
- participant-authored content remains unchanged;
- a status event is created;
- reopening fails;
- reviewer may later archive it while preserving `withdrawn_at`.

## Gate 6: reviewer workflow

Using the active same-workspace Support member:

- select Participant D's submitted request;
- reject direct `submitted -> archived`;
- move `submitted -> acknowledged`;
- set routing category without changing participant category;
- assign only an active same-workspace `admin` or `support` membership row;
- reject inactive, removed, outsider, viewer, trustee, individual, and cross-workspace assignment;
- move to `in_progress`;
- move to `waiting_for_participant`;
- return to `in_progress`;
- complete the request;
- verify `completed_at`;
- reject reopening;
- archive the completed request;
- verify `completed_at` remains and `archived_at` is populated.

Repeat operational authority checks with the active same-workspace admin.

## Gate 7: entries

Reviewer creates:

- one `participant_response`;
- one `internal_note`.

Expected:

- Participant D sees only the participant response;
- Participant A and outsider see neither;
- reviewer sees both;
- title is optional and limited to 120 characters;
- content is required and limited to 4,000 characters;
- content edits fail;
- reviewer archive requires a reason;
- archived participant response disappears from normal participant view;
- reviewer audit history retains it;
- hard delete fails.

## Gate 8: status and audit events

Confirm automatic events for:

- initial submission;
- withdrawal;
- acknowledgment;
- lifecycle transitions;
- routing change;
- assignment change;
- entry archive;
- link archive.

Confirm:

- participant sees only `status_changed`;
- reviewer sees all authorized event types;
- direct insert fails;
- direct update fails;
- direct delete fails.

## Gate 9: inactive or removed reviewer

Expected:

- reviewer recognition is false;
- reviewer-only select is denied;
- request update is denied;
- entry insert is denied;
- entry archive is denied;
- link archive is denied;
- assignment is denied.

Do not modify a real operational member for this test.

## Gate 10: no-delete proof

Through normal authenticated clients, attempt DELETE on all four Support tables as:

- participant;
- active Support reviewer;
- active admin;
- outsider.

Expected: every DELETE fails.

## Cross-module boundary proof

Verify Support actions do not mutate:

- participant Goals;
- Wellness check-ins;
- staged financial transactions;
- budget periods;
- budget categories;
- program participation;
- Trust Engine records.

A Support request or link does not establish intent, responsibility, relapse, incapacity, misuse, consent for external sharing, or legal, clinical, or fiduciary authority.

## Stop conditions

Stop immediately if:

- one participant can see another participant's record;
- an outsider receives Support data;
- an internal note becomes participant-visible;
- a terminal request reopens;
- a linked source record changes through Support;
- DELETE succeeds;
- a reviewer acts outside their workspace;
- a Trust Engine, notification, emergency, or external-sharing action occurs.

## Closeout requirement

After separately approved execution:

- archive synthetic records through approved lifecycle paths;
- do not hard delete;
- preserve synthetic history;
- record exact actor and record IDs;
- capture pass/fail results and screenshots;
- confirm no service-role client was used;
- produce an authenticated Support validation closeout.

## Exact next gate after review

Approve or revise the candidate harness and checklist. Synthetic execution remains separately gated.
