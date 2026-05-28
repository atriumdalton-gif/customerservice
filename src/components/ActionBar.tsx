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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/95 px-4 pb-[env(safe-area-inset-bottom,8px)] pt-3 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95">
      <div className="mx-auto flex max-w-lg flex-col gap-2">
        <button
          onClick={() => updateStatus("sent", draftText)}
          disabled={loading !== null}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-emerald-600 text-base font-semibold text-white transition-colors hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50"
        >
          {loading === "sent" ? (
            <span className="animate-pulse">Sending...</span>
          ) : isEdited ? (
            <>
              <span className="mr-2">&#9998;&#65039;</span> Edit & Send
            </>
          ) : (
            <>
              <span className="mr-2">&#x1F7E2;</span> Approve & Send
            </>
          )}
        </button>
        <button
          onClick={() => updateStatus("rejected")}
          disabled={loading !== null}
          className="flex h-11 w-full items-center justify-center rounded-xl border border-red-200 bg-white text-sm font-medium text-red-600 transition-colors hover:bg-red-50 active:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950"
        >
          {loading === "rejected" ? (
            <span className="animate-pulse">Rejecting...</span>
          ) : (
            <>
              <span className="mr-2">&#x1F534;</span> Reject
            </>
          )}
        </button>
      </div>
    </div>
  );
}
