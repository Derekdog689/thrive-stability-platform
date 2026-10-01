# THRIVE Wellness Expanded Experience v0.2
## Exact Component-Change Candidate

**Status:** review-only candidate  
**Implementation:** not authorized  
**Database:** unchanged  
**Quick path:** frozen  
**Production:** untouched  
**Goals:** parked  
**Trust Engine:** out of scope

---

## 1. Verified current structure

The current expanded experience is implemented primarily across:

- `src/app/wellness/WellnessCheckinPreview.tsx`
- `src/app/wellness/WellnessCheckinCandidate.tsx`
- `src/app/wellness/wellnessFlowMachine.ts`

The live write contract remains in:

- `src/app/wellness/useWellnessCheckinCandidate.ts`

The database/write layer already supports the desired v0.2 experience:

- one completed expanded check-in = one INSERT;
- no write is required before completion;
- selected unanswered domains may remain null;
- `checkin_depth='expanded'` already identifies expanded completion;
- post-completion action remains optional.

**Conclusion:** no DB or write-hook change is required for Expanded Experience v0.2 unless implementation reveals a concrete defect.

---

## 2. Current mismatch

Current `WellnessCheckinPreview.tsx` does two jobs inside one expanded overlay:

1. signal selection;
2. rendering every selected question below the selection grid.

That produces the current questionnaire behavior:

```text
Look closer
  -> select cards
  -> selected questions accumulate vertically
  -> optional note
  -> Finish
```

The approved v0.2 behavior is:

```text
Look closer
  -> choose domains
  -> Continue
  -> one selected domain at a time
  -> optional final reflection
  -> Finish
  -> THRIVE return
```

The change is therefore primarily **client-side presentation + flow-state refinement**, not data architecture.

---

## 3. Component ownership candidate

### Keep `WellnessCheckinCandidate.tsx` as orchestration owner

Responsibilities remain:

- own `WellnessDraft`;
- own `wellnessFlowReducer`;
- call `createCompletedCheckin(..., "quick" | "expanded")`;
- own completed `savedCheckin`;
- own return rendering / optional action update;
- own current-state/history surfaces.

Do **not** move DB writes into child presentation components.

### Narrow `WellnessCheckinPreview.tsx`

Candidate responsibility:

- render accepted quick path;
- open the expanded experience;
- delegate expanded rendering to a focused child component.

It should stop owning:
- stacked selected-domain questions;
- expanded note progression;
- expanded finish layout.

### Add `WellnessExpandedExperience.tsx`

Candidate path:

`src/app/wellness/WellnessExpandedExperience.tsx`

Purpose:
- render all five v0.2 expanded screens;
- remain presentation-only;
- consume draft + selected-signal state via props;
- perform no Supabase reads or writes.

### Optional small shared config extraction

Candidate path:

`src/app/wellness/wellnessReflectionConfig.ts`

Move `reflectionGroups` and reflection-field mapping here so:
- chooser;
- guided question screen;
- return summaries;
- future visual refinements

all use the same domain definitions.

This extraction is optional but recommended to stop `WellnessCheckinPreview.tsx` from remaining a monolith.

---

## 4. Flow-machine change candidate

Current expanded flow:

```ts
| { phase: "expanded"; selectedSignals: WellnessReflectionKey[] }
| { phase: "saving"; depth: WellnessCheckinDepth; selectedSignals: WellnessReflectionKey[] }
```

Replace the single `expanded` phase with explicit expanded sub-phases.

### Candidate state

```ts
type ExpandedWellnessState =
  | {
      phase: "depth_select";
      selectedSignals: WellnessReflectionKey[];
    }
  | {
      phase: "depth_reflect";
      selectedSignals: WellnessReflectionKey[];
      currentSignalIndex: number;
    }
  | {
      phase: "depth_note";
      selectedSignals: WellnessReflectionKey[];
    };

export type WellnessFlowState =
  | { phase: "current" }
  | { phase: "signal" }
  | { phase: "depth_choice" }
  | ExpandedWellnessState
  | {
      phase: "saving";
      depth: WellnessCheckinDepth;
      selectedSignals: WellnessReflectionKey[];
    }
  | { phase: "return"; checkinId: string };
```

### Candidate events

Retain:
- `START_NEW_CHECKIN`
- `VIEW_CURRENT`
- `SELECT_OVERALL`
- `DONE_FOR_NOW`
- `LOOK_CLOSER`
- `TOGGLE_SIGNAL`
- `SAVE_SUCCEEDED`
- `SAVE_FAILED`
- `BACK_TO_QUICK`

