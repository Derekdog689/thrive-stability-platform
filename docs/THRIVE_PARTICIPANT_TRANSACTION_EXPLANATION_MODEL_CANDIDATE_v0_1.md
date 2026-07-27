# THRIVE Participant Transaction Explanation Model Candidate v0.1

## Status

Review-only candidate.

## Purpose

Store participant-provided context separately from bank evidence and administrative review.

## Conceptual object

`participant_transaction_explanations`

Candidate fields:

- `id`
- `workspace_id`
- `program_id`
- `supported_person_id`
- `staged_transaction_id`
- `explanation_category`
- `explanation_text`
- `status`
- `submitted_by`
- `submitted_at`
- `updated_at`
- `archived_at`

## Candidate explanation categories

- `recognized_purchase`
- `bill_or_essential`
- `transfer`
- `refund_or_reversal`
- `shared_expense`
- `medical_expense`
- `cash_withdrawal_context`
- `incorrect_or_unrecognized`
- `other`

## Candidate statuses

- `draft`
- `submitted`
- `needs_follow_up`
- `resolved`
- `archived`

## Core rules

- original bank data remains unchanged;
- one transaction may have more than one explanation version over time;
- participant explanation does not establish legal or fiduciary truth;
- explanation does not modify administrative review;
- explanation does not write into the Trust Engine;
- no hard delete;
- provenance is preserved.

## Participant actions

- add explanation;
- edit draft;
- submit;
- archive;
- request help.

## Staff actions

Future staff actions may include:

- mark needs follow-up;
- acknowledge;
- resolve;
- add separate staff note.

Participant text and staff notes should remain distinct.

## Trust boundary

A later Trust comparison screen may display participant explanation beside separately authorized Trust facts.

It must not copy the participant explanation into Trust records automatically.

## Frozen boundary

No explanation table, policy, form, or workflow should be installed in this gate.
