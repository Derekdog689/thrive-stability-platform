import Link from "next/link";
import { BottomNav, LaneCard, PreviewNotice, SceneHero } from "../_components";

export default function WellnessLiving() {
  return (
    <main className="ls-root">
      <PreviewNotice />
      <section className="ls-phone">
        <SceneHero
          scene="morning"
          eyebrow="Wellness check-in"
          title={<>Be real.<br />Start here.</>}
          copy="How are you doing right now?"
          rightLabel="Wellness"
        />

        <section className="ls-section">
          <p className="ls-section-title">Today</p>
          <h2 className="ls-h2">You checked in.</h2>
          <p className="ls-body">You marked recovery support as something that could help right now.</p>

          <div className="ls-progress">
            <div>
              <p style={{ fontSize: 14, fontWeight: 900 }}>You've checked in</p>
              <p style={{ fontSize: 26, fontWeight: 950, marginTop: 2 }}>18 times this month</p>
              <p className="ls-card-copy" style={{ marginTop: 6 }}>Every check-in adds to your Story, not a streak.</p>
            </div>
            <span className="ls-icon ls-icon--wellness">◉</span>
          </div>

          <div className="ls-grid ls-grid--two">
            <LaneCard icon="◎" iconClass="ls-icon--meeting" title="Find a meeting" copy="In person or online" href="/living-signal/recovery" />
            <LaneCard icon="▤" iconClass="ls-icon--read" title="Read something" copy="Recovery literature" href="/living-signal/recovery" />
            <LaneCard icon="♡" iconClass="ls-icon--goal" title="Connect with someone" copy="Support options" href="/living-signal/recovery" />
            <LaneCard icon="↗" iconClass="ls-icon--money" title="Build a routine" copy="Create a simple plan" href="/living-signal/recovery" />
          </div>
          <Link href="/living-signal/today" className="ls-button ls-button--light" style={{ marginTop: 14 }}>Not right now</Link>
        </section>
      </section>
      <BottomNav active="wellness" />
    </main>
  );
}
