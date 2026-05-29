"use client";

import { useState, useEffect, useMemo } from "react";
import clsx from "clsx";

// ── Deterministic enrichment (matches mockEnrich logic) ──────────────
function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const COMPANIES = ["Acme Corp", "TechStart Inc", "Globex Ltd", "Initech", "Umbrella Co", "Wayne Enterprises", "Stark Industries", "Pied Piper"];
const PLANS = ["Free", "Starter", "Pro", "Enterprise"];
const AVATAR_COLORS = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-pink-500"];
const LOCATIONS = ["San Francisco, CA", "Austin, TX", "New York, NY", "Miami, FL", "Seattle, WA", "Chicago, IL", "Denver, CO", "Portland, OR"];

interface RawCustomer {
  email: string;
  name: string | null;
  ticketCount: number;
  lastContact: string;
  firstContact: string;
  openTickets: number;
  resolvedTickets: number;
  subjects: string[];
}

interface Customer extends RawCustomer {
  displayName: string;
  initials: string;
  avatarColor: string;
  company: string;
  plan: string;
  ltv: string;
  location: string;
  satisfaction: number;
}

function enrichCustomer(c: RawCustomer): Customer {
  const h = simpleHash(c.email + "cust");
  const displayName = c.name || c.email.split("@")[0].replace(/[._]/g, " ");
  const initials = displayName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return {
    ...c,
    displayName,
    initials: initials || "??",
    avatarColor: AVATAR_COLORS[h % AVATAR_COLORS.length],
    company: COMPANIES[h % COMPANIES.length],
    plan: PLANS[(h >> 4) % PLANS.length],
    ltv: `$${((h % 50) + 1) * 100}`,
    location: LOCATIONS[(h >> 2) % LOCATIONS.length],
    satisfaction: 70 + (h % 30),
  };
}

// ── Time helpers ──────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// ── Plan badge colors ────────────────────────────────────────────────
const PLAN_COLORS: Record<string, { bg: string; text: string }> = {
  Free: { bg: "rgba(139,139,158,0.12)", text: "#8b8b9e" },
  Starter: { bg: "rgba(79,143,255,0.12)", text: "#4f8fff" },
  Pro: { bg: "rgba(124,92,252,0.12)", text: "#7c5cfc" },
  Enterprise: { bg: "rgba(52,211,153,0.12)", text: "#34d399" },
};

