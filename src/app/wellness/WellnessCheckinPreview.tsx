"use client";

import { useEffect, useRef, useState } from "react";
import type { WellnessCheckinRow, WellnessDraft } from "./useWellnessCheckinCandidate";
import type { WellnessFlowState } from "./wellnessFlowMachine";
import {
  WELLNESS_OVERALL_CHOICES,
  wellnessOverallLabel,
  type WellnessOverallDay,
} from "./wellnessVocabulary";

type WellnessExperienceMode = "first" | "later" | "same_day";

type WellnessCheckinPreviewProps = {
  experienceMode: WellnessExperienceMode;
  referenceCheckin: WellnessCheckinRow | null;
  draft: WellnessDraft;
  onDraftChange: (nextDraft: WellnessDraft) => void;
  flow: WellnessFlowState;
  onSelectOverall: (value: WellnessOverallDay) => void;
  onDoneForNow: () => void;
  onLookCloser: () => void;
  actionMessage: string;
  writeEnabled: boolean;
  focusOnMount?: boolean;
};

export default function WellnessCheckinPreview({
  experienceMode,
  referenceCheckin,
  draft,
  onDraftChange,
  flow,
  onSelectOverall,
  onDoneForNow,
  onLookCloser,
  actionMessage,
  writeEnabled,
  focusOnMount = false,
}: WellnessCheckinPreviewProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [showQuickNote, setShowQuickNote] = useState(false);

  useEffect(() => {
    if (!focusOnMount) return;
    window.requestAnimationFrame(() =>
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }, [focusOnMount]);

  function setDraftField<K extends keyof WellnessDraft>(
    field: K,
    value: WellnessDraft[K],
  ) {
    onDraftChange({ ...draft, [field]: value });
  }

  const heading =
    experienceMode === "same_day"
      ? "How are things going now?"
      : "How are things going right now?";

  const continuity =
    experienceMode === "same_day" && referenceCheckin
      ? `Earlier you marked things ${wellnessOverallLabel(referenceCheckin.overall_day).toLowerCase()}.`
      : experienceMode === "later" && referenceCheckin
        ? `Last time you marked things ${wellnessOverallLabel(referenceCheckin.overall_day).toLowerCase()}.`
        : "Pick the closest answer. You can keep this quick.";

  const savingQuick = flow.phase === "saving" && flow.depth === "quick";

  return (
    <section
      ref={sectionRef}
      className="scroll-mt-3 overflow-hidden rounded-[2rem] border border-white/75 bg-[linear-gradient(145deg,rgba(251,247,239,.92),rgba(232,248,247,.78))] shadow-[0_24px_70px_rgba(8,38,48,0.12)] backdrop-blur-2xl"
    >
      <div className="border-b border-white/70 bg-white/38 px-5 py-5 sm:px-7">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#2bb8bc,#167c8b)] text-lg font-black text-white shadow-[0_10px_24px_rgba(31,145,153,.22)]">
            ◉
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#167d86]">
              Wellness check-in
            </p>
            <p className="mt-1 text-sm font-bold text-slate-500">
              Be real. Start here.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <h2 className="text-[2rem] font-black leading-[1.05] tracking-[-0.035em] text-[#0a2933]">
          {heading}
        </h2>
        <p className="mt-3 text-base font-semibold leading-7 text-slate-600">
          {continuity}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {WELLNESS_OVERALL_CHOICES.map((choice, index) => {
            const selected = draft.overallDay === choice.value;
            const accents = [
              ["#e98657", "#fff0e8"],
              ["#4b93be", "#edf7fc"],
              ["#6d9f8d", "#eef8f3"],
              ["#25a9aa", "#e8fbf8"],
            ][index];

            return (
              <button
                key={choice.value}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setDraftField("overallDay", choice.value);
                  onSelectOverall(choice.value);
                }}
                className="min-h-[92px] rounded-[1.5rem] border px-3 py-4 text-center shadow-sm transition active:scale-[0.985]"
                style={{
                  borderColor: selected ? accents[0] : "rgba(255,255,255,.86)",
                  background: selected ? accents[1] : "rgba(255,255,255,.72)",
                  boxShadow: selected
                    ? `0 14px 30px ${accents[0]}22`
                    : "0 8px 24px rgba(8,38,48,.06)",
                }}
              >
                <span
                  className="mx-auto mb-3 block h-4 w-4 rounded-full"
                  style={{ background: accents[0] }}
                />
                <span className="block text-sm font-black text-[#102d37]">
                  {choice.label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-pressed={draft.overallDay === "not_sure"}
          onClick={() => {
            setDraftField("overallDay", "not_sure");
            onSelectOverall("not_sure");
          }}
          className={`mt-3 w-full rounded-2xl border px-4 py-3 text-sm font-black transition ${
            draft.overallDay === "not_sure"
              ? "border-[#859bb7] bg-[#eef2f8] text-[#33465c]"
              : "border-white/80 bg-white/55 text-slate-600"
          }`}
        >
          Not sure yet
        </button>

        {draft.overallDay ? (
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={() => setShowQuickNote((current) => !current)}
              className="w-full rounded-2xl border border-white/80 bg-white/58 px-5 py-3.5 text-left text-sm font-black text-[#0c6974] shadow-sm backdrop-blur-xl"
            >
              {showQuickNote ? "Hide note" : "Add a note"}{" "}
              <span className="font-bold text-slate-400">optional</span>
            </button>

            {showQuickNote ? (
              <div className="rounded-[1.45rem] border border-white/80 bg-white/62 p-4 shadow-[0_10px_28px_rgba(8,38,48,.05)] backdrop-blur-xl">
                <textarea
                  value={draft.participantNote}
                  maxLength={2000}
                  onChange={(event) =>
                    setDraftField("participantNote", event.target.value)
                  }
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-slate-200/80 bg-white/76 px-4 py-3 text-slate-800 outline-none focus:border-[#29a8ad] focus:ring-2 focus:ring-cyan-100"
                  placeholder="What is worth remembering about this moment?"
                />
              </div>
            ) : null}

            <button
              type="button"
              disabled={!writeEnabled || savingQuick}
              onClick={onDoneForNow}
              className={`w-full rounded-2xl px-5 py-4 text-base font-black transition ${
                writeEnabled
                  ? "bg-[linear-gradient(135deg,#167f90,#22aaa7)] text-white shadow-[0_14px_34px_rgba(25,139,148,.24)]"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
            >
              {savingQuick ? "Saving..." : "Done for now"}
            </button>

            <button
              type="button"
              disabled={savingQuick}
              onClick={onLookCloser}
              className="w-full rounded-2xl border border-[#8fdad8] bg-white/72 px-5 py-4 text-base font-black text-[#0c6974] transition hover:bg-white"
            >
              Look a little closer
            </button>
          </div>
        ) : null}

        {actionMessage ? (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
            {actionMessage}
          </p>
        ) : null}
      </div>
    </section>
  );
}
