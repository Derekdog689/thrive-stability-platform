import type { WellnessCheckinRow } from "./useWellnessCheckinCandidate";

export type ContextualWellnessReturnKind =
  | "support"
  | "next_step"
  | "repeat"
  | "change"
  | "mixed"
  | "confirmation";

export type ContextualWellnessReturn = {
  kind: ContextualWellnessReturnKind;
  headline: string;
  detail: string | null;
  choiceLabel: string | null;
  noteQuestion: string | null;
  noteResponse: string | null;
  actionLabel: string | null;
  actionHref: string | null;
};

const nextStepLabels: Record<string, string> = {
  review_today_plan: "Keep one thing steady",
  choose_one_task: "Do one useful thing",
  take_a_break: "Take a break",
  food_water_rest: "Handle a basic need",
  contact_supportive_person: "Talk to someone supportive",
  ask_for_help: "Ask THRIVE for help",
  other: "Something else",
  nothing_right_now: "Nothing right now",
};

function plainValue(value: string) {
  return value.replaceAll("_", " ");
}

function previousRows(
  todayCheckin: WellnessCheckinRow,
  recentCheckins: WellnessCheckinRow[],
) {
  return recentCheckins
    .filter(
      (row) =>
        row.id !== todayCheckin.id &&
        row.status === "active",
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

function choiceLabel(todayCheckin: WellnessCheckinRow) {
  if (todayCheckin.support_needed === "yes") {
    return "You said support would help.";
  }

  if (todayCheckin.chosen_next_step) {
    const label =
      nextStepLabels[todayCheckin.chosen_next_step] ??
      plainValue(todayCheckin.chosen_next_step);

    return `You chose ${label}.`;
  }

  return null;
}

function routeForChoice(todayCheckin: WellnessCheckinRow) {
  if (
    todayCheckin.support_needed === "yes" ||
    todayCheckin.chosen_next_step === "ask_for_help" ||
    todayCheckin.chosen_next_step === "contact_supportive_person"
  ) {
    return {
      actionLabel: "Open Support",
      actionHref: "/support",
    };
  }

  return {
    actionLabel: null,
    actionHref: null,
  };
}

function looksLikeQuestion(note: string | null) {
  if (!note) return false;
  const trimmed = note.trim();
  if (!trimmed) return false;
  if (trimmed.includes("?")) return true;
  return /^(how|what|why|where|when|who|can|could|should|do|does|is|are|would)/i.test(
    trimmed,
  );
}

function responseForQuestion(todayCheckin: WellnessCheckinRow) {
  switch (todayCheckin.chosen_next_step) {
    case "choose_one_task":
      return "Start smaller than the whole problem. Pick one thing you could finish or understand next, then decide whether another step is actually needed.";
    case "food_water_rest":
      return "Start with one basic need you can act on now: food, water, rest, or a little movement. Then check whether anything feels different.";
    case "take_a_break":
      return "Give yourself a short pause first. After that, name the one part of the situation that still needs your attention.";
    case "contact_supportive_person":
      return "You do not have to solve the question alone. One option is to take the exact question you wrote to someone supportive.";
    case "ask_for_help":
      return "This may be easier to sort out with another person. You can take this exact question into THRIVE Support.";
    case "review_today_plan":
      return "Pick one part of the day you want to keep steady, then notice what helps you protect it.";
    default:
      return "Start by naming the part you want to understand first. You do not need to solve the whole situation at once.";
  }
}

function summarizeSameDay(
  current: WellnessCheckinRow,
  earlier: WellnessCheckinRow,
) {
  const changes: string[] = [];
  const steady: string[] = [];

  if (current.overall_day && earlier.overall_day) {
    if (current.overall_day === earlier.overall_day) {
      steady.push(`overall is still ${plainValue(current.overall_day)}`);
    } else {
      changes.push(
        `overall moved from ${plainValue(earlier.overall_day)} to ${plainValue(current.overall_day)}`,
      );
    }
  }

  const dimensions: Array<
    [keyof WellnessCheckinRow, string]
  > = [
    ["stress", "stress"],
    ["sleep", "sleep"],
    ["energy", "energy"],
    ["confidence", "confidence"],
    ["routine", "routine"],
    ["recovery_support", "recovery support"],
    ["support_needed", "support"],
  ];

  for (const [key, label] of dimensions) {
    const currentValue = current[key];
    const priorValue = earlier[key];
    if (
      typeof currentValue !== "string" ||
      typeof priorValue !== "string" ||
      !currentValue ||
      !priorValue
    ) {
      continue;
    }

    if (currentValue === priorValue) {
      steady.push(`${label} is still ${plainValue(currentValue)}`);
    } else {
      changes.push(
        `${label} moved from ${plainValue(priorValue)} to ${plainValue(currentValue)}`,
      );
    }
  }

  if (changes.length === 0 && steady.length > 0) {
    return {
      kind: "repeat" as const,
      headline: "Not much has changed since earlier.",
      detail: `${steady.slice(0, 2).join(", and ")}.`,
    };
  }

  if (changes.length > 0 && steady.length === 0) {
    return {
      kind: "change" as const,
      headline: "A little has shifted since earlier.",
      detail: `${changes.slice(0, 2).join(", and ")}.`,
    };
  }

  if (changes.length > 0 && steady.length > 0) {
    return {
      kind: "mixed" as const,
      headline: "It’s a mixed picture since earlier.",
      detail: `${changes[0]}, while ${steady[0]}.`,
    };
  }

  return null;
}

function summarizePriorDay(
  current: WellnessCheckinRow,
  prior: WellnessCheckinRow,
) {
  if (
    current.overall_day &&
    prior.overall_day &&
    current.overall_day !== prior.overall_day
  ) {
    return {
      kind: "change" as const,
      headline: "Your latest check-in is different from the one before it.",
      detail: `Overall moved from ${plainValue(prior.overall_day)} to ${plainValue(current.overall_day)}.`,
    };
  }

  if (
    current.overall_day &&
    prior.overall_day &&
    current.overall_day === prior.overall_day
  ) {
    return {
      kind: "repeat" as const,
      headline: "Your latest check-in is similar to the one before it.",
      detail: `Overall is still ${plainValue(current.overall_day)}.`,
    };
  }

  return null;
}

export function buildContextualWellnessReturn(
  todayCheckin: WellnessCheckinRow | null,
  recentCheckins: WellnessCheckinRow[],
): ContextualWellnessReturn | null {
  if (!todayCheckin) return null;

  const previous = previousRows(todayCheckin, recentCheckins);
  const sameDay = previous.find(
    (row) => row.checkin_date === todayCheckin.checkin_date,
  );
  const priorDay = previous.find(
    (row) => row.checkin_date !== todayCheckin.checkin_date,
  );

  const summary =
    (sameDay ? summarizeSameDay(todayCheckin, sameDay) : null) ??
    (priorDay ? summarizePriorDay(todayCheckin, priorDay) : null);

  const noteQuestion = looksLikeQuestion(todayCheckin.participant_note)
    ? todayCheckin.participant_note?.trim() ?? null
    : null;

  const route = routeForChoice(todayCheckin);

  if (summary) {
    return {
      kind: summary.kind,
      headline: summary.headline,
      detail: summary.detail,
      choiceLabel: choiceLabel(todayCheckin),
      noteQuestion,
      noteResponse: noteQuestion ? responseForQuestion(todayCheckin) : null,
      ...route,
    };
  }

  if (todayCheckin.support_needed === "yes") {
    return {
      kind: "support",
      headline: "You said support would help right now.",
      detail: "Your check-in is saved, and Support is available when you want another person in the loop.",
      choiceLabel: choiceLabel(todayCheckin),
      noteQuestion,
      noteResponse: noteQuestion ? responseForQuestion(todayCheckin) : null,
      ...route,
    };
  }

  if (todayCheckin.chosen_next_step) {
    return {
      kind: "next_step",
      headline: "Your check-in is saved.",
      detail: "THRIVE will carry this moment forward with your Wellness history.",
      choiceLabel: choiceLabel(todayCheckin),
      noteQuestion,
      noteResponse: noteQuestion ? responseForQuestion(todayCheckin) : null,
      ...route,
    };
  }

  return {
    kind: "confirmation",
    headline: "Your check-in is saved.",
    detail: "THRIVE will carry this moment forward with your Wellness history.",
    choiceLabel: null,
    noteQuestion,
    noteResponse: noteQuestion ? responseForQuestion(todayCheckin) : null,
    ...route,
  };
}
