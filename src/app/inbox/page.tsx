"use client";

import { useEffect, useState, useCallback } from "react";
import EmailCard from "@/components/EmailCard";
import EmptyState from "@/components/EmptyState";
import { InboxSkeleton } from "@/components/LoadingSkeleton";
import Link from "next/link";

type Tab = "pending" | "sent" | "all";

interface Email {
  id: string;
  fromAddress: string;
  fromName: string | null;
  subject: string | null;
  bodyPlain: string;
  receivedAt: string;
  status: string;
}

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pending");
  const [refreshing, setRefreshing] = useState(false);

  const fetchEmails = useCallback(async (status: Tab) => {
    const res = await fetch(`/api/emails?status=${status}`);
    const data = await res.json();
    setEmails(data);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchEmails(tab).finally(() => setLoading(false));
  }, [tab, fetchEmails]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEmails(tab);
    setRefreshing(false);
  };

  const pendingCount = emails.filter((e) => e.status === "pending").length;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "pending", label: "Pending", count: tab === "pending" ? pendingCount : undefined },
    { key: "sent", label: "Sent" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/90 px-5 pb-0 pt-[env(safe-area-inset-top,12px)] backdrop-blur-xl">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="h-5 w-5">
                <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
              </svg>
            </div>
            <h1 className="text-[22px] font-bold tracking-tight text-[var(--foreground)]">
              Inbox
            </h1>
          </div>
          <Link
            href="/history"
            className="flex h-9 items-center rounded-lg px-3 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mr-1.5 h-4 w-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
            </svg>
            History
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/80">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative flex-1 rounded-[10px] px-3 py-2 text-[13px] font-semibold transition-all duration-200 ${
                tab === t.key
                  ? "bg-white text-[var(--foreground)] shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="ml-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Subtle divider */}
        <div className="mt-3 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-700" />
      </header>

      {/* Refresh button */}
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="mx-5 mt-1 flex items-center justify-center gap-1.5 py-2 text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
        >
          <path fillRule="evenodd" d="M13.836 2.477a.75.75 0 01.75.75v3.182a.75.75 0 01-.75.75h-3.182a.75.75 0 010-1.5h1.37l-.84-.841a4.5 4.5 0 00-7.08.681.75.75 0 01-1.3-.75 6 6 0 019.44-.908l.987.987V3.227a.75.75 0 01.75-.75zm-1.7 8.335a.75.75 0 01.274 1.025 6 6 0 01-9.44.908l-.987-.987v1.773a.75.75 0 01-1.5 0V10.35a.75.75 0 01.75-.75h3.182a.75.75 0 010 1.5h-1.37l.84.841a4.5 4.5 0 007.08-.681.75.75 0 011.025-.274l.146-.084z" clipRule="evenodd" />
        </svg>
        {refreshing ? "Refreshing..." : "Refresh"}
      </button>

      {/* Email list */}
      <div className="flex-1 px-4 pb-8">
        {loading ? (
          <InboxSkeleton />
        ) : emails.length === 0 ? (
          <EmptyState
            message={
              tab === "pending"
                ? "No emails to review right now."
                : tab === "sent"
                  ? "No sent replies yet."
                  : "No emails found."
            }
          />
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
