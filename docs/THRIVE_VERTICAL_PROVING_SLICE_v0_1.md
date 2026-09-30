# THRIVE Vertical Proving Slice v0.1

Date: 2026-09-30
Status: review-only design candidate
Parent roadmap: THRIVE Experience Reset Roadmap v1.0
Approved gate: reconcile and design the first vertical proving slice
Production impact: none
Database impact: none at this gate
Trust Engine impact: none

## Slice

The first proving slice is:

Wellness -> Today -> Recovery Support -> Resources -> Meeting / Resource Result -> Follow-up -> Story

The purpose is to prove the THRIVE experience reset end to end before spreading the pattern across the full app.

This is deliberately larger than a single-page redesign and deliberately smaller than a full-app rewrite.

## Why this slice

This slice combines the strongest existing functional lane with the biggest participant-experience gap.

Wellness already captures useful participant-owned signals.

Today already reads Wellness, Goals, Money, and Support.

Support already persists participant requests and replies.

Resources already has a governed canonical library, access paths, participant guidance, verification, visibility, and Resource-to-Support linkage.

Story is the missing accumulation layer that turns those separate actions into something the participant can see and feel.

Recovery Support is the best proving ground because live participant use has repeatedly asked for:

- meetings;
- literature;
- recovery resources;
- more than one person to rely on;
- practical direction;
- something more useful than generic "ask for Support."

## Verified current code and schema

### Wellness

Current code already supports:

- participant check-in;
- recovery support state;
- support-needed state;
- participant note;
- chosen next step;
- same-day / recent check-in history;
- contextual return.

No new schema is required to recognize the explicit participant need.

### Today

Current Today code already supports:

- Wellness state;
- Goal state;
- Money state;
- Support state;
- cross-lane synthesis;
- primary action;
- participant-specific dismissal of a synthesis card.

The first slice should evolve the Today presentation rather than replace the underlying reads.

### Support

Current Support code already supports:

- persistent requests;
- participant messages;
- participant replies;
- participant-visible entries;
- status history;
- Wellness context;
- Resource context;
- assisted Money links.

Current live tables include:

- support_requests;
- support_request_entries;
- support_request_links;
- support_request_status_events.

support_request_links already supports:

- wellness_checkin_id;
- goal_id;
- budget_period_id;
- budget_category_id;
- staged_transaction_id;
- prior_support_request_id;
- resource_id;
- resource_access_path_id.

This is enough to support continuity and contextual display without inventing a parallel Support model.

### Resources

The live database already contains the governed Resources subsystem:

- resources;
- resource_access_paths;
- resource_guidance_sections;
- resource_organizations;
- resource_organization_roles;
- resource_verifications;
- resource_visibility.

Current live resource counts:

- 6 resources;
- 6 access paths;
- 10 guidance sections;
- 6 organizations;
- 6 organization roles;
- 6 verifications;
- 6 visibility rows.

Current useful participant-visible resources are:

- Florida MyACCESS;
- Social Security Administration;
- 211 Broward;
- 211 Palm Beach & Treasure Coast.

Two additional rows are synthetic test resources and are not participant product content.

The current Resources system therefore needs content growth, not a replacement data model.

## Important implementation conclusion

The smallest proving slice does **not currently require a new schema**.

The first implementation candidate should attempt to use:

- existing Wellness fields;
- existing Today reads;
- existing Support request / entry / link structure;
- existing Resources tables and access paths;
- client-side presentation state where persistence is not yet required.

Any new persistence should be justified only after the proving slice shows a real need that cannot be represented safely by existing structures.

## Visual direction

The vertical slice should use the approved Living Signal direction from the first screen.

The slice should not be built in the old green / white card-stack language and "reskinned later."

### Visual principles

- contextual atmosphere;
- layered depth;
- stronger lane identity;
- more negative space;
- visual hierarchy that distinguishes routine from meaningful events;
- completion artifacts;
- cumulative progress;
- restrained meaningful motion;
- stronger Resource cards;
- Story as an accumulation surface rather than another list.

### Daypart

Time-based atmosphere may be explored:

- morning: brighter / clearer;
- afternoon: balanced / focused;
- evening: deeper / quieter.

Do not infer emotional state from appearance.

## Screen 1: Wellness

### Job

Capture the participant's current state and return something useful immediately.

### Candidate experience

Participant indicates recovery support could help and/or writes a note asking for meetings, literature, resources, or additional support.

THRIVE returns:

**Recovery support keeps coming up. What would help first?**

Actions:

- Find a meeting
- Read something
- Connect with someone
- Build a routine
- I'm not sure

The participant may continue the Wellness flow without choosing one.

### Visual treatment

Wellness should have its own identity rather than appearing as another generic white/green card.

Candidate treatment:

- brighter atmospheric header;
- clear signal summary;
- one main return surface;
- soft progress/rhythm indicator for cumulative Wellness participation;
- Recovery Support actions shown as visually distinct next-path cards.

## Screen 2: Today

### Job

Turn the participant's recent activity into one meaningful orientation surface.

### Candidate Today hierarchy

1. atmosphere / greeting;
2. one thing worth attention;
3. visual movement / cumulative progress;
4. one active Story thread;
5. lane shortcuts.

Example:

**You showed up today.**

- Wellness checked in
- Recovery support is still open
- Money month complete
- 3 Goals completed

Then:

**Worth continuing**
Recovery support: find a meeting or resource.

### Visual treatment

Avoid equal-weight stacked cards.

Use:

- one dominant current return;
- a compact progress geography / movement strip;
- lane-specific accents;
- Story preview that looks different from normal cards.

## Screen 3: Recovery Support choice

### Job

Move from vague need to a concrete support path.

Four primary paths:

### Find something

Meeting or resource.

### Read something

