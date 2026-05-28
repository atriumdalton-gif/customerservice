import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.draft.deleteMany();
  await prisma.email.deleteMany();

  const now = new Date();
  const minutesAgo = (m: number) => new Date(now.getTime() - m * 60 * 1000);
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000);
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400 * 1000);

  const emails = [
    {
      fromAddress: "sarah.chen@gmail.com",
      fromName: "Sarah Chen",
      subject: "Question about door-to-door sales training",
      bodyPlain:
        "Hi there,\n\nI'm interested in signing up for Doorknockr but I have a few questions first. How long is the training program? Is it self-paced or are there scheduled sessions? I've been in door-to-door sales for about 2 years and want to level up my skills.\n\nAlso, do you offer any team discounts? I have a crew of 5 reps that could benefit from this.\n\nThanks,\nSarah",
      receivedAt: minutesAgo(12),
      status: "pending",
      drafts: [
        {
          originalDraft:
            "Hi Sarah,\n\nGreat to hear from you! Our training program is fully self-paced, so you can work through the modules on your own schedule. Most reps complete the core curriculum in about 2-3 weeks.\n\nWe absolutely offer team pricing! For a crew of 5, you'd get 20% off per seat. I'd love to set up a quick call to walk you through the team onboarding process.\n\nWould tomorrow or Thursday work for a 15-minute chat?\n\nBest,\nDoorknockr Team",
        },
      ],
    },
    {
      fromAddress: "mike.johnson@pestshield.com",
      fromName: "Mike Johnson",
      subject: "Billing issue - charged twice this month",
      bodyPlain:
        "Hey,\n\nI just checked my credit card statement and I was charged $49.99 twice for my Doorknockr subscription this month. Can you please refund the duplicate charge ASAP? My account email is mike.johnson@pestshield.com.\n\nThis is the second time this has happened. Pretty frustrating.\n\nMike",
      receivedAt: minutesAgo(45),
      status: "pending",
      drafts: [
        {
          originalDraft:
            "Hi Mike,\n\nI sincerely apologize for the duplicate charge — that's not the experience we want for you. I've flagged your account for an immediate refund of $49.99, which should appear within 3-5 business days.\n\nI've also added a note to your account to prevent this from recurring. As a goodwill gesture, I've applied a 10% discount to your next billing cycle.\n\nPlease don't hesitate to reach out if you don't see the refund by next week.\n\nBest regards,\nDoorknockr Support",
        },
      ],
    },
    {
      fromAddress: "jessica.torres@sunrunhome.com",
      fromName: "Jessica Torres",
      subject: "Re: Partnership opportunity with Doorknockr",
      bodyPlain:
        "Thanks for getting back to me!\n\nYes, we'd definitely be interested in exploring a partnership. SunRun Home has about 120 field reps across Texas and Florida, and we're always looking for better training tools.\n\nCould you send over a case study or some data on how Doorknockr has improved close rates for solar companies specifically? That would help me make the case internally.\n\nBest,\nJessica Torres\nVP of Sales, SunRun Home",
      receivedAt: hoursAgo(2),
      status: "pending",
      drafts: [
        {
          originalDraft:
            "Hi Jessica,\n\nAbsolutely! I'm attaching our solar industry case study — in short, our solar clients see an average 34% improvement in close rates within the first 90 days.\n\nGiven the size of your team, I think our Enterprise plan would be the best fit. It includes custom pitch scripts tailored to your specific solar products, manager dashboards, and priority support.\n\nWould you be available for a 30-minute demo next week? I can walk your leadership team through the platform live.\n\nLooking forward to it,\nDoorknockr Partnerships",
        },
      ],
    },
    {
      fromAddress: "david.park@gmail.com",
      fromName: "David Park",
      subject: "Can't access the practice simulator",
      bodyPlain:
        "Hi support,\n\nI purchased the Pro plan yesterday but I can't seem to access the practice simulator. When I click on it, I just get a blank screen. I've tried Chrome and Safari, same issue on both.\n\nI'm on a MacBook Pro running macOS Sonoma. Screenshot attached.\n\nDavid",
      receivedAt: hoursAgo(4),
      status: "pending",
      drafts: [
        {
          originalDraft:
            "Hi David,\n\nThanks for reporting this! The blank screen issue is usually caused by a browser extension conflict. Could you try these quick steps?\n\n1. Open an incognito/private window\n2. Log in to Doorknockr\n3. Try the simulator again\n\nIf that works, the culprit is likely an ad blocker or privacy extension. You can whitelist app.doorknockr.com to fix it permanently.\n\nIf the issue persists in incognito, please let me know and I'll escalate to our engineering team right away.\n\nBest,\nDoorknockr Support",
        },
      ],
    },
    {
      fromAddress: "rachel.williams@apexroofing.com",
      fromName: "Rachel Williams",
      subject: "Loving Doorknockr - quick feature request",
      bodyPlain:
        "Hey team!\n\nJust wanted to say my reps are absolutely crushing it since we started using Doorknockr. Our close rate went from 12% to 19% in just 6 weeks!\n\nOne feature request though — it would be amazing if we could track individual rep performance over time with graphs. Right now I'm exporting data to Excel manually which is a pain.\n\nAny plans for something like that?\n\nRachel Williams\nSales Manager, Apex Roofing",
      receivedAt: daysAgo(1),
      status: "sent",
      drafts: [
        {
          originalDraft:
            "Hi Rachel,\n\nThat's incredible — a jump from 12% to 19% is exactly the kind of result we love hearing about!\n\nGreat news on the feature request: we're actually building out manager analytics dashboards right now, including per-rep performance graphs over time. It's scheduled for release in about 6 weeks.\n\nI've added you to the early access list so you'll be one of the first to try it.\n\nKeep crushing it!\nDoorknockr Team",
          finalSentText:
            "Hi Rachel,\n\nThat's incredible — a jump from 12% to 19% is exactly the kind of result we love hearing about!\n\nGreat news on the feature request: we're actually building out manager analytics dashboards right now, including per-rep performance graphs over time. It's scheduled for release in about 6 weeks.\n\nI've added you to the early access list so you'll be one of the first to try it.\n\nKeep crushing it!\nDoorknockr Team",
          wasEdited: false,
          sentAt: daysAgo(1),
        },
      ],
    },
    {
      fromAddress: "tom.bradley@gmail.com",
      fromName: "Tom Bradley",
      subject: "Cancellation request",
      bodyPlain:
        "Hi,\n\nI need to cancel my Doorknockr subscription effective immediately. I've switched to a different role and no longer do door-to-door sales.\n\nPlease confirm the cancellation and let me know if there are any remaining charges.\n\nThanks,\nTom",
      receivedAt: daysAgo(2),
      status: "sent",
      drafts: [
        {
          originalDraft:
            "Hi Tom,\n\nI'm sorry to see you go! I've processed your cancellation request effective today. You'll retain access to your account until the end of your current billing period (June 15th), and no further charges will be made.\n\nIf you ever return to field sales, we'd love to have you back. Your account and progress will be saved for 12 months.\n\nWishing you the best in your new role!\n\nBest,\nDoorknockr Support",
          finalSentText:
            "Hi Tom,\n\nI've processed your cancellation effective today. You'll have access until June 15th (end of current billing period) with no further charges.\n\nYour account and progress are saved for 12 months if you ever want to return.\n\nBest of luck in your new role!\n\nBest,\nDoorknockr Support",
          wasEdited: true,
          sentAt: daysAgo(2),
        },
      ],
    },
    {
      fromAddress: "amanda.nguyen@vistaenergy.com",
      fromName: "Amanda Nguyen",
      subject: "Referral program details?",
      bodyPlain:
        "Hi Doorknockr team,\n\nI've recommended your platform to several other sales managers and they've signed up. Do you have any kind of referral program or affiliate setup? Would love to get credit for the referrals I'm sending your way.\n\nThanks!\nAmanda",
      receivedAt: daysAgo(3),
      status: "rejected",
      drafts: [
        {
          originalDraft:
            "Hi Amanda,\n\nThank you so much for spreading the word — referrals from happy customers like you mean the world to us!\n\nWe do have a referral program! For each new customer you refer, you get a $25 credit on your account, and they get 15% off their first month. I'll send you your unique referral link shortly.\n\nKeep them coming!\n\nBest,\nDoorknockr Team",
        },
      ],
    },
    {
      fromAddress: "carlos.rivera@cleanpro.net",
      fromName: "Carlos Rivera",
      subject: "Spanish language support?",
      bodyPlain:
        "Hola,\n\nI manage a team where about half my reps are native Spanish speakers. Does Doorknockr offer any training content in Spanish? It would make a huge difference for my team's adoption.\n\nWe're currently on the Team plan with 8 seats.\n\nGracias,\nCarlos Rivera\nCleanPro Services",
      receivedAt: hoursAgo(6),
      status: "pending",
      drafts: [
        {
          originalDraft:
            "Hola Carlos,\n\nGreat question! We currently offer our core training modules in English only, but Spanish language support is on our product roadmap for Q3.\n\nIn the meantime, several of our bilingual clients have had success using the platform's customizable script feature to create Spanish-language pitch scripts for their teams.\n\nI'd be happy to hop on a call and show you how to set that up. Would that be helpful?\n\nSaludos,\nDoorknockr Support",
        },
      ],
    },
    {
      fromAddress: "jenny.wu@alarmguard.com",
      fromName: "Jenny Wu",
      subject: "Re: Onboarding new hires with Doorknockr",
      bodyPlain:
        "Perfect, thanks for the onboarding guide!\n\nOne more thing — is there a way to set up a structured learning path so new hires go through modules in a specific order? I don't want them skipping ahead to advanced techniques before mastering the basics.\n\nAlso, can I get notified when someone completes a module?\n\nJenny Wu\nTraining Director, AlarmGuard",
      receivedAt: daysAgo(4),
      status: "sent",
      drafts: [
        {
          originalDraft:
            "Hi Jenny,\n\nYes to both! You can create custom learning paths in the Manager Dashboard under 'Training Paths.' Just drag and drop modules in the order you want, and you can lock advanced modules until prerequisites are completed.\n\nFor notifications, go to Settings > Notifications and enable 'Module completion alerts.' You'll get an email each time a rep finishes a module.\n\nLet me know if you need help setting it up!\n\nBest,\nDoorknockr Support",
          finalSentText:
            "Hi Jenny,\n\nYes to both! You can create custom learning paths in the Manager Dashboard under 'Training Paths.' Just drag and drop modules in the order you want, and you can lock advanced modules until prerequisites are completed.\n\nFor notifications, go to Settings > Notifications and enable 'Module completion alerts.' You'll get an email each time a rep finishes a module.\n\nLet me know if you need help setting it up!\n\nBest,\nDoorknockr Support",
          wasEdited: false,
          sentAt: daysAgo(3),
        },
      ],
    },
    {
      fromAddress: "brett.harris@topnotchpest.com",
      fromName: "Brett Harris",
      subject: "Bug report - leaderboard not updating",
      bodyPlain:
        "Hey,\n\nThe team leaderboard hasn't updated in 3 days. My reps are getting frustrated because they can't see their rankings. We use the leaderboard as a big motivator so this is kind of a big deal for us.\n\nAccount: TopNotch Pest Control\nPlan: Enterprise\n\nCan someone look into this urgently?\n\nBrett",
      receivedAt: minutesAgo(90),
      status: "pending",
      drafts: [
        {
          originalDraft:
            "Hi Brett,\n\nThank you for flagging this — I understand how important the leaderboard is for team motivation. I've escalated this to our engineering team as a priority issue.\n\nWe've identified the root cause: a data sync delay affecting a small number of Enterprise accounts. Our team is deploying a fix now, and the leaderboard should be back to real-time updates within the next 2 hours.\n\nI'll follow up personally once it's resolved. Sorry for the inconvenience.\n\nBest,\nDoorknockr Support",
        },
      ],
    },
  ];

  for (const emailData of emails) {
    const { drafts, ...email } = emailData;
    const createdEmail = await prisma.email.create({
      data: {
        ...email,
        createdAt: email.receivedAt,
      },
    });

    for (const draft of drafts) {
      await prisma.draft.create({
        data: {
          emailId: createdEmail.id,
          ...draft,
          createdAt: email.receivedAt,
        },
      });
    }
  }

  const count = await prisma.email.count();
  console.log(`Seeded ${count} emails with drafts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
