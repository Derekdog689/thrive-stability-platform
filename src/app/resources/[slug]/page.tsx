"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AuthGate from "../../AuthGate";
import {
  categoryLabel,
  loadParticipantResourceDetail,
  ParticipantResource,
  ResourceAccessPath,
  ResourceGuidanceSection,
} from "../resourceData";

type DetailState = {
  resource: ParticipantResource;
  accessPaths: ResourceAccessPath[];
  guidanceSections: ResourceGuidanceSection[];
};

type IconName = "today" | "wellness" | "goal" | "money" | "support" | "resource" | "arrow" | "back";

const guidanceOrder = [
  "what_this_is",
  "start_here",
  "what_you_can_do",
  "how_it_works",
  "what_to_have_ready",
  "important_note",
  "fallback",
  "need_help",
  "other",
];

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
  if (name === "back") return <svg {...common}><path d="m15 18-6-6 6-6" /><path d="M9 12h10" /></svg>;
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

function pathHref(path: ResourceAccessPath) {
  if (path.url) return path.url;
  if (path.phone) return `tel:${path.phone.replace(/[^0-9+]/g, "")}`;
  if (path.email) return `mailto:${path.email}`;
  return null;
}

function actionLabel(path: ResourceAccessPath) {
  if (path.label) return path.label;
  if (path.path_type === "direct_action") return "Open official action";
  if (path.path_type === "instructions") return "View official instructions";
  if (path.path_type === "finder") return "Open official finder";
  if (path.path_type === "office_locator") return "Find an office";
  if (path.path_type === "phone") return "Call official help";
  if (path.path_type === "email") return "Email official help";
  if (path.path_type === "document") return "Open official document";
  if (path.path_type === "fallback") return "Open fallback option";
  return "Open official site";
}

