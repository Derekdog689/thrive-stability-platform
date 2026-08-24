"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AuthGate from "../../AuthGate";
import ThriveSidebar from "../../ThriveSidebar";
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

  const orderedGuidance = useMemo(() => {
    if (!detail) return [];
    return [...detail.guidanceSections].sort((a, b) => {
      const aType = guidanceOrder.indexOf(a.section_type);
      const bType = guidanceOrder.indexOf(b.section_type);
      if (aType !== bType) return (aType === -1 ? 999 : aType) - (bType === -1 ? 999 : bType);
      return a.sort_order - b.sort_order;
    });
  }, [detail]);

  const primaryPath = useMemo(() => {
    if (!detail) return null;
    return detail.accessPaths.find((path) => path.is_primary) ?? detail.accessPaths[0] ?? null;
  }, [detail]);

  const otherPaths = useMemo(() => {
    if (!detail) return [];
    return detail.accessPaths.filter((path) => path.id !== primaryPath?.id);
  }, [detail, primaryPath]);

  const supportHref = useMemo(() => {
    if (!detail) return "/support";
    const params = new URLSearchParams({ resource: detail.resource.resource_slug });
    if (primaryPath?.id) params.set("path", primaryPath.id);
    return `/support?${params.toString()}`;
  }, [detail, primaryPath]);

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eef4ef] px-4 py-5 text-slate-950 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <ThriveSidebar />

          <section className="space-y-6">
            <Link href="/resources" className="inline-flex text-sm font-black text-emerald-800">
              Back to Resources
            </Link>

            {loading ? (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="font-black">Loading Resource.</p>
              </section>
            ) : null}

            {errorMessage ? (
              <section role="alert" className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
                <p className="font-black">This Resource could not be loaded.</p>
                <p className="mt-2 text-sm leading-6 text-rose-800">{errorMessage}</p>
              </section>
            ) : null}

            {!loading && !errorMessage && !detail ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">Resource unavailable</p>
                <h1 className="mt-2 text-3xl font-black">This starting point is not available right now.</h1>
                <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                  It may be paused, no longer visible to your program, or the link may be outdated.
                </p>
                <Link href="/resources" className="mt-5 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white">
                  Browse Resources
                </Link>
              </section>
            ) : null}

            {!loading && !errorMessage && detail ? (
              <>
                <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900">Official source</span>
                    {detail.resource.state_code ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{detail.resource.state_code}</span>
                    ) : null}
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      {categoryLabel(detail.resource.category)}
                    </span>
                  </div>

                  <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{detail.resource.resource_name}</h1>
                  {detail.resource.primaryOrganization ? (
                    <p className="mt-3 text-lg font-bold text-slate-600">{detail.resource.primaryOrganization.organization_name}</p>
                  ) : null}
                  <p className="mt-4 max-w-3xl leading-7 text-slate-700">{detail.resource.plain_language_purpose}</p>

                  {detail.resource.service_area_text ? (
                    <p className="mt-3 text-sm font-semibold text-slate-500">Service area: {detail.resource.service_area_text}</p>
                  ) : null}
                </header>

                {primaryPath ? (
                  <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm sm:p-8">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-800">Start here</p>
                    <h2 className="mt-2 text-2xl font-black">{primaryPath.label}</h2>
                    {primaryPath.plain_language_instruction ? (
                      <p className="mt-3 max-w-3xl leading-7 text-slate-700">{primaryPath.plain_language_instruction}</p>
                    ) : null}
                    {pathHref(primaryPath) ? (
                      <a
                        href={pathHref(primaryPath) ?? undefined}
                        target={primaryPath.url ? "_blank" : undefined}
                        rel={primaryPath.url ? "noreferrer" : undefined}
                        className="mt-5 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white"
                      >
                        {actionLabel(primaryPath)}
                      </a>
                    ) : null}
                  </section>
                ) : null}

                {orderedGuidance.length > 0 ? (
                  <section className="space-y-4">
                    {orderedGuidance.map((section) => (
                      <article key={section.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                        <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                          {section.section_type.replaceAll("_", " ")}
                        </p>
                        <h2 className="mt-2 text-2xl font-black">{section.heading}</h2>
                        <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">{section.content}</p>
                      </article>
                    ))}
                  </section>
                ) : null}

                {otherPaths.length > 0 ? (
                  <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Other official paths</p>
                    <h2 className="mt-2 text-2xl font-black">More ways to reach the official source</h2>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {otherPaths.map((path) => (
                        <article key={path.id} className="rounded-2xl border border-slate-200 p-5">
                          <p className="font-black">{path.label}</p>
                          {path.plain_language_instruction ? (
                            <p className="mt-2 text-sm leading-6 text-slate-600">{path.plain_language_instruction}</p>
                          ) : null}
                          {pathHref(path) ? (
                            <a
                              href={pathHref(path) ?? undefined}
                              target={path.url ? "_blank" : undefined}
                              rel={path.url ? "noreferrer" : undefined}
                              className="mt-4 inline-flex rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-900"
                            >
                              {actionLabel(path)}
                            </a>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  </section>
                ) : null}

                {detail.resource.participant_boundary_note ? (
                  <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">Important note</p>
                    <p className="mt-2 leading-7 text-slate-700">{detail.resource.participant_boundary_note}</p>
                  </section>
                ) : null}

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">Need help?</p>
                  <h2 className="mt-2 text-2xl font-black">Need help using this Resource?</h2>
                  <p className="mt-3 leading-7 text-slate-600">
                    You can ask THRIVE Support. The Resource can travel with your request as context, but you still choose what to ask and whether to send it.
                  </p>
                  <Link href={supportHref} className="mt-5 inline-flex rounded-2xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-800">
                    Ask THRIVE Support
                  </Link>
                </section>
              </>
            ) : null}
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
