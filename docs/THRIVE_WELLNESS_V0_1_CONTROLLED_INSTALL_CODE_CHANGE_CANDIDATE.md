# THRIVE Wellness v0.1 Controlled Install + Code Change Candidate

## Status

Review-only candidate package.

No database execution, active-source replacement, production deployment, merge, Trust Engine change, or Goals work is authorized by this document.

## Approved contract

- One persisted Wellness row = one completed Wellness moment.
- Draft interaction remains client-side until completion.
- Quick and expanded are both valid completion paths.
- `chosen_next_step = null` means no optional action selected, not unfinished.
- Later same-day check-ins create new rows.
- Stored `hard` remains canonical and participant-facing copy is always **Struggling**.
- Stored `better` is a distinct overall value.
- Historical `checkin_depth` remains null unless known.
- No hard deletes.

## Candidate artifacts

- `docs/20261001122500_wellness_lifecycle_controlled_install_candidate_v0_1.sql`
- `docs/candidates/wellness-v0-1/wellnessVocabulary.ts`
- `docs/candidates/wellness-v0-1/wellnessFlowMachine.ts`
- this manifest

These files are candidates only and do not modify active application source.

## Controlled database install sequence

If separately approved later:

1. Reinspect the live Wellness table, constraints, indexes, foreign keys, row count, and RLS.
2. Confirm `checkin_depth` does not already exist.
3. Confirm the current `overall_day` rule still permits the inspected baseline `good | okay | hard | not_sure`.
4. Apply only the approved migration.
5. Verify:
   - `checkin_depth` exists and is nullable;
   - allowed depth is `quick | expanded | null`;
   - overall values include `better` while retaining all prior values;
   - RLS policies are unchanged;
   - historical rows remain intact.
6. Stop. Source/UI installation remains blocked until verification passes.

## Exact active-source changes after schema verification

### New source: wellness vocabulary

Install candidate to:

`src/app/wellness/wellnessVocabulary.ts`

Purpose:
- one bounded `WellnessOverallDay` type;
- one bounded `WellnessCheckinDepth` type;
- one canonical participant-facing mapping;
- no independent `Hard` / `Hard day` rendering.

### New source: Wellness flow machine

Install candidate to:

`src/app/wellness/wellnessFlowMachine.ts`

Purpose:
- explicit client-side lifecycle;
- no lifecycle inference from nullable database fields.

## Hook changes

File:

`src/app/wellness/useWellnessCheckinCandidate.ts`

### Keep

- auth session lookup;
- supported-person lookup;
- active-program participation lookup;
- workspace/program/person scoping;
- current-day and recent-history reads;
- multiple same-day rows;
- business-date handling;
- existing RLS-compatible access model;
- archive behavior;
- existing write error handling pattern.

### Type changes

`WellnessCheckinRow` gains:

```ts
overall_day: WellnessOverallDay;
checkin_depth: WellnessCheckinDepth | null;
```

`WellnessDraft.overallDay` becomes:

```ts
WellnessOverallDay | null
```

Every Wellness SELECT projection includes `checkin_depth`.

### Replace insert builder

Retire:

`buildInsertCandidate(draft)`

Install:

```ts
buildCompletedCheckinInsert(
  draft: WellnessDraft,
  depth: WellnessCheckinDepth,
): CompletedWellnessInsert | null
```

Rules:
- authenticated identity required;
- overall value required;
- supplied depth required;
- only participant-entered reflection values are written;
- skipped reflections remain null;
- `chosen_next_step` is always null at reflection INSERT;
- note is trimmed or null.

### Replace ordinary INSERT

Retire:

`executeInsertCandidate(draft)`

Install:

```ts
createCompletedCheckin(
  draft: WellnessDraft,
  depth: WellnessCheckinDepth,
): Promise<WellnessWriteResult>
```

Behavior:
- exactly one INSERT for a completed moment;
- include `checkin_depth`;
- prepend returned row to today/recent history;
- return exact inserted row;
- never create a next action during reflection INSERT.

### Retire same-day "finish" semantics

Retire `executeSameDayUpdate(draft)` as a completion mechanism.

A null `chosen_next_step` is a valid completed outcome and cannot be used to identify unfinished Wellness.

### Add explicit post-completion action update

```ts
updateCompletedCheckinAction({
  checkinId,
  chosenNextStep,
  participantNote,
})
```

Scope by:
- exact row id;
- current supported person;
- current program;
- current workspace;
- current business date;
- active status.

Permitted fields:
- `chosen_next_step`;
- `participant_note` only when the participant explicitly edits it;
- `updated_at`.

No reflection values are rewritten from the return layer.

