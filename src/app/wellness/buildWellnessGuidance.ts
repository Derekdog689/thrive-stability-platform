import type { WellnessDraft, WellnessCheckinRow } from "./useWellnessCheckinCandidate";

export type WellnessGuidance = {
  headline: string;
  observations: string[];
  prompt: string;
};

type Dimension = {
  draftKey: keyof WellnessDraft;
  rowKey: keyof WellnessCheckinRow;
  label: string;
};

const dimensions: Dimension[] = [
  { draftKey: "stress", rowKey: "stress", label: "Stress" },
  { draftKey: "sleep", rowKey: "sleep", label: "Sleep" },
  { draftKey: "energy", rowKey: "energy", label: "Energy" },
  { draftKey: "confidence", rowKey: "confidence", label: "Confidence" },
  { draftKey: "routine", rowKey: "routine", label: "Routine" },
  { draftKey: "recoverySupport", rowKey: "recovery_support", label: "Recovery support" },
  { draftKey: "supportNeeded", rowKey: "support_needed", label: "Support" },
];

function plainValue(value: string) {
  return value.replaceAll("_", " ");
}

function rowValue(row: WellnessCheckinRow, key: keyof WellnessCheckinRow) {
  const value = row[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function draftValue(draft: WellnessDraft, key: keyof WellnessDraft) {
  const value = draft[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function buildWellnessGuidance(
  draft: WellnessDraft,
  recentCheckins: WellnessCheckinRow[],
): WellnessGuidance {
  const priorRows = recentCheckins
    .filter((row) => row.status === "active")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const latest = priorRows[0] ?? null;
  const observations: string[] = [];

  if (draft.overallDay) {
    if (latest?.overall_day && latest.overall_day !== draft.overallDay) {
      observations.push(
        `Overall day is different from your last check-in: ${plainValue(latest.overall_day)} → ${plainValue(draft.overallDay)}.`,
      );
    } else if (latest?.overall_day === draft.overallDay) {
      observations.push(`Overall day matches your last check-in: ${plainValue(draft.overallDay)}.`);
    } else {
      observations.push(`You marked your overall day as ${plainValue(draft.overallDay)}.`);
    }
  }

  const changed: string[] = [];
  const repeated: string[] = [];
  const currentOnly: string[] = [];

  for (const dimension of dimensions) {
    const current = draftValue(draft, dimension.draftKey);
    if (!current) continue;

    const prior = latest ? rowValue(latest, dimension.rowKey) : null;

    if (prior && prior !== current) {
      changed.push(`${dimension.label} changed from ${plainValue(prior)} to ${plainValue(current)}.`);
      continue;
    }

    if (prior === current) {
      repeated.push(`${dimension.label} is the same as your last check-in: ${plainValue(current)}.`);
      continue;
    }

    currentOnly.push(`${dimension.label}: ${plainValue(current)}.`);
  }

  for (const statement of [...changed, ...repeated, ...currentOnly]) {
    if (observations.length >= 2) break;
    observations.push(statement);
  }

  if (observations.length === 0) {
    observations.push("You completed the main check-in. There is not enough recent structured information to compare yet.");
  }

  return {
    headline: latest ? "Here’s what stands out" : "Here’s what you recorded",
    observations,
    prompt: "What would help you move from here?",
  };
}
