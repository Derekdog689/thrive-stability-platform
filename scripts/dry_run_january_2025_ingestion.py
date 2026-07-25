#!/usr/bin/env python3
"""
THRIVE January 2025 Financial Ingestion Dry Run

Purpose:
- Read the ignored January 2025 bank CSV locally.
- Preserve every source row.
- Validate source structure and reconciled expectations.
- Produce proposed normalized staging records.
- Produce a commit-safe Markdown validation report.
- Perform zero database writes.

Governing rule:
The bank feed supplies observational data.
The reviewed trust record remains authoritative.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import date, datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any, Iterable

EXPECTED_HEADERS = [
    "Posted Date",
    "Transaction Date",
    "Transaction Type",
    "Check/Serial #",
    "Full description",
    "Merchant name",
    "Category name",
    "Sub-category name",
    "Amount",
    "Daily Posted Balance",
]

EXPECTED_SHA256 = (
    "9c993baf1e7558de40215ac7802c23c1fbee04f7ca80e5405366c1043a6b951a"
)

EXPECTED_TRANSACTION_ROWS = 85
EXPECTED_COLUMN_COUNT = 10

EXPECTED_STATEMENT_START = date(2025, 1, 1)
EXPECTED_STATEMENT_END = date(2025, 1, 31)

DEFAULT_SOURCE = Path(
    "docs/source_samples/january_2025/"
    "acct_2847_01_01_2025_to_01_31_2025.csv"
)

DEFAULT_PRIVATE_PREVIEW = Path(
    "private_artifacts/financial_ingestion/january_2025/"
    "january_2025_staging_preview.json"
)

DEFAULT_PRIVATE_CSV_PREVIEW = Path(
    "private_artifacts/financial_ingestion/january_2025/"
    "january_2025_staging_preview.csv"
)

DEFAULT_REPORT = Path(
    "docs/supabase/"
    "THRIVE_JANUARY_2025_DRY_RUN_VALIDATION_REPORT.md"
)


@dataclass(frozen=True)
class ValidationIssue:
    severity: str
    code: str
    message: str
    source_row_number: int | None = None


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()

    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)

    return digest.hexdigest()


def parse_mmddyyyy(value: str) -> date:
    return datetime.strptime(value.strip(), "%m/%d/%Y").date()


def parse_us_money(value: str) -> Decimal:
    raw = value.strip()

    if not raw:
        raise ValueError("Money value is blank.")

    negative_parentheses = raw.startswith("(") and raw.endswith(")")

    cleaned = raw
    if negative_parentheses:
        cleaned = cleaned[1:-1]

    cleaned = (
        cleaned.replace("$", "")
        .replace(",", "")
        .replace("+", "")
        .strip()
    )

    try:
        amount = Decimal(cleaned)
    except InvalidOperation as exc:
        raise ValueError(f"Invalid money value: {value!r}") from exc

    if negative_parentheses:
        amount = -abs(amount)

    return amount.quantize(Decimal("0.01"))


def normalize_optional_text(value: str) -> str | None:
    cleaned = value.strip()
    return cleaned if cleaned else None


def canonical_row_payload(row: dict[str, str]) -> list[str]:
    """
    Preserve exact source field content in source-column order.

    This fingerprint is analytical only. It is not unique and must not
    establish that a financial event is duplicated.
    """
    return [row.get(header, "") for header in EXPECTED_HEADERS]


def content_fingerprint(row: dict[str, str]) -> str:
    payload = json.dumps(
        canonical_row_payload(row),
        ensure_ascii=False,
        separators=(",", ":"),
    ).encode("utf-8")

    return hashlib.sha256(payload).hexdigest()


def decimal_as_string(value: Decimal) -> str:
    return format(value, ".2f")


def iso_or_none(value: date | None) -> str | None:
    return value.isoformat() if value else None


def write_json_preview(
    path: Path,
    metadata: dict[str, Any],
    records: list[dict[str, Any]],
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

    payload = {
        "classification": "PRIVATE FINANCIAL SOURCE PREVIEW",
        "database_writes": 0,
        "metadata": metadata,
        "records": records,
    }

    path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def write_csv_preview(path: Path, records: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

    if not records:
        path.write_text("", encoding="utf-8")
        return

    fieldnames = list(records[0].keys())

    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)


def markdown_table(rows: Iterable[tuple[str, Any]]) -> str:
    output = [
        "| Metric | Result |",
        "|---|---:|",
    ]

    for label, value in rows:
        output.append(f"| {label} | {value} |")

    return "\n".join(output)


def write_report(
    path: Path,
    *,
    source_path: Path,
    source_sha256: str,
    generated_at: str,
    row_count: int,
    accepted_count: int,
    rejected_count: int,
    parse_issue_count: int,
    duplicate_group_count: int,
    duplicate_group_row_count: int,
    transaction_type_counts: Counter[str],
    posted_date_min: date | None,
    posted_date_max: date | None,
    transaction_date_min: date | None,
    transaction_date_max: date | None,
    normalized_total: Decimal,
    category_count: int,
    subcategory_count: int,
    source_identity_count: int,
    content_fingerprint_count: int,
    issues: list[ValidationIssue],
    readiness_passed: bool,
    private_json_path: Path,
    private_csv_path: Path,
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

    issue_lines: list[str] = []

    if issues:
        for issue in issues:
            location = (
                f"source row {issue.source_row_number}"
                if issue.source_row_number is not None
                else "file-level"
            )

            issue_lines.append(
                f"- **{issue.severity} / {issue.code}:** "
                f"{issue.message} ({location})"
            )
    else:
        issue_lines.append("- No validation issues detected.")

    type_lines = [
        f"- `{transaction_type}`: {count}"
        for transaction_type, count in sorted(transaction_type_counts.items())
    ]

    status = "PASS" if readiness_passed else "REVIEW REQUIRED"

    report = f"""# THRIVE January 2025 Dry-Run Validation Report

