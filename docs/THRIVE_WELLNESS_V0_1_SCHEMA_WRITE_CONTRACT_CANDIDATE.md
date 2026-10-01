# THRIVE Wellness v0.1 Schema + Write Contract Candidate

**Status:** review-only candidate  
**Branch:** `feature/living-signal-engine-reconnect-v0-1`  
**Production:** untouched  
**Database execution:** not authorized  
**UI implementation:** not authorized  
**Trust Engine:** out of scope  
**Goals:** parked

## 1. Verified live state

`public.participant_wellness_checkins` currently stores completed participant Wellness observations including:

- `overall_day`
- `stress`
- `sleep`
- `energy`
- `confidence`
- `routine`
- `recovery_support`
- `support_needed`
- `chosen_next_step`
- `participant_note`
- lifecycle/archive timestamps

The live table allows multiple same-day rows. There is no one-row-per-day uniqueness constraint.

The live participant RLS already allows:

- authenticated participant INSERT for self;
- authenticated participant SELECT for self;
- authenticated participant UPDATE for self on active same-day rows.

The current `overall_day` constraint permits:

`good | okay | hard | not_sure`

The current implementation uses `chosen_next_step IS NULL` as part of an "unfinished check-in" concept. That meaning is rejected by this candidate.

## 2. Approved product contract

A Wellness row represents a **completed Wellness moment**.

Unfinished interaction state remains client-side and is not persisted in v0.1.

### Participant-facing overall scale

- Struggling
- Okay
- Better
- Good
- secondary escape: Not sure yet

### Canonical storage map

| Participant label | Stored value |
|---|---|
| Struggling | `hard` |
| Okay | `okay` |
| Better | `better` |
| Good | `good` |
| Not sure yet | `not_sure` |

Raw `hard` must never be rendered participant-facing.

## 3. Exact schema candidate

Add one nullable column:

`checkin_depth text null`

Allowed non-null values:

- `quick`
- `expanded`

Null is retained for historical records because historical depth cannot be inferred safely.

Expand the existing `overall_day` constraint to permit `better` while retaining every current value.

No other columns, indexes, foreign keys, RLS policies, triggers, archive rules, or existing records change in v0.1.

Candidate SQL file:

`docs/20261001115500_wellness_lifecycle_schema_candidate_v0_1.sql`

## 4. State-transition contract

```text
OPEN WELLNESS
  -> SIGNAL
       choose Struggling / Okay / Better / Good
       optional Not sure yet
  -> DEPTH DECISION
       Done for now
       OR Look a little closer

QUICK
  DEPTH DECISION -> optional collapsed note -> COMPLETE QUICK
  -> INSERT one completed row with checkin_depth='quick'
  -> THRIVE RETURN
  -> optional post-completion action
  -> DONE / TODAY / STORY

EXPANDED
  DEPTH DECISION -> choose areas
  -> answer only selected areas
  -> optional final reflection note
  -> COMPLETE EXPANDED
  -> INSERT one completed row with checkin_depth='expanded'
  -> THRIVE RETURN
  -> optional post-completion action
  -> DONE / TODAY / STORY

LATER SAME-DAY CHECK-IN
  -> starts a new interaction
  -> produces a new row when completed
  -> never rewrites the earlier Wellness moment
```

## 5. UI state machine candidate

Use explicit interaction state rather than inferring lifecycle from database nulls.

### State type

```ts
type WellnessFlowState =
  | { phase: "signal" }
  | { phase: "depth_choice" }
  | { phase: "expanded"; selectedSignals: ReflectionKey[] }
  | { phase: "saving"; depth: "quick" | "expanded" }
  | { phase: "return"; checkinId: string };
```

### Events

```ts
type WellnessFlowEvent =
  | { type: "SELECT_OVERALL"; value: WellnessOverallDay }
  | { type: "DONE_FOR_NOW" }
  | { type: "LOOK_CLOSER" }
  | { type: "TOGGLE_SIGNAL"; key: ReflectionKey }
  | { type: "SET_SIGNAL_VALUE"; key: ReflectionKey; value: string | null }
  | { type: "SET_NOTE"; value: string }
  | { type: "FINISH_EXPANDED" }
  | { type: "SAVE_SUCCEEDED"; checkinId: string }
  | { type: "SAVE_FAILED" }
  | { type: "START_NEW_CHECKIN" };
```

