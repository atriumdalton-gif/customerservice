"use client";

import { useState } from "react";
import clsx from "clsx";
import type { EnrichedEmail } from "@/types/email";

interface ConversationViewProps {
  email: EnrichedEmail;
  onApprove: (id: string, draftId: string, text: string, wasEdited: boolean) => void;
  onReject: (id: string) => void;
}

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

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-5 py-3">
        <div className="min-w-0 flex-1 pr-4">
          <h2 className="truncate text-base font-bold text-[var(--foreground)]">
            {email.subject || "(no subject)"}
          </h2>
          <p className="text-sm text-slate-500">{email.fromAddress}</p>
        </div>
        <div className="flex gap-1.5">
          {[
            { label: "Assign", icon: "M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" },
            { label: "Escalate", icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" },
            { label: "Close", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          ].map((action) => (
            <button
              key={action.label}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-white/8 dark:text-slate-300 dark:hover:bg-white/12"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
              </svg>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {/* Customer message */}
        <div className="flex gap-3">
          <div
            className={clsx(
              "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white",
              email.customerProfile.avatarColor
            )}
          >
            {email.customerProfile.avatarInitials}
          </div>
          <div className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[var(--foreground)]">
                {email.customerProfile.name}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(email.receivedAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {email.bodyPlain}
            </p>
          </div>
        </div>

        {/* Internal note */}
        <div className="ml-11 rounded-xl border border-amber-200/50 bg-amber-50 p-3.5 dark:border-amber-500/20 dark:bg-amber-500/8">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Internal Note
          </p>
          <p className="text-[13px] leading-relaxed text-amber-900 dark:text-amber-200">
            AI classified as {email.priority} priority with {email.sentiment} sentiment.
            Suggested action: {email.aiInsight.suggestedAction}
          </p>
        </div>

        {/* AI Draft */}
        <div className="ml-11 space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-purple-500/10 px-2.5 py-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
              AI Draft
            </span>
            <span className="text-xs text-slate-400">
              {email.aiInsight.confidence}% confidence
            </span>
          </div>

          {editing ? (
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              autoFocus
              className="w-full rounded-2xl border-2 border-purple-500 bg-[var(--card)] p-4 text-sm leading-relaxed text-[var(--foreground)] outline-none"
              rows={6}
            />
          ) : (
            <div className="rounded-2xl border border-purple-500/15 bg-purple-500/[0.03] p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {draftText || "No AI draft available for this ticket."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-t border-[var(--border)] bg-[var(--card)] px-4 py-3">
        <button
          onClick={() => {
            if (draft) onApprove(email.id, draft.id, draftText, wasEdited);
          }}
          disabled={!draft || email.status !== "pending"}
          className="flex items-center gap-1.5 rounded-[10px] bg-[var(--accent)] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-40"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          Approve &amp; Send
        </button>

        <button
          onClick={() => setEditing((e) => !e)}
          className="flex items-center gap-1.5 rounded-[10px] bg-slate-100 px-3 py-2.5 text-[13px] font-medium text-[var(--accent)] transition-colors hover:bg-slate-200 dark:bg-white/8 dark:hover:bg-white/12"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          {editing ? "Done" : "Edit Draft"}
        </button>

        <button
          onClick={() => setDraftText(draft?.originalDraft || "")}
          className="flex items-center gap-1.5 rounded-[10px] bg-slate-100 px-3 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-white/8 dark:text-slate-300 dark:hover:bg-white/12"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Regenerate
        </button>

        <button
          onClick={() => onReject(email.id)}
          disabled={email.status !== "pending"}
          className="ml-auto flex items-center gap-1.5 rounded-[10px] bg-red-500/8 px-3 py-2.5 text-[13px] font-medium text-red-500 transition-colors hover:bg-red-500/15 disabled:opacity-40"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Reject
        </button>
      </div>
    </div>
  );
}
