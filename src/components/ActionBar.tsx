"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ActionBarProps {
  emailId: string;
  fromName: string | null;
  currentStatus: string;
  draftText: string;
  originalDraft: string;
  draftId: string;
  onToast: (message: string) => void;
}

export default function ActionBar({
  emailId,
  fromName,
  currentStatus,
  draftText,
  originalDraft,
  draftId,
  onToast,
}: ActionBarProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const isEdited = draftText !== originalDraft;
  const isPending = currentStatus === "pending";

  async function updateStatus(status: string, finalText?: string) {
    setLoading(status);
    try {
      const body: Record<string, string> = { status };
      if (finalText) {
        body.finalSentText = finalText;
        body.draftId = draftId;
        body.wasEdited = isEdited ? "true" : "false";
      }

      const res = await fetch(`/api/emails/${emailId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to update");

      const name = fromName || "sender";
      if (status === "sent") {
        onToast(`Reply sent to ${name}`);
      } else {
        onToast(`Email rejected`);
      }

      setTimeout(() => router.push("/inbox"), 500);
    } catch {
      onToast("Something went wrong. Try again.");
      setLoading(null);
    }
  }

  if (!isPending) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--card)]/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg gap-3">
        <button
          onClick={() => updateStatus("rejected")}
          disabled={loading !== null}
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-500 transition-all hover:bg-red-100 active:scale-95 disabled:opacity-50 dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
        >
          {loading === "rejected" ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-300 border-t-red-500" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          )}
        </button>
        <button
          onClick={() => updateStatus("sent", draftText)}
          disabled={loading !== null}
          className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-[15px] font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-50"
        >
          {loading === "sent" ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              {isEdited ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                </svg>
              )}
              {isEdited ? "Edit & Send" : "Approve & Send"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