Recovery literature or educational material.

### Connect with someone

Support-circle expansion.

### Build something

Participant-chosen recovery routine.

The selected path should move directly to the next useful layer.

## Screen 4: Resources

### Job

Return real, source-grounded options.

The Resources surface should not be a generic category directory when the participant entered from a clear Recovery Support need.

The entry should be contextual.

Example:

**You asked for a meeting. Here are places to start.**

The product should show:

- official source;
- resource purpose;
- access path;
- locality / service area where relevant;
- what happens next;
- alternate option.

### Recovery content gap

The current canonical library does not yet contain recovery meeting or recovery literature resources.

Before implementation, the Resource content candidate should add a deliberately small verified recovery set.

Initial content target:

- one or more official meeting-finder sources;
- at least one online meeting alternative;
- one official recovery-literature source;
- one practical recovery-support / peer-support source;
- optional additional mutual-support approaches where appropriate.

No fake meeting data.

No copied copyrighted literature beyond allowed use.

## Screen 5: Meeting / Resource result

### Job

Make the resource immediately actionable.

### Candidate meeting card

- meeting / source name;
- time;
- date;
- in-person / online;
- location / service area when authorized;
- official source;
- directions / open;
- save;
- show another.

A live meeting result requires a current approved source. If exact meeting data cannot be reliably retrieved in the first implementation slice, the first version should land the participant directly in the correct official meeting finder with participant-friendly instructions rather than fabricate local listings.

### Candidate reading card

- title;
- source;
- short permitted preview / summary;
- why it may fit the participant's stated need;
- open;
- save;
- show another.

## Screen 6: Follow-up

### Job

Ask specifically about the action the participant actually chose.

Examples:

Meeting:
- Were you able to make it to the meeting you saved?

Reading:
- Did you get a chance to read the piece you saved?

Support circle:
- Did you connect with anyone new?

Routine:
- Did you try the recovery action you planned?

Answers should include:

- yes;
- partly / tried;
- no / not yet;
- not useful;
- change direction.

### Adaptation

The next return should change.

If useful:
- repeat;
- keep;
- build on it.

If not useful:
- show another option;
- change the resource type;
- make the action smaller;
- stop carrying it if the participant chooses.

No repetitive generic encouragement loop.

## Screen 7: Story

### Job

Make the participant's movement visible.

Candidate Story return:

**Recovery support stayed on your radar this week.**

- You asked for meetings and literature.
- You saved a meeting.
- You tried one reading.
- You said the first option was not useful.
- You chose another direction.

Only participant-confirmed actions should be presented as completed actions.

### Story visual treatment

Story should use:

- timeline / ribbon / progress geography;
- lane identity;
- completion artifacts;
- one or two carry-forward threads;
- visual density that grows with real participant activity.

Story should not become a report table.

## Support continuity

Today showed two nearly identical Wellness-support requests created within about one minute.

The first slice should reconcile this behavior.

Candidate UI rule:

When a participant arrives at Support from the same explicit Wellness context and there is a related open Support thread:

1. show the existing thread first;
2. explain that there is already an open conversation;
3. make "Continue" the primary action;
4. allow "Start a separate request" as a secondary action.

Do not automatically:

- merge records;
- delete records;
- rewrite historical requests.

## Resource content work needed before implementation

The existing Resources architecture is usable.

The immediate content task is to grow it.

### First recovery Resource candidate set

Prepare a separate resource-content review candidate containing:

- official authority / organization;
- official URL;
- access-path type;
- participant-friendly purpose;
- participant-friendly instructions;
- service area;
- verification source/date;
- verification cadence;
- copyright-safe guidance where literature is involved.

This is content governance work, not schema work.

## Smallest implementation slice

The smallest useful coded slice should be:

1. Wellness can present Recovery Support next-path choices.
2. "Find a meeting" opens contextual Resources.
3. Resources can show the new verified recovery Resource set.
4. A Resource can open its real access path.
5. Resource context can still attach to Support using the existing support_request_links bridge.
6. Today can surface the active Recovery Support thread.
7. Story mock state can show the participant's confirmed resource action.

Follow-up persistence should be added only if current Support entries / existing participant-owned structures cannot represent the required confirmation safely.

## What is not in the first coded slice

Do not include yet:

- full visual rollout to every lane;
- full dynamic meeting aggregation across all providers;
- persisted precise location;
- AI-generated recovery advice;
- automatic treatment recommendations;
- full personal preference learning;
- Trust Engine integration;
- new clinical data;
- automatic merging of Support requests;
- broad national Resource expansion.

## Review-only visual states to prepare

The first visual review should show:

1. Wellness check-in with Recovery Support need;
2. Wellness return with four concrete paths;
3. Today after that check-in;
4. Recovery Support path chooser;
5. contextual Resources screen;
6. meeting-finder / meeting-result treatment;
7. follow-up state;
8. Story showing the thread carried forward.

These should use the Living Signal visual language rather than the current production styling.

## Acceptance criteria

The vertical slice is ready for implementation approval only if:

1. the participant's explicit Recovery Support need is recognized;
2. the participant can choose a concrete path;
3. the next screen delivers something real;
4. Resource source and access path are clear;
5. Support continuity is preserved;
6. no duplicate Support request is created simply because the participant revisits the same need;
7. follow-up refers to the actual chosen action;
8. "not useful" can change direction;
9. Story can reflect participant-confirmed movement;
10. the visual experience feels materially more alive than current production;
11. the slice works on phone;
12. no new schema is required unless separately justified and approved.

## Exact next gate

Prepare:

1. the review-only Living Signal screen mockups for the eight states above;
2. the first verified Recovery Resource content candidate;
3. the smallest code-change map showing which current components would be touched and which would remain unchanged.

No production implementation until those three review artifacts are approved.
