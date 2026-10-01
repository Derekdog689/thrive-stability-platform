import Link from "next/link";
import { BottomNav, PreviewNotice, SceneHero } from "../_components";

export default function FollowUpLiving() {
  return (
    <main className="ls-root ls-root--meeting">
      <PreviewNotice />
      <section className="ls-phone">
        <SceneHero
          scene="meeting"
          eyebrow="Follow-up"
          title={<>Did this<br />help?</>}
          copy="Your feedback helps THRIVE bring better options next time."
          rightLabel="Support"
        />

        <section className="ls-section ls-followup-panel">
          <h2 className="ls-h2" style={{ fontSize: 30 }}>Were you able to make it to the meeting you saved?</h2>
          <div className="ls-grid">
            <button className="ls-button ls-button--green">✓ Yes, it helped</button>
            <button className="ls-button ls-button--light">◉ It was okay</button>
            <button className="ls-button ls-followup-negative">× Not a good fit</button>
            <button className="ls-button ls-followup-pending">Not yet</button>
          </div>
          <textarea rows={4} placeholder="Add a note (optional)" className="ls-note-field" />
          <Link href="/living-signal/story" className="ls-button ls-button--blue" style={{ marginTop: 14 }}>Done</Link>
        </section>
      </section>
      <BottomNav active="support" />
    </main>
  );
}
