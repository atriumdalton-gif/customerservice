"use client";

import { useState, useEffect, useCallback } from "react";
import type { Email, EnrichedEmail } from "@/types/email";
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

        const enriched = rawEmails.map(enrichEmail);
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
        // Silent — could add toast later
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
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <p className="text-sm text-slate-500">Loading inbox...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-red-500">Failed to load inbox: {error}</p>
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
            <p className="text-sm text-slate-400">
              Select a ticket to view the conversation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
