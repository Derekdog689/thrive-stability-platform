"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildWellnessGuidance } from "./buildWellnessGuidance";
import type { WellnessCheckinRow, WellnessDraft, WellnessWriteResult } from "./useWellnessCheckinCandidate";

type Choice = { label: string; value: string };
type ReflectionKey = "stress" | "sleep" | "energy" | "confidence" | "routine" | "recovery_support" | "support_needed";

type WellnessCheckinPreviewProps = {
  recentCheckins: WellnessCheckinRow[];
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

const overallChoices: Choice[] = [
  { label: "Good", value: "good" },
  { label: "Okay", value: "okay" },
  { label: "Hard", value: "hard" },
  { label: "Not sure", value: "not_sure" },
];

const reflectionGroups: Array<{ key: ReflectionKey; label: string; prompt: string; choices: Choice[] }> = [
  { key: "stress", label: "Stress", prompt: "How does stress feel today?", choices: [{ label: "Low", value: "low" }, { label: "Okay", value: "okay" }, { label: "High", value: "high" }, { label: "Not sure", value: "not_sure" }] },
  { key: "sleep", label: "Sleep", prompt: "How has sleep been?", choices: [{ label: "Good", value: "good" }, { label: "Okay", value: "okay" }, { label: "Poor", value: "poor" }, { label: "Not sure", value: "not_sure" }] },
  { key: "energy", label: "Energy", prompt: "How is your energy?", choices: [{ label: "Good", value: "good" }, { label: "Okay", value: "okay" }, { label: "Low", value: "low" }, { label: "Not sure", value: "not_sure" }] },
  { key: "confidence", label: "Confidence", prompt: "How does your confidence feel today?", choices: [{ label: "Good", value: "good" }, { label: "Okay", value: "okay" }, { label: "Low", value: "low" }, { label: "Not sure", value: "not_sure" }] },
  { key: "routine", label: "Routine", prompt: "How does your routine feel today?", choices: [{ label: "On track", value: "on_track" }, { label: "Mixed", value: "mixed" }, { label: "Off track", value: "off_track" }, { label: "Not sure", value: "not_sure" }] },
  { key: "recovery_support", label: "Recovery support", prompt: "How connected do you feel to recovery support today?", choices: [{ label: "Connected", value: "connected" }, { label: "Could use support", value: "could_use_support" }, { label: "Not needed today", value: "not_needed" }, { label: "Not sure", value: "not_sure" }] },
  { key: "support_needed", label: "Support", prompt: "Would support help today?", choices: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }, { label: "Not sure", value: "not_sure" }] },
];

