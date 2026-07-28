# THRIVE My Program Language Cleanup Candidate v0.1

## Status

Review-only participant-experience candidate.

## Purpose

Keep the existing authenticated My Program read chain while replacing technical
and development-facing wording with plain participant language.

## Preserved behavior

- Supabase authentication;
- supported-person resolution;
- active program-participant resolution;
- active program resolution;
- workspace and participant scoping;
- read-only behavior;
- shared THRIVE navigation.

## Product changes

- removes participant email from the program page;
- removes visible development-boundary language;
- replaces “participant-linked” and similar database wording;
- reduces duplicate status fields;
- explains what the program supports;
- adds a simple next-step orientation.

## Frozen boundaries

- no query changes;
- no database or RLS changes;
- no write actions;
- no Johnny or real participant data changes;
- no Trust Engine synchronization;
- no deployment.

## Review questions

1. Does the page sound like it is speaking to a participant rather than an administrator?
2. Is the program purpose clear?
3. Are role and status labels understandable?
4. Is the page calmer on mobile?
5. Does any remaining copy expose testing or implementation language?

## Exact next gate

Review `/my-program` locally on desktop and narrow mobile widths.

Do not commit until the visible layout and language are approved.
