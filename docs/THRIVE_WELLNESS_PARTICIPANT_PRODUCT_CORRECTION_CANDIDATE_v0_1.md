# THRIVE Wellness Participant Product Correction Candidate v0.1

## Status

Review-only participant-experience candidate.

## Purpose

Replace stale implementation and candidate language on the Wellness route while
preserving the installed read model and locked write path.

## Preserved behavior

- authenticated participant access;
- supported-person resolution;
- active program-participation resolution;
- today’s active Wellness check-in read;
- controlled form state;
- locked insert and same-day update functions;
- Person D allowlist and local activation flag;
- read-only behavior outside controlled testing.

## Product changes

- removes “connection review,” “preview only,” and “write candidate” language;
- accurately states that today’s active saved check-in can be viewed;
- clarifies that broader Wellness history is not available yet;
- explains that saving is unavailable outside controlled testing;
- keeps Support contact separate from the Wellness reflection;
- removes stale claims that the database is disconnected;
- preserves the participant-owned, non-clinical meaning of the check-in.

## Frozen boundaries

- Person D activation remains off;
- no database, schema, trigger, or RLS changes;
- no insert or update activation;
- no automatic Support request;
- no Johnny or real participant data changes;
- no Trust Engine synchronization;
- no deployment.

## Review questions

1. Does the page read like a participant Wellness tool rather than a test console?
2. Is the locked saving state accurate and understandable?
3. Is today’s saved-record behavior described correctly?
4. Is Support clearly separate from the check-in?
5. Does the page remain calm and usable on desktop and mobile?

## Exact next gate

Review `/wellness` locally on desktop and narrow mobile widths.

Do not activate Person D and do not commit until the visible wording and layout
are approved.
