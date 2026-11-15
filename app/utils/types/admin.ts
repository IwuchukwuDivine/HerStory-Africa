export interface ParsedSuggestion {
  name?: string;
  country?: string;
  reason?: string;
  sources?: string;
  submitterName?: string;
  submitterEmail?: string;
  raw: string;
}

export interface AdminSuggestion {
  number: number;
  title: string;
  url: string;
  createdAt: string;
  parsed: ParsedSuggestion;
}

export interface AdminAnalytics {
  totals: {
    totalUsers: number;
    screenPageViews: number;
  };
  trend: { date: string; users: number; views: number }[];
  topPages: { path: string; views: number }[];
  sources: { channel: string; sessions: number }[];
}

/** A single row in the "needs your attention" queue on the overview. */
export interface AdminQueueItem {
  title: string;
  meta: string;
  action: string;
  /** Drives the dot colour: primary | secondary | crimson. */
  tone: "primary" | "secondary" | "crimson";
  to: string;
}

export interface AdminKpi {
  label: string;
  value: string;
  delta: string;
  note: string;
  /** Whether the delta reads as good news (green) or is merely neutral. */
  up: boolean;
}

export interface AdminOverview {
  kpis: AdminKpi[];
  queue: AdminQueueItem[];
  /** Profiles added per month, last 12 months, oldest first. */
  growth: { month: string; label: string; count: number }[];
  topPages: { path: string; views: number }[];
  /** Sidebar badge counts. Null where the source is unavailable. */
  badges: {
    suggestions: number | null;
    health: number | null;
    opportunities: number | null;
  };
  /** Sources that failed so the UI can say so instead of showing a zero. */
  unavailable: string[];
}

export type AdminHealthFlag = "ok" | "warn" | "bad";

export interface AdminHealthRow {
  slug: string;
  name: string;
  region: string;
  portrait: AdminHealthFlag;
  sources: AdminHealthFlag;
  sourceLabel: string;
  bio: AdminHealthFlag;
  bioLabel: string;
  wordCount: number;
}

export interface AdminHealth {
  totals: {
    needingWork: number;
    noPortrait: number;
    singleSource: number;
    shortBio: number;
    profiles: number;
  };
  rows: AdminHealthRow[];
}

/**
 * Where an edition stands. "local" means it is built and deployed but Resend
 * has no broadcast for it yet; the rest are Resend's broadcast statuses.
 */
export type AdminEditionStatus =
  | "local"
  | "draft"
  | "scheduled"
  | "queued"
  | "sent"
  | "canceled";

export interface AdminEdition {
  slug: string;
  number: number;
  subject: string;
  preview: string;
  layout: string;
  register: string;
  /** Edition date, YYYY-MM-DD. */
  date: string;
  /** ISO time it will be scheduled for on approval. */
  sendAt: string;
  status: AdminEditionStatus;
  broadcastId: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  /** The copy in Resend differs from the build. Null when there is nothing to compare. */
  outOfDate: boolean | null;
}

export interface AdminNewsletter {
  tiles: AdminKpi[];
  /** Newest first. */
  editions: AdminEdition[];
  /** Contacts in the General segment; null when Resend could not be asked. */
  subscribers: { subscribed: number; unsubscribed: number } | null;
  /** Where "Send test to me" goes; null when NUXT_NEWSLETTER_TEST_ADDRESS is unset. */
  testAddress: string | null;
  /** Resend was unreachable, so statuses are unknown. */
  resendError: string | null;
}

export type AdminOpportunityStatus =
  | "Open"
  | "Closing"
  | "Needs review"
  | "Expired";

export interface AdminOpportunity {
  slug: string;
  title: string;
  org: string;
  category: string;
  deadline: string | null;
  deadlineLabel: string;
  status: AdminOpportunityStatus;
}

export interface AdminOpportunities {
  rows: AdminOpportunity[];
  counts: { all: number; closing: number; needsReview: number; expired: number };
}

export interface AdminAiStatus {
  /** ISO date of the last generate-ai-content.mjs run, or null. */
  lastRun: string | null;
  entries: number;
  /** Always empty today: there is no approval queue. */
  drafts: never[];
}
