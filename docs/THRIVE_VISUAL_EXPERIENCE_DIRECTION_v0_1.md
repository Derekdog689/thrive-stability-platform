# THRIVE Visual Experience Direction v0.1

Date: 2026-09-30
Status: review-only candidate
Parent direction: THRIVE Experience Reset v0.1
Production impact: none
Database impact: none
Trust Engine impact: none

## Purpose

Define a visual direction that makes THRIVE feel alive, adult, supportive, and worth returning to without turning it into a game, a hospital dashboard, or a decorative skin over the same flat interaction model.

This is not an implementation specification. It is the visual experience candidate to review before code changes.

## Current visual truth

The current participant UI already has some useful ingredients:

- soft ambient backgrounds;
- rounded cards;
- translucent surfaces;
- a compact mobile bottom navigation;
- lane-specific icons;
- clear page-level hierarchy;
- a warm green-centered identity;
- some motion classes in Wellness.

The problem is not that the app has no styling. The problem is that meaningful events look too similar to ordinary states.

A check-in, a completed Goal, a closed Money cycle, a repeated support need, and an ordinary read-only card can all end up feeling like another rounded rectangle in the same visual rhythm.

The current system is visually consistent but insufficiently expressive.

## Visual experience principle

> The participant should be able to feel that something changed before reading a paragraph explaining it.

Visual treatment should communicate:

- state;
- movement;
- accomplishment;
- continuation;
- unfinished business;
- return value;
- atmosphere.

## Recommended direction: Living Signal

The candidate direction is called **Living Signal**.

It is not a mandate for glassmorphism, illustration, gradients, dark mode, or any single design trend.

Living Signal combines four ideas:

1. **Atmosphere**: the surface has a contextual visual mood.
2. **Signal**: important participant state is visually obvious.
3. **Motion**: meaningful changes visibly move.
4. **Accumulation**: effort and progress remain visible instead of disappearing.

The overall feel should be modern and polished, but still grounded enough for a participant who may be distracted, stressed, uncertain, or using the app quickly on a phone.

## What should change

### 1. Today should feel like a living home surface

Today should stop reading primarily as a stack of equally weighted cards.

The first viewport should have three visual zones:

#### A. Atmosphere header

Purpose:
- identify the participant;
- establish time/context;
- create a visual mood.

Possible treatment:
- richer contextual background rather than one static green wash;
- subtle light movement or gradient drift;
- daypart variation;
- one small visual signal for the day, not a wall of status text.

Examples of daypart tone:
- morning: brighter, clearer, more energetic;
- afternoon: stable, focused;
- evening: quieter, lower contrast.

This is atmosphere, not diagnosis. The background does not change based on inferred mental state.

#### B. What matters now

One primary action or return.

This surface should visually dominate the page only when it truly matters.

When the participant has no urgent action, the hero should not invent one. It can instead surface Story or a useful return.

#### C. Your movement

A compact visual progress strip or arc that reflects real participant activity.

Possible signals:
- check-ins this week;
- Goals moved/completed;
- Money cycle closed;
- Support thread active;
- something carried forward.

This should be visually scannable in a few seconds.

## 2. Completion must transform, not disappear

A completed item should have a visible state transition.

Current pattern:
active -> completed -> history/archive

Target pattern:
active -> visible completion moment -> Story/progress accumulation -> history remains available

### Goal completion

Possible visual:
- progress line reaches a checkpoint;
- card changes state;
- completion timestamp appears;
- one short reflection/next decision;
- a "Built this" or "Completed" visual treatment remains visible in Story.

### Money cycle closeout

Possible visual:
- cycle ring or month arc closes;
- totals settle into a completed state;
- a brief transition reveals "what changed";
- next cycle remains optional.

### Repeated Wellness participation

Possible visual:
- weekly rhythm fills;
- individual days remain visible;
- no fake streak pressure;
- missed days do not break or punish the entire visual.

### Support

Possible visual:
- one continuing thread rather than repeated independent request cards;
- active thread visually shows "waiting on THRIVE", "waiting on you", or "continuing";
- resolved threads become part of Story rather than disappearing.

## 3. Partial completion needs its own visual language

Partial completion is not failure.

Example states:
- 1 of 3;
- 2 of 3;
- started but paused;
- picked back up;
- changed approach.

Visual metaphor:
- path stops before next marker;
- progress arc is partially filled;
- checkpoint remains ahead;
- subdued continuation state.

Copy should remain factual.

Example:
"You aimed for 3 and completed 2."

Then:
- keep going;
- make it smaller;
- change the approach;
- leave it here.

## 4. Story should be visually different from ordinary cards

Story is not another feed.

Candidate visual structure:

### The day/week ribbon

