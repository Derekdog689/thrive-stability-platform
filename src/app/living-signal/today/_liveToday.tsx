"use client";

import Link from "next/link";
import { useMemo } from "react";
import AuthGate from "../../AuthGate";
import { buildCrossLaneSynthesis } from "../../crossLaneSynthesis";
import { useParticipantGoals } from "../../goals/useParticipantGoals";
import { useParticipantSupport } from "../../support/useParticipantSupport";
import { toNumber, useParticipantFinancial } from "../../useParticipantFinancial";
import { useWellnessCheckinCandidate } from "../../wellness/useWellnessCheckinCandidate";
import { LaneCard, SceneHero } from "../_components";

type Mode = "auto" | "morning" | "evening";

type PrimaryAction = {
  label: string;
  title: string;
  detail: string;
  href: "/wellness" | "/goals" | "/budget" | "/support" | "/living-signal/today";
  action: string;
};

function easternHour() {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    hour12: false,
  }).format(new Date());

  const parsed = Number(hour);
  return Number.isFinite(parsed) ? parsed : 12;
}

function resolvedMode(mode: Mode): "morning" | "evening" {
  if (mode !== "auto") return mode;
  const hour = easternHour();
  return hour >= 17 || hour < 5 ? "evening" : "morning";
}

function businessDateKey() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function timestampDateKey(value: string | null | undefined) {
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

function formatTime(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  });
}

function daySignal(value: string | null | undefined) {
  switch (value) {
    case "good":
      return "Feeling good";
    case "okay":
      return "Doing alright";
    case "hard":
      return "Hard day";
    case "not_sure":
      return "Not sure today";
    default:
      return "Check in";
  }
}

function supportState(status: string | null | undefined) {
  switch (status) {
    case "waiting_for_participant":
      return "Needs reply";
    case "in_progress":
      return "In review";
    case "acknowledged":
    case "submitted":
      return "Received";
    case "completed":
      return "Completed";
    default:
      return status ? status.replaceAll("_", " ") : "Available";
  }
}

function formatMoneyShort(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  });
}

