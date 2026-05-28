"use client";

import { useState, useEffect, useCallback } from "react";
import ConnectionsTable, { type ConnectionRow } from "@/components/connections/ConnectionsTable";
import AddConnectionDialog from "@/components/connections/AddConnectionDialog";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<ConnectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/connections");
      if (res.ok) {
        const data = await res.json();
        setConnections(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  async function handleToggle(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/connections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (res.ok) {
        setConnections((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive } : c))
        );
      }
    } catch {
      // silent
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <p className="text-sm text-slate-500">Loading connections...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Connections</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage inbound sources that send messages to your inbox.
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
        >
          Add Connection
        </button>
      </div>

      <div className="rounded-xl border border-white/8 bg-[#1a1a2e]/60">
        <ConnectionsTable connections={connections} onToggle={handleToggle} />
      </div>

      <AddConnectionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={fetchConnections}
      />
    </div>
  );
}
