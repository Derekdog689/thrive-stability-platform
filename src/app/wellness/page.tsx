"use client";

import Link from "next/link";
import AuthGate from "../AuthGate";
import WellnessCheckinCandidate from "./WellnessCheckinCandidate";

function WellnessBottomNav() {
  const items = [
    { href: "/", label: "Today", icon: "⌂" },
    { href: "/wellness", label: "Wellness", icon: "◌" },
    { href: "/goals", label: "Goals", icon: "◎" },
    { href: "/budget", label: "Money", icon: "$" },
    { href: "/support", label: "Support", icon: "◯" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-xl rounded-[1.75rem] border border-white/60 bg-white/90 px-2 py-2 shadow-[0_18px_55px_rgba(15,23,42,0.2)] backdrop-blur-xl sm:bottom-5">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2 text-center transition ${
              item.href === "/wellness"
                ? "bg-emerald-700 text-white"
                : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"
            }`}
          >
            <span className="text-base font-black leading-none">{item.icon}</span>
            <span className="mt-1 truncate text-[10px] font-black uppercase tracking-wide sm:text-xs">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function WellnessPage() {
  return (
    <AuthGate>
      <main className="min-h-screen bg-[#e8f0eb] px-3 pb-28 pt-3 text-slate-950 sm:px-6 sm:pb-32 sm:pt-6">
        <section className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
          <section className="relative min-h-[430px] overflow-hidden rounded-[2.5rem] bg-[#073f32] text-white shadow-[0_28px_90px_rgba(6,55,42,0.26)] sm:min-h-[500px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(251,191,120,0.64),transparent_18%),radial-gradient(circle_at_62%_35%,rgba(246,198,134,0.23),transparent_25%),linear-gradient(155deg,#87a59b_0%,#557f70_25%,#245e4e_51%,#0b473a_74%,#062f29_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-[50%] bg-[linear-gradient(145deg,transparent_0%,transparent_21%,rgba(10,63,51,0.86)_22%,rgba(6,47,40,0.98)_50%,rgba(5,39,34,1)_100%)]" />
            <div className="absolute -left-[15%] top-[33%] h-52 w-[72%] rotate-[-9deg] rounded-[50%] bg-slate-950/18 blur-sm" />
            <div className="absolute -right-[18%] top-[39%] h-48 w-[62%] rotate-[7deg] rounded-[50%] bg-emerald-950/32 blur-sm" />

            <div className="relative flex min-h-[430px] flex-col p-5 sm:min-h-[500px] sm:p-8 lg:p-10">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-lg font-black ring-1 ring-white/20 backdrop-blur">
                    T
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-100/80">
                      DSS Enterprises
                    </p>
                    <p className="text-sm font-black tracking-wide text-white">THRIVE</p>
                  </div>
                </Link>

                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-white/90 backdrop-blur">
                  Wellness
                </span>
              </div>

              <div className="mt-auto max-w-3xl pb-6 sm:pb-8">
                <p className="font-serif text-2xl text-amber-50/90 sm:text-3xl">
                  A moment for you.
                </p>
                <h1 className="mt-2 font-serif text-5xl font-semibold tracking-tight text-white sm:text-7xl">
                  How are things today?
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-50/90 sm:text-xl">
                  Take a moment to check in.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">
                  Your check-in
                </p>
                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  Start wherever feels closest.
                </h2>
              </div>
              <p className="max-w-lg text-sm leading-6 text-slate-500">
                Your answers stay connected to your Wellness record. Saving a check-in does not automatically contact Support.
              </p>
            </div>

            <div className="[&>div>section:first-child]:hidden [&>div]:space-y-5">
              <WellnessCheckinCandidate />
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] bg-gradient-to-br from-[#f4e9dd] to-[#eef4ef] p-6 shadow-sm sm:p-7">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#9b613f]">
                Your reflection belongs to you
              </p>
              <p className="mt-3 font-serif text-2xl leading-9 text-slate-900">
                A check-in can simply be a moment to notice where you are today.
              </p>
            </div>

            <div className="rounded-[2rem] bg-[#073f32] p-6 text-white shadow-sm sm:p-7">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200">
                Support stays your choice
              </p>
              <p className="mt-3 text-lg font-black leading-7">
                Choosing a support-related answer does not send a request by itself.
              </p>
              <Link
                href="/support"
                className="mt-5 inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
              >
                Open Support when I want
              </Link>
            </div>
          </section>

          <details className="rounded-[2rem] border border-emerald-100 bg-white shadow-sm">
            <summary className="cursor-pointer list-none p-6 font-black text-emerald-900 sm:p-7">
              About Wellness in THRIVE
            </summary>
            <div className="border-t border-slate-100 px-6 pb-6 pt-5 text-sm leading-7 text-slate-600 sm:px-7 sm:pb-7">
              <p>
                Your saved Wellness reflections remain available for you to look back on. A check-in does not create a diagnosis, emergency decision, relapse finding, or judgment about your ability to manage your life.
              </p>
            </div>
          </details>
        </section>

        <WellnessBottomNav />
      </main>
    </AuthGate>
  );
}
