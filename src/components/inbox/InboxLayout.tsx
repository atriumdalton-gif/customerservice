"use client";

import { useState, useEffect, useCallback } from "react";
import type { Email, EnrichedEmail, Priority, Sentiment, Channel } from "@/types/email";
import { enrichEmail, computeStats } from "@/lib/mockEnrich";
import StatStrip from "./StatStrip";
import TicketList, { type TabKey } from "./TicketList";
import ConversationView from "./ConversationView";
import CopilotPanel from "./CopilotPanel";

export default function InboxLayout() {
  const [emails, setEmails] = useState<EnrichedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("all");

  useEffect(() => {
    let cancelled = false;

    async function fetchEmails() {
      try {
        const res = await fetch("/api/emails?status=all");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const rawEmails: Email[] = Array.isArray(data) ? data : [];

        if (cancelled) return;

        const enriched = rawEmails.map((email) => {
          const base = enrichEmail(email);
          // Prefer DB-persisted classification over client-side mock
          if (email.priority) base.priority = email.priority as Priority;
          if (email.sentiment) base.sentiment = email.sentiment as Sentiment;
          if (email.channel) base.channel = email.channel as Channel;
          if (email.tags && email.tags.length > 0) base.tags = email.tags;
          return base;
        });
        setEmails(enriched);
        if (enriched.length > 0) {
          setSelectedId(enriched[0].id);
        }
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchEmails();
    return () => { cancelled = true; };
  }, []);

  const handleApprove = useCallback(
    async (id: string, draftId: string, text: string, wasEdited: boolean) => {
      try {
        await fetch(`/api/emails/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "sent",
            draftId,
            finalSentText: text,
            wasEdited: String(wasEdited),
          }),
        });
        setEmails((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: "sent" } : e))
        );
      } catch {
        // Silent
      }
    },
    []
  );

  const handleReject = useCallback(async (id: string) => {
    try {
      await fetch(`/api/emails/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      setEmails((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "rejected" } : e))
      );
    } catch {
      // Silent
    }
  }, []);

  const stats = computeStats(emails);
  const selectedEmail = emails.find((e) => e.id === selectedId);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="relative">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          />
          <div
            className="absolute inset-0 rounded-full opacity-20 blur-lg animate-pulse"
            style={{ background: "var(--accent)" }}
          />
        </div>
        <p className="text-[13px] text-[var(--foreground-muted)]">Loading inbox...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: "rgba(255,77,106,0.12)" }}
          >
            <svg className="h-6 w-6" style={{ color: "var(--danger)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
          </div>
          <p className="text-[13px] font-semibold text-[var(--foreground)]">Failed to load inbox</p>
          <p className="mt-1 text-[12px] text-[var(--foreground-muted)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <StatStrip stats={stats} />

      <div className="flex flex-1 overflow-hidden">
        <TicketList
          emails={emails}
          selectedId={selectedId}
          onSelect={setSelectedId}
          tab={tab}
          onTabChange={setTab}
        />

        {selectedEmail ? (
          <>
            <ConversationView
              email={selectedEmail}
              onApprove={handleApprove}
              onReject={handleReject}
            />
            <CopilotPanel email={selectedEmail} />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div
                className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(124,92,252,0.1) 0%, rgba(79,143,255,0.06) 100%)",
                  border: "1px solid rgba(124, 92, 252, 0.12)",
                }}
              >
                <svg className="h-7 w-7" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-[var(--foreground)]">
                Select a conversation
              </p>
              <p className="mt-1 text-[12px] text-[var(--foreground-muted)]">
                Choose a ticket from the list to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
