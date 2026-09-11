import { useAppStore } from "~/store/app";

/**
 * "Continue reading" data: the last unfinished profile or article, and the
 * timestamp of the visitor's previous visit (0 on a first visit).
 * `previous-visit-at` is filled once per session by the default layout.
 */
export default function useReadingSession() {
  const store = useAppStore();
  const { lastOpened } = storeToRefs(store);
  const previousVisitAt = useState<number>("previous-visit-at", () => 0);
  return { lastOpened, previousVisitAt };
}
