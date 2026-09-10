"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

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
    refreshSessionStatus();

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
    router.push("/");
  }

  async function handleSignUp() {
    setLoading(true);
    setMessage("");
    setError("");

    const emailRedirectTo = window.location.origin;
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

    setMessage("Account request submitted. Check your email to confirm your account and return to THRIVE.");
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
    <main className="thrive-today-bg min-h-screen px-3 py-3 text-slate-950 sm:px-6 sm:py-6">
      <section className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-5xl gap-3 lg:min-h-[calc(100vh-3rem)] lg:grid-cols-[0.9fr_1.1fr] lg:gap-5">
        <section className="thrive-ambient relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/34 p-5 shadow-[0_22px_70px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-7 lg:p-9">
          <div className="thrive-orb thrive-orb-one" />
          <div className="thrive-orb thrive-orb-two" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/68 text-lg font-black text-emerald-950 shadow-sm">T</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-800">DSS Enterprises</p>
              <p className="text-sm font-black text-emerald-950">THRIVE</p>
            </div>
          </div>

          <div className="relative z-10 mt-10 max-w-xl sm:mt-14 lg:mt-24">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Welcome back</p>
            <h1 className="mt-3 font-serif text-5xl font-semibold leading-[0.98] tracking-tight text-emerald-950 sm:text-6xl">Your space is here.</h1>
            <p className="mt-4 max-w-md text-base font-semibold leading-6 text-slate-600">Pick up where you left off.</p>
          </div>
        </section>

        <section className="flex items-center rounded-[2rem] border border-white/75 bg-white/68 p-5 shadow-[0_22px_70px_rgba(15,23,42,0.09)] backdrop-blur-2xl sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-6">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Sign in to THRIVE</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Sign in to continue.</h2>
            </div>

            {currentUser ? (
              <div className="mb-4 rounded-[1.25rem] border border-emerald-100 bg-emerald-50/85 p-4 text-sm text-emerald-950">
                <p className="font-black">Already signed in</p>
                <p className="mt-1 break-words text-xs font-semibold text-emerald-800/80">{currentUser.email}</p>
              </div>
            ) : null}

            <form onSubmit={handleSignIn} className="space-y-4">
              <label className="block text-sm font-black text-slate-700">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-white/88 px-4 py-4 text-base outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
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
                  className="mt-2 w-full rounded-[1.25rem] border border-slate-200 bg-white/88 px-4 py-4 text-base outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-emerald-700 px-5 py-4 text-lg font-black text-white shadow-[0_12px_28px_rgba(4,120,87,0.22)] transition hover:bg-emerald-800 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Opening THRIVE..." : "Sign in"}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSignUp}
                disabled={loading || !email || !password}
                className="text-sm font-black text-emerald-700 transition hover:text-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create an account
              </button>

              {currentUser ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loading}
                  className="text-sm font-black text-slate-500 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sign out
                </button>
              ) : null}
            </div>

            {message ? <div className="mt-5 rounded-[1.25rem] border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">{message}</div> : null}
            {error ? <div className="mt-5 rounded-[1.25rem] border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-800">{error}</div> : null}

            <details className="mt-6 rounded-[1.25rem] border border-white/80 bg-white/45 px-4 py-3 text-sm text-slate-600">
              <summary className="cursor-pointer font-black text-slate-700">Privacy</summary>
              <p className="mt-2 text-xs leading-5">Sign-in is only for accessing your THRIVE account. Enter sensitive personal information only in the appropriate THRIVE areas after signing in.</p>
            </details>
          </div>
        </section>
      </section>
    </main>
  );
}
