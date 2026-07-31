"use client";

import { FormEvent, useMemo, useState } from "react";
import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";
import {
  GoalDraft,
  GoalProgressStatus,
  ParticipantGoal,
  useParticipantGoals,
} from "./useParticipantGoals";

const goalAreas = [
  "Daily stability",
  "Financial progress",
  "Health and wellness",
  "Relationships and support",
  "Work and education",
  "Personal growth",
];

const progressOptions: Array<{
  value: Exclude<GoalProgressStatus, "archived">;
  label: string;
}> = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

const emptyDraft: GoalDraft = {
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
  const [editDraft, setEditDraft] = useState<GoalDraft>({
    title: goal.title,
    whyItMatters: goal.why_it_matters ?? "",
    nextStep: goal.next_step,
    goalArea: goal.goal_area ?? "",
  });
  const [editMessage, setEditMessage] = useState("");

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
    }
  }

  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
            {goal.goal_area ?? "Your goal"}
          </p>
          <h3 className="mt-2 text-2xl font-black">{goal.title}</h3>
        </div>
        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-900">
          {labelStatus(goal.progress_status)}
        </span>
      </div>

      {editing && goal.progress_status !== "archived" ? (
        <form
          onSubmit={saveEdits}
          className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5"
        >
          <p className="text-sm font-black text-emerald-900">Edit this goal</p>

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
              <select
                value={editDraft.goalArea}
                onChange={(event) =>
                  setEditDraft((current) => ({
                    ...current,
                    goalArea: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
              >
                <option value="">No area selected</option>
                {goalAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
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
              }}
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-700 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>

          {editMessage ? (
            <p className="mt-4 text-sm font-semibold text-slate-700">
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
        <div className="mt-5 flex flex-wrap items-end gap-3">
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
                    "archived"
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

          <button
            type="button"
            disabled={working}
            onClick={() => {
              resetDraft();
              setEditMessage("");
              setEditing(true);
            }}
            className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 font-black text-emerald-900 disabled:opacity-60"
          >
            Edit goal
          </button>

          <button
            type="button"
            disabled={working}
            onClick={() => void onArchive(goal)}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-700 disabled:opacity-60"
          >
            Archive goal
          </button>
        </div>
      ) : goal.progress_status === "archived" ? (
        <p className="mt-5 text-sm leading-6 text-slate-500">
          Archived goals remain available as part of your history and cannot be
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

  const [draft, setDraft] = useState<GoalDraft>(emptyDraft);
  const [notice, setNotice] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const canCreate = useMemo(
    () => Boolean(participant && participation),
    [participant, participation],
  );

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    const result = await createGoal(draft);

    if (!result.ok) {
      setNotice(result.message);
      return;
    }

    setDraft(emptyDraft);
    setNotice("Your goal was saved.");
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
        message: "Add a goal title and one next step before saving.",
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
                Choose a goal in your own words, name why it matters, and keep
                one useful next step visible.
              </p>
            </header>

            {loading ? (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                Loading your goals.
              </section>
            ) : null}

            {errorMessage ? (
              <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
                <p className="font-black">Your goals could not be loaded.</p>
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
                    Your goals
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    Welcome, {participantName}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    These goals belong to you. They are not scores, assignments,
                    or judgments about your progress.
                  </p>
                </section>

                <form
                  onSubmit={handleCreate}
                  className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"
                >
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                    Add a goal
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    What would you like to work toward?
                  </h2>

                  <div className="mt-6 grid gap-5">
                    <label className="text-sm font-black">
                      Goal
                      <input
                        value={draft.title}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            title: event.target.value,
                          }))
                        }
                        maxLength={180}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal"
                        placeholder="Write the goal in your own words"
                      />
                    </label>

                    <label className="text-sm font-black">
                      Why does this matter to you?
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
                        placeholder="Optional"
                      />
                    </label>

                    <label className="text-sm font-black">
                      What is one next step?
                      <input
                        value={draft.nextStep}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            nextStep: event.target.value,
                          }))
                        }
                        maxLength={240}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-normal"
                        placeholder="Choose one manageable action"
                      />
                    </label>

                    <label className="text-sm font-black">
                      Goal area
                      <select
                        value={draft.goalArea}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            goalArea: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal"
                      >
                        <option value="">Choose an area, optional</option>
                        {goalAreas.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={working}
                    className="mt-6 rounded-2xl bg-emerald-700 px-6 py-3 font-black text-white disabled:opacity-60"
                  >
                    {working ? "Saving..." : "Save goal"}
                  </button>

                  {notice ? (
                    <p className="mt-4 text-sm font-semibold text-slate-700">
                      {notice}
                    </p>
                  ) : null}
                </form>

                <section className="space-y-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      Current goals
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      Keep the next step visible
                    </h2>
                  </div>

                  {activeGoals.length === 0 ? (
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                      <p className="font-black">No active goals yet</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Add one goal above when something feels worth working
                        toward.
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

                <section className="rounded-3xl bg-white p-6 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setShowArchived((current) => !current)}
                    className="font-black text-emerald-800"
                  >
                    {showArchived ? "Hide archived goals" : "Show archived goals"}
                  </button>

                  {showArchived ? (
                    <div className="mt-5 space-y-4">
                      {archivedGoals.length === 0 ? (
                        <p className="text-sm text-slate-600">
                          No archived goals are recorded.
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
                Participant-owned goal boundary
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Goals are participant-owned. This page does not assign
                obligations, judge effort, score compliance, create clinical
                conclusions, change program participation, or synchronize with
                the Trust Engine. Archived goals remain part of your history
                and are not hard deleted.
              </p>
            </section>
          </section>
        </section>
      </main>
    </AuthGate>
  );
}