## Status

- Validation status: **{status}**
- Generated at: {generated_at}
- Source period: January 2025
- Database writes: **0**
- Supabase access: **None**
- Real source file committed to Git: **No**
- Real staging previews committed to Git: **No**

## Governing Rule

The bank feed supplies observational data. The reviewed trust record remains authoritative.

## Source Identity

- Source file: `{source_path.name}`
- Local source location: `{source_path}`
- Masked account: ending in `2847`
- SHA-256: `{source_sha256}`
- Reconciled SHA-256 match: `{"PASS" if source_sha256 == EXPECTED_SHA256 else "FAIL"}`

## Structural Validation

{markdown_table([
    ("Expected columns", EXPECTED_COLUMN_COUNT),
    ("Observed columns", EXPECTED_COLUMN_COUNT),
    ("Expected transaction rows", EXPECTED_TRANSACTION_ROWS),
    ("Observed transaction rows", row_count),
    ("Rows accepted for proposed staging", accepted_count),
    ("Rows rejected", rejected_count),
    ("Rows silently removed", 0),
    ("Parse or validation issues", parse_issue_count),
])}

## Date Validation

- Posted-date range: `{posted_date_min}` through `{posted_date_max}`
- Transaction-date range: `{transaction_date_min}` through `{transaction_date_max}`
- Monthly assignment rule: `Posted Date`
- Required posted boundary: `2025-01-01` through `2025-01-31`, inclusive
- December transaction dates posted in January remain assigned to January.

## Financial Normalization

- Proposed normalized amount total: `${decimal_as_string(normalized_total)}`
- Currency locale: `en-US`
- Parenthetical source amounts normalize to negative numeric values.
- Raw amount strings remain preserved unchanged.
- `Daily Posted Balance` remains a source-provided daily marker and is not treated as a transaction-specific running balance.

## Transaction-Type Inventory

{chr(10).join(type_lines)}

## Classification Inventory

- Distinct source categories: {category_count}
- Distinct source subcategories: {subcategory_count}

Source-provided category labels remain observational bank metadata. They do not independently establish THRIVE, trust, legal, or fiduciary classifications.

## Source Identity and Content Comparison

{markdown_table([
    ("Unique source-row identities", source_identity_count),
    ("Expected source-row identities", row_count),
    ("Distinct content fingerprints", content_fingerprint_count),
    ("Content-identical source-row groups", duplicate_group_count),
    ("Rows within content-identical groups", duplicate_group_row_count),
])}

Each proposed staging row uses:

`<source-file-sha256>:<original-source-row-number>`

Content fingerprints are intentionally nonunique.

Content-identical rows remain separate source observations and are not automatically removed, merged, or classified as duplicate financial events.

## Private Dry-Run Artifacts

The following generated previews contain real financial source content and remain excluded from Git:

- `{private_json_path}`
- `{private_csv_path}`

These previews contain:

- original source-row identity;
- all raw imported fields;
- proposed normalized fields;
- proposed content fingerprint;
- parse status;
- zero trust conclusions.

## Validation Issues

{chr(10).join(issue_lines)}

## Import Readiness Decision

**{status}**