Replace / add:

```ts
| { type: "CONTINUE_DEPTH" }
| { type: "NEXT_SIGNAL" }
| { type: "PREVIOUS_SIGNAL" }
| { type: "GO_TO_NOTE" }
| { type: "SKIP_NOTE" }
| { type: "FINISH_EXPANDED" }
| { type: "BACK_TO_SELECTION" }
```

### Transition rules

```text
depth_choice
  -> LOOK_CLOSER
  -> depth_select

depth_select
  -> TOGGLE_SIGNAL
  -> depth_select

depth_select
  -> CONTINUE_DEPTH
  -> depth_reflect(index=0)

depth_reflect
  -> NEXT_SIGNAL
  -> depth_reflect(index+1)

depth_reflect(last)
  -> NEXT_SIGNAL
  -> depth_note

depth_reflect
  -> PREVIOUS_SIGNAL
  -> depth_reflect(index-1)

depth_reflect(index=0)
  -> PREVIOUS_SIGNAL
  -> depth_select

depth_note
  -> PREVIOUS_SIGNAL
  -> depth_reflect(last)

depth_note
  -> FINISH_EXPANDED
  -> saving(expanded)

depth_note
  -> SKIP_NOTE
  -> saving(expanded)

depth_select
  -> BACK_TO_QUICK
  -> depth_choice
```

No event before `FINISH_EXPANDED` or `SKIP_NOTE` may write to DB.

---

## 5. Screen-to-component map

### Screen 1: chooser

Rendered by:
`WellnessExpandedExperience.tsx`

Input:
- `selectedSignals`
- reflection config
- `referenceCheckin` only for later use, not chooser labels

UI:
- heading: **Look a little closer**
- context: **Choose only what feels useful right now.**
- seven selectable cards
- no questions
- no previous values under cards
- selected-count summary
- `Continue`
- `Back to quick check-in`

Continue rule:
- disabled until at least one signal is selected.

### Screen 2/3: guided reflection

Rendered by the same component using:

```ts
const currentKey = selectedSignals[currentSignalIndex];
const currentConfig = reflectionConfig[currentKey];
```

UI:
- `1 of 3`, `2 of 3`, etc.;
- domain title;
- prior-value continuity cue only here, if available;
- exactly one prompt;
- exactly one answer set;
- compact progress strip;
- Back / Next.

Next rule:
- current selected domain must have an explicit answer before advancing;
- `not_sure` is an explicit valid answer;
- null means unanswered.

Back rule:
- previously entered answers remain in draft.

### Screen 4: optional final reflection

UI:
- heading: **Anything you want to remember about this moment?**
- optional text area;
- compact summary of selected domains + answers;
- Back;
- Finish check-in;
- Skip note.

`Skip note`:
- clears no existing note automatically;
- if note is empty, proceeds directly to completion;
- if implementation allows editing after entering text, skipping should require a deliberate decision not to save the note rather than silently discard typed text.

Recommended simplest v0.2 behavior:
- if text exists, CTA remains **Finish check-in**;
- show **Skip note** only when note is empty.

### Screen 5: return

Remains orchestrated by `WellnessCheckinCandidate.tsx`.

No new component is required in v0.2 unless the return section becomes unwieldy.

Return continues to consume:
- exact inserted row;
- `buildContextualWellnessReturn(...)`;
- real prior Wellness history;
- optional action update.

The return must not depend on the client-side step index after save.

---

## 6. Exact prop-contract candidate

### `WellnessCheckinPreview.tsx`

Remove expanded-specific rendering concerns.

Candidate props remain:

```ts
type WellnessCheckinPreviewProps = {
  experienceMode: WellnessExperienceMode;
  referenceCheckin: WellnessCheckinRow | null;
  draft: WellnessDraft;
  onDraftChange: (nextDraft: WellnessDraft) => void;
  flow: WellnessFlowState;
  onSelectOverall: (value: WellnessOverallDay) => void;
  onDoneForNow: () => void;
  onLookCloser: () => void;
  actionMessage: string;
  writeEnabled: boolean;
  focusOnMount?: boolean;
};
```

Remove from Preview:
- `selectedSignals`
- `onToggleSignal`
- `onFinishExpanded`
- `onBackToQuick`

Those move to the expanded child.

