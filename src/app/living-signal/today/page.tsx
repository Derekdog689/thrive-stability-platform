import Link from "next/link";
import { BottomNav, LaneCard, PreviewNotice, SceneHero } from "../_components";

export default function TodayLiving() {
  return (
    <main className="ls-root">
      <PreviewNotice />
      <section className="ls-phone">
        <SceneHero
          scene="morning"
          eyebrow="A brighter tomorrow"
          title={<>Good morning,<br />Derek.</>}
          copy="Built on today."
          rightLabel="Today"
        >
          <div className="ls-progress">
            <div>
              <p className="ls-kicker" style={{ color: "#167b73" }}>Today's focus</p>
              <p style={{ marginTop: 5, fontSize: 24, fontWeight: 950 }}>3 of 5 complete</p>
            </div>
            <div className="ls-ring-wrap"><div className="ls-ring" style={{ ["--p" as string]: "60%" }}><span>60%</span></div></div>
          </div>
        </SceneHero>

        <section className="ls-section">
          <p className="ls-section-title">Your movement</p>
          <div className="ls-grid">
            <LaneCard icon="✓" iconClass="ls-icon--wellness" title="Wellness check-in" copy="Completed · 9:41 AM" href="/living-signal/wellness" />
            <LaneCard icon="✓" iconClass="ls-icon--goal" title="Working on a goal" copy="5 minutes today" href="/living-signal/goal-completion" />
            <LaneCard icon="$" iconClass="ls-icon--money" title="Money plan" copy="Track an expense" href="/living-signal/money-closeout" />
            <LaneCard icon="♡" iconClass="ls-icon--support" title="Recovery support" copy="Find a meeting or resource" href="/living-signal/recovery" />
          </div>
          <Link href="/living-signal/story" className="ls-button ls-button--blue" style={{ marginTop: 14 }}>View your Story</Link>
        </section>
      </section>
      <BottomNav active="today" />
    </main>
  );
}
