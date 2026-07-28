"use client";

import Link from "next/link";
import AuthGate from "./AuthGate";
import ThriveSidebar from "./ThriveSidebar";
import {
  formatDate,
  formatMoney,
  useParticipantFinancial,
} from "./useParticipantFinancial";

export default function TodayPage() {
  const {
    participantName,
    sources,
    transactions,
    budgetPeriods,
    latestBatch,
    totalOutflow,
    loading,
    errorMessage,
  } = useParticipantFinancial();

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eef4ef] px-4 py-5 text-slate-950 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <ThriveSidebar />

          <section className="space-y-6">
            <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Today
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Welcome, {participantName}.
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                See what is connected, review recent activity, and choose your
                next step.
              </p>
            </header>

            {loading && (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                Loading your participant-safe summary.
              </section>
            )}

            {errorMessage && (
              <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
                <p className="font-black">Your summary could not be loaded.</p>
                <p className="mt-2 text-sm">{errorMessage}</p>
              </section>
            )}

            {!loading && !errorMessage && (
              <>
                <section className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl bg-emerald-700 p-6 text-white shadow-sm">
                    <p className="text-sm font-bold text-emerald-100">
                      Connected sources
                    </p>
                    <p className="mt-3 text-4xl font-black">{sources.length}</p>
                    <p className="mt-2 text-sm text-emerald-100">
                      Accounts connected to THRIVE
                    </p>
                  </div>

                  <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-slate-500">
                      Imported transactions
                    </p>
                    <p className="mt-3 text-4xl font-black">
                      {transactions.length}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Recent account activity
                    </p>
                  </div>

                  <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <p className="text-sm font-bold text-slate-500">
                      Recorded outflow
                    </p>
                    <p className="mt-3 text-4xl font-black">
                      {formatMoney(totalOutflow)}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Total money out during this period
                    </p>
                  </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      Financial coverage
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      {latestBatch ? "Latest statement period" : "No statement connected"}
                    </h2>

                    {latestBatch ? (
                      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <dt className="text-xs font-black uppercase text-slate-500">
                            Period
                          </dt>
                          <dd className="mt-2 font-black">
                            {formatDate(latestBatch.statement_period_start)} to{" "}
                            {formatDate(latestBatch.statement_period_end)}
                          </dd>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <dt className="text-xs font-black uppercase text-slate-500">
                            Import status
                          </dt>
                          <dd className="mt-2 font-black">
                            {latestBatch.import_status.replaceAll("_", " ")}
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="mt-4 leading-7 text-slate-600">
                        Financial information is not connected to this account
                        yet. Nothing is missing from your view because of an
                        automatic flag or conclusion.
                      </p>
                    )}
                  </div>

                  <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      Next steps
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      Choose what to review next
                    </h2>
                    <div className="mt-5 grid gap-3">
                      <Link
                        href="/budget"
                        className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 font-black text-emerald-900 hover:bg-emerald-100"
                      >
                        Review Budget
                      </Link>
                      <Link
                        href="/reports"
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-black text-slate-900 hover:bg-slate-100"
                      >
                        Open Reports
                      </Link>
                      <Link
                        href="/my-program"
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-black text-slate-900 hover:bg-slate-100"
                      >
                        View My Program
                      </Link>
                      <Link
                        href="/wellness"
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-black text-slate-900 hover:bg-slate-100"
                      >
                        Open Wellness
                      </Link>
                      <Link
                        href="/goals"
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-black text-slate-900 hover:bg-slate-100"
                      >
                        View Goals
                      </Link>
                      <Link
                        href="/support"
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-black text-slate-900 hover:bg-slate-100"
                      >
                        Ask for Support
                      </Link>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl bg-slate-950 p-6 text-white">
                  <p className="font-black text-emerald-300">
                    Read-only participant boundary
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    Budget periods currently available: {budgetPeriods.length}.
                    This first pass does not create explanations, change
                    categories, request Trust actions, or modify financial
                    evidence.
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
