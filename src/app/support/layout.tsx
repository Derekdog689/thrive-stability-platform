"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  SupportResourceContext,
  validateSupportResourceContext,
} from "./resourceContext";

type ResourceResultEvent = CustomEvent<{
  ok: boolean;
  message: string;
}>;

function clearResourceQuery() {
  if (typeof window === "undefined") return;
  window.history.replaceState({}, "", "/support");
}

export default function SupportLayout({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<SupportResourceContext | null>(null);
  const [contextNotice, setContextNotice] = useState("");
  const [resultNotice, setResultNotice] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const openerClicked = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const resourceSlug = params.get("resource")?.trim() ?? "";
    const accessPathId = params.get("path")?.trim() || null;

    if (!resourceSlug) return;

    async function validate() {
      try {
        const result = await validateSupportResourceContext(
          resourceSlug,
          accessPathId,
        );
        if (cancelled) return;

        if (!result.ok) {
          setContextNotice(result.message);
          return;
        }

        setContext(result.context);
      } catch {
        if (cancelled) return;
        setContextNotice(
          "That Resource is not available to attach right now. You can still ask Support in your own words.",
        );
      }
    }

    void validate();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!context) return;

    function placeContextBanner() {
      const form = document.getElementById("support-request-create");

      if (form) {
        let host = document.getElementById(
          "support-resource-context-banner-host",
        );

        if (!host) {
          host = document.createElement("div");
          host.id = "support-resource-context-banner-host";
          form.parentElement?.insertBefore(host, form);
        }

        setPortalTarget(host);
        return true;
      }

      const opener = document.querySelector<HTMLButtonElement>(
        'button[aria-controls="support-request-create"]',
      );

      if (opener && !openerClicked.current) {
        openerClicked.current = true;
        opener.click();
      }

      return false;
    }

    if (placeContextBanner()) return;

    const observer = new MutationObserver(() => {
      if (placeContextBanner()) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [context]);

  useEffect(() => {
    function handleResult(event: Event) {
      const resultEvent = event as ResourceResultEvent;
      setResultNotice(resultEvent.detail);
      setContext(null);
      setPortalTarget(null);
      clearResourceQuery();
    }

    window.addEventListener("thrive:support-resource-result", handleResult);
    return () =>
      window.removeEventListener(
        "thrive:support-resource-result",
        handleResult,
      );
  }, []);

  function removeContext() {
    setContext(null);
    setPortalTarget(null);
    setContextNotice("");
    clearResourceQuery();
  }

  const contextBanner = context ? (
    <section className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-800">
            You came here from Resources
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            {context.resourceName}
          </h2>
          {context.organizationName ? (
            <p className="mt-1 text-sm font-bold text-slate-600">
              {context.organizationName}
            </p>
          ) : null}
          {context.accessPathLabel ? (
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Starting point: {context.accessPathLabel}
            </p>
          ) : null}
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
            Support can see which Resource you were looking at if you choose to
            send this request. You still choose the Support area and write your
            own message.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-emerald-900">
            Included with request
          </span>
          <button
            type="button"
            onClick={removeContext}
            className="rounded-2xl border border-emerald-300 bg-white px-4 py-2 text-sm font-black text-emerald-900"
          >
            Remove Resource context
          </button>
        </div>
      </div>
    </section>
  ) : null;

  return (
    <>
      {children}

      {portalTarget && contextBanner
        ? createPortal(contextBanner, portalTarget)
        : null}

      {contextNotice ? (
        <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-lg">
          <p className="text-sm font-bold leading-6 text-amber-950">
            {contextNotice}
          </p>
          <button
            type="button"
            onClick={() => {
              setContextNotice("");
              clearResourceQuery();
            }}
            className="mt-3 text-sm font-black text-amber-900 underline"
          >
            Continue without Resource context
          </button>
        </div>
      ) : null}

      {resultNotice ? (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 right-4 z-50 max-w-md rounded-2xl border p-4 shadow-lg ${
            resultNotice.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
              : "border-amber-200 bg-amber-50 text-amber-950"
          }`}
        >
          <p className="text-sm font-bold leading-6">{resultNotice.message}</p>
          <button
            type="button"
            onClick={() => setResultNotice(null)}
            className="mt-3 text-sm font-black underline"
          >
            Close
          </button>
        </div>
      ) : null}
    </>
  );
}
