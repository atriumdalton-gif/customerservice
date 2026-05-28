"use client";

import { usePathname } from "next/navigation";

const ROUTE_LABELS: Record<string, string> = {
  "/inbox": "Inbox",
  "/automations": "Automations",
  "/customers": "Customers",
  "/knowledge-base": "Knowledge Base",
  "/analytics": "Analytics",
  "/connections": "Connections",
  "/settings": "Settings",
  "/": "Inbox",
};

export default function TopBar() {
  const pathname = usePathname();
  const pageLabel = ROUTE_LABELS[pathname] || "Dashboard";

  return (
    <header
      className="flex h-[52px] shrink-0 items-center justify-between px-5"
      style={{
        background: "var(--card)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[var(--foreground-muted)] text-[13px] font-medium">Doorknockr</span>
        <svg className="h-3.5 w-3.5 text-[var(--foreground-muted)] opacity-40" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-[13px] font-semibold text-[var(--foreground)]">{pageLabel}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-[7px]"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}
        >
          <svg className="h-3.5 w-3.5 text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-44 bg-transparent text-[13px] outline-none placeholder:text-[var(--foreground-muted)] text-[var(--foreground)]"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-[var(--foreground-muted)]">
            /
          </kbd>
        </div>

        {/* Notification bell */}
        <button
          className="relative rounded-lg p-2 transition-colors duration-200 hover:bg-white/[0.06]"
        >
          <svg className="h-[18px] w-[18px] text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span
            className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
            style={{ background: "var(--danger)" }}
          >
            3
          </span>
        </button>
      </div>
    </header>
  );
}
