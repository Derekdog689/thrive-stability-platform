import type { WellnessDraft, WellnessCheckinRow } from "./useWellnessCheckinCandidate";

export type WellnessExperienceMode = "first" | "later" | "same_day";

export type WellnessGuidanceAction = {
  value: string;
  label: string;
  reason: string;
};

export type WellnessGuidance = {
  headline: string;
  summary: string;
  historySummary: string | null;
  possibleConnection: string | null;
  whyShown: string;
  primarySuggestion: WellnessGuidanceAction;
  otherSuggestions: WellnessGuidanceAction[];
  followUpQuestion: string | null;
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
      label: "Reach out to one supportive person",
      reason: "You marked recovery support as something you could use right now.",
    });
  }

  if (draft.supportNeeded === "yes" || draft.supportNeeded === "not_sure") {
    add({
      value: "ask_for_help",
      label: "Ask THRIVE Support to help you sort this out",
      reason:
        draft.supportNeeded === "yes"
          ? "You said support would help right now."
          : "You are not sure whether support would help, so bringing another person in is one option.",
    });
  }

  if (
    (draft.confidence === "low" || draft.confidence === "not_sure") &&
    (draft.routine === "off_track" || draft.routine === "mixed")
  ) {
    add({
      value: "choose_one_task",
      label: "Pick one task you can finish before deciding what comes next",
      reason: "You marked confidence as unsettled and routine as off track or mixed.",
    });
  }

  if (draft.stress === "high") {
    add({
      value: "take_a_break",
      label: "Take ten quiet minutes before adding another task",
      reason: "You marked stress as high right now.",
    });
  }

  if (draft.sleep === "poor" || draft.energy === "low") {
    add({
      value: "food_water_rest",
      label: "Take care of one basic need first",
      reason:
        draft.sleep === "poor" && draft.energy === "low"
          ? "You marked sleep as poor and energy as low."
          : draft.sleep === "poor"
            ? "You marked sleep as poor."
            : "You marked energy as low.",
    });
  }

  if (draft.overallDay === "hard" || draft.overallDay === "not_sure") {
    add({
      value: "choose_one_task",
      label: "Choose one thing you can complete in the next part of the day",
      reason: `You marked things as ${plainValue(draft.overallDay)} right now, so a smaller next move may be easier to test.`,
    });
  }

  if (draft.overallDay === "good" || draft.overallDay === "okay") {
    add({
      value: "review_today_plan",
      label: "Pick one thing you want to keep steady for the next few hours",
      reason: `Your overall check-in is ${plainValue(draft.overallDay)} right now.`,
    });
  }

  const defaults: WellnessGuidanceAction[] = [
    {
      value: "choose_one_task",
      label: "Pick one useful thing you can finish",
      reason: "A concrete next step can be easier to evaluate than trying to solve everything at once.",
    },
    {
      value: "contact_supportive_person",
      label: "Talk to one supportive person",
      reason: "Another person may help you get perspective without deciding the answer for you.",
    },
    {
      value: "ask_for_help",
      label: "Ask THRIVE Support",
      reason: "Use Support when you want another person in the loop.",
    },
    {
      value: "food_water_rest",
      label: "Handle one basic need",
      reason: "Food, water, rest, or movement can be a simple place to start.",
    },
    {
      value: "take_a_break",
      label: "Pause for ten minutes",
      reason: "A short reset can create space before you choose what comes next.",
    },
    {
      value: "review_today_plan",
      label: "Choose one thing to keep steady",
      reason: "Pick one part of the day you want to protect or continue.",
    },
    {
      value: "other",
      label: "Try something else",
      reason: "Choose a different next step that fits your situation better.",
    },
    {
      value: "none",
      label: "Save this and come back later",
      reason: "You can record the moment without taking another action right now.",
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
      text: "Poor sleep and low energy are showing up together and may be worth looking at together.",
      why: "You marked sleep as poor and energy as low in this check-in.",
    };
  }

  if (draft.stress === "high" && draft.energy === "low") {
    return {
      text: "High stress and low energy are showing up together and may be worth looking at together.",
      why: "You marked stress as high and energy as low in this check-in.",
    };
  }

  if (
    (draft.routine === "off_track" || draft.routine === "mixed") &&
    (draft.confidence === "low" || draft.confidence === "not_sure")
  ) {
    return {
      text: "Routine and confidence are both unsettled right now and may be worth looking at together.",
      why: `You marked routine as ${plainValue(draft.routine)} and confidence as ${plainValue(draft.confidence)}.`,
    };
  }

  if (
    draft.recoverySupport === "could_use_support" &&
    (draft.supportNeeded === "yes" || draft.supportNeeded === "not_sure")
  ) {
    return {
      text: "Recovery support and your need for support are both showing up right now and may be worth considering together.",
      why: `You marked recovery support as could use support and support as ${plainValue(draft.supportNeeded)}.`,
    };
  }

  return null;
}

