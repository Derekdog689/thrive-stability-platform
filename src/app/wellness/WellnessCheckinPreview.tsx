"use client";

import { useMemo, useState } from "react";
import type {
  WellnessDraft,
  WellnessWriteResult,
} from "./useWellnessCheckinCandidate";

type Choice = {
  label: string;
  value: string;
  description?: string;
};

type WellnessCheckinPreviewProps = {
  draft: WellnessDraft;
  onDraftChange: (nextDraft: WellnessDraft) => void;
  onSaveCandidate: () => Promise<WellnessWriteResult>;
  onUpdateCandidate: () => Promise<WellnessWriteResult>;
  hasSavedCheckin: boolean;
  actionMessage: string;
  writeEnabled: boolean;
};

type ChoiceGroupProps = {
  label: string;
  value: string;
  choices: Choice[];
  onChange: (value: string) => void;
  optional?: boolean;
};

type ReflectionKey =
  | "stress"
  | "sleep"
  | "energy"
  | "confidence"
  | "routine"
  | "recovery_support"
  | "support_needed";

const overallChoices: Choice[] = [
  { label: "Good", value: "good" },
  { label: "Okay", value: "okay" },
  { label: "Hard", value: "hard" },
  { label: "Not sure", value: "not_sure" },
];

const reflectionGroups: Array<{
  key: ReflectionKey;
  label: string;
  prompt: string;
  choices: Choice[];
}> = [
  {
    key: "stress",
    label: "Stress",
    prompt: "How does stress feel today?",
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
    prompt: "How is your energy?",
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
    prompt: "How does your confidence feel today?",
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
    prompt: "How does your routine feel today?",
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
    prompt: "How connected do you feel to recovery support today?",
    choices: [
      { label: "Connected", value: "connected" },
      { label: "Could use support", value: "could_use_support" },
      { label: "Not needed today", value: "not_needed" },
      { label: "Not sure", value: "not_sure" },
    ],
  },
  {
    key: "support_needed",
    label: "Support",
    prompt: "Would support help today?",
    choices: [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
      { label: "Not sure", value: "not_sure" },
    ],
  },
];

const nextStepChoices: Choice[] = [
  {
    label: "Take a short break",
    value: "take_a_break",
    description: "Step away for a few minutes, breathe, sit somewhere quieter, or give yourself a short reset.",
  },
  {
    label: "Review today's plan",
    value: "review_today_plan",
    description: "Look at what you already planned and decide what still matters today. You do not have to do everything.",
  },
  {
    label: "Choose one small task",
    value: "choose_one_task",
    description: "Pick one thing you can start or finish without solving the whole day at once.",
  },
  {
    label: "Reach out to someone you trust",
    value: "contact_supportive_person",
    description: "Call or message a friend, sponsor, family member, peer, or another person you choose.",
  },
  {
    label: "Take care of one basic need",
    value: "food_water_rest",
    description: "Choose food, water, rest, medication as prescribed, a shower, or another basic need that would help right now.",
  },
  {
    label: "Ask THRIVE for help",
    value: "ask_for_help",
    description: "Open Support if you want help thinking through a next step. Choosing this does not send a request by itself.",
  },
  {
    label: "Something else",
    value: "other",
    description: "Choose this when your next step is yours and none of the suggestions fit.",
  },
];

