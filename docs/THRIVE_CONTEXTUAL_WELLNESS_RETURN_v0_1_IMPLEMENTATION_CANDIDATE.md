# THRIVE Contextual Wellness Return v0.1 — Implementation Candidate

**Status:** Review-only candidate  
**Approved product anchor:** `docs/THRIVE_PARTICIPANT_VALUE_FRAMEWORK_v0_1.md`  
**Implementation status:** Not approved  
**Database changes:** None proposed  
**Runtime code changes:** None performed in this candidate pass

## 1. Purpose

Contextual Wellness Return v0.1 is the first bounded proof that THRIVE can return useful context from a participant's own recent wellness history instead of behaving like a repetitive intake form.

The participant value target is simple:

> A check-in should give something back.

The return should help the participant notice continuity, change, or a practical next step without diagnosing, judging, predicting, or inventing an explanation.

## 2. Verified live state

Current database truth already supports this candidate.

`public.participant_wellness_checkins` contains participant-scoped wellness history with fields including:

- `checkin_date`
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
- lifecycle/status fields

The current client hook already:

1. resolves the authenticated participant;
2. resolves active program participation;
3. loads today's active wellness check-in;
4. loads active wellness check-ins from a rolling seven-day window.

Therefore, v0.1 does **not** require a new wellness table, derived-analysis table, AI-summary table, or database migration.

## 3. Core boundary

THRIVE must keep four layers separate:

1. **Recorded fact** — what the participant selected or wrote.
2. **Observed comparison** — what is different or repeated across recent participant-owned records.
3. **Participant explanation** — only what the participant explicitly says.
4. **Useful return** — orientation or a next step grounded in those facts.

v0.1 may produce layers 1, 2, and 4.

It must **not fabricate layer 3**.

## 4. Non-clinical interpretation boundary

Allowed language describes records and comparisons.

Examples:

- "You marked energy low today."
- "Energy was okay or good on your other recent check-ins."
- "You have selected low energy on several recent check-ins."
- "You chose Handle a basic need as your next step."

Disallowed language assigns cause, diagnosis, risk, character, relapse meaning, or hidden intent.

Examples that v0.1 must not generate:

- "Your depression is getting worse."
- "Poor sleep is causing your low energy."
- "You are becoming unstable."
- "This pattern suggests relapse risk."
- "You are not following through."
- "You need clinical intervention."

The system may surface the participant's own support request or chosen next step when one exists, but must not create a clinical recommendation from wellness values.

## 5. Input window

Use the existing recent wellness window already loaded by the participant wellness hook.

For v0.1:

- **Current record:** today's active check-in when present.
- **Comparison records:** prior active check-ins available within the existing rolling seven-day window.
- Do not broaden the historical query in this implementation candidate.
- Do not query another person's records.
- Do not combine financial, goal, support, or Trust Engine data into the wellness comparison yet.

This keeps the first proof small and auditable.

## 6. Eligible dimensions

The following participant-entered wellness dimensions may be compared:

- overall day
- stress
- sleep
- energy
- confidence
- routine
- recovery support
- support needed

`chosen_next_step` is not scored as better or worse. It is used only as participant-owned action context.

`participant_note` is not machine-interpreted in v0.1. It may continue to be displayed verbatim to the participant, but v0.1 should not infer themes, sentiment, meaning, risk, or intent from free text.

## 7. Comparison rules

### 7.1 Minimum evidence

A contextual comparison requires:

- today's value for the dimension; and
- at least one prior recent check-in with a non-null value for the same dimension.

If prior evidence is absent, THRIVE should not pretend a trend exists.

### 7.2 Repeat signal

A repeat signal may be produced when today's value appears on at least **two prior recent check-ins** for the same dimension.

Preferred wording:

> "You've selected [value] for [dimension] on several recent check-ins."

This describes repetition only. It does not label the repetition good, bad, improving, worsening, concerning, or significant.

### 7.3 Change signal

A change signal may be produced when today's value differs from the participant's most recent prior non-null value for that dimension.

Preferred wording:

> "Today you marked [dimension] as [today]. Your last check-in was [prior]."

Where natural-language labels would make that sentence awkward, use a neutral alternative:

> "[Dimension] is different from your last check-in: [prior] → [today]."

Do not convert categorical choices into numerical severity scores for participant-facing interpretation.

### 7.4 Mixed recent history

If recent values vary without a clear repeat signal, THRIVE may say:

> "Your recent check-ins have varied on [dimension]."

Do not use statistical language such as volatility, variance, instability, or deterioration in v0.1.

### 7.5 No meaningful comparison

If the rules above do not produce a useful observation, THRIVE should return no comparison rather than filler.

Silence is preferable to fake insight.

## 8. Return hierarchy

Contextual Wellness Return v0.1 should produce **at most one primary contextual observation** per completed check-in.

Priority order:

1. **Participant explicitly asked for support today.**
   - Return the support context and route toward existing Support functionality.
   - Do not infer urgency beyond the participant's own selection.

2. **Participant selected a concrete `chosen_next_step`.**
   - Reinforce that participant-owned action.
   - If a recent comparison is also useful, it may appear as one short supporting line.

3. **Clear recent repeat signal.**
   - Surface one repeated dimension.

4. **Clear change from most recent prior check-in.**
   - Surface one changed dimension.

5. **Mixed recent history.**
   - Surface one neutral variability statement when genuinely useful.

6. **No useful context.**
   - Confirm the check-in and avoid manufactured analysis.

## 9. Dimension selection when more than one signal qualifies

