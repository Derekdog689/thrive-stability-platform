import Link from "next/link";
import { BottomNav, PreviewNotice, SceneHero } from "../_components";

export default function GoalCompletionLiving() {
  return (
    <main className="ls-root ls-root--goal">
      <PreviewNotice />
      <section className="ls-phone">
        <SceneHero
          scene="goal"
          eyebrow="Goal completion"
          title={<>You put in<br />the work.</>}
          copy="This is progress."
          rightLabel="Completed"
        >
          <div className="ls-completion-moment" aria-label="Goal completed">
            <div className="ls-check">✓</div>
            <p>Completed</p>
          </div>
        </SceneHero>

        <section className="ls-section ls-section--completion">
          <p className="ls-section-title">Completed</p>
          <h2 className="ls-h2">Become more consistent</h2>
          <p className="ls-body">3 days practiced</p>
          <p className="ls-body">You took meaningful steps toward this goal. Keep going, or let this progress become part of your Story.</p>
          <div className="ls-grid">
            <Link href="/living-signal/story" className="ls-button ls-button--blue">View in Story</Link>
            <Link href="/living-signal/today" className="ls-button ls-button--light">Set next step</Link>
          </div>
        </section>
      </section>
      <BottomNav active="goals" />
    </main>
  );
}