function formatValue(value: string | null | undefined) {
  if (!value) return "Not selected";
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function getOverallAcknowledgement(overallDay: string) {
  if (overallDay === "good") return "Glad to hear today feels pretty good.";
  if (overallDay === "okay") return "Got it. Today sounds somewhere in the middle.";
  if (overallDay === "hard") return "Sounds like today has been a tougher one.";
  if (overallDay === "not_sure") return "That is okay too. You do not have to have the day figured out.";
  return "";
}

function ChoiceGroup({ label, value, choices, onChange, optional = true }: ChoiceGroupProps) {
  return (
    <fieldset>
      <legend className="font-black text-slate-950">
        {label}
        {optional ? <span className="ml-2 text-xs font-bold uppercase tracking-wide text-slate-400">Optional</span> : null}
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
              className={`min-h-12 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.985] ${selected ? "border-emerald-600 bg-emerald-100 text-emerald-950" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              <span className="block text-sm font-black">{choice.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function WellnessCheckinPreview({ recentCheckins, draft, onDraftChange, onSaveCandidate, onUpdateCandidate, hasSavedCheckin, actionMessage, writeEnabled, focusOnMount = false }: WellnessCheckinPreviewProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(1);
  const [selectedReflectionKeys, setSelectedReflectionKeys] = useState<ReflectionKey[]>([]);
  const [reflectionIndex, setReflectionIndex] = useState<number | null>(null);
  const [nextStepChoice, setNextStepChoice] = useState(draft.chosenNextStep ?? "");

  useEffect(() => {
    if (!focusOnMount) return;
    window.requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [focusOnMount]);

  const reflections = useMemo<Record<ReflectionKey, string>>(() => ({
    stress: draft.stress ?? "",
    sleep: draft.sleep ?? "",
    energy: draft.energy ?? "",
    confidence: draft.confidence ?? "",
    routine: draft.routine ?? "",
    recovery_support: draft.recoverySupport ?? "",
    support_needed: draft.supportNeeded ?? "",
  }), [draft.stress, draft.sleep, draft.energy, draft.confidence, draft.routine, draft.recoverySupport, draft.supportNeeded]);

  const overallDay = draft.overallDay ?? "";
  const nextStep = draft.chosenNextStep ?? "";
  const note = draft.participantNote;
  const activeReflectionKey = reflectionIndex === null ? null : selectedReflectionKeys[reflectionIndex] ?? null;
  const activeReflection = activeReflectionKey ? reflectionGroups.find((group) => group.key === activeReflectionKey) ?? null : null;
  const activeReflectionValue = activeReflectionKey ? reflections[activeReflectionKey] : "";
  const reflectionValues = selectedReflectionKeys.map((key) => reflections[key]).filter(Boolean);
  const reviewDetails = reflectionGroups.filter((group) => reflections[group.key]);
  const guidance = useMemo(() => buildWellnessGuidance(draft, recentCheckins), [draft, recentCheckins]);

  function moveToStep(nextStepNumber: number) {
    setStep(Math.min(4, Math.max(1, nextStepNumber)));
    window.requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function setDraftField<K extends keyof WellnessDraft>(field: K, value: WellnessDraft[K]) {
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
    setSelectedReflectionKeys((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  }

  function beginReflections() {
    if (selectedReflectionKeys.length === 0) {
      moveToStep(3);
      return;
    }
    setReflectionIndex(0);
  }

  function advanceReflection() {
    if (reflectionIndex === null) return;
    if (reflectionIndex < selectedReflectionKeys.length - 1) {
      setReflectionIndex(reflectionIndex + 1);
      window.requestAnimationFrame(() => sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return;
    }
    setReflectionIndex(null);
    moveToStep(3);
  }

  function selectNextStep(value: string) {
    setNextStepChoice(value);
    setDraftField("chosenNextStep", value === "none" ? null : value);
  }

  async function saveCheckin() {
    return hasSavedCheckin ? onUpdateCandidate() : onSaveCandidate();
  }

  return (
    <section ref={sectionRef} className="scroll-mt-3 rounded-3xl bg-white p-4 shadow-sm sm:p-8">
      <div className="sticky top-3 z-20 -mx-1 rounded-2xl border border-emerald-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:mx-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Guided check-in</p>
            <p className="mt-1 text-sm font-bold text-slate-500">Step {step} of 4</p>
          </div>
          {step > 1 ? <button type="button" onClick={() => { if (step === 2 && reflectionIndex !== null) setReflectionIndex(null); else moveToStep(step - 1); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">Back</button> : null}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2" aria-label={`Step ${step} of 4`}>
          {[1, 2, 3, 4].map((segment) => <span key={segment} className={`h-1.5 rounded-full transition-all duration-500 ${segment <= step ? "bg-emerald-600" : "bg-slate-200"}`} />)}
        </div>
      </div>

      {step === 1 ? (
        <div className="mt-6 thrive-step-arrive">
          <h2 className="text-2xl font-black">How are things feeling today?</h2>
          <p className="mt-2 text-slate-600">Choose the closest answer.</p>
          <div className="mt-6"><ChoiceGroup label="Overall day" value={overallDay} choices={overallChoices} onChange={(value) => setDraftField("overallDay", value || null)} optional={false} /></div>
          {overallDay ? <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-emerald-950"><p className="font-black">{getOverallAcknowledgement(overallDay)}</p></div> : null}
          <button type="button" disabled={!overallDay} onClick={() => moveToStep(2)} className={`mt-6 rounded-2xl px-5 py-3 font-black ${overallDay ? "bg-emerald-700 text-white hover:bg-emerald-800" : "cursor-not-allowed bg-slate-200 text-slate-500"}`}>Continue</button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-6 thrive-step-arrive">
          {reflectionIndex === null ? (
            <>
              <div>
                <h2 className="text-2xl font-black">Anything you want to look at closer?</h2>
                <p className="mt-2 text-slate-600">Optional. Pick every area you want to answer, then continue.</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {reflectionGroups.map((group) => {
                  const selected = selectedReflectionKeys.includes(group.key);
                  const savedValue = reflections[group.key];
                  return (
                    <button key={group.key} type="button" aria-pressed={selected} onClick={() => toggleReflection(group.key)} className={`relative flex min-h-20 flex-col justify-center rounded-2xl border px-4 py-3 text-center transition active:scale-[0.985] ${group.key === "support_needed" ? "col-span-2" : ""} ${selected ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                      {selected ? <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white">✓</span> : null}
                      <p className="font-black text-slate-950">{group.label}</p>
                      {savedValue ? <p className="mt-1 text-xs font-bold text-emerald-800">{formatValue(savedValue)}</p> : null}
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => moveToStep(3)} className="rounded-2xl border border-slate-200 px-5 py-3 font-black text-slate-700">Skip</button>
                <button type="button" disabled={selectedReflectionKeys.length === 0} onClick={beginReflections} className={`flex-1 rounded-2xl px-5 py-3 font-black ${selectedReflectionKeys.length > 0 ? "bg-emerald-700 text-white" : "cursor-not-allowed bg-slate-200 text-slate-500"}`}>{selectedReflectionKeys.length > 0 ? `Answer ${selectedReflectionKeys.length} area${selectedReflectionKeys.length === 1 ? "" : "s"}` : "Choose areas"}</button>
              </div>
            </>
          ) : activeReflection && activeReflectionKey ? (
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div><p className="text-xs font-black uppercase tracking-wide text-emerald-700">Area {reflectionIndex + 1} of {selectedReflectionKeys.length}</p><p className="mt-1 font-black text-slate-950">{activeReflection.label}</p></div>
                <span className="text-xs font-bold text-slate-500">{reflectionValues.length}/{selectedReflectionKeys.length} answered</span>
              </div>
              <ChoiceGroup label={activeReflection.prompt} value={reflections[activeReflection.key]} choices={activeReflection.choices} onChange={(value) => setReflection(activeReflection.key, value)} optional={false} />
              <button type="button" disabled={!activeReflectionValue} onClick={advanceReflection} className={`mt-5 w-full rounded-2xl px-5 py-3 font-black ${activeReflectionValue ? "bg-emerald-700 text-white" : "cursor-not-allowed bg-slate-200 text-slate-500"}`}>{reflectionIndex < selectedReflectionKeys.length - 1 ? "Next area" : "Continue"}</button>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6 thrive-step-arrive">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">THRIVE noticed</p>
            <h2 className="mt-2 text-2xl font-black">{guidance.headline}</h2>
            <div className="mt-4 space-y-3">
              {guidance.observations.map((observation) => (
                <p key={observation} className="text-base font-bold leading-7">{observation}</p>
              ))}
            </div>
          </div>

          <h2 className="mt-7 text-2xl font-black">{guidance.prompt}</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">Based on what you just recorded, these are the closest fits.</p>

          <div className="mt-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Recommended</p>
            <div className="mt-3 grid gap-3">
              {guidance.recommendedActions.map((action) => {
                const selected = nextStepChoice === action.value;
                return (
                  <button key={action.value} type="button" aria-pressed={selected} onClick={() => selectNextStep(action.value)} className={`rounded-2xl border px-5 py-4 text-left transition active:scale-[0.985] ${selected ? "border-emerald-600 bg-emerald-100 text-emerald-950" : "border-slate-200 bg-white text-slate-800"}`}>
                    <span className="block font-black">{action.label}</span>
                    <span className="mt-1 block text-sm font-semibold leading-6 text-slate-500">{action.reason}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {guidance.moreActions.length > 0 ? (
            <details className="mt-5 rounded-2xl border border-slate-200 bg-slate-50">
              <summary className="cursor-pointer list-none px-5 py-4 font-black text-slate-800">More options <span className="ml-1 text-emerald-700">⌄</span></summary>
              <div className="grid gap-3 border-t border-slate-200 p-4">
                {guidance.moreActions.map((action) => {
                  const selected = nextStepChoice === action.value;
                  return (
                    <button key={action.value} type="button" aria-pressed={selected} onClick={() => selectNextStep(action.value)} className={`rounded-2xl border px-4 py-4 text-left transition active:scale-[0.985] ${selected ? "border-emerald-600 bg-emerald-100 text-emerald-950" : "border-slate-200 bg-white text-slate-800"}`}>
                      <span className="block font-black">{action.label}</span>
                      <span className="mt-1 block text-sm font-semibold leading-6 text-slate-500">{action.reason}</span>
                    </button>
                  );
                })}
              </div>
            </details>
          ) : null}

          <button type="button" disabled={!nextStepChoice} onClick={() => moveToStep(4)} className={`mt-5 w-full rounded-2xl px-5 py-3 font-black ${nextStepChoice ? "bg-emerald-700 text-white" : "cursor-not-allowed bg-slate-200 text-slate-500"}`}>Continue</button>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="mt-6 thrive-step-arrive">
          <h2 className="text-2xl font-black">Add a note</h2>
          <p className="mt-2 text-sm text-slate-500">Optional.</p>
          <textarea id="wellness-note" value={note} maxLength={2000} onChange={(event) => setDraftField("participantNote", event.target.value)} rows={4} className="mt-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" placeholder="Write or talk if there is something worth remembering" />
          <div className="mt-6 rounded-3xl bg-emerald-50 p-5"><p className="text-xs font-black uppercase tracking-wide text-emerald-700">Overall day</p><p className="mt-2 text-3xl font-black text-emerald-950">{formatValue(overallDay)}</p></div>
          {reviewDetails.length > 0 ? <div className="mt-4 flex flex-wrap gap-2">{reviewDetails.map((group) => <span key={group.key} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">{group.label}: {formatValue(reflections[group.key])}</span>)}</div> : null}
          {nextStep ? <div className="mt-4 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-slate-500">Next step</p><p className="mt-2 font-black text-slate-950">{formatValue(nextStep)}</p></div> : null}
          {nextStepChoice === "none" ? <div className="mt-4 rounded-2xl bg-slate-50 p-4 font-bold text-slate-700">Nothing right now</div> : null}
          <button type="button" disabled={!writeEnabled} onClick={() => { void saveCheckin(); }} className={`mt-6 w-full rounded-2xl px-5 py-4 font-black ${writeEnabled ? "bg-emerald-700 text-white" : "cursor-not-allowed bg-slate-300 text-slate-600"}`}>{writeEnabled ? (hasSavedCheckin ? "Update check-in" : "Save check-in") : "Save check-in unavailable"}</button>
          {actionMessage ? <p className="mt-3 text-sm font-bold text-amber-900">{actionMessage}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