### Transition rules

- `SELECT_OVERALL`: stores draft value only; no DB write.
- `DONE_FOR_NOW`: valid only after an overall value exists; calls completed quick insert.
- `LOOK_CLOSER`: valid only after an overall value exists; no DB write.
- `TOGGLE_SIGNAL`: changes selected expanded areas only; no DB write.
- `SET_SIGNAL_VALUE`: changes draft only; no DB write.
- `FINISH_EXPANDED`: calls completed expanded insert.
- successful INSERT transitions to `return`.
- selecting an optional return action updates the exact completed row; it does not change completion status.
- `START_NEW_CHECKIN` resets local draft and begins a new Wellness moment.

## 6. Exact hook changes

Current hook:
`src/app/wellness/useWellnessCheckinCandidate.ts`

### Keep

- authenticated session resolution;
- supported-person resolution;
- active program participation resolution;
- current-day and recent-history reads;
- multiple same-day rows;
- current RLS-compatible scoping;
- existing insert error handling structure;
- active/archive lifecycle behavior.

### Replace

#### Replace `WellnessDraft.overallDay: string | null`

with a bounded type:

```ts
type WellnessOverallDay =
  | "hard"
  | "okay"
  | "better"
  | "good"
  | "not_sure";
```

#### Add

```ts
type WellnessCheckinDepth = "quick" | "expanded";
```

#### Extend `WellnessCheckinRow`

```ts
checkin_depth: WellnessCheckinDepth | null;
```

#### Replace `WellnessInsertCandidate`

with:

```ts
type CompletedWellnessInsert = {
  workspace_id: string;
  program_id: string;
  supported_person_id: string;
  checkin_date: string;
  overall_day: WellnessOverallDay;
  checkin_depth: WellnessCheckinDepth;

  stress: string | null;
  sleep: string | null;
  energy: string | null;
  confidence: string | null;
  routine: string | null;
  recovery_support: string | null;
  support_needed: string | null;

  chosen_next_step: null;
  participant_note: string | null;

  status: "active";
  created_by: string;
};
```

### Replace function

Current:

`buildInsertCandidate(draft)`

Candidate:

```ts
buildCompletedCheckinInsert(
  draft: WellnessDraft,
  depth: WellnessCheckinDepth,
): CompletedWellnessInsert | null
```

Rules:

- requires authenticated identity and `overallDay`;
- writes supplied `depth`;
- writes only participant-entered reflection values;
- never fabricates skipped signals as `not_sure`;
- writes `chosen_next_step: null`;
- trims note or writes null.

### Replace function

Current:

`executeInsertCandidate(draft)`

Candidate:

```ts
createCompletedCheckin(
  draft: WellnessDraft,
  depth: WellnessCheckinDepth,
): Promise<WellnessWriteResult>
```

This is the only ordinary reflection INSERT.

### Retire as a completion mechanism

Current:

`executeSameDayUpdate(draft)`

Reason: it infers "unfinished" partly from `chosen_next_step IS NULL` and only updates action/note fields. Under v0.1, null action is a valid completed outcome.

### Add explicit post-completion update

```ts
updateCompletedCheckinAction({
  checkinId,
  chosenNextStep,
  participantNote,
}: {
  checkinId: string;
  chosenNextStep: WellnessNextStep | null;
  participantNote?: string;
}): Promise<WellnessWriteResult>
```

Required guards:

- exact `id`;
- authenticated supported person;
- active program/workspace scope;
- same business date;
- `status='active'`.

Permitted UPDATE fields:

- `chosen_next_step`
- `participant_note` only when participant explicitly edits it
- `updated_at`

Do not update reflection fields through the return action path.

## 7. Exact write payloads

### Quick completed example

Participant:
Good -> Done for now

