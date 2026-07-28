# Renewing THRIVE Folder Governance

## Goal

Keep the repository understandable enough that a future working session can recover the project state without reconstructing the entire history.

## Canonical Source Files

The following files should remain at the repository root:

- `README.md` - human-readable product identity and current direction
- `GOVERNANCE.md` - permanent operating principles and boundaries
- `AGENTS.md` - agent-specific repository instructions
- `CLAUDE.md` - compatibility instructions for another coding assistant

## Documentation Structure

Recommended structure:

```text
docs/
  00_governance/
    EXECUTIVE_DOCTRINE.md
    COLLABORATION_GUARDRAILS.md
    FOLDER_GOVERNANCE.md

  10_architecture/
    supported_person/
    personal_finance/
    trust_bridge/
    permissions_and_rls/

  20_reconciliations/
    january_2025/
    schema_reconciliations/

  30_candidates/
    sql/
    ui/
    migrations/

  40_verified_results/
    live_tests/
    postflight/
    release_checkpoints/

  90_handoffs/
    CURRENT_EXECUTIVE_HANDOFF.md
    archived/
```

## Naming Rules

Use names that state both purpose and status.

Preferred pattern:

```text
THRIVE_<DOMAIN>_<ARTIFACT>_<STATUS>_v0_1.md
```

Status words should be explicit:

- `MODEL`
- `RECONCILIATION`
- `CANDIDATE`
- `INSTALL`
- `TEST_PLAN`
- `LIVE_TEST_RESULTS`
- `VERIFIED`
- `HANDOFF`
- `DEPRECATED`

## File Lifecycle

### Draft
Exploratory and incomplete. Not approved for execution.

### Candidate
Structured for review. Still not executable without separate approval.

### Install
Approved implementation artifact. Must not contain hidden extra scope.

### Verified
Executed and confirmed against live state.

### Deprecated
Retained only for historical traceability. Must say what replaced it.

## Candidate and Install Separation

Never use one file as both the design candidate and the executed installation record.

Use:

```text
..._CANDIDATE_v0_2.sql
..._INSTALL_v0_2.sql
```

## Handoff Rule

There should be exactly one current executive handoff:

```text
docs/90_handoffs/CURRENT_EXECUTIVE_HANDOFF.md
```

When superseded:

1. copy the old file into `docs/90_handoffs/archived/`;
2. include the date and ending commit in the archived filename;
3. replace the current handoff with the new verified state.

## Repository Cleanliness

Do not commit:

- private bank exports;
- private statement images;
- check images;
- unredacted personal documents;
- secrets or local environment files;
- generated private previews;
- temporary scratch output.

Commit only:

- verified documentation;
- reviewed source code;
- approved migration artifacts;
- reproducible test plans;
- non-sensitive validation summaries.

## Commit Discipline

A commit should represent one coherent checkpoint.

## Push Discipline

Do not push automatically after every commit.

Push only at an approved release or working-session checkpoint because the remote deployment may rebuild immediately.
