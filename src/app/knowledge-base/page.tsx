"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import clsx from "clsx";

interface Article {
  id: string;
  title: string;
  body: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "getting-started", label: "Getting Started" },
  { key: "billing", label: "Billing" },
  { key: "features", label: "Features" },
  { key: "troubleshooting", label: "Troubleshooting" },
  { key: "integrations", label: "Integrations" },
  { key: "general", label: "General" },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "getting-started": { bg: "rgba(52,211,153,0.12)", text: "#34d399" },
  billing: { bg: "rgba(255,179,71,0.12)", text: "#ffb347" },
  features: { bg: "rgba(124,92,252,0.12)", text: "#7c5cfc" },
  troubleshooting: { bg: "rgba(255,77,106,0.12)", text: "#ff4d6a" },
  integrations: { bg: "rgba(79,143,255,0.12)", text: "#4f8fff" },
  general: { bg: "rgba(139,139,158,0.12)", text: "#8b8b9e" },
};

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  published: { bg: "rgba(52,211,153,0.12)", text: "#34d399", label: "Published" },
  draft: { bg: "rgba(255,179,71,0.12)", text: "#ffb347", label: "Draft" },
  archived: { bg: "rgba(139,139,158,0.12)", text: "#8b8b9e", label: "Archived" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  // Editor state
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editCategory, setEditCategory] = useState("general");
  const [editStatus, setEditStatus] = useState("published");
  const [saving, setSaving] = useState(false);

  const fetchArticles = useCallback(async () => {
    try {
      const res = await fetch("/api/articles");
      if (res.ok) setArticles(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const filtered = useMemo(() => {
    let result = articles;
    if (category !== "all") result = result.filter((a) => a.category === category);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q));
    }
    return result;
  }, [articles, category, search]);

  const selected = articles.find((a) => a.id === selectedId);

  function openEditor(article?: Article) {
    if (article) {
      setEditId(article.id);
      setEditTitle(article.title);
      setEditBody(article.body);
      setEditCategory(article.category);
      setEditStatus(article.status);
    } else {
      setEditId(null);
      setEditTitle("");
      setEditBody("");
      setEditCategory("general");
      setEditStatus("published");
    }
    setEditorOpen(true);
  }

  async function handleSave() {
    if (!editTitle.trim() || !editBody.trim()) return;
    setSaving(true);
    try {
      const payload = { title: editTitle, body: editBody, category: editCategory, status: editStatus };
      if (editId) {
        await fetch(`/api/articles/${editId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        await fetch("/api/articles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      await fetchArticles();
      setEditorOpen(false);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (selectedId === id) setSelectedId(null);
    await fetchArticles();
  }

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: articles.length };
    for (const a of articles) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    }
    return counts;
  }, [articles]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
        <p className="text-[13px] text-[var(--foreground-muted)]">Loading knowledge base...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h1 className="text-[18px] font-bold text-[var(--foreground)]">Knowledge Base</h1>
            <p className="text-[12px] text-[var(--foreground-muted)] mt-0.5">
              {articles.length} articles powering AI responses
            </p>
          </div>
          <button
            onClick={() => openEditor()}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "var(--accent-gradient)" }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Article
          </button>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 px-5 pb-3">
          {[
            { label: "Total Articles", value: String(articles.length), color: "var(--info)", icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" },
            { label: "Published", value: String(articles.filter((a) => a.status === "published").length), color: "var(--success)", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "Drafts", value: String(articles.filter((a) => a.status === "draft").length), color: "var(--warning)", icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" },
            { label: "Categories", value: String(Object.keys(categoryCounts).length - 1), color: "var(--accent)", icon: "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" },
          ].map((stat) => (
            <div key={stat.label} className="glass flex-1 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: `${stat.color}15`, color: stat.color }}>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                  </svg>
                </div>
                <span className="text-[10px] font-medium text-[var(--foreground-muted)]">{stat.label}</span>
              </div>
              <p className="mt-1.5 text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search + Categories */}
        <div className="px-5 pb-3 space-y-2">
          <div className="flex items-center gap-2 rounded-lg px-3 py-[7px]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
            <svg className="h-3.5 w-3.5 text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[var(--foreground-muted)] text-[var(--foreground)]"
            />
          </div>

          <div className="flex gap-0.5 overflow-x-auto rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.03)" }}>
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={clsx(
                  "flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200",
                  category === c.key
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-[var(--foreground-muted)] hover:text-white"
                )}
              >
                {c.label}
                {(categoryCounts[c.key] || 0) > 0 && (
                  <span className={clsx("text-[10px]", category === c.key ? "text-[var(--accent)]" : "opacity-50")}>
                    {categoryCounts[c.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Articles grid */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(124,92,252,0.08)", border: "1px solid rgba(124,92,252,0.12)" }}>
                <svg className="h-7 w-7" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-[var(--foreground)]">No articles yet</p>
              <p className="mt-1 text-[12px] text-[var(--foreground-muted)]">Create your first article to power AI responses</p>
              <button
                onClick={() => openEditor()}
                className="mt-4 rounded-xl px-5 py-2.5 text-[12px] font-semibold text-white"
                style={{ background: "var(--accent-gradient)" }}
              >
                Create Article
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {filtered.map((article, i) => {
                const catColor = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.general;
                const statusColor = STATUS_COLORS[article.status] || STATUS_COLORS.published;
                const preview = article.body.length > 120 ? article.body.slice(0, 120) + "..." : article.body;

                return (
                  <button
                    key={article.id}
                    onClick={() => setSelectedId(article.id === selectedId ? null : article.id)}
                    className={clsx(
                      "glass group relative rounded-xl p-4 text-left transition-all duration-200 animate-fade-in",
                      article.id === selectedId
                        ? "ring-1 ring-[var(--accent)]/30 bg-[var(--accent-muted)]"
                        : "hover:bg-white/[0.03]"
                    )}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-[13px] font-semibold text-[var(--foreground)] line-clamp-2 leading-snug">
                        {article.title}
                      </h3>
                      <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ background: statusColor.bg, color: statusColor.text }}>
                        {statusColor.label}
                      </span>
                    </div>

                    <p className="text-[11px] leading-relaxed text-[var(--foreground-muted)] line-clamp-3 mb-3">
                      {preview}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ background: catColor.bg, color: catColor.text }}>
                        {article.category}
                      </span>
                      <span className="text-[10px] text-[var(--foreground-muted)]">
                        {timeAgo(article.updatedAt)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail / reader panel */}
      {selected && (
        <div className="w-[400px] shrink-0 overflow-y-auto" style={{ background: "var(--card)", borderLeft: "1px solid var(--border)" }}>
          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ background: (CATEGORY_COLORS[selected.category] || CATEGORY_COLORS.general).bg, color: (CATEGORY_COLORS[selected.category] || CATEGORY_COLORS.general).text }}>
                    {selected.category}
                  </span>
                  <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ background: (STATUS_COLORS[selected.status] || STATUS_COLORS.published).bg, color: (STATUS_COLORS[selected.status] || STATUS_COLORS.published).text }}>
                    {(STATUS_COLORS[selected.status] || STATUS_COLORS.published).label}
                  </span>
                </div>
                <h2 className="text-[16px] font-bold text-[var(--foreground)] leading-snug">{selected.title}</h2>
                <p className="text-[11px] text-[var(--foreground-muted)] mt-1">
                  Updated {timeAgo(selected.updatedAt)}
                </p>
              </div>
              <button onClick={() => setSelectedId(null)} className="rounded-lg p-1 hover:bg-white/[0.06] transition-colors">
                <svg className="h-4 w-4 text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
              <p className="text-[13px] leading-relaxed text-[var(--foreground)] opacity-85 whitespace-pre-wrap">
                {selected.body}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => openEditor(selected)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "var(--accent-gradient)" }}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => handleDelete(selected.id)}
                className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[12px] font-medium transition-all hover:bg-[var(--danger)]/10"
                style={{ color: "var(--danger)", border: "1px solid var(--border)" }}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-2xl rounded-xl p-6 shadow-2xl" style={{ background: "var(--card-elevated)", border: "1px solid var(--border-strong)" }}>
            <h2 className="text-[16px] font-bold text-[var(--foreground)] mb-4">
              {editId ? "Edit Article" : "New Article"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Article title..."
                  className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none text-[var(--foreground)]"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none text-[var(--foreground)]"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}
                  >
                    {CATEGORIES.filter((c) => c.key !== "all").map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none text-[var(--foreground)]"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-1">Content</label>
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  placeholder="Write your article content..."
                  rows={12}
                  className="w-full rounded-lg px-3 py-2.5 text-[13px] leading-relaxed outline-none text-[var(--foreground)]"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setEditorOpen(false)}
                className="flex-1 rounded-xl py-2.5 text-[12px] font-medium text-[var(--foreground-muted)] transition-all hover:bg-white/[0.06]"
                style={{ border: "1px solid var(--border)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editTitle.trim() || !editBody.trim()}
                className="flex-1 rounded-xl py-2.5 text-[12px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "var(--accent-gradient)" }}
              >
                {saving ? "Saving..." : editId ? "Update Article" : "Publish Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
