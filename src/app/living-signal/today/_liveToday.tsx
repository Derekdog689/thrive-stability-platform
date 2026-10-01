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

function supportLabel(status: string | null | undefined) {
  switch (status) {
    case "waiting_for_participant":
      return "Needs your reply";
    case "in_progress":
      return "In progress";
    case "acknowledged":
      return "Received";
    case "submitted":
      return "Submitted";
    case "completed":
      return "Completed";
    case "withdrawn":
      return "Withdrawn";
    default:
      return status ? status.replaceAll("_", " ") : "Support is available";
  }
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

  const currentGoal = useMemo(
    () =>
      goals.activeGoals.find((goal) => goal.progress_status === "in_progress") ??
      goals.activeGoals.find((goal) => goal.progress_status === "not_started") ??
      goals.activeGoals.find((goal) => goal.progress_status === "paused") ??
      null,
    [goals.activeGoals],
  );

  const activeBudgetPeriod = useMemo(
    () =>
      financial.budgetPeriods.find((period) => period.status === "active") ??
      financial.budgetPeriods.find((period) => period.status === "draft") ??
      null,
    [financial.budgetPeriods],
  );

  const latestSupportRequest = support.requests[0] ?? null;

  const wellnessMoved = Boolean(wellness.todayCheckin);
  const goalMoved = goals.activeGoals.some(
    (goal) => timestampDateKey(goal.updated_at) === today,
  );
  const moneyMoved = financial.financialActivity.some(
    (activity) => activity.activity_date === today,
  );
  const supportMoved = support.requests.some(
    (request) => timestampDateKey(request.updated_at) === today,
  );

  const movementCount = [wellnessMoved, goalMoved, moneyMoved, supportMoved].filter(Boolean).length;
  const movementPercent = Math.round((movementCount / 4) * 100);

  const participantName =
    goals.participant?.preferred_name?.trim() ||
    goals.participant?.display_name?.trim() ||
    support.participantName ||
    financial.participantName ||
    "Participant";

  const budgetRemaining = activeBudgetPeriod
    ? financial.budgetLines
        .filter((line) => line.budget_period_id === activeBudgetPeriod.id)
        .reduce((sum, line) => sum + toNumber(line.derived_remaining_amount), 0)
    : 0;

  const wellnessCopy = wellness.todayCheckin
    ? `Checked in${formatTime(wellness.todayCheckin.updated_at) ? ` · ${formatTime(wellness.todayCheckin.updated_at)}` : ""}`
    : "Ready when you are";

  const goalCopy = currentGoal
    ? goalMoved
      ? `Moved today${formatTime(currentGoal.updated_at) ? ` · ${formatTime(currentGoal.updated_at)}` : ""}`
      : `Next · ${currentGoal.next_step}`
    : "No active goal right now";

  const moneyCopy = activeBudgetPeriod
    ? activeBudgetPeriod.status === "draft"
      ? "Plan draft ready to finish"
      : `${budgetRemaining.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        })} left in plan`
    : "No current Money plan";

  const supportCopy = supportLabel(latestSupportRequest?.status);

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
                ? movementCount > 0
                  ? "You showed up today. That matters."
                  : "Today is still part of the story."
                : "Built on today."
            }
            rightLabel="Today"
          >
            <div className={`ls-progress ${isEvening ? "ls-progress--dark" : ""}`}>
              <div>
                <p
                  className="ls-kicker"
                  style={{ color: isEvening ? "#f4c978" : "#167b73" }}
                >
                  Today&apos;s movement
                </p>
                <p style={{ marginTop: 5, fontSize: 24, fontWeight: 950 }}>
                  {loading
                    ? "Connecting your THRIVE..."
                    : movementCount === 1
                      ? "1 area moved today"
                      : `${movementCount} areas moved today`}
                </p>
              </div>
              <div className="ls-ring-wrap">
                <div
                  className="ls-ring"
                  style={{ ["--p" as string]: `${movementPercent}%` }}
                >
                  <span>{movementPercent}%</span>
                </div>
              </div>
            </div>
          </SceneHero>

          <section className={`ls-section ${isEvening ? "ls-section--dark" : ""}`}>
            <p className="ls-section-title">
              {isEvening ? "What moved" : "Your movement"}
            </p>

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
                  icon={wellnessMoved ? "✓" : "♡"}
                  iconClass="ls-icon--wellness"
                  title="Wellness check-in"
                  copy={wellnessCopy}
                  href="/wellness"
                />
                <LaneCard
                  dark={isEvening}
                  icon={goalMoved ? "✓" : "◎"}
                  iconClass="ls-icon--goal"
                  title={currentGoal?.title ?? "Goals"}
                  copy={goalCopy}
                  href="/goals"
                />
                <LaneCard
                  dark={isEvening}
                  icon="$"
                  iconClass="ls-icon--money"
                  title="Money plan"
                  copy={moneyCopy}
                  href="/budget"
                />
                <LaneCard
                  dark={isEvening}
                  icon="♡"
                  iconClass="ls-icon--support"
                  title="Support"
                  copy={supportCopy}
                  href="/support"
                />
              </div>
            ) : null}

            {synthesis ? (
              <div
                className={`ls-card ${isEvening ? "ls-card--dark" : ""}`}
                style={{ marginTop: 14 }}
              >
                <span style={{ minWidth: 0 }}>
                  <span className="ls-section-title">{synthesis.eyebrow}</span>
                  <span className="ls-card-title" style={{ display: "block", marginTop: 6 }}>
                    {synthesis.headline}
                  </span>
                  <span className="ls-card-copy" style={{ display: "block", marginTop: 6 }}>
                    {synthesis.detail}
                  </span>
                </span>
                {synthesis.actionHref && synthesis.actionLabel ? (
                  <Link href={synthesis.actionHref} className="ls-arrow" aria-label={synthesis.actionLabel}>
                    ›
                  </Link>
                ) : null}
              </div>
            ) : null}

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
