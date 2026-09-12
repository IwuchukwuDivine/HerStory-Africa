import type { AdminOverview } from "~/utils/types/admin";

interface AdminHeaderState {
  title: string;
  subtitle: string;
  /** Whether this view has rows the header's search box can filter. */
  searchable: boolean;
  searchPlaceholder: string;
}

/**
 * The shell header lives in the admin layout but its copy belongs to the view,
 * so pages push their title and subtitle here as their data resolves.
 */
export function useAdminHeader() {
  return useState<AdminHeaderState>("admin:header", () => ({
    title: "",
    subtitle: "",
    searchable: false,
    searchPlaceholder: "Search…",
  }));
}

/** The header's filter box. Views that opt into `searchable` read this. */
export function useAdminSearch() {
  return useState<string>("admin:search", () => "");
}

/**
 * The overview payload, shared by the sidebar badges and the dashboard.
 *
 * Deliberately not `useFetch`: two `useFetch` call sites sharing one key
 * re-trigger each other on every resolution, which turned a single request
 * into a loop of eleven. `useAdminData` has one owner and one in-flight
 * request, and it survives navigation between views.
 */
export function useAdminOverview() {
  return useAdminData<AdminOverview>("overview", "/api/admin/overview");
}
