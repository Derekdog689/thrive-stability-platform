import {
  BudgetLine,
  BudgetPeriod,
  FinancialActivity,
  FinancialActivityAllocation,
  FinancialActivityPeriodLink,
  toNumber,
} from "../useParticipantFinancial";

function activityKey(recordType: string, activityId: string) {
  return `${recordType}:${activityId}`;
}

export type MoneyPeriodSummary = {
  budgetPeriodId: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  available: number;
  planned: number;
  recordedOut: number;
  remainingInCategories: number;
  unassigned: number;
  unspentOverall: number;
  activityCount: number;
  withinPlanLines: BudgetLine[];
  overPlanLines: BudgetLine[];
  previousPeriodId: string | null;
  recordedOutDelta: number | null;
  plannedDelta: number | null;
};

export function buildMoneyPeriodSummary({
  period,
  periods,
  budgetLines,
  financialActivity,
  financialActivityAllocations,
  financialActivityPeriodLinks,
}: {
  period: BudgetPeriod;
  periods: BudgetPeriod[];
  budgetLines: BudgetLine[];
  financialActivity: FinancialActivity[];
  financialActivityAllocations: FinancialActivityAllocation[];
  financialActivityPeriodLinks: FinancialActivityPeriodLink[];
}): MoneyPeriodSummary {
  const completedPeriods = periods
    .filter((item) => item.status === "completed")
    .sort((a, b) => {
      const aKey = a.completed_at ?? a.period_end;
      const bKey = b.completed_at ?? b.period_end;
      return bKey.localeCompare(aKey);
    });

  const selectedIndex = completedPeriods.findIndex((item) => item.id === period.id);
  const previousPeriod =
    selectedIndex >= 0 ? completedPeriods[selectedIndex + 1] ?? null : null;

  const selectedLines = budgetLines.filter(
    (line) => line.budget_period_id === period.id && line.is_active,
  );
  const previousLines = previousPeriod
    ? budgetLines.filter(
        (line) => line.budget_period_id === previousPeriod.id && line.is_active,
      )
    : [];

  const activityKeys = new Set([
    ...financialActivityAllocations
      .filter(
        (item) =>
          item.status === "active" &&
          item.archived_at === null &&
          item.budget_period_id === period.id,
      )
      .map((item) => activityKey(item.activity_record_type, item.activity_id)),
    ...financialActivityPeriodLinks
      .filter(
        (item) =>
          item.status === "active" &&
          item.archived_at === null &&
          item.budget_period_id === period.id,
      )
      .map((item) => activityKey(item.activity_record_type, item.activity_id)),
  ]);

  const selectedActivity = financialActivity.filter((activity) =>
    activityKeys.has(activityKey(activity.activity_record_type, activity.activity_id)),
  );

  const available = toNumber(period.expected_income);
  const planned = selectedLines.reduce(
    (sum, line) => sum + toNumber(line.planned_amount),
    0,
  );
  const recordedOut = selectedLines.reduce(
    (sum, line) => sum + toNumber(line.derived_actual_amount),
    0,
  );
  const remainingInCategories = selectedLines.reduce(
    (sum, line) => sum + toNumber(line.derived_remaining_amount),
    0,
  );
  const unassigned = Math.max(available - planned, 0);
  const unspentOverall = Math.max(available - recordedOut, 0);

  const withinPlanLines = selectedLines.filter((line) => {
    const used = toNumber(line.derived_actual_amount);
    return used > 0 && used <= toNumber(line.planned_amount);
  });

  const overPlanLines = selectedLines.filter(
    (line) =>
      toNumber(line.derived_actual_amount) > toNumber(line.planned_amount),
  );

  const previousPlanned = previousLines.reduce(
    (sum, line) => sum + toNumber(line.planned_amount),
    0,
  );
  const previousRecordedOut = previousLines.reduce(
    (sum, line) => sum + toNumber(line.derived_actual_amount),
    0,
  );

  return {
    budgetPeriodId: period.id,
    periodStart: period.period_start,
    periodEnd: period.period_end,
    status: period.status,
    available,
    planned,
    recordedOut,
    remainingInCategories,
    unassigned,
    unspentOverall,
    activityCount: selectedActivity.length,
    withinPlanLines,
    overPlanLines,
    previousPeriodId: previousPeriod?.id ?? null,
    recordedOutDelta: previousPeriod
      ? recordedOut - previousRecordedOut
      : null,
    plannedDelta: previousPeriod ? planned - previousPlanned : null,
  };
}
