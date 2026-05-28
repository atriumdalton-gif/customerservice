import type { InboxStats } from "@/types/email";

function MiniSparkline({ points, color }: { points: number[]; color: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 60;
  const h = 20;
  const step = w / (points.length - 1);

  const pathD = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="mt-1 opacity-60">
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface StatCardData {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  color: string;
  sparkColor: string;
  sparkData: number[];
  icon: React.ReactNode;
}

export default function StatStrip({ stats }: { stats: InboxStats }) {
  const cards: StatCardData[] = [
    {
      label: "Open Tickets",
      value: String(stats.openTickets),
      trend: "+2 today",
      trendUp: false,
      color: "var(--info)",
      sparkColor: "#4f8fff",
      sparkData: [3, 5, 4, 7, 6, stats.openTickets, stats.openTickets + 1],
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859" />
        </svg>
      ),
    },
    {
      label: "Avg Response",
      value: `${stats.avgResponseMinutes}m`,
      trend: "-8m this week",
      trendUp: true,
      color: "var(--accent)",
      sparkColor: "#7c5cfc",
      sparkData: [45, 38, 42, 35, 30, stats.avgResponseMinutes, stats.avgResponseMinutes - 3],
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "AI Resolution",
      value: `${stats.autoResolvedPercent}%`,
      trend: "+5% this week",
      trendUp: true,
      color: "var(--success)",
      sparkColor: "#34d399",
      sparkData: [20, 25, 28, 32, 35, stats.autoResolvedPercent - 2, stats.autoResolvedPercent],
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      ),
    },
    {
      label: "CSAT",
      value: `${stats.csat}%`,
      trend: "+2% this month",
      trendUp: true,
      color: "var(--warning)",
      sparkColor: "#ffb347",
      sparkData: [85, 87, 86, 88, 90, stats.csat - 1, stats.csat],
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
        </svg>
      ),
    },
    {
      label: "Urgent",
      value: String(stats.urgentCount),
      trend: stats.urgentCount > 0 ? "Needs attention" : "All clear",
      trendUp: stats.urgentCount === 0,
      color: stats.urgentCount > 0 ? "var(--danger)" : "var(--success)",
      sparkColor: stats.urgentCount > 0 ? "#ff4d6a" : "#34d399",
      sparkData: [2, 3, 1, 2, 1, stats.urgentCount + 1, stats.urgentCount],
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex gap-3 px-4 py-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="glass flex-1 rounded-xl p-3.5 transition-all duration-200 hover:bg-white/[0.03]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: `${card.sparkColor}15`, color: card.color }}
              >
                {card.icon}
              </div>
              <p className="text-[11px] font-medium text-[var(--foreground-muted)]">{card.label}</p>
            </div>
            <MiniSparkline points={card.sparkData} color={card.sparkColor} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-xl font-bold" style={{ color: card.color }}>
              {card.value}
            </p>
            <span
              className="text-[10px] font-medium"
              style={{ color: card.trendUp ? "var(--success)" : "var(--foreground-muted)" }}
            >
              {card.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
