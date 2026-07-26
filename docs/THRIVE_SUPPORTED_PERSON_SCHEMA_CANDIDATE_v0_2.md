# THRIVE Supported-Person Schema Candidate v0.2

## Candidate Status

Review-only candidate.

This document proposes the next supported-person schema shape based on the installed database schema, authenticated row-level-security findings, and controlled synthetic write testing completed through W17.

This document is not an executable migration.

No SQL is authorized for execution by this candidate.

## Verified Evidence Base

The candidate is grounded in the following completed repository evidence:

- supported-person identity schema reconciliation
- installed schema verification
- row-level-security application testing
- authenticated read matrix
- authenticated write-test checklist
- Phase A validation report
- Phase B validation report
- Phases C-F validation report
- final authenticated write-test reconciliation

Authenticated testing established:

- W1-W17 executed
- 17 tests passed
- zero tests failed
- administrator routine synthetic writes were permitted
- supported-person writes were denied
- support-member writes were denied
- viewer writes were denied
- authenticated-outsider writes were denied
- immutable workspace, lineage, and participation scope changes were denied

W18 and W19 remain deferred.

## System Boundaries

THRIVE and the Trust Engine remain independent systems.

THRIVE may later compare separately authorized facts across systems, but this candidate does not:

- merge ownership
- merge authority
- merge approval paths
- synchronize records
- establish fiduciary authority
- import Trust Engine records
- create legal conclusions
- create clinical conclusions
- infer intent from financial observations

Bank data remains observational evidence only.

A transaction does not establish intent, irresponsibility, relapse, incapacity, trust misuse, or any legal, clinical, or fiduciary conclusion.

## Verified Existing Core

### Workspace

Verified controlled workspace:

- ID: `71000000-0000-4000-8000-000000000001`
- purpose: synthetic supported-person RLS testing
- type: demo
- status: active

The workspace remains the primary authorization boundary.

### Program

Verified controlled program:

- ID: `71000000-0000-4000-8000-000000000002`
- workspace: controlled supported-person test workspace
- type: demo
- status: active

Programs remain workspace-scoped.

### Supported Person

Verified supported-person records include:

- Supported Person A: `71000000-0000-4000-8000-000000000003`
- Supported Person B: `71000000-0000-4000-8000-000000000004`
- Supported Person C: `71000000-0000-4000-8000-000000000007`

Verified supported-person attributes observed through the installed application and authenticated tests:

- `id`
- `workspace_id`
- `auth_user_id`
- `display_name`
- `preferred_name`
- `status`
- `external_reference`
- `created_by`
- `created_at`
- `updated_at`

Verified behavior:

- administrator may create a supported person inside an authorized workspace
- administrator may update permitted metadata
- non-administrator identities may not create supported-person records
- supported people may not directly alter their own identity row
- support members may not alter supported-person identity rows
- viewers may not alter supported-person identity rows
- outsiders may not create supported-person records
- workspace scope is immutable after creation
- creation lineage is immutable after creation

### Program Participation

Verified participation records include:

- Participation A: `71000000-0000-4000-8000-000000000005`
- Participation B: `71000000-0000-4000-8000-000000000006`
- Participation C: `71000000-0000-4000-8000-000000000008`

Verified participation attributes observed through the installed application and authenticated tests:

- `id`
- `workspace_id`
- `program_id`
- `supported_person_id`
- `participant_role`
- `status`
- `created_by`
- `created_at`
- `updated_at`

Verified behavior:

- administrator may create participation inside authorized workspace and program scope
- administrator may perform an approved lifecycle-status transition
- supported people may not create or alter participation rows
- support members may not alter participation rows
- viewers may not alter participation rows
- outsiders may not create participation rows
- program-participant identity and scope are immutable
- supported-person reassignment is denied
- no delete behavior was tested or authorized

## v0.2 Candidate Principles

### 1. One Supported-Person Identity per Workspace Context

A supported-person record represents one person inside one THRIVE workspace context.

The record does not represent:

- a trust beneficiary record
- a legal guardianship record
- a clinical diagnosis
- a fiduciary determination
- a bank-account owner
- a consent event
- a recovery-status conclusion

### 2. Optional Authentication Link

`auth_user_id` remains nullable.

This permits a supported-person record to exist before the person receives direct application access.

Candidate rule:

- an authentication link may be added only through a separately approved onboarding workflow
- creating a supported-person record must not automatically create an authentication account
- absence of an authentication link must not imply incapacity or lack of participation
- linking an authentication account must be independently auditable

