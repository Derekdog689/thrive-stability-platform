# THRIVE Vertical Slice Code-Change Map v0.1

Date: 2026-09-30
Status: review-only implementation map
Parent: THRIVE Vertical Proving Slice v0.1
Production impact: none
Database impact: none at this gate
Trust Engine impact: none

## Purpose

Identify the smallest realistic code surface required to prove:

Wellness -> Today -> Recovery Support -> Resources -> Resource Result -> Follow-up -> Story

without turning the proving slice into a full-app rewrite.

## Principle

Use existing reads and lifecycle structures first.

Do not create parallel models for concepts that already exist.

## Files that likely change

### 1. src/app/wellness/buildWellnessGuidance.ts

**Current role:**
Builds grounded Wellness summary and suggestions.

**Candidate change:**
When explicit recovery-support need exists, return a stronger Recovery Support next-path option.

Do not replace the current signal logic.

Add a bounded recovery-support action group or metadata that the Wellness UI can render as:

- Find a meeting
- Read something
- Connect with someone
- Build a routine

**Risk:** low to medium

**Schema:** none

### 2. src/app/wellness/WellnessCheckinPreview.tsx

**Current role:**
Renders the guided Wellness check-in and current THRIVE-noticed return.

**Candidate change:**
Add the Living Signal visual treatment and render Recovery Support next-path choices after the check-in return.

Preserve:
- check-in writes;
- same-day update behavior;
- existing participant note;
- existing guidance facts.

**Risk:** medium, participant-facing flow

**Schema:** none

### 3. src/app/wellness/contextualWellnessReturn.ts

**Current role:**
Builds saved-check-in contextual return and currently routes recovery/support choices toward /support.

**Candidate change:**
Introduce a contextual Recovery Support route that can send the participant to a recovery-specific choice surface rather than always ending at generic Support.

Possible candidate route:

/resources?context=recovery&from=wellness

or a small dedicated participant route such as:

/recovery-support

Do not encode clinical meaning in the route.

**Risk:** low

**Schema:** none

### 4. src/app/page.tsx

**Current role:**
Today surface, primary action, lane summaries, cross-lane synthesis.

**Candidate change:**
- Living Signal Today hierarchy;
- compact cumulative-progress presentation;
- carry Recovery Support thread forward;
- show Story preview / movement rather than equal card stack;
- avoid oversized raw Goal title as hero.

Keep existing data hooks.

**Risk:** medium

**Schema:** none

### 5. src/app/crossLaneSynthesis.ts

**Current role:**
Bounded read-only cross-lane synthesis.

**Candidate change:**
Potentially refine the Wellness -> Support return so it can point to Recovery Support / Resources when participant facts explicitly identify a recovery-resource need.

Do not broaden inference.

**Risk:** low

**Schema:** none

### 6. src/app/resources/page.tsx

**Current role:**
Participant Resource list and category filtering.

**Candidate change:**
Support contextual entry.

Example:
?context=recovery&intent=meeting

When context is explicit:
- lead with "You asked for a meeting";
- prioritize Recovery & community support;
- show the relevant verified Resource cards;
- avoid making the participant re-navigate the entire library.

Keep ordinary /resources browsing intact.

**Risk:** medium

**Schema:** none

### 7. src/app/resources/resourceData.ts

**Current role:**
Loads participant-visible canonical Resources, organizations, access paths, and guidance.

**Candidate change:**
Likely minimal.

Possible:
- helper for contextual filtering;
- Recovery-specific typed subcategory helper;
- preserve current source-of-truth reads.

Do not add client hard-coded recovery resource content here.

**Risk:** low

**Schema:** none

### 8. src/app/resources/[slug]/page.tsx

**Current role:**
Resource detail, primary access path, official-source guidance, Support handoff.

**Candidate change:**
Apply Living Signal resource-detail treatment and stronger next-action presentation.

