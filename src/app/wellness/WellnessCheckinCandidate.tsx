"use client";

import Link from "next/link";
import { useEffect, useMemo, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { buildContextualWellnessReturn } from "./contextualWellnessReturn";
import WellnessCheckinPreview from "./WellnessCheckinPreview";
import WellnessExpandedExperience from "./WellnessExpandedExperience";
import {
  type WellnessCheckinRow,
  type WellnessDraft,
  useWellnessCheckinCandidate,
} from "./useWellnessCheckinCandidate";
import {
  INITIAL_WELLNESS_FLOW_STATE,
  wellnessFlowReducer,
  type WellnessReflectionKey,
} from "./wellnessFlowMachine";
import {
  wellnessOverallLabel,
  type WellnessCheckinDepth,
  type WellnessOverallDay,
} from "./wellnessVocabulary";

function formatValue(value: string | null | undefined) {
  if (!value) return "Not selected";
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function nextStepLabel(value: string | null | undefined) {
  const labels: Record<string, string> = {
    review_today_plan: "Keep one thing steady",
    choose_one_task: "Do one useful thing",
    take_a_break: "Take a break",
    food_water_rest: "Handle a basic need",
    contact_supportive_person: "Talk to someone supportive",
    ask_for_help: "Open Support",
    other: "Something else",
  };
  return value ? labels[value] ?? formatValue(value) : null;
}

function overallVisual(value: WellnessOverallDay | null | undefined) {
  const visuals: Record<string, { dot: string; ring: string; badge: string; text: string }> = {
    good: {
      dot: "bg-[#21a8b0]",
      ring: "shadow-[0_0_0_8px_rgba(16,185,129,0.10)]",
      badge: "bg-emerald-50 text-[#0e6f78]",
      text: "text-[#0e6f78]",
    },
    better: {
      dot: "bg-[#6d9f8d]",
      ring: "shadow-[0_0_0_8px_rgba(109,159,141,0.12)]",
      badge: "bg-[#eef8f3] text-[#426f60]",
      text: "text-[#426f60]",
    },
    okay: {
      dot: "bg-sky-500",
      ring: "shadow-[0_0_0_8px_rgba(14,165,233,0.10)]",
      badge: "bg-sky-50 text-sky-800",
      text: "text-sky-800",
    },
    not_sure: {
      dot: "bg-slate-400",
      ring: "shadow-[0_0_0_8px_rgba(148,163,184,0.14)]",
      badge: "bg-slate-100 text-slate-700",
      text: "text-slate-700",
    },
    hard: {
      dot: "bg-amber-500",
      ring: "shadow-[0_0_0_8px_rgba(245,158,11,0.12)]",
      badge: "bg-amber-50 text-amber-900",
      text: "text-amber-900",
    },
  };
  return visuals[value ?? "not_sure"] ?? visuals.not_sure;
}

function detailSentence(label: string, value: string) {
  const plain = formatValue(value).toLowerCase();
  if (label === "Recovery") return `Recovery support feels ${plain}.`;
  if (label === "Support") return `Support feels ${plain}.`;
  return `${label} feels ${plain}.`;
}

function dateLabel(dateKey: string, today: string) {
  if (dateKey === today) return "Today";
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function shiftDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

const emptyDraft: WellnessDraft = {
  overallDay: null,
  stress: null,
  sleep: null,
  energy: null,
  confidence: null,
  routine: null,
  recoverySupport: null,
  supportNeeded: null,
  participantNote: "",
};

type Props = { onHeroChange?: (text: string) => void };

export default function WellnessCheckinCandidate({ onHeroChange }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<WellnessDraft>(emptyDraft);
  const [flow, dispatch] = useReducer(
    wellnessFlowReducer,
    INITIAL_WELLNESS_FLOW_STATE,
  );
  const [actionMessage, setActionMessage] = useState("");
  const [savedCheckin, setSavedCheckin] = useState<WellnessCheckinRow | null>(null);
  const [historyDay, setHistoryDay] = useState<string | null>(null);

  const {
    recentCheckins,
    todayCheckin,
    today,
    loading,
    createCompletedCheckin,
    updateCompletedCheckinAction,
    writeEnabled,
  } = useWellnessCheckinCandidate();

  useEffect(() => {
    if (!loading && !todayCheckin && flow.phase === "current") {
      dispatch({ type: "START_NEW_CHECKIN" });
    }
  }, [flow.phase, loading, todayCheckin]);

  useEffect(() => {
    if (!onHeroChange) return;
    if (flow.phase === "current") {
      onHeroChange(todayCheckin ? "How are things going now?" : "How are things right now?");
      return;
    }
    if (flow.phase === "return") {
      onHeroChange("You checked in.");
      return;
    }
    onHeroChange(todayCheckin ? "What’s going on with you now?" : "How are things right now?");
  }, [flow.phase, onHeroChange, todayCheckin]);

  const recentByDate = useMemo(
    () =>
      recentCheckins.reduce<Record<string, WellnessCheckinRow[]>>((groups, row) => {
        (groups[row.checkin_date] ??= []).push(row);
        return groups;
      }, {}),
    [recentCheckins],
  );

  const recentDates = Object.keys(recentByDate);
  const weekKeys = useMemo(
    () => Array.from({ length: 7 }, (_, index) => shiftDateKey(today, index - 6)),
    [today],
  );
  const selectedDayKey =
    historyDay ?? (recentDates.includes(today) ? today : recentDates[0] ?? null);
  const selectedDayRows = selectedDayKey ? recentByDate[selectedDayKey] ?? [] : [];
  const dayCount = new Set(recentCheckins.map((row) => row.checkin_date)).size;

  const experienceMode =
    todayCheckin && flow.phase !== "current" && flow.phase !== "return"
      ? "same_day"
      : recentCheckins.length > 0
        ? "later"
        : "first";
  const referenceCheckin =
    experienceMode === "same_day"
      ? todayCheckin
      : recentCheckins[0] ?? null;

  const selectedSignals: WellnessReflectionKey[] =
    flow.phase === "depth_select" ||
    flow.phase === "depth_reflect" ||
    flow.phase === "depth_return" ||
    flow.phase === "depth_note" ||
    flow.phase === "saving"
      ? flow.selectedSignals
      : [];

  const quickFlowVisible =
    flow.phase === "signal" ||
    flow.phase === "depth_choice" ||
    (flow.phase === "saving" && flow.depth === "quick");

  const expandedFlowVisible =
    flow.phase === "depth_select" ||
    flow.phase === "depth_reflect" ||
    flow.phase === "depth_return" ||
    flow.phase === "depth_note" ||
    (flow.phase === "saving" && flow.depth === "expanded");

  const displayCheckin =
    flow.phase === "return" ? savedCheckin : todayCheckin;

  const contextualReturn = useMemo(
    () =>
      buildContextualWellnessReturn(
        flow.phase === "return" ? savedCheckin : null,
        recentCheckins,
      ),
    [flow.phase, recentCheckins, savedCheckin],
  );

  async function complete(depth: WellnessCheckinDepth) {
    if (!draft.overallDay || !writeEnabled) return;

    const selected = selectedSignals;
    dispatch(
      depth === "quick"
        ? { type: "DONE_FOR_NOW" }
        : { type: "FINISH_EXPANDED" },
    );

    const result = await createCompletedCheckin(draft, depth);

    if (!result.ok) {
      setActionMessage(result.message);
      dispatch({ type: "SAVE_FAILED", depth, selectedSignals: selected });
      return;
    }

    setActionMessage("");
    setSavedCheckin(result.row);
    dispatch({ type: "SAVE_SUCCEEDED", checkinId: result.row.id });
  }

  async function chooseAction(
    value: string,
    href?: string | null,
  ) {
    if (!savedCheckin) return;

    const result = await updateCompletedCheckinAction({
      checkinId: savedCheckin.id,
      chosenNextStep: value,
    });

    if (!result.ok) {
      setActionMessage(result.message);
      return;
    }

    setSavedCheckin(result.row);
    setActionMessage("");

    if (href) router.push(href);
  }

  function startNewCheckin() {
    setDraft(emptyDraft);
    setSavedCheckin(null);
    setActionMessage("");
    dispatch({ type: "START_NEW_CHECKIN" });
  }

  const currentDetails = displayCheckin
    ? ([
        ["Stress", displayCheckin.stress],
        ["Sleep", displayCheckin.sleep],
        ["Energy", displayCheckin.energy],
        ["Confidence", displayCheckin.confidence],
        ["Routine", displayCheckin.routine],
        ["Recovery", displayCheckin.recovery_support],
        ["Support", displayCheckin.support_needed],
      ].filter(([, value]) => Boolean(value)) as [string, string][])
    : [];

  const currentVisual = overallVisual(displayCheckin?.overall_day);

  const supportRelevant =
    savedCheckin?.support_needed === "yes" ||
    savedCheckin?.recovery_support === "could_use_support";

  const pauseRelevant =
    savedCheckin?.stress === "high" ||
    savedCheckin?.sleep === "poor" ||
    savedCheckin?.energy === "low";

  const taskRelevant =
    savedCheckin?.confidence === "low" ||
    savedCheckin?.routine === "mixed" ||
    savedCheckin?.routine === "off_track";

  return (
    <div className="space-y-6">
      {flow.phase === "current" && todayCheckin ? (
        <section className="overflow-hidden rounded-[2rem] border border-white/65 bg-[#f7f2e8]/64 shadow-[0_22px_58px_rgba(8,35,46,0.10)] backdrop-blur-2xl">
          <div className="relative p-5 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#137e86]">
                Today
              </p>
              <span className="rounded-full border border-cyan-100/80 bg-[#fbf7ef]/82 px-3 py-1.5 text-xs font-black text-[#0b6871]">
                Your latest check-in
              </span>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/90 bg-white/78">
                <span className={`h-5 w-5 rounded-full ${currentVisual.dot} ${currentVisual.ring}`} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-slate-500">
                  Right now
                </p>
                <h2 className={`mt-1 text-4xl font-black tracking-tight ${currentVisual.text}`}>
                  {wellnessOverallLabel(todayCheckin.overall_day)}
                </h2>
              </div>
            </div>

            {currentDetails.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {currentDetails.map(([label, value]) => (
                  <span
                    key={label}
                    className="rounded-full border border-white/80 bg-white/68 px-3 py-2 text-xs font-bold text-slate-600"
                  >
                    {detailSentence(label, value)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm font-semibold leading-6 text-slate-600">
                You kept this one quick. The moment is still part of your Wellness history.
              </p>
            )}

            {todayCheckin.participant_note ? (
              <details className="mt-4 rounded-2xl border border-white/80 bg-white/62">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-slate-700">
                  Your note <span className="ml-1 text-[#0f7d86]">⌄</span>
                </summary>
                <p className="border-t border-white/80 px-4 pb-4 pt-3 leading-7 text-slate-700">
                  {todayCheckin.participant_note}
                </p>
              </details>
            ) : null}

            {todayCheckin.chosen_next_step ? (
              <div className="mt-5 rounded-[1.4rem] border border-cyan-100 bg-white/64 px-4 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#147a84]">
                  You chose
                </p>
                <p className="mt-1 font-black text-[#173644]">
                  {nextStepLabel(todayCheckin.chosen_next_step)}
                </p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={startNewCheckin}
              className="mt-5 rounded-full border border-cyan-200/80 bg-[#fbf7ef]/80 px-4 py-2.5 text-sm font-black text-[#0b6671] shadow-sm"
            >
              Check in again
            </button>
          </div>
        </section>
      ) : null}

      {quickFlowVisible ? (
        <WellnessCheckinPreview
          experienceMode={experienceMode}
          referenceCheckin={referenceCheckin}
          draft={draft}
          onDraftChange={setDraft}
          flow={flow}
          onSelectOverall={(value) =>
            dispatch({ type: "SELECT_OVERALL", value })
          }
          onDoneForNow={() => void complete("quick")}
          onLookCloser={() => dispatch({ type: "LOOK_CLOSER" })}
          actionMessage={actionMessage}
          writeEnabled={writeEnabled}
          focusOnMount={Boolean(todayCheckin)}
        />
      ) : null}

      {expandedFlowVisible ? (
        <WellnessExpandedExperience
          flow={flow as Extract<
            typeof flow,
            { phase: "depth_select" | "depth_reflect" | "depth_return" | "depth_note" | "saving" }
          >}
          draft={draft}
          referenceCheckin={referenceCheckin}
          recentCheckins={recentCheckins}
          experienceMode={experienceMode}
          writeEnabled={writeEnabled}
          actionMessage={actionMessage}
          onDraftChange={setDraft}
          onToggleSignal={(key) =>
            dispatch({ type: "TOGGLE_SIGNAL", key })
          }
          onContinueDepth={() =>
            dispatch({ type: "CONTINUE_DEPTH" })
          }
          onNextSignal={() =>
            dispatch({ type: "NEXT_SIGNAL" })
          }
          onPreviousSignal={() =>
            dispatch({ type: "PREVIOUS_SIGNAL" })
          }
          onBackToSelection={() =>
            dispatch({ type: "BACK_TO_SELECTION" })
          }
          onBackToQuick={() =>
            dispatch({ type: "BACK_TO_QUICK" })
          }
          onContinueToNote={() =>
            dispatch({ type: "GO_TO_NOTE" })
          }
          onFinishExpanded={() => void complete("expanded")}
        />
      ) : null}

      {flow.phase === "return" && savedCheckin ? (
        <section className="overflow-hidden rounded-[2rem] border border-white/12 bg-[radial-gradient(circle_at_84%_10%,rgba(240,179,94,.20),transparent_28%),linear-gradient(160deg,#0a4050,#092f3b_66%,#102b35)] p-6 text-white shadow-[0_28px_74px_rgba(4,25,34,0.24)] sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#67d7ce]/18 text-2xl text-[#8ce8df]">
              ✓
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8ce8df]">
                Saved
              </p>
              <h2 className="mt-1 text-2xl font-black">
                This moment is part of your Story.
              </h2>
            </div>
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8ce8df]">
              THRIVE noticed
            </p>
            <h3 className="mt-2 text-xl font-black text-white">
              {contextualReturn?.headline ?? "Your check-in is saved."}
            </h3>
            {contextualReturn?.detail ? (
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">
                {contextualReturn.detail}
              </p>
            ) : null}
          </div>

          {savedCheckin.participant_note ? (
            <details className="mt-4 rounded-[1.4rem] border border-white/12 bg-white/5">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-[#8ce8df]">
                Your reflection
              </summary>
              <p className="border-t border-white/10 px-4 pb-4 pt-3 text-sm font-semibold leading-6 text-slate-300">
                {savedCheckin.participant_note}
              </p>
            </details>
          ) : null}

          {(supportRelevant || pauseRelevant || taskRelevant) ? (
            <div className="mt-7">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                If something would help
              </p>
              <div className="mt-4 grid gap-3">
                {supportRelevant ? (
                  <button
                    type="button"
                    onClick={() =>
                      void chooseAction(
                        "ask_for_help",
                        contextualReturn?.actionHref ?? "/support",
                      )
                    }
                    className="rounded-[1.35rem] border border-[#6f5bd3]/25 bg-[#6f5bd3]/18 px-5 py-4 text-left font-black text-white"
                  >
                    Open Support
                  </button>
                ) : null}
                {pauseRelevant ? (
                  <button
                    type="button"
                    onClick={() => void chooseAction("take_a_break")}
                    className="rounded-[1.35rem] border border-[#48a9d8]/25 bg-[#48a9d8]/16 px-5 py-4 text-left font-black text-white"
                  >
                    Take a break
                  </button>
                ) : null}
                {taskRelevant ? (
                  <button
                    type="button"
                    onClick={() => void chooseAction("choose_one_task")}
                    className="rounded-[1.35rem] border border-[#4fc39c]/25 bg-[#4fc39c]/14 px-5 py-4 text-left font-black text-white"
                  >
                    Choose one useful thing
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm font-semibold leading-6 text-slate-300">
              You do not need to turn this check-in into another task.
            </p>
          )}

          {actionMessage ? (
            <p className="mt-4 rounded-xl bg-amber-100/10 px-4 py-3 text-sm font-bold text-amber-100">
              {actionMessage}
            </p>
          ) : null}

          <div className="mt-7 border-t border-white/10 pt-5">
            <Link
              href="/living-signal/today"
              className="flex w-full items-center justify-center rounded-[1.4rem] bg-[linear-gradient(135deg,#56d2c9,#36a9b5)] px-5 py-4 font-black text-[#082c35]"
            >
              Done for now
            </Link>
            <button
              type="button"
              onClick={startNewCheckin}
              className="mt-3 flex w-full items-center justify-center rounded-[1.4rem] border border-white/16 bg-white/5 px-5 py-4 font-black text-white"
            >
              Check in again
            </button>
          </div>
        </section>
      ) : null}

      {flow.phase === "current" && recentDates.length > 0 ? (
        <section className="rounded-[2rem] border border-white/70 bg-[#fbf7ef]/76 p-5 shadow-[0_20px_56px_rgba(8,35,46,0.09)] backdrop-blur-2xl sm:p-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#147a84]">
                Your week
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Check-ins
              </h2>
            </div>
            <p className="text-sm font-black text-slate-500">
              {dayCount} days · {recentCheckins.length} total
            </p>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-2">
            {weekKeys.map((dateKey) => {
              const rows = recentByDate[dateKey] ?? [];
              const checked = rows.length > 0;
              const selected = selectedDayKey === dateKey;
              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => checked && setHistoryDay(dateKey)}
                  disabled={!checked}
                  className={`min-w-0 rounded-[1.25rem] border px-1 py-3 text-center shadow-sm ${
                    selected
                      ? "border-[#1c8fa0] bg-[linear-gradient(180deg,rgba(178,235,235,.78),rgba(231,246,244,.72))]"
                      : checked
                        ? "border-cyan-100/70 bg-white/72"
                        : "border-white/60 bg-white/38"
                  }`}
                >
                  <span className="block text-[9px] font-black uppercase tracking-wide text-slate-500">
                    {dateLabel(dateKey, today)}
                  </span>
                  <span className={`mx-auto mt-3 block h-4 w-4 rounded-full ${checked ? "bg-[#21a8b0]" : "bg-slate-200"}`} />
                  <span className="mt-2 block text-[9px] font-black text-[#0e6f78]">
                    {rows.length || ""}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedDayRows.length > 0 ? (
            <div className="mt-5 space-y-3">
              {selectedDayRows.map((checkin) => {
                const visual = overallVisual(checkin.overall_day);
                const time = new Intl.DateTimeFormat("en-US", {
                  timeZone: "America/New_York",
                  hour: "numeric",
                  minute: "2-digit",
                }).format(new Date(checkin.created_at));

                return (
                  <article
                    key={checkin.id}
                    className="rounded-[1.4rem] border border-white/80 bg-white/76 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black text-slate-950">{time}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${visual.badge}`}>
                        {wellnessOverallLabel(checkin.overall_day)}
                      </span>
                    </div>
                    {checkin.checkin_depth ? (
                      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        {checkin.checkin_depth === "quick" ? "Quick check-in" : "Looked closer"}
                      </p>
                    ) : null}
                    {checkin.chosen_next_step ? (
                      <p className="mt-3 text-sm font-bold text-slate-700">
                        Chose: {nextStepLabel(checkin.chosen_next_step)}
                      </p>
                    ) : null}
                    {checkin.participant_note ? (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-black text-[#0e6f78]">
                          Read note
                        </summary>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {checkin.participant_note}
                        </p>
                      </details>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
