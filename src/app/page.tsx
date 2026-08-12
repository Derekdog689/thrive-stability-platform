"use client";

import Link from "next/link";
import AuthGate from "./AuthGate";
import ThriveSidebar from "./ThriveSidebar";
import { useParticipantGoals } from "./goals/useParticipantGoals";
import { useParticipantSupport } from "./support/useParticipantSupport";
import { useWellnessCheckinCandidate } from "./wellness/useWellnessCheckinCandidate";
import {
  formatDate,
  formatMoney,
  useParticipantFinancial,
} from "./useParticipantFinancial";

const dailyPathCards = [
  {
    href: "/wellness",
    eyebrow: "Wellness",
    title: "Check in with yourself",
    description:
      "Take a quiet moment to notice how today is going and what may help next.",
    action: "Open Wellness",
  },
  {
    href: "/goals",
    eyebrow: "Goals",
    title: "Choose one meaningful step",
    description:
      "Keep your attention on one small action connected to the life you are building.",
    action: "View Goals",
  },
  {
    href: "/support",
    eyebrow: "Support",
    title: "You do not have to carry everything alone",
    description:
      "Review the support space when you want help thinking through what comes next.",
    action: "Open Support",
  },
];

function formatLabel(value: string | null | undefined) {
  if (!value) return "Not available";

  return value
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

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

  const {
    todayCheckin,
    loading: wellnessLoading,
    errorMessage: wellnessErrorMessage,
  } = useWellnessCheckinCandidate();

  const {
    activeGoals,
    loading: goalsLoading,
    errorMessage: goalsErrorMessage,
  } = useParticipantGoals();

  const {
    requests,
    loading: supportLoading,
    errorMessage: supportErrorMessage,
  } = useParticipantSupport();

  const activeBudgetPeriod =
    budgetPeriods.find((period) => period.status === "active") ??
    budgetPeriods[0] ??
    null;
 const latestWellness = todayCheckin ?? null;

const currentGoal =
  activeGoals.find((goal) => goal.progress_status !== "completed") ??
  activeGoals[0] ??
  null;

const unresolvedSupportRequest =
  requests.find(
    (request) =>
      !["completed", "withdrawn", "archived"].includes(request.status),
  ) ?? null;

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
                Start with what matters today. Check in, review your plan, and
                choose one useful next step.
              </p>
            </header>

            <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
    What matters right now
  </p>

  <h2 className="mt-2 text-2xl font-black text-slate-950">
    A quick look at what is active today
  </h2>

  <div className="mt-6 grid gap-4 lg:grid-cols-3">
    <div className="rounded-2xl bg-emerald-50 p-5">
      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
        Wellness
      </p>

      {wellnessLoading ? (
        <p className="mt-3 text-sm text-emerald-900">
          Loading your latest reflection.
        </p>
      ) : wellnessErrorMessage ? (
        <p className="mt-3 text-sm text-emerald-900">
          Your latest Wellness reflection is not available right now.
        </p>
      ) : latestWellness ? (
        <>
          <p className="mt-3 font-black text-slate-950">
            Latest reflection: {formatLabel(latestWellness.overall_day)}
          </p>

          {latestWellness.chosen_next_step ? (
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Next step: {formatLabel(latestWellness.chosen_next_step)}
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-700">
          No Wellness reflection has been saved for today yet.
        </p>
      )}
    </div>

    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        Goal
      </p>

      {goalsLoading ? (
        <p className="mt-3 text-sm text-slate-600">
          Loading your current goal.
        </p>
      ) : goalsErrorMessage ? (
        <p className="mt-3 text-sm text-slate-600">
          Your current goal is not available right now.
        </p>
      ) : currentGoal ? (
        <>
          <p className="mt-3 font-black text-slate-950">
            {currentGoal.title}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            Next step: {currentGoal.next_step}
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-700">
          No active goal is available yet.
        </p>
      )}
    </div>

    <div className="rounded-2xl bg-slate-50 p-5">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        Support
      </p>

      {supportLoading ? (
        <p className="mt-3 text-sm text-slate-600">
          Loading your support status.
        </p>
      ) : supportErrorMessage ? (
        <p className="mt-3 text-sm text-slate-600">
          Your support status is not available right now.
        </p>
      ) : unresolvedSupportRequest ? (
        <>
          <p className="mt-3 font-black text-slate-950">
            {formatLabel(unresolvedSupportRequest.status)}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            {unresolvedSupportRequest.participant_message}
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-700">
          No open support request is currently active.
        </p>
      )}
    </div>
  </div>
</section>

            {loading && (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                Loading your THRIVE summary.
              </section>
            )}

            {errorMessage && (
              <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
                <p className="font-black">Your Today summary could not be loaded.</p>
                <p className="mt-2 text-sm">{errorMessage}</p>
              </section>
            )}

            {!loading && !errorMessage && (
              <>
                <section className="grid gap-4 lg:grid-cols-3">
                  {dailyPathCards.map((card) => (
                    <Link
                      key={card.href}
                      href={card.href}
                      className="group rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                        {card.eyebrow}
                      </p>
                      <h2 className="mt-2 text-2xl font-black">{card.title}</h2>
                      <p className="mt-3 leading-7 text-slate-600">
                        {card.description}
                      </p>
                      <p className="mt-5 font-black text-emerald-800 group-hover:text-emerald-950">
                        {card.action}
                      </p>
                    </Link>
                  ))}
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                        Your financial picture
                      </p>
                      <h2 className="mt-2 text-2xl font-black">
                        A quick look at your current information
                      </h2>
                      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                        These numbers summarize connected records. They do not
                        assign intent, responsibility, or a conclusion about
                        your choices.
                      </p>
                    </div>

                    <Link
                      href="/budget"
                      className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800"
                    >
                      Review Budget
                    </Link>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-emerald-50 p-5">
                      <p className="text-sm font-bold text-emerald-800">
                        Connected sources
                      </p>
                      <p className="mt-2 text-3xl font-black">{sources.length}</p>
                      <p className="mt-2 text-sm text-emerald-900">
                        Accounts currently connected to THRIVE
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-sm font-bold text-slate-500">
                        Recent transactions
                      </p>
                      <p className="mt-2 text-3xl font-black">
                        {transactions.length}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Imported activity available for review
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-sm font-bold text-slate-500">
                        Recorded outflow
                      </p>
                      <p className="mt-2 text-3xl font-black">
                        {formatMoney(totalOutflow)}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Money out in the connected period
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 p-5">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                        Budget period
                      </p>
                      <p className="mt-2 font-black">
                        {activeBudgetPeriod
                          ? `${formatDate(activeBudgetPeriod.period_start)} to ${formatDate(
                              activeBudgetPeriod.period_end,
                            )}`
                          : "No current budget period is available yet"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 p-5">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                        Latest statement
                      </p>
                      <p className="mt-2 font-black">
                        {latestBatch
                          ? `${formatDate(latestBatch.statement_period_start)} to ${formatDate(
                              latestBatch.statement_period_end,
                            )}`
                          : "No statement period is connected yet"}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                  <Link
                    href="/my-program"
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:bg-slate-50"
                  >
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      My Program
                    </p>
                    <h2 className="mt-2 text-xl font-black">
                      Review what THRIVE currently supports
                    </h2>
                  </Link>

                  <Link
                    href="/reports"
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:bg-slate-50"
                  >
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Reports
                    </p>
                    <h2 className="mt-2 text-xl font-black">
                      See connected summaries
                    </h2>
                  </Link>

                  <Link
                    href="/budget"
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:bg-slate-50"
                  >
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Budget
                    </p>
                    <h2 className="mt-2 text-xl font-black">
                      Review your current plan
                    </h2>
                  </Link>
                </section>
              </>
            )}
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
