import type { WellnessCheckinRow } from "./useWellnessCheckinCandidate";
import { wellnessOverallLabel } from "./wellnessVocabulary";

export type ContextualWellnessReturnKind =
  | "support"
  | "repeat"
  | "change"
  | "mixed"
  | "confirmation";

export type ContextualWellnessReturn = {
  kind: ContextualWellnessReturnKind;
  headline: string;
  detail: string | null;
  actionLabel: string | null;
  actionHref: string | null;
};

function plainValue(value: string) {
  return value.replaceAll("_", " ");
}

function previousRows(
  current: WellnessCheckinRow,
  recentCheckins: WellnessCheckinRow[],
) {
  return recentCheckins
    .filter((row) => row.id !== current.id && row.status === "active")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

function supportHref(checkin: WellnessCheckinRow) {
  const params = new URLSearchParams({ from: "wellness" });

  const values: Array<[string, string | null]> = [
    ["overall", checkin.overall_day],
    ["stress", checkin.stress],
    ["sleep", checkin.sleep],
    ["energy", checkin.energy],
    ["confidence", checkin.confidence],
    ["routine", checkin.routine],
    ["recoverySupport", checkin.recovery_support],
    ["supportNeeded", checkin.support_needed],
  ];

  for (const [key, value] of values) {
    if (value) params.set(key, value);
  }

  return `/support?${params.toString()}`;
}

function summarizeSignals(checkin: WellnessCheckinRow) {
  const observations: string[] = [];

  if (checkin.stress === "high") observations.push("stress is running high");
  if (checkin.sleep === "poor") observations.push("sleep has been rough");
  if (checkin.energy === "low") observations.push("energy is low");
  if (checkin.confidence === "low") observations.push("confidence feels low");
  if (checkin.routine === "mixed") observations.push("routine feels mixed");
  if (checkin.routine === "off_track") observations.push("routine feels off track");
  if (checkin.recovery_support === "could_use_support") {
    observations.push("recovery support could help");
  }
  if (checkin.support_needed === "yes") observations.push("you said support would help");

  const steady: string[] = [];
  if (checkin.sleep === "good") steady.push("sleep feels steady");
  if (checkin.energy === "good") steady.push("energy feels steady");
  if (checkin.confidence === "good") steady.push("confidence feels steady");
  if (checkin.routine === "on_track") steady.push("routine feels on track");
  if (checkin.recovery_support === "connected") steady.push("recovery support feels connected");

  if (observations.length > 0 && steady.length > 0) {
    return `${observations.slice(0, 2).join(" and ")}, while ${steady[0]}.`;
  }

  if (observations.length > 0) {
    return `${observations.slice(0, 2).join(" and ")}.`;
  }

  if (steady.length > 0) {
    return `${steady.slice(0, 2).join(" and ")}.`;
  }

  return null;
}

function compare(
  current: WellnessCheckinRow,
  prior: WellnessCheckinRow,
) {
  if (current.overall_day !== prior.overall_day) {
    return {
      kind: "change" as const,
      headline: "A little has shifted.",
      detail: `Earlier you marked things ${wellnessOverallLabel(prior.overall_day).toLowerCase()}; now you marked ${wellnessOverallLabel(current.overall_day).toLowerCase()}.`,
    };
  }

  const dimensions: Array<[keyof WellnessCheckinRow, string]> = [
    ["stress", "stress"],
    ["sleep", "sleep"],
    ["energy", "energy"],
    ["confidence", "confidence"],
    ["routine", "routine"],
    ["recovery_support", "recovery support"],
    ["support_needed", "support"],
  ];

  for (const [key, label] of dimensions) {
    const now = current[key];
    const before = prior[key];
    if (
      typeof now === "string" &&
      typeof before === "string" &&
      now &&
      before &&
      now !== before
    ) {
      return {
        kind: "mixed" as const,
        headline: "It’s a mixed picture since earlier.",
        detail: `${label} moved from ${plainValue(before)} to ${plainValue(now)}, while your overall check-in stayed ${wellnessOverallLabel(current.overall_day).toLowerCase()}.`,
      };
    }
  }

  return {
    kind: "repeat" as const,
    headline: "This looks similar to your last check-in.",
    detail: `You marked things ${wellnessOverallLabel(current.overall_day).toLowerCase()} again.`,
  };
}

export function buildContextualWellnessReturn(
  current: WellnessCheckinRow | null,
  recentCheckins: WellnessCheckinRow[],
): ContextualWellnessReturn | null {
  if (!current) return null;

  const previous = previousRows(current, recentCheckins);
  const sameDay = previous.find(
    (row) => row.checkin_date === current.checkin_date,
  );
  const prior = sameDay ?? previous[0] ?? null;

  const comparison = prior ? compare(current, prior) : null;
  const signalDetail = summarizeSignals(current);
  const supportRelevant =
    current.support_needed === "yes" ||
    current.recovery_support === "could_use_support";

  if (comparison) {
    return {
      kind: comparison.kind,
      headline: comparison.headline,
      detail: signalDetail
        ? `${comparison.detail} ${signalDetail}`
        : comparison.detail,
      actionLabel: supportRelevant ? "Open Support" : null,
      actionHref: supportRelevant ? supportHref(current) : null,
    };
  }

  if (supportRelevant) {
    return {
      kind: "support",
      headline: "You gave THRIVE a clearer picture.",
      detail:
        signalDetail ??
        "You said support could be useful right now. You can act on that, or leave the check-in here.",
      actionLabel: "Open Support",
      actionHref: supportHref(current),
    };
  }

  return {
    kind: "confirmation",
    headline:
      current.checkin_depth === "quick"
        ? "You checked in without making it a whole project."
        : "You gave THRIVE a fuller picture.",
    detail:
      signalDetail ??
      "This moment is saved. You do not need to turn it into another task.",
    actionLabel: null,
    actionHref: null,
  };
}
