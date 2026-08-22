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
