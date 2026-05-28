"use client";

import Link from "next/link";
import StatusBadge from "./StatusBadge";

function timeAgo(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.split(" ");
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

const avatarColors = [
  "bg-blue-500", "bg-violet-500", "bg-rose-500", "bg-amber-500",
  "bg-emerald-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

interface EmailCardProps {
  id: string;
  fromName: string | null;
  fromAddress: string;
  subject: string | null;
  bodyPlain: string;
  receivedAt: string | Date;
  status: string;
}

export default function EmailCard({
  id,
  fromName,
  fromAddress,
  subject,
  bodyPlain,
  receivedAt,
  status,
}: EmailCardProps) {
  const preview = bodyPlain.replace(/\n/g, " ").slice(0, 100);
  const displayName = fromName || fromAddress.split("@")[0];
  const initials = getInitials(fromName, fromAddress);
  const colorClass = getAvatarColor(fromAddress);
  const isPending = status === "pending";

  return (
    <Link href={`/email/${id}`}>
      <div
        className={`group relative rounded-2xl border bg-[var(--card)] p-4 transition-all duration-200 hover:bg-[var(--card-hover)] hover:shadow-md active:scale-[0.98] ${
          isPending
            ? "border-[var(--border)] shadow-sm"
            : "border-transparent opacity-75 hover:opacity-100"
        }`}
      >
        {/* Pending indicator line */}
        {isPending && (
          <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-[var(--accent)]" />
        )}

        <div className="flex gap-3.5">
          {/* Avatar */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${colorClass}`}
          >
            {initials}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[15px] font-semibold text-[var(--foreground)]">
                {displayName}
              </p>
              <span className="shrink-0 text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                {timeAgo(receivedAt)}
              </span>
            </div>

            <p className="mt-0.5 truncate text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
              {subject || "(no subject)"}
            </p>

            <p className="mt-1 line-clamp-2 text-[13px] leading-[1.4] text-zinc-400 dark:text-zinc-500">
              {preview}
            </p>

            <div className="mt-2.5">
              <StatusBadge status={status} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
