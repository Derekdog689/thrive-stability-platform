"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Today", href: "/" },
  { label: "My Program", href: "/my-program" },
  { label: "Budget", href: "/budget" },
  { label: "Wellness", href: "/wellness" },
  { label: "Goals", href: "/goals" },
  { label: "Support", href: null },
  { label: "Reports", href: "/reports" },
];

export default function ThriveNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="THRIVE navigation">
      <div className="flex gap-2 overflow-x-auto pb-2 text-sm font-semibold lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
        {navItems.map((item) => {
          if (!item.href) {
            return (
              <div
                key={item.label}
                className="shrink-0 rounded-2xl bg-slate-50 px-4 py-3 text-slate-500 lg:bg-transparent"
                aria-disabled="true"
              >
                <div className="flex items-center justify-between gap-3">
                  <span>{item.label}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">
                    Soon
                  </span>
                </div>
              </div>
            );
          }

          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`shrink-0 rounded-2xl px-4 py-3 lg:block ${
                isActive
                  ? "bg-emerald-100 text-emerald-900"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 lg:bg-transparent"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
