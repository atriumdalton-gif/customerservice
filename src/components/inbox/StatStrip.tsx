import type { InboxStats } from "@/types/email";

interface StatCardData {
  label: string;
  value: string;
  color: string;
}

export default function StatStrip({ stats }: { stats: InboxStats }) {
  const cards: StatCardData[] = [
    { label: "Open Tickets", value: String(stats.openTickets), color: "text-blue-600" },
    { label: "Avg Response", value: `${stats.avgResponseMinutes}m`, color: "text-purple-600" },
    { label: "Auto-Resolved", value: `${stats.autoResolvedPercent}%`, color: "text-emerald-600" },
    { label: "CSAT", value: `${stats.csat}%`, color: "text-amber-500" },
    {
      label: "Urgent",
      value: String(stats.urgentCount),
      color: stats.urgentCount > 0 ? "text-red-500" : "text-slate-400",
    },
  ];

  return (
    <div className="flex gap-3 px-6 py-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
        >
          <p className="text-xs font-medium text-slate-500">{card.label}</p>
          <p className={`mt-1 text-2xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
