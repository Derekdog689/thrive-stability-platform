import Link from "next/link";
import { BottomNav, PreviewNotice, SceneHero } from "../_components";

export default function MoneyCloseoutLiving() {
  return (
    <main className="ls-root ls-root--money">
      <PreviewNotice />
      <section className="ls-phone">
        <SceneHero
          scene="lake"
          eyebrow="Money closeout"
          title={<>September<br />complete.</>}
          copy="You finished your Money cycle. That's real progress."
          rightLabel="Money"
        >
          <div className="ls-stat-grid">
            <div className="ls-stat"><strong>$4,000</strong><span>Available</span></div>
            <div className="ls-stat"><strong>$2,455</strong><span>Used</span></div>
            <div className="ls-stat"><strong>5</strong><span>Categories tracked</span></div>
            <div className="ls-stat"><strong>0</strong><span>Over budget</span></div>
          </div>
        </SceneHero>

        <section className="ls-section ls-section--dark ls-money-return">
          <p className="ls-section-title">What changed</p>
          <h2 className="ls-h2">You stayed with the plan.</h2>
          <p className="ls-body">The month is closed. Your activity, categories, and remaining flexibility now become part of the bigger picture.</p>
          <div className="ls-grid">
            <Link href="/living-signal/story" className="ls-button ls-button--light">View details</Link>
            <Link href="/living-signal/today" className="ls-button ls-button--green">Carry forward</Link>
          </div>
        </section>
      </section>
      <BottomNav active="money" />
    </main>
  );
}
