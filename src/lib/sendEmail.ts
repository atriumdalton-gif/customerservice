export interface SendSupportReplyParams {
  to: string;
  subject: string | null | undefined;
  body: string;
}

export interface SendSupportReplyResult {
  ok: boolean;
  id?: string;
  reason?: string;
  error?: string;
}

/**
 * Sends a support reply via the Resend REST API.
 *
 * If RESEND_API_KEY or SUPPORT_FROM_EMAIL are not configured, this returns
 * { ok: false, reason: "not_configured" } WITHOUT attempting any network call.
 * This is a safety guarantee: with no env vars set, nothing is ever sent.
 */
export async function sendSupportReply({
  to,
  subject,
  body,
}: SendSupportReplyParams): Promise<SendSupportReplyResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SUPPORT_FROM_EMAIL;

  if (!apiKey || !from) {
    return { ok: false, reason: "not_configured" };
  }

  const replySubject = `Re: ${subject || "your message"}`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: replySubject,
        text: body,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      return {
        ok: false,
        error: `Resend responded ${response.status}: ${errText}`,
      };
    }

    const data = (await response.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
