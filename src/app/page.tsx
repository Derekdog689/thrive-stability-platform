import AuthStatusPanel from "./AuthStatusPanel";

const checkInMetrics = [
  { label: "Stress", value: 6, note: "Moderate pressure" },
  { label: "Spending urge", value: 5, note: "Watch cash access" },
  { label: "Sleep quality", value: 7, note: "Protect routine" },
  { label: "Recovery support", value: 8, note: "Connected today" },
];

const protectedCategories = [
  { name: "Rent reserve", amount: "$425.00", status: "Protected" },
  { name: "Phone", amount: "$95.00", status: "Upcoming" },
  { name: "Food and groceries", amount: "$146.00", status: "Available" },
  { name: "Transportation", amount: "$58.00", status: "Available" },
];

const recentActivity = [
  { merchant: "Grocery market", category: "Food", amount: "$43.18", flag: "Within plan" },
  { merchant: "ATM withdrawal", category: "Cash", amount: "$60.00", flag: "Cash access flag" },
  { merchant: "Transit pass", category: "Transportation", amount: "$22.50", flag: "Essential" },
  { merchant: "Late-night convenience store", category: "Flexible", amount: "$18.94", flag: "High-risk time" },
];

const supabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Home() {
  return (
    <main className="min-h-screen bg-[#eef4ef] px-6 py-6 text-slate-950">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-emerald-100 bg-white/85 p-5 shadow-sm">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-lg font-black text-white">
              T
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                DSS Enterprises
              </p>
              <h1 className="text-xl font-black">THRIVE</h1>
            </div>
          </div>

          <nav className="space-y-2 text-sm font-semibold">
            {["Dashboard", "Budget", "Check-in", "Patterns", "Trust Mode", "Reports"].map(
              (item, index) => (
                <div
                  key={item}
                  className={`rounded-2xl px-4 py-3 ${
                    index === 0
                      ? "bg-emerald-100 text-emerald-900"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item}
                </div>
              ),
            )}
          </nav>

          <div className="mt-8 rounded-2xl bg-slate-950 p-4 text-white">
            <p className="text-xs font-bold uppercase text-emerald-300">Guardrail</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Support tool only. Not legal, clinical, fiduciary, credit repair, bankruptcy,
              or investment advice.
            </p>
          </div>
        </aside>

        <section className="space-y-6">
          <header className="rounded-3xl bg-gradient-to-br from-white to-emerald-50 p-7 shadow-sm">
  <p className="text-sm font-bold uppercase text-emerald-700">
    Wednesday, June 10
  </p>

  <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
    <div>
      <h2 className="max-w-3xl text-4xl font-black tracking-tight">
        Protect essentials first. Keep support visible. Move with clarity.
      </h2>

      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
        THRIVE combines safe-to-spend budgeting, daily check-ins, spending pattern
        review, and consent-based support summaries for individuals and approved
        support teams.
      </p>
    </div>

    <div className="space-y-2">
      <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-emerald-800">
        Mock bank feed synced 18 min ago
      </div>

      <div
        className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
          supabaseConfigured
            ? "border-emerald-100 bg-emerald-50 text-emerald-800"
            : "border-amber-100 bg-amber-50 text-amber-800"
        }`}
      >
        Supabase environment: {supabaseConfigured ? "Configured" : "Not configured"}
      </div>

      <AuthStatusPanel />
    </div>
  </div>
</header>

          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl bg-emerald-700 p-5 text-white shadow-sm">
              <p className="text-sm font-bold text-emerald-100">Available balance</p>
              <p className="mt-3 text-4xl font-black">$1,284.60</p>
              <p className="mt-2 text-sm text-emerald-100">Checking plus protected savings</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Safe to spend today</p>
              <p className="mt-3 text-4xl font-black">$16.67</p>
              <p className="mt-2 text-sm text-slate-500">Reduced due to elevated pressure</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">Stability score</p>
              <p className="mt-3 text-4xl font-black">39</p>
              <p className="mt-2 text-sm text-slate-500">Add one support touchpoint today</p>
            </div>
            <div className="rounded-3xl bg-amber-50 p-5 shadow-sm">
              <p className="text-sm font-bold text-amber-700">Best next action</p>
              <p className="mt-3 text-2xl font-black">Pause cash access</p>
              <p className="mt-2 text-sm text-amber-800">
                Name amount, purpose, and support contact first.
              </p>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-emerald-700">Daily check-in</p>
                  <h3 className="text-2xl font-black">What should the app know today?</h3>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Payday week
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {checkInMetrics.map((metric) => (
                  <div key={metric.label}>
                    <div className="mb-1 flex justify-between text-sm font-semibold">
                      <span>{metric.label}</span>
                      <span>{metric.value}/10</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full bg-emerald-600"
                        style={{ width: `${metric.value * 10}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{metric.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase text-emerald-700">Aware support</p>
              <h3 className="text-2xl font-black">Money + wellness guidance</h3>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border-l-4 border-rose-500 bg-rose-50 p-4">
                  <p className="font-bold">Make essentials harder to spend</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Move rent, phone, and groceries out of everyday checking before evening.
                    This is protection, not punishment.
                  </p>
                </div>
                <div className="rounded-2xl border-l-4 border-emerald-600 bg-emerald-50 p-4">
                  <p className="font-bold">Add one support touchpoint</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    A short text, peer check-in, or meeting reminder can lower pressure before
                    the highest-spending part of the day.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase text-emerald-700">Guardrails</p>
              <h3 className="text-2xl font-black">Protected categories</h3>
              <div className="mt-5 space-y-3">
                {protectedCategories.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex justify-between font-bold">
                      <span>{item.name}</span>
                      <span>{item.amount}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{item.status}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase text-emerald-700">Recent activity</p>
              <h3 className="text-2xl font-black">Spending with context</h3>
              <div className="mt-5 space-y-3">
                {recentActivity.map((item) => (
                  <div key={item.merchant} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex justify-between font-bold">
                      <span>{item.merchant}</span>
                      <span>{item.amount}</span>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-slate-500">{item.category}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                        {item.flag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase text-emerald-700">Trust mode</p>
              <h3 className="text-2xl font-black">Johnny model case</h3>
              <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                <p>
                  Essentials can be marked for direct trust payment before weekly flexible
                  disbursements are released.
                </p>
                <p>
                  Trustee-facing reports, beneficiary summaries, receipt logs, and DSS support
                  notes will remain separate.
                </p>
                <p className="rounded-2xl bg-slate-100 p-4 font-semibold text-slate-800">
                  DSS supports organization and reporting. The trustee remains the fiduciary
                  decision-maker.
                </p>
              </div>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}