#!/usr/bin/env python3
"""Extract the reviewed SQL transaction for synthetic CI only.
Never targets a database, never reads secrets; emitted file is local CI artifact."""
from pathlib import Path
import sys
source = Path("docs/candidates/THRIVE_SUPPORT_NOTIFICATION_INSTALL_v0_2.review.sql").read_text()
begin = source.index("-- BEGIN;")
end = source.index("-- COMMIT;", begin) + len("-- COMMIT;")
raw = source[begin:end]
lines = []
for line in raw.splitlines():
    if line.startswith("-- "):
        line = line[3:]
    if line.startswith("--"):
        # Intentionally retained comments like '-- No password'.
        pass
    lines.append(line)
out = "\n".join(lines).replace("EXACT_APPROVED_WORKSPACE_UUID", "11111111-1111-4111-8111-111111111111") + "\n"
if "CREATE ROLE thrive_support_notifier" not in out or "CREATE TRIGGER thrive_enqueue_support_reply_v02" not in out:
    sys.exit("Candidate extraction markers missing")
if "PASSWORD '" in out or "DROP " in out or "DELETE FROM" in out:
    sys.exit("Unsafe candidate operation")
Path("/tmp/support-notifier-ci-install.sql").write_text(out)
print("Extracted reviewed SQL candidate into temporary isolated-CI fixture")
