import Link from "next/link";

export default function ResourcesAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-w-0 max-w-full overflow-x-hidden [&_*]:box-border [&_input]:min-w-0 [&_input]:max-w-full [&_select]:min-w-0 [&_select]:max-w-full [&_textarea]:min-w-0 [&_textarea]:max-w-full">
      <div className="bg-[#eef4ef] px-4 pt-4 sm:px-6">
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-2" aria-label="Resources admin">
          <Link
            href="/admin/resources"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700"
          >
            Resource Library
          </Link>
          <Link
            href="/admin/resources/manage"
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700"
          >
            Maintain Resources
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
