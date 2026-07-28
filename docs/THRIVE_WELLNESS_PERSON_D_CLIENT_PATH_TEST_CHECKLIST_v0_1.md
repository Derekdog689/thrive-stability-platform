# THRIVE Wellness Person D Client-Path Test Checklist v0.1

## Before activation

- [ ] environment flag absent;
- [ ] build passes;
- [ ] Person D active Wellness row count is zero;
- [ ] explicit activation approval recorded.

## Activation

Set locally only:

`NEXT_PUBLIC_THRIVE_WELLNESS_PERSON_D_TEST=true`

Restart the development server.

## Person D create test

- [ ] test-mode banner appears;
- [ ] save button becomes available;
- [ ] one synthetic check-in saves;
- [ ] saved-state display refreshes;
- [ ] database contains one active Person D row.

## Person D update test

- [ ] same-day update succeeds;
- [ ] saved-state display refreshes;
- [ ] immutable identity fields remain unchanged.

## Isolation

- [ ] Person A save remains disabled;
- [ ] outsider save remains disabled;
- [ ] tester-admin participant UI save remains disabled.

## Cleanup

- [ ] tester admin archives the Person D row;
- [ ] environment flag removed;
- [ ] development server restarted;
- [ ] save button disabled again;
- [ ] build passes;
- [ ] `git diff --check` passes.

## Frozen boundaries

- no real participant data;
- no Johnny data;
- no Trust Engine synchronization;
- no push or deployment.
