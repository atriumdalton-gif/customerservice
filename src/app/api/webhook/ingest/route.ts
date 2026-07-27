import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { classify } from "@/lib/classify";
import { generateDraft } from "@/lib/ai";
import { sendSupportReply } from "@/lib/sendEmail";
import { AUTOPILOT_ENABLED, isSafeToAutoSend } from "@/lib/autopilot";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const apiKey = authHeader.slice(7);

  const connection = await prisma.connection.findUnique({
    where: { apiKey },
  });

  if (!connection) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  if (!connection.isActive) {
    return NextResponse.json({ error: "Connection is inactive" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { fromAddress, fromName, subject, bodyPlain, channel, receivedAt } = body as {
    fromAddress?: string;
    fromName?: string;
    subject?: string;
    bodyPlain?: string;
    channel?: string;
    receivedAt?: string;
  };

  if (!fromAddress || !bodyPlain) {
    return NextResponse.json(
      { error: "fromAddress and bodyPlain are required" },
      { status: 400 }
    );
  }

  const classification = classify(subject || "", bodyPlain);

  const email = await prisma.email.create({
    data: {
      fromAddress,
      fromName: fromName || null,
      subject: subject || null,
      bodyPlain,
      channel: channel || "email",
      receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
      connectionId: connection.id,
      source: connection.slug,
      priority: classification.priority,
      sentiment: classification.sentiment,
      tags: classification.tags,
    },
  });

  await prisma.connection.update({
    where: { id: connection.id },
    data: { lastEventAt: new Date() },
  });

  // Generate AI draft in background (don't block the webhook response)
  generateDraft({
    fromName: fromName as string | null,
    fromAddress: fromAddress as string,
    subject: (subject as string) || null,
    bodyPlain: bodyPlain as string,
    priority: classification.priority,
    sentiment: classification.sentiment,
    tags: classification.tags,
  })
    .then(async (result) => {
      const draft = await prisma.draft.create({
        data: {
          emailId: email.id,
          originalDraft: result.draft,
        },
      });
      console.log(`AI draft generated for email ${email.id}`);

      // Guarded auto-pilot. Wrapped so it can NEVER break intake.
      try {
        const configured = Boolean(
          process.env.RESEND_API_KEY && process.env.SUPPORT_FROM_EMAIL
        );
        const safety = isSafeToAutoSend(
          {
            sentiment: classification.sentiment,
            priority: classification.priority,
            tags: classification.tags,
          },
          result.confidence
        );

        if (AUTOPILOT_ENABLED && configured && safety.safe) {
          const send = await sendSupportReply({
            to: email.fromAddress,
            subject: email.subject,
            body: result.draft,
          });

          if (send.ok) {
            await prisma.email.update({
              where: { id: email.id },
              data: {
                status: "sent",
                tags: { set: [...classification.tags, "autopilot"] },
              },
            });
            await prisma.draft.update({
              where: { id: draft.id },
              data: {
                finalSentText: result.draft,
                wasEdited: false,
                sentAt: new Date(),
              },
            });
            console.log(
              `[autopilot] auto-sent ${email.id} to ${email.fromAddress} conf=${result.confidence}`
            );
          } else {
            // Delivery failed — leave for a human, tag it, do not mark sent.
            await prisma.email.update({
              where: { id: email.id },
              data: { tags: { set: [...classification.tags, "send-failed"] } },
            });
            console.error(
              `[autopilot] send failed for ${email.id}: ${send.reason || send.error}`
            );
          }
        } else {
          // Kill switch off, not configured, or not safe → human handles it.
          const reason = !AUTOPILOT_ENABLED
            ? "autopilot disabled"
            : !configured
              ? "delivery not configured"
              : safety.reason;
          await prisma.email.update({
            where: { id: email.id },
            data: { tags: { set: [...classification.tags, "escalated"] } },
          });
          console.log(`[autopilot] escalated ${email.id}: ${reason}`);
        }
      } catch (err) {
        console.error(`[autopilot] error for email ${email.id}:`, err);
      }
    })
    .catch((err) => {
      console.error(`AI draft generation failed for email ${email.id}:`, err);
    });

  return NextResponse.json(
    {
      id: email.id,
      priority: classification.priority,
      sentiment: classification.sentiment,
      tags: classification.tags,
    },
    { status: 201 }
  );
}
