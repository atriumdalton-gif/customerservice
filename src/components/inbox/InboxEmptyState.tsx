const EMPTY_STATES: Record<string, { title: string; desc: string; cta: string }> = {
  pending: {
    title: "No pending tickets",
    desc: "All caught up! New tickets will appear here.",
    cta: "Create Test Ticket",
  },
  sent: {
    title: "No sent replies",
    desc: "Approved drafts and sent replies will show here.",
    cta: "Connect Inbox",
  },
  all: {
    title: "No tickets yet",
    desc: "Seed some test data or connect an email inbox to get started.",
    cta: "Connect Inbox",
  },
  urgent: {
    title: "No urgent tickets",
    desc: "Great news — nothing needs immediate attention.",
    cta: "View All Tickets",
  },
  "auto-resolved": {
    title: "No auto-resolved tickets",
    desc: "AI-resolved tickets will appear here once automations are active.",
    cta: "Set Up Automations",
  },
  "needs-review": {
    title: "Nothing to review",
    desc: "Tickets flagged for human review will appear here.",
    cta: "View All Tickets",
  },
};

export default function InboxEmptyState({ tab }: { tab: string }) {
  const state = EMPTY_STATES[tab] || EMPTY_STATES.all;

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-white/8">
        <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859" />
        </svg>
      </div>
      <p className="text-base font-semibold text-[var(--foreground)]">{state.title}</p>
      <p className="mt-1 text-center text-sm text-slate-500">{state.desc}</p>
      <button className="mt-5 rounded-[10px] bg-[var(--accent)] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:opacity-90">
        {state.cta}
      </button>
    </div>
  );
}
