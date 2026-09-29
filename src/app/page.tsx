"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthGate from "./AuthGate";
import { useParticipantGoals } from "./goals/useParticipantGoals";
import { useParticipantSupport } from "./support/useParticipantSupport";
import { useWellnessCheckinCandidate } from "./wellness/useWellnessCheckinCandidate";
import { toNumber, useParticipantFinancial } from "./useParticipantFinancial";
import { supabase } from "@/lib/supabaseClient";

type IconName = "today" | "wellness" | "goal" | "money" | "support" | "arrow";

function Icon({ name, className = "h-6 w-6" }: { name: IconName; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "today") return <svg {...common}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10.5V20h13v-9.5" /><path d="M9.5 20v-5.5h5V20" /></svg>;
  if (name === "wellness") return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
  if (name === "goal") return <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="m15 9 5-5M16.5 4H20v3.5" /></svg>;
  if (name === "money") return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M7 10h.01M17 14h.01" /><circle cx="12" cy="12" r="2.5" /></svg>;
  if (name === "support") return <svg {...common}><path d="M20.8 5.8c-2-2-5.2-1.8-7 .3L12 8.2l-1.8-2.1c-1.8-2.1-5-2.3-7-.3-2.1 2.1-2 5.6.2 7.6L12 21l8.6-7.6c2.2-2 2.3-5.5.2-7.6Z" /></svg>;
  return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

function getTimeGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function localDateKey() {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
}

function daysUntil(dateKey: string) {
  const today = new Date(`${localDateKey()}T12:00:00`);
  const target = new Date(`${dateKey}T12:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function formatChoice(value: string | null | undefined) {
  if (!value) return "Check in";
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function formatMoneyShort(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: Number.isInteger(value) ? 0 : 2 });
}

function daySignal(value: string | null | undefined) {
  switch (value) {
    case "good": return { label: "Feeling good", level: 4 };
    case "okay": return { label: "Doing alright", level: 3 };
    case "hard": return { label: "Hard day", level: 1 };
    case "not_sure": return { label: "Not sure today", level: 2 };
    default: return { label: "Check in", level: 0 };
  }
}

function supportState(status: string | null | undefined) {
  switch (status) {
    case "waiting_for_participant": return "Needs reply";
    case "in_progress": return "In review";
    case "acknowledged": return "Received";
    case "submitted": return "Received";
    default: return status ? formatChoice(status) : "Available";
  }
}

function TodayBottomNav() {
  const items: { href: string; label: string; icon: IconName }[] = [
    { href: "/", label: "Today", icon: "today" },
    { href: "/wellness", label: "Wellness", icon: "wellness" },
    { href: "/goals", label: "Goals", icon: "goal" },
    { href: "/budget", label: "Money", icon: "money" },
    { href: "/support", label: "Support", icon: "support" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-2xl rounded-[1.75rem] border border-white/75 bg-white/78 px-1.5 py-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.18)] backdrop-blur-2xl sm:bottom-5">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={`flex min-w-0 flex-col items-center justify-center rounded-[1.2rem] px-1 py-2 text-center transition active:scale-95 ${item.href === "/" ? "bg-emerald-700 text-white shadow-[0_8px_22px_rgba(4,120,87,0.24)]" : "text-slate-600 hover:bg-white/80 hover:text-emerald-900"}`}>
            <Icon name={item.icon} className="h-5 w-5" />
            <span className="mt-1 truncate text-[9px] font-black uppercase tracking-wide sm:text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function TodayPage() {
  const { participantName, financialActivity, budgetPeriods, budgetLines, loading: financialLoading, errorMessage: financialErrorMessage } = useParticipantFinancial();
  const { todayCheckin, recentCheckins, today: wellnessToday, loading: wellnessLoading, errorMessage: wellnessErrorMessage } = useWellnessCheckinCandidate();
  const { goals, activeGoals, loading: goalsLoading, errorMessage: goalsErrorMessage } = useParticipantGoals();
  const { requests, loading: supportLoading, errorMessage: supportErrorMessage } = useParticipantSupport();

  const [timeGreeting, setTimeGreeting] = useState("Hello");
  const [signingOut, setSigningOut] = useState(false);
  const [goalsDoneForNow, setGoalsDoneForNow] = useState(false);

  useEffect(() => {
    setTimeGreeting(getTimeGreeting(new Date().getHours()));
    const params = new URLSearchParams(window.location.search);
    if (params.get("done") === "goals") {
      setGoalsDoneForNow(true);
      window.history.replaceState({}, "", "/");
    }
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
  const draftBudgetPeriod = budgetPeriods.find((period) => period.status === "draft") ?? null;
  const hasCompletedBudget = budgetPeriods.some((period) => period.status === "completed");
  const needsNextMoneyPlan = !activeBudgetPeriod && !draftBudgetPeriod && hasCompletedBudget;
  const activeBudgetLines = activeBudgetPeriod ? budgetLines.filter((line) => line.budget_period_id === activeBudgetPeriod.id && line.is_active) : [];
  const budgetExpired = activeBudgetPeriod ? activeBudgetPeriod.period_end < localDateKey() : false;
  const budgetDaysLeft = activeBudgetPeriod ? daysUntil(activeBudgetPeriod.period_end) : null;
  const budgetEndingSoon = !!activeBudgetPeriod && !budgetExpired && budgetDaysLeft !== null && budgetDaysLeft >= 0 && budgetDaysLeft <= 3;

  const budgetRemaining = activeBudgetLines.reduce((sum, line) => sum + toNumber(line.derived_remaining_amount), 0);

  const currentGoal = activeGoals.find((goal) => goal.progress_status === "in_progress") ?? activeGoals.find((goal) => goal.progress_status === "not_started") ?? null;
  const unresolvedSupportRequest = requests.find((request) => !["completed", "withdrawn", "archived"].includes(request.status)) ?? null;
  const supportNeedsParticipant = unresolvedSupportRequest?.status === "waiting_for_participant";
  const openGoalCount = activeGoals.filter((goal) => !["completed", "archived"].includes(goal.progress_status)).length;

  const loading = financialLoading || wellnessLoading || goalsLoading || supportLoading;
  const errorMessage = financialErrorMessage || wellnessErrorMessage || goalsErrorMessage || supportErrorMessage;
  const isNewParticipant = !loading && recentCheckins.length === 0 && goals.length === 0 && budgetPeriods.length === 0;
  const signal = daySignal(todayCheckin?.overall_day);

  const primaryAction = useMemo(() => {
    if (isNewParticipant) return { label: "Start here", title: "Check in", detail: "Tell THRIVE how things are going right now.", href: "/wellness", action: "Check in", icon: "wellness" as IconName };
    if (supportNeedsParticipant) return { label: "Needs you", title: "Support needs your reply", detail: "There is a message waiting for you.", href: "/support", action: "Reply", icon: "support" as IconName };
    if (budgetExpired && activeBudgetPeriod) return { label: "Needs you", title: "Your Money plan ended", detail: "Review the finished plan when you are ready to set up the next one.", href: "/budget", action: "Review Money", icon: "money" as IconName };
    if (!todayCheckin) return { label: "Start here", title: "Check in", detail: "Tell THRIVE how things are going right now.", href: "/wellness", action: "Check in", icon: "wellness" as IconName };
    if (!todayCheckin.chosen_next_step) return { label: "Pick up where you left off", title: "Finish your check-in", detail: "Your earlier answers are saved. Choose what you want to do next, or leave it there.", href: "/wellness", action: "Continue", icon: "wellness" as IconName };
    if (!goalsDoneForNow && currentGoal?.next_step) return { label: "One thing you can continue", title: currentGoal.title, detail: currentGoal.next_step, href: "/goals", action: "Continue goal", icon: "goal" as IconName };
    if (needsNextMoneyPlan) return { label: "When you're ready", title: "Start your next Money plan", detail: "Your last plan is complete. Set up the next one when it is useful.", href: "/budget", action: "Open Money", icon: "money" as IconName };
    return { label: "Right now", title: "You’re caught up", detail: "Nothing in THRIVE needs your attention. Come back when something changes or when you want to work on something.", href: "/", action: "", icon: "today" as IconName };
  }, [isNewParticipant, supportNeedsParticipant, budgetExpired, activeBudgetPeriod, todayCheckin, currentGoal, needsNextMoneyPlan, goalsDoneForNow]);

  if (loading) {
    return <AuthGate><main className="min-h-screen bg-[#edf5ef] px-4 py-10 text-slate-950"><div className="mx-auto max-w-2xl rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-sm backdrop-blur-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">THRIVE Now</p><h1 className="mt-3 text-3xl font-black">Getting things ready...</h1></div></main></AuthGate>;
  }

  return (
    <AuthGate>
      <main className="thrive-today-bg min-h-screen pb-32 text-slate-950">
        <section className="mx-auto max-w-5xl px-3 pb-10 pt-3 sm:px-6 sm:pt-6">
          <header className="thrive-ambient relative overflow-hidden rounded-[2rem] border border-white/65 bg-white/28 px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.09)] backdrop-blur-2xl sm:px-7 sm:py-5">
            <div className="thrive-orb thrive-orb-one" /><div className="thrive-orb thrive-orb-two" />
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/72 text-base font-black text-emerald-900 shadow-sm">T</div><div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-800">DSS Enterprises</p><p className="text-xs font-black text-emerald-950">THRIVE</p></div></div>
              <button type="button" onClick={handleSignOut} disabled={signingOut} className="rounded-full border border-white/80 bg-white/55 px-3 py-2 text-[11px] font-black text-emerald-950 backdrop-blur-xl transition active:scale-95 disabled:opacity-60">{signingOut ? "Signing out" : "Log out"}</button>
            </div>
            <div className="relative z-10 mt-5 flex items-end justify-between gap-4">
              <div className="min-w-0"><p className="font-serif text-lg text-emerald-950 sm:text-2xl">{timeGreeting},</p><h1 className="truncate font-serif text-4xl font-black tracking-tight text-emerald-950 sm:text-6xl">{participantName || "there"}</h1></div>
              <span className="flex shrink-0 items-center gap-2 rounded-full border border-white/75 bg-white/58 px-3 py-2 text-xs font-black text-slate-700 backdrop-blur-xl"><Icon name="today" className="h-5 w-5" />Today</span>
            </div>
          </header>

          {errorMessage ? <section role="alert" className="mt-3 rounded-3xl border border-rose-200 bg-rose-50/90 p-4 text-rose-950 shadow-sm"><p className="font-black">Some parts of Today could not be loaded.</p></section> : null}
          {goalsDoneForNow ? <section className="mt-3 rounded-3xl border border-emerald-100 bg-emerald-50/85 p-4 text-emerald-950 shadow-sm"><p className="font-black">Goal saved. You’re done with Goals for now.</p></section> : null}

          <section className="mt-3 rounded-[1.9rem] border border-white/75 bg-white/58 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.09)] backdrop-blur-2xl sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/90 bg-white/76 text-emerald-900 shadow-sm"><Icon name={primaryAction.icon} className="h-6 w-6" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">{primaryAction.label}</p>
                <h2 className="mt-2 text-3xl font-black leading-tight text-emerald-950 sm:text-4xl">{primaryAction.title}</h2>
                <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">{primaryAction.detail}</p>
              </div>
            </div>
            {primaryAction.href !== "/" ? <Link href={primaryAction.href} className="mt-5 flex min-h-12 w-full items-center justify-center rounded-[1.2rem] bg-emerald-700 px-4 py-3 text-center text-base font-black text-white shadow-[0_10px_24px_rgba(4,120,87,0.22)] transition hover:bg-emerald-800 active:scale-[0.985]">{primaryAction.action}<Icon name="arrow" className="ml-2 h-5 w-5" /></Link> : null}
          </section>

          <section className="mt-3 rounded-[1.8rem] border border-white/75 bg-white/44 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.06)] backdrop-blur-2xl sm:p-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Your THRIVE</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Go somewhere when you want to.</h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">You do not need to work through every area.</p>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Link href="/wellness" className="flex items-center justify-between gap-3 rounded-[1.3rem] border border-white/85 bg-white/72 p-4 transition active:scale-[0.99]"><div className="flex min-w-0 items-center gap-3"><Icon name="wellness" className="h-6 w-6 text-emerald-800" /><div><p className="font-black text-slate-950">Wellness</p><p className="mt-1 text-xs font-semibold text-slate-500">How things are going</p></div></div><span className="shrink-0 text-xs font-black text-emerald-800">{todayCheckin ? signal.label : "Check in"}</span></Link>
              <Link href="/goals" className="flex items-center justify-between gap-3 rounded-[1.3rem] border border-white/85 bg-white/72 p-4 transition active:scale-[0.99]"><div className="flex min-w-0 items-center gap-3"><Icon name="goal" className="h-6 w-6 text-amber-800" /><div><p className="font-black text-slate-950">Goals</p><p className="mt-1 text-xs font-semibold text-slate-500">What you want to move forward</p></div></div><span className="shrink-0 text-xs font-black text-amber-800">{openGoalCount > 0 ? `${openGoalCount} open` : "Open"}</span></Link>
              <Link href="/budget" className="flex items-center justify-between gap-3 rounded-[1.3rem] border border-white/85 bg-white/72 p-4 transition active:scale-[0.99]"><div className="flex min-w-0 items-center gap-3"><Icon name="money" className="h-6 w-6 text-cyan-800" /><div><p className="font-black text-slate-950">Money</p><p className="mt-1 text-xs font-semibold text-slate-500">Your plan and activity</p></div></div><span className="shrink-0 text-xs font-black text-cyan-900">{budgetExpired ? "Plan ended" : activeBudgetPeriod ? `${formatMoneyShort(budgetRemaining)} left` : needsNextMoneyPlan ? "Next plan" : "No plan"}</span></Link>
              <Link href="/support" className="flex items-center justify-between gap-3 rounded-[1.3rem] border border-white/85 bg-white/72 p-4 transition active:scale-[0.99]"><div className="flex min-w-0 items-center gap-3"><Icon name="support" className="h-6 w-6 text-violet-800" /><div><p className="font-black text-slate-950">Support</p><p className="mt-1 text-xs font-semibold text-slate-500">Questions and replies</p></div></div><span className="shrink-0 text-xs font-black text-violet-800">{supportState(unresolvedSupportRequest?.status)}</span></Link>
            </div>
          </section>
        </section>
        <TodayBottomNav />
      </main>
    </AuthGate>
  );
}
