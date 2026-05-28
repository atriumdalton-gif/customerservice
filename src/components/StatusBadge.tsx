"use client";

type Status = "pending" | "sent" | "rejected";

const config: Record<Status, { label: string; dotClass: string; bgClass: string; textClass: string }> = {
  pending: {
    label: "Pending",
    dotClass: "bg-amber-400",
    bgClass: "bg-amber-50 dark:bg-amber-500/10",
    textClass: "text-amber-700 dark:text-amber-400",
  },
  sent: {
    label: "Sent",
    dotClass: "bg-emerald-400",
    bgClass: "bg-emerald-50 dark:bg-emerald-500/10",
    textClass: "text-emerald-700 dark:text-emerald-400",
  },
  rejected: {
    label: "Rejected",
    dotClass: "bg-red-400",
    bgClass: "bg-red-50 dark:bg-red-500/10",
    textClass: "text-red-700 dark:text-red-400",
  },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = config[status as Status] ?? config.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${s.bgClass} ${s.textClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dotClass}`} />
      {s.label}
    </span>
  );
}
