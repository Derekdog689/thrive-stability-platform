import type { WellnessDraft, WellnessCheckinRow } from "./useWellnessCheckinCandidate";

export type WellnessExperienceMode = "first" | "later" | "same_day";

export type WellnessGuidanceAction = {
  value: string;
  label: string;
  reason: string;
};

export type WellnessGuidance = {
  headline: string;
  currentFacts: string[];
  historySignals: string[];
  possibleConnection: string | null;
  whyShown: string;
  primarySuggestion: WellnessGuidanceAction;
  otherSuggestions: WellnessGuidanceAction[];
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

function buildActions(draft: WellnessDraft) {
  const actions: WellnessGuidanceAction[] = [];
  const seen = new Set<string>();

  function add(action: WellnessGuidanceAction) {
    if (seen.has(action.value)) return;
    seen.add(action.value);
    actions.push(action);
  }

  if (draft.recoverySupport === "could_use_support") {
    add({
      value: "contact_supportive_person",
      label: "Reconnect with recovery support",
      reason: "Reach out to someone or something that helps you stay connected.",
    });
  }

  if (draft.supportNeeded === "yes" || draft.supportNeeded === "not_sure") {
    add({
      value: "ask_for_help",
      label: "Get help sorting out what needs attention",
      reason: "Use THRIVE Support when you want another person in the loop.",
    });
  }

  if (
    draft.confidence === "low" ||
    draft.confidence === "not_sure" ||
    draft.routine === "off_track" ||
    draft.routine === "mixed"
  ) {
    add({
      value: "choose_one_task",
      label: "Choose one manageable thing",
      reason: "Shrink the next move instead of trying to solve everything at once.",
    });
  }

  if (draft.stress === "high") {
    add({
      value: "take_a_break",
      label: "Take a short reset",
      reason: "Step away briefly before deciding what deserves your attention next.",
    });
  }

  if (draft.sleep === "poor" || draft.energy === "low") {
    add({
      value: "food_water_rest",
      label: "Take care of a basic need first",
      reason: "Food, water, rest, or a little movement may be a useful next move.",
    });
  }

  if (draft.overallDay === "hard" || draft.overallDay === "not_sure") {
    add({
      value: "choose_one_task",
      label: "Choose the next manageable thing",
      reason: "Focus on one move you can actually complete.",
    });
    add({
      value: "ask_for_help",
      label: "Ask THRIVE Support to help you sort this out",
      reason: "You do not have to decide the whole path before asking for support.",
    });
  }

  if (draft.overallDay === "good" || draft.overallDay === "okay") {
    add({
      value: "review_today_plan",
      label: "Look over what you want to keep moving",
      reason: "Use what is working and decide what deserves attention next.",
    });
  }

  const defaults: WellnessGuidanceAction[] = [
    {
      value: "choose_one_task",
      label: "Pick one useful thing",
      reason: "Choose one concrete task and make that the next move.",
    },
    {
      value: "contact_supportive_person",
      label: "Talk to someone supportive",
      reason: "Reach out if another person would help.",
    },
    {
      value: "ask_for_help",
      label: "Ask THRIVE Support",
      reason: "Bring another person into what you are trying to sort out.",
    },
    {
      value: "food_water_rest",
      label: "Handle a basic need",
      reason: "Take care of food, water, rest, or movement before adding another task.",
    },
    {
      value: "take_a_break",
      label: "Pause for a few minutes",
      reason: "Give yourself a short reset before choosing the next move.",
    },
    {
      value: "review_today_plan",
      label: "Look over today's plan",
      reason: "See what is already in motion before adding something new.",
    },
    {
      value: "other",
      label: "Something else",
      reason: "Keep the check-in and choose a different next step.",
    },
    {
      value: "none",
      label: "Save this and come back later",
      reason: "You can record the check-in without taking another action right now.",
    },
  ];

  for (const action of defaults) add(action);

  return {
    primarySuggestion: actions[0],
    otherSuggestions: actions.slice(1),
  };
}

function buildPossibleConnection(draft: WellnessDraft) {
  if (draft.sleep === "poor" && draft.energy === "low") {
    return {
      text: "Poor sleep and low energy are appearing together and may be worth looking at together.",
      why: "THRIVE is showing this because you marked sleep as poor and energy as low in this check-in.",
    };
  }

  if (draft.stress === "high" && draft.energy === "low") {
    return {
      text: "High stress and low energy are appearing together and may be worth looking at together.",
      why: "THRIVE is showing this because you marked stress as high and energy as low in this check-in.",
    };
  }

  if (
    (draft.routine === "off_track" || draft.routine === "mixed") &&
    (draft.confidence === "low" || draft.confidence === "not_sure")
  ) {
    return {
      text: "Routine and confidence are both showing up as unsettled and may be worth looking at together.",
      why: "THRIVE is showing this because both routine and confidence stood out in this check-in.",
    };
  }

  if (
    draft.recoverySupport === "could_use_support" &&
    (draft.supportNeeded === "yes" || draft.supportNeeded === "not_sure")
  ) {
    return {
      text: "Recovery support and your need for support are both showing up right now and may be worth considering together.",
      why: "THRIVE is showing this because both recovery support and support needs came up in this check-in.",
    };
  }

  return null;
}

export function buildWellnessGuidance(
  draft: WellnessDraft,
  recentCheckins: WellnessCheckinRow[],
  experienceMode: WellnessExperienceMode,
): WellnessGuidance {
  const priorRows = recentCheckins
    .filter((row) => row.status === "active")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const latest = priorRows[0] ?? null;
  const currentFacts: string[] = [];
  const historySignals: string[] = [];

  if (draft.overallDay) {
    currentFacts.push(`Right now, you marked things as ${plainValue(draft.overallDay)}.`);
  }

  for (const dimension of dimensions) {
    if (currentFacts.length >= 3) break;
    const current = draftValue(draft, dimension.draftKey);
    if (!current) continue;
    currentFacts.push(`${dimension.label}: ${plainValue(current)}.`);
  }

  if (latest && experienceMode !== "first") {
    if (draft.overallDay && latest.overall_day) {
      if (latest.overall_day === draft.overallDay) {
        historySignals.push(
          experienceMode === "same_day"
            ? `Things overall are still ${plainValue(draft.overallDay)} since earlier today.`
            : `Things overall are still ${plainValue(draft.overallDay)} compared with your last check-in.`,
        );
      } else {
        historySignals.push(
          experienceMode === "same_day"
            ? `Things overall shifted from ${plainValue(latest.overall_day)} to ${plainValue(draft.overallDay)} since earlier today.`
            : `Things overall shifted from ${plainValue(latest.overall_day)} to ${plainValue(draft.overallDay)} since your last check-in.`,
        );
      }
    }

    for (const dimension of dimensions) {
      if (historySignals.length >= 2) break;

      const current = draftValue(draft, dimension.draftKey);
      if (!current) continue;

      const prior = rowValue(latest, dimension.rowKey);
      if (!prior) continue;

      if (prior === current) {
        historySignals.push(
          experienceMode === "same_day"
            ? `${dimension.label} is still ${plainValue(current)} since earlier today.`
            : `${dimension.label} is still ${plainValue(current)} compared with your last check-in.`,
        );
      } else {
        historySignals.push(
          experienceMode === "same_day"
            ? `${dimension.label} changed from ${plainValue(prior)} to ${plainValue(current)} since earlier today.`
            : `${dimension.label} changed from ${plainValue(prior)} to ${plainValue(current)} since your last check-in.`,
        );
      }
    }
  }

  if (historySignals.length < 2 && priorRows.length >= 2) {
    for (const dimension of dimensions) {
      if (historySignals.length >= 2) break;

      const current = draftValue(draft, dimension.draftKey);
      if (!current) continue;

      const priorMatches = priorRows.filter(
        (row) => rowValue(row, dimension.rowKey) === current,
      ).length;

      if (priorMatches >= 2) {
        const statement = `${dimension.label} has also been ${plainValue(current)} on several recent check-ins.`;
        if (!historySignals.includes(statement)) historySignals.push(statement);
      }
    }
  }

  if (currentFacts.length === 0) {
    currentFacts.push("You completed the main check-in.");
  }

  const connection = buildPossibleConnection(draft);
  const actionGroups = buildActions(draft);

  return {
    headline: experienceMode === "first" ? "Here’s what you recorded" : "Here’s what stands out",
    currentFacts,
    historySignals,
    possibleConnection: connection?.text ?? null,
    whyShown:
      connection?.why ??
      (historySignals.length > 0
        ? "THRIVE is showing this from your current check-in and your recent Wellness history."
        : "THRIVE is showing this from what you recorded in this check-in."),
    ...actionGroups,
  };
}
