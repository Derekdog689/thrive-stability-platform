"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  WellnessCheckinRow,
  WellnessDraft,
  WellnessWriteResult,
} from "./useWellnessCheckinCandidate";

type Choice = { label: string; value: string };
type ReflectionKey =
  | "stress"
  | "sleep"
  | "energy"
  | "confidence"
  | "routine"
  | "recovery_support"
  | "support_needed";

type WellnessExperienceMode = "first" | "later" | "same_day";

type WellnessCheckinPreviewProps = {
  recentCheckins: WellnessCheckinRow[];
  experienceMode: WellnessExperienceMode;
  referenceCheckin: WellnessCheckinRow | null;
  draft: WellnessDraft;
  onDraftChange: (nextDraft: WellnessDraft) => void;
  onSaveCandidate: () => Promise<WellnessWriteResult>;
  onUpdateCandidate: () => Promise<WellnessWriteResult>;
  hasSavedCheckin: boolean;
  actionMessage: string;
  writeEnabled: boolean;
  focusOnMount?: boolean;
  resumeMode?: boolean;
};

const overallChoices: Choice[] = [
  { label: "Struggling", value: "hard" },
  { label: "Okay", value: "okay" },
  { label: "Good", value: "good" },
];

const reflectionGroups: Array<{
  key: ReflectionKey;
  label: string;
  icon: string;
  accent: string;
  soft: string;
  prompt: string;
  choices: Choice[];
}> = [
  {
    key: "stress",
    label: "Stress",
    icon: "≈",
    accent: "#ef8f56",
    soft: "#fff0e5",
    prompt: "How does stress feel right now?",
    choices: [
      { label: "Low", value: "low" },
      { label: "Okay", value: "okay" },
      { label: "High", value: "high" },
      { label: "Not sure", value: "not_sure" },
    ],
  },
  {
    key: "sleep",
    label: "Sleep",
    icon: "☾",
    accent: "#d79a42",
    soft: "#fff5dd",
    prompt: "How has sleep been?",
    choices: [
      { label: "Good", value: "good" },
      { label: "Okay", value: "okay" },
      { label: "Poor", value: "poor" },
      { label: "Not sure", value: "not_sure" },
    ],
  },
  {
    key: "energy",
    label: "Energy",
    icon: "✦",
    accent: "#2e91b5",
    soft: "#e9f7fb",
    prompt: "How is your energy right now?",
    choices: [
      { label: "Good", value: "good" },
      { label: "Okay", value: "okay" },
      { label: "Low", value: "low" },
      { label: "Not sure", value: "not_sure" },
    ],
  },
  {
    key: "confidence",
    label: "Confidence",
    icon: "◎",
    accent: "#8b66c8",
    soft: "#f3ecff",
    prompt: "How does your confidence feel right now?",
    choices: [
      { label: "Good", value: "good" },
      { label: "Okay", value: "okay" },
      { label: "Low", value: "low" },
      { label: "Not sure", value: "not_sure" },
    ],
  },
  {
    key: "routine",
    label: "Routine",
    icon: "↻",
    accent: "#d96f72",
    soft: "#fff0f0",
    prompt: "How does your routine feel right now?",
    choices: [
      { label: "On track", value: "on_track" },
      { label: "Mixed", value: "mixed" },
      { label: "Off track", value: "off_track" },
      { label: "Not sure", value: "not_sure" },
    ],
  },
  {
    key: "recovery_support",
    label: "Recovery support",
    icon: "♡",
    accent: "#7454c7",
    soft: "#f0ebff",
    prompt: "How connected do you feel to recovery support right now?",
    choices: [
      { label: "Connected", value: "connected" },
      { label: "Could use support", value: "could_use_support" },
      { label: "Not needed right now", value: "not_needed" },
      { label: "Not sure", value: "not_sure" },
    ],
  },
  {
    key: "support_needed",
    label: "Support",
    icon: "◌",
    accent: "#5b6fcb",
    soft: "#edf0ff",
    prompt: "Would support help right now?",
    choices: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "Not sure", value: "not_sure" },
    ],
  },
];

