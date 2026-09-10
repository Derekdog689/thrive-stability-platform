"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthGate from "../AuthGate";
import {
  categoryLabel,
  loadParticipantResources,
  ParticipantResource,
  resourceCategories,
} from "./resourceData";

type IconName = "today" | "wellness" | "goal" | "money" | "support" | "resource" | "arrow";

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

  if (name === "today") return <svg {...common}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10.5V20h13v-9.5" /><path d="M9.5 20v-5.5h5V20" /></svg>;
  if (name === "wellness") return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
  if (name === "goal") return <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="m15 9 5-5M16.5 4H20v3.5" /></svg>;
  if (name === "money") return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M7 10h.01M17 14h.01" /><circle cx="12" cy="12" r="2.5" /></svg>;
  if (name === "support") return <svg {...common}><path d="M20.8 5.8c-2-2-5.2-1.8-7 .3L12 8.2l-1.8-2.1c-1.8-2.1-5-2.3-7-.3-2.1 2.1-2 5.6.2 7.6L12 21l8.6-7.6c2.2-2 2.3-5.5.2-7.6Z" /></svg>;
  if (name === "resource") return <svg {...common}><path d="M5 4.5h10.5A3.5 3.5 0 0 1 19 8v11.5H8.5A3.5 3.5 0 0 1 5 16V4.5Z" /><path d="M8.5 16H19M9 8h6M9 11h4" /></svg>;
  return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

function ParticipantBottomNav() {
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
          <Link key={item.href} href={item.href} className="flex min-w-0 flex-col items-center justify-center rounded-[1.2rem] px-1 py-2 text-center text-slate-600 transition hover:bg-white/80 hover:text-emerald-900 active:scale-95">
            <Icon name={item.icon} className="h-5 w-5" />
            <span className="mt-1 truncate text-[9px] font-black uppercase tracking-wide sm:text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<ParticipantResource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setErrorMessage("");

      try {
        const rows = await loadParticipantResources();
        if (!mounted) return;
        setResources(rows);
      } catch (error) {
        if (!mounted) return;
        setErrorMessage(error instanceof Error ? error.message : "Resources could not be loaded.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const availableCategories = useMemo(
    () => resourceCategories.filter((category) => resources.some((resource) => resource.category === category.id)),
    [resources],
  );

  const visibleResources = useMemo(
    () => selectedCategory ? resources.filter((resource) => resource.category === selectedCategory) : resources,
    [resources, selectedCategory],
  );

  return (
    <AuthGate>
      <main className="thrive-today-bg min-h-screen pb-36 text-slate-950">
        <section className="mx-auto max-w-5xl px-3 pb-32 pt-3 sm:px-6 sm:pt-6">
          <header className="thrive-ambient relative overflow-hidden rounded-[2rem] border border-white/65 bg-white/30 px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.09)] backdrop-blur-2xl sm:px-7 sm:py-6">
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
                <Icon name="resource" className="h-5 w-5" />
                Resources
              </div>
            </div>

            <div className="relative z-10 mt-7 max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Trusted starting points</p>
              <h1 className="mt-2 font-serif text-4xl font-black tracking-tight text-emerald-950 sm:text-6xl">What do you need today?</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600 sm:text-base">
                Pick a topic to see available places to start.
              </p>
            </div>
          </header>

          {!loading && !errorMessage && resources.length > 0 ? (
            <section className="mt-3 rounded-[1.7rem] border border-white/70 bg-white/40 p-3 shadow-[0_16px_45px_rgba(15,23,42,0.07)] backdrop-blur-2xl sm:p-4">
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("")}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black transition active:scale-95 ${selectedCategory === "" ? "border-emerald-700 bg-emerald-700 text-white shadow-[0_8px_20px_rgba(4,120,87,0.2)]" : "border-white/80 bg-white/62 text-slate-700 hover:bg-white/85"}`}
                >
                  All
                </button>
                {availableCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black transition active:scale-95 ${selectedCategory === category.id ? "border-emerald-700 bg-emerald-700 text-white shadow-[0_8px_20px_rgba(4,120,87,0.2)]" : "border-white/80 bg-white/62 text-slate-700 hover:bg-white/85"}`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {loading ? (
            <section className="mt-3 rounded-[1.8rem] border border-white/70 bg-white/48 p-5 shadow-sm backdrop-blur-2xl">
              <p className="font-black text-emerald-950">Getting Resources ready...</p>
            </section>
          ) : null}

          {errorMessage ? (
            <section role="alert" className="mt-3 rounded-[1.8rem] border border-rose-200 bg-rose-50/90 p-5 shadow-sm">
              <p className="font-black">Resources could not be loaded.</p>
              <p className="mt-2 text-sm leading-6 text-rose-800">{errorMessage}</p>
            </section>
          ) : null}

          {!loading && !errorMessage && visibleResources.length === 0 ? (
            <section className="mt-3 rounded-[1.8rem] border border-white/70 bg-white/48 p-5 shadow-sm backdrop-blur-2xl sm:p-6">
              <h2 className="text-xl font-black text-emerald-950">Nothing available in this topic right now.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Choose another topic to see the Resources currently available to you.</p>
            </section>
          ) : null}

          {!loading && !errorMessage && visibleResources.length > 0 ? (
            <section className="mt-3">
              <div className="mb-3 flex items-end justify-between gap-3 px-1">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Available now</p>
                  <h2 className="mt-1 text-2xl font-black text-emerald-950">{selectedCategory ? categoryLabel(selectedCategory) : "Resources"}</h2>
                </div>
                <span className="rounded-full border border-white/75 bg-white/55 px-3 py-1.5 text-xs font-black text-slate-600 backdrop-blur-xl">{visibleResources.length}</span>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                {visibleResources.map((resource) => (
                  <Link
                    key={resource.id}
                    href={`/resources/${resource.resource_slug}`}
                    className="group relative overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/48 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.07)] backdrop-blur-2xl transition hover:bg-white/62 active:scale-[0.99] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wide">
                          <span className="rounded-full bg-emerald-100/90 px-2.5 py-1 text-emerald-900">Official source</span>
                          {resource.state_code ? <span className="rounded-full bg-white/75 px-2.5 py-1 text-slate-600">{resource.state_code}</span> : null}
                        </div>
                        <h3 className="mt-4 text-2xl font-black leading-tight text-emerald-950">{resource.resource_name}</h3>
                        {resource.primaryOrganization ? <p className="mt-2 text-sm font-bold text-slate-500">{resource.primaryOrganization.organization_name}</p> : null}
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/72 text-emerald-900 shadow-sm transition group-hover:translate-x-0.5">
                        <Icon name="arrow" className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-4 line-clamp-3 leading-6 text-slate-700">{resource.plain_language_purpose}</p>
                    <p className="mt-4 text-xs font-black uppercase tracking-wide text-emerald-800">{categoryLabel(resource.category)}</p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </section>

        <ParticipantBottomNav />
      </main>
    </AuthGate>
  );
}
