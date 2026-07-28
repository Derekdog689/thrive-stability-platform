"use client";

import { useMemo } from "react";
import type { WellnessDraft, WellnessWriteResult } from "./useWellnessCheckinCandidate";

type Choice = {
  label: string;
  value: string;
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

const overallChoices: Choice[] = [
  { label: "Good", value: "good" },
  { label: "Okay", value: "okay" },
  { label: "Hard", value: "hard" },
  { label: "Not sure", value: "not_sure" },
];

const reflectionGroups: Array<{
  key: string;
  label: string;
  choices: Choice[];
}> = [
  {
    key: "stress",
    label: "Stress",
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
    choices: [
      { label: "Connected", value: "connected" },
      { label: "Could use support", value: "could_use_support" },
      { label: "Not needed today", value: "not_needed" },
      { label: "Not sure", value: "not_sure" },
    ],
  },
];

const supportChoices: Choice[] = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Not sure", value: "not_sure" },
];

const nextStepChoices: Choice[] = [
  { label: "Take a short break", value: "take_a_break" },
  { label: "Review today's plan", value: "review_today_plan" },
  { label: "Choose one small task", value: "choose_one_task" },
  { label: "Contact someone supportive", value: "contact_supportive_person" },
  { label: "Make time for food, water, or rest", value: "food_water_rest" },
  { label: "Ask for help", value: "ask_for_help" },
  { label: "Something else", value: "other" },
];

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
              className={`min-h-12 rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
                selected
                  ? "border-emerald-600 bg-emerald-100 text-emerald-950"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {choice.label}
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
  const reflections = useMemo<Record<string, string>>(
    () => ({
      stress: draft.stress ?? "",
      sleep: draft.sleep ?? "",
      energy: draft.energy ?? "",
      confidence: draft.confidence ?? "",
      routine: draft.routine ?? "",
      recovery_support: draft.recoverySupport ?? "",
    }),
    [
      draft.stress,
      draft.sleep,
      draft.energy,
      draft.confidence,
      draft.routine,
      draft.recoverySupport,
    ],
  );

  const overallDay = draft.overallDay ?? "";
  const supportNeeded = draft.supportNeeded ?? "";
  const nextStep = draft.chosenNextStep ?? "";
  const note = draft.participantNote;

  const selectedCount = useMemo(
    () =>
      Object.values(reflections).filter(Boolean).length +
      (supportNeeded ? 1 : 0) +
      (nextStep ? 1 : 0) +
      (note.trim() ? 1 : 0),
    [reflections, supportNeeded, nextStep, note],
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

  function setReflection(key: string, value: string) {
    const fieldMap: Record<string, keyof WellnessDraft> = {
      stress: "stress",
      sleep: "sleep",
      energy: "energy",
      confidence: "confidence",
      routine: "routine",
      recovery_support: "recoverySupport",
    };

    const field = fieldMap[key];

    if (!field) return;

    setDraftField(field, value || null);
  }

  return (
    <section className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
          Preview only
        </p>
        <h2 className="mt-2 text-2xl font-black">How is today going?</h2>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          Try the check-in flow below. Your choices stay on this screen and are
          not saved.
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
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
          A little more detail
        </p>
        <h2 className="mt-2 text-2xl font-black">Choose only what feels useful</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {reflectionGroups.map((group) => (
            <ChoiceGroup
              key={group.key}
              label={group.label}
              value={reflections[group.key] ?? ""}
              choices={group.choices}
              onChange={(value) => setReflection(group.key, value)}
            />
          ))}

          <ChoiceGroup
            label="Would support help today?"
            value={supportNeeded}
            choices={supportChoices}
            onChange={(value) => setDraftField("supportNeeded", value || null)}
          />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
          Next step
        </p>
        <h2 className="mt-2 text-2xl font-black">Choose something small</h2>
        <div className="mt-6">
          <ChoiceGroup
            label="What may help next?"
            value={nextStep}
            choices={nextStepChoices}
            onChange={(value) => setDraftField("chosenNextStep", value || null)}
          />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <label htmlFor="wellness-note" className="font-black text-slate-950">
          Anything you want to add?
          <span className="ml-2 text-xs font-bold uppercase tracking-wide text-slate-400">
            Optional
          </span>
        </label>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Keep it as short or detailed as you want.
        </p>
        <textarea
          id="wellness-note"
          value={note}
          maxLength={2000}
          onChange={(event) => setDraftField("participantNote", event.target.value)}
          rows={5}
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          placeholder="Optional note"
        />
        <p className="mt-2 text-right text-xs font-semibold text-slate-400">
          {note.length}/2000
        </p>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-wide text-amber-700">
          Review state
        </p>
        <h2 className="mt-2 text-2xl font-black text-amber-950">
          Nothing will be saved yet
        </h2>
        <p className="mt-3 leading-7 text-amber-900">
          Overall day: {overallDay
              ? overallDay.replaceAll("_", " ").replace(/^./, (letter) =>
                  letter.toUpperCase(),
                )
              : "Not selected"}. Optional items
          selected: {selectedCount}.
        </p>
        <button
          type="button"
          disabled={!writeEnabled}
          onClick={() => {
            void (hasSavedCheckin
              ? onUpdateCandidate()
              : onSaveCandidate());
          }}
          className={`mt-5 w-full rounded-2xl px-5 py-4 font-black sm:w-auto ${
            writeEnabled
              ? "bg-emerald-700 text-white hover:bg-emerald-800"
              : "cursor-not-allowed bg-slate-300 text-slate-600"
          }`}
        >
          {writeEnabled
            ? hasSavedCheckin
              ? "Update synthetic check-in"
              : "Save synthetic check-in"
            : hasSavedCheckin
              ? "Update check-in unavailable in review"
              : "Save check-in unavailable in review"}
        </button>
        {actionMessage ? (
          <p className="mt-3 text-sm font-bold text-amber-900">
            {actionMessage}
          </p>
        ) : null}
      </section>
    </section>
  );
}