### `WellnessExpandedExperience.tsx`

Candidate props:

```ts
type WellnessExpandedExperienceProps = {
  flow: Extract<
    WellnessFlowState,
    | { phase: "depth_select" }
    | { phase: "depth_reflect" }
    | { phase: "depth_note" }
    | { phase: "saving"; depth: "expanded" }
  >;
  draft: WellnessDraft;
  referenceCheckin: WellnessCheckinRow | null;
  writeEnabled: boolean;
  actionMessage: string;

  onDraftChange: (nextDraft: WellnessDraft) => void;
  onToggleSignal: (key: WellnessReflectionKey) => void;
  onContinueDepth: () => void;
  onNextSignal: () => void;
  onPreviousSignal: () => void;
  onBackToSelection: () => void;
  onBackToQuick: () => void;
  onFinishExpanded: () => void;
};
```

No Supabase dependency.

---

## 7. Candidate rendering structure in `WellnessCheckinCandidate.tsx`

Current:

```tsx
<WellnessCheckinPreview ... />
```

Candidate:

```tsx
{quickFlowVisible ? (
  <WellnessCheckinPreview
    ...
    onLookCloser={() => dispatch({ type: "LOOK_CLOSER" })}
  />
) : null}

{expandedFlowVisible ? (
  <WellnessExpandedExperience
    flow={flow}
    draft={draft}
    referenceCheckin={referenceCheckin}
    writeEnabled={writeEnabled}
    actionMessage={actionMessage}
    onDraftChange={setDraft}
    onToggleSignal={(key) => dispatch({ type: "TOGGLE_SIGNAL", key })}
    onContinueDepth={() => dispatch({ type: "CONTINUE_DEPTH" })}
    onNextSignal={() => dispatch({ type: "NEXT_SIGNAL" })}
    onPreviousSignal={() => dispatch({ type: "PREVIOUS_SIGNAL" })}
    onBackToSelection={() => dispatch({ type: "BACK_TO_SELECTION" })}
    onBackToQuick={() => dispatch({ type: "BACK_TO_QUICK" })}
    onFinishExpanded={() => void complete("expanded")}
  />
) : null}
```

### Visibility contract

```ts
const quickFlowVisible =
  flow.phase === "signal" ||
  flow.phase === "depth_choice" ||
  (flow.phase === "saving" && flow.depth === "quick");

const expandedFlowVisible =
  flow.phase === "depth_select" ||
  flow.phase === "depth_reflect" ||
  flow.phase === "depth_note" ||
  (flow.phase === "saving" && flow.depth === "expanded");
```

The accepted quick screen must not be structurally rewritten beyond this separation.

---

## 8. Draft-answer rules

Keep the current `WellnessDraft` object.

Do not introduce a second answer store.

Map selected keys to existing draft fields:

```ts
stress -> draft.stress
sleep -> draft.sleep
energy -> draft.energy
confidence -> draft.confidence
routine -> draft.routine
recovery_support -> draft.recoverySupport
support_needed -> draft.supportNeeded
```

### Important deselection rule

If a participant selects a domain, answers it, returns to selection, then unselects it:

**candidate behavior:** clear that domain's draft answer immediately.

Reason:
- unselected means not part of this completed expanded reflection;
- leaving a hidden populated answer would create a DB write for something the participant explicitly removed.

This should be implemented through a controller callback, not inside the DB hook.

Candidate helper:

```ts
function clearReflectionAnswer(
  draft: WellnessDraft,
  key: WellnessReflectionKey,
): WellnessDraft
```

---

## 9. Historical continuity rule

Current chooser displays `Earlier: ...` on every card.

v0.2 removes this from Screen 1.

History appears only on the active guided-reflection screen:

```text
Earlier today: High
How does stress feel right now?
```

Rules:
- only show if a real reference value exists;
- same-day language: **Earlier today**;
- prior-day language: **Last time**;
- no inference if history is null;
- prior value does not preselect the new answer.

---

## 10. Transition/choreography candidate

No animation library is required for v0.2 unless native CSS proves insufficient.

Recommended implementation primitive:
- conditional rendering;
- CSS transform / opacity transitions;
- reduced-motion respect.

### Quick -> depth chooser

- overlay backdrop fades in;
- focused sheet translates upward ~16-24px into resting position;
- duration ~280ms;
- scene remains visible underneath.

### Chooser -> reflection

