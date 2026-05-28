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

  return (
    <div className="mx-auto min-h-screen w-full max-w-lg pb-36">
      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90">
        <button
          onClick={() => router.push("/inbox")}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
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
          <h1 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {email.subject || "(no subject)"}
          </h1>
        </div>
        <StatusBadge status={email.status} />
      </header>

      <div className="space-y-3 p-4">
        {/* Original email card */}
        <div className="rounded-xl bg-white shadow-sm dark:bg-zinc-900">
          <button
            onClick={() => setEmailExpanded(!emailExpanded)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Original Email
              </p>
              <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                From: {email.fromName || email.fromAddress}{" "}
                {email.fromName && `<${email.fromAddress}>`}
              </p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${
                emailExpanded ? "rotate-180" : ""
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
          {emailExpanded && (
            <div className="border-t border-zinc-100 px-4 pb-4 pt-3 dark:border-zinc-800">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {email.subject}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {email.bodyPlain}
              </p>
            </div>
          )}
        </div>

        {/* Draft reply card */}
        {draft && (
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {isSent ? "Sent Reply" : "Draft Reply"}
              </p>
              {isPending && (
                <button
                  onClick={() =>
                    setToast("Regenerate coming soon!")
                  }
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
                >
                  &#8635; Regenerate
                </button>
              )}
            </div>

            {isPending ? (
              <>
                <textarea
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  className="mt-3 w-full rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-800 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:border-blue-500 dark:focus:ring-blue-900"
                  rows={12}
                />
                <p className="mt-1.5 text-right text-xs text-zinc-400">
                  {draftText.length} characters
                </p>
              </>
            ) : (
              <div className="mt-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {displayText}
                </p>
                {isSent && draft.wasEdited && (
                  <p className="mt-2 text-xs italic text-zinc-400">
                    Edited before sending
                  </p>
                )}
              </div>
            )}
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
