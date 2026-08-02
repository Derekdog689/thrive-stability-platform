"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";
import {
  GoalDraft,
  GoalProgressStatus,
  ParticipantGoal,
  useParticipantGoals,
} from "./useParticipantGoals";
import {
  getGoalArea,
  getGoalPreset,
  goalAreas,
} from "./goalPresets";

const progressOptions: Array<{
  value: Exclude<GoalProgressStatus, "archived" | "not_started">;
  label: string;
}> = [
  { value: "in_progress", label: "In progress" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

type GuidedDraft = GoalDraft & {
  selectedArea: string;
  selectedPresetId: string;
  selectedNextStep: string;
};

const emptyDraft: GuidedDraft = {
  selectedArea: "",
  selectedPresetId: "",
  selectedNextStep: "",
  title: "",
  whyItMatters: "",
  nextStep: "",
  goalArea: "",
};

function labelStatus(value: GoalProgressStatus) {
  return value
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function GoalCard({
  goal,
  working,
  onStatusChange,
  onArchive,
  onUpdateDetails,
}: {
  goal: ParticipantGoal;
  working: boolean;
  onStatusChange: (
    goal: ParticipantGoal,
    status: Exclude<GoalProgressStatus, "archived">,
  ) => Promise<void>;
  onArchive: (goal: ParticipantGoal) => Promise<void>;
  onUpdateDetails: (
    goal: ParticipantGoal,
    draft: GoalDraft,
  ) => Promise<{ ok: boolean; message: string }>;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);
  const [editDraft, setEditDraft] = useState<GoalDraft>({
    title: goal.title,
    whyItMatters: goal.why_it_matters ?? "",
    nextStep: goal.next_step,
    goalArea: goal.goal_area ?? "",
  });
  const [editMessage, setEditMessage] = useState("");
  const editButtonRef = useRef<HTMLButtonElement>(null);

  function resetDraft() {
    setEditDraft({
      title: goal.title,
      whyItMatters: goal.why_it_matters ?? "",
      nextStep: goal.next_step,
      goalArea: goal.goal_area ?? "",
    });
  }

  async function saveEdits(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEditMessage("");

    const result = await onUpdateDetails(goal, editDraft);
    setEditMessage(result.message);

    if (result.ok) {
      setEditing(false);
      requestAnimationFrame(() => editButtonRef.current?.focus());
    }
  }

  const editPanelId = `goal-edit-${goal.id}`;

  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
            {goal.goal_area ?? "Your goal"}
          </p>
          <h3 className="mt-2 text-2xl font-black" tabIndex={-1}>
            {goal.title}
          </h3>
        </div>
        <span
          aria-label={`Goal status: ${labelStatus(goal.progress_status)}`}
          className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-900"
        >
          {labelStatus(goal.progress_status)}
        </span>
      </div>

      {editing && goal.progress_status !== "archived" ? (
        <form
          id={editPanelId}
          aria-label={`Edit ${goal.title}`}
          onSubmit={saveEdits}
          className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5"
        >
          <p className="text-sm font-black text-emerald-900">Edit this Goal</p>

          <div className="mt-4 grid gap-4">
            <label className="text-sm font-black">
              Goal
              <input
                value={editDraft.title}
                onChange={(event) =>
                  setEditDraft((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                maxLength={180}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-black">
              Why does this matter to you?
              <textarea
                value={editDraft.whyItMatters}
                onChange={(event) =>
                  setEditDraft((current) => ({
                    ...current,
                    whyItMatters: event.target.value,
                  }))
                }
                maxLength={500}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-black">
              What is one next step?
              <input
                value={editDraft.nextStep}
                onChange={(event) =>
                  setEditDraft((current) => ({
                    ...current,
                    nextStep: event.target.value,
                  }))
                }
                maxLength={240}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
              />
            </label>

            <label className="text-sm font-black">
              Goal area
              <input
                value={editDraft.goalArea}
                onChange={(event) =>
                  setEditDraft((current) => ({
                    ...current,
                    goalArea: event.target.value,
                  }))
                }
                maxLength={120}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={working}
              className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-60"
            >
              {working ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              disabled={working}
              onClick={() => {
                resetDraft();
                setEditMessage("");
                setEditing(false);
                requestAnimationFrame(() => editButtonRef.current?.focus());
              }}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-700 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>

          {editMessage ? (
            <p role={editMessage.includes("updated") ? "status" : "alert"} className="mt-4 text-sm font-semibold text-slate-700">
              {editMessage}
            </p>
          ) : null}
        </form>
      ) : (
        <>
          {goal.why_it_matters ? (
            <div className="mt-5">
              <p className="text-sm font-black">Why this matters</p>
              <p className="mt-2 leading-7 text-slate-600">
                {goal.why_it_matters}
              </p>
            </div>
          ) : null}

          <div className="mt-5 rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-black">Next step</p>
            <p className="mt-2 leading-7 text-slate-700">{goal.next_step}</p>
          </div>
        </>
      )}

      {goal.progress_status !== "archived" && !editing ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-end gap-3">
            {goal.progress_status === "not_started" ? (
              <button
                type="button"
                disabled={working}
                onClick={() => void onStatusChange(goal, "in_progress")}
                className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white disabled:opacity-60"
              >
                {working ? "Starting..." : "Start Goal"}
              </button>
            ) : (
              <label className="min-w-52 flex-1 text-sm font-black">
                Progress
                <select
                  value={goal.progress_status}
                  disabled={working}
                  onChange={(event) =>
                    void onStatusChange(
                      goal,
                      event.target.value as Exclude<
                        GoalProgressStatus,
                        "archived" | "not_started"
                      >,
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold"
                >
                  {progressOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <button
              ref={editButtonRef}
              type="button"
              aria-expanded={editing}
              aria-controls={editPanelId}
              disabled={working}
              onClick={() => {
                resetDraft();
                setEditMessage("");
                setEditing(true);
              }}
              className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 font-black text-emerald-900 disabled:opacity-60"
            >
              Edit Goal
            </button>

            {!confirmingArchive ? (
              <button
                type="button"
                disabled={working}
                onClick={() => setConfirmingArchive(true)}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-700 disabled:opacity-60"
              >
                Archive Goal
              </button>
            ) : null}
          </div>

          {confirmingArchive ? (
            <div role="group" aria-label="Confirm archive" className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-black">Archive this Goal?</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                It will remain in your history, but you will not be able to reopen it here.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={working}
                  onClick={() => setConfirmingArchive(false)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 font-black"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={working}
                  onClick={() => void onArchive(goal)}
                  className="rounded-2xl bg-slate-900 px-4 py-2 font-black text-white disabled:opacity-60"
                >
                  {working ? "Archiving..." : "Archive Goal"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : goal.progress_status === "archived" ? (
        <p className="mt-5 text-sm leading-6 text-slate-500">
          Archived Goals remain available as part of your history and cannot be
          edited or reopened from the participant page.
        </p>
      ) : null}
    </article>
  );
}

export default function GoalsPage() {
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
    archiveGoal,
  } = useParticipantGoals();

  const [draft, setDraft] = useState<GuidedDraft>(emptyDraft);
  const [notice, setNotice] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createVisibilityInitialized, setCreateVisibilityInitialized] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [nextStepError, setNextStepError] = useState("");
  const customTitleRef = useRef<HTMLInputElement>(null);
  const customNextStepRef = useRef<HTMLInputElement>(null);

  const canCreate = useMemo(
    () => Boolean(participant && participation),
    [participant, participation],
  );

  useEffect(() => {
    if (loading || errorMessage || !canCreate || createVisibilityInitialized) {
      return;
    }

    setShowCreate(activeGoals.length === 0);
    setCreateVisibilityInitialized(true);
  }, [
    activeGoals.length,
    canCreate,
    createVisibilityInitialized,
    errorMessage,
    loading,
  ]);

  const selectedArea = getGoalArea(draft.selectedArea);
  const selectedPreset = getGoalPreset(
    draft.selectedArea,
    draft.selectedPresetId,
  );

  function replaceTextSafely(
    nextTitle: string,
    nextStep: string,
    apply: () => void,
  ) {
    const titleChanged =
      draft.title.trim() &&
      draft.title.trim() !== nextTitle.trim();
    const stepChanged =
      draft.nextStep.trim() &&
      draft.nextStep.trim() !== nextStep.trim();

    if (
      (titleChanged || stepChanged) &&
      !window.confirm(
        "Use the new starter? Your current Goal wording or next step will be replaced.",
      )
    ) {
      return;
    }

    apply();
  }

  function handleAreaChange(areaId: string) {
    const area = getGoalArea(areaId);
    replaceTextSafely("", "", () => {
      setDraft((current) => ({
        ...current,
        selectedArea: areaId,
        selectedPresetId: "",
        selectedNextStep: "",
        title: "",
        nextStep: "",
        goalArea: area?.label ?? "",
      }));
      setTitleError("");
      setNextStepError("");
      if (areaId === "other") {
        requestAnimationFrame(() => customTitleRef.current?.focus());
      }
    });
  }

  function handlePresetChange(presetId: string) {
    const preset = getGoalPreset(draft.selectedArea, presetId);
    if (!preset) {
      return;
    }

    replaceTextSafely(preset.title, "", () => {
      setDraft((current) => ({
        ...current,
        selectedPresetId: presetId,
        selectedNextStep: "",
        title: preset.title,
        nextStep: "",
      }));
      setTitleError("");
      setNextStepError("");
    });
  }

  function handleSuggestedNextStep(value: string) {
    if (value === "Write my own next step") {
      setDraft((current) => ({
        ...current,
        selectedNextStep: value,
        nextStep: "",
      }));
      requestAnimationFrame(() => customNextStepRef.current?.focus());
      return;
    }

    replaceTextSafely(draft.title, value, () => {
      setDraft((current) => ({
        ...current,
        selectedNextStep: value,
        nextStep: value,
      }));
      setNextStepError("");
    });
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setTitleError("");
    setNextStepError("");

    const title = draft.title.trim();
    const nextStep = draft.nextStep.trim();

    if (!title) {
      setTitleError("Add a Goal title before saving.");
    }
    if (!nextStep) {
      setNextStepError("Add one next step before saving.");
    }
    if (!title || !nextStep) {
      return;
    }

    const result = await createGoal({
      title,
      whyItMatters: draft.whyItMatters,
      nextStep,
      goalArea: draft.goalArea,
    });

    if (!result.ok) {
      setNotice(result.message);
      return;
    }

    setDraft(emptyDraft);
    setNotice("Your Goal was saved.");
    setShowCreate(false);
  }

  async function handleStatusChange(
    goal: ParticipantGoal,
    progressStatus: Exclude<GoalProgressStatus, "archived">,
  ) {
    setNotice("");
    const result = await updateGoal(goal.id, {
      progress_status: progressStatus,
    });
    setNotice(result.ok ? "Progress updated." : result.message);
  }

  async function handleUpdateDetails(
    goal: ParticipantGoal,
    editDraft: GoalDraft,
  ) {
    const title = editDraft.title.trim();
    const nextStep = editDraft.nextStep.trim();

    if (!title || !nextStep) {
      return {
        ok: false,
        message: "Add a Goal title and one next step before saving.",
      };
    }

    const result = await updateGoal(goal.id, {
      title,
      why_it_matters: editDraft.whyItMatters.trim() || null,
      next_step: nextStep,
      goal_area: editDraft.goalArea.trim() || null,
    });

    return {
      ok: result.ok,
      message: result.ok ? "Goal details updated." : result.message,
    };
  }

  async function handleArchive(goal: ParticipantGoal) {
    setNotice("");
    const result = await archiveGoal(goal.id);
    setNotice(result.ok ? "Goal archived." : result.message);
  }

  const createPanelId = "guided-goal-creation";
  const archivedPanelId = "archived-goals-panel";

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eef4ef] px-4 py-5 text-slate-950 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <ThriveSidebar />

          <section className="space-y-6">
            <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Goals
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Turn what matters into one manageable step.
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                Choose a helpful starting point, change it into your own words,
                and keep one useful next step visible.
              </p>
            </header>

            {loading ? (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                Loading your Goals.
              </section>
            ) : null}

            {errorMessage ? (
              <section role="alert" className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
                <p className="font-black">Your Goals could not be loaded.</p>
                <p className="mt-2 text-sm">{errorMessage}</p>
              </section>
            ) : null}

            {!loading && !errorMessage && !canCreate ? (
              <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                  Goal status
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  No active participant program is connected yet
                </h2>
                <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                  Goals become available when your account is connected to an
                  active THRIVE program.
                </p>
              </section>
            ) : null}

            {!loading && !errorMessage && canCreate ? (
              <>
                <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-800">
                    Your Goals
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    Welcome, {participantName}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    These Goals belong to you. Presets are only starting points,
                    and you can change every saved word.
                  </p>
                </section>

                {showCreate ? (
                  <form
                    id={createPanelId}
                    onSubmit={handleCreate}
                    className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"
                  >
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      Guided Goal creation
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      What would you like to work on?
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Choose a starting point, then change the wording until it
                      sounds right to you.
                    </p>

                    <div className="mt-6 grid gap-6">
                      <label className="text-sm font-black">
                        1. Choose a Goal area
                        <select
                          value={draft.selectedArea}
                          onChange={(event) => handleAreaChange(event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
                        >
                          <option value="">Choose an area</option>
                          {goalAreas.map((area) => (
                            <option key={area.id} value={area.id}>
                              {area.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      {selectedArea ? (
                        <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                          {selectedArea.description}
                        </p>
                      ) : null}

                      {selectedArea && selectedArea.id !== "other" ? (
                        <label className="text-sm font-black">
                          2. Choose a starting point
                          <select
                            value={draft.selectedPresetId}
                            onChange={(event) => handlePresetChange(event.target.value)}
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
                          >
                            <option value="">Choose a Goal starter</option>
                            {selectedArea.presets.map((preset) => (
                              <option key={preset.id} value={preset.id}>
                                {preset.title}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}

                      <label className="text-sm font-black">
                        Goal in your own words
                        <span className="mt-1 block text-xs font-normal text-slate-500">
                          This is only a starting point. Change it so it sounds
                          right to you.
                        </span>
                        <input
                          ref={customTitleRef}
                          value={draft.title}
                          onChange={(event) => {
                            setDraft((current) => ({
                              ...current,
                              title: event.target.value,
                            }));
                            setTitleError("");
                          }}
                          aria-invalid={Boolean(titleError)}
                          aria-describedby={titleError ? "goal-title-error" : undefined}
                          maxLength={180}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal"
                          placeholder="Write your Goal in your own words"
                        />
                      </label>
                      {titleError ? (
                        <p id="goal-title-error" role="alert" className="-mt-4 text-sm font-semibold text-rose-700">
                          {titleError}
                        </p>
                      ) : null}

                      <label className="text-sm font-black">
                        Why does this matter to you?
                        <span className="mt-1 block text-xs font-normal text-slate-500">
                          Optional. THRIVE will not guess or fill this in for you.
                        </span>
                        <textarea
                          value={draft.whyItMatters}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              whyItMatters: event.target.value,
                            }))
                          }
                          maxLength={500}
                          rows={3}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal"
                        />
                      </label>

                      {selectedPreset ? (
                        <label className="text-sm font-black">
                          3. Choose a suggested next step
                          <select
                            value={draft.selectedNextStep}
                            onChange={(event) =>
                              handleSuggestedNextStep(event.target.value)
                            }
                            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
                          >
                            <option value="">Choose one small action</option>
                            {selectedPreset.nextSteps.map((step) => (
                              <option key={step} value={step}>
                                {step}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}

                      <label className="text-sm font-black">
                        Next step in your own words
                        <span className="mt-1 block text-xs font-normal text-slate-500">
                          Choose one manageable action. You can change the wording.
                        </span>
                        <input
                          ref={customNextStepRef}
                          value={draft.nextStep}
                          onChange={(event) => {
                            setDraft((current) => ({
                              ...current,
                              nextStep: event.target.value,
                            }));
                            setNextStepError("");
                          }}
                          aria-invalid={Boolean(nextStepError)}
                          aria-describedby={nextStepError ? "goal-step-error" : undefined}
                          maxLength={240}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal"
                          placeholder="Write one next step"
                        />
                      </label>
                      {nextStepError ? (
                        <p id="goal-step-error" role="alert" className="-mt-4 text-sm font-semibold text-rose-700">
                          {nextStepError}
                        </p>
                      ) : null}

                      <section aria-label="Review your Goal" className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                        <p className="text-sm font-black text-emerald-900">
                          Review before saving
                        </p>
                        <dl className="mt-4 grid gap-4 text-sm">
                          <div>
                            <dt className="font-black">Your Goal</dt>
                            <dd className="mt-1 text-slate-700">
                              {draft.title.trim() || "Not added yet"}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-black">Why it matters</dt>
                            <dd className="mt-1 text-slate-700">
                              {draft.whyItMatters.trim() || "Not added"}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-black">Your next step</dt>
                            <dd className="mt-1 text-slate-700">
                              {draft.nextStep.trim() || "Not added yet"}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-black">Goal area</dt>
                            <dd className="mt-1 text-slate-700">
                              {draft.goalArea || "Not selected"}
                            </dd>
                          </div>
                        </dl>
                      </section>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={working}
                        className="rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white disabled:opacity-60"
                      >
                        {working ? "Saving..." : "Save Goal"}
                      </button>

                      {activeGoals.length > 0 ? (
                        <button
                          type="button"
                          disabled={working}
                          onClick={() => {
                            setDraft(emptyDraft);
                            setTitleError("");
                            setNextStepError("");
                            setNotice("");
                            setShowCreate(false);
                          }}
                          className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-black text-slate-700 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>

                    {notice ? (
                      <p
                        role={notice.includes("saved") || notice.includes("updated") || notice.includes("archived") ? "status" : "alert"}
                        aria-live="polite"
                        className="mt-4 text-sm font-semibold text-slate-700"
                      >
                        {notice}
                      </p>
                    ) : null}
                  </form>
                ) : null}

                <section className="space-y-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      Current Goals
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      Keep the next step visible
                    </h2>
                  </div>

                  {activeGoals.length === 0 ? (
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                      <p className="font-black">No active Goals yet</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Choose a starting point above when something feels worth
                        working toward.
                      </p>
                    </div>
                  ) : (
                    activeGoals.map((goal) => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        working={working}
                        onStatusChange={handleStatusChange}
                        onArchive={handleArchive}
                        onUpdateDetails={handleUpdateDetails}
                      />
                    ))
                  )}
                </section>

                {activeGoals.length > 0 && !showCreate ? (
                  <button
                    type="button"
                    aria-expanded={showCreate}
                    aria-controls={createPanelId}
                    onClick={() => {
                      setNotice("");
                      setShowCreate(true);
                    }}
                    className="w-full rounded-3xl border border-emerald-200 bg-white p-5 text-left font-black text-emerald-800 shadow-sm"
                  >
                    Add another Goal
                  </button>
                ) : null}

                <section className="rounded-3xl bg-white p-6 shadow-sm">
                  <button
                    type="button"
                    aria-expanded={showArchived}
                    aria-controls={archivedPanelId}
                    onClick={() => setShowArchived((current) => !current)}
                    className="font-black text-emerald-800"
                  >
                    {showArchived ? "Hide archived Goals" : "Show archived Goals"}
                  </button>

                  {showArchived ? (
                    <div id={archivedPanelId} className="mt-5 space-y-4">
                      {archivedGoals.length === 0 ? (
                        <p className="text-sm text-slate-600">
                          No archived Goals are recorded.
                        </p>
                      ) : (
                        archivedGoals.map((goal) => (
                          <GoalCard
                            key={goal.id}
                            goal={goal}
                            working={working}
                            onStatusChange={handleStatusChange}
                            onArchive={handleArchive}
                            onUpdateDetails={handleUpdateDetails}
                          />
                        ))
                      )}
                    </div>
                  ) : null}
                </section>
              </>
            ) : null}

            <section className="rounded-3xl bg-slate-950 p-6 text-white">
              <p className="font-black text-emerald-300">
                Participant-owned Goal boundary
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Presets are optional starting points. Goals remain
                participant-owned. This page does not assign obligations, judge
                effort, score compliance, create clinical conclusions, change
                program participation, or synchronize with the Trust Engine.
                Archived Goals remain part of your history and are not hard
                deleted.
              </p>
            </section>
          </section>
        </section>
      </main>
    </AuthGate>
  );
}