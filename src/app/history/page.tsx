"use client";

import { useEffect, useState } from "react";
import EmailCard from "@/components/EmailCard";
import EmptyState from "@/components/EmptyState";
import { InboxSkeleton } from "@/components/LoadingSkeleton";
import Link from "next/link";

interface Email {
  id: string;
  fromAddress: string;
  fromName: string | null;
  subject: string | null;
  bodyPlain: string;
  receivedAt: string;
  status: string;
}

export default function HistoryPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/emails?status=all");
      const data: Email[] = await res.json();
      setEmails(data.filter((e) => e.status === "sent" || e.status === "rejected"));
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/90 px-5 pb-3 pt-[env(safe-area-inset-top,12px)] backdrop-blur-xl">
        <div className="flex items-center gap-3 py-3">
          <Link
            href="/inbox"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-[22px] font-bold tracking-tight text-[var(--foreground)]">
            History
          </h1>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-700" />
      </header>

      {/* Email list */}
      <div className="flex-1 px-4 pb-8 pt-3">
        {loading ? (
          <InboxSkeleton />
        ) : emails.length === 0 ? (
          <EmptyState message="No history yet. Approve or reject some emails first." />
        ) : (
          <div className="space-y-2">
            {emails.map((email) => (
              <EmailCard
                key={email.id}
                id={email.id}
                fromName={email.fromName}
                fromAddress={email.fromAddress}
                subject={email.subject}
                bodyPlain={email.bodyPlain}
                receivedAt={email.receivedAt}
                status={email.status}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
