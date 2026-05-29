import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.article.deleteMany();

  const articles = [
    {
      title: "Getting Started with Doorknockr",
      body: `Welcome to Doorknockr! This guide will walk you through setting up your account and getting your team started with AI-powered door-to-door sales training.

1. Create Your Account
Sign up at doorknockr.com and verify your email. Choose the plan that fits your team size.

2. Set Up Your Team
Navigate to Settings > Team and invite your reps via email. Each rep will receive a personalized onboarding link.

3. Customize Your Scripts
Go to Training > Scripts and create pitch scripts tailored to your product. Our AI will help optimize them based on industry best practices.

4. Launch Training
Assign modules to your reps and track their progress from the Manager Dashboard. Most reps complete core training in 2-3 weeks.

5. Monitor Performance
Use Analytics to track close rates, practice scores, and team rankings in real-time.`,
      category: "getting-started",
      status: "published",
    },
    {
      title: "How Billing Works",
      body: `Doorknockr offers simple, transparent pricing with no hidden fees.

Plans
- Free: 1 user, basic training modules
- Starter ($19/mo): Up to 5 users, all training content
- Pro ($49/mo): Up to 20 users, analytics, custom scripts
- Enterprise ($149/mo): Unlimited users, priority support, API access

Billing Cycle
All plans are billed monthly. You can upgrade or downgrade at any time — changes take effect at your next billing cycle.

Payment Methods
We accept all major credit cards, ACH bank transfers (Enterprise only), and invoicing for annual plans.

Refund Policy
If you're not satisfied, contact support within 30 days for a full refund. No questions asked.

Team Discounts
Teams of 10+ get 15% off. Teams of 25+ get 25% off. Contact sales for custom pricing on larger deployments.`,
      category: "billing",
      status: "published",
    },
    {
      title: "Practice Simulator Troubleshooting",
      body: `If you're experiencing issues with the Practice Simulator, try these steps:

Blank Screen
1. Open an incognito/private browser window
2. Log in and try the simulator
3. If it works, a browser extension is likely interfering
4. Whitelist app.doorknockr.com in your ad blocker

Audio Not Working
- Check that your browser has microphone permissions enabled
- Ensure your system microphone is not muted
- Try a different browser (Chrome recommended)

Slow Performance
- Close other tabs and applications
- Ensure you have a stable internet connection (5+ Mbps recommended)
- Clear your browser cache

Scoring Not Updating
- Wait 30 seconds after completing a session — scores may take a moment to sync
- If scores still don't appear, log out and back in
- Contact support if the issue persists after 24 hours

Still need help? Email support@doorknockr.com with your browser version and a screenshot.`,
      category: "troubleshooting",
      status: "published",
    },
    {
      title: "Team Leaderboard & Gamification",
      body: `The Team Leaderboard helps drive healthy competition and motivation among your reps.

How It Works
Reps earn points for:
- Completing training modules (10-50 points each)
- Practice simulator sessions (5-25 points based on score)
- Streak bonuses (consecutive daily practice)
- Peer coaching (helping other reps)

Leaderboard Tiers
- Bronze: 0-500 points
- Silver: 500-1,500 points
- Gold: 1,500-5,000 points
- Platinum: 5,000+ points

Manager Controls
Managers can:
- Reset leaderboards monthly/quarterly
- Set custom point values for different activities
- Create team-vs-team competitions
- Award bonus points for real-world performance

Notifications
Enable leaderboard notifications in Settings to get alerts when reps reach new tiers or top the rankings.`,
      category: "features",
      status: "published",
    },
    {
      title: "CRM Integration Guide",
      body: `Doorknockr integrates with major CRM platforms to sync training data with your sales pipeline.

Supported Platforms
- Salesforce
- HubSpot
- Zoho CRM
- Pipedrive
- Custom via API

Setup Instructions
1. Go to Settings > Integrations
2. Select your CRM platform
3. Authenticate with your CRM admin credentials
4. Map Doorknockr fields to your CRM fields
5. Enable sync and choose frequency (real-time or hourly)

What Syncs
- Rep performance scores → CRM contact records
- Training completion → CRM activity logs
- Practice session data → Custom fields
- Team rankings → Dashboard widgets

API Access
Enterprise plans include full API access. See our API documentation at docs.doorknockr.com/api for custom integrations.

Webhooks
Set up webhooks to trigger CRM workflows when reps complete training milestones.`,
      category: "integrations",
      status: "published",
    },
    {
      title: "Custom Script Builder",
      body: `Create tailored pitch scripts that your reps can practice and perfect in the simulator.

Creating a Script
1. Go to Training > Script Builder
2. Click "New Script"
3. Choose a template or start from scratch
4. Add sections: Opening, Discovery, Pitch, Objection Handling, Close

AI Optimization
Our AI analyzes your scripts against industry benchmarks and suggests improvements for:
- Opening hook effectiveness
- Question quality in discovery phase
- Value proposition clarity
- Objection response strength
- Closing technique variety

Script Versions
Keep multiple versions of each script and A/B test them with different rep groups to see which performs better in the field.

Sharing Scripts
- Assign scripts to individual reps or entire teams
- Lock scripts to prevent unauthorized edits
- Set scripts as "required" for new hire onboarding`,
      category: "features",
      status: "published",
    },
    {
      title: "Account Security Best Practices",
      body: `Keep your Doorknockr account secure with these recommendations.

Password Requirements
- Minimum 12 characters
- Include uppercase, lowercase, numbers, and symbols
- Never reuse passwords from other services

Two-Factor Authentication
We strongly recommend enabling 2FA:
1. Go to Settings > Security
2. Click "Enable 2FA"
3. Scan the QR code with your authenticator app
4. Save your backup codes in a secure location

Team Access Controls
- Use role-based permissions (Admin, Manager, Rep)
- Review team member access quarterly
- Remove departed employees immediately
- Use SSO for Enterprise accounts

Data Protection
- All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- SOC 2 Type II certified
- GDPR compliant
- Regular third-party security audits`,
      category: "general",
      status: "published",
    },
    {
      title: "Spanish Language Support (Coming Soon)",
      body: `We're actively developing Spanish language support for Doorknockr. Here's what's planned:

Timeline: Q3 2026

What's Coming
- All core training modules translated to Spanish
- Bilingual practice simulator
- Spanish pitch script templates
- Localized UI and notifications

Current Workaround
While full Spanish support is in development, you can:
1. Use the Custom Script Builder to create Spanish-language scripts
2. Reps can practice these scripts in the simulator
3. Managers can create Spanish-language training paths

Want Early Access?
Contact support@doorknockr.com to join the Spanish beta program. We're looking for teams to help us test and refine the translations.`,
      category: "features",
      status: "draft",
    },
  ];

  for (const article of articles) {
    await prisma.article.create({ data: article });
  }

  const count = await prisma.article.count();
  console.log(`Seeded ${count} articles`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
