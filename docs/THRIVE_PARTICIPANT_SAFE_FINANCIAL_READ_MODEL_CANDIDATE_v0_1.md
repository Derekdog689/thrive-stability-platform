# THRIVE Participant-Safe Financial Read Model Candidate v0.1

## Status

Review-only candidate.

## Purpose

Allow a signed-in supported person to read only financial records linked to sources they own.

## Identity resolution

Participant access should resolve:

1. `auth.uid()`
2. active `supported_people.auth_user_id`
3. active supported person
4. active source ownership
5. downstream batch and transaction scope

## Candidate participant-readable objects

### Financial sources

Safe fields may include:

- source name
- institution name
- source type
- account mask
- source mode
- status

Exclude:

- creator identity
- internal administrative notes
- unrelated source metadata

### Import batches

Safe fields may include:

- statement period
- import status
- source lifecycle
- source filename display label
- declared row count
- review completion state

Exclude:

- uploader identity
- approver identity
- rejection details not intended for participant display
- internal hashes unless needed for audit export

### Transactions

Safe fields may include:

- posted date
- transaction date
- merchant
- category
- subcategory
- amount
- lifecycle
- participant explanation status

Exclude:

- raw parser errors
- internal fingerprints
- source-row identity
- administrator review notes
- Trust match fields

## Read architecture

Prefer participant-safe views or RPCs over direct exposure of administrative tables.

Candidate views:

- `participant_financial_sources_v1`
- `participant_financial_batches_v1`
- `participant_financial_transactions_v1`

## RLS principles

- retain all existing admin policies;
- add participant self-read without broad workspace membership;
- scope through exact source ownership;
- deny cross-participant reads even inside the same program;
- no participant INSERT, UPDATE, or DELETE on administrative tables.

## Empty-state behavior

If no owned source exists, return no rows and show a neutral message.

Do not infer incapacity, noncompliance, misuse, relapse, or irresponsibility.

## Frozen boundary

No view, function, or policy should be installed in this gate.
