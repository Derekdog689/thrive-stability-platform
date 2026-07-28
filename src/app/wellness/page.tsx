"use client";

import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";

const reflectionAreas = [
  "Overall day",
  "Stress",
  "Sleep",
  "Energy",
  "Confidence",
  "Routine",
  "Recovery support",
  "Support needed",
];

const nextSteps = [
  "Take a short break",
  "Review today's plan",
  "Choose one small task",
  "Contact someone supportive",
  "Make time for food, water, or rest",
  "Ask for help",
];

export default function WellnessPage() {
  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eef4ef] px-4 py-5 text-slate-950 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <ThriveSidebar />

          <section className="space-y-6">
            <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Wellness
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                A small check-in for today.
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                Take a moment to notice how things are going. This space is for
                personal reflection and support planning. It does not provide a
                diagnosis or make conclusions about you.
              </p>
            </header>

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Today&apos;s reflection
              </p>
              <h2 className="mt-2 text-2xl font-black">
                No check-in recorded today
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                A future check-in may help you describe how today feels, what
                is affecting you, and whether support would be useful.
              </p>
              <div className="mt-5 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-500">
                Check-ins are not available yet
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Areas you may reflect on
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Notice what matters without scoring it
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {reflectionAreas.map((area) => (
                  <div
                    key={area}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <p className="font-black">{area}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Reflection preview only
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                One manageable next step
              </p>
              <h2 className="mt-2 text-2xl font-black">
                Choose something small and useful
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                These are optional ideas for reflection, not instructions,
                requirements, or conclusions.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {nextSteps.map((step) => (
                  <div
                    key={step}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 font-black text-emerald-950"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                  Support
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Support requests are not available yet
                </h2>
                <p className="mt-3 leading-7 text-slate-600">
                  When the Support workflow is approved, you may be able to ask
                  for help with routines, goals, budgeting, or general support.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                  Wellness history
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  No Wellness check-ins recorded yet
                </h2>
                <p className="mt-3 leading-7 text-slate-600">
                  Future entries will remain separate from imported financial
                  evidence, clinical records, and Trust Engine records.
                </p>
              </div>
            </section>

            <section className="rounded-3xl bg-slate-950 p-6 text-white">
              <p className="font-black text-emerald-300">
                Participant self-report boundary
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Wellness entries are participant self-report and personal
                context. They do not automatically become a diagnosis, relapse
                finding, incapacity determination, fiduciary conclusion, or
                emergency decision.
              </p>
            </section>
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
