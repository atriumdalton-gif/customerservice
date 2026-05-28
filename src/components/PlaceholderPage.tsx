interface PlaceholderPageProps {
  icon: string;
  title: string;
  description: string;
}

export default function PlaceholderPage({ icon, title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-12 shadow-sm">
        <div className="mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-purple-500/8">
          <span className="text-3xl">{icon}</span>
        </div>
        <h2 className="mb-2 text-xl font-bold text-[var(--foreground)]">{title}</h2>
        <p className="mb-6 text-center text-sm leading-relaxed text-slate-500">
          {description}
        </p>
        <span className="rounded-full bg-purple-500/8 px-4 py-1.5 text-[13px] font-semibold text-purple-600 dark:text-purple-400">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
