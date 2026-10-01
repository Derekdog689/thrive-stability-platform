"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { WellnessCheckinRow, WellnessDraft } from "./useWellnessCheckinCandidate";
import { buildWellnessGuidance } from "./buildWellnessGuidance";
import type { WellnessFlowState, WellnessReflectionKey } from "./wellnessFlowMachine";
import {
  WELLNESS_REFLECTIONS,
  WELLNESS_REFLECTION_BY_KEY,
  formatReflectionValue,
  getReflectionValue,
  setReflectionValue,
} from "./wellnessReflectionConfig";

type ExpandedFlow = Extract<
  WellnessFlowState,
  { phase: "depth_select" | "depth_reflect" | "depth_return" | "depth_note" | "saving" }
>;

type Props = {
  flow: ExpandedFlow;
  draft: WellnessDraft;
  referenceCheckin: WellnessCheckinRow | null;
  recentCheckins: WellnessCheckinRow[];
  experienceMode: "first" | "later" | "same_day";
  writeEnabled: boolean;
  actionMessage: string;
  onDraftChange: (nextDraft: WellnessDraft) => void;
  onToggleSignal: (key: WellnessReflectionKey) => void;
  onContinueDepth: () => void;
  onNextSignal: () => void;
  onPreviousSignal: () => void;
  onBackToSelection: () => void;
  onBackToQuick: () => void;
  onContinueToNote: () => void;
  onFinishExpanded: () => void;
};

