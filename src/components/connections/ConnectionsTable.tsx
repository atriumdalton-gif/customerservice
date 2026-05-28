"use client";

import clsx from "clsx";

export interface ConnectionRow {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  lastEventAt: string | null;
  _count: { emails: number };
}

interface ConnectionsTableProps {
  connections: ConnectionRow[];
  onToggle: (id: string, isActive: boolean) => void;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ConnectionsTable({ connections, onToggle }: ConnectionsTableProps) {
  if (connections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <p className="text-sm">No connections yet. Add one to start receiving messages.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Slug</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Last Event</th>
            <th className="px-4 py-3">Emails</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {connections.map((conn) => (
            <tr
              key={conn.id}
              className="border-b border-white/5 hover:bg-white/3 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-white">{conn.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-400">{conn.slug}</td>
              <td className="px-4 py-3">
                <span
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                    conn.isActive
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-slate-500/15 text-slate-400"
                  )}
                >
                  <span
                    className={clsx(
                      "h-1.5 w-1.5 rounded-full",
                      conn.isActive ? "bg-emerald-400" : "bg-slate-400"
                    )}
                  />
                  {conn.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-400">{timeAgo(conn.lastEventAt)}</td>
              <td className="px-4 py-3 text-slate-300">{conn._count.emails}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onToggle(conn.id, !conn.isActive)}
                  className={clsx(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    conn.isActive
                      ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                      : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                  )}
                >
                  {conn.isActive ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
