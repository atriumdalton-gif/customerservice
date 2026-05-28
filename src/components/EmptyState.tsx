"use client";

export default function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 dark:bg-emerald-500/10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10 text-emerald-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-[var(--foreground)]">
        All caught up!
      </h3>
      <p className="mt-1.5 max-w-[240px] text-[13px] leading-relaxed text-zinc-400 dark:text-zinc-500">
        {message || "No emails to review right now. Check back later."}
      </p>
    </div>
  );
}
