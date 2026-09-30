import Link from "next/link";
import { BottomNav, PreviewNotice, SceneHero } from "../_components";

export default function FollowUpLiving() {
  return (
    <main className="ls-root">
      <PreviewNotice />
      <section className="ls-phone">
        <SceneHero
          scene="evening"
          eyebrow="Follow-up"
          title={<>Did this<br />help?</>}
          copy="Your feedback helps THRIVE bring better options next time."
          rightLabel="Support"
        />

        <section className="ls-section">
          <h2 className="ls-h2" style={{ fontSize: 30 }}>Were you able to make it to the meeting you saved?</h2>
          <div className="ls-grid">
            <button className="ls-button ls-button--green">✓ Yes, it helped</button>
            <button className="ls-button ls-button--light">◉ It was okay</button>
            <button className="ls-button" style={{ background: "#f7e3e1", color: "#a93e43" }}>× Not a good fit</button>
            <button className="ls-button" style={{ background: "#fff1d8", color: "#9c651a" }}>Not yet</button>
          </div>
          <textarea rows={4} placeholder="Add a note (optional)" style={{ width: "100%", marginTop: 14, borderRadius: 18, border: "1px solid rgba(20,45,55,.12)", padding: 14, font: "inherit", background: "rgba(255,255,255,.86)" }} />
          <Link href="/living-signal/story" className="ls-button ls-button--blue" style={{ marginTop: 14 }}>Done</Link>
        </section>
      </section>
      <BottomNav active="support" />
    </main>
  );
}
