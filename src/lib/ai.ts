import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are an AI customer support copilot for Doorknockr, a door-to-door sales platform that helps sales teams with route optimization, training, leaderboards, and performance tracking.

Your job is to draft professional, helpful, and friendly replies to customer support emails. Keep replies concise but thorough. Use the customer's name when available. Match the tone appropriately — be empathetic for frustrated customers, enthusiastic for positive ones, and professional for neutral ones.

Do NOT include a subject line. Just write the body of the reply. Sign off as "The Doorknockr Support Team".`;

export interface AiDraftResult {
  draft: string;
  summary: string;
  suggestedAction: string;
  keyPoints: string[];
  recommendedTone: string;
  confidence: number;
}

export async function generateDraft(email: {
  fromName: string | null;
  fromAddress: string;
  subject: string | null;
  bodyPlain: string;
  priority: string | null;
  sentiment: string | null;
  tags: string[];
}): Promise<AiDraftResult> {
  const userPrompt = `Generate a support reply and analysis for this email.

From: ${email.fromName || email.fromAddress}
Subject: ${email.subject || "(no subject)"}
Priority: ${email.priority || "normal"}
Sentiment: ${email.sentiment || "neutral"}
Tags: ${email.tags.length > 0 ? email.tags.join(", ") : "none"}

Email body:
${email.bodyPlain}

Respond with valid JSON only, no markdown fences:
{
  "draft": "The full reply to send to the customer",
  "summary": "One sentence summary of what the customer needs",
  "suggestedAction": "Brief recommended action (e.g. 'Send reply', 'Escalate to billing', 'Follow up in 24h')",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "recommendedTone": "empathetic | professional | enthusiastic | urgent",
  "confidence": 85
}

Set confidence between 60-98 based on how well you can address the request. Lower if ambiguous, higher if straightforward.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const parsed = JSON.parse(text);
    return {
      draft: parsed.draft || "Unable to generate draft.",
      summary: parsed.summary || "",
      suggestedAction: parsed.suggestedAction || "Review and reply",
      keyPoints: parsed.keyPoints || [],
      recommendedTone: parsed.recommendedTone || "professional",
      confidence: Math.min(98, Math.max(60, parsed.confidence || 80)),
    };
  } catch {
    // If JSON parsing fails, treat the whole response as the draft
    return {
      draft: text || "Unable to generate draft.",
      summary: "",
      suggestedAction: "Review and reply",
      keyPoints: [],
      recommendedTone: "professional",
      confidence: 70,
    };
  }
}
