# THRIVE Supported-Person Identity Dry-Run Preflight v0.1

## Status

Review-only preflight verification artifact.

This document does not authorize SQL execution, schema installation, production
testing, Johnny onboarding, external synchronization, deployment, push, or merge.

## Governing Artifacts

- Dry-run SQL:
  `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_DRY_RUN_CANDIDATE_v0_1.sql`
- Expected results:
  `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_DRY_RUN_EXPECTED_RESULTS_v0_1.md`
- Test and installation plan:
  `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_TEST_AND_INSTALLATION_PLAN_v0_1.md`
- Schema reconciliation:
  `docs/THRIVE_SUPPORTED_PERSON_IDENTITY_SCHEMA_RECONCILIATION_v0_2.md`
- Schema candidate:
  `docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_SCHEMA_CANDIDATE_v0_2.sql`

## Current Commit Checkpoint

The dry-run package was committed at:

    6e830fd Add supported person schema dry run package

The exact commit must be reconfirmed before any future dry-run execution.

## Purpose

This preflight establishes the evidence required before a controlled dry run may
be separately considered for approval.

It does not approve the dry run.

## Gate 1: Repository Verification

Confirm:

- [ ] Repository is `thrive-stability-platform`.
- [ ] Current branch is identified.
- [ ] Current Git commit is recorded.
- [ ] `git diff --check` is clean.
- [ ] All tracked changes are understood.
- [ ] The untracked `docs/RENEWING/` package remains outside the dry-run scope.
- [ ] No dry-run artifact has been edited after approval without a new review.
- [ ] No push, merge, or deployment is included in this gate.

Recommended read-only commands:

    pwd
    git branch --show-current
    git log -1 --oneline --decorate
    git diff --check
    git status --short

## Gate 2: Artifact Identity and Hash

Before future execution, calculate and record the SHA-256 hash of:

    docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_DRY_RUN_CANDIDATE_v0_1.sql

Recommended read-only command:

    sha256sum docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_DRY_RUN_CANDIDATE_v0_1.sql

Confirm:

- [ ] File path matches the approved artifact.
- [ ] File hash is recorded in the approval record.
- [ ] File hash matches the exact file reviewed for execution.
- [ ] File size and line count are recorded.
- [ ] No temporary or alternate SQL file will be substituted.

Recommended read-only commands:

    wc -l docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_DRY_RUN_CANDIDATE_v0_1.sql
    ls -l docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_DRY_RUN_CANDIDATE_v0_1.sql

## Gate 3: Transaction Boundary Verification

Confirm:

- [ ] The first transaction statement is `begin;`.
- [ ] The final transaction statement is `rollback;`.
- [ ] No `commit;` statement exists.
- [ ] Only one final `rollback;` statement exists.
- [ ] Inspection queries occur before the final rollback.
- [ ] No transaction boundary has been commented out or bypassed.

Recommended read-only commands:

    grep -nE '^[[:space:]]*(begin|commit|rollback);[[:space:]]*$' \
      docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_DRY_RUN_CANDIDATE_v0_1.sql

    tail -20 \
      docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_DRY_RUN_CANDIDATE_v0_1.sql

## Gate 4: Prohibited Content Verification

The dry-run file must contain none of the following:

- `insert into`
- `update` statements that modify existing production rows
- `delete from`
- `truncate`
- authentication-user creation
- Johnny-specific identifiers or personal data
- personal financial explanation-table creation
- Trust Engine reads or writes
- service-role application activity
- external synchronization
- production test-data creation
- hard-delete policies

Recommended read-only search:

    grep -niE \
      'insert[[:space:]]+into|delete[[:space:]]+from|truncate|service[_ -]?role|Johnny|Jutta Koster|Trust Engine|personal_financial_explanation|create[[:space:]]+user' \
      docs/supabase/THRIVE_SUPPORTED_PERSON_IDENTITY_DRY_RUN_CANDIDATE_v0_1.sql

Any unexpected match is a stop condition requiring review.

## Gate 5: Expected Object Verification

The dry run may temporarily propose only the approved supported-person objects.

Expected table work:

- `supported_people`
- `program_participants`
- supporting unique constraint on `programs(id, workspace_id)`

