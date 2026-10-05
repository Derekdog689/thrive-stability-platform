# THRIVE Financial Activity Day Focus v0.1
## Review-only implementation candidate

**Status:** Candidate only. No production implementation is authorized by this document.

## Verified starting state

The current THRIVE continuity model has already proven identity-preserving return behavior across completed Money plans, Goals, Support requests, and Wellness history days.

The remaining confirmed Money continuity seam is Financial Activity:

- Today currently links Money activity to the broad `/financial-activity` surface.
- Story currently links Money activity to the broad `/financial-activity` surface.
- Financial Activity already has dated activity records.
- The Financial Activity receiver does not currently preserve a source day in the route.
- No schema change is required or presumed for this candidate.

## Frozen boundaries

This candidate does not authorize or introduce:

- schema changes,
- Trust Engine work,
- transaction scoring,
- behavioral or clinical inference,
- conclusions about intent, responsibility, relapse, incapacity, or trust misuse,
- automatic participant explanations,
- transaction-level interpretation,
- historical data rewrites,
- support-request changes,
- deployment, merge, or production execution.

Bank and imported account data remain observational evidence only.

## Problem

THRIVE can know that Money activity occurred on a specific day and still lose that date when the participant follows the continuity link.

Current return edge:

```
Money activity event
  -> /financial-activity
  -> entire Financial Activity surface
```

This is truthful, but it does not preserve the identity of the originating day.

The established continuity rule is:

> Single object -> exact object.  
> Grouped records -> exact truthful group/list/history context.

Financial Activity on a day is a grouped-record case.

## Candidate behavior

Use an explicit day query:

```
/financial-activity?day=YYYY-MM-DD
```

### Story

A Story Money-activity event for a historical day should return to that exact day group in Financial Activity.

Example:

```
/financial-activity?day=2026-10-03
```

### Today

Today's Money-activity movement should return to today's exact day group in Financial Activity.

Example:

```
/financial-activity?day=2026-10-05
```

### Financial Activity receiver

When a valid `day` query is present and matching activity exists, the page should:

1. preserve the existing Financial Activity data model and source/provenance display,
2. identify all Financial Activity records for that exact date,
3. present or focus a truthful day-level group,
4. bring that day group into view,
5. retain access to the broader Financial Activity surface.

The receiver must not pretend that one transaction represents the whole event when multiple records exist for that date.

## Fail-soft behavior

If `day` is:

- missing,
- malformed,
- outside the available activity history, or
- valid but has no matching Financial Activity records,

Financial Activity should load normally without creating a false focus state or erroring the participant out of the page.

No record should be created or changed merely because the route was opened.

## Day identity

The focus key should use the existing canonical activity date already available on Financial Activity records.

The candidate should not introduce a new date field, derive a behavioral time window, or reinterpret timestamps into a new meaning.

## Participant presentation

The focused state should remain compact on phone.

Candidate presentation:

- clear date label,
- count of records for that date,
- factual Money in / Money out summary only if those totals are already safely derivable from the displayed records,
- the records belonging to that day,
- a simple path back to all Financial Activity.

The exact visual treatment is implementation detail. The continuity requirement is the important part.

## What this does not mean

A day focus is navigation context, not analysis.

Examples of disallowed automatic conclusions:

- "You overspent today."
- "You were irresponsible."
- "This purchase caused your budget problem."
- "Your spending suggests relapse."
- "You should stop buying food."

Permitted factual language can describe what the stored records show without assigning motive or judgment.

Participant-authored explanations remain separate from observational activity facts.

## Expected code surface

Likely smallest implementation surface:

- `src/app/living-signal/story/buildStoryReadModel.ts`
  - change Money activity return href from broad Financial Activity to exact day focus.

- `src/app/living-signal/today/_liveToday.tsx`
  - change today's Money movement href from broad Financial Activity to today's day focus.

- `src/app/financial-activity/page.tsx`
  - read and validate the `day` query,
  - derive matching day records from already loaded Financial Activity,
  - focus/render that group,
  - fail soft when the query cannot be satisfied.

No new database object is presumed.

## Acceptance checks

Before any merge, verify on phone:

1. Story historical Money activity opens the correct historical day.
2. A day with multiple Money records shows that day's group, not a fabricated single transaction.
3. Today Money activity opens today's Financial Activity group.
4. Different historical Story days resolve to different groups.
5. Broad Financial Activity still opens normally with no `day` query.
6. Invalid or unmatched `day` fails soft to normal Financial Activity.
7. Imported and manual record provenance remains visible and unchanged.
8. Existing participant explanation behavior remains unchanged.
9. No writes occur from opening a focused day.
10. No schema, Support, Trust Engine, or lifecycle behavior changes.

## Gate after approval

If this candidate is approved for implementation, the next gate is a narrow feature branch implementing only Financial Activity Day Focus v0.1, followed by build/static checks and phone verification before any merge.

