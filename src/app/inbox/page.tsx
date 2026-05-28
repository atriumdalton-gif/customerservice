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

  const tabs: { key: Tab; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "sent", label: "Sent" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Inbox Copilot
            </h1>
            {tab === "pending" && pendingCount > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">
                {pendingCount}
              </span>
            )}
          </div>
          <Link
            href="/history"
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            History
          </Link>
        </div>

        {/* Tabs */}
        <div className="mt-3 flex gap-1 rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Pull to refresh */}
      <div className="px-4 pt-1">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-full py-2 text-center text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          {refreshing ? "Refreshing..." : "Pull to refresh"}
        </button>
      </div>

      {/* Email list */}
      <div className="flex-1 px-4 pb-6">
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
          <div className="space-y-3">
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
