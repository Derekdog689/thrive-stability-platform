"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import AuthGate from "../AuthGate";

const paths = [
  {
    title: "Find a meeting",
    detail: "A.A., NA, SMART Recovery, and online options.",
    href: "/resources?context=recovery&intent=meeting",
    accent: "from-sky-500 to-blue-700",
    icon: "◎",
  },
  {
    title: "Read something",
    detail: "Official recovery readings and literature starting points.",
    href: "/resources?context=recovery&intent=reading",
    accent: "from-amber-400 to-orange-600",
    icon: "▤",
  },
  {
    title: "Connect with someone",
    detail: "Continue with THRIVE Support or bring another person into the loop.",
    href: "/support?from=recovery-support",
    accent: "from-violet-500 to-purple-700",
    icon: "♡",
  },
] as const;

export default function RecoverySupportPage() {
  const params = useSearchParams();
  const [showRoutine, setShowRoutine] = useState(false);
  const fromWellness = params.get("from") === "wellness";

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#f6efe4] pb-28 text-slate-950">
        <section className="mx-auto max-w-3xl px-3 pb-28 pt-3 sm:px-6 sm:pt-6">
          <header
            className="relative min-h-[20rem] overflow-hidden rounded-[2rem] border border-white/70 bg-cover bg-center p-5 shadow-[0_22px_65px_rgba(15,23,42,0.16)] sm:p-8"
            style={{ backgroundImage: "linear-gradient(180deg,rgba(7,28,42,.18),rgba(7,28,42,.58)),url('/living-signal-morning.svg')" }}
          >
            <div className="relative z-10 flex h-full min-h-[17rem] flex-col justify-between text-white">
              <div className="flex items-center justify-between">
                <Link href={fromWellness ? "/wellness" : "/"} className="rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-black backdrop-blur-xl">
                  ← Back
                </Link>
                <span className="rounded-full border border-white/30 bg-slate-950/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] backdrop-blur-xl">Recovery Support</span>
              </div>
              <div className="max-w-xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-100">Real options. Real people.</p>
                <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">What would help first?</h1>
                <p className="mt-3 max-w-lg text-base font-semibold leading-7 text-white/88">You do not need to solve everything. Pick one direction and THRIVE will take you to something you can actually use.</p>
              </div>
            </div>
          </header>

          <section className="mt-4 grid gap-3">
            {paths.map((path) => (
              <Link key={path.title} href={path.href} className="group flex items-center gap-4 rounded-[1.7rem] border border-white/80 bg-white/76 p-4 shadow-[0_16px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl transition active:scale-[0.985]">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] bg-gradient-to-br ${path.accent} text-2xl font-black text-white shadow-lg`}>{path.icon}</div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black">{path.title}</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{path.detail}</p>
                </div>
                <span className="text-2xl font-black text-slate-400 transition group-hover:translate-x-0.5">›</span>
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setShowRoutine((value) => !value)}
              className="flex w-full items-center gap-4 rounded-[1.7rem] border border-white/80 bg-white/76 p-4 text-left shadow-[0_16px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl transition active:scale-[0.985]"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-emerald-400 to-teal-700 text-2xl font-black text-white shadow-lg">↗</div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-black">Build a routine</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">Try a simple recovery-support plan without turning it into homework.</p>
              </div>
              <span className="text-2xl font-black text-slate-400">{showRoutine ? "⌃" : "⌄"}</span>
            </button>

            {showRoutine ? (
              <div className="rounded-[1.7rem] border border-emerald-200/70 bg-emerald-50/82 p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Prototype only</p>
                <h3 className="mt-2 text-2xl font-black text-emerald-950">Pick one small anchor.</h3>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {["Find one meeting", "Read for five minutes", "Message one support person", "Write one intention"].map((item) => (
                    <button key={item} type="button" className="rounded-2xl border border-white/90 bg-white/82 px-4 py-3 text-left font-black text-slate-800 shadow-sm">{item}</button>
                  ))}
                </div>
                <p className="mt-4 text-sm font-semibold leading-6 text-emerald-900">Nothing is saved from this prototype yet. We are testing whether this kind of direction is actually useful before adding persistence.</p>
              </div>
            ) : null}
          </section>

          <section className="mt-4 overflow-hidden rounded-[1.7rem] bg-[#102f3a] p-5 text-white shadow-[0_18px_55px_rgba(15,23,42,0.16)]">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">You are not alone</p>
            <p className="mt-2 text-base font-semibold leading-7 text-white/85">Support can look different for different people. THRIVE can help you find what fits without pretending there is one right answer.</p>
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
