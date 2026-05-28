"use client";

import Link from "next/link";
import StatusBadge from "./StatusBadge";

function timeAgo(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
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
  const preview = bodyPlain.replace(/\n/g, " ").slice(0, 120);

  return (
    <Link href={`/email/${id}`}>
      <div className="group rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md active:scale-[0.98] dark:bg-zinc-900 dark:shadow-zinc-800/20">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {fromName || fromAddress}
              </p>
              <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                {timeAgo(receivedAt)}
              </span>
            </div>
            {fromName && (
              <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">
                {fromAddress}
              </p>
            )}
          </div>
          <StatusBadge status={status} />
        </div>
        <p className="mt-1.5 truncate text-sm font-bold text-zinc-800 dark:text-zinc-200">
          {subject || "(no subject)"}
        </p>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {preview}
        </p>
      </div>
    </Link>
  );
}
