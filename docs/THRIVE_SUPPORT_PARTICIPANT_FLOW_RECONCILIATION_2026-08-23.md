# THRIVE Support Participant Flow Reconciliation

**Date:** 2026-08-23
**Repository:** `thrive-stability-platform`
**Branch:** `main`
**Status:** Participant-flow reconciliation checkpoint

## Purpose

Reconcile the ordinary participant Support experience after the Today, Wellness, and Goals progressive-flow work. This is not a Support redesign and does not authorize schema, auth, Trust Engine, or authority changes.

## Verified participant flow

The ordinary Support route currently provides a coherent six-step request path:

1. choose the area closest to the participant's need;
2. choose the statement that sounds closest, including an explicit `I'm not sure` path;
3. explain what is happening in the participant's own words;
4. state what would be helpful right now;
5. choose a follow-up preference;
6. review the request before sending.

The participant can go back and change prior answers. Guidance helps narrow the request without deciding what the participant means.

## Verified persistence behavior

A participant-created request is stored with status `submitted`.

Immediately after a successful save, THRIVE shows a temporary session acknowledgment. After refresh, that temporary acknowledgment disappears while the request remains under Current Requests with its stored lifecycle state. This behavior is correct and should be preserved.

## DSS service standard

The participant-facing Support standard is intentionally retained:

- acknowledge a new Support request within 1 hour;
- provide a meaningful response or update within 24 hours;
- some requests may take longer to fully resolve.

This is an intentional DSS service obligation, not incidental marketing copy.

The UI must continue to distinguish acknowledgment, meaningful response/update, and final resolution.

## Lifecycle truth reconciliation

Participant-facing meanings currently reconcile as follows:

- `submitted` -> Received. Support has received the request; nothing is required from the participant right now.
- `acknowledged` -> Acknowledged. Support has seen the request.
- `in_progress` -> In review. Support is actively reviewing the request.
- `waiting_for_participant` -> Waiting for you. The participant should read the latest Support message and may reply.
- `completed` -> Resolved. The request is complete and remains in history.
- `withdrawn` -> Withdrawn. The participant closed the newly submitted request and it remains in history.
- `archived` -> Archived/history. The record is preserved and is not an active request.

A participant reply does not automatically change reviewer-controlled request status.

## Today reconciliation

The Today route already uses the grounded wording `Your request was received` for `submitted` requests.

Today selects only unresolved Support requests and excludes:

- completed;
- withdrawn;
- archived.

When Support is waiting for the participant, Today may elevate the request because an actual participant action is required. Otherwise an open request remains informational and does not automatically displace every other participant action.

## Current/history treatment

Current requests are those whose statuses are not completed, withdrawn, or archived.

Previous requests are completed, withdrawn, or archived records. They remain useful participant history but should not dominate the ordinary Support landing experience.

### Remaining bounded UI polish

Two participant-facing polish items remain inside the existing Support architecture:

1. The temporary post-submit headline should say **`Your request was received.`** rather than implying an assignment or acknowledgment that has not yet occurred.
2. **Previous requests** should be collapsed or otherwise compact by default so preserved history remains available without creating a long archival wall on mobile.

These are presentation corrections only. They do not change Support persistence, lifecycle, permissions, routing, assignment, reviewer authority, or participant write behavior.

## Frozen boundaries

This reconciliation does not authorize:

- automatic Support requests from Wellness or Goals;
- automatic reviewer assignment;
- automatic status changes after participant replies;
- external sharing or expanded consent;
- Trust Engine synchronization;
- clinical, legal, fiduciary, or eligibility conclusions;
- hard deletes;
- SQL execution or schema changes;
- auth changes.

## Gate status

**Support engine and participant request flow:** PASS.

**Lifecycle truth mapping:** PASS.

**Today -> Support mapping:** PASS.

**Persistence across refresh:** PASS.

**Remaining UI polish:** post-submit truth wording and compact/collapsed previous-request presentation.

After those presentation items are verified on a real phone, Support may be closed and the participant rail may move to review-only Resources / Guided Reference design.
