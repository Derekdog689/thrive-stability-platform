import type { WellnessDraft } from "./useWellnessCheckinCandidate";
import type { WellnessReflectionKey } from "./wellnessFlowMachine";

export type WellnessReflectionChoice = {
  label: string;
  value: string;
};

export type WellnessReflectionConfig = {
  key: WellnessReflectionKey;
  label: string;
  icon: string;
  accent: string;
  soft: string;
  prompt: string;
  choices: WellnessReflectionChoice[];
};

export const WELLNESS_REFLECTIONS: WellnessReflectionConfig[] = [
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

export const WELLNESS_REFLECTION_BY_KEY = Object.fromEntries(
  WELLNESS_REFLECTIONS.map((item) => [item.key, item]),
) as Record<WellnessReflectionKey, WellnessReflectionConfig>;

export function getReflectionValue(
  draft: WellnessDraft,
  key: WellnessReflectionKey,
): string | null {
  switch (key) {
    case "stress":
      return draft.stress;
    case "sleep":
      return draft.sleep;
    case "energy":
      return draft.energy;
    case "confidence":
      return draft.confidence;
    case "routine":
      return draft.routine;
    case "recovery_support":
      return draft.recoverySupport;
    case "support_needed":
      return draft.supportNeeded;
  }
}

export function setReflectionValue(
  draft: WellnessDraft,
  key: WellnessReflectionKey,
  value: string | null,
): WellnessDraft {
  switch (key) {
    case "stress":
      return { ...draft, stress: value };
    case "sleep":
      return { ...draft, sleep: value };
    case "energy":
      return { ...draft, energy: value };
    case "confidence":
      return { ...draft, confidence: value };
    case "routine":
      return { ...draft, routine: value };
    case "recovery_support":
      return { ...draft, recoverySupport: value };
    case "support_needed":
      return { ...draft, supportNeeded: value };
  }
}

export function formatReflectionValue(value: string | null | undefined) {
  if (!value) return "Not selected";
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}
