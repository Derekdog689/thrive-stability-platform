"use client";

import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";
import {
  formatDate,
  formatMoney,
  toNumber,
  useParticipantFinancial,
} from "../useParticipantFinancial";

export default function BudgetPage() {
  const {
    budgetPeriods,
    budgetLines,
    transactions,
    latestBatch,
    totalOutflow,
    loading,
    errorMessage,
  } = useParticipantFinancial();

  const activePeriod =
    budgetPeriods.find((period) => period.status === "active") ??
    budgetPeriods[0] ??
    null;

  const activeLines = activePeriod
    ? budgetLines.filter((line) => line.budget_period_id === activePeriod.id)
    : [];

  const plannedTotal = activeLines.reduce(
    (sum, line) => sum + toNumber(line.planned_amount),
    0,
  );
  const actualTotal = activeLines.reduce(
    (sum, line) => sum + toNumber(line.actual_amount),
    0,
  );
  const remainingTotal = activeLines.reduce(
    (sum, line) => sum + toNumber(line.remaining_amount),
    0,
  );

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eef4ef] px-4 py-5 text-slate-950 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <ThriveSidebar />

          <section className="space-y-6">
            <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Budget
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Protect essentials. See what remains.
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                This page separates the participant budget plan from imported
                bank evidence. Imported activity does not automatically explain
                purpose, responsibility, or intent.
              </p>
            </header>

            {loading && (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                Loading your Budget.
              </section>
            )}

            {errorMessage && (
              <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
                <p className="font-black">Budget information could not be loaded.</p>
                <p className="mt-2 text-sm">{errorMessage}</p>
              </section>
            )}

            {!loading && !errorMessage && (
              <>
                <section className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl bg-emerald-700 p-6 text-white shadow-sm">
                    <p className="text-sm font-bold text-emerald-100">Planned</p>
                    <p className="mt-3 text-4xl font-black">
                      {formatMoney(plannedTotal)}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-slate-500">Recorded actual</p>
                    <p className="mt-3 text-4xl font-black">
                      {formatMoney(actualTotal)}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-slate-500">Remaining</p>
                    <p className="mt-3 text-4xl font-black">
                      {formatMoney(remainingTotal)}
                    </p>
                  </div>
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                        Current period
                      </p>
                      <h2 className="mt-2 text-2xl font-black">
                        {activePeriod
                          ? `${formatDate(activePeriod.period_start)} to ${formatDate(
                              activePeriod.period_end,
                            )}`
                          : "No participant budget period yet"}
                      </h2>
                    </div>
                    {activePeriod && (
                      <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-900">
                        {activePeriod.status}
                      </span>
                    )}
                  </div>

                  {activeLines.length > 0 ? (
                    <div className="mt-6 grid gap-4">
                      {activeLines.map((line) => (
                        <div
                          key={line.id}
                          className="rounded-2xl border border-slate-100 p-5"
                        >
                          <div className="flex flex-wrap justify-between gap-3">
                            <div>
                              <p className="font-black">{line.category_name}</p>
                              <p className="mt-1 text-sm capitalize text-slate-500">
                                {line.category_type.replaceAll("_", " ")}
                              </p>
                            </div>
                            <p className="font-black">
                              {formatMoney(line.remaining_amount)} remaining
                            </p>
                          </div>
                          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                            <p>Planned: {formatMoney(line.planned_amount)}</p>
                            <p>Actual: {formatMoney(line.actual_amount)}</p>
                            <p>Remaining: {formatMoney(line.remaining_amount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                      <p className="font-black">
                        Your participant Budget plan has not been created yet.
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Imported transaction evidence can still be reviewed
                        below. It is not being treated as a Budget plan.
                      </p>
                    </div>
                  )}
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                    Imported evidence
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    {transactions.length} posted transactions
                  </h2>
                  <p className="mt-3 text-slate-600">
                    Recorded outflow: {formatMoney(totalOutflow)}
                    {latestBatch
                      ? ` for the latest available period ending ${formatDate(
                          latestBatch.statement_period_end,
                        )}.`
                      : "."}
                  </p>

                  <div className="mt-5 space-y-3">
                    {transactions.slice(0, 8).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4"
                      >
                        <div>
                          <p className="font-black">
                            {transaction.merchant_name ?? "Merchant not provided"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(transaction.posted_date)}
                            {transaction.category_name
                              ? ` · ${transaction.category_name}`
                              : ""}
                          </p>
                        </div>
                        <p className="font-black">
                          {formatMoney(transaction.amount)}
                        </p>
                      </div>
                    ))}

                    {transactions.length === 0 && (
                      <p className="rounded-2xl bg-slate-50 p-5 text-slate-600">
                        No participant-owned transaction records are connected
                        to this account.
                      </p>
                    )}
                  </div>
                </section>
              </>
            )}
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
