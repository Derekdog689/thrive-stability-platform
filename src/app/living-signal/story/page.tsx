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

type IconName = "today" | "wellness" | "goal" | "money" | "support";

function Icon({ name, className = "h-6 w-6" }: { name: IconName; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "today") return <svg {...common}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10.5V20h13v-9.5" /><path d="M9.5 20v-5.5h5V20" /></svg>;
  if (name === "wellness") return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
  if (name === "goal") return <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="m15 9 5-5M16.5 4H20v3.5" /></svg>;
  if (name === "money") return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M7 10h.01M17 14h.01" /><circle cx="12" cy="12" r="2.5" /></svg>;
  return <svg {...common}><path d="M20.8 5.8c-2-2-5.2-1.8-7 .3L12 8.2l-1.8-2.1c-1.8-2.1-5-2.3-7-.3-2.1 2.1-2 5.6.2 7.6L12 21l8.6-7.6c2.2-2 2.3-5.5.2-7.6Z" /></svg>;
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
  const items: { href: string; label: string; icon: IconName }[] = [
    { href: "/living-signal/today", label: "Today", icon: "today" },
    { href: "/wellness", label: "Wellness", icon: "wellness" },
    { href: "/goals", label: "Goals", icon: "goal" },
    { href: "/budget", label: "Money", icon: "money" },
    { href: "/support", label: "Support", icon: "support" },
  ];

  return (
    <nav className="story-bottom-nav fixed left-1/2 z-50 grid w-[calc(100%-20px)] max-w-[660px] -translate-x-1/2 grid-cols-5 gap-[3px] rounded-[24px] border border-white/75 bg-[#fbf9f3]/90 p-[6px] shadow-[0_20px_62px_rgba(10,31,39,0.18)] backdrop-blur-[26px] [bottom:calc(6px+env(safe-area-inset-bottom,0px))]">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] px-1 text-center text-[10px] font-black uppercase text-[#536174] no-underline transition active:scale-95 hover:bg-white/70 hover:text-[#173644]">
          <Icon name={item.icon} className="h-5 w-5" />
          <span className="truncate">{item.label}</span>
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
  const storyMarkers = story.events.slice(0, 7);
  const laneCounts = story.events.reduce<Record<StoryLane, number>>(
    (counts, event) => {
      counts[event.lane] += 1;
      return counts;
    },
    { Wellness: 0, Goals: 0, Money: 0, Support: 0 },
  );
  const markerPositions = [
    { left: "12%", top: "70%" },
    { left: "27%", top: "54%" },
    { left: "42%", top: "63%" },
    { left: "54%", top: "40%" },
    { left: "68%", top: "50%" },
    { left: "76%", top: "27%" },
    { left: "86%", top: "18%" },
  ];
  const storyDays = Array.from(
    story.events.reduce<Map<string, typeof story.events>>((days, event) => {
      const current = days.get(event.dateKey) ?? [];
      current.push(event);
      days.set(event.dateKey, current);
      return days;
    }, new Map()),
  ).map(([dateKey, events]) => ({
    dateKey,
    events,
    lanes: Array.from(new Set(events.map((event) => event.lane))),
  }));

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

          <section className="ls-section ls-story-week story-week-surface">
            <p className="ls-section-title">Last 7 days</p>
            <h2 className="ls-h2">What your week added up to.</h2>
            <p className="ls-body" style={{ marginTop: 8 }}>
              This view only uses saved THRIVE activity. Looking at a Resource does
              not become attendance, reading, contact, or completion.
            </p>

            {!errorMessage && !loading && story.events.length > 0 ? (
              <div className="story-geography" aria-label="Factual Story activity across the last seven days">
                <div className="story-geography-path" aria-hidden="true" />
                {storyMarkers.map((event, index) => (
                  <Link
                    key={event.id}
                    href={event.href}
                    className={`story-geography-marker story-geography-marker--${event.lane.toLowerCase()}`}
                    style={markerPositions[index]}
                    aria-label={`${event.lane}: ${event.title}`}
                  >
                    <span>{laneIcon(event.lane)}</span>
                  </Link>
                ))}
                <div className="story-geography-summary">
                  <span><strong>{story.events.length}</strong> saved moments</span>
                  <span><strong>{laneCounts.Wellness + laneCounts.Goals + laneCounts.Money + laneCounts.Support}</strong> lane events</span>
                  <span><strong>{story.threads.length}</strong> carrying</span>
                </div>
              </div>
            ) : null}

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
              <div className="story-day-groups">
                {storyDays.map((day, index) => (
                  <details
                    key={day.dateKey}
                    className="story-day-group"
                    open={index === 0}
                  >
                    <summary className="story-day-summary">
                      <span>
                        <span className="story-day-date">{formatDateKey(day.dateKey)}</span>
                        <span className="story-day-meta">
                          {day.events.length} {day.events.length === 1 ? "moment" : "moments"} · {day.lanes.join(" · ")}
                        </span>
                      </span>
                      <span className="story-day-chevron" aria-hidden="true">⌄</span>
                    </summary>

                    <div className="story-day-events">
                      {day.events.map((event) => (
                        <Link key={event.id} href={event.href} className="story-day-event">
                          <span className={`ls-icon ${laneIconClass(event.lane)}`}>
                            {laneIcon(event.lane)}
                          </span>
                          <span style={{ minWidth: 0 }}>
                            <span className="ls-section-title" style={{ display: "block" }}>
                              {event.lane}
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
                  </details>
                ))}
              </div>
            ) : null}
          </section>

          {!loading && !errorMessage && story.threads.length > 0 ? (
            <section className="ls-section story-carry-surface">
              <div className="story-carry-bridge" aria-hidden="true" />
              <p className="ls-section-title">Still carrying</p>
              <h2 className="ls-h2">The week does not erase what is unfinished.</h2>
              <p className="ls-body" style={{ marginTop: 8 }}>
                THRIVE keeps these threads visible without pretending they are finished.
              </p>

              <div className="story-carry-list" style={{ marginTop: 16 }}>
                {story.threads.map((thread, index) => (
                  <Link key={thread.id} href={thread.href} className="story-carry-thread">
                    <span className="story-carry-index" aria-hidden="true">{index + 1}</span>
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
