# THRIVE Wellness Full-Lane Reconciliation Candidate v0.1

## Status

Approved review-only candidate for the current Wellness gate.

This document reconciles the live Wellness implementation against the approved Living Signal Experience Reset proving slice. It does not authorize production merge, deployment, database changes, SQL, Trust Engine synchronization, new authority, or changes to other participant lanes.

## Verified state

- Wellness is the active product gate.
- Today is parked.
- Goals is parked.
- Production is untouched.
- The current Wellness route is functional enough to read and save participant check-ins on the controlled branch.
- The current Wellness hero and current-state surface are visually closer to the Living Signal direction than the earlier shell.
- The full Wellness workflow still diverges materially from the approved proving slice after the landing surface.
- Existing participant Wellness history and saved check-ins are real application state and must not be discarded or fabricated.
- The current backend/write path is not being replaced in this candidate.

## Frozen boundaries

1. Do not change the database or schema.
2. Do not execute SQL.
3. Do not change Trust Engine ownership, authority, approvals, or synchronization.
4. Do not change Today, Goals, Money, Support, Story, or Recovery except for already-authorized route handoffs from Wellness.
5. Do not merge or deploy to production.
6. Do not delete historical Wellness records.
7. Preserve participant-authored notes and factual check-in history.
8. Preserve the existing participant/program resolution and write connection.
9. Bank or financial data remains separate from Wellness.
10. The proving slice is the product baseline for the Wellness experience.

## Product north star

Wellness is not a form.

It is a living participant-support layer that receives a small signal, notices useful context, returns options, preserves the participant's agency, and adds the moment to a larger story.

Target loop:

**check in -> optionally go deeper -> save -> THRIVE return -> choose something or nothing -> completion -> history**

The participant must be able to leave after recording a moment. A next action is optional, not the price of admission.

## Approved proving-slice baseline

### Screen 1: Wellness Check-In

Purpose: **Be real. Start here.**

Primary overall choices:

- Struggling
- Okay
- Better
- Good

The primary state language must not revert to Hard / Okay / Good or a clinical severity scale.

Optional signals shown in the proving slice include:

- Recovery support
- Mood
- Sleep
- Routine
- Cravings
- participant note

The implementation may preserve currently stored fields such as stress, energy, confidence, recovery support, and support needed where useful, but the participant-facing experience should not become a seven-domain assessment.

The participant should be able to select only what is useful.

Primary action:

**Save Check-In**

A quick check-in can be completed without a mandatory deeper workflow.

### Screen 2: Wellness Return

Purpose: **THRIVE notices. Brings options.**

After save, THRIVE should return:

- a factual acknowledgement;
- current participant-selected signal(s);
- useful continuity from prior check-ins when available;
- several relevant options;
- a clear ability to do nothing more right now.

Candidate return actions from the proving slice:

- Find a meeting
- Read something
- Connect with someone
- Build a routine
- Explore all options
- Not right now / Done for now

The return is not a prescription and does not convert self-report into a clinical conclusion.

## Current implementation findings

### What is working and should be preserved

1. **Real history exists.**
   The route displays actual same-day and seven-day check-in history.

2. **Same-day continuity exists.**
   The current code can compare a new check-in against an earlier same-day check-in.

3. **Quick exit exists.**
   "Keep it quick" and "I'm good for now" corrected the prior dead end.

4. **Participant notes persist.**
   Notes remain visible in current state and history.

5. **A saved-return state exists.**
   The current implementation can produce a post-save return rather than simply dumping the participant back at the start.

6. **Current-state usefulness exists.**
   The Wellness landing surface can show latest overall state, selected detail, saved next step, note, and history.

7. **The visual shell has improved.**
   The distinct coastal environment, warm cream surfaces, teal/aqua accent direction, and atmospheric hero are materially closer to the approved board.

These are assets. The correction should build on them rather than throw them away.

### What is not aligned

#### A. The primary response scale is wrong

Current:

- Good
- Okay
- Hard
- Not sure

Approved proving-slice baseline:

- Struggling
- Okay
- Better
- Good

"Not sure" can remain available as an escape/uncertainty affordance where useful, but it should not replace the approved four-state visual baseline.

#### B. Step 2 reads like a questionnaire

Current screen presents seven nearly identical white controls:

- Stress
- Sleep
- Energy
- Confidence
- Routine
- Recovery support
- Support

This collapses the Living Signal language into a form.

The proving slice instead uses distinct, compact signal rows with recognizable icon/color identity and lets the participant choose only what matters.

#### C. The lane loses its visual identity after the hero

Current interactive workflow falls back to:

- white cards;
- emerald selected states;
- slate text;
- generic form progress;
- repeated bordered controls.

