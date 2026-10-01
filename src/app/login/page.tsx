"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

const THRIVE_ENTRY = "/living-signal/today";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refreshSessionStatus() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      setError(error.message);
      setCurrentUser(null);
      return;
    }

    setCurrentUser(session?.user ?? null);
  }

  useEffect(() => {
    void refreshSessionStatus();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await refreshSessionStatus();
    setMessage("Welcome back. Opening THRIVE...");
    setLoading(false);
    router.push(THRIVE_ENTRY);
  }

  async function handleSignUp() {
    setLoading(true);
    setMessage("");
    setError("");

    const emailRedirectTo = `${window.location.origin}${THRIVE_ENTRY}`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Account request submitted. Check your email to confirm your account and return to THRIVE.",
    );
    setLoading(false);
  }

  async function handleSignOut() {
    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setCurrentUser(null);
    setMessage("Signed out successfully.");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#edf3ef] text-[#0b2630]">
      <section
        className="relative min-h-[310px] overflow-hidden border-b border-white/40 bg-cover bg-center px-6 py-7 text-white shadow-[0_26px_80px_rgba(7,29,39,0.22)] sm:min-h-[360px] sm:px-10"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(6,31,45,.94) 0%, rgba(8,42,55,.78) 40%, rgba(8,37,50,.24) 72%, rgba(6,26,37,.12) 100%), url('https://images.unsplash.com/photo-1770341989953-f3efb336f7eb?auto=format&fit=crop&fm=jpg&q=88&w=2200')",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_18%,rgba(255,196,112,.28),transparent_25rem)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col justify-between gap-10">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[1.2rem] border border-white/25 bg-[#12485a] shadow-[0_12px_30px_rgba(0,0,0,.18)]">
              <span className="absolute inset-0 bg-[linear-gradient(145deg,#86dbc6_0_46%,transparent_47%),linear-gradient(35deg,transparent_0_49%,#f0d394_50%_100%)]" />
            </div>

            <div>
              <h1 className="text-[2.15rem] font-black leading-none tracking-[0.035em] sm:text-[2.8rem]">
                THRIVE
              </h1>
              <p className="mt-2 text-sm font-semibold leading-5 text-white/92 sm:text-base">
                A Brighter Tomorrow
                <br />
                Built on Today
              </p>
            </div>
          </div>

          <div className="max-w-xl pb-3 sm:pb-6">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#a8e1d7]">
              Same THRIVE
            </p>
            <p className="mt-3 max-w-lg font-serif text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-5xl">
              A more human experience.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-7 w-full max-w-2xl px-4 pb-12 sm:-mt-10 sm:px-6">
        <div className="relative rounded-[2rem] border border-white/85 bg-white/88 p-5 shadow-[0_24px_70px_rgba(15,36,44,0.14)] backdrop-blur-2xl sm:p-8">
          {currentUser ? (
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#167b73]">
                Welcome back
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0b2630] sm:text-4xl">
                Your THRIVE is ready.
              </h2>

              <div className="mt-5 rounded-[1.35rem] border border-emerald-100 bg-emerald-50/82 p-4">
                <p className="text-sm font-black text-emerald-950">
                  Signed in
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-emerald-800/80">
                  {currentUser.email}
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push(THRIVE_ENTRY)}
                className="mt-5 w-full rounded-[1.35rem] bg-[#0d7f6f] px-5 py-4 text-lg font-black text-white shadow-[0_14px_30px_rgba(13,127,111,.25)] transition active:scale-[0.985]"
              >
                Open THRIVE
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="mt-3 w-full rounded-[1.35rem] border border-slate-200 bg-white/85 px-5 py-3 text-sm font-black text-slate-600 transition active:scale-[0.985] disabled:opacity-50"
              >
                {loading ? "Signing out..." : "Sign out"}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#167b73]">
                Sign in to THRIVE
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0b2630] sm:text-4xl">
                Pick up where you left off.
              </h2>

              <form onSubmit={handleSignIn} className="mt-6 space-y-4">
                <label className="block text-sm font-black text-slate-700">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-white/92 px-4 py-4 text-base outline-none transition focus:border-[#0d7f6f] focus:ring-4 focus:ring-emerald-100"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="block text-sm font-black text-slate-700">
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-white/92 px-4 py-4 text-base outline-none transition focus:border-[#0d7f6f] focus:ring-4 focus:ring-emerald-100"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-[1.35rem] bg-[#0d7f6f] px-5 py-4 text-lg font-black text-white shadow-[0_14px_30px_rgba(13,127,111,.25)] transition active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Opening THRIVE..." : "Open THRIVE"}
                </button>
              </form>

              <button
                type="button"
                onClick={handleSignUp}
                disabled={loading || !email || !password}
                className="mt-5 text-sm font-black text-[#167b73] transition hover:text-[#0b4f49] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create an account
              </button>
            </div>
          )}

          {message ? (
            <div className="mt-5 rounded-[1.25rem] border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-[1.25rem] border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-800">
              {error}
            </div>
          ) : null}

          <details className="mt-6 rounded-[1.25rem] border border-slate-100 bg-slate-50/85 px-4 py-3 text-sm text-slate-600">
            <summary className="cursor-pointer font-black text-slate-700">
              Privacy
            </summary>
            <p className="mt-2 text-xs leading-5">
              Sign-in is only for accessing your THRIVE account. Enter sensitive
              personal information only in the appropriate THRIVE areas after
              signing in.
            </p>
          </details>
        </div>
      </section>
    </main>
  );
}
