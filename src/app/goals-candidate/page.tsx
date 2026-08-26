"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import AuthGate from "../AuthGate";
import {
  GoalProgressStatus,
  ParticipantGoal,
  useParticipantGoals,
} from "../goals/useParticipantGoals";
import { getGoalArea, getGoalPreset, goalAreas } from "../goals/goalPresets";

type Draft = {
  areaId: string;
  presetId: string;
  title: string;
  why: string;
  nextStep: string;
  goalArea: string;
};

const emptyDraft: Draft = {
  areaId: "",
  presetId: "",
  title: "",
  why: "",
  nextStep: "",
  goalArea: "",
};

const statusLabels: Record<GoalProgressStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
};

const goalAreaVisuals: Record<string, { symbol: string; label: string }> = {
  daily_stability: { symbol: "🏠", label: "Routine" },
  money_budgeting: { symbol: "$", label: "Money" },
  health_wellness: { symbol: "♥", label: "Health" },
  relationships_support: { symbol: "👥", label: "Support" },
  work_education: { symbol: "💼", label: "Work" },
  personal_growth: { symbol: "🌱", label: "Growth" },
};

function GoalsBottomNav() {
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
              item.href === "/goals"
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

function ActiveGoalCard({
  goal,
  working,
  onStatusChange,
}: {
  goal: ParticipantGoal;
  working: boolean;
  onStatusChange: (
    goal: ParticipantGoal,
    status: Exclude<GoalProgressStatus, "archived">,
  ) => Promise<void>;
}) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-[#365a52] via-[#274a43] to-[#203b38] p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-100/80">
              {goal.goal_area ?? "Your Goal"}
            </p>
            <h3 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
              {goal.title}
            </h3>
          </div>
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white ring-1 ring-white/15">
            {statusLabels[goal.progress_status]}
          </span>
        </div>

        <div className="mt-6 rounded-2xl bg-white/10 p-5 ring-1 ring-white/10">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100/80">
            Your next step
          </p>
          <p className="mt-2 text-xl font-black leading-7">{goal.next_step}</p>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {goal.why_it_matters ? (
          <div className="rounded-2xl bg-[#f7f2ea] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9b613f]">
              Why this matters to you
            </p>
            <p className="mt-2 font-serif text-xl leading-8 text-slate-800">
              {goal.why_it_matters}
            </p>
          </div>
        ) : null}

        {goal.progress_status !== "archived" ? (
          <div className="mt-5 flex flex-wrap gap-3">
            {goal.progress_status === "not_started" ? (
              <button
                type="button"
                disabled={working}
                onClick={() => void onStatusChange(goal, "in_progress")}
                className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white transition hover:bg-emerald-800 disabled:opacity-60"
              >
                Start this Goal
              </button>
            ) : null}

            {goal.progress_status === "in_progress" ? (
              <>
                <button
                  type="button"
                  disabled={working}
                  onClick={() => void onStatusChange(goal, "paused")}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Pause for now
                </button>
                <button
                  type="button"
                  disabled={working}
                  onClick={() => void onStatusChange(goal, "completed")}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 font-black text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-60"
                >
                  Mark complete
                </button>
              </>
            ) : null}

            {goal.progress_status === "paused" ? (
              <button
                type="button"
                disabled={working}
                onClick={() => void onStatusChange(goal, "in_progress")}
                className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white transition hover:bg-emerald-800 disabled:opacity-60"
              >
                Keep going with this Goal
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function GoalsCandidatePage() {
  const {
    participant,
    participation,
    participantName,
    activeGoals,
    archivedGoals,
    loading,
    working,
    errorMessage,
    createGoal,
    updateGoal,
  } = useParticipantGoals();

  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [notice, setNotice] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [justSavedGoal, setJustSavedGoal] = useState<ParticipantGoal | null>(null);

  const canCreate = Boolean(participant && participation);
  const selectedArea = useMemo(() => getGoalArea(draft.areaId), [draft.areaId]);
  const selectedPreset = useMemo(
    () => getGoalPreset(draft.areaId, draft.presetId),
    [draft.areaId, draft.presetId],
  );
  const currentGoals = useMemo(
    () => activeGoals.filter((goal) => goal.progress_status !== "completed"),
    [activeGoals],
  );
  const pastGoals = useMemo(
    () => [
      ...activeGoals.filter((goal) => goal.progress_status === "completed"),
      ...archivedGoals,
    ],
    [activeGoals, archivedGoals],
  );

  function resetCreation() {
    setDraft(emptyDraft);
    setStep(1);
    setShowCreate(false);
    setNotice("");
  }

  function beginCreation() {
    setShowCreate(true);
    setStep(1);
    setDraft(emptyDraft);
    setNotice("");
    setJustSavedGoal(null);
  }

  function chooseArea(areaId: string) {
    const area = getGoalArea(areaId);
    setDraft({
      ...emptyDraft,
      areaId,
      goalArea: area?.label ?? "",
    });
    setStep(2);
  }

  function choosePreset(presetId: string) {
    const preset = getGoalPreset(draft.areaId, presetId);
    if (!preset) return;
    setDraft((current) => ({
      ...current,
      presetId,
      title: preset.title,
      nextStep: "",
    }));
    setStep(3);
  }

  function chooseNextStep(nextStep: string) {
    setDraft((current) => ({ ...current, nextStep }));
    setStep(5);
  }

  async function saveGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    if (!draft.title.trim() || !draft.nextStep.trim()) {
      setNotice("Add your Goal and one next step before saving.");
      return;
    }

    const result = await createGoal({
      title: draft.title,
      whyItMatters: draft.why,
      nextStep: draft.nextStep,
      goalArea: draft.goalArea,
    });

    if (!result.ok) {
      setNotice(result.message);
      return;
    }

    setJustSavedGoal(result.row);
    setNotice("");
    setDraft(emptyDraft);
    setStep(1);
    setShowCreate(false);
  }

  async function changeStatus(
    goal: ParticipantGoal,
    status: Exclude<GoalProgressStatus, "archived">,
  ) {
    const result = await updateGoal(goal.id, { progress_status: status });

    if (!result.ok) {
      setNotice(result.message);
      return;
    }

    if (justSavedGoal?.id === result.row.id) {
      setJustSavedGoal(result.row);
    }

    if (status === "completed") {
      setNotice("Goal marked complete.");
      setShowHistory(true);
      return;
    }

    setNotice(`Goal updated: ${statusLabels[status]}.`);
  }

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#e8f0eb] px-3 pb-28 pt-3 text-slate-950 sm:px-6 sm:pb-32 sm:pt-6">
        <section className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
          <header className="relative min-h-[430px] overflow-hidden rounded-[2.5rem] bg-[#264c43] text-white shadow-[0_28px_90px_rgba(32,59,56,0.24)] sm:min-h-[500px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(241,190,128,0.56),transparent_18%),radial-gradient(circle_at_60%_34%,rgba(241,222,190,0.2),transparent_25%),linear-gradient(155deg,#91a9a0_0%,#6f9184_24%,#486e63_47%,#31574d_70%,#25463f_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(145deg,transparent_0%,transparent_21%,rgba(58,89,80,0.85)_22%,rgba(43,74,67,0.97)_52%,rgba(34,61,56,1)_100%)]" />
            <div className="absolute -left-[16%] top-[35%] h-48 w-[70%] rotate-[-8deg] rounded-[50%] bg-slate-900/10 blur-sm" />
            <div className="absolute -right-[16%] top-[40%] h-44 w-[58%] rotate-[7deg] rounded-[50%] bg-emerald-950/18 blur-sm" />

            <div className="relative flex min-h-[430px] flex-col p-5 sm:min-h-[500px] sm:p-8 lg:p-10">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-lg font-black ring-1 ring-white/20 backdrop-blur">
                    T
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-50/70">
                      DSS Enterprises
                    </p>
                    <p className="text-sm font-black tracking-wide text-white">THRIVE</p>
                  </div>
                </Link>

                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-white/90 backdrop-blur">
                  Goals
                </span>
              </div>

              <div className="mt-auto max-w-3xl pb-6 sm:pb-8">
                <p className="font-serif text-2xl text-amber-50/90 sm:text-3xl">
                  Something to move toward.
                </p>
                <h1 className="mt-2 font-serif text-5xl font-semibold tracking-tight text-white sm:text-7xl">
                  What matters next, {participantName}?
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-50/90 sm:text-xl">
                  Start with one thing.
                </p>
              </div>
            </div>
          </header>

          {loading ? (
            <section className="rounded-[2rem] bg-white p-6 shadow-sm">Loading your Goals.</section>
          ) : null}

          {errorMessage ? (
            <section role="alert" className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6">
              <p className="font-black">Your Goals could not be loaded.</p>
              <p className="mt-2 text-sm">{errorMessage}</p>
            </section>
          ) : null}

          {!loading && !errorMessage && canCreate ? (
            <>
              {justSavedGoal ? (
                <section role="status" className="overflow-hidden rounded-[2rem] border border-[#bfd0c9] bg-white shadow-sm">
                  <div className="bg-gradient-to-br from-[#365a52] via-[#2f514a] to-[#28443f] p-6 text-white sm:p-8">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-100/80">
                      Goal saved
                    </p>
                    <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
                      It&apos;s saved.
                    </h2>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-emerald-50/85">
                      You can come back to it anytime.
                    </p>
                  </div>

                  <div className="p-6 sm:p-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Your Goal</p>
                    <p className="mt-2 font-serif text-3xl font-semibold text-slate-950">{justSavedGoal.title}</p>

                    <div className="mt-5 rounded-2xl bg-emerald-50 p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-800">First step</p>
                      <p className="mt-2 text-lg font-black text-slate-950">{justSavedGoal.next_step}</p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      {justSavedGoal.progress_status === "not_started" ? (
                        <button
                          type="button"
                          disabled={working}
                          onClick={() => void changeStatus(justSavedGoal, "in_progress")}
                          className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white transition hover:bg-emerald-800 disabled:opacity-60"
                        >
                          Start this Goal
                        </button>
                      ) : null}

                      <Link
                        href="/"
                        className="rounded-2xl bg-[#365a52] px-5 py-3 font-black text-white transition hover:bg-[#2e4f48]"
                      >
                        Finish for now
                      </Link>

                      <button
                        type="button"
                        onClick={() => setJustSavedGoal(null)}
                        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-600 transition hover:bg-slate-50"
                      >
                        View my Goals
                      </button>
                    </div>
                  </div>
                </section>
              ) : null}

              {!justSavedGoal && currentGoals.length > 0 ? (
                <section className="space-y-4">
                  <div className="px-1">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Right now</p>
                    <h2 className="mt-2 font-serif text-3xl font-semibold text-slate-950">What you already have moving.</h2>
                  </div>
                  {currentGoals.map((goal) => (
                    <ActiveGoalCard
                      key={goal.id}
                      goal={goal}
                      working={working}
                      onStatusChange={changeStatus}
                    />
                  ))}
                </section>
              ) : null}

              {!justSavedGoal && currentGoals.length === 0 && !showCreate ? (
                <section className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Start here</p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold">Want to make a Goal?</h2>
                  <button
                    type="button"
                    onClick={beginCreation}
                    className="mt-6 rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white transition hover:bg-emerald-800"
                  >
                    Start a Goal
                  </button>
                </section>
              ) : null}

              {!justSavedGoal && currentGoals.length > 0 && !showCreate ? (
                <button
                  type="button"
                  onClick={beginCreation}
                  className="w-full rounded-[2rem] border border-emerald-100 bg-white p-5 text-left font-black text-emerald-900 shadow-sm transition hover:bg-emerald-50"
                >
                  + Start another Goal
                </button>
              ) : null}

              {!justSavedGoal && showCreate ? (
                <form onSubmit={saveGoal} className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-8">
                  <div className="sticky top-3 z-20 -mx-1 flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:mx-0">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Your Goal</p>
                      <p className="mt-1 text-sm font-bold text-slate-500">Step {step} of 5</p>
                    </div>
                    <button
                      type="button"
                      onClick={resetCreation}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>

                  {step === 1 ? (
                    <div className="mt-6">
                      <h2 className="font-serif text-3xl font-semibold">What do you want to work on?</h2>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        {goalAreas.map((area) => {
                          const visual = goalAreaVisuals[area.id] ?? { symbol: "•", label: area.label };
                          return (
                            <button
                              key={area.id}
                              type="button"
                              onClick={() => chooseArea(area.id)}
                              className="flex min-h-32 flex-col items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white p-4 text-center transition hover:border-emerald-300 hover:bg-emerald-50/50"
                            >
                              <span className="text-3xl leading-none">{visual.symbol}</span>
                              <span className="mt-3 text-base font-black text-slate-950">{visual.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {step === 2 && selectedArea ? (
                    <div className="mt-6">
                      <button type="button" onClick={() => setStep(1)} className="text-sm font-black text-slate-600">Back</button>
                      <h2 className="mt-4 font-serif text-3xl font-semibold">Where would you like to start?</h2>

                      {selectedArea.presets.length > 0 ? (
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          {selectedArea.presets.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => choosePreset(preset.id)}
                              className="rounded-2xl border border-slate-200 bg-white p-5 text-left font-black transition hover:border-emerald-300 hover:bg-emerald-50/50"
                            >
                              {preset.title}
                            </button>
                          ))}
                        </div>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => {
                          setDraft((current) => ({ ...current, presetId: "", title: "" }));
                          setStep(3);
                        }}
                        className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 font-black text-emerald-900"
                      >
                        Write my own Goal
                      </button>
                    </div>
                  ) : null}

                  {step === 3 ? (
                    <div className="mt-6">
                      <button type="button" onClick={() => setStep(2)} className="text-sm font-black text-slate-600">Back</button>
                      <h2 className="mt-4 font-serif text-3xl font-semibold">Put the Goal in your words.</h2>

                      <label className="mt-5 block text-sm font-black">
                        Your Goal
                        <input
                          value={draft.title}
                          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                          maxLength={180}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                          placeholder="What do you want to work toward?"
                        />
                      </label>

                      <label className="mt-5 block text-sm font-black">
                        Why does this matter to you? <span className="font-normal text-slate-400">Optional</span>
                        <textarea
                          value={draft.why}
                          onChange={(event) => setDraft((current) => ({ ...current, why: event.target.value }))}
                          maxLength={500}
                          rows={3}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                          placeholder="Anything you want to remember"
                        />
                      </label>

                      <button
                        type="button"
                        disabled={!draft.title.trim()}
                        onClick={() => setStep(4)}
                        className="mt-5 rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-40"
                      >
                        Continue
                      </button>
                    </div>
                  ) : null}

                  {step === 4 ? (
                    <div className="mt-6">
                      <button type="button" onClick={() => setStep(3)} className="text-sm font-black text-slate-600">Back</button>
                      <h2 className="mt-4 font-serif text-3xl font-semibold">What is one small step?</h2>

                      {selectedPreset ? (
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          {selectedPreset.nextSteps
                            .filter((value) => value !== "Write my own next step")
                            .map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => chooseNextStep(value)}
                                className="rounded-2xl border border-slate-200 bg-white p-5 text-left font-black transition hover:border-emerald-300 hover:bg-emerald-50/50"
                              >
                                {value}
                              </button>
                            ))}
                        </div>
                      ) : null}

                      <label className="mt-5 block text-sm font-black">
                        My own next step
                        <input
                          value={draft.nextStep}
                          onChange={(event) => setDraft((current) => ({ ...current, nextStep: event.target.value }))}
                          maxLength={240}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                          placeholder="One small thing you want to try"
                        />
                      </label>

                      <button
                        type="button"
                        disabled={!draft.nextStep.trim()}
                        onClick={() => setStep(5)}
                        className="mt-5 rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-40"
                      >
                        Review my Goal
                      </button>
                    </div>
                  ) : null}

                  {step === 5 ? (
                    <div className="mt-6">
                      <button type="button" onClick={() => setStep(4)} className="text-sm font-black text-slate-600">Back</button>
                      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Before you save</p>
                      <h2 className="mt-2 font-serif text-3xl font-semibold">Does this look right?</h2>
                      <p className="mt-2 text-sm text-slate-500">Nothing is saved until you choose Save Goal.</p>

                      <div className="mt-5 grid gap-4">
                        <div className="rounded-2xl bg-slate-50 p-5">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Goal</p>
                          <p className="mt-2 text-lg font-black">{draft.title || "Not added yet"}</p>
                        </div>
                        {draft.why.trim() ? (
                          <div className="rounded-2xl bg-[#f7f2ea] p-5">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9b613f]">Why it matters to you</p>
                            <p className="mt-2 font-serif text-xl leading-8 text-slate-800">{draft.why}</p>
                          </div>
                        ) : null}
                        <div className="rounded-2xl bg-emerald-50 p-5">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-800">First step</p>
                          <p className="mt-2 text-lg font-black">{draft.nextStep || "Not added yet"}</p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={working || !draft.title.trim() || !draft.nextStep.trim()}
                          className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white disabled:opacity-40"
                        >
                          {working ? "Saving..." : "Save Goal"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-black"
                        >
                          Change something
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {notice ? <p className="mt-5 text-sm font-semibold text-rose-700">{notice}</p> : null}
                </form>
              ) : null}

              {notice && !showCreate && !justSavedGoal ? (
                <section role="status" className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
                  <p className="font-black text-emerald-900">{notice}</p>
                </section>
              ) : null}

              {!justSavedGoal ? (
                <section className="rounded-[2rem] bg-white p-6 shadow-sm">
                  <button
                    type="button"
                    aria-expanded={showHistory}
                    onClick={() => setShowHistory((current) => !current)}
                    className="font-black text-emerald-900"
                  >
                    {showHistory ? "Hide past Goals" : `Look back at past Goals (${pastGoals.length})`}
                  </button>

                  {showHistory ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {pastGoals.length === 0 ? (
                        <p className="text-sm text-slate-600">No past Goals are recorded.</p>
                      ) : (
                        pastGoals.map((goal) => (
                          <article key={goal.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{goal.goal_area ?? "Past Goal"}</p>
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">
                                {statusLabels[goal.progress_status]}
                              </span>
                            </div>
                            <h3 className="mt-2 text-lg font-black">{goal.title}</h3>
                            {goal.why_it_matters ? (
                              <p className="mt-3 text-sm leading-6 text-slate-600">{goal.why_it_matters}</p>
                            ) : null}
                            <p className="mt-3 text-sm text-slate-600">Next step: {goal.next_step}</p>
                          </article>
                        ))
                      )}
                    </div>
                  ) : null}
                </section>
              ) : null}
            </>
          ) : null}

          <details className="rounded-[2rem] border border-emerald-100 bg-white shadow-sm">
            <summary className="cursor-pointer list-none p-6 font-black text-emerald-900 sm:p-7">
              About your Goals
            </summary>
            <p className="border-t border-slate-100 px-6 pb-6 pt-5 text-sm leading-7 text-slate-600 sm:px-7 sm:pb-7">
              Your Goals belong to you. THRIVE can offer starting points and keep a next step visible, but it does not decide what you should work on or turn a Goal into an obligation.
            </p>
          </details>
        </section>

        <GoalsBottomNav />
      </main>
    </AuthGate>
  );
}