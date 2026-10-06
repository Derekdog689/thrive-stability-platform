"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import AuthGate from "../AuthGate";
import { GoalProgressStatus, ParticipantGoal, useParticipantGoals } from "../goals/useParticipantGoals";
import { getGoalArea, getGoalPreset, goalAreas } from "../goals/goalPresets";

type Draft = { areaId: string; presetId: string; title: string; why: string; nextStep: string; goalArea: string };

const emptyDraft: Draft = { areaId: "", presetId: "", title: "", why: "", nextStep: "", goalArea: "" };

type IconName = "today" | "wellness" | "goal" | "money" | "support";

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

  if (name === "today") {
    return <svg {...common}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10.5V20h13v-9.5" /><path d="M9.5 20v-5.5h5V20" /></svg>;
  }
  if (name === "wellness") {
    return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
  }
  if (name === "goal") {
    return <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="m15 9 5-5M16.5 4H20v3.5" /></svg>;
  }
  if (name === "money") {
    return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M7 10h.01M17 14h.01" /><circle cx="12" cy="12" r="2.5" /></svg>;
  }
  return <svg {...common}><path d="M20.8 5.8c-2-2-5.2-1.8-7 .3L12 8.2l-1.8-2.1c-1.8-2.1-5-2.3-7-.3-2.1 2.1-2 5.6.2 7.6L12 21l8.6-7.6c2.2-2 2.3-5.5.2-7.6Z" /></svg>;
}

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
  const items: { href: string; label: string; icon: IconName }[] = [
    { href: "/living-signal/today", label: "Today", icon: "today" },
    { href: "/wellness", label: "Wellness", icon: "wellness" },
    { href: "/goals", label: "Goals", icon: "goal" },
    { href: "/budget", label: "Money", icon: "money" },
    { href: "/support", label: "Support", icon: "support" },
  ];
  return <nav className="goals-bottom-nav fixed left-1/2 z-50 grid w-[calc(100%-20px)] max-w-[660px] -translate-x-1/2 grid-cols-5 gap-[3px] rounded-[24px] border border-white/75 bg-[#fbf9f3]/90 p-[6px] shadow-[0_20px_62px_rgba(10,31,39,0.18)] backdrop-blur-[26px] [bottom:calc(6px+env(safe-area-inset-bottom,0px))]">{items.map((item) => <Link key={item.href} href={item.href} className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] px-1 text-center text-[10px] font-black uppercase text-[#536174] no-underline transition active:scale-95 ${item.href === "/goals" ? "bg-[linear-gradient(180deg,#159784,#0a7d6f)] text-white shadow-[0_9px_24px_rgba(9,126,111,0.20)]" : "hover:bg-white/70 hover:text-[#173644]"}`}><Icon name={item.icon} className="h-5 w-5" /><span className="truncate">{item.label}</span></Link>)}</nav>;
}

type GoalGuidanceJob = "do" | "understand" | "practice" | "decide" | "connect";
type GoalGuidanceChoice = "example" | "smaller" | "think" | null;

function goalGuidanceJob(goal: ParticipantGoal): GoalGuidanceJob {
  const text = `${goal.title} ${goal.next_step} ${goal.why_it_matters ?? ""}`.toLowerCase();

  if (/track|routine|practice|repeat|daily|three days|each day|consisten/.test(text)) return "practice";
  if (/choose|decide|compare|option|which|priorit/.test(text)) return "decide";
  if (goal.goal_area === "Relationships and support" || /ask for help|reach out|support|contact|call|talk to|connect/.test(text)) return "connect";
  if (/understand|why|figure out|learn|make sense|not sure|unclear/.test(text)) return "understand";
  return "do";
}

function matchingPresetSteps(goal: ParticipantGoal) {
  for (const area of goalAreas) {
    const preset = area.presets.find((candidate) => candidate.title === goal.title);
    if (!preset) continue;
    return preset.nextSteps.filter((step) => step !== goal.next_step && step !== "Write my own next step").slice(0, 3);
  }
  return [] as string[];
}

function guidanceCopy(job: GoalGuidanceJob, choice: Exclude<GoalGuidanceChoice, null>, goal: ParticipantGoal) {
  const alternatives = matchingPresetSteps(goal);

  if (choice === "example") {
    if (alternatives.length > 0) {
      return { title: "One way to move this", body: alternatives[0] };
    }
    if (job === "understand") return { title: "Start with one question", body: "What feels unclear about this right now?" };
    if (job === "practice") return { title: "Keep it simple", body: "Choose one action you can repeat once today." };
    if (job === "decide") return { title: "Name the choice", body: "Write down the two options you are actually deciding between." };
    if (job === "connect") return { title: "Make the ask concrete", body: "Name the person or kind of help you want to reach." };
    return { title: "One useful move", body: "Choose the smallest action that would count as progress today." };
  }

  if (choice === "smaller") {
    if (job === "practice") return { title: "Make it smaller", body: "Track one action once today. You do not need a whole system yet." };
    if (job === "understand") return { title: "Make it smaller", body: "Answer only this: what part of this feels most unclear?" };
    if (job === "decide") return { title: "Make it smaller", body: "Choose one decision to make now and leave the rest for later." };
    if (job === "connect") return { title: "Make it smaller", body: "Choose one person or one support path to contact first." };
    return { title: "Make it smaller", body: "Shrink the next step until it feels doable in one short sitting." };
  }

  if (job === "understand") return { title: "Think it through", body: "What were you hoping would be different if this goal moved forward?" };
  if (job === "practice") return { title: "Think it through", body: "What single action would you want to notice yourself repeating?" };
  if (job === "decide") return { title: "Think it through", body: "What matters most for this decision right now: time, money, effort, or support?" };
  if (job === "connect") return { title: "Think it through", body: "What kind of help would actually make the next step easier?" };
  return { title: "Think it through", body: "What would make this next step easier to start?" };
}

function goalSupportHref(goal: ParticipantGoal) {
  const params = new URLSearchParams({
    from: "goal",
    goalTitle: goal.title,
    goalNext: goal.next_step,
  });
  if (goal.why_it_matters?.trim()) params.set("goalWhy", goal.why_it_matters.trim());
  return `/support?${params.toString()}`;
}

function GoalThreadCard({ goal, working, onStatusChange, focused = false }: { goal: ParticipantGoal; working: boolean; onStatusChange: (goal: ParticipantGoal, status: Exclude<GoalProgressStatus, "archived">) => Promise<void>; focused?: boolean }) {
  const visual = statusVisuals[goal.progress_status];
  const [guidanceChoice, setGuidanceChoice] = useState<GoalGuidanceChoice>(null);
  const [isOpen, setIsOpen] = useState(false);
  const job = goalGuidanceJob(goal);
  const guidance = guidanceChoice ? guidanceCopy(job, guidanceChoice, goal) : null;

  useEffect(() => {
    if (focused) setIsOpen(true);
  }, [focused]);

  return <details id={`goal-${goal.id}`} open={isOpen} onToggle={(event) => setIsOpen(event.currentTarget.open)} className={`group scroll-mt-24 overflow-hidden rounded-[1.6rem] border bg-white/78 shadow-sm backdrop-blur-xl ${focused ? "border-emerald-400 ring-4 ring-emerald-100" : "border-white/80"}`}>
    <summary className="cursor-pointer list-none p-5">
      <div className="flex items-start gap-4">
        <span className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full ${visual.dot}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{goal.goal_area ?? "Goal"}</p>
              <h3 className="mt-1 text-xl font-black leading-7 text-slate-950 sm:text-2xl">{goal.title}</h3>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black ${visual.badge}`}>{statusLabels[goal.progress_status]}</span>
          </div>
          <div className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Next</p>
            <p className="mt-1 text-base font-black leading-6 text-emerald-950">{goal.next_step}</p>
          </div>
          <p className="mt-3 text-sm font-black text-slate-500 group-open:hidden">Open goal ↓</p>
        </div>
      </div>
    </summary>

    <div className="border-t border-slate-100 px-5 pb-5 pt-4">
      {goal.why_it_matters ? <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Why it matters</p><p className="mt-2 text-base font-semibold leading-7 text-slate-700">{goal.why_it_matters}</p></div> : null}

      {goal.progress_status === "in_progress" ? <div className="mt-4 rounded-[1.4rem] border border-emerald-100 bg-emerald-50/70 p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">THRIVE can help</p>
        <p className="mt-2 text-base font-semibold leading-6 text-slate-700">Pick one kind of help. You do not need to figure out the whole goal at once.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <button type="button" onClick={() => setGuidanceChoice("example")} className="rounded-2xl bg-white px-4 py-3 text-left text-sm font-black text-slate-800 shadow-sm">Give me an example</button>
          <button type="button" onClick={() => setGuidanceChoice("smaller")} className="rounded-2xl bg-white px-4 py-3 text-left text-sm font-black text-slate-800 shadow-sm">Make this smaller</button>
          <button type="button" onClick={() => setGuidanceChoice("think")} className="rounded-2xl bg-white px-4 py-3 text-left text-sm font-black text-slate-800 shadow-sm">Help me think it through</button>
        </div>
        {guidance ? <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{guidance.title}</p>
          <p className="mt-2 text-lg font-black leading-7 text-slate-900">{guidance.body}</p>
        </div> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/resources" className="rounded-full border border-emerald-200 bg-white px-4 py-2.5 text-sm font-black text-emerald-800">Find a resource</Link>
          <Link href={goalSupportHref(goal)} className="rounded-full border border-violet-200 bg-white px-4 py-2.5 text-sm font-black text-violet-800">Ask for support</Link>
        </div>
      </div> : null}

      <div className="mt-4 flex flex-wrap gap-2.5">
        {goal.progress_status === "not_started" ? <button type="button" disabled={working} onClick={() => void onStatusChange(goal, "in_progress")} className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-black text-white disabled:opacity-60">Start</button> : null}
        {goal.progress_status === "in_progress" ? <><button type="button" disabled={working} onClick={() => void onStatusChange(goal, "completed")} className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-black text-white disabled:opacity-60">Done</button><button type="button" disabled={working} onClick={() => void onStatusChange(goal, "paused")} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 disabled:opacity-60">Pause</button></> : null}
        {goal.progress_status === "paused" ? <button type="button" disabled={working} onClick={() => void onStatusChange(goal, "in_progress")} className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-black text-white disabled:opacity-60">Continue</button> : null}
      </div>
    </div>
  </details>;
}

function GoalThreadGroup({ title, note, goals, working, onStatusChange, focusedGoalId }: { title: string; note: string; goals: ParticipantGoal[]; working: boolean; onStatusChange: (goal: ParticipantGoal, status: Exclude<GoalProgressStatus, "archived">) => Promise<void>; focusedGoalId?: string }) {
  if (goals.length === 0) return null;

  return <section className="rounded-[2rem] border border-white/80 bg-white/58 p-5 shadow-sm backdrop-blur-xl sm:p-6">
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-base font-semibold text-slate-500">{note}</p>
      </div>
      <span className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-black text-slate-600">{goals.length}</span>
    </div>
    <div className="mt-4 space-y-3">
      {goals.map((goal) => <GoalThreadCard key={goal.id} goal={goal} working={working} onStatusChange={onStatusChange} focused={goal.id === focusedGoalId} />)}
    </div>
  </section>;
}

export default function GoalsCandidatePage() {
  const { participant, participation, activeGoals, archivedGoals, loading, working, errorMessage, createGoal, updateGoal } = useParticipantGoals();
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [notice, setNotice] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [justSavedGoal, setJustSavedGoal] = useState<ParticipantGoal | null>(null);
  const [justCompletedGoal, setJustCompletedGoal] = useState<ParticipantGoal | null>(null);
  const [focusedGoalId, setFocusedGoalId] = useState("");

  const canCreate = Boolean(participant && participation);
  const selectedArea = useMemo(() => getGoalArea(draft.areaId), [draft.areaId]);
  const selectedPreset = useMemo(() => getGoalPreset(draft.areaId, draft.presetId), [draft.areaId, draft.presetId]);
  const currentGoals = useMemo(() => activeGoals.filter((goal) => goal.progress_status !== "completed"), [activeGoals]);
  const activeNow = useMemo(() => currentGoals.filter((goal) => goal.progress_status === "in_progress"), [currentGoals]);
  const readyGoals = useMemo(() => currentGoals.filter((goal) => goal.progress_status === "not_started"), [currentGoals]);
  const pausedGoals = useMemo(() => currentGoals.filter((goal) => goal.progress_status === "paused"), [currentGoals]);
  const completedGoals = useMemo(() => activeGoals.filter((goal) => goal.progress_status === "completed"), [activeGoals]);
  const pastGoals = useMemo(() => [...completedGoals, ...archivedGoals], [completedGoals, archivedGoals]);
  const allGoals = useMemo(() => [...activeGoals, ...archivedGoals], [activeGoals, archivedGoals]);
  const pastGoalAreas = useMemo(() => {
    const counts = new Map<string, number>();
    pastGoals.forEach((goal) => {
      const label = goal.goal_area ?? "Other";
      counts.set(label, (counts.get(label) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [pastGoals]);

  const primaryGoal = activeNow[0] ?? readyGoals[0] ?? pausedGoals[0] ?? null;
  const secondaryActiveGoals = primaryGoal?.progress_status === "in_progress"
    ? activeNow.filter((goal) => goal.id !== primaryGoal.id)
    : activeNow;
  const secondaryReadyGoals = primaryGoal?.progress_status === "not_started"
    ? readyGoals.filter((goal) => goal.id !== primaryGoal.id)
    : readyGoals;
  const secondaryPausedGoals = primaryGoal?.progress_status === "paused"
    ? pausedGoals.filter((goal) => goal.id !== primaryGoal.id)
    : pausedGoals;

  useEffect(() => {
    const goalId = new URLSearchParams(window.location.search).get("goal")?.trim() ?? "";
    if (goalId) setFocusedGoalId(goalId);
  }, []);

  useEffect(() => {
    if (loading || !focusedGoalId) return;
    const targetGoal = allGoals.find((goal) => goal.id === focusedGoalId);
    if (!targetGoal) return;

    setJustSavedGoal(null);
    setJustCompletedGoal(null);
    setShowCreate(false);
    if (["completed", "archived"].includes(targetGoal.progress_status)) {
      setShowHistory(true);
    }

    const moveToGoal = () => {
      const target = document.getElementById(`goal-${focusedGoalId}`);
      if (!target) return;
      const top = window.scrollY + target.getBoundingClientRect().top - 76;
      window.scrollTo({ top: Math.max(top, 0), behavior: "auto" });
    };

    const firstPass = window.setTimeout(moveToGoal, 80);
    const settlePass = window.setTimeout(moveToGoal, 420);
    return () => {
      window.clearTimeout(firstPass);
      window.clearTimeout(settlePass);
    };
  }, [allGoals, focusedGoalId, loading]);

  function resetCreation() { setDraft(emptyDraft); setStep(1); setShowCreate(false); setNotice(""); }
  function beginCreation() { setShowCreate(true); setStep(1); setDraft(emptyDraft); setNotice(""); setJustSavedGoal(null); setJustCompletedGoal(null); }
  function beginFollowUp(goal: ParticipantGoal) {
    const area = goalAreas.find((candidate) => candidate.label === goal.goal_area);
    setShowCreate(true);
    setNotice("");
    setJustSavedGoal(null);
    setJustCompletedGoal(null);
    if (area) {
      setDraft({ ...emptyDraft, areaId: area.id, goalArea: area.label });
      setStep(2);
      return;
    }
    setDraft(emptyDraft);
    setStep(1);
  }
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
    setNotice("");
    if (justSavedGoal?.id === result.row.id) setJustSavedGoal(result.row);
    if (status === "completed") {
      setJustCompletedGoal(result.row);
      setShowHistory(false);
    }
  }

  return <AuthGate><main className={`goals-living-signal goals-environment-v2 ${justCompletedGoal ? "goals-state-complete" : currentGoals.length > 0 ? "goals-state-moving" : "goals-state-open"} relative min-h-screen overflow-x-hidden text-[#17152a] ${showCreate ? "pb-44 sm:pb-36" : "pb-28 sm:pb-32"}`}><div className="goals-fixed-environment" aria-hidden="true" /><div className="goals-route-atmosphere" aria-hidden="true"><span className="goals-route-line" /><span className="goals-route-light goals-route-light--one" /><span className="goals-route-light goals-route-light--two" /></div><section className="goals-scroll-content relative z-10 mx-auto max-w-5xl space-y-5 px-3 pt-3 sm:space-y-6 sm:px-6 sm:pt-6">
    {showCreate ? <header className="goals-create-header rounded-[1.55rem] border border-white/60 bg-white/52 px-4 py-3.5 shadow-[0_14px_38px_rgba(27,16,54,0.10)] backdrop-blur-xl sm:px-5 sm:py-4"><div className="flex items-center justify-between gap-3"><Link href="/living-signal/today" className="flex items-center gap-2.5"><div className="wellness-brandmark" aria-hidden="true"><span className="wellness-leaf wellness-leaf--one" /><span className="wellness-leaf wellness-leaf--two" /><span className="wellness-leaf wellness-leaf--three" /></div><div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#146f78]">DSS Enterprises</p><p className="text-sm font-black tracking-[0.04em] text-[#0b3138]">THRIVE · Goals</p></div></Link><button type="button" onClick={resetCreation} className="rounded-full border border-white/80 bg-white/76 px-4 py-2 text-sm font-black text-slate-700 shadow-sm">Close</button></div></header> : <header className="goals-scene-header relative overflow-hidden rounded-[2rem] border border-white/38 px-4 pb-5 pt-4 shadow-[0_26px_72px_rgba(20,16,46,0.20)] sm:px-6 sm:pb-6 sm:pt-5"><div className="goals-scene-shade" aria-hidden="true" /><div className="relative z-10"><div className="flex items-center justify-between gap-3"><Link href="/living-signal/today" className="flex items-center gap-2.5"><div className="wellness-brandmark" aria-hidden="true"><span className="wellness-leaf wellness-leaf--one" /><span className="wellness-leaf wellness-leaf--two" /><span className="wellness-leaf wellness-leaf--three" /></div><div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d7fff7]">DSS Enterprises</p><p className="text-sm font-black tracking-[0.04em] text-white">THRIVE</p></div></Link><span className="flex items-center gap-2 rounded-full border border-white/26 bg-[#102f3c]/34 px-3 py-2 text-xs font-black text-white shadow-sm backdrop-blur-xl"><Icon name="goal" className="h-5 w-5" />Goals</span></div><div className="goals-scene-copy mt-8 max-w-2xl sm:mt-12"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f6c977]">{currentGoals.length > 0 ? "Your path right now" : "A direction can start small"}</p><h1 className="mt-2 font-serif text-[2.7rem] font-semibold leading-[0.92] tracking-[-0.045em] text-white sm:text-6xl">{currentGoals.length > 0 ? "Keep moving what matters." : "What are you working toward?"}</h1><p className="mt-3 max-w-xl text-base font-semibold leading-6 text-white/82">{currentGoals.length > 0 ? "One next step at a time. The path can change without losing the progress already made." : "Choose one direction. THRIVE will keep the next step visible without turning it into a score."}</p></div><div className="goals-journey-ribbon mt-6" aria-label="Goal movement summary"><div className="goals-journey-track" aria-hidden="true"><span className="goals-journey-segment" /><span className={`goals-journey-marker ${readyGoals.length > 0 ? "is-lit" : ""}`} /><span className={`goals-journey-marker ${activeNow.length > 0 ? "is-lit is-current" : ""}`} /><span className={`goals-journey-marker ${completedGoals.length > 0 ? "is-lit" : ""}`} /></div><div className="goals-journey-facts"><span><strong>{readyGoals.length}</strong> ready</span><span><strong>{activeNow.length}</strong> moving</span><span><strong>{completedGoals.length}</strong> kept</span></div></div></div></header>}

    {loading ? <section className="rounded-[2rem] bg-white/75 p-6 shadow-sm">Loading goals.</section> : null}
    {errorMessage ? <section role="alert" className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6"><p className="font-black">Goals could not be loaded.</p><p className="mt-2 text-sm">{errorMessage}</p></section> : null}

    {!loading && !errorMessage && canCreate ? <>
      {justSavedGoal ? <section className="rounded-[2rem] border border-white/80 bg-white/72 p-6 shadow-sm backdrop-blur-2xl sm:p-8"><p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Saved</p><h2 className="mt-2 text-3xl font-black">{justSavedGoal.title}</h2><div className="mt-5 rounded-[1.6rem] bg-emerald-700 p-5 text-white shadow-[0_14px_30px_rgba(4,120,87,0.16)]"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">Next</p><p className="mt-2 text-2xl font-black">{justSavedGoal.next_step}</p></div><div className="mt-5 flex flex-wrap gap-3">{justSavedGoal.progress_status === "not_started" ? <button type="button" disabled={working} onClick={() => void changeStatus(justSavedGoal, "in_progress")} className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-black text-emerald-900">Start</button> : null}<button type="button" onClick={() => setJustSavedGoal(null)} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-black">My goals</button><Link href="/?done=goals" className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-black">Done for now</Link></div></section> : null}

      {justCompletedGoal && !showCreate ? <section className="goals-completion-moment relative overflow-hidden rounded-[2rem] border border-violet-200/70 p-6 shadow-[0_26px_72px_rgba(50,29,86,0.18)] sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-100/70 blur-2xl" />
        <div className="relative">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-sky-700">Completed</p>
          <h2 className="mt-2 text-4xl font-black leading-tight text-slate-950">You finished this.</h2>
          <p className="mt-3 text-2xl font-black leading-8 text-slate-800">{justCompletedGoal.title}</p>
          <div className="mt-5 rounded-[1.5rem] bg-white/80 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Last step</p>
            <p className="mt-2 text-lg font-black leading-7 text-slate-800">{justCompletedGoal.next_step}</p>
          </div>
          <p className="mt-5 text-lg font-black text-slate-800">What do you want to do next?</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => beginFollowUp(justCompletedGoal)} className="rounded-[1.4rem] bg-emerald-700 px-5 py-4 text-left text-white">
              <span className="block text-lg font-black">Build on this</span>
              <span className="mt-1 block text-sm font-semibold text-emerald-100">Start a follow-up goal in the same area.</span>
            </button>
            <button type="button" onClick={() => { setJustCompletedGoal(null); setShowHistory(true); }} className="rounded-[1.4rem] border border-sky-100 bg-white px-5 py-4 text-left">
              <span className="block text-lg font-black text-sky-950">See completed goals</span>
              <span className="mt-1 block text-sm font-semibold text-sky-700">Look back at what you’ve finished.</span>
            </button>
          </div>
          <button type="button" onClick={() => setJustCompletedGoal(null)} className="mt-3 w-full rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-base font-black text-slate-600">Done for now</button>
        </div>
      </section> : null}

      {!justSavedGoal && !justCompletedGoal && currentGoals.length > 0 && !showCreate ? <section className="space-y-4">
        {primaryGoal ? <section className="goals-primary-thread goals-route-current rounded-[2rem] border border-white/50 bg-white/44 p-4 shadow-[0_22px_66px_rgba(29,18,56,0.14)] backdrop-blur-2xl sm:p-5">
          <div className="mb-3 px-1">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#157a73]">Current focus</p>
            <h2 className="mt-1 text-2xl font-black text-[#21173a]">One thing to move</h2>
          </div>
          <GoalThreadCard goal={primaryGoal} working={working} onStatusChange={changeStatus} focused={primaryGoal.id === focusedGoalId} />
        </section> : null}
        <GoalThreadGroup title="Also in motion" note="Other things you can return to when they matter." goals={secondaryActiveGoals} working={working} onStatusChange={changeStatus} focusedGoalId={focusedGoalId} />
        <GoalThreadGroup title="Ready" note="Things waiting for you to start." goals={secondaryReadyGoals} working={working} onStatusChange={changeStatus} focusedGoalId={focusedGoalId} />
        <GoalThreadGroup title="Paused" note="Things you chose to set aside for now." goals={secondaryPausedGoals} working={working} onStatusChange={changeStatus} focusedGoalId={focusedGoalId} />
      </section> : null}

      {!justSavedGoal && !justCompletedGoal && !showCreate ? <>
        {currentGoals.length === 0 ? <section className="goals-empty-state goals-path-choice rounded-[2rem] border border-white/52 bg-white/48 p-5 shadow-[0_20px_58px_rgba(29,18,56,0.12)] backdrop-blur-2xl sm:p-6">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#157a73]">Right now</p>
          <h2 className="mt-2 text-3xl font-black text-[#21173a]">Nothing active right now.</h2>
          <p className="mt-2 text-base font-semibold leading-7 text-slate-600">Your past goals are still here. Start something new when it matters.</p>
          <button type="button" onClick={beginCreation} className="mt-5 flex w-full items-center justify-between rounded-[1.5rem] bg-[linear-gradient(180deg,#159784,#0a7d6f)] px-5 py-4 text-left text-white shadow-[0_16px_34px_rgba(9,126,111,0.22)] sm:w-auto sm:min-w-72">
            <span>
              <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-[#c9fff5]">Start</span>
              <span className="mt-1 block text-xl font-black">Start a goal</span>
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/14 text-2xl font-black">+</span>
          </button>
        </section> : <button type="button" onClick={beginCreation} className="flex w-full items-center justify-between rounded-[2rem] border border-white/80 bg-white/72 p-5 text-left shadow-sm backdrop-blur-xl"><div><p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Add</p><p className="mt-1 text-xl font-black">Start another goal</p></div><span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-800">+</span></button>}
      </> : null}

      {!justSavedGoal && showCreate ? <form onSubmit={saveGoal} className="rounded-[2rem] border border-white/80 bg-white/78 p-4 shadow-sm backdrop-blur-2xl sm:p-8"><div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3"><p className="text-sm font-black text-slate-600"><span className="text-emerald-700">{step} of 4</span> · {step === 1 ? "Pick an area" : step === 2 ? "Pick a goal" : step === 3 ? "Pick a first step" : "Review"}</p><div className="flex gap-1.5" aria-hidden="true">{[1,2,3,4].map((value) => <span key={value} className={`h-1.5 w-7 rounded-full ${value <= step ? "bg-emerald-600" : "bg-slate-200"}`} />)}</div></div>
        {step === 1 ? <div className="mt-5"><h2 className="text-3xl font-black">Pick an area.</h2><div className="mt-4 grid grid-cols-2 gap-3">{goalAreas.map((area) => { const visual = goalAreaVisuals[area.id] ?? { symbol: "•", label: area.label }; return <button key={area.id} type="button" onClick={() => chooseArea(area.id)} className="flex min-h-24 flex-col items-center justify-center rounded-[1.5rem] border border-slate-200 bg-white/86 p-3 text-center transition hover:border-emerald-300 hover:bg-emerald-50"><span className="text-2xl font-black">{visual.symbol}</span><span className="mt-2 text-sm font-black sm:text-base">{visual.label}</span></button>; })}</div></div> : null}
        {step === 2 && selectedArea ? <div className="mt-5"><button type="button" onClick={() => setStep(1)} className="text-sm font-black text-slate-500">← Back</button><h2 className="mt-4 text-3xl font-black">Pick a goal.</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{selectedArea.presets.map((preset) => <button key={preset.id} type="button" onClick={() => choosePreset(preset.id)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left text-base font-black hover:border-emerald-300 hover:bg-emerald-50">{preset.title}</button>)}</div><button type="button" onClick={() => { setDraft((current) => ({ ...current, presetId: "", title: "" })); setStep(3); }} className="mt-4 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 font-black text-emerald-900">Write my own</button></div> : null}
        {step === 3 ? <div className="mt-5"><button type="button" onClick={() => setStep(2)} className="text-sm font-black text-slate-500">← Back</button>{!draft.presetId ? <label className="mt-4 block text-sm font-black">Goal<input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} maxLength={180} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-emerald-500" placeholder="What are you working toward?" /></label> : <div className="mt-4 rounded-2xl bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Goal</p><p className="mt-2 text-xl font-black">{draft.title}</p></div>}<h2 className="mt-6 text-3xl font-black">Pick one first step.</h2>{selectedPreset ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{selectedPreset.nextSteps.filter((value) => value !== "Write my own next step").map((value) => <button key={value} type="button" onClick={() => chooseNextStep(value)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left font-black hover:border-emerald-300 hover:bg-emerald-50">{value}</button>)}</div> : null}<label className="mt-5 block text-sm font-black">Or write one<input value={draft.nextStep} onChange={(event) => setDraft((current) => ({ ...current, nextStep: event.target.value }))} maxLength={240} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-emerald-500" placeholder="One useful next step" /></label><button type="button" disabled={!draft.title.trim() || !draft.nextStep.trim()} onClick={() => setStep(4)} className="mt-5 w-full rounded-full bg-emerald-700 px-6 py-3 font-black text-white disabled:opacity-40 sm:w-auto">Review</button></div> : null}
        {step === 4 ? <div className="mt-5"><button type="button" onClick={() => setStep(3)} className="text-sm font-black text-slate-500">← Back</button><h2 className="mt-4 text-3xl font-black">Save your goal.</h2><div className="mt-5 rounded-[1.6rem] bg-slate-50 p-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Goal</p><p className="mt-2 text-xl font-black">{draft.title}</p></div><div className="mt-3 rounded-[1.6rem] bg-emerald-700 p-5 text-white"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">First step</p><p className="mt-2 text-xl font-black">{draft.nextStep}</p></div><label className="mt-5 block text-sm font-black">Why it matters <span className="font-normal text-slate-400">Optional</span><textarea value={draft.why} onChange={(event) => setDraft((current) => ({ ...current, why: event.target.value }))} maxLength={500} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-emerald-500" placeholder="Anything worth remembering" /></label><button type="submit" disabled={working || !draft.title.trim() || !draft.nextStep.trim()} className="mt-5 w-full rounded-full bg-emerald-700 px-6 py-3 font-black text-white disabled:opacity-40 sm:w-auto">{working ? "Saving..." : "Save goal"}</button></div> : null}
        {notice ? <p className="mt-5 text-sm font-semibold text-rose-700">{notice}</p> : null}
      </form> : null}

      {notice && !showCreate && !justSavedGoal && !justCompletedGoal ? <section role="alert" className="rounded-[2rem] border border-rose-200 bg-rose-50 p-5"><p className="font-black text-rose-900">{notice}</p></section> : null}
      {!justSavedGoal && !justCompletedGoal && !showCreate ? <section className="goals-history-surface rounded-[2rem] border border-white/70 bg-white/58 p-6 shadow-[0_20px_58px_rgba(29,18,56,0.10)] backdrop-blur-2xl">
        <button type="button" aria-expanded={showHistory} onClick={() => setShowHistory((current) => !current)} className="flex w-full items-center justify-between text-left font-black text-slate-800">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-sky-700">Progress kept</p>
            <span className="mt-1 block text-2xl">Completed & past goals</span>
          </div>
          <span className="rounded-full bg-slate-50 px-3 py-2 text-sm">{pastGoals.length} {showHistory ? "⌃" : "⌄"}</span>
        </button>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-sky-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-sky-700">Complete</p><p className="mt-2 text-2xl font-black text-sky-950">{completedGoals.length}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-slate-500">Archived</p><p className="mt-2 text-2xl font-black text-slate-950">{archivedGoals.length}</p></div>
        </div>
        {pastGoalAreas.length > 0 ? <div className="mt-4 flex flex-wrap gap-2">{pastGoalAreas.slice(0, 6).map(([area, count]) => <span key={area} className="rounded-full bg-white px-3 py-2 text-sm font-black text-slate-600 shadow-sm">{area} · {count}</span>)}</div> : null}
        {showHistory ? <div className="goals-history-list mt-5 overflow-hidden rounded-[1.45rem] border border-white/70 bg-white/58">{pastGoals.length === 0 ? <p className="p-4 text-sm text-slate-600">No past goals yet.</p> : pastGoals.map((goal) => { const visual = statusVisuals[goal.progress_status]; const focused = goal.id === focusedGoalId; return <details key={goal.id} id={`goal-${goal.id}`} open={focused ? true : undefined} className={`goals-history-row scroll-mt-24 border-b border-slate-200/70 last:border-b-0 ${focused ? "bg-sky-50/80 ring-2 ring-inset ring-sky-100" : ""}`}><summary className="cursor-pointer list-none px-4 py-4"><div className="flex items-start gap-3"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${visual.dot}`} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{goal.goal_area ?? "Goal"}</p><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${visual.badge}`}>{statusLabels[goal.progress_status]}</span></div><h3 className="mt-1 text-base font-black leading-6 text-slate-900">{goal.title}</h3></div></div></summary><div className="px-9 pb-4"><p className="text-sm font-semibold leading-6 text-slate-600">Last step: {goal.next_step}</p>{goal.why_it_matters ? <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Why it mattered: {goal.why_it_matters}</p> : null}</div></details>; })}</div> : null}
      </section> : null}
    </> : null}

    {!showCreate ? <details className="goals-about rounded-[1.4rem] border border-white/65 bg-white/42 shadow-sm backdrop-blur-xl"><summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-emerald-900">About goals</summary><p className="border-t border-white/70 px-4 pb-4 pt-3 text-sm leading-6 text-slate-600">Your goals belong to you. THRIVE keeps the next step visible and records what you choose.</p></details> : null}
  </section><GoalsBottomNav /></main></AuthGate>;
}
