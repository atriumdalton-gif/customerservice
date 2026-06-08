import clsx from "clsx";
import type { EnrichedEmail } from "@/types/email";

const SENTIMENT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  positive: { label: "Happy", color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  neutral: { label: "Neutral", color: "#8b8b9e", bg: "rgba(139,139,158,0.12)" },
  negative: { label: "Unhappy", color: "#ffb347", bg: "rgba(255,179,71,0.12)" },
  frustrated: { label: "Frustrated", color: "#ff4d6a", bg: "rgba(255,77,106,0.12)" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  urgent: { label: "Critical", color: "#ff4d6a" },
  high: { label: "High", color: "#ffb347" },
  normal: { label: "Normal", color: "#4f8fff" },
  low: { label: "Low", color: "#5a5a72" },
};

function RingGauge({ value, color, size = 44 }: { value: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

export default function CopilotPanel({ email }: { email: EnrichedEmail }) {
  const { aiInsight, customerProfile, sentiment, priority, tags } = email;
  const sentimentInfo = SENTIMENT_CONFIG[sentiment] || SENTIMENT_CONFIG.neutral;
  const priorityInfo = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.normal;

  return (
    <div
      className="flex shrink-0 flex-col"
      style={{
        width: "var(--copilot-width)",
        background: "var(--card)",
        borderLeft: "1px solid var(--border)",
      }}
    >
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* AI Summary Section */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-2 mb-2.5">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-md"
              style={{ background: "var(--accent-gradient)" }}
            >
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <h3 className="text-[13px] font-bold text-[var(--foreground)]">AI Summary</h3>
          </div>
          <p className="text-[12px] leading-relaxed text-[var(--foreground)] opacity-70">
            {aiInsight.summary}
          </p>
        </section>

        {/* Metrics row: Confidence + Sentiment + Priority */}
        <section className="animate-fade-in" style={{ animationDelay: "50ms" }}>
          <div className="grid grid-cols-3 gap-2">
            {/* Confidence */}
            <div className="glass rounded-xl p-3 flex flex-col items-center">
              <div className="relative">
                <RingGauge value={aiInsight.confidence} color="#7c5cfc" />
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[var(--accent)]">
                  {aiInsight.confidence}
                </span>
              </div>
              <span className="mt-1.5 text-[10px] font-medium text-[var(--foreground-muted)]">Confidence</span>
            </div>

            {/* Sentiment */}
            <div className="glass rounded-xl p-3 flex flex-col items-center">
              <div
                className="flex h-[44px] w-[44px] items-center justify-center rounded-full"
                style={{ background: sentimentInfo.bg }}
              >
                <div className="h-3 w-3 rounded-full" style={{ background: sentimentInfo.color }} />
              </div>
              <span className="mt-1.5 text-[10px] font-bold" style={{ color: sentimentInfo.color }}>
                {sentimentInfo.label}
              </span>
            </div>

            {/* Priority */}
            <div className="glass rounded-xl p-3 flex flex-col items-center">
              <div
                className="flex h-[44px] w-[44px] items-center justify-center rounded-full"
                style={{ background: `${priorityInfo.color}15` }}
              >
                <svg className="h-5 w-5" style={{ color: priorityInfo.color }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
              </div>
              <span className="mt-1.5 text-[10px] font-bold" style={{ color: priorityInfo.color }}>
                {priorityInfo.label}
              </span>
            </div>
          </div>
        </section>

        {/* Suggested Action */}
        <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-2">
            Suggested Action
          </h3>
          <div
            className="rounded-xl p-3"
            style={{
              background: "linear-gradient(135deg, rgba(79,143,255,0.08) 0%, rgba(124,92,252,0.06) 100%)",
              border: "1px solid rgba(79,143,255,0.12)",
            }}
          >
            <p className="text-[12px] font-semibold leading-relaxed" style={{ color: "var(--accent-blue)" }}>
              {aiInsight.suggestedAction}
            </p>
          </div>
          <div className="mt-2 space-y-1">
            {aiInsight.keyPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-[6px] h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--accent)" }} />
                <p className="text-[11px] leading-relaxed text-[var(--foreground-muted)]">{point}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tone */}
        <section className="animate-fade-in" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Tone</p>
              <p className="text-[13px] font-semibold capitalize text-[var(--foreground)]">
                {aiInsight.recommendedTone}
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--border)" }} />

        {/* Customer Profile */}
        <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-3">
            Customer
          </h3>

          <div className="flex items-center gap-3 mb-3">
            <div
              className={clsx(
                "flex h-11 w-11 items-center justify-center rounded-full text-[12px] font-bold text-white shadow-lg",
                customerProfile.avatarColor
              )}
            >
              {customerProfile.avatarInitials}
            </div>
            <div>
              <p className="text-[13px] font-bold text-[var(--foreground)]">
                {customerProfile.name}
              </p>
              <p className="text-[11px] text-[var(--foreground-muted)]">{customerProfile.email}</p>
            </div>
          </div>

          <div className="glass rounded-xl p-3 space-y-2">
            {[
              { label: "Total Tickets", value: String(customerProfile.ticketCount), highlight: true },
              { label: "First Seen", value: new Date(customerProfile.firstSeen).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) },
              { label: "Source", value: customerProfile.source },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-[11px]">
                <span className="text-[var(--foreground-muted)]">{row.label}</span>
                <span className={clsx(
                  "font-semibold",
                  row.highlight ? "text-[var(--accent)]" : "text-[var(--foreground)]"
                )}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Tags */}
        <section className="animate-fade-in" style={{ animationDelay: "300ms" }}>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)] mb-2">
            Tags
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md px-2 py-1 text-[10px] font-semibold"
                style={{
                  background: "rgba(124, 92, 252, 0.08)",
                  color: "var(--accent)",
                  border: "1px solid rgba(124, 92, 252, 0.12)",
                }}
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
