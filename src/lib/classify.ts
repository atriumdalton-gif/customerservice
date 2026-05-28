export interface Classification {
  priority: "urgent" | "high" | "normal" | "low";
  sentiment: "positive" | "neutral" | "negative" | "frustrated";
  tags: string[];
}

const URGENT_WORDS = ["urgent", "asap", "critical", "emergency", "immediately"];
const HIGH_WORDS = ["bug", "charged twice", "broken", "down", "not working", "error", "crash"];

const FRUSTRATED_WORDS = ["frustrated", "angry", "furious", "unacceptable", "terrible", "worst", "ridiculous"];
const NEGATIVE_WORDS = ["problem", "can't", "cannot", "issue", "fail", "wrong", "disappointed", "unhappy"];
const POSITIVE_WORDS = ["love", "great", "awesome", "amazing", "excellent", "thank", "fantastic", "wonderful", "happy"];

const TAG_RULES: [string[], string][] = [
  [["bill", "invoice", "charge", "payment", "charged twice", "subscription"], "billing"],
  [["refund", "money back", "reimburse"], "refund"],
  [["bug", "error", "crash", "broken", "not working", "glitch"], "bug-report"],
  [["feature", "request", "suggestion", "would be nice", "wish"], "feature-request"],
  [["setup", "onboard", "getting started", "new user", "first time"], "onboarding"],
  [["cancel", "cancellation", "unsubscribe", "stop"], "cancellation"],
  [["upgrade", "plan", "tier", "pro", "enterprise"], "upgrade"],
  [["integrate", "integration", "api", "webhook", "connect"], "integration"],
  [["ship", "shipping", "delivery", "tracking"], "shipping"],
  [["account", "login", "password", "access", "locked out"], "account"],
];

function textContains(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw));
}

export function classify(subject: string, body: string): Classification {
  const text = `${subject} ${body}`.toLowerCase();

  // Priority
  let priority: Classification["priority"] = "normal";
  if (textContains(text, URGENT_WORDS)) {
    priority = "urgent";
  } else if (textContains(text, HIGH_WORDS)) {
    priority = "high";
  }

  // Sentiment
  let sentiment: Classification["sentiment"] = "neutral";
  if (textContains(text, FRUSTRATED_WORDS)) {
    sentiment = "frustrated";
  } else if (textContains(text, NEGATIVE_WORDS)) {
    sentiment = "negative";
  } else if (textContains(text, POSITIVE_WORDS)) {
    sentiment = "positive";
  }

  // Tags
  const tags: string[] = [];
  for (const [keywords, tag] of TAG_RULES) {
    if (textContains(text, keywords)) {
      tags.push(tag);
    }
  }

  return { priority, sentiment, tags };
}