Expected helper functions:

- `is_supported_person_self(uuid)`
- `is_supported_person_in_workspace(uuid, uuid)`
- `is_program_participant_active(uuid, uuid, uuid)`
- `set_supported_person_identity_updated_at()`
- `protect_supported_person_identity_scope()`
- `protect_program_participant_scope()`

Expected policies:

- `supported_people_select_self`
- `supported_people_select_workspace_admins`
- `supported_people_insert_workspace_admins`
- `supported_people_update_workspace_admins`
- `program_participants_select_self`
- `program_participants_select_workspace_admins`
- `program_participants_insert_workspace_admins`
- `program_participants_update_workspace_admins`

Confirm:

- [ ] No workspace-member-wide supported-person read policy exists.
- [ ] No supported-person self-insert policy exists.
- [ ] No supported-person self-update policy exists.
- [ ] No delete policy exists.
- [ ] No unrelated table, function, trigger, or policy is created or replaced.

## Gate 6: Supabase Project Identity

Before any future execution, record:

- Supabase organization
- Supabase project name
- Supabase project reference
- database environment
- database branch
- database role
- operator
- execution date and time

Expected project from the verified inspection:

    Organization: DSS Enterprises
    Project: thrive-stewardship-stability-platform
    Environment shown: main / production
    SQL role shown: postgres

These values must be reverified in the Supabase interface immediately before
execution.

Do not rely solely on an old screenshot or browser tab.

## Gate 7: Live Pre-Run Schema Snapshot

Before execution, separately run only approved read-only inspection queries for:

- existing tables and RLS status
- current `programs` constraints
- current indexes
- current policies
- current helper functions
- current triggers

The snapshot must confirm that:

- [ ] `supported_people` does not exist.
- [ ] `program_participants` does not exist.
- [ ] `programs_scoped_identity_unique` does not exist.
- [ ] supported-person helper functions do not exist.
- [ ] supported-person policies do not exist.
- [ ] existing foundation tables still have RLS enabled.
- [ ] the live schema still matches the assumptions in the v0.2 reconciliation.

If the live schema differs, stop and reconcile before proceeding.

## Gate 8: Dry-Run Result Capture Plan

Before execution, establish how each result set will be captured.

Required evidence:

- table and RLS inspection
- constraint inspection
- index inspection
- policy inspection
- function inspection
- trigger inspection
- successful final rollback
- post-rollback schema verification

Screenshots alone are not preferred when copied result tables are available.

No result should be interpreted as installation approval.

## Gate 9: Post-Rollback Verification

After any separately authorized dry run, read-only verification must confirm:

- `supported_people` does not exist
- `program_participants` does not exist
- `programs_scoped_identity_unique` does not remain
- proposed helper functions do not remain
- proposed triggers do not remain
- proposed RLS policies do not remain
- existing foundation objects remain unchanged
- no records were inserted
- no authentication users were created

Any remaining object or changed foundation definition is a failed dry run.

Do not perform ad hoc repair or cleanup before inspecting and documenting the
resulting state.

## Mandatory Stop Conditions

Stop before execution if:

- the Supabase project identity is uncertain;
- the database branch or environment is uncertain;
- the database role is not explicitly approved;
- the Git commit differs from the approved checkpoint;
- the SQL hash differs from the approved hash;
- tracked changes are unexplained;
- the file contains `commit;`;
- the final `rollback;` is absent;
- prohibited content is found;
- the live schema differs from the reconciled foundation;
- any Johnny, Trust Engine, explanation-table, or production-data action appears;
- the expected-results checklist is incomplete;
- evidence capture is not ready;
- explicit dry-run execution approval has not been given.

## Approval Record

Current status:

    Preflight artifact prepared for review.
    Dry-run SQL has not been executed.
    Dry-run execution has not been approved.
    Schema installation has not been approved.
    Johnny onboarding has not been approved.
    Explanation-table creation has not been approved.
    Trust Engine synchronization has not been approved.
    Push, merge, and deployment have not been approved.

## Next Gate

Review this preflight against the committed dry-run SQL candidate and expected
results checklist.

After explicit approval, perform only the read-only repository and live-schema
preflight checks.

Do not execute the dry-run SQL.
