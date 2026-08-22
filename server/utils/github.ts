import { ofetch } from "ofetch";

const REPO = "IwuchukwuDivine/HerStory-Africa";

export interface GitHubIssue {
  number: number;
  title: string;
  html_url: string;
  created_at: string;
  body: string | null;
  pull_request?: unknown;
}

// Uses `ofetch` directly (not the Nuxt `$fetch`) so the absolute GitHub URL
// doesn't trigger internal typed-route inference. Mirrors the Bearer pattern
// in server/api/suggest.post.ts.
function gh<T = unknown>(
  path: string,
  opts: { method?: "GET" | "POST" | "PATCH"; body?: Record<string, unknown> } = {},
): Promise<T> {
  const { githubToken } = useRuntimeConfig();
  return ofetch<T>(`https://api.github.com/repos/${REPO}${path}`, {
    method: opts.method,
    body: opts.body,
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json",
    },
  });
}

export function listSuggestions() {
  return gh<GitHubIssue[]>(`/issues?labels=suggestion&state=open&per_page=100`);
}

export function closeIssue(number: number) {
  return gh(`/issues/${number}`, { method: "PATCH", body: { state: "closed" } });
}

export function commentIssue(number: number, body: string) {
  return gh(`/issues/${number}/comments`, { method: "POST", body: { body } });
}
