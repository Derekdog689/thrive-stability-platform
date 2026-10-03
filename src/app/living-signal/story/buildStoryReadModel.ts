import type { ParticipantGoal } from "../../goals/useParticipantGoals";
import type {
  ParticipantSupportRequest,
  ParticipantSupportStatusEvent,
} from "../../support/useParticipantSupport";
import type {
  BudgetPeriod,
  FinancialActivity,
} from "../../useParticipantFinancial";
import type { WellnessCheckinRow } from "../../wellness/useWellnessCheckinCandidate";
import { wellnessOverallLabel } from "../../wellness/wellnessVocabulary";

export type StoryLane = "Wellness" | "Goals" | "Money" | "Support";

export type StoryEvent = {
  id: string;
  lane: StoryLane;
  occurredAt: string;
  dateKey: string;
  title: string;
  detail: string;
  href: string;
};

export type StoryThread = {
  id: string;
  lane: StoryLane | "Recovery support";
  title: string;
  detail: string;
  href: string;
};

export type StoryReadModelInput = {
  todayKey: string;
  wellnessCheckins: WellnessCheckinRow[];
  goals: ParticipantGoal[];
  supportRequests: ParticipantSupportRequest[];
  supportStatusEvents: ParticipantSupportStatusEvent[];
  financialActivity: FinancialActivity[];
  budgetPeriods: BudgetPeriod[];
};

function shiftDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function easternDateKey(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function inWindow(dateKey: string, startKey: string, endKey: string) {
  return Boolean(dateKey && dateKey >= startKey && dateKey <= endKey);
}

function supportStatusLabel(value: string | null) {
  switch (value) {
    case "submitted":
    case "acknowledged":
      return "Support request received";
    case "in_progress":
      return "Support is in review";
    case "waiting_for_participant":
      return "Support needs your reply";
    case "completed":
      return "Support request completed";
    case "withdrawn":
      return "Support request withdrawn";
    case "archived":
      return "Support request archived";
    default:
      return "Support request updated";
  }
}

function currentSupportLabel(value: string) {
  switch (value) {
    case "submitted":
    case "acknowledged":
      return "Received";
    case "in_progress":
      return "In review";
    case "waiting_for_participant":
      return "Needs your reply";
    default:
      return value.replaceAll("_", " ");
  }
}

export function buildStoryReadModel({
  todayKey,
  wellnessCheckins,
  goals,
  supportRequests,
  supportStatusEvents,
  financialActivity,
  budgetPeriods,
}: StoryReadModelInput) {
  const startKey = shiftDateKey(todayKey, -6);
  const events: StoryEvent[] = [];

  const wellnessByDate = new Map<string, WellnessCheckinRow[]>();
  for (const checkin of wellnessCheckins) {
    if (!inWindow(checkin.checkin_date, startKey, todayKey)) continue;
    const bucket = wellnessByDate.get(checkin.checkin_date) ?? [];
    bucket.push(checkin);
    wellnessByDate.set(checkin.checkin_date, bucket);
  }

  for (const [dateKey, items] of wellnessByDate.entries()) {
    const latest = [...items].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    if (!latest) continue;

    events.push({
      id: `wellness:${dateKey}`,
      lane: "Wellness",
      occurredAt: latest.created_at,
      dateKey,
      title:
        items.length === 1
          ? "Wellness check-in"
          : `${items.length} Wellness check-ins`,
      detail: `Latest: ${wellnessOverallLabel(latest.overall_day)}.`,
      href: `/wellness?day=${encodeURIComponent(dateKey)}`,
    });
  }

  for (const goal of goals) {
    const createdKey = easternDateKey(goal.created_at);
    if (inWindow(createdKey, startKey, todayKey)) {
      events.push({
        id: `goal-created:${goal.id}`,
        lane: "Goals",
        occurredAt: goal.created_at,
        dateKey: createdKey,
        title: "Goal added",
        detail: goal.title,
        href: `/goals?goal=${encodeURIComponent(goal.id)}`,
      });
    }

    if (goal.progress_status === "completed") {
      const updatedKey = easternDateKey(goal.updated_at);
      if (inWindow(updatedKey, startKey, todayKey) && updatedKey !== createdKey) {
        events.push({
          id: `goal-completed:${goal.id}`,
          lane: "Goals",
          occurredAt: goal.updated_at,
          dateKey: updatedKey,
          title: "Goal is marked completed",
          detail: goal.title,
          href: `/goals?goal=${encodeURIComponent(goal.id)}`,
        });
      }
    }
  }

  const moneyByDate = new Map<string, FinancialActivity[]>();
  for (const activity of financialActivity) {
    if (!inWindow(activity.activity_date, startKey, todayKey)) continue;
    const bucket = moneyByDate.get(activity.activity_date) ?? [];
    bucket.push(activity);
    moneyByDate.set(activity.activity_date, bucket);
  }

  for (const [dateKey, items] of moneyByDate.entries()) {
    const latest = [...items].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    events.push({
      id: `money:${dateKey}`,
      lane: "Money",
      occurredAt: latest?.created_at ?? `${dateKey}T12:00:00Z`,
      dateKey,
      title:
        items.length === 1
          ? "Money activity recorded"
          : `${items.length} Money activities recorded`,
      detail: "Recorded in your Financial Activity.",
      href: "/financial-activity",
    });
  }

  for (const period of budgetPeriods) {
    if (period.status !== "completed" || !period.completed_at) continue;
    const dateKey = easternDateKey(period.completed_at);
    if (!inWindow(dateKey, startKey, todayKey)) continue;

    events.push({
      id: `budget-complete:${period.id}`,
      lane: "Money",
      occurredAt: period.completed_at,
      dateKey,
      title: "Money plan completed",
      detail: `${period.period_start} through ${period.period_end}`,
      href: `/budget?review=${encodeURIComponent(period.id)}`,
    });
  }

  for (const event of supportStatusEvents) {
    const dateKey = easternDateKey(event.changed_at);
    if (!inWindow(dateKey, startKey, todayKey)) continue;

    events.push({
      id: `support:${event.id}`,
      lane: "Support",
      occurredAt: event.changed_at,
      dateKey,
      title: supportStatusLabel(event.to_status),
      detail: "A Support request changed status.",
      href: `/support?request=${encodeURIComponent(event.support_request_id)}`,
    });
  }

  events.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  const threads: StoryThread[] = [];

  const latestCheckin = wellnessCheckins[0] ?? null;
  if (latestCheckin?.recovery_support === "could_use_support") {
    threads.push({
      id: `recovery:${latestCheckin.id}`,
      lane: "Recovery support",
      title: "Recovery support",
      detail: "You marked recovery support as something that could be useful.",
      href: "/recovery-support",
    });
  }

  const currentGoal =
    goals.find((goal) => goal.progress_status === "in_progress") ??
    goals.find((goal) => goal.progress_status === "not_started") ??
    null;

  if (currentGoal) {
    threads.push({
      id: `goal:${currentGoal.id}`,
      lane: "Goals",
      title: currentGoal.title,
      detail: currentGoal.next_step,
      href: `/goals?goal=${encodeURIComponent(currentGoal.id)}`,
    });
  }

  const unresolvedSupport =
    supportRequests.find(
      (request) => !["completed", "withdrawn", "archived"].includes(request.status),
    ) ?? null;

  if (unresolvedSupport) {
    threads.push({
      id: `support:${unresolvedSupport.id}`,
      lane: "Support",
      title: "Support request",
      detail: currentSupportLabel(unresolvedSupport.status),
      href: `/support?request=${encodeURIComponent(unresolvedSupport.id)}`,
    });
  }

  const activeBudget =
    budgetPeriods.find((period) => period.status === "active") ??
    budgetPeriods.find((period) => period.status === "draft") ??
    null;

  if (activeBudget) {
    threads.push({
      id: `money:${activeBudget.id}`,
      lane: "Money",
      title: activeBudget.status === "active" ? "Current Money plan" : "Money plan draft",
      detail:
        activeBudget.status === "active"
          ? `Active through ${activeBudget.period_end}.`
          : "A draft plan is waiting for you.",
      href: "/budget",
    });
  }

  return {
    startKey,
    endKey: todayKey,
    events,
    threads: threads.slice(0, 4),
  };
}
