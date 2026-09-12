/**
 * A cached, session-scoped resource for the admin console.
 *
 * `useFetch` refetches on every component mount, so moving between views and
 * coming back flashed a loading state for data fetched seconds earlier. This
 * keeps the payload in `useState`, which survives client-side navigation, and
 * revalidates in the background once it goes stale.
 *
 * Two rules make the flashing impossible to reintroduce:
 *   - `loading` is only true when there is nothing to render yet, so a
 *     background revalidation never blanks a view that already has data.
 *   - a failed revalidation keeps the stale payload on screen; `failed` is
 *     likewise only true when there is nothing to fall back to.
 */

/** How long a payload is served without going back to the server. */
const TTL_MS = 60_000;

// Nitro's typed-route inference recurses over every route for a non-literal
// URL and blows the type checker's stack, so the plain signature is used here
// and the caller's T is the contract.
const fetchJson = $fetch as unknown as (url: string) => Promise<unknown>;

export function useAdminData<T>(key: string, url: string) {
  const data = useState<T | null>(`admin:${key}`, () => null);
  const status = useState<"idle" | "pending" | "success" | "error">(
    `admin:${key}:status`,
    () => "idle",
  );
  const errorCode = useState<number | null>(`admin:${key}:code`, () => null);
  const fetchedAt = useState<number>(`admin:${key}:at`, () => 0);

  async function load(force = false) {
    if (status.value === "pending") return;
    if (!force && data.value && Date.now() - fetchedAt.value < TTL_MS) return;

    status.value = "pending";
    try {
      data.value = (await fetchJson(url)) as T;
      fetchedAt.value = Date.now();
      errorCode.value = null;
      status.value = "success";
    } catch (e) {
      errorCode.value = (e as { statusCode?: number })?.statusCode ?? null;
      status.value = "error";
    }
  }

  /** Ignores the TTL. Wired to the visible refresh controls. */
  const refresh = () => load(true);

  const loading = computed(() => status.value === "pending" && !data.value);
  const failed = computed(() => status.value === "error" && !data.value);

  return { data, status, errorCode, loading, failed, load, refresh };
}
