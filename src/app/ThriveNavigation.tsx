"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Today", href: "/" },
  { label: "My Program", href: "/my-program" },
  { label: "Budget", href: "/budget" },
  { label: "Financial Activity", href: "/financial-activity" },
  { label: "Wellness", href: "/wellness" },
  { label: "Goals", href: "/goals" },
  { label: "Support", href: "/support" },
  { label: "Reports", href: "/reports" },
];

export default function ThriveNavigation() {
  const pathname = usePathname();

  return (
    <nav className="w-full min-w-0 max-w-full overflow-hidden" aria-label="THRIVE navigation">
      <div className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-2 text-sm font-semibold lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`shrink-0 whitespace-nowrap rounded-2xl px-4 py-3 lg:block ${
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