function formatValue(value: string | null | undefined) {
  if (!value) return "Not selected";

  return value
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function ChoiceGroup({
  label,
  value,
  choices,
  onChange,
  optional = true,
}: ChoiceGroupProps) {
  return (
    <fieldset>
      <legend className="font-black text-slate-950">
        {label}
        {optional ? (
          <span className="ml-2 text-xs font-bold uppercase tracking-wide text-slate-400">
            Optional
          </span>
        ) : null}
      </legend>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {choices.map((choice) => {
          const selected = value === choice.value;

          return (
            <button
              key={choice.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected && optional ? "" : choice.value)}
              className={`min-h-12 rounded-2xl border px-4 py-3 text-left transition ${
                selected
                  ? "border-emerald-600 bg-emerald-100 text-emerald-950"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="block text-sm font-black">{choice.label}</span>
              {choice.description ? (
                <span className="mt-1 block text-sm font-medium leading-5 text-slate-500">
                  {choice.description}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function WellnessCheckinPreview({
  draft,
  onDraftChange,
  onSaveCandidate,
  onUpdateCandidate,
  hasSavedCheckin,
  actionMessage,
  writeEnabled,
}: WellnessCheckinPreviewProps) {
  const [step, setStep] = useState(1);
  const [reflectionKey, setReflectionKey] = useState<ReflectionKey | null>(null);

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

  const overallDay = draft.overallDay ?? "";
  const nextStep = draft.chosenNextStep ?? "";
  const note = draft.participantNote;
  const activeReflection = reflectionGroups.find(
    (group) => group.key === reflectionKey,
  );

  const selectedCount = useMemo(
    () =>
      Object.values(reflections).filter(Boolean).length +
      (nextStep ? 1 : 0) +
      (note.trim() ? 1 : 0),
    [reflections, nextStep, note],
  );

  function setDraftField<K extends keyof WellnessDraft>(
    field: K,
    value: WellnessDraft[K],
  ) {
    onDraftChange({
      ...draft,
      [field]: value,
    });
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

  async function saveCheckin() {
    const result = await (hasSavedCheckin
      ? onUpdateCandidate()
      : onSaveCandidate());

    return result;
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
            Guided check-in
          </p>
          <p className="mt-2 text-sm font-bold text-slate-500">
            Step {step} of 5
          </p>
        </div>

        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(1, current - 1))}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        ) : null}
      </div>

      {step === 1 ? (
        <div className="mt-6">
          <h2 className="text-2xl font-black">How is today going?</h2>
          <p className="mt-3 leading-7 text-slate-600">
            Start with the closest answer. You can change it before saving.
          </p>

          <div className="mt-6">
            <ChoiceGroup
              label="Overall day"
              value={overallDay}
              choices={overallChoices}
              onChange={(value) => setDraftField("overallDay", value || null)}
              optional={false}
            />
          </div>

          <button
            type="button"
            disabled={!overallDay}
            onClick={() => setStep(2)}
            className={`mt-6 rounded-2xl px-5 py-3 font-black ${
              overallDay
                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                : "cursor-not-allowed bg-slate-200 text-slate-500"
            }`}
          >
            Continue
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-6">
          <h2 className="text-2xl font-black">What feels important right now?</h2>
          <p className="mt-3 leading-7 text-slate-600">
            Choose one area if you want to add a little more detail. You can also skip this step.
          </p>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {reflectionGroups.map((group) => {
              const selected = reflectionKey === group.key;
              const hasValue = Boolean(reflections[group.key]);

              return (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => setReflectionKey(group.key)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    selected
                      ? "border-emerald-600 bg-emerald-100"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <p className="font-black text-slate-950">{group.label}</p>
                  {hasValue ? (
                    <p className="mt-1 text-sm text-emerald-800">
                      {formatValue(reflections[group.key])}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>

          {activeReflection ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <ChoiceGroup
                label={activeReflection.prompt}
                value={reflections[activeReflection.key]}
                choices={activeReflection.choices}
                onChange={(value) =>
                  setReflection(activeReflection.key, value)
                }
              />
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-2xl border border-slate-200 px-5 py-3 font-black text-slate-700 hover:bg-slate-50"
            >
              Skip details
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6">
          <h2 className="text-2xl font-black">What might help next?</h2>
          <p className="mt-3 leading-7 text-slate-600">
            Pick one small next step that feels realistic. These are examples, not instructions. You can choose something else or skip this step.
          </p>

          <div className="mt-6">
            <ChoiceGroup
              label="Choose what feels useful"
              value={nextStep}
              choices={nextStepChoices}
              onChange={(value) =>
                setDraftField("chosenNextStep", value || null)
              }
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="rounded-2xl border border-slate-200 px-5 py-3 font-black text-slate-700 hover:bg-slate-50"
            >
              Skip next step
            </button>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="mt-6">
          <h2 className="text-2xl font-black">Anything you want to remember?</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Optional. Keep it as short or detailed as you want.
          </p>

          <textarea
            id="wellness-note"
            value={note}
            maxLength={2000}
            onChange={(event) =>
              setDraftField("participantNote", event.target.value)
            }
            rows={5}
            className="mt-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            placeholder="Optional note"
          />

          <p className="mt-2 text-right text-xs font-semibold text-slate-400">
            {note.length}/2000
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep(5)}
              className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800"
            >
              Review check-in
            </button>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="rounded-2xl border border-slate-200 px-5 py-3 font-black text-slate-700 hover:bg-slate-50"
            >
              Skip note
            </button>
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="mt-6">
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">
            Your selections
          </p>
          <h2 className="mt-2 text-2xl font-black">Review your check-in</h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Overall day
              </p>
              <p className="mt-2 font-black">{formatValue(overallDay)}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Next step
              </p>
              <p className="mt-2 font-black">{formatValue(nextStep)}</p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Optional details selected: {selectedCount}.
          </p>

          {note.trim() ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                Your note
              </p>
              <p className="mt-2 leading-7 text-slate-700">{note}</p>
            </div>
          ) : null}

          <button
            type="button"
            disabled={!writeEnabled}
            onClick={() => {
              void saveCheckin();
            }}
            className={`mt-6 w-full rounded-2xl px-5 py-4 font-black sm:w-auto ${
              writeEnabled
                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                : "cursor-not-allowed bg-slate-300 text-slate-600"
            }`}
          >
            {writeEnabled
              ? hasSavedCheckin
                ? "Update check-in"
                : "Save check-in"
              : "Save check-in unavailable"}
          </button>

          {actionMessage ? (
            <p className="mt-3 text-sm font-bold text-amber-900">
              {actionMessage}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}