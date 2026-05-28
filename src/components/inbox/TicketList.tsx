import clsx from "clsx";
import type { EnrichedEmail } from "@/types/email";
import InboxEmptyState from "./InboxEmptyState";

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "sent", label: "Sent" },
  { key: "all", label: "All" },
  { key: "urgent", label: "Urgent" },
  { key: "auto-resolved", label: "Auto-Resolved" },
  { key: "needs-review", label: "Needs Review" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-red-500/10 text-red-600",
  high: "bg-amber-500/10 text-amber-600",
  normal: "bg-blue-500/10 text-blue-600",
  low: "bg-slate-500/10 text-slate-500",
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "bg-emerald-500",
  neutral: "bg-slate-400",
  negative: "bg-amber-500",
  frustrated: "bg-red-500",
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
    <div className="flex w-80 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)]">
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-[var(--border)] px-3 py-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={clsx(
              "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t.key
                ? "bg-[var(--accent-light)] text-[var(--accent)]"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <InboxEmptyState tab={tab} />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {filtered.map((email) => {
            const selected = email.id === selectedId;
            const slaBreached = email.slaMinutesRemaining < 0;
            const snippet =
              email.bodyPlain.length > 80
                ? email.bodyPlain.slice(0, 80) + "..."
                : email.bodyPlain;
            const channelPath = CHANNEL_ICONS[email.channel] || CHANNEL_ICONS.email;

            return (
              <button
                key={email.id}
                onClick={() => onSelect(email.id)}
                className={clsx(
                  "flex w-full gap-3 border-b border-[var(--border)]/50 p-3.5 text-left transition-colors",
                  selected
                    ? "border-l-[3px] border-l-[var(--accent)] bg-[var(--accent-light)]"
                    : "hover:bg-[var(--card-hover)]"
                )}
              >
                {/* Avatar */}
                <div
                  className={clsx(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                    email.customerProfile.avatarColor
                  )}
                >
                  {email.customerProfile.avatarInitials}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-[13px] font-semibold text-[var(--foreground)]">
                      {email.customerProfile.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d={channelPath} />
                      </svg>
                      <span className={clsx("h-2 w-2 rounded-full", SENTIMENT_COLORS[email.sentiment])} />
                    </div>
                  </div>

                  <p className="truncate text-[13px] font-medium text-slate-700 dark:text-slate-300">
                    {email.subject || "(no subject)"}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">
                    {snippet}
                  </p>

                  {/* Footer: priority + SLA */}
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={clsx(
                        "rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize",
                        PRIORITY_STYLES[email.priority]
                      )}
                    >
                      {email.priority}
                    </span>

                    {email.status === "pending" ? (
                      <span
                        className={clsx(
                          "flex items-center gap-1 text-[11px]",
                          slaBreached ? "font-semibold text-red-500" : "text-slate-400"
                        )}
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {slaBreached
                          ? `${Math.abs(email.slaMinutesRemaining)}m overdue`
                          : `${email.slaMinutesRemaining}m left`}
                      </span>
                    ) : (
                      <span className="text-[11px] capitalize text-slate-400">
                        {email.status}
                      </span>
                    )}
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