## Interaction controller changes

File:

`src/app/wellness/WellnessCheckinCandidate.tsx`

Replace implicit save/finish booleans with:

```ts
const [flow, dispatch] = useReducer(
  wellnessFlowReducer,
  INITIAL_WELLNESS_FLOW_STATE,
);
```

Lifecycle:

```text
signal
  -> depth_choice
      -> Done for now -> saving quick
      -> Look a little closer -> expanded -> saving expanded
  -> return
```

### Quick

```text
Select overall
-> Done for now
-> createCompletedCheckin(draft, "quick")
-> return
```

### Expanded

```text
Select overall
-> Look a little closer
-> select signals
-> answer selected signals
-> optional final note
-> Finish check-in
-> createCompletedCheckin(draft, "expanded")
-> return
```

### Same-day repeat

"Check in again" resets the local draft/flow.

A second completed check-in creates a second row. Earlier rows remain unchanged.

## Expanded presentation contract

The expanded phase should **not** remain a long inline accordion below the quick check-in.

Candidate presentation:

- mobile-first focused full-height sheet / immersive overlay;
- rises from the Wellness scene after `Look a little closer`;
- original Wellness environment remains visible behind the sheet through controlled dim/blur/translucency;
- clear heading: **Look a little closer**;
- short context: **Choose only what feels useful right now.**;
- persistent visible exit: **Back to quick check-in**;
- selected-signal cards live inside this focused layer;
- only selected questions expand;
- optional reflection note sits at the end;
- final CTA is **Finish check-in**;
- finishing transitions directly into the THRIVE return rather than dumping the participant back mid-page.

This is a presentation candidate only. It does not alter the database contract.

## Input component changes

File:

`src/app/wellness/WellnessCheckinPreview.tsx`

Required:
- four principal states: Struggling / Okay / Better / Good;
- Not sure yet remains secondary;
- no `Save Check-In` button after overall selection;
- show `Done for now` and `Look a little closer`;
- Look closer performs no write;
- expanded phase is controlled by flow state;
- optional note stays at end of expanded path;
- final expanded CTA becomes `Finish check-in`;
- remove reflection-path dependence on `hasSavedCheckin` / `onUpdateCandidate`.

## Return contract

Return consumes the exact row produced by the completed INSERT.

Order:
1. saved acknowledgement;
2. factual grounded synthesis;
3. meaningful historical comparison only when supported;
4. contextual optional actions;
5. Done for now.

Do not:
- mechanically dump every field;
- show unrelated lane navigation as a Wellness recommendation;
- render `No next step saved`;
- render raw `hard`.

## Today integration

File:

`src/app/living-signal/today/_liveToday.tsx`

Candidate changes:
- use shared `wellnessOverallLabel`;
- treat every active Wellness row as completed;
- null next action never means unfinished;
- preserve multiple same-day moments;
- raw `hard` never reaches participant copy.

## Expected writes

### Quick

Good -> Done for now

Expected:
- one INSERT;
- `overall_day='good'`;
- `checkin_depth='quick'`;
- unentered reflections null;
- `chosen_next_step=null`.

### Expanded

Struggling -> Look closer -> Stress high -> Confidence low -> Finish

Expected:
- zero writes before Finish;
- one INSERT on Finish;
- `overall_day='hard'`;
- `checkin_depth='expanded'`;
- only answered reflections populated;
- `chosen_next_step=null`.

### Better

Better -> Done for now

Expected:
- one INSERT;
- `overall_day='better'`;
- participant UI renders Better.

### Optional action

After completed check-in, choosing `contact_supportive_person`:

Expected:
- UPDATE exact completed row;
- action + updated timestamp only unless participant deliberately edits note;
- reflection data unchanged.

### No action

Done for now from return:

Expected:
- no update required;
- row remains complete;
- no null-state nagging.

### Second same-day check-in

Expected:
- second INSERT;
- first row unchanged;
- history/Today may compare factual movement.

## Acceptance invariants

- one completed moment = one INSERT;
- quick is valid completion;
- expanded is valid completion;
- action is optional;
- null action is not unfinished;
- skipped reflection != Not sure;
- Better is distinct;
- raw hard never reaches participant-facing copy;
- historical depth is not fabricated;
- Trust Engine remains independent;
- no hard deletes.

## Installation gates

1. candidate package review;
2. schema migration approval;
3. schema-only execution;
4. read-only verification;
5. separate source-install approval;
6. preview code install;
7. build/test;
8. phone-walk Wellness;
9. reconcile Today;
10. only then discuss production.

## Next gate

After this package is verified in GitHub, the next approval decision is **schema migration execution only**.
