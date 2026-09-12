import type { Ref } from "vue";
import { useAppStore } from "~/store/app";

/** Optional metadata that lets the tracker remember an unfinished read ("Continue reading"). */
export interface ReadTrackerMeta {
  name: string;
  image: string;
  country?: string;
  born?: number | null;
  died?: number | null;
  minutes: number;
}

const SCROLL_THROTTLE_MS = 500;

/**
 * Marks content as read when a sentinel element scrolls into view.
 * Place a <div ref="readSentinel" /> near the bottom of the content area.
 *
 * With `meta`, an unread piece is also stored as `lastOpened` in the app store
 * while it is being read (scroll fraction + current h2), and cleared once the
 * sentinel fires. `useState('reading-finished')` flips to true at that moment
 * so the newsletter prompt can wait for the end of the body.
 */
export default function useReadTracker(
  type: "article" | "woman",
  slug: string,
  sentinel: Ref<HTMLElement | null>,
  meta?: ReadTrackerMeta,
) {
  const store = useAppStore();
  const readingFinished = useState<boolean>("reading-finished", () => false);

  let scrollTimer: ReturnType<typeof setTimeout> | null = null;
  let lastScrollAt = 0;

  function isTrackingThis() {
    const current = store.lastOpened;
    return !!current && current.type === type && current.slug === slug;
  }

  function currentSection(): string {
    const middle = window.innerHeight / 2;
    let section = "";
    for (const h2 of document.querySelectorAll<HTMLElement>(".prose h2")) {
      if (h2.getBoundingClientRect().top <= middle) {
        section = h2.textContent?.trim() ?? "";
      } else {
        break;
      }
    }
    return section;
  }

  function updatePosition() {
    if (!isTrackingThis() || !store.lastOpened) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const fraction = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    store.setLastOpened({
      ...store.lastOpened,
      fraction,
      section: currentSection(),
      at: Date.now(),
    });
  }

  function onScroll() {
    const now = Date.now();
    const wait = SCROLL_THROTTLE_MS - (now - lastScrollAt);
    if (wait <= 0) {
      lastScrollAt = now;
      updatePosition();
      return;
    }
    if (scrollTimer) return;
    scrollTimer = setTimeout(() => {
      scrollTimer = null;
      lastScrollAt = Date.now();
      updatePosition();
    }, wait);
  }

  function stopScrollTracking() {
    window.removeEventListener("scroll", onScroll);
    if (scrollTimer) {
      clearTimeout(scrollTimer);
      scrollTimer = null;
    }
  }

  function finish() {
    store.markAsRead(type, slug);
    if (isTrackingThis()) store.clearLastOpened();
    stopScrollTracking();
    readingFinished.value = true;
  }

  function observeElement(el: HTMLElement) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          finish();
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    onBeforeUnmount(() => observer.disconnect());
  }

  onMounted(() => {
    readingFinished.value = false;
    if (store.isRead(type, slug)) return;

    if (meta) {
      store.setLastOpened({
        type,
        slug,
        name: meta.name,
        image: meta.image,
        country: meta.country ?? "",
        born: meta.born ?? null,
        died: meta.died ?? null,
        minutes: meta.minutes,
        section: "",
        fraction: 0,
        at: Date.now(),
      });
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    if (sentinel.value) {
      observeElement(sentinel.value);
      return;
    }

    const unwatch = watch(sentinel, (el) => {
      if (!el) return;
      observeElement(el);
      unwatch();
    });
  });

  onBeforeUnmount(stopScrollTracking);
}
