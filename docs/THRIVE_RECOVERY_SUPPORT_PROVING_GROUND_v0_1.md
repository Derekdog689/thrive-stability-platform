# THRIVE Recovery Support Proving-Ground Candidate v0.1

Date: 2026-09-30
Status: review-only candidate
Parent direction: THRIVE Experience Reset v0.1
Production impact: none
Database impact: none at this gate
Trust Engine impact: none

## Purpose

Use Recovery Support as the first proving ground for the full THRIVE experience loop:

need -> understand -> retrieve real resources -> offer concrete actions -> participant chooses -> follow up -> adapt -> visible progress -> Story

This candidate is intentionally narrow. It does not authorize production implementation.

## Why Recovery Support first

Recent participant use repeatedly asked for:

- meetings;
- literature;
- recovery-oriented resources;
- more than one person to lean on;
- practical feedback;
- direction beyond "ask for support."

The current product successfully captured the need in Wellness, Support, and Goals, but did not bring concrete recovery-support options back to the participant.

That makes this the clearest place to prove that THRIVE can do more than record and reflect.

## Current-system findings

The current code already supports useful pieces:

- Wellness can capture recovery-support state and participant notes.
- Wellness can identify a participant-selected next step.
- Cross-lane synthesis can route Wellness toward Support.
- Support can accept Wellness context.
- Support has persistent request history.
- Today can surface an unresolved Support state.
- Goals can hold participant-owned recovery-related intent.

The gap is the return.

Today, "Open Support" often becomes the end of the product's intelligence rather than the beginning of useful assistance.

## Candidate experience

### Step 1: recognize the need

Use explicit participant-owned facts.

Example:

"You've brought up recovery support several times. Today you asked for meetings, literature, and more than one person to lean on."

Do not infer:
- relapse;
- treatment failure;
- diagnosis;
- motivation;
- capacity;
- legal or clinical conclusions.

### Step 2: ask what would help first

Offer concrete directions rather than another free-form blank.

Candidate choices:
- Find a meeting
- Give me something to read
- Help me build a support circle
- Help me make a recovery routine
- I am not sure

The participant can choose more than one over time, but one primary path should be shown at a time.

### Step 3: deliver something real

#### A. Find a meeting

THRIVE should retrieve current meeting information from an approved resource source.

Candidate return:
- meeting name;
- date/time;
- in-person / online;
- location or distance when location access is authorized;
- source;
- directions/open link;
- save;
- alternative options.

If exact location is unavailable, provide:
- meeting finder source;
- city/ZIP search;
- online meeting alternative.

Never fabricate a meeting.

#### B. Give me something to read

Candidate return:
- a short recovery-oriented reading recommendation;
- source;
- a brief summary or permitted excerpt;
- why it relates to the participant's stated need;
- open/save;
- another option.

Avoid presenting copyrighted material beyond permitted excerpt limits.

Possible approved-source categories:
- official AA/NA or other mutual-support literature pages;
- SAMHSA recovery resources;
- peer-support organizations;
- public-domain material;
- DSS-approved internal resource library.

Exact sources require separate content/resource approval.

#### C. Help me build a support circle

Candidate experience:
- identify the one person already relied upon, only if participant previously provided that information;
- ask whether the participant wants to add:
  - a meeting/group;
  - sponsor/peer;
  - family/friend;
  - professional/support staff;
  - community/faith connection;
  - another category.

THRIVE does not invent contacts.

The visual could show an expanding support-circle map.

#### D. Help me make a recovery routine

Candidate builder:
- choose time of day;
- choose one recovery action;
- choose frequency;
- choose whether THRIVE should ask about it later.

Example:
Morning
- 5-minute reading
- meeting search
- message one support person
- write one intention
- other

The participant chooses the routine. THRIVE does not prescribe a treatment plan.

### Step 4: participant action

The resource/action should have a visible state.

Examples:
- saved;
- planned;
- opened;
- attended, participant-confirmed;
- read, participant-confirmed;
- contacted, participant-confirmed;
- not useful;
- skipped.

Do not infer completion from link clicks alone.

### Step 5: follow up specifically

Follow-up should reference the chosen action.

Examples:

Meeting:
"Were you able to make it to the meeting you saved?"
- Yes
- No
- I chose a different one
- I did not go

Reading:
"Did you get a chance to read the piece you saved?"
- Yes
- Part of it
- Not yet
- It was not useful

Support circle:
"Did you connect with anyone new?"
- Yes
- Tried but did not connect
- Not yet
- I want a different option

