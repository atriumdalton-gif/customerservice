"use client";

import { useState } from "react";
import clsx from "clsx";
import type { EnrichedEmail } from "@/types/email";

interface ConversationViewProps {
  email: EnrichedEmail;
  onApprove: (id: string, draftId: string, text: string, wasEdited: boolean) => void;
  onReject: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Open", color: "#4f8fff", bg: "rgba(79,143,255,0.12)" },
  sent: { label: "Sent", color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  rejected: { label: "Closed", color: "#8b8b9e", bg: "rgba(139,139,158,0.12)" },
};

export default function ConversationView({
  email,
  onApprove,
  onReject,
}: ConversationViewProps) {
  const draft = email.drafts?.[0];
  const [draftText, setDraftText] = useState(draft?.originalDraft || "");
  const [editing, setEditing] = useState(false);

  const [prevId, setPrevId] = useState(email.id);
  if (email.id !== prevId) {
    setPrevId(email.id);
    setDraftText(draft?.originalDraft || "");
    setEditing(false);
  }

  const wasEdited = draftText !== (draft?.originalDraft || "");
  const status = STATUS_CONFIG[email.status] || STATUS_CONFIG.pending;

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ background: "var(--background-secondary)" }}>
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-5 py-3"
        style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="min-w-0 flex-1 pr-4">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-[15px] font-bold text-[var(--foreground)]">
              {email.subject || "(no subject)"}
            </h2>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: status.bg, color: status.color }}
            >
              {status.label}
            </span>
          </div>
          <p className="text-[12px] text-[var(--foreground-muted)] mt-0.5">
            {email.fromAddress}
            <span className="mx-1.5 opacity-30">|</span>
            <span className="text-[var(--foreground-muted)]">
              {new Date(email.receivedAt).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex gap-1">
          {[
            {
              label: "Assign",
              icon: "M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z",
            },
            {
              label: "Escalate",
              icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
            },
            {
              label: "Merge",
              icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
            },
          ].map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-[var(--foreground-muted)] transition-all duration-200 hover:bg-white/[0.06] hover:text-white"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
              </svg>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {/* Customer message */}
        <div className="flex gap-3 animate-fade-in">
          <div
            className={clsx(
              "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-lg",
              email.customerProfile.avatarColor
            )}
          >
            {email.customerProfile.avatarInitials}
          </div>
          <div className="flex-1">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-[13px] font-semibold text-[var(--foreground)]">
                {email.customerProfile.name}
              </span>
              <span className="text-[11px] text-[var(--foreground-muted)]">
                {new Date(email.receivedAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div
              className="rounded-2xl rounded-tl-md p-4 shadow-sm"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--foreground)] opacity-90">
                {email.bodyPlain}
              </p>
            </div>
          </div>
        </div>

        {/* AI analysis note */}
        <div className="ml-12 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div
            className="rounded-xl p-3"
            style={{
              background: "rgba(124, 92, 252, 0.06)",
              border: "1px solid rgba(124, 92, 252, 0.12)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg className="h-3.5 w-3.5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                AI Analysis
              </span>
            </div>
            <p className="text-[12px] leading-relaxed text-[var(--foreground)] opacity-70">
              Classified as <strong className="text-[var(--foreground)]">{email.priority}</strong> priority
              with <strong className="text-[var(--foreground)]">{email.sentiment}</strong> sentiment.
              Recommended action: {email.aiInsight.suggestedAction}
            </p>
          </div>
        </div>

        {/* AI Draft response */}
        <div className="flex gap-3 animate-fade-in" style={{ animationDelay: "200ms" }}>
          {/* AI avatar */}
          <div
            className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-lg"
            style={{ background: "var(--accent-gradient)" }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-[13px] font-semibold gradient-text">AI Copilot</span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{
                  background: "rgba(124, 92, 252, 0.12)",
                  color: "var(--accent)",
                }}
              >
                {email.aiInsight.confidence}% confident
              </span>
            </div>

            {editing ? (
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                autoFocus
                className="w-full rounded-2xl rounded-tl-md p-4 text-[13px] leading-relaxed outline-none"
                style={{
                  background: "var(--card)",
                  border: "2px solid var(--accent)",
                  color: "var(--foreground)",
                }}
                rows={6}
              />
            ) : (
              <div
                className="rounded-2xl rounded-tl-md p-4 shadow-sm"
                style={{
                  background: "linear-gradient(135deg, rgba(124,92,252,0.06) 0%, rgba(79,143,255,0.04) 100%)",
                  border: "1px solid rgba(124, 92, 252, 0.15)",
                }}
              >
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--foreground)] opacity-90">
                  {draftText || "No AI draft available for this ticket."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action toolbar */}
      <div
        className="flex shrink-0 items-center gap-2 px-4 py-3"
        style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }}
      >
        {/* Primary: Approve & Send */}
        <button
          onClick={() => {
            if (draft) onApprove(email.id, draft.id, draftText, wasEdited);
          }}
          disabled={!draft || email.status !== "pending"}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: "var(--accent-gradient)" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          Approve &amp; Send
        </button>

        {/* Edit */}
        <button
          onClick={() => setEditing((e) => !e)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 hover:bg-white/[0.08]"
          style={{ color: "var(--accent)" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          {editing ? "Done" : "Edit"}
        </button>

        {/* Regenerate */}
        <button
          onClick={() => setDraftText(draft?.originalDraft || "")}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-[var(--foreground-muted)] transition-all duration-200 hover:bg-white/[0.06] hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Regenerate
        </button>

        {/* Spacer + Reject */}
        <div className="flex-1" />
        <button
          onClick={() => onReject(email.id)}
          disabled={email.status !== "pending"}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--danger)]/10"
          style={{ color: "var(--danger)" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Reject
        </button>
      </div>
    </div>
  );
}
