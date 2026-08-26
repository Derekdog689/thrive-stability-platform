"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  focusOnMount?: boolean;
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

const steadyNextStepChoices: Choice[] = [
  {
    label: "Keep doing what is working",
    value: "review_today_plan",
    description: "Keep the part of today you want to carry forward.",
  },
  {
    label: "Use the momentum on one thing",
    value: "choose_one_task",
    description: "Choose one thing you care about and make a little progress.",
  },
  {
    label: "Something else",
    value: "other",
    description: "Choose this if you already know what feels right.",
  },
];

const supportNextStepChoices: Choice[] = [
  {
    label: "Give yourself a little space",
    value: "take_a_break",
    description: "Step away for a few minutes or give yourself a short reset.",
  },
  {
    label: "Take care of something basic first",
    value: "food_water_rest",
    description: "Food, water, rest, medication as prescribed, or another basic need.",
  },
  {
    label: "Talk it out with someone you trust",
    value: "contact_supportive_person",
    description: "Reach out to someone you choose.",
  },
  {
    label: "Ask THRIVE to help you think it through",
    value: "ask_for_help",
    description: "Open Support to think through a next step. This does not send a request by itself.",
  },
  {
    label: "I already know what I want to do",
    value: "other",
    description: "Keep the choice in your own words.",
  },
];

