"use client";

import { useState } from "react";

interface AddConnectionDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function AddConnectionDialog({ open, onClose, onCreated }: AddConnectionDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create connection");
        return;
      }

      setCreatedKey(data.apiKey);
      onCreated();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopy() {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleClose() {
    setName("");
    setSlug("");
    setError(null);
    setCreatedKey(null);
    setCopied(false);
    onClose();
  }

  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/webhook/ingest`
    : "/api/webhook/ingest";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl bg-[#1a1a2e] p-6 shadow-2xl border border-white/10">
        {createdKey ? (
          <>
            <h2 className="text-lg font-semibold text-white mb-1">Connection Created</h2>
            <p className="text-sm text-slate-400 mb-4">
              Copy this API key now — it won&apos;t be shown again.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-400 mb-1">API Key</label>
              <div className="flex gap-2">
                <code className="flex-1 rounded-md bg-black/40 px-3 py-2 text-sm text-emerald-400 font-mono break-all">
                  {createdKey}
                </code>
                <button
                  onClick={handleCopy}
                  className="rounded-md bg-purple-500/20 px-3 py-2 text-xs font-medium text-purple-300 hover:bg-purple-500/30 transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-400 mb-1">Webhook URL</label>
              <code className="block rounded-md bg-black/40 px-3 py-2 text-sm text-slate-300 font-mono break-all">
                {webhookUrl}
              </code>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-400 mb-1">Example curl</label>
              <code className="block rounded-md bg-black/40 px-3 py-2 text-xs text-slate-300 font-mono whitespace-pre-wrap break-all">
{`curl -X POST ${webhookUrl} \\
  -H "Authorization: Bearer ${createdKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"fromAddress":"user@example.com","bodyPlain":"Hello"}'`}
              </code>
            </div>

            <button
              onClick={handleClose}
              className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-white mb-4">Add Connection</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Doorknockr Production"
                  required
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="e.g. doorknockr-prod"
                  required
                  pattern="^[a-z0-9-]+$"
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white font-mono placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-500">Lowercase, numbers, dashes only</p>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !name || !slug}
                  className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