Johnny's authentication user is not authorized by this candidate.

### 3. Workspace Scope Is Immutable

`workspace_id` remains required and immutable after creation.

A supported-person record must not be moved between workspaces by ordinary update operations.

A future transfer workflow, if ever needed, must create explicit historical evidence rather than silently rewriting scope.

No transfer workflow is proposed in v0.2.

### 4. Creation Lineage Is Immutable

`created_by` and `created_at` remain immutable.

Routine metadata updates must not alter creation lineage.

### 5. Human-Readable Identity Fields

Candidate supported-person identity fields:

- `display_name`
- `preferred_name`
- `external_reference`
- `status`

These fields support application display and operational identification.

They do not establish legal identity, clinical identity, or fiduciary status.

### 6. External Reference Is Not Authority

`external_reference` may identify a record in an authorized external workflow.

It must not independently grant:

- workspace access
- program access
- support authority
- financial authority
- Trust Engine authority
- consent
- legal standing

### 7. Lifecycle Uses Non-Destructive States

No hard delete is proposed.

Candidate supported-person status set:

- `active`
- `inactive`
- `archived`

Candidate participation status set:

- `active`
- `inactive`
- `completed`
- `paused`

Final allowed values must be reconciled against the live database before any migration candidate is written.

No current record should be changed merely to conform to this candidate.

### 8. Participation Is Separate from Identity

Program participation remains a separate entity from supported-person identity.

A participation row expresses program involvement, not ownership of the supported-person identity.

Participation does not create:

- Trust Engine access
- financial authority
- legal authority
- clinical authority
- consent for external sharing

### 9. Program and Person Scope Are Immutable

Candidate immutable participation fields:

- `workspace_id`
- `program_id`
- `supported_person_id`
- `participant_role`
- `created_by`
- `created_at`

Routine operations may change only separately approved lifecycle fields.

### 10. Role-Based Reads Do Not Grant Writes

The authenticated tests established that a user may have authorized read visibility without write authority.

Candidate policy principle:

- workspace visibility is not equivalent to administrative authority
- program visibility is not equivalent to participation-management authority
- support membership is not equivalent to identity-management authority
- viewer access never implies write access
- supported-person self-access does not automatically permit identity-row updates

## Proposed v0.2 Logical Shape

The following is a logical candidate only.

### `supported_people`

Candidate purpose:

Store the minimum THRIVE identity and application-linking information required to represent one supported person within a workspace.

Candidate logical fields:

| Field | Candidate requirement | Candidate behavior |
|---|---|---|
| `id` | required | stable UUID |
| `workspace_id` | required | immutable workspace scope |
| `auth_user_id` | optional | separately approved authentication link |
| `display_name` | required | operational display label |
| `preferred_name` | optional | person-centered display preference |
| `status` | required | non-destructive lifecycle state |
| `external_reference` | optional | external correlation only |
| `created_by` | required | immutable creation lineage |
| `created_at` | required | immutable creation timestamp |
| `updated_at` | required | maintained on permitted updates |

Candidate uniqueness questions requiring live reconciliation:

- whether `auth_user_id` is unique globally
- whether `external_reference` is unique per workspace
- whether an archived record may retain its authentication link
- whether one authentication user may ever represent more than one workspace context

No uniqueness change is proposed until these questions are reconciled against live constraints.

### `program_participants`

Candidate purpose:

Represent a supported person's participation in a THRIVE program without merging participation into identity.

Candidate logical fields:

| Field | Candidate requirement | Candidate behavior |
|---|---|---|
| `id` | required | stable UUID |
| `workspace_id` | required | immutable workspace scope |
| `program_id` | required | immutable program scope |
| `supported_person_id` | required | immutable person scope |
| `participant_role` | required | explicit participation role |
| `status` | required | non-destructive lifecycle state |
| `created_by` | required | immutable creation lineage |
| `created_at` | required | immutable creation timestamp |
| `updated_at` | required | maintained on permitted updates |

Candidate uniqueness question requiring live reconciliation:

- whether one supported person may have more than one participation row in the same program
- whether historical participation cycles require separate rows
- whether inactive and completed participation rows remain visible to the supported person
- whether program scope must be independently checked against workspace scope through a database constraint or trigger

No constraint change is proposed until the live schema is inspected.

## Candidate Authorization Model

### Administrator

Candidate allowed operations:

- create supported-person record inside authorized workspace
- update explicitly permitted identity metadata
- create program participation inside authorized workspace and program
- perform separately permitted lifecycle transitions

