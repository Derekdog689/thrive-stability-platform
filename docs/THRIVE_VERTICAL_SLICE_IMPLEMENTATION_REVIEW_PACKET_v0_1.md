# THRIVE Vertical Slice Implementation Review Packet v0.1

Date: 2026-09-30
Status: final review candidate before implementation approval
Parent: THRIVE Vertical Proving Slice v0.1
Visual direction: Living Signal approved
Production impact: none
Database impact: none at this gate
Trust Engine impact: none

## Purpose

Reconcile the Recovery Resource content, current code surface, live schema, and approved Living Signal board into one smallest implementation sequence.

This packet is the decision point immediately before implementation approval.

## Verified state

### Visual

The Living Signal 1-8 direction is approved:

1. Wellness Check-In
2. Wellness Return
3. Today
4. Recovery Support
5. Recovery Resources
6. Meeting / Resource Result
7. Follow-Up
8. Story

### Resources backend

The live Resources system already supports:

- canonical resources;
- organizations;
- organization roles;
- multiple access paths per Resource;
- guidance sections;
- verification;
- workspace/program visibility;
- Resource-to-Support linkage.

No replacement Resources schema is needed.

### Support backend

The live Support system already supports:

- support_requests;
- support_request_entries;
- support_request_links;
- support_request_status_events.

support_request_links can already point to:

- Wellness check-in;
- Goal;
- Money period/category;
- transaction;
- prior Support request;
- Resource;
- Resource access path.

### Important follow-up finding

There is no existing general participant-resource-interaction table.

support_request_entries only permits:

- participant_response;
- participant_reply;
- internal_note.

Those entries belong to a Support request.

Therefore THRIVE should **not** quietly misuse Support entries as a general resource-tracking ledger.

The first implementation should separate:

- what can be real and durable now;
- what can be visually demonstrated now;
- what requires a later minimum persistence decision.

## Recovery Resource content reconciliation

The first content set should be smaller and cleaner than seven independent Resource rows.

The existing Resources model supports multiple access paths, so related official destinations should be grouped under one canonical Resource where that improves participant clarity.

### Resource 1 — Alcoholics Anonymous meeting support

**Category:** recovery_community_support
**Subcategory:** mutual_support_meeting_finder

**Purpose:**
Help a participant find current A.A. meeting information and local A.A. support.

**Access paths:**

1. Find A.A. Near You
   - type: finder
   - https://www.aa.org/find-aa
   - search local A.A. service entities by location

2. Meeting Guide
   - type: finder
   - https://www.aa.org/meeting-guide-app
   - official A.A. meeting-finder app information
   - supports Android and iOS

**Content posture:**
Do not copy static local A.A. meeting lists into THRIVE.

### Resource 2 — Narcotics Anonymous meeting support

**Category:** recovery_community_support
**Subcategory:** mutual_support_meeting_finder

**Purpose:**
Help a participant find current local or virtual NA meeting information.

**Primary access path:**
- Find NA
- https://na.org/MeetingSearch/

**Guidance:**
NA World Services directs people to local NA communities for updated in-person meeting information and separately provides virtual meeting finding.

**Content posture:**
Do not maintain an unofficial static NA meeting list.

### Resource 3 — SMART Recovery meeting finder

**Category:** recovery_community_support
**Subcategory:** mutual_support_meeting_finder

**Purpose:**
Find free SMART Recovery meetings online or in person.

**Primary access path:**
- https://meetings.smartrecovery.org/meetings/

**Participant guidance:**
Search by city/state or ZIP code. Results can provide in-person or online meeting information.

### Resource 4 — A.A. Daily Reflections

**Category:** recovery_community_support
**Subcategory:** recovery_reading

**Purpose:**
Offer an official daily A.A. recovery reading source.

**Primary access path:**
- https://www.aa.org/daily-reflections

**Copyright posture:**
Link to the official source and summarize minimally when useful. Do not reproduce the full copyrighted reflection inside THRIVE.

### Resource 5 — NA Recovery Literature

**Category:** recovery_community_support
**Subcategory:** recovery_literature

**Purpose:**
Offer an official NA starting point for pamphlets, booklets, and recovery readings.

**Primary access path:**
- https://na.org/literature/

**Copyright posture:**
Use the official access point. Do not reproduce full copyrighted literature unless specific permission clearly allows it.

### Resource 6 — SAMHSA Recovery and Support

**Category:** recovery_community_support
**Subcategory:** recovery_education_peer_support

**Purpose:**
Provide a federal starting point for recovery-support information, peer-support materials, and related resources.

**Primary access path:**
- https://www.samhsa.gov/substance-use/recovery

### Display principle

THRIVE should not rank one recovery approach as the universal best fit.

Participant-facing copy:

**Choose what fits you.**

For Find a meeting:
- A.A.
- NA
- SMART Recovery
- show another / online options where supported

For Read something:
- A.A. Daily Reflections
- NA Recovery Literature
- SAMHSA Recovery and Support

## Board-to-build reconciliation

The approved visual board remains the target.

However, screen 6 on the board shows direct meeting cards with time, distance, and directions.

The current verified implementation can safely support **official finder results / access paths**, not a universal live meeting aggregation layer yet.

Therefore:

### First coded screen 6

Use a Living Signal **Meeting Finder Result** treatment:

- official organization;
- what the finder provides;
- location/search guidance;
- Open official finder;
- alternate finder;
- return to THRIVE;
- optional Support handoff.

### Future screen 6 enhancement

