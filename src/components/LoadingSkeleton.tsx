"use client";

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-3 w-48 rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="h-5 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="mt-3 h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="mt-2 space-y-1.5">
        <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-3 w-2/3 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

export function EmailDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="mt-2 h-4 w-60 rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-3 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

export function InboxSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
