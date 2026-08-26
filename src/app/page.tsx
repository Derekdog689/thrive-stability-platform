"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthGate from "./AuthGate";
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
      return "Paused";
    case "completed":
      return "Completed";
    default:
      return formatLabel(value);
  }
}

function getSupportMeaning(status: string | null | undefined) {
  switch (status) {
    case "submitted":
      return { title: "Request received", detail: "Nothing is needed from you right now." };
    case "acknowledged":
      return { title: "With the team", detail: "Nothing is needed from you right now." };
    case "in_progress":
      return { title: "In progress", detail: "Nothing is needed from you right now." };
    case "waiting_for_participant":
      return { title: "Response needed", detail: "Review your support request when you are ready." };
    case "participant_reply":
      return { title: "Response sent", detail: "The request is back with the team." };
    default:
      return { title: formatLabel(status), detail: "Your support activity is still open." };
  }
}

function TodayBottomNav() {
  const items = [
    { href: "/", label: "Today", icon: "⌂" },
    { href: "/wellness", label: "Wellness", icon: "◌" },
    { href: "/goals", label: "Goals", icon: "◎" },
    { href: "/budget", label: "Money", icon: "$" },
    { href: "/support", label: "Support", icon: "◯" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-xl rounded-[1.75rem] border border-white/60 bg-white/90 px-2 py-2 shadow-[0_18px_55px_rgba(15,23,42,0.2)] backdrop-blur-xl sm:bottom-5">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2 text-center transition ${
              item.href === "/"
                ? "bg-emerald-700 text-white"
                : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"
            }`}
          >
            <span className="text-base font-black leading-none">{item.icon}</span>
            <span className="mt-1 truncate text-[10px] font-black uppercase tracking-wide sm:text-xs">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
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
  const [onboardingSkippedThisSession, setOnboardingSkippedThisSession] = useState(false);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(TODAY_SESSION_AREAS_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      const validAreas: TodaySessionArea[] = ["goal", "activity", "budget", "support"];

      setVisitedAreas(
        Array.isArray(parsed)
          ? parsed.filter((area): area is TodaySessionArea => validAreas.includes(area as TodaySessionArea))
          : [],
      );
    } catch {
      setVisitedAreas([]);
    }
  }, []);

  function markAreaVisited(area: TodaySessionArea) {
    setVisitedAreas((current) => {
      if (current.includes(area)) return current;
      const next = [...current, area];

      try {
        window.sessionStorage.setItem(TODAY_SESSION_AREAS_KEY, JSON.stringify(next));
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

  const activeBudgetPeriod = budgetPeriods.find((period) => period.status === "active") ?? null;
  const activeBudgetLines = activeBudgetPeriod
    ? budgetLines.filter((line) => line.budget_period_id === activeBudgetPeriod.id && line.is_active)
    : [];

  const currentPeriodFinancialActivity = activeBudgetPeriod
    ? financialActivity.filter(
        (activity) =>
          activity.activity_date >= activeBudgetPeriod.period_start &&
          activity.activity_date <= activeBudgetPeriod.period_end,
      )
    : [];

  const expectedIncome = activeBudgetPeriod ? toNumber(activeBudgetPeriod.expected_income) : 0;
  const receivedIncome = currentPeriodFinancialActivity
    .filter((activity) => activity.activity_direction === "inflow")
    .reduce((sum, activity) => sum + Math.abs(toNumber(activity.signed_amount)), 0);
  const moneyOutThisPeriod = currentPeriodFinancialActivity
    .filter((activity) => activity.activity_direction === "outflow")
    .reduce((sum, activity) => sum + Math.abs(toNumber(activity.signed_amount)), 0);
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
    requests.find((request) => !["completed", "withdrawn", "archived"].includes(request.status)) ?? null;
  const supportMeaning = unresolvedSupportRequest ? getSupportMeaning(unresolvedSupportRequest.status) : null;
  const supportNeedsParticipant = unresolvedSupportRequest?.status === "waiting_for_participant";

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
    onboardingReady && onboardingStage !== "complete" && !onboardingSkippedThisSession;
  const isFirstRun = onboardingReady && onboardingStage === "wellness";

  const greetingTitle = isFirstRun
    ? `Welcome to THRIVE, ${participantName}.`
    : `Good to see you, ${participantName}.`;
  const greetingDetail = isFirstRun
    ? "Where would you like to begin?"
    : "What would you like to start with today?";

  const primaryAction = (() => {
    if (supportNeedsParticipant) {
      return {
        eyebrow: "Needs your attention",
        title: "Your Support request is waiting for you",
        detail: "There is a Support request ready for your response.",
        href: "/support",
        action: "Review Support",
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
          detail: "A quick Wellness check-in can be your first step.",
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
      title: "Everything here is available when you want it",
      detail: "Explore anything that feels useful, or finish for now.",
      href: "/",
      action: null,
      visitArea: null as TodaySessionArea | null,
    };
  })();

  const wellnessSignal = latestWellness ? "Check-in saved" : "Check-in open";
  const goalSignal = currentGoal ? getGoalProgressLabel(currentGoal.progress_status) : "No active Goal";
  const budgetSignal = activeBudgetPeriod ? "Plan active" : "No current plan";
  const supportSignal = supportMeaning?.title ?? "Nothing waiting";

  const engagementNote = latestWellness && currentGoal
    ? "You checked in and have a Goal in motion. Nice work taking time for THRIVE today."
    : latestWellness
      ? "You took time to check in today. That moment is saved here for you."
      : currentGoal
        ? "You have a Goal ready here whenever you want to pick it back up."
        : "Nothing is overdue here. Explore something when it feels useful.";

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#e8f0eb] px-3 pb-28 pt-3 text-slate-950 sm:px-6 sm:pb-32 sm:pt-6">
        <section className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
          <section className="relative min-h-[600px] overflow-hidden rounded-[2.5rem] bg-[#073f32] text-white shadow-[0_28px_90px_rgba(6,55,42,0.3)] sm:min-h-[640px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(251,191,120,0.7),transparent_18%),radial-gradient(circle_at_60%_36%,rgba(246,198,134,0.28),transparent_24%),linear-gradient(155deg,#7f9c91_0%,#4f786b_24%,#1b5648_52%,#073f32_76%,#052d27_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-[54%] bg-[linear-gradient(145deg,transparent_0%,transparent_22%,rgba(9,56,46,0.88)_23%,rgba(5,43,36,0.98)_47%,rgba(4,37,32,1)_100%)]" />
            <div className="absolute -left-[12%] top-[24%] h-64 w-[70%] rotate-[-10deg] rounded-[50%] bg-slate-950/20 blur-sm" />
            <div className="absolute -right-[14%] top-[34%] h-52 w-[58%] rotate-[8deg] rounded-[50%] bg-emerald-950/35 blur-sm" />
            <div className="absolute inset-x-0 bottom-[31%] h-px bg-amber-100/20" />
            <div className="absolute bottom-[26%] left-[7%] right-[7%] h-24 rounded-[50%] bg-emerald-950/40 blur-xl" />

            <div className="relative flex min-h-[600px] flex-col p-5 sm:min-h-[640px] sm:p-8 lg:p-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-lg font-black ring-1 ring-white/20 backdrop-blur">
                    T
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-100/80">DSS Enterprises</p>
                    <p className="text-sm font-black tracking-wide text-white">THRIVE</p>
                  </div>
                </div>
                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-white/90 backdrop-blur">
                  Today
                </div>
              </div>

              <div className="mt-14 max-w-2xl sm:mt-16">
                <p className="font-serif text-2xl text-amber-50/90 sm:text-3xl">Good morning,</p>
                <h1 className="mt-1 font-serif text-5xl font-semibold tracking-tight text-white sm:text-7xl">
                  {participantName}
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-8 text-emerald-50/90 sm:text-xl">
                  {greetingDetail}
                </p>
              </div>

              <div className="mt-auto grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[2rem] bg-white/95 p-5 text-slate-950 shadow-2xl shadow-slate-950/20 backdrop-blur sm:p-7">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">
                    {primaryAction.eyebrow}
                  </p>
                  <h2 className="mt-3 text-2xl font-black sm:text-3xl">{primaryAction.title}</h2>
                  <p className="mt-3 max-w-2xl leading-7 text-slate-600">{primaryAction.detail}</p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {primaryAction.action ? (
                      <Link
                        href={primaryAction.href}
                        onClick={() => {
                          if (primaryAction.visitArea) markAreaVisited(primaryAction.visitArea);
                        }}
                        className="inline-flex items-center gap-3 rounded-full bg-[#d9905b] px-6 py-3 font-black text-white shadow-lg shadow-orange-950/15 transition hover:translate-x-0.5 hover:bg-[#c97f4d]"
                      >
                        {primaryAction.action}
                        <span aria-hidden="true">→</span>
                      </Link>
                    ) : null}

                    {onboardingActive ? (
                      <button
                        type="button"
                        onClick={() => setOnboardingSkippedThisSession(true)}
                        className="rounded-full border border-slate-200 bg-white px-5 py-3 font-black text-slate-700"
                      >
                        Look around instead
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[2rem] bg-[#07352e]/88 p-5 ring-1 ring-white/10 backdrop-blur sm:p-6">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">Right now</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Link href="/wellness" className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 transition hover:bg-white/15">
                      <span className="block text-[10px] font-black uppercase tracking-wide text-emerald-200">Wellness</span>
                      <span className="mt-2 block text-sm font-black text-white">{wellnessSignal}</span>
                    </Link>
                    <Link href="/goals" onClick={() => markAreaVisited("goal")} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 transition hover:bg-white/15">
                      <span className="block text-[10px] font-black uppercase tracking-wide text-emerald-200">Goal</span>
                      <span className="mt-2 block text-sm font-black text-white">{goalSignal}</span>
                    </Link>
                    <Link href="/budget" onClick={() => markAreaVisited("budget")} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 transition hover:bg-white/15">
                      <span className="block text-[10px] font-black uppercase tracking-wide text-emerald-200">Budget</span>
                      <span className="mt-2 block text-sm font-black text-white">{budgetSignal}</span>
                    </Link>
                    <Link href="/support" onClick={() => markAreaVisited("support")} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 transition hover:bg-white/15">
                      <span className="block text-[10px] font-black uppercase tracking-wide text-emerald-200">Support</span>
                      <span className="mt-2 block text-sm font-black text-white">{supportSignal}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {loading ? (
            <section className="rounded-[2rem] bg-white p-6 shadow-sm">Loading your Today.</section>
          ) : null}

          {!loading && errorMessage ? (
            <section className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-rose-950">
              <p className="font-black">Your Today information could not be loaded.</p>
              <p className="mt-2 text-sm">{errorMessage}</p>
            </section>
          ) : null}

          {!loading && !errorMessage && orientationReady ? (
            <section className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Your day at a glance</p>
                  <h2 className="mt-2 text-2xl font-black">Here&apos;s where things stand.</h2>
                </div>
                <p className="max-w-lg text-sm leading-6 text-slate-500">Open any area when you want to see more.</p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
                <Link href="/wellness" className="rounded-3xl bg-emerald-50 p-4 transition hover:bg-emerald-100/70 sm:p-5">
                  <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700">Wellness</p>
                  <p className="mt-2 text-base font-black sm:text-xl">{wellnessSignal}</p>
                  {latestWellness?.chosen_next_step ? (
                    <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm">You chose: {formatLabel(latestWellness.chosen_next_step)}</p>
                  ) : (
                    <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm">Check in whenever you want.</p>
                  )}
                </Link>

                <Link href="/goals" onClick={() => markAreaVisited("goal")} className="rounded-3xl bg-slate-50 p-4 transition hover:bg-slate-100 sm:p-5">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Goal</p>
                  <p className="mt-2 text-base font-black sm:text-xl">{goalSignal}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm">{currentGoal ? currentGoal.title : "Create one when something feels worth working toward."}</p>
                </Link>

                <Link href="/budget" onClick={() => markAreaVisited("budget")} className="rounded-3xl bg-slate-50 p-4 transition hover:bg-slate-100 sm:p-5">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Budget</p>
                  <p className="mt-2 text-base font-black sm:text-xl">{budgetSignal}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm">{activeBudgetPeriod ? `${formatMoney(budgetRemaining)} remaining in the current plan.` : "Build a plan whenever you are ready."}</p>
                </Link>

                <Link href="/support" onClick={() => markAreaVisited("support")} className="rounded-3xl bg-slate-50 p-4 transition hover:bg-slate-100 sm:p-5">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Support</p>
                  <p className="mt-2 text-base font-black sm:text-xl">{supportSignal}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm">{supportMeaning?.detail ?? "Open Support whenever you want to connect."}</p>
                </Link>
              </div>
            </section>
          ) : null}

          {!loading && !errorMessage && orientationReady ? (
            <section className="rounded-[2rem] bg-gradient-to-br from-[#f4e9dd] to-[#eef4ef] p-6 shadow-sm sm:p-8">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#9b613f]">A little credit where it&apos;s due</p>
              <p className="mt-3 max-w-3xl font-serif text-2xl leading-9 text-slate-900 sm:text-3xl">{engagementNote}</p>
            </section>
          ) : null}

          {!loading && !errorMessage && !onboardingActive ? (
            <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 sm:p-7">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Your money</p>
                  <h2 className="mt-2 text-2xl font-black">Current plan</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/budget" onClick={() => markAreaVisited("budget")} className="rounded-full bg-emerald-700 px-5 py-3 font-black text-white">Review Budget</Link>
                  <Link href="/financial-activity" onClick={() => markAreaVisited("activity")} className="rounded-full border border-slate-200 bg-white px-5 py-3 font-black text-slate-700">View Activity</Link>
                </div>
              </div>

              {activeBudgetPeriod ? (
                <div className="grid grid-cols-3 gap-px bg-slate-100">
                  <div className="bg-emerald-700 p-4 text-white sm:p-6">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-100">Remaining</p>
                    <p className="mt-2 text-xl font-black sm:text-3xl">{formatMoney(budgetRemaining)}</p>
                  </div>
                  <div className="bg-white p-4 sm:p-6">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Received</p>
                    <p className="mt-2 text-xl font-black sm:text-3xl">{formatMoney(receivedIncome)}</p>
                    <p className="mt-1 hidden text-xs text-slate-500 sm:block">of {formatMoney(expectedIncome)}</p>
                  </div>
                  <div className="bg-white p-4 sm:p-6">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Money out</p>
                    <p className="mt-2 text-xl font-black sm:text-3xl">{formatMoney(moneyOutThisPeriod)}</p>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <p className="font-black">No current Budget is open.</p>
                  <p className="mt-2 text-sm text-slate-600">Start a plan when you are ready.</p>
                </div>
              )}
            </section>
          ) : null}

          <section className="grid gap-3 sm:grid-cols-3">
            <Link href="/my-program" className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">My Program</p>
              <p className="mt-2 font-black text-slate-900">See your program information</p>
            </Link>
            <Link href="/resources" className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Resources</p>
              <p className="mt-2 font-black text-slate-900">Explore available resources</p>
            </Link>
            <Link href="/financial-activity" onClick={() => markAreaVisited("activity")} className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Activity</p>
              <p className="mt-2 font-black text-slate-900">Review Financial Activity</p>
            </Link>
          </section>
        </section>

        <TodayBottomNav />
      </main>
    </AuthGate>
  );
}