Routine:
"You planned a morning recovery action. Did you try it?"
- Yes
- Partly
- No
- Change it

### Step 6: adapt

The next return should change based on the participant's answer.

If useful:
- keep;
- repeat;
- build on it.

If not useful:
- offer a different type of resource;
- reduce the step;
- change timing;
- try a different meeting/resource;
- stop carrying the thread if the participant chooses.

No repetitive "try again" loop.

### Step 7: visible progress

Recovery Support should contribute to Story and visual progress.

Possible Story signals:
- "You looked for recovery support."
- "You saved a meeting."
- "You attended a meeting." only if participant confirms.
- "You tried a reading."
- "You added another support connection." only if participant confirms.
- "This did not help, so you changed direction."

Progress is not a sobriety score.

No recovery-performance ranking.

### Step 8: Story

Example bounded Story return:

"Recovery support kept coming up this week. You asked for meetings and literature, saved one meeting, and said the first reading was not useful. You chose to try a different kind of support next."

This is grounded in participant-confirmed activity.

## Support-thread continuity

The current live behavior allowed two similar Wellness-support requests within about one minute.

Candidate behavior:

If the participant returns to Support with the same explicit Wellness context while a relevant Support thread is still open:

- show the existing thread first;
- say "You already have an open Support conversation about this";
- let the participant continue it;
- still allow "Start a separate request" if they truly want a different issue.

Do not:
- merge records automatically;
- delete duplicates;
- rewrite history;
- assume two requests are identical without strong participant/context evidence.

This behavior may require later write-path or UI changes and therefore is not authorized at this gate.

## Resource-source architecture

The proving ground needs a source strategy before implementation.

Candidate source classes:

1. **Live external resource finder**
   - meeting finders;
   - community resources;
   - current support directories.

2. **Curated THRIVE resource library**
   - DSS-approved links;
   - recovery literature references;
   - worksheets;
   - educational materials;
   - local resource guides.

3. **Participant-saved resources**
   - items the participant chose to keep;
   - no automatic endorsement beyond source metadata.

Every resource shown should include enough source context that the participant knows where it came from.

## Location handling

Meeting searches are more useful with location.

Requirements:
- use participant-authorized location or a location they type;
- do not silently assume a current location;
- show online alternatives;
- allow a participant to search by ZIP/city;
- do not persist precise location unless a separately approved data design supports it.

## Visual proving-ground requirements

This candidate must be evaluated with a visual treatment, not just text.

### Resource choice surface

Large, visually distinct actions:
- meeting;
- reading;
- support circle;
- routine.

### Meeting result

Card should visually communicate:
- when;
- where;
- format;
- source;
- action.

### Reading result

Card should visually communicate:
- title;
- source;
- short preview;
- relevance;
- open/save.

### Support circle

Visual map or orbit concept showing categories, not fabricated people.

### Routine

Simple sequence/timeline rather than a form wall.

### Follow-up

The previous action should remain visible so the participant understands what THRIVE is asking about.

### Story contribution

A participant-confirmed action should visibly enter the Story timeline.

## Candidate data/write posture

At this gate, no schema change is proposed.

Before implementation:
- inspect whether existing Support requests, Support entries/replies/events, Goals, Wellness, resource structures, or participant activity can safely represent the proving-ground states;
- identify what can be read-only or client-state-only;
- identify any minimum persistent fields that would actually be necessary;
- prefer existing tables;
- do not add schema just because the UI concept is richer.

## Acceptance criteria

The proving ground is ready for implementation review only if the candidate can show:

1. A repeated recovery-support need is recognized from participant-owned facts.
2. The participant can choose a concrete type of help.
3. THRIVE can return at least one real, source-grounded resource/action.
4. The participant can act without leaving the flow confused about what to do.
5. Follow-up references the actual prior action.
6. "No / not useful" changes the next return.
7. Participant-confirmed progress becomes visually visible.
8. Story can summarize the thread without inventing meaning.
9. Existing open Support can be continued rather than blindly duplicated.
10. No clinical inference or Trust Engine authority is introduced.

## Explicitly not authorized

- production code;
- schema migration;
- location persistence;
- automated clinical recommendations;
- fabricated local meetings;
- copyrighted literature reproduction beyond allowed use;
- hard deletion or automatic merge of Support records;
- Trust Engine synchronization;
- service-role use.

## Next gate

Review this Recovery Support proving-ground candidate together with the Visual Experience Direction v0.1.

If both are approved:
1. reconcile the candidate against current code and live schema;
2. identify the smallest implementation slice;
3. prepare review-only screen mockups / component states;
4. then seek implementation approval.
