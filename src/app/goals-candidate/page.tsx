"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";
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
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">
              {goal.goal_area ?? "Your Goal"}
            </p>
            <h3 className="mt-3 text-2xl font-black sm:text-3xl">{goal.title}</h3>
          </div>
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-emerald-50 ring-1 ring-white/15">
            {statusLabels[goal.progress_status]}
          </span>
        </div>

        <div className="mt-6 rounded-2xl bg-white/10 p-5 ring-1 ring-white/10">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-200">
            Your next step
          </p>
          <p className="mt-2 text-xl font-black">{goal.next_step}</p>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {goal.why_it_matters ? (
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              What you wanted to be different
            </p>
            <p className="mt-2 leading-7 text-slate-700">{goal.why_it_matters}</p>
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
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Pause for now
                </button>
                <button
                  type="button"
                  disabled={working}
                  onClick={() => void onStatusChange(goal, "completed")}
                  className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 font-black text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-60"
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
      <main className="min-h-screen bg-[#eef4ef] px-4 py-5 text-slate-950 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <ThriveSidebar />

          <section className="space-y-6">
            <header className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 p-6 text-white shadow-sm sm:p-8 lg:p-10">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
                Goals
              </p>
              <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
                What would you like to work toward, {participantName}?
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50/85 sm:text-lg">
                Start with one thing that matters to you. We&apos;ll take it one step at a time.
              </p>
            </header>

            {loading ? (
              <section className="rounded-3xl bg-white p-6 shadow-sm">Loading your Goals.</section>
            ) : null}

            {errorMessage ? (
              <section role="alert" className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
                <p className="font-black">Your Goals could not be loaded.</p>
                <p className="mt-2 text-sm">{errorMessage}</p>
              </section>
            ) : null}

            {!loading && !errorMessage && canCreate ? (
              <>
                {justSavedGoal ? (
                  <section role="status" className="overflow-hidden rounded-[2rem] border border-emerald-200 bg-white shadow-sm">
                    <div className="bg-emerald-50 p-6 sm:p-8">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">
                        Goal saved
                      </p>
                      <h2 className="mt-3 text-3xl font-black text-slate-950">
                        It&apos;s saved. You can come back to it anytime.
                      </h2>
                      <p className="mt-3 max-w-2xl leading-7 text-slate-700">
                        Nothing else is required right now.
                      </p>
                    </div>

                    <div className="p-6 sm:p-8">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">Your Goal</p>
                      <p className="mt-2 text-2xl font-black text-slate-950">{justSavedGoal.title}</p>

                      <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                        <p className="text-xs font-black uppercase tracking-wide text-emerald-800">First step</p>
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
                          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-800 transition hover:bg-slate-50"
                        >
                          Back to Today
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
                      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Right now</p>
                      <h2 className="mt-2 text-2xl font-black">Here&apos;s what you already have moving.</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Pick up a next step when you want to, or leave it here for later.
                      </p>
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
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Start here</p>
                    <h2 className="mt-2 text-2xl font-black">Want to make a Goal?</h2>
                    <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                      Choose one area and THRIVE will help you turn it into one clear next step.
                    </p>
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
                    className="w-full rounded-3xl border border-emerald-200 bg-white p-5 text-left font-black text-emerald-900 shadow-sm transition hover:bg-emerald-50"
                  >
                    Start another Goal
                  </button>
                ) : null}

                {!justSavedGoal && showCreate ? (
                  <form onSubmit={saveGoal} className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Your Goal</p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">Step {step} of 5</p>
                      </div>
                      <button
                        type="button"
                        onClick={resetCreation}
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-2 font-black"
                      >
                        Cancel
                      </button>
                    </div>

                    {step === 1 ? (
                      <div className="mt-6">
                        <h2 className="text-2xl font-black">What do you want to work on?</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">Choose the area that feels closest. You can change the wording later.</p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          {goalAreas.map((area) => (
                            <button
                              key={area.id}
                              type="button"
                              onClick={() => chooseArea(area.id)}
                              className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
                            >
                              <span className="font-black">{area.label}</span>
                              <span className="mt-2 block text-sm leading-6 text-slate-600">{area.description}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {step === 2 && selectedArea ? (
                      <div className="mt-6">
                        <button type="button" onClick={() => setStep(1)} className="text-sm font-black text-slate-600">Back</button>
                        <h2 className="mt-4 text-2xl font-black">Where would you like to start?</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">Choose a starting point or write your own. These are suggestions, not assignments.</p>

                        {selectedArea.presets.length > 0 ? (
                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {selectedArea.presets.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => choosePreset(preset.id)}
                                className="rounded-2xl border border-slate-200 bg-white p-5 text-left font-black transition hover:border-emerald-300 hover:bg-emerald-50/40"
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
                          className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 font-black text-emerald-900"
                        >
                          Write my own Goal
                        </button>
                      </div>
                    ) : null}

                    {step === 3 ? (
                      <div className="mt-6">
                        <button type="button" onClick={() => setStep(2)} className="text-sm font-black text-slate-600">Back</button>
                        <h2 className="mt-4 text-2xl font-black">Put the Goal in your words</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">Make it sound like something you would actually say.</p>
                        <label className="mt-5 block text-sm font-black">
                          Your Goal
                          <input
                            value={draft.title}
                            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                            maxLength={180}
                            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal"
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
                            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal"
                            placeholder="Anything you want to remember about why you chose this"
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
                        <h2 className="mt-4 text-2xl font-black">What is one small step you want to try first?</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">Choose one or write your own. You can change it before saving.</p>

                        {selectedPreset ? (
                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {selectedPreset.nextSteps.filter((value) => value !== "Write my own next step").map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => chooseNextStep(value)}
                                className="rounded-2xl border border-slate-200 bg-white p-5 text-left font-black transition hover:border-emerald-300 hover:bg-emerald-50/40"
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
                            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal"
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
                        <p className="mt-4 text-xs font-black uppercase tracking-wide text-emerald-700">Before you save</p>
                        <h2 className="mt-2 text-2xl font-black">Does this look right to you?</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">Nothing is saved until you choose Save Goal below.</p>

                        <div className="mt-5 grid gap-4">
                          <div className="rounded-2xl bg-slate-50 p-5">
                            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Goal</p>
                            <p className="mt-2 text-lg font-black">{draft.title || "Not added yet"}</p>
                          </div>
                          {draft.why.trim() ? (
                            <div className="rounded-2xl bg-slate-50 p-5">
                              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Why it matters to you</p>
                              <p className="mt-2 leading-7 text-slate-700">{draft.why}</p>
                            </div>
                          ) : null}
                          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                            <p className="text-xs font-black uppercase tracking-wide text-emerald-800">First step</p>
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
                          <button type="button" onClick={() => setStep(3)} className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-black">
                            Change something
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {notice ? <p className="mt-5 text-sm font-semibold text-rose-700">{notice}</p> : null}
                  </form>
                ) : null}

                {notice && !showCreate && !justSavedGoal ? (
                  <section role="status" className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
                    <p className="font-black text-emerald-900">{notice}</p>
                  </section>
                ) : null}

                {!justSavedGoal ? (
                  <section className="rounded-3xl bg-white p-6 shadow-sm">
                    <button
                      type="button"
                      aria-expanded={showHistory}
                      onClick={() => setShowHistory((current) => !current)}
                      className="font-black text-emerald-900"
                    >
                      {showHistory ? "Hide past Goals" : `Look back at past Goals (${pastGoals.length})`}
                    </button>

                    {showHistory ? (
                      <div className="mt-5 space-y-4">
                        {pastGoals.length === 0 ? (
                          <p className="text-sm text-slate-600">No past Goals are recorded.</p>
                        ) : (
                          pastGoals.map((goal) => (
                            <article key={goal.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <p className="text-xs font-black uppercase tracking-wide text-slate-500">{goal.goal_area ?? "Past Goal"}</p>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">
                                  {statusLabels[goal.progress_status]}
                                </span>
                              </div>
                              <h3 className="mt-2 text-lg font-black">{goal.title}</h3>
                              {goal.why_it_matters ? (
                                <p className="mt-3 text-sm leading-6 text-slate-600"><span className="font-black text-slate-700">Why it mattered:</span> {goal.why_it_matters}</p>
                              ) : null}
                              <p className="mt-3 text-sm text-slate-600"><span className="font-black text-slate-700">Step you had chosen:</span> {goal.next_step}</p>
                            </article>
                          ))
                        )}
                      </div>
                    ) : null}
                  </section>
                ) : null}
              </>
            ) : null}

            <details className="rounded-3xl bg-slate-950 text-white">
              <summary className="cursor-pointer list-none p-6 font-black text-emerald-300">
                About your Goals
              </summary>
              <p className="px-6 pb-6 text-sm leading-6 text-slate-200">
                Your Goals belong to you. THRIVE can offer starting points and keep a next step visible, but it does not decide what you should work on, score your effort, or turn a Goal into an obligation.
              </p>
            </details>
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
