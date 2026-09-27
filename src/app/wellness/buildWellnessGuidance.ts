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

type Signal = {
  label: string;
  value: string;
  phrase: string;
  priority: number;
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

function currentSignals(draft: WellnessDraft): Signal[] {
  const signals: Signal[] = [];

  function add(label: string, value: string | null, phrase: string, priority: number) {
    if (!value) return;
    signals.push({ label, value, phrase, priority });
  }

  if (draft.stress === "high") add("Stress", draft.stress, "stress is high", 4);
  else if (draft.stress === "not_sure") add("Stress", draft.stress, "stress is uncertain", 2);

  if (draft.sleep === "poor") add("Sleep", draft.sleep, "sleep is poor", 3);
  else if (draft.sleep === "not_sure") add("Sleep", draft.sleep, "sleep is uncertain", 2);

  if (draft.energy === "low") add("Energy", draft.energy, "energy is low", 3);
  else if (draft.energy === "not_sure") add("Energy", draft.energy, "energy is uncertain", 2);

  if (draft.confidence === "low") add("Confidence", draft.confidence, "confidence is low", 4);
  else if (draft.confidence === "not_sure") add("Confidence", draft.confidence, "confidence is uncertain", 2);

  if (draft.routine === "off_track") add("Routine", draft.routine, "routine feels off track", 4);
  else if (draft.routine === "mixed") add("Routine", draft.routine, "routine feels mixed", 2);
  else if (draft.routine === "not_sure") add("Routine", draft.routine, "routine is uncertain", 2);

  if (draft.recoverySupport === "could_use_support") {
    add("Recovery support", draft.recoverySupport, "recovery support could use more attention", 5);
  } else if (draft.recoverySupport === "not_sure") {
    add("Recovery support", draft.recoverySupport, "recovery support is uncertain", 2);
  }

  if (draft.supportNeeded === "yes") add("Support", draft.supportNeeded, "you said support would help", 6);
  else if (draft.supportNeeded === "not_sure") add("Support", draft.supportNeeded, "you are not sure whether support would help", 3);

  return signals.sort((a, b) => b.priority - a.priority);
}

function joinPhrases(phrases: string[]) {
  if (phrases.length === 0) return "";
  if (phrases.length === 1) return phrases[0];
  if (phrases.length === 2) return `${phrases[0]} and ${phrases[1]}`;
  return `${phrases.slice(0, -1).join(", ")}, and ${phrases.at(-1)}`;
}

function buildCurrentSummary(draft: WellnessDraft) {
  const signals = currentSignals(draft);
  const overall = draft.overallDay ? plainValue(draft.overallDay) : null;

  if (signals.length > 0) {
    const unresolved = joinPhrases(signals.slice(0, 3).map((signal) => signal.phrase));
    return overall
      ? `You’re ${overall} overall, but ${unresolved}.`
      : `A few things stand out right now: ${unresolved}.`;
  }

  const selected = dimensions
    .map((dimension) => {
      const value = draftValue(draft, dimension.draftKey);
      return value ? { label: dimension.label.toLowerCase(), value: plainValue(value) } : null;
    })
    .filter((item): item is { label: string; value: string } => Boolean(item));

  if (overall && selected.length > 0) {
    return `You’re ${overall} overall, and ${selected[0].label} is ${selected[0].value} too.`;
  }

  if (overall) return `You’re ${overall} overall right now.`;
  if (selected.length > 0) return `${selected[0].label.replace(/^./, (letter) => letter.toUpperCase())} is ${selected[0].value} right now.`;
  return "You completed the main check-in.";
}

function buildActions(draft: WellnessDraft) {
  const signals = currentSignals(draft);
  const actions: WellnessGuidanceAction[] = [];
  const seen = new Set<string>();

  function add(action: WellnessGuidanceAction) {
    if (seen.has(action.value)) return;
    seen.add(action.value);
    actions.push(action);
  }

  const confidenceLow = draft.confidence === "low";
  const energyUncertain = draft.energy === "not_sure";
  const routineOff = draft.routine === "off_track" || draft.routine === "mixed";
  const recoverySupport = draft.recoverySupport === "could_use_support";

  if (draft.supportNeeded === "yes") {
    add({
      value: "ask_for_help",
      label: "Ask THRIVE Support to help you sort this out",
      reason: confidenceLow
        ? "You said support would help, and confidence is low right now."
        : "You said support would help right now.",
    });
  }

  if (recoverySupport) {
    add({
      value: "contact_supportive_person",
      label: "Reach out to one supportive person",
      reason: confidenceLow
        ? "You said recovery support could help, and confidence is low right now."
        : energyUncertain
          ? "You said recovery support could help, and energy is uncertain right now."
          : "You marked recovery support as something you could use right now.",
    });
  }

  if (routineOff) {
    add({
      value: "choose_one_task",
      label: "Restart one part of your routine",
      reason: confidenceLow
        ? "Routine feels off track and confidence is low, so one small anchor may be easier to test than fixing the whole day."
        : "Routine feels off track or mixed, so one small anchor may help you get the day moving.",
    });
  }

  if (confidenceLow && !routineOff) {
    add({
      value: "choose_one_task",
      label: "Pick one small thing you can finish",
      reason: "Confidence is low right now, so a small completed step may give you something concrete to build from.",
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

  if (draft.energy === "not_sure" && actions.length === 0) {
    add({
      value: "food_water_rest",
      label: "Check one basic need before deciding what comes next",
      reason: "Energy is uncertain right now, so food, water, rest, or a little movement can give you a clearer read.",
    });
  }

  if (draft.overallDay === "hard" || draft.overallDay === "not_sure") {
    add({
      value: "choose_one_task",
      label: "Choose one thing you can complete next",
      reason: `You marked things as ${plainValue(draft.overallDay)} overall, so a smaller next move may be easier to test.`,
    });
  }

  if (actions.length === 0 && (draft.overallDay === "good" || draft.overallDay === "okay")) {
    add({
      value: "review_today_plan",
      label: "Pick one thing you want to keep steady for the next few hours",
      reason: `Your overall check-in is ${plainValue(draft.overallDay)} and no stronger unresolved signal is showing up.`,
    });
  }

  if (actions.length === 0) {
    add({
      value: "choose_one_task",
      label: "Pick one useful thing you can finish",
      reason: "A concrete next step can be easier to evaluate than trying to solve everything at once.",
    });
  }

  if (!seen.has("contact_supportive_person") && signals.some((signal) => signal.priority >= 4)) {
    add({
      value: "contact_supportive_person",
      label: "Talk to one supportive person",
      reason: "Another person may help you get perspective on the areas that still feel unsettled.",
    });
  }

  if (!seen.has("food_water_rest") && (draft.energy === "not_sure" || draft.energy === "low" || draft.sleep === "poor")) {
    add({
      value: "food_water_rest",
      label: "Handle one basic need",
      reason: "Food, water, rest, or movement can be a simple second option while you notice what changes.",
    });
  }

  if (!seen.has("choose_one_task") && (routineOff || confidenceLow)) {
    add({
      value: "choose_one_task",
      label: "Pick one useful thing you can finish",
      reason: "One small completed step can give you something concrete to work from.",
    });
  }

  const primarySuggestion = actions[0];
  const relevantAlternatives = actions.slice(1, 3);
  const nothingRightNow: WellnessGuidanceAction = {
    value: "nothing_right_now",
    label: "Save this and come back later",
    reason: "You can record the moment without taking another action right now.",
  };

  return {
    primarySuggestion,
    otherSuggestions: [...relevantAlternatives, nothingRightNow],
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
    (draft.confidence === "low" || draft.energy === "not_sure" || draft.supportNeeded === "yes" || draft.supportNeeded === "not_sure")
  ) {
    const companions: string[] = [];
    if (draft.confidence === "low") companions.push("confidence is low");
    if (draft.energy === "not_sure") companions.push("energy is uncertain");
    if (draft.supportNeeded === "yes") companions.push("you said support would help");
    if (draft.supportNeeded === "not_sure") companions.push("you are not sure whether support would help");

    return {
      text: "Recovery support is one of the clearest unsettled areas right now, and it may be worth looking at alongside the other signals you marked.",
      why: `You marked recovery support as something you could use, and ${joinPhrases(companions)}.`,
    };
  }

  return null;
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
    const prior = rowValue(latest, dimension.rowKey);
    if (!current || !prior) continue;

    if (current === prior) {
      steady.push(`${dimension.label.toLowerCase()} is still ${plainValue(current)}`);
    } else {
      changes.push(
        `${dimension.label.toLowerCase()} moved from ${plainValue(prior)} to ${plainValue(current)}`,
      );
    }
  }

  if (experienceMode === "same_day") {
    if (changes.length === 0 && steady.length > 0) {
      return {
        text: `Not much has changed since earlier. ${steady.slice(0, 2).join(", and ")}.`,
        followUpQuestion: null,
      };
    }

    if (changes.length > 0 && steady.length === 0) {
      return {
        text: `A little has shifted since earlier. ${changes.slice(0, 2).join(", and ")}.`,
        followUpQuestion: "What do you think changed between then and now?",
      };
    }

    if (changes.length > 0 && steady.length > 0) {
      return {
        text: `It’s a mixed picture since earlier. ${changes[0]}, while ${steady[0]}.`,
        followUpQuestion: "What do you think changed between then and now?",
      };
    }
  }

  if (changes.length === 0 && steady.length > 0) {
    return {
      text: `You’re starting from a similar place to your last check-in. ${steady.slice(0, 2).join(", and ")}.`,
      followUpQuestion: null,
    };
  }

  if (changes.length > 0 && steady.length === 0) {
    return {
      text: `This check-in feels different from where you left off last time. ${changes.slice(0, 2).join(", and ")}.`,
      followUpQuestion: "What feels different today?",
    };
  }

  if (changes.length > 0 && steady.length > 0) {
    return {
      text: `Some things changed since your last check-in while others stayed steady. ${changes[0]}, while ${steady[0]}.`,
      followUpQuestion: "What feels different today?",
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
  const signals = currentSignals(draft);
  const currentSummary = buildCurrentSummary(draft);
  const history = buildHistorySummary(draft, latest, experienceMode);
  const connection = buildPossibleConnection(draft);
  const actionGroups = buildActions(draft);

  const currentEvidence = signals.slice(0, 3).map((signal) => signal.phrase);

  let whyShown = connection?.why ?? "";

  if (!whyShown && currentEvidence.length > 0) {
    whyShown = `THRIVE is showing this because ${joinPhrases(currentEvidence)}.`;
  }

  if (!whyShown && history.text) {
    const evidence: string[] = [];
    if (draft.overallDay && latest?.overall_day) {
      evidence.push(
        `last time you marked things ${plainValue(latest.overall_day)} and right now you marked ${plainValue(draft.overallDay)}`,
      );
    }

    for (const dimension of dimensions) {
      if (evidence.length >= 2) break;
      const current = draftValue(draft, dimension.draftKey);
      const prior = rowValue(latest, dimension.rowKey);
      if (!current || !prior) continue;
      evidence.push(
        `${dimension.label.toLowerCase()} was ${plainValue(prior)} and is ${plainValue(current)} now`,
      );
    }

    whyShown = evidence.length > 0
      ? `THRIVE is showing this because ${joinPhrases(evidence)}.`
      : "This is based on your current check-in and the most recent Wellness check-in available.";
  }

  if (!whyShown) {
    whyShown = draft.overallDay
      ? `You marked things as ${plainValue(draft.overallDay)} overall right now.`
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
