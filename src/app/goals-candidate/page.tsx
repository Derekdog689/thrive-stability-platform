"use client";

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
    <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
            {goal.goal_area ?? "Your Goal"}
          </p>
          <h3 className="mt-2 text-2xl font-black">{goal.title}</h3>
        </div>
        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-900">
          {statusLabels[goal.progress_status]}
        </span>
      </div>

      {goal.why_it_matters ? (
        <div className="mt-5 rounded-2xl bg-slate-50 p-5">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            What you wanted to be different
          </p>
          <p className="mt-2 leading-7 text-slate-700">{goal.why_it_matters}</p>
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
        <p className="text-xs font-black uppercase tracking-wide text-emerald-800">
          Your next step
        </p>
        <p className="mt-2 text-lg font-black">{goal.next_step}</p>
      </div>

      {goal.progress_status !== "archived" ? (
        <div className="mt-5 flex flex-wrap gap-3">
          {goal.progress_status === "not_started" ? (
            <button
              type="button"
              disabled={working}
              onClick={() => void onStatusChange(goal, "in_progress")}
              className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-60"
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
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black disabled:opacity-60"
              >
                Pause for now
              </button>
              <button
                type="button"
                disabled={working}
                onClick={() => void onStatusChange(goal, "completed")}
                className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 font-black text-emerald-900 disabled:opacity-60"
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
              className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-60"
            >
              Keep going with this Goal
            </button>
          ) : null}
        </div>
      ) : null}
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

  const canCreate = Boolean(participant && participation);
  const selectedArea = useMemo(() => getGoalArea(draft.areaId), [draft.areaId]);
  const selectedPreset = useMemo(
    () => getGoalPreset(draft.areaId, draft.presetId),
    [draft.areaId, draft.presetId],
  );

  function resetCreation() {
    setDraft(emptyDraft);
    setStep(1);
    setShowCreate(false);
    setNotice("");
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

    setNotice("Your Goal was saved. You can start it when you are ready.");
    setDraft(emptyDraft);
    setStep(1);
    setShowCreate(false);
  }

  async function changeStatus(
    goal: ParticipantGoal,
    status: Exclude<GoalProgressStatus, "archived">,
  ) {
    const result = await updateGoal(goal.id, { progress_status: status });
    setNotice(result.ok ? `Goal updated: ${statusLabels[status]}.` : result.message);
  }

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eef4ef] px-4 py-5 text-slate-950 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <ThriveSidebar />

          <section className="space-y-6">
            <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Goals candidate
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                What do you want to move forward?
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                A Goal can start small. THRIVE can help you shape one step at a time, and every saved word stays yours.
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
                <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-800">Your Goals</p>
                  <h2 className="mt-2 text-2xl font-black">Welcome, {participantName}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    You can continue something you already started, pause it, finish it, or create something new.
                  </p>
                </section>

                {activeGoals.length > 0 ? (
                  <section className="space-y-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Right now</p>
                      <h2 className="mt-2 text-2xl font-black">Keep one next step visible</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        You do not have to work on every Goal today.
                      </p>
                    </div>
                    {activeGoals.map((goal) => (
                      <ActiveGoalCard
                        key={goal.id}
                        goal={goal}
                        working={working}
                        onStatusChange={changeStatus}
                      />
                    ))}
                  </section>
                ) : (
                  <section className="rounded-3xl bg-white p-6 shadow-sm">
                    <p className="font-black">No active Goals right now.</p>
                    <p className="mt-2 text-sm text-slate-600">That is okay. Create one only if something feels worth working toward.</p>
                  </section>
                )}

                {!showCreate ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreate(true);
                      setStep(1);
                      setDraft(emptyDraft);
                      setNotice("");
                    }}
                    className="w-full rounded-3xl border border-emerald-200 bg-white p-5 text-left font-black text-emerald-900 shadow-sm"
                  >
                    {activeGoals.length > 0 ? "Start another Goal" : "Start a Goal"}
                  </button>
                ) : (
                  <form onSubmit={saveGoal} className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Guided Goal</p>
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
                        <p className="mt-2 text-sm leading-6 text-slate-600">Pick the closest area. This only helps narrow the choices.</p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          {goalAreas.map((area) => (
                            <button
                              key={area.id}
                              type="button"
                              onClick={() => chooseArea(area.id)}
                              className="rounded-2xl border border-slate-200 bg-white p-5 text-left hover:border-emerald-300"
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
                        <p className="mt-2 text-sm leading-6 text-slate-600">These are starting points, not assignments. Choose one to edit, or write your own.</p>

                        {selectedArea.presets.length > 0 ? (
                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {selectedArea.presets.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => choosePreset(preset.id)}
                                className="rounded-2xl border border-slate-200 bg-white p-5 text-left font-black hover:border-emerald-300"
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
                        <p className="mt-2 text-sm leading-6 text-slate-600">Change the starter until it sounds like something you would actually say.</p>
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
                          What would be different if this went well? <span className="font-normal text-slate-400">Optional</span>
                          <textarea
                            value={draft.why}
                            onChange={(event) => setDraft((current) => ({ ...current, why: event.target.value }))}
                            maxLength={500}
                            rows={3}
                            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal"
                            placeholder="Something you hope would feel, work, or look different"
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
                        <h2 className="mt-4 text-2xl font-black">What is one small thing you could try first?</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">Pick one that feels realistic. You can change it before saving.</p>

                        {selectedPreset ? (
                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {selectedPreset.nextSteps.filter((value) => value !== "Write my own next step").map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => chooseNextStep(value)}
                                className="rounded-2xl border border-slate-200 bg-white p-5 text-left font-black hover:border-emerald-300"
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
                            placeholder="One small thing you could try"
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
                        <p className="mt-4 text-xs font-black uppercase tracking-wide text-emerald-700">Your Goal</p>
                        <h2 className="mt-2 text-2xl font-black">Does this sound like what you meant?</h2>

                        <div className="mt-5 grid gap-4">
                          <div className="rounded-2xl bg-slate-50 p-5">
                            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Goal</p>
                            <p className="mt-2 text-lg font-black">{draft.title || "Not added yet"}</p>
                          </div>
                          {draft.why.trim() ? (
                            <div className="rounded-2xl bg-slate-50 p-5">
                              <p className="text-xs font-black uppercase tracking-wide text-slate-500">What you want to be different</p>
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

                    {notice ? <p className="mt-5 text-sm font-semibold text-slate-700">{notice}</p> : null}
                  </form>
                )}

                {notice && !showCreate ? (
                  <section role="status" className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
                    <p className="font-black text-emerald-900">{notice}</p>
                    <p className="mt-2 text-sm text-slate-700">Nothing else is required right now.</p>
                  </section>
                ) : null}

                <section className="rounded-3xl bg-white p-6 shadow-sm">
                  <button
                    type="button"
                    aria-expanded={showHistory}
                    onClick={() => setShowHistory((current) => !current)}
                    className="font-black text-emerald-900"
                  >
                    {showHistory ? "Hide past Goals" : `Look back at past Goals (${archivedGoals.length})`}
                  </button>

                  {showHistory ? (
                    <div className="mt-5 space-y-4">
                      {archivedGoals.length === 0 ? (
                        <p className="text-sm text-slate-600">No past Goals are recorded.</p>
                      ) : (
                        archivedGoals.map((goal) => (
                          <article key={goal.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                            <p className="text-xs font-black uppercase tracking-wide text-slate-500">{goal.goal_area ?? "Past Goal"}</p>
                            <h3 className="mt-2 text-lg font-black">{goal.title}</h3>
                            <p className="mt-3 text-sm text-slate-600"><span className="font-black text-slate-700">Step you had chosen:</span> {goal.next_step}</p>
                          </article>
                        ))
                      )}
                    </div>
                  ) : null}
                </section>
              </>
            ) : null}

            <section className="rounded-3xl bg-slate-950 p-6 text-white">
              <p className="font-black text-emerald-300">Participant-owned Goal boundary</p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                THRIVE can offer starting points and help keep a next step visible. It does not decide what you should work on, score your effort, or turn a Goal into an obligation.
              </p>
            </section>
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
