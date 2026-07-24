import ThriveNavigation from "./ThriveNavigation";

export default function ThriveSidebar() {
  return (
    <aside className="rounded-3xl border border-emerald-100 bg-white/85 p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-3 lg:mb-8">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-lg font-black text-white">
          T
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            DSS Enterprises
          </p>
          <h1 className="text-xl font-black">THRIVE</h1>
        </div>
      </div>

      <div className="mt-5 lg:mt-0">
        <ThriveNavigation />
      </div>

      <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white lg:mt-8">
        <p className="text-xs font-bold uppercase text-emerald-300">
          Guardrail
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-200">
          Support tool only. Not legal, clinical, fiduciary, credit repair,
          bankruptcy, or investment advice.
        </p>
      </div>
    </aside>
  );
}