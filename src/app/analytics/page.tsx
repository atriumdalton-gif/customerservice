"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";

interface AnalyticsData {
  total: number;
  pending: number;
  sent: number;
  rejected: number;
  acceptanceRate: number;
  draftsAccepted: number;
  draftsEdited: number;
  avgResponseMin: number;
  priorities: Record<string, number>;
  sentiments: Record<string, number>;
  channels: Record<string, number>;
  topTags: { tag: string; count: number }[];
  dailyVolume: { label: string; count: number }[];
  articleCount: number;
}

// ── SVG Bar Chart ────────────────────────────────────────────────────
function BarChart({ data, color }: { data: { label: string; count: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const barW = 100 / data.length;

  return (
    <div className="flex items-end gap-1.5 h-[120px] w-full">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] font-bold" style={{ color }}>{d.count || ""}</span>
          <div className="w-full rounded-t-md transition-all duration-500" style={{
            height: `${Math.max((d.count / max) * 90, 4)}%`,
            background: `linear-gradient(180deg, ${color} 0%, ${color}40 100%)`,
            minWidth: `${barW}%`,
          }} />
          <span className="text-[9px] text-[var(--foreground-muted)]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Donut Chart ──────────────────────────────────────────────────────
function DonutChart({ segments, size = 100 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={10} />
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circ;
        const el = (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset}
            className="transition-all duration-700"
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

// ── Horizontal Bar ───────────────────────────────────────────────────
function HBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-[11px] text-[var(--foreground-muted)] truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="w-6 text-right text-[11px] font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

const PRIORITY_COLORS: Record<string, string> = { urgent: "#ff4d6a", high: "#ffb347", normal: "#4f8fff", low: "#5a5a72" };
const SENTIMENT_COLORS: Record<string, string> = { positive: "#34d399", neutral: "#8b8b9e", negative: "#ffb347", frustrated: "#ff4d6a" };
const CHANNEL_COLORS: Record<string, string> = { email: "#4f8fff", chat: "#7c5cfc", phone: "#34d399", sms: "#ffb347" };

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) setData(await res.json());
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
        <p className="text-[13px] text-[var(--foreground-muted)]">Loading analytics...</p>
      </div>
    );
  }

  const resolvedRate = data.total > 0 ? Math.round(((data.sent + data.rejected) / data.total) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[18px] font-bold text-[var(--foreground)]">Analytics</h1>
        <p className="text-[12px] text-[var(--foreground-muted)] mt-0.5">Performance metrics and insights</p>
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Conversations", value: String(data.total), color: "var(--info)", icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" },
          { label: "Avg Response Time", value: `${data.avgResponseMin}m`, color: "var(--accent)", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "AI Acceptance Rate", value: `${data.acceptanceRate}%`, color: "var(--success)", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
          { label: "Resolution Rate", value: `${resolvedRate}%`, color: "var(--warning)", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${stat.color}15`, color: stat.color }}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-[var(--foreground-muted)]">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Row 2: Volume chart + Status donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Volume over time */}
        <div className="lg:col-span-2 glass rounded-xl p-4">
          <h3 className="text-[13px] font-bold text-[var(--foreground)] mb-4">Ticket Volume (7 days)</h3>
          <BarChart data={data.dailyVolume} color="#7c5cfc" />
        </div>

        {/* Status breakdown donut */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-[13px] font-bold text-[var(--foreground)] mb-3">Status Breakdown</h3>
          <div className="flex flex-col items-center">
            <div className="relative">
              <DonutChart
                size={110}
                segments={[
                  { value: data.pending, color: "#4f8fff", label: "Open" },
                  { value: data.sent, color: "#34d399", label: "Sent" },
                  { value: data.rejected, color: "#8b8b9e", label: "Closed" },
                ]}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-[var(--foreground)]">{data.total}</span>
                <span className="text-[9px] text-[var(--foreground-muted)]">total</span>
              </div>
            </div>
            <div className="mt-3 flex gap-4">
              {[
                { label: "Open", value: data.pending, color: "#4f8fff" },
                { label: "Sent", value: data.sent, color: "#34d399" },
                { label: "Closed", value: data.rejected, color: "#8b8b9e" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-[10px] text-[var(--foreground-muted)]">{s.label}</span>
                  <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Priority + Sentiment + Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Priority */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-[13px] font-bold text-[var(--foreground)] mb-3">By Priority</h3>
          <div className="space-y-2.5">
            {Object.entries(data.priorities).map(([key, val]) => (
              <HBar key={key} label={key} value={val} max={data.total} color={PRIORITY_COLORS[key] || "#8b8b9e"} />
            ))}
          </div>
        </div>

        {/* Sentiment */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-[13px] font-bold text-[var(--foreground)] mb-3">By Sentiment</h3>
          <div className="space-y-2.5">
            {Object.entries(data.sentiments).map(([key, val]) => (
              <HBar key={key} label={key} value={val} max={data.total} color={SENTIMENT_COLORS[key] || "#8b8b9e"} />
            ))}
          </div>
        </div>

        {/* Channels */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-[13px] font-bold text-[var(--foreground)] mb-3">By Channel</h3>
          <div className="space-y-2.5">
            {Object.entries(data.channels).map(([key, val]) => (
              <HBar key={key} label={key} value={val} max={data.total} color={CHANNEL_COLORS[key] || "#8b8b9e"} />
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: AI Performance + Tags + Quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* AI Performance */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-[13px] font-bold text-[var(--foreground)] mb-3">AI Draft Performance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--foreground-muted)]">Accepted without edits</span>
              <span className="text-[13px] font-bold" style={{ color: "var(--success)" }}>{data.draftsAccepted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--foreground-muted)]">Accepted with edits</span>
              <span className="text-[13px] font-bold" style={{ color: "var(--warning)" }}>{data.draftsEdited}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--foreground-muted)]">Rejected</span>
              <span className="text-[13px] font-bold" style={{ color: "var(--danger)" }}>{data.rejected}</span>
            </div>
            <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[var(--foreground)]">Acceptance rate</span>
                <span className="text-[15px] font-bold" style={{ color: "var(--accent)" }}>{data.acceptanceRate}%</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${data.acceptanceRate}%`, background: "var(--accent-gradient)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Top Tags */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-[13px] font-bold text-[var(--foreground)] mb-3">Top Tags</h3>
          {data.topTags.length === 0 ? (
            <p className="text-[11px] text-[var(--foreground-muted)]">No tags yet</p>
          ) : (
            <div className="space-y-2">
              {data.topTags.map((t) => (
                <div key={t.tag} className="flex items-center justify-between">
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(124,92,252,0.08)", color: "var(--accent)", border: "1px solid rgba(124,92,252,0.12)" }}>
                    {t.tag}
                  </span>
                  <span className="text-[11px] font-bold text-[var(--foreground)]">{t.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick numbers */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-[13px] font-bold text-[var(--foreground)] mb-3">Overview</h3>
          <div className="space-y-3">
            {[
              { label: "Knowledge Base Articles", value: String(data.articleCount), color: "var(--info)" },
              { label: "Open Tickets", value: String(data.pending), color: "var(--warning)" },
              { label: "Sent Replies", value: String(data.sent), color: "var(--success)" },
              { label: "Avg Response", value: `${data.avgResponseMin}m`, color: "var(--accent)" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--foreground-muted)]">{row.label}</span>
                <span className="text-[13px] font-bold" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
