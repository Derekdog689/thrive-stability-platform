"use client";

import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";
import WellnessCheckinCandidate from "./WellnessCheckinCandidate";

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
                Take a moment to notice how things are going and what may help
                today.
              </p>
            </header>

            <WellnessCheckinCandidate />

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                  Support
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Choosing support does not automatically send a request
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  Your check-in can help you notice when support may be useful.
                  Contacting staff remains a separate choice.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                  Your Wellness record
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Recent reflections are available in your Wellness view
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  THRIVE can keep your recent Wellness reflections together
                  without replacing earlier check-ins from the same day.
                </p>
              </div>
            </section>

            <section className="rounded-3xl bg-slate-950 p-6 text-white">
              <p className="font-black text-emerald-300">Your reflection</p>

              <p className="mt-3 text-sm leading-6 text-slate-200">
                A check-in is your own reflection. It does not create a
                diagnosis, emergency decision, relapse finding, or judgment
                about your ability to manage your life.
              </p>
            </section>
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