To avoid turning the return into a report card, v0.1 should choose only one comparison dimension.

Candidate priority:

1. support needed
2. recovery support
3. routine
4. stress
5. sleep
6. energy
7. confidence
8. overall day

This order is a presentation rule, not a clinical weighting or severity scale.

Reasoning:

- support-related choices are closest to an actionable participant-owned next step;
- routine and stress can be expressed plainly without assigning diagnosis;
- sleep, energy, and confidence remain useful secondary signals;
- overall day is broad and already highly visible elsewhere in the UI.

This ordering remains subject to product review before implementation.

## 10. Suggested participant-facing return patterns

### Pattern A — chosen next step

**You checked in.**  
You chose **Handle a basic need** next.

Optional supporting context:

> Energy is different from your last check-in: okay → low.

### Pattern B — repeat

**Something you've been noticing**  
You've selected **low energy** on several recent check-ins.

Action line:

> Today you chose **Handle a basic need**.

### Pattern C — change

**Different from last time**  
Today you marked **stress as high**. Your last check-in was **okay**.

### Pattern D — mixed history

**Your recent check-ins**  
Sleep has varied across your recent check-ins.

### Pattern E — no comparison

**Check-in saved**  
Your information is here when you want to look back or decide what to work on next.

## 11. Presentation rules

The participant should not receive:

- multiple competing wellness interpretations;
- red/yellow/green risk labels;
- warning banners based solely on wellness selections;
- trend scores;
- percentages that imply wellness precision;
- streak pressure;
- moralized success/failure language;
- clinical-looking severity scales;
- automated conclusions from free-text notes.

The return should feel like orientation, not surveillance.

## 12. Proposed implementation surface

If implementation is later approved, the smallest likely runtime change is:

### Existing file: `src/app/wellness/useWellnessCheckinCandidate.ts`

Add a pure deterministic helper or derived return object based on the already-loaded `todayCheckin` and `recentCheckins`.

Candidate shape:

```ts
type ContextualWellnessReturn = {
  kind: "support" | "next_step" | "repeat" | "change" | "mixed" | "confirmation";
  dimension: string | null;
  headline: string;
  detail: string | null;
  actionLabel: string | null;
  actionHref: string | null;
};
```

This type is illustrative only. It is not installed by this candidate.

### Existing file: `src/app/wellness/WellnessCheckinCandidate.tsx`

Use the derived return after save and/or in the saved-check-in state so Wellness gives the participant context instead of merely echoing field values.

### Existing file: `src/app/page.tsx`

Optional second surface after Wellness behavior is validated: show one compact contextual wellness sentence on Today.

For the first implementation pass, Today may remain unchanged until the Wellness return is runtime-tested. This is the smaller and safer sequence.

## 13. Files not proposed for modification

No change is currently justified for:

- Supabase schema or migrations;
- RLS policies;
- Trust Engine code or data;
- financial tables;
- goals tables;
- support schema;
- resource schema;
- authentication mapping;
- participant explanation storage;
- AI/LLM infrastructure.

## 14. Test cases required before installation

### Case 1 — no history

Today is the participant's first check-in.

Expected: confirmation only. No trend or comparison language.

### Case 2 — one prior different value

Prior energy = okay. Today energy = low.

Expected: neutral change statement is eligible.

### Case 3 — repeated value

Two or more prior recent check-ins have low energy and today is low.

Expected: repeat statement is eligible.

### Case 4 — multiple eligible dimensions

Stress, sleep, and energy all changed.

Expected: only one dimension is selected according to the approved presentation priority.

### Case 5 — support requested

Today `support_needed = yes`.

Expected: support context takes priority. No diagnostic language.

### Case 6 — chosen next step

Participant selects a concrete next step.

Expected: participant-owned next step is reinforced and may take priority over comparative observation.

### Case 7 — participant note contains distressing or ambiguous text

Expected: v0.1 does not machine-interpret the note. Existing product safety or human-support mechanisms remain separate.

### Case 8 — null fields

Several optional dimensions are unanswered.

Expected: unanswered dimensions are ignored, not treated as negative signals.

### Case 9 — archived check-in

Archived historical row exists.

Expected: it is excluded under the current active-row query behavior.

### Case 10 — duplicate same-day records returned by legacy data

Expected: contextual logic must use the current selected `todayCheckin` and avoid treating same-day duplicate rows as multiple-day evidence.

## 15. Acceptance criteria

v0.1 is acceptable only if:

- the participant receives a useful return without additional data entry;
- every comparison is traceable to their own recent stored wellness records;
- no new factual claim is invented;
- no causal explanation is generated;
- no diagnostic, legal, fiduciary, relapse, or capacity conclusion is created;
- the return remains understandable without clinical vocabulary;
- the system produces no more than one primary contextual observation;
- no schema change is required;
- existing RLS boundaries remain unchanged;
- the Trust Engine remains completely independent.

## 16. Recommended implementation sequence after approval

1. Create deterministic contextual-return helper from existing wellness records.
2. Unit-test the comparison rules with synthetic data.
3. Render the return on Wellness only.
4. Build and lint.
5. Runtime-test with authorized participant accounts.
6. Review wording from a phone-sized participant view.
7. Only after Wellness is validated, decide whether a shortened contextual return belongs on Today.
8. Do not persist derived interpretation unless a separate future gate establishes a real need.

## 17. Candidate decision

**Current recommendation:** proceed with a code-only Wellness implementation candidate using the existing database and seven-day read path. Do not modify the database for Contextual Wellness Return v0.1.

This document does not approve implementation. It defines the bounded candidate for review.
