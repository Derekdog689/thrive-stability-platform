"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import AuthGate from "../AuthGate";
import { GoalProgressStatus, ParticipantGoal, useParticipantGoals } from "../goals/useParticipantGoals";
import { getGoalArea, getGoalPreset, goalAreas } from "../goals/goalPresets";

type Draft = { areaId: string; presetId: string; title: string; why: string; nextStep: string; goalArea: string };

const emptyDraft: Draft = { areaId: "", presetId: "", title: "", why: "", nextStep: "", goalArea: "" };

const statusLabels: Record<GoalProgressStatus, string> = {
  not_started: "Ready",
  in_progress: "Active",
  paused: "Paused",
  completed: "Complete",
  archived: "Archived",
};

const statusVisuals: Record<GoalProgressStatus, { dot: string; badge: string; line: string }> = {
  not_started: { dot: "bg-slate-400", badge: "bg-slate-100 text-slate-700", line: "Ready to start" },
  in_progress: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-800", line: "In progress" },
  paused: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-900", line: "Paused for now" },
  completed: { dot: "bg-sky-500", badge: "bg-sky-50 text-sky-800", line: "Completed" },
  archived: { dot: "bg-slate-300", badge: "bg-slate-100 text-slate-500", line: "Archived" },
};

const goalAreaVisuals: Record<string, { symbol: string; label: string }> = {
  daily_stability: { symbol: "⌂", label: "Routine" },
  money_budgeting: { symbol: "$", label: "Money" },
  health_wellness: { symbol: "☼", label: "Health" },
  relationships_support: { symbol: "♡", label: "Support" },
  work_education: { symbol: "▣", label: "Work" },
  personal_growth: { symbol: "↗", label: "Growth" },
  other: { symbol: "+", label: "Other" },
};

