"use client";

import { usePathname } from "next/navigation";

const ROUTE_LABELS: Record<string, string> = {
  "/inbox": "Inbox",
  "/automations": "Automations",
  "/customers": "Customers",
  "/knowledge-base": "Knowledge Base",
  "/analytics": "Analytics",
  "/settings": "Settings",
  "/": "Inbox",
};

export default function TopBar() {
  const pathname = usePathname();
  const pageLabel = ROUTE_LABELS[pathname] || "Dashboard";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400 font-medium">Doorknockr</span>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-[var(--foreground)]">{pageLabel}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-[10px] bg-slate-100 px-3 py-2 dark:bg-white/8">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-48 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Notification bell */}
        <button className="relative rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/8 transition-colors">
          <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">
          DP
        </div>
      </div>
    </header>
  );
}
