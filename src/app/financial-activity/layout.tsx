import Link from "next/link";
import type { ReactNode } from "react";

function FinancialActivityBottomNav() {
  const items = [
    { href: "/", label: "Today", icon: "⌂" },
    { href: "/wellness", label: "Wellness", icon: "◌" },
    { href: "/goals", label: "Goals", icon: "◎" },
    { href: "/budget", label: "Money", icon: "$" },
    { href: "/support", label: "Support", icon: "◯" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-3 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-xl rounded-[1.75rem] border border-white/60 bg-white/90 px-2 py-2 shadow-[0_18px_55px_rgba(15,23,42,0.2)] backdrop-blur-xl sm:bottom-5">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2 text-center text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-900"
          >
            <span className="text-base font-black leading-none">{item.icon}</span>
            <span className="mt-1 truncate text-[10px] font-black uppercase tracking-wide sm:text-xs">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function FinancialActivityLayout({ children }: { children: ReactNode }) {
  return (
    <div className="financial-activity-participant">
      {children}
      <FinancialActivityBottomNav />

      <style>{`
        .financial-activity-participant main {
          padding: 1rem 0.75rem 7.5rem !important;
          background:
            radial-gradient(circle at 84% 2%, rgba(213, 177, 105, 0.16), transparent 24rem),
            linear-gradient(180deg, #eef5f1 0%, #f6f4ee 62%, #eef4ef 100%) !important;
        }

        .financial-activity-participant main > section {
          display: block !important;
          max-width: 42rem !important;
          margin: 0 auto !important;
        }

        .financial-activity-participant main > section > :first-child {
          display: none !important;
        }

        .financial-activity-participant main > section > section {
          display: flex !important;
          flex-direction: column !important;
          gap: 0.75rem !important;
        }

        .financial-activity-participant main > section > section > header {
          order: 0;
          padding: 1.25rem !important;
          border: 0 !important;
          border-radius: 1.65rem !important;
          background: linear-gradient(135deg, #174e45 0%, #2f6659 68%, #6d8374 100%) !important;
          color: white !important;
          box-shadow: 0 18px 48px rgba(29, 78, 67, 0.14) !important;
        }

        .financial-activity-participant main > section > section > header p:first-child {
          color: #c6f6df !important;
          letter-spacing: .16em !important;
        }

        .financial-activity-participant main > section > section > header h1 {
          margin-top: .45rem !important;
          max-width: 18ch !important;
          font-family: Georgia, Cambria, "Times New Roman", serif !important;
          font-size: clamp(1.85rem, 7vw, 2.55rem) !important;
          line-height: .98 !important;
          letter-spacing: -.025em !important;
        }

        .financial-activity-participant main > section > section > header p:last-child {
          margin-top: .75rem !important;
          max-width: 34rem !important;
          color: rgba(255,255,255,.82) !important;
          font-size: .86rem !important;
          line-height: 1.45 !important;
        }

        .financial-activity-participant main > section > section > section {
          padding: 1rem !important;
          border-radius: 1.5rem !important;
          box-shadow: 0 10px 30px rgba(15, 23, 42, .055) !important;
        }

        .financial-activity-participant main > section > section > section:nth-of-type(1) {
          order: 2;
        }

        .financial-activity-participant main > section > section > section:nth-of-type(2) {
          order: 1;
        }

        .financial-activity-participant main > section > section > section:nth-of-type(3) {
          order: 3;
          padding: .85rem 1rem !important;
          background: #f7f3e9 !important;
          color: #334155 !important;
        }

        .financial-activity-participant main > section > section > section:nth-of-type(3) p:first-child {
          color: #166052 !important;
        }

        .financial-activity-participant main > section > section > section:nth-of-type(3) p:last-child {
          margin-top: .35rem !important;
          color: #64748b !important;
          font-size: .75rem !important;
          line-height: 1.35 !important;
        }

        .financial-activity-participant main > section > section > section:nth-of-type(2) > p:nth-of-type(2) {
          margin-top: .35rem !important;
          font-size: .78rem !important;
          line-height: 1.4 !important;
        }

        .financial-activity-participant main > section > section > section:nth-of-type(2) > div {
          margin-top: .8rem !important;
          display: grid !important;
          gap: .65rem !important;
        }

        .financial-activity-participant main > section > section > section:nth-of-type(2) article {
          padding: .9rem !important;
          border-radius: 1.25rem !important;
          border-color: #e2ebe6 !important;
          background: #fff !important;
        }

        .financial-activity-participant main > section > section > section:nth-of-type(2) article > div:first-child {
          gap: .45rem !important;
        }

        .financial-activity-participant main > section > section > section:nth-of-type(2) article > div:first-child > p:last-child {
          font-size: 1.05rem !important;
        }

        .financial-activity-participant main > section > section > section:nth-of-type(2) article .mt-4 {
          margin-top: .65rem !important;
        }

        .financial-activity-participant main > section > section > section:nth-of-type(1) h2 {
          font-size: 1.15rem !important;
          line-height: 1.2 !important;
        }

        .financial-activity-participant main > section > section > section:nth-of-type(1) > div > div > p:last-of-type {
          margin-top: .45rem !important;
          font-size: .78rem !important;
          line-height: 1.4 !important;
        }

        .financial-activity-participant main > section > section > section:nth-of-type(1) button {
          padding-top: .65rem !important;
          padding-bottom: .65rem !important;
        }

        @media (max-width: 640px) {
          .financial-activity-participant main > section > section > header p:last-child {
            display: none !important;
          }

          .financial-activity-participant main > section > section > section:nth-of-type(2) article > div:first-child {
            display: grid !important;
            grid-template-columns: minmax(0,1fr) auto !important;
            align-items: start !important;
          }

          .financial-activity-participant main > section > section > section:nth-of-type(2) article > div:first-child > div p:last-child {
            font-size: .72rem !important;
          }
        }
      `}</style>
    </div>
  );
}