This recreates the institutional green/white UI the reset was intended to escape.

Wellness needs a consistent lane identity through check-in, return, completion, and history.

#### D. THRIVE interprets too early and narrows too fast

Example:

**Confidence feels low -> Pick one small thing you can finish**

That suggestion may be reasonable, but the current workflow makes it feel like THRIVE has reached a conclusion and prescribed the answer.

The proving slice expects:

**signal -> notice -> several options -> participant chooses**

#### E. The existing "Step 1 of 4" wizard is too rigid

A forced four-step framing makes every check-in look equally heavy.

The desired experience is asymmetric:

- a 10-second check-in can be complete;
- a participant can optionally look closer;
- a return can expand when there is more signal;
- the system can stay light when nothing more is needed.

#### F. Lane accents are not being used as designed

The proving slice requires distinct icon/color language that remains cohesive.

Wellness should not paint every state emerald.

Candidate signal accents:

- Wellness / overall: aqua-teal
- Recovery support: violet
- Mood: soft blue / cyan
- Sleep: amber
- Routine: coral / rose
- Cravings: blue-teal
- Support / people: purple
- Neutral uncertainty: slate-blue

Exact values can be tuned in implementation, but meaning must not rely on color alone.

#### G. Completion is underexpressed

The proving slice defines a soft completion moment.

Saving a check-in should visibly resolve the interaction:

**Saved. This moment is part of your Story.**

No confetti, streak language, score, or childish reward.

#### H. History is useful but visually detached

The seven-day history is valuable and factual, but it currently reads as a separate data widget.

It should become a lightweight "your week" signal ribbon or geography-adjacent continuity surface that helps the participant see that check-ins accumulate into a larger picture.

## Reconciled Wellness full-lane candidate

### State 0: Wellness home / current state

Keep the approved coastal Wellness hero, but preserve the compactness accepted in the phone review.

Below the hero:

- latest check-in state;
- one or two useful current details;
- saved next step only if the participant actually chose one;
- note disclosure;
- Check in again;
- lightweight seven-day continuity.

No fake urgency.

### State 1: Quick check-in

Header:

**How are things going right now?**

Four primary visual states:

1. Struggling
2. Okay
3. Better
4. Good

Optional uncertainty action:

**Not sure yet**

This is secondary, not one of the four principal board states.

Optional note can be visible without requiring a separate final step.

Primary actions after choosing an overall state:

- **Save Check-In**
- **Look a little closer**

Order should favor saving the moment.

### State 2: Optional deeper signals

Prompt:

**Anything worth looking at closer?**

Use expressive compact rows/cards, each with its own icon and accent.

Candidate visible set:

- Mood
- Sleep
- Routine
- Recovery support
- Cravings
- Stress
- Energy
- Confidence
- Support

The screen should not imply that all must be answered.

Selected signals expand in place or open a focused single-question treatment.

Do not force the participant through every chosen signal as a long questionnaire when an inline or compact answer treatment can work.

### State 3: Save

Once the participant has provided as much or as little context as desired:

**Save Check-In**

A note remains optional.

A next step is not required before saving.

### State 4: THRIVE Return

After save, transition into a visually distinct return state.

Header candidate:

**Thanks for checking in, Derek.**

Support copy:

**Here is what THRIVE noticed from what you shared.**

Return structure:

1. Factual acknowledgement.
2. One useful continuity observation when evidence exists.
3. Participant-selected signal(s).
4. Relevant options.
5. "Not right now."

Examples:

If Recovery support is selected:
- Find a meeting
- Read something
- Connect with someone
- Build a routine

If Sleep is poor:
- Protect some rest
- Review a routine
- Read something useful
- Leave it here for now

If Confidence is low:
- Continue a goal
- Do one small useful thing
- Connect with someone
- Leave it here for now

If state is Good with no deeper signal:
- Save the moment
- Continue something already in motion
- Add a Story note
- Done for now

No option should be represented as the correct answer.

### State 5: Soft completion

When the participant chooses an action or chooses "Done for now":

Show a short completion treatment.

Candidate:

**Check-in saved.**

**This moment is part of your Story.**

Optional secondary text may state the participant's chosen next step.

Then provide:

- Return to Today
- View Story
- Continue the selected action, if one exists

Completion must resolve the lane. It must not reopen the check-in automatically.

### State 6: History / continuity

Preserve real check-in history.

Refine presentation toward:

- cumulative rather than streak-based;
- compact day markers;
- visible multiple check-ins on a day;
- expandable notes;
- no score;
- no "perfect week" framing.

## Behavioral rules

