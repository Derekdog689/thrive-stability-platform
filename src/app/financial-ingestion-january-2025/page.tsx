import fs from "node:fs";
import path from "node:path";

import ImportConfirmationClient from "./ImportConfirmationClient";

export const dynamic = "force-static";

const WORKSPACE = {
  id: "d1cb9168-b0cd-42d0-8745-024c3e421c11",
  name: "THRIVE Trust Stewardship",
  type: "trust_support",
};

const PROGRAM = {
  id: "f67f14a2-6666-44d6-99d4-dbb2678a2863",
  name: "Johnny Stability and Trust Support",
  type: "trust_stewardship",
};

const SOURCE = {
  filename: "acct_2847_01_01_2025_to_01_31_2025.csv",
  accountMask: "2847",
  sha256:
    "9c993baf1e7558de40215ac7802c23c1fbee04f7ca80e5405366c1043a6b951a",
  statementStart: "January 1, 2025",
  statementEnd: "January 31, 2025",
  transactionRows: 85,
  normalizedTotal: -12570.54,
  contentIdenticalGroups: 7,
  contentIdenticalRows: 14,
};

const REPORT_PATH =
  "docs/supabase/THRIVE_JANUARY_2025_DRY_RUN_VALIDATION_REPORT.md";

function readValidationStatus() {
  const absolutePath = path.join(process.cwd(), REPORT_PATH);

  try {
    const report = fs.readFileSync(absolutePath, "utf8");

    return {
      reportFound: true,
      passed:
        report.includes("- Validation status: **PASS**") &&
        report.includes("- Database writes: **0**") &&
        report.includes("| Observed transaction rows | 85 |") &&
        report.includes("| Rows rejected | 0 |") &&
        report.includes("| Rows silently removed | 0 |"),
    };
  } catch {
    return {
      reportFound: false,
      passed: false,
    };
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <dt className="text-sm font-bold text-slate-600">{label}</dt>
      <dd className="break-all text-sm font-semibold text-slate-950 sm:text-right">
        {value}
      </dd>
    </div>
  );
}

export default function January2025FinancialIngestionPage() {
  const validation = readValidationStatus();

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-950">
      <section className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-700">
            DSS Enterprises
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            January 2025 Financial Import Confirmation
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
            Read-only confirmation of the proposed January 2025 financial
            ingestion destination, reconciled source identity, and dry-run
            validation outcome.
          </p>
        </header>

        <section
          className={`rounded-3xl border p-6 ${
            validation.passed
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <p
            className={`text-sm font-black uppercase tracking-wide ${
              validation.passed ? "text-emerald-800" : "text-red-800"
            }`}
          >
            Validation gate
          </p>

          <h2 className="mt-2 text-2xl font-black">
            {validation.passed
              ? "Dry-run validation passed"
              : "Import remains blocked"}
          </h2>

          <p className="mt-3 text-sm leading-6">
            {validation.reportFound
              ? validation.passed
                ? "The committed January dry-run report confirms 85 accepted rows, zero rejected rows, zero silently removed rows, and zero database writes."
                : "The validation report was found, but one or more required PASS markers are missing."
              : "The committed January dry-run report could not be found."}
          </p>
        </section>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <p className="font-black text-amber-950">Read-only phase</p>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            This page does not upload the CSV, create a financial source,
            create an import batch, insert staged transactions, create trust
            conclusions, or approve financial records.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Locked destination</h2>

            <dl className="mt-4">
              <DetailRow label="Workspace" value={WORKSPACE.name} />
              <DetailRow label="Workspace type" value={WORKSPACE.type} />
              <DetailRow label="Workspace ID" value={WORKSPACE.id} />
              <DetailRow label="Program" value={PROGRAM.name} />
              <DetailRow label="Program type" value={PROGRAM.type} />
              <DetailRow label="Program ID" value={PROGRAM.id} />
            </dl>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Reconciled source</h2>

            <dl className="mt-4">
              <DetailRow label="Source filename" value={SOURCE.filename} />
              <DetailRow
                label="Masked account"
                value={`Ending in ${SOURCE.accountMask}`}
              />
              <DetailRow
                label="Statement period"
                value={`${SOURCE.statementStart} through ${SOURCE.statementEnd}`}
              />
              <DetailRow
                label="Transaction rows"
                value={SOURCE.transactionRows}
              />
              <DetailRow
                label="Normalized total"
                value={formatCurrency(SOURCE.normalizedTotal)}
              />
            </dl>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Source identity controls</h2>

          <dl className="mt-4">
            <DetailRow label="SHA-256" value={SOURCE.sha256} />
            <DetailRow
              label="Content-identical groups"
              value={SOURCE.contentIdenticalGroups}
            />
            <DetailRow
              label="Rows within those groups"
              value={SOURCE.contentIdenticalRows}
            />
            <DetailRow
              label="Duplicate treatment"
              value="Preserve separately and require human review"
            />
          </dl>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Proposed future import behavior</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Create or reuse one verified financial source",
              "Create one January 2025 monthly batch",
              "Insert all 85 staged source rows",
              "Preserve raw and normalized values separately",
              "Preserve content-identical rows separately",
              "Stop at ready_for_review",
              "Require human reconciliation",
              "Never approve automatically",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <ImportConfirmationClient
          validationPassed={validation.passed}
        />

        <section className="rounded-3xl bg-slate-950 p-6 text-white">
          <h2 className="text-xl font-black">
            Legal, ethical, and fiduciary boundary
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            The bank file supplies observational data. It does not independently
            establish an approved trust distribution, protected expense,
            beneficiary obligation, spending conclusion, legal conclusion,
            fiduciary determination, financial recommendation, or authority to
            make or automate payments.
          </p>

          <p className="mt-3 text-sm font-black text-emerald-300">
            The reviewed trust record remains authoritative.
          </p>
        </section>
      </section>
    </main>
  );
}
