"use client";

type Status = "pending" | "sent" | "rejected";

const config: Record<Status, { label: string; emoji: string; className: string }> = {
  pending: {
    label: "Pending",
    emoji: "\uD83D\uDFE1",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  sent: {
    label: "Sent",
    emoji: "\u2705",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  rejected: {
    label: "Rejected",
    emoji: "\u274C",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = config[status as Status] ?? config.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.className}`}
    >
      <span>{s.emoji}</span>
      {s.label}
    </span>
  );
}