Candidate denied operations:

- change supported-person workspace scope
- change supported-person creation lineage
- change participation identity
- change participation workspace scope
- change participation program scope
- hard delete records through routine application flows

### Supported Person

Candidate allowed operations:

- read their authorized supported-person context
- read their authorized participation context
- use separately designed person-facing profile workflows in the future

Candidate denied operations in this schema layer:

- insert supported-person identity rows
- directly update protected identity rows
- create participation rows
- alter participation scope or lifecycle

A future person-facing preferred-name request must be a separate workflow and must not silently expand direct table-write authority.

### Support Member

Candidate allowed operations:

- read authorized support context according to workspace membership
- perform future support actions only through separately approved purpose-built workflows

Candidate denied operations in this schema layer:

- directly update supported-person identity rows
- directly update participation rows
- alter workspace or program scope

### Viewer

Candidate allowed operations:

- read only the context authorized by membership and RLS

Candidate denied operations:

- all supported-person and participation writes

### Authenticated Outsider

Candidate behavior:

- zero workspace visibility
- zero program visibility
- no supported-person insert
- no participation insert
- no supported-person or participation update

## Explanation Data

An explanation table is explicitly excluded from this v0.2 candidate.

No explanation, reason, interpretation, consent, clinical finding, financial conclusion, or behavioral conclusion table is created by this document.

A future explanation model must separately define:

- who supplied the explanation
- what observation it refers to
- whether it is person-authored or support-authored
- authorization and consent boundaries
- amendment history
- visibility rules
- whether the explanation is factual, contextual, disputed, or unresolved

No explanation data may be fabricated.

## Trust Engine Relationship

No Trust Engine table, foreign key, identifier, synchronization mechanism, ownership field, or shared authority model is proposed.

A future comparison workflow may reference authorized facts across systems without merging the systems.

Any external sharing or expanded access requires separate authority or consent.

## Johnny Boundary

This candidate does not authorize:

- creating Johnny's authentication user
- inserting Johnny into `supported_people`
- creating Johnny's program participation
- linking Johnny to a workspace
- importing Johnny's bank data
- importing Trust Engine data
- creating an explanation record
- creating consent records
- drawing clinical, recovery, legal, or fiduciary conclusions

Johnny remains outside the installed synthetic test fixture.

## Deferred Questions

The following must be answered from the live database before an executable v0.2 migration candidate is prepared:

1. Exact installed column data types and defaults.
2. Exact check constraints for supported-person status.
3. Exact check constraints for participation status.
4. Exact uniqueness constraints.
5. Exact foreign-key delete and update behavior.
6. Exact trigger definitions for `updated_at`.
7. Exact installed RLS policy definitions.
8. Exact helper-function ownership and security mode.
9. Whether authenticated users can ever be linked to multiple supported-person records.
10. Whether repeated program participation requires historical rows.
11. Whether archive behavior already exists elsewhere in the schema.
12. Whether any installed indexes are redundant or missing.
13. Whether person-facing profile changes should use requests rather than direct identity updates.
14. Whether synthetic Person C and Participation C should remain permanently as regression fixtures.

## Candidate Acceptance Criteria

This review-only candidate may advance to an executable SQL candidate only after:

- live schema definitions are re-inspected
- constraints are reconciled
- policies are reconciled
- triggers and helper functions are reconciled
- candidate changes are documented line by line
- no Johnny-specific data is included
- no Trust Engine synchronization is included
- no explanation table is included
- a dry-run test plan is approved
- explicit execution approval is obtained

## Candidate Recommendation

Retain the current installed core model:

- workspace-scoped supported-person identity
- separate program participation
- nullable authentication link
- immutable workspace and lineage fields
- immutable participation identity and scope
- non-destructive lifecycle states
- role-specific read and write policies

The v0.2 effort should refine constraints, lifecycle definitions, onboarding boundaries, and auditability without broadening authority.

## Approval Status

- Review-only candidate created: yes
- SQL migration created: no
- SQL executed: no
- Johnny auth user created: no
- Johnny inserted: no
- explanation table created: no
- Trust Engine synchronized: no
- cleanup performed: no
- push performed: no
- merge performed: no
- deployment performed: no

## Next Gate

Review this candidate against the exact live database definitions.

The next permitted step is a read-only schema reconciliation that compares:

- installed tables
- installed columns
- installed constraints
- installed indexes
- installed triggers
- installed helper functions
- installed RLS policies

against this v0.2 logical candidate.

Do not create executable SQL until that reconciliation is complete and separately approved.
