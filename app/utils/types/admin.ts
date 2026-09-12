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

export interface AdminNewsletter {
  tiles: AdminKpi[];
  /** Newest first, from data/newsletter-log.json. */
  sendLog: {
    no: number;
    subject: string;
    sent: string;
    type: string;
    mainFeature: string;
  }[];
  /** Null when Buttondown is not configured. */
  subscribers: { confirmed: number; pending: number } | null;
  /** True when open/click rates could not be read from Buttondown. */
  metricsUnavailable: boolean;
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
