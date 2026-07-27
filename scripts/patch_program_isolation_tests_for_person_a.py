#!/usr/bin/env python3
from pathlib import Path
import sys

TARGET = Path("src/app/supported-person-program-negative-tests/page.tsx")

if not TARGET.exists():
    sys.exit(f"Target not found: {TARGET}")

text = TARGET.read_text(encoding="utf-8")
original = text

text = text.replace(
    'const PERSON_D_AUTH_ID = "d48b7268-9aa6-4498-a923-2851fd5232c9";',
    'const PERSON_D_AUTH_ID = "d48b7268-9aa6-4498-a923-2851fd5232c9";\n'
    'const PERSON_A_AUTH_ID = "9b283c6e-c2f8-4f87-9f90-fa081ee249bd";'
)

text = text.replace(
    '  const isPersonD = userId === PERSON_D_AUTH_ID;',
    '  const isPersonD = userId === PERSON_D_AUTH_ID;\n'
    '  const isPersonA = userId === PERSON_A_AUTH_ID;\n'
    '  const isApprovedActor = isPersonD || isPersonA;'
)

text = text.replace(
    '      if (user.id !== PERSON_D_AUTH_ID) {',
    '      if (user.id !== PERSON_D_AUTH_ID && user.id !== PERSON_A_AUTH_ID) {'
)

text = text.replace(
    '{isPersonD\n              ? "Controlled synthetic supported person D"\n              : "Not authorized for this test page"}',
    '{isPersonD\n              ? "Controlled synthetic supported person D"\n              : isPersonA\n                ? "Controlled synthetic supported person A"\n                : "Not authorized for this test page"}'
)

text = text.replace(
    '        {!isPersonD ? (\n'
    '          <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-950">\n'
    '            This page is currently restricted to synthetic supported person D.\n'
    '            No program query results are displayed.\n'
    '          </section>\n'
    '        ) : null}\n\n'
    '        {isPersonD\n'
    '          ? results.map((result) => {',
    '        {!isApprovedActor ? (\n'
    '          <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-950">\n'
    '            This page is restricted to controlled synthetic supported persons A and D.\n'
    '            No program query results are displayed.\n'
    '          </section>\n'
    '        ) : null}\n\n'
    '        {isApprovedActor\n'
    '          ? results.map((result) => {'
)

text = text.replace(
    '              const passed =\n'
    '                result.error === null &&\n'
    '                ((result.expected === "visible" && visible) ||\n'
    '                  (result.expected === "hidden" && !visible));',
    '              const expectedForActor = isPersonD\n'
    '                ? result.expected\n'
    '                : "hidden";\n\n'
    '              const passed =\n'
    '                result.error === null &&\n'
    '                ((expectedForActor === "visible" && visible) ||\n'
    '                  (expectedForActor === "hidden" && !visible));'
)

text = text.replace(
    '<dd>{result.expected}</dd>',
    '<dd>{expectedForActor}</dd>'
)

if text == original:
    sys.exit("Expected patch markers were not found. No file was changed.")

TARGET.write_text(text, encoding="utf-8")
print(f"Patched {TARGET}")
print("No database request was executed.")
