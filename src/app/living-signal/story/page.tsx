"use client";

import Link from "next/link";
import AuthGate from "../../AuthGate";
import { useParticipantGoals } from "../../goals/useParticipantGoals";
import { useParticipantSupport } from "../../support/useParticipantSupport";
import { useParticipantFinancial } from "../../useParticipantFinancial";
import { useWellnessCheckinCandidate } from "../../wellness/useWellnessCheckinCandidate";
import { SceneHero } from "../_components";
import {
  buildStoryReadModel,
  type StoryLane,
} from "./buildStoryReadModel";

function formatDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
}

function laneIcon(lane: StoryLane) {
  switch (lane) {
    case "Wellness":
      return "♡";
    case "Goals":
      return "◎";
    case "Money":
      return "$";
    case "Support":
      return "◌";
  }
}

function laneIconClass(lane: StoryLane) {
  switch (lane) {
    case "Wellness":
      return "ls-icon--wellness";
    case "Goals":
      return "ls-icon--goal";
    case "Money":
      return "ls-icon--money";
    case "Support":
      return "ls-icon--support";
  }
}

function StoryBottomNav() {
  const items = [
    ["/living-signal/today", "⌂", "Today"],
    ["/wellness", "♡", "Wellness"],
    ["/goals", "◎", "Goals"],
    ["/budget", "$", "Money"],
    ["/support", "◌", "Support"],
  ] as const;

  return (
    <nav className="ls-bottom-nav">
      {items.map(([href, icon, label]) => (
        <Link key={href} href={href} className="ls-nav-item">
          <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default function StoryLiving() {
  const wellness = useWellnessCheckinCandidate();
  const goals = useParticipantGoals();
  const support = useParticipantSupport();
  const financial = useParticipantFinancial();

  const story = buildStoryReadModel({
    todayKey: wellness.today,
    wellnessCheckins: wellness.recentCheckins,
    goals: goals.goals,
    supportRequests: support.requests,
    supportStatusEvents: support.statusEvents,
    financialActivity: financial.financialActivity,
    budgetPeriods: financial.budgetPeriods,
  });

  const loading =
    wellness.loading || goals.loading || support.loading || financial.loading;

  const errorMessage =
    wellness.errorMessage ||
    goals.errorMessage ||
    support.errorMessage ||
    financial.errorMessage;

  const rangeLabel = `${formatDateKey(story.startKey)}–${formatDateKey(story.endKey)}`;

  return (
    <AuthGate>
      <main className="ls-root ls-root--story">
        <section className="ls-phone">
          <SceneHero
            scene="story"
            eyebrow="Your Story"
            title={
              <>
                Your week,
                <br />
                in motion.
              </>
            }
            copy="A simple look at what changed, what moved, and what is still carrying."
            rightLabel={rangeLabel}
          />

          <section className="ls-section ls-story-week">
            <p className="ls-section-title">Last 7 days</p>
            <h2 className="ls-h2">What THRIVE can actually see.</h2>
            <p className="ls-body" style={{ marginTop: 8 }}>
              This view only uses saved THRIVE activity. Looking at a Resource does
              not become attendance, reading, contact, or completion.
            </p>

            {errorMessage ? (
              <div className="ls-card" style={{ marginTop: 16 }}>
                <span>
                  <span className="ls-card-title" style={{ display: "block" }}>
                    THRIVE could not load this Story.
                  </span>
                  <span className="ls-card-copy" style={{ display: "block", marginTop: 4 }}>
                    {errorMessage}
                  </span>
                </span>
              </div>
            ) : null}

            {!errorMessage && loading ? (
              <div className="ls-card" style={{ marginTop: 16 }}>
                <span className="ls-card-title">Connecting your Story...</span>
              </div>
            ) : null}

            {!errorMessage && !loading && story.events.length === 0 ? (
              <div className="ls-card" style={{ marginTop: 16 }}>
                <span>
                  <span className="ls-card-title" style={{ display: "block" }}>
                    Nothing is recorded here yet.
                  </span>
                  <span className="ls-card-copy" style={{ display: "block", marginTop: 4 }}>
                    As you use THRIVE, factual moments can collect here without turning
                    into a score or a streak.
                  </span>
                </span>
              </div>
            ) : null}

            {!errorMessage && !loading && story.events.length > 0 ? (
              <div className="ls-grid" style={{ marginTop: 16 }}>
                {story.events.map((event) => (
                  <Link key={event.id} href={event.href} className="ls-card">
                    <span className={`ls-icon ${laneIconClass(event.lane)}`}>
                      {laneIcon(event.lane)}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span className="ls-section-title" style={{ display: "block" }}>
                        {event.lane} · {formatDateKey(event.dateKey)}
                      </span>
                      <span className="ls-card-title" style={{ display: "block", marginTop: 4 }}>
                        {event.title}
                      </span>
                      <span className="ls-card-copy" style={{ display: "block", marginTop: 4 }}>
                        {event.detail}
                      </span>
                    </span>
                    <span className="ls-arrow">›</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </section>

          {!loading && !errorMessage && story.threads.length > 0 ? (
            <section className="ls-section">
              <p className="ls-section-title">Still carrying</p>
              <h2 className="ls-h2">Threads that are still open.</h2>
              <p className="ls-body" style={{ marginTop: 8 }}>
                THRIVE keeps these visible without pretending they are finished.
              </p>

              <div className="ls-grid" style={{ marginTop: 16 }}>
                {story.threads.map((thread) => (
                  <Link key={thread.id} href={thread.href} className="ls-card">
                    <span style={{ minWidth: 0 }}>
                      <span className="ls-section-title" style={{ display: "block" }}>
                        {thread.lane}
                      </span>
                      <span className="ls-card-title" style={{ display: "block", marginTop: 4 }}>
                        {thread.title}
                      </span>
                      <span className="ls-card-copy" style={{ display: "block", marginTop: 4 }}>
                        {thread.detail}
                      </span>
                    </span>
                    <span className="ls-arrow">›</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="ls-section">
            <p className="ls-section-title">Keep the thread</p>
            <h2 className="ls-h2">Story is a return surface, not a verdict.</h2>
            <p className="ls-body">
              THRIVE can put your saved moments next to each other. You decide what
              they mean and what, if anything, comes next.
            </p>
            <Link
              href="/living-signal/today"
              className="ls-button ls-button--blue"
              style={{ marginTop: 14 }}
            >
              Back to Today
            </Link>
          </section>
        </section>

        <StoryBottomNav />
      </main>
    </AuthGate>
  );
}
