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
  const items: { href: string; label: string; icon: IconName }[] = [
    { href: "/", label: "Today", icon: "today" },
    { href: "/wellness", label: "Wellness", icon: "wellness" },
    { href: "/goals", label: "Goals", icon: "goal" },
    { href: "/budget", label: "Money", icon: "money" },
    { href: "/support", label: "Support", icon: "support" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-2xl rounded-[1.75rem] border border-white/75 bg-white/78 px-1.5 py-1.5 shadow-[0_18px_55px_rgba(15,23,42,0.18)] backdrop-blur-2xl sm:bottom-5">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-w-0 flex-col items-center justify-center rounded-[1.2rem] px-1 py-2 text-center transition active:scale-95 ${
              item.href === "/wellness"
                ? "bg-emerald-700 text-white shadow-[0_8px_22px_rgba(4,120,87,0.24)]"
                : "text-slate-600 hover:bg-white/80 hover:text-emerald-900"
            }`}
          >
            <Icon name={item.icon} className="h-5 w-5" />
            <span className="mt-1 truncate text-[9px] font-black uppercase tracking-wide sm:text-xs">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function WellnessPage() {
  const [heroText, setHeroText] = useState("How are things right now?");

  return (
    <AuthGate>
      <main className="min-h-screen bg-[radial-gradient(circle_at_12%_4%,rgba(173,235,220,.34),transparent_24rem),radial-gradient(circle_at_88%_18%,rgba(246,218,150,.30),transparent_22rem),linear-gradient(180deg,#edf5f0_0%,#e8f0ef_55%,#eaf1f2_100%)] pb-36 text-slate-950">
        <section className="mx-auto max-w-4xl px-3 pb-32 pt-3 sm:px-6 sm:pt-6">
          <header
            className="thrive-ambient relative min-h-[430px] overflow-hidden rounded-[2.4rem] border border-white/60 bg-cover bg-center px-5 py-6 shadow-[0_24px_70px_rgba(10,34,43,0.18)] sm:min-h-[500px] sm:px-8 sm:py-8"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(244,249,244,0.22) 0%, rgba(224,239,232,0.28) 42%, rgba(7,42,52,0.52) 100%), url('https://images.unsplash.com/photo-1770341989953-f3efb336f7eb?auto=format&fit=crop&fm=jpg&q=88&w=2200')",
            }}
          >
            <div className="thrive-orb thrive-orb-one" />
            <div className="thrive-orb thrive-orb-two" />

            <div className="relative z-10 flex items-center justify-between gap-3">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/72 text-base font-black text-emerald-900 shadow-sm">T</div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-800">DSS Enterprises</p>
                  <p className="text-xs font-black text-emerald-950">THRIVE</p>
                </div>
              </Link>

              <div className="flex items-center gap-2 rounded-full border border-white/75 bg-white/58 px-3 py-2 text-xs font-black text-emerald-900 backdrop-blur-xl">
                <Icon name="wellness" className="h-5 w-5" />
                Wellness
              </div>
            </div>

            <div className="relative z-10 mt-24 max-w-2xl sm:mt-32">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#0f6f66]">Wellness</p>
              <h1 className="mt-3 font-serif text-5xl font-black leading-[0.98] tracking-[-0.035em] text-[#0b3135] sm:text-7xl">
                {heroText}
              </h1>
            </div>
          </header>

          <section className="mt-5 rounded-[2.2rem] border border-white/70 bg-white/24 p-3 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:p-5">
            <WellnessCheckinCandidate onHeroChange={setHeroText} />
          </section>

          <details className="mt-5 rounded-[1.7rem] border border-white/70 bg-white/54 px-5 py-4 text-sm text-slate-600 shadow-sm backdrop-blur-2xl">
            <summary className="cursor-pointer list-none font-black text-emerald-900">About your check-in</summary>
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
