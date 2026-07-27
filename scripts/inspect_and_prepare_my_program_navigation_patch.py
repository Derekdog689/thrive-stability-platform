#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import difflib
import re
import sys

ROOT = Path.cwd()
APP = ROOT / "src" / "app"
DOCS = ROOT / "docs"

NAV = APP / "ThriveNavigation.tsx"
SIDEBAR = APP / "ThriveSidebar.tsx"
PAGE = APP / "page.tsx"
LAYOUT = APP / "layout.tsx"

REPORT = DOCS / "THRIVE_MY_PROGRAM_NAVIGATION_RENDERER_INSPECTION_v0_1.md"
PATCH = DOCS / "THRIVE_MY_PROGRAM_NAVIGATION_PATCH_CANDIDATE_v0_1.patch"

required = [NAV, SIDEBAR, PAGE, LAYOUT]
missing = [str(p.relative_to(ROOT)) for p in required if not p.exists()]
if missing:
    sys.exit("Missing required files:\n- " + "\n- ".join(missing))

files = {p: p.read_text(encoding="utf-8") for p in required}

def imported_or_rendered(name: str, text: str) -> bool:
    return bool(
        re.search(rf"\bimport\b[^;]*\b{name}\b", text, re.S)
        or re.search(rf"<{name}\b", text)
    )

wiring = []
for host in (PAGE, LAYOUT):
    text = files[host]
    for component in ("ThriveNavigation", "ThriveSidebar"):
        if imported_or_rendered(component, text):
            wiring.append((host, component))

renderer: Path | None = None
reason = ""

if any(component == "ThriveSidebar" for _, component in wiring):
    renderer = SIDEBAR
    reason = "ThriveSidebar is imported or rendered by page/layout wiring."
elif any(component == "ThriveNavigation" for _, component in wiring):
    renderer = NAV
    reason = "ThriveNavigation is imported or rendered by page/layout wiring."
else:
    combined = files[NAV] + "\n" + files[SIDEBAR]
    if "Dashboard" in files[SIDEBAR] and "Budget" in files[SIDEBAR]:
        renderer = SIDEBAR
        reason = "No direct page/layout reference was found, but ThriveSidebar contains both visible anchor labels."
    elif "Dashboard" in files[NAV] and "Budget" in files[NAV]:
        renderer = NAV
        reason = "No direct page/layout reference was found, but ThriveNavigation contains both visible anchor labels."

if renderer is None:
    sys.exit(
        "Could not safely identify the live navigation renderer. "
        "No files were changed. Inspect the generated terminal output manually."
    )

original = files[renderer]
candidate = original
strategy = ""

# Strategy 1: object-array navigation with label/title/name and href/path.
object_patterns = [
    re.compile(
        r'(?P<dash>\{\s*(?:label|title|name)\s*:\s*["\']Dashboard["\']\s*,'
        r'(?P<body>.*?)\}\s*,?)'
        r'(?P<middle>\s*)'
        r'(?P<budget>\{\s*(?:label|title|name)\s*:\s*["\']Budget["\'])',
        re.S,
    ),
]

for pattern in object_patterns:
    match = pattern.search(candidate)
    if not match:
        continue

    dash_block = match.group("dash")
    href_match = re.search(r'(?P<key>href|path|to)\s*:\s*["\'](?P<value>[^"\']+)["\']', dash_block)
    label_match = re.search(r'(?P<key>label|title|name)\s*:\s*["\']Dashboard["\']', dash_block)
    if not href_match or not label_match:
        continue

    label_key = label_match.group("key")
    href_key = href_match.group("key")
    indent_match = re.search(r'(^[ \t]*)\{', dash_block, re.M)
    indent = indent_match.group(1) if indent_match else "  "
    comma = "," if dash_block.rstrip().endswith(",") else ""

    new_block = (
        f'{indent}{{ {label_key}: "My Program", '
        f'{href_key}: "/my-program-candidate" }}{comma}'
    )
    replacement = (
        match.group("dash")
        + "\n"
        + new_block
        + match.group("middle")
        + match.group("budget")
    )
    candidate = candidate[: match.start()] + replacement + candidate[match.end() :]
    strategy = f"Inserted one object-array item using keys `{label_key}` and `{href_key}`."
    break

