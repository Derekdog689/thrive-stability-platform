"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const WORKSPACE_ID = "71000000-0000-4000-8000-000000000001";
const RESOURCE_ID = "834492d1-1a8b-45b3-a260-280e680e110f";
const RESOURCE_SLUG = "synthetic-resources-rls-test-only";

type State = "loading" | "signed-out" | "admin" | "denied" | "error";

type Result = {
  passed: boolean;
  observed: string;
} | null;

export default function ResourcesVisibilityTestPage() {
  const [state, setState] = useState<State>("loading");
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [message, setMessage] = useState("Checking authenticated admin context...");

  useEffect(() => {
    let mounted = true;

    async function load() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (userError) {
        setState("error");
        setMessage(userError.message);
        return;
      }

      if (!user) {
        setState("signed-out");
        setMessage("Sign in with the controlled workspace admin account.");
        return;
      }

      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("workspace_members")
        .select("member_role, status")
        .eq("workspace_id", WORKSPACE_ID)
        .eq("user_id", user.id)
        .eq("status", "active")
        .eq("member_role", "admin")
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        setState("error");
        setMessage(error.message);
        return;
      }

      if (!data) {
        setState("denied");
        setMessage("Workspace admin authority is not available for this actor.");
        return;
      }

      setState("admin");
      setMessage("Authenticated workspace admin context loaded.");
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  async function runResume() {
    if (state !== "admin" || !confirmed || busy) return;

    setBusy(true);
    setResult(null);
    setMessage("Running fixed resume-visibility RPC through this authenticated admin session...");

    try {
      const { error } = await supabase.rpc("admin_resume_resource_visibility", {
        p_resource_id: RESOURCE_ID,
        p_workspace_id: WORKSPACE_ID,
        p_program_id: null,
      });

      if (error) {
        setResult({ passed: false, observed: error.message });
        setMessage("R15 stopped for review.");
        return;
      }

      const { data: resource, error: resourceError } = await supabase
        .from("resources")
        .select("id, resource_slug, status")
        .eq("id", RESOURCE_ID)
        .eq("resource_slug", RESOURCE_SLUG)
        .maybeSingle();

      if (resourceError) {
        setResult({
          passed: false,
          observed: `Resume RPC returned success, but canonical Resource verification failed: ${resourceError.message}`,
        });
        setMessage("R15 stopped for review.");
        return;
      }

      const passed = resource?.status === "active";
      setResult({
        passed,
        observed: passed
          ? "Resume RPC succeeded. Canonical Resource remains active. Visibility is intentionally verified by participant read and external read-only closeout."
          : `Unexpected canonical Resource state: ${resource?.status ?? "missing"}`,
      });
      setMessage(passed ? "R15 finished. Stop and verify participant visibility before any other action." : "R15 stopped for review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6">
      <section className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-3xl border border-amber-700/50 bg-amber-950/30 p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
            Hidden test route · fixed synthetic lifecycle only
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            THRIVE Resources Visibility Resume Test
          </h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            This route exists only to prove the narrow paused-to-active visibility lifecycle for the existing synthetic Resource. It does not create or edit Resource content.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-xs font-black uppercase tracking-wide text-cyan-300">Authenticated actor</p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-bold text-slate-400">Status</dt>
              <dd className="mt-1 font-semibold">{state}</dd>
            </div>
            <div>
              <dt className="text-sm font-bold text-slate-400">Email</dt>
              <dd className="mt-1 break-all font-semibold">{email || "Not signed in"}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-slate-300">{message}</p>
        </section>

        <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-xs font-black uppercase tracking-wide text-cyan-300">Fixed scope</p>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <p><span className="font-black text-white">Workspace:</span> {WORKSPACE_ID}</p>
            <p><span className="font-black text-white">Resource:</span> {RESOURCE_ID}</p>
            <p><span className="font-black text-white">Slug:</span> {RESOURCE_SLUG}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="text-xl font-black">Execution guard</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Nothing runs automatically. This action uses the current authenticated browser session and only the fixed synthetic identifiers shown above.
          </p>

          <label className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm font-semibold">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-1"
            />
            <span>I understand this is the controlled synthetic visibility-resume test and I will run only R15 for the currently signed-in workspace admin.</span>
          </label>
        </section>

        <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-cyan-300">R15</p>
              <h2 className="mt-1 text-xl font-black">Admin resumes existing paused visibility</h2>
              <p className="mt-2 text-sm text-slate-300">
                Expected: existing active canonical Resource remains active while its matching paused workspace visibility is resumed.
              </p>
            </div>

            <button
              type="button"
              disabled={state !== "admin" || !confirmed || busy}
              onClick={() => void runResume()}
              className="rounded-2xl bg-cyan-600 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "Running R15..." : "Run R15"}
            </button>
          </div>

          {result ? (
            <div className={`mt-5 rounded-2xl border p-5 ${result.passed ? "border-emerald-700 bg-emerald-950/30" : "border-rose-700 bg-rose-950/30"}`}>
              <p className="font-black">{result.passed ? "PASS / expected behavior" : "STOP / review required"}</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{result.observed}</p>
            </div>
          ) : null}
        </section>

        <section className="rounded-3xl border border-rose-700/60 bg-rose-950/30 p-6">
          <p className="font-black">Stop rule</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            After R15, stop. Verify the participant Resources list/detail surface. Use the already-installed pause lifecycle separately for closeout. Do not run unrelated test actions.
          </p>
        </section>
      </section>
    </main>
  );
}
