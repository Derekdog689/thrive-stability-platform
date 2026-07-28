# THRIVE Participant Financial Foundation Rollout Plan v0.1

## Status

Install-ready candidate plan.

No execution authorized by this document alone.

## Rollout sequence

### Gate 1: Static review

Review:

- live composite foreign-key compatibility;
- `supported_people(id, workspace_id)` uniqueness;
- view security behavior in current PostgreSQL version;
- policy overlap;
- generated-column compatibility;
- archive behavior;
- one-active-primary ownership rule.

### Gate 2: Dry run

Run candidate inside:

`begin; ... rollback;`

Confirm:

- all objects compile;
- no live rows change;
- no existing policy conflict;
- no missing referenced unique constraint;
- views resolve correctly.

### Gate 3: Controlled install

Only after explicit approval:

- execute install without final rollback;
- do not seed Johnny;
- do not attach existing sources yet;
- do not grant new navigation yet.

### Gate 4: Verification

Verify as:

- workspace admin;
- supported Person A;
- supported Person D;
- outsider.

Expected:

- admin sees ownership and participant structures;
- participant sees only owned sources;
- participant sees no unowned financial data;
- outsider sees no financial data;
- admin-only administrative reviews remain protected.

### Gate 5: Application shell

After database verification:

1. add `/today`;
2. add `/reports`;
3. evolve `/budget`;
4. add explanation UI;
5. keep test routes internal.

## Frozen exclusions

- no Trust Engine synchronization;
- no disbursement requests yet;
- no medical-bill request workflow yet;
- no bank import;
- no Johnny records;
- no production deployment;
- no push.
