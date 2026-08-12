"use client";

import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";
import {
  formatDate,
  formatMoney,
  toNumber,
  useParticipantFinancial,
} from "../useParticipantFinancial";

export default function ReportsPage() {

const {
  sources,
  batches,
  transactions,
  budgetPeriods,
  budgetLines,
  totalOutflow,
  loading,
  errorMessage,
} = useParticipantFinancial();

const activeBudgetPeriod =
  budgetPeriods.find((period) => period.status === "active") ?? null;

const activeBudgetLines = activeBudgetPeriod
  ? budgetLines.filter(
      (line) => line.budget_period_id === activeBudgetPeriod.id,
    )
  : [];

const plannedTotal = activeBudgetLines.reduce(
  (sum, line) => sum + toNumber(line.planned_amount),
  0,
);

const recordedBudgetTotal = activeBudgetLines.reduce(
  (sum, line) => sum + toNumber(line.actual_amount),
  0,
);

const remainingBudgetTotal = activeBudgetLines.reduce(
  (sum, line) => sum + toNumber(line.remaining_amount),
  0,
);

const expectedIncome = activeBudgetPeriod
  ? toNumber(activeBudgetPeriod.expected_income)
  : 0;

const unplannedAmount = Math.max(expectedIncome - plannedTotal, 0);

  const categoryTotals = transactions.reduce<Record<string, number>>(
    (summary, transaction) => {
      const amount = toNumber(transaction.amount);
      if (amount >= 0) return summary;

      const category = transaction.category_name ?? "Uncategorized";
      summary[category] = (summary[category] ?? 0) + Math.abs(amount);
      return summary;
    },
    {},
  );

  const sortedCategories = Object.entries(categoryTotals).sort(
    ([, first], [, second]) => second - first,
  );

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eef4ef] px-4 py-5 text-slate-950 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <ThriveSidebar />

          <section className="space-y-6">
            <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Reports
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Your financial history, with its source visible.
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                These summaries are calculated from participant-owned imported
                records. They remain separate from participant explanations,
                staff notes, and any future separately authorized Trust facts.
              </p>
            </header>

            {loading && (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                Loading your Reports.
              </section>
            )}

            {errorMessage && (
              <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
                <p className="font-black">Reports could not be loaded.</p>
                <p className="mt-2 text-sm">{errorMessage}</p>
              </section>
            )}

            {!loading && !errorMessage && (
              <>
                <section className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl bg-emerald-700 p-6 text-white shadow-sm">
                    <p className="text-sm font-bold text-emerald-100">
                      Statement periods
                    </p>
                    <p className="mt-3 text-4xl font-black">{batches.length}</p>
                  </div>
                  <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-slate-500">
                      Imported transactions
                    </p>
                    <p className="mt-3 text-4xl font-black">
                      {transactions.length}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-slate-500">
                      Recorded outflow
                    </p>
                    <p className="mt-3 text-4xl font-black">
                      {formatMoney(totalOutflow)}
                    </p>
                  </div>
                </section>

                <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
    Current plan
  </p>

  <h2 className="mt-2 text-2xl font-black">
    Your plan compared with what is recorded
  </h2>

  <p className="mt-3 max-w-3xl leading-7 text-slate-600">
    These numbers come from your current Budget plan. They remain separate
    from the imported account totals shown elsewhere in Reports.
  </p>

  {activeBudgetPeriod ? (
    <>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-emerald-700 p-5 text-white">
          <p className="text-sm font-bold text-emerald-100">
            Expected income
          </p>
          <p className="mt-3 text-3xl font-black">
            {formatMoney(expectedIncome)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm font-bold text-slate-500">
            Currently planned
          </p>
          <p className="mt-3 text-3xl font-black">
            {formatMoney(plannedTotal)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm font-bold text-slate-500">
            Recorded against Budget
          </p>
          <p className="mt-3 text-3xl font-black">
            {formatMoney(recordedBudgetTotal)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm font-bold text-slate-500">
            Remaining in plan
          </p>
          <p className="mt-3 text-3xl font-black">
            {formatMoney(remainingBudgetTotal)}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-100 p-5">
        <p className="text-sm font-bold text-slate-500">
          Expected income not yet assigned to categories
        </p>
        <p className="mt-2 text-2xl font-black">
          {formatMoney(unplannedAmount)}
        </p>
      </div>
    </>
  ) : (
    <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-slate-600">
      No active Budget plan is available for comparison yet.
    </div>
  )}
</section>

                <section className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      Connected accounts
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      Connected financial sources
                    </h2>
                    <div className="mt-5 space-y-3">
                      {sources.map((source) => (
                        <div
                          key={source.id}
                          className="rounded-2xl border border-slate-100 p-4"
                        >
                          <p className="font-black">{source.source_name}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {source.institution_name ?? "Institution not provided"}
                            {source.account_mask
                              ? ` · Account ending ${source.account_mask}`
                              : ""}
                          </p>
                        </div>
                      ))}
                      {sources.length === 0 && (
                        <p className="rounded-2xl bg-slate-50 p-5 text-slate-600">
                          No financial source is connected to this participant.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      Category summary
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      Money out by category
                    </h2>
                    <div className="mt-5 space-y-3">
                      {sortedCategories.map(([category, total]) => (
                        <div
                          key={category}
                          className="flex items-center justify-between rounded-2xl border border-slate-100 p-4"
                        >
                          <p className="font-black">{category}</p>
                          <p className="font-black">{formatMoney(total)}</p>
                        </div>
                      ))}
                      {sortedCategories.length === 0 && (
                        <p className="rounded-2xl bg-slate-50 p-5 text-slate-600">
                          No debit activity is available for summarization.
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                    Statement history
                  </p>
                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="px-3 py-3">Period</th>
                          <th className="px-3 py-3">Rows</th>
                          <th className="px-3 py-3">Import status</th>
                          <th className="px-3 py-3">Lifecycle</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batches.map((batch) => (
                          <tr key={batch.id} className="border-b border-slate-100">
                            <td className="px-3 py-4 font-semibold">
                              {formatDate(batch.statement_period_start)} to{" "}
                              {formatDate(batch.statement_period_end)}
                            </td>
                            <td className="px-3 py-4">{batch.source_row_count}</td>
                            <td className="px-3 py-4 capitalize">
                              {batch.import_status.replaceAll("_", " ")}
                            </td>
                            <td className="px-3 py-4 capitalize">
                              {batch.source_lifecycle.replaceAll("_", " ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {batches.length === 0 && (
                      <p className="rounded-2xl bg-slate-50 p-5 text-slate-600">
                        No statement history is connected to this account.
                      </p>
                    )}
                  </div>
                </section>

                <section className="rounded-3xl bg-slate-950 p-6 text-white">
                  <p className="font-black text-emerald-300">About this information</p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    Bank evidence, THRIVE calculations, participant
                    explanations, staff notes, and future Trust-reported facts
                    remain distinct. This shell displays only bank evidence and
                    transparent THRIVE calculations.
                  </p>
                </section>
              </>
            )}
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
