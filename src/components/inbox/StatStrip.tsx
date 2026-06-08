import type { InboxStats } from "@/types/email";

interface StatCardData {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}

export default function StatStrip({ stats }: { stats: InboxStats }) {
  const cards: StatCardData[] = [
    {
      label: "Open Tickets",
      value: String(stats.openTickets),
      color: "var(--info)",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859" />
        </svg>
      ),
    },
    {
      label: "AI Drafted",
      value: `${stats.autoResolvedPercent}%`,
      color: "var(--success)",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      ),
    },
    {
      label: "Sent",
      value: `${stats.csat}%`,
      color: "var(--accent)",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      ),
    },
    {
      label: "Urgent",
      value: String(stats.urgentCount),
      color: stats.urgentCount > 0 ? "var(--danger)" : "var(--success)",
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
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: `color-mix(in srgb, ${card.color} 15%, transparent)`, color: card.color }}
            >
              {card.icon}
            </div>
            <p className="text-[11px] font-medium text-[var(--foreground-muted)]">{card.label}</p>
          </div>
          <p className="mt-2 text-xl font-bold" style={{ color: card.color }}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
