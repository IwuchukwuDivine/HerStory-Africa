import { ofetch } from "ofetch";

// Same host and auth scheme as server/api/subscribe.post.ts. `ofetch` directly
// so the absolute URL doesn't trigger Nuxt's typed-route inference.
function bd<T = unknown>(path: string): Promise<T> {
  const { buttondownApiKey } = useRuntimeConfig();
  return ofetch<T>(`https://api.buttondown.com/v1${path}`, {
    headers: { Authorization: `Token ${buttondownApiKey}` },
  });
}

/**
 * Confirmed and pending subscriber counts, or null when Buttondown is not
 * configured or is unreachable. Callers render a dash rather than a zero:
 * "0 subscribers" and "we couldn't ask" are very different facts.
 */
export async function subscriberCounts(): Promise<{
  confirmed: number;
  pending: number;
} | null> {
  const { buttondownApiKey } = useRuntimeConfig();
  if (!buttondownApiKey) return null;

  try {
    const [regular, unactivated] = await Promise.all([
      bd<{ count: number }>("/subscribers?type=regular"),
      bd<{ count: number }>("/subscribers?type=unactivated"),
    ]);
    return {
      confirmed: Number(regular?.count ?? 0),
      pending: Number(unactivated?.count ?? 0),
    };
  } catch {
    return null;
  }
}
