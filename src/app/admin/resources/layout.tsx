import ResourcesAdminNav from "./ResourcesAdminNav";

export default function ResourcesAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-w-0 max-w-full overflow-x-hidden [&_*]:box-border [&_input]:min-w-0 [&_input]:max-w-full [&_select]:min-w-0 [&_select]:max-w-full [&_textarea]:min-w-0 [&_textarea]:max-w-full">
      <div className="bg-[#eef4ef] px-4 pt-4 sm:px-6">
        <ResourcesAdminNav />
      </div>
      {children}
    </div>
  );
}