function priorValue(
  row: WellnessCheckinRow | null,
  key: WellnessReflectionKey,
) {
  if (!row) return null;
  const value = row[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export default function WellnessExpandedExperience({
  flow,
  draft,
  referenceCheckin,
  recentCheckins,
  experienceMode,
  writeEnabled,
  actionMessage,
  onDraftChange,
  onToggleSignal,
  onContinueDepth,
  onNextSignal,
  onPreviousSignal,
  onBackToSelection,
  onBackToQuick,
  onContinueToNote,
  onFinishExpanded,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [fitResponse, setFitResponse] = useState<
    "yes" | "sort_of" | "not_really" | null
  >(null);

  useEffect(() => {
    setMounted(true);

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverscroll = html.style.overscrollBehavior;
    const previousBodyOverscroll = body.style.overscrollBehavior;

    html.classList.add("wellness-expanded-open");
    body.classList.add("wellness-expanded-open");
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";

    return () => {
      html.classList.remove("wellness-expanded-open");
      body.classList.remove("wellness-expanded-open");
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      html.style.overscrollBehavior = previousHtmlOverscroll;
      body.style.overscrollBehavior = previousBodyOverscroll;
    };
  }, []);

  const selectedSignals = flow.selectedSignals;
  const isSaving = flow.phase === "saving";

  const currentIndex =
    flow.phase === "depth_reflect"
      ? Math.min(
          flow.currentSignalIndex,
          Math.max(0, selectedSignals.length - 1),
        )
      : 0;

  const currentKey =
    flow.phase === "depth_reflect"
      ? selectedSignals[currentIndex] ?? null
      : null;

  const currentConfig = currentKey
    ? WELLNESS_REFLECTION_BY_KEY[currentKey]
    : null;

  const currentAnswer = currentKey
    ? getReflectionValue(draft, currentKey)
    : null;

  const currentPrior = currentKey
    ? priorValue(referenceCheckin, currentKey)
    : null;

  const guidance = useMemo(
    () => buildWellnessGuidance(draft, recentCheckins, experienceMode),
    [draft, recentCheckins, experienceMode],
  );

  function toggleSignal(key: WellnessReflectionKey) {
    const selected = selectedSignals.includes(key);
    if (selected) {
      onDraftChange(setReflectionValue(draft, key, null));
    }
    onToggleSignal(key);
  }

  function chooseAnswer(key: WellnessReflectionKey, value: string) {
    onDraftChange(setReflectionValue(draft, key, value));
  }

  const overlay = (
    <div className="fixed inset-0 z-[120] h-[100dvh] overflow-hidden bg-[#092f3b]/52 p-3 backdrop-blur-md motion-reduce:backdrop-blur-sm sm:p-6">
      <div className="mx-auto grid h-full max-w-2xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[2rem] border border-white/65 bg-[linear-gradient(180deg,rgba(247,244,235,.985),rgba(231,247,246,.985))] shadow-[0_30px_90px_rgba(4,25,34,.34)] transition-all duration-300 ease-out motion-reduce:transition-none">
        <div className="z-10 border-b border-white/70 bg-[#f7f4eb]/94 px-5 py-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#167d86]">
                Wellness
              </p>
              <h3 className="mt-1 text-2xl font-black text-[#0a2933]">
                {flow.phase === "depth_select"
                  ? "Look a little closer"
                  : flow.phase === "depth_return"
                    ? "Here’s what THRIVE noticed"
                    : flow.phase === "depth_note" || isSaving
                      ? "One last thing"
                      : "Stay with what matters"}
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {flow.phase === "depth_select"
                  ? "Choose only what feels useful right now."
                  : flow.phase === "depth_return"
                    ? "A useful return before you decide what comes next."
                    : flow.phase === "depth_note" || isSaving
                      ? "Review the moment, then add a note only if it helps."
                      : "One thing at a time."}
              </p>
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={onBackToQuick}
              className="shrink-0 rounded-full border border-white/90 bg-white/76 px-4 py-2 text-xs font-black text-slate-600 shadow-sm"
            >
              Back
            </button>
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-6 pt-5">
          {flow.phase === "depth_select" ? (
            <div className="animate-[fadeIn_.2s_ease-out] motion-reduce:animate-none">
              <div className="grid grid-cols-2 gap-3">
                {WELLNESS_REFLECTIONS.map((group) => {
                  const selected = selectedSignals.includes(group.key);
                  return (
                    <button
                      key={group.key}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleSignal(group.key)}
                      className={`relative min-h-[112px] rounded-[1.45rem] border px-4 py-4 text-left shadow-sm transition duration-200 active:scale-[0.985] motion-reduce:transition-none ${
                        group.key === "support_needed" ? "col-span-2" : ""
                      }`}
                      style={{
                        borderColor: selected
                          ? group.accent
                          : "rgba(255,255,255,.86)",
                        background: selected
                          ? group.soft
                          : "rgba(255,255,255,.70)",
                      }}
                    >
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-base font-black"
                        style={{
                          background: group.soft,
                          color: group.accent,
                        }}
                      >
                        {group.icon}
                      </span>
                      <span className="mt-3 block text-sm font-black text-[#102d37]">
                        {group.label}
                      </span>
                      {selected ? (
                        <span
                          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-white"
                          style={{ background: group.accent }}
                        >
                          ✓
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/80 bg-white/62 px-4 py-3">
                <p className="text-sm font-black text-[#173b46]">
                  {selectedSignals.length === 0
                    ? "Choose at least one area"
                    : `${selectedSignals.length} thing${selectedSignals.length === 1 ? "" : "s"} selected`}
                </p>
                <span className="text-xs font-bold text-slate-400">
                  You decide the depth.
                </span>
              </div>
            </div>
          ) : null}

          {flow.phase === "depth_reflect" && currentConfig && currentKey ? (
            <div
              key={currentKey}
              className="animate-[fadeIn_.2s_ease-out] motion-reduce:animate-none"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#167d86]">
                  {currentIndex + 1} of {selectedSignals.length}
                </p>
                <button
                  type="button"
                  onClick={onBackToSelection}
                  className="text-xs font-black text-slate-500 underline decoration-slate-300 underline-offset-4"
                >
                  Edit areas
                </button>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {selectedSignals.map((key, index) => {
                  const item = WELLNESS_REFLECTION_BY_KEY[key];
                  const complete = Boolean(getReflectionValue(draft, key));
                  const active = index === currentIndex;
                  return (
                    <span
                      key={key}
                      className="shrink-0 rounded-full border px-3 py-2 text-xs font-black transition motion-reduce:transition-none"
                      style={{
                        borderColor: active ? item.accent : "rgba(203,213,225,.72)",
                        background: active ? item.soft : "rgba(255,255,255,.72)",
                        color: active ? item.accent : complete ? "#0f766e" : "#64748b",
                      }}
                    >
                      {complete && !active ? "✓ " : ""}
                      {item.label}
                    </span>
                  );
                })}
              </div>

              <div className="mt-7 rounded-[1.8rem] border border-white/80 bg-white/76 p-5 shadow-[0_18px_48px_rgba(8,38,48,.08)]">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl font-black"
                    style={{
                      background: currentConfig.soft,
                      color: currentConfig.accent,
                    }}
                  >
                    {currentConfig.icon}
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      {currentConfig.label}
                    </p>
                    {currentPrior ? (
                      <p className="mt-1 text-sm font-bold text-slate-500">
                        {experienceMode === "same_day" ? "Earlier today" : "Last time"}:{" "}
                        {formatReflectionValue(currentPrior)}
                      </p>
                    ) : null}
                  </div>
                </div>

                <h4 className="mt-6 text-2xl font-black leading-tight text-[#0a2933]">
                  {currentConfig.prompt}
                </h4>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {currentConfig.choices.map((choice) => {
                    const chosen = currentAnswer === choice.value;
                    return (
                      <button
                        key={choice.value}
                        type="button"
                        aria-pressed={chosen}
                        onClick={() => chooseAnswer(currentKey, choice.value)}
                        className="rounded-[1.2rem] border px-4 py-4 text-left text-sm font-black transition duration-200 active:scale-[0.985] motion-reduce:transition-none"
                        style={{
                          borderColor: chosen
                            ? currentConfig.accent
                            : "rgba(203,213,225,.72)",
                          background: chosen
                            ? currentConfig.soft
                            : "rgba(255,255,255,.82)",
                          color: chosen ? currentConfig.accent : "#475569",
                        }}
                      >
                        {choice.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {flow.phase === "depth_return" ? (
            <div className="animate-[fadeIn_.2s_ease-out] motion-reduce:animate-none">
              <div className="rounded-[1.6rem] border border-[#9edbd8]/65 bg-[linear-gradient(145deg,rgba(255,255,255,.78),rgba(224,247,245,.72))] p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#167d86]">
                  THRIVE noticed
                </p>
                <h4 className="mt-2 text-2xl font-black leading-tight text-[#0a2933]">
                  {guidance.headline}
                </h4>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                  {guidance.summary}
                </p>
              </div>

              {guidance.historySummary ? (
                <div className="mt-4 rounded-[1.45rem] border border-sky-100/80 bg-sky-50/72 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">
                    From your history
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                    {guidance.historySummary}
                  </p>
                </div>
              ) : null}

              {guidance.possibleConnection && fitResponse !== "not_really" ? (
                <div className="mt-4 rounded-[1.45rem] border border-white/12 bg-[#0b3946] p-4 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8ce8df]">
                    A possible connection
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-100">
                    {guidance.possibleConnection}
                  </p>
                  <p className="mt-4 text-xs font-bold text-slate-300">
                    Does that fit for you?
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      ["yes", "Yes"],
                      ["sort_of", "Sort of"],
                      ["not_really", "Not really"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={fitResponse === value}
                        onClick={() =>
                          setFitResponse(
                            value as "yes" | "sort_of" | "not_really",
                          )
                        }
                        className={`rounded-xl border px-2 py-2 text-xs font-black transition ${
                          fitResponse === value
                            ? "border-[#8ce8df] bg-[#8ce8df] text-[#082c35]"
                            : "border-white/18 bg-white/6 text-white"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] font-semibold leading-5 text-slate-400">
                    This answer only shapes this moment. It is not a diagnosis or conclusion.
                  </p>
                </div>
              ) : null}

              {fitResponse === "not_really" ? (
                <div className="mt-4 rounded-[1.35rem] border border-white/80 bg-white/66 p-4">
                  <p className="text-sm font-bold leading-6 text-slate-700">
                    Got it. Leave that connection aside. Your own read of the moment comes first.
                  </p>
                </div>
              ) : null}

              {guidance.followUpQuestion ? (
                <div className="mt-4 rounded-[1.45rem] border border-violet-100/80 bg-violet-50/72 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-700">
                    Something to think about
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-800">
                    {guidance.followUpQuestion}
                  </p>
                  <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                    You can use the final note for this, or leave it alone.
                  </p>
                </div>
              ) : null}

              <details className="mt-4 rounded-[1.35rem] border border-white/80 bg-white/60">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-[#173b46]">
                  Why THRIVE is showing this
                </summary>
                <p className="border-t border-white/80 px-4 py-3 text-xs font-semibold leading-5 text-slate-600">
                  {guidance.whyShown}
                </p>
              </details>

              <div className="mt-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#167d86]">
                  What might help
                </p>
                <div className="mt-3 grid gap-3">
                  {[guidance.primarySuggestion, ...guidance.otherSuggestions]
                    .slice(0, 3)
                    .map((action, index) => (
                      <div
                        key={action.value}
                        className={`rounded-[1.4rem] border p-4 ${
                          index === 0
                            ? "border-[#8fd9d4]/80 bg-[#e6f7f3]"
                            : "border-white/80 bg-white/68"
                        }`}
                      >
                        <p className="font-black text-[#102d37]">{action.label}</p>
                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                          {action.reason}
                        </p>
                      </div>
                    ))}
                </div>
                <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
                  These are options, not assignments. After you save, you can choose one or simply be done.
                </p>
              </div>
            </div>
          ) : null}

          {(flow.phase === "depth_note" || isSaving) ? (
            <div className="animate-[fadeIn_.2s_ease-out] motion-reduce:animate-none">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#167d86]">
                Reflection complete
              </p>
              <h4 className="mt-2 text-2xl font-black leading-tight text-[#0a2933]">
                Anything you want to remember about this moment?
              </h4>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                Optional. Your check-in can stand on its own.
              </p>

              <div className="mt-5 rounded-[1.5rem] border border-white/80 bg-white/62 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  You looked at
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSignals.map((key) => {
                    const item = WELLNESS_REFLECTION_BY_KEY[key];
                    return (
                      <span
                        key={key}
                        className="rounded-full border px-3 py-2 text-xs font-black"
                        style={{
                          borderColor: `${item.accent}55`,
                          background: item.soft,
                          color: item.accent,
                        }}
                      >
                        {item.label}: {formatReflectionValue(getReflectionValue(draft, key))}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-white/80 bg-white/72 p-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#167d86]">
                  Your reflection · optional
                </p>
                <textarea
                  value={draft.participantNote}
                  maxLength={2000}
                  disabled={isSaving}
                  onChange={(event) =>
                    onDraftChange({
                      ...draft,
                      participantNote: event.target.value,
                    })
                  }
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-slate-800 outline-none focus:border-[#29a8ad] focus:ring-2 focus:ring-cyan-100"
                  placeholder="What feels worth keeping with this check-in?"
                />
              </div>

              {actionMessage ? (
                <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
                  {actionMessage}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="border-t border-white/75 bg-[#f7f4eb]/96 p-3 shadow-[0_-12px_34px_rgba(4,25,34,.08)] backdrop-blur-2xl">
          <div>
            {flow.phase === "depth_select" ? (
              <div className="grid gap-2">
                <button
                  type="button"
                  disabled={selectedSignals.length === 0}
                  onClick={onContinueDepth}
                  className={`w-full rounded-2xl px-5 py-4 text-base font-black transition motion-reduce:transition-none ${
                    selectedSignals.length > 0
                      ? "bg-[linear-gradient(135deg,#167f90,#22aaa7)] text-white shadow-[0_14px_34px_rgba(25,139,148,.24)]"
                      : "cursor-not-allowed bg-slate-200 text-slate-500"
                  }`}
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={onBackToQuick}
                  className="w-full rounded-2xl border border-white/80 bg-white/74 px-5 py-3 text-sm font-black text-slate-600"
                >
                  Back to quick check-in
                </button>
              </div>
            ) : null}

            {flow.phase === "depth_return" ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onPreviousSignal}
                  className="rounded-2xl border border-white/80 bg-white/74 px-5 py-4 text-sm font-black text-slate-600"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={onContinueToNote}
                  className="rounded-2xl bg-[linear-gradient(135deg,#167f90,#22aaa7)] px-5 py-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(25,139,148,.20)]"
                >
                  Continue
                </button>
              </div>
            ) : null}

            {flow.phase === "depth_reflect" ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onPreviousSignal}
                  className="rounded-2xl border border-white/80 bg-white/74 px-5 py-4 text-sm font-black text-slate-600"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!currentAnswer}
                  onClick={onNextSignal}
                  className={`rounded-2xl px-5 py-4 text-sm font-black transition motion-reduce:transition-none ${
                    currentAnswer
                      ? "bg-[linear-gradient(135deg,#167f90,#22aaa7)] text-white"
                      : "cursor-not-allowed bg-slate-200 text-slate-500"
                  }`}
                >
                  {currentIndex === selectedSignals.length - 1 ? "Continue" : "Next"}
                </button>
              </div>
            ) : null}

            {(flow.phase === "depth_note" || isSaving) ? (
              <div className="grid gap-2">
                <button
                  type="button"
                  disabled={!writeEnabled || isSaving}
                  onClick={onFinishExpanded}
                  className={`w-full rounded-2xl px-5 py-4 text-base font-black transition motion-reduce:transition-none ${
                    writeEnabled && !isSaving
                      ? "bg-[linear-gradient(135deg,#167f90,#22aaa7)] text-white shadow-[0_14px_34px_rgba(25,139,148,.24)]"
                      : "cursor-not-allowed bg-slate-200 text-slate-500"
                  }`}
                >
                  {isSaving ? "Saving..." : "Finish check-in"}
                </button>
                {!isSaving && !draft.participantNote.trim() ? (
                  <button
                    type="button"
                    onClick={onFinishExpanded}
                    className="w-full px-5 py-2 text-sm font-black text-[#0c6974]"
                  >
                    Skip note
                  </button>
                ) : null}
                {!isSaving ? (
                  <button
                    type="button"
                    onClick={onPreviousSignal}
                    className="w-full rounded-2xl border border-white/80 bg-white/74 px-5 py-3 text-sm font-black text-slate-600"
                  >
                    Back
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(overlay, document.body);
}
