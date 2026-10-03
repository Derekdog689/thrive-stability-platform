"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AuthGate from "../../AuthGate";
import { SceneHero } from "../../living-signal/_components";

type MeetingRhythm = "none" | "one" | "few";
type CheckInRhythm = "later_this_week" | "next_week" | "when_ready";

function choiceClass(selected: boolean) {
  return selected
    ? "border-emerald-700 bg-emerald-700 text-white"
    : "border-white/80 bg-white/70 text-slate-700 hover:bg-white";
}

export default function RecoveryRoutinePage() {
  const [meetingRhythm, setMeetingRhythm] = useState<MeetingRhythm>("one");
  const [includePerson, setIncludePerson] = useState(true);
  const [includeReading, setIncludeReading] = useState(false);
  const [checkInRhythm, setCheckInRhythm] =
    useState<CheckInRhythm>("later_this_week");
  const [showPlan, setShowPlan] = useState(false);

  const meetingLine = useMemo(() => {
    if (meetingRhythm === "none") return null;
    if (meetingRhythm === "few") return "Look for a few meeting options this week.";
    return "Find one meeting option this week.";
  }, [meetingRhythm]);

  const checkInLine =
    checkInRhythm === "next_week"
      ? "Check back in with THRIVE next week."
      : checkInRhythm === "when_ready"
        ? "Come back to THRIVE when it feels useful."
        : "Check back in with THRIVE later this week.";

  return (
    <AuthGate>
      <main className="ls-root ls-root--support">
        <section className="ls-phone">
          <SceneHero
            scene="lake"
            eyebrow="Recovery routine"
            title={
              <>
                Build a rhythm
                <br />
                that fits your life.
              </>
            }
            copy="Pick a few supports that feel realistic. This is a planning aid, not a treatment plan, and THRIVE is not saving it yet."
            rightLabel="Routine"
          />

          {!showPlan ? (
            <>
              <section className="ls-section">
                <p className="ls-section-title">Meetings</p>
                <h2 className="ls-h2">How much structure sounds useful?</h2>
                <div className="mt-4 grid gap-2">
                  {[
                    ["none", "No meeting target right now"],
                    ["one", "Maybe one this week"],
                    ["few", "A few options this week"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMeetingRhythm(value as MeetingRhythm)}
                      className={`rounded-[1.2rem] border px-4 py-3 text-left text-sm font-black transition ${choiceClass(
                        meetingRhythm === value,
                      )}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="ls-section">
                <p className="ls-section-title">People + reflection</p>
                <h2 className="ls-h2">What else might help you stay connected?</h2>
                <div className="mt-4 grid gap-2">
                  <button
                    type="button"
                    onClick={() => setIncludePerson((value) => !value)}
                    className={`rounded-[1.2rem] border px-4 py-3 text-left text-sm font-black transition ${choiceClass(
                      includePerson,
                    )}`}
                  >
                    Reach out to one supportive person
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncludeReading((value) => !value)}
                    className={`rounded-[1.2rem] border px-4 py-3 text-left text-sm font-black transition ${choiceClass(
                      includeReading,
                    )}`}
                  >
                    Add a reading or reflection
                  </button>
                </div>
              </section>

              <section className="ls-section">
                <p className="ls-section-title">Check back in</p>
                <h2 className="ls-h2">When should THRIVE be useful again?</h2>
                <div className="mt-4 grid gap-2">
                  {[
                    ["later_this_week", "Later this week"],
                    ["next_week", "Next week"],
                    ["when_ready", "When I am ready"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCheckInRhythm(value as CheckInRhythm)}
                      className={`rounded-[1.2rem] border px-4 py-3 text-left text-sm font-black transition ${choiceClass(
                        checkInRhythm === value,
                      )}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowPlan(true)}
                  className="ls-button ls-button--primary"
                  style={{ marginTop: 18, width: "100%" }}
                >
                  Show my routine
                </button>
              </section>
            </>
          ) : (
            <section className="ls-section">
              <p className="ls-section-title">Your recovery-support routine</p>
              <h2 className="ls-h2">Simple enough to actually use.</h2>
              <div className="mt-4 grid gap-3">
                {meetingLine ? (
                  <div className="rounded-[1.25rem] border border-white/75 bg-white/72 p-4 font-black text-slate-800">
                    {meetingLine}
                  </div>
                ) : null}
                {includePerson ? (
                  <div className="rounded-[1.25rem] border border-white/75 bg-white/72 p-4 font-black text-slate-800">
                    Reach out to one supportive person.
                  </div>
                ) : null}
                {includeReading ? (
                  <div className="rounded-[1.25rem] border border-white/75 bg-white/72 p-4 font-black text-slate-800">
                    Open one recovery reading or reflection.
                  </div>
                ) : null}
                <div className="rounded-[1.25rem] border border-white/75 bg-white/72 p-4 font-black text-slate-800">
                  {checkInLine}
                </div>
              </div>

              <p className="ls-body" style={{ marginTop: 16 }}>
                This proving version does not save the routine or mark anything complete.
                It is here to test whether this kind of structure is useful before THRIVE stores it.
              </p>

              <div className="mt-5 grid gap-3">
                {meetingRhythm !== "none" ? (
                  <Link
                    href="/resources?context=recovery&intent=meeting"
                    className="ls-button ls-button--primary"
                  >
                    Find a meeting
                  </Link>
                ) : null}
                {includeReading ? (
                  <Link
                    href="/resources?context=recovery&intent=reading"
                    className="ls-button ls-button--light"
                  >
                    Find something to read
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowPlan(false)}
                  className="ls-button ls-button--light"
                >
                  Change this routine
                </button>
                <Link href="/recovery-support" className="ls-button ls-button--light">
                  Back to Recovery Support
                </Link>
              </div>
            </section>
          )}
        </section>
      </main>
    </AuthGate>
  );
}
