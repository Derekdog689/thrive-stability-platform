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
    <main className="relative min-h-screen overflow-hidden bg-[#071b22] text-white">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1766221072212-cf2f9383221c?auto=format&fit=crop&fm=jpg&q=90&w=2200')",
        }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 bg-[linear-gradient(180deg,rgba(5,20,28,.14)_0%,rgba(5,20,28,.22)_28%,rgba(5,20,28,.52)_62%,rgba(5,20,28,.88)_100%)]"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 bg-[radial-gradient(circle_at_76%_14%,rgba(255,197,110,.24),transparent_25rem),radial-gradient(circle_at_18%_28%,rgba(115,205,193,.13),transparent_26rem)]"
        aria-hidden="true"
      />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-6 pt-4 sm:px-6 sm:pb-10 sm:pt-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-[1rem] border border-white/25 bg-[#12485a]/85 shadow-[0_10px_30px_rgba(0,0,0,.22)] backdrop-blur-md">
              <span className="absolute inset-0 bg-[linear-gradient(145deg,#86dbc6_0_46%,transparent_47%),linear-gradient(35deg,transparent_0_49%,#f0d394_50%_100%)]" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/66">
                DSS Enterprises
              </p>
              <p className="text-sm font-black tracking-[0.08em] text-white">THRIVE</p>
            </div>
          </div>
          <span className="rounded-full border border-white/15 bg-black/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/76 backdrop-blur-md">
            Your space
          </span>
        </header>

        <div className="flex flex-1 flex-col justify-end pb-4 pt-20 sm:pb-8 sm:pt-28">
          <section className="max-w-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#b8e3d7]">
              Welcome to THRIVE
            </p>
            <h1 className="mt-3 max-w-2xl font-serif text-[3.4rem] font-semibold leading-[.92] tracking-[-.05em] text-white sm:text-[5.4rem]">
              Come back to what matters.
            </h1>
            <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-white/78 sm:text-lg">
              Pick up the parts of your life you have already been working on. Nothing here asks you to start over.
            </p>
          </section>

          <section className="mt-8 border-t border-white/20 pt-5 sm:mt-10 sm:pt-6">
            {currentUser ? (
              <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b8e3d7]">
                    Welcome back
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold tracking-[-.03em] text-white sm:text-4xl">
                    Your THRIVE is ready.
                  </h2>
                  <p className="mt-2 break-words text-sm font-semibold text-white/62">
                    {currentUser.email}
                  </p>
                </div>
                <div className="flex gap-3 md:min-w-[280px]">
                  <button
                    type="button"
                    onClick={() => router.push(THRIVE_ENTRY)}
                    className="min-h-12 flex-1 rounded-[1.1rem] bg-[#0d7f6f] px-5 py-3 text-base font-black text-white shadow-[0_14px_32px_rgba(13,127,111,.28)] transition active:scale-[0.985]"
                  >
                    Enter THRIVE
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={loading}
                    className="min-h-12 rounded-[1.1rem] border border-white/20 bg-black/10 px-4 py-3 text-sm font-black text-white/78 backdrop-blur-md transition active:scale-[0.985] disabled:opacity-50"
                  >
                    {loading ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b8e3d7]">
                    Return to your THRIVE
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold tracking-[-.03em] text-white sm:text-4xl">
                    Pick up where you left off.
                  </h2>
                </div>

                <form onSubmit={handleSignIn} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                  <label className="block text-xs font-black uppercase tracking-[0.13em] text-white/72">
                    Email
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="mt-2 min-h-12 w-full rounded-[1rem] border border-white/18 bg-black/20 px-4 py-3 text-base font-semibold text-white outline-none backdrop-blur-md placeholder:text-white/36 focus:border-[#8bd5c5] focus:ring-4 focus:ring-[#72c6b5]/15"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </label>

                  <label className="block text-xs font-black uppercase tracking-[0.13em] text-white/72">
                    Password
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="mt-2 min-h-12 w-full rounded-[1rem] border border-white/18 bg-black/20 px-4 py-3 text-base font-semibold text-white outline-none backdrop-blur-md placeholder:text-white/36 focus:border-[#8bd5c5] focus:ring-4 focus:ring-[#72c6b5]/15"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="min-h-12 rounded-[1rem] bg-[#0d7f6f] px-5 py-3 text-base font-black text-white shadow-[0_14px_32px_rgba(13,127,111,.28)] transition active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Opening..." : "Enter THRIVE"}
                  </button>
                </form>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSignUp}
                    disabled={loading || !email || !password}
                    className="text-sm font-black text-[#b8e3d7] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Create an account
                  </button>

                  <details className="text-right text-xs text-white/54">
                    <summary className="cursor-pointer list-none font-black text-white/68">
                      Privacy
                    </summary>
                    <p className="mt-2 max-w-md text-left leading-5 text-white/58">
                      Sign-in is only for accessing your THRIVE account. Enter sensitive personal information only in the appropriate THRIVE areas after signing in.
                    </p>
                  </details>
                </div>
              </div>
            )}

            {message ? (
              <div className="mt-5 rounded-[1rem] border border-emerald-200/20 bg-emerald-950/30 p-4 text-sm font-bold text-emerald-50 backdrop-blur-md">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 rounded-[1rem] border border-rose-200/20 bg-rose-950/30 p-4 text-sm font-bold text-rose-50 backdrop-blur-md">
                {error}
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