function GoalsBottomNav() {
  const items = [
    { href: "/", label: "Today", icon: "⌂" },
    { href: "/wellness", label: "Wellness", icon: "☼" },
    { href: "/goals", label: "Goals", icon: "◎" },
    { href: "/budget", label: "Money", icon: "$" },
    { href: "/support", label: "Support", icon: "♡" },
  ];
  return <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-xl rounded-[1.8rem] border border-white/70 bg-white/90 px-2 py-2 shadow-[0_18px_55px_rgba(15,23,42,0.16)] backdrop-blur-2xl sm:bottom-5"><div className="grid grid-cols-5 gap-1">{items.map((item) => <Link key={item.href} href={item.href} className={`flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2 text-center transition ${item.href === "/goals" ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"}`}><span className="text-xl font-black leading-none">{item.icon}</span><span className="mt-1 truncate text-[10px] font-black uppercase tracking-wide sm:text-xs">{item.label}</span></Link>)}</div></nav>;
}

function ActiveGoalCard({ goal, working, onStatusChange }: { goal: ParticipantGoal; working: boolean; onStatusChange: (goal: ParticipantGoal, status: Exclude<GoalProgressStatus, "archived">) => Promise<void> }) {
  const visual = statusVisuals[goal.progress_status];
  return <article className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
    <div className="relative p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-100/70 blur-2xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">{goal.goal_area ?? "Goal"}</p><h3 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">{goal.title}</h3></div><span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black ${visual.badge}`}>{statusLabels[goal.progress_status]}</span></div>
        <div className="mt-5 flex items-center gap-3 rounded-full bg-white/60 px-3 py-2.5"><span className={`h-3.5 w-3.5 shrink-0 rounded-full ${visual.dot}`} /><p className="text-sm font-black text-slate-600">{visual.line}</p></div>
        <div className="mt-5 rounded-[1.7rem] border border-emerald-200 bg-emerald-700 p-5 text-white shadow-[0_14px_30px_rgba(4,120,87,0.18)]"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">Next</p><p className="mt-2 text-2xl font-black leading-8">{goal.next_step}</p></div>
        {goal.why_it_matters ? <details className="mt-4 rounded-2xl border border-white/80 bg-white/65"><summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-slate-700">Why this matters <span className="ml-1 text-emerald-700">⌄</span></summary><p className="border-t border-white/80 px-4 pb-4 pt-3 leading-7 text-slate-700">{goal.why_it_matters}</p></details> : null}
        <div className="mt-5 border-t border-slate-200/70 pt-4"><p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Goal controls</p><div className="flex flex-wrap gap-2.5">
          {goal.progress_status === "not_started" ? <button type="button" disabled={working} onClick={() => void onStatusChange(goal, "in_progress")} className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-black text-emerald-900 disabled:opacity-60">Start</button> : null}
          {goal.progress_status === "in_progress" ? <><button type="button" disabled={working} onClick={() => void onStatusChange(goal, "completed")} className="rounded-full border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-black text-slate-700 disabled:opacity-60">Done</button><button type="button" disabled={working} onClick={() => void onStatusChange(goal, "paused")} className="rounded-full border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-black text-slate-500 disabled:opacity-60">Pause</button></> : null}
          {goal.progress_status === "paused" ? <button type="button" disabled={working} onClick={() => void onStatusChange(goal, "in_progress")} className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-black text-emerald-900 disabled:opacity-60">Continue</button> : null}
        </div></div>
      </div>
    </div>
  </article>;
}

export default function GoalsCandidatePage() {
  const { participant, participation, activeGoals, archivedGoals, loading, working, errorMessage, createGoal, updateGoal } = useParticipantGoals();
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [notice, setNotice] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [justSavedGoal, setJustSavedGoal] = useState<ParticipantGoal | null>(null);

  const canCreate = Boolean(participant && participation);
  const selectedArea = useMemo(() => getGoalArea(draft.areaId), [draft.areaId]);
  const selectedPreset = useMemo(() => getGoalPreset(draft.areaId, draft.presetId), [draft.areaId, draft.presetId]);
  const currentGoals = useMemo(() => activeGoals.filter((goal) => goal.progress_status !== "completed"), [activeGoals]);
  const pastGoals = useMemo(() => [...activeGoals.filter((goal) => goal.progress_status === "completed"), ...archivedGoals], [activeGoals, archivedGoals]);

  function resetCreation() { setDraft(emptyDraft); setStep(1); setShowCreate(false); setNotice(""); }
  function beginCreation() { setShowCreate(true); setStep(1); setDraft(emptyDraft); setNotice(""); setJustSavedGoal(null); }
  function chooseArea(areaId: string) { const area = getGoalArea(areaId); setDraft({ ...emptyDraft, areaId, goalArea: area?.label ?? "" }); setStep(2); }
  function choosePreset(presetId: string) { const preset = getGoalPreset(draft.areaId, presetId); if (!preset) return; setDraft((current) => ({ ...current, presetId, title: preset.title, nextStep: "" })); setStep(3); }
  function chooseNextStep(nextStep: string) { setDraft((current) => ({ ...current, nextStep })); setStep(4); }

  async function saveGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice("");
    if (!draft.title.trim() || !draft.nextStep.trim()) { setNotice("Add a goal and one next step before saving."); return; }
    const result = await createGoal({ title: draft.title, whyItMatters: draft.why, nextStep: draft.nextStep, goalArea: draft.goalArea });
    if (!result.ok) { setNotice(result.message); return; }
    setJustSavedGoal(result.row); setDraft(emptyDraft); setStep(1); setShowCreate(false);
  }

  async function changeStatus(goal: ParticipantGoal, status: Exclude<GoalProgressStatus, "archived">) {
    const result = await updateGoal(goal.id, { progress_status: status });
    if (!result.ok) { setNotice(result.message); return; }
    if (justSavedGoal?.id === result.row.id) setJustSavedGoal(result.row);
    if (status === "completed") { setNotice("Goal complete."); setShowHistory(true); return; }
    setNotice(status === "in_progress" ? "Goal active." : status === "paused" ? "Goal paused." : "Goal updated.");
  }

  return <AuthGate><main className={`min-h-screen bg-[radial-gradient(circle_at_12%_12%,rgba(167,243,208,0.32),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(254,240,138,0.28),transparent_26%),linear-gradient(180deg,#edf7f1_0%,#eef5f7_48%,#edf1f4_100%)] px-3 pt-3 text-slate-950 sm:px-6 sm:pt-6 ${showCreate ? "pb-44 sm:pb-36" : "pb-28 sm:pb-32"}`}><section className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
    {showCreate ? <header className="rounded-[1.8rem] border border-white/80 bg-white/72 px-4 py-3 shadow-sm backdrop-blur-2xl sm:px-6 sm:py-4"><div className="flex items-center justify-between gap-3"><Link href="/" className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-base font-black shadow-sm">T</div><div><p className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-700">DSS Enterprises</p><p className="text-sm font-black">THRIVE · Goals</p></div></Link><button type="button" onClick={resetCreation} className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-black text-slate-700">Close</button></div></header> : <header className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/45 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-9"><div className="pointer-events-none absolute -right-14 top-8 h-48 w-48 rounded-full border-[24px] border-amber-100/60" /><div className="pointer-events-none absolute -left-16 bottom-[-5rem] h-56 w-56 rounded-full bg-emerald-200/45" /><div className="relative"><div className="flex items-center justify-between"><Link href="/" className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-lg font-black shadow-sm">T</div><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-800">DSS Enterprises</p><p className="text-sm font-black">THRIVE</p></div></Link><span className="rounded-full bg-white/75 px-4 py-2 text-sm font-black text-emerald-900 shadow-sm">◎ Goals</span></div><div className="mt-16 max-w-3xl sm:mt-20"><p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">Goals</p><h1 className="mt-3 font-serif text-5xl font-semibold tracking-tight text-emerald-950 sm:text-7xl">What are you working toward?</h1><p className="mt-4 text-lg font-bold text-slate-600">One goal. One next step.</p></div></div></header>}

    {loading ? <section className="rounded-[2rem] bg-white/75 p-6 shadow-sm">Loading goals.</section> : null}
    {errorMessage ? <section role="alert" className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6"><p className="font-black">Goals could not be loaded.</p><p className="mt-2 text-sm">{errorMessage}</p></section> : null}

    {!loading && !errorMessage && canCreate ? <>
      {justSavedGoal ? <section className="rounded-[2rem] border border-white/80 bg-white/72 p-6 shadow-sm backdrop-blur-2xl sm:p-8"><p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Saved</p><h2 className="mt-2 text-3xl font-black">{justSavedGoal.title}</h2><div className="mt-5 rounded-[1.6rem] bg-emerald-700 p-5 text-white shadow-[0_14px_30px_rgba(4,120,87,0.16)]"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">Next</p><p className="mt-2 text-2xl font-black">{justSavedGoal.next_step}</p></div><div className="mt-5 flex flex-wrap gap-3">{justSavedGoal.progress_status === "not_started" ? <button type="button" disabled={working} onClick={() => void changeStatus(justSavedGoal, "in_progress")} className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-black text-emerald-900">Start</button> : null}<button type="button" onClick={() => setJustSavedGoal(null)} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-black">My goals</button><Link href="/" className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-black">Done for now</Link></div></section> : null}

      {!justSavedGoal && currentGoals.length > 0 && !showCreate ? <section className="space-y-4"><div className="px-1"><p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Right now</p><h2 className="mt-2 text-3xl font-black">Your goals</h2></div>{currentGoals.map((goal) => <ActiveGoalCard key={goal.id} goal={goal} working={working} onStatusChange={changeStatus} />)}</section> : null}

      {!justSavedGoal && !showCreate ? <button type="button" onClick={beginCreation} className="flex w-full items-center justify-between rounded-[2rem] border border-white/80 bg-white/72 p-5 text-left shadow-sm backdrop-blur-xl"><div><p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Add</p><p className="mt-1 text-xl font-black">{currentGoals.length ? "Start another goal" : "Start a goal"}</p></div><span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-800">+</span></button> : null}

      {!justSavedGoal && showCreate ? <form onSubmit={saveGoal} className="rounded-[2rem] border border-white/80 bg-white/78 p-4 shadow-sm backdrop-blur-2xl sm:p-8"><div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3"><p className="text-sm font-black text-slate-600"><span className="text-emerald-700">{step} of 4</span> · {step === 1 ? "Pick an area" : step === 2 ? "Pick a goal" : step === 3 ? "Pick a first step" : "Review"}</p><div className="flex gap-1.5" aria-hidden="true">{[1,2,3,4].map((value) => <span key={value} className={`h-1.5 w-7 rounded-full ${value <= step ? "bg-emerald-600" : "bg-slate-200"}`} />)}</div></div>
        {step === 1 ? <div className="mt-5"><h2 className="text-3xl font-black">Pick an area.</h2><div className="mt-4 grid grid-cols-2 gap-3">{goalAreas.map((area) => { const visual = goalAreaVisuals[area.id] ?? { symbol: "•", label: area.label }; return <button key={area.id} type="button" onClick={() => chooseArea(area.id)} className="flex min-h-24 flex-col items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white/86 p-3 text-center transition hover:border-emerald-300 hover:bg-emerald-50"><span className="text-2xl font-black">{visual.symbol}</span><span className="mt-2 text-sm font-black sm:text-base">{visual.label}</span></button>; })}</div></div> : null}
        {step === 2 && selectedArea ? <div className="mt-5"><button type="button" onClick={() => setStep(1)} className="text-sm font-black text-slate-500">← Back</button><h2 className="mt-4 text-3xl font-black">Pick a goal.</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{selectedArea.presets.map((preset) => <button key={preset.id} type="button" onClick={() => choosePreset(preset.id)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-base font-black hover:border-emerald-300 hover:bg-emerald-50">{preset.title}</button>)}</div><button type="button" onClick={() => { setDraft((current) => ({ ...current, presetId: "", title: "" })); setStep(3); }} className="mt-4 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 font-black text-emerald-900">Write my own</button></div> : null}
        {step === 3 ? <div className="mt-5"><button type="button" onClick={() => setStep(2)} className="text-sm font-black text-slate-500">← Back</button>{!draft.presetId ? <label className="mt-4 block text-sm font-black">Goal<input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} maxLength={180} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-emerald-500" placeholder="What are you working toward?" /></label> : <div className="mt-4 rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Goal</p><p className="mt-2 text-xl font-black">{draft.title}</p></div>}<h2 className="mt-6 text-3xl font-black">Pick one first step.</h2>{selectedPreset ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{selectedPreset.nextSteps.filter((value) => value !== "Write my own next step").map((value) => <button key={value} type="button" onClick={() => chooseNextStep(value)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left font-black hover:border-emerald-300 hover:bg-emerald-50">{value}</button>)}</div> : null}<label className="mt-5 block text-sm font-black">Or write one<input value={draft.nextStep} onChange={(event) => setDraft((current) => ({ ...current, nextStep: event.target.value }))} maxLength={240} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-emerald-500" placeholder="One useful next step" /></label><button type="button" disabled={!draft.title.trim() || !draft.nextStep.trim()} onClick={() => setStep(4)} className="mt-5 w-full rounded-full bg-emerald-700 px-6 py-3 font-black text-white disabled:opacity-40 sm:w-auto">Review</button></div> : null}
        {step === 4 ? <div className="mt-5"><button type="button" onClick={() => setStep(3)} className="text-sm font-black text-slate-500">← Back</button><h2 className="mt-4 text-3xl font-black">Save your goal.</h2><div className="mt-5 rounded-[1.6rem] bg-slate-50 p-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Goal</p><p className="mt-2 text-xl font-black">{draft.title}</p></div><div className="mt-3 rounded-[1.6rem] bg-emerald-700 p-5 text-white"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">First step</p><p className="mt-2 text-xl font-black">{draft.nextStep}</p></div><label className="mt-5 block text-sm font-black">Why it matters <span className="font-normal text-slate-400">Optional</span><textarea value={draft.why} onChange={(event) => setDraft((current) => ({ ...current, why: event.target.value }))} maxLength={500} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-emerald-500" placeholder="Anything worth remembering" /></label><button type="submit" disabled={working || !draft.title.trim() || !draft.nextStep.trim()} className="mt-5 w-full rounded-full bg-emerald-700 px-6 py-3 font-black text-white disabled:opacity-40 sm:w-auto">{working ? "Saving..." : "Save goal"}</button></div> : null}
        {notice ? <p className="mt-5 text-sm font-semibold text-rose-700">{notice}</p> : null}
      </form> : null}

      {notice && !showCreate && !justSavedGoal ? <section role="status" className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-5"><p className="font-black text-emerald-900">{notice}</p></section> : null}
      {!justSavedGoal && !showCreate ? <section className="rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl"><button type="button" aria-expanded={showHistory} onClick={() => setShowHistory((current) => !current)} className="flex w-full items-center justify-between font-black text-slate-800"><span>Past goals</span><span>{pastGoals.length} {showHistory ? "⌃" : "⌄"}</span></button>{showHistory ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{pastGoals.length === 0 ? <p className="text-sm text-slate-600">No past goals yet.</p> : pastGoals.map((goal) => { const visual = statusVisuals[goal.progress_status]; return <article key={goal.id} className="rounded-2xl bg-slate-50 p-5"><div className="flex items-start justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{goal.goal_area ?? "Goal"}</p><span className={`rounded-full px-3 py-1 text-xs font-black ${visual.badge}`}>{statusLabels[goal.progress_status]}</span></div><h3 className="mt-2 text-lg font-black">{goal.title}</h3><p className="mt-3 text-sm font-bold text-slate-600">Last step: {goal.next_step}</p></article>; })}</div> : null}</section> : null}
    </> : null}

    {!showCreate ? <details className="rounded-[2rem] border border-white/80 bg-white/60 shadow-sm backdrop-blur-xl"><summary className="cursor-pointer list-none p-6 font-black text-emerald-900">About goals</summary><p className="border-t border-white/80 px-6 pb-6 pt-5 text-sm leading-7 text-slate-600">Your goals belong to you. THRIVE keeps the next step visible and records what you choose.</p></details> : null}
  </section><GoalsBottomNav /></main></AuthGate>;
}
