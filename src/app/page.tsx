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
type TodaySessionArea = "goal" | "budget" | "support";

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
  const { todayCheckin, recentCheckins, loading: wellnessLoading, errorMessage: wellnessErrorMessage } = useWellnessCheckinCandidate();
  const { goals, activeGoals, loading: goalsLoading, errorMessage: goalsErrorMessage } = useParticipantGoals();
  const { requests, loading: supportLoading, errorMessage: supportErrorMessage } = useParticipantSupport();

  const [timeGreeting, setTimeGreeting] = useState("Hello");
  const [signingOut, setSigningOut] = useState(false);
  const [visitedAreas, setVisitedAreas] = useState<TodaySessionArea[]>([]);

  const sessionKey = `thrive:today:visited-areas:${localDateKey()}`;

  useEffect(() => {
    setTimeGreeting(getTimeGreeting(new Date().getHours()));
    try {
      const stored = window.sessionStorage.getItem(sessionKey);
      const parsed = stored ? JSON.parse(stored) : [];
      const valid: TodaySessionArea[] = ["goal", "budget", "support"];
      setVisitedAreas(Array.isArray(parsed) ? parsed.filter((value): value is TodaySessionArea => valid.includes(value as TodaySessionArea)) : []);
    } catch {
      setVisitedAreas([]);
    }
  }, [sessionKey]);

  function markAreaVisited(area: TodaySessionArea | null) {
    if (!area) return;
    setVisitedAreas((current) => {
      if (current.includes(area)) return current;
      const next = [...current, area];
      try { window.sessionStorage.setItem(sessionKey, JSON.stringify(next)); } catch { /* orientation is optional */ }
      return next;
    });
  }

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

  const goalReviewed = visitedAreas.includes("goal");
  const budgetReviewed = visitedAreas.includes("budget");
  const supportReviewed = visitedAreas.includes("support");

  const activeBudgetPeriod = budgetPeriods.find((period) => period.status === "active") ?? null;
  const draftBudgetPeriod = budgetPeriods.find((period) => period.status === "draft") ?? null;
  const hasCompletedBudget = budgetPeriods.some((period) => period.status === "completed");
  const needsNextMoneyPlan = !activeBudgetPeriod && !draftBudgetPeriod && hasCompletedBudget;
  const activeBudgetLines = activeBudgetPeriod ? budgetLines.filter((line) => line.budget_period_id === activeBudgetPeriod.id && line.is_active) : [];
  const budgetExpired = activeBudgetPeriod ? activeBudgetPeriod.period_end < localDateKey() : false;
  const budgetDaysLeft = activeBudgetPeriod ? daysUntil(activeBudgetPeriod.period_end) : null;
  const budgetEndingSoon = !!activeBudgetPeriod && !budgetExpired && budgetDaysLeft !== null && budgetDaysLeft >= 0 && budgetDaysLeft <= 3;

  const currentPeriodFinancialActivity = activeBudgetPeriod ? financialActivity.filter((activity) => activity.activity_date >= activeBudgetPeriod.period_start && activity.activity_date <= activeBudgetPeriod.period_end) : [];
  const expectedIncome = activeBudgetPeriod ? toNumber(activeBudgetPeriod.expected_income) : 0;
  const receivedIncome = currentPeriodFinancialActivity.filter((activity) => activity.activity_direction === "inflow").reduce((sum, activity) => sum + Math.abs(toNumber(activity.signed_amount)), 0);
  const moneyOutThisPeriod = currentPeriodFinancialActivity.filter((activity) => activity.activity_direction === "outflow").reduce((sum, activity) => sum + Math.abs(toNumber(activity.signed_amount)), 0);
  const budgetRemaining = activeBudgetLines.reduce((sum, line) => sum + toNumber(line.derived_remaining_amount), 0);
  const moneyPlanTotal = activeBudgetLines.reduce((sum, line) => sum + Math.max(0, toNumber(line.planned_amount)), 0);
  const moneyProgress = moneyPlanTotal > 0 ? Math.min(100, (moneyOutThisPeriod / moneyPlanTotal) * 100) : 0;
  const overPlan = moneyPlanTotal > 0 && moneyOutThisPeriod > moneyPlanTotal;

  const currentGoal = activeGoals.find((goal) => goal.progress_status === "in_progress") ?? activeGoals.find((goal) => goal.progress_status === "not_started") ?? null;
  const unresolvedSupportRequest = requests.find((request) => !["completed", "withdrawn", "archived"].includes(request.status)) ?? null;
  const supportNeedsParticipant = unresolvedSupportRequest?.status === "waiting_for_participant";

  const loading = financialLoading || wellnessLoading || goalsLoading || supportLoading;
  const errorMessage = financialErrorMessage || wellnessErrorMessage || goalsErrorMessage || supportErrorMessage;
  const isNewParticipant = !loading && recentCheckins.length === 0 && goals.length === 0 && budgetPeriods.length === 0;
  const signal = daySignal(todayCheckin?.overall_day);

  const primaryAction = useMemo(() => {
    if (isNewParticipant) return { label: "Up next", title: "Check in", detail: "How are things today?", href: "/wellness", action: "Check in", icon: "wellness" as IconName, visitArea: null as TodaySessionArea | null };
    if (supportNeedsParticipant) return { label: "Needs you", title: "Support needs your reply", detail: "There is a message waiting for you.", href: "/support", action: "Reply", icon: "support" as IconName, visitArea: "support" as TodaySessionArea };
    if (budgetExpired && activeBudgetPeriod) return { label: "Needs you", title: "Your Money plan ended", detail: `It ended ${new Date(`${activeBudgetPeriod.period_end}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}. Review it, complete it, and start the next one.`, href: "/budget", action: "Finish Money plan", icon: "money" as IconName, visitArea: "budget" as TodaySessionArea };
    if (!todayCheckin) return { label: "Up next", title: "Check in", detail: "How are things today?", href: "/wellness", action: "Check in", icon: "wellness" as IconName, visitArea: null as TodaySessionArea | null };
    if (todayCheckin.chosen_next_step === "ask_for_help" && !supportReviewed) return { label: "Up next", title: "Ask for help", detail: unresolvedSupportRequest ? "Your request is open." : "Open Support.", href: "/support", action: unresolvedSupportRequest ? "See request" : "Open Support", icon: "support" as IconName, visitArea: "support" as TodaySessionArea };
    if (needsNextMoneyPlan && !budgetReviewed) return { label: "Up next", title: "Start your next Money plan", detail: "Your last plan is complete. Set the dates and expected income for the next one.", href: "/budget", action: "Start Money plan", icon: "money" as IconName, visitArea: "budget" as TodaySessionArea };
    if (currentGoal && !goalReviewed) return { label: "Up next", title: currentGoal.title, detail: currentGoal.next_step || "Choose your next step.", href: "/goals", action: "Continue", icon: "goal" as IconName, visitArea: "goal" as TodaySessionArea };
    if (activeBudgetPeriod && !budgetReviewed) return { label: budgetEndingSoon ? "Coming up" : "Worth a look", title: budgetEndingSoon ? "Money plan ending soon" : "Your money", detail: budgetEndingSoon ? (budgetDaysLeft === 0 ? "Your Money plan ends today." : `Your Money plan ends in ${budgetDaysLeft} day${budgetDaysLeft === 1 ? "" : "s"}.`) : `${formatMoneyShort(budgetRemaining)} remaining`, href: "/budget", action: "Review money", icon: "money" as IconName, visitArea: "budget" as TodaySessionArea };
    if (unresolvedSupportRequest && !supportReviewed) return { label: "Worth a look", title: "Your Support request", detail: `${supportState(unresolvedSupportRequest.status)}. Nothing else is needed unless Support asks.`, href: "/support", action: "Review support", icon: "support" as IconName, visitArea: "support" as TodaySessionArea };
    return { label: "Today", title: "You’re caught up for now", detail: "Your current information stays below. Come back when something changes or when you want to work on something.", href: "/", action: "Caught up", icon: "today" as IconName, visitArea: null as TodaySessionArea | null };
  }, [isNewParticipant, supportNeedsParticipant, budgetExpired, activeBudgetPeriod, todayCheckin, supportReviewed, unresolvedSupportRequest, needsNextMoneyPlan, budgetReviewed, currentGoal, goalReviewed, budgetEndingSoon, budgetDaysLeft, budgetRemaining]);

  const checkinByDate = new Map<string, (typeof recentCheckins)[number]>();
  [...recentCheckins].sort((a, b) => a.checkin_date.localeCompare(b.checkin_date)).forEach((checkin) => checkinByDate.set(checkin.checkin_date, checkin));
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const dateKey = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
    const checkin = checkinByDate.get(dateKey) ?? null;
    return { dateKey, day: date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1), checkin, signal: daySignal(checkin?.overall_day) };
  });
  const weekCheckinCount = weekDays.filter((day) => day.checkin).length;

  if (loading) {
    return <AuthGate><main className="min-h-screen bg-[#edf5ef] px-4 py-10 text-slate-950"><div className="mx-auto max-w-2xl rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-sm backdrop-blur-xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">THRIVE Today</p><h1 className="mt-3 text-3xl font-black">Getting things ready...</h1></div></main></AuthGate>;
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
              <Link href="/wellness" className="flex shrink-0 items-center gap-2 rounded-full border border-white/75 bg-white/58 px-3 py-2 text-xs font-black text-slate-800 backdrop-blur-xl transition active:scale-95"><Icon name="wellness" className="h-5 w-5" /><span className="max-w-24 truncate">{isNewParticipant ? "Check in" : signal.label}</span></Link>
            </div>
          </header>

          {errorMessage ? <section role="alert" className="mt-3 rounded-3xl border border-rose-200 bg-rose-50/90 p-4 text-rose-950 shadow-sm"><p className="font-black">Some parts of Today could not be loaded.</p></section> : null}

          {budgetExpired && activeBudgetPeriod ? (
            <Link href="/budget" onClick={() => markAreaVisited("budget")} className="mt-3 flex items-center justify-between gap-4 rounded-[1.6rem] border border-amber-200 bg-amber-50/88 p-4 text-amber-950 shadow-sm transition active:scale-[0.99]"><div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/80 text-amber-800"><Icon name="money" className="h-6 w-6" /></div><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">Money plan ended</p><p className="mt-1 font-black">Finish the plan and start the next one.</p></div></div><Icon name="arrow" className="h-5 w-5 shrink-0" /></Link>
          ) : budgetEndingSoon && activeBudgetPeriod ? (
            <Link href="/budget" onClick={() => markAreaVisited("budget")} className="mt-3 flex items-center justify-between gap-4 rounded-[1.6rem] border border-cyan-100 bg-cyan-50/80 p-4 text-cyan-950 shadow-sm transition active:scale-[0.99]"><div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/80 text-cyan-800"><Icon name="money" className="h-6 w-6" /></div><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">Coming up</p><p className="mt-1 font-black">{budgetDaysLeft === 0 ? "Your Money plan ends today." : `Your Money plan ends in ${budgetDaysLeft} day${budgetDaysLeft === 1 ? "" : "s"}.`}</p></div></div><Icon name="arrow" className="h-5 w-5 shrink-0" /></Link>
          ) : null}

          {!isNewParticipant ? (
            <section className="mt-3 grid grid-cols-4 gap-2">
              <Link href="/wellness" className="thrive-glance thrive-glance-compact border-emerald-100/70 bg-emerald-50/58 text-emerald-950"><Icon name="wellness" className="h-6 w-6" /><span>Wellness</span><strong>{todayCheckin ? formatChoice(todayCheckin.overall_day) : "Check in"}</strong></Link>
              <Link href="/goals" onClick={() => markAreaVisited("goal")} className="thrive-glance thrive-glance-compact border-amber-100/70 bg-amber-50/58 text-amber-950"><Icon name="goal" className="h-6 w-6" /><span>Goal</span><strong>{currentGoal ? "Active" : "Open"}</strong></Link>
              <Link href="/budget" onClick={() => markAreaVisited("budget")} className="thrive-glance thrive-glance-compact border-cyan-100/70 bg-cyan-50/58 text-cyan-950"><Icon name="money" className="h-6 w-6" /><span>Money</span><strong>{budgetExpired ? "Ended" : activeBudgetPeriod ? formatMoneyShort(budgetRemaining) : "No plan"}</strong></Link>
              <Link href="/support" onClick={() => markAreaVisited("support")} className="thrive-glance thrive-glance-compact border-violet-100/70 bg-violet-50/58 text-violet-950"><Icon name="support" className="h-6 w-6" /><span>Support</span><strong>{supportState(unresolvedSupportRequest?.status)}</strong></Link>
            </section>
          ) : null}

          <section className="mt-3 grid gap-3 lg:grid-cols-[1.05fr_.95fr]">
            <article className="thrive-focus-card relative overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/46 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.09)] backdrop-blur-2xl sm:p-6">
              <div className="pointer-events-none absolute -right-12 -top-14 h-36 w-36 rounded-full bg-emerald-200/38 blur-sm" />
              <div className="relative z-10 flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/72 text-emerald-900 shadow-sm"><Icon name={primaryAction.icon} className="h-6 w-6" /></div><div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">{primaryAction.label}</p><h2 className="mt-2 text-2xl font-black leading-tight text-emerald-950 sm:text-3xl">{primaryAction.title}</h2><p className="mt-2 text-base font-semibold leading-6 text-slate-600">{primaryAction.detail}</p></div></div>
              {primaryAction.visitArea ? <Link href={primaryAction.href} onClick={() => markAreaVisited(primaryAction.visitArea)} className="relative z-10 mt-4 flex min-h-12 w-full items-center justify-center rounded-[1.2rem] bg-emerald-700 px-4 py-3 text-center text-base font-black text-white shadow-[0_10px_24px_rgba(4,120,87,0.22)] transition hover:bg-emerald-800 active:scale-[0.985]">{primaryAction.action}<Icon name="arrow" className="ml-2 h-5 w-5" /></Link> : primaryAction.href !== "/" ? <Link href={primaryAction.href} className="relative z-10 mt-4 flex min-h-12 w-full items-center justify-center rounded-[1.2rem] bg-emerald-700 px-4 py-3 text-center text-base font-black text-white shadow-[0_10px_24px_rgba(4,120,87,0.22)] transition hover:bg-emerald-800 active:scale-[0.985]">{primaryAction.action}<Icon name="arrow" className="ml-2 h-5 w-5" /></Link> : null}
            </article>

            <article className="rounded-[1.8rem] border border-white/70 bg-white/46 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:p-6">
              <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-cyan-900"><Icon name="money" className="h-6 w-6" /><p className="text-[10px] font-black uppercase tracking-[0.18em]">Money</p></div><h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950">{budgetExpired ? "Plan ended" : activeBudgetPeriod ? formatMoneyShort(budgetRemaining) : "No plan"}</h2>{activeBudgetPeriod ? <p className="mt-1 text-xs font-bold text-slate-500">{budgetExpired ? `Ended ${new Date(`${activeBudgetPeriod.period_end}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "remaining"}</p> : null}</div><Link href="/budget" onClick={() => markAreaVisited("budget")} className="rounded-full border border-white/80 bg-white/65 px-4 py-2 text-sm font-black text-slate-800 backdrop-blur-xl transition active:scale-95">Review</Link></div>
              {activeBudgetPeriod ? <div className="mt-5"><div className="relative h-3 overflow-hidden rounded-full bg-white/80 shadow-inner"><div className={`h-full rounded-full transition-[width] duration-700 ${overPlan ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${moneyProgress}%` }} /></div><div className="mt-3 flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Out</p><p className="mt-1 text-xl font-black">{formatMoneyShort(moneyOutThisPeriod)}</p></div><div className="text-right"><p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Plan</p><p className="mt-1 text-xl font-black">{formatMoneyShort(moneyPlanTotal)}</p></div></div><p className={`mt-3 text-sm font-black ${overPlan ? "text-amber-800" : "text-emerald-800"}`}>{budgetExpired ? "Review and complete this plan to start the next one." : overPlan ? `${formatMoneyShort(moneyOutThisPeriod - moneyPlanTotal)} over plan` : `${formatMoneyShort(receivedIncome)} received${expectedIncome > 0 ? ` of ${formatMoneyShort(expectedIncome)}` : ""}`}</p></div> : <Link href="/budget" onClick={() => markAreaVisited("budget")} className="mt-5 inline-flex rounded-full bg-cyan-50 px-4 py-2 font-black text-cyan-900">Set up money plan</Link>}
            </article>
          </section>

          {!isNewParticipant ? (
            <section className="mt-3 grid gap-3 lg:grid-cols-[1fr_.62fr]">
              <article className="rounded-[1.8rem] border border-white/70 bg-white/42 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.07)] backdrop-blur-2xl sm:p-6">
                <div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Your week</p><h2 className="mt-1 text-xl font-black">Check-ins</h2></div><Link href="/wellness" className="text-sm font-black text-emerald-800">Wellness ›</Link></div>
                <div className="mt-5 grid grid-cols-7 gap-1.5">{weekDays.map((day) => <div key={day.dateKey} className="flex min-w-0 flex-col items-center gap-2"><div className="flex h-14 w-full items-end justify-center rounded-[1rem] bg-white/55 px-1 pb-1.5 shadow-sm"><div className={`w-full max-w-5 rounded-full transition-all duration-500 ${day.checkin ? "bg-emerald-600" : "bg-slate-200/70"}`} style={{ height: day.checkin ? `${24 + day.signal.level * 6}%` : "14%" }} title={day.checkin ? day.signal.label : "No check-in"} /></div><span className="text-[9px] font-black uppercase text-slate-500">{day.day}</span></div>)}</div>
                <p className="mt-4 text-sm font-bold text-slate-600">{weekCheckinCount === 0 ? "No check-ins this week" : `${weekCheckinCount} check-in${weekCheckinCount === 1 ? "" : "s"} this week`}</p>
              </article>

              <Link href="/support" onClick={() => markAreaVisited("support")} className={`relative overflow-hidden rounded-[1.8rem] border p-4 shadow-[0_16px_45px_rgba(15,23,42,0.07)] backdrop-blur-2xl transition active:scale-[0.99] sm:p-6 ${supportNeedsParticipant ? "border-violet-200 bg-violet-50/72" : "border-white/70 bg-white/42"}`}>
                <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-violet-800 shadow-sm"><Icon name="support" className="h-6 w-6" /></div><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-700">Support</p><h2 className="mt-1 text-lg font-black">{supportNeedsParticipant ? "Needs your reply" : unresolvedSupportRequest ? supportState(unresolvedSupportRequest.status) : "Available"}</h2></div></div><Icon name="arrow" className="mt-2 h-5 w-5" /></div>
                {unresolvedSupportRequest ? <div className="mt-4 flex items-center gap-2 text-xs font-black text-violet-800"><span className={`h-2.5 w-2.5 rounded-full ${supportNeedsParticipant ? "bg-violet-600 thrive-state-pulse" : "bg-violet-400"}`} /><span>{supportNeedsParticipant ? "Support is waiting for you" : "Your request is still moving"}</span></div> : <p className="mt-4 text-sm font-semibold text-slate-600">Ask when something would help.</p>}
              </Link>
            </section>
          ) : null}
        </section>
        <TodayBottomNav />
      </main>
    </AuthGate>
  );
}
