"use client";

import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";

const goalAreas = [
  {
    title: "Daily stability",
    description: "Small routines that help today feel more manageable.",
  },
  {
    title: "Financial progress",
    description: "Planning, saving, and understanding what comes next.",
  },
  {
    title: "Health and wellness",
    description: "Participant-owned steps that support personal well-being.",
  },
  {
    title: "Relationships and support",
    description: "Connection, communication, and asking for useful help.",
  },
  {
    title: "Work and education",
    description: "Steps toward employment, training, or learning.",
  },
  {
    title: "Personal growth",
    description: "A goal that matters because you chose it.",
  },
];

const progressStates = [
  "Not started",
  "In progress",
  "Paused",
  "Completed",
  "Archived",
];

export default function GoalsPage() {
  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eef4ef] px-4 py-5 text-slate-950 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <ThriveSidebar />

          <section className="space-y-6">
            <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Goals
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Turn what matters into one manageable step.
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                See how future goals may be organized around what matters to
                you.
              </p>
            </header>

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Current goals
              </p>
              <h2 className="mt-2 text-2xl font-black">
                No participant-owned goals recorded yet
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                A goal may include why it matters, one manageable next step,
an optional goal area, and a progress status you can update
over time.
              </p>
              <div className="mt-5 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-500">
                Goal creation is not available yet
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Goal areas
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Choose a direction that matters to you
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {goalAreas.map((area) => (
                  <div
                    key={area.title}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <p className="font-black">{area.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {area.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Future goal structure
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Keep the goal understandable
              </h2>
              <dl className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <dt className="font-black">What am I working toward?</dt>
                  <dd className="mt-2 text-sm leading-6 text-slate-600">
                    A participant-written title in plain language.
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <dt className="font-black">Why does it matter to me?</dt>
                  <dd className="mt-2 text-sm leading-6 text-slate-600">
                    Your own reason for choosing the goal.
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <dt className="font-black">What is the next step?</dt>
                  <dd className="mt-2 text-sm leading-6 text-slate-600">
                    One useful action that is small enough to begin.
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <dt className="font-black">What support would help?</dt>
                  <dd className="mt-2 text-sm leading-6 text-slate-600">
                   An optional way to organize the goal around what matters to you.
                  </dd>
                </div>
              </dl>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                  Progress states
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Choose a progress status
                </h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {progressStates.map((state) => (
                    <span
                      key={state}
                      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-700"
                    >
                      {state}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Goals should use pause, complete, or archive states rather
                  than hard deletion during the MVP.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                  Ownership
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Who created the goal should stay visible
                </h2>
                <p className="mt-3 leading-7 text-slate-600">
                  A participant-created goal and a staff-suggested goal must
                  remain visibly distinct. Suggestions do not silently become
                  participant commitments.
                </p>
              </div>
            </section>

            <section className="rounded-3xl bg-slate-950 p-6 text-white">
              <p className="font-black text-emerald-300">
                Participant-owned goal boundary
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                This shell does not create goals, assign obligations, judge
                effort, score compliance, or change program participation.
                Future goal actions require a separately approved ownership,
                history, RLS, and archive workflow.
              </p>
            </section>
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
