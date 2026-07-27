#!/usr/bin/env python3
from pathlib import Path
import sys

TARGET = Path("src/app/supported-person-program-negative-tests/page.tsx")

if not TARGET.exists():
    sys.exit(f"Target not found: {TARGET}")

text = TARGET.read_text(encoding="utf-8")
original = text

text = text.replace(
    'const PERSON_A_AUTH_ID = "9b283c6e-c2f8-4f87-9f90-fa081ee249bd";',
    'const PERSON_A_AUTH_ID = "9b283c6e-c2f8-4f87-9f90-fa081ee249bd";\n'
    'const OUTSIDER_AUTH_ID = "d89a6549-ac1a-431c-aff1-1ba7313175ab";'
)

text = text.replace(
    'label: "Person D linked program",',
    'label: "Shared controlled synthetic program",'
)

text = text.replace(
    '  const isApprovedActor = isPersonD || isPersonA;',
    '  const isOutsider = userId === OUTSIDER_AUTH_ID;\n'
    '  const isApprovedActor = isPersonD || isPersonA || isOutsider;'
)

text = text.replace(
    '      if (user.id !== PERSON_D_AUTH_ID && user.id !== PERSON_A_AUTH_ID) {',
    '      if (\n'
    '        user.id !== PERSON_D_AUTH_ID &&\n'
    '        user.id !== PERSON_A_AUTH_ID &&\n'
    '        user.id !== OUTSIDER_AUTH_ID\n'
    '      ) {'
)

text = text.replace(
    ': isPersonA\n                ? "Controlled synthetic supported person A"\n                : "Not authorized for this test page"}',
    ': isPersonA\n'
    '                ? "Controlled synthetic supported person A"\n'
    '                : isOutsider\n'
    '                  ? "Controlled synthetic outsider"\n'
    '                  : "Not authorized for this test page"}'
)

text = text.replace(
    'This page is restricted to controlled synthetic supported persons A and D.',
    'This page is restricted to controlled synthetic persons A, D, and the outsider.'
)

text = text.replace(
    '              const expectedForActor = isPersonD\n'
    '                ? result.expected\n'
    '                : "hidden";',
    '              const expectedForActor = isOutsider\n'
    '                ? "hidden"\n'
    '                : result.key === "linked_program"\n'
    '                  ? "visible"\n'
    '                  : "hidden";'
)

if text == original:
    sys.exit("Expected patch markers were not found. No file was changed.")

TARGET.write_text(text, encoding="utf-8")
print(f"Patched {TARGET}")
print("No database request was executed.")
