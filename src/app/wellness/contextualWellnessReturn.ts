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
  choiceLabel: string | null;
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
  { key: "overall_day", label: "overall state" },
];

const nextStepLabels: Record<string, string> = {
  review_today_plan: "Review today's plan",
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

function getValue(
  row: WellnessCheckinRow,
  dimension: ComparableDimension,
): string | null {
  const value = row[dimension.key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function priorRows(
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

function routeForChoice(value: string | null) {
  if (value === "ask_for_help" || value === "contact_supportive_person") {
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

function buildReturn(
  kind: ContextualWellnessReturnKind,
  dimension: string | null,
  headline: string,
  detail: string | null,
  todayCheckin: WellnessCheckinRow,
): ContextualWellnessReturn {
  const route = routeForChoice(
    todayCheckin.support_needed === "yes"
      ? "ask_for_help"
      : todayCheckin.chosen_next_step,
  );

  return {
    kind,
    dimension,
    headline,
    detail,
    choiceLabel: choiceLabel(todayCheckin),
    ...route,
  };
}

export function buildContextualWellnessReturn(
  todayCheckin: WellnessCheckinRow | null,
  recentCheckins: WellnessCheckinRow[],
): ContextualWellnessReturn | null {
  if (!todayCheckin) return null;

  const previous = priorRows(todayCheckin, recentCheckins);
  const sameDayRows = previous.filter(
    (row) => row.checkin_date === todayCheckin.checkin_date,
  );

  const latestSameDay = sameDayRows[0] ?? null;

  if (latestSameDay) {
    for (const dimension of dimensionPriority) {
      const todayValue = getValue(todayCheckin, dimension);
      const priorValue = getValue(latestSameDay, dimension);

      if (!todayValue || !priorValue) continue;

      if (todayValue !== priorValue) {
        return buildReturn(
          "change",
          dimension.key,
          `${dimension.label.replace(/^./, (letter) => letter.toUpperCase())} changed since earlier today.`,
          `${plainValue(priorValue)} → ${plainValue(todayValue)}`,
          todayCheckin,
        );
      }

      return buildReturn(
        "repeat",
        dimension.key,
        `${dimension.label.replace(/^./, (letter) => letter.toUpperCase())} is still ${plainValue(todayValue)} since earlier today.`,
        "THRIVE is comparing this moment with your earlier check-in.",
        todayCheckin,
      );
    }
  }

  const priorDayRows = previous.filter(
    (row) => row.checkin_date !== todayCheckin.checkin_date,
  );
  const latestPriorDay = priorDayRows[0] ?? null;

  if (latestPriorDay) {
    for (const dimension of dimensionPriority) {
      const todayValue = getValue(todayCheckin, dimension);
      const priorValue = getValue(latestPriorDay, dimension);

      if (!todayValue || !priorValue) continue;

      if (todayValue !== priorValue) {
        return buildReturn(
          "change",
          dimension.key,
          `${dimension.label.replace(/^./, (letter) => letter.toUpperCase())} is different from your last check-in.`,
          `${plainValue(priorValue)} → ${plainValue(todayValue)}`,
          todayCheckin,
        );
      }
    }
  }

  for (const dimension of dimensionPriority) {
    const todayValue = getValue(todayCheckin, dimension);
    if (!todayValue) continue;

    const priorValues = previous
      .map((row) => getValue(row, dimension))
      .filter((value): value is string => Boolean(value));

    const repeatedPriorCount = priorValues.filter(
      (value) => value === todayValue,
    ).length;

    if (repeatedPriorCount >= 2) {
      return buildReturn(
        "repeat",
        dimension.key,
        `${dimension.label.replace(/^./, (letter) => letter.toUpperCase())} has also been ${plainValue(todayValue)} on several recent check-ins.`,
        "THRIVE is reflecting what you recorded across your recent Wellness history.",
        todayCheckin,
      );
    }

    const recentValues = [todayValue, ...priorValues];
    if (new Set(recentValues).size >= 2 && recentValues.length >= 3) {
      return buildReturn(
        "mixed",
        dimension.key,
        `Your recent check-ins have varied on ${dimension.label}.`,
        "There is not one consistent recent pattern in what you recorded.",
        todayCheckin,
      );
    }
  }

  if (todayCheckin.support_needed === "yes") {
    return buildReturn(
      "support",
      "support_needed",
      "You said support would help right now.",
      "THRIVE can take you to Support when you're ready.",
      todayCheckin,
    );
  }

  if (todayCheckin.chosen_next_step) {
    return buildReturn(
      "next_step",
      null,
      "Your check-in is saved.",
      "THRIVE will carry this moment forward with your Wellness history.",
      todayCheckin,
    );
  }

  return buildReturn(
    "confirmation",
    null,
    "Your check-in is saved.",
    "THRIVE will carry this moment forward with your Wellness history.",
    todayCheckin,
  );
}
