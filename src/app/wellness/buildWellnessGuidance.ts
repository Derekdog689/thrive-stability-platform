import type { WellnessDraft, WellnessCheckinRow } from "./useWellnessCheckinCandidate";

export type WellnessGuidanceAction = {
  value: string;
  label: string;
  reason: string;
};

export type WellnessGuidance = {
  headline: string;
  observations: string[];
  prompt: string;
  recommendedActions: WellnessGuidanceAction[];
  moreActions: WellnessGuidanceAction[];
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
      label: "Pick one small thing to finish",
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
      reason: "Food, water, rest, or a little movement may be the most useful next move.",
    });
  }

  if (draft.overallDay === "hard" || draft.overallDay === "not_sure") {
    add({
      value: "ask_for_help",
      label: "Ask THRIVE Support to help you sort this out",
      reason: "You do not have to decide the whole path before asking for support.",
    });
    add({
      value: "choose_one_task",
      label: "Choose the next manageable thing",
      reason: "Focus on one move you can actually complete.",
    });
  }

  if (draft.overallDay === "good" || draft.overallDay === "okay") {
    add({
      value: "review_today_plan",
      label: "Review what you want to keep moving today",
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
      reason: "Reach out instead of carrying the whole thing by yourself.",
    },
    {
      value: "ask_for_help",
      label: "Ask THRIVE Support",
      reason: "Bring a support person into what you are trying to sort out.",
    },
    {
      value: "food_water_rest",
      label: "Handle food, water, rest, or movement",
      reason: "Take care of something basic before adding another task.",
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
      label: "None of these fit",
      reason: "Keep the check-in, then describe the next step in your own words.",
    },
    {
      value: "none",
      label: "Save this and come back later",
      reason: "You can record the check-in without taking another action right now.",
    },
  ];

  for (const action of defaults) add(action);

  return {
    recommendedActions: actions.slice(0, 3),
    moreActions: actions.slice(3),
  };
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

  const actionGroups = buildActions(draft);

  return {
    headline: latest ? "Here’s what stands out" : "Here’s what you recorded",
    observations,
    prompt: "What sounds useful from here?",
    ...actionGroups,
  };
}
