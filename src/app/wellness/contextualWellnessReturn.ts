import type { WellnessCheckinRow } from "./useWellnessCheckinCandidate";

export type ContextualWellnessReturnKind =
  | "support"
  | "next_step"
  | "repeat"
  | "change"
  | "mixed"
  | "confirmation";

export type WellnessReturnSignal = {
  dimension: string;
  label: string;
  value: string;
  comparison: "repeat" | "change" | "mixed" | "current";
  comparisonDetail: string | null;
};

export type WellnessReturnAction = {
  key: string;
  label: string;
  reason: string;
  href: string | null;
};

export type ContextualWellnessReturn = {
  kind: ContextualWellnessReturnKind;
  dimension: string | null;
  headline: string;
  detail: string | null;
  signals: WellnessReturnSignal[];
  suggestedActions: WellnessReturnAction[];
  actionLabel: string | null;
  actionHref: string | null;
};

type ComparableDimension = {
  key:
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
  { key: "recovery_support", label: "Recovery support" },
  { key: "routine", label: "Routine" },
  { key: "stress", label: "Stress" },
  { key: "sleep", label: "Sleep" },
  { key: "energy", label: "Energy" },
  { key: "confidence", label: "Confidence" },
  { key: "overall_day", label: "Overall day" },
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

function buildSignal(
  dimension: ComparableDimension,
  todayValue: string,
  priorRows: WellnessCheckinRow[],
): WellnessReturnSignal {
  const priorValues = priorRows
    .map((row) => getValue(row, dimension))
    .filter((value): value is string => Boolean(value));

  const repeatedPriorCount = priorValues.filter(
    (value) => value === todayValue,
  ).length;

  if (repeatedPriorCount >= 2) {
    return {
      dimension: dimension.key,
      label: dimension.label,
      value: plainValue(todayValue),
      comparison: "repeat",
      comparisonDetail: "Same on several recent check-ins.",
    };
  }

  const mostRecentPriorValue = priorValues[0] ?? null;

  if (mostRecentPriorValue && mostRecentPriorValue !== todayValue) {
    return {
      dimension: dimension.key,
      label: dimension.label,
      value: plainValue(todayValue),
      comparison: "change",
      comparisonDetail: `Last check-in: ${plainValue(mostRecentPriorValue)}.`,
    };
  }

  const recentValues = [todayValue, ...priorValues];

  if (recentValues.length >= 3 && new Set(recentValues).size >= 2) {
    return {
      dimension: dimension.key,
      label: dimension.label,
      value: plainValue(todayValue),
      comparison: "mixed",
      comparisonDetail: "Recent check-ins have varied.",
    };
  }

  return {
    dimension: dimension.key,
    label: dimension.label,
    value: plainValue(todayValue),
    comparison: "current",
    comparisonDetail: null,
  };
}

function actionFromChosenStep(value: string): WellnessReturnAction {
  const routesToSupport =
    value === "ask_for_help" || value === "contact_supportive_person";

  return {
    key: value,
    label: nextStepLabels[value] ?? plainValue(value),
    reason: "You selected this during your check-in.",
    href: routesToSupport ? "/support" : null,
  };
}

function buildSuggestedActions(
  todayCheckin: WellnessCheckinRow,
): WellnessReturnAction[] {
  const actions: WellnessReturnAction[] = [];

  function add(action: WellnessReturnAction) {
    if (!actions.some((existing) => existing.key === action.key)) {
      actions.push(action);
    }
  }

  if (
    todayCheckin.chosen_next_step &&
    todayCheckin.chosen_next_step !== "nothing_right_now"
  ) {
    add(actionFromChosenStep(todayCheckin.chosen_next_step));
  }

  if (
    todayCheckin.support_needed === "yes" ||
    todayCheckin.recovery_support === "could_use_support"
  ) {
    add({
      key: "ask_for_help",
      label: "Open Support",
      reason:
        todayCheckin.support_needed === "yes"
          ? "You said support would help today."
          : "You marked that you could use recovery support.",
      href: "/support",
    });
  }

  if (todayCheckin.stress === "high") {
    add({
      key: "take_a_break",
      label: "Take a break",
      reason: "You marked stress as high.",
      href: null,
    });
  }

  if (todayCheckin.sleep === "poor" || todayCheckin.energy === "low") {
    add({
      key: "food_water_rest",
      label: "Handle a basic need",
      reason:
        todayCheckin.sleep === "poor"
          ? "You marked sleep as poor."
          : "You marked energy as low.",
      href: null,
    });
  }

  if (
    todayCheckin.routine === "off_track" ||
    todayCheckin.routine === "mixed"
  ) {
    add({
      key: "choose_one_task",
      label: "Do one useful thing",
      reason: `You marked routine as ${plainValue(todayCheckin.routine)}.`,
      href: null,
    });
  }

  return actions.slice(0, 3);
}

function primaryKind(
  supportNeeded: string | null,
  chosenNextStep: string | null,
  signals: WellnessReturnSignal[],
): ContextualWellnessReturnKind {
  if (supportNeeded === "yes") return "support";

  const contextualSignal = signals.find(
    (signal) => signal.comparison !== "current",
  );

  if (contextualSignal) {
    return contextualSignal.comparison;
  }

  if (chosenNextStep && chosenNextStep !== "nothing_right_now") {
    return "next_step";
  }

  return "confirmation";
}

export function buildContextualWellnessReturn(
  todayCheckin: WellnessCheckinRow | null,
  recentCheckins: WellnessCheckinRow[],
): ContextualWellnessReturn | null {
  if (!todayCheckin) return null;

  const priorRows = priorRowsForToday(todayCheckin, recentCheckins);

  const signals = dimensionPriority
    .map((dimension) => {
      const todayValue = getValue(todayCheckin, dimension);
      return todayValue
        ? buildSignal(dimension, todayValue, priorRows)
        : null;
    })
    .filter((signal): signal is WellnessReturnSignal => Boolean(signal))
    .sort((a, b) => {
      const aContext = a.comparison === "current" ? 1 : 0;
      const bContext = b.comparison === "current" ? 1 : 0;
      if (aContext !== bContext) return aContext - bContext;

      const aIndex = dimensionPriority.findIndex(
        (dimension) => dimension.key === a.dimension,
      );
      const bIndex = dimensionPriority.findIndex(
        (dimension) => dimension.key === b.dimension,
      );
      return aIndex - bIndex;
    })
    .slice(0, 3);

  const suggestedActions = buildSuggestedActions(todayCheckin);
  const chosenStep =
    todayCheckin.chosen_next_step &&
    todayCheckin.chosen_next_step !== "nothing_right_now"
      ? nextStepLabels[todayCheckin.chosen_next_step] ??
        plainValue(todayCheckin.chosen_next_step)
      : null;

  const headline =
    todayCheckin.support_needed === "yes"
      ? "You said support would help today."
      : signals.length >= 2
        ? "A few things stand out from this check-in."
        : signals.length === 1
          ? "One thing stands out from this check-in."
          : "Your check-in is saved.";

  const detail = chosenStep
    ? `You chose ${chosenStep} next. THRIVE is keeping that choice visible alongside what you recorded.`
    : signals.length > 0
      ? "THRIVE is reflecting only what you recorded today and across recent check-ins."
      : "It's here when you want to look back or decide what to work on next.";

  const directSupportAction = suggestedActions.find(
    (action) => action.href === "/support",
  );

  return {
    kind: primaryKind(
      todayCheckin.support_needed,
      todayCheckin.chosen_next_step,
      signals,
    ),
    dimension: signals[0]?.dimension ?? null,
    headline,
    detail,
    signals,
    suggestedActions,
    actionLabel: directSupportAction?.label ?? null,
    actionHref: directSupportAction?.href ?? null,
  };
}
