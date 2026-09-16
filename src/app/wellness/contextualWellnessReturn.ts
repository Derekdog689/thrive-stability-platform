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
  dimension: string | null;
  headline: string;
  detail: string | null;
  actionLabel: string | null;
  actionHref: string | null;
};

type ComparableDimension = {
  key:
    | "support_needed"
    | "recovery_support"
    | "routine"
    | "stress"
    | "sleep"
    | "energy"
    | "confidence"
    | "overall_day";
  label: string;
};

const dimensionPriority: ComparableDimension[] = [
  { key: "support_needed", label: "support" },
  { key: "recovery_support", label: "recovery support" },
  { key: "routine", label: "routine" },
  { key: "stress", label: "stress" },
  { key: "sleep", label: "sleep" },
  { key: "energy", label: "energy" },
  { key: "confidence", label: "confidence" },
  { key: "overall_day", label: "overall day" },
];

const nextStepLabels: Record<string, string> = {
  review_today_plan: "Review today's plan",
  choose_one_task: "Do one useful thing",
  take_a_break: "Take a break",
  food_water_rest: "Handle a basic need",
  contact_supportive_person: "Talk to someone supportive",
  ask_for_help: "Ask THRIVE for help",
  other: "Do the next thing you chose",
  nothing_right_now: "Nothing right now",
};

function plainValue(value: string) {
  return value.replaceAll("_", " ");
}

function getValue(
  row: WellnessCheckinRow,
  dimension: ComparableDimension,
): string | null {
  const value = row[dimension.key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function priorRowsForToday(
  todayCheckin: WellnessCheckinRow,
  recentCheckins: WellnessCheckinRow[],
) {
  return recentCheckins
    .filter(
      (row) =>
        row.id !== todayCheckin.id &&
        row.checkin_date !== todayCheckin.checkin_date &&
        row.status === "active",
    )
    .sort((a, b) => {
      const dateCompare = b.checkin_date.localeCompare(a.checkin_date);
      if (dateCompare !== 0) return dateCompare;
      return b.created_at.localeCompare(a.created_at);
    });
}

function supportReturn(): ContextualWellnessReturn {
  return {
    kind: "support",
    dimension: "support_needed",
    headline: "You said support would help today.",
    detail: "THRIVE can take you to Support when you're ready.",
    actionLabel: "Open Support",
    actionHref: "/support",
  };
}

function nextStepReturn(value: string): ContextualWellnessReturn {
  const label = nextStepLabels[value] ?? plainValue(value);
  const routesToSupport =
    value === "ask_for_help" || value === "contact_supportive_person";

  return {
    kind: "next_step",
    dimension: null,
    headline: `You chose ${label} next.`,
    detail: "That's the next step you selected in this check-in.",
    actionLabel: routesToSupport ? "Open Support" : null,
    actionHref: routesToSupport ? "/support" : null,
  };
}

function repeatReturn(
  dimension: ComparableDimension,
  todayValue: string,
): ContextualWellnessReturn {
  return {
    kind: "repeat",
    dimension: dimension.key,
    headline: `You've selected ${plainValue(todayValue)} for ${dimension.label} on several recent check-ins.`,
    detail: "THRIVE is only reflecting what you recorded across your recent check-ins.",
    actionLabel: null,
    actionHref: null,
  };
}

function changeReturn(
  dimension: ComparableDimension,
  todayValue: string,
  priorValue: string,
): ContextualWellnessReturn {
  return {
    kind: "change",
    dimension: dimension.key,
    headline: `${dimension.label.replace(/^./, (letter) => letter.toUpperCase())} is different from your last check-in.`,
    detail: `${plainValue(priorValue)} → ${plainValue(todayValue)}`,
    actionLabel: null,
    actionHref: null,
  };
}

function mixedReturn(
  dimension: ComparableDimension,
): ContextualWellnessReturn {
  return {
    kind: "mixed",
    dimension: dimension.key,
    headline: `Your recent check-ins have varied on ${dimension.label}.`,
    detail: "There isn't one consistent recent pattern in what you recorded.",
    actionLabel: null,
    actionHref: null,
  };
}

function confirmationReturn(): ContextualWellnessReturn {
  return {
    kind: "confirmation",
    dimension: null,
    headline: "Your check-in is saved.",
    detail: "It's here when you want to look back or decide what to work on next.",
    actionLabel: null,
    actionHref: null,
  };
}

export function buildContextualWellnessReturn(
  todayCheckin: WellnessCheckinRow | null,
  recentCheckins: WellnessCheckinRow[],
): ContextualWellnessReturn | null {
  if (!todayCheckin) return null;

  if (todayCheckin.support_needed === "yes") {
    return supportReturn();
  }

  if (
    todayCheckin.chosen_next_step &&
    todayCheckin.chosen_next_step !== "nothing_right_now"
  ) {
    return nextStepReturn(todayCheckin.chosen_next_step);
  }

  const priorRows = priorRowsForToday(todayCheckin, recentCheckins);

  for (const dimension of dimensionPriority) {
    const todayValue = getValue(todayCheckin, dimension);
    if (!todayValue) continue;

    const priorValues = priorRows
      .map((row) => getValue(row, dimension))
      .filter((value): value is string => Boolean(value));

    const repeatedPriorCount = priorValues.filter(
      (value) => value === todayValue,
    ).length;

    if (repeatedPriorCount >= 2) {
      return repeatReturn(dimension, todayValue);
    }
  }

  for (const dimension of dimensionPriority) {
    const todayValue = getValue(todayCheckin, dimension);
    if (!todayValue) continue;

    const mostRecentPriorValue = priorRows
      .map((row) => getValue(row, dimension))
      .find((value): value is string => Boolean(value));

    if (mostRecentPriorValue && mostRecentPriorValue !== todayValue) {
      return changeReturn(dimension, todayValue, mostRecentPriorValue);
    }
  }

  for (const dimension of dimensionPriority) {
    const todayValue = getValue(todayCheckin, dimension);
    if (!todayValue) continue;

    const recentValues = [
      todayValue,
      ...priorRows
        .map((row) => getValue(row, dimension))
        .filter((value): value is string => Boolean(value)),
    ];

    if (new Set(recentValues).size >= 2 && recentValues.length >= 3) {
      return mixedReturn(dimension);
    }
  }

  return confirmationReturn();
}