function formatValue(value: string | null | undefined) {
  if (!value) return "Not selected";
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function getOverallAcknowledgement(overallDay: string) {
  switch (overallDay) {
    case "good":
      return "Glad to hear today feels pretty good.";
    case "okay":
      return "Got it. Today sounds somewhere in the middle.";
    case "hard":
      return "Sounds like today has been a tougher one.";
    case "not_sure":
      return "That is okay too. You do not have to have the day figured out.";
    default:
      return "";
  }
}

function isSteadyReflection(key: ReflectionKey, value: string) {
  const steadyValues: Record<ReflectionKey, string[]> = {
    stress: ["low", "okay"],
    sleep: ["good", "okay"],
    energy: ["good", "okay"],
    confidence: ["good", "okay"],
    routine: ["on_track"],
    recovery_support: ["connected", "not_needed"],
    support_needed: ["no"],
  };

  return steadyValues[key].includes(value);
}

function getReflectionAcknowledgement(
  key: ReflectionKey,
  value: string,
  overallDay: string,
) {
  if (!value) return "";

  if (value === "not_sure") {
    const label =
      key === "support_needed"
        ? "support"
        : reflectionGroups.find((group) => group.key === key)?.label.toLowerCase();
    return `Got it. You are not sure how ${label} feels right now.`;
  }

  if (isSteadyReflection(key, value)) {
    const steadyCopy: Record<ReflectionKey, string> = {
      stress: "Cool, stress seems pretty manageable today.",
      sleep: "Nice, sleep seems to be in a decent place today.",
      energy: "Cool, your energy seems fairly steady today.",
      confidence: "Nice, confidence seems to be holding up today.",
      routine: "Cool, your routine feels on track today.",
      recovery_support: "Got it. Recovery support feels where you need it today.",
      support_needed: "Got it. You are not looking for extra support right now.",
    };
    return steadyCopy[key];
  }

  const heavierCopy: Record<ReflectionKey, string> = {
    stress: "Sounds like stress is taking up more room today.",
    sleep: "Sounds like sleep has been a little rough.",
    energy: "Sounds like your energy is running lower today.",
    confidence: "Sounds like confidence feels lower today.",
    routine: "Sounds like your routine feels harder to hold onto today.",
    recovery_support: "Sounds like some extra recovery support could feel useful today.",
    support_needed: "Got it. You are saying support could help today.",
  };

  if (overallDay === "good") {
    return `${heavierCopy[key]} Your overall day can still feel good while one part feels harder.`;
  }

  return heavierCopy[key];
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
  focusOnMount = false,
}: WellnessCheckinPreviewProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(1);
  const [reflectionKey, setReflectionKey] = useState<ReflectionKey | null>(null);
  const [wantsNextAction, setWantsNextAction] = useState<boolean | null>(null);

  useEffect(() => {
    if (!focusOnMount) return;
    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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

  const overallDay = draft.overallDay ?? "";
  const nextStep = draft.chosenNextStep ?? "";
  const note = draft.participantNote;
  const activeReflection = reflectionGroups.find((group) => group.key === reflectionKey);
  const activeReflectionValue = reflectionKey ? reflections[reflectionKey] : "";
  const reflectionAcknowledgement =
    reflectionKey && activeReflectionValue
      ? getReflectionAcknowledgement(reflectionKey, activeReflectionValue, overallDay)
      : "";
  const useSteadyChoices =
    reflectionKey && activeReflectionValue
      ? isSteadyReflection(reflectionKey, activeReflectionValue)
      : overallDay === "good" || overallDay === "okay";
  const contextualNextStepChoices = useSteadyChoices
    ? steadyNextStepChoices
    : supportNextStepChoices;

  const selectedCount = useMemo(
    () =>
      Object.values(reflections).filter(Boolean).length +
      (nextStep ? 1 : 0) +
      (note.trim() ? 1 : 0),
    [reflections, nextStep, note],
  );

  function moveToStep(nextStep: number) {
    setStep(Math.min(5, Math.max(1, nextStep)));
    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

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
    setWantsNextAction(null);
  }

  async function saveCheckin() {
    return hasSavedCheckin ? onUpdateCandidate() : onSaveCandidate();
  }

  return (
    <section
      ref={sectionRef}
      className="scroll-mt-3 rounded-3xl bg-white p-4 shadow-sm sm:p-8"
    >
      <div className="sticky top-3 z-20 -mx-1 flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:mx-0">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
            Guided check-in
          </p>
          <p className="mt-1 text-sm font-bold text-slate-500">Step {step} of 5</p>
        </div>

        {step > 1 ? (
          <button
            type="button"
            onClick={() => moveToStep(step - 1)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        ) : (
          <span className="text-xs font-black uppercase tracking-wide text-emerald-700">
            Start here
          </span>
        )}
      </div>

      {step === 1 ? (
        <div className="mt-6">
          <h2 className="text-2xl font-black">How are things feeling today?</h2>
          <p className="mt-2 text-slate-600">Choose the closest answer.</p>

          <div className="mt-6">
            <ChoiceGroup
              label="Overall day"
              value={overallDay}
              choices={overallChoices}
              onChange={(value) => {
                setDraftField("overallDay", value || null);
                setWantsNextAction(null);
              }}
              optional={false}
            />
          </div>

          {overallDay ? (
            <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-emerald-950">
              <p className="font-black">{getOverallAcknowledgement(overallDay)}</p>
            </div>
          ) : null}

          <button
            type="button"
            disabled={!overallDay}
            onClick={() => moveToStep(2)}
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
          <h2 className="text-2xl font-black">Anything you want to look at closer?</h2>
          <p className="mt-2 text-slate-600">Choose any area you want to notice.</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {reflectionGroups.map((group) => {
              const selected = reflectionKey === group.key;
              const hasValue = Boolean(reflections[group.key]);
              const fullWidth = group.key === "support_needed";

              return (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => {
                    setReflectionKey(group.key);
                    setWantsNextAction(null);
                  }}
                  className={`flex min-h-24 flex-col justify-center rounded-2xl border px-4 py-4 text-center transition ${
                    fullWidth ? "col-span-2" : ""
                  } ${
                    selected
                      ? "border-emerald-600 bg-emerald-100"
                      : hasValue
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <p className="font-black text-slate-950">{group.label}</p>
                  {hasValue ? (
                    <p className="mt-1 text-sm font-bold text-emerald-800">
                      Added: {formatValue(reflections[group.key])}
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
                onChange={(value) => setReflection(activeReflection.key, value)}
              />

              {reflectionAcknowledgement ? (
                <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-emerald-950">
                  <p className="font-black">{reflectionAcknowledgement}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => moveToStep(3)}
              className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800"
            >
              Continue when I&apos;m done
            </button>
            <button
              type="button"
              onClick={() => {
                setReflectionKey(null);
                setWantsNextAction(false);
                setDraftField("chosenNextStep", null);
                moveToStep(4);
              }}
              className="rounded-2xl border border-slate-200 px-5 py-3 font-black text-slate-700 hover:bg-slate-50"
            >
              Nothing right now
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6">
          <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-950">
            <p className="font-black">
              {reflectionAcknowledgement || getOverallAcknowledgement(overallDay)}
            </p>
          </div>

          <h2 className="mt-6 text-2xl font-black">Do you want to do anything with that?</h2>
          <p className="mt-2 text-slate-600">Choose a next step, or leave it here.</p>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              aria-pressed={wantsNextAction === true}
              onClick={() => setWantsNextAction(true)}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                wantsNextAction === true
                  ? "border-emerald-600 bg-emerald-100"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <p className="font-black text-slate-950">Yes, help me think about a next step</p>
              <p className="mt-1 text-sm text-slate-500">Show me a few choices.</p>
            </button>

            <button
              type="button"
              aria-pressed={wantsNextAction === false}
              onClick={() => {
                setWantsNextAction(false);
                setDraftField("chosenNextStep", null);
              }}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                wantsNextAction === false
                  ? "border-emerald-600 bg-emerald-100"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <p className="font-black text-slate-950">No, I just want to remember it</p>
              <p className="mt-1 text-sm text-slate-500">That is enough.</p>
            </button>
          </div>

          {wantsNextAction === true ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <ChoiceGroup
                label="What feels closest to what you want?"
                value={nextStep}
                choices={contextualNextStepChoices}
                onChange={(value) => setDraftField("chosenNextStep", value || null)}
              />
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={wantsNextAction === null || (wantsNextAction === true && !nextStep)}
              onClick={() => moveToStep(4)}
              className={`rounded-2xl px-5 py-3 font-black ${
                wantsNextAction !== null && (wantsNextAction === false || nextStep)
                  ? "bg-emerald-700 text-white hover:bg-emerald-800"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
            >
              Continue
            </button>

            <button
              type="button"
              onClick={() => {
                setWantsNextAction(false);
                setDraftField("chosenNextStep", null);
                moveToStep(4);
              }}
              className="rounded-2xl border border-slate-200 px-5 py-3 font-black text-slate-700 hover:bg-slate-50"
            >
              Leave it here for now
            </button>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="mt-6">
          <h2 className="text-2xl font-black">Anything you want to remember?</h2>
          <p className="mt-2 text-sm text-slate-500">Optional.</p>

          <textarea
            id="wellness-note"
            value={note}
            maxLength={2000}
            onChange={(event) => setDraftField("participantNote", event.target.value)}
            rows={5}
            className="mt-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            placeholder="Optional note"
          />

          <p className="mt-2 text-right text-xs font-semibold text-slate-400">{note.length}/2000</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => moveToStep(5)}
              className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white hover:bg-emerald-800"
            >
              Review check-in
            </button>
            <button
              type="button"
              onClick={() => moveToStep(5)}
              className="rounded-2xl border border-slate-200 px-5 py-3 font-black text-slate-700 hover:bg-slate-50"
            >
              Skip note
            </button>
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="mt-6">
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">Your reflection</p>
          <h2 className="mt-2 text-2xl font-black">Does this sound like what you meant?</h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Overall day</p>
              <p className="mt-2 font-black">{formatValue(overallDay)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Next step</p>
              <p className="mt-2 font-black">{nextStep ? formatValue(nextStep) : "No next step chosen"}</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-600">Optional details selected: {selectedCount}.</p>

          {note.trim() ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Your note</p>
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
            <p className="mt-3 text-sm font-bold text-amber-900">{actionMessage}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