1. Saving an overall state alone is valid.
2. Deeper signals are optional.
3. A next step is optional.
4. "Not right now" is a complete valid outcome.
5. Returning to Today after completion must not show the finished check-in as "in process."
6. A same-day later check-in is a new moment, not a failure to finish the first.
7. Existing saved history remains factual and visible.
8. THRIVE may compare current participant self-report with prior participant self-report.
9. THRIVE must label interpretations as observations or possibilities, not facts.
10. A suggested action must be traceable to the participant's current input or previously saved participant context.
11. The participant can reject a possible connection without penalty.
12. Do not infer clinical status, relapse, risk, incapacity, or compliance.

## Visual system acceptance criteria

The full workflow passes visually only when all of the following are true:

### Daytime Fresh Start

- clear;
- calm;
- focused;
- light;
- clean;
- inviting.

### Environmental illustration

- Wellness uses its own environment;
- it does not reuse Today's hero;
- scenery changes with content where appropriate;
- scene remains visible rather than being buried under oversized opaque panels.

### Layered depth and texture

- soft surfaces;
- subtle grain;
- translucent layers;
- meaningful shadow depth;
- premium but approachable;
- no generic white-card stack.

### Clear lane accents

- Wellness has aqua/teal identity;
- signal subtypes may use distinct compatible accents;
- no hospital-green wash;
- icons reinforce meaning.

### Motion

Use restrained motion only where it communicates state:

- screen arrival;
- selected-signal response;
- return reveal;
- completion pulse;
- subtle environmental movement.

Respect reduced-motion settings.

### Evening Sanctuary

If check-in occurs in the evening:

- deeper teal/charcoal atmosphere;
- warm amber highlights;
- calm/private/reflection tone;
- no bright daytime wash.

This can reuse the same Wellness lane logic while changing atmosphere.

## Copy corrections

Use:

- Struggling
- Okay
- Better
- Good
- Not sure yet
- Anything worth looking at closer?
- Save Check-In
- Look a little closer
- THRIVE noticed
- Here are a few options
- Not right now
- Done for now
- This moment is part of your Story

Avoid using as the primary overall scale:

- Hard
- Low
- High
- concern
- warning
- risk
- compliance
- failure

Specific sub-signal choices such as low energy or high stress may remain factual participant self-report where appropriate.

## Implementation sequence after candidate approval

1. Preserve the current Wellness read/write hooks and real history.
2. Refactor participant-facing state orchestration so Save is available before a mandatory return/action sequence.
3. Replace the overall state set with Struggling / Okay / Better / Good plus secondary Not sure.
4. Rework deeper-signal selection into Living Signal cards/rows with lane accents and icons.
5. Separate Save from Return.
6. Rebuild Return around multiple relevant options rather than one primary prescribed suggestion.
7. Add the soft completion state.
8. Confirm Today no longer treats a completed Wellness check-in as unfinished.
9. Rework history presentation only after the functional loop passes.
10. Phone-test the entire lane from entry through completion and re-entry.

## Acceptance walkthrough

A Wellness pass is not accepted from the landing page alone.

Phone test must include at least these paths:

### A. Quick positive moment

Good -> optional note -> Save -> Return -> Done for now -> Today

Expected:
- saved;
- completion resolves;
- Today shows latest check-in, not "finish check-in."

### B. Difficult moment without action

Struggling -> optional signal -> note -> Save -> Return -> Not right now -> Today

Expected:
- no forced action;
- no clinical interpretation;
- history updated.

### C. Deeper signal with useful option

Okay/Struggling -> Recovery support -> Save -> Return -> Find a meeting

Expected:
- route handoff preserves context;
- Wellness remains completed.

### D. Same-day second check-in

Earlier Better/Good -> later Okay/Struggling -> optional deeper signal -> Save

Expected:
- new moment is preserved;
- factual comparison may appear;
- earlier entry remains intact;
- no streak/punitive framing.

### E. Uncertain participant

Not sure yet -> optional note -> Save

Expected:
- uncertainty is accepted;
- participant is not forced into a next step.

## Candidate conclusion

The current Wellness implementation is not a throwaway. Its real-data connection, history, quick exit, notes, same-day comparison, and improved visual shell are useful foundations.

The correction is to stop treating the lane as a four-step form and finish the product promised by the proving slice:

**Be real -> THRIVE notices -> THRIVE brings options -> you choose -> the moment becomes part of your Story.**

## Build status

Documentation-only candidate. No source code changed in this gate.

## git diff --check

Not run locally. Connector workflow, no local checkout.

## git status

No local checkout available in this workflow.

## Exact next gate

Review and approve, revise, or reject this Wellness full-lane reconciliation candidate.

After approval, implement only the Wellness full-lane correction on the existing Living Signal engine-reconnection branch, then run the full phone walkthrough before reopening Goals.
