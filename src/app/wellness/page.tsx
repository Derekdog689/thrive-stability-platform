"use client";

import Link from "next/link";
import { useState } from "react";
import AuthGate from "../AuthGate";
import WellnessCheckinCandidate from "./WellnessCheckinCandidate";

type IconName = "today" | "wellness" | "goal" | "money" | "support";

function Icon({ name, className = "h-6 w-6" }: { name: IconName; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "today") {
    return (
      <svg {...common}>
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10.5V20h13v-9.5" />
        <path d="M9.5 20v-5.5h5V20" />
      </svg>
    );
  }

  if (name === "wellness") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  }

  if (name === "goal") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="m15 9 5-5M16.5 4H20v3.5" />
      </svg>
    );
  }

  if (name === "money") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="18" height="12" rx="3" />
        <path d="M7 10h.01M17 14h.01" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M20.8 5.8c-2-2-5.2-1.8-7 .3L12 8.2l-1.8-2.1c-1.8-2.1-5-2.3-7-.3-2.1 2.1-2 5.6.2 7.6L12 21l8.6-7.6c2.2-2 2.3-5.5.2-7.6Z" />
    </svg>
  );
}

function WellnessBottomNav() {
  const items: { href: string; label: string; icon: IconName; active?: boolean }[] = [
    { href: "/living-signal/today", label: "Today", icon: "today" },
    { href: "/wellness", label: "Wellness", icon: "wellness", active: true },
    { href: "/goals", label: "Goals", icon: "goal" },
    { href: "/budget", label: "Money", icon: "money" },
    { href: "/support", label: "Support", icon: "support" },
  ];

  return (
    <nav className="fixed left-1/2 z-50 grid w-[calc(100%-20px)] max-w-[660px] -translate-x-1/2 grid-cols-5 gap-[3px] rounded-[24px] border border-white/75 bg-[#fbf9f3]/90 p-[6px] shadow-[0_20px_62px_rgba(10,31,39,0.18)] backdrop-blur-[26px] [bottom:calc(6px+env(safe-area-inset-bottom,0px))]">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] px-1 text-center text-[10px] font-black uppercase text-[#536174] no-underline transition active:scale-95 ${
            item.active
              ? "bg-[linear-gradient(180deg,#159784,#0a7d6f)] text-white shadow-[0_9px_24px_rgba(9,126,111,0.20)]"
              : "hover:bg-white/70 hover:text-[#173644]"
          }`}
        >
          <Icon name={item.icon} className="h-5 w-5" />
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export default function WellnessPage() {
  const [heroText, setHeroText] = useState("How are things right now?");

  return (
    <AuthGate>
      <main className="wellness-living-signal min-h-screen pb-40 text-[#0b2630]">
        <section className="mx-auto max-w-4xl px-3 pb-32 pt-3 sm:px-6 sm:pt-6">
          <header
            className="wellness-living-hero thrive-ambient relative min-h-[390px] overflow-hidden rounded-[2.15rem] border border-white/55 bg-cover bg-center px-5 py-5 shadow-[0_30px_80px_rgba(6,34,46,0.24)] sm:min-h-[430px] sm:px-7 sm:py-7"
            style={{
              backgroundImage:
                "radial-gradient(circle at 82% 12%, rgba(244,188,101,.32), transparent 26%), linear-gradient(180deg, rgba(248,241,231,.06) 0%, rgba(21,117,127,.08) 38%, rgba(5,35,47,.66) 100%), url('https://images.unsplash.com/photo-1770341989953-f3efb336f7eb?auto=format&fit=crop&fm=jpg&q=88&w=2200')",
            }}
          >
            <div className="thrive-orb thrive-orb-one" />
            <div className="thrive-orb thrive-orb-two" />
            <span className="wellness-atmosphere wellness-atmosphere--light" aria-hidden="true" />
            <span className="wellness-atmosphere wellness-atmosphere--mist" aria-hidden="true" />

            <div className="relative z-10 flex items-center justify-between gap-3">
              <Link href="/living-signal/today" className="flex items-center gap-2.5">
                <div className="wellness-brandmark" aria-hidden="true">
                  <span className="wellness-leaf wellness-leaf--one" />
                  <span className="wellness-leaf wellness-leaf--two" />
                  <span className="wellness-leaf wellness-leaf--three" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#146f78]">DSS Enterprises</p>
                  <p className="text-sm font-black tracking-[0.04em] text-[#0b3138]">THRIVE</p>
                </div>
              </Link>

              <div className="flex items-center gap-2 rounded-full border border-white/75 bg-white/58 px-3 py-2 text-xs font-black text-[#0b4b55] backdrop-blur-xl">
                <Icon name="wellness" className="h-5 w-5" />
                Wellness
              </div>
            </div>

            <div className="relative z-10 mt-20 max-w-[92%] sm:mt-24 sm:max-w-[82%]">
              <div className="wellness-hero-glass rounded-[1.8rem] border border-white/30 bg-[#082f3b]/52 px-5 py-5 text-white shadow-[0_18px_45px_rgba(3,25,34,0.20)] backdrop-blur-[18px] sm:px-6 sm:py-6">
                <div className="flex items-center gap-2">
                  <span className="h-[3px] w-8 rounded-full bg-[#f0b35e]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8fdad8]">Wellness</p>
                </div>
                <h1 className="mt-3 font-serif text-[2.65rem] font-black leading-[0.96] tracking-[-0.04em] text-white sm:text-6xl">
                  {heroText}
                </h1>
                <p className="mt-3 max-w-md text-sm font-bold leading-6 text-white/76">
                  A quick read on where you are, with room to go deeper only when it helps.
                </p>
              </div>
            </div>
          </header>

          <section className="wellness-living-body mt-4 rounded-[2rem] border border-white/55 bg-[#f7f2e8]/36 p-2.5 shadow-[0_24px_64px_rgba(10,36,46,0.10)] backdrop-blur-2xl sm:p-4">
            <WellnessCheckinCandidate onHeroChange={setHeroText} />
          </section>

          <details className="mt-5 rounded-[1.7rem] border border-white/65 bg-[#fbf7ef]/70 px-5 py-4 text-sm text-[#59697a] shadow-sm backdrop-blur-2xl">
            <summary className="cursor-pointer list-none font-black text-[#0b4b55]">About your check-in</summary>
            <p className="mt-3 leading-6">
              Your check-ins help THRIVE remember what has been happening, notice what changes or repeats, and offer ideas you can use or ignore. THRIVE offers supportive guidance, not clinical diagnosis or treatment decisions.
            </p>
          </details>
        </section>

        <WellnessBottomNav />
      </main>
    </AuthGate>
  );
}
