# THRIVE Current-Affordance Continuity Checkpoint
Date: 2026-10-03

## Checkmark

**APPROVED**

The next working gate is:

> **THRIVE Current-Affordance Continuity Map v0.1**

This checkpoint records agreement that THRIVE should now reconcile the capabilities it already exposes before adding new participant affordances or long-horizon analytics.

## Verified state entering this gate

- The participant visual chassis is established.
- Today, Wellness, Goals, Money, Support, Resources, Recovery Support, and Story all exist as meaningful participant-facing lanes or surfaces.
- Recovery Support has proven a real handoff from Wellness into governed Resources.
- The Recovery Resource catalog is live and participant-visible for the approved first slice.
- Resource destination testing confirmed that THRIVE can reliably bring participants to official external starting points, while external-site usefulness can vary.
- Story v0.1 is live for inspection and truthfully reflects saved THRIVE activity.
- Story phone testing exposed that several cards return only to generic lane pages and do not yet preserve the meaning of the underlying thread.
- Goal phone testing exposed the same continuity gap: completed Goals can be factually present without yet connecting to related Money, Resources, Support, Wellness, or Story context.
- Money-to-Support continuity has already shown that a handoff can lose useful context.
- Wellness-to-Recovery Support is currently the strongest example of an internal THRIVE circuit that carries useful context forward.

## Product finding

The next problem is not lack of capability.

The next problem is **internal continuity**.

THRIVE already has many useful parts, but some actions currently terminate as isolated facts or generic navigation rather than remaining connected to the participant's larger thread.

The governing model for this pass is:

```text
entry
→ action
→ useful destination
→ saved fact
→ return path
```

Every existing participant affordance should be evaluated against that chain.

## Scope of the map

For every current participant affordance, inspect:

1. **Action**
   - What did the participant actually do?

2. **Fact**
   - What factual record does THRIVE currently save or expose?

3. **Destination**
   - Where does the action currently lead?

4. **Existing relationship**
   - Which current THRIVE lane or object does this naturally relate to?

5. **Continuity loss**
   - What context is dropped, duplicated, stranded, or reduced to a generic landing page?

6. **Return surface**
   - Where should the fact legitimately reappear using surfaces THRIVE already has?

Primary lanes and surfaces:

- Today
- Wellness
- Goals
- Money
- Support
- Resources
- Recovery Support
- Story

## Examples already observed

### Goals

A completed Goal is truthfully shown in Story, but tapping it can return only to the generic Goals page.

The continuity question is not whether to invent a new Goals feature. It is whether the Goal already has meaningful relationships to existing THRIVE capabilities such as Money, Resources, Support, Wellness, or its own detail/history and whether that context should survive completion.

### Money

A Money plan or Money activity may legitimately lead into Support.

The participant should not have to restate context THRIVE already possesses when a handoff is explicitly initiated.

### Wellness

Wellness can identify a participant-selected Recovery Support need and offer an explicit Recovery Support path.

That current flow demonstrates the desired pattern:

```text
reflection
→ useful return
→ participant choice
→ existing THRIVE destination
```

### Resources

Resource browsing should remain factual.

Opening a Resource does not establish attendance, reading, contact, completion, eligibility, relapse, urgency, or need.

The continuity question is whether THRIVE can preserve the participant's chosen starting point and provide a useful return path without fabricating an outcome.

### Story

Story is the continuity layer, not a verdict and not merely a feed.

A Story item should remain tied to the factual object or thread that produced it whenever the existing system already has that relationship.

## Deliberate exclusions

This gate does not authorize:

- new analytics dashboards;
- new scoring systems;
- behavior ranking;
- long-horizon prediction;
- six-month graphics;
- clinical conclusions;
- bank-data intent inference;
- automatic attendance or completion;
- new participant affordances merely to fill gaps;
- Trust Engine crossover;
- schema changes;
- production SQL;
- service-role use;
- destructive cleanup.

Visual analytics and richer longitudinal interpretation can wait for real usage history.

## Boundary doctrine

The THRIVE personal support spine and the Trust Engine remain independent systems.

Bank data remains observational evidence.

Facts, patterns, explanations, and conclusions remain separate.

Browsing does not establish need or outcome.

Participant choice remains the controlling signal for voluntary support paths.

## Exact next gate

**Inspect and reconcile the current participant affordance graph.**

Produce a read-only Current-Affordance Continuity Map that identifies:

- strong existing circuits;
- dead-end or generic-return circuits;
- context-loss handoffs;
- duplicated paths;
- places where an existing lane can already receive the context;
- places where no current affordance exists and therefore should be explicitly deferred rather than invented.

After the map is reviewed, classify findings into:

- routing/context correction;
- presentation/read-model correction;
- existing persistence reuse;
- future architecture candidate;
- deliberate no-action.

No implementation follows automatically from the analysis.

## Working principle

> **Do not expand the product because a gap can be imagined. First make every capability THRIVE already has work as part of one coherent system.**
