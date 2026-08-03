# THRIVE Support Request Authenticated Test Execution Plan v0.1

## Status

Execution-ready planning package, not approved for execution.

The Support schema must first be installed and pass the separate post-install
verification gate.

## Test method

Use normal authenticated Supabase browser clients or the existing application
client. Do not use a service-role client to prove participant or reviewer
access.

Record the exact actor, workspace, program, supported-person ID, request ID,
entry ID, link ID, and resulting error or success for every test.

## Required actors

- Participant D;
- Participant A;
- outsider;
- active same-workspace `support` member;
- active same-workspace admin;
- inactive or removed `support` member.

## Gate 1: identity and reviewer proof

For every actor:

1. authenticate normally;
2. record `auth.uid()`;
3. resolve workspace membership;
4. verify `is_support_reviewer(workspace_id)`:
   - true only for active `admin` or `support`;
   - false for participants, outsiders, viewers, trustees, and inactive members.

## Gate 2: Participant D request creation

Create one synthetic request using Participant D's resolved:

- workspace;
- active program;
- supported-person identity.

Use a clearly synthetic category and message.

Expected:

- insert succeeds;
- status is `submitted`;
- routing and assignment are null;
- one `null -> submitted` status event exists.

Negative tests:

- Participant A ID rejected;
- alternate workspace rejected;
- alternate program rejected;
- inactive participation rejected;
- blank message rejected;
- oversize message rejected;
- participant-supplied routing or assignment rejected.

## Gate 3: participant read isolation

Participant D:

- sees own request;
- sees own participant-visible events;
- cannot see internal notes.

Participant A:

- cannot see Participant D request, entries, links, or events.

Outsider:

- sees no Support records.

## Gate 4: submitted-request link behavior

While Participant D request is `submitted`:

- create a same-scope Goal link;
- create a same-scope Wellness link;
- create a same-scope budget-category or budget-period link;
- create a same-scope staged-transaction link only where active
  `financial_source_owners` proves ownership.

Reject:

- cross-person link;
- cross-program link;
- cross-workspace link;
- two targets in one link row;
- self-referencing prior Support request;
- prior request that is not completed.

Archive one mistaken link:

- participant archive succeeds only while request remains `submitted`;
- archive reason required;
- no hard delete occurs.

## Gate 5: participant withdrawal

Create a second Participant D request.

Expected:

- `submitted -> withdrawn` succeeds;
- `withdrawn_at` populated;
- participant-authored content unchanged;
- status event created;
- request cannot reopen;
- reviewer may later archive it while preserving `withdrawn_at`.

## Gate 6: reviewer workflow

Using active same-workspace `support` member:

- select Participant D submitted request;
- verify direct `submitted -> archived` fails;
- move `submitted -> acknowledged`;
- set routing category without changing participant category;
- assign an active same-workspace `admin` or `support` membership row;
- reject assignment to inactive, outsider, viewer, trustee, individual, or
  cross-workspace member;
- move through `in_progress`;
- move to `waiting_for_participant`;
- return to `in_progress`;
- complete request;
- verify `completed_at`;
- reject reopening;
- archive completed request;
- verify `completed_at` remains and `archived_at` is populated.

## Gate 7: entries

Reviewer creates:

- one `participant_response`;
- one `internal_note`.

Expected:

- Participant D sees participant response only;
- Participant A and outsider see neither;
- reviewer sees both.

Archive a mistaken entry:

- content remains immutable;
- archive reason required;
- participant response disappears from normal participant view;
- reviewer audit history retains it;
- hard delete fails.

## Gate 8: status and audit events

Confirm immutable events for:

- initial submission;
- withdrawal;
- acknowledgment;
- status transitions;
- routing change;
- assignment change;
- entry archive;
- link archive.

Participant sees only participant-facing status events.

Reviewer sees all authorized events.

Direct status-event insert, update, and delete must fail through normal clients.

## Gate 9: inactive reviewer

Change or use a synthetic member whose `member_role = support` but status is not
active.

Expected:

- reviewer helper returns false;
- request select and update denied;
- entry insert denied;
- assignment and archive denied.

Do not modify a real operational member for this test.

## Gate 10: no-delete proof

Through each authenticated actor, attempt DELETE on all four Support tables.

Expected: every DELETE fails.

## Cross-module boundary proof

Verify that Support actions do not mutate:

- participant Goals;
- Wellness check-ins;
- transactions;
- budget periods or categories;
- program participation;
- Trust Engine records.

No link or request establishes intent, responsibility, relapse, incapacity,
misuse, consent for sharing, or external authority.

## Synthetic closeout

After testing:

- archive synthetic requests through approved lifecycle paths;
- do not hard delete;
- preserve synthetic history;
- mark every ID as synthetic in the test record;
- document pass/fail results and screenshots;
- confirm no service-role client was used.

## Stop conditions

Stop immediately if:

- one participant can see another participant's record;
- an outsider receives data;
- internal notes are participant-visible;
- a terminal request reopens;
- source records change through Support;
- DELETE succeeds;
- a reviewer acts outside their workspace;
- any Trust Engine or emergency action occurs.

## Exact next gate

After controlled execution, produce an authenticated Support validation
closeout. General participant activation remains separately gated.