type SortKey = "name" | "tickets" | "lastContact" | "plan" | "ltv";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("lastContact");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/customers");
        if (res.ok) {
          const data: RawCustomer[] = await res.json();
          setCustomers(data.map(enrichCustomer));
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let result = customers;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.displayName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "name":
          cmp = a.displayName.localeCompare(b.displayName);
          break;
        case "tickets":
          cmp = a.ticketCount - b.ticketCount;
          break;
        case "lastContact":
          cmp = new Date(a.lastContact).getTime() - new Date(b.lastContact).getTime();
          break;
        case "plan": {
          const order = ["Free", "Starter", "Pro", "Enterprise"];
          cmp = order.indexOf(a.plan) - order.indexOf(b.plan);
          break;
        }
        case "ltv":
          cmp = parseInt(a.ltv.slice(1)) - parseInt(b.ltv.slice(1));
          break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [customers, search, sortBy, sortAsc]);

  const selected = customers.find((c) => c.email === selectedEmail);

  function handleSort(key: SortKey) {
    if (sortBy === key) {
      setSortAsc((v) => !v);
    } else {
      setSortBy(key);
      setSortAsc(false);
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortBy !== column) return null;
    return (
      <svg className="ml-1 inline h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d={sortAsc ? "M4.5 15.75l7.5-7.5 7.5 7.5" : "M19.5 8.25l-7.5 7.5-7.5-7.5"} />
      </svg>
    );
  }

  // ── Stats ────────────────────────────────────────────────────────────
  const totalCustomers = customers.length;
  const totalOpen = customers.reduce((s, c) => s + c.openTickets, 0);
  const avgSatisfaction = totalCustomers
    ? Math.round(customers.reduce((s, c) => s + c.satisfaction, 0) / totalCustomers)
    : 0;
  const totalLtv = customers.reduce((s, c) => s + parseInt(c.ltv.slice(1)), 0);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
        </div>
        <p className="text-[13px] text-[var(--foreground-muted)]">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main table area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header stats */}
        <div className="flex gap-3 px-5 pt-4 pb-3">
          {[
            { label: "Total Customers", value: String(totalCustomers), color: "var(--info)", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
            { label: "Open Tickets", value: String(totalOpen), color: "var(--warning)", icon: "M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859" },
            { label: "Avg Satisfaction", value: `${avgSatisfaction}%`, color: "var(--success)", icon: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" },
            { label: "Total LTV", value: `$${totalLtv.toLocaleString()}`, color: "var(--accent)", icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          ].map((stat) => (
            <div key={stat.label} className="glass flex-1 rounded-xl p-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${stat.color}15`, color: stat.color }}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                  </svg>
                </div>
                <span className="text-[11px] font-medium text-[var(--foreground-muted)]">{stat.label}</span>
              </div>
              <p className="mt-2 text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search + heading */}
        <div className="flex items-center justify-between px-5 pb-3">
          <h2 className="text-[15px] font-bold text-[var(--foreground)]">
            All Customers
            <span className="ml-2 text-[12px] font-medium text-[var(--foreground-muted)]">{filtered.length}</span>
          </h2>
          <div className="flex items-center gap-2 rounded-lg px-3 py-[7px]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
            <svg className="h-3.5 w-3.5 text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-52 bg-transparent text-[13px] outline-none placeholder:text-[var(--foreground-muted)] text-[var(--foreground)]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-5">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]" style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="pb-2.5 pr-4">
                  <button onClick={() => handleSort("name")} className="hover:text-white transition-colors">Customer <SortIcon column="name" /></button>
                </th>
                <th className="pb-2.5 pr-4">
                  <button onClick={() => handleSort("plan")} className="hover:text-white transition-colors">Plan <SortIcon column="plan" /></button>
                </th>
                <th className="pb-2.5 pr-4">
                  <button onClick={() => handleSort("tickets")} className="hover:text-white transition-colors">Tickets <SortIcon column="tickets" /></button>
                </th>
                <th className="pb-2.5 pr-4">
                  <button onClick={() => handleSort("ltv")} className="hover:text-white transition-colors">LTV <SortIcon column="ltv" /></button>
                </th>
                <th className="pb-2.5 pr-4">
                  <button onClick={() => handleSort("lastContact")} className="hover:text-white transition-colors">Last Contact <SortIcon column="lastContact" /></button>
                </th>
                <th className="pb-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const planColors = PLAN_COLORS[c.plan] || PLAN_COLORS.Free;
                return (
                  <tr
                    key={c.email}
                    onClick={() => setSelectedEmail(c.email === selectedEmail ? null : c.email)}
                    className={clsx(
                      "cursor-pointer text-[12px] transition-all duration-150 animate-fade-in",
                      c.email === selectedEmail ? "bg-[var(--accent-muted)]" : "hover:bg-white/[0.02]"
                    )}
                    style={{ animationDelay: `${i * 20}ms`, borderBottom: "1px solid var(--border)" }}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white", c.avatarColor)}>
                          {c.initials}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[var(--foreground)]">{c.displayName}</p>
                          <p className="text-[11px] text-[var(--foreground-muted)]">{c.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: planColors.bg, color: planColors.text }}>
                        {c.plan}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--foreground)] font-medium">{c.ticketCount}</span>
                        {c.openTickets > 0 && (
                          <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ background: "rgba(255,179,71,0.12)", color: "var(--warning)" }}>
                            {c.openTickets} open
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-[var(--foreground)]">{c.ltv}</td>
                    <td className="py-3 pr-4 text-[var(--foreground-muted)]">{timeAgo(c.lastContact)}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full" style={{ background: c.openTickets > 0 ? "var(--warning)" : "var(--success)" }} />
                        <span className="text-[11px] text-[var(--foreground-muted)]">
                          {c.openTickets > 0 ? "Active" : "Resolved"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.12)" }}>
                <svg className="h-7 w-7" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-[var(--foreground)]">No customers found</p>
              <p className="mt-1 text-[12px] text-[var(--foreground-muted)]">Try a different search term</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-[340px] shrink-0 overflow-y-auto" style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}>
          <div className="p-5">
            {/* Close */}
            <div className="flex justify-end mb-2">
              <button onClick={() => setSelectedEmail(null)} className="rounded-lg p-1 hover:bg-white/[0.06] transition-colors">
                <svg className="h-4 w-4 text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile header */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className={clsx("flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg mb-3", selected.avatarColor)}>
                {selected.initials}
              </div>
              <h3 className="text-[16px] font-bold text-[var(--foreground)]">{selected.displayName}</h3>
              <p className="text-[12px] text-[var(--foreground-muted)] mt-0.5">{selected.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold" style={{ background: (PLAN_COLORS[selected.plan] || PLAN_COLORS.Free).bg, color: (PLAN_COLORS[selected.plan] || PLAN_COLORS.Free).text }}>
                  {selected.plan}
                </span>
                {selected.openTickets > 0 && (
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(255,179,71,0.12)", color: "var(--warning)" }}>
                    {selected.openTickets} open
                  </span>
                )}
              </div>
            </div>

            {/* Details card */}
            <div className="glass rounded-xl p-3.5 space-y-2.5 mb-4">
              {[
                { label: "Company", value: selected.company },
                { label: "Location", value: selected.location },
                { label: "Plan", value: selected.plan },
                { label: "Lifetime Value", value: selected.ltv, highlight: true },
                { label: "Total Tickets", value: String(selected.ticketCount) },
                { label: "Open Tickets", value: String(selected.openTickets) },
                { label: "Resolved", value: String(selected.resolvedTickets) },
                { label: "Satisfaction", value: `${selected.satisfaction}%` },
                { label: "Customer Since", value: new Date(selected.firstContact).toLocaleDateString(undefined, { month: "short", year: "numeric" }) },
                { label: "Last Contact", value: timeAgo(selected.lastContact) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-[11px]">
                  <span className="text-[var(--foreground-muted)]">{row.label}</span>
                  <span className={clsx("font-semibold", row.highlight ? "text-[var(--accent)]" : "text-[var(--foreground)]")}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Satisfaction gauge */}
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-2">Satisfaction</p>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${selected.satisfaction}%`,
                    background: selected.satisfaction >= 80 ? "var(--success)" : selected.satisfaction >= 60 ? "var(--warning)" : "var(--danger)",
                  }}
                />
              </div>
              <p className="mt-1 text-right text-[10px] font-bold" style={{ color: selected.satisfaction >= 80 ? "var(--success)" : selected.satisfaction >= 60 ? "var(--warning)" : "var(--danger)" }}>
                {selected.satisfaction}%
              </p>
            </div>

            {/* Recent tickets */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-2">Recent Tickets</p>
              <div className="space-y-1.5">
                {selected.subjects.slice(0, 5).map((subj, i) => (
                  <div
                    key={i}
                    className="rounded-lg px-3 py-2 text-[11px] text-[var(--foreground)] opacity-80"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}
                  >
                    {subj}
                  </div>
                ))}
                {selected.subjects.length === 0 && (
                  <p className="text-[11px] text-[var(--foreground-muted)]">No tickets found</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex gap-2">
              <button className="flex-1 rounded-xl py-2.5 text-[12px] font-semibold text-white transition-all hover:opacity-90" style={{ background: "var(--accent-gradient)" }}>
                View Tickets
              </button>
              <button className="flex-1 rounded-xl py-2.5 text-[12px] font-medium text-[var(--foreground-muted)] transition-all hover:bg-white/[0.06]" style={{ border: "1px solid var(--border)" }}>
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
