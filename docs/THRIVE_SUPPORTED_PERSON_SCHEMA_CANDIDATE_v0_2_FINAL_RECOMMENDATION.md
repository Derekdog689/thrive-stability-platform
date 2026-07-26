# THRIVE Supported-Person Schema Candidate v0.2 Final Recommendation

## Status

Review-only final recommendation.

## Evidence Reviewed

The recommendation is based on:

- the installed supported-person schema;
- post-install structural verification;
- authenticated read testing;
- authenticated write testing W1 through W17;
- the v0.2 logical schema candidate;
- the live-evidence reconciliation;
- corrected lifecycle terminology.

## Final Finding

No database migration is required for supported-person schema candidate v0.2.

The installed schema already provides:

- workspace-scoped supported-person identity;
- separate program participation;
- nullable unique authentication linking;
- restrictive foreign keys;
- immutable workspace and creation lineage;
- immutable participation identity and scope;
- administrator-only create and update authority;
- linked active supported-person self-read;
- no broad workspace-member access;
- no direct supported-person self-write policy;
- no support-member write policy;
- no viewer write policy;
- no outsider write authority;
- no delete policy;
- non-destructive lifecycle states.

## Installed Lifecycle Vocabulary

Supported-person status:

- `active`
- `paused`
- `archived`

Program-participation status:

- `active`
- `inactive`
- `completed`

These installed values remain authoritative.

## Database Recommendation

Retain the installed database schema unchanged.

Do not create:

- an additional v0.2 migration;
- replacement status constraints;
- expanded RLS policies;
- delete policies;
- explanation tables;
- Trust Engine foreign keys or synchronization objects.

## Application Recommendation

The next work belongs in the application layer.

Candidate workflows for separate review:

1. Administrator creates a supported-person record.
2. Administrator creates or links an optional authentication account.
3. Administrator assigns the supported person to a program.
4. Supported person views their identity and participation.
5. Administrator pauses or archives a supported-person record.
6. Administrator changes participation lifecycle status.
7. Person-facing profile-change requests are reviewed without granting direct table-write authority.
8. Audit evidence is displayed for creation and permitted changes.

Each workflow must preserve role boundaries and use the installed RLS policies.

## Authentication Boundary

Creating a supported-person record must not automatically create an authentication account.

Authentication linking requires a separate approved onboarding workflow.

No Johnny authentication account is authorized by this recommendation.

## Explanation Boundary

No explanation table or explanation workflow is included.

Any future explanation model requires its own reviewed candidate addressing:

- authorship;
- consent;
- visibility;
- amendment history;
- disputed context;
- observation linkage.

## Trust Engine Boundary

THRIVE and the Trust Engine remain independent systems.

No synchronization, shared ownership, merged authority, or external sharing is authorized.

## Synthetic Fixture

The current synthetic supported-person and participation records remain controlled regression evidence.

No cleanup or deletion is authorized.

## Approval Status

- v0.2 schema candidate reviewed: yes
- live-evidence reconciliation completed: yes
- database migration recommended: no
- executable SQL created: no
- SQL executed: no
- service-role access used: no
- Johnny auth user created: no
- Johnny inserted: no
- explanation table created: no
- Trust Engine synchronized: no
- push performed: no
- merge performed: no
- deployment performed: no

## Next Gate

Prepare a review-only supported-person onboarding workflow candidate.

The first workflow candidate should cover:

- administrator-created supported-person identity;
- optional later authentication linking;
- program participation assignment;
- lifecycle handling;
- audit evidence;
- explicit exclusion of Johnny-specific execution.

Do not create Johnny's account or records during workflow design.