```ts
{
  workspace_id,
  program_id,
  supported_person_id,
  checkin_date,
  overall_day: "good",
  checkin_depth: "quick",

  stress: null,
  sleep: null,
  energy: null,
  confidence: null,
  routine: null,
  recovery_support: null,
  support_needed: null,

  chosen_next_step: null,
  participant_note: null,
  status: "active",
  created_by
}
```

### Expanded completed example

Participant:
Struggling -> Look closer -> Stress high -> Confidence low -> Routine mixed -> final note -> Finish

```ts
{
  workspace_id,
  program_id,
  supported_person_id,
  checkin_date,
  overall_day: "hard",
  checkin_depth: "expanded",

  stress: "high",
  sleep: null,
  energy: null,
  confidence: "low",
  routine: "mixed",
  recovery_support: null,
  support_needed: null,

  chosen_next_step: null,
  participant_note: "Work felt overwhelming this morning.",
  status: "active",
  created_by
}
```

### Better completed example

```ts
{
  overall_day: "better",
  checkin_depth: "quick",
  // all optional reflection values null unless participant entered them
}
```

### Post-completion action example

Participant receives THRIVE return and chooses to contact someone.

```ts
{
  chosen_next_step: "contact_supportive_person",
  updated_at: now
}
```

No reflection fields are rewritten.

### Completed with no action

```text
chosen_next_step = null
```

Meaning:

**No optional action selected. The check-in is still complete.**

It must never be interpreted as unfinished.

## 8. Presentation vocabulary contract

Create one shared Wellness vocabulary module, candidate path:

`src/app/wellness/wellnessVocabulary.ts`

It owns the participant-facing map:

```ts
export const WELLNESS_OVERALL_LABEL = {
  hard: "Struggling",
  okay: "Okay",
  better: "Better",
  good: "Good",
  not_sure: "Not sure yet",
} as const;
```

Wellness, Today, Story, history, and future participant surfaces import the same mapping.

No screen may independently convert `hard` to "Hard", "Hard day", or similar participant-facing language.

## 9. Return contract

The return is generated from the completed row plus authorized historical comparison.

Order:

1. factual acknowledgement;
2. grounded synthesis of selected/answered signals;
3. meaningful comparison only when supported by real history;
4. optional contextual actions;
5. Done for now.

Do not dump every raw signal back mechanically.

Do not show unrelated lane navigation as if it were a Wellness recommendation.

Do not display a null action as "No next step saved."

## 10. Today handoff contract

Today consumes a completed Wellness moment.

It may show:

- latest participant-facing overall label;
- meaningful same-day movement;
- selected next action if one exists;
- note/history where useful.

It must not:

- expose raw `hard`;
- interpret null `chosen_next_step` as unfinished;
- tell the participant to "finish" a completed quick or expanded check-in.

## 11. Migration sequencing if later approved

1. Re-inspect live table and constraints immediately before execution.
2. Confirm no unexpected `checkin_depth` column already exists.
3. Confirm current `overall_day` constraint still matches the inspected live state.
4. Apply the approved DDL migration.
5. Regenerate/refresh application types if used.
6. Verify constraints and RLS remained intact.
7. Only then implement hook/state changes.
8. Test quick path.
9. Test expanded path.
10. Test optional action update.
11. Test multiple same-day check-ins.
12. Test Today handoff.
13. Phone-walk full Wellness lane.
14. Do not merge production until explicit approval.

## 12. Acceptance invariants

- A row equals a completed Wellness moment.
- One Wellness moment creates one INSERT.
- A later same-day moment creates another INSERT.
- Quick is valid completion.
- Expanded is valid completion.
- Action is optional.
- Null action is not unfinished.
- Skipped reflections remain null.
- Explicit "Not sure" remains `not_sure`.
- Raw `hard` is never user-facing.
- Better is stored distinctly as `better`.
- Historical depth is not fabricated.
- No hard deletes.
- Trust Engine remains independent.

## 13. Exact next gate

Review/approve, revise, or reject this migration + write-contract package.

No migration or UI implementation occurs until explicit approval.
