"use client";

export default function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="text-6xl">&#127881;</div>
      <h3 className="mt-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        All caught up!
      </h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {message || "No emails to review right now."}
      </p>
    </div>
  );
}
