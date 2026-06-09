"use client";

import { useState, useEffect } from "react";

interface TopicRow {
  topic: string;
  count: number;
  resolvedCount: number;
}

interface Escalation {
  question: string;
  response: string;
  userEmail: string;
  createdAt: string;
}

interface DailyVolume {
  date: string;
  count: number;
  resolved: number;
}

interface ChatbotData {
  totalConversations: number;
  resolved: number;
  escalated: number;
  resolutionRate: number;
  topTopics: TopicRow[];
  recentEscalations: Escalation[];
  dailyVolume: DailyVolume[];
}

// ── SVG Bar Chart (matches analytics page) ──────────────────────────
function BarChart({
  data,
  color,
  secondaryColor,
}: {
  data: { label: string; value: number; secondary?: number }[];
  color: string;
  secondaryColor?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-[120px] w-full">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] font-bold" style={{ color }}>
            {d.value || ""}
          </span>
          <div className="relative w-full">
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: `${Math.max((d.value / max) * 90, 4)}px`,
                background: `linear-gradient(180deg, ${color} 0%, ${color}40 100%)`,
              }}
            />
            {secondaryColor && d.secondary != null && (
              <div
                className="absolute bottom-0 left-0 w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${Math.max((d.secondary / max) * 90, 2)}px`,
                  background: `linear-gradient(180deg, ${secondaryColor} 0%, ${secondaryColor}40 100%)`,
                }}
              />
            )}
          </div>
          <span className="text-[9px] text-[var(--foreground-muted)]">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Horizontal Bar ───────────────────────────────────────────────────
function HBar({
  label,
  value,
  max,
  color,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 text-[11px] text-[var(--foreground-muted)] truncate">
        {label}
      </span>
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span
        className="w-10 text-right text-[11px] font-bold"
        style={{ color }}
      >
        {value}
        {suffix}
      </span>
    </div>
  );
}

