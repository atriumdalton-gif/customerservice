import clsx from "clsx";
import type { EnrichedEmail } from "@/types/email";
import InboxEmptyState from "./InboxEmptyState";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Open" },
  { key: "urgent", label: "Urgent" },
  { key: "needs-review", label: "Review" },
  { key: "sent", label: "Sent" },
  { key: "auto-resolved", label: "Resolved" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

const PRIORITY_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  urgent: { bg: "rgba(255,77,106,0.12)", text: "#ff4d6a", dot: "#ff4d6a" },
  high: { bg: "rgba(255,179,71,0.12)", text: "#ffb347", dot: "#ffb347" },
  normal: { bg: "rgba(79,143,255,0.12)", text: "#4f8fff", dot: "#4f8fff" },
  low: { bg: "rgba(90,90,114,0.12)", text: "#5a5a72", dot: "#5a5a72" },
};

const SENTIMENT_CONFIG: Record<string, { color: string; label: string }> = {
  positive: { color: "#34d399", label: "Happy" },
  neutral: { color: "#8b8b9e", label: "Neutral" },
  negative: { color: "#ffb347", label: "Unhappy" },
  frustrated: { color: "#ff4d6a", label: "Frustrated" },
};

const CHANNEL_ICONS: Record<string, string> = {
  email: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
  chat: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
  phone: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
  sms: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z",
};

function filterEmails(emails: EnrichedEmail[], tab: TabKey): EnrichedEmail[] {
  switch (tab) {
    case "pending":
      return emails.filter((e) => e.status === "pending");
    case "sent":
      return emails.filter((e) => e.status === "sent");
    case "urgent":
      return emails.filter((e) => e.priority === "urgent");
    case "auto-resolved":
      return emails.filter((e) => e.status === "rejected");
    case "needs-review":
      return emails.filter((e) => e.priority === "urgent" && e.status === "pending");
    case "all":
    default:
      return emails;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

interface TicketListProps {
  emails: EnrichedEmail[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  tab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export default function TicketList({
  emails,
  selectedId,
  onSelect,
  tab,
  onTabChange,
}: TicketListProps) {
  const filtered = filterEmails(emails, tab);

  return (
    <div
      className="flex shrink-0 flex-col"
      style={{
        width: "var(--ticket-list-width)",
        background: "var(--card)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-[var(--foreground)]">
            Conversations
            <span className="ml-2 text-[12px] font-medium text-[var(--foreground-muted)]">
              {filtered.length}
            </span>
          </h2>
          <button className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06]">
            <svg className="h-4 w-4 text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 overflow-x-auto rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.03)" }}>
          {TABS.map((t) => {
            const count = filterEmails(emails, t.key).length;
            return (
              <button
                key={t.key}
                onClick={() => onTabChange(t.key)}
                className={clsx(
                  "flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200",
                  tab === t.key
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-[var(--foreground-muted)] hover:text-white"
                )}
              >
                {t.label}
                {count > 0 && (
                  <span className={clsx(
                    "ml-0.5 text-[10px]",
                    tab === t.key ? "text-[var(--accent)]" : "text-[var(--foreground-muted)] opacity-60"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <InboxEmptyState tab={tab} />
      ) : (
        <div className="flex-1 overflow-y-auto pt-1">
          {filtered.map((email, i) => {
            const selected = email.id === selectedId;
            const slaBreached = email.slaMinutesRemaining < 0;
            const snippet =
              email.bodyPlain.length > 70
                ? email.bodyPlain.slice(0, 70) + "..."
                : email.bodyPlain;
            const channelPath = CHANNEL_ICONS[email.channel] || CHANNEL_ICONS.email;
            const priority = PRIORITY_CONFIG[email.priority] || PRIORITY_CONFIG.normal;
            const sentiment = SENTIMENT_CONFIG[email.sentiment] || SENTIMENT_CONFIG.neutral;

            return (
              <button
                key={email.id}
                onClick={() => onSelect(email.id)}
                className={clsx(
                  "group relative flex w-full gap-3 px-4 py-3 text-left transition-all duration-150 animate-fade-in",
                  selected
                    ? "bg-[var(--accent-muted)]"
                    : "hover:bg-white/[0.02]",
                )}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Selection indicator */}
                {selected && (
                  <div
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                    style={{ background: "var(--accent-gradient)" }}
                  />
                )}

                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className={clsx(
                      "flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-bold text-white ring-2 ring-transparent transition-all",
                      email.customerProfile.avatarColor,
                      selected && "ring-[var(--accent)]/30"
                    )}
                  >
                    {email.customerProfile.avatarInitials}
                  </div>
                  {/* Sentiment dot */}
                  <div
                    className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2"
                    style={{
                      background: sentiment.color,
                      boxShadow: `0 0 0 2px var(--card)`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold text-[var(--foreground)]">
                      {email.customerProfile.name}
                    </span>
                    <span className="shrink-0 text-[11px] text-[var(--foreground-muted)]">
                      {timeAgo(email.receivedAt)}
                    </span>
                  </div>

                  <p className="truncate text-[12px] font-medium text-[var(--foreground)] opacity-70 mt-0.5">
                    {email.subject || "(no subject)"}
                  </p>

                  <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--foreground-muted)]">
                    {snippet}
                  </p>

                  {/* Meta row */}
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {/* Priority badge */}
                    <span
                      className="rounded-[4px] px-1.5 py-[1px] text-[10px] font-bold uppercase tracking-wide"
                      style={{ background: priority.bg, color: priority.text }}
                    >
                      {email.priority}
                    </span>

                    {/* Channel icon */}
                    <svg className="h-3 w-3 text-[var(--foreground-muted)] opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={channelPath} />
                    </svg>

                    {/* SLA */}
                    {email.status === "pending" && (
                      <span
                        className={clsx(
                          "flex items-center gap-0.5 text-[10px] font-medium",
                          slaBreached ? "text-[var(--danger)]" : "text-[var(--foreground-muted)] opacity-60"
                        )}
                      >
                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {slaBreached
                          ? `${Math.abs(email.slaMinutesRemaining)}m over`
                          : `${email.slaMinutesRemaining}m`}
                      </span>
                    )}

                    {/* AI confidence */}
                    <span className="ml-auto flex items-center gap-0.5 text-[10px] font-medium text-[var(--accent)] opacity-70">
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      {email.aiInsight.confidence}%
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