- chooser content fades/softly shifts;
- progress strip + active question replace it;
- duration ~200ms.

### Signal -> next signal

- outgoing question shifts/fades slightly left;
- incoming question shifts/fades from right;
- reverse direction on Back;
- ~180-220ms;
- no bounce.

### Reflection -> note

- content settles/fades vertically;
- ~200ms.

### Note -> saving -> return

- Finish disables repeated submission;
- expanded sheet resolves away only after successful INSERT;
- return appears as the continuation of the same interaction;
- avoid exposing an intermediate blank Wellness page.

### Reduced motion

With `prefers-reduced-motion: reduce`:
- use opacity-only or immediate state changes;
- no directional transforms required.

---

## 11. Error-state contract

### Save failure

Current reducer restores expanded selection after a failure.

v0.2 should restore the participant to `depth_note`, not restart the reflection.

Candidate state on failure:

```ts
SAVE_FAILED(expanded)
-> depth_note
```

Preserve:
- selected signals;
- answers;
- note.

Show error inline near final CTA.

Do not force participant through all selected questions again.

### Missing / stale selection

If `currentSignalIndex` exceeds selected-signal length after a back/edit action:
- clamp to last valid index;
- do not crash;
- no DB write.

---

## 12. Return reconciliation

The current return architecture can stay.

v0.2 should only refine the expanded return if phone testing proves necessary.

Required invariant:
- a quick check-in and expanded check-in may share the return chassis;
- expanded return should synthesize selected answered domains;
- quick return remains frozen and must not regress.

No generic Goals/Money navigation should be reintroduced.

---

## 13. Files that should remain unchanged in this gate

Unless implementation exposes an actual defect:

- `src/app/wellness/useWellnessCheckinCandidate.ts`
- live Supabase schema
- RLS policies
- Today data contract
- Goals
- Money
- Support ownership/authority
- Trust Engine

The current DB hook already supports the desired v0.2 persistence.

---

## 14. Implementation sequence if later approved

1. add/refactor reflection config;
2. expand `wellnessFlowMachine.ts` with explicit expanded sub-phases;
3. add `WellnessExpandedExperience.tsx`;
4. remove stacked expanded rendering from `WellnessCheckinPreview.tsx`;
5. wire new child into `WellnessCheckinCandidate.tsx`;
6. implement deselection-clears-hidden-answer rule;
7. add transition CSS + reduced-motion behavior;
8. build;
9. test no-write-before-finish;
10. test expanded single INSERT;
11. test Back/Next preservation;
12. test deselection;
13. test save failure restoration;
14. phone-walk chooser -> reflection -> note -> return;
15. verify accepted quick path unchanged;
16. no production merge until explicit approval.

---

## 15. Acceptance tests

### A. Quick regression
- Good -> Done for now still behaves exactly as accepted.

### B. Chooser
- Look closer opens chooser only.
- No questions visible.
- No prior values clutter chooser.
- Continue disabled at zero selected.

### C. One selected
- select Stress -> Continue.
- only Stress question appears.
- answer -> note screen.
- finish -> one expanded INSERT.

### D. Three selected
- Stress + Confidence + Routine.
- 1 of 3 / 2 of 3 / 3 of 3 progression.
- Back preserves answers.
- no stacked questionnaire.

### E. History cue
- prior value appears only on active question.
- no auto-selection from prior value.

### F. Deselect
- answer Stress;
- go back to chooser;
- unselect Stress;
- hidden stress answer is cleared and not persisted.

### G. Exit
- Back to quick before completion performs no write.

### H. Save failure
- stays at final reflection state with participant input preserved.

### I. Completion
- one INSERT with `checkin_depth='expanded'`;
- return opens directly;
- no "No next step saved."

### J. Motion
- transitions clarify direction;
- reduced-motion behavior remains usable;
- no page jump / visual cliff.

---

## 16. Candidate verdict

The v0.2 five-screen map fits the current codebase without changing the DB contract.

The cleanest implementation boundary is:

- **Candidate remains orchestration owner**
- **Preview keeps the accepted quick path**
- **new ExpandedExperience owns the focused five-screen sequence**
- **FlowMachine gains explicit expanded sub-phases**
- **Hook remains unchanged**

This is the smallest change that addresses the observed problem without reopening the engine.

## Next gate

Review/approve this exact component-change candidate.

If approved, the next gate is **preview-branch implementation only**, followed by build and phone testing. No DB change and no production merge.