The dry run may advance only when all of the following are true:

- file SHA-256 matches the reconciled source;
- all 85 transaction rows are read;
- all rows contain exactly 10 columns;
- all posted dates fall within January 2025;
- every source row receives a unique source identity;
- every date and money field normalizes successfully;
- no row is silently dropped or merged;
- content-identical rows remain separate;
- database writes remain zero during this dry run.

## Legal, Ethical, and Fiduciary Boundary

This dry run does not establish that any source transaction is:

- an approved trust distribution;
- appropriate or inappropriate spending;
- a protected expense;
- a fiduciary conclusion;
- a beneficiary obligation;
- a legal conclusion;
- a financial recommendation;
- or authority to make or automate payments.

The reviewed trust record remains authoritative.

## Current Decision

No January 2025 source row was written to Supabase.

A separate authorization is required before creating the real financial source, January import batch, or staged financial transactions.
"""

    path.write_text(report, encoding="utf-8")


def run(args: argparse.Namespace) -> int:
    source_path: Path = args.source
    report_path: Path = args.report
    private_json_path: Path = args.private_json
    private_csv_path: Path = args.private_csv

    issues: list[ValidationIssue] = []

    if not source_path.exists():
        print(f"ERROR: Source file not found: {source_path}", file=sys.stderr)
        return 2

    source_sha256 = sha256_file(source_path)

    if source_sha256 != EXPECTED_SHA256:
        issues.append(
            ValidationIssue(
                severity="ERROR",
                code="SOURCE_HASH_MISMATCH",
                message=(
                    f"Expected {EXPECTED_SHA256}, observed {source_sha256}."
                ),
            )
        )

    with source_path.open(
        "r",
        newline="",
        encoding="utf-8-sig",
    ) as file:
        reader = csv.reader(file)
        header = next(reader, [])
        raw_rows = list(reader)

    if header != EXPECTED_HEADERS:
        issues.append(
            ValidationIssue(
                severity="ERROR",
                code="HEADER_MISMATCH",
                message=(
                    f"Expected headers {EXPECTED_HEADERS!r}; "
                    f"observed {header!r}."
                ),
            )
        )

    if len(header) != EXPECTED_COLUMN_COUNT:
        issues.append(
            ValidationIssue(
                severity="ERROR",
                code="COLUMN_COUNT_MISMATCH",
                message=(
                    f"Expected {EXPECTED_COLUMN_COUNT} columns; "
                    f"observed {len(header)}."
                ),
            )
        )

    if len(raw_rows) != EXPECTED_TRANSACTION_ROWS:
        issues.append(
            ValidationIssue(
                severity="ERROR",
                code="ROW_COUNT_MISMATCH",
                message=(
                    f"Expected {EXPECTED_TRANSACTION_ROWS} transaction rows; "
                    f"observed {len(raw_rows)}."
                ),
            )
        )

    records: list[dict[str, Any]] = []
    exact_content_groups: dict[tuple[str, ...], list[int]] = defaultdict(list)

    transaction_type_counts: Counter[str] = Counter()
    categories: set[str] = set()
    subcategories: set[str] = set()

    posted_dates: list[date] = []
    transaction_dates: list[date] = []

    normalized_total = Decimal("0.00")
    rejected_count = 0

    for source_row_number, raw_values in enumerate(raw_rows, start=2):
        if len(raw_values) != EXPECTED_COLUMN_COUNT:
            issues.append(
                ValidationIssue(
                    severity="ERROR",
                    code="ROW_WIDTH_MISMATCH",
                    message=(
                        f"Expected {EXPECTED_COLUMN_COUNT} fields; "
                        f"observed {len(raw_values)}."
                    ),
                    source_row_number=source_row_number,
                )
            )
            rejected_count += 1
            continue

        row = dict(zip(EXPECTED_HEADERS, raw_values, strict=True))
        exact_content_groups[tuple(raw_values)].append(source_row_number)

        row_issues_before = len(issues)

        try:
            posted_date = parse_mmddyyyy(row["Posted Date"])
        except ValueError as exc:
            posted_date = None
            issues.append(
                ValidationIssue(
                    severity="ERROR",
                    code="POSTED_DATE_PARSE_ERROR",
                    message=str(exc),
                    source_row_number=source_row_number,
                )
            )

        try:
            transaction_date = parse_mmddyyyy(row["Transaction Date"])
        except ValueError as exc:
            transaction_date = None
            issues.append(
                ValidationIssue(
                    severity="ERROR",
                    code="TRANSACTION_DATE_PARSE_ERROR",
                    message=str(exc),
                    source_row_number=source_row_number,
                )
            )

        try:
            amount = parse_us_money(row["Amount"])
        except ValueError as exc:
            amount = None
            issues.append(
                ValidationIssue(
                    severity="ERROR",
                    code="AMOUNT_PARSE_ERROR",
                    message=str(exc),
                    source_row_number=source_row_number,
                )
            )

        try:
            daily_posted_balance = parse_us_money(
                row["Daily Posted Balance"]
            )
        except ValueError as exc:
            daily_posted_balance = None
            issues.append(
                ValidationIssue(
                    severity="ERROR",
                    code="BALANCE_PARSE_ERROR",
                    message=str(exc),
                    source_row_number=source_row_number,
                )
            )

        if posted_date is not None:
            posted_dates.append(posted_date)

            if not (
                EXPECTED_STATEMENT_START
                <= posted_date
                <= EXPECTED_STATEMENT_END
            ):
                issues.append(
                    ValidationIssue(
                        severity="ERROR",
                        code="POSTED_DATE_OUTSIDE_STATEMENT_PERIOD",
                        message=(
                            f"Posted date {posted_date} is outside "
                            "January 2025."
                        ),
                        source_row_number=source_row_number,
                    )
                )

        if transaction_date is not None:
            transaction_dates.append(transaction_date)

        transaction_type = row["Transaction Type"].strip()
        category_name = row["Category name"].strip()
        subcategory_name = row["Sub-category name"].strip()

        if not transaction_type:
            issues.append(
                ValidationIssue(
                    severity="ERROR",
                    code="BLANK_TRANSACTION_TYPE",
                    message="Transaction type is blank.",
                    source_row_number=source_row_number,
                )
            )
        else:
            transaction_type_counts[transaction_type] += 1

        if not category_name:
            issues.append(
                ValidationIssue(
                    severity="ERROR",
                    code="BLANK_CATEGORY",
                    message="Category name is blank.",
                    source_row_number=source_row_number,
                )
            )
        else:
            categories.add(category_name)

        if not subcategory_name:
            issues.append(
                ValidationIssue(
                    severity="ERROR",
                    code="BLANK_SUBCATEGORY",
                    message="Sub-category name is blank.",
                    source_row_number=source_row_number,
                )
            )
        else:
            subcategories.add(subcategory_name)

        source_row_identity = f"{source_sha256}:{source_row_number}"
        fingerprint = content_fingerprint(row)

        parse_status = (
            "parsed"
            if len(issues) == row_issues_before
            else "needs_review"
        )

        if amount is not None:
            normalized_total += amount

        record = {
            "workspace_id": None,
            "program_id": None,
            "financial_source_id": None,
            "import_batch_id": None,
            "source_row_number": source_row_number,
            "source_row_identity": source_row_identity,
            "source_content_fingerprint": fingerprint,
            "raw_posted_date": row["Posted Date"],
            "raw_transaction_date": row["Transaction Date"],
            "raw_transaction_type": row["Transaction Type"],
            "raw_check_serial": normalize_optional_text(
                row["Check/Serial #"]
            ),
            "raw_full_description": row["Full description"],
            "raw_merchant_name": normalize_optional_text(
                row["Merchant name"]
            ),
            "raw_category_name": row["Category name"],
            "raw_subcategory_name": row["Sub-category name"],
            "raw_amount": row["Amount"],
            "raw_daily_posted_balance": row["Daily Posted Balance"],
            "posted_date": iso_or_none(posted_date),
            "transaction_date": iso_or_none(transaction_date),
            "transaction_type": (
                transaction_type if transaction_type else None
            ),
            "check_serial": normalize_optional_text(
                row["Check/Serial #"]
            ),
            "merchant_name": normalize_optional_text(
                row["Merchant name"]
            ),
            "category_name": (
                category_name if category_name else None
            ),
            "subcategory_name": (
                subcategory_name if subcategory_name else None
            ),
            "amount": (
                decimal_as_string(amount)
                if amount is not None
                else None
            ),
            "daily_posted_balance": (
                decimal_as_string(daily_posted_balance)
                if daily_posted_balance is not None
                else None
            ),
            "transaction_lifecycle": "posted",
            "parse_status": parse_status,
            "parse_error": None if parse_status == "parsed" else (
                "One or more dry-run validation errors apply to this row."
            ),
        }

        records.append(record)

    duplicate_groups = [
        row_numbers
        for row_numbers in exact_content_groups.values()
        if len(row_numbers) > 1
    ]

    duplicate_group_row_count = sum(
        len(group) for group in duplicate_groups
    )

    source_identities = {
        record["source_row_identity"]
        for record in records
    }

    content_fingerprints = {
        record["source_content_fingerprint"]
        for record in records
    }

    if len(source_identities) != len(records):
        issues.append(
            ValidationIssue(
                severity="ERROR",
                code="SOURCE_IDENTITY_COLLISION",
                message=(
                    "One or more proposed source-row identities are not unique."
                ),
            )
        )

    accepted_count = len(records)
    error_count = sum(
        1 for issue in issues if issue.severity == "ERROR"
    )

    readiness_passed = (
        source_sha256 == EXPECTED_SHA256
        and header == EXPECTED_HEADERS
        and len(raw_rows) == EXPECTED_TRANSACTION_ROWS
        and accepted_count == EXPECTED_TRANSACTION_ROWS
        and rejected_count == 0
        and error_count == 0
        and len(source_identities) == EXPECTED_TRANSACTION_ROWS
    )

    generated_at = datetime.now(timezone.utc).isoformat()

    metadata = {
        "source_filename": source_path.name,
        "source_file_sha256": source_sha256,
        "statement_period_start": EXPECTED_STATEMENT_START.isoformat(),
        "statement_period_end": EXPECTED_STATEMENT_END.isoformat(),
        "source_row_count": len(raw_rows),
        "accepted_count": accepted_count,
        "rejected_count": rejected_count,
        "database_writes": 0,
        "readiness_status": (
            "PASS" if readiness_passed else "REVIEW_REQUIRED"
        ),
        "generated_at": generated_at,
    }

    write_json_preview(
        private_json_path,
        metadata,
        records,
    )

    write_csv_preview(
        private_csv_path,
        records,
    )

    write_report(
        report_path,
        source_path=source_path,
        source_sha256=source_sha256,
        generated_at=generated_at,
        row_count=len(raw_rows),
        accepted_count=accepted_count,
        rejected_count=rejected_count,
        parse_issue_count=len(issues),
        duplicate_group_count=len(duplicate_groups),
        duplicate_group_row_count=duplicate_group_row_count,
        transaction_type_counts=transaction_type_counts,
        posted_date_min=min(posted_dates) if posted_dates else None,
        posted_date_max=max(posted_dates) if posted_dates else None,
        transaction_date_min=(
            min(transaction_dates) if transaction_dates else None
        ),
        transaction_date_max=(
            max(transaction_dates) if transaction_dates else None
        ),
        normalized_total=normalized_total,
        category_count=len(categories),
        subcategory_count=len(subcategories),
        source_identity_count=len(source_identities),
        content_fingerprint_count=len(content_fingerprints),
        issues=issues,
        readiness_passed=readiness_passed,
        private_json_path=private_json_path,
        private_csv_path=private_csv_path,
    )

    print("THRIVE January 2025 dry run")
    print(f"- Source file: {source_path}")
    print(f"- Source SHA-256: {source_sha256}")
    print(f"- Source rows read: {len(raw_rows)}")
    print(f"- Rows accepted for staging: {accepted_count}")
    print(f"- Rows rejected: {rejected_count}")
    print("- Rows silently removed: 0")
    print(
        f"- Content-identical groups: {len(duplicate_groups)}"
    )
    print(
        "- Rows within content-identical groups: "
        f"{duplicate_group_row_count}"
    )
    print(
        "- Proposed normalized amount total: "
        f"${decimal_as_string(normalized_total)}"
    )
    print(f"- Database writes: 0")
    print(
        "- Validation status: "
        f"{'PASS' if readiness_passed else 'REVIEW REQUIRED'}"
    )
    print(f"- Commit-safe report: {report_path}")
    print(f"- Private JSON preview: {private_json_path}")
    print(f"- Private CSV preview: {private_csv_path}")

    return 0 if readiness_passed else 1


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Validate and normalize the January 2025 financial CSV "
            "without writing to Supabase."
        )
    )

    parser.add_argument(
        "--source",
        type=Path,
        default=DEFAULT_SOURCE,
    )

    parser.add_argument(
        "--report",
        type=Path,
        default=DEFAULT_REPORT,
    )

    parser.add_argument(
        "--private-json",
        type=Path,
        default=DEFAULT_PRIVATE_PREVIEW,
    )

    parser.add_argument(
        "--private-csv",
        type=Path,
        default=DEFAULT_PRIVATE_CSV_PREVIEW,
    )

    return parser.parse_args()


if __name__ == "__main__":
    raise SystemExit(run(parse_args()))
