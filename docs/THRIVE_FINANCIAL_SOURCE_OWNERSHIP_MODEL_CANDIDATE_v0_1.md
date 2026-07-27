# THRIVE Financial-Source Ownership Model Candidate v0.1

## Status

Review-only candidate.

No SQL is authorized.

## Purpose

Create an exact ownership bridge between a supported person and a financial source without rewriting the existing source, batch, transaction, or review spine.

## Recommended direction

Prefer a dedicated ownership link table rather than placing a mutable `supported_person_id` directly on `financial_sources`.

Conceptual object:

`financial_source_owners`

Candidate fields:

- `id`
- `workspace_id`
- `program_id`
- `financial_source_id`
- `supported_person_id`
- `ownership_role`
- `status`
- `effective_from`
- `effective_to`
- `created_by`
- `created_at`
- `updated_at`

## Why a link table

A link table preserves history when:

- one supported person has multiple sources;
- a source is replaced;
- account ownership changes;
- a source is archived;
- historical imports must remain traceable;
- future read-only Trust comparison sources are introduced.

## Candidate invariants

- one active primary owner per financial source;
- source, program, workspace, and supported person must belong to compatible scope;
- historical ownership rows are archived, not deleted;
- ownership changes do not rewrite imported evidence;
- participant access resolves only through active or historically valid ownership;
- Trust records remain separate sources and do not imply ownership of THRIVE records.

## Candidate statuses

- `active`
- `inactive`
- `archived`

## Candidate ownership roles

- `primary`
- `authorized_viewer`
- `historical_owner`

## Open questions

- Can any source ever have more than one active supported-person owner?
- Should authorized viewers be allowed in MVP?
- Should historical ownership be date-effective or archive-only?
- Should program compatibility be enforced by composite foreign key or trigger?

## Recommendation

For MVP, use one active primary supported-person owner per source and defer shared-source behavior.

## Frozen boundary

No table, constraint, policy, trigger, or seed should be created in this gate.
