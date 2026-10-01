# THRIVE Living Signal Engine Reconnection Plan v0.1
## 2026-09-30

Status: **CANDIDATE / READ-ONLY RECONNECTION PHASE**

This branch starts from the sealed Living Signal visual checkpoint and is dedicated to reconnecting the existing THRIVE participant engine beneath the accepted Living Signal chassis.

## Verified starting point

- Source branch checkpoint: `09bff271379e086388db1c138241b61a87808e9e`
- Visual system: sealed / accepted
- MVP participant engine: inspected and mapped
- Supabase project: `ovzifochmrsaxabclxoe`
- Supabase project name: `thrive-stewardship-stability-platform`
- GitHub account used for THRIVE: `Derekdog689`
- THRIVE repo: `Derekdog689/thrive-stability-platform`
- Production routes: unchanged
- Trust Engine: untouched
- Schema: unchanged

## Frozen boundaries

During this phase:

- no production merge;
- no production route replacement;
- no SQL execution;
- no schema changes;
- no auth-user creation;
- no participant inserts;
- no Trust Engine synchronization;
- no service-role use;
- no destructive actions;
- no hard deletes;
- no fabricated Story history, resource outcomes, meeting attendance, or participant explanations.

The live database remains truth.

## Sequence

### Gate 1 — Shared participant/program identity
Goal: prove the Living Signal branch resolves the same participant identity and active program scope as the MVP.

Reuse:
- `AuthGate.tsx`
- `useThriveAccountPurpose.ts`
- `supported_people`
- `program_participants`
- `workspace_members`

Acceptance:
- participant account resolves as participant;
- admin/support accounts remain routed away from participant surfaces;
- conflict/unconfigured/signed-out states remain protected;
- no new authority logic is introduced.

### Gate 2 — Today read-only real-data connection
Goal: replace controlled Today preview state with participant-scoped live reads while preserving the accepted visual composition.

Read-only sources:
- Wellness current/recent check-ins;
- Goals current/open state;
- Money current plan/activity summaries;
- Support current status;
- existing cross-lane synthesis.

No participant writes in this gate.

Acceptance:
- displayed facts match the MVP for the same signed-in participant;
- no mock completion times/counts remain;
- no fabricated movement is shown;
- empty states remain useful;
- Today morning/evening use the same underlying facts;
- phone layout remains within sealed visual system.

### Gate 3 — Wellness reconnection
Reuse existing:
- check-in writes;
- same-day allowed update path;
- recent history;
- Wellness guidance;
- contextual Wellness return.

Acceptance:
- current write behavior is preserved;
- saved data matches MVP behavior;
- new Living Signal presentation does not expand authority.

### Gate 4 — Goals reconnection
Reuse existing:
- create;
- start;
- pause;
- continue;
- complete;
- archive;
- support/resource handoff.

Acceptance:
- actual `completed` state drives Goal Completion;
- no synthetic completion;
- completion can feed Story read-model facts.

### Gate 5 — Money reconnection
Reuse existing:
- budget periods/lines;
- financial activity;
- allocations;
- participant-entered activity;
- participant explanations;
- provenance boundaries;
- closeout lifecycle.

Acceptance:
- Living Signal Money reflects real period totals;
- imported evidence remains distinct from participant-entered activity;
- supportive copy remains human while avoiding invented motive/intent;
- closeout states are driven by actual lifecycle state.

### Gate 6 — Support + Resources
Reconnect together because the MVP already links them.

Reuse:
- support requests;
- responses/replies;
- status history;
- resource context;
- official resource/access-path structure;
- resource verification structure.

Acceptance:
- Resources appear contextually where useful;
- browse-all remains available;
- Support context remains traceable;
- no generic resource interaction is written into Support tables.

### Gate 7 — Story read model
First attempt must be derived from existing facts.

Potential fact sources:
- Wellness;
- Goals;
- Money;
- Support;
- verified resource interactions that already exist.

Acceptance:
- Story distinguishes completed, active, and still-carrying items;
- chronology is factual;
- no fabricated attendance, success, motivation, or explanation;
- no new Story persistence table unless a later gap is proven.

### Gate 8 — Live meeting/resource discovery
Preview meeting cards are illustrative only.

Production requires current verified source(s).

Acceptance:
- current meeting data;
- source provenance;
- location/time accuracy;
- no fabricated listings.

### Gate 9 — Follow-up persistence candidate
Only if needed after existing engine reuse.

Candidate questions:
- was this option used?
- did it help?
- was it not a fit?
- not yet?
- participant note?

This must receive its own schema/design gate before persistence.

### Gate 10 — Navigation consolidation
Only after capability parity.

Candidate outcomes:
- Today remains primary;
- Wellness / Goals / Money / Support remain primary lanes;
- Financial Activity becomes Money detail;
- Reports become Story/Money history;
- My Program becomes context/account;
- Resources remains available but is increasingly contextual.

### Gate 11 — Full phone parity test
Test:
- sign in;
- Today;
- Wellness write;
- Goal lifecycle;
- Money;
- Support/Resource;
- Story;
- morning/evening state;
- empty/error states.

### Gate 12 — Production migration plan
Only after all prior gates pass.

Must include:
- route migration;
- preview-only redirect review/removal;
- rollback plan;
- build verification;
- phone verification;
- explicit production approval.

## Immediate working gate

**Gate 1: Shared participant/program identity, followed by Gate 2: Today read-only real-data connection.**

No write-path reconnection begins until the read-only Today proof is accepted.

## Definition of success for the first proof

A signed-in participant opens the Living Signal preview and sees:
- their real preferred/display name;
- their real current Wellness state;
- their real Goal state;
- their real Money plan state;
- their real Support state;
- factual cross-lane context where currently supported;

all inside the sealed Living Signal Today chassis, with production untouched.