function formatValue(value: string | null | undefined) {
  if (!value) return "Not selected";
  if (value === "hard") return "Struggling";
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function referenceValue(row: WellnessCheckinRow | null, key: ReflectionKey) {
  if (!row) return null;
  const value = row[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export default function WellnessCheckinPreview({
  experienceMode,
  referenceCheckin,
  draft,
  onDraftChange,
  onSaveCandidate,
  onUpdateCandidate,
  hasSavedCheckin,
  actionMessage,
  writeEnabled,
  focusOnMount = false,
}: WellnessCheckinPreviewProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<"quick" | "deeper">("quick");
  const [selectedReflectionKeys, setSelectedReflectionKeys] = useState<ReflectionKey[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!focusOnMount) return;
    window.requestAnimationFrame(() =>
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }, [focusOnMount]);

  const reflections = useMemo<Record<ReflectionKey, string>>(
    () => ({
      stress: draft.stress ?? "",
      sleep: draft.sleep ?? "",
      energy: draft.energy ?? "",
      confidence: draft.confidence ?? "",
      routine: draft.routine ?? "",
      recovery_support: draft.recoverySupport ?? "",
      support_needed: draft.supportNeeded ?? "",
    }),
    [
      draft.stress,
      draft.sleep,
      draft.energy,
      draft.confidence,
      draft.routine,
      draft.recoverySupport,
      draft.supportNeeded,
    ],
  );

  function setDraftField<K extends keyof WellnessDraft>(
    field: K,
    value: WellnessDraft[K],
  ) {
    onDraftChange({ ...draft, [field]: value });
  }

  function setReflection(key: ReflectionKey, value: string) {
    const fieldMap: Record<ReflectionKey, keyof WellnessDraft> = {
      stress: "stress",
      sleep: "sleep",
      energy: "energy",
      confidence: "confidence",
      routine: "routine",
      recovery_support: "recoverySupport",
      support_needed: "supportNeeded",
    };
    setDraftField(fieldMap[key], value || null);
  }

  function toggleReflection(key: ReflectionKey) {
    setSelectedReflectionKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  async function saveCheckin() {
    if (!draft.overallDay || !writeEnabled || saving) return;
    setSaving(true);
    try {
      await (hasSavedCheckin ? onUpdateCandidate() : onSaveCandidate());
    } finally {
      setSaving(false);
    }
  }

  const heading =
    experienceMode === "same_day"
      ? "How are things going now?"
      : "How are things going right now?";

  const continuity =
    experienceMode === "same_day" && referenceCheckin
      ? `Earlier you marked things ${formatValue(referenceCheckin.overall_day).toLowerCase()}.`
      : experienceMode === "later" && referenceCheckin
        ? `Last time you marked things ${formatValue(referenceCheckin.overall_day).toLowerCase()}.`
        : "Pick the closest answer. You can keep this quick.";

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

        <div className="mt-6 grid grid-cols-3 gap-3">
          {overallChoices.map((choice, index) => {
            const selected = draft.overallDay === choice.value;
            const accents = [
              ["#e98657", "#fff0e8"],
              ["#4b93be", "#edf7fc"],
              ["#25a9aa", "#e8fbf8"],
            ][index];

            return (
              <button
                key={choice.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setDraftField("overallDay", choice.value)}
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
          onClick={() => setDraftField("overallDay", "not_sure")}
          className={`mt-3 w-full rounded-2xl border px-4 py-3 text-sm font-black transition ${
            draft.overallDay === "not_sure"
              ? "border-[#859bb7] bg-[#eef2f8] text-[#33465c]"
              : "border-white/80 bg-white/55 text-slate-600"
          }`}
        >
          Not sure yet
        </button>

        <div className="mt-6 rounded-[1.55rem] border border-white/80 bg-white/62 p-4 shadow-[0_10px_28px_rgba(8,38,48,.05)] backdrop-blur-xl">
          <label htmlFor="wellness-note" className="text-sm font-black text-[#173b46]">
            Add a note <span className="font-bold text-slate-400">optional</span>
          </label>
          <textarea
            id="wellness-note"
            value={draft.participantNote}
            maxLength={2000}
            onChange={(event) => setDraftField("participantNote", event.target.value)}
            rows={3}
            className="mt-3 w-full resize-none rounded-2xl border border-slate-200/80 bg-white/76 px-4 py-3 text-slate-800 outline-none focus:border-[#29a8ad] focus:ring-2 focus:ring-cyan-100"
            placeholder="What is worth remembering about this moment?"
          />
        </div>

        {mode === "quick" ? (
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              disabled={!draft.overallDay || !writeEnabled || saving}
              onClick={() => void saveCheckin()}
              className={`w-full rounded-2xl px-5 py-4 text-base font-black transition ${
                draft.overallDay && writeEnabled
                  ? "bg-[linear-gradient(135deg,#167f90,#22aaa7)] text-white shadow-[0_14px_34px_rgba(25,139,148,.24)] hover:brightness-105"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
            >
              {saving ? "Saving..." : "Save Check-In"}
            </button>

            <button
              type="button"
              disabled={!draft.overallDay}
              onClick={() => setMode("deeper")}
              className={`w-full rounded-2xl border px-5 py-4 text-base font-black transition ${
                draft.overallDay
                  ? "border-[#8fdad8] bg-white/72 text-[#0c6974] hover:bg-white"
                  : "cursor-not-allowed border-slate-200 bg-white/45 text-slate-400"
              }`}
            >
              Look a little closer
            </button>
          </div>
        ) : (
          <div className="mt-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#167d86]">
                  Optional depth
                </p>
                <h3 className="mt-2 text-2xl font-black text-[#0a2933]">
                  Anything worth looking at closer?
                </h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                  Pick only what feels useful right now.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMode("quick")}
                className="shrink-0 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-black text-slate-600"
              >
                Back
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {reflectionGroups.map((group) => {
                const selected = selectedReflectionKeys.includes(group.key);
                const savedValue = reflections[group.key];
                const priorValue = referenceValue(referenceCheckin, group.key);
                return (
                  <button
                    key={group.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleReflection(group.key)}
                    className={`relative min-h-[112px] rounded-[1.45rem] border px-4 py-4 text-left shadow-sm transition active:scale-[0.985] ${
                      group.key === "support_needed" ? "col-span-2" : ""
                    }`}
                    style={{
                      borderColor: selected ? group.accent : "rgba(255,255,255,.86)",
                      background: selected ? group.soft : "rgba(255,255,255,.70)",
                    }}
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-base font-black"
                      style={{ background: group.soft, color: group.accent }}
                    >
                      {group.icon}
                    </span>
                    <span className="mt-3 block text-sm font-black text-[#102d37]">
                      {group.label}
                    </span>
                    {savedValue ? (
                      <span className="mt-1 block text-xs font-bold text-slate-500">
                        {formatValue(savedValue)}
                      </span>
                    ) : priorValue && experienceMode !== "first" ? (
                      <span className="mt-1 block text-xs font-bold text-slate-400">
                        Earlier: {formatValue(priorValue)}
                      </span>
                    ) : null}
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

            {selectedReflectionKeys.length > 0 ? (
              <div className="mt-5 space-y-4">
                {selectedReflectionKeys.map((key) => {
                  const group = reflectionGroups.find((item) => item.key === key);
                  if (!group) return null;
                  return (
                    <fieldset
                      key={group.key}
                      className="rounded-[1.5rem] border border-white/80 bg-white/62 p-4 shadow-[0_10px_28px_rgba(8,38,48,.05)]"
                    >
                      <legend className="px-1 text-sm font-black text-[#173b46]">
                        {group.prompt}
                      </legend>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {group.choices.map((choice) => {
                          const chosen = reflections[group.key] === choice.value;
                          return (
                            <button
                              key={choice.value}
                              type="button"
                              aria-pressed={chosen}
                              onClick={() => setReflection(group.key, choice.value)}
                              className="rounded-xl border px-3 py-3 text-left text-sm font-black transition"
                              style={{
                                borderColor: chosen ? group.accent : "rgba(203,213,225,.72)",
                                background: chosen ? group.soft : "rgba(255,255,255,.78)",
                                color: chosen ? group.accent : "#475569",
                              }}
                            >
                              {choice.label}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  );
                })}
              </div>
            ) : null}

            <button
              type="button"
              disabled={!draft.overallDay || !writeEnabled || saving}
              onClick={() => void saveCheckin()}
              className={`mt-6 w-full rounded-2xl px-5 py-4 text-base font-black transition ${
                draft.overallDay && writeEnabled
                  ? "bg-[linear-gradient(135deg,#167f90,#22aaa7)] text-white shadow-[0_14px_34px_rgba(25,139,148,.24)]"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
            >
              {saving ? "Saving..." : "Save Check-In"}
            </button>
          </div>
        )}

        {actionMessage ? (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
            {actionMessage}
          </p>
        ) : null}
      </div>
    </section>
  );
}