// ── Donut Chart ──────────────────────────────────────────────────────
function DonutChart({
  segments,
  size = 110,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={10}
      />
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ChatbotPage() {
  const [data, setData] = useState<ChatbotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const url = process.env.NEXT_PUBLIC_CHATBOT_ANALYTICS_URL || "/api/chatbot-analytics";
        const key = process.env.NEXT_PUBLIC_CHATBOT_ANALYTICS_KEY || "";
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
          style={{
            borderColor: "var(--accent)",
            borderTopColor: "transparent",
          }}
        />
        <p className="text-[13px] text-[var(--foreground-muted)]">
          Loading chatbot analytics...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <svg
          className="h-10 w-10 text-[var(--danger)]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <p className="text-[13px] text-[var(--foreground-muted)]">
          {error || "Failed to load chatbot analytics"}
        </p>
      </div>
    );
  }

  const topTopic = data.topTopics[0]?.topic || "—";
  const maxTopicCount = data.topTopics[0]?.count || 1;

  // Prepare daily volume for chart (last 7 entries)
  const chartData = data.dailyVolume.slice(-7).map((d) => ({
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en", {
      weekday: "short",
    }),
    value: d.count,
    secondary: d.resolved,
  }));

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[18px] font-bold text-[var(--foreground)]">
          FAQ Chatbot Analytics
        </h1>
        <p className="text-[12px] text-[var(--foreground-muted)] mt-0.5">
          Conversations, resolution rates, and escalation insights
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Conversations",
            value: String(data.totalConversations),
            color: "var(--info)",
            icon: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
          },
          {
            label: "Resolution Rate",
            value: `${data.resolutionRate}%`,
            color: "var(--success)",
            icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
          },
          {
            label: "Escalated",
            value: String(data.escalated),
            color: "var(--danger)",
            icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
          },
          {
            label: "Top Topic",
            value: topTopic,
            color: "var(--accent)",
            icon: "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z",
            smallText: true,
          },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{
                  background: `${stat.color}15`,
                  color: stat.color,
                }}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={stat.icon}
                  />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-[var(--foreground-muted)]">
                {stat.label}
              </span>
            </div>
            <p
              className={`font-bold ${(stat as any).smallText ? "text-[15px]" : "text-2xl"} truncate`}
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Row 2: Volume chart + Resolution donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Daily volume */}
        <div className="lg:col-span-2 glass rounded-xl p-4">
          <h3 className="text-[13px] font-bold text-[var(--foreground)] mb-4">
            Daily Volume (7 days)
          </h3>
          {chartData.length === 0 ? (
            <p className="text-[11px] text-[var(--foreground-muted)]">
              No data yet
            </p>
          ) : (
            <BarChart data={chartData} color="#7c5cfc" />
          )}
        </div>

        {/* Resolution donut */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-[13px] font-bold text-[var(--foreground)] mb-3">
            Resolution Breakdown
          </h3>
          <div className="flex flex-col items-center">
            <div className="relative">
              <DonutChart
                size={110}
                segments={[
                  {
                    value: data.resolved,
                    color: "#34d399",
                    label: "Resolved",
                  },
                  {
                    value: data.escalated,
                    color: "#ff4d6a",
                    label: "Escalated",
                  },
                ]}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-[var(--foreground)]">
                  {data.resolutionRate}%
                </span>
                <span className="text-[9px] text-[var(--foreground-muted)]">
                  resolved
                </span>
              </div>
            </div>
            <div className="mt-3 flex gap-4">
              {[
                {
                  label: "Resolved",
                  value: data.resolved,
                  color: "#34d399",
                },
                {
                  label: "Escalated",
                  value: data.escalated,
                  color: "#ff4d6a",
                },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ background: s.color }}
                  />
                  <span className="text-[10px] text-[var(--foreground-muted)]">
                    {s.label}
                  </span>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Top Topics */}
      <div className="glass rounded-xl p-4">
        <h3 className="text-[13px] font-bold text-[var(--foreground)] mb-3">
          Top Topics
        </h3>
        {data.topTopics.length === 0 ? (
          <p className="text-[11px] text-[var(--foreground-muted)]">
            No topics yet
          </p>
        ) : (
          <div className="space-y-2.5">
            {data.topTopics.map((t) => {
              const rate =
                t.count > 0
                  ? Math.round((t.resolvedCount / t.count) * 100)
                  : 0;
              return (
                <div key={t.topic} className="flex items-center gap-3">
                  <HBar
                    label={t.topic}
                    value={t.count}
                    max={maxTopicCount}
                    color="#7c5cfc"
                  />
                  <span className="w-12 text-right text-[10px] font-medium text-[var(--foreground-muted)]">
                    {rate}% res
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Row 4: Recent Escalations */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-bold text-[var(--foreground)]">
            Recent Escalations
          </h3>
          {data.recentEscalations.length > 0 && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--danger)]/10 text-[var(--danger)]">
              {data.escalated} unresolved
            </span>
          )}
        </div>
        {data.recentEscalations.length === 0 ? (
          <div className="flex flex-col items-center py-6 gap-2">
            <svg
              className="h-8 w-8 text-[var(--success)]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-[11px] text-[var(--foreground-muted)]">
              No escalations — the bot is handling everything
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentEscalations.map((esc, i) => (
              <div
                key={i}
                className="rounded-lg p-3"
                style={{
                  background: "rgba(255,77,106,0.04)",
                  border: "1px solid rgba(255,77,106,0.1)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-[var(--foreground)] truncate">
                      {esc.question}
                    </p>
                    <p className="text-[11px] text-[var(--foreground-muted)] mt-1 line-clamp-2">
                      {esc.response}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-[var(--foreground-muted)]">
                      {timeAgo(esc.createdAt)}
                    </p>
                    {esc.userEmail && (
                      <p className="text-[10px] text-[var(--accent)] mt-0.5 truncate max-w-[140px]">
                        {esc.userEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
