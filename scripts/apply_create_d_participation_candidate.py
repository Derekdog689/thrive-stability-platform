#!/usr/bin/env python3
from pathlib import Path
import re
import sys

TARGET = Path("src/app/supported-person-onboarding-test/page.tsx")

if not TARGET.exists():
    sys.exit(f"Target not found: {TARGET}")

text = TARGET.read_text(encoding="utf-8")
original = text

def replace_once(pattern: str, replacement: str, source: str, label: str, flags: int = 0) -> str:
    updated, count = re.subn(pattern, replacement, source, count=1, flags=flags)
    if count != 1:
        sys.exit(f"{label}: expected exactly one match, found {count}. No file was written.")
    return updated

if 'const ONBOARDING_PARTICIPATION_ID =' not in text:
    text = replace_once(
        r'(const ONBOARDING_PERSON_ID = "71000000-0000-4000-8000-000000000009";\n)',
        r'\1const ONBOARDING_PARTICIPATION_ID =\n  "71000000-0000-4000-8000-000000000010";\n',
        text,
        "Add participation constant",
    )

actions_block = '''  const actions = useMemo<TestAction[]>(
    () => [
      {
        id: "CREATE-D-PARTICIPATION",
        title: "Create synthetic program participation for supported person D",
        expected: "allowed",
        description:
          "Creates one reserved synthetic program-participation row linking supported person D to the fixed synthetic program. It does not create an authentication user or modify the supported-person identity.",
        allowedActors: ["administrator"],
        payload: {
          id: ONBOARDING_PARTICIPATION_ID,
          workspace_id: TEST_WORKSPACE_ID,
          program_id: TEST_PROGRAM_ID,
          supported_person_id: ONBOARDING_PERSON_ID,
          participant_role: "supported_person",
          status: "active",
          created_by: TEST_ADMIN_ID,
        },
      },
    ],
    [],
  );'''

text = replace_once(
    r'  const actions = useMemo<TestAction\[]>\(\n.*?\n  \);\n\n  const visibleActions = useMemo',
    actions_block + '\n\n  const visibleActions = useMemo',
    text,
    "Replace fixed action list",
    flags=re.DOTALL,
)

switch_block = '''      switch (action.id) {
        case "CREATE-D-PARTICIPATION":
          response = await supabase
            .from("program_participants")
            .insert(action.payload)
            .select();
          break;

        default:
          throw new Error("Unsupported fixed onboarding action.");
      }'''

text = replace_once(
    r'      switch \(action\.id\) \{.*?\n      \}',
    switch_block,
    text,
    "Replace execution switch",
    flags=re.DOTALL,
)

text = text.replace(
    "Administrator-only synthetic onboarding test. Identity creation only. Nothing runs automatically.",
    "Administrator-only synthetic participation candidate for supported person D. Nothing runs automatically.",
)

text = text.replace(
    "W18 and W19 remain deferred. Loading this route performs no database write.",
    "Loading this route performs no database write. The fixed participation insert runs only after exact typed confirmation and separate approval.",
)

required = [
    'id: "CREATE-D-PARTICIPATION"',
    '.from("program_participants")',
    'supported_person_id: ONBOARDING_PERSON_ID',
    'id: ONBOARDING_PARTICIPATION_ID',
    'allowedActors: ["administrator"]',
]
missing = [item for item in required if item not in text]
if missing:
    sys.exit("Required markers missing after patch: " + ", ".join(missing))

for forbidden in ["service_role", "delete(", ".delete(", "auth.admin"]:
    if forbidden in text:
        sys.exit(f"Forbidden marker detected after patch: {forbidden}")

if text == original:
    print("No changes required. Candidate already appears installed.")
else:
    TARGET.write_text(text, encoding="utf-8")
    print(f"Patched {TARGET}")

print("Candidate action: CREATE-D-PARTICIPATION")
print("Reserved participation ID: 71000000-0000-4000-8000-000000000010")
print("No database request was executed.")
