export type Priority = "urgent" | "high" | "normal" | "low";
export type Sentiment = "positive" | "neutral" | "negative" | "frustrated";
export type Channel = "email" | "chat" | "phone" | "sms";

export interface Draft {
  id: string;
  emailId: string;
  originalDraft: string;
  finalSentText: string | null;
  wasEdited: boolean;
  createdAt: string;
  sentAt: string | null;
}

export interface Email {
  id: string;
  fromAddress: string;
  fromName: string | null;
  subject: string | null;
  bodyPlain: string;
  receivedAt: string;
  status: string;
  createdAt: string;
  drafts: Draft[];
  connectionId?: string | null;
  source?: string | null;
  priority?: string | null;
  sentiment?: string | null;
  tags?: string[];
  channel?: string;
}

export interface CustomerProfile {
  name: string;
  email: string;
  avatarInitials: string;
  avatarColor: string;
  ticketCount: number;
  firstSeen: string;
  source: string;
}

export interface AiInsight {
  summary: string;
  confidence: number;
  suggestedAction: string;
  keyPoints: string[];
  recommendedTone: string;
}

export interface EnrichedEmail extends Email {
  priority: Priority;
  sentiment: Sentiment;
  channel: Channel;
  slaMinutesRemaining: number;
  tags: string[];
  customerProfile: CustomerProfile;
  aiInsight: AiInsight;
}

export interface InboxStats {
  openTickets: number;
  avgResponseMinutes: number;
  autoResolvedPercent: number;
  csat: number;
  urgentCount: number;
}