A horizontal or vertical timeline showing meaningful participant-owned events.

Examples:
- Wellness check-in;
- Goal moved;
- Goal completed;
- Money cycle closed;
- Support asked for;
- Support response;
- recurring need carried forward.

Each event keeps its lane identity.

### The chapter

A larger visual block that says what the recent period added up to.

Possible format:

**This week moved.**

- 7 check-ins
- 3 Goals completed
- Money cycle closed
- Support asked for twice

Then one grounded synthesis:
"Recovery support is still unfinished. You have asked for meetings, literature, and more than one person to lean on."

### Carry forward

One or two visually distinct next threads.

Not a task dump.

## 5. Lane identity should be stronger

The current heavy green treatment makes different lanes feel more similar than they should.

Candidate lane identity should use a shared THRIVE system with distinct accents.

Example exploration only:
- Wellness: light / sky / cyan family;
- Goals: indigo / violet family;
- Money: emerald / teal or a warmer financial accent;
- Support: coral / amber / warm rose;
- Story: neutral dark ink with multi-lane accents.

The exact palette is not approved here.

The requirement is:
- one shared system;
- stronger lane recognition;
- accessible contrast;
- no hospital-green domination;
- no rainbow chaos.

## 6. Motion should mean something

Motion should be restrained and purposeful.

Candidate motion grammar:

- **arrive**: a new return enters;
- **advance**: a Goal or progress state moves;
- **resolve**: a completed state settles;
- **carry**: an unfinished thread bridges into the next day/week;
- **open**: more detail expands;
- **acknowledge**: a milestone receives a brief visual response.

Avoid:
- constant looping animation;
- attention-grabbing motion without meaning;
- confetti for routine activity;
- punitive shake/red-failure effects;
- decorative motion that slows the app.

## 7. Earned visual moments

THRIVE should acknowledge real participation and follow-through.

Candidate moments:
- first full week of check-ins;
- multiple check-ins during a difficult or uneven week;
- Goal completion;
- Goal resumed after pause;
- Money cycle closed;
- first useful Support thread resolved;
- participant follows through on a chosen resource/action;
- meaningful sequence across multiple lanes.

The acknowledgment can be modest or larger depending on significance.

Examples:
- a completed arc;
- short animation;
- richer visual card;
- a changing background scene;
- a brief milestone panel;
- a Story chapter opening.

The product should not assign moral worth to completion.

## 8. Resource cards need visual usefulness

When THRIVE recommends a real resource, it should look actionable.

Meeting card candidate:
- meeting name;
- time;
- distance/location when authorized and available;
- in-person / online;
- source;
- directions/open link;
- save;
- "I went" or "Not for me" follow-up action.

Reading card candidate:
- title;
- short excerpt or summary within copyright limits;
- source;
- why it may fit the participant's stated need;
- read/open/save;
- follow-up action.

Resource cards should not look like Support request forms.

## 9. Adult visual tone

Target:
- polished;
- modern;
- warm;
- direct;
- visually rewarding;
- not childish;
- not clinical;
- not corporate HR;
- not treatment-program paperwork;
- not casino gamification.

The participant should feel:
"This app is paying attention and moving with me."

## 10. Candidate visual states to mock before implementation

The review package should eventually render these exact states using real or synthetic-safe THRIVE content:

1. Today after an ordinary morning check-in.
2. Today after three Goal completions.
3. Today after a Money cycle closes.
4. Story after a week of mixed activity.
5. Partial Goal completion.
6. Recovery Support with real resource options.
7. Active Support thread continuation.
8. No active Goals / no active Money plan, but meaningful Story still present.

These are the states that should prove the visual direction.

## 11. What remains from the current UI

Do not throw away useful work unnecessarily.

Likely keep or evolve:
- mobile-first layout;
- bottom navigation concept;
- participant name/time greeting;
- soft rounded geometry;
- clear large-touch targets;
- lane icons;
- restrained use of translucency;
- readable typography;
- current accessibility intent.

Likely reconsider:
- dominant emerald palette;
- repeated white/green card rhythm;
- oversized raw Goal titles on Today;
- every state using similar card weight;
- completion disappearing too quickly;
- little visual difference between routine and meaningful moments.

## 12. Review questions

Before approving this direction, answer:

- Does this feel meaningfully less institutional?
- Does it feel adult?
- Does progress become visible without reading everything?
- Does completion feel real without becoming cheesy?
- Does unfinished work remain dignified?
- Does Story feel like accumulation rather than reporting?
- Are resources visually actionable?
- Would the participant want to see what changed tomorrow?

## Next gate

If this visual direction is approved, create a small set of review-only screen mockups using the approved visual language before production implementation.
