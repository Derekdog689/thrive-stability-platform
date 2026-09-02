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
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  return "Good evening,";
}

function formatChoice(value: string | null | undefined) {
  if (!value) return "Not recorded";
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
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
    <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-2xl rounded-[1.75rem] border border-white/70 bg-white/92 px-2 py-2 shadow-[0_18px_55px_rgba(15,23,42,0.2)] backdrop-blur-xl sm:bottom-5">
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

  const [timeGreeting, setTimeGreeting] = useState("Hello,");
  const [showWhy, setShowWhy] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [doneForNow, setDoneForNow] = useState(false);
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
    ? budgetLines.filter(
        (line) => line.budget_period_id === activeBudgetPeriod.id && line.is_active,
      )
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
    requests.find(
      (request) => !["completed", "withdrawn", "archived"].includes(request.status),
    ) ?? null;

  const supportNeedsParticipant = unresolvedSupportRequest?.status === "waiting_for_participant";
  const loading = financialLoading || wellnessLoading || goalsLoading || supportLoading;
  const errorMessage =
    financialErrorMessage || wellnessErrorMessage || goalsErrorMessage || supportErrorMessage;

  const isNewParticipant =
    !loading && recentCheckins.length === 0 && goals.length === 0 && budgetPeriods.length === 0;

  const story = useMemo(() => {
    if (isNewParticipant) {
      return {
        title: "You do not need to learn everything today.",
        detail: "Start with one quick check-in. THRIVE can take it from there.",
        icon: "✦",
      };
    }

    if (supportNeedsParticipant) {
      return {
        title: "You already asked for help.",
        detail: "Your Support request is waiting for your response.",
        icon: "♡",
      };
    }

    if (todayCheckin?.chosen_next_step === "ask_for_help") {
      return {
        title: "You checked in and chose to ask for help.",
        detail: unresolvedSupportRequest
          ? "Your request is already open, so you do not need to start over."
          : "THRIVE can take you straight to Support when you are ready.",
        icon: "♡",
      };
    }

    if (todayCheckin && currentGoal) {
      return {
        title: "You already checked in and have something in progress.",
        detail: `You said today feels ${formatChoice(todayCheckin.overall_day).toLowerCase()}. You do not need to work on everything at once.`,
        icon: "✓",
      };
    }

    if (todayCheckin) {
      return {
        title: "Your check-in is saved.",
        detail: `You said today feels ${formatChoice(todayCheckin.overall_day).toLowerCase()}. Nothing else has to happen right now.`,
        icon: "✓",
      };
    }

    if (currentGoal) {
      return {
        title: "You already have something moving.",
        detail: "You can continue it, choose something else, or leave THRIVE alone for now.",
        icon: "◎",
      };
    }

    if (activeBudgetPeriod) {
      return {
        title: "Your money plan is active.",
        detail: "THRIVE can help you see where things stand without making you rebuild the plan.",
        icon: "$",
      };
    }

    return {
      title: "Start wherever feels useful.",
      detail: "A quick check-in is an easy place to begin.",
      icon: "✦",
    };
  }, [
    isNewParticipant,
    supportNeedsParticipant,
    todayCheckin,
    unresolvedSupportRequest,
    currentGoal,
    activeBudgetPeriod,
  ]);

  const primaryAction = useMemo(() => {
    if (isNewParticipant) {
      return {
        eyebrow: "A simple place to begin",
        title: "Check in",
        detail: "One quick check-in gives THRIVE somewhere to start.",
        href: "/wellness",
        action: "Check in",
        icon: "◌",
      };
    }

    if (supportNeedsParticipant) {
      return {
        eyebrow: "One thing that needs you",
        title: "See your Support request",
        detail: "There is a response waiting for you.",
        href: "/support",
        action: "See request",
        icon: "♡",
      };
    }

    if (todayCheckin?.chosen_next_step === "ask_for_help") {
      return {
        eyebrow: "One thing you chose",
        title: "Ask for help",
        detail: unresolvedSupportRequest
          ? "Your request is already open."
          : "Open Support without explaining everything again.",
        href: "/support",
        action: unresolvedSupportRequest ? "See request" : "Open Support",
        icon: "♡",
      };
    }

    if (currentGoal) {
      return {
        eyebrow: "One thing to keep moving",
        title: currentGoal.title,
        detail: currentGoal.next_step
          ? `Next step: ${currentGoal.next_step}`
          : "Open your Goal and choose what comes next.",
        href: "/goals",
        action: "Continue",
        icon: "◎",
      };
    }

    if (activeBudgetPeriod) {
      return {
        eyebrow: "One useful place to look",
        title: "See where your money stands",
        detail: "Your current plan is active.",
        href: "/budget",
        action: "See my money",
        icon: "$",
      };
    }

    return {
      eyebrow: "One easy place to start",
      title: "How are things today?",
      detail: "A quick check-in can be enough for today.",
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
  ]);

  const statusItems = [
    {
      label: "Check-in",
      value: todayCheckin ? "Saved" : "Open",
      icon: todayCheckin ? "✓" : "◌",
      className: "bg-emerald-50 text-emerald-950",
    },
    {
      label: "Goal",
      value: currentGoal ? "In progress" : "Open",
      icon: "◎",
      className: "bg-amber-50 text-amber-950",
    },
    {
      label: "Budget",
      value: activeBudgetPeriod ? "Active" : "Open",
      icon: "$",
      className: "bg-teal-50 text-teal-950",
    },
    {
      label: "Support",
      value: unresolvedSupportRequest ? "Received" : "Open",
      icon: "♡",
      className: "bg-violet-50 text-violet-950",
    },
  ];

  const whyFacts = [
    todayCheckin ? `Check-in: ${formatChoice(todayCheckin.overall_day)}` : null,
    currentGoal ? `Goal: ${currentGoal.title}` : null,
    activeBudgetPeriod ? "Budget: Active" : null,
    unresolvedSupportRequest ? `Support: ${formatChoice(unresolvedSupportRequest.status)}` : null,
  ].filter(Boolean) as string[];

  if (loading) {
    return (
      <AuthGate>
        <main className="min-h-screen bg-[#f4f7f2] px-4 py-10 text-slate-950">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-emerald-100 bg-white p-8 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">THRIVE Today</p>
            <h1 className="mt-3 text-3xl font-black">Getting your day ready...</h1>
          </div>
        </main>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <main className="min-h-screen bg-[linear-gradient(180deg,#f4f7f2_0%,#eef5ef_48%,#f8faf8_100%)] pb-32 text-slate-950">
        <section className="mx-auto max-w-6xl px-3 pb-8 pt-3 sm:px-6 sm:pt-6">
          <header className="relative overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-[radial-gradient(circle_at_78%_18%,rgba(250,204,21,0.22),transparent_21%),linear-gradient(135deg,#eaf4e7_0%,#dcebdc_44%,#f8f3df_100%)] px-5 pb-6 pt-5 shadow-[0_18px_50px_rgba(20,83,45,0.08)] sm:px-8 sm:pb-8 sm:pt-7">
            <div className="pointer-events-none absolute -right-14 top-20 h-48 w-48 rounded-full border-[28px] border-amber-200/25" />
            <div className="pointer-events-none absolute -bottom-20 right-5 h-56 w-80 rotate-[-8deg] rounded-[50%] bg-emerald-200/35 blur-[1px]" />
            <div className="pointer-events-none absolute -bottom-28 left-20 h-64 w-[32rem] rotate-[7deg] rounded-[50%] bg-emerald-900/8" />

            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-800/15 bg-white/75 text-lg font-black text-emerald-900 shadow-sm">T</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800">DSS Enterprises</p>
                  <p className="text-sm font-black text-emerald-950">THRIVE</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="rounded-full border border-emerald-900/15 bg-white/70 px-4 py-2 text-xs font-black text-emerald-950 backdrop-blur hover:bg-white disabled:opacity-60"
              >
                {signingOut ? "Signing out" : "Log out"}
              </button>
            </div>

            <div className="relative z-10 mt-8 max-w-3xl sm:mt-12">
              <p className="font-serif text-2xl text-emerald-950 sm:text-3xl">{timeGreeting}</p>
              <h1 className="font-serif text-5xl font-black tracking-tight text-emerald-950 sm:text-7xl">
                {participantName || "there"}
              </h1>
              <p className="mt-4 text-xl font-black text-emerald-950 sm:text-2xl">
                {isNewParticipant ? "Welcome to THRIVE." : "Here’s where you are today."}
              </p>
            </div>
          </header>

          {errorMessage ? (
            <section role="alert" className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-950">
              <p className="font-black">Some parts of Today could not be loaded.</p>
              <p className="mt-1 text-sm">You can still use the navigation below.</p>
            </section>
          ) : null}

          <section className="relative z-20 -mt-3 grid gap-3 sm:-mt-6 sm:px-6">
            <article className="rounded-[1.75rem] border border-white/70 bg-white/95 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.10)] backdrop-blur sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-900 ring-8 ring-emerald-50">
                  {story.icon}
                </div>
                <div>
                  <h2 className="text-xl font-black leading-tight sm:text-2xl">{story.title}</h2>
                  <p className="mt-2 max-w-3xl text-base leading-6 text-slate-600">{story.detail}</p>
                </div>
              </div>
            </article>

            {!isNewParticipant ? (
              <div className="grid grid-cols-2 gap-2 rounded-[1.5rem] border border-white/70 bg-white/88 p-2 shadow-sm backdrop-blur sm:grid-cols-4">
                {statusItems.map((item) => (
                  <div key={item.label} className={`rounded-2xl px-3 py-3 ${item.className}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black">{item.icon}</span>
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-black uppercase tracking-[0.12em] opacity-70">{item.label}</p>
                        <p className="truncate text-sm font-black">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {doneForNow ? (
              <article className="rounded-[1.75rem] border border-emerald-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">You’re all set</p>
                <h2 className="mt-2 text-2xl font-black">That’s enough for now.</h2>
                <p className="mt-2 text-slate-600">THRIVE will keep your place. Come back whenever it feels useful.</p>
                <button
                  type="button"
                  onClick={() => setDoneForNow(false)}
                  className="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-800"
                >
                  Keep looking
                </button>
              </article>
            ) : (
              <article className="overflow-hidden rounded-[1.9rem] border border-emerald-900/10 bg-[linear-gradient(135deg,#edf7e8_0%,#f8f6e7_100%)] shadow-[0_18px_45px_rgba(20,83,45,0.08)]">
                <div className="relative p-5 sm:p-7">
                  <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-emerald-200/45" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/80 text-xl font-black text-emerald-900 shadow-sm">
                      {primaryAction.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">{primaryAction.eyebrow}</p>
                      <h2 className="mt-2 text-2xl font-black leading-tight text-emerald-950 sm:text-3xl">{primaryAction.title}</h2>
                      <p className="mt-2 text-base leading-6 text-slate-600">{primaryAction.detail}</p>
                    </div>
                  </div>

                  <Link
                    href={primaryAction.href}
                    className="relative z-10 mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-emerald-700 px-5 py-4 text-center text-lg font-black text-white shadow-[0_10px_24px_rgba(4,120,87,0.25)] transition hover:bg-emerald-800"
                  >
                    {primaryAction.action}
                    <span className="ml-2 text-xl">›</span>
                  </Link>
                </div>
              </article>
            )}

            {!doneForNow ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setShowOptions((current) => !current)}
                  className="min-h-14 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left font-black text-slate-800 shadow-sm"
                >
                  Show other options <span className="float-right">›</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDoneForNow(true)}
                  className="min-h-14 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left font-black text-slate-800 shadow-sm"
                >
                  Done for now <span className="float-right">›</span>
                </button>
              </div>
            ) : null}

            {showOptions && !doneForNow ? (
              <section className="rounded-[1.75rem] border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Other ways THRIVE can help</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                  {[
                    ["/wellness", "Check in"],
                    ["/goals", "Goals"],
                    ["/budget", "Money"],
                    ["/resources", "Find resources"],
                    ["/support", "Ask Support"],
                  ].map(([href, label]) => (
                    <Link key={href} href={href} className="rounded-2xl bg-slate-50 px-4 py-4 font-black text-slate-800 hover:bg-emerald-50 hover:text-emerald-950">
                      {label}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowWhy((current) => !current)}
                className="rounded-full px-4 py-2 text-sm font-black text-blue-700 hover:bg-blue-50"
              >
                Why am I seeing this?
              </button>
            </div>

            {showWhy ? (
              <section className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-black">Why THRIVE showed this</h2>
                  <button type="button" onClick={() => setShowWhy(false)} className="rounded-full border border-slate-200 px-3 py-1 text-sm font-black">Close</button>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-600">THRIVE used these saved items:</p>
                <ul className="mt-3 space-y-2">
                  {whyFacts.length > 0 ? (
                    whyFacts.map((fact) => (
                      <li key={fact} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800">{fact}</li>
                    ))
                  ) : (
                    <li className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800">There is not much saved yet, so THRIVE is offering a simple place to start.</li>
                  )}
                </ul>
                <p className="mt-4 text-sm leading-6 text-slate-600">These are starting points, not decisions about what you need.</p>
              </section>
            ) : null}
          </section>

          {!isNewParticipant ? (
            <section className="mt-6 grid gap-4 lg:grid-cols-2">
              <article className="rounded-[1.75rem] border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Your money</p>
                    <h2 className="mt-1 text-2xl font-black">Current plan</h2>
                  </div>
                  <Link href="/budget" className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-black text-white">See money</Link>
                </div>
                {activeBudgetPeriod ? (
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-emerald-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700">Remaining</p>
                      <p className="mt-1 text-xl font-black">{formatMoney(budgetRemaining)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Received</p>
                      <p className="mt-1 text-xl font-black">{formatMoney(receivedIncome)}</p>
                      <p className="mt-1 text-xs text-slate-500">of {formatMoney(expectedIncome)}</p>
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-wide text-amber-700">Money out</p>
                      <p className="mt-1 text-xl font-black">{formatMoney(moneyOutThisPeriod)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-slate-600">No active money plan right now.</p>
                )}
              </article>

              <article className="rounded-[1.75rem] border border-amber-100 bg-[linear-gradient(135deg,#fffaf0_0%,#fffdf8_100%)] p-5 shadow-sm sm:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">A little credit where it’s due</p>
                <h2 className="mt-2 text-2xl font-black">
                  {recentCheckins.length > 1
                    ? "You have been checking in."
                    : todayCheckin
                      ? "You checked in today."
                      : "You showed up today."}
                </h2>
                <p className="mt-2 leading-6 text-slate-600">
                  {currentGoal
                    ? "You also have a Goal in motion. You can keep it moving or leave it alone for now."
                    : "You do not need to create more work just because you opened THRIVE."}
                </p>
              </article>
            </section>
          ) : null}
        </section>

        <TodayBottomNav />
      </main>
    </AuthGate>
  );
}
