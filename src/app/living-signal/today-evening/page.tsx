import { BottomNav, LaneCard, PreviewNotice, SceneHero } from "../_components";

export default function TodayEveningLiving() {
  return (
    <main className="ls-root" style={{ background: "#102733" }}>
      <PreviewNotice />
      <section className="ls-phone">
        <SceneHero
          scene="evening"
          eyebrow="Same THRIVE"
          title={<>Good evening,<br />Derek.</>}
          copy="You showed up again today. That matters."
          rightLabel="Today"
        >
          <div className="ls-progress ls-progress--dark">
            <div>
              <p className="ls-kicker" style={{ color: "#f4c978" }}>Today's progress</p>
              <p style={{ marginTop: 5, fontSize: 24, fontWeight: 950 }}>4 of 5 complete</p>
            </div>
            <div className="ls-ring-wrap"><div className="ls-ring" style={{ ["--p" as string]: "80%" }}><span>80%</span></div></div>
          </div>
        </SceneHero>

        <section className="ls-section ls-section--dark">
          <p className="ls-section-title">What moved</p>
          <div className="ls-grid">
            <LaneCard dark icon="✓" iconClass="ls-icon--wellness" title="Wellness check-in" copy="Completed · 7:12 PM" />
            <LaneCard dark icon="✓" iconClass="ls-icon--goal" title="Goal progress" copy="Completed · 4:03 PM" />
            <LaneCard dark icon="$" iconClass="ls-icon--money" title="Money plan" copy="Completed · 2:21 PM" />
            <LaneCard dark icon="♡" iconClass="ls-icon--support" title="Recovery support" copy="Completed · 6:48 PM" />
          </div>
        </section>
      </section>
      <BottomNav active="today" />
    </main>
  );
}
