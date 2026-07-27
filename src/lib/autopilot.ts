/**
 * Guarded autonomous-support guardrails.
 *
 * AUTOPILOT_ENABLED is the KILL SWITCH. It is false unless the env var is
 * explicitly set to the string "true". With no env vars set, autopilot is off
 * and nothing is ever auto-sent.
 */
export const AUTOPILOT_ENABLED = process.env.AUTOPILOT_ENABLED === "true";

export const CONFIDENCE_THRESHOLD = Number(
  process.env.AUTOPILOT_MIN_CONFIDENCE || 90
);

/** Tags that ALWAYS force escalation to a human, no matter how confident. */
export const SENSITIVE_TAGS = [
  "billing",
  "refund",
  "cancel",
  "cancellation",
  "chargeback",
  "legal",
  "dispute",
] as const;

const SAFE_SENTIMENTS = new Set(["positive", "neutral"]);
const SAFE_PRIORITIES = new Set(["normal", "low"]);

export interface AutopilotEmail {
  sentiment: string | null;
  priority: string | null;
  tags: string[];
}

export interface SafetyResult {
  safe: boolean;
  reason: string;
}

/**
 * Pure, testable safety check. A reply is SAFE to auto-send only if ALL hold:
 *  - confidence >= CONFIDENCE_THRESHOLD
 *  - sentiment is positive or neutral
 *  - priority is normal or low
 *  - none of the email's tags are sensitive
 */
export function isSafeToAutoSend(
  email: AutopilotEmail,
  confidence: number
): SafetyResult {
  if (confidence < CONFIDENCE_THRESHOLD) {
    return { safe: false, reason: `low confidence ${confidence}` };
  }

  const sentiment = email.sentiment ?? "neutral";
  if (!SAFE_SENTIMENTS.has(sentiment)) {
    return { safe: false, reason: `${sentiment} sentiment` };
  }

  const priority = email.priority ?? "normal";
  if (!SAFE_PRIORITIES.has(priority)) {
    return { safe: false, reason: `${priority} priority` };
  }

  const sensitiveHit = email.tags.find((tag) =>
    (SENSITIVE_TAGS as readonly string[]).includes(tag)
  );
  if (sensitiveHit) {
    return { safe: false, reason: `${sensitiveHit} topic` };
  }

  return { safe: true, reason: "meets all auto-send criteria" };
}