function buildCurrentSummary(draft: WellnessDraft) {
  const details = dimensions
    .map((dimension) => {
      const value = draftValue(draft, dimension.draftKey);
      return value ? { label: dimension.label.toLowerCase(), value: plainValue(value) } : null;
    })
    .filter((item): item is { label: string; value: string } => Boolean(item));

  if (!draft.overallDay && details.length === 0) {
    return "You completed the main check-in.";
  }

  if (!draft.overallDay) {
    const first = details[0];
    return first ? `${first.label.replace(/^./, (letter) => letter.toUpperCase())} is ${first.value} right now.` : "You completed the main check-in.";
  }

  if (details.length === 0) {
    return `You’re at ${plainValue(draft.overallDay)} right now.`;
  }

  const first = details[0];
  return `You’re at ${plainValue(draft.overallDay)} right now, and ${first.label} is ${first.value} too.`;
}

function buildHistorySummary(
  draft: WellnessDraft,
  latest: WellnessCheckinRow | null,
  experienceMode: WellnessExperienceMode,
) {
  if (!latest || experienceMode === "first") {
    return { text: null, followUpQuestion: null };
  }

  const changes: string[] = [];
  const steady: string[] = [];

  if (draft.overallDay && latest.overall_day) {
    if (draft.overallDay === latest.overall_day) {
      steady.push(`overall is still ${plainValue(draft.overallDay)}`);
    } else {
      changes.push(
        `overall moved from ${plainValue(latest.overall_day)} to ${plainValue(draft.overallDay)}`,
      );
    }
  }

  for (const dimension of dimensions) {
    const current = draftValue(draft, dimension.draftKey);
    const prior = latest ? rowValue(latest, dimension.rowKey) : null;
    if (!current || !prior) continue;

    if (current === prior) {
      steady.push(`${dimension.label.toLowerCase()} is still ${plainValue(current)}`);
    } else {
      changes.push(
        `${dimension.label.toLowerCase()} moved from ${plainValue(prior)} to ${plainValue(current)}`,
      );
    }
  }

  const when = experienceMode === "same_day" ? "earlier" : "your last check-in";

  if (changes.length === 0 && steady.length > 0) {
    return {
      text: `Not much has changed since ${when}. ${steady.slice(0, 2).join(", and ")}.`,
      followUpQuestion: null,
    };
  }

  if (changes.length > 0 && steady.length === 0) {
    return {
      text: `A little has shifted since ${when}. ${changes.slice(0, 2).join(", and ")}.`,
      followUpQuestion:
        experienceMode === "same_day"
          ? "What do you think changed between then and now?"
          : "What do you think may have contributed to that shift?",
    };
  }

  if (changes.length > 0 && steady.length > 0) {
    return {
      text: `It’s a mixed picture since ${when}. ${changes[0]}, while ${steady[0]}.`,
      followUpQuestion:
        experienceMode === "same_day"
          ? "What do you think changed between then and now?"
          : null,
    };
  }

  return { text: null, followUpQuestion: null };
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
  const currentSummary = buildCurrentSummary(draft);
  const history = buildHistorySummary(draft, latest, experienceMode);
  const connection = buildPossibleConnection(draft);
  const actionGroups = buildActions(draft);

  let whyShown = connection?.why ?? "";

  if (!whyShown && history.text) {
    const evidence: string[] = [];
    if (draft.overallDay && latest?.overall_day) {
      evidence.push(
        `Earlier you marked things ${plainValue(latest.overall_day)}; right now you marked ${plainValue(draft.overallDay)}`,
      );
    }

    for (const dimension of dimensions) {
      if (evidence.length >= 2) break;
      const current = draftValue(draft, dimension.draftKey);
      const prior = latest ? rowValue(latest, dimension.rowKey) : null;
      if (!current || !prior) continue;
      evidence.push(
        `${dimension.label} was ${plainValue(prior)} and is ${plainValue(current)} now`,
      );
    }

    whyShown = evidence.length > 0
      ? `${evidence.join(". ")}.`
      : "This is based on your current check-in and the most recent Wellness check-in available.";
  }

  if (!whyShown) {
    whyShown = draft.overallDay
      ? `You marked things as ${plainValue(draft.overallDay)} right now.`
      : "This is based on what you recorded in this check-in.";
  }

  return {
    headline: experienceMode === "first" ? "Here’s where you are right now" : "Here’s what THRIVE is noticing",
    summary: currentSummary,
    historySummary: history.text,
    possibleConnection: connection?.text ?? null,
    whyShown,
    followUpQuestion: history.followUpQuestion,
    ...actionGroups,
  };
}
