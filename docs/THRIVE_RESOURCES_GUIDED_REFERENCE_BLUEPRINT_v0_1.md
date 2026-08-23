# THRIVE Resources / Guided Reference Blueprint v0.1

**Date:** 2026-08-23
**Repository:** `thrive-stability-platform`
**Branch:** `main`
**Status:** Review-only product blueprint

## Purpose

Resources / Guided Reference should help a participant find a trustworthy starting point, understand how to reach it, and know what to do next without turning THRIVE into an eligibility engine, diagnosis tool, referral authority, or unverified directory.

The core product idea is:

**Directions -> Connections -> References -> How-to -> How to get to the how-to**

THRIVE should help a person move from `I do not know where to start` to a verified, understandable, participant-directed path.

## Frozen boundaries

This blueprint does not authorize:

- database schema changes;
- SQL execution;
- participant or admin UI implementation;
- automatic resource assignment;
- automatic Support request creation;
- eligibility determinations;
- clinical, legal, fiduciary, or diagnostic conclusions;
- hidden demographic or financial profiling;
- Trust Engine synchronization;
- external sharing beyond existing authority;
- hard deletes.

Resources are guidance and navigation. The outside authority remains the authority.

## Source standard

THRIVE should prefer primary and institutional sources.

Preferred sources include:

- federal, state, county, and municipal government websites;
- official program websites;
- recognized nonprofit organizations when they are the actual service provider or recognized subject-matter authority;
- universities and established institutions;
- primary-source professional organizations;
- peer-reviewed or institutional research sources such as Google Scholar or JSTOR when research context is useful.

A `.gov`, `.org`, or institutional domain is a signal, not automatic proof. The organization, purpose, ownership, and relevance still need verification.

THRIVE should not rely on social media posts, anonymous advice, random blogs, SEO farms, affiliate pages, unverified directories, or online self-diagnosis content as participant resource authority.

## Source hierarchy

When several sources cover the same topic:

1. use the primary authority for action and official rules;
2. use an official provider for local service details;
3. use a reputable institutional or research source for explanation or context;
4. keep secondary explanation visibly separate from the official action source.

THRIVE should never let a clearer secondary source silently replace the authority of the primary source.

## Participant flow

The v0.1 participant flow should remain short and mobile-first:

1. `What are you looking for?`
2. choose a broad need or topic;
3. narrow the question if useful;
4. show a small number of verified starting points;
5. explain what each resource does;
6. show the official action path, instructions, or contact method;
7. show what the participant may want to have ready when that information is supported by the official source;
8. offer `Need help with this?` as an optional bridge to THRIVE Support.

The participant chooses whether to open the resource or ask Support for navigation help.

## Resource-card contract

A useful THRIVE resource should be more than a URL. A future resource record/card should be able to represent:

### Identity

- resource name;
- organization name;
- plain-language purpose;
- broad category;
- optional subcategory.

### Authority and source

- source type;
- official-source indicator;
- primary official URL;
- optional direct-action URL;
- optional official instructions/help URL;
- optional official phone/contact;
- source organization.

### Scope

- country;
- state;
- county or local geography when applicable;
- service area;
- language availability when verified;
- audience description only when explicitly supported by the source.

### Participant guidance

- `What this is`;
- `Start here`;
- `What you can do there`;
- `How this usually works`;
- `You may want these nearby`;
- `If the site is not working`;
- `Need help using this?`.

### Verification and maintenance

- last verified date;
- verified by;
- verification source;
- active / inactive / paused status;
- optional review note;
- optional replacement resource reference.

No hard delete is needed for ordinary resource maintenance. Outdated resources should become inactive or replaced while preserving history.

## How-to modes

THRIVE Resources should support three distinct guidance modes.

### 1. Direct how-to

THRIVE may explain ordinary navigation steps when they are stable and directly supported by an official source.

Example:

`Open the official portal -> choose Apply -> sign in or create an account -> follow the application steps.`

### 2. Referenced how-to

When the outside organization maintains the authoritative instructions, THRIVE should explain what the instructions cover and route the participant to that official page.

### 3. Supported how-to

When the participant wants human help navigating the resource, THRIVE should offer an explicit Support bridge.

The bridge may identify the resource the participant was viewing, but it must not automatically submit a request or fabricate the participant's question.

## Reference implementation #1: Florida SNAP

### Participant question

`How do I get food stamps?`

or

`Can THRIVE help me figure out food assistance?`

### Resource identity

**Resource:** Florida Food Assistance / SNAP

**Primary authority:** Florida Department of Children and Families

**Official participant portal:** MyACCESS

**Geography:** Florida

**Category:** Food and basic needs

### Verified official starting points

As verified on 2026-08-23:

- MyACCESS official portal: `https://myaccess.myflfamilies.com/`
- MyACCESS login / account starting point: `https://myaccess.myflfamilies.com/Public/AMMOD`
- SNAP-only application starting point: `https://myaccess.myflfamilies.com/Public/AMMOA`
- Florida DCF application process overview: `https://myflfamilies.com/services/public-assistance/applying-for-assistance`

The MyACCESS portal identifies itself as a State of Florida official website and states that Floridians can apply for and manage Food Assistance (SNAP) there.

### Candidate participant card

**Florida Food Assistance (SNAP)**

Florida Department of Children and Families

**What this is**

