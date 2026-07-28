"use client";

import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";
import {
  formatDate,
  formatMoney,
  toNumber,
  useParticipantFinancial,
} from "../useParticipantFinancial";

function getBudgetStatus(planned: number, actual: number, remaining: number) {
  if (planned <= 0 && actual <= 0) {
    return {
      label: "No activity yet",
      detail: "No planned or recorded amount is connected for this category.",
    };
  }

  if (remaining < 0 || actual > planned) {
    return {
      label: "Above the current plan",
      detail:
        "Recorded activity is higher than the amount currently planned for this category.",
    };
  }

  if (planned > 0 && remaining === 0) {
    return {
      label: "Plan fully used",
      detail:
        "The currently planned amount has been fully matched by recorded activity.",
    };
  }

  if (planned > 0 && actual / planned >= 0.8) {
    return {
      label: "Most of the plan is used",
      detail:
        "A smaller portion of the current planned amount remains available.",
    };
  }

  if (actual > 0) {
    return {
      label: "Within the current plan",
      detail:
        "Recorded activity remains within the amount currently planned.",
    };
  }

  return {
    label: "Plan available",
    detail:
      "The planned amount is available and no recorded activity is connected yet.",
  };
}

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

  const overallStatus = getBudgetStatus(
    plannedTotal,
    actualTotal,
    remainingTotal,
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
                Compare your current plan with connected account activity.
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
                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                        Current picture
                      </p>
                      <h2 className="mt-2 text-2xl font-black">
                        {overallStatus.label}
                      </h2>
                      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                        {overallStatus.detail}
                      </p>
                    </div>

                    {activePeriod ? (
                      <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-900">
                        {activePeriod.status}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-emerald-700 p-6 text-white">
                      <p className="text-sm font-bold text-emerald-100">
                        Planned
                      </p>
                      <p className="mt-3 text-4xl font-black">
                        {formatMoney(plannedTotal)}
                      </p>
                      <p className="mt-2 text-sm text-emerald-100">
                        Amount currently set aside across this plan
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-6">
                      <p className="text-sm font-bold text-slate-500">
                        Recorded activity
                      </p>
                      <p className="mt-3 text-4xl font-black">
                        {formatMoney(actualTotal)}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Connected activity counted toward this plan
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-6">
                      <p className="text-sm font-bold text-slate-500">
                        Remaining
                      </p>
                      <p className="mt-3 text-4xl font-black">
                        {formatMoney(remainingTotal)}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Amount left within the current plan
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-100 p-5">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Budget period
                    </p>
                    <p className="mt-2 font-black">
                      {activePeriod
                        ? `${formatDate(activePeriod.period_start)} to ${formatDate(
                            activePeriod.period_end,
                          )}`
                        : "No current participant budget period is available yet"}
                    </p>
                  </div>
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                    Your categories
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    See how each part of the plan is going
                  </h2>
                  <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                    These labels describe connected numbers only. They do not
                    judge the reason for a transaction or what it means about
                    you.
                  </p>

                  {activeLines.length > 0 ? (
                    <div className="mt-6 grid gap-4">
                      {activeLines.map((line) => {
                        const planned = toNumber(line.planned_amount);
                        const actual = toNumber(line.actual_amount);
                        const remaining = toNumber(line.remaining_amount);
                        const status = getBudgetStatus(
                          planned,
                          actual,
                          remaining,
                        );
                        const usedPercent =
                          planned > 0
                            ? Math.max(
                                0,
                                Math.min(100, Math.round((actual / planned) * 100)),
                              )
                            : 0;

                        return (
                          <article
                            key={line.id}
                            className="rounded-3xl border border-slate-100 p-5 sm:p-6"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div>
                                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                                  {status.label}
                                </p>
                                <h3 className="mt-2 text-xl font-black">
                                  {line.category_name}
                                </h3>
                                <p className="mt-1 text-sm capitalize text-slate-500">
                                  {line.category_type.replaceAll("_", " ")}
                                </p>
                              </div>

                              <p className="text-lg font-black">
                                {formatMoney(line.remaining_amount)} remaining
                              </p>
                            </div>

                            <p className="mt-4 text-sm leading-6 text-slate-600">
                              {status.detail}
                            </p>

                            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-emerald-600"
                                style={{ width: `${usedPercent}%` }}
                                aria-label={`${usedPercent}% of the planned amount recorded`}
                              />
                            </div>

                            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                              <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="font-bold text-slate-500">Planned</p>
                                <p className="mt-1 font-black">
                                  {formatMoney(line.planned_amount)}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="font-bold text-slate-500">
                                  Recorded activity
                                </p>
                                <p className="mt-1 font-black">
                                  {formatMoney(line.actual_amount)}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="font-bold text-slate-500">
                                  Remaining
                                </p>
                                <p className="mt-1 font-black">
                                  {formatMoney(line.remaining_amount)}
                                </p>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                      <p className="font-black">
                        Your Budget plan has not been created yet.
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Connected account activity can still be reviewed below.
                      </p>
                    </div>
                  )}
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                    Recent account activity
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    {transactions.length} posted transactions
                  </h2>
                  <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                    Recorded outflow: {formatMoney(totalOutflow)}
                    {latestBatch
                      ? ` for the latest available period ending ${formatDate(
                          latestBatch.statement_period_end,
                        )}.`
                      : "."}
                  </p>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                    A displayed transaction is account evidence. It does not
                    establish intent, responsibility, relapse, incapacity, or
                    misuse.
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
