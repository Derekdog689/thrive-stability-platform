# THRIVE Resources Cross-Domain Validation v0.1

**Date:** 2026-08-23
**Repository:** `thrive-stability-platform`
**Branch:** `main`
**Status:** Review-only validation record

## Purpose

Test the shared Resources / Guided Reference contract against two domains that behave very differently from Florida SNAP before proposing any data model.

The three reference domains are now:

1. Florida SNAP / government benefit navigation;
2. Alcoholics Anonymous / recovery-community connection;
3. Florida replacement driver license or identification card / government identity-document navigation.

This document records what the shared contract handles well and where it needs refinement.

## Plain-language rule

THRIVE should explain complicated official information in short, ordinary language.

When official wording is technical, THRIVE may paraphrase it for understanding while keeping the official source available.

The participant should be able to tell the difference between:

- THRIVE's plain-language explanation;
- the outside organization's official rule, form, instruction, or decision.

Paraphrasing must not change the meaning or turn general information into a conclusion about the participant.

---

# Prototype #2: Recovery / community connection

## Test resource

**Resource:** Alcoholics Anonymous meeting and local-service connection

**Primary authority:** Alcoholics Anonymous World Services / General Service Office

**Official starting points verified 2026-08-23:**

- Find A.A. Near You: `https://www.aa.org/find-aa`
- Meeting information FAQ: `https://www.aa.org/faq/how-can-i-find-meeting-information`
- Meeting Guide information: `https://www.aa.org/meeting-guide-app`

## What the official source says in practical terms

A.A.'s central website does not try to maintain every local meeting list itself.

It directs people to local A.A. service offices because local entities generally maintain the most detailed meeting information.

A.A. also provides the Meeting Guide app. Meeting Guide receives meeting information from A.A. service entities and refreshes that information regularly.

## Candidate participant card

**Find an A.A. meeting or local A.A. contact**

Alcoholics Anonymous

**What this is**

A.A. provides official tools that can help you find local or online Alcoholics Anonymous meetings and local A.A. service contacts.

THRIVE is providing a verified connection to the official A.A. system. THRIVE is not deciding whether A.A. is the right choice for you.

**Start here**

Use A.A.'s official `Find A.A. Near You` page.

**What you can do there**

Search by location for nearby A.A. service offices and local resources.

**Another official option**

A.A.'s Meeting Guide can help locate in-person and online meetings using meeting information provided by A.A. service entities.

**If you cannot find what you need**

The official A.A. guidance recommends contacting the nearest local service resource because local offices often maintain the most detailed meeting information.

**Need help using this?**

The participant may choose to open THRIVE Support and explain what help they want finding or understanding the resource.

## What this prototype proves

The shared card contract works for:

- resource identity;
- primary authority;
- plain-language purpose;
- geography;
- official starting point;
- alternate official access path;
- fallback contact/path;
- Support bridge;
- verification date.

## Where the original contract bends

### 1. Parent authority and local data authority are not always the same thing

A.A. World Services is an official authority for the central resource, but detailed meeting information is often maintained by local A.A. service entities.

The data model therefore needs to distinguish:

- parent / umbrella authority;
- organization responsible for the specific local information;
- source that supplied or maintains a changing listing.

### 2. Some resources are directories or connectors, not one service destination

`Find A.A. Near You` is a connection layer. It may lead to a local office, meeting finder, hotline, or local website.

The model should support a resource whose purpose is `find the right local source`, not only `go directly to this service`.

### 3. Frequently changing information needs different verification treatment

A stable central A.A. page may remain valid while individual meeting times and locations change often.

THRIVE should not claim that every meeting listing was independently verified by DSS merely because the official A.A. finder was verified.

The model should preserve the distinction between:

- THRIVE verified this official access point;
- the outside organization maintains the live listing shown after the participant leaves THRIVE.

### 4. Resource presentation must avoid accidental recommendation

THRIVE may say:

`Here is the official A.A. meeting finder.`

THRIVE should not silently say:

`A.A. is what you need.`

The participant's request or explicit choice should drive the connection.

---

# Prototype #3: Government identity / document navigation

## Test process

**Resource:** Replace a lost or stolen Florida driver license or identification card

**Primary authority:** Florida Department of Highway Safety and Motor Vehicles (FLHSMV)

**Official starting points verified 2026-08-23:**

- MyDMV Portal / official online services: `https://mydmvportal.flhsmv.gov/`
- FLHSMV main site: `https://www.flhsmv.gov/`
- Official driver handbook / identification requirements: `https://www.flhsmv.gov/pdf/handbooks/englishdriverhandbook.pdf`
- FLHSMV office finder: `https://www.flhsmv.gov/locations/`

## What the official source says in practical terms

FLHSMV provides official online services that can include replacing a Florida driver license or identification card.

Some transactions or individual situations may require an office visit or additional documents.

Florida's official driver guidance states that applications for driver licenses and ID cards can require primary identification, proof related to Social Security identification or an accepted alternative, and two documents showing Florida residential address. Exact requirements depend on the transaction and the person's circumstances.