# Strategy 2: simple JSX anchors/Links with Dashboard followed by Budget.
if candidate == original:
    jsx_pattern = re.compile(
        r'(?P<dash><(?:Link|a)\b[^>]*(?:href|to)=["\']/["\'][^>]*>\s*Dashboard\s*</(?:Link|a)>)'
        r'(?P<middle>\s*)'
        r'(?P<budget><(?:Link|a)\b[^>]*(?:href|to)=["\'][^"\']*budget[^"\']*["\'][^>]*>\s*Budget\s*</(?:Link|a)>)',
        re.I | re.S,
    )
    match = jsx_pattern.search(candidate)
    if match:
        dash = match.group("dash")
        tag = "Link" if dash.lstrip().startswith("<Link") else "a"
        attr = "href"
        class_match = re.search(r'\sclassName=(\{[^}]+\}|["\'][^"\']+["\'])', dash)
        class_part = f" className={class_match.group(1)}" if class_match else ""
        new_link = (
            f'<{tag} {attr}="/my-program-candidate"{class_part}>'
            f'My Program</{tag}>'
        )
        replacement = (
            match.group("dash")
            + "\n"
            + new_link
            + match.group("middle")
            + match.group("budget")
        )
        candidate = candidate[: match.start()] + replacement + candidate[match.end() :]
        strategy = "Inserted one JSX navigation link between Dashboard and Budget."

if candidate == original:
    report = f"""# THRIVE My Program Navigation Renderer Inspection v0.1

## Result

The live navigation renderer was identified, but the script did not find a supported exact insertion pattern.

- Renderer: `{renderer.relative_to(ROOT)}`
- Identification basis: {reason}
- Source files changed: none
- Patch created: no

## Wiring observed

{chr(10).join(f"- `{host.relative_to(ROOT)}` references `{component}`" for host, component in wiring) or "- No direct page/layout reference detected."}

## Required manual review

Open `{renderer.relative_to(ROOT)}` and locate the existing `Dashboard` and `Budget` entries. The intended candidate is exactly one participant-facing item between them:

- Label: `My Program`
- Destination: `/my-program-candidate`

Do not change any other navigation item, route, database object, SQL policy, or participant record.
"""
    REPORT.write_text(report, encoding="utf-8")
    print(f"Wrote {REPORT}")
    print("No supported exact insertion pattern was found.")
    print("No source file was changed and no patch was created.")
    sys.exit(2)

diff = "".join(
    difflib.unified_diff(
        original.splitlines(keepends=True),
        candidate.splitlines(keepends=True),
        fromfile=f"a/{renderer.relative_to(ROOT)}",
        tofile=f"b/{renderer.relative_to(ROOT)}",
    )
)

PATCH.write_text(diff, encoding="utf-8")

report = f"""# THRIVE My Program Navigation Renderer Inspection v0.1

## Status

Review-only navigation patch candidate created.

No source file was changed by this inspection pass. The patch is parked in `docs/` for exact review and separate approval.

## Verified live renderer

- Renderer: `{renderer.relative_to(ROOT)}`
- Identification basis: {reason}
- Patch strategy: {strategy}

## Page and layout wiring observed

{chr(10).join(f"- `{host.relative_to(ROOT)}` references `{component}`" for host, component in wiring) or "- No direct page/layout reference detected; renderer was selected from visible labels."}

## Proposed one-item change

Insert:

- Label: `My Program`
- Destination: `/my-program-candidate`
- Placement: immediately after `Dashboard` and before `Budget`

No other navigation item is changed.

## Candidate artifact

`docs/THRIVE_MY_PROGRAM_NAVIGATION_PATCH_CANDIDATE_v0_1.patch`

## Frozen boundaries

- no source patch applied
- no route rename
- no database write
- no SQL or RLS change
- no program or participation mutation
- no Johnny change
- no Trust Engine synchronization
- no service-role use
- no push, merge, or deployment

## Exact next gate

Review the unified diff. If explicitly approved, apply only this patch, run the production build, verify the four actor states, and stop before commit unless commit approval is separately given.
"""

REPORT.write_text(report, encoding="utf-8")

print(f"Identified renderer: {renderer.relative_to(ROOT)}")
print(f"Wrote {REPORT}")
print(f"Wrote {PATCH}")
print("Review-only patch candidate created.")
print("No source file was changed.")
print("No database request was executed.")
