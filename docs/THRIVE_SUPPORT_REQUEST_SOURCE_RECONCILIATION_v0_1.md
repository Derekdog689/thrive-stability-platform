# THRIVE Support Request Source Reconciliation v0.1

## Status

Review-only source reconciliation.

This document does not authorize schema creation, SQL execution, participant Support writes, notifications, staff assignment, external sharing, consent expansion, clinical intervention, emergency escalation, Johnny activation, Trust Engine synchronization, service-role use, deployment, merge, or push.

## Verified live state

Read-only live-schema discovery found:

- no Support request table;
- no Support-related application function;
- no Support-related RLS policy;
- no approved realtime message path for participant Support.

The current `/support` route is a presentation shell only and performs no Support database read or write.

## Sources reconciled

This reconciliation is grounded in:

- `docs/THRIVE_FINANCIAL_AND_WELLNESS_DATA_MODEL_BLUEPRINT_v0_1.md`;
- `docs/THRIVE_PARTICIPANT_EXPERIENCE_BLUEPRINT_v0_1_APPROVED.md`;
- `docs/THRIVE_PARTICIPANT_EXPERIENCE_BLUEPRINT_v0_1.md`;
- `docs/THRIVE_JOHNNY_IMPLEMENTATION_ROADMAP.md`;
- `docs/THRIVE_SUPPORT_SHELL_REVIEW_AND_VALIDATION_CANDIDATE_v0_1.md`;
- current `src/app/support/page.tsx`;
- live database discovery results.

## Reconciled purpose

`Support` gives a participant a clear, low-friction way to ask for help and track what happened.

The first persistent Support workflow should answer:

1. What does the participant want help with?
2. What kind of help would be useful?
3. What request is currently open?
4. What happened with a prior request?
5. What is the request's current status?

A Support request is not a diagnosis, emergency determination, consent event, fiduciary instruction, Trust Engine command, or authorization for external sharing.

## Ownership and scope

A Support request should belong to:

- one workspace;
- one supported person;
- one participant program when applicable.

The request should remain participant-associated even when reviewed or responded to by authorized support staff.

Participant identity and scope must not be editable by the participant after record creation.

## Reconciled initial categories

The approved participant blueprint and current route overlap on:

- Budget or money help;
- Help understanding a transaction;
- Wellness support;
- Goal support;
- Something else or general support.

The approved participant blueprint additionally includes:

- Appointment or paperwork help;
- Technology or app help.

The current shell additionally includes:

- Program question.

### Candidate v0.1 category set

For review, the smallest complete category set is:

- `budget_money`;
- `transaction_understanding`;
- `wellness_support`;
- `goal_support`;
- `appointment_paperwork`;
- `technology_app`;
- `program_question`;
- `other`.

No category creates special authority.

## Reconciled participant-entered content

The minimum participant-authored request should include:

- category;
- participant message;
- optional description of what would be useful;
- optional contact preference.

The participant message should remain plain-language and participant-owned.

THRIVE must not silently rewrite the message into a clinical, legal, fiduciary, or emergency conclusion.

## Optional related records

The data-model blueprint allows optional links to:

- a transaction;
- a budget item;
- a Wellness entry;
- a Goal.

These links should be nullable and independently authorized.

A related record does not merge ownership or authority across modules.

No automatic Support request may be created from:

- a Wellness check-in;
- a Goal;
- a transaction;
- a spending pattern;
- a missed routine;
- a low-rated response;
- an unanswered prompt.

## Reconciled lifecycle

The data-model blueprint proposes:

- submitted;
- acknowledged;
- in progress;
- waiting for participant;
- completed;
- archived.

The current shell previews:

- Received;
- In review;
- Waiting for participant;
- Resolved;
- Archived.

### Candidate canonical stored states

For review, use:

- `submitted`;
- `acknowledged`;
- `in_progress`;
- `waiting_for_participant`;
- `completed`;
- `archived`.

### Candidate participant-facing labels