Direct meeting cards with:

- exact time;
- distance;
- location;
- directions;
- join link;

should only ship after THRIVE has an approved live meeting-data source or provider integration.

The visual board remains the experience target and is not being rejected.

## Smallest implementation sequence

### Slice A — Resource content install candidate

Prepare insert/activation SQL candidate for the six canonical Recovery Resources above using existing tables only.

No install yet.

Tables:

- resources
- resource_organizations
- resource_organization_roles
- resource_access_paths
- resource_guidance_sections
- resource_verifications
- resource_visibility

### Slice B — Recovery Support route

Add:

src/app/recovery-support/page.tsx

Responsibilities:

- receive explicit Wellness / participant context;
- show four paths:
  - Find a meeting
  - Read something
  - Connect with someone
  - Build a routine
- route Find / Read into contextual Resources;
- route Connect into existing Support;
- keep Build a routine bounded to participant-chosen UI until persistence is separately approved.

This route prevents generic Support from becoming an overloaded catch-all.

### Slice C — Wellness integration

Touch:

- src/app/wellness/buildWellnessGuidance.ts
- src/app/wellness/WellnessCheckinPreview.tsx
- src/app/wellness/contextualWellnessReturn.ts

Goal:

When the participant explicitly identifies Recovery Support, THRIVE can offer the approved four-path return.

Do not alter Wellness writes or invent new signals.

### Slice D — Contextual Resources

Touch:

- src/app/resources/page.tsx
- src/app/resources/resourceData.ts
- src/app/resources/[slug]/page.tsx

Goal:

A participant arriving from Recovery Support should see:

**You asked for a meeting. Here are places to start.**

rather than being dropped into the full generic library.

Ordinary Resources browsing remains available.

### Slice E — Today carry-forward

Touch:

- src/app/page.tsx
- potentially src/app/crossLaneSynthesis.ts

Goal:

Today should visually carry the explicit Recovery Support thread forward using the approved Living Signal hierarchy.

Do not create a new Support request merely to make the thread visible.

### Slice F — Support continuity

Touch:

- src/app/support/page.tsx
- useParticipantSupport.ts only if necessary

Goal:

If a clearly related open Wellness Support request already exists:

- Continue existing request is primary;
- Start separate request remains available;
- no automatic merge;
- no delete;
- no history rewrite.

### Slice G — Read-only Story candidate

Add:

- src/app/story-candidate/page.tsx
- src/app/story/buildParticipantStory.ts

Story derives from existing participant-owned records only.

First candidate Story can safely show:

- Wellness participation;
- Goal completion;
- Money closeout;
- Support requests / lifecycle;
- explicit Recovery Support need.

It must **not** claim:
- meeting attended;
- reading completed;
- resource helped;

unless the participant has explicitly confirmed that fact in an approved persisted structure.

## Follow-up decision

The approved board includes a Follow-Up screen.

There are two safe phases.

### Phase 1 — implementation proof

Follow-up can exist in the Recovery Support route as a **non-persistent candidate interaction** for phone testing.

Purpose:
- test wording;
- test visual state;
- test adaptation;
- determine whether the participant actually finds it useful.

It must not appear later in Story as durable fact after refresh.

### Phase 2 — persistence candidate

If the follow-up proves useful, reconcile the minimum persistence model.

Do not force it into support_request_entries unless the action is genuinely part of a Support request.

Possible later options:

- a narrowly scoped participant resource interaction table;
- another existing participant-owned ledger if a true semantic fit is found.

Any schema proposal is a separate gate.

## Living Signal implementation rules

Every coded slice should move toward the approved board from the start.

Do not build functional flat UI now and promise to style it later.

### Keep

- mobile-first shell;
- bottom navigation;
- large touch targets;
- participant greeting;
- accessible text;
- rounded geometry.

### Change in the proving slice

- atmospheric backgrounds;
- layered surfaces;
- lane accents;
- stronger typography hierarchy;
- less hard green dominance;
- meaningful visual state;
- cumulative participation treatment;
- Recovery Support cards with distinct identities;
- Resource cards that look actionable;
- Story that looks like accumulation.

### Do not overbuild

The first implementation does not need:

- full app-wide theme conversion;
- live animated landscapes everywhere;
- a universal motion engine;
- new preference persistence;
- every milestone type;
- final Story architecture for every lane.

It needs enough Living Signal to prove the system feels materially different.

## Implementation approval bundle

The implementation candidate should consist of:

1. Recovery Resource insert/activation SQL candidate;
2. code patch on a new feature branch for Slices B-G;
3. no schema migration;
4. Vercel preview;
5. Android phone test;
6. compare result against the approved 1-8 board;
7. only then approve merge.

## Acceptance test

The proving slice passes if a participant can:

1. complete a Wellness check-in;
2. explicitly ask for Recovery Support;
3. see four useful paths;
4. choose Find a meeting;
5. see verified A.A. / NA / SMART Recovery options;
6. open a real official source;
7. return to THRIVE without losing the thread;
8. continue an existing Support conversation when relevant;
9. see Today reflect that Recovery Support is still active;
10. see Story reflect only facts that actually exist;
11. experience a visible Living Signal difference on Android;
12. do all of this without a new schema.

## Recommended decision

Approve the content set and code-change map with the refinements in this packet.

Then authorize preparation of:

- Resource install candidate;
- feature-branch implementation candidate;
- Vercel preview for phone test.

No production merge is implied by implementation-candidate preparation.
