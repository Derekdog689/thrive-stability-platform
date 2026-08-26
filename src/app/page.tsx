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
type OnboardingStage = "wellness" | "goal" | "budget" | "complete";

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
      return "In progress";
    case "not_started":
      return "Ready to start";
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
        title: "Request received",
        detail: "Nothing is needed from you right now.",
      };

    case "acknowledged":
      return {
        title: "With the team",
        detail: "Nothing is needed from you right now.",
      };

    case "in_progress":
      return {
        title: "In progress",
        detail: "Nothing is needed from you right now.",
      };

    case "waiting_for_participant":
      return {
        title: "Response needed",
        detail: "Review your support request when you are ready.",
      };

    case "participant_reply":
      return {
        title: "Response sent",
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
    recentCheckins,
    loading: wellnessLoading,
    errorMessage: wellnessErrorMessage,
  } = useWellnessCheckinCandidate();

  const {
    goals,
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
  const [onboardingSkippedThisSession, setOnboardingSkippedThisSession] =
    useState(false);

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
    activeGoals.find((goal) => goal.progress_status === "in_progress") ??
    activeGoals.find((goal) => goal.progress_status === "not_started") ??
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

  const orientationReady =
    !wellnessLoading &&
    !goalsLoading &&
    !supportLoading &&
    !wellnessErrorMessage &&
    !goalsErrorMessage &&
    !supportErrorMessage;

  const onboardingReady = !loading && !errorMessage && orientationReady;
  const hasWellnessHistory = recentCheckins.length > 0;
  const hasGoalHistory = goals.length > 0;
  const hasBudgetHistory = budgetPeriods.length > 0;

  const onboardingStage: OnboardingStage = !hasWellnessHistory
    ? "wellness"
    : !hasGoalHistory
      ? "goal"
      : !hasBudgetHistory
        ? "budget"
        : "complete";

  const onboardingActive =
    onboardingReady &&
    onboardingStage !== "complete" &&
    !onboardingSkippedThisSession;

  const isFirstRun = onboardingReady && onboardingStage === "wellness";

  const greetingTitle = isFirstRun
    ? `Welcome to THRIVE, ${participantName}.`
    : `Welcome back, ${participantName}.`;

  const greetingDetail = isFirstRun
    ? "Where would you like to begin?"
    : onboardingActive
      ? "What would you like to start with today?"
      : "What would you like to start with today?";

  const primaryAction = (() => {
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
        eyebrow: "You chose this next",
        title: "Ask for help",
        detail: "You chose asking for help as your next step today.",
        href: "/support",
        action: "Open Support",
        visitArea: "support" as TodaySessionArea,
      };
    }

    if (onboardingActive) {
      if (onboardingStage === "wellness") {
        return {
          eyebrow: "A place to begin",
          title: "How are things today?",
          detail: "Start with a quick Wellness check-in.",
          href: "/wellness",
          action: "Start my check-in",
          visitArea: null as TodaySessionArea | null,
        };
      }

      if (onboardingStage === "goal") {
        return {
          eyebrow: "A place to continue",
          title: "Is there something you want to work toward?",
          detail: "Create a Goal and choose one first step.",
          href: "/goals",
          action: "Create my first Goal",
          visitArea: "goal" as TodaySessionArea,
        };
      }

      return {
        eyebrow: "A place to continue",
        title: "Want to make a simple money plan?",
        detail: "Build your first Budget from what you expect to have coming in and where you want it to go.",
        href: "/budget",
        action: "Build my first Budget",
        visitArea: "budget" as TodaySessionArea,
      };
    }

    if (!wellnessLoading && !wellnessErrorMessage && !latestWellness) {
      return {
        eyebrow: "Available today",
        title: "How are things today?",
        detail: "Your Wellness check-in is ready whenever you want it.",
        href: "/wellness",
        action: "Check in now",
        visitArea: null as TodaySessionArea | null,
      };
    }

    if (currentGoal?.next_step && !goalReviewedThisSession) {
      return {
        eyebrow: "Your next step",
        title: currentGoal.next_step,
        detail: `From your Goal: ${currentGoal.title}`,
        href: "/goals",
        action: "Open my Goal",
        visitArea: "goal" as TodaySessionArea,
      };
    }

    if (!activityReviewedThisSession && financialActivity.length > 0) {
      return {
        eyebrow: "Available to review",
        title: "Your recent Financial Activity",
        detail: "See what is already recorded for you.",
        href: "/financial-activity",
        action: "View activity",
        visitArea: "activity" as TodaySessionArea,
      };
    }

    if (activeBudgetPeriod && !budgetReviewedThisSession) {
      return {
        eyebrow: "Your current plan",
        title: "Your Budget is active",
        detail: "Open it whenever you want to see the plan.",
        href: "/budget",
        action: "Review Budget",
        visitArea: "budget" as TodaySessionArea,
      };
    }

    if (unresolvedSupportRequest && !supportReviewedThisSession) {
      return {
        eyebrow: "Support",
        title: "Your Support request is still open",
        detail: "Nothing is required from you right now.",
        href: "/support",
        action: "Review Support",
        visitArea: "support" as TodaySessionArea,
      };
    }

    return {
      eyebrow: "Today",
      title: "Everything here is available when you want it.",
      detail: "You can look around or finish for now.",
      href: "/",
      action: null,
      visitArea: null as TodaySessionArea | null,
    };
  })();

  const wellnessSignal = latestWellness ? "Check-in saved" : "Ready when you are";
  const goalSignal = currentGoal
    ? getGoalProgressLabel(currentGoal.progress_status)
    : "No active Goal";
  const budgetSignal = activeBudgetPeriod ? "Plan active" : "No current plan";
  const supportSignal = supportMeaning?.title ?? "Nothing waiting";

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eaf2ed] px-4 py-5 text-slate-950 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <ThriveSidebar />

          <section className="space-y-6">
            <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#073f32] via-[#0b5a47] to-[#102b29] text-white shadow-[0_22px_70px_rgba(15,61,48,0.22)]">
              <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-200/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-amber-200/10 blur-3xl" />
              <div className="pointer-events-none absolute right-[12%] top-[20%] h-28 w-28 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute right-[18%] top-[28%] h-12 w-12 rounded-full border border-emerald-100/20" />

              <div className="relative p-6 sm:p-8 lg:p-10">
                <div className="max-w-3xl">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">
                    Today
                  </p>
                  <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                    {greetingTitle}
                  </h1>
                  <p className="mt-4 text-lg leading-8 text-emerald-50/85 sm:text-xl">
                    {greetingDetail}
                  </p>
                </div>

                {loading ? (
                  <div className="mt-8 rounded-3xl bg-white/10 p-6 ring-1 ring-white/10 backdrop-blur-sm">
                    Loading your Today.
                  </div>
                ) : null}

                {!loading && errorMessage ? (
                  <div className="mt-8 rounded-3xl bg-rose-50 p-6 text-rose-950">
                    <p className="font-black">Your Today information could not be loaded.</p>
                    <p className="mt-2 text-sm">{errorMessage}</p>
                  </div>
                ) : null}

                {!loading && !errorMessage ? (
                  <div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
                    <div className="rounded-[1.75rem] bg-white p-6 text-slate-950 shadow-xl shadow-slate-950/10 sm:p-7">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                        {primaryAction.eyebrow}
                      </p>
                      <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                        {primaryAction.title}
                      </h2>
                      <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                        {primaryAction.detail}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-3">
                        {primaryAction.action ? (
                          <Link
                            href={primaryAction.href}
                            onClick={() => {
                              if (primaryAction.visitArea) {
                                markAreaVisited(primaryAction.visitArea);
                              }
                            }}
                            className="inline-flex items-center gap-3 rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white transition hover:bg-emerald-800"
                          >
                            {primaryAction.action}
                            <span aria-hidden="true">→</span>
                          </Link>
                        ) : null}

                        {onboardingActive ? (
                          <button
                            type="button"
                            onClick={() => setOnboardingSkippedThisSession(true)}
                            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-700 transition hover:bg-slate-50"
                          >
                            Look around instead
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link href="/wellness" className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-white/15">
                        <span className="block text-xs font-black uppercase tracking-wide text-emerald-200">Wellness</span>
                        <span className="mt-2 block font-black text-white">{wellnessSignal}</span>
                      </Link>
                      <Link
                        href="/goals"
                        onClick={() => markAreaVisited("goal")}
                        className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-white/15"
                      >
                        <span className="block text-xs font-black uppercase tracking-wide text-emerald-200">Goal</span>
                        <span className="mt-2 block font-black text-white">{goalSignal}</span>
                      </Link>
                      <Link
                        href="/budget"
                        onClick={() => markAreaVisited("budget")}
                        className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-white/15"
                      >
                        <span className="block text-xs font-black uppercase tracking-wide text-emerald-200">Budget</span>
                        <span className="mt-2 block font-black text-white">{budgetSignal}</span>
                      </Link>
                      <Link
                        href="/support"
                        onClick={() => markAreaVisited("support")}
                        className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur-sm transition hover:bg-white/15"
                      >
                        <span className="block text-xs font-black uppercase tracking-wide text-emerald-200">Support</span>
                        <span className="mt-2 block font-black text-white">{supportSignal}</span>
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            {!loading && !errorMessage && orientationReady ? (
              <section className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                      Your day at a glance
                    </p>
                    <h2 className="mt-2 text-2xl font-black">Here&apos;s where things stand.</h2>
                  </div>
                  <p className="max-w-xl text-sm leading-6 text-slate-500">
                    These are current states from your THRIVE information. Open anything you want to see more.
                  </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Link href="/wellness" className="group rounded-3xl bg-emerald-50 p-5 transition hover:-translate-y-0.5 hover:bg-emerald-100/70">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Wellness</p>
                        <p className="mt-2 text-xl font-black text-slate-950">{wellnessSignal}</p>
                      </div>
                      <span className="text-xl text-emerald-700 transition group-hover:translate-x-1">→</span>
                    </div>
                    {latestWellness?.chosen_next_step ? (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        Next step you chose: <span className="font-black">{formatLabel(latestWellness.chosen_next_step)}</span>
                      </p>
                    ) : null}
                  </Link>

                  <Link
                    href="/goals"
                    onClick={() => markAreaVisited("goal")}
                    className="group rounded-3xl bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-slate-100"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">Goal</p>
                        <p className="mt-2 text-xl font-black text-slate-950">{goalSignal}</p>
                      </div>
                      <span className="text-xl text-slate-500 transition group-hover:translate-x-1">→</span>
                    </div>
                    {currentGoal ? (
                      <>
                        <p className="mt-3 font-black text-slate-800">{currentGoal.title}</p>
                        {currentGoal.next_step ? (
                          <p className="mt-1 text-sm leading-6 text-slate-600">Next: {currentGoal.next_step}</p>
                        ) : null}
                      </>
                    ) : null}
                  </Link>

                  <Link
                    href="/budget"
                    onClick={() => markAreaVisited("budget")}
                    className="group rounded-3xl bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-slate-100"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">Budget</p>
                        <p className="mt-2 text-xl font-black text-slate-950">{budgetSignal}</p>
                      </div>
                      <span className="text-xl text-slate-500 transition group-hover:translate-x-1">→</span>
                    </div>
                    {activeBudgetPeriod ? (
                      <p className="mt-3 text-sm leading-6 text-slate-600">Plan remaining: <span className="font-black text-slate-800">{formatMoney(budgetRemaining)}</span></p>
                    ) : null}
                  </Link>

                  <Link
                    href="/support"
                    onClick={() => markAreaVisited("support")}
                    className="group rounded-3xl bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-slate-100"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">Support</p>
                        <p className="mt-2 text-xl font-black text-slate-950">{supportSignal}</p>
                      </div>
                      <span className="text-xl text-slate-500 transition group-hover:translate-x-1">→</span>
                    </div>
                    {supportMeaning ? (
                      <p className="mt-3 text-sm leading-6 text-slate-600">{supportMeaning.detail}</p>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-slate-600">No current Support request needs your attention.</p>
                    )}
                  </Link>
                </div>
              </section>
            ) : null}

            {!loading && !errorMessage && !onboardingActive ? (
              <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6 sm:p-8">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Your money</p>
                    <h2 className="mt-2 text-2xl font-black">Current plan</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/budget"
                      onClick={() => markAreaVisited("budget")}
                      className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white transition hover:bg-emerald-800"
                    >
                      Review Budget
                    </Link>
                    <Link
                      href="/financial-activity"
                      onClick={() => markAreaVisited("activity")}
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-700 transition hover:bg-slate-50"
                    >
                      View Activity
                    </Link>
                  </div>
                </div>

                {activeBudgetPeriod ? (
                  <div className="grid gap-px bg-slate-100 md:grid-cols-3">
                    <div className="bg-emerald-700 p-6 text-white">
                      <p className="text-sm font-bold text-emerald-100">Plan remaining</p>
                      <p className="mt-2 text-3xl font-black">{formatMoney(budgetRemaining)}</p>
                    </div>
                    <div className="bg-white p-6">
                      <p className="text-sm font-bold text-slate-500">Income received</p>
                      <p className="mt-2 text-3xl font-black">{formatMoney(receivedIncome)}</p>
                      <p className="mt-2 text-sm text-slate-500">of {formatMoney(expectedIncome)} expected</p>
                    </div>
                    <div className="bg-white p-6">
                      <p className="text-sm font-bold text-slate-500">Money out</p>
                      <p className="mt-2 text-3xl font-black">{formatMoney(moneyOutThisPeriod)}</p>
                      <p className="mt-2 text-sm text-slate-500">recorded this plan period</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 sm:p-8">
                    <p className="font-black">No current Budget is open.</p>
                    <p className="mt-2 text-sm text-slate-600">Start a plan when you are ready.</p>
                  </div>
                )}
              </section>
            ) : null}

            {!loading && !errorMessage && onboardingActive ? (
              <section className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Explore anytime</p>
                <h2 className="mt-2 text-xl font-black">You can use any part of THRIVE whenever you want.</h2>
                <p className="mt-3 max-w-2xl leading-7 text-slate-600">The suggested starting point above does not lock anything else.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/support" className="rounded-2xl border border-emerald-200 px-4 py-2 font-black text-emerald-900 hover:bg-emerald-50">Support</Link>
                  <Link href="/resources" className="rounded-2xl border border-emerald-200 px-4 py-2 font-black text-emerald-900 hover:bg-emerald-50">Resources</Link>
                </div>
              </section>
            ) : null}

            {!loading && !errorMessage && orientationReady ? (
              <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-sm sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Your THRIVE</p>
                    <h2 className="mt-2 text-2xl font-black">Everything stays available.</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Come back to Today whenever you want a quick view of what is saved, active, or waiting.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide text-slate-300">
                    <span className="rounded-full border border-slate-700 px-3 py-2">{latestWellness ? "Check-in saved" : "Check-in open"}</span>
                    <span className="rounded-full border border-slate-700 px-3 py-2">{currentGoal ? "Goal available" : "No active Goal"}</span>
                    <span className="rounded-full border border-slate-700 px-3 py-2">{activeBudgetPeriod ? "Budget active" : "No Budget"}</span>
                  </div>
                </div>
              </section>
            ) : null}
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
