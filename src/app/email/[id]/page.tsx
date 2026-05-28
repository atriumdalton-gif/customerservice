"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import ActionBar from "@/components/ActionBar";
import StatusBadge from "@/components/StatusBadge";
import Toast from "@/components/Toast";
import { EmailDetailSkeleton } from "@/components/LoadingSkeleton";

interface Draft {
  id: string;
  originalDraft: string;
  finalSentText: string | null;
  wasEdited: boolean;
}

interface Email {
  id: string;
  fromAddress: string;
  fromName: string | null;
  subject: string | null;
  bodyPlain: string;
  receivedAt: string;
  status: string;
  drafts: Draft[];
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

export default function EmailDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [draftText, setDraftText] = useState("");
  const [emailExpanded, setEmailExpanded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchEmail = useCallback(async () => {
    const res = await fetch(`/api/emails/${id}`);
    if (!res.ok) {
      router.push("/inbox");
      return;
    }
    const data: Email = await res.json();
    setEmail(data);
    const draft = data.drafts[0];
    if (draft) {
      setDraftText(
        data.status === "sent" && draft.finalSentText
          ? draft.finalSentText
          : draft.originalDraft
      );
    }
  }, [id, router]);

  useEffect(() => {
    fetchEmail().finally(() => setLoading(false));
  }, [fetchEmail]);

  if (loading) return <EmailDetailSkeleton />;
  if (!email) return null;

  const draft = email.drafts[0];
  const isPending = email.status === "pending";
  const isSent = email.status === "sent";
  const displayText = isSent && draft?.finalSentText ? draft.finalSentText : draftText;
  const initials = getInitials(email.fromName, email.fromAddress);
  const colorClass = getAvatarColor(email.fromAddress);

  return (
    <div className="mx-auto min-h-screen w-full max-w-lg pb-40">
      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-[var(--background)]/90 px-4 py-3 backdrop-blur-xl">
        <button
          onClick={() => router.push("/inbox")}
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <div className="flex-1 truncate">
          <h1 className="truncate text-[15px] font-semibold text-[var(--foreground)]">
            {email.subject || "(no subject)"}
          </h1>
        </div>
        <StatusBadge status={email.status} />
      </header>

      <div className="space-y-3 px-4 pt-1">
        {/* Original email card */}
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <button
            onClick={() => setEmailExpanded(!emailExpanded)}
            className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-[var(--card-hover)]"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${colorClass}`}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-[var(--foreground)]">
                {email.fromName || email.fromAddress}
              </p>
              <p className="mt-0.5 truncate text-[12px] text-zinc-400 dark:text-zinc-500">
                {email.fromAddress}
              </p>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
                  emailExpanded ? "rotate-180" : ""
                }`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </button>
          <div
            className={`grid transition-all duration-200 ${
              emailExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="border-t border-[var(--border)] px-4 pb-4 pt-3">
                <p className="text-[13px] font-medium text-zinc-600 dark:text-zinc-300">
                  {email.subject}
                </p>
                <p className="mt-2.5 whitespace-pre-wrap text-[13px] leading-[1.6] text-zinc-500 dark:text-zinc-400">
                  {email.bodyPlain}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Draft reply card */}
        {draft && (
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-light)]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="var(--accent)" className="h-3.5 w-3.5">
                    <path d="M13.488 2.513a1.75 1.75 0 00-2.475 0L3.22 10.306a1 1 0 00-.26.445l-.98 3.924a.75.75 0 00.927.927l3.924-.98a1 1 0 00.445-.261l7.793-7.793a1.75 1.75 0 000-2.475l-.58-.58z" />
                  </svg>
                </div>
                <p className="text-[14px] font-semibold text-[var(--foreground)]">
                  {isSent ? "Sent Reply" : "Draft Reply"}
                </p>
              </div>
              {isPending && (
                <button
                  onClick={() => setToast("Regenerate coming soon!")}
                  className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 text-[12px] font-medium text-zinc-500 transition-colors hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M13.836 2.477a.75.75 0 01.75.75v3.182a.75.75 0 01-.75.75h-3.182a.75.75 0 010-1.5h1.37l-.84-.841a4.5 4.5 0 00-7.08.681.75.75 0 01-1.3-.75 6 6 0 019.44-.908l.987.987V3.227a.75.75 0 01.75-.75zm-1.7 8.335a.75.75 0 01.274 1.025 6 6 0 01-9.44.908l-.987-.987v1.773a.75.75 0 01-1.5 0V10.35a.75.75 0 01.75-.75h3.182a.75.75 0 010 1.5h-1.37l.84.841a4.5 4.5 0 007.08-.681.75.75 0 011.025-.274l.146-.084z" clipRule="evenodd" />
                  </svg>
                  Regenerate
                </button>
              )}
            </div>

            <div className="border-t border-[var(--border)] px-4 pb-4 pt-3">
              {isPending ? (
                <>
                  <textarea
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-zinc-50/50 p-3.5 text-[13px] leading-[1.6] text-zinc-800 outline-none transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 dark:bg-zinc-800/50 dark:text-zinc-200"
                    rows={12}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[11px] text-zinc-400">
                      {draftText !== draft.originalDraft && (
                        <span className="text-[var(--accent)] font-medium">Modified</span>
                      )}
                    </p>
                    <p className="text-[11px] tabular-nums text-zinc-400">
                      {draftText.length} chars
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-800/50">
                  <p className="whitespace-pre-wrap text-[13px] leading-[1.6] text-zinc-600 dark:text-zinc-300">
                    {displayText}
                  </p>
                  {isSent && draft.wasEdited && (
                    <p className="mt-3 flex items-center gap-1 text-[11px] text-zinc-400">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                        <path d="M13.488 2.513a1.75 1.75 0 00-2.475 0L3.22 10.306a1 1 0 00-.26.445l-.98 3.924a.75.75 0 00.927.927l3.924-.98a1 1 0 00.445-.261l7.793-7.793a1.75 1.75 0 000-2.475l-.58-.58z" />
                      </svg>
                      Edited before sending
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action bar */}
      {draft && (
        <ActionBar
          emailId={email.id}
          fromName={email.fromName}
          currentStatus={email.status}
          draftText={draftText}
          originalDraft={draft.originalDraft}
          draftId={draft.id}
          onToast={(msg) => setToast(msg)}
        />
      )}
    </div>
  );
}