export default function ResourceDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [detail, setDetail] = useState<DetailState | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!slug) return;
      setLoading(true);
      setErrorMessage("");

      try {
        const result = await loadParticipantResourceDetail(slug);
        if (!mounted) return;
        setDetail(result);
      } catch (error) {
        if (!mounted) return;
        setErrorMessage(error instanceof Error ? error.message : "This Resource could not be loaded.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const primaryPath = useMemo(() => {
    if (!detail) return null;
    return detail.accessPaths.find((path) => path.is_primary) ?? detail.accessPaths[0] ?? null;
  }, [detail]);

  const orderedGuidance = useMemo(() => {
    if (!detail) return [];
    return [...detail.guidanceSections]
      .filter((section) => !(primaryPath && section.section_type === "start_here"))
      .sort((a, b) => {
        const aType = guidanceOrder.indexOf(a.section_type);
        const bType = guidanceOrder.indexOf(b.section_type);
        if (aType !== bType) return (aType === -1 ? 999 : aType) - (bType === -1 ? 999 : bType);
        return a.sort_order - b.sort_order;
      });
  }, [detail, primaryPath]);

  const otherPaths = useMemo(() => {
    if (!detail) return [];
    return detail.accessPaths.filter((path) => path.id !== primaryPath?.id);
  }, [detail, primaryPath]);

  const supportHref = useMemo(() => {
    if (!detail) return "/support";
    const supportParams = new URLSearchParams({ resource: detail.resource.resource_slug });
    if (primaryPath?.id) supportParams.set("path", primaryPath.id);
    return `/support?${supportParams.toString()}`;
  }, [detail, primaryPath]);

  return (
    <AuthGate>
      <main className="thrive-today-bg min-h-screen pb-36 text-slate-950">
        <section className="mx-auto max-w-5xl px-3 pb-32 pt-3 sm:px-6 sm:pt-6">
          <header className="thrive-ambient relative overflow-hidden rounded-[2rem] border border-white/65 bg-white/30 px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.09)] backdrop-blur-2xl sm:px-7 sm:py-6">
            <div className="thrive-orb thrive-orb-one" />
            <div className="thrive-orb thrive-orb-two" />

            <div className="relative z-10 flex items-center justify-between gap-3">
              <Link href="/resources" className="flex items-center gap-2 rounded-full border border-white/75 bg-white/58 px-3 py-2 text-xs font-black text-emerald-900 backdrop-blur-xl">
                <Icon name="back" className="h-4 w-4" />
                Resources
              </Link>

              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/72 text-base font-black text-emerald-900 shadow-sm">T</div>
                <div className="hidden text-left sm:block">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-800">DSS Enterprises</p>
                  <p className="text-xs font-black text-emerald-950">THRIVE</p>
                </div>
              </Link>
            </div>

            {loading ? (
              <div className="relative z-10 mt-7"><p className="font-black text-emerald-950">Getting this Resource ready...</p></div>
            ) : null}

            {!loading && !errorMessage && detail ? (
              <div className="relative z-10 mt-7 max-w-3xl">
                <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wide">
                  <span className="rounded-full bg-emerald-100/90 px-2.5 py-1 text-emerald-900">Official source</span>
                  {detail.resource.state_code ? <span className="rounded-full bg-white/75 px-2.5 py-1 text-slate-600">{detail.resource.state_code}</span> : null}
                  <span className="rounded-full bg-white/75 px-2.5 py-1 text-slate-600">{categoryLabel(detail.resource.category)}</span>
                </div>
                <h1 className="mt-4 font-serif text-4xl font-black tracking-tight text-emerald-950 sm:text-6xl">{detail.resource.resource_name}</h1>
                {detail.resource.primaryOrganization ? <p className="mt-3 text-base font-bold text-slate-500 sm:text-lg">{detail.resource.primaryOrganization.organization_name}</p> : null}
                <p className="mt-4 max-w-3xl leading-7 text-slate-700">{detail.resource.plain_language_purpose}</p>
                {detail.resource.service_area_text ? <p className="mt-3 text-xs font-black uppercase tracking-wide text-slate-500">Service area · {detail.resource.service_area_text}</p> : null}
              </div>
            ) : null}
          </header>

          {errorMessage ? (
            <section role="alert" className="mt-3 rounded-[1.8rem] border border-rose-200 bg-rose-50/90 p-5 shadow-sm">
              <p className="font-black">This Resource could not be loaded.</p>
              <p className="mt-2 text-sm leading-6 text-rose-800">{errorMessage}</p>
            </section>
          ) : null}

          {!loading && !errorMessage && !detail ? (
            <section className="mt-3 rounded-[1.8rem] border border-white/70 bg-white/48 p-5 shadow-sm backdrop-blur-2xl sm:p-6">
              <h1 className="text-2xl font-black text-emerald-950">This Resource is not available right now.</h1>
              <p className="mt-3 leading-6 text-slate-600">It may be paused or the link may be out of date.</p>
              <Link href="/resources" className="mt-5 inline-flex rounded-full bg-emerald-700 px-5 py-3 font-black text-white shadow-[0_10px_24px_rgba(4,120,87,0.2)]">Browse Resources</Link>
            </section>
          ) : null}

          {!loading && !errorMessage && detail ? (
            <>
              {primaryPath ? (
                <section className="thrive-focus-card relative mt-3 overflow-hidden rounded-[1.8rem] border border-emerald-100/80 bg-emerald-50/62 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:p-6">
                  <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-emerald-200/40" />
                  <div className="relative z-10">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/75 text-emerald-900 shadow-sm"><Icon name="resource" className="h-6 w-6" /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Start here</p>
                        <h2 className="mt-2 text-2xl font-black leading-tight text-emerald-950">{primaryPath.label}</h2>
                        {primaryPath.plain_language_instruction ? <p className="mt-2 leading-6 text-slate-700">{primaryPath.plain_language_instruction}</p> : null}
                      </div>
                    </div>
                    {pathHref(primaryPath) ? (
                      <a href={pathHref(primaryPath) ?? undefined} target={primaryPath.url ? "_blank" : undefined} rel={primaryPath.url ? "noreferrer" : undefined} className="mt-5 flex min-h-12 w-full items-center justify-center rounded-[1.2rem] bg-emerald-700 px-4 py-3 text-center font-black text-white shadow-[0_10px_24px_rgba(4,120,87,0.22)] transition hover:bg-emerald-800 active:scale-[0.985]">
                        {actionLabel(primaryPath)}<Icon name="arrow" className="ml-2 h-5 w-5" />
                      </a>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {orderedGuidance.length > 0 ? (
                <section className="mt-3 grid gap-3 lg:grid-cols-2">
                  {orderedGuidance.map((section) => (
                    <article key={section.id} className="rounded-[1.8rem] border border-white/70 bg-white/48 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.07)] backdrop-blur-2xl sm:p-6">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">{section.section_type.replaceAll("_", " ")}</p>
                      <h2 className="mt-2 text-xl font-black text-emerald-950 sm:text-2xl">{section.heading}</h2>
                      <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">{section.content}</p>
                    </article>
                  ))}
                </section>
              ) : null}

              {otherPaths.length > 0 ? (
                <section className="mt-3 rounded-[1.8rem] border border-white/70 bg-white/42 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.07)] backdrop-blur-2xl sm:p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Other official paths</p>
                  <h2 className="mt-2 text-2xl font-black text-emerald-950">More ways to get there</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {otherPaths.map((path) => (
                      <article key={path.id} className="rounded-[1.4rem] border border-white/80 bg-white/58 p-4">
                        <p className="font-black text-slate-900">{path.label}</p>
                        {path.plain_language_instruction ? <p className="mt-2 text-sm leading-6 text-slate-600">{path.plain_language_instruction}</p> : null}
                        {pathHref(path) ? (
                          <a href={pathHref(path) ?? undefined} target={path.url ? "_blank" : undefined} rel={path.url ? "noreferrer" : undefined} className="mt-4 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-sm font-black text-emerald-900">
                            {actionLabel(path)}<Icon name="arrow" className="ml-2 h-4 w-4" />
                          </a>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {detail.resource.participant_boundary_note ? (
                <details className="mt-3 rounded-[1.5rem] border border-white/70 bg-white/34 px-4 py-3 text-sm text-slate-600 backdrop-blur-xl">
                  <summary className="cursor-pointer list-none font-black text-emerald-900">About this Resource</summary>
                  <p className="mt-3 leading-6">{detail.resource.participant_boundary_note}</p>
                </details>
              ) : null}

              <section className="mt-3 rounded-[1.8rem] border border-violet-100/80 bg-violet-50/58 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.07)] backdrop-blur-2xl sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/75 text-violet-800 shadow-sm"><Icon name="support" className="h-6 w-6" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-700">Support</p>
                    <h2 className="mt-2 text-2xl font-black text-violet-950">Need a hand with this?</h2>
                    <p className="mt-2 leading-6 text-slate-600">Ask THRIVE Support for help finding the right page or next step.</p>
                  </div>
                </div>
                <Link href={supportHref} className="mt-5 flex min-h-12 w-full items-center justify-center rounded-[1.2rem] bg-violet-700 px-4 py-3 text-center font-black text-white shadow-[0_10px_24px_rgba(109,40,217,0.18)] transition hover:bg-violet-800 active:scale-[0.985]">Ask THRIVE Support</Link>
              </section>
            </>
          ) : null}
        </section>

        <ParticipantBottomNav />
      </main>
    </AuthGate>
  );
}
