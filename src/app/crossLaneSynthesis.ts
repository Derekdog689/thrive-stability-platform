import type { ParticipantGoal } from "./goals/useParticipantGoals";
import type {
  AssistedBudgetSupportLink,
  ParticipantSupportRequest,
} from "./support/useParticipantSupport";
import type { BudgetPeriod } from "./useParticipantFinancial";
import type { WellnessCheckinRow } from "./wellness/useWellnessCheckinCandidate";

export type CrossLaneSynthesisKind =
  | "money_support"
  | "wellness_support"
  | "wellness_goal"
  | "goal_money";

export type CrossLaneEvidence = {
  lane: "Wellness" | "Goals" | "Money" | "Support";
  fact: string;
};

export type CrossLaneSynthesis = {
  id: string;
  kind: CrossLaneSynthesisKind;
  eyebrow: string;
  headline: string;
  detail: string;
  evidence: CrossLaneEvidence[];
  actionLabel: string | null;
  actionHref: string | null;
};

type CrossLaneSynthesisInput = {
  todayCheckin: WellnessCheckinRow | null;
  currentGoal: ParticipantGoal | null;
  supportRequests: ParticipantSupportRequest[];
  assistedBudgetLinks: AssistedBudgetSupportLink[];
  activeBudgetPeriod: BudgetPeriod | null;
};

const wellnessNextStepLabels: Record<string, string> = {
  review_today_plan: "keep one thing steady",
  choose_one_task: "do one useful thing",
  take_a_break: "take a break",
  food_water_rest: "handle a basic need",
  contact_supportive_person: "talk to someone supportive",
  ask_for_help: "ask THRIVE for help",
  other: "do something else",
};

function readableStatus(value: string) {
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function buildSupportHref(checkin: WellnessCheckinRow) {
  const params = new URLSearchParams({ from: "wellness" });

  const values: Array<[string, string | null]> = [
    ["overall", checkin.overall_day],
    ["nextStep", checkin.chosen_next_step],
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

function moneyRelatedGoal(goal: ParticipantGoal) {
  const text = [goal.title, goal.why_it_matters, goal.next_step, goal.goal_area]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return /\b(budget|money|saving|savings|save|bill|bills|debt|rent|income|spending|expense|expenses)\b/.test(text);
}

export function buildCrossLaneSynthesis({
  todayCheckin,
  currentGoal,
  supportRequests,
  assistedBudgetLinks,
  activeBudgetPeriod,
}: CrossLaneSynthesisInput): CrossLaneSynthesis | null {
  // 1. Prefer an explicit active Support <-> Money relationship when it still
  // needs participant attention. The database link is the evidence.
  if (activeBudgetPeriod) {
    const linked = assistedBudgetLinks.find(
      (item) => item.budget_period_id === activeBudgetPeriod.id,
    );
    const request = linked
      ? supportRequests.find((item) => item.id === linked.support_request_id) ?? null
      : null;

    if (
      linked &&
      request &&
      !["completed", "withdrawn", "archived"].includes(request.status)
    ) {
      return {
        id: `money_support:${activeBudgetPeriod.id}:${request.id}:${request.updated_at}`,
        kind: "money_support",
        eyebrow: "Worth looking at together",
        headline: "Your Money plan and Support are connected.",
        detail:
          "This Money plan is linked to a Support request. You can review the plan, continue the Support conversation, or leave it alone for now.",
        evidence: [
          {
            lane: "Money",
            fact: `Active plan through ${activeBudgetPeriod.period_end}.`,
          },
          {
            lane: "Support",
            fact: `Request is ${readableStatus(request.status).toLowerCase()}.`,
          },
        ],
        actionLabel: "Open Support",
        actionHref: "/support",
      };
    }
  }

  // 2. A participant-selected Wellness next step that explicitly asks for
  // support is stronger evidence than a general inferred relationship.
  if (
    todayCheckin &&
    (todayCheckin.support_needed === "yes" ||
      todayCheckin.chosen_next_step === "ask_for_help" ||
      todayCheckin.chosen_next_step === "contact_supportive_person")
  ) {
    const selected = todayCheckin.chosen_next_step
      ? wellnessNextStepLabels[todayCheckin.chosen_next_step] ??
        readableStatus(todayCheckin.chosen_next_step).toLowerCase()
      : "get some support";

    return {
      id: `wellness_support:${todayCheckin.id}:${todayCheckin.updated_at}`,
      kind: "wellness_support",
      eyebrow: "Your check-in points somewhere",
      headline: "Wellness and Support may belong in the same conversation.",
      detail:
        "You chose support as part of your check-in. THRIVE is showing the connection, not deciding what you need to do next.",
      evidence: [
        {
          lane: "Wellness",
          fact: `You chose to ${selected}.`,
        },
        {
          lane: "Support",
          fact: "Support is available if you want another person in the loop.",
        },
      ],
      actionLabel: "Open Support",
      actionHref: buildSupportHref(todayCheckin),
    };
  }

  // 3. Use a participant-selected Wellness action to connect to an existing
  // Goal only when the selected action itself supports the comparison.
  if (
    todayCheckin &&
    currentGoal &&
    ["review_today_plan", "choose_one_task"].includes(
      todayCheckin.chosen_next_step ?? "",
    )
  ) {
    const selected =
      wellnessNextStepLabels[todayCheckin.chosen_next_step ?? ""] ??
      "keep one thing moving";

    return {
      id: `wellness_goal:${todayCheckin.id}:${todayCheckin.updated_at}:${currentGoal.id}:${currentGoal.updated_at}`,
      kind: "wellness_goal",
      eyebrow: "Worth looking at together",
      headline: "Your check-in and one goal may fit together.",
      detail:
        "These are two things you already chose. You can use the goal step as today's focus, make it smaller, or leave it for later.",
      evidence: [
        {
          lane: "Wellness",
          fact: `You chose to ${selected}.`,
        },
        {
          lane: "Goals",
          fact: `${currentGoal.title}: ${currentGoal.next_step}`,
        },
      ],
      actionLabel: "Open goal",
      actionHref: "/goals",
    };
  }

  // 4. Money + Goals is intentionally narrow. A current Money plan alone is
  // not enough; the participant's own Goal text must explicitly be financial.
  if (activeBudgetPeriod && currentGoal && moneyRelatedGoal(currentGoal)) {
    return {
      id: `goal_money:${currentGoal.id}:${currentGoal.updated_at}:${activeBudgetPeriod.id}`,
      kind: "goal_money",
      eyebrow: "Worth looking at together",
      headline: "This goal and your Money plan may be connected.",
      detail:
        "Your goal uses financial language and you have a current Money plan. THRIVE is putting those facts next to each other so you can decide whether the connection is useful.",
      evidence: [
        {
          lane: "Goals",
          fact: `${currentGoal.title}: ${currentGoal.next_step}`,
        },
        {
          lane: "Money",
          fact: `Active plan through ${activeBudgetPeriod.period_end}.`,
        },
      ],
      actionLabel: "Open Money",
      actionHref: "/budget",
    };
  }

  return null;
}
