export default function TransactionExplanationTestPage() {
  const verifiedPreconditions = [
    "Review-only candidate only.",
    "No execution is authorized from this first pass.",
    "No service-role client.",
    "No Johnny activation.",
    "No Trust Engine synchronization.",
    "No hard delete behavior.",
    "No automatic insert, update, or archive behavior.",
    "This page is a visual control shell only.",
  ];

  const participantFacts = [
    {
      label: "Participant",
      value: "Participant D",
    },
    {
      label: "Email",
      value: "dstein561+thrive-onboarding-person-d@gmail.com",
    },
    {
      label: "Auth user ID",
      value: "d48b7268-9aa6-4498-a923-2851fd5232c9",
    },
    {
      label: "Supported-person ID",
      value: "71000000-0000-4000-8000-000000000009",
    },
    {
      label: "Workspace ID",
      value: "71000000-0000-4000-8000-000000000001",
    },
    {
      label: "Program ID",
      value: "71000000-0000-4000-8000-000000000002",
    },
    {
      label: "Owned staged transaction ID",
      value: "72000000-0000-4000-8000-000000000003",
    },
  ];

  const ownedTransactionFacts = [
    {
      label: "Posted date",
      value: "2099-02-05",
    },
    {
      label: "Merchant",
      value: "TEST GROCER",
    },
    {
      label: "Category",
      value: "Food",
    },
    {
      label: "Subcategory",
      value: "Groceries",
    },
    {
      label: "Amount",
      value: "-$25.00",
    },
    {
      label: "Lifecycle",
      value: "posted",
    },
    {
      label: "Parse status",
      value: "parsed",
    },
    {
      label: "Ownership",
      value: "primary / active",
    },
  ];

  const approvedDraftValues = [
    {
      label: "Explanation category",
      value: "recognized_purchase",
    },
    {
      label: "Explanation text",
      value:
        "Synthetic test only. I recognize this grocery purchase.",
    },
    {
      label: "Initial status",
      value: "draft",
    },
    {
      label: "Submitted at",
      value: "must remain null while status is draft",
    },
  ];

  const futureActions = [
    "Create one synthetic draft explanation for the owned staged transaction.",
    "Read back only that participant-owned draft explanation.",
    "Edit only the participant’s own draft explanation text and/or category.",
    "Re-read the explanation to confirm the edit persisted.",
    "Confirm the underlying staged financial transaction remains unchanged.",
  ];

  const stopConditions = [
    "Any result requires schema changes.",
    "Any result requires service-role or privileged bypass.",
    "Any result touches the staged transaction itself.",
    "Any result broadens scope outside the participant-owned draft path.",
    "Any live behavior differs materially from the approved documentation candidate.",
  ];

  return (
    <main className="min-h-screen bg-[#eef4ef] px-4 py-8 text-slate-950">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-700">
            DSS Enterprises
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
            THRIVE transaction explanation test
          </h1>
          <p className="mt-4 max-w-4xl leading-7 text-slate-600">
            First-pass visual shell only. This route documents the approved
            narrow test target for participant transaction explanations without
            enabling execution. No database action is performed from this page.
          </p>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-black uppercase tracking-wide text-amber-800">
              Execution status
            </p>
            <p className="mt-2 text-lg font-black text-amber-950">
              Review-only lock active
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              This page is intentionally non-executable in this first pass.
            </p>
          </div>
        </header>

        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">Verified preconditions</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {verifiedPreconditions.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="font-semibold text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
              Synthetic participant
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Verified participant scope
            </h2>

            <div className="mt-5 space-y-3">
              {participantFacts.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-100 p-4"
                >
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 break-all font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
              Owned transaction
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Verified staged transaction baseline
            </h2>

            <div className="mt-5 space-y-3">
              {ownedTransactionFacts.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-100 p-4"
                >
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 break-all font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
            Approved draft target
          </p>
          <h2 className="mt-2 text-2xl font-black">
            First draft explanation values
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            These are the narrow synthetic values to be used later if execution
            is separately approved.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {approvedDraftValues.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-100 p-4"
              >
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 font-semibold text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-sky-700">
              Future proof path
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Approved next actions
            </h2>
            <ol className="mt-5 space-y-3">
              {futureActions.map((item, index) => (
                <li
                  key={item}
                  className="rounded-2xl border border-slate-100 p-4"
                >
                  <p className="font-semibold text-slate-900">
                    {index + 1}. {item}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-rose-700">
              Failure boundaries
            </p>
            <h2 className="mt-2 text-2xl font-black">
              Stop conditions
            </h2>
            <ul className="mt-5 space-y-3">
              {stopConditions.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-rose-100 bg-rose-50 p-4"
                >
                  <p className="font-semibold text-rose-950">{item}</p>
                </li>
              ))}
            </ul>
          </section>
        </section>

        <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-300">
            Current build note
          </p>
          <p className="mt-3 text-lg font-bold">
            This first pass intentionally renders documentation only.
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-200">
            There are no Supabase calls, no browser-authenticated writes, no
            execution toggle, and no mutation controls in this file yet. That is
            by design. This gives us a clean review shell before we add any live
            create/read/update proof path.
          </p>
        </section>
      </section>
    </main>
  );
}