Potential additions:
- clearer "what happens next";
- contextual back-link to Recovery Support;
- saved / tried affordance only if approved persistence exists.

Keep official path behavior and current source integrity.

**Risk:** medium

**Schema:** none for visual/action-path changes

### 9. src/app/support/page.tsx

**Current role:**
Persistent participant Support requests and current priority request.

**Candidate change:**
Before creating a new Wellness-driven Support request, prefer showing a related open request when the context is clearly the same.

This should be a UI continuity gate, not an automatic record merge.

**Risk:** medium to high because it touches write-path choice

**Schema:** likely none

### 10. src/app/support/useParticipantSupport.ts

**Current role:**
Loads Support lifecycle, participant entries/replies, assisted Money links, request creation.

**Candidate change:**
Potential helper to identify open requests by explicit context/category.

Do not change reviewer-controlled lifecycle.

If continuity can be handled entirely in page-level UI using already-loaded requests, leave this hook unchanged.

**Risk:** medium

**Schema:** none

### 11. Story surface

There is no approved production Story implementation yet.

The smallest proving-slice option should be:

- create a review-only / candidate Story component or route using existing read data;
- do not add a Story persistence table;
- derive Story events from participant-owned existing records.

Possible candidate files:

- src/app/story-candidate/page.tsx
- src/app/story/buildParticipantStory.ts

This should remain read-only in the first slice.

**Risk:** medium

**Schema:** none

## Files / systems that should remain unchanged in first slice

### Supabase schema

No migration proposed.

### Trust Engine

No touch.

### Bank ingestion

No touch.

### Money calculations

No change required to prove Recovery Support.

### Goal write lifecycle

No change required in this slice.

### Reviewer lifecycle

No change to:

submitted -> acknowledged -> in_progress -> waiting_for_participant -> in_progress -> completed

### Existing Resources governance

Keep current canonical-library / access-path / verification / visibility design.

## New code that may be cleaner than overloading existing pages

A tiny Recovery Support route may be justified:

src/app/recovery-support/page.tsx

Job:
- receive Wellness context;
- show the four paths;
- route meeting / reading toward Resources;
- route connect-with-someone toward Support;
- route build-a-routine toward a bounded client-side candidate experience.

This is preferable to stuffing four distinct jobs into generic /support.

No schema implied.

## Persistence questions intentionally deferred

The first coded slice should not invent persistence for:

- resource saved;
- meeting attended;
- reading completed;
- routine completed;
- participant preference.

For review/proof, visual states can be candidate/demo states.

Before production persistence, reconcile whether:

- support_request_entries;
- existing Support links;
- Goals;
- a future participant activity/event structure;

can safely represent the state.

Only then propose the minimum persistent write.

## Implementation order candidate

1. Add verified Recovery Resource content.
2. Add Recovery Support choice route / component.
3. Connect Wellness explicit recovery-support return to that route.
4. Add contextual Resources entry.
5. Refine Resource detail visual/action treatment.
6. Add Today carry-forward / Story preview.
7. Build read-only Story candidate from existing records.
8. Add Support continuity guard before duplicate request creation.
9. Phone-test full vertical flow.
10. Reconcile follow-up persistence only after the flow proves useful.

## Smallest buildable proof

The minimum proof that demonstrates the new philosophy is:

- Derek completes Wellness;
- Recovery Support is explicit;
- THRIVE offers four concrete paths;
- Derek chooses Find a meeting;
- THRIVE shows verified A.A. / NA / SMART starting points;
- Derek opens one real official finder;
- returning to THRIVE shows the Recovery Support thread still present;
- Story candidate shows that Recovery Support was acted on only if the participant confirms it.

That is enough to prove value + direction + resources + visual life + continuity without rebuilding every lane.

## Next gate

Review this code-change map together with:

- Recovery Resource Content Candidate v0.1;
- Living Signal visual mockups.

Then approve, revise, or reject the first implementation slice.
