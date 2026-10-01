import Link from "next/link";
import { PreviewNotice } from "./_components";

const states = [
  ["Today — Morning", "/living-signal/today"],
  ["Today — Evening", "/living-signal/today-evening"],
  ["Wellness", "/living-signal/wellness"],
  ["Goal completion", "/living-signal/goal-completion"],
  ["Money closeout", "/living-signal/money-closeout"],
  ["Story", "/living-signal/story"],
  ["Recovery Support", "/living-signal/recovery"],
  ["Meeting results", "/living-signal/meeting"],
  ["Follow-up", "/living-signal/follow-up"],
];

export default function LivingSignalIndex() {
  return (
    <main className="ls-root">
      <PreviewNotice />
      <section className="ls-phone">
        <div className="ls-section">
          <p className="ls-section-title">Living Signal</p>
          <h1 className="ls-h2">Visual acceptance shell</h1>
          <p className="ls-body">These are controlled preview states built to match the approved board before live THRIVE behavior is reconnected.</p>
          <div className="ls-grid">
            {states.map(([label, href], index) => (
              <Link key={href} href={href} className="ls-card">
                <span className="ls-icon ls-icon--meeting">{index + 1}</span>
                <span className="ls-card-title">{label}</span>
                <span className="ls-arrow">›</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
