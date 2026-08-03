# THRIVE Support Request Schema and RLS Candidate v0.1

## Status

Review-only candidate. No SQL execution, installation, participant writes, notifications, Johnny activation, Trust Engine synchronization, deployment, merge, or push is authorized.

## Verified live foundation

Existing scope:

- `workspace_id`
- `program_id`
- `supported_person_id`

Existing helpers:

- `is_supported_person_self`
- `is_supported_person_in_workspace`
- `is_program_in_workspace`
- `is_program_participant_active`
- `is_workspace_admin`
- `is_workspace_member`

Existing active reviewer roles are stored in `workspace_members.member_role`. Valid roles include `admin` and `support`.

Candidate reviewer rule:

> An authorized Support reviewer is an active workspace member in the same workspace whose `member_role` is `admin` or `support`.

## Approved product rules

- Every request belongs to the participant's active THRIVE program.
- Participants cannot choose or change workspace, program, or supported-person scope.
- Participants may create and view their own requests.
- Participants may withdraw only while status is `submitted`.
- Participant-authored content becomes read-only after submission.
- Reviewers may acknowledge, assign, respond, route, complete, and archive.
- Participant-visible responses and internal notes are separate records.
- The participant category remains unchanged.
- Staff may add an internal routing category.
- Requests may link to multiple same-scope THRIVE records.
- Links do not transfer authority or allow source-record mutation.
- Completed requests cannot reopen.
- Archived and withdrawn records remain in history.
- No hard delete.

## Candidate objects

1. `support_requests`
2. `support_request_entries`
3. `support_request_links`
4. `support_request_status_events`
5. `is_support_reviewer(uuid)`
6. scope-protection and lifecycle triggers

## `support_requests`

Candidate columns:

- `id uuid`
- `workspace_id uuid`
- `program_id uuid`
- `supported_person_id uuid`
- `participant_category text`
- `routing_category text null`
- `participant_message text`
- `requested_support text null`
- `contact_preference text null`
- `status text default 'submitted'`
- `assigned_member_id uuid null`
- `created_by uuid`
- `created_at timestamptz`
- `updated_at timestamptz`
- `withdrawn_at timestamptz null`
- `completed_at timestamptz null`
- `archived_at timestamptz null`

Required scoped foreign keys:

- workspace to `workspaces`
- `(program_id, workspace_id)` to `programs`
- `(supported_person_id, workspace_id)` to `supported_people`
- `(workspace_id, program_id, supported_person_id)` to `program_participants`
- assignment to `workspace_members`
- creator to `auth.users`

Participant categories:

- `budget_money`
- `transaction_understanding`
- `wellness_support`
- `goal_support`
- `appointment_paperwork`
- `technology_app`
- `program_question`
- `other`

Contact preferences:

- `in_app`
- `phone`
- `text`
- `email`
- `no_preference`

Statuses:

- `submitted`
- `withdrawn`
- `acknowledged`
- `in_progress`
- `waiting_for_participant`
- `completed`
- `archived`

No DELETE policy.

## Lifecycle

Candidate transitions:

- `submitted -> withdrawn`
- `submitted -> acknowledged`
- `submitted -> in_progress`
- `submitted -> archived`
- `acknowledged -> in_progress`
- `acknowledged -> waiting_for_participant`
- `acknowledged -> completed`
- `acknowledged -> archived`
- `in_progress -> waiting_for_participant`
- `in_progress -> completed`
- `in_progress -> archived`
- `waiting_for_participant -> in_progress`
- `waiting_for_participant -> completed`
- `waiting_for_participant -> archived`
- `withdrawn -> archived`
- `completed -> archived`
- `archived -> no transition`

Participant withdrawal must be the only participant-side update.

Reviewer updates must preserve participant-authored scope and content.

## `support_request_entries`

Purpose: permanent communication history.

Candidate fields:

- request and full scope identifiers
- `entry_type`
- `content`
- `created_by`
- `created_at`
- `archived_at null`

Entry types:

- `participant_response`
- `internal_note`

Rules:

- only reviewers create entries;
- participants see only `participant_response`;
- internal notes are staff-only;
- entries are append-only;
- no participant update or delete policy.

## `support_request_status_events`

Purpose: immutable lifecycle history.

Candidate fields:

- request and full scope identifiers
- `from_status`
- `to_status`
- `changed_by`
- `changed_at`
- `participant_visible`
- optional `change_note`

Rules:

- initial creation records `null -> submitted`;
- every later transition creates an event;
- direct client writes are not allowed;
- the lifecycle trigger creates events;
- participants see only participant-visible events;
- reviewers see all events in their workspace.

## `support_request_links`

Use typed links rather than a generic polymorphic foreign key.

Candidate target columns:

- `staged_transaction_id`
- `budget_category_id`
- `budget_line_id`
- `wellness_checkin_id`
- `goal_id`
- `prior_support_request_id`

Exactly one target is populated per link row. One request may have many link rows.

Every target must match the request's workspace, program, and supported person where the source table supports participant scope.

Verified targets:

- transactions: `staged_financial_transactions`
- budget categories: `budget_categories`
- budget lines: `participant_budget_lines`
- Wellness: `participant_wellness_checkins`
- Goals: `participant_goals`
- program: inherited by every request
- prior Support request: `support_requests`

Important budget-line rule:

`participant_budget_lines` does not carry workspace, program, or participant columns. Its scope must be validated through:

`participant_budget_lines -> participant_budget_periods`

No automatic link may be created.

## RLS candidate

### Requests

Participant:

- SELECT own active-program requests
- INSERT only for self and active program
- UPDATE only `submitted -> withdrawn`

Reviewer:

- SELECT and UPDATE only where `is_support_reviewer(workspace_id)` is true

### Entries

Participant:

- SELECT own `participant_response` entries only

Reviewer:

- SELECT all entries in authorized workspace
- INSERT participant responses or internal notes

### Links

Participant:

- SELECT own links
- candidate INSERT only for own request while parent status remains `submitted`

Reviewer:

- SELECT authorized workspace links

### Status events

Participant:

- SELECT own participant-visible events

Reviewer:

- SELECT authorized workspace events

No DELETE policies on any Support table.

## Assignment

An assigned member must:

- belong to the same workspace;
- have active membership;
- have `member_role` of `admin` or `support`.

Participants cannot assign staff. No automatic assignment.

## Cross-module boundary

THRIVE modules may reference authorized facts across the participant experience, but a Support request does not merge records, transfer ownership, transfer authority, or create permission to modify a linked source.

An “Ask for help with this” action may preselect context, but the participant must review and explicitly submit the request.

## Synthetic test scope

Test at minimum:

- Participant D
- Participant A
- outsider
- active `support` member
- workspace admin
- inactive or removed support member

Prove:

- self-only participant access;
- same-workspace and same-program isolation;
- valid participant withdrawal;
- rejected participant edits;
- internal-note secrecy;
- reviewer authority;
- rejected cross-scope links;
- immutable status history;
- no reopen after completion;
- no hard delete.

## Open decisions before executable SQL

1. May reviewers archive an untouched `submitted` request directly?
2. Is precise `budget_line_id` linking needed in v0.1?
3. May participants archive a mistaken link while the request is still `submitted`?
4. Are reviewer entries permanently append-only, or may reviewers archive an entry?
5. Should assignment reference `workspace_members.id` or the member's user ID?
6. When completed requests are archived, should `completed_at` remain populated?
7. When withdrawn requests are archived, should `withdrawn_at` remain populated?
8. Should status-event visibility be derived rather than stored?
9. Do participant-visible responses need a short title?
10. Confirm maximum lengths for requests, requested support, responses, and notes.

## Exact next gate

Resolve the ten open decisions together.

After approval, prepare an executable SQL candidate and a synthetic RLS/lifecycle test plan locally. Do not execute either package without a separate approval gate.

## Final approved candidate decisions

The following decisions were approved after live-schema reconciliation:

1. A reviewer may not archive an untouched `submitted` request. It must first be acknowledged.
2. Direct `participant_budget_lines` links are deferred. Support v0.1 may link to a budget category or participant budget period.
3. A participant may archive a mistaken link only while the request remains `submitted`.
4. Support entries are immutable. An authorized reviewer may archive an entry with a required reason.
5. Assignment references the reviewer’s `workspace_members.id`.
6. `completed_at` remains preserved when a completed request is archived.
7. `withdrawn_at` remains preserved when a withdrawn request is archived.
8. Participant visibility is derived from event type rather than a manually editable visibility flag.
9. Support entries may contain an optional title of up to 120 characters.
10. Approved limits are:
    - participant message: 4,000 characters;
    - requested support: 2,000 characters;
    - entry title: 120 characters;
    - participant response or internal note: 4,000 characters;
    - status note or archive reason: 1,000 characters.

Live inspection also confirmed that an authorized Support reviewer is an active
same-workspace member whose `member_role` is `admin` or `support`.

The completed rollback-protected implementation candidate is:

`docs/supabase/THRIVE_SUPPORT_REQUEST_SCHEMA_RLS_EXECUTABLE_CANDIDATE_v0_2.sql`

The earlier v0.1 executable candidate remains an incomplete design checkpoint
and is not the installation candidate.

## Updated exact next gate

Validate the v0.2 SQL candidate against the synthetic RLS and lifecycle test
plan, then commit the candidate package without executing SQL.

Installation requires a separate explicit approval.
