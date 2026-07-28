"use client";

import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";

const supportAreas = [
  ["Budget help", "Review a plan, understand a category, or prepare a question."],
  ["Transaction understanding", "Ask for help reviewing an imported financial observation."],
  ["Wellness support", "Ask for help with routines, stress, sleep, or daily stability."],
  ["Goal support", "Talk through a barrier, next step, or support preference."],
  ["Program question", "Ask about your current THRIVE participation or supports."],
  ["General support", "Ask a plain-language question when you are not sure where it fits."],
];

const requestStates = [
  "Received",
  "In review",
  "Waiting for participant",
  "Resolved",
  "Archived",
];

export default function SupportPage() {
  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eef4ef] px-4 py-5 text-slate-950 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <ThriveSidebar />

          <section className="space-y-6">
            <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Support
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Know where to ask. Keep the request clear.
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                See the kinds of help that may be available and how a future
                request may work.
              </p>
            </header>

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Current requests
              </p>
              <h2 className="mt-2 text-2xl font-black">
                No participant support requests recorded yet
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                A future request may include what you need help with, how you
                prefer to be contacted, and whether the request is still open.
              </p>
              <div className="mt-5 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-500">
                Support requests are not available yet
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Help categories
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Choose the kind of help that fits best
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {supportAreas.map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <p className="font-black">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Future request structure
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Keep the request understandable
              </h2>
              <dl className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <dt className="font-black">What do I need help with?</dt>
                  <dd className="mt-2 text-sm leading-6 text-slate-600">
                    A participant-written request in plain language.
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <dt className="font-black">What would be useful?</dt>
                  <dd className="mt-2 text-sm leading-6 text-slate-600">
                    The participant&apos;s preferred kind of support.
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <dt className="font-black">How should someone follow up?</dt>
                  <dd className="mt-2 text-sm leading-6 text-slate-600">
                    A future contact preference within approved workflows.
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <dt className="font-black">What is the request status?</dt>
                  <dd className="mt-2 text-sm leading-6 text-slate-600">
                    A clear status that shows what happens next.
                  </dd>
                </div>
              </dl>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                  Request states
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Status should explain what happens next
                </h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {requestStates.map((state) => (
                    <span
                      key={state}
                      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-700"
                    >
                      {state}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Requests should move through visible states and use archive
                  rather than hard deletion during the MVP.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                  Contact pathways
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Support contacts are not connected yet
                </h2>
                <p className="mt-3 leading-7 text-slate-600">
                  Future contact details must come from an approved THRIVE
                  operational source and remain appropriate to the participant.
                </p>
              </div>
            </section>

            <section className="rounded-3xl bg-slate-950 p-6 text-white">
              <p className="font-black text-emerald-300">
                Support-request boundary
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                A support request does not create consent for external sharing,
                expanded system access, clinical intervention, emergency
                escalation, or Trust Engine action. Those require separately
                approved authority and workflows.
              </p>
            </section>
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
