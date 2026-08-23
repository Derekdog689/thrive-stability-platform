"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthGate from "./AuthGate";
import ThriveSidebar from "./ThriveSidebar";
import { useParticipantGoals } from "./goals/useParticipantGoals";
import { useParticipantSupport } from "./support/useParticipantSupport";
import { useWellnessCheckinCandidate } from "./wellness/useWellnessCheckinCandidate";
import {
  formatMoney,
  toNumber,
  useParticipantFinancial,
} from "./useParticipantFinancial";

const TODAY_SESSION_AREAS_KEY = "thrive:today:visited-areas";

type TodaySessionArea = "goal" | "activity" | "budget" | "support";

function formatLabel(value: string | null | undefined) {
  if (!value) return "Not available";

  return value
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function getGoalProgressLabel(value: string | null | undefined) {
  switch (value) {
    case "active":
    case "in_progress":
      return "Moving forward";
    case "paused":
      return "Paused for now";
    case "completed":
      return "Completed";
    default:
      return formatLabel(value);
  }
}

function getSupportMeaning(status: string | null | undefined) {
  switch (status) {
    case "submitted":
      return {
        title: "Your request was received",
        detail: "Nothing is needed from you right now.",
      };

    case "acknowledged":
      return {
        title: "Your request is with the team",
        detail: "Nothing is needed from you right now.",
      };

    case "in_progress":
      return {
        title: "Support is working on it",
        detail: "Nothing is needed from you right now.",
      };

    case "waiting_for_participant":
      return {
        title: "Your response is needed",
        detail: "Review your support request when you are ready.",
      };

    case "participant_reply":
      return {
        title: "Your response was sent",
        detail: "The request is back with the team.",
      };

    default:
      return {
        title: formatLabel(status),
        detail: "Your support activity is still open.",
      };
  }
}

export default function TodayPage() {
  const {
    participantName,
    financialActivity,
    budgetPeriods,
    budgetLines,
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

  const [visitedAreas, setVisitedAreas] = useState<TodaySessionArea[]>([]);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(TODAY_SESSION_AREAS_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      const validAreas: TodaySessionArea[] = [
        "goal",
        "activity",
        "budget",
        "support",
      ];

      setVisitedAreas(
        Array.isArray(parsed)
          ? parsed.filter((area): area is TodaySessionArea =>
              validAreas.includes(area as TodaySessionArea),
            )
          : [],
      );
    } catch {
      setVisitedAreas([]);
    }
  }, []);

  function markAreaVisited(area: TodaySessionArea) {
    setVisitedAreas((current) => {
      if (current.includes(area)) {
        return current;
      }

      const next = [...current, area];

      try {
        window.sessionStorage.setItem(
          TODAY_SESSION_AREAS_KEY,
          JSON.stringify(next),
        );
      } catch {
        // Session orientation is optional. Navigation must still work if storage is unavailable.
      }

      return next;
    });
  }

  const goalReviewedThisSession = visitedAreas.includes("goal");
  const activityReviewedThisSession = visitedAreas.includes("activity");
  const budgetReviewedThisSession = visitedAreas.includes("budget");
  const supportReviewedThisSession = visitedAreas.includes("support");

  const activeBudgetPeriod =
    budgetPeriods.find((period) => period.status === "active") ?? null;

  const activeBudgetLines = activeBudgetPeriod
    ? budgetLines.filter(
        (line) =>
          line.budget_period_id === activeBudgetPeriod.id && line.is_active,
      )
    : [];

  const currentPeriodFinancialActivity = activeBudgetPeriod
    ? financialActivity.filter(
        (activity) =>
          activity.activity_date >= activeBudgetPeriod.period_start &&
          activity.activity_date <= activeBudgetPeriod.period_end,
      )
    : [];

  const expectedIncome = activeBudgetPeriod
    ? toNumber(activeBudgetPeriod.expected_income)
    : 0;

  const receivedIncome = currentPeriodFinancialActivity
    .filter((activity) => activity.activity_direction === "inflow")
    .reduce(
      (sum, activity) => sum + Math.abs(toNumber(activity.signed_amount)),
      0,
    );

  const moneyOutThisPeriod = currentPeriodFinancialActivity
    .filter((activity) => activity.activity_direction === "outflow")
    .reduce(
      (sum, activity) => sum + Math.abs(toNumber(activity.signed_amount)),
      0,
    );

  const budgetRemaining = activeBudgetLines.reduce(
    (sum, line) => sum + toNumber(line.derived_remaining_amount),
    0,
  );

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

  const supportMeaning = unresolvedSupportRequest
    ? getSupportMeaning(unresolvedSupportRequest.status)
    : null;

  const supportNeedsParticipant =
    unresolvedSupportRequest?.status === "waiting_for_participant";

  const primaryAction = (() => {
    if (!wellnessLoading && !wellnessErrorMessage && !latestWellness) {
      return {
        eyebrow: "Check in",
        title: "How are you doing today?",
        detail:
          "A short check-in can help you decide what would be useful next.",
        href: "/wellness",
        action: "Check in now",
        visitArea: null as TodaySessionArea | null,
      };
    }

    if (supportNeedsParticipant) {
      return {
        eyebrow: "Support",
        title: "Your support request needs you",
        detail: "There is a support request waiting for your response.",
        href: "/support",
        action: "Review support",
        visitArea: "support" as TodaySessionArea,
      };
    }

    if (
      latestWellness?.chosen_next_step === "ask_for_help" &&
      !unresolvedSupportRequest &&
      !supportReviewedThisSession
    ) {
      return {
        eyebrow: "Your next step",
        title: "Ask for help",
        detail: "You chose asking for help as your next step today.",
        href: "/support",
        action: "Open Support",
        visitArea: "support" as TodaySessionArea,
      };
    }

    if (currentGoal?.next_step && !goalReviewedThisSession) {
      return {
        eyebrow: "Your next step",
        title: currentGoal.next_step,
        detail: `Connected to your goal: ${currentGoal.title}`,
        href: "/goals",
        action: "Continue goal",
        visitArea: "goal" as TodaySessionArea,
      };
    }

    if (!activityReviewedThisSession && financialActivity.length > 0) {
      return {
        eyebrow: "Keep moving",
        title: "Want to look at your recent Financial Activity?",
        detail:
          "You can review what is already recorded without changing your Budget or transaction context.",
        href: "/financial-activity",
        action: "Review recent activity",
        visitArea: "activity" as TodaySessionArea,
      };
    }

    if (activeBudgetPeriod && !budgetReviewedThisSession) {
      return {
        eyebrow: "Keep moving",
        title: "Want to review your current plan?",
        detail:
          "Your Budget is active. You can look at the plan without changing anything.",
        href: "/budget",
        action: "Review Budget",
        visitArea: "budget" as TodaySessionArea,
      };
    }

    if (unresolvedSupportRequest && !supportReviewedThisSession) {
      return {
        eyebrow: "Support",
        title: "Want to review your open Support request?",
        detail:
          "Your request is still open, but nothing is required from you right now.",
        href: "/support",
        action: "Review Support",
        visitArea: "support" as TodaySessionArea,
      };
    }

    return {
      eyebrow: "Today",
      title: "You’re caught up for now. Come back whenever you want.",
      detail:
        "You can still review any part of THRIVE, or you can finish for now.",
      href: "/",
      action: null,
      visitArea: null as TodaySessionArea | null,
    };
  })();

  const orientationReady =
    !wellnessLoading &&
    !goalsLoading &&
    !supportLoading &&
    !wellnessErrorMessage &&
    !goalsErrorMessage &&
    !supportErrorMessage;

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
                Welcome back, {participantName}.
              </h1>

              <p className="mt-4 text-lg leading-7 text-slate-600">
                What would make today feel a little more manageable?
              </p>
            </header>

            {loading ? (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                Loading your Today.
              </section>
            ) : null}

            {errorMessage ? (
              <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
                <p className="font-black">
                  Your Today information could not be loaded.
                </p>
                <p className="mt-2 text-sm">{errorMessage}</p>
              </section>
            ) : null}

            {!loading && !errorMessage ? (
              <>
                <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                        Your money
                      </p>
                      <h2 className="mt-2 text-2xl font-black">
                        Your current plan
                      </h2>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="/budget"
                        onClick={() => markAreaVisited("budget")}
                        className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800"
                      >
                        Review Budget
                      </Link>

                      <Link
                        href="/financial-activity"
                        onClick={() => markAreaVisited("activity")}
                        className="rounded-2xl border border-emerald-200 bg-white px-5 py-3 font-black text-emerald-900 hover:bg-emerald-50"
                      >
                        View Activity
                      </Link>
                    </div>
                  </div>

                  {activeBudgetPeriod ? (
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl bg-emerald-700 p-5 text-white">
                        <p className="text-sm font-bold text-emerald-100">
                          Plan remaining
                        </p>
                        <p className="mt-2 text-3xl font-black">
                          {formatMoney(budgetRemaining)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-5">
                        <p className="text-sm font-bold text-slate-500">
                          Income received
                        </p>
                        <p className="mt-2 text-3xl font-black">
                          {formatMoney(receivedIncome)}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          of {formatMoney(expectedIncome)} expected
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-5">
                        <p className="text-sm font-bold text-slate-500">
                          Money out
                        </p>
                        <p className="mt-2 text-3xl font-black">
                          {formatMoney(moneyOutThisPeriod)}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          recorded this plan period
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                      <p className="font-black">No current Budget is open.</p>
                      <p className="mt-2 text-sm text-slate-600">
                        Start a plan when you are ready.
                      </p>
                    </div>
                  )}
                </section>

                <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                    Your Today
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    Where things stand
                  </h2>

                  {!orientationReady ? (
                    <p className="mt-5 text-slate-600">
                      Pulling together today&apos;s information.
                    </p>
                  ) : (
                    <div className="mt-6 grid gap-3">
                      <div className="rounded-2xl bg-emerald-50 p-5">
                        <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                          Wellness
                        </p>
                        <p className="mt-2 text-lg font-black">
                          {latestWellness
                            ? `You’re doing ${formatLabel(
                                latestWellness.overall_day,
                              ).toLowerCase()} today.`
                            : "You haven’t checked in today."}
                        </p>

                        {latestWellness?.chosen_next_step ? (
                          <p className="mt-2 text-sm text-slate-700">
                            You chose{" "}
                            <span className="font-black">
                              {formatLabel(
                                latestWellness.chosen_next_step,
                              ).toLowerCase()}
                            </span>{" "}
                            as your next step.
                          </p>
                        ) : null}
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-5">
                          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                            Goal
                          </p>

                          {currentGoal ? (
                            <>
                              <p className="mt-2 font-black">
                                {currentGoal.title}
                              </p>
                              <p className="mt-2 text-sm font-semibold text-slate-700">
                                {getGoalProgressLabel(currentGoal.progress_status)}
                              </p>

                              {currentGoal.next_step ? (
                                <p className="mt-2 text-sm text-slate-600">
                                  Next:{" "}
                                  <span className="font-black">
                                    {currentGoal.next_step}
                                  </span>
                                </p>
                              ) : null}
                            </>
                          ) : (
                            <p className="mt-2 text-sm text-slate-600">
                              No active goal right now.
                            </p>
                          )}
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-5">
                          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                            Support
                          </p>

                          {unresolvedSupportRequest && supportMeaning ? (
                            <>
                              <p className="mt-2 font-black">
                                {supportMeaning.title}
                              </p>
                              <p className="mt-2 text-sm text-slate-600">
                                {supportMeaning.detail}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="mt-2 font-black">
                                Nothing is waiting on you
                              </p>
                              <p className="mt-2 text-sm text-slate-600">
                                No current support request needs your attention.
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-300">
                    {primaryAction.eyebrow}
                  </p>
                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                    {primaryAction.title}
                  </h2>
                  <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                    {primaryAction.detail}
                  </p>

                  {primaryAction.action ? (
                    <Link
                      href={primaryAction.href}
                      onClick={() => {
                        if (primaryAction.visitArea) {
                          markAreaVisited(primaryAction.visitArea);
                        }
                      }}
                      className="mt-6 inline-block rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 hover:bg-emerald-300"
                    >
                      {primaryAction.action}
                    </Link>
                  ) : null}
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                    Moving forward
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-black">
                        {latestWellness
                          ? "Checked in today"
                          : "Check-in still open"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-black">
                        {budgetReviewedThisSession
                          ? "Budget reviewed this session"
                          : activeBudgetPeriod
                            ? "Current Budget active"
                            : "No current Budget"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-black">
                        {goalReviewedThisSession
                          ? "Goal reviewed this session"
                          : currentGoal
                            ? "Goal in progress"
                            : "No active goal"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-black">
                        {supportReviewedThisSession
                          ? "Support reviewed this session"
                          : unresolvedSupportRequest
                            ? `Support ${formatLabel(
                                unresolvedSupportRequest.status,
                              ).toLowerCase()}`
                            : "No open support request"}
                      </p>
                    </div>

                    {activityReviewedThisSession ? (
                      <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                        <p className="font-black">
                          Financial Activity reviewed this session
                        </p>
                      </div>
                    ) : null}
                  </div>
                </section>
              </>
            ) : null}
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
