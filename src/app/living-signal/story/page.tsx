import Link from "next/link";
import { BottomNav, PreviewNotice, SceneHero } from "../_components";

export default function StoryLiving() {
  return (
    <main className="ls-root">
      <PreviewNotice />
      <section className="ls-phone">
        <SceneHero
          scene="morning"
          eyebrow="Your Story"
          title={<>A week of<br />real movement.</>}
          copy="Your journey, your way."
          rightLabel="Sep 23–30"
        />

        <section className="ls-section">
          <p className="ls-section-title">This week</p>
          <div className="ls-timeline">
            <div className="ls-event"><strong>Completed a goal</strong><span>Become more consistent</span></div>
            <div className="ls-event"><strong>Attended a meeting</strong><span>Participant-confirmed preview state</span></div>
            <div className="ls-event"><strong>Tracked Money</strong><span>September complete</span></div>
            <div className="ls-event"><strong>Wellness check-in</strong><span>Felt better · more rested</span></div>
          </div>
        </section>

        <section className="ls-section">
          <p className="ls-section-title">Still carrying</p>
          <h2 className="ls-h2">Recovery support</h2>
          <p className="ls-body">You are still exploring options. THRIVE keeps the thread visible without pretending it is finished.</p>
          <Link href="/living-signal/recovery" className="ls-button ls-button--blue" style={{ marginTop: 14 }}>Continue this thread</Link>
        </section>

        <section className="ls-section">
          <p className="ls-section-title">Progress geography</p>
          <div className="ls-map">
            <div className="ls-map-path" />
            <div className="ls-node ls-node--1">$</div>
            <div className="ls-node ls-node--2">◎</div>
            <div className="ls-node ls-node--3">♡</div>
          </div>
        </section>
      </section>
      <BottomNav active="today" />
    </main>
  );
}
