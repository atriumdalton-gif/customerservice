"use client";

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex gap-3.5">
        <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 rounded-md bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-3 w-8 rounded-md bg-zinc-100 dark:bg-zinc-800" />
          </div>
          <div className="h-3.5 w-48 rounded-md bg-zinc-100 dark:bg-zinc-800" />
          <div className="space-y-1.5">
            <div className="h-3 w-full rounded-md bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-3 w-2/3 rounded-md bg-zinc-100 dark:bg-zinc-800" />
          </div>
          <div className="h-5 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

export function EmailDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-lg animate-pulse space-y-3 p-4 pt-16">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex gap-3.5">
          <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded-md bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-3 w-48 rounded-md bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="h-4 w-24 rounded-md bg-zinc-200 dark:bg-zinc-700" />
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full rounded-md bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-3 w-full rounded-md bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-3 w-full rounded-md bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-3 w-3/4 rounded-md bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

export function InboxSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
