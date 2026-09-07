"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthGate from "./AuthGate";
import { useParticipantGoals } from "./goals/useParticipantGoals";
import { useParticipantSupport } from "./support/useParticipantSupport";
import { useWellnessCheckinCandidate } from "./wellness/useWellnessCheckinCandidate";
import { formatMoney, toNumber, useParticipantFinancial } from "./useParticipantFinancial";
import { supabase } from "@/lib/supabaseClient";

function getTimeGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatChoice(value: string | null | undefined) {
  if (!value) return "Not checked in";
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function daySignal(value: string | null | undefined) {
  switch (value) {
    case "good":
      return { icon: "☀", label: "Feeling good" };
    case "okay":
      return { icon: "◐", label: "Doing alright" };
    case "hard":
      return { icon: "☂", label: "Hard day" };
    case "not_sure":
      return { icon: "◌", label: "Not sure today" };
    default:
      return { icon: "○", label: "Check in" };
  }
}

function TodayBottomNav() {
  const items = [
    { href: "/", label: "Today", icon: "⌂" },
    { href: "/wellness", label: "Wellness", icon: "◌" },
    { href: "/goals", label: "Goals", icon: "◎" },
    { href: "/budget", label: "Money", icon: "$" },
    { href: "/support", label: "Support", icon: "♡" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-2xl rounded-[1.9rem] border border-white/70 bg-white/78 px-2 py-2 shadow-[0_18px_55px_rgba(15,23,42,0.18)] backdrop-blur-2xl sm:bottom-5">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-w-0 flex-col items-center justify-center rounded-[1.35rem] px-1 py-2.5 text-center transition active:scale-95 ${
              item.href === "/"
                ? "bg-emerald-700 text-white shadow-[0_8px_22px_rgba(4,120,87,0.24)]"
                : "text-slate-600 hover:bg-white/80 hover:text-emerald-900"
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
    loading: financialLoading,
    errorMessage: financialErrorMessage,
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

  const [timeGreeting, setTimeGreeting] = useState("Hello");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setTimeGreeting(getTimeGreeting(new Date().getHours()));
  }, []);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("THRIVE sign out failed:", error.message);
      setSigningOut(false);
      return;
    }
    window.location.assign("/login");
  }

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

  const currentGoal =
    activeGoals.find((goal) => goal.progress_status === "in_progress") ??
    activeGoals.find((goal) => goal.progress_status === "not_started") ??
    null;

  const unresolvedSupportRequest =
    requests.find((request) => !["completed", "withdrawn", "archived"].includes(request.status)) ?? null;
  const supportNeedsParticipant = unresolvedSupportRequest?.status === "waiting_for_participant";

  const loading = financialLoading || wellnessLoading || goalsLoading || supportLoading;
  const errorMessage =
    financialErrorMessage || wellnessErrorMessage || goalsErrorMessage || supportErrorMessage;
  const isNewParticipant =
    !loading && recentCheckins.length === 0 && goals.length === 0 && budgetPeriods.length === 0;

  const signal = daySignal(todayCheckin?.overall_day);

  const primaryAction = useMemo(() => {
    if (isNewParticipant) {
      return {
        eyebrow: "Up next",
        title: "Check in",
        detail: "How are things today?",
        href: "/wellness",
        action: "Check in",
        icon: "◌",
      };
    }

    if (supportNeedsParticipant) {
      return {
        eyebrow: "Needs you",
        title: "Support replied",
        detail: "There is a response waiting.",
        href: "/support",
        action: "See reply",
        icon: "♡",
      };
    }

    if (todayCheckin?.chosen_next_step === "ask_for_help") {
      return {
        eyebrow: "Up next",
        title: "Ask for help",
        detail: unresolvedSupportRequest ? "Your request is already open." : "Open Support.",
        href: "/support",
        action: unresolvedSupportRequest ? "See request" : "Open Support",
        icon: "♡",
      };
    }

    if (currentGoal) {
      return {
        eyebrow: "Up next",
        title: currentGoal.title,
        detail: currentGoal.next_step || "Choose your next step.",
        href: "/goals",
        action: "Continue",
        icon: "◎",
      };
    }

    if (activeBudgetPeriod) {
      return {
        eyebrow: "Worth a look",
        title: "Your money",
        detail: `${formatMoney(budgetRemaining)} remaining`,
        href: "/budget",
        action: "Review money",
        icon: "$",
      };
    }

    return {
      eyebrow: "Up next",
      title: "Check in",
      detail: "How are things today?",
      href: "/wellness",
      action: "Check in",
      icon: "◌",
    };
  }, [
    isNewParticipant,
    supportNeedsParticipant,
    todayCheckin,
    unresolvedSupportRequest,
    currentGoal,
    activeBudgetPeriod,
    budgetRemaining,
  ]);

  const moneyPlanTotal = activeBudgetLines.reduce(
    (sum, line) => sum + Math.max(0, toNumber(line.planned_amount)),
    0,
  );
  const moneyProgress = moneyPlanTotal > 0 ? Math.min(100, (moneyOutThisPeriod / moneyPlanTotal) * 100) : 0;
  const overPlan = moneyPlanTotal > 0 && moneyOutThisPeriod > moneyPlanTotal;

  const recentSeven = [...recentCheckins]
    .sort((a, b) => b.checkin_date.localeCompare(a.checkin_date))
    .slice(0, 7)
    .reverse();

  if (loading) {
    return (
      <AuthGate>
        <main className="min-h-screen bg-[#edf5ef] px-4 py-10 text-slate-950">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-sm backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">THRIVE Today</p>
            <h1 className="mt-3 text-3xl font-black">Getting things ready...</h1>
          </div>
        </main>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <main className="thrive-today-bg min-h-screen pb-32 text-slate-950">
        <section className="mx-auto max-w-5xl px-3 pb-10 pt-3 sm:px-6 sm:pt-6">
          <header className="thrive-ambient relative overflow-hidden rounded-[2.2rem] border border-white/65 bg-white/28 px-5 pb-6 pt-5 shadow-[0_22px_65px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:px-8 sm:pb-8 sm:pt-7">
            <div className="thrive-orb thrive-orb-one" />
            <div className="thrive-orb thrive-orb-two" />

            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/70 text-lg font-black text-emerald-900 shadow-sm backdrop-blur-xl">T</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800">DSS Enterprises</p>
                  <p className="text-sm font-black text-emerald-950">THRIVE</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="rounded-full border border-white/80 bg-white/55 px-4 py-2 text-xs font-black text-emerald-950 backdrop-blur-xl transition active:scale-95 disabled:opacity-60"
              >
                {signingOut ? "Signing out" : "Log out"}
              </button>
            </div>

            <div className="relative z-10 mt-8 sm:mt-10">
              <p className="font-serif text-2xl text-emerald-950 sm:text-3xl">{timeGreeting},</p>
              <h1 className="font-serif text-5xl font-black tracking-tight text-emerald-950 sm:text-7xl">
                {participantName || "there"}
              </h1>
              <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/52 px-4 py-2.5 backdrop-blur-xl">
                <span className="text-xl" aria-hidden="true">{signal.icon}</span>
                <span className="text-sm font-black text-slate-800 sm:text-base">
                  {isNewParticipant ? "Welcome to THRIVE" : signal.label}
                </span>
              </div>
            </div>
          </header>

          {errorMessage ? (
            <section role="alert" className="mt-4 rounded-3xl border border-rose-200 bg-rose-50/90 p-4 text-rose-950 shadow-sm">
              <p className="font-black">Some parts of Today could not be loaded.</p>
            </section>
          ) : null}

          {!isNewParticipant ? (
            <section className="-mx-1 mt-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-max gap-3">
                <Link href="/wellness" className="thrive-glance w-36 shrink-0 border-emerald-100/70 bg-emerald-50/62">
                  <span className="text-xl">{signal.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Wellness</span>
                  <strong>{todayCheckin ? formatChoice(todayCheckin.overall_day) : "Check in"}</strong>
                </Link>
                <Link href="/goals" className="thrive-glance w-36 shrink-0 border-amber-100/70 bg-amber-50/62">
                  <span className="text-xl">◎</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-700">Goal</span>
                  <strong>{currentGoal ? "Active" : "Open"}</strong>
                </Link>
                <Link href="/budget" className="thrive-glance w-36 shrink-0 border-cyan-100/70 bg-cyan-50/58">
                  <span className="text-xl">$</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-800">Money</span>
                  <strong>{activeBudgetPeriod ? `${formatMoney(budgetRemaining)} left` : "No plan"}</strong>
                </Link>
                <Link href="/support" className="thrive-glance w-36 shrink-0 border-violet-100/70 bg-violet-50/62">
                  <span className="text-xl">♡</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-700">Support</span>
                  <strong>{supportNeedsParticipant ? "Reply waiting" : unresolvedSupportRequest ? "Open" : "Available"}</strong>
                </Link>
              </div>
            </section>
          ) : null}

          <section className="mt-4 grid gap-4 lg:grid-cols-[1.12fr_.88fr]">
            <article className="thrive-focus-card relative overflow-hidden rounded-[2.1rem] border border-white/70 bg-white/46 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-7">
              <div className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-emerald-200/42 blur-sm" />
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white/70 text-xl font-black text-emerald-900 shadow-sm">{primaryAction.icon}</div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">{primaryAction.eyebrow}</p>
                </div>
                <h2 className="mt-5 text-3xl font-black leading-[1.05] text-emerald-950 sm:text-4xl">{primaryAction.title}</h2>
                <p className="mt-3 max-w-xl text-lg font-semibold leading-7 text-slate-600">{primaryAction.detail}</p>
                <Link
                  href={primaryAction.href}
                  className="mt-7 flex min-h-16 w-full items-center justify-center rounded-[1.4rem] bg-emerald-700 px-5 py-4 text-center text-lg font-black text-white shadow-[0_12px_28px_rgba(4,120,87,0.24)] transition hover:bg-emerald-800 active:scale-[0.985]"
                >
                  {primaryAction.action}<span className="ml-2 text-2xl">›</span>
                </Link>
              </div>
            </article>

            <article className="rounded-[2.1rem] border border-white/70 bg-white/46 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-800">Money</p>
                  <h2 className="mt-1 text-4xl font-black tracking-tight text-slate-950">
                    {activeBudgetPeriod ? formatMoney(budgetRemaining) : "No plan"}
                  </h2>
                  {activeBudgetPeriod ? <p className="mt-1 text-sm font-bold text-slate-500">remaining</p> : null}
                </div>
                <Link href="/budget" className="rounded-full border border-white/80 bg-white/65 px-4 py-2 text-sm font-black text-slate-800 backdrop-blur-xl transition active:scale-95">Review</Link>
              </div>

              {activeBudgetPeriod ? (
                <div className="mt-8">
                  <div className="relative h-4 overflow-hidden rounded-full bg-white/80 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-[width] duration-700 ${overPlan ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${moneyProgress}%` }}
                    />
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">Money out</p>
                      <p className="mt-1 text-2xl font-black">{formatMoney(moneyOutThisPeriod)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">Plan</p>
                      <p className="mt-1 text-2xl font-black">{formatMoney(moneyPlanTotal)}</p>
                    </div>
                  </div>
                  <p className={`mt-5 text-sm font-black ${overPlan ? "text-amber-800" : "text-emerald-800"}`}>
                    {overPlan
                      ? `${formatMoney(moneyOutThisPeriod - moneyPlanTotal)} over plan`
                      : `${formatMoney(receivedIncome)} received${expectedIncome > 0 ? ` of ${formatMoney(expectedIncome)}` : ""}`}
                  </p>
                </div>
              ) : (
                <Link href="/budget" className="mt-8 inline-flex rounded-full bg-cyan-50 px-4 py-2 font-black text-cyan-900">Set up money plan</Link>
              )}
            </article>
          </section>

          {!isNewParticipant ? (
            <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_.72fr]">
              <article className="rounded-[2.1rem] border border-white/70 bg-white/42 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.07)] backdrop-blur-2xl sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Your week</p>
                    <h2 className="mt-1 text-2xl font-black">Check-ins</h2>
                  </div>
                  <Link href="/wellness" className="text-sm font-black text-emerald-800">See wellness ›</Link>
                </div>
                <div className="mt-6 flex items-end justify-between gap-2">
                  {recentSeven.length > 0 ? (
                    recentSeven.map((checkin) => {
                      const itemSignal = daySignal(checkin.overall_day);
                      return (
                        <div key={`${checkin.checkin_date}-${checkin.overall_day}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/72 text-lg shadow-sm">{itemSignal.icon}</div>
                          <span className="text-[10px] font-black uppercase text-slate-500">
                            {new Date(`${checkin.checkin_date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm font-semibold text-slate-500">No check-ins yet.</p>
                  )}
                </div>
                <p className="mt-5 text-sm font-bold text-slate-600">
                  {recentCheckins.length > 0 ? `${Math.min(recentCheckins.length, 7)} recent check-in${Math.min(recentCheckins.length, 7) === 1 ? "" : "s"}` : "Start with one check-in."}
                </p>
              </article>

              <article className={`rounded-[2.1rem] border p-5 shadow-[0_18px_55px_rgba(15,23,42,0.07)] backdrop-blur-2xl sm:p-7 ${supportNeedsParticipant ? "border-violet-200 bg-violet-50/68" : "border-white/70 bg-white/42"}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/75 text-xl shadow-sm">♡</div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-700">Support</p>
                    <h2 className="mt-1 text-xl font-black">{supportNeedsParticipant ? "Reply waiting" : unresolvedSupportRequest ? "Request open" : "Here when needed"}</h2>
                  </div>
                </div>
                <Link href="/support" className="mt-6 flex min-h-12 items-center justify-center rounded-[1.2rem] border border-white/80 bg-white/72 px-4 py-3 font-black text-violet-900 transition active:scale-[0.985]">
                  {supportNeedsParticipant ? "See reply" : "Open Support"}
                </Link>
              </article>
            </section>
          ) : null}
        </section>

        <TodayBottomNav />
      </main>
    </AuthGate>
  );
}
