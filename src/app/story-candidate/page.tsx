"use client";

import Link from "next/link";
import AuthGate from "../AuthGate";
import { useParticipantGoals } from "../goals/useParticipantGoals";
import { useParticipantSupport } from "../support/useParticipantSupport";
import { useWellnessCheckinCandidate } from "../wellness/useWellnessCheckinCandidate";
import { useParticipantFinancial } from "../useParticipantFinancial";

export default function StoryCandidatePage() {
  const { recentCheckins } = useWellnessCheckinCandidate();
  const { goals } = useParticipantGoals();
  const { requests } = useParticipantSupport();
  const { budgetPeriods } = useParticipantFinancial();

  const completedGoals = goals.filter((goal) => goal.progress_status === "completed");
  const completedBudgets = budgetPeriods.filter((period) => period.status === "completed");
  const activeSupport = requests.filter((request) => !["completed", "withdrawn", "archived"].includes(request.status));
  const recoveryNeed = recentCheckins.some((row) => row.recovery_support === "could_use_support");

  const items = [
    { lane: "Wellness", value: `${recentCheckins.length} check-ins in recent history`, accent: "bg-cyan-400", icon: "◉" },
    { lane: "Goals", value: `${completedGoals.length} completed`, accent: "bg-violet-500", icon: "◎" },
    { lane: "Money", value: `${completedBudgets.length} completed Money cycles`, accent: "bg-emerald-500", icon: "$" },
    { lane: "Support", value: activeSupport.length ? `${activeSupport.length} open thread${activeSupport.length === 1 ? "" : "s"}` : "No open Support threads", accent: "bg-orange-400", icon: "♡" },
  ];

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#102f3a] pb-28 text-white">
        <section className="mx-auto max-w-3xl px-3 pb-28 pt-3 sm:px-6 sm:pt-6">
          <header
            className="relative min-h-[23rem] overflow-hidden rounded-[2rem] border border-white/20 bg-cover bg-center p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-8"
            style={{ backgroundImage: "linear-gradient(180deg,rgba(8,22,36,.05),rgba(8,22,36,.72)),url('/living-signal-evening.svg')" }}
          >
            <div className="relative z-10 flex min-h-[20rem] flex-col justify-between">
              <div className="flex justify-between gap-3">
                <Link href="/" className="rounded-full border border-white/25 bg-white/12 px-4 py-2 text-sm font-black backdrop-blur-xl">← Today</Link>
                <span className="rounded-full border border-white/20 bg-slate-950/25 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] backdrop-blur-xl">Story candidate</span>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">Your Story</p>
                <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">A record of real movement.</h1>
                <p className="mt-3 max-w-xl text-base font-semibold leading-7 text-white/80">Not a score. Not a report card. Just the things you actually did, completed, paused, or kept carrying.</p>
              </div>
            </div>
          </header>

          <section className="mt-4 rounded-[1.8rem] border border-white/20 bg-white/10 p-5 backdrop-blur-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">What has accumulated</p>
            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <article key={item.lane} className="flex items-center gap-4 rounded-[1.3rem] border border-white/15 bg-slate-950/22 p-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${item.accent} font-black text-white`}>{item.icon}</div>
                  <div>
                    <p className="font-black">{item.lane}</p>
                    <p className="mt-1 text-sm font-semibold text-white/70">{item.value}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {recoveryNeed ? (
            <section className="mt-4 rounded-[1.8rem] border border-amber-300/25 bg-amber-200/10 p-5 backdrop-blur-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">What carries forward</p>
              <h2 className="mt-2 text-2xl font-black">Recovery support is still on your radar.</h2>
              <p className="mt-3 font-semibold leading-7 text-white/75">Your check-ins include an explicit recovery-support need. THRIVE can keep that visible without pretending the issue is solved.</p>
              <Link href="/recovery-support" className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">Continue recovery support</Link>
            </section>
          ) : null}

          <p className="mt-5 text-center text-sm font-semibold leading-6 text-white/55">Progress is not always a straight line. This page only reflects facts already recorded in THRIVE.</p>
        </section>
      </main>
    </AuthGate>
  );
}
