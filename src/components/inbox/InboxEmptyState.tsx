const EMPTY_STATES: Record<string, { title: string; desc: string; cta: string }> = {
  pending: {
    title: "You're all caught up",
    desc: "No conversations currently require attention. New tickets will appear here automatically.",
    cta: "Create Test Ticket",
  },
  sent: {
    title: "No sent replies yet",
    desc: "Approved drafts and sent replies will show here once you start responding.",
    cta: "View Open Tickets",
  },
  all: {
    title: "No conversations yet",
    desc: "Connect an inbox source or create a test ticket to get started with AI-assisted support.",
    cta: "Connect Inbox",
  },
  urgent: {
    title: "No urgent tickets",
    desc: "Nothing needs immediate attention right now. Your AI copilot is monitoring for escalations.",
    cta: "View All Tickets",
  },
  "auto-resolved": {
    title: "No resolved tickets",
    desc: "AI-resolved tickets will appear here once automations are active and handling conversations.",
    cta: "Set Up Automations",
  },
  "needs-review": {
    title: "Nothing to review",
    desc: "Tickets flagged for human review will appear here. The AI copilot is handling the rest.",
    cta: "View All Tickets",
  },
};

export default function InboxEmptyState({ tab }: { tab: string }) {
  const state = EMPTY_STATES[tab] || EMPTY_STATES.all;

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      {/* Illustration */}
      <div className="relative mb-6">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(124,92,252,0.12) 0%, rgba(79,143,255,0.08) 100%)",
            border: "1px solid rgba(124, 92, 252, 0.15)",
          }}
        >
          <svg className="h-9 w-9" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-40 blur-xl"
          style={{ background: "var(--accent-gradient)" }}
        />
      </div>

      <p className="text-[15px] font-bold text-[var(--foreground)]">{state.title}</p>
      <p className="mt-1.5 max-w-[240px] text-center text-[12px] leading-relaxed text-[var(--foreground-muted)]">
        {state.desc}
      </p>

      <button
        className="mt-5 rounded-xl px-5 py-2.5 text-[12px] font-semibold text-white transition-all duration-200 hover:opacity-90"
        style={{ background: "var(--accent-gradient)" }}
      >
        {state.cta}
      </button>

      {/* Onboarding checklist for 'all' tab */}
      {tab === "all" && (
        <div className="mt-6 w-full max-w-[260px] space-y-2">
          {[
            { label: "Connect your first inbox", done: false },
            { label: "Configure AI agent", done: false },
            { label: "Send a test ticket", done: false },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[11px]"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                style={{
                  border: item.done ? "none" : "1.5px solid var(--foreground-muted)",
                  background: item.done ? "var(--success)" : "transparent",
                }}
              >
                {item.done && (
                  <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
              <span className="text-[var(--foreground-muted)]">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
