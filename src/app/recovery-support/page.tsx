"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthGate from "../AuthGate";
import { LaneCard, SceneHero } from "../living-signal/_components";

function carryWellnessContext(params: URLSearchParams) {
  const next = new URLSearchParams();
  for (const key of [
    "overall",
    "stress",
    "sleep",
    "energy",
    "confidence",
    "routine",
    "recoverySupport",
    "supportNeeded",
  ]) {
    const value = params.get(key);
    if (value) next.set(key, value);
  }
  return next;
}

export default function RecoverySupportPage() {
  const searchParams = useSearchParams();
  const carried = carryWellnessContext(new URLSearchParams(searchParams.toString()));

  const meetingHref = "/resources?context=recovery&intent=meeting";
  const readingHref = "/resources?context=recovery&intent=reading";

  const supportParams = new URLSearchParams(carried);
  supportParams.set("from", "recovery");
  supportParams.set("recoverySupport", supportParams.get("recoverySupport") || "could_use_support");
  const supportHref = `/support?${supportParams.toString()}`;

  return (
    <AuthGate>
      <main className="ls-root ls-root--support">
        <section className="ls-phone">
          <SceneHero
            scene="support"
            eyebrow="Recovery Support"
            title={<>Real options.<br />Real people.</>}
            copy="Choose what fits you. THRIVE can help you find a starting point without choosing a recovery path for you."
            rightLabel="Support"
          />

          <section className="ls-section ls-support-panel">
            <p className="ls-section-title">What would be useful right now?</p>
            <div className="ls-grid">
              <LaneCard
                icon="◎"
                iconClass="ls-icon--meeting"
                title="Find a meeting"
                copy="A.A., NA, SMART Recovery, Celebrate Recovery, and online options"
                href={meetingHref}
              />
              <LaneCard
                icon="▤"
                iconClass="ls-icon--read"
                title="Read something"
                copy="Official recovery literature and daily reading sources"
                href={readingHref}
              />
              <LaneCard
                icon="♡"
                iconClass="ls-icon--goal"
                title="Connect with someone"
                copy="Ask THRIVE Support for help sorting out the next step"
                href={supportHref}
              />
              <LaneCard
                icon="↗"
                iconClass="ls-icon--money"
                title="Build a routine"
                copy="Keep this participant-owned for now. No completion is assumed."
                href="/wellness"
              />
            </div>
          </section>

          <section className="ls-section">
            <p className="ls-section-title">Your choice stays yours</p>
            <h2 className="ls-h2">Different paths can fit different people.</h2>
            <p className="ls-body">
              THRIVE can show verified starting points without ranking one recovery approach above another.
              Opening a Resource does not mean you attended, read, contacted, or completed anything.
            </p>
            <Link href="/wellness" className="ls-button ls-button--light" style={{ marginTop: 14 }}>
              Back to Wellness
            </Link>
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
