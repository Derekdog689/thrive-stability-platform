"use client";

import type { WellnessCheckinRow, WellnessDraft } from "./useWellnessCheckinCandidate";
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
  | { phase: "depth_select" }
  | { phase: "depth_reflect" }
  | { phase: "depth_note" }
  | { phase: "saving"; depth: "expanded" }
>;

type Props = {
  flow: ExpandedFlow;
  draft: WellnessDraft;
  referenceCheckin: WellnessCheckinRow | null;
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
  onFinishExpanded,
}: Props) {
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

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#092f3b]/42 px-3 py-3 backdrop-blur-md motion-reduce:backdrop-blur-sm sm:px-6 sm:py-6">
      <div className="mx-auto min-h-[calc(100vh-24px)] max-w-2xl overflow-hidden rounded-[2rem] border border-white/65 bg-[linear-gradient(180deg,rgba(247,244,235,.985),rgba(231,247,246,.985))] shadow-[0_30px_90px_rgba(4,25,34,.34)] transition-all duration-300 ease-out motion-reduce:transition-none sm:min-h-[calc(100vh-48px)]">
        <div className="sticky top-0 z-10 border-b border-white/70 bg-[#f7f4eb]/92 px-5 py-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#167d86]">
                Wellness
              </p>
              <h3 className="mt-1 text-2xl font-black text-[#0a2933]">
                {flow.phase === "depth_select"
                  ? "Look a little closer"
                  : flow.phase === "depth_note" || isSaving
                    ? "One last thing"
                    : "Stay with what matters"}
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {flow.phase === "depth_select"
                  ? "Choose only what feels useful right now."
                  : flow.phase === "depth_note" || isSaving
                    ? "Add anything worth remembering, or finish here."
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

        <div className="px-5 pb-32 pt-5">
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

              <div className="mt-5 rounded-[1.5rem] border border-white/80 bg-white/72 p-4">
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

              {actionMessage ? (
                <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
                  {actionMessage}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="fixed inset-x-3 bottom-3 z-[95] mx-auto max-w-2xl sm:inset-x-6 sm:bottom-6">
          <div className="rounded-[1.6rem] border border-white/80 bg-[#f7f4eb]/94 p-3 shadow-[0_18px_50px_rgba(4,25,34,.18)] backdrop-blur-2xl">
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
}
