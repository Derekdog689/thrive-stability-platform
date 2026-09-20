export type NowSignal = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string | null;
  why: string;
  href: "/wellness" | "/goals" | "/budget" | "/support";
};

type CheckinSignalInput = {
  id: string;
  checkin_date: string;
  stress: string | null;
};

type BuildNowSignalsInput = {
  today: string;
  recentCheckins: CheckinSignalInput[];
  openGoalCount: number;
  supportStatus: string | null;
  draftMoneyPlan: {
    periodStart: string;
    periodEnd: string;
    expectedIncome: number;
  } | null;
  activeMoneyPlan: {
    periodEnd: string;
    budgetExpired: boolean;
    budgetEndingSoon: boolean;
    budgetDaysLeft: number | null;
    expectedIncome: number;
    moneyOutThisPeriod: number;
    moneyPlanTotal: number;
    overPlan: boolean;
  } | null;
};

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  });
}

function formatShortDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function buildNowSignals({
  today,
  recentCheckins,
  openGoalCount,
  supportStatus,
  draftMoneyPlan,
  activeMoneyPlan,
}: BuildNowSignalsInput): NowSignal[] {
  const signals: NowSignal[] = [];
  const todayCheckins = recentCheckins.filter(
    (checkin) => checkin.checkin_date === today,
  );
  const highStressCount = todayCheckins.filter(
    (checkin) => checkin.stress === "high",
  ).length;

  if (supportStatus === "waiting_for_participant") {
    signals.push({
      id: "support-waiting",
      eyebrow: "Still open",
      title: "Support is waiting for your reply.",
      detail: "There is an open Support thread that needs something from you.",
      why: "Based on your current Support request status: waiting for participant.",
      href: "/support",
    });
  }

  if (draftMoneyPlan) {
    if (draftMoneyPlan.expectedIncome === 0) {
      signals.push({
        id: "money-draft-zero-income",
        eyebrow: "Money",
        title: "Your Money plan draft currently has $0 expected income.",
        detail: "That may be correct, or it may simply mean the plan is not finished yet.",
        why: `Based on your draft Money plan for ${formatShortDate(draftMoneyPlan.periodStart)}–${formatShortDate(draftMoneyPlan.periodEnd)} and its recorded expected income of $0.`,
        href: "/budget",
      });
    } else {
      signals.push({
        id: "money-draft-open",
        eyebrow: "Still open",
        title: "Your Money plan draft is waiting to be finished.",
        detail: null,
        why: `Based on your draft Money plan for ${formatShortDate(draftMoneyPlan.periodStart)}–${formatShortDate(draftMoneyPlan.periodEnd)}.`,
        href: "/budget",
      });
    }
  } else if (activeMoneyPlan) {
    if (activeMoneyPlan.budgetExpired) {
      signals.push({
        id: "money-plan-ended",
        eyebrow: "Still open",
        title: "Your current Money plan has ended.",
        detail: "It is still available to review before you move on.",
        why: `Based on the current Money plan end date of ${formatShortDate(activeMoneyPlan.periodEnd)}.`,
        href: "/budget",
      });
    } else if (activeMoneyPlan.overPlan && activeMoneyPlan.moneyPlanTotal > 0) {
      const difference =
        activeMoneyPlan.moneyOutThisPeriod - activeMoneyPlan.moneyPlanTotal;
      signals.push({
        id: "money-outflow-above-plan",
        eyebrow: "Something changed",
        title: `Recorded outflow is ${formatMoney(difference)} above the amount currently planned.`,
        detail: "THRIVE is comparing recorded activity with the current plan, not judging the reason for it.",
        why: `Based on ${formatMoney(activeMoneyPlan.moneyOutThisPeriod)} recorded outflow and ${formatMoney(activeMoneyPlan.moneyPlanTotal)} currently planned for this period.`,
        href: "/budget",
      });
    } else if (activeMoneyPlan.budgetEndingSoon) {
      signals.push({
        id: "money-plan-ending",
        eyebrow: "Coming up",
        title:
          activeMoneyPlan.budgetDaysLeft === 0
            ? "Your Money plan ends today."
            : `Your Money plan ends in ${activeMoneyPlan.budgetDaysLeft} day${activeMoneyPlan.budgetDaysLeft === 1 ? "" : "s"}.`,
        detail: null,
        why: `Based on the current Money plan end date of ${formatShortDate(activeMoneyPlan.periodEnd)}.`,
        href: "/budget",
      });
    } else if (activeMoneyPlan.expectedIncome === 0) {
      signals.push({
        id: "money-active-zero-income",
        eyebrow: "Money",
        title: "Your current Money plan has $0 expected income recorded.",
        detail: "That may be correct. THRIVE is only reflecting what the plan currently says.",
        why: "Based on the expected-income value stored on your current Money plan.",
        href: "/budget",
      });
    }
  }

  if (highStressCount >= 2) {
    signals.push({
      id: "wellness-stress-repeat",
      eyebrow: "Keeps coming up",
      title: `Stress has been marked high in ${highStressCount} check-ins today.`,
      detail: "THRIVE is reflecting the repeated value, not assigning a cause.",
      why: `Based on ${highStressCount} Wellness check-ins dated today where stress was recorded as high.`,
      href: "/wellness",
    });
  } else if (todayCheckins.length >= 2) {
    signals.push({
      id: "wellness-multiple-checkins",
      eyebrow: "Today so far",
      title: `You have checked in ${todayCheckins.length} times today.`,
      detail: "Your day can have more than one meaningful moment.",
      why: `Based on ${todayCheckins.length} active Wellness check-ins dated today.`,
      href: "/wellness",
    });
  }

  if (openGoalCount > 0) {
    signals.push({
      id: "goals-open",
      eyebrow: "Working on",
      title:
        openGoalCount === 1
          ? "You have 1 goal active or ready."
          : `You have ${openGoalCount} goals active or ready.`,
      detail: "THRIVE is keeping the open work visible without asking you to handle everything at once.",
      why: `Based on ${openGoalCount} current Goal record${openGoalCount === 1 ? "" : "s"} that are not completed or archived.`,
      href: "/goals",
    });
  }

  return signals.slice(0, 4);
}
