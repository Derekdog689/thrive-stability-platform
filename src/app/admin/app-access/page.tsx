"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAdminAccess } from "../useAdminAccess";

type AuthAccountRow = {
  auth_user_id: string;
  email: string | null;
  created_at: string;
  email_confirmed_at: string;
};

type SupportedPersonRow = {
  id: string;
  workspace_id: string;
  auth_user_id: string | null;
  display_name: string;
  preferred_name: string | null;
  status: "active" | "paused" | "archived";
};

function displayPersonName(person: SupportedPersonRow) {
  return person.preferred_name?.trim() || person.display_name;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminAppAccessPage() {
  const {
    state,
    membership,
    errorMessage: accessError,
    canAccessSystemAdmin,
  } = useAdminAccess();

  const [accounts, setAccounts] = useState<AuthAccountRow[]>([]);
  const [people, setPeople] = useState<SupportedPersonRow[]>([]);
  const [selectedPersonByAccount, setSelectedPersonByAccount] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [workingAccountId, setWorkingAccountId] = useState<string | null>(null);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    if (!canAccessSystemAdmin || !membership) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError("");

    const [accountResult, peopleResult] = await Promise.all([
      supabase.rpc("admin_list_unlinked_auth_accounts", {
        p_workspace_id: membership.workspace_id,
      }),
      supabase
        .from("supported_people")
        .select("id, workspace_id, auth_user_id, display_name, preferred_name, status")
        .eq("workspace_id", membership.workspace_id)
        .is("auth_user_id", null)
        .order("created_at", { ascending: false }),
    ]);

    if (accountResult.error || peopleResult.error) {
      setPageError(
        accountResult.error?.message ??
          peopleResult.error?.message ??
          "App access information could not be loaded.",
      );
      setLoading(false);
      return;
    }

    setAccounts((accountResult.data as AuthAccountRow[] | null) ?? []);
    setPeople((peopleResult.data as SupportedPersonRow[] | null) ?? []);
    setLoading(false);
  }, [canAccessSystemAdmin, membership]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const availablePeople = useMemo(
    () => people.filter((person) => !person.auth_user_id),
    [people],
  );

  async function linkAccount(account: AuthAccountRow) {
    if (!canAccessSystemAdmin || !membership) return;

    const supportedPersonId = selectedPersonByAccount[account.auth_user_id];
    const person = availablePeople.find((row) => row.id === supportedPersonId);

    if (!person) {
      setPageError("Choose a supported person before linking app access.");
      return;
    }

    const email = account.email || "this confirmed account";
    const personName = displayPersonName(person);

    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Link ${email} to ${personName}? This gives this login access to this THRIVE participant record. Supported-person status and program participation will not change.`,
      )
    ) {
      return;
    }

    setWorkingAccountId(account.auth_user_id);
    setPageError("");
    setNotice("");

    const result = await supabase.rpc("admin_link_auth_account_to_supported_person", {
      p_workspace_id: membership.workspace_id,
      p_supported_person_id: person.id,
      p_auth_user_id: account.auth_user_id,
    });

    setWorkingAccountId(null);

    if (result.error) {
      setPageError(result.error.message);
      await loadData();
      return;
    }

    setNotice(`${email} is now linked to ${personName}. App access changed only; lifecycle status and program participation were not changed.`);
    setSelectedPersonByAccount((current) => {
      const next = { ...current };
      delete next[account.auth_user_id];
      return next;
    });
    await loadData();
  }

  if (state === "checking" || loading) {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase text-emerald-700">THRIVE Admin</p>
          <h1 className="mt-2 text-3xl font-black">Loading App Access</h1>
        </section>
      </main>
    );
  }

  if (state === "signed-out") {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl rounded-3xl border border-amber-100 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black">THRIVE Admin access required</h1>
          <Link href="/login" className="mt-6 inline-flex rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white">
            Go to login
          </Link>
        </section>
      </main>
    );
  }

  if (!canAccessSystemAdmin) {
    return (
      <main className="min-h-screen bg-[#eef4ef] px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase text-slate-500">THRIVE Admin</p>
          <h1 className="mt-2 text-3xl font-black">Admin access not available</h1>
          <p className="mt-3 text-slate-600">{accessError || "This workflow requires an active THRIVE admin membership."}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef4ef] px-4 py-6 text-slate-950 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-bold uppercase text-emerald-700">THRIVE Admin · App Access</p>
          <h1 className="mt-2 text-4xl font-black">Connect login to person</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Confirmed login accounts appear here until Admin links them to an existing supported-person record. Linking app access does not change supported-person status or program participation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin" className="inline-flex rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700">
              Back to THRIVE Admin
            </Link>
            <Link href="/admin/supported-people" className="inline-flex rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">
              Open Supported People
            </Link>
          </div>
        </header>

        {pageError ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-950">
            <p className="font-black">This action could not be completed</p>
            <p className="mt-2 break-words text-sm">{pageError}</p>
          </section>
        ) : null}

        {notice ? (
          <section role="status" aria-live="polite" className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
            {notice}
          </section>
        ) : null}

        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <p className="text-sm font-black uppercase tracking-wide">Access boundary</p>
          <p className="mt-2 max-w-3xl text-sm leading-6">
            A login account and a supported-person record remain separate until Admin explicitly links them. THRIVE does not match people automatically by email or name.
          </p>
        </section>

        <section>
          <div className="mb-4">
            <p className="text-sm font-bold uppercase text-emerald-700">App access</p>
            <h2 className="mt-1 text-3xl font-black">Accounts waiting for THRIVE access</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {accounts.length} confirmed account{accounts.length === 1 ? "" : "s"} currently waiting for a supported-person link.
            </p>
          </div>

          {accounts.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="font-black text-slate-900">No accounts are waiting.</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">New confirmed signups will appear here automatically until they are linked.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {accounts.map((account) => {
                const selectedPersonId = selectedPersonByAccount[account.auth_user_id] ?? "";
                const working = workingAccountId === account.auth_user_id;

                return (
                  <article key={account.auth_user_id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Confirmed login</p>
                        <h3 className="mt-2 break-words text-xl font-black text-slate-950">{account.email || "Email unavailable"}</h3>
                        <p className="mt-2 break-all text-xs font-semibold text-slate-400">{account.auth_user_id}</p>
                      </div>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">Not linked</span>
                    </div>

                    <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="font-bold text-slate-500">Confirmed</dt>
                        <dd className="mt-1 font-semibold text-slate-900">{formatDate(account.email_confirmed_at)}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-500">Account created</dt>
                        <dd className="mt-1 font-semibold text-slate-900">{formatDate(account.created_at)}</dd>
                      </div>
                    </dl>

                    <div className="mt-6 border-t border-slate-200 pt-5">
                      <label className="grid gap-2 text-sm font-black text-slate-800">
                        Link to supported person
                        <select
                          value={selectedPersonId}
                          onChange={(event) => setSelectedPersonByAccount((current) => ({ ...current, [account.auth_user_id]: event.target.value }))}
                          disabled={working || availablePeople.length === 0}
                          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-950 outline-none focus:border-emerald-600 disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          <option value="">Choose supported person</option>
                          {availablePeople.map((person) => (
                            <option key={person.id} value={person.id}>
                              {displayPersonName(person)} · {person.status}
                            </option>
                          ))}
                        </select>
                      </label>

                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        Only supported people with no login already linked are shown. Program participation is not changed by this action.
                      </p>

                      <button
                        type="button"
                        disabled={working || !selectedPersonId}
                        onClick={() => void linkAccount(account)}
                        className="mt-4 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {working ? "Linking app access..." : "Link app access"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