- `submitted` → **Received**
- `acknowledged` → **Acknowledged**
- `in_progress` → **In review**
- `waiting_for_participant` → **Waiting for you**
- `completed` → **Completed**
- `archived` → **Archived**

No hard delete is included in the MVP.

## Assignment and response

The data-model blueprint permits:

- assigned support person when applicable;
- response summary.

These fields require separate authorization and role review.

For the first schema candidate:

- assignment should be nullable;
- participant creation must not assign staff automatically;
- a response summary should be written only by an authorized reviewer;
- participant visibility of any response must be explicitly defined and tested;
- no notification behavior is implied.

## Contact preference

The current route anticipates a contact preference.

The sources do not define an authoritative contact-preference enum.

Therefore:

- contact preference may be included as a nullable candidate field;
- no specific contact method should be promised yet;
- contact details must come from an approved operational source;
- the participant's preference does not guarantee timing or availability.

## Emergency and crisis boundary

The approved blueprint permits emergency or crisis information only when separately approved and locally correct.

No urgent-safety workflow is authorized in this gate.

The Support route must not imply:

- continuous monitoring;
- immediate response;
- emergency dispatch;
- crisis intervention;
- clinical triage;
- guaranteed response time.

Any future urgent-safety workflow requires a separate authority, consent, local-information, staffing, notification, audit, failure-handling, and testing gate.

## Trust Engine and external-sharing boundary

A Support request does not itself create:

- Trust Engine authority;
- Trust Engine synchronization;
- consent for external sharing;
- expanded system access;
- clinical intervention;
- fiduciary authority;
- legal authority.

## Provenance and audit requirements

A future Support model should preserve enough provenance to answer:

- who created the request;
- when it was created;
- which supported person it belongs to;
- which workspace and program it belongs to;
- whether it links to another record;
- who changed its status;
- when it was changed;
- whether it is current, completed, or archived;
- whether any response was participant-entered or staff-entered.

## Current route defects observed

Two presentation-only class-name defects exist in `src/app/support/page.tsx`:

```text
shadow-smsm:p-8
py-2text-sm
```

Candidate corrections:

```text
shadow-sm sm:p-8
py-2 text-sm
```

These do not affect the source reconciliation.

## Reconciled candidate field inventory

The following field inventory is sufficiently supported for a future schema candidate:

- `id`;
- `workspace_id`;
- `program_id` nullable when justified;
- `supported_person_id`;
- `category`;
- `participant_message`;
- `requested_support` nullable;
- `contact_preference` nullable;
- `related_transaction_id` nullable;
- `related_budget_item_id` nullable;
- `related_wellness_entry_id` nullable;
- `related_goal_id` nullable;
- `status`;
- `assigned_support_person_id` nullable;
- `response_summary` nullable;
- `created_by`;
- `created_at`;
- `updated_at`;
- `completed_at` nullable;
- `archived_at` nullable.

This is an inventory only, not an approved schema.

## Remaining decisions before schema design

The following items are not fully resolved by the sources:

1. whether `program_id` is always required;
2. which role may acknowledge, assign, respond, complete, or archive;
3. whether participants may edit a submitted request;
4. whether participants may cancel or archive their own request;
5. whether response summaries are participant-visible by default;
6. what contact-preference values are allowed;
7. whether category changes are permitted after submission;
8. whether one request may link to more than one related record type;
9. whether completed requests may be reopened;
10. what retention or archive-review rules apply.

These decisions must be resolved before SQL is drafted.

## Reconciliation conclusion

The existing sources are aligned enough to support a review-only schema and RLS candidate after the unresolved authority and lifecycle decisions are answered.

No live Support table should be created yet.

## Exact next gate

Review and approve the unresolved Support authority and lifecycle decisions.

After approval, create a review-only Support request schema and RLS candidate.

Do not execute SQL, enable participant writes, connect notifications, assign staff, introduce emergency workflows, activate Johnny, synchronize with the Trust Engine, deploy, merge, or push.