function LiveBottomNav() {
  const items = [
    ["/living-signal/today", "⌂", "Today", true],
    ["/wellness", "♡", "Wellness", false],
    ["/goals", "◎", "Goals", false],
    ["/budget", "$", "Money", false],
    ["/support", "◌", "Support", false],
  ] as const;

  return (
    <nav className="ls-bottom-nav">
      {items.map(([href, icon, label, active]) => (
        <Link
          key={href}
          href={href}
          className={`ls-nav-item ${active ? "ls-nav-item--active" : ""}`}
        >
          <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default function LiveToday({ mode }: { mode: Mode }) {
  const wellness = useWellnessCheckinCandidate();
  const goals = useParticipantGoals();
  const support = useParticipantSupport();
  const financial = useParticipantFinancial();

  const today = businessDateKey();

  const activeBudgetPeriod =
    financial.budgetPeriods.find((period) => period.status === "active") ?? null;
  const draftBudgetPeriod =
    financial.budgetPeriods.find((period) => period.status === "draft") ?? null;
  const hasCompletedBudget = financial.budgetPeriods.some(
    (period) => period.status === "completed",
  );
  const needsNextMoneyPlan =
    !activeBudgetPeriod && !draftBudgetPeriod && hasCompletedBudget;
  const budgetExpired =
    activeBudgetPeriod ? activeBudgetPeriod.period_end < today : false;

  const activeBudgetLines = activeBudgetPeriod
    ? financial.budgetLines.filter(
        (line) => line.budget_period_id === activeBudgetPeriod.id && line.is_active,
      )
    : [];
  const budgetRemaining = activeBudgetLines.reduce(
    (sum, line) => sum + toNumber(line.derived_remaining_amount),
    0,
  );

  const currentGoal =
    goals.activeGoals.find((goal) => goal.progress_status === "in_progress") ??
    goals.activeGoals.find((goal) => goal.progress_status === "not_started") ??
    null;

  const openGoalCount = goals.activeGoals.filter(
    (goal) => !["completed", "archived"].includes(goal.progress_status),
  ).length;

  const assistedBudgetByRequestId = new Map(
    support.assistedBudgetLinks.map((item) => [item.support_request_id, item]),
  );

  const unresolvedSupportRequest =
    support.requests.find(
      (request) => !["completed", "withdrawn", "archived"].includes(request.status),
    ) ?? null;

  const assistedBudgetReviewRequest =
    support.requests.find((request) => {
      const linked = assistedBudgetByRequestId.get(request.id);
      return (
        request.status === "waiting_for_participant" &&
        request.participant_category === "budget_money" &&
        linked?.budget_status === "draft"
      );
    }) ?? null;

  const assistedBudgetReviewLink = assistedBudgetReviewRequest
    ? assistedBudgetByRequestId.get(assistedBudgetReviewRequest.id) ?? null
    : null;

  const unresolvedAssistedLink = unresolvedSupportRequest
    ? assistedBudgetByRequestId.get(unresolvedSupportRequest.id) ?? null
    : null;

  const supportNeedsParticipant =
    unresolvedSupportRequest?.status === "waiting_for_participant" &&
    unresolvedAssistedLink?.budget_status !== "active" &&
    !assistedBudgetReviewRequest;

  const supportLaneLabel = assistedBudgetReviewRequest
    ? "Plan ready"
    : unresolvedAssistedLink?.budget_status === "active"
      ? "Plan active"
      : supportState(unresolvedSupportRequest?.status);

  const todayCheckins = wellness.recentCheckins.filter(
    (checkin) => checkin.checkin_date === today,
  );

  const goalEvents = goals.goals.filter(
    (goal) =>
      goal.progress_status !== "archived" &&
      timestampDateKey(goal.updated_at) === today,
  );

  const moneyEvents = financial.financialActivity.filter(
    (activity) => activity.activity_date === today,
  );

  const supportEvents = support.statusEvents.filter(
    (event) => timestampDateKey(event.changed_at) === today,
  );

  const participantName =
    goals.participant?.preferred_name?.trim() ||
    goals.participant?.display_name?.trim() ||
    support.participantName ||
    financial.participantName ||
    "Participant";

  const synthesis = buildCrossLaneSynthesis({
    todayCheckin: wellness.todayCheckin,
    currentGoal,
    supportRequests: support.requests,
    assistedBudgetLinks: support.assistedBudgetLinks,
    activeBudgetPeriod,
  });

  const loading =
    wellness.loading || goals.loading || support.loading || financial.loading;

  const errorMessage =
    wellness.errorMessage ||
    goals.errorMessage ||
    support.errorMessage ||
    financial.errorMessage;

  const isNewParticipant =
    !loading &&
    wellness.recentCheckins.length === 0 &&
    goals.goals.length === 0 &&
    financial.budgetPeriods.length === 0;

  const primaryAction: PrimaryAction = useMemo(() => {
    if (isNewParticipant) {
      return {
        label: "Start here",
        title: "Check in",
        detail: "Tell THRIVE how things are going right now.",
        href: "/wellness",
        action: "Check in",
      };
    }

    if (assistedBudgetReviewRequest && assistedBudgetReviewLink) {
      return {
        label: "Needs you",
        title: "Your starter Money plan is ready",
        detail:
          "Review what Support prepared. Change anything you want before you use it.",
        href: "/budget",
        action: "Review plan",
      };
    }

    if (supportNeedsParticipant) {
      return {
        label: "Needs you",
        title: "Support needs your reply",
        detail: "There is a message waiting for you.",
        href: "/support",
        action: "Reply",
      };
    }

    if (budgetExpired && activeBudgetPeriod) {
      return {
        label: "Needs you",
        title: "Your Money plan ended",
        detail:
          "Review the finished plan when you are ready to set up the next one.",
        href: "/budget",
        action: "Review Money",
      };
    }

    if (!wellness.todayCheckin) {
      return {
        label: "Start here",
        title: "Check in",
        detail: "Tell THRIVE how things are going right now.",
        href: "/wellness",
        action: "Check in",
      };
    }

    if (currentGoal?.next_step) {
      return {
        label: "One thing you can continue",
        title: currentGoal.title,
        detail: currentGoal.next_step,
        href: "/goals",
        action: "Continue goal",
      };
    }

    if (needsNextMoneyPlan) {
      return {
        label: "When you're ready",
        title: "Start your next Money plan",
        detail: "Your last plan is complete. Set up the next one when it is useful.",
        href: "/budget",
        action: "Open Money",
      };
    }

    return {
      label: "Right now",
      title: "You're caught up",
      detail:
        "Nothing in THRIVE needs your attention. Come back when something changes or when you want to work on something.",
      href: "/living-signal/today",
      action: "",
    };
  }, [
    isNewParticipant,
    assistedBudgetReviewRequest,
    assistedBudgetReviewLink,
    supportNeedsParticipant,
    budgetExpired,
    activeBudgetPeriod,
    wellness.todayCheckin,
    currentGoal,
    needsNextMoneyPlan,
  ]);

  const currentWellness = daySignal(wellness.todayCheckin?.overall_day);
  const currentGoals =
    openGoalCount > 0
      ? openGoalCount === 1
        ? "Open"
        : `${openGoalCount} open`
      : "No active goal";

  const currentMoney = budgetExpired
    ? "Plan ended"
    : activeBudgetPeriod
      ? `${formatMoneyShort(budgetRemaining)} left`
      : draftBudgetPeriod
        ? "Draft"
        : needsNextMoneyPlan
          ? "Next plan"
          : "No plan";

  const movementRows = [
    ...(todayCheckins.length > 0
      ? [
          {
            icon: "♡",
            iconClass: "ls-icon--wellness",
            title:
              todayCheckins.length === 1
                ? "Wellness check-in"
                : `${todayCheckins.length} Wellness check-ins`,
            copy: `Latest: ${daySignal(todayCheckins[0]?.overall_day)}${formatTime(todayCheckins[0]?.created_at) ? ` · ${formatTime(todayCheckins[0]?.created_at)}` : ""}`,
            href: "/wellness",
          },
        ]
      : []),
    ...goalEvents.slice(0, 1).map((goal) => ({
      icon: "◎",
      iconClass: "ls-icon--goal",
      title:
        goal.progress_status === "completed"
          ? "Goal completed"
          : "Goal moved today",
      copy: goal.title,
      href: "/goals",
    })),
    ...(moneyEvents.length > 0
      ? [
          {
            icon: "$",
            iconClass: "ls-icon--money",
            title:
              moneyEvents.length === 1
                ? "Money activity recorded"
                : `${moneyEvents.length} Money activities recorded`,
            copy: "Recorded in your Financial Activity today",
            href: "/financial-activity",
          },
        ]
      : []),
    ...(supportEvents.length > 0
      ? [
          {
            icon: "♡",
            iconClass: "ls-icon--support",
            title: "Support moved today",
            copy: supportLaneLabel,
            href: "/support",
          },
        ]
      : []),
  ];

  const displayMode = resolvedMode(mode);
  const isEvening = displayMode === "evening";

  return (
    <AuthGate>
      <main
        className="ls-root"
        style={isEvening ? { background: "#102733" } : undefined}
      >
        <section className="ls-phone">
          <SceneHero
            scene={isEvening ? "evening" : "morning"}
            eyebrow={isEvening ? "Same THRIVE" : "A brighter tomorrow"}
            title={
              <>
                {isEvening ? "Good evening" : "Good morning"},<br />
                {participantName}.
              </>
            }
            copy={
              isEvening
                ? "Same THRIVE. A quieter look at what matters now."
                : "Built on today."
            }
            rightLabel="Today"
          >
            <div className={`ls-progress ${isEvening ? "ls-progress--dark" : ""}`}>
              <div style={{ minWidth: 0 }}>
                <p
                  className="ls-kicker"
                  style={{ color: isEvening ? "#f4c978" : "#167b73" }}
                >
                  {primaryAction.label}
                </p>
                <p style={{ marginTop: 5, fontSize: 24, fontWeight: 950 }}>
                  {loading ? "Connecting your THRIVE..." : primaryAction.title}
                </p>
                {!loading ? (
                  <p className="ls-card-copy" style={{ marginTop: 6 }}>
                    {primaryAction.detail}
                  </p>
                ) : null}
              </div>
              {!loading && primaryAction.action ? (
                <Link
                  href={primaryAction.href}
                  className="ls-chip"
                  style={{ textDecoration: "none", color: "#0b2630" }}
                >
                  {primaryAction.action}
                </Link>
              ) : null}
            </div>
          </SceneHero>

          <section className={`ls-section ${isEvening ? "ls-section--dark" : ""}`}>
            <p className="ls-section-title">Your THRIVE right now</p>

            {errorMessage ? (
              <div className={`ls-card ${isEvening ? "ls-card--dark" : ""}`}>
                <span className="ls-card-title">THRIVE could not load this view.</span>
                <span className="ls-card-copy" style={{ display: "block" }}>
                  {errorMessage}
                </span>
              </div>
            ) : null}

            {!errorMessage ? (
              <div className="ls-grid">
                <LaneCard
                  dark={isEvening}
                  icon="♡"
                  iconClass="ls-icon--wellness"
                  title="Wellness"
                  copy={currentWellness}
                  href="/wellness"
                />
                <LaneCard
                  dark={isEvening}
                  icon="◎"
                  iconClass="ls-icon--goal"
                  title="Goals"
                  copy={currentGoals}
                  href="/goals"
                />
                <LaneCard
                  dark={isEvening}
                  icon="$"
                  iconClass="ls-icon--money"
                  title="Money"
                  copy={currentMoney}
                  href="/budget"
                />
                <LaneCard
                  dark={isEvening}
                  icon="♡"
                  iconClass="ls-icon--support"
                  title="Support"
                  copy={supportLaneLabel}
                  href="/support"
                />
              </div>
            ) : null}
          </section>

          <section className={`ls-section ${isEvening ? "ls-section--dark" : ""}`}>
            <p className="ls-section-title">What moved today</p>

            {movementRows.length > 0 ? (
              <div className="ls-grid">
                {movementRows.map((row) => (
                  <LaneCard
                    key={`${row.href}:${row.title}`}
                    dark={isEvening}
                    icon={row.icon}
                    iconClass={row.iconClass}
                    title={row.title}
                    copy={row.copy}
                    href={row.href}
                  />
                ))}
              </div>
            ) : (
              <div className={`ls-card ${isEvening ? "ls-card--dark" : ""}`}>
                <span>
                  <span className="ls-card-title" style={{ display: "block" }}>
                    Nothing new is recorded yet today.
                  </span>
                  <span className="ls-card-copy" style={{ display: "block", marginTop: 4 }}>
                    THRIVE will keep this space factual as your day changes.
                  </span>
                </span>
              </div>
            )}
          </section>

          {synthesis ? (
            <section className={`ls-section ${isEvening ? "ls-section--dark" : ""}`}>
              <p className="ls-section-title">Worth noticing</p>
              <div className={`ls-card ${isEvening ? "ls-card--dark" : ""}`}>
                <span style={{ minWidth: 0 }}>
                  <span className="ls-card-title" style={{ display: "block" }}>
                    {synthesis.headline}
                  </span>
                  <span className="ls-card-copy" style={{ display: "block", marginTop: 6 }}>
                    {synthesis.detail}
                  </span>
                </span>
                {synthesis.actionHref && synthesis.actionLabel ? (
                  <Link
                    href={synthesis.actionHref}
                    className="ls-arrow"
                    aria-label={synthesis.actionLabel}
                  >
                    ›
                  </Link>
                ) : null}
              </div>
            </section>
          ) : null}

          <section className={`ls-section ${isEvening ? "ls-section--dark" : ""}`}>
            <p className="ls-section-title">Your Story</p>
            <h2 className="ls-h2">Keep the thread.</h2>
            <p className="ls-body">
              What you finish, what changes, and what is still carrying can become part of the bigger picture.
            </p>
            <Link
              href="/living-signal/story"
              className="ls-button ls-button--blue"
              style={{ marginTop: 14 }}
            >
              View your Story
            </Link>
          </section>
        </section>

        <LiveBottomNav />
      </main>
    </AuthGate>
  );
}
