"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AuthGate from "../AuthGate";
import ThriveSidebar from "../ThriveSidebar";
import {
  categoryLabel,
  loadParticipantResources,
  ParticipantResource,
  resourceCategories,
} from "./resourceData";

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

  const visibleResources = useMemo(
    () =>
      selectedCategory
        ? resources.filter((resource) => resource.category === selectedCategory)
        : resources,
    [resources, selectedCategory],
  );

  return (
    <AuthGate>
      <main className="min-h-screen bg-[#eef4ef] px-4 py-5 text-slate-950 sm:px-6">
        <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <ThriveSidebar />

          <section className="space-y-6">
            <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Resources</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                Find a trusted starting point
              </h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                Choose a topic and THRIVE will show verified places to start, what they do, and how to get there.
              </p>
              <p className="mt-3 text-sm font-semibold text-slate-500">
                THRIVE helps you navigate. The outside organization makes its own decisions.
              </p>
            </header>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Browse by topic</p>
                <h2 className="mt-2 text-2xl font-black">What are you looking for?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Pick the closest topic. This only narrows the list and does not decide what you need.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("")}
                  className={`rounded-2xl border p-4 text-left font-black transition ${
                    selectedCategory === ""
                      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                      : "border-slate-200 bg-white hover:border-emerald-200"
                  }`}
                >
                  All Resources
                </button>
                {resourceCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`rounded-2xl border p-4 text-left font-black transition ${
                      selectedCategory === category.id
                        ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                        : "border-slate-200 bg-white hover:border-emerald-200"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </section>

            {loading ? (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="font-black">Loading Resources.</p>
              </section>
            ) : null}

            {errorMessage ? (
              <section role="alert" className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
                <p className="font-black">Resources could not be loaded.</p>
                <p className="mt-2 text-sm leading-6 text-rose-800">{errorMessage}</p>
              </section>
            ) : null}

            {!loading && !errorMessage && visibleResources.length === 0 ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="font-black">
                  {selectedCategory ? "No verified starting points are available here right now." : "Resources are being prepared for your program."}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedCategory
                    ? "Choose another topic to see other available Resources."
                    : "Only active, verified Resources made visible to your program will appear here."}
                </p>
              </section>
            ) : null}

            {!loading && !errorMessage && visibleResources.length > 0 ? (
              <section className="space-y-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Starting points</p>
                  <h2 className="mt-2 text-2xl font-black">
                    {selectedCategory ? categoryLabel(selectedCategory) : "Available Resources"}
                  </h2>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {visibleResources.map((resource) => (
                    <article key={resource.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                      <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900">Official source</span>
                        {resource.state_code ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{resource.state_code}</span>
                        ) : null}
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                          {categoryLabel(resource.category)}
                        </span>
                      </div>

                      <h3 className="mt-4 text-2xl font-black">{resource.resource_name}</h3>
                      {resource.primaryOrganization ? (
                        <p className="mt-2 font-semibold text-slate-600">{resource.primaryOrganization.organization_name}</p>
                      ) : null}
                      <p className="mt-4 leading-7 text-slate-700">{resource.plain_language_purpose}</p>

                      <Link
                        href={`/resources/${resource.resource_slug}`}
                        className="mt-5 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white"
                      >
                        View details
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </section>
        </section>
      </main>
    </AuthGate>
  );
}
