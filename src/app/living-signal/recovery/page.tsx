import Link from "next/link";
import { BottomNav, LaneCard, PreviewNotice, SceneHero } from "../_components";

export default function RecoveryLiving() {
  return (
    <main className="ls-root ls-root--support">
      <PreviewNotice />
      <section className="ls-phone">
        <SceneHero
          scene="support"
          eyebrow="Recovery Support"
          title={<>Real options.<br />Real people.</>}
          copy="You choose what fits."
          rightLabel="Support"
        />

        <section className="ls-section ls-support-panel">
          <p className="ls-section-title">What do you need right now?</p>
          <div className="ls-grid">
            <LaneCard icon="◎" iconClass="ls-icon--meeting" title="Find a meeting" copy="In person or online" href="/living-signal/meeting" />
            <LaneCard icon="▤" iconClass="ls-icon--read" title="Read something" copy="Recovery literature" href="/living-signal/follow-up" />
            <LaneCard icon="♡" iconClass="ls-icon--goal" title="Connect with someone" copy="Support services and people" href="/living-signal/follow-up" />
            <LaneCard icon="↗" iconClass="ls-icon--money" title="Build a routine" copy="Create a simple plan that fits your life" href="/living-signal/follow-up" />
          </div>
        </section>
      </section>
      <BottomNav active="support" />
    </main>
  );
}