## Candidate participant card

**Replace a Florida driver license or ID card**

Florida Department of Highway Safety and Motor Vehicles

**What this is**

FLHSMV is the Florida government agency responsible for Florida driver licenses and identification cards.

THRIVE can help you get to the official replacement process. THRIVE does not decide which documents FLHSMV will accept in your individual situation.

**Start here**

Open the official FLHSMV MyDMV Portal and check whether your replacement can be completed online.

**If the online process does not work for your situation**

Use the official FLHSMV office finder to locate a driver-license service location and review the office's appointment instructions.

**What you may need**

If FLHSMV requires identity or address documents, use the current official `What to Bring` / driver-license documentation guidance rather than a THRIVE-created universal checklist.

In plain language, the official guidance may require proof of who you are and proof of your Florida residential address. The exact accepted documents depend on the transaction and your circumstances.

**Need help using this?**

The participant may ask THRIVE Support for help finding the correct official page, office, or document instructions. Support does not certify that a document will be accepted by FLHSMV.

## What this prototype proves

The shared contract works for:

- government authority;
- geography;
- official digital front door;
- alternate in-person path;
- document-guidance reference;
- fallback office information;
- plain-language paraphrasing;
- Support bridge;
- verification date.

## Where the original contract bends

### 1. A resource may contain several action paths

The participant may be able to:

- complete the transaction online;
- go to an office;
- review document requirements;
- find appointment information.

A single `primary URL` is not enough to represent the whole useful path.

### 2. Requirements are conditional

The exact documentation needed can depend on citizenship or immigration documentation, name changes, residential-address circumstances, and the specific transaction.

THRIVE should not flatten these into one universal checklist.

The model should support:

- general preparation guidance;
- official requirements references;
- visible qualifiers or conditions;
- a warning that the outside authority determines acceptance.

### 3. Locations are operational data

Office hours, appointment rules, and service availability may vary by location and change.

As with meeting data, THRIVE may verify the official office finder without claiming every individual office detail is permanently current.

### 4. Official portals can fail

An official digital portal may be temporarily unavailable or may reject a deep link outside the expected session flow.

The model should preserve:

- stable agency home/front-door URL;
- transaction/action URL when available;
- office-finder fallback;
- official help/contact path.

---

# Shared contract validation

## What works across all three domains

The shared Resources contract successfully handles these common ideas:

1. **Resource identity** — what the participant is looking at.
2. **Authority** — which outside organization is responsible.
3. **Plain-language purpose** — what the resource can help with.
4. **Source type** — government, nonprofit, institutional, etc.
5. **Geographic scope** — national, state, local, online, or another service area.
6. **Verified front door** — a stable official starting point.
7. **Action paths** — apply, search, call, visit, read instructions, or another official action.
8. **Preparation guidance** — what may help before starting, when supported by the source.
9. **Fallback path** — another official route if the first path fails.
10. **Support bridge** — optional human navigation help without automatic referral.
11. **Verification state** — when and by whom THRIVE verified the official resource.
12. **Lifecycle state** — active, paused, inactive, or replaced without hard deletion.

## What did not fit cleanly in the first SNAP-shaped version

The initial contract was too flat in four areas.

### A. Organization vs source vs maintainer

These can be different.

Example:

- A.A. World Services provides the official central connection;
- a local A.A. service entity may maintain the meeting data;
- Meeting Guide relays that data.

The model should not force all three roles into one `organization` field.

### B. One resource can have multiple official action paths

SNAP, A.A., and FLHSMV all show that a resource can need several useful paths:

- landing page;
- direct action;
- instructions;
- search/finder;
- local office;
- phone/contact;
- fallback.

These should be structured as related access paths rather than a growing list of one-off URL columns.

### C. Verification can apply at different levels

THRIVE may verify that an official directory or portal is authentic without independently verifying every live item inside that outside system.

The model needs to say what was actually verified.

### D. Guidance may be stable while live operational details change

`Use the official meeting finder` may be stable guidance.

A particular meeting's Tuesday 7 p.m. location is operational detail maintained outside THRIVE.

`Use the FLHSMV office finder` may be stable guidance.

A particular office's appointment availability can change.

The model should avoid copying fast-changing external operational data unless THRIVE explicitly takes responsibility for maintaining it.

---

# Cross-domain conclusion

The shared Resources / Guided Reference concept **passes** all three reference domains.

It should not be modeled as a simple directory table with one URL per resource.

The reusable architecture needs to separate:

- the resource/topic;
- responsible organizations and their roles;
- official access/action paths;
- plain-language guidance;
- geography/scope;
- verification evidence and verification scope;
- lifecycle/maintenance state;
- optional Support context.

This is enough evidence to proceed to a **review-only data-model candidate**.

No SQL, table creation, production resource ingestion, UI implementation, automatic referral, or Trust Engine work is authorized by this validation record.
