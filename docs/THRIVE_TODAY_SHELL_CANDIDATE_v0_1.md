# THRIVE Today Shell Candidate v0.1

## Status

Review-only participant product candidate.

## Purpose

Make `/` or `/today` the permanent participant landing page.

## Initial shell

### Welcome

- participant preferred name
- current program name
- clear signed-in state

### Today cards

- Budget snapshot
- latest statement coverage
- Wellness prompt
- active goals
- support requests
- Reports shortcut

### Budget snapshot

Initially show only participant-safe confirmed data:

- planned
- spent
- remaining
- category count

If participant ownership is not yet installed, show:

`Budget information is not connected to this account yet.`

### Financial coverage

Show:

- latest statement month
- import status
- number of imported transactions
- whether explanation follow-up is pending

### Wellness prompt

Non-clinical wording:

- energy
- stress
- sleep
- routine
- confidence
- optional note

### Tone

- supportive
- factual
- neutral
- no flags based only on spending
- no clinical language
- no Trust reporting language

## Navigation order

1. Today
2. My Program
3. Budget
4. Wellness
5. Goals
6. Support
7. Reports

## Frozen boundary

No route or navigation change should be installed in this gate.
