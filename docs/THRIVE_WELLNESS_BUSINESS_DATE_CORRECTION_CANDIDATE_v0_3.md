# THRIVE Wellness Business-Date Correction Candidate v0.3

## Status

Review-only installable candidate.

Installation modifies the application date helper and creates SQL candidate
files, but does not execute SQL.

## Scope

Application change:

- `src/app/wellness/useWellnessCheckinCandidate.ts`

Database candidate files:

- `docs/THRIVE_WELLNESS_BUSINESS_DATE_CORRECTION_CANDIDATE_v0_3.sql`
- `docs/THRIVE_WELLNESS_BUSINESS_DATE_CORRECTION_ROLLBACK_v0_3.sql`

Documentation:

- this file.

## Application correction

The browser-local date helper is replaced with an explicit
`America/New_York` business-date helper using `Intl.DateTimeFormat().formatToParts()`.

This guarantees a `YYYY-MM-DD` key without depending on locale ordering or
punctuation.

## Database candidate

The candidate SQL changes only:

1. the participant self-update policy date comparison;
2. the participant branch of the scope-guard trigger date comparison;
3. the `checkin_date` column default.

It preserves:

- self identity checks;
- active status checks;
- archived-at checks;
- active participation checks;
- immutable scope checks;
- admin archive/reactivation behavior;
- insert policy;
- select policies;
- unique indexes.

The candidate SQL intentionally ends with `rollback;`.

## Rollback

The rollback SQL restores:

- `current_date` in the self-update policy;
- `current_date` in the participant trigger check;
- `current_date` as the column default.

It does not delete data or change indexes.

## Temporary test UI

The installed Person D temporary edit and duplicate-test affordances are
preserved. They remain controlled by the existing local flag and exact
Person D allowlist.

## Installation checks

- verify `formatToParts()` and `America/New_York`;
- verify SQL candidate ends in rollback;
- verify rollback file restores current_date;
- verify Person D write gate remains unchanged;
- run targeted lint;
- run production build;
- run `git diff --check`;
- show repository status.

## Frozen boundaries

- do not execute candidate SQL;
- do not retry the Person D update;
- do not run duplicate protection;
- do not archive the active row;
- do not remove the Person D flag;
- do not commit until visual and code review.

## Exact next gate

Review the installed application diff and SQL files.

No database execution is authorized.