Food Assistance, commonly called SNAP or food stamps, is a government food-assistance program. THRIVE can help you find the official starting point and understand the process. THRIVE does not decide whether you qualify.

**Start here**

Open Florida MyACCESS.

**What you can do there**

The official portal can be used to apply for Food Assistance, manage an application or case, upload documents, view official notices, and reach official help information.

**How this usually works**

Based on the current Florida DCF application guidance:

1. submit an application;
2. DCF reviews the information;
3. DCF may request an interview or additional verification;
4. requested information can be provided through approved DCF channels;
5. DCF processes the application and determines eligibility;
6. if approved for the first time, an EBT card is mailed.

Florida DCF currently states that ordinary processing may take up to 30 days, with some cases taking longer when additional determinations are required.

**You may want these nearby**

THRIVE should not invent a universal document checklist. It may explain that DCF can request verification related to identity, household information, income, expenses, or other application circumstances, and that the participant should follow the specific official request and deadline sent by DCF.

**Official help / fallback**

MyACCESS currently lists the Florida Customer Call Center as:

- 850-300-4323
- Monday-Friday, 8:00 a.m.-5:00 p.m.
- Florida Relay 711

This information must be reverified before production use and should carry a last-verified date.

### Deep-link resilience finding

The Florida MyACCESS environment demonstrates why a THRIVE resource should not depend on a single deep link.

Some official MyACCESS process pages may return session-dependent or application-state errors when opened directly outside the expected portal flow. The resource contract should therefore support:

- a stable primary official landing page;
- an optional direct-action page;
- an official help/instructions page;
- a fallback official phone/contact.

If a deep link breaks, THRIVE should still be able to get the participant to the official front door.

### Support bridge

A participant viewing Florida SNAP may choose:

`Need help using this?`

THRIVE may then open the existing Support flow with visible resource context such as:

- Resource: Florida Food Assistance / SNAP
- Organization: Florida Department of Children and Families

The participant still chooses the Support category and writes what they want help with.

Examples of participant-owned questions:

- `I want help setting up the account.`
- `I do not understand which document they are asking for.`
- `I submitted the application and do not know what happens next.`

Viewing SNAP information must never automatically create a Support request.

## What THRIVE must not say about SNAP

THRIVE must not silently turn observations into eligibility conclusions.

Examples of prohibited product behavior include:

- `You qualify for SNAP.`
- `Your income means you should apply.`
- `Your spending suggests you need food assistance.`
- `Based on your wellness check-in, you need this program.`
- `DCF will approve you.`

A participant may ask for eligibility information, in which case THRIVE may route to the official eligibility information or explain published general rules with clear source/date boundaries. The final eligibility determination remains with the authorized agency.

## Why SNAP is prototype #1

SNAP exercises several difficult parts of the Resources model at once:

- government authority;
- application navigation;
- changing rules and interfaces;
- official documents and verification;
- participant questions;
- outside processing timelines;
- local/state geography;
- Support navigation without automatic referral.

If the model works for SNAP, it gives THRIVE a strong first test of government-benefit navigation.

## Required cross-domain tests before schema design

The resource-card contract should not be treated as stable after SNAP alone.

Before proposing any database schema, test the same resource contract against two materially different domains.

### Prototype #2: Recovery / community connection

Candidate test:

- finding an official AA, NA, SMART Recovery, or other established community-support meeting/resource through the organization's official source.

Questions to test:

- Does the model handle frequently changing meeting/location information?
- Can THRIVE distinguish an official meeting finder from an unverified directory?
- Can it describe the resource without turning participation into a clinical recommendation?
- Can it support online and local options without ranking them for the participant?

### Prototype #3: Government identity / document navigation

Candidate test:

- replacing a birth certificate, state identification document, Social Security card, or another official record through the responsible government authority.

Questions to test:

- Does the model handle different issuing authorities?
- Can it distinguish application instructions from required legal proof?
- Can it route by geography without pretending every state has the same process?
- Can it provide a fallback when an online portal is unavailable?

## Architecture decision gate

Do not design the Resources database schema until the same card/flow contract survives all three reference domains:

1. Florida SNAP / government benefit;
2. recovery or community connection;
3. government identity/document navigation.

If the three domains require fundamentally different structures, revise the product contract first rather than forcing them into a SNAP-shaped schema.

## MVP expectation

Resources v0.1 should favor a small, maintained set of high-value resources rather than a huge directory.

A reasonable first product target is a curated set of approximately 20-40 highly trusted resources across a limited number of practical categories, provided each resource has clear ownership, source, geography, participant guidance, and a maintenance path.

Completeness is not the MVP goal. Trustworthy navigation is.

## Candidate v0.1 success test

A participant who starts with:

`I do not know where to start.`

should be able to reach:

`I know the real organization, the official starting point, what this resource is for, what I can do next, and how to ask THRIVE Support for help if I want it.`

without THRIVE making a diagnosis, eligibility determination, referral decision, or hidden judgment.

## Exact next gate

Remain review-only.

Next:

1. test this same resource-card contract against one recovery/community resource using official sources;
2. test it against one government identity/document process using official sources;
3. record where the shared contract works and where it breaks;
4. only then create a review-only resource data-model candidate.

No SQL, schema installation, UI implementation, Trust Engine work, external sharing, auto-referral, or production resource ingestion is approved by this document.
