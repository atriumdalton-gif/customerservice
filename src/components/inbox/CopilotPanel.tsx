import clsx from "clsx";
import type { EnrichedEmail } from "@/types/email";

const SENTIMENT_STYLES: Record<string, { label: string; color: string }> = {
  positive: { label: "Positive", color: "text-emerald-600" },
  neutral: { label: "Neutral", color: "text-slate-500" },
  negative: { label: "Negative", color: "text-amber-600" },
  frustrated: { label: "Frustrated", color: "text-red-500" },
};

export default function CopilotPanel({ email }: { email: EnrichedEmail }) {
  const { aiInsight, customerProfile, sentiment, tags } = email;
  const sentimentInfo = SENTIMENT_STYLES[sentiment] || SENTIMENT_STYLES.neutral;

  return (
    <div className="flex w-[300px] shrink-0 flex-col border-l border-[var(--border)] bg-[var(--card)]">
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {/* AI Summary */}
        <section>
          <div className="mb-2 flex items-center gap-1.5">
            <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            <h3 className="text-[13px] font-semibold text-[var(--foreground)]">AI Summary</h3>
          </div>
          <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
            {aiInsight.summary}
          </p>
          <div className="mt-2">
            <p className="text-[11px] font-medium text-slate-400">
              Confidence: {aiInsight.confidence}%
            </p>
            <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-white/8">
              <div
                className="h-1.5 rounded-full bg-purple-500 transition-all"
                style={{ width: `${aiInsight.confidence}%` }}
              />
            </div>
          </div>
        </section>

        {/* Suggested Action */}
        <section>
          <div className="mb-2 flex items-center gap-1.5">
            <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
            <h3 className="text-[13px] font-semibold text-[var(--foreground)]">Suggested Action</h3>
          </div>
          <div className="rounded-[10px] bg-blue-500/6 p-3">
            <p className="text-[13px] font-medium leading-relaxed text-blue-700 dark:text-blue-400">
              {aiInsight.suggestedAction}
            </p>
          </div>
          <div className="mt-2 space-y-1.5">
            {aiInsight.keyPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <p className="text-xs leading-relaxed text-slate-500">{point}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sentiment + Tone */}
        <section className="flex gap-4">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Sentiment</p>
            <p className={clsx("text-sm font-semibold capitalize", sentimentInfo.color)}>
              {sentimentInfo.label}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Recommended Tone</p>
            <p className="text-sm font-semibold capitalize text-slate-700 dark:text-slate-300">
              {aiInsight.recommendedTone}
            </p>
          </div>
        </section>

        {/* Customer Profile */}
        <section>
          <div className="mb-2 flex items-center gap-1.5">
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <h3 className="text-[13px] font-semibold text-[var(--foreground)]">Customer</h3>
          </div>

          <div className="flex items-center gap-2.5">
            <div
              className={clsx(
                "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white",
                customerProfile.avatarColor
              )}
            >
              {customerProfile.avatarInitials}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[var(--foreground)]">
                {customerProfile.name}
              </p>
              <p className="text-xs text-slate-400">{customerProfile.email}</p>
            </div>
          </div>

          <div className="mt-2 space-y-1.5 rounded-[10px] bg-slate-50 p-3 dark:bg-white/5">
            {[
              ["Company", customerProfile.company],
              ["Plan", customerProfile.plan],
              ["LTV", customerProfile.lifetimeValue],
              ["Tickets", String(customerProfile.ticketCount)],
              ["Last Contact", `${customerProfile.lastContactDays}d ago`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-slate-400">{label}</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Orders */}
        <section>
          <div className="mb-2 flex items-center gap-1.5">
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <h3 className="text-[13px] font-semibold text-[var(--foreground)]">Recent Orders</h3>
          </div>
          {[
            { label: "Pro Plan Renewal", value: "$299" },
            { label: "Add-on: Analytics", value: "$49" },
          ].map((order) => (
            <div
              key={order.label}
              className="flex justify-between border-b border-[var(--border)]/50 py-2 text-xs"
            >
              <span className="text-slate-600 dark:text-slate-400">{order.label}</span>
              <span className="font-semibold text-[var(--foreground)]">{order.value}</span>
            </div>
          ))}
        </section>

        {/* Tags */}
        <section>
          <div className="mb-2 flex items-center gap-1.5">
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
            <h3 className="text-[13px] font-semibold text-[var(--foreground)]">Tags</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-white/8 dark:text-slate-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
