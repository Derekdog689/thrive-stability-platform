import Link from "next/link";
import { BottomNav, PreviewNotice, SceneHero } from "../_components";

const meetings = [
  ["New Hope NA", "Today · 7:30 PM", "In person · 3.2 miles", "Open meeting"],
  ["Unity Group", "Tomorrow · 6:00 PM", "In person · 4.1 miles", "Open meeting"],
  ["Freedom NA", "Tue · 7:00 PM", "In person · 5.6 miles", "Open discussion"],
];

export default function MeetingLiving() {
  return (
    <main className="ls-root ls-root--meeting">
      <PreviewNotice />
      <section className="ls-phone">
        <SceneHero
          scene="meeting"
          eyebrow="Meeting results"
          title={<>NA meetings<br />near you.</>}
          copy="Illustrative preview state. Production requires live verified meeting data."
          rightLabel="Change"
        />

        <section className="ls-section ls-meeting-panel">
          <div className="ls-chip">Springfield, IL · 10 mi</div>
          <div className="ls-grid">
            {meetings.map(([name, time, distance, type]) => (
              <article key={name} className="ls-card ls-meeting-card">
                <span className="ls-icon ls-icon--meeting">◎</span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span className="ls-card-title">{name}</span>
                  <span className="ls-card-copy" style={{ display: "block" }}>{time}</span>
                  <span className="ls-card-copy" style={{ display: "block" }}>{distance} · {type}</span>
                  <span className="ls-meeting-actions">
                    <span className="ls-chip">Directions</span>
                    <span className="ls-chip">♡ Save</span>
                  </span>
                </span>
              </article>
            ))}
          </div>
          <Link href="/living-signal/follow-up" className="ls-button ls-button--blue" style={{ marginTop: 14 }}>Choose New Hope NA</Link>
        </section>
      </section>
      <BottomNav active="support" />
    </main>
  );
